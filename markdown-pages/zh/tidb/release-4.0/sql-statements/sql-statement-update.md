---
title: UPDATE
summary: TiDB 数据库中 UPDATE 的使用概况。
aliases: ['/docs-cn/stable/sql-statements/sql-statement-update/','/docs-cn/v4.0/sql-statements/sql-statement-update/','/docs-cn/stable/reference/sql/statements/update/']
---

# UPDATE

`UPDATE` 语句用于修改指定表中的数据。

## 语法图

**UpdateStmt:**

![UpdateStmt](https://download.pingcap.com/images/docs-cn/sqlgram/UpdateStmt.png)

**PriorityOpt:**

![PriorityOpt](https://download.pingcap.com/images/docs-cn/sqlgram/PriorityOpt.png)

**TableRef:**

![TableRef](https://download.pingcap.com/images/docs-cn/sqlgram/TableRef.png)

**TableRefs:**

![TableRefs](https://download.pingcap.com/images/docs-cn/sqlgram/TableRefs.png)

**AssignmentList:**

![AssignmentList](https://download.pingcap.com/images/docs-cn/sqlgram/AssignmentList.png)

**WhereClauseOptional:**

![WhereClauseOptional](https://download.pingcap.com/images/docs-cn/sqlgram/WhereClauseOptional.png)

## 示例


```sql
CREATE TABLE t1 (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, c1 INT NOT NULL);
```

```
Query OK, 0 rows affected (0.11 sec)
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
UPDATE t1 SET c1=5 WHERE c1=3;
```

```
Query OK, 1 row affected (0.01 sec)
Rows matched: 1  Changed: 1  Warnings: 0
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
|  3 |  5 |
+----+----+
3 rows in set (0.00 sec)
```

## MySQL 兼容性

`UPDATE` 语句与 MySQL 完全兼容。如发现任何兼容性差异，请在 GitHub 上提交 [issue](https://github.com/pingcap/tidb/issues/new/choose)。

## 另请参阅

* [INSERT](/sql-statements/sql-statement-insert.md)
* [SELECT](/sql-statements/sql-statement-select.md)
* [DELETE](/sql-statements/sql-statement-delete.md)
* [REPLACE](/sql-statements/sql-statement-replace.md)
