---
title: PREPARE
summary: TiDB 数据库中 PREPARE 的使用概况。
aliases: ['/docs-cn/dev/sql-statements/sql-statement-prepare/','/docs-cn/dev/reference/sql/statements/prepare/']
---

# PREPARE

`PREPARE` 语句为服务器端预处理语句提供 SQL 接口。

## 语法图

```ebnf+diagram
PreparedStmt ::=
    'PREPARE' Identifier 'FROM' PrepareSQL

PrepareSQL ::=
    stringLit
|   UserVariable
```

## 示例


```sql
PREPARE mystmt FROM 'SELECT ? as num FROM DUAL';
```

```
Query OK, 0 rows affected (0.00 sec)
```


```sql
SET @number = 5;
```

```
Query OK, 0 rows affected (0.00 sec)
```


```sql
EXECUTE mystmt USING @number;
```

```
+------+
| num  |
+------+
| 5    |
+------+
1 row in set (0.00 sec)
```


```sql
DEALLOCATE PREPARE mystmt;
```

```
Query OK, 0 rows affected (0.00 sec)
```

## MySQL 兼容性

`PREPARE` 语句与 MySQL 完全兼容。如发现任何兼容性差异，请尝试 [TiDB 支持资源](/support.md)。

## 另请参阅

* [EXECUTE](/sql-statements/sql-statement-execute.md)
* [DEALLOCATE](/sql-statements/sql-statement-deallocate.md)
