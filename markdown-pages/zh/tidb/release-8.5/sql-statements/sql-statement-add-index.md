---
title: ADD INDEX
summary: TiDB 数据库中 ADD INDEX 的使用概况。
---

# ADD INDEX

`ALTER TABLE.. ADD INDEX` 语句用于在已有表中添加一个索引。在 TiDB 中，`ADD INDEX` 为在线操作，不会阻塞表中的数据读写。

> **Tip:**
>
> 你可以使用 [TiDB 分布式执行框架](/tidb-distributed-execution-framework.md)加速该语句的执行。

> **警告：**
>
> - 在升级 TiDB 集群的过程中，**请勿执行** DDL 语句，否则可能会出现行为未定义的问题。
> - 集群中有 DDL 语句正在被执行时（通常为 `ADD INDEX` 和列类型变更等耗时较久的 DDL 语句），**请勿进行**升级操作。在升级前，建议使用 [`ADMIN SHOW DDL`](/sql-statements/sql-statement-admin-show-ddl.md) 命令查看集群中是否有正在进行的 DDL Job。如需升级，请等待 DDL 执行完成或使用 [`ADMIN CANCEL DDL`](/sql-statements/sql-statement-admin-cancel-ddl.md) 命令取消该 DDL Job 后再进行升级。
> 
> 从 TiDB v7.1 版本升级至更高的版本时，可以不遵循以上限制，建议参考[平滑升级 TiDB 的限制](/smooth-upgrade-tidb.md#使用限制)。

## 语法图

```ebnf+diagram
AlterTableStmt
         ::= 'ALTER' 'IGNORE'? 'TABLE' TableName AddIndexSpec ( ',' AddIndexSpec )*

AddIndexSpec
         ::= 'ADD' ( ( 'PRIMARY' 'KEY' | ( 'KEY' | 'INDEX' ) 'IF NOT EXISTS'? | 'UNIQUE' ( 'KEY' | 'INDEX' )? ) ( ( Identifier? 'USING' | Identifier 'TYPE' ) IndexType )? | 'FULLTEXT' ( 'KEY' | 'INDEX' )? IndexName ) '(' IndexPartSpecification ( ',' IndexPartSpecification )* ')' IndexOption*

IndexPartSpecification
         ::= ( ColumnName ( '(' LengthNum ')' )? | '(' Expression ')' ) ( 'ASC' | 'DESC' )

IndexOption
         ::= 'KEY_BLOCK_SIZE' '='? LengthNum
           | 'USING' IndexType
           | 'WITH' 'PARSER' Identifier
           | 'COMMENT' stringLit
           | 'VISIBLE'
           | 'INVISIBLE'
           | 'GLOBAL'
           | 'LOCAL'

IndexType
         ::= 'BTREE'
           | 'HASH'
           | 'RTREE'
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
EXPLAIN SELECT * FROM t1 WHERE c1 = 3;
```

```
+-------------------------+----------+-----------+---------------+--------------------------------+
| id                      | estRows  | task      | access object | operator info                  |
+-------------------------+----------+-----------+---------------+--------------------------------+
| TableReader_7           | 10.00    | root      |               | data:Selection_6               |
| └─Selection_6           | 10.00    | cop[tikv] |               | eq(test.t1.c1, 3)              |
|   └─TableFullScan_5     | 10000.00 | cop[tikv] | table:t1      | keep order:false, stats:pseudo |
+-------------------------+----------+-----------+---------------+--------------------------------+
3 rows in set (0.00 sec)
```


```sql
ALTER TABLE t1 ADD INDEX (c1);
```

```
Query OK, 0 rows affected (0.30 sec)
```


```sql
EXPLAIN SELECT * FROM t1 WHERE c1 = 3;
```

```
+------------------------+---------+-----------+------------------------+---------------------------------------------+
| id                     | estRows | task      | access object          | operator info                               |
+------------------------+---------+-----------+------------------------+---------------------------------------------+
| IndexReader_6          | 0.01    | root      |                        | index:IndexRangeScan_5                      |
| └─IndexRangeScan_5     | 0.01    | cop[tikv] | table:t1, index:c1(c1) | range:[3,3], keep order:false, stats:pseudo |
+------------------------+---------+-----------+------------------------+---------------------------------------------+
2 rows in set (0.00 sec)
```

## MySQL 兼容性

* 为了兼容 MySQL，TiDB 在语法上支持 `HASH`、`BTREE` 和 `RTREE` 等索引类型，但会忽略它们。
* 不支持 `SPATIAL` 索引。
* TiDB 支持解析 `FULLTEXT` 语法，但不支持使用 `FULLTEXT` 索引。
* 不支持降序索引（类似于 MySQL 5.7）。
* 无法向表中添加 `CLUSTERED` 类型的 `PRIMARY KEY`。要了解关于 `CLUSTERED` 主键的详细信息，请参考[聚簇索引](/clustered-indexes.md)。
* TiDB 对[分区表](/partitioned-table.md)进行了扩展。你可以指定 `GLOBAL` 索引选项将 `PRIMARY KEY` 或 `UNIQUE INDEX` 设置为[全局索引](/partitioned-table.md#全局索引)。该扩展与 MySQL 不兼容。

## 另请参阅

* [索引的选择](/choose-index.md)
* [错误索引的解决方案](/wrong-index-solution.md)
* [CREATE INDEX](/sql-statements/sql-statement-create-index.md)
* [DROP INDEX](/sql-statements/sql-statement-drop-index.md)
* [RENAME INDEX](/sql-statements/sql-statement-rename-index.md)
* [ALTER INDEX](/sql-statements/sql-statement-alter-index.md)
* [ADD COLUMN](/sql-statements/sql-statement-add-column.md)
* [CREATE TABLE](/sql-statements/sql-statement-create-table.md)
* [EXPLAIN](/sql-statements/sql-statement-explain.md)
* [TiDB 分布式执行框架](/tidb-distributed-execution-framework.md)
