---
title: SHOW [FULL] TABLES | TiDB SQL Statement Reference
summary: An overview of the usage of SHOW [FULL] TABLES for the TiDB database.
---

# [FULL] テーブルを表示 {#show-full-tables}

このステートメントは、現在選択されているデータベース内のテーブルとビューのリストを表示します。オプションのキーワード`FULL`は、テーブルのタイプが`BASE TABLE`か`VIEW`かを示します。

別のデータベースのテーブルを表示するには、 `SHOW TABLES IN DatabaseName`を使用します。

## あらすじ {#synopsis}

**ShowTablesStmt:**

![ShowTablesStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowTablesStmt.png)

**OptFull:**

![OptFull](https://docs-download.pingcap.com/media/images/docs/sqlgram/OptFull.png)

**ShowDatabaseNameOpt:**

![ShowDatabaseNameOpt](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowDatabaseNameOpt.png)

**ShowLikeOrWhereOpt:**

![ShowLikeOrWhereOpt](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowLikeOrWhereOpt.png)

## 例 {#examples}

```sql
mysql> CREATE TABLE t1 (a int);
Query OK, 0 rows affected (0.12 sec)

mysql> CREATE VIEW v1 AS SELECT 1;
Query OK, 0 rows affected (0.10 sec)

mysql> SHOW TABLES;
+----------------+
| Tables_in_test |
+----------------+
| t1             |
| v1             |
+----------------+
2 rows in set (0.00 sec)

mysql> SHOW FULL TABLES;
+----------------+------------+
| Tables_in_test | Table_type |
+----------------+------------+
| t1             | BASE TABLE |
| v1             | VIEW       |
+----------------+------------+
2 rows in set (0.00 sec)

mysql> SHOW TABLES IN mysql;
+-------------------------+
| Tables_in_mysql         |
+-------------------------+
| GLOBAL_VARIABLES        |
| bind_info               |
| columns_priv            |
| db                      |
| default_roles           |
| expr_pushdown_blacklist |
| gc_delete_range         |
| gc_delete_range_done    |
| global_priv             |
| help_topic              |
| opt_rule_blacklist      |
| role_edges              |
| stats_buckets           |
| stats_feedback          |
| stats_histograms        |
| stats_meta              |
| stats_top_n             |
| tables_priv             |
| tidb                    |
| user                    |
+-------------------------+
20 rows in set (0.00 sec)
```

## MySQL の互換性 {#mysql-compatibility}

このステートメントは、MySQL と完全に互換性があると理解されています。互換性の違いは、GitHub で[問題を介して報告された](https://github.com/pingcap/tidb/issues/new/choose)にする必要があります。

## こちらもご覧ください {#see-also}

-   [テーブルを作成](/sql-statements/sql-statement-create-table.md)
-   [ドロップテーブル](/sql-statements/sql-statement-drop-table.md)
-   [テーブルの作成を表示](/sql-statements/sql-statement-show-create-table.md)
