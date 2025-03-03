---
title: CREATE TABLE LIKE | TiDB SQL Statement Reference
summary: An overview of the usage of CREATE TABLE LIKE for the TiDB database.
aliases: ['/docs/v2.1/sql-statements/sql-statement-create-table-like/','/docs/v2.1/reference/sql/statements/create-table-like/']
---

# CREATE TABLE LIKE

This statement copies the definition of an existing table, without copying any data.

## Synopsis

**CreateTableStmt:**

![CreateTableStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/CreateTableStmt.png)

**LikeTableWithOrWithoutParen:**

![LikeTableWithOrWithoutParen](https://docs-download.pingcap.com/media/images/docs/sqlgram/LikeTableWithOrWithoutParen.png)

**TableName:**

![TableName](https://docs-download.pingcap.com/media/images/docs/sqlgram/TableName.png)

## Examples

```sql
mysql> CREATE TABLE t1 (a INT NOT NULL);
Query OK, 0 rows affected (0.13 sec)

mysql> INSERT INTO t1 VALUES (1),(2),(3),(4),(5);
Query OK, 5 rows affected (0.02 sec)
Records: 5  Duplicates: 0  Warnings: 0

mysql> SELECT * FROM t1;
+---+
| a |
+---+
| 1 |
| 2 |
| 3 |
| 4 |
| 5 |
+---+
5 rows in set (0.00 sec)

mysql> CREATE TABLE t2 LIKE t1;
Query OK, 0 rows affected (0.10 sec)

mysql> SELECT * FROM t2;
Empty set (0.00 sec)
```

## MySQL compatibility

This statement is understood to be fully compatible with MySQL. Any compatibility differences should be [reported via an issue](https://github.com/pingcap/tidb/issues/new/choose) on GitHub.

## See also

* [CREATE TABLE](/sql-statements/sql-statement-create-table.md)
* [SHOW CREATE TABLE](/sql-statements/sql-statement-show-create-table.md)
