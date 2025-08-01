---
title: 在线修改集群配置
summary: 介绍在线修改集群配置的功能。
---

# 在线修改集群配置

在线配置变更主要是通过利用 SQL 对包括 TiDB、TiKV 以及 PD 在内的各组件的配置进行在线更新。用户可以通过在线配置变更对各组件进行性能调优而无需重启集群组件。但目前在线修改 TiDB 实例配置的方式和修改其他组件 (TiKV, PD) 的有所不同。

## 常用操作

### 查看实例配置

可以通过 SQL 语句 `show config` 来直接查看集群所有实例的配置信息，结果如下：


```sql
show config;
```

```sql
+------+-----------------+-----------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Type | Instance        | Name                                                      | Value                                                                                                                                                                                                                                                                            |
+------+-----------------+-----------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| tidb | 127.0.0.1:4001  | advertise-address                                         | 127.0.0.1                                                                                                                                                                                                                                                                        |
| tidb | 127.0.0.1:4001  | binlog.binlog-socket                                      |                                                                                                                                                                                                                                                                                  |
| tidb | 127.0.0.1:4001  | binlog.enable                                             | false                                                                                                                                                                                                                                                                            |
| tidb | 127.0.0.1:4001  | binlog.ignore-error                                       | false                                                                                                                                                                                                                                                                            |
| tidb | 127.0.0.1:4001  | binlog.strategy                                           | range                                                                                                                                                                                                                                                                            |
| tidb | 127.0.0.1:4001  | binlog.write-timeout                                      | 15s                                                                                                                                                                                                                                                                              |
| tidb | 127.0.0.1:4001  | check-mb4-value-in-utf8                                   | true                                                                                                                                                                                                                                                                             |

...
```

还可以根据对应的字段进行过滤，如：


```sql
show config where type='tidb'
show config where instance in (...)
show config where name like '%log%'
show config where type='tikv' and name='log.level'
```

### 在线修改 TiKV 配置

