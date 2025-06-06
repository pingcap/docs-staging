---
title: GBK
summary: This document provides details about the TiDB support of the GBK character set.
---

# GBK

Starting from v5.4.0, TiDB supports the GBK character set. This document provides the TiDB support and compatibility information of the GBK character set.

Starting from v6.0.0, TiDB enables the [new framework for collations](/character-set-and-collation.md#new-framework-for-collations) by default. The default collation for TiDB GBK character set is `gbk_chinese_ci`, which is consistent with MySQL.

```sql
SHOW CHARACTER SET WHERE CHARSET = 'gbk';
+---------+-------------------------------------+-------------------+--------+
| Charset | Description                         | Default collation | Maxlen |
+---------+-------------------------------------+-------------------+--------+
| gbk     | Chinese Internal Code Specification | gbk_chinese_ci    |      2 |
+---------+-------------------------------------+-------------------+--------+
1 row in set (0.00 sec)

SHOW COLLATION WHERE CHARSET = 'gbk';
+----------------+---------+------+---------+----------+---------+
| Collation      | Charset | Id   | Default | Compiled | Sortlen |
+----------------+---------+------+---------+----------+---------+
| gbk_bin        | gbk     |   87 |         | Yes      |       1 |
| gbk_chinese_ci | gbk     |   28 | Yes     | Yes      |       1 |
+----------------+---------+------+---------+----------+---------+
2 rows in set (0.00 sec)
```

## MySQL compatibility

This section provides the compatibility information between MySQL and TiDB.

### Collations

<CustomContent platform="tidb">

The default collation of the GBK character set in MySQL is `gbk_chinese_ci`. The default collation for the GBK character set in TiDB depends on the value of the TiDB configuration item [`new_collations_enabled_on_first_bootstrap`](/tidb-configuration-file.md#new_collations_enabled_on_first_bootstrap):

- By default, the TiDB configuration item [`new_collations_enabled_on_first_bootstrap`](/tidb-configuration-file.md#new_collations_enabled_on_first_bootstrap) is set to `true`, which means that the [new framework for collations](/character-set-and-collation.md#new-framework-for-collations) is enabled and the default collation for the GBK character set is `gbk_chinese_ci`.
- When the TiDB configuration item [`new_collations_enabled_on_first_bootstrap`](/tidb-configuration-file.md#new_collations_enabled_on_first_bootstrap) is set to `false`, the [new framework for collations](/character-set-and-collation.md#new-framework-for-collations) is disabled, and the default collation for the GBK character set is `gbk_bin`.

</CustomContent>

<CustomContent platform="tidb-cloud">

By default, TiDB Cloud enables the [new framework for collations](/character-set-and-collation.md#new-framework-for-collations) and the default collation for the GBK character set is `gbk_chinese_ci`.

</CustomContent>

Additionally, because TiDB converts GBK to `utf8mb4` and then uses a binary collation, the `gbk_bin` collation in TiDB is not the same as the `gbk_bin` collation in MySQL.

### Illegal character compatibility

* If the system variables [`character_set_client`](/system-variables.md#character_set_client) and [`character_set_connection`](/system-variables.md#character_set_connection) are not set to `gbk` at the same time, TiDB handles illegal characters in the same way as MySQL.
* If `character_set_client` and `character_set_connection` are both set to `gbk`, TiDB handles illegal characters differently than MySQL.

    - MySQL handles illegal GBK character sets in reading and writing operations differently.
    - TiDB handles illegal GBK character sets in reading and writing operations in the same way. In the SQL strict mode, TiDB reports an error when either reading or writing illegal GBK characters. In the non-strict mode, TiDB replaces illegal GBK characters with `?` when either reading or writing illegal GBK characters.

For example, after `SET NAMES gbk`, if you create a table using the `CREATE TABLE gbk_table(a VARCHAR(32) CHARACTER SET gbk)` statement in MySQL and TiDB respectively and then execute the SQL statements in the following table, you can see the detailed differences.

| Database    |    If the configured SQL mode contains either `STRICT_ALL_TABLES` or `STRICT_TRANS_TABLES`                                               | If the configured SQL mode contains neither `STRICT_ALL_TABLES` nor `STRICT_TRANS_TABLES`                                                                     |
|-------|-------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| MySQL | `SELECT HEX('一a');` <br /> `e4b88061`<br /><br />`INSERT INTO gbk_table values('一a');`<br /> `Incorrect Error`       | `SELECT HEX('一a');` <br /> `e4b88061`<br /><br />`INSERT INTO gbk_table VALUES('一a');`<br />`SELECT HEX(a) FROM gbk_table;`<br /> `e4b8` |
| TiDB  | `SELECT HEX('一a');` <br /> `Incorrect Error`<br /><br />`INSERT INTO gbk_table VALUES('一a');`<br /> `Incorrect Error` | `SELECT HEX('一a');` <br /> `e4b83f`<br /><br />`INSERT INTO gbk_table VALUES('一a');`<br />`SELECT HEX(a) FROM gbk_table;`<br /> `e4b83f`  |

In the above table, the result of `SELECT HEX('a');` in the `utf8mb4` byte set is `e4b88061`.

### Other MySQL compatibility

- Currently, TiDB does not support using the `ALTER TABLE` statement to convert other character set types to `gbk` or from `gbk` to other character set types.

* TiDB does not support the use of `_gbk`. For example:

  ```sql
  CREATE TABLE t(a CHAR(10) CHARSET BINARY);
  Query OK, 0 rows affected (0.00 sec)
  INSERT INTO t VALUES (_gbk'啊');
  ERROR 1115 (42000): Unsupported character introducer: 'gbk'
  ```

- Currently, for binary characters of the `ENUM` and `SET` types, TiDB deals with them as the `utf8mb4` character set.

## Component compatibility

- Currently, TiFlash does not support the GBK character set.

- TiDB Data Migration (DM) does not support migrating `charset=GBK` tables to TiDB clusters earlier than v5.4.0.

- TiDB Lightning does not support importing `charset=GBK` tables to TiDB clusters earlier than v5.4.0.

- TiCDC versions earlier than v6.1.0 do not support replicating `charset=GBK` tables. No version of TiCDC supports replicating `charset=GBK` tables to TiDB clusters earlier than v6.1.0.

- Backup & Restore (BR) versions earlier than v5.4.0 do not support recovering `charset=GBK` tables. No version of BR supports recovering `charset=GBK` tables to TiDB clusters earlier than v5.4.0.
