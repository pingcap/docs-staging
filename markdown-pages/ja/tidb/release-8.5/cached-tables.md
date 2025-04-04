---
title: Cached Tables
summary: めったに更新されない小さなホットスポット テーブルで読み取りパフォーマンスを向上させるために使用される、TiDB のキャッシュ テーブル機能について学習します。
---

# キャッシュされたテーブル {#cached-tables}

v6.0.0 では、TiDB は、頻繁にアクセスされるがめったに更新されない小さなホットスポット テーブル用のキャッシュ テーブル機能を導入しました。この機能を使用すると、テーブル全体のデータが TiDBサーバーのメモリにロードされ、TiDB は TiKV にアクセスせずにメモリからテーブル データを直接取得するため、読み取りパフォーマンスが向上します。

このドキュメントでは、キャッシュされたテーブルの使用シナリオ、例、および他の TiDB 機能との互換性の制限について説明します。

## 使用シナリオ {#usage-scenarios}

キャッシュされたテーブル機能は、次の特性を持つテーブルに適しています。

-   テーブルのデータ量は小さく、たとえば 4 MiB 未満です。
-   テーブルは読み取り専用であるか、またはほとんど更新されません (たとえば、書き込み QPS (1 秒あたりのクエリ数) が 1 分あたり 10 回未満)。
-   テーブルは頻繁にアクセスされ、たとえば TiKV からの直接読み取り中に小さなテーブルでホットスポットが発生する場合など、読み取りパフォーマンスの向上が期待されます。

テーブルのデータ量が少ないが、データへのアクセス頻度が高い場合、TiKV 内の特定のリージョンにデータが集中し、ホットスポットリージョンとなり、パフォーマンスに影響を及ぼします。そのため、キャッシュ テーブルの一般的な使用シナリオは次のとおりです。

-   アプリケーションが構成情報を読み取るコンフィグレーションテーブル。
-   金融セクターの為替レート表。これらの表は 1 日に 1 回のみ更新されますが、リアルタイムではありません。
-   ほとんど更新されない銀行支店またはネットワーク情報テーブル。

構成テーブルを例に挙げます。アプリケーションを再起動すると、構成情報がすべての接続にロードされ、読み取りレイテンシーが長くなります。この場合、キャッシュ テーブル機能を使用してこの問題を解決できます。

## 例 {#examples}

このセクションでは、キャッシュされたテーブルの使用法を例を挙げて説明します。

### 通常のテーブルをキャッシュテーブルに設定する {#set-a-normal-table-to-a-cached-table}

表`users`があるとします。

```sql
CREATE TABLE users (
    id BIGINT,
    name VARCHAR(100),
    PRIMARY KEY(id)
);
```

このテーブルをキャッシュ テーブルに設定するには、 `ALTER TABLE`ステートメントを使用します。

```sql
ALTER TABLE users CACHE;
```

```sql
Query OK, 0 rows affected (0.01 sec)
```

### キャッシュされたテーブルを確認する {#verify-a-cached-table}

キャッシュされたテーブルを確認するには、 `SHOW CREATE TABLE`ステートメントを使用します。テーブルがキャッシュされている場合、返される結果には`CACHED ON`属性が含まれます。

```sql
SHOW CREATE TABLE users;
```

