---
title: ADMIN ALTER DDL JOBS
summary: TiDB データベースの ADMIN ALTER DDL JOBS` の使用法の概要。
---

# 管理者による DDL ジョブの変更 {#admin-alter-ddl-jobs}

`ADMIN ALTER DDL JOBS`ステートメントを使用すると、実行中の単一の DDL ジョブのパラメータを変更できます。例:

```sql
ADMIN ALTER DDL JOBS 101 THREAD = 8;
```

-   `101` : DDLジョブのIDを示します。 [`ADMIN SHOW DDL JOBS`](/sql-statements/sql-statement-admin-show-ddl.md)実行するとIDを取得できます。
-   `THREAD` : DDL ジョブの同時実行性を示します。システム変数[`tidb_ddl_reorg_worker_cnt`](/system-variables.md#tidb_ddl_reorg_worker_cnt)使用して初期値を設定できます。

`ADMIN ALTER DDL JOBS`ステートメントでサポートされている DDL ジョブ タイプには、 `ADD INDEX` 、 `MODIFY COLUMN` 、および`REORGANIZE PARTITION`が含まれます。その他の DDL ジョブ タイプの場合、 `ADMIN ALTER DDL JOBS`を実行すると`unsupported DDL operation`エラーが返されます。

現在、 `ADMIN ALTER DDL JOBS`実行して 1 つの DDL ジョブのパラメータのみを変更できます。複数の DDL ジョブ ID のパラメータを同時に変更することはサポートされていません。

さまざまな DDL ジョブでサポートされているパラメーターとそれに対応するシステム変数は次のとおりです。

-   `ADD INDEX` :

    -   `THREAD` : DDL ジョブの同時実行性。初期値は`tidb_ddl_reorg_worker_cnt`に設定されます。
    -   `BATCH_SIZE` : バッチサイズ。初期値は[`tidb_ddl_reorg_batch_size`](/system-variables.md#tidb_ddl_reorg_batch_size)に設定されます。
    -   `MAX_WRITE_SPEED` : 各 TiKV にインデックス レコードをインポートするための最大帯域幅制限。初期値は[`tidb_ddl_reorg_max_write_speed`](/system-variables.md#tidb_ddl_reorg_max_write_speed-new-in-v850)に設定されます。

    現在、上記のパラメータは、送信され、 [`tidb_enable_dist_task`](/system-variables.md#tidb_enable_dist_task-new-in-v710)無効になった後に実行される`ADD INDEX`ジョブに対してのみ機能します。

-   `MODIFY COLUMN` :
    -   `THREAD` : DDL ジョブの同時実行性。初期値は`tidb_ddl_reorg_worker_cnt`に設定されます。
    -   `BATCH_SIZE` : バッチサイズ。初期値は`tidb_ddl_reorg_batch_size`に設定されます。

-   `REORGANIZE PARTITION` :
    -   `THREAD` : DDL ジョブの同時実行性。初期値は`tidb_ddl_reorg_worker_cnt`に設定されます。
    -   `BATCH_SIZE` : バッチサイズ。初期値は`tidb_ddl_reorg_batch_size`に設定されます。

前述のパラメータの値の範囲は、対応するシステム変数の値の範囲と一致しています。

`ADMIN ALTER DDL JOBS`実行中の DDL ジョブにのみ有効です。DDL ジョブが存在しないか、すでに完了している場合、このステートメントを実行すると`ddl job is not running`エラーが返されます。

この声明の例をいくつか示します。

```sql
ADMIN ALTER DDL JOBS 101 THREAD = 8;
ADMIN ALTER DDL JOBS 101 BATCH_SIZE = 256;
ADMIN ALTER DDL JOBS 101 MAX_WRITE_SPEED = '200MiB';
ADMIN ALTER DDL JOBS 101 THREAD = 8, BATCH_SIZE = 256;
```

特定の DDL ジョブの現在のパラメータ値を表示するには、 `ADMIN SHOW DDL JOBS`実行します。結果は`COMMENTS`列に表示されます。

```sql
ADMIN SHOW DDL JOBS 1;
```

    +--------+---------+------------+-----------+--------------+-----------+----------+-----------+----------------------------+----------------------------+----------------------------+--------+-----------------------+
    | JOB_ID | DB_NAME | TABLE_NAME | JOB_TYPE  | SCHEMA_STATE | SCHEMA_ID | TABLE_ID | ROW_COUNT | CREATE_TIME                | START_TIME                 | END_TIME                   | STATE  | COMMENTS              |
    +--------+---------+------------+-----------+--------------+-----------+----------+-----------+----------------------------+----------------------------+----------------------------+--------+-----------------------+
    |    124 | test    | t          | add index | public       |         2 |      122 |         3 | 2024-11-15 11:17:06.213000 | 2024-11-15 11:17:06.213000 | 2024-11-15 11:17:08.363000 | synced | ingest, DXF, thread=8 |
    +--------+---------+------------+-----------+--------------+-----------+----------+-----------+----------------------------+----------------------------+----------------------------+--------+-----------------------+
    1 row in set (0.01 sec)

## 概要 {#synopsis}

```ebnf+diagram
AdminAlterDDLStmt ::=
    'ADMIN' 'ALTER' 'DDL' 'JOBS' Int64Num AlterJobOptionList

AlterJobOptionList ::=
    AlterJobOption ( ',' AlterJobOption )*

AlterJobOption ::=
    identifier "=" SignedLiteral
```

## MySQL 互換性 {#mysql-compatibility}

このステートメントは、MySQL 構文に対する TiDB 拡張です。

## 参照 {#see-also}

-   [`ADMIN SHOW DDL [JOBS|QUERIES]`](/sql-statements/sql-statement-admin-show-ddl.md)
-   [`ADMIN CANCEL DDL`](/sql-statements/sql-statement-admin-cancel-ddl.md)
-   [`ADMIN PAUSE DDL`](/sql-statements/sql-statement-admin-pause-ddl.md)
-   [`ADMIN RESUME DDL`](/sql-statements/sql-statement-admin-resume-ddl.md)
