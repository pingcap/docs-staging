---
title: UPDATE | TiDB SQL Statement Reference
summary: An overview of the usage of UPDATE for the TiDB database.
---

# UPDATE

The `UPDATE` statement is used to modify data in a specified table.

## Synopsis

```ebnf+diagram
UpdateStmt ::=
    "UPDATE" UpdateOption
(   TableRef "SET" Assignment ("," Assignment)* WhereClause? OrderBy? Limit?
|   TableRefs "SET" Assignment ("," Assignment)* WhereClause?
)

UpdateOption ::=
    OptimizerHints? ("LOW_PRIORITY" | "HIGH_PRIORITY" | "DELAYED")? "IGNORE"?

TableRef ::=
    ( TableFactor | JoinTable )

TableRefs ::=
    EscapedTableRef ("," EscapedTableRef)*
```

> **Note:**
>
> Starting from v6.6.0, TiDB supports [Resource Control](/tidb-resource-control-ru-groups.md). You can use this feature to execute SQL statements with different priorities in different resource groups. By configuring proper quotas and priorities for these resource groups, you can gain better scheduling control for SQL statements with different priorities. When resource control is enabled, statement priority (`LOW_PRIORITY` and `HIGH_PRIORITY`) will no longer take effect. It is recommended that you use [Resource Control](/tidb-resource-control-ru-groups.md) to manage resource usage for different SQL statements.

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

TiDB always uses the original value of a column when evaluating expressions. For example:

```sql
CREATE TABLE t (a int, b int);
INSERT INTO t VALUES (1,2);
UPDATE t SET a = a+1,b=a;
```

In MySQL, the column `b` is updated to 2 because it is set to the value of `a`, and the value of `a` (which is 1) is updated to `a+1` (which is 2) in the same statement. 

TiDB follows the more standard SQL behavior, and updates `b` to 1.

## See also

* [INSERT](/sql-statements/sql-statement-insert.md)
* [SELECT](/sql-statements/sql-statement-select.md)
* [DELETE](/sql-statements/sql-statement-delete.md)
* [REPLACE](/sql-statements/sql-statement-replace.md)
