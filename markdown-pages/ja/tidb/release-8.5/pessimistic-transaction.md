---
title: TiDB Pessimistic Transaction Mode
summary: TiDB の悲観的トランザクション モードについて学習します。
---

# TiDB 悲観的トランザクションモード {#tidb-pessimistic-transaction-mode}

TiDB の使用法を従来のデータベースに近づけ、移行コストを削減するために、TiDB は v3.0 以降、楽観的トランザクション モデルに加えて悲観的トランザクション モードをサポートしています。このドキュメントでは、TiDB悲観的トランザクション モードの機能について説明します。

> **注記：**
>
> v3.0.8 以降では、新しく作成された TiDB クラスターはデフォルトで悲観的トランザクション モードを使用します。ただし、既存のクラスターを v3.0.7 以前から v3.0.8 以降にアップグレードした場合、これは既存のクラスターには影響しません。つまり、**新しく作成されたクラスターのみがデフォルトで悲観的トランザクション モードを使用します**。

## トランザクションモードを切り替える {#switch-transaction-mode}

[`tidb_txn_mode`](/system-variables.md#tidb_txn_mode)システム変数を設定することで、トランザクション モードを設定できます。次のコマンドは、クラスター内で新しく作成されたセッションによって実行されるすべての明示的なトランザクション (つまり、自動コミットではないトランザクション) を悲観的トランザクション モードに設定します。

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

`BEGIN PESSIMISTIC;`および`BEGIN OPTIMISTIC;`ステートメントは、 `tidb_txn_mode`システム変数よりも優先されます。これらの 2 つのステートメントで開始されたトランザクションは、システム変数を無視し、悲観的トランザクション モードと楽観的トランザクション モードの両方の使用をサポートします。

## 行動 {#behaviors}

TiDB の悲観的トランザクションは、MySQL の悲観的トランザクションと同様に動作します。 [MySQL InnoDBとの違い](#difference-with-mysql-innodb)の小さな違いを参照してください。

-   悲観的トランザクションの場合、TiDB はスナップショット読み取りと現在の読み取りを導入します。

    -   スナップショット読み取り: トランザクションの開始前にコミットされたバージョンを読み取るロック解除された読み取りです。 `SELECT`ステートメントの読み取りはスナップショット読み取りです。
    -   現在の読み取り: 最新のコミット バージョンを読み取るロックされた読み取りです。 `UPDATE` 、 `DELETE` 、 `INSERT` 、または`SELECT FOR UPDATE`ステートメントの読み取りは、現在の読み取りです。

    次の例では、スナップショット読み取りと現在の読み取りについて詳しく説明します。

    | セッション 1                                                                                                            | セッション2                                                                                     | セッション3                                                  |
    | :----------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- | :------------------------------------------------------ |
    | テーブル t (INT) を作成します。                                                                                               |                                                                                            |                                                         |
    | T値に挿入(1);                                                                                                          |                                                                                            |                                                         |
    | 悲観的に始める;                                                                                                           |                                                                                            |                                                         |
    | t を更新し、a = a + 1 に設定します。                                                                                           |                                                                                            |                                                         |
    |                                                                                                                    | 悲観的に始める;                                                                                   |                                                         |
    |                                                                                                                    | SELECT * FROM t; -- スナップショット読み取りを使用して、現在のトランザクションが開始する前にコミットされたバージョンを読み取ります。結果は a=1 を返します。 |                                                         |
    |                                                                                                                    |                                                                                            | 悲観的に始める;                                                |
    |                                                                                                                    |                                                                                            | SELECT * FROM t FOR UPDATE; -- 現在の読み取りを使用します。ロックを待機します。 |
    | COMMIT; -- ロックを解除します。セッション 3 の SELECT FOR UPDATE 操作はロックを取得し、TiDB は現在の読み取りを使用して最新のコミット済みバージョンを読み取ります。結果は a=2 を返します。 |                                                                                            |                                                         |
    |                                                                                                                    | SELECT * FROM t; -- スナップショット読み取りを使用して、現在のトランザクションが開始する前にコミットされたバージョンを読み取ります。結果は a=1 を返します。 |                                                         |

-   `UPDATE` 、 `DELETE` 、または`INSERT`ステートメントを実行すると、**最新の**コミットされたデータが読み取られ、データが変更され、変更された行に悲観的ロックが適用されます。

-   `SELECT FOR UPDATE`ステートメントの場合、変更された行ではなく、コミットされたデータの最新バージョンに悲観的ロックが適用されます。

-   トランザクションがコミットまたはロールバックされると、ロックは解除されます。データを変更しようとする他のトランザクションはブロックされ、ロックが解除されるまで待機する必要があります。TiDB はマルチバージョン同時実行制御 (MVCC) を使用しているため、データの*読み取り*を試みるトランザクションはブロックされません。

-   システム変数[`tidb_constraint_check_in_place_pessimistic`](/system-variables.md#tidb_constraint_check_in_place_pessimistic-new-in-v630)設定すると、一意制約チェックによる悲観的ロックをスキップするかどうかを制御できます。詳細については[制約](/constraints.md#pessimistic-transactions)参照してください。

-   複数のトランザクションが互いのロックを取得しようとすると、デッドロックが発生します。これは自動的に検出され、トランザクションの 1 つがランダムに終了され、MySQL 互換のエラー コード`1213`が返されます。

-   トランザクションは、新しいロックを取得するために最大`innodb_lock_wait_timeout`秒 (デフォルト: 50) 待機します。このタイムアウトに達すると、MySQL 互換のエラー コード`1205`が返されます。複数のトランザクションが同じロックを待機している場合、優先順位はトランザクションの`start ts`に基づいてほぼ決まります。

-   TiDB は、同じクラスター内で楽観的トランザクション モードと悲観的トランザクション モードの両方をサポートします。トランザクション実行にはどちらのモードも指定できます。

-   TiDB は`FOR UPDATE NOWAIT`構文をサポートしており、ブロックしてロックが解放されるのを待つことはありません。代わりに、MySQL 互換のエラー コード`3572`が返されます。

-   演算子`Point Get`と`Batch Point Get`データを読み取らない場合でも、指定された主キーまたは一意のキーはロックされ、他のトランザクションが同じ主キーまたは一意のキーをロックしたり、データを書き込んだりすることがブロックされます。

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

    この動作は、TiDB が現在*ギャップ ロック*をサポートしていないために発生します。

2.  TiDB は`SELECT LOCK IN SHARE MODE`サポートしていません。

    TiDB はデフォルトでは`SELECT LOCK IN SHARE MODE`構文をサポートしていません。3 [`tidb_enable_noop_functions`](/system-variables.md#tidb_enable_noop_functions-new-in-v40)有効にすると、TiDB を`SELECT LOCK IN SHARE MODE`構文と互換性のあるものにすることができます`SELECT LOCK IN SHARE MODE`実行すると、ロックなしの場合と同じ効果が得られるため、他のトランザクションの読み取りまたは書き込み操作がブロックされることはありません。

    v8.3.0 以降、TiDB は[`tidb_enable_shared_lock_promotion`](/system-variables.md#tidb_enable_shared_lock_promotion-new-in-v830)システム変数を使用して`SELECT LOCK IN SHARE MODE`ステートメントを有効にし、ロックを追加できるようになりました。ただし、今回追加されたロックは真の共有ロックではなく、 `SELECT FOR UPDATE`と一致する排他ロックであることに注意してください。TiDB と`SELECT LOCK IN SHARE MODE`構文の互換性を維持しながら、読み取り中に並行して書き込みトランザクションによってデータが変更されるのを防ぐために書き込みをブロックする場合は、この変数を有効にできます。この変数を有効にすると、 [`tidb_enable_noop_functions`](/system-variables.md#tidb_enable_noop_functions-new-in-v40)が有効かどうかに関係なく、 `SELECT LOCK IN SHARE MODE`ステートメントで有効になります。

3.  DDL により、悲観的トランザクション コミットが失敗する可能性があります。

    MySQL で DDL を実行すると、実行中のトランザクションによってブロックされる可能性があります。ただし、このシナリオでは、DDL 操作は TiDB でブロックされないため、悲観的トランザクション コミットが失敗します: `ERROR 1105 (HY000): Information schema is changed. [try again later]` 。TiDB はトランザクション実行中に`TRUNCATE TABLE`ステートメントを実行し、 `table doesn't exist`エラーが発生する可能性があります。

4.  `START TRANSACTION WITH CONSISTENT SNAPSHOT`実行した後、MySQL は他のトランザクションで後で作成されたテーブルを読み取ることができますが、TiDB は読み取ることができません。

5.  自動コミット トランザクションでは、楽観的ロックが優先されます。

    悲観的モデルを使用する場合、自動コミット トランザクションは、まずオーバーヘッドの少ない楽観的モデルを使用してステートメントをコミットしようとします。書き込み競合が発生した場合、トランザクションの再試行には悲観的モデルが使用されます。したがって、 `tidb_retry_limit` `0`に設定しても、書き込み競合が発生すると、自動コミット トランザクションは`Write Conflict`エラーを報告します。

    自動コミット`SELECT FOR UPDATE`ステートメントはロックを待機しません。

6.  ステートメント内の`EMBEDDED SELECT`によって読み取られたデータはロックされません。

7.  TiDB のオープン トランザクションは、ガベージコレクション(GC) をブロックしません。デフォルトでは、悲観的トランザクションの最大実行時間は 1 時間に制限されます。この制限は、TiDB 構成ファイルの`[performance]`の下の`max-txn-ttl`編集することで変更できます。

## 隔離レベル {#isolation-level}

TiDB は、悲観的トランザクション モードで次の 2 つの分離レベルをサポートします。

-   デフォルトでは[繰り返し読み取り](/transaction-isolation-levels.md#repeatable-read-isolation-level)で、これは MySQL と同じです。

    > **注記：**
    >
    > この分離レベルでは、コミットされた最新のデータに基づいて DML 操作が実行されます。動作は MySQL と同じですが、TiDB の楽観的トランザクション モードとは異なります[TiDB と MySQL の繰り返し読み取りの違い](/transaction-isolation-levels.md#difference-between-tidb-and-mysql-repeatable-read)参照してください。

-   [コミットされた読み取り](/transaction-isolation-levels.md#read-committed-isolation-level) 。この分離レベルは[`SET TRANSACTION`](/sql-statements/sql-statement-set-transaction.md)ステートメントを使用して設定できます。

## 悲観的なトランザクションコミットプロセス {#pessimistic-transaction-commit-process}

トランザクションのコミット プロセスでは、悲観的トランザクションと楽観的トランザクションは同じロジックを持ちます。両方のトランザクションは 2 フェーズ コミット (2PC) モードを採用しています。悲観的トランザクションの重要な適応は DML 実行です。

![TiDB pessimistic transaction commit process](https://docs-download.pingcap.com/media/images/docs/pessimistic-transaction-commit.png)

悲観的トランザクションは、2PC の前に`Acquire Pessimistic Lock`フェーズを追加します。このフェーズには、次の手順が含まれます。

1.  (楽観的トランザクション モードと同じ) TiDB はクライアントから`begin`リクエストを受信し、現在のタイムスタンプはこのトランザクションの start_ts になります。
2.  TiDBサーバーはクライアントから書き込み要求を受信すると、TiDBサーバーはTiKVサーバーに悲観的ロック要求を開始し、ロックは TiKVサーバーに永続化されます。
3.  (楽観的トランザクション モードと同じ) クライアントがコミット要求を送信すると、TiDB は楽観的トランザクション モードと同様に 2 フェーズ コミットの実行を開始します。

![Pessimistic transactions in TiDB](https://docs-download.pingcap.com/media/images/docs/pessimistic-transaction-in-tidb.png)

## パイプライン化されたロック処理 {#pipelined-locking-process}

悲観的ロックを追加するには、TiKV にデータを書き込む必要があります。ロックの追加に成功したという応答は、 Raftを介してコミットおよび適用した後にのみ TiDB に返すことができます。そのため、楽観的トランザクションと比較すると、悲観的トランザクション モードでは必然的にレイテンシーが高くなります。

ロックのオーバーヘッドを削減するために、TiKV はパイプライン化されたロック プロセスを実装します。データがロックの要件を満たすと、TiKV はすぐに TiDB に通知して後続の要求を実行し、悲観的ロックに非同期で書き込みます。このプロセスにより、ほとんどのレイテンシーが削減され、悲観的トランザクションのパフォーマンスが大幅に向上します。ただし、TiKV でネットワーク パーティションが発生したり、TiKV ノードがダウンしたりすると、悲観的ロックへの非同期書き込みが失敗し、次の側面に影響する可能性があります。

-   同じデータを変更する他のトランザクションはブロックできません。アプリケーション ロジックがロックまたはロック待機メカニズムに依存している場合、アプリケーション ロジックの正確性が影響を受けます。

-   トランザクションのコミットが失敗する可能性は低いですが、トランザクションの正確性には影響しません。

<CustomContent platform="tidb">

アプリケーション ロジックがロックまたはロック待機メカニズムに依存している場合、または TiKV クラスターの異常が発生した場合でもトランザクション コミットの成功率を可能な限り保証したい場合は、パイプライン ロック機能を無効にする必要があります。

![Pipelined pessimistic lock](https://docs-download.pingcap.com/media/images/docs/pessimistic-transaction-pipelining.png)

この機能はデフォルトで有効になっています。無効にするには、TiKV 設定を変更します。

```toml
[pessimistic-txn]
pipelined = false
```

TiKV クラスターが v4.0.9 以降の場合は、 [TiKV 設定を動的に変更する](/dynamic-config.md#modify-tikv-configuration-dynamically)実行してこの機能を動的に無効にすることもできます。

```sql
set config tikv pessimistic-txn.pipelined='false';
```

</CustomContent>

<CustomContent platform="tidb-cloud">

アプリケーション ロジックがロックまたはロック待機メカニズムに依存している場合、または TiKV クラスターの異常が発生した場合でもトランザクション コミットの成功率を可能な限り保証したい場合は、パイプライン ロック機能を[TiDB Cloudサポートにお問い合わせください](/tidb-cloud/tidb-cloud-support.md)にできます。

</CustomContent>

## メモリ内悲観的ロック {#in-memory-pessimistic-lock}

v6.0.0 では、TiKV にメモリ内悲観的ロックの機能が導入されています。この機能を有効にすると、悲観的ロックは通常、リージョンリーダーのメモリにのみ保存され、ディスクに保持されたり、 Raftを介して他のレプリカに複製されたりすることはありません。この機能により、悲観的ロックの取得にかかるオーバーヘッドが大幅に削減され、悲観的トランザクションのスループットが向上します。

<CustomContent platform="tidb">

インメモリ悲観的ロックのメモリ使用量が[リージョン](/tikv-configuration-file.md#in-memory-peer-size-limit-new-in-v840)または[TiKVノード](/tikv-configuration-file.md#in-memory-instance-size-limit-new-in-v840)のメモリしきい値を超えると、悲観的悲観的ロックの取得は[パイプライン化されたロック処理](#pipelined-locking-process)に切り替わります。リージョンがマージされるか、リーダーが転送されると、悲観的ロックが失われるのを避けるために、TiKV はインメモリ悲観的ロックをディスクに書き込み、それを他のレプリカに複製します。

</CustomContent>

<CustomContent platform="tidb-cloud">

インメモリ悲観的ロックのメモリ使用量が[リージョン](https://docs.pingcap.com/tidb/dev/tikv-configuration-file#in-memory-peer-size-limit-new-in-v840)または[TiKVノード](https://docs.pingcap.com/tidb/dev/tikv-configuration-file#in-memory-instance-size-limit-new-in-v840)のメモリしきい値を超えると、悲観的悲観的ロックの取得は[パイプライン化されたロック処理](#pipelined-locking-process)に切り替わります。リージョンがマージされるか、リーダーが転送されると、悲観的ロックが失われるのを避けるために、TiKV はインメモリ悲観的ロックをディスクに書き込み、それを他のレプリカに複製します。

</CustomContent>

メモリ内悲観的ロックはパイプライン ロック プロセスと同様に実行され、クラスターが正常な場合はロックの取得に影響しません。ただし、TiKV でネットワーク分離が発生したり、TiKV ノードがダウンしたりすると、取得した悲観的ロックが失われる可能性があります。

アプリケーション ロジックがロック取得またはロック待機メカニズムに依存している場合、またはクラスターが異常な状態にある場合でもトランザクション コミットの成功率を可能な限り保証したい場合は、メモリ内悲観的ロック機能**を無効にする**必要があります。

この機能はデフォルトで有効になっています。無効にするには、TiKV 設定を変更します。

```toml
[pessimistic-txn]
in-memory = false
```

この機能を動的に無効にするには、TiKV 構成を動的に変更します。

```sql
set config tikv pessimistic-txn.in-memory='false';
```

<CustomContent platform="tidb">

v8.4.0 以降では、 [`pessimistic-txn.in-memory-peer-size-limit`](/tikv-configuration-file.md#in-memory-peer-size-limit-new-in-v840)または[`pessimistic-txn.in-memory-instance-size-limit`](/tikv-configuration-file.md#in-memory-instance-size-limit-new-in-v840)使用して、リージョンまたは TiKV インスタンス内のメモリ内悲観的ロックのメモリ使用量制限を設定できます。

```toml
[pessimistic-txn]
in-memory-peer-size-limit = "512KiB"
in-memory-instance-size-limit = "100MiB"
```

これらの制限を動的に変更するには、 [TiKV設定を動的に変更する](/dynamic-config.md#modify-tikv-configuration-dynamically)のようにします。

```sql
SET CONFIG tikv `pessimistic-txn.in-memory-peer-size-limit`="512KiB";
SET CONFIG tikv `pessimistic-txn.in-memory-instance-size-limit`="100MiB";
```

</CustomContent>
