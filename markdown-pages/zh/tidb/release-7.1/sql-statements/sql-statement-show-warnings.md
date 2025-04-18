---
title: SHOW WARNINGS
summary: TiDB 数据库中 SHOW WARNINGS 的使用概况。
---

# SHOW WARNINGS

`SHOW WARNINGS` 语句用于显示当前客户端连接中已执行语句的报错列表。与在 MySQL 中一样，`sql_mode` 极大地影响哪些语句会导致错误与警告。

## 语法图

**ShowWarningsStmt:**

![ShowWarningsStmt](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ShowWarningsStmt.png)

## 示例


```sql
CREATE TABLE t1 (a INT UNSIGNED);
```

```
Query OK, 0 rows affected (0.11 sec)
```


```sql
INSERT INTO t1 VALUES (0);
```

```
Query OK, 1 row affected (0.02 sec)
```


```sql
SELECT 1/a FROM t1;
```

```
+------+
| 1/a  |
+------+
| NULL |
+------+
1 row in set, 1 warning (0.00 sec)
```


```sql
SHOW WARNINGS;
```

```
+---------+------+---------------+
| Level   | Code | Message       |
+---------+------+---------------+
| Warning | 1365 | Division by 0 |
+---------+------+---------------+
1 row in set (0.00 sec)
```


```sql
INSERT INTO t1 VALUES (-1);
```

```
ERROR 1264 (22003): Out of range value for column 'a' at row 1
```


```sql
SELECT * FROM t1;
```

```
+------+
| a    |
+------+
|    0 |
+------+
1 row in set (0.00 sec)
```


```sql
SET sql_mode='';
```

```
Query OK, 0 rows affected (0.00 sec)
```


```sql
INSERT INTO t1 VALUES (-1);
```

```
Query OK, 1 row affected, 1 warning (0.01 sec)
```


```sql
SHOW WARNINGS;
```

```
+---------+------+---------------------------+
| Level   | Code | Message                   |
+---------+------+---------------------------+
| Warning | 1690 | constant -1 overflows int |
+---------+------+---------------------------+
1 row in set (0.00 sec)
```


```sql
SELECT * FROM t1;
```

```
+------+
| a    |
+------+
|    0 |
|    0 |
+------+
2 rows in set (0.00 sec)
```

## MySQL 兼容性

`SHOW WARNINGS` 语句与 MySQL 完全兼容。如发现任何兼容性差异，请尝试 [TiDB 支持资源](/support.md)。

## 另请参阅

* [SHOW ERRORS](/sql-statements/sql-statement-show-errors.md)
