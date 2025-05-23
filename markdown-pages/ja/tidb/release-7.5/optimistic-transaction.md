---
title: TiDB Optimistic Transaction Model
summary: TiDBの楽観的トランザクションモデルは、競合する変更を検出し、行ロックをスキップすることでパフォーマンスを向上させます。ただし、競合が多い場合は悲観的トランザクションを使用することをお勧めします。楽観的トランザクションは2フェーズコミットを採用し、自動再試行機能を提供します。競合の検出はTiKVレイヤーで行われ、競合が多い場合はScheduler latch wait durationが高くなります。
---

# TiDB 楽観的トランザクションモデル {#tidb-optimistic-transaction-model}

楽観的トランザクションでは、競合する変更がトランザクション コミットの一部として検出されます。これにより、行ロックを取得するプロセスをスキップできるため、同時トランザクションが同じ行を頻繁に変更しない場合のパフォーマンスの向上に役立ちます。同時トランザクションが同じ行を頻繁に変更する (競合) 場合、楽観的トランザクションのパフォーマンスは[悲観的なトランザクション](/pessimistic-transaction.md)よりも悪くなる可能性があります。

楽観的トランザクションを有効にする前に、 `COMMIT`ステートメントがエラーを返す可能性があることをアプリケーションが正しく処理していることを確認してください。アプリケーションがこれをどのように処理するかわからない場合は、代わりに悲観的トランザクションを使用することをお勧めします。

> **注記：**
>
> v3.0.8 以降、TiDB はデフォルトで[悲観的トランザクション モード](/pessimistic-transaction.md)を使用します。ただし、既存のクラスターを v3.0.7 以前から v3.0.8 以降にアップグレードする場合、これは影響しません。つまり、**新しく作成されたクラスターのみがデフォルトで悲観的トランザクション モードを使用します**。

## 楽観的取引の原則 {#principles-of-optimistic-transactions}

分散トランザクションをサポートするために、TiDB は楽観的トランザクションで 2 フェーズ コミット (2PC) を採用します。手順は次のとおりです。

