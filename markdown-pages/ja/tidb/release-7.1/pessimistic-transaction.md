---
title: TiDB Pessimistic Transaction Mode
summary: Learn the pessimistic transaction mode in TiDB.
---

# TiDB ペシミスティックトランザクションモード {#tidb-pessimistic-transaction-mode}

TiDB の使用法を従来のデータベースに近づけ、移行コストを削減するために、TiDB は v3.0 から、オプティ悲観的トランザクション モデルに加えて楽観的ミスティック トランザクション モードをサポートします。このドキュメントでは、TiDB悲観的トランザクション モードの機能について説明します。

> **ノート：**
>
> v3.0.8 以降、新しく作成された TiDB クラスターはデフォルトで悲観的トランザクション モードを使用します。ただし、既存のクラスターを v3.0.7 以前から v3.0.8 以降にアップグレードする場合、これは影響しません。つまり、**新しく作成されたクラスターのみがデフォルトで悲観的トランザクション モードを使用します**。

## トランザクションモードの切り替え {#switch-transaction-mode}

[`tidb_txn_mode`](/system-variables.md#tidb_txn_mode)システム変数を構成することで、トランザクション モードを設定できます。次のコマンドは、クラスター内に新しく作成されたセッションによって実行されるすべての明示的なトランザクション (つまり、非自動コミット トランザクション) を悲観的トランザクション モードに設定します。


```sql
SET GLOBAL tidb_txn_mode = 'pessimistic';
```

次の SQL ステートメントを実行して、悲観的トランザクション モードを明示的に有効にすることもできます。


```sql
BEGIN PESSIMISTIC;
```


```sql
BEGIN /*T! PESSIMISTIC */;
```

`BEGIN PESSIMISTIC;`および`BEGIN OPTIMISTIC;`ステートメントは、 `tidb_txn_mode`システム変数よりも優先されます。これら 2 つのステートメントで開始されたトランザクションはシステム変数を無視し、悲観的トランザクション モードと楽観楽観的トランザクション モードの両方の使用をサポートします。

## 行動 {#behaviors}

TiDB の悲観的なトランザクションは、MySQL のトランザクションと同様に動作します。 [MySQL InnoDBとの違い](#difference-with-mysql-innodb)の小さな違いを参照してください。

-   悲観的トランザクションのために、TiDB はスナップショット読み取りと現在の読み取りを導入します。

    -   スナップショット読み取り: トランザクションの開始前にコミットされたバージョンを読み取る、ロックされていない読み取りです。 `SELECT`ステートメントの読み取りはスナップショット読み取りです。
    -   現在の読み取り: 最新のコミットされたバージョンを読み取るロックされた読み取りです。 `UPDATE` 、 `DELETE` 、 `INSERT` 、または`SELECT FOR UPDATE`ステートメントの読み取りは現在の読み取りです。

    次の例では、スナップショット読み取りと現在の読み取りについて詳しく説明します。

    | セッション1                                                                                                          | セッション2                                                                                      | セッション3                                                    |
    | :-------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ | :-------------------------------------------------------- |
    | CREATE TABLE t (INT);                                                                                           |                                                                                             |                                                           |
    | T 値に挿入(1);                                                                                                      |                                                                                             |                                                           |
    | 悲観的になり始める。                                                                                                      |                                                                                             |                                                           |
    | UPDATE t SET a = a + 1;                                                                                         |                                                                                             |                                                           |
    |                                                                                                                 | 悲観的になり始める。                                                                                  |                                                           |
    |                                                                                                                 | SELECT * FROM t; -- スナップショット読み取りを使用して、現在のトランザクションが開始される前にコミットされたバージョンを読み取ります。結果は a=1 を返します。 |                                                           |
    |                                                                                                                 |                                                                                             | 悲観的になり始める。                                                |
    |                                                                                                                 |                                                                                             | 更新するには t から * を選択してください。 -- 現在の読み取り値を使用します。ロックがかかるまで待ちます。 |
    | 専念; -- ロックを解除します。セッション 3 の SELECT FOR UPDATE 操作はロックを取得し、TiDB は現在の読み取りを使用して最新のコミットされたバージョンを読み取ります。結果は a=2 を返します。 |                                                                                             |                                                           |
    |                                                                                                                 | SELECT * FROM t; -- スナップショット読み取りを使用して、現在のトランザクションが開始される前にコミットされたバージョンを読み取ります。結果は a=1 を返します。 |                                                           |

-   `UPDATE` 、 `DELETE`または`INSERT`ステートメントを実行すると、**最新の**コミットされたデータが読み取られ、データが変更され、変更された行に悲観的ロックが適用されます。

-   `SELECT FOR UPDATE`ステートメントの場合、悲観的ロックは、変更された行ではなく、コミットされたデータの最新バージョンに適用されます。

-   ロックは、トランザクションがコミットまたはロールバックされると解放されます。データを変更しようとする他のトランザクションはブロックされ、ロックが解放されるまで待つ必要があります。 TiDB はマルチバージョン同時実行制御 (MVCC) を使用するため、データを*読み取ろ*うとするトランザクションはブロックされません。

-   システム変数[`tidb_constraint_check_in_place_pessimistic`](/system-variables.md#tidb_constraint_check_in_place_pessimistic-new-in-v630)を設定すると、一意制約チェックによる悲観的ロックをスキップするかどうかを制御できます。詳細は[制約](/constraints.md#pessimistic-transactions)参照してください。

-   複数のトランザクションが互いのロックを取得しようとすると、デッドロックが発生します。これは自動的に検出され、トランザクションの 1 つがランダムに終了し、MySQL 互換のエラー コード`1213`が返されます。

-   トランザクションは、新しいロックを取得するまで最大`innodb_lock_wait_timeout`秒 (デフォルト: 50) 待機します。このタイムアウトに達すると、MySQL 互換のエラー コード`1205`が返されます。複数のトランザクションが同じロックを待機している場合、優先順位はトランザクションの`start ts`にほぼ基づきます。

-   TiDB は、同じクラスター内で楽観的トランザクション モードと悲観的トランザクション モードの両方をサポートします。トランザクションの実行にはどちらのモードも指定できます。

-   TiDB は`FOR UPDATE NOWAIT`構文をサポートしており、ブロックせず、ロックが解放されるまで待機しません。代わりに、MySQL 互換のエラー コード`3572`が返されます。

-   `Point Get`と`Batch Point Get`演算子がデータを読み取らない場合でも、指定された主キーまたは一意キーはロックされ、他のトランザクションが同じ主キーまたは一意キーにデータをロックしたり書き込んだりすることがブロックされます。

-   TiDB は`FOR UPDATE OF TABLES`構文をサポートします。複数のテーブルを結合するステートメントの場合、TiDB は`OF TABLES`のテーブルに関連付けられた行にのみ悲観的ロックを適用します。

## MySQL InnoDBとの違い {#difference-with-mysql-innodb}

1.  TiDB が WHERE 句で範囲を使用する DML または`SELECT FOR UPDATE`ステートメントを実行する場合、範囲内の同時 DML ステートメントはブロックされません。

    例えば：

    ```sql
    CREATE TABLE t1 (
     id INT NOT NULL PRIMARY KEY,
     pad1 VARCHAR(100)
    );
    INSERT INTO t1 (id) VALUES (1),(5),(10);
    ```

    ```sql
    BEGIN /*T! PESSIMISTIC */;
    SELECT * FROM t1 WHERE id BETWEEN 1 AND 10 FOR UPDATE;
    ```

    ```sql
    BEGIN /*T! PESSIMISTIC */;
    INSERT INTO t1 (id) VALUES (6); -- blocks only in MySQL
    UPDATE t1 SET pad1='new value' WHERE id = 5; -- blocks waiting in both MySQL and TiDB
    ```

    この動作は、TiDB が現在*ギャップ ロック*をサポートしていないためです。

2.  TiDB は`SELECT LOCK IN SHARE MODE`をサポートしていません。

    `SELECT LOCK IN SHARE MODE`を実行すると、ロックなしと同じ効果があり、他のトランザクションの読み取りまたは書き込み操作はブロックされません。

3.  DDL により、悲観的トランザクションのコミットが失敗する可能性があります。

    MySQL で DDL を実行すると、実行中のトランザクションによってブロックされる可能性があります。ただし、このシナリオでは、DDL 操作が TiDB でブロックされないため、悲観的トランザクションのコミットが`ERROR 1105 (HY000): Information schema is changed. [try again later]`します。 TiDB はトランザクションの実行中に`TRUNCATE TABLE`ステートメントを実行するため、 `table doesn't exist`エラーが発生する可能性があります。

4.  `START TRANSACTION WITH CONSISTENT SNAPSHOT`を実行した後も、MySQL は他のトランザクションで後で作成されるテーブルを読み取ることができますが、TiDB は読み取ることができません。

5.  自動コミット トランザクションでは、楽観的ロックが優先されます。

    悲観的モデルを使用する場合、自動コミット トランザクションは最初に、オーバーヘッドの少ない楽観的モデルを使用してステートメントをコミットしようとします。書き込み競合が発生した場合、トランザクションの再試行には悲観的モデルが使用されます。したがって、 `tidb_retry_limit`を`0`に設定しても、書き込み競合が発生した場合、自動コミット トランザクションは依然として`Write Conflict`エラーを報告します。

    autocommit `SELECT FOR UPDATE`ステートメントはロックを待機しません。

6.  ステートメントの`EMBEDDED SELECT`で読み取られたデータはロックされません。

7.  TiDB で開いているトランザクションはガベージコレクション(GC) をブロックしません。デフォルトでは、悲観的トランザクションの最大実行時間は 1 時間に制限されます。 TiDB 構成ファイルの`[performance]`の下の`max-txn-ttl`を編集することで、この制限を変更できます。

## 分離レベル {#isolation-level}

TiDB は、悲観的トランザクション モードで次の 2 つの分離レベルをサポートします。

-   デフォルトは[反復可能な読み取り](/transaction-isolation-levels.md#repeatable-read-isolation-level)で、MySQL と同じです。

    > **ノート：**
    >
    > この分離レベルでは、最新のコミットされたデータに基づいて DML 操作が実行されます。動作は MySQL と同じですが、TiDB の楽観的トランザクション モードとは異なります。 [TiDB と MySQL 反復読み取りの違い](/transaction-isolation-levels.md#difference-between-tidb-and-mysql-repeatable-read)を参照してください。

-   [コミットされた読み取り](/transaction-isolation-levels.md#read-committed-isolation-level) 。この分離レベルは[`SET TRANSACTION`](/sql-statements/sql-statement-set-transaction.md)ステートメントを使用して設定できます。

## 悲観的なトランザクションコミットプロセス {#pessimistic-transaction-commit-process}

トランザクションのコミット処理では、悲観的トランザクションと楽観的トランザクションは同じロジックを持ちます。どちらのトランザクションも 2 フェーズ コミット (2PC) モードを採用しています。悲観的トランザクションの重要な適応は、DML の実行です。

![TiDB pessimistic transaction commit process](https://docs-download.pingcap.com/media/images/docs/pessimistic-transaction-commit.png)

悲観的トランザクションでは、2PC の前に`Acquire Pessimistic Lock`フェーズが追加されます。このフェーズには次の手順が含まれます。

1.  (楽観的トランザクション モードと同じ) TiDB はクライアントから`begin`リクエストを受け取り、現在のタイムスタンプはこのトランザクションの start_ts です。
2.  TiDBサーバーがクライアントから書き込み要求を受信すると、TiDBサーバーはTiKVサーバーに対して悲観的ロック要求を開始し、ロックは TiKVサーバーに対して永続化されます。
3.  (楽観的トランザクション モードと同じ) クライアントがコミット リクエストを送信すると、TiDB はオプティ楽観的トランザクション モードと同様の 2 フェーズ コミットの実行を開始します。

![Pessimistic transactions in TiDB](https://docs-download.pingcap.com/media/images/docs/pessimistic-transaction-in-tidb.png)

## パイプライン化されたロックプロセス {#pipelined-locking-process}

悲観的ロックを追加するには、TiKV にデータを書き込む必要があります。ロックが正常に追加されたことの応答は、 Raftを介してコミットおよび適用された後にのみ TiDB に返されます。したがって、楽観的トランザクションと比較して、悲観的トランザクション モードのレイテンシーは必然的に長くなります。

ロックのオーバーヘッドを削減するために、TiKV はパイプライン ロック プロセスを実装します。データがロックの要件を満たした場合、TiKV はただちに TiDB に後続のリクエストを実行し、悲観的ロックに非同期で書き込むように通知します。このプロセスにより、ほとんどのレイテンシーが短縮され、悲観的トランザクションのパフォーマンスが大幅に向上します。ただし、TiKV でネットワーク分割が発生した場合、または TiKV ノードがダウンした場合、悲観的ロックへの非同期書き込みが失敗し、次の側面に影響を与える可能性があります。

-   同じデータを変更する他のトランザクションはブロックできません。アプリケーション ロジックがロックまたはロック待機メカニズムに依存している場合、アプリケーション ロジックの正確さが影響を受けます。

-   トランザクションのコミットが失敗する可能性は低いですが、トランザクションの正確さには影響しません。

<CustomContent platform="tidb">

アプリケーション ロジックがロックまたはロック待機メカニズムに依存している場合、または TiKV クラスターの異常が発生した場合でもトランザクション コミットの成功率をできる限り保証したい場合は、パイプライン ロック機能を無効にする必要があります。

![Pipelined pessimistic lock](https://docs-download.pingcap.com/media/images/docs/pessimistic-transaction-pipelining.png)

この機能はデフォルトで有効になっています。これを無効にするには、TiKV 構成を変更します。

```toml
[pessimistic-txn]
pipelined = false
```

TiKV クラスターが v4.0.9 以降の場合は、 [TiKV 構成を動的に変更する](/dynamic-config.md#modify-tikv-configuration-dynamically)を使用してこの機能を動的に無効にすることもできます。


```sql
set config tikv pessimistic-txn.pipelined='false';
```

</CustomContent>

<CustomContent platform="tidb-cloud">

アプリケーション ロジックがロックまたはロック待機メカニズムに依存している場合、または TiKV クラスターの異常が発生した場合でもトランザクション コミットの成功率をできる限り保証したい場合は、パイプライン ロック機能を[TiDB Cloudサポートにお問い合わせください](/tidb-cloud/tidb-cloud-support.md)にすることができます。

</CustomContent>

## インメモリ悲観的ロック {#in-memory-pessimistic-lock}

v6.0.0 では、TiKV にメモリ内悲観的ロックの機能が導入されています。この機能が有効になっている場合、悲観的ロックは通常、リージョンリーダーのメモリにのみ保存され、ディスクに保存されたり、 Raftを介して他のレプリカに複製されたりしません。この機能により、悲観的ロックを取得するオーバーヘッドが大幅に削減され、悲観的トランザクションのスループットが向上します。

メモリ内悲観的ロックのメモリ使用量がリージョンまたは TiKV ノードのメモリしきい値を超えると、悲観的ロックの取得は[パイプライン化されたロックプロセス](#pipelined-locking-process)になります。リージョンがマージされるか、リーダーが転送されると、悲観的ロックの損失を避けるために、TiKV はメモリ内の悲観的ロックをディスクに書き込み、それを他のレプリカに複製します。

インメモリ悲観的ロックはパイプライン ロック プロセスと同様に実行され、クラスターが正常な場合はロックの取得に影響を与えません。ただし、TiKV でネットワークの分離が発生したり、TiKV ノードがダウンしたりすると、取得した悲観的ロックが失われる可能性があります。

アプリケーション ロジックがロック取得またはロック待機メカニズムに依存している場合、またはクラスターが異常な状態にある場合でもトランザクション コミットの成功率をできる限り保証したい場合は、メモリ内の悲観的ロック**を無効にする**必要があります。特徴。

この機能はデフォルトで有効になっています。これを無効にするには、TiKV 構成を変更します。

```toml
[pessimistic-txn]
in-memory = false
```

この機能を動的に無効にするには、TiKV 構成を動的に変更します。


```sql
set config tikv pessimistic-txn.in-memory='false';
```
