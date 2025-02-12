---
title: USE | TiDB SQL Statement Reference
summary: An overview of the usage of USE for the TiDB database.
---

# 使用する {#use}

`USE`ステートメントは、ユーザー セッションの現在のデータベースを選択します。

## あらすじ {#synopsis}

**用途:**

![UseStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/UseStmt.png)

**DB名:**

![DBName](https://docs-download.pingcap.com/media/images/docs/sqlgram/DBName.png)

## 例 {#examples}

```sql
mysql> USE mysql;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> SHOW TABLES;
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
20 rows in set (0.01 sec)

mysql> CREATE DATABASE newtest;
Query OK, 0 rows affected (0.10 sec)

mysql> USE newtest;
Database changed
mysql> SHOW TABLES;
Empty set (0.00 sec)

mysql> CREATE TABLE t1 (a int);
Query OK, 0 rows affected (0.10 sec)

mysql> SHOW TABLES;
+-------------------+
| Tables_in_newtest |
+-------------------+
| t1                |
+-------------------+
1 row in set (0.00 sec)
```

## MySQL の互換性 {#mysql-compatibility}

このステートメントは、MySQL と完全に互換性があると理解されています。互換性の違いは、GitHub で[問題を介して報告された](https://github.com/pingcap/tidb/issues/new/choose)にする必要があります。

## こちらもご覧ください {#see-also}

-   [データベースの作成](/sql-statements/sql-statement-create-database.md)
-   [テーブルを表示](/sql-statements/sql-statement-show-tables.md)
