---
title: ALTER INDEX
summary: TiDB 数据库中 ALTER INDEX 的使用概况。
aliases: ['/docs-cn/dev/sql-statements/sql-statement-alter-index/','/docs-cn/dev/reference/sql/statements/alter-index/']
---

# ALTER INDEX

`ALTER INDEX` 语句用于修改索引的可见性，可以将索引设置为 `Visible` 或者 `Invisible`。设置为 `Invisible` 的索引即不可见索引 (Invisible Index) 由 DML 语句维护，不会被查询优化器使用。从 TiDB v8.0.0 开始，你可以通过修改系统变量 [`tidb_opt_use_invisible_indexes`](/system-variables.md#tidb_opt_use_invisible_indexes-从-v800-版本开始引入)，允许优化器选择不可见索引。

## 语法图

```ebnf+diagram
AlterTableStmt
         ::= 'ALTER' 'IGNORE'? 'TABLE' TableName AlterIndexSpec ( ',' AlterIndexSpec )*

AlterIndexSpec
         ::= 'ALTER' 'INDEX' Identifier ( 'VISIBLE' | 'INVISIBLE' )
```

## 示例

可以通过 `ALTER TABLE ... ALTER INDEX ...` 语句，修改索引的可见性：


```sql
CREATE TABLE t1 (c1 INT, UNIQUE(c1));
ALTER TABLE t1 ALTER INDEX c1 INVISIBLE;
```

```sql
Query OK, 0 rows affected (0.02 sec)
```


```sql
SHOW CREATE TABLE t1;
```

```sql
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table
                                    |
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| t1    | CREATE TABLE `t1` (
  `c1` int DEFAULT NULL,
  UNIQUE KEY `c1` (`c1`) /*!80000 INVISIBLE */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin |
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

优化器将无法使用 `c1` 这个**不可见的索引**：


```sql
EXPLAIN SELECT c1 FROM t1 ORDER BY c1;
```

```sql
+-------------------------+----------+-----------+---------------+--------------------------------+
| id                      | estRows  | task      | access object | operator info                  |
+-------------------------+----------+-----------+---------------+--------------------------------+
| Sort_4                  | 10000.00 | root      |               | test.t1.c1:asc                 |
| └─TableReader_8         | 10000.00 | root      |               | data:TableFullScan_7           |
|   └─TableFullScan_7     | 10000.00 | cop[tikv] | table:t1      | keep order:false, stats:pseudo |
+-------------------------+----------+-----------+---------------+--------------------------------+
3 rows in set (0.00 sec)
```

作为对比，c2 是**可见的索引**，优化器将可以使用索引：


```sql
EXPLAIN SELECT c2 FROM t1 ORDER BY c2;
```

```sql
+------------------------+----------+-----------+------------------------+-------------------------------+
| id                     | estRows  | task      | access object          | operator info                 |
+------------------------+----------+-----------+------------------------+-------------------------------+
| IndexReader_13         | 10000.00 | root      |                        | index:IndexFullScan_12        |
| └─IndexFullScan_12     | 10000.00 | cop[tikv] | table:t1, index:c2(c2) | keep order:true, stats:pseudo |
+------------------------+----------+-----------+------------------------+-------------------------------+
2 rows in set (0.00 sec)
```

即使用 SQL Hint `USE INDEX` 强制使用索引，优化器也无法使用不可见索引，否则 SQL 语句会报错：


```sql
SELECT * FROM t1 USE INDEX(c1);
```

```sql
ERROR 1176 (42000): Key 'c1' doesn't exist in table 't1'
```

> **注意：**
>
> “不可见”是仅仅对优化器而言的，不可见索引仍然可以被修改或删除。


```sql
ALTER TABLE t1 DROP INDEX c1;
```

```sql
Query OK, 0 rows affected (0.02 sec)
```

## MySQL 兼容性

* TiDB 中的不可见索引是基于 MySQL 8.0 中的同等特性构建的。
* 与 MySQL 类似，TiDB 不允许将主键索引设为不可见。

## 另请参阅

* [CREATE TABLE](/sql-statements/sql-statement-create-table.md)
* [CREATE INDEX](/sql-statements/sql-statement-create-index.md)
* [ADD INDEX](/sql-statements/sql-statement-add-index.md)
* [DROP INDEX](/sql-statements/sql-statement-drop-index.md)
* [RENAME INDEX](/sql-statements/sql-statement-rename-index.md)
