---
title: AUTO_INCREMENT
summary: Learn the `AUTO_INCREMENT` column attribute of TiDB.
aliases: ['/docs/dev/auto-increment/']
---

# AUTO_INCREMENT

This document introduces the `AUTO_INCREMENT` column attribute, including its concept, implementation principles, auto-increment related features, and restrictions.

<CustomContent platform="tidb">

> **Note:**
>
> The `AUTO_INCREMENT` attribute might cause hotspot in production environments. See [Troubleshoot HotSpot Issues](/troubleshoot-hot-spot-issues.md) for details. It is recommended to use [`AUTO_RANDOM`](/auto-random.md) instead.

</CustomContent>

<CustomContent platform="tidb-cloud">

> **Note:**
>
> The `AUTO_INCREMENT` attribute might cause hotspot in production environments. See [Troubleshoot HotSpot Issues](https://docs.pingcap.com/tidb/stable/troubleshoot-hot-spot-issues#handle-auto-increment-primary-key-hotspot-tables-using-auto_random) for details. It is recommended to use [`AUTO_RANDOM`](/auto-random.md) instead.

</CustomContent>

You can also use the `AUTO_INCREMENT` parameter in the [`CREATE TABLE`](/sql-statements/sql-statement-create-table.md) statement to specify the initial value of the increment field.

## Concept

`AUTO_INCREMENT` is a column attribute that is used to automatically fill in default column values. When the `INSERT` statement does not specify values for the `AUTO_INCREMENT` column, the system automatically assigns values to this column.

For performance reasons, `AUTO_INCREMENT` numbers are allocated in a batch of values (30 thousand by default) to each TiDB server. This means that while `AUTO_INCREMENT` numbers are guaranteed to be unique, values assigned to an `INSERT` statement will only be monotonic on a per TiDB server basis.

> **Note:**
>
> If you want the `AUTO_INCREMENT` numbers to be monotonic on all TiDB servers and your TiDB version is v6.5.0 or later, it is recommended to enable the [MySQL compatibility mode](#mysql-compatibility-mode).

The following is a basic example of `AUTO_INCREMENT`:


```sql
CREATE TABLE t(id int PRIMARY KEY AUTO_INCREMENT, c int);
```


```sql
INSERT INTO t(c) VALUES (1);
INSERT INTO t(c) VALUES (2);
INSERT INTO t(c) VALUES (3), (4), (5);
```

```sql
mysql> SELECT * FROM t;
+----+---+
| id | c |
+----+---+
| 1  | 1 |
| 2  | 2 |
| 3  | 3 |
| 4  | 4 |
| 5  | 5 |
+----+---+
5 rows in set (0.01 sec)
```

In addition, `AUTO_INCREMENT` also supports the `INSERT` statements that explicitly specify column values. In such cases, TiDB stores the explicitly specified values:


```sql
INSERT INTO t(id, c) VALUES (6, 6);
```

```sql
mysql> SELECT * FROM t;
+----+---+
| id | c |
+----+---+
| 1  | 1 |
| 2  | 2 |
| 3  | 3 |
| 4  | 4 |
| 5  | 5 |
| 6  | 6 |
+----+---+
6 rows in set (0.01 sec)
```

The usage above is the same as that of `AUTO_INCREMENT` in MySQL. However, in terms of the specific value that is implicitly assigned, TiDB differs from MySQL significantly.

## Implementation principles

TiDB implements the `AUTO_INCREMENT` implicit assignment in the following way:

For each auto-increment column, a globally visible key-value pair is used to record the maximum ID that has been assigned. In a distributed environment, communication between nodes has some overhead. Therefore, to avoid the issue of write amplification, each TiDB node applies for a batch of consecutive IDs as caches when assigning IDs, and then applies for the next batch of IDs after the first batch is assigned. Therefore, TiDB nodes do not apply to the storage node for IDs when assigning IDs each time. For example:

```sql
CREATE TABLE t(id int UNIQUE KEY AUTO_INCREMENT, c int);
```

Assume two TiDB instances, `A` and `B`, in the cluster. If you execute an `INSERT` statement on the `t` table on `A` and `B` respectively:

```sql
INSERT INTO t (c) VALUES (1)
```

Instance `A` might cache the auto-increment IDs of `[1,30000]`, and instance `B` might cache the auto-increment IDs of `[30001,60000]`. In `INSERT` statements to be executed, these cached IDs of each instance will be assigned to the `AUTO_INCREMENT` column as the default values.

## Basic Features

### Uniqueness

> **Warning:**
>
> When the cluster has multiple TiDB instances, if the table schema contains the auto-increment IDs, it is recommended not to use explicit insert and implicit assignment at the same time, which means using the default values of the auto-increment column and the custom values. Otherwise, it might break the uniqueness of implicitly assigned values.

In the example above, perform the following operations in order:

1. The client inserts a statement `INSERT INTO t VALUES (2, 1)` to instance `B`, which sets `id` to `2`. The statement is successfully executed.

2. The client sends a statement `INSERT INTO t (c) (1)` to instance `A`. This statement does not specify the value of `id`, so the ID is assigned by `A`. At present, because `A` caches the IDs of `[1, 30000]`, it might assign `2` as the value of the auto-increment ID, and increases the local counter by `1`. At this time, the data whose ID is `2` already exists in the database, so the `Duplicated Error` error is returned.

### Monotonicity

TiDB guarantees that `AUTO_INCREMENT` values are monotonic (always increasing) on a per-server basis. Consider the following example where consecutive `AUTO_INCREMENT` values of 1-3 are generated:


```sql
CREATE TABLE t (a int PRIMARY KEY AUTO_INCREMENT, b timestamp NOT NULL DEFAULT NOW());
INSERT INTO t (a) VALUES (NULL), (NULL), (NULL);
SELECT * FROM t;
```

```sql
Query OK, 0 rows affected (0.11 sec)

Query OK, 3 rows affected (0.02 sec)
Records: 3  Duplicates: 0  Warnings: 0

+---+---------------------+
| a | b                   |
+---+---------------------+
| 1 | 2020-09-09 20:38:22 |
| 2 | 2020-09-09 20:38:22 |
| 3 | 2020-09-09 20:38:22 |
+---+---------------------+
3 rows in set (0.00 sec)
```

Monotonicity is not the same guarantee as consecutive. Consider the following example:


```sql
CREATE TABLE t (id INT NOT NULL PRIMARY KEY auto_increment, a VARCHAR(10), cnt INT NOT NULL DEFAULT 1, UNIQUE KEY (a));
INSERT INTO t (a) VALUES ('A'), ('B');
SELECT * FROM t;
INSERT INTO t (a) VALUES ('A'), ('C') ON DUPLICATE KEY UPDATE cnt = cnt + 1;
SELECT * FROM t;
```

```sql
Query OK, 0 rows affected (0.00 sec)

Query OK, 2 rows affected (0.00 sec)
Records: 2  Duplicates: 0  Warnings: 0

+----+------+-----+
| id | a    | cnt |
+----+------+-----+
|  1 | A    |   1 |
|  2 | B    |   1 |
+----+------+-----+
2 rows in set (0.00 sec)

Query OK, 3 rows affected (0.00 sec)
Records: 2  Duplicates: 1  Warnings: 0

+----+------+-----+
| id | a    | cnt |
+----+------+-----+
|  1 | A    |   2 |
|  2 | B    |   1 |
|  4 | C    |   1 |
+----+------+-----+
3 rows in set (0.00 sec)
```

In this example, the `AUTO_INCREMENT` value of `3` is allocated for the `INSERT` of the key `A` in `INSERT INTO t (a) VALUES ('A'), ('C') ON DUPLICATE KEY UPDATE cnt = cnt + 1;` but never used because this `INSERT` statement contains a duplicate key `A`. This leads to a gap where the sequence is non-consecutive. This behavior is considered legal, even though it differs from MySQL. MySQL will also have gaps in the sequence in other scenarios such as transactions being aborted and rolled back.

## AUTO_ID_CACHE

The `AUTO_INCREMENT` sequence might appear to _jump_ dramatically if an `INSERT` operation is performed against a different TiDB server. This is caused by the fact that each server has its own cache of `AUTO_INCREMENT` values:


```sql
CREATE TABLE t (a int PRIMARY KEY AUTO_INCREMENT, b timestamp NOT NULL DEFAULT NOW());
INSERT INTO t (a) VALUES (NULL), (NULL), (NULL);
INSERT INTO t (a) VALUES (NULL);
SELECT * FROM t;
```

```sql
Query OK, 1 row affected (0.03 sec)

+---------+---------------------+
| a       | b                   |
+---------+---------------------+
|       1 | 2020-09-09 20:38:22 |
|       2 | 2020-09-09 20:38:22 |
|       3 | 2020-09-09 20:38:22 |
| 2000001 | 2020-09-09 20:43:43 |
+---------+---------------------+
4 rows in set (0.00 sec)
```

A new `INSERT` operation against the initial TiDB server generates the `AUTO_INCREMENT` value of `4`. This is because the initial TiDB server still has space left in the `AUTO_INCREMENT` cache for allocation. In this case, the sequence of values cannot be considered globally monotonic, because the value of `4` is inserted after the value of `2000001`:

```sql
mysql> INSERT INTO t (a) VALUES (NULL);
Query OK, 1 row affected (0.01 sec)

mysql> SELECT * FROM t ORDER BY b;
+---------+---------------------+
| a       | b                   |
+---------+---------------------+
|       1 | 2020-09-09 20:38:22 |
|       2 | 2020-09-09 20:38:22 |
|       3 | 2020-09-09 20:38:22 |
| 2000001 | 2020-09-09 20:43:43 |
|       4 | 2020-09-09 20:44:43 |
+---------+---------------------+
5 rows in set (0.00 sec)
```

The `AUTO_INCREMENT` cache does not persist across TiDB server restarts. The following `INSERT` statement is performed after the initial TiDB server is restarted:

```sql
mysql> INSERT INTO t (a) VALUES (NULL);
Query OK, 1 row affected (0.01 sec)

mysql> SELECT * FROM t ORDER BY b;
+---------+---------------------+
| a       | b                   |
+---------+---------------------+
|       1 | 2020-09-09 20:38:22 |
|       2 | 2020-09-09 20:38:22 |
|       3 | 2020-09-09 20:38:22 |
| 2000001 | 2020-09-09 20:43:43 |
|       4 | 2020-09-09 20:44:43 |
| 2030001 | 2020-09-09 20:54:11 |
+---------+---------------------+
6 rows in set (0.00 sec)
```

A high rate of TiDB server restarts might contribute to the exhaustion of `AUTO_INCREMENT` values. In the above example, the initial TiDB server still has values `[5-30000]` free in its cache. These values are lost, and will not be reallocated.

It is not recommended to rely on`AUTO_INCREMENT` values being continuous. Consider the following example, where a TiDB server has a cache of values `[2000001-2030000]`. By manually inserting the value `2029998`, you can see the behavior as a new cache range is retrieved:

```sql
mysql> INSERT INTO t (a) VALUES (2029998);
Query OK, 1 row affected (0.01 sec)

mysql> INSERT INTO t (a) VALUES (NULL);
Query OK, 1 row affected (0.01 sec)

mysql> INSERT INTO t (a) VALUES (NULL);
Query OK, 1 row affected (0.00 sec)

mysql> INSERT INTO t (a) VALUES (NULL);
Query OK, 1 row affected (0.02 sec)

mysql> INSERT INTO t (a) VALUES (NULL);
Query OK, 1 row affected (0.01 sec)

mysql> SELECT * FROM t ORDER BY b;
+---------+---------------------+
| a       | b                   |
+---------+---------------------+
|       1 | 2020-09-09 20:38:22 |
|       2 | 2020-09-09 20:38:22 |
|       3 | 2020-09-09 20:38:22 |
| 2000001 | 2020-09-09 20:43:43 |
|       4 | 2020-09-09 20:44:43 |
| 2030001 | 2020-09-09 20:54:11 |
| 2029998 | 2020-09-09 21:08:11 |
| 2029999 | 2020-09-09 21:08:11 |
| 2030000 | 2020-09-09 21:08:11 |
| 2060001 | 2020-09-09 21:08:11 |
| 2060002 | 2020-09-09 21:08:11 |
+---------+---------------------+
11 rows in set (0.00 sec)
```

After the value `2030000` is inserted, the next value is `2060001`. This jump in sequence is due to another TiDB server obtaining the intermediate cache range of `[2030001-2060000]`. When multiple TiDB servers are deployed, there will be gaps in the `AUTO_INCREMENT` sequence because cache requests are interleaved.

### Cache size control

In earlier versions of TiDB, the cache size of the auto-increment ID was transparent to users. Starting from v3.0.14, v3.1.2, and v4.0.rc-2, TiDB has introduced the `AUTO_ID_CACHE` table option to allow users to set the cache size for allocating the auto-increment ID.

```sql
CREATE TABLE t(a int AUTO_INCREMENT key) AUTO_ID_CACHE 100;
Query OK, 0 rows affected (0.02 sec)

INSERT INTO t values();
Query OK, 1 row affected (0.00 sec)

SELECT * FROM t;
+---+
| a |
+---+
| 1 |
+---+
1 row in set (0.01 sec)

SHOW CREATE TABLE t;
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                                                                             |
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| t     | CREATE TABLE `t` (
  `a` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`a`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=101 /*T![auto_id_cache] AUTO_ID_CACHE=100 */ |
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

At this time, if you restart TiDB, the auto-increment ID cache will be lost, and new insert operations will allocate IDs starting from a higher value beyond the previously cached range.

```sql
INSERT INTO t VALUES();
Query OK, 1 row affected (0.00 sec)

SELECT * FROM t;
+-----+
| a   |
+-----+
|   1 |
| 101 |
+-----+
2 rows in set (0.01 sec)
```

The newly allocated value is `101`. This shows that the size of cache for allocating auto-increment IDs is `100`.

In addition, when the length of consecutive IDs in a batch `INSERT` statement exceeds the length of `AUTO_ID_CACHE`, TiDB increases the cache size accordingly to ensure that the statement can insert data properly.

### Clear the auto-increment ID cache

In some scenarios, you might need to clear the auto-increment ID cache to ensure data consistency. For example:

<CustomContent platform="tidb">

- In the scenario of incremental replication using [Data Migration (DM)](/dm/dm-overview.md), once the replication is complete, data writing to the downstream TiDB switches from DM to your application's write operations. Meanwhile, the ID writing mode of the auto-increment column usually switches from explicit insertion to implicit allocation.
- After TiDB Lightning completes the data import, it automatically clears the auto-increment ID cache. However, TiCDC does not automatically clear the cache after incremental data synchronization. Therefore, you need to manually clear the auto-increment ID cache in the downstream cluster after stopping TiCDC, and before performing the failover.

</CustomContent>
<CustomContent platform="tidb-cloud">

- In the scenario of incremental replication using the [Data Migration](/tidb-cloud/migrate-incremental-data-from-mysql-using-data-migration.md) feature, once the replication is complete, data writing to the downstream TiDB switches from DM to your application's write operations. Meanwhile, the ID writing mode of the auto-increment column usually switches from explicit insertion to implicit allocation.
- After TiDB Lightning completes the data import, it automatically clears the auto-increment ID cache. However, TiCDC does not automatically clear the cache after incremental data synchronization. Therefore, you need to manually clear the auto-increment ID cache in the downstream cluster after stopping TiCDC, and before performing the failover.

</CustomContent>

- When your application involves both explicit ID insertion and implicit ID allocation, you need to clear the auto-increment ID cache to avoid conflicts between future implicitly allocated IDs and previously explicitly inserted IDs, which could result in primary key conflict errors. For more information, see [Uniqueness](/auto-increment.md#uniqueness).

To clear the auto-increment ID cache on all TiDB nodes in the cluster, you can execute the `ALTER TABLE` statement with `AUTO_INCREMENT = 0`. For example:

```sql
CREATE TABLE t(a int AUTO_INCREMENT key) AUTO_ID_CACHE 100;
Query OK, 0 rows affected (0.02 sec)

INSERT INTO t VALUES();
Query OK, 1 row affected (0.02 sec)

INSERT INTO t VALUES(50);
Query OK, 1 row affected (0.00 sec)

SELECT * FROM t;
+----+
| a  |
+----+
|  1 |
| 50 |
+----+
2 rows in set (0.01 sec)
```

```sql
ALTER TABLE t AUTO_INCREMENT = 0;
Query OK, 0 rows affected, 1 warning (0.07 sec)

SHOW WARNINGS;
+---------+------+-------------------------------------------------------------------------+
| Level   | Code | Message                                                                 |
+---------+------+-------------------------------------------------------------------------+
| Warning | 1105 | Can't reset AUTO_INCREMENT to 0 without FORCE option, using 101 instead |
+---------+------+-------------------------------------------------------------------------+
1 row in set (0.01 sec)

INSERT INTO t VALUES();
Query OK, 1 row affected (0.02 sec)

SELECT * FROM t;
+-----+
| a   |
+-----+
|   1 |
|  50 |
| 101 |
+-----+
3 rows in set (0.01 sec)
```

### Auto-increment step size and offset

Starting from v3.0.9 and v4.0.0-rc.1, similar to the behavior of MySQL, the value implicitly assigned to the auto-increment column is controlled by the `@@auto_increment_increment` and `@@auto_increment_offset` session variables.

The value (ID) implicitly assigned to auto-increment columns satisfies the following equation:

`(ID - auto_increment_offset) % auto_increment_increment == 0`

## MySQL compatibility mode

TiDB provides a MySQL-compatible mode for auto-increment columns that ensures strictly increasing IDs with minimal gaps. To enable this mode, set `AUTO_ID_CACHE` to `1` when creating a table:

```sql
CREATE TABLE t(a int AUTO_INCREMENT key) AUTO_ID_CACHE 1;
```

When `AUTO_ID_CACHE` is set to `1`, IDs are strictly increasing across all TiDB instances, each ID is guaranteed to be unique, and gaps between IDs are minimal compared to the default cache mode (`AUTO_ID_CACHE 0` with 30000 cached values).

For example, with `AUTO_ID_CACHE 1`, you might see a sequence as follows:

```sql
INSERT INTO t VALUES (); -- Returns ID 1
INSERT INTO t VALUES (); -- Returns ID 2
INSERT INTO t VALUES (); -- Returns ID 3
-- After failover
INSERT INTO t VALUES (); -- Might return ID 5
```

In contrast, with the default cache (`AUTO_ID_CACHE 0`), larger gaps can occur:

```sql
INSERT INTO t VALUES (); -- Returns ID 1
INSERT INTO t VALUES (); -- Returns ID 2
-- New TiDB instance allocates next batch
INSERT INTO t VALUES (); -- Returns ID 30001
```

While IDs are always increasing and without significant gaps like those seen with `AUTO_ID_CACHE 0`, small gaps in the sequence might still occur in the following scenarios. These gaps are necessary to maintain both uniqueness and the strictly increasing property of the IDs.

- During failover when the primary instance exits or crashes

    After you enable the MySQL compatibility mode, the allocated IDs are **unique** and **monotonically increasing**, and the behavior is almost the same as MySQL. Even when accessing across multiple TiDB instances, ID monotonicity is maintained. However, if the primary instance of the centralized service crashes, a few IDs might become non-continuous. This occurs because the secondary instance discards some IDs allocated by the primary instance during failover to ensure ID uniqueness.

- During rolling upgrades of TiDB nodes
- During normal concurrent transactions (similar to MySQL)

> **Note:**
>
> The behavior and performance of `AUTO_ID_CACHE 1` has evolved across TiDB versions:
>
> - Before v6.4.0, each ID allocation requires a TiKV transaction, which affects performance.
> - In v6.4.0, TiDB introduces a centralized allocating service that performs ID allocation as an in-memory operation, significantly improving performance.
> - Starting from v8.1.0, TiDB removes the automatic `forceRebase` operation during primary node exits to enable faster restarts. While this might result in additional non-consecutive IDs during failover, it prevents potential write blocking when many tables use `AUTO_ID_CACHE 1`.

## Restrictions

Currently, `AUTO_INCREMENT` has the following restrictions when used in TiDB:

- For TiDB v6.6.0 and earlier versions, the defined column must be either primary key or index prefixes.
- It must be defined on the column of `INTEGER`, `FLOAT`, or `DOUBLE` type.
- It cannot be specified on the same column with the `DEFAULT` column value.
- `ALTER TABLE` cannot be used to add or modify columns with the `AUTO_INCREMENT` attribute, including using `ALTER TABLE ... MODIFY/CHANGE COLUMN` to add the `AUTO_INCREMENT` attribute to an existing column, or using `ALTER TABLE ... ADD COLUMN` to add a column with the `AUTO_INCREMENT` attribute.
- `ALTER TABLE` can be used to remove the `AUTO_INCREMENT` attribute. However, starting from v2.1.18 and v3.0.4, TiDB uses the session variable `@@tidb_allow_remove_auto_inc` to control whether `ALTER TABLE MODIFY` or `ALTER TABLE CHANGE` can be used to remove the `AUTO_INCREMENT` attribute of a column. By default, you cannot use `ALTER TABLE MODIFY` or `ALTER TABLE CHANGE` to remove the `AUTO_INCREMENT` attribute.
- `ALTER TABLE` requires the `FORCE` option to set the `AUTO_INCREMENT` value to a smaller value.
- Setting the `AUTO_INCREMENT` to a value smaller than `MAX(<auto_increment_column>)` leads to duplicate keys because pre-existing values are not skipped.