```sql
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                                                               |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| users | CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin /* CACHED ON */ |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

キャッシュされたテーブルからデータを読み取った後、TiDB はデータをメモリにロードします。1 ステートメントを使用して、データがメモリにロードされて[`TRACE`](/sql-statements/sql-statement-trace.md)かどうかを確認できます。キャッシュがロードされていない場合、返される結果には`regionRequest.SendReqCtx`属性が含まれます。これは、TiDB が TiKV からデータを読み取ったことを示します。

```sql
TRACE SELECT * FROM users;
```

```sql
+------------------------------------------------+-----------------+------------+
| operation                                      | startTS         | duration   |
+------------------------------------------------+-----------------+------------+
| trace                                          | 17:47:39.969980 | 827.73µs   |
|   ├─session.ExecuteStmt                        | 17:47:39.969986 | 413.31µs   |
|   │ ├─executor.Compile                         | 17:47:39.969993 | 198.29µs   |
|   │ └─session.runStmt                          | 17:47:39.970221 | 157.252µs  |
|   │   └─TableReaderExecutor.Open               | 17:47:39.970294 | 47.068µs   |
|   │     └─distsql.Select                       | 17:47:39.970312 | 24.729µs   |
|   │       └─regionRequest.SendReqCtx           | 17:47:39.970454 | 189.601µs  |
|   ├─*executor.UnionScanExec.Next               | 17:47:39.970407 | 353.073µs  |
|   │ ├─*executor.TableReaderExecutor.Next       | 17:47:39.970411 | 301.106µs  |
|   │ └─*executor.TableReaderExecutor.Next       | 17:47:39.970746 | 6.57µs     |
|   └─*executor.UnionScanExec.Next               | 17:47:39.970772 | 17.589µs   |
|     └─*executor.TableReaderExecutor.Next       | 17:47:39.970776 | 6.59µs     |
+------------------------------------------------+-----------------+------------+
12 rows in set (0.01 sec)
```

[`TRACE`](/sql-statements/sql-statement-trace.md)再度実行すると、返される結果に`regionRequest.SendReqCtx`属性が含まれなくなります。これは、TiDB が TiKV からデータを読み取るのではなく、メモリからデータを読み取るようになったことを示します。

```sql
+----------------------------------------+-----------------+------------+
| operation                              | startTS         | duration   |
+----------------------------------------+-----------------+------------+
| trace                                  | 17:47:40.533888 | 453.547µs  |
|   ├─session.ExecuteStmt                | 17:47:40.533894 | 402.341µs  |
|   │ ├─executor.Compile                 | 17:47:40.533903 | 205.54µs   |
|   │ └─session.runStmt                  | 17:47:40.534141 | 132.084µs  |
|   │   └─TableReaderExecutor.Open       | 17:47:40.534202 | 14.749µs   |
|   ├─*executor.UnionScanExec.Next       | 17:47:40.534306 | 3.21µs     |
|   └─*executor.UnionScanExec.Next       | 17:47:40.534316 | 1.219µs    |
+----------------------------------------+-----------------+------------+
7 rows in set (0.00 sec)
```

`UnionScan`演算子はキャッシュされたテーブルを読み取るために使用されるため、 `explain`までのキャッシュされたテーブルの実行プランに`UnionScan`表示されることに注意してください。

```sql
+-------------------------+---------+-----------+---------------+--------------------------------+
| id                      | estRows | task      | access object | operator info                  |
+-------------------------+---------+-----------+---------------+--------------------------------+
| UnionScan_5             | 1.00    | root      |               |                                |
| └─TableReader_7         | 1.00    | root      |               | data:TableFullScan_6           |
|   └─TableFullScan_6     | 1.00    | cop[tikv] | table:users   | keep order:false, stats:pseudo |
+-------------------------+---------+-----------+---------------+--------------------------------+
3 rows in set (0.00 sec)
```

### キャッシュされたテーブルにデータを書き込む {#write-data-to-a-cached-table}

キャッシュされたテーブルはデータの書き込みをサポートします。たとえば、 `users`テーブルにレコードを挿入できます。

```sql
INSERT INTO users(id, name) VALUES(1001, 'Davis');
```

```sql
Query OK, 1 row affected (0.00 sec)
```

```sql
SELECT * FROM users;
```

```sql
+------+-------+
| id   | name  |
+------+-------+
| 1001 | Davis |
+------+-------+
1 row in set (0.00 sec)
```

> **注記：**
>
> キャッシュされたテーブルにデータを挿入すると、第 2 レベルの書き込みレイテンシーが発生する可能性があります。レイテンシーは、グローバル環境変数[`tidb_table_cache_lease`](/system-variables.md#tidb_table_cache_lease-new-in-v600)によって制御されます。アプリケーションに基づいてレイテンシーが許容できるかどうかを確認することで、キャッシュされたテーブル機能を使用するかどうかを決定できます。たとえば、読み取り専用のシナリオでは、 `tidb_table_cache_lease`の値を増やすことができます。
>
> ```sql
> set @@global.tidb_table_cache_lease = 10;
> ```
>
> キャッシュされたテーブルの書き込みレイテンシーは高くなります。これは、キャッシュされたテーブル機能が、各キャッシュにリースを設定する必要がある複雑なメカニズムで実装されているためです。複数の TiDB インスタンスがある場合、1 つのインスタンスは、他のインスタンスがキャッシュされたデータを持っているかどうかを認識しません。インスタンスがテーブルデータを直接変更すると、他のインスタンスは古いキャッシュデータを読み取ります。正確性を保証するために、キャッシュされたテーブルの実装では、リースの有効期限が切れる前にデータが変更されないようにするリースメカニズムを使用します。書き込みレイテンシーが高くなるのは、このためです。

キャッシュされたテーブルのメタデータは`mysql.table_cache_meta`テーブルに保存されます。このテーブルには、キャッシュされたすべてのテーブルの ID、現在のロック状態 ( `lock_type` )、およびロックリース情報 ( `lease` ) が記録されます。このテーブルは TiDB で内部的にのみ使用されるため、変更することはお勧めしません。変更すると、予期しないエラーが発生する可能性があります。

```sql
SHOW CREATE TABLE mysql.table_cache_meta\G
*************************** 1. row ***************************
       Table: table_cache_meta
