---
title: DROP VIEW
summary: TiDB 数据库中 DROP VIEW 的使用概况。
aliases: ['/docs-cn/dev/sql-statements/sql-statement-drop-view/','/docs-cn/dev/reference/sql/statements/drop-view/']
---

# DROP VIEW

`DROP VIEW` 语句用于从当前所选定的数据库中删除视图对象。视图所引用的基表不受影响。

## 语法图

```ebnf+diagram
DropViewStmt ::=
    'DROP' 'VIEW' ( 'IF' 'EXISTS' )? TableNameList RestrictOrCascadeOpt

TableNameList ::=
    TableName ( ',' TableName )*

TableName ::=
    Identifier ('.' Identifier)?
```

## 示例


```sql
CREATE TABLE t1 (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, c1 INT NOT NULL);
```

```
Query OK, 0 rows affected (0.11 sec)
```


```sql
INSERT INTO t1 (c1) VALUES (1),(2),(3),(4),(5);
```

```
Query OK, 5 rows affected (0.03 sec)
Records: 5  Duplicates: 0  Warnings: 0
```


```sql
CREATE VIEW v1 AS SELECT * FROM t1 WHERE c1 > 2;
```

```
Query OK, 0 rows affected (0.11 sec)
```


```sql
SELECT * FROM t1;
```

```
+----+----+
| id | c1 |
+----+----+
|  1 |  1 |
|  2 |  2 |
|  3 |  3 |
|  4 |  4 |
|  5 |  5 |
+----+----+
5 rows in set (0.00 sec)
```


```sql
SELECT * FROM v1;
```

```
+----+----+
| id | c1 |
+----+----+
|  3 |  3 |
|  4 |  4 |
|  5 |  5 |
+----+----+
3 rows in set (0.00 sec)
```


```sql
DROP VIEW v1;
```

```
Query OK, 0 rows affected (0.23 sec)
```


```sql
SELECT * FROM t1;
```

```
+----+----+
| id | c1 |
+----+----+
|  1 |  1 |
|  2 |  2 |
|  3 |  3 |
|  4 |  4 |
|  5 |  5 |
+----+----+
5 rows in set (0.00 sec)
```

## MySQL 兼容性

`DROP VIEW` 语句与 MySQL 完全兼容。如发现任何兼容性差异，请尝试 [TiDB 支持资源](/support.md)。

## See also

* [CREATE VIEW](/sql-statements/sql-statement-create-view.md)
* [DROP TABLE](/sql-statements/sql-statement-drop-table.md)
