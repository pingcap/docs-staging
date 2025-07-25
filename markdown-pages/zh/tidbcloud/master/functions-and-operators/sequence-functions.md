---
title: 序列函数
summary: 本文档介绍 TiDB 支持的序列函数。
---

# 序列函数

TiDB 中的序列函数用于返回或设置使用 [`CREATE SEQUENCE`](/sql-statements/sql-statement-create-sequence.md) 语句创建的序列对象的值。

| 函数名 | 描述 |
| :-------------- | :------------------------------------- |
| [`NEXTVAL()`](#nextval) | 返回序列的下一个值。 |
| [`NEXT VALUE FOR`](#next-value-for) | 返回序列的下一个值（`NEXTVAL()` 的别名）。 |
| [`SETVAL()`](#setval) | 设置序列的当前值。 |
| [`LASTVAL()`](#lastval) | 返回序列在当前会话中生成的最后一个值。 |

## `NEXTVAL()`

`NEXTVAL()` 函数返回序列的下一个值。

示例：

创建一个名为 `s1` 的序列：

```sql
CREATE SEQUENCE s1;
```

获取 `s1` 的下一个值：

```sql
SELECT NEXTVAL(s1);
```

输出如下：

```
+-------------+
| NEXTVAL(s1) |
+-------------+
|           1 |
+-------------+
1 row in set (0.00 sec)
```

## `NEXT VALUE FOR`

`NEXT VALUE FOR` 函数是 [`NEXTVAL()`](#nextval) 的别名。

示例：

使用 `NEXTVAL()` 获取 `s1` 的下一个值：

```sql
SELECT NEXTVAL(s1);
```

输出如下：

```
+-------------+
| NEXTVAL(s1) |
+-------------+
|           2 |
+-------------+
1 row in set (0.00 sec)
```

使用 `NEXT VALUE FOR` 获取 `s1` 的下一个值：

```sql
SELECT NEXT VALUE FOR s1;
```

输出如下：

```
+-------------------+
| NEXT VALUE FOR s1 |
+-------------------+
|                 3 |
+-------------------+
1 row in set (0.00 sec)
```

## `SETVAL()`

`SETVAL(n)` 函数设置序列的当前值。

示例：

获取 `s1` 的下一个值：

```sql
SELECT NEXTVAL(s1);
```

输出如下：

```
+-------------+
| NEXTVAL(s1) |
+-------------+
|           4 |
+-------------+
1 row in set (0.00 sec)
```

将 `s1` 的当前值设置为 `10`：

```sql
SELECT SETVAL(s1, 10);
```

输出如下：

```
+----------------+
| SETVAL(s1, 10) |
+----------------+
|             10 |
+----------------+
1 row in set (0.00 sec)
```

验证设置为 `10` 后的下一个值：

```sql
SELECT NEXTVAL(s1);
```

输出如下：

```
+-------------+
| NEXTVAL(s1) |
+-------------+
|          11 |
+-------------+
1 row in set (0.00 sec)
```

## `LASTVAL()`

`LASTVAL()` 函数返回序列在**当前会话**中生成的最后一个值。

示例：

获取 `s1` 在当前会话中生成的最后一个值：

```sql
SELECT LASTVAL(s1);
```

输出如下：

```
+-------------+
| LASTVAL(s1) |
+-------------+
|          11 |
+-------------+
1 row in set (0.00 sec)
```

## MySQL 兼容性

MySQL 不支持 [ISO/IEC 9075-2](https://www.iso.org/standard/76584.html) 中定义的用于创建和操作序列的函数和语句。
