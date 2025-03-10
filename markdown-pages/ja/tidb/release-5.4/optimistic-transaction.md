---
title: TiDB Optimistic Transaction Model
summary: Learn the optimistic transaction model in TiDB.
---

# TiDBオプティミスティックトランザクションモデル {#tidb-optimistic-transaction-model}

楽観的なトランザクションでは、競合する変更がトランザクションコミットの一部として検出されます。これにより、行ロックを取得するプロセスをスキップできるため、同時トランザクションが同じ行を頻繁に変更しない場合のパフォーマンスが向上します。並行トランザクションが同じ行を頻繁に変更する場合（競合）、楽観的なトランザクションは[悲観的なトランザクション](/pessimistic-transaction.md)よりもパフォーマンスが低下する可能性があります。

楽観的なトランザクションを有効にする前に、アプリケーションが`COMMIT`ステートメントがエラーを返す可能性があることを正しく処理していることを確認してください。アプリケーションがこれをどのように処理するかわからない場合は、代わりにペシミスティックトランザクションを使用することをお勧めします。

> **ノート：**
>
> v3.0.8以降、TiDBはデフォルトで[悲観的なトランザクションモード](/pessimistic-transaction.md)を使用します。ただし、v3.0.7以前からv3.0.8以降にアップグレードした場合、これは既存のクラスタには影響しません。つまり、**新しく作成されたクラスターのみがデフォルトで悲観的トランザクションモードを使用します**。

## 楽観的な取引の原則 {#principles-of-optimistic-transactions}

分散トランザクションをサポートするために、TiDBは楽観的なトランザクションで2フェーズコミット（2PC）を採用しています。手順は次のとおりです。