![2PC in TiDB](https://docs-download.pingcap.com/media/images/docs/2pc-in-tidb.png)

1.  クライアントがトランザクションを開始します。

    TiDB は、現在のトランザクションの一意のトランザクション ID ( `start_ts`と呼ばれます) としてタイムスタンプ (時間の経過とともに単調増加し、グローバルに一意) を PD から取得します。 TiDB はマルチバージョン同時実行制御を実装しているため、 `start_ts`このトランザクションによって取得されるデータベース スナップショットのバージョンとしても機能します。これは、トランザクションがデータベースからデータを読み取ることができるのは`start_ts`のみであることを意味します。

2.  クライアントは読み取りリクエストを発行します。

    1.  TiDB は、PD からルーティング情報 (TiKV ノード間でデータがどのように分散されるか) を受け取ります。
    2.  TiDB は TiKV から`start_ts`バージョンのデータを受け取ります。

3.  クライアントは書き込みリクエストを発行します。

    TiDB は、書き込まれたデータが制約を満たしているかどうかをチェックします (データ型が正しいことを確認するために、NOT NULL 制約が満たされています)。**有効なデータは、TiDB 内のこのトランザクションのプライベートメモリに保存されます**。

4.  クライアントはコミットリクエストを発行します。

5.  TiDB は 2PC を開始し、トランザクションのアトミック性を保証しながらデータをストアに保持します。

    1.  TiDB は書き込まれるデータから主キーを選択します。
    2.  TiDB は PD からリージョン分布の情報を受け取り、それに応じてすべてのキーをリージョンごとにグループ化します。
    3.  TiDB は、関係するすべての TiKV ノードに事前書き込みリクエストを送信します。次に、TiKV は競合するバージョンや期限切れのバージョンが存在するかどうかを確認します。有効なデータはロックされています。
    4.  TiDB は事前書き込みフェーズですべての応答を受信し、事前書き込みは成功します。
    5.  TiDB は PD からコミット バージョン番号を受け取り、それを`commit_ts`としてマークします。
    6.  TiDB は、主キーが配置されている TiKV ノードへの 2 番目のコミットを開始します。 TiKV はデータをチェックし、事前書き込みフェーズで残ったロックを消去します。
    7.  TiDB は、第 2 フェーズが正常に終了したことを報告するメッセージを受信します。

6.  TiDB は、トランザクションが正常にコミットされたことをクライアントに通知するメッセージを返します。

7.  TiDB は、このトランザクションに残っているロックを非同期的に消去します。

## 長所と短所 {#advantages-and-disadvantages}

上記の TiDB でのトランザクションのプロセスから、TiDB トランザクションには次の利点があることが明らかです。

-   わかりやすい
-   単一行トランザクションに基づいてクロスノード トランザクションを実装する
-   分散ロック管理

ただし、TiDB トランザクションには次のような欠点もあります。

-   2PC によるトランザクションのレイテンシー
-   一元的なタイムスタンプ割り当てサービスが必要な場合
-   大量のデータがメモリに書き込まれる場合の OOM (メモリ不足)

## トランザクションの再試行 {#transaction-retries}

楽観的トランザクション モデルでは、競合が激しいシナリオで書き込みと書き込みの競合が原因で、トランザクションがコミットされない可能性があります。 TiDB はデフォルトで楽観的同時実行制御を使用しますが、MySQL は悲観的同時実行制御を適用します。これは、MySQL が書き込みタイプの SQL ステートメントの実行中にロックを追加し、Repeatable Read 分離レベルにより現在の読み取りが許可されるため、通常はコミットで例外が発生しないことを意味します。アプリケーションの適応の難易度を下げるために、TiDB は内部再試行メカニズムを提供します。

### 自動再試行 {#automatic-retry}

トランザクションのコミット中に書き込みと書き込みの競合が発生した場合、TiDB は書き込み操作を含む SQL ステートメントを自動的に再試行します。 `tidb_disable_txn_auto_retry` ～ `OFF`設定して自動再試行を有効にし、 `tidb_retry_limit`を設定して再試行制限を設定できます。

```toml
# Whether to disable automatic retry. ("on" by default)
tidb_disable_txn_auto_retry = OFF
# Set the maximum number of the retires. ("10" by default)
# When "tidb_retry_limit = 0", automatic retry is completely disabled.
tidb_retry_limit = 10
```

セッション レベルまたはグローバル レベルで自動再試行を有効にできます。

1.  セッションレベル:

    ```sql
    SET tidb_disable_txn_auto_retry = OFF;
    ```

    ```sql
    SET tidb_retry_limit = 10;
    ```

2.  グローバルレベル:

    ```sql
    SET GLOBAL tidb_disable_txn_auto_retry = OFF;
    ```

    ```sql
    SET GLOBAL tidb_retry_limit = 10;
    ```

> **注記：**
>
> `tidb_retry_limit`変数は最大再試行回数を決定します。この変数が`0`に設定されている場合、自動的にコミットされる暗黙的な単一ステートメントのトランザクションを含め、どのトランザクションも自動的に再試行されません。これは、TiDB の自動再試行メカニズムを完全に無効にする方法です。自動再試行が無効になった後は、競合するすべてのトランザクションが最速の方法で失敗 ( `try again later`メッセージを含む) をアプリケーションレイヤーに報告します。

### 再試行の制限 {#limits-of-retry}

デフォルトでは、TiDB はトランザクションを再試行しません。これは、更新が失われ、破損する可能性があるためです[`REPEATABLE READ`分離](/transaction-isolation-levels.md) 。

その理由は、再試行の手順から確認できます。

1.  新しいタイムスタンプを割り当て、 `start_ts`としてマークします。
2.  書き込み操作を含む SQL ステートメントを再試行します。
3.  2フェーズコミットを実装します。

ステップ 2 では、TiDB は書き込み操作を含む SQL ステートメントのみを再試行します。ただし、再試行中に、TiDB はトランザクションの開始を示す新しいバージョン番号を受け取ります。これは、TiDB が新しいバージョン`start_ts`のデータを使用して SQL ステートメントを再試行することを意味します。この場合、トランザクションが他のクエリ結果を使用してデータを更新すると、 `REPEATABLE READ`の分離に違反するため、結果に一貫性がなくなる可能性があります。

アプリケーションが更新の損失を許容でき、分離の一貫性`REPEATABLE READ`必要としない場合は、 `tidb_disable_txn_auto_retry = OFF`を設定してこの機能を有効にできます。

## 競合の検出 {#conflict-detection}

分散データベースとして、TiDB は TiKVレイヤーで、主に事前書き込みフェーズでメモリ内の競合検出を実行します。 TiDB インスタンスはステートレスであり、お互いを認識しません。つまり、書き込みがクラスター全体で競合を引き起こすかどうかを知ることができません。したがって、競合検出は TiKVレイヤーで実行されます。

構成は次のとおりです。

```toml
# Controls the number of slots. ("2048000" by default）
scheduler-concurrency = 2048000
```

さらに、TiKV は、スケジューラ内のラッチの待機に費やされる時間の監視をサポートします。

![Scheduler latch wait duration](https://docs-download.pingcap.com/media/images/docs/optimistic-transaction-metric.png)

`Scheduler latch wait duration`が高く、低速な書き込みがない場合は、現時点で書き込み競合が多数発生していると結論付けることができます。
