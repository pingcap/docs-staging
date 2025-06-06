---
title: TiDB 悲观事务模式
summary: 了解 TiDB 的悲观事务模式。
aliases: ['/docs-cn/dev/pessimistic-transaction/','/docs-cn/dev/reference/transactions/transaction-pessimistic/']
---

# TiDB 悲观事务模式

为了使 TiDB 的使用方式更加贴近传统数据库，降低用户迁移的成本，TiDB 自 v3.0 版本开始在乐观事务模型的基础上支持了悲观事务模式。本文将介绍 TiDB 悲观事务的相关特性。

> **注意：**
>
> 自 v3.0.8 开始，新创建的 TiDB 集群默认使用悲观事务模式。但如果从 v3.0.7 版本及之前创建的集群升级到 >= v3.0.8 的版本，则不会改变默认的事务模式，即**只有新创建的集群才会默认使用悲观事务模式**。

## 事务模式的修改方法

你可以使用 [`tidb_txn_mode`](/system-variables.md#tidb_txn_mode) 系统变量设置事务模式。执行以下命令，即可使整个集群中所有新创建 session 执行的所有显示事务（即非 autocommit 的事务）进入悲观事务模式：


```sql
SET GLOBAL tidb_txn_mode = 'pessimistic';
```

除此之外，还可以执行以下 SQL 语句显式地开启悲观事务：


```sql
BEGIN PESSIMISTIC;
```


```
BEGIN /*T! PESSIMISTIC */;
```

`BEGIN PESSIMISTIC;` 和 `BEGIN OPTIMISTIC;` 等语句的优先级高于 `tidb_txn_mode` 系统变量。使用这两个语句开启的事务，会忽略系统变量，从而支持悲观、乐观事务混合使用。

## 悲观事务模式的行为

悲观事务的行为和 MySQL 基本一致（不一致之处详见[和 MySQL InnoDB 的差异](#和-mysql-innodb-的差异)）：

- 悲观事务中引入快照读和当前读的概念：

    - 快照读是一种不加锁读，读的是该事务开始时刻前已提交的版本。`SELECT` 语句中的读是快照读。
    - 当前读是一种加锁读，读取的是最新已提交的版本，`UPDATE`、`DELETE` 、`INSERT`、`SELECT FOR UPDATE` 语句中的读是当前读。

    以下示例是对快照读和当前读的详细说明：

    | session 1 | session 2 | session 3 |
    | :----| :---- | :---- |
    | CREATE TABLE t (a INT); |  |  |
    | INSERT INTO T VALUES(1); |  |  |
    | BEGIN PESSIMISTIC; |  |
    | UPDATE t SET a = a + 1; |  |  |
    |  | BEGIN PESSIMISTIC; |  |
    |  | SELECT * FROM t;  -- 使用快照读，读取本事务开始前已提交的版本，返回(a=1) |  |
    |  |  | BEGIN PESSIMISTIC;
    |  |  | SELECT * FROM t FOR UPDATE; -- 使用当前读，等锁 |
    | COMMIT; -- 释放锁，session 3 的 SELECT FOR UPDATE 操作获得锁，使用当前读，读到最新已提交的版本 (a=2) |  |  |
    |  | SELECT * FROM t; -- 使用快照读，读取本事务开始前已提交的版本，返回(a=1) |  |

- 悲观锁会在事务提交或回滚时释放。其他尝试修改这一行的写事务会被阻塞，等待悲观锁的释放。其他尝试*读取*这一行的事务不会被阻塞，因为 TiDB 采用多版本并发控制机制 (MVCC)。

- 需要检查唯一性约束的悲观锁可以通过设置系统变量 [`tidb_constraint_check_in_place_pessimistic`](/system-variables.md#tidb_constraint_check_in_place_pessimistic-从-v630-版本开始引入) 控制是否跳过，详见[约束](/constraints.md#悲观事务)。

- 如果多个事务尝试获取各自的锁，会出现死锁，并被检测器自动检测到。其中一个事务会被随机终止掉并返回兼容 MySQL 的错误码 `1213`。

- 通过 `innodb_lock_wait_timeout` 变量，设置事务等锁的超时时间（默认值为 `50`，单位为秒）。等锁超时后返回兼容 MySQL 的错误码 `1205`。如果多个事务同时等待同一个锁释放，会大致按照事务 `start ts` 顺序获取锁。

- 乐观事务和悲观事务可以共存，事务可以任意指定使用乐观模式或悲观模式来执行。

- 支持 `FOR UPDATE NOWAIT` 语法，遇到锁时不会阻塞等锁，而是返回兼容 MySQL 的错误码 `3572`。

- 如果 `Point Get` 和 `Batch Point Get` 算子没有读到数据，依然会对给定的主键或者唯一键加锁，阻塞其他事务对相同主键唯一键加锁或者进行写入操作。

- 支持 `FOR UPDATE OF TABLES` 语法，对于存在多表 join 的语句，只对 `OF TABLES` 中包含的表关联的行进行悲观锁加锁操作。 

## 和 MySQL InnoDB 的差异

1. 有些 `WHERE` 子句中使用了 range，TiDB 在执行这类 DML 语句和 `SELECT FOR UPDATE` 语句时，不会阻塞 range 内并发的 DML 语句的执行。

    举例：

    ```sql
    CREATE TABLE t1 (
     id INT NOT NULL PRIMARY KEY,
     pad1 VARCHAR(100)
    );
    INSERT INTO t1 (id) VALUES (1),(5),(10);
    ```

    ```sql
    BEGIN /*T! PESSIMISTIC */;
    SELECT * FROM t1 WHERE id BETWEEN 1 AND 10 FOR UPDATE;
    ```

    ```sql
    BEGIN /*T! PESSIMISTIC */;
    INSERT INTO t1 (id) VALUES (6); -- 仅 MySQL 中出现阻塞。
    UPDATE t1 SET pad1='new value' WHERE id = 5; -- MySQL 和 TiDB 处于等待阻塞状态。
    ```

    产生这一行为是因为 TiDB 当前不支持 _gap locking_（间隙锁）。

2. TiDB 不支持 `SELECT LOCK IN SHARE MODE`。

    TiDB 默认不支持 `SELECT LOCK IN SHARE MODE` 语法。可以通过启用 [`tidb_enable_noop_functions`](/system-variables.md#tidb_enable_noop_functions-从-v40-版本开始引入) 来兼容 `SELECT LOCK IN SHARE MODE` 语法。此时，该语法的效果和没有加锁一样，不会阻塞其他事务的读写。

    从 v8.3.0 版本开始，TiDB 支持通过启用 [`tidb_enable_shared_lock_promotion`](/system-variables.md#tidb_enable_shared_lock_promotion-从-v830-版本开始引入) 系统变量使 `SELECT LOCK IN SHARE MODE` 语句产生加锁行为。但需要注意，此时加的锁并不是真正的共享锁，而是与 `SELECT FOR UPDATE` 一致，实际加的是排他锁。如果你需要兼容 `SELECT LOCK IN SHARE MODE` 语法的同时，希望与写入相互阻塞、避免读期间数据被并行的写入事务修改，可考虑启用该变量。该变量无论 [`tidb_enable_noop_functions`](/system-variables.md#tidb_enable_noop_functions-从-v40-版本开始引入) 配置如何都会生效。

3. DDL 可能会导致悲观事务提交失败。

    MySQL 在执行 DDL 语句时，会被正在执行的事务阻塞住，而在 TiDB 中 DDL 操作会成功，造成悲观事务提交失败：`ERROR 1105 (HY000): Information schema is changed. [try again later]`。TiDB 事务执行过程中并发执行 `TRUNCATE TABLE` 语句，可能会导致事务报错 `table doesn't exist`。

4. `START TRANSACTION WITH CONSISTENT SNAPSHOT` 之后，MySQL 仍然可以读取到之后在其他事务创建的表，而 TiDB 不能。

5. autocommit 事务优先采用乐观事务提交。
    
    使用悲观事务模式时，autocommit 事务首先尝试使用开销更小的乐观事务模式提交。如果发生了写冲突，重试时才会使用悲观事务提交。所以 `tidb_retry_limit = 0` 时，autocommit 事务遇到写冲突仍会报 `Write Conflict` 错误。

    自动提交的 `SELECT FOR UPDATE` 语句不会等锁。

6. 对语句中 `EMBEDDED SELECT` 读到的相关数据不会加锁。

7. 垃圾回收 (GC) 不会影响到正在执行的事务，但悲观事务的执行时间仍有上限，默认为 1 小时，可通过 TiDB 配置文件 `[performance]` 类别下的 `max-txn-ttl` 修改。

## 隔离级别

TiDB 在悲观事务模式下支持了 2 种隔离级别：

1. 默认使用与 MySQL 行为相同的[可重复读隔离级别 (Repeatable Read)](/transaction-isolation-levels.md#可重复读隔离级别-repeatable-read)。

    > **注意：**
    >
    > 在这种隔离级别下，DML 操作会基于已提交的最新数据来执行，行为与 MySQL 相同，但与 TiDB 乐观事务不同，请参考[与 MySQL 可重复读隔离级别的区别](/transaction-isolation-levels.md#与-mysql-可重复读隔离级别的区别)。

2. 使用 [`SET TRANSACTION`](/sql-statements/sql-statement-set-transaction.md) 语句可将隔离级别设置为[读已提交隔离级别 (Read Committed)](/transaction-isolation-levels.md#读已提交隔离级别-read-committed)。

## 悲观事务提交流程

TiDB 悲观锁复用了乐观锁的两阶段提交逻辑，重点在 DML 执行时做了改造。

![TiDB 悲观事务的提交流程](https://docs-download.pingcap.com/media/images/docs-cn/pessimistic-transaction-commit.png)

在两阶段提交之前增加了 Acquire Pessimistic Lock 阶段，简要步骤如下。

1. （同乐观锁）TiDB 收到来自客户端的 begin 请求，获取当前时间戳作为本事务的 StartTS。
2. TiDB 收到来自客户端的更新数据的请求：TiDB 向 TiKV 发起加悲观锁请求，该锁持久化到 TiKV。
3. （同乐观锁）客户端发起 commit，TiDB 开始执行与乐观锁一样的两阶段提交。

![TiDB 中的悲观事务](https://docs-download.pingcap.com/media/images/docs-cn/pessimistic-transaction-in-tidb.png)

相关细节本节不再赘述，详情可阅读 [TiDB 悲观锁实现原理](https://tidb.net/blog/7730ed79)。

## Pipelined 加锁流程

加悲观锁需要向 TiKV 写入数据，要经过 Raft 提交并 apply 后才能返回，相比于乐观事务，不可避免的会增加部分延迟。为了降低加锁的开销，TiKV 实现了 pipelined 加锁流程：当数据满足加锁要求时，TiKV 立刻通知 TiDB 执行后面的请求，并异步写入悲观锁，从而降低大部分延迟，显著提升悲观事务的性能。但当 TiKV 出现网络隔离或者节点宕机时，悲观锁异步写入有可能失败，从而产生以下影响：

* 无法阻塞修改相同数据的其他事务。如果业务逻辑依赖加锁或等锁机制，业务逻辑的正确性将受到影响。

* 有较低概率导致事务提交失败，但不会影响事务正确性。

如果业务逻辑依赖加锁或等锁机制，或者即使在集群异常情况下也要尽可能保证事务提交的成功率，应关闭 pipelined 加锁功能。

![Pipelined pessimistic lock](https://docs-download.pingcap.com/media/images/docs-cn/pessimistic-transaction-pipelining.png)

该功能默认开启，可修改 TiKV 配置关闭：

```toml
[pessimistic-txn]
pipelined = false
```

若集群是 v4.0.9 及以上版本，也可通过[在线修改 TiKV 配置](/dynamic-config.md#在线修改-tikv-配置)功能动态关闭该功能：


```sql
set config tikv pessimistic-txn.pipelined='false';
```

## 内存悲观锁

TiKV 在 v6.0.0 中引入了内存悲观锁功能。开启内存悲观锁功能后，悲观锁通常只会被存储在 Region leader 的内存中，而不会将锁持久化到磁盘，也不会通过 Raft 协议将锁同步到其他副本，因此可以大大降低悲观事务加锁的开销，提升悲观事务的吞吐并降低延迟。

当内存悲观锁占用的内存达到 [Region](/tikv-configuration-file.md#in-memory-peer-size-limit-从-v840-版本开始引入) 或 [TiKV 节点](/tikv-configuration-file.md#in-memory-instance-size-limit-从-v840-版本开始引入)的阈值时，加悲观锁会回退为使用 [pipelined 加锁流程](#pipelined-加锁流程)。当 Region 发生合并或 leader 迁移时，为避免悲观锁丢失，TiKV 会将内存悲观锁写入磁盘并同步到其他副本。

内存悲观锁实现了和 [pipelined 加锁](#pipelined-加锁流程)类似的表现，即集群无异常时不影响加锁表现，但当 TiKV 出现网络隔离或者节点宕机时，事务加的悲观锁可能丢失。

如果业务逻辑依赖加锁或等锁机制，或者即使在集群异常情况下也要尽可能保证事务提交的成功率，应**关闭**内存悲观锁功能。

该功能默认开启。如要关闭，可修改 TiKV 配置：

```toml
[pessimistic-txn]
in-memory = false
```

也可通过[在线修改 TiKV 配置](/dynamic-config.md#在线修改-tikv-配置)功能动态关闭该功能：


```sql
set config tikv pessimistic-txn.in-memory='false';
```

从 v8.4.0 开始，你可以通过 [`pessimistic-txn.in-memory-peer-size-limit`](/tikv-configuration-file.md#in-memory-peer-size-limit-从-v840-版本开始引入) 或 [`pessimistic-txn.in-memory-instance-size-limit`](/tikv-configuration-file.md#in-memory-instance-size-limit-从-v840-版本开始引入) 配置项修改 Region 或 TiKV 节点内存悲观锁的内存使用上限：

```toml
[pessimistic-txn]
in-memory-peer-size-limit = "512KiB"
in-memory-instance-size-limit = "100MiB"
```

也可通过[在线修改 TiKV 配置](/dynamic-config.md#在线修改-tikv-配置)功能动态调整：

```sql
SET CONFIG tikv `pessimistic-txn.in-memory-peer-size-limit`="512KiB";
SET CONFIG tikv `pessimistic-txn.in-memory-instance-size-limit`="100MiB";
```
