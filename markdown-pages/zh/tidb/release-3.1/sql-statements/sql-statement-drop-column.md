---
title: DROP COLUMN
summary: TiDB 数据库中 DROP COLUMN 的使用概况。
aliases: ['/docs-cn/v3.1/sql-statements/sql-statement-drop-column/','/docs-cn/v3.1/reference/sql/statements/drop-column/']
---

# DROP COLUMN

`DROP COLUMN` 语句用于从指定的表中删除列。在 TiDB 中，`COLUMN` 为在线操作，不会阻塞表中的数据读写。

## 语法图

**AlterTableStmt:**

![AlterTableStmt](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/AlterTableStmt.png)

**AlterTableSpec:**

![AlterTableSpec](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/AlterTableSpec.png)

**ColumnKeywordOpt:**

![ColumnKeywordOpt](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ColumnKeywordOpt.png)

**ColumnName:**

![ColumnName](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ColumnName.png)

## 示例


```sql
CREATE TABLE t1 (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, col1 INT NOT NULL, col2 INT NOT NULL);
```

```
Query OK, 0 rows affected (0.12 sec)
```


```sql
INSERT INTO t1 (col1,col2) VALUES (1,1),(2,2),(3,3),(4,4),(5,5);
```

```
Query OK, 5 rows affected (0.02 sec)
Records: 5  Duplicates: 0  Warnings: 0
```


```sql
SELECT * FROM t1;
```

```
+----+------+------+
| id | col1 | col2 |
+----+------+------+
|  1 |    1 |    1 |
|  2 |    2 |    2 |
|  3 |    3 |    3 |
|  4 |    4 |    4 |
|  5 |    5 |    5 |
+----+------+------+
5 rows in set (0.01 sec)
```


```sql
ALTER TABLE t1 DROP COLUMN col1, DROP COLUMN col2;
```

```
ERROR 1105 (HY000): can't run multi schema change
```


```sql
SELECT * FROM t1;
```

```
+----+------+------+
| id | col1 | col2 |
+----+------+------+
|  1 |    1 |    1 |
|  2 |    2 |    2 |
|  3 |    3 |    3 |
|  4 |    4 |    4 |
|  5 |    5 |    5 |
+----+------+------+
5 rows in set (0.00 sec)
```


```sql
ALTER TABLE t1 DROP COLUMN col1;
```

```
Query OK, 0 rows affected (0.27 sec)
```


```sql
SELECT * FROM t1;
```

```
+----+------+
| id | col2 |
+----+------+
|  1 |    1 |
|  2 |    2 |
|  3 |    3 |
|  4 |    4 |
|  5 |    5 |
+----+------+
5 rows in set (0.00 sec)
```

## MySQL 兼容性

* 不支持使用相同语句删除多个列。

## 另请参阅

* [ADD COLUMN](/sql-statements/sql-statement-add-column.md)
* [SHOW CREATE TABLE](/sql-statements/sql-statement-show-create-table.md)
* [CREATE TABLE](/sql-statements/sql-statement-create-table.md)
