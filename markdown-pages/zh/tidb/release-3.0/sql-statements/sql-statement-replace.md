---
title: REPLACE
summary: TiDB 数据库中 REPLACE 的使用概况。
aliases: ['/docs-cn/v3.0/sql-statements/sql-statement-replace/','/docs-cn/v3.0/reference/sql/statements/replace/']
---

# REPLACE

从语义上看，`REPLACE` 语句是 `DELETE` 语句和 `INSERT` 语句的结合，可用于简化应用程序代码。

## 语法图

**ReplaceIntoStmt:**

![ReplaceIntoStmt](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ReplaceIntoStmt.png)

**PriorityOpt:**

![PriorityOpt](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/PriorityOpt.png)

**IntoOpt:**

![IntoOpt](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/IntoOpt.png)

**TableName:**

![TableName](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/TableName.png)

**InsertValues:**

![InsertValues](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/InsertValues.png)

## 示例


```sql
CREATE TABLE t1 (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, c1 INT NOT NULL);
```

```
Query OK, 0 rows affected (0.12 sec)
```


```sql
INSERT INTO t1 (c1) VALUES (1), (2), (3);
```

```
Query OK, 3 rows affected (0.02 sec)
Records: 3  Duplicates: 0  Warnings: 0
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
+----+----+
3 rows in set (0.00 sec)
```


```sql
REPLACE INTO t1 (id, c1) VALUES(3, 99);
```

```
Query OK, 2 rows affected (0.01 sec)
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
|  3 | 99 |
+----+----+
3 rows in set (0.00 sec)
```

## MySQL 兼容性

`REPLACE` 语句与 MySQL 完全兼容。如发现任何兼容性差异，请在 GitHub 上提交 [issue](https://github.com/pingcap/tidb/issues/new/choose)。

## 另请参阅

* [DELETE](/sql-statements/sql-statement-delete.md)
* [INSERT](/sql-statements/sql-statement-insert.md)
* [SELECT](/sql-statements/sql-statement-select.md)
* [UPDATE](/sql-statements/sql-statement-update.md)