> **注意：**
>
> 在线修改 TiKV 配置项后，同时会自动修改 TiKV 的配置文件。但还需要使用 `tiup edit-config` 命令来修改对应的配置项，否则 `upgrade` 和 `reload` 等运维操作会将在线修改配置后的结果覆盖。修改配置的操作请参考：[使用 TiUP 修改配置](/maintain-tidb-using-tiup.md#修改配置参数)。执行 `tiup edit-config` 后不需要执行 `tiup reload` 操作。

执行 SQL 语句 `set config`，可以结合实例地址或组件类型来修改单个实例配置或全部实例配置，如：

修改全部 TiKV 实例配置：

> **注意：**
>
> 建议使用反引号包裹变量名称。


```sql
set config tikv `split.qps-threshold`=1000
```

修改单个 TiKV 实例配置：


```sql
set config "127.0.0.1:20180" `split.qps-threshold`=1000
```

设置成功会返回 `Query OK`：


```sql
Query OK, 0 rows affected (0.01 sec)
```

在批量修改时如果有错误发生，会以 warning 的形式返回：


```sql
set config tikv `log-level`='warn';
```

```sql
Query OK, 0 rows affected, 1 warning (0.04 sec)
```


```sql
show warnings;
```

```sql
+---------+------+---------------------------------------------------------------------------------------------------------------+
| Level   | Code | Message                                                                                                       |
+---------+------+---------------------------------------------------------------------------------------------------------------+
| Warning | 1105 | bad request to http://127.0.0.1:20180/config: fail to update, error: "config log-level can not be changed" |
+---------+------+---------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

批量修改配置不保证原子性，可能出现某些实例成功，而某些失败的情况。如使用 `set tikv key=val` 命令修改整个 TiKV 集群配置时，可能有部分实例失败，请执行 `show warnings` 进行查看。

如遇到部分修改失败的情况，需要重新执行对应的修改语句，或通过修改单个实例的方式完成修改。如果因网络或者机器故障等原因无法访问到的 TiKV，需要等到恢复后再次进行修改。

针对 TiKV 可在线修改的配置项，如果成功修改后，修改的结果会被持久化到配置文件中，后续以配置文件中的配置为准。某些配置项名称可能和 TiDB 预留关键字冲突，如 `limit`、`key` 等，对于此类配置项，需要用反引号 ``` ` ``` 包裹起来，如 ``` `raftstore.raft-log-gc-size-limit` ```。

支持的配置项列表如下：

| 配置项 | 简介 |
| --- | --- |
| log.level | 日志等级 |
| raftstore.raft-max-inflight-msgs | 待确认的日志个数，如果超过这个数量，Raft 状态机会减缓发送日志的速度 |
| raftstore.raft-log-gc-tick-interval | 删除 Raft 日志的轮询任务调度间隔时间 |
| raftstore.raft-log-gc-threshold | 允许残余的 Raft 日志个数，软限制 |
| raftstore.raft-log-gc-count-limit | 允许残余的 Raft 日志个数，硬限制 |
| raftstore.raft-log-gc-size-limit | 允许残余的 Raft 日志大小，硬限制 |
| raftstore.raft-max-size-per-msg | 允许生成的单个消息包的大小，软限制 |
| raftstore.raft-entry-max-size | 单个 Raft 日志最大大小，硬限制 |
| raftstore.raft-entry-cache-life-time | 内存中日志 cache 允许的最长残留时间 |
| raftstore.split-region-check-tick-interval | 检查 Region 是否需要分裂的时间间隔 |
| raftstore.region-split-check-diff | 允许 Region 数据超过指定大小的最大值 |
| raftstore.region-compact-check-interval | 检查是否需要人工触发 RocksDB compaction 的时间间隔 |
| raftstore.region-compact-check-step | 每轮校验人工 compaction 时，一次性检查的 Region 个数 |
| raftstore.region-compact-min-tombstones | 触发 RocksDB compaction 需要的 tombstone 个数 |
| raftstore.region-compact-tombstones-percent | 触发 RocksDB compaction 需要的 tombstone 所占比例 |
| raftstore.pd-heartbeat-tick-interval | 触发 Region 对 PD 心跳的时间间隔 |
| raftstore.pd-store-heartbeat-tick-interval | 触发 store 对 PD 心跳的时间间隔 |
| raftstore.snap-mgr-gc-tick-interval | 触发回收过期 snapshot 文件的时间间隔 |
| raftstore.snap-gc-timeout | snapshot 文件的最长保存时间 |
| raftstore.lock-cf-compact-interval | 触发对 lock CF compact 检查的时间间隔 |
| raftstore.lock-cf-compact-bytes-threshold | 触发对 lock CF 进行 compact 的大小 |
| raftstore.messages-per-tick | 每轮处理的消息最大个数 |
| raftstore.max-peer-down-duration | 副本允许的最长未响应时间 |
| raftstore.max-leader-missing-duration | 允许副本处于无主状态的最长时间，超过将会向 PD 校验自己是否已经被删除 |
| raftstore.abnormal-leader-missing-duration | 允许副本处于无主状态的时间，超过将视为异常，标记在 metrics 和日志中 |
| raftstore.peer-stale-state-check-interval | 触发检验副本是否处于无主状态的时间间隔 |
| raftstore.consistency-check-interval | 触发一致性检查的时间间隔（不建议使用该配置项，因为与 TiDB GC 操作不兼容）|
| raftstore.raft-store-max-leader-lease | Region 主可信任期的最长时间 |
| raftstore.merge-check-tick-interval | 触发 Merge 完成检查的时间间隔 |
| raftstore.cleanup-import-sst-interval | 触发检查过期 SST 文件的时间间隔 |
| raftstore.local-read-batch-size | 一轮处理读请求的最大个数 |
| raftstore.apply-yield-write-size | Apply 线程每一轮处理单个状态机写入的最大数据量 |
| raftstore.hibernate-timeout | 启动后进入静默状态前需要等待的最短时间，在该时间段内不会进入静默状态（未 release）|
| raftstore.apply-pool-size | 处理把数据落盘至磁盘的线程池中线程的数量，即 Apply 线程池大小 |
| raftstore.store-pool-size | 处理 Raft 的线程池中线程的数量，即 Raftstore 线程池的大小 |
| raftstore.apply-max-batch-size | Raft 状态机由 BatchSystem 批量执行数据写入请求，该配置项指定每批可执行请求的最多 Raft 状态机个数。 |
| raftstore.store-max-batch-size |  Raft 状态机由 BatchSystem 批量执行把日志落盘至磁盘的请求，该配置项指定每批可执行请求的最多 Raft 状态机个数。 |
| raftstore.store-io-pool-size | 处理 Raft I/O 任务的线程池中线程的数量，即 StoreWriter 线程池的大小（不支持将该配置项由非零值调整为 0，或者从 0 调整为非零值）|
| readpool.unified.max-thread-count | 统一处理读请求的线程池最多的线程数量，即 UnifyReadPool 线程池大小 |
| readpool.unified.auto-adjust-pool-size | 是否开启自适应调整 UnifyReadPool 的大小 |
| coprocessor.split-region-on-table | 开启按 table 分裂 Region 的开关 |
| coprocessor.batch-split-limit | 批量分裂 Region 的阈值 |
| coprocessor.region-max-size | Region 容量空间的最大值 |
| coprocessor.region-split-size | 分裂后新 Region 的大小 |
| coprocessor.region-max-keys | Region 最多允许的 key 的个数 |
| coprocessor.region-split-keys | 分裂后新 Region 的 key 的个数 |
| pessimistic-txn.wait-for-lock-timeout | 悲观事务遇到锁后的最长等待时间 |
| pessimistic-txn.wake-up-delay-duration | 悲观事务被重新唤醒的时间 |
| pessimistic-txn.pipelined | 是否开启流水线式加悲观锁流程 |
| pessimistic-txn.in-memory | 是否开启内存悲观锁功能 |
| quota.foreground-cpu-time | 限制处理 TiKV 前台读写请求所使用的 CPU 资源使用量，软限制 |
| quota.foreground-write-bandwidth | 限制前台事务写入的带宽，软限制 |
| quota.foreground-read-bandwidth | 限制前台事务读取数据和 Coprocessor 读取数据的带宽，软限制 |
| quota.background-cpu-time | 限制处理 TiKV 后台读写请求所使用的 CPU 资源使用量，软限制 |
| quota.background-write-bandwidth | 限制后台事务写入的带宽，软限制 |
| quota.background-read-bandwidth | 限制后台事务读取数据和 Coprocessor 读取数据的带宽，软限制 |
| quota.enable-auto-tune | 是否支持 quota 动态调整。如果打开该配置项，TiKV 会根据 TiKV 实例的负载情况动态调整对后台请求的限制 quota |
| quota.max-delay-duration | 单次读写请求被强制等待的最大时间 |
| gc.ratio-threshold | 跳过 Region GC 的阈值（GC 版本个数/key 个数）|
| gc.batch-keys | 一轮处理 key 的个数 |
| gc.max-write-bytes-per-sec | 一秒可写入 RocksDB 的最大字节数 |
| gc.enable-compaction-filter | 是否使用 compaction filter |
| gc.compaction-filter-skip-version-check | 是否跳过 compaction filter 的集群版本检查（未 release）|
| {db-name}.max-total-wal-size | WAL 总大小限制 |
| {db-name}.max-background-jobs | RocksDB 后台线程个数 |
| {db-name}.max-background-flushes | RocksDB flush 线程个数 |
| {db-name}.max-open-files | RocksDB 可以打开的文件总数 |
| {db-name}.compaction-readahead-size | Compaction 时候 readahead 的大小 |
| {db-name}.bytes-per-sync | 异步同步的限速速率 |
| {db-name}.wal-bytes-per-sync | WAL 同步的限速速率 |
| {db-name}.writable-file-max-buffer-size | WritableFileWrite 所使用的最大的 buffer 大小 |
| {db-name}.{cf-name}.block-cache-size | block cache size 大小 |
| {db-name}.{cf-name}.write-buffer-size | memtable 大小 |
| {db-name}.{cf-name}.max-write-buffer-number | 最大 memtable 个数 |
| {db-name}.{cf-name}.max-bytes-for-level-base | base level (L1) 最大字节数 |
| {db-name}.{cf-name}.target-file-size-base | base level 的目标文件大小 |
| {db-name}.{cf-name}.level0-file-num-compaction-trigger | 触发 compaction 的 L0 文件最大个数 |
| {db-name}.{cf-name}.level0-slowdown-writes-trigger | 触发 write stall 的 L0 文件最大个数 |
| {db-name}.{cf-name}.level0-stop-writes-trigger | 完全阻停写入的 L0 文件最大个数 |
| {db-name}.{cf-name}.max-compaction-bytes | 一次 compaction 最大写入字节数 |
| {db-name}.{cf-name}.max-bytes-for-level-multiplier | 每一层的默认放大倍数 |
| {db-name}.{cf-name}.disable-auto-compactions | 自动 compaction 的开关 |
| {db-name}.{cf-name}.soft-pending-compaction-bytes-limit | pending compaction bytes 的软限制 |
| {db-name}.{cf-name}.hard-pending-compaction-bytes-limit | pending compaction bytes 的硬限制 |
| {db-name}.{cf-name}.titan.blob-run-mode | 处理 blob 文件的模式 |
| server.grpc-memory-pool-quota | gRPC 可使用的内存大小限制 |
| server.max-grpc-send-msg-len | gRPC 可发送的最大消息长度 |
| server.raft-msg-max-batch-size | 单个 gRPC 消息可包含的最大 Raft 消息个数 |
| server.simplify-metrics | 精简监控采样数据的开关 |
| server.snap-io-max-bytes-per-sec | 处理 snapshot 时最大允许使用的磁盘带宽 |
| server.concurrent-send-snap-limit | 同时发送 snapshot 的最大个数 |
| server.concurrent-recv-snap-limit | 同时接受 snapshot 的最大个数 |
| storage.block-cache.capacity | 共享 block cache 的大小（自 v4.0.3 起支持） |
| storage.scheduler-worker-pool-size | Scheduler 线程池中线程的数量 |
| backup.num-threads | backup 线程的数量（自 v4.0.3 起支持） |
| split.qps-threshold | 对 Region 执行 load-base-split 的阈值。如果连续 10s 内，某个 Region 的读请求的 QPS 超过 qps-threshold，则尝试切分该 Region |
| split.byte-threshold | 对 Region 执行 load-base-split 的阈值。如果连续 10s 内，某个 Region 的读请求的流量超过 byte-threshold，则尝试切分该 Region |
| split.region-cpu-overload-threshold-ratio | 对 Region 执行 load-base-split 的阈值。如果连续 10s 内，某个 Region 的 Unified Read Pool CPU 使用时间占比超过了 region-cpu-overload-threshold-ratio，则尝试切分该 Region（自 v6.2.0 起支持）|
| split.split-balance-score | load-base-split 的控制参数，确保 Region 切分后左右访问尽量均匀，数值越小越均匀，但也可能导致无法切分 |
| split.split-contained-score | load-base-split 的控制参数，数值越小，Region 切分后跨 Region 的访问越少 |
| cdc.min-ts-interval | 定期推进 Resolved TS 的时间间隔 |
| cdc.old-value-cache-memory-quota | 缓存在内存中的 TiCDC Old Value 的条目占用内存的上限 |
| cdc.sink-memory-quota| 缓存在内存中的 TiCDC 数据变更事件占用内存的上限 |
| cdc.incremental-scan-speed-limit| 增量扫描历史数据的速度上限 |
| cdc.incremental-scan-concurrency | 增量扫描历史数据任务的最大并发执行个数 |
上述前缀为 `{db-name}` 或 `{db-name}.{cf-name}` 的是 RocksDB 相关的配置项。`db-name` 的取值可为 `rocksdb` 或 `raftdb`。

- 当 `db-name` 为 `rocksdb` 时，`cf-name` 的可取值有：`defaultcf`、`writecf`、`lockcf`、`raftcf`；
- 当 `db-name` 为 `raftdb` 时，`cf-name` 的可取值有：`defaultcf`。

具体配置项的意义可参考 [TiKV 配置文件描述](/tikv-configuration-file.md)

### 在线修改 PD 配置

PD 暂不支持单个实例拥有独立配置。所有实例共享一份配置，可以通过下列方式修改 PD 的配置项：


```sql
set config pd `log.level`='info'
```

设置成功会返回 `Query OK`：

```sql
Query OK, 0 rows affected (0.01 sec)
```

针对 PD 可在线修改的配置项，成功修改后则会持久化到 etcd 中，不会对配置文件进行持久化，后续以 etcd 中的配置为准。同上，若和 TiDB 预留关键字冲突，需要用反引号 ``` ` ``` 包裹此类配置项，例如 ``` `schedule.leader-schedule-limit` ```。

支持配置项列表如下：

| 配置项 | 简介 |
| --- | --- |
| log.level| 日志级别 |
| cluster-version | 集群的版本 |
| schedule.max-merge-region-size |  控制 Region Merge 的 size 上限（单位是 MiB） |
| schedule.max-merge-region-keys | 控制 Region Merge 的 key 数量上限 |
| schedule.patrol-region-interval | 控制 checker 检查 Region 健康状态的运行频率 |
| schedule.split-merge-interval | 控制对同一个 Region 做 split 和 merge 操作的间隔 |
| schedule.max-snapshot-count | 控制单个 store 最多同时接收或发送的 snapshot 数量 |
| schedule.max-pending-peer-count | 控制单个 store 的 pending peer 上限 |
| schedule.max-store-down-time | PD 认为失联 store 无法恢复的时间 |
| schedule.max-store-preparing-time | 控制 store 上线阶段的最长等待时间 |
| schedule.leader-schedule-policy | 用于控制 leader 调度的策略 |
| schedule.leader-schedule-limit | 可以控制同时进行 leader 调度的任务个数 |
| schedule.region-schedule-limit | 可以控制同时进行 Region 调度的任务个数 |
| schedule.replica-schedule-limit | 可以控制同时进行 replica 调度的任务个数 |
| schedule.merge-schedule-limit | 控制同时进行的 Region Merge 调度的任务 |
| schedule.hot-region-schedule-limit | 可以控制同时进行的热点调度的任务个数 |
| schedule.hot-region-cache-hits-threshold | 用于设置 Region 被视为热点的阈值 |
| schedule.high-space-ratio | 用于设置 store 空间充裕的阈值 |
| schedule.low-space-ratio | 用于设置 store 空间不足的阈值 |
| schedule.tolerant-size-ratio | 控制 balance 缓冲区大小 |
| schedule.enable-remove-down-replica | 用于开启自动删除 DownReplica 的特性 |
| schedule.enable-replace-offline-replica | 用于开启迁移 OfflineReplica 的特性 |
| schedule.enable-make-up-replica | 用于开启补充副本的特性 |
| schedule.enable-remove-extra-replica | 用于开启删除多余副本的特性 |
| schedule.enable-location-replacement | 用于开启隔离级别检查 |
| schedule.enable-cross-table-merge | 用于开启跨表 Merge |
| schedule.enable-one-way-merge | 用于开启单向 Merge（只允许和下一个相邻的 Region Merge） |
| schedule.region-score-formula-version | 用于设置 Region 算分公式的版本 |
| schedule.scheduler-max-waiting-operator | 用于控制每个调度器同时存在的 operator 的个数 |
| schedule.enable-debug-metrics | 用于开启 debug 的 metrics |
| schedule.enable-joint-consensus | 用于开启 Joint Consensus 进行副本调度 |
| schedule.hot-regions-write-interval | 设置 PD 存储 Hot Region 信息时间间隔 |
| schedule.hot-regions-reserved-days | 设置 PD 保留的 Hot Region 信息的最长时间 |
| schedule.max-movable-hot-peer-size | 设置热点调度可以调度的最大 Region size |
| schedule.store-limit-version | 设置 [store limit](/configure-store-limit.md) 工作模式 |
| replication.max-replicas | 用于设置副本的数量 |
| replication.location-labels | 用于设置 TiKV 集群的拓扑信息 |
| replication.enable-placement-rules | 开启 Placement Rules |
| replication.strictly-match-label | 开启 label 检查 |
| replication.isolation-level | 设置 TiKV 集群的最小强制拓扑隔离级别 |
| pd-server.use-region-storage | 开启独立的 Region 存储 |
| pd-server.max-gap-reset-ts | 用于设置最大的重置 timestamp 的间隔（BR）|
| pd-server.key-type| 用于设置集群 key 的类型 |
| pd-server.metric-storage | 用于设置集群 metrics 的存储地址 |
| pd-server.dashboard-address | 用于设置 dashboard 的地址 |
| pd-server.flow-round-by-digit | 指定 PD 对 Region 流量信息的末尾数字进行四舍五入的位数 |
| pd-server.min-resolved-ts-persistence-interval | 设置 PD leader 对集群中 Resolved TS 最小值进行持久化的间隔时间 |
| pd-server.server-memory-limit | PD 实例的内存限制比例 |
| pd-server.server-memory-limit-gc-trigger | PD 尝试触发 GC 的阈值比例 |
| pd-server.enable-gogc-tuner | 是否开启 GOGC Tuner |
| pd-server.gc-tuner-threshold | GOGC Tuner 自动调节的最大内存阈值比例 |
| replication-mode.replication-mode | 备份的模式 |
| replication-mode.dr-auto-sync.label-key | 用于区分不同的 AZ，需要和 Placement Rules 相匹配 |
| replication-mode.dr-auto-sync.primary | 主 AZ |
| replication-mode.dr-auto-sync.dr | 从 AZ |
| replication-mode.dr-auto-sync.primary-replicas  | 主 AZ 上 Voter 副本的数量 |
| replication-mode.dr-auto-sync.dr-replicas | 从 AZ 上 Voter 副本的数量 |
| replication-mode.dr-auto-sync.wait-store-timeout | 当出现网络隔离或者故障时，切换到异步复制模式的等待时间 |
| replication-mode.dr-auto-sync.wait-recover-timeout | 当网络恢复后，切换回 `sync-recover` 状态的等待时间 |
| replication-mode.dr-auto-sync.pause-region-split | 用于控制在 `async_wait` 和 `async` 状态下是否暂停 Region 的 split 操作 |

具体配置项意义可参考 [PD 配置文件描述](/pd-configuration-file.md)。

### 在线修改 TiDB 配置

在线修改 TiDB 配置的方式和 TiKV/PD 有所不同，你可以通过修改[系统变量](/system-variables.md)来实现。

下面例子展示了如何通过变量 `tidb_slow_log_threshold` 在线修改配置项 `slow-threshold`。

`slow-threshold` 默认值是 300 毫秒，可以通过设置系统变量 `tidb_slow_log_threshold` 将其修改为 200 毫秒：


```sql
set tidb_slow_log_threshold = 200;
```

```sql
Query OK, 0 rows affected (0.00 sec)
```


```sql
select @@tidb_slow_log_threshold;
```

```sql
+---------------------------+
| @@tidb_slow_log_threshold |
+---------------------------+
| 200                       |
+---------------------------+
1 row in set (0.00 sec)
```

支持在线修改的配置项和相应的 TiDB 系统变量如下：

| 配置项 | 对应变量 | 简介 |
| --- | --- | --- |
| instance.tidb_enable_slow_log | tidb_enable_slow_log | 慢日志的开关 |
| instance.tidb_slow_log_threshold | tidb_slow_log_threshold | 慢日志阈值 |
| instance.tidb_expensive_query_time_threshold  | tidb_expensive_query_time_threshold | expensive 查询阈值 |
| instance.tidb_enable_collect_execution_info | tidb_enable_collect_execution_info | 控制是否记录各个算子的执行信息 |
| instance.tidb_record_plan_in_slow_log | tidb_record_plan_in_slow_log | 控制是否在慢日志中记录执行计划 |
| instance.tidb_force_priority | tidb_force_priority | 该 TiDB 实例的语句优先级 |
| instance.max_connections | max_connections | 该 TiDB 实例同时允许的最大客户端连接数 |
| instance.tidb_enable_ddl | tidb_enable_ddl | 控制该 TiDB 实例是否可以成为 DDL owner |
| pessimistic-txn.constraint-check-in-place-pessimistic | tidb_constraint_check_in_place_pessimistic | 控制悲观事务中唯一约束检查是否会被推迟到下一次对该唯一索引加锁时或事务提交时才进行 |

### 在线修改 TiFlash 配置

目前，你可以通过修改系统变量 [`tidb_max_tiflash_threads`](/system-variables.md#tidb_max_tiflash_threads-从-v610-版本开始引入) 来在线修改 TiFlash 配置项 `max_threads`。`tidb_max_tiflash_threads` 表示 TiFlash 中 request 执行的最大并发度。

`tidb_max_tiflash_threads` 默认值是 `-1`，表示此系统变量无效，由 TiFlash 的配置文件决定 max_threads。你可以通过设置系统变量 `tidb_max_tiflash_threads` 将其修改为 10：


```sql
set tidb_max_tiflash_threads = 10;
```

```sql
Query OK, 0 rows affected (0.00 sec)
```


```sql
select @@tidb_max_tiflash_threads;
```

```sql
+----------------------------+
| @@tidb_max_tiflash_threads |
+----------------------------+
| 10                         |
+----------------------------+
1 row in set (0.00 sec)
```
