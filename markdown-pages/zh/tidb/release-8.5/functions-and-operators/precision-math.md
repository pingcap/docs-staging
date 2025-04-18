---
title: 精度数学
summary: TiDB 中的精确数值运算与 MySQL 基本一致。精确数值运算包括整型和 DECIMAL 类型，以及精确值数字字面量。DECIMAL 数据类型是定点数类型，其运算是精确计算。在表达式计算中，TiDB 会尽可能不做任何修改的使用每个输入的数值。数值修约时，`round()` 函数将使用四舍五入的规则。向 DECIMAL 或整数类型列插入数据时，round 的规则将采用 round half away from zero 的方式。
---

# 精度数学

TiDB 中精度数学计算与 MySQL 中基本一致。详情请参见：[Precision Math](https://dev.mysql.com/doc/refman/8.0/en/precision-math.html)

- 数值类型
- DECIMAL 数据类型的特性

## 数值类型

精确数值运算的范围包括精确值数据类型（整型和 DECIMAL 类型），以及精确值数字字面量。近似值数据类型和近似值数字字面量被作为浮点数来处理。

精确值数字字面量包含整数部分或小数部分，或二者都包含。精确值数字字面量可以包含符号位。例如：`1`, `.2`, `3.4`, `-5`, `-6.78`, `+9.10`。

近似值数字字面量以一个包含尾数和指数的科学计数法表示（基数为 10）。其中尾数和指数可以分别或同时带有符号位。例如：`1.2E3`, `1.2E-3`, `-1.2E3`, `-1.2E-3`。

两个看起来相似的数字可能会被以不同的方式进行处理。例如：`2.34` 是精确值（定点数），而 `2.3E0` 是近似值（浮点数）。

DECIMAL 数据类型是定点数类型，其运算是精确计算。FLOAT 和 DOUBLE 数据类型是浮点类型，其运算是近似计算。

## DECIMAL 数据类型的特性

本节讨论 DECIMAL 数据类型的特性，主要涉及以下几点：

1. 最大位数
2. 存储格式
3. 存储要求

DECIMAL 列的声明语法为 DECIMAL(M, D)。其中参数值意义及其范围如下：

- M 表示最大的数字位数（精度），1<= M <= 65。
- D 表示小数点右边数字的位数（标度）。1 <= D <= 30 且不大于 M。

M 的最大值 65 表示 DECIMAL 值的计算精确到 65 位数字。该精度同样适用于其精确值字面量。

DECIMAL 列的值采用二进制进行存储，其将每 9 位十进制数字包装成 4 个字节。其中整数和小数部分分别确定所需的存储空间。如果数字位数为 9 的倍数，则每 9 位十进制数字各采用 4 个字节进行存储，对于剩余不足 9 位的数字，所需的存储空间如下表所示

| 剩余数字位数 | 存储所需字节数 |
| --- | --- |
| 0   | 0 |
| 1–2 | 1 |
| 3–4 | 2 |
| 5–6 | 3 |
| 7–9 | 4 |

例如：

+ 定义类型为 DECIMAL(18, 9) 的列，其小数点两侧均各包含 9 位十进制数字。因此，分别需要 4 个字节的存储空间。 

+ 定义类型为 DECIMAL(20, 6) 的列，其小数部分包含 6 位十进制数字，整数部分包含 14 位十进制数字。整数部分中 9 位数字需要 4 个字节进行存储，其余 5 位数字需要 3 个字节进行存储。小数部分 6 位数字需要 3 个字节进行存储。

DECIMAL 列不存储前导的字符 `+` 或字符 `-` 或数字 `0`。如果将 `+0003.1` 插入到 DECIMAL(5, 1) 列中，则将其存储为 `3.1`。对于负数，不存储字符 `-` 的字面值。

DECIMAL 列不允许插入大于列定义的隐含范围的值。例如：DECIMAL(3, 0) 列范围为`-999` 到 `999`。DECIMAL(M, D) 列小数点左边部分最多支持 M-D 位数字。

有关 DECIMAL 值的内部格式完整说明，请参阅 TiDB 源码文件 [`types/mydecimal.go`](https://github.com/pingcap/tidb/blob/release-8.5/pkg/types/mydecimal.go)。

## 表达式计算

在涉及精度数学计算的表达式中，TiDB 会尽可能不做任何修改的使用每个输入的数值。比如：在计算比较函数时，参与运算的数字将不做任何改变。在严格 SQL 模式下，向一个数据列插入一个值时，如果该值处于这一列的值域范围内，这个值将直接不做任何修改的直接插入进去，提取这个值的时候，取得的值和插入的值将会是同一个值。当处于非严格 SQL 模式时，TiDB 会允许数据插入过程中发生的数据截断。

处理数值类型表达式取决于这个表达式参数的具体值：

* 当表达式参数中包含近似值时，这个表达式的结果也是近似值，TiDB 会使用浮点数对应的计算逻辑返回一个浮点数的结果。
* 当表达式参数中不包含任何近似值时（也就是说表达式的参数全部是精确值），如果某个精确值包含小数部分，TIDB 会对这个表达式使用 `DECIMAL` 对应的计算逻辑，返回一个 `DECIMAL` 的结果，精确到 65 位数字。
* 其他情况下，表达式只会包含整数参数，这个表达式的结果也是精确的，TiDB 会使用整数对应的计算逻辑返回一个整数结果，精度和 `BIGINT` 保持一致（64 位）。

如果数值类型表达式中包含字符串参数，这些字符串参数将被转换成双精度浮点数，这个表达式的计算结果将是个近似值。

向一个数值类型列插入数据的具体行为会受到 SQL 模式的影响。接下来的讨论将围绕严格模式以及 `ERROR_FOR_DIVISION_BY_ZERO` 模式展开，如果要打开所有的限制，可以简单的使用 `TRADITIONAL` 模式，这个模式将同时使用严格模式以及 `ERROR_FOR_DIVISION_BY_ZERO` 模式：


```sql
SET sql_mode = 'TRADITIONAL';
```

向一个具有精确值类型（`DECIMAL` 或者整数类型）的列插入数据时，如果插入的数据位于该列的值域范围内将使用该数据的精确值。如果该数据的小数部分太长，将会发生数值修约，这时会有 warning 产生，具体内容可以看"数值修约"。

如果该数据整数部分太长：

* 如果没有开启严格模式，这个值会被截断并产生一个 warning。
* 如果开启了严格模式，将会产生一个数据溢出的 error。

如果向一个数值类型列插入字符串，如果该字符串中包含非数值部分，TiDB 将这样做类型转换：

* 在严格模式下，没有以数字开头的字符串（即使是一个空字符串）不能被被用作数字值并会返回一个 error 或者是 warning。
* 以数字开头的字符串可以被转换，不过末尾的非数字部分会被截断。如果被截断的部分包含的不全是空格，在严格模式下这回产生一个 error 或者 warning。

默认情况下，如果计算的过程中发生了除数是 0 的现象将会得到一个 `NULL` 结果，并且不会有 warning 产生。通过设置适当的 SQL 模式，除以 0 的操作可以被限制。当设置 `ERROR_FOR_DIVISION_BY_ZERO` SQL 模式时，TiDB 的行为是：

* 如果设置了严格 SQL 模式，`INSERT` 和 `UPDATE` 的过程中如果发生了除以 0 的操作，正在进行的 `INSERT` 或者 `UPDATE` 操作会被禁止，并且会返回一个 error。
* 如果没有设置严格 SQL 模式，除以 0 的操作仅会返回一个 warning。

假设我们有如下的 SQL 语句：


```sql
INSERT INTO t SET i = 1/0;
```

不同的 SQL 模式将会导致不同的结果如下：

| `sql_mode` 的值 | 结果 |
| :--- | :--- |
| '' | 没有 warning，没有 error，i 被设为 NULL |
| strict | 没有 warning，没有 error，i 被设为 NULL |
| `ERROR_FOR_DIVISION_BY_ZERO` | 有 warning，没有 error，i 被设为 NULL |
| strict, `ERROR_FOR_DIVISION_BY_ZERO` | 有 error，插入失败 |

## 数值修约

`round()` 函数的结果取决于他的参数是否是精确值：

* 如果参数是精确值，`round()` 函数将使用四舍五入的规则。
* 如果参数是一个近似值，`round()` 表达式的结果可能和 MySQL 不太一样。


```sql
SELECT ROUND(2.5), ROUND(25E-1);
```

```
+------------+--------------+
| ROUND(2.5) | ROUND(25E-1) |
+------------+--------------+
|          3 |            3 |
+------------+--------------+
1 row in set (0.00 sec)
```

向一个 `DECIMAL` 或者整数类型列插入数据时，round 的规则将采用 [round half away from zero](https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero) 的方式：


```sql
CREATE TABLE t (d DECIMAL(10,0));
```

```
Query OK, 0 rows affected (0.01 sec)
```


```sql
INSERT INTO t VALUES(2.5),(2.5E0);
```

```
Query OK, 2 rows affected, 2 warnings (0.00 sec)
```


```sql
SELECT d FROM t;
```

```
+------+
| d    |
+------+
|    3 |
|    3 |
+------+
2 rows in set (0.00 sec)
```
