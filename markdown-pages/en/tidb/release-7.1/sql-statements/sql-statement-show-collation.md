---
title: SHOW COLLATION | TiDB SQL Statement Reference
summary: An overview of the usage of SHOW COLLATION for the TiDB database.
---

# SHOW COLLATION

This statement provides a static list of collations, and is included to provide compatibility with MySQL client libraries.

> **Note:**
>
> Results of `SHOW COLLATION` vary when the ["new collation framework"](/character-set-and-collation.md#new-framework-for-collations) is enabled. For new collation framework details, refer to [Character Set and Collation](/character-set-and-collation.md).

## Synopsis

**ShowCollationStmt:**

![ShowCollationStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowCollationStmt.png)

## Examples

When new collation framework is disabled, only binary collations are displayed.

```sql
mysql> SHOW COLLATION;
+-------------+---------+------+---------+----------+---------+
| Collation   | Charset | Id   | Default | Compiled | Sortlen |
+-------------+---------+------+---------+----------+---------+
| utf8mb4_bin | utf8mb4 |   46 | Yes     | Yes      |       1 |
| latin1_bin  | latin1  |   47 | Yes     | Yes      |       1 |
| binary      | binary  |   63 | Yes     | Yes      |       1 |
| ascii_bin   | ascii   |   65 | Yes     | Yes      |       1 |
| utf8_bin    | utf8    |   83 | Yes     | Yes      |       1 |
+-------------+---------+------+---------+----------+---------+
5 rows in set (0.02 sec)
```

When new collation framework is enabled, `utf8_general_ci` and `utf8mb4_general_ci` are additionally supported.

```sql
mysql> SHOW COLLATION;
+--------------------+---------+------+---------+----------+---------+
| Collation          | Charset | Id   | Default | Compiled | Sortlen |
+--------------------+---------+------+---------+----------+---------+
| ascii_bin          | ascii   |   65 | Yes     | Yes      |       1 |
| binary             | binary  |   63 | Yes     | Yes      |       1 |
| gbk_bin            | gbk     |   87 |         | Yes      |       1 |
| gbk_chinese_ci     | gbk     |   28 | Yes     | Yes      |       1 |
| latin1_bin         | latin1  |   47 | Yes     | Yes      |       1 |
| utf8_bin           | utf8    |   83 | Yes     | Yes      |       1 |
| utf8_general_ci    | utf8    |   33 |         | Yes      |       1 |
| utf8_unicode_ci    | utf8    |  192 |         | Yes      |       1 |
| utf8mb4_bin        | utf8mb4 |   46 | Yes     | Yes      |       1 |
| utf8mb4_general_ci | utf8mb4 |   45 |         | Yes      |       1 |
| utf8mb4_unicode_ci | utf8mb4 |  224 |         | Yes      |       1 |
+--------------------+---------+------+---------+----------+---------+
11 rows in set (0.001 sec)
```

## MySQL compatibility

The usage of the `SHOW COLLATION` statement in TiDB is fully compatible with MySQL. However, charsets in TiDB might have different default collations compared with MySQL. For details, refer to [Compatibility with MySQL](/mysql-compatibility.md). If you find any compatibility differences, [report a bug](https://docs.pingcap.com/tidb/stable/support).

## See also

* [SHOW CHARACTER SET](/sql-statements/sql-statement-show-character-set.md)
* [Character Set and Collation](/character-set-and-collation.md)
