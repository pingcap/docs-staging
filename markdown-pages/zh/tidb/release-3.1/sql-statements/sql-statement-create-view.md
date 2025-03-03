---
title: CREATE VIEW
summary: TiDB 数据库中 CREATE VIEW 的使用概况。
aliases: ['/docs-cn/v3.1/sql-statements/sql-statement-create-view/','/docs-cn/v3.1/reference/sql/statements/create-view/']
---

# CREATE VIEW

使用 `CREATE VIEW` 语句将 `SELECT` 语句保存为类似于表的可查询对象。TiDB 中的视图是非物化的，这意味着在查询视图时，TiDB 将在内部重写查询，以将视图定义与 SQL 查询结合起来。

## 语法图

**CreateViewStmt:**

![CreateViewStmt](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/CreateViewStmt.png)

**OrReplace:**

![OrReplace](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/OrReplace.png)

**ViewAlgorithm:**

![ViewAlgorithm](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ViewAlgorithm.png)

**ViewDefiner:**

![ViewDefiner](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ViewDefiner.png)

**ViewSQLSecurity:**

![ViewSQLSecurity](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ViewSQLSecurity.png)

**ViewName:**

![ViewName](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ViewName.png)

**ViewFieldList:**

![ViewFieldList](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ViewFieldList.png)

**ViewCheckOption:**

![ViewCheckOption](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ViewCheckOption.png)

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
INSERT INTO t1 (c1) VALUES (6);
```

```
Query OK, 1 row affected (0.01 sec)
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
|  6 |  6 |
+----+----+
4 rows in set (0.00 sec)
```


```sql
INSERT INTO v1 (c1) VALUES (7);
```

```
ERROR 1105 (HY000): insert into view v1 is not supported now.
```

## MySQL 兼容性

* 目前 TiDB 中的视图不可插入且不可更新。

## 另请参阅

* [CREATE TABLE](/sql-statements/sql-statement-create-table.md)
* [SHOW CREATE TABLE](/sql-statements/sql-statement-show-create-table.md)
* [DROP TABLE](/sql-statements/sql-statement-drop-table.md)
