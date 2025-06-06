---
title: AUTO_INCREMENT
summary: 介绍 TiDB 的 `AUTO_INCREMENT` 列属性。
---

# AUTO_INCREMENT

本文介绍列属性 `AUTO_INCREMENT` 的基本概念、实现原理、自增相关的特性，以及使用限制。

> **注意：**
>
> 使用 `AUTO_INCREMENT` 可能会给生产环境带热点问题，因此推荐使用 [`AUTO_RANDOM`](/auto-random.md) 代替。详情请参考 [TiDB 热点问题处理](/troubleshoot-hot-spot-issues.md#tidb-热点问题处理)。

在 [`CREATE TABLE`](/sql-statements/sql-statement-create-table.md) 语句中也可以使用 `AUTO_INCREMENT` 参数来指定自增字段的初始值。

## 基本概念

`AUTO_INCREMENT` 是用于自动填充缺省列值的列属性。当 `INSERT` 语句没有指定 `AUTO_INCREMENT` 列的具体值时，系统会自动地为该列分配一个值。

出于性能原因，自增编号是系统批量分配给每台 TiDB 服务器的值（默认 3 万个值），因此自增编号能保证唯一性，但分配给 `INSERT` 语句的值仅在单台 TiDB 服务器上具有单调性。

> **注意：**
>
> 如果要求自增编号在所有 TiDB 实例上具有单调性，并且你的 TiDB 版本在 v6.5.0 及以上，推荐使用[兼容 MySQL 的自增列模式](#兼容-mysql-的自增列模式)。


```sql
CREATE TABLE t(id int PRIMARY KEY AUTO_INCREMENT, c int);
```


```sql
INSERT INTO t(c) VALUES (1);
INSERT INTO t(c) VALUES (2);
INSERT INTO t(c) VALUES (3), (4), (5);
```

```sql
SELECT * FROM t;
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

此外，`AUTO_INCREMENT` 还支持显式指定列值的插入语句，此时 TiDB 会保存显式指定的值：


```sql
INSERT INTO t(id, c) VALUES (6, 6);
```

```sql
SELECT * FROM t;
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

以上用法和 MySQL 的 `AUTO_INCREMENT` 用法一致。但在隐式分配的具体值方面，TiDB 和 MySQL 之间具有较为显著的差异。

## 实现原理

TiDB 实现 `AUTO_INCREMENT` 隐式分配的原理是，对于每一个自增列，都使用一个全局可见的键值对用于记录当前已分配的最大 ID。由于分布式环境下的节点通信存在一定开销，为了避免写请求放大的问题，每个 TiDB 节点在分配 ID 时，都申请一段 ID 作为缓存，用完之后再去取下一段，而不是每次分配都向存储节点申请。例如，对于以下新建的表：

```sql
CREATE TABLE t(id int UNIQUE KEY AUTO_INCREMENT, c int);
```

假设集群中有两个 TiDB 实例 A 和 B，如果向 A 和 B 分别对 `t` 执行一条插入语句：

```sql
INSERT INTO t (c) VALUES (1)
```

实例 A 可能会缓存 `[1,30000]` 的自增 ID，而实例 B 则可能缓存 `[30001,60000]` 的自增 ID。各自实例缓存的 ID 将随着执行将来的插入语句被作为缺省值，顺序地填充到 `AUTO_INCREMENT` 列中。

## 基本特性

### 唯一性保证

> **警告：**
>
> 在集群中有多个 TiDB 实例时，如果表结构中有自增 ID，建议不要混用显式插入和隐式分配（即自增列的缺省值和自定义值），否则可能会破坏隐式分配值的唯一性。

例如在上述示例中，依次执行如下操作：

1. 客户端向实例 B 插入一条将 `id` 设置为 `2` 的语句 `INSERT INTO t VALUES (2, 1)`，并执行成功。
2. 客户端向实例 A 发送 `INSERT` 语句 `INSERT INTO t (c) (1)`，这条语句中没有指定 `id` 的值，所以会由 A 分配。当前 A 缓存了 `[1, 30000]` 这段 ID，可能会分配 `2` 为自增 ID 的值，并把本地计数器加 `1`。而此时数据库中已经存在 `id` 为 `2` 的数据，最终返回 `Duplicated Error` 错误。

### 单调性保证

TiDB 保证 `AUTO_INCREMENT` 自增值在单台服务器上单调递增。以下示例在一台服务器上生成连续的 `AUTO_INCREMENT` 自增值 `1`-`3`：


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

TiDB 能保证自增值的单调性，但并不能保证其连续性。参考以下示例：

```sql
CREATE TABLE t (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, a VARCHAR(10), cnt INT NOT NULL DEFAULT 1, UNIQUE KEY (a));
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

在以上示例 `INSERT INTO t (a) VALUES ('A'), ('C') ON DUPLICATE KEY UPDATE cnt = cnt + 1;` 语句中，自增值 `3` 被分配为 `A` 键对应的 `id` 值，但实际上 `3` 并未作为 `id` 值插入进表中。这是因为该 `INSERT` 语句包含一个重复键 `A`，使得自增序列不连续，出现了间隙。该行为尽管与 MySQL 不同，但仍是合法的。MySQL 在其他情况下也会出现自增序列不连续的情况，例如事务被中止和回滚时。

## AUTO_ID_CACHE

如果在另一台服务器上执行插入操作，那么 `AUTO_INCREMENT` 值的顺序可能会剧烈跳跃，这是由于每台服务器都有各自缓存的 `AUTO_INCREMENT` 自增值。


```sql
CREATE TABLE t (a INT PRIMARY KEY AUTO_INCREMENT, b TIMESTAMP NOT NULL DEFAULT NOW());
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

以下示例在最先的一台服务器上执行一个插入 `INSERT` 操作，生成 `AUTO_INCREMENT` 值 `4`。因为这台服务器上仍有剩余的 `AUTO_INCREMENT` 缓存值可用于分配。在该示例中，值的顺序不具有全局单调性：

```sql
INSERT INTO t (a) VALUES (NULL);
Query OK, 1 row affected (0.01 sec)

SELECT * FROM t ORDER BY b;
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

`AUTO_INCREMENT` 缓存不会持久化，重启会导致缓存值失效。以下示例中，最先的一台服务器重启后，向该服务器执行一条插入操作：

```sql
INSERT INTO t (a) VALUES (NULL);
Query OK, 1 row affected (0.01 sec)

SELECT * FROM t ORDER BY b;
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

TiDB 服务器频繁重启可能导致 `AUTO_INCREMENT` 缓存值被快速消耗。在以上示例中，最先的一台服务器本来有可用的缓存值 `[5-3000]`。但重启后，这些值便丢失了，无法进行重新分配。

用户不应指望 `AUTO_INCREMENT` 值保持连续。在以下示例中，一台 TiDB 服务器的缓存值为 `[2000001-2030000]`。当手动插入值 `2029998` 时，TiDB 取用了一个新缓存区间的值：

```sql
INSERT INTO t (a) VALUES (2029998);
Query OK, 1 row affected (0.01 sec)

INSERT INTO t (a) VALUES (NULL);
Query OK, 1 row affected (0.01 sec)

INSERT INTO t (a) VALUES (NULL);
Query OK, 1 row affected (0.00 sec)

INSERT INTO t (a) VALUES (NULL);
Query OK, 1 row affected (0.02 sec)

INSERT INTO t (a) VALUES (NULL);
Query OK, 1 row affected (0.01 sec)

SELECT * FROM t ORDER BY b;
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

以上示例插入 `2030000` 后，下一个值为 `2060001`，即顺序出现跳跃。这是因为另一台 TiDB 服务器获取了中间缓存区间 `[2030001-2060000]`。当部署有多台 TiDB 服务器时，`AUTO_INCREMENT` 值的顺序会出现跳跃，因为对缓存值的请求是交叉出现的。

### 缓存大小控制

TiDB 自增 ID 的缓存大小在早期版本中是对用户透明的。从 v3.1.2、v3.0.14 和 v4.0.rc-2 版本开始，TiDB 引入了 `AUTO_ID_CACHE` 表选项来允许用户自主设置自增 ID 分配缓存的大小。例如：

```sql
CREATE TABLE t(a int AUTO_INCREMENT key) AUTO_ID_CACHE 100;
Query OK, 0 rows affected (0.02 sec)

INSERT INTO t VALUES();
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

此时如果重启 TiDB，自增 ID 缓存将会丢失，新的插入操作将从一个之前缓存范围外的更高的 ID 值开始分配。

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

可以看到再一次分配的值为 `101`，说明该表的自增 ID 分配缓存的大小为 `100`。

此外如果在批量插入的 `INSERT` 语句中所需连续 ID 长度超过 `AUTO_ID_CACHE` 的长度时，TiDB 会适当调大缓存以便能够保证该语句的正常插入。

### 清除自增 ID 缓存

在一些场景中，你可能需要清除自增 ID 缓存，以保证数据一致性。例如：

- 使用 [Data Migration (DM)](/dm/dm-overview.md) 进行增量同步，当同步结束后，下游 TiDB 的数据写入方式将从 DM 切换回正常的业务数据写入，此时自增列 ID 的写入模式通常由显式写入转换成隐式分配。
- TiDB Lightning 完成数据导入后会自动清除自增 ID 缓存，但 TiCDC 在增量同步后不会自动清除。因此，在停止 TiCDC 并进行主备切换之前，需要手动清除下游集群的自增 ID 缓存。
- 当业务同时使用了显式写入和隐式分配时，需要清除自增 ID 缓存，以防止后续隐式分配的自增 ID 与已显式写入的 ID 发生冲突，导致主键冲突错误。具体场景参考[唯一性保证](/auto-increment.md#唯一性保证)。

你可以执行 `ALTER TABLE` 语句设置 `AUTO_INCREMENT = 0` 来清除集群中所有 TiDB 节点的自增 ID 缓存。例如：

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

### 自增步长和偏移量设置

从 v3.0.9 和 v4.0.rc-1 开始，和 MySQL 的行为类似，自增列隐式分配的值遵循 session 变量 `@@auto_increment_increment` 和 `@@auto_increment_offset` 的控制，其中自增列隐式分配的值 (ID) 将满足式子 `(ID - auto_increment_offset) % auto_increment_increment == 0`。

## 兼容 MySQL 的自增列模式

TiDB 提供了一种兼容 MySQL 的自增列模式，该模式能确保 ID 严格递增且间隙最小。要启用此模式，需在建表时将 `AUTO_ID_CACHE` 设置为 `1`：

```sql
CREATE TABLE t(a int AUTO_INCREMENT key) AUTO_ID_CACHE 1;
```

当 `AUTO_ID_CACHE` 设置为 `1` 时，所有 TiDB 实例生成的 ID 严格全局递增，每个 ID 保证全局唯一，相较于默认缓存模式（`AUTO_ID_CACHE 0` 具有 30000 个缓存值），ID 间隙显著缩小。

例如，启用 `AUTO_ID_CACHE 1` 后可以生成如下序列：

```sql
INSERT INTO t VALUES (); -- Returns ID 1
INSERT INTO t VALUES (); -- Returns ID 2
INSERT INTO t VALUES (); -- Returns ID 3
-- After failover
INSERT INTO t VALUES (); -- Might return ID 5
```

相比之下，使用默认缓存（`AUTO_ID_CACHE 0`）时可能出现较大间隙：

```sql
INSERT INTO t VALUES (); -- Returns ID 1
INSERT INTO t VALUES (); -- Returns ID 2
-- New TiDB instance allocates next batch
INSERT INTO t VALUES (); -- Returns ID 30001
```

尽管 `AUTO_ID_CACHE 1` 能保证 ID 严格递增且不会出现类似 `AUTO_ID_CACHE 0` 的大幅间隙，但在以下场景中仍可能出现微小间隙。这些间隙是维持 ID 全局唯一性和严格递增特性的必要代价：

- 主实例退出或崩溃的故障恢复期间

    使用兼容 MySQL 的自增列模式后，能保证 ID **唯一**、**单调递增**，行为几乎跟 MySQL 完全一致。即使跨 TiDB 实例访问，ID 也不会出现回退。只有在中心化分配自增 ID 服务的“主” TiDB 实例进程退出（如该 TiDB 节点重启）或者异常崩溃时，才有可能造成部分 ID 不连续。这是因为主备切换时，“备” 节点需要丢弃一部分之前的“主” 节点已经分配的 ID，以保证 ID 不出现重复。

- TiDB 节点滚动升级期间
- 正常并发事务场景（与 MySQL 类似）

> **注意：**
>
> `AUTO_ID_CACHE 1` 的行为和性能在不同 TiDB 版本中的演进如下：
>
> - v6.4.0 之前：每次 ID 分配需通过一个 TiKV 事务完成，会影响性能。
> - v6.4.0 起：引入集中式分配服务，ID 分配转为内存操作，性能显著提升。
> - v8.1.0 起：移除主节点退出时的自动 `forceRebase` 操作以实现快速重启。虽然故障恢复时可能产生额外非连续 ID，但可避免大量表使用 `AUTO_ID_CACHE 1` 时可能出现的写入阻塞。

## 使用限制

目前在 TiDB 中使用 `AUTO_INCREMENT` 有以下限制：

- 对于 v6.6.0 及更早的 TiDB 版本，定义的列必须为主键或者索引前缀。
- 只能定义在类型为整数、`FLOAT` 或 `DOUBLE` 的列上。
- 不支持与列的默认值 `DEFAULT` 同时指定在同一列上。
- 不支持使用 `ALTER TABLE` 来添加 `AUTO_INCREMENT` 属性，包括使用 `ALTER TABLE ... MODIFY/CHANGE COLUMN` 语法为已存在的列添加 `AUTO_INCREMENT` 属性，以及使用 `ALTER TABLE ... ADD COLUMN` 添加带有 `AUTO_INCREMENT` 属性的列。
- 支持使用 `ALTER TABLE` 来移除 `AUTO_INCREMENT` 属性。但从 TiDB 2.1.18 和 3.0.4 版本开始，TiDB 通过 session 变量 `@@tidb_allow_remove_auto_inc` 控制是否允许通过 `ALTER TABLE MODIFY` 或 `ALTER TABLE CHANGE` 来移除列的 `AUTO_INCREMENT` 属性，默认是不允许移除。
- `ALTER TABLE` 需要 `FORCE` 选项来将 `AUTO_INCREMENT` 设置为较小的值。
- 将 `AUTO_INCREMENT` 设置为小于 `MAX(<auto_increment_column>)` 的值会导致重复键，因为预先存在的值不会被跳过。
