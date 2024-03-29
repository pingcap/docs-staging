---
title: DEALLOCATE
summary: TiDB 数据库中 DEALLOCATE 的使用概况。
aliases: ['/docs-cn/dev/sql-statements/sql-statement-deallocate/','/docs-cn/dev/reference/sql/statements/deallocate/']
---

# DEALLOCATE

`DEALLOCATE` 语句用于为服务器端预处理语句提供 SQL 接口。

## 语法图

```ebnf+diagram
DeallocateStmt ::=
    DeallocateSym 'PREPARE' Identifier

DeallocateSym ::=
    'DEALLOCATE'
|   'DROP'

Identifier ::=
    identifier
|   UnReservedKeyword
|   NotKeywordToken
|   TiDBKeyword
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

`DEALLOCATE` 语句与 MySQL 完全兼容。如发现任何兼容性差异，请尝试 [TiDB 支持资源](/support.md)。

## 另请参阅

* [PREPARE](/sql-statements/sql-statement-prepare.md)
* [EXECUTE](/sql-statements/sql-statement-execute.md)