![2PC in TiDB](https://docs-download.pingcap.com/media/images/docs/2pc-in-tidb.png)

1.  クライアントはトランザクションを開始します。

    TiDBは、PDからタイムスタンプ（時間的に単調に増加し、グローバルに一意）を現在のトランザクションの一意のトランザクションIDとして取得します。これは`start_ts`と呼ばれます。 TiDBはマルチバージョン同時実行制御を実装しているため、 `start_ts`はこのトランザクションによって取得されるデータベーススナップショットのバージョンとしても機能します。これは、トランザクションがデータベースからデータを読み取ることができるのは`start_ts`時のみであることを意味します。

2.  クライアントは読み取り要求を発行します。

    1.  TiDBは、PDからルーティング情報（TiKVノード間でデータがどのように分散されるか）を受信します。
    2.  TiDBは、TiKVから`start_ts`バージョンのデータを受信します。

3.  クライアントは書き込み要求を発行します。

    TiDBは、書き込まれたデータが制約を満たしているかどうかをチェックします（データ型が正しいことを確認するため、NOT NULL制約が満たされていることなど）。**有効なデータは、TiDBのこのトランザクションのプライベートメモリに保存されます**。

4.  クライアントはコミット要求を発行します。

5.  TiDBは2PCを開始し、トランザクションのアトミック性を保証しながらデータをストアに保持します。

    1.  TiDBは、書き込まれるデータから主キーを選択します。
    2.  TiDBはPDからリージョン分布の情報を受け取り、それに応じてリージョンごとにすべてのキーをグループ化します。
    3.  TiDBは、関係するすべてのTiKVノードに事前書き込み要求を送信します。次に、TiKVは、競合するバージョンまたは期限切れのバージョンがあるかどうかを確認します。有効なデータはロックされています。
    4.  TiDBはプリライトフェーズですべての応答を受信し、プリライトは成功します。
    5.  TiDBはPDからコミットバージョン番号を受け取り、それを`commit_ts`としてマークします。
    6.  TiDBは、主キーが配置されているTiKVノードへの2番目のコミットを開始します。 TiKVはデータをチェックし、プリライトフェーズで残ったロックをクリーンアップします。
    7.  TiDBは、第2フェーズが正常に終了したことを報告するメッセージを受信します。

6.  TiDBは、トランザクションが正常にコミットされたことをクライアントに通知するメッセージを返します。

7.  TiDBは、このトランザクションに残っているロックを非同期的にクリーンアップします。

## 長所と短所 {#advantages-and-disadvantages}

上記のTiDBでのトランザクションのプロセスから、TiDBトランザクションには次の利点があることは明らかです。

-   わかりやすい
-   単一行トランザクションに基づくクロスノードトランザクションを実装する
-   分散型ロック管理

ただし、TiDBトランザクションには次の欠点もあります。

-   2PCによるトランザクション遅延
-   一元化されたタイムスタンプ割り当てサービスが必要
-   大量のデータがメモリに書き込まれるときのOOM（メモリ不足）

## トランザクションの再試行 {#transaction-retries}

楽観的なトランザクションモデルでは、激しい競合シナリオでの書き込みと書き込みの競合が原因で、トランザクションがコミットされない場合があります。 TiDBはデフォルトで楽観的同時実行制御を使用しますが、MySQLは悲観的同時実行制御を適用します。これは、MySQLが書き込みタイプのSQLステートメントの実行中にロックを追加し、その繰り返し可能な読み取り分離レベルで現在の読み取りが可能になるため、コミットで例外が発生しないことを意味します。アプリケーションの適応の難しさを軽減するために、TiDBは内部再試行メカニズムを提供します。

### 自動再試行 {#automatic-retry}

トランザクションのコミット中に書き込みと書き込みの競合が発生した場合、TiDBは書き込み操作を含むSQLステートメントを自動的に再試行します。 `tidb_disable_txn_auto_retry`を`OFF`に設定して自動再試行を有効にし、 `tidb_retry_limit`を設定して再試行制限を設定できます。

```toml
# Whether to disable automatic retry. ("on" by default)
tidb_disable_txn_auto_retry = OFF
# Set the maximum number of the retires. ("10" by default)
# When “tidb_retry_limit = 0”, automatic retry is completely disabled.
tidb_retry_limit = 10
```

自動再試行は、セッションレベルまたはグローバルレベルのいずれかで有効にできます。

1.  セッションレベル：


    ```sql
    SET tidb_disable_txn_auto_retry = OFF;
    ```


    ```sql
    SET tidb_retry_limit = 10;
    ```

2.  グローバルレベル：


    ```sql
    SET GLOBAL tidb_disable_txn_auto_retry = OFF;
    ```


    ```sql
    SET GLOBAL tidb_retry_limit = 10;
    ```

> **ノート：**
>
> `tidb_retry_limit`変数は、再試行の最大数を決定します。この変数が`0`に設定されている場合、自動的にコミットされる暗黙の単一ステートメントトランザクションを含め、どのトランザクションも自動的に再試行しません。これは、TiDBの自動再試行メカニズムを完全に無効にする方法です。自動再試行を無効にすると、競合するすべてのトランザクションが失敗（ `try again later`メッセージを含む）をアプリケーション層に最速で報告します。

### 再試行の制限 {#limits-of-retry}

デフォルトでは、TiDBはトランザクションを再試行しません。これは、更新が失われ、 [`REPEATABLE READ`分離](/transaction-isolation-levels.md)が破損する可能性があるためです。

その理由は、再試行の手順から確認できます。

1.  新しいタイムスタンプを割り当て、 `start_ts`としてマークします。
2.  書き込み操作を含むSQLステートメントを再試行してください。
3.  2フェーズコミットを実装します。

ステップ2では、TiDBは書き込み操作を含むSQLステートメントのみを再試行します。ただし、再試行中に、TiDBはトランザクションの開始を示す新しいバージョン番号を受け取ります。これは、TiDBが新しい`start_ts`バージョンのデータを使用してSQLステートメントを再試行することを意味します。この場合、トランザクションが他のクエリ結果を使用してデータを更新すると、 `REPEATABLE READ`の分離に違反するため、結果に一貫性がなくなる可能性があります。

アプリケーションが失われた更新を許容でき、 `REPEATABLE READ`の分離整合性を必要としない場合は、 `tidb_disable_txn_auto_retry = OFF`を設定することでこの機能を有効にできます。

## 競合の検出 {#conflict-detection}

分散データベースとして、TiDBは、主にプリライトフェーズで、TiKVレイヤーでメモリ内の競合検出を実行します。 TiDBインスタンスはステートレスであり、相互に認識していません。つまり、書き込みによってクラスタ全体で競合が発生するかどうかを知ることはできません。したがって、競合検出はTiKV層で実行されます。

構成は次のとおりです。

```toml
# Controls the number of slots. ("2048000" by default）
scheduler-concurrency = 2048000
```

さらに、TiKVは、スケジューラーでラッチを待機するために費やされる時間の監視をサポートします。

![Scheduler latch wait duration](https://docs-download.pingcap.com/media/images/docs/optimistic-transaction-metric.png)

`Scheduler latch wait duration`が高く、書き込みが遅い場合は、現時点で書き込みの競合が多いと安全に判断できます。
