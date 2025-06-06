---
title: SHOW INDEXES [FROM|IN]
summary: TiDB 数据库中 SHOW INDEXES [FROM|IN] 的使用概况。
---

# SHOW INDEXES [FROM|IN]

`SHOW INDEXES [FROM|IN]` 语句用于列出指定表上的索引。`SHOW INDEX [FROM | IN]` 和 `SHOW KEYS [FROM | IN]` 是该语句的别名。包含该语句提供了 MySQL 兼容性。

## 语法图

**ShowIndexStmt:**

![ShowIndexStmt](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ShowIndexStmt.png)

**ShowIndexKwd:**

![ShowIndexKwd](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ShowIndexKwd.png)

**FromOrIn:**

![FromOrIn](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/FromOrIn.png)

**TableName:**

![TableName](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/TableName.png)

**ShowLikeOrWhereOpt:**

![ShowLikeOrWhereOpt](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ShowLikeOrWhereOpt.png)

## 示例


```sql
CREATE TABLE t1 (id int not null primary key AUTO_INCREMENT, col1 INT, INDEX(col1));
```

```
Query OK, 0 rows affected (0.12 sec)
```


```sql
SHOW INDEXES FROM t1;
```

```
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| Table | Non_unique | Key_name | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Visible | Expression |
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| t1    |          0 | PRIMARY  |            1 | id          | A         |           0 |     NULL | NULL   |      | BTREE      |         |               | YES 
    | NULL       |
| t1    |          1 | col1     |            1 | col1        | A         |           0 |     NULL | NULL   | YES  | BTREE      |         |               | YES 
    | NULL       |
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
2 rows in set (0.00 sec)
```


```sql
SHOW INDEX FROM t1;
```

```
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| Table | Non_unique | Key_name | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Visible | Expression |
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| t1    |          0 | PRIMARY  |            1 | id          | A         |           0 |     NULL | NULL   |      | BTREE      |         |               | YES 
    | NULL       |
| t1    |          1 | col1     |            1 | col1        | A         |           0 |     NULL | NULL   | YES  | BTREE      |         |               | YES 
    | NULL       |
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
2 rows in set (0.00 sec)
```


```sql
SHOW KEYS FROM t1;
```

```
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| Table | Non_unique | Key_name | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Visible | Expression |
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| t1    |          0 | PRIMARY  |            1 | id          | A         |           0 |     NULL | NULL   |      | BTREE      |         |               | YES 
    | NULL       |
| t1    |          1 | col1     |            1 | col1        | A         |           0 |     NULL | NULL   | YES  | BTREE      |         |               | YES 
    | NULL       |
+-------+------------+----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
2 rows in set (0.00 sec)
```

## MySQL 兼容性

MySQL 中的 `Cardinality` 列返回该索引上不同值的个数，而 TiDB 中的 `Cardinality` 列始终返回 `0`。

## 另请参阅

* [SHOW CREATE TABLE](/sql-statements/sql-statement-show-create-table.md)
* [DROP INDEX](/sql-statements/sql-statement-drop-index.md)
* [CREATE INDEX](/sql-statements/sql-statement-create-index.md)
