---
title: DROP SEQUENCE
summary: TiDB 数据库中 DROP SEQUENCE 的使用概况。
---

# DROP SEQUENCE

`DROP SEQUENCE` 语句用于删除序列对象。

## 语法图

```ebnf+diagram
DropSequenceStmt ::=
    'DROP' 'SEQUENCE' IfExists TableNameList

IfExists ::= ( 'IF' 'EXISTS' )?

TableNameList ::=
    TableName ( ',' TableName )*

TableName ::=
    Identifier ('.' Identifier)?
```

## 示例


```sql
DROP SEQUENCE seq;
```

```
Query OK, 0 rows affected (0.10 sec)
```


```sql
DROP SEQUENCE seq, seq2;
```

```
Query OK, 0 rows affected (0.03 sec)
```

## MySQL 兼容性

该语句是 TiDB 的扩展，序列的实现借鉴自 MariaDB。

## 另请参阅

* [CREATE SEQUENCE](/sql-statements/sql-statement-create-sequence.md)
* [ALTER SEQUENCE](/sql-statements/sql-statement-alter-sequence.md)
* [SHOW CREATE SEQUENCE](/sql-statements/sql-statement-show-create-sequence.md)