Create Table: CREATE TABLE `table_cache_meta` (
  `tid` bigint NOT NULL DEFAULT '0',
  `lock_type` enum('NONE','READ','INTEND','WRITE') NOT NULL DEFAULT 'NONE',
  `lease` bigint NOT NULL DEFAULT '0',
  `oldReadLease` bigint NOT NULL DEFAULT '0',
  PRIMARY KEY (`tid`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
1 row in set (0.00 sec)
```

### キャッシュされたテーブルを通常のテーブルに戻す {#revert-a-cached-table-to-a-normal-table}

> **注記：**
>
> キャッシュされたテーブルで DDL ステートメントを実行すると失敗します。キャッシュされたテーブルで DDL ステートメントを実行する前に、まずキャッシュ属性を削除し、キャッシュされたテーブルを通常のテーブルに戻す必要があります。

```sql
TRUNCATE TABLE users;
```

```sql
ERROR 8242 (HY000): 'Truncate Table' is unsupported on cache tables.
```

```sql
mysql> ALTER TABLE users ADD INDEX k_id(id);
```

```sql
ERROR 8242 (HY000): 'Alter Table' is unsupported on cache tables.
```

キャッシュされたテーブルを通常のテーブルに戻すには、 `ALTER TABLE t NOCACHE`使用します。

```sql
ALTER TABLE users NOCACHE;
```

```sql
Query OK, 0 rows affected (0.00 sec)
```

## キャッシュされたテーブルのサイズ制限 {#size-limit-of-cached-tables}

キャッシュされたテーブルは、TiDB がテーブル全体のデータをメモリにロードし、キャッシュされたデータは変更後に無効になり、再ロードする必要があるため、小さなテーブルのシナリオにのみ適しています。

現在、TiDB ではキャッシュされたテーブルのサイズ制限は 64 MB です。テーブル データが 64 MB を超えると、 `ALTER TABLE t CACHE`実行は失敗します。

## 他の TiDB 機能との互換性の制限 {#compatibility-restrictions-with-other-tidb-features}

キャッシュされたテーブルは次の機能をサポートし**ません**。

-   パーティション化されたテーブルで`ALTER TABLE t ADD PARTITION`操作を実行することはサポートされていません。
-   一時テーブルで`ALTER TABLE t CACHE`操作を実行することはサポートされていません。
-   ビューに対して`ALTER TABLE t CACHE`操作を実行することはサポートされていません。
-   ステイル読み取りはサポートされていません。
-   キャッシュされたテーブルに対する直接の DDL 操作はサポートされていません。DDL 操作を実行する前に、まず`ALTER TABLE t NOCACHE`使用してキャッシュされたテーブルを通常のテーブルに戻す必要があります。

キャッシュされたテーブルは、次のシナリオでは使用**できません**。

-   履歴データを読み取るためにシステム変数`tidb_snapshot`を設定します。
-   変更中は、データが再ロードされるまでキャッシュされたデータは無効になります。

## TiDB移行ツールとの互換性 {#compatibility-with-tidb-migration-tools}

キャッシュされたテーブルは、MySQL 構文の TiDB 拡張です。1 ステートメントを認識できるのは TiDB だけです。TiDB 移行ツール`ALTER TABLE ... CACHE` 、Backup &amp; Restore (BR)、TiCDC、 Dumplingなどのキャッシュされたテーブルをサポートして**いません**。これらのツールは、キャッシュされたテーブルを通常のテーブルとして扱います。

つまり、キャッシュされたテーブルをバックアップして復元すると、通常のテーブルになります。ダウンストリーム クラスターが別の TiDB クラスターであり、キャッシュされたテーブル機能を引き続き使用したい場合は、ダウンストリーム テーブルで`ALTER TABLE ... CACHE`実行して、ダウンストリーム クラスターでキャッシュされたテーブルを手動で有効にすることができます。

## 参照 {#see-also}

-   [テーブルの変更](/sql-statements/sql-statement-alter-table.md)
-   [システム変数](/system-variables.md)
