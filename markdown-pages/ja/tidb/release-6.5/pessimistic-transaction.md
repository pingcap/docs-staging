---
title: TiDB Pessimistic Transaction Mode
summary: Learn the pessimistic transaction mode in TiDB.
---

# TiDB ペシミスティックトランザクションモード {#tidb-pessimistic-transaction-mode}

TiDB の使用を従来のデータベースに近づけ、移行のコストを削減するために、v3.0 以降、TiDB は悲観的トランザクション モデルに加えて楽観的トランザクション モードをサポートします。このドキュメントでは、TiDB の悲観的トランザクション モードの機能について説明します。

> **ノート：**
>
> v3.0.8 以降、新しく作成された TiDB クラスターはデフォルトで悲観的トランザクション モードを使用します。ただし、v3.0.7 以前から v3.0.8 以降にアップグレードする場合、既存のクラスターには影響しません。つまり、**新しく作成されたクラスターのみがデフォルトで悲観的トランザクション モードを使用します**。

## トランザクション モードの切り替え {#switch-transaction-mode}

[`tidb_txn_mode`](/system-variables.md#tidb_txn_mode)システム変数を設定することで、トランザクション モードを設定できます。次のコマンドは、クラスター内で新しく作成されたセッションによって実行されるすべての明示的なトランザクション (つまり、非自動コミット トランザクション) を悲観的トランザクション モードに設定します。


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

`BEGIN PESSIMISTIC;`および`BEGIN OPTIMISTIC;`ステートメントは、 `tidb_txn_mode`システム変数よりも優先されます。これら 2 つのステートメントで開始されたトランザクションは、システム変数を無視し、悲観的および楽観的トランザクション モードの両方の使用をサポートします。

## 行動 {#behaviors}

TiDB のペシミスティック トランザクションは、MySQL のペシミスティック トランザクションと同様に動作します。 [MySQL InnoDB との違い](#difference-with-mysql-innodb)の小さな違いを参照してください。

-   悲観的トランザクションの場合、TiDB はスナップショット読み取りと現在の読み取りを導入します。

    -   スナップショットの読み取り: トランザクションの開始前にコミットされたバージョンを読み取るロック解除された読み取りです。 `SELECT`ステートメントの読み取りは、スナップショット読み取りです。
    -   現在の読み取り: コミットされた最新のバージョンを読み取るロックされた読み取りです。 `UPDATE` 、 `DELETE` 、 `INSERT` 、または`SELECT FOR UPDATE`ステートメントの読み取りは、現在の読み取りです。

    次の例は、スナップショットの読み取りと現在の読み取りの詳細な説明を提供します。

    | セッション1                                                                                                          | セッション 2                                                                                      | セッション 3                                                |
    | :-------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :----------------------------------------------------- |
    | CREATE TABLE t (INT);                                                                                           |                                                                                              |                                                        |
    | T 値 (1) に挿入します。                                                                                                 |                                                                                              |                                                        |
    | 悲観的になる。                                                                                                         |                                                                                              |                                                        |
    | UPDATE t SET a = a + 1;                                                                                         |                                                                                              |                                                        |
    |                                                                                                                 | 悲観的になる。                                                                                      |                                                        |
    |                                                                                                                 | SELECT * FROM t; -- スナップショットの読み取りを使用して、現在のトランザクションが開始される前にコミットされたバージョンを読み取ります。結果は a=1 を返します。 |                                                        |
    |                                                                                                                 |                                                                                              | 悲観的になる。                                                |
    |                                                                                                                 |                                                                                              | SELECT * FROM t FOR UPDATE; -- 現在の読み取りを使用します。ロックを待ちます。 |
    | 専念; -- ロックを解除します。セッション 3 の SELECT FOR UPDATE 操作はロックを取得し、TiDB は現在の読み取りを使用して最新のコミットされたバージョンを読み取ります。結果は a=2 を返します。 |                                                                                              |                                                        |
    |                                                                                                                 | SELECT * FROM t; -- スナップショットの読み取りを使用して、現在のトランザクションが開始される前にコミットされたバージョンを読み取ります。結果は a=1 を返します。 |                                                        |

-   `UPDATE` `DELETE`または`INSERT`ステートメントを実行すると、コミットされた**最新の**データが読み取られ、データが変更され、変更された行に悲観的ロックが適用されます。

-   `SELECT FOR UPDATE`ステートメントの場合、悲観的ロックは、変更された行ではなく、コミットされたデータの最新バージョンに適用されます。

-   トランザクションがコミットまたはロールバックされると、ロックが解放されます。データを変更しようとする他のトランザクションはブロックされ、ロックが解除されるまで待機する必要があります。 TiDB はマルチバージョン同時実行制御 (MVCC) を使用するため、データを*読み取ろ*うとするトランザクションはブロックされません。

-   システム変数[`tidb_constraint_check_in_place_pessimistic`](/system-variables.md#tidb_constraint_check_in_place_pessimistic-new-in-v630)を設定して、一意制約チェックで悲観的ロックをスキップするかどうかを制御できます。詳細は[制約](/constraints.md#pessimistic-transactions)参照してください。

-   複数のトランザクションが互いのロックを取得しようとすると、デッドロックが発生します。これは自動的に検出され、トランザクションの 1 つがランダムに終了し、MySQL 互換のエラー コード`1213`が返されます。

-   トランザクションは、新しいロックを取得するために最大`innodb_lock_wait_timeout`秒 (デフォルト: 50) 待機します。このタイムアウトに達すると、MySQL 互換のエラー コード`1205`が返されます。複数のトランザクションが同じロックを待機している場合、優先順位はおおよそトランザクションの`start ts`に基づいています。

-   TiDB は、同じクラスター内で楽観的トランザクション モードと悲観的トランザクション モードの両方をサポートします。トランザクションの実行にはいずれかのモードを指定できます。

-   TiDB は`FOR UPDATE NOWAIT`構文をサポートし、ブロックせず、ロックが解放されるのを待ちます。代わりに、MySQL 互換のエラー コード`3572`が返されます。

-   `Point Get`と`Batch Point Get`演算子がデータを読み取らない場合でも、指定された主キーまたは一意のキーがロックされます。これにより、他のトランザクションが同じ主キーまたは一意のキーにデータをロックまたは書き込むことができなくなります。

-   TiDB は`FOR UPDATE OF TABLES`構文をサポートします。複数のテーブルを結合するステートメントの場合、TiDB は`OF TABLES`のテーブルに関連付けられている行に悲観的ロックのみを適用します。

## MySQL InnoDB との違い {#difference-with-mysql-innodb}

1.  TiDB が WHERE 句で範囲を使用する DML または`SELECT FOR UPDATE`のステートメントを実行する場合、範囲内の同時 DML ステートメントはブロックされません。

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

    `SELECT LOCK IN SHARE MODE`を実行すると、ロックなしと同じ効果があるため、他のトランザクションの読み取りまたは書き込み操作はブロックされません。

3.  DDL により、悲観的トランザクション コミットが失敗する可能性があります。

    MySQL で DDL を実行すると、実行中のトランザクションによってブロックされる場合があります。ただし、このシナリオでは、DDL 操作は TiDB でブロックされないため、悲観的トランザクション コミットの`ERROR 1105 (HY000): Information schema is changed. [try again later]`につながります。 TiDB はトランザクションの実行中に`TRUNCATE TABLE`ステートメントを実行するため、 `table doesn't exist`エラーが発生する可能性があります。

4.  `START TRANSACTION WITH CONSISTENT SNAPSHOT`を実行した後でも、MySQL は後で他のトランザクションで作成されたテーブルを読み取ることができますが、TiDB はできません。

5.  自動コミット トランザクションは楽観的ロックを優先します。

    悲観的モデルを使用する場合、自動コミット トランザクションはまず、オーバーヘッドの少ない楽観的モデルを使用してステートメントをコミットしようとします。書き込み競合が発生した場合、悲観的モデルがトランザクションの再試行に使用されます。したがって、 `tidb_retry_limit`が`0`に設定されている場合でも、自動コミット トランザクションは、書き込みの競合が発生したときに`Write Conflict`エラーを報告します。

    autocommit `SELECT FOR UPDATE`ステートメントはロックを待ちません。

6.  ステートメントで`EMBEDDED SELECT`で読み取ったデータはロックされていません。

7.  TiDB で開いているトランザクションは、ガベージコレクション(GC) をブロックしません。デフォルトでは、悲観的トランザクションの最大実行時間は 1 時間に制限されます。この制限を変更するには、TiDB 構成ファイルで`max-txn-ttl`から`[performance]`編集します。

## 分離レベル {#isolation-level}

TiDB は、悲観的トランザクション モードで次の 2 つの分離レベルをサポートします。

-   デフォルトは[反復可能な読み取り](/transaction-isolation-levels.md#repeatable-read-isolation-level)で、これは MySQL と同じです。

    > **ノート：**
    >
    > この分離レベルでは、コミットされた最新のデータに基づいて DML 操作が実行されます。動作は MySQL と同じですが、TiDB の楽観的トランザクション モードとは異なります。 [TiDB と MySQL の反復可能読み取りの違い](/transaction-isolation-levels.md#difference-between-tidb-and-mysql-repeatable-read)を参照してください。

-   [コミットされた読み取り](/transaction-isolation-levels.md#read-committed-isolation-level) .この分離レベルは、 [`SET TRANSACTION`](/sql-statements/sql-statement-set-transaction.md)ステートメントを使用して設定できます。

## ペシミスティック トランザクション コミット プロセス {#pessimistic-transaction-commit-process}

トランザクションのコミット処理では、悲観的トランザクションと楽観的トランザクションは同じロジックを持ちます。どちらのトランザクションも、2 フェーズ コミット (2PC) モードを採用しています。悲観的トランザクションの重要な適応は、DML の実行です。

![TiDB pessimistic transaction commit process](https://docs-download.pingcap.com/media/images/docs/pessimistic-transaction-commit.png)

悲観的トランザクションは、2PC の前に`Acquire Pessimistic Lock`フェーズを追加します。このフェーズには、次の手順が含まれます。

1.  (楽観的トランザクション モードと同じ) TiDB はクライアントから`begin`要求を受け取り、現在のタイムスタンプはこのトランザクションの start_ts です。
2.  TiDBサーバーがクライアントから書き込み要求を受け取ると、TiDBサーバーはTiKVサーバーに対して悲観的ロック要求を開始し、ロックは TiKVサーバーに永続化されます。
3.  (楽観的トランザクションモードと同じ) クライアントがコミット要求を送信すると、TiDB は楽観的トランザクションモードと同様に 2 フェーズコミットを実行し始めます。

![Pessimistic transactions in TiDB](https://docs-download.pingcap.com/media/images/docs/pessimistic-transaction-in-tidb.png)

## パイプライン化されたロック プロセス {#pipelined-locking-process}

悲観的ロックを追加するには、TiKV にデータを書き込む必要があります。ロックを正常に追加したという応答は、 Raftを介して commit および apply した後にのみ TiDB に返すことができます。したがって、楽観的トランザクションと比較して、悲観的トランザクション モードでは必然的にレイテンシーが高くなります。

ロックのオーバーヘッドを削減するために、TiKV はパイプライン化されたロック プロセスを実装します。データがロックの要件を満たすと、TiKV は直ちに TiDB に後続の要求を実行するよう通知し、悲観的ロックに非同期で書き込みます。このプロセスにより、ほとんどのレイテンシーが短縮され、悲観的トランザクションのパフォーマンスが大幅に向上します。ただし、TiKV でネットワーク パーティションが発生した場合、または TiKV ノードがダウンした場合、悲観的ロックへの非同期書き込みが失敗し、次の側面に影響を与える可能性があります。

-   同じデータを変更する他のトランザクションはブロックできません。アプリケーション ロジックがロックまたはロック待機メカニズムに依存している場合、アプリケーション ロジックの正確性が影響を受けます。

-   トランザクションのコミットが失敗する可能性は低いですが、トランザクションの正確性には影響しません。

<CustomContent platform="tidb">

アプリケーション ロジックがロックまたはロック待機メカニズムに依存している場合、または TiKV クラスター異常の場合でもトランザクション コミットの成功率を可能な限り保証したい場合は、パイプライン ロック機能を無効にする必要があります。

![Pipelined pessimistic lock](https://docs-download.pingcap.com/media/images/docs/pessimistic-transaction-pipelining.png)

この機能はデフォルトで有効になっています。無効にするには、TiKV 構成を変更します。

```toml
[pessimistic-txn]
pipelined = false
```

TiKV クラスターが v4.0.9 以降の場合、この機能を[TiKV 構成を動的に変更する](/dynamic-config.md#modify-tikv-configuration-dynamically)で動的に無効にすることもできます。


```sql
set config tikv pessimistic-txn.pipelined='false';
```

</CustomContent>

<CustomContent platform="tidb-cloud">

アプリケーション ロジックがロックまたはロック待機メカニズムに依存している場合、または TiKV クラスター異常の場合でもトランザクション コミットの成功率を可能な限り保証したい場合は、パイプライン ロック機能を[TiDB Cloudサポートに連絡する](/tidb-cloud/tidb-cloud-support.md)にすることができます。

</CustomContent>

## インメモリ悲観的ロック {#in-memory-pessimistic-lock}

v6.0.0 では、TiKV はメモリ内悲観的ロックの機能を導入しています。この機能が有効になっている場合、悲観的ロックは通常、リージョンリーダーのメモリにのみ保存され、ディスクに永続化されたり、 Raftを介して他のレプリカに複製されたりしません。この機能により、悲観的ロックを取得するオーバーヘッドが大幅に削減され、悲観的トランザクションのスループットが向上します。

インメモリ悲観的ロックのメモリ使用量がリージョンまたは TiKV ノードのメモリしきい値を超えると、悲観的ロックの取得が[パイプライン化されたロック プロセス](#pipelined-locking-process)になります。リージョンがマージされるか、リーダーが転送されると、悲観的ロックの損失を回避するために、TiKV はメモリ内の悲観的ロックをディスクに書き込み、それを他のレプリカにレプリケートします。

インメモリ ペシ悲観的ロックは、パイプライン化されたロック プロセスと同様に実行され、クラスターが正常な場合はロックの取得に影響しません。ただし、TiKV でネットワーク分離が発生した場合、または TiKV ノードがダウンした場合、取得した悲観的ロックが失われる可能性があります。

アプリケーション ロジックがロック取得またはロック待機メカニズムに依存している場合、またはクラスターが異常な状態にある場合でもトランザクション コミットの成功率を可能な限り保証したい場合は、インメモリ悲観的ロック**を無効にする**必要があります。特徴。

この機能はデフォルトで有効になっています。無効にするには、TiKV 構成を変更します。

```toml
[pessimistic-txn]
in-memory = false
```

この機能を動的に無効にするには、TiKV 構成を動的に変更します。


```sql
set config tikv pessimistic-txn.in-memory='false';
```
