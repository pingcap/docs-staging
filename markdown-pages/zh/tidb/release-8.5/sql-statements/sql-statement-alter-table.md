---
title: ALTER TABLE
summary: TiDB 数据库中 ALTER TABLE 的使用概况。
---

# ALTER TABLE

`ALTER TABLE` 语句用于对已有表进行修改，以符合新表结构。`ALTER TABLE` 语句可用于：

- [`ADD`](/sql-statements/sql-statement-add-index.md)，[`DROP`](/sql-statements/sql-statement-drop-index.md)，或 [`RENAME`](/sql-statements/sql-statement-rename-index.md) 索引
- [`ADD`](/sql-statements/sql-statement-add-column.md)，[`DROP`](/sql-statements/sql-statement-drop-column.md)，[`MODIFY`](/sql-statements/sql-statement-modify-column.md) 或 [`CHANGE`](/sql-statements/sql-statement-change-column.md) 列
- [`COMPACT`](/sql-statements/sql-statement-alter-table-compact.md) 表数据

## 语法图

```ebnf+diagram
AlterTableStmt ::=
    'ALTER' IgnoreOptional 'TABLE' TableName (
        AlterTableSpecListOpt AlterTablePartitionOpt |
        'ANALYZE' 'PARTITION' PartitionNameList ( 'INDEX' IndexNameList )? AnalyzeOptionListOpt |
        'COMPACT' ( 'PARTITION' PartitionNameList )? 'TIFLASH' 'REPLICA'
    )

TableName ::=
    Identifier ('.' Identifier)?

AlterTableSpec ::=
    TableOptionList
|   'SET' 'TIFLASH' 'REPLICA' LengthNum LocationLabelList
|   'CONVERT' 'TO' CharsetKw ( CharsetName | 'DEFAULT' ) OptCollate
|   'ADD' ( ColumnKeywordOpt IfNotExists ( ColumnDef ColumnPosition | '(' TableElementList ')' ) | Constraint | 'PARTITION' IfNotExists NoWriteToBinLogAliasOpt ( PartitionDefinitionListOpt | 'PARTITIONS' NUM ) )
|   ( ( 'CHECK' | 'TRUNCATE' ) 'PARTITION' | ( 'OPTIMIZE' | 'REPAIR' | 'REBUILD' ) 'PARTITION' NoWriteToBinLogAliasOpt ) AllOrPartitionNameList
|   'COALESCE' 'PARTITION' NoWriteToBinLogAliasOpt NUM
|   'DROP' ( ColumnKeywordOpt IfExists ColumnName RestrictOrCascadeOpt | 'PRIMARY' 'KEY' |  'PARTITION' IfExists PartitionNameList | ( KeyOrIndex IfExists | 'CHECK' ) Identifier | 'FOREIGN' 'KEY' Symbol )
|   'EXCHANGE' 'PARTITION' Identifier 'WITH' 'TABLE' TableName WithValidationOpt
|   ( 'IMPORT' | 'DISCARD' ) ( 'PARTITION' AllOrPartitionNameList )? 'TABLESPACE'
|   'REORGANIZE' 'PARTITION' NoWriteToBinLogAliasOpt ReorganizePartitionRuleOpt
|   'ORDER' 'BY' AlterOrderItem ( ',' AlterOrderItem )*
|   ( 'DISABLE' | 'ENABLE' ) 'KEYS'
|   ( 'MODIFY' ColumnKeywordOpt IfExists | 'CHANGE' ColumnKeywordOpt IfExists ColumnName ) ColumnDef ColumnPosition
|   'ALTER' ( ColumnKeywordOpt ColumnName ( 'SET' 'DEFAULT' ( SignedLiteral | '(' Expression ')' ) | 'DROP' 'DEFAULT' ) | 'CHECK' Identifier EnforcedOrNot | 'INDEX' Identifier ("VISIBLE" | "INVISIBLE") )
|   'RENAME' ( ( 'COLUMN' | KeyOrIndex ) Identifier 'TO' Identifier | ( 'TO' | '='? | 'AS' ) TableName )
|   LockClause
|   AlgorithmClause
|   'FORCE'
|   ( 'WITH' | 'WITHOUT' ) 'VALIDATION'
|   'SECONDARY_LOAD'
|   'SECONDARY_UNLOAD'
|   ( 'AUTO_INCREMENT' | 'AUTO_ID_CACHE' | 'AUTO_RANDOM_BASE' | 'SHARD_ROW_ID_BITS' ) EqOpt LengthNum
|   ( 'CACHE' | 'NOCACHE' )
|   (
        'TTL' EqOpt TimeColumnName '+' 'INTERVAL' Expression TimeUnit (TTLEnable EqOpt ( 'ON' | 'OFF' ))?
        | 'REMOVE' 'TTL'
        | TTLEnable EqOpt ( 'ON' | 'OFF' )
        | TTLJobInterval EqOpt stringLit
    )
|   PlacementPolicyOption

PlacementPolicyOption ::=
    "PLACEMENT" "POLICY" EqOpt PolicyName
|   "PLACEMENT" "POLICY" (EqOpt | "SET") "DEFAULT"
```

## 示例

创建一张表，并插入初始数据：


```sql
CREATE TABLE t1 (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, c1 INT NOT NULL);
INSERT INTO t1 (c1) VALUES (1),(2),(3),(4),(5);
```

```sql
Query OK, 0 rows affected (0.11 sec)
Query OK, 5 rows affected (0.03 sec)
Records: 5  Duplicates: 0  Warnings: 0
```

执行以下查询需要扫描全表，因为 `c1` 列未被索引：


```sql
EXPLAIN SELECT * FROM t1 WHERE c1 = 3;
```

