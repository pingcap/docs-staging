---
title: UPDATE | TiDB SQL Statement Reference
summary: An overview of the usage of UPDATE for the TiDB database.
aliases: ['/docs/stable/sql-statements/sql-statement-update/','/docs/v4.0/sql-statements/sql-statement-update/','/docs/stable/reference/sql/statements/update/']
---

# UPDATE

The `UPDATE` statement is used to modify data in a specified table.

## Synopsis

**UpdateStmt:**

![UpdateStmt](https://download.pingcap.com/images/docs/sqlgram/UpdateStmt.png)

**PriorityOpt:**

![PriorityOpt](https://download.pingcap.com/images/docs/sqlgram/PriorityOpt.png)

**TableRef:**

![TableRef](https://download.pingcap.com/images/docs/sqlgram/TableRef.png)

**TableRefs:**

![TableRefs](https://download.pingcap.com/images/docs/sqlgram/TableRefs.png)

**AssignmentList:**

![AssignmentList](https://download.pingcap.com/images/docs/sqlgram/AssignmentList.png)

**WhereClauseOptional:**

![WhereClauseOptional](https://download.pingcap.com/images/docs/sqlgram/WhereClauseOptional.png)

## Examples

```sql
mysql> CREATE TABLE t1 (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, c1 INT NOT NULL);
Query OK, 0 rows affected (0.11 sec)

mysql> INSERT INTO t1 (c1) VALUES (1), (2), (3);
Query OK, 3 rows affected (0.02 sec)
Records: 3  Duplicates: 0  Warnings: 0

mysql> SELECT * FROM t1;
+----+----+
| id | c1 |
+----+----+
|  1 |  1 |
|  2 |  2 |
|  3 |  3 |
+----+----+
3 rows in set (0.00 sec)

mysql> UPDATE t1 SET c1=5 WHERE c1=3;
Query OK, 1 row affected (0.01 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> SELECT * FROM t1;
+----+----+
| id | c1 |
+----+----+
|  1 |  1 |
|  2 |  2 |
|  3 |  5 |
+----+----+
3 rows in set (0.00 sec)
```

## MySQL compatibility

This statement is understood to be fully compatible with MySQL. Any compatibility differences should be [reported via an issue](https://github.com/pingcap/tidb/issues/new/choose) on GitHub.

## See also

* [INSERT](/sql-statements/sql-statement-insert.md)
* [SELECT](/sql-statements/sql-statement-select.md)
* [DELETE](/sql-statements/sql-statement-delete.md)
* [REPLACE](/sql-statements/sql-statement-replace.md)
