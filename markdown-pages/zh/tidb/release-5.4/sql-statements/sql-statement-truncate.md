---
title: TRUNCATE
summary: TiDB 数据库中 TRUNCATE 的使用概况。
---

# TRUNCATE

`TRUNCATE` 语句以非事务方式从表中删除所有数据。可认为 `TRUNCATE` 语句同 `DROP TABLE` + `CREATE TABLE` 组合在语义上相同，定义与 `DROP TABLE` 语句相同。

`TRUNCATE TABLE tableName` 和 `TRUNCATE tableName` 均为有效语法。

## 语法图

**TruncateTableStmt:**

![TruncateTableStmt](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/TruncateTableStmt.png)

**OptTable:**

![OptTable](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/OptTable.png)

**TableName:**

![TableName](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/TableName.png)

## 示例


```sql
CREATE TABLE t1 (a INT NOT NULL PRIMARY KEY);
```

```
Query OK, 0 rows affected (0.11 sec)
```


```sql
INSERT INTO t1 VALUES (1),(2),(3),(4),(5);
```

```
Query OK, 5 rows affected (0.01 sec)
Records: 5  Duplicates: 0  Warnings: 0
```


```sql
SELECT * FROM t1;
```

```
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
```


```sql
TRUNCATE t1;
```

```
Query OK, 0 rows affected (0.11 sec)
```


```sql
SELECT * FROM t1;
```

```
Empty set (0.00 sec)
```


```sql
INSERT INTO t1 VALUES (1),(2),(3),(4),(5);
```

```
Query OK, 5 rows affected (0.01 sec)
Records: 5  Duplicates: 0  Warnings: 0
```


```sql
TRUNCATE TABLE t1;
```

```
Query OK, 0 rows affected (0.11 sec)
```

## MySQL 兼容性

`TRUNCATE` 语句与 MySQL 完全兼容。如发现任何兼容性差异，请在 GitHub 上提交 [issue](https://github.com/pingcap/tidb/issues/new/choose)。

## 另请参阅

* [DROP TABLE](/sql-statements/sql-statement-drop-table.md)
* [DELETE](/sql-statements/sql-statement-delete.md)
* [CREATE TABLE](/sql-statements/sql-statement-create-table.md)
* [SHOW CREATE TABLE](/sql-statements/sql-statement-show-create-table.md)