```sql
+-------------------------+----------+-----------+---------------+--------------------------------+
| id                      | estRows  | task      | access object | operator info                  |
+-------------------------+----------+-----------+---------------+--------------------------------+
| TableReader_7           | 10.00    | root      |               | data:Selection_6               |
| └─Selection_6           | 10.00    | cop[tikv] |               | eq(test.t1.c1, 3)              |
|   └─TableFullScan_5     | 10000.00 | cop[tikv] | table:t1      | keep order:false, stats:pseudo |
+-------------------------+----------+-----------+---------------+--------------------------------+
3 rows in set (0.00 sec)
```

你可以使用 [`ALTER TABLE .. ADD INDEX`](/sql-statements/sql-statement-add-index.md) 语句在 `t1` 表上添加索引。添加后，`EXPLAIN` 的分析结果显示 `SELECT * FROM t1 WHERE c1 = 3;` 查询已使用效率更高的索引范围扫描：


```sql
ALTER TABLE t1 ADD INDEX (c1);
EXPLAIN SELECT * FROM t1 WHERE c1 = 3;
```

```sql
Query OK, 0 rows affected (0.30 sec)
+------------------------+---------+-----------+------------------------+---------------------------------------------+
| id                     | estRows | task      | access object          | operator info                               |
+------------------------+---------+-----------+------------------------+---------------------------------------------+
| IndexReader_6          | 10.00   | root      |                        | index:IndexRangeScan_5                      |
| └─IndexRangeScan_5     | 10.00   | cop[tikv] | table:t1, index:c1(c1) | range:[3,3], keep order:false, stats:pseudo |
+------------------------+---------+-----------+------------------------+---------------------------------------------+
2 rows in set (0.00 sec)
```

TiDB 允许用户为 DDL 操作指定使用某一种 `ALTER` 算法。注意这仅为一种指定，并不改变实际的用于更改表的算法：


```sql
ALTER TABLE t1 DROP INDEX c1, ALGORITHM=INSTANT;
```

```sql
Query OK, 0 rows affected (0.24 sec)
```

如果某一 DDL 操作要求使用 `INPLACE` 算法，而用户指定 `ALGORITHM=INSTANT`，会导致报错：


```sql
ALTER TABLE t1 ADD INDEX (c1), ALGORITHM=INSTANT;
```

```sql
ERROR 1846 (0A000): ALGORITHM=INSTANT is not supported. Reason: Cannot alter table by INSTANT. Try ALGORITHM=INPLACE.
```

但如果为 `INPLACE` 操作指定 `ALGORITHM=COPY`，会产生警告而非错误，这是因为 TiDB 将该指定解读为*该算法或更好的算法*。由于 TiDB 使用的算法可能不同于 MySQL，所以这一行为可用于 MySQL 兼容性。


```sql
ALTER TABLE t1 ADD INDEX (c1), ALGORITHM=COPY;
SHOW WARNINGS;
```

```sql
Query OK, 0 rows affected, 1 warning (0.25 sec)
+-------+------+---------------------------------------------------------------------------------------------+
| Level | Code | Message                                                                                     |
+-------+------+---------------------------------------------------------------------------------------------+
| Error | 1846 | ALGORITHM=COPY is not supported. Reason: Cannot alter table by COPY. Try ALGORITHM=INPLACE. |
+-------+------+---------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

## MySQL 兼容性

TiDB 中的 `ALTER TABLE` 语法主要存在以下限制：

- 使用 `ALTER TABLE` 语句修改一个表的多个模式对象（如列、索引）时：
    - 不允许在多个更改中指定同一个模式对象。
    - TiDB 根据**执行前**的表结构检查合法性。例如 `ALTER TABLE t ADD COLUMN c1 INT, ADD COLUMN c2 INT AFTER c1;` 会报错，因为表结构中不存在名字为 `c1` 的列。
    - TiDB 的执行顺序是从左往右逐个执行更改，该行为在个别场景下和 MySQL 不兼容。
- 不支持主键列上 [Reorg-Data](/sql-statements/sql-statement-modify-column.md#reorg-data-change) 类型的变更。
- 不支持分区表上的列类型变更。
- 不支持生成列上的列类型变更。
- 不支持部分数据类型（例如，部分时间类型、Bit、Set、Enum、JSON 等）的变更，因为 TiDB 中的 `CAST` 函数与 MySQL 的行为存在兼容性问题。
- 不支持空间数据类型。
- `ALTER TABLE t CACHE | NOCACHE` 不是 MySQL 标准语法，而是 TiDB 扩展功能，参见[缓存表](/cached-tables.md)。

其它限制可参考：[TiDB 中 DDL 语句与 MySQL 的兼容性情况](/mysql-compatibility.md#ddl-的限制)。

## 另请参阅

- [与 MySQL 兼容性对比](/mysql-compatibility.md#ddl-的限制)
- [ALTER TABLE ... COMPACT](/sql-statements/sql-statement-alter-table-compact.md)
- [ADD COLUMN](/sql-statements/sql-statement-add-column.md)
- [DROP COLUMN](/sql-statements/sql-statement-drop-column.md)
- [ADD INDEX](/sql-statements/sql-statement-add-index.md)
- [DROP INDEX](/sql-statements/sql-statement-drop-index.md)
- [RENAME INDEX](/sql-statements/sql-statement-rename-index.md)
- [ALTER INDEX](/sql-statements/sql-statement-alter-index.md)
- [CREATE TABLE](/sql-statements/sql-statement-create-table.md)
- [DROP TABLE](/sql-statements/sql-statement-drop-table.md)
- [SHOW CREATE TABLE](/sql-statements/sql-statement-show-create-table.md)
