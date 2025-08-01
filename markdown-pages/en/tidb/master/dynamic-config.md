---
title: Modify Configuration Dynamically
summary: Learn how to dynamically modify the cluster configuration.
aliases: ['/docs/dev/dynamic-config/']
---

# Modify Configuration Dynamically

This document describes how to dynamically modify the cluster configuration.

You can dynamically update the configuration of components (including TiDB, TiKV, and PD) using SQL statements, without restarting the cluster components. Currently, the method of changing TiDB instance configuration is different from that of changing configuration of other components (such as TiKV and PD).

> **Note:**
>
> This feature is only applicable to TiDB Self-Managed and not available on [TiDB Cloud](https://docs.pingcap.com/tidbcloud/). For TiDB Cloud, you need to contact [TiDB Cloud Support](https://docs.pingcap.com/tidbcloud/tidb-cloud-support) to modify the configurations.

## Common Operations

This section describes the common operations of dynamically modifying configuration.

### View instance configuration

To view the configuration of all instances in the cluster, use the `show config` statement. The result is as follows:


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

You can filter the result by fields. For example:


```sql
show config where type='tidb'
show config where instance in (...)
show config where name like '%log%'
show config where type='tikv' and name='log.level'
```

### Modify TiKV configuration dynamically

> **Note:**
>
> - After dynamically changing TiKV configuration items, the TiKV configuration file is automatically updated. However, you also need to modify the corresponding configuration items by executing `tiup edit-config`; otherwise, operations such as `upgrade` and `reload` will overwrite your changes. For details of modifying configuration items, refer to [Modify configuration using TiUP](/maintain-tidb-using-tiup.md#modify-the-configuration).
> - After executing `tiup edit-config`, you do not need to execute `tiup reload`.

When using the `set config` statement, you can modify the configuration of a single instance or of all instances according to the instance address or the component type.

- Modify the configuration of all TiKV instances:

> **Note:**
>
> It is recommended to wrap variable names in backticks.


```sql
set config tikv `split.qps-threshold`=1000;
```

- Modify the configuration of a single TiKV instance:

    
    ```sql
    set config "127.0.0.1:20180" `split.qps-threshold`=1000;
    ```

If the modification is successful, `Query OK` is returned:

```sql
Query OK, 0 rows affected (0.01 sec)
```

If an error occurs during the batch modification, a warning is returned:


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

The batch modification does not guarantee atomicity. The modification might succeed on some instances, while failing on others. If you modify the configuration of the entire TiKV cluster using `set tikv key=val`, your modification might fail on some instances. You can use `show warnings` to check the result.

If some modifications fail, you need to re-execute the corresponding statement or modify each failed instance. If some TiKV instances cannot be accessed due to network issues or machine failure, modify these instances after they are recovered.

If a configuration item is successfully modified, the result is persisted in the configuration file, which will prevail in the subsequent operations. The names of some configuration items might conflict with TiDB reserved words, such as `limit` and `key`. For these configuration items, use backtick `` ` `` to enclose them. For example, `` `raftstore.raft-log-gc-size-limit` ``.

The following TiKV configuration items can be modified dynamically:

| Configuration item | Description |
| :--- | :--- |
| log.level | The log level. |
| `raftstore.raft-max-inflight-msgs` | The number of Raft logs to be confirmed. If this number is exceeded, the Raft state machine slows down log sending. |
| `raftstore.raft-log-gc-tick-interval` | The time interval at which the polling task of deleting Raft logs is scheduled |
| `raftstore.raft-log-gc-threshold` | The soft limit on the maximum allowable number of residual Raft logs |
| `raftstore.raft-log-gc-count-limit` | The hard limit on the allowable number of residual Raft logs |
| `raftstore.raft-log-gc-size-limit` | The hard limit on the allowable size of residual Raft logs |
| `raftstore.raft-max-size-per-msg` | The soft limit on the size of a single message packet that is allowed to be generated |
| `raftstore.raft-entry-max-size` | The hard limit on the maximum size of a single Raft log |
| `raftstore.raft-entry-cache-life-time` | The maximum remaining time allowed for the log cache in memory |
| `raftstore.max-apply-unpersisted-log-limit` | The maximum number of committed but not persisted Raft logs that can be applied |
| `raftstore.split-region-check-tick-interval` | The time interval at which to check whether the Region split is needed |
| `raftstore.region-split-check-diff` | The maximum value by which the Region data is allowed to exceed before Region split |
| `raftstore.region-compact-check-interval` | The time interval at which to check whether it is necessary to manually trigger RocksDB compaction |
| `raftstore.region-compact-check-step` | The number of Regions checked at one time for each round of manual compaction |
| `raftstore.region-compact-min-tombstones` | The number of tombstones required to trigger RocksDB compaction |
| `raftstore.region-compact-tombstones-percent` | The proportion of tombstone required to trigger RocksDB compaction |
| `raftstore.pd-heartbeat-tick-interval` | The time interval at which a Region's heartbeat to PD is triggered |
| `raftstore.pd-store-heartbeat-tick-interval` | The time interval at which a store's heartbeat to PD is triggered |
| `raftstore.snap-mgr-gc-tick-interval` | The time interval at which the recycle of expired snapshot files is triggered |
| `raftstore.snap-gc-timeout` | The longest time for which a snapshot file is saved |
| `raftstore.lock-cf-compact-interval` | The time interval at which TiKV triggers a manual compaction for the Lock Column Family |
| `raftstore.lock-cf-compact-bytes-threshold` | The size at which TiKV triggers a manual compaction for the Lock Column Family |
| `raftstore.messages-per-tick` | The maximum number of messages processed per batch |
| `raftstore.max-peer-down-duration` | The longest inactive duration allowed for a peer |
| `raftstore.max-leader-missing-duration` | The longest duration allowed for a peer to be without a leader. If this value is exceeded, the peer verifies with PD whether it has been deleted. |
| `raftstore.abnormal-leader-missing-duration` | The normal duration allowed for a peer to be without a leader. If this value is exceeded, the peer is seen as abnormal and marked in metrics and logs. |
| `raftstore.peer-stale-state-check-interval` | The time interval to check whether a peer is without a leader |
| `raftstore.consistency-check-interval` | The time interval to check consistency (**NOT** recommended because it is not compatible with the garbage collection in TiDB) |
| `raftstore.raft-store-max-leader-lease` | The longest trusted period of a Raft leader |
| `raftstore.merge-check-tick-interval` | The time interval for merge check |
| `raftstore.cleanup-import-sst-interval` | The time interval to check expired SST files |
| `raftstore.local-read-batch-size` | The maximum number of read requests processed in one batch |
| `raftstore.apply-yield-write-size` | The maximum number of bytes that the Apply thread can write for one FSM (Finite-state Machine) in each round |
| `raftstore.hibernate-timeout` | The shortest wait duration before entering hibernation upon start. Within this duration, TiKV does not hibernate (not released). |
| `raftstore.apply-pool-size` | The number of threads in the pool that flushes data to the disk, which is the size of the Apply thread pool |
| `raftstore.store-pool-size` | The number of threads in the pool that processes Raft, which is the size of the Raftstore thread pool |
| `raftstore.apply-max-batch-size` | Raft state machines process data write requests in batches by the BatchSystem. This configuration item specifies the maximum number of Raft state machines that can execute the requests in one batch. |
| `raftstore.store-max-batch-size` | Raft state machines process requests for flushing logs into the disk in batches by the BatchSystem. This configuration item specifies the maximum number of Raft state machines that can process the requests in one batch. |
| `raftstore.store-io-pool-size` | The number of threads that process Raft I/O tasks, which is also the size of the StoreWriter thread pool (**DO NOT** modify this value from a non-zero value to 0 or from 0 to a non-zero value) |
| `raftstore.periodic-full-compact-start-max-cpu` | The CPU usage threshold at which TiKV performs periodic full compaction if full compaction is enabled |
| `readpool.unified.max-thread-count` | The maximum number of threads in the thread pool that uniformly processes read requests, which is the size of the UnifyReadPool thread pool |
| `readpool.unified.max-tasks-per-worker` | The maximum number of tasks allowed for a single thread in the unified read pool. `Server Is Busy` error is returned when the value is exceeded. |
| `readpool.unified.auto-adjust-pool-size` | Determines whether to automatically adjust the UnifyReadPool thread pool size |
| `resource-control.priority-ctl-strategy` | Configures the flow control strategy of low-priority tasks. |
| `coprocessor.split-region-on-table` | Enables to split Region by table |
| `coprocessor.batch-split-limit` | The threshold of Region split in batches |
| `coprocessor.region-max-size` | The maximum size of a Region |
| `coprocessor.region-split-size` | The size of the newly split Region |
| `coprocessor.region-max-keys` | The maximum number of keys allowed in a Region |
| `coprocessor.region-split-keys` | The number of keys in the newly split Region |
| `pessimistic-txn.wait-for-lock-timeout` | The longest duration that a pessimistic transaction waits for the lock |
| `pessimistic-txn.wake-up-delay-duration` | The duration after which a pessimistic transaction is woken up |
| `pessimistic-txn.pipelined` | Determines whether to enable the pipelined pessimistic locking process |
| `pessimistic-txn.in-memory` | Determines whether to enable the in-memory pessimistic lock |
| `pessimistic-txn.in-memory-peer-size-limit`               | Controls the memory usage limit for in-memory pessimistic locks in a Region                                                                                                                                                                                  |
| `pessimistic-txn.in-memory-instance-size-limit`           | Controls the memory usage limit for in-memory pessimistic locks in a TiKV instance                                                                                                                                                                           |
| `quota.foreground-cpu-time` | The soft limit on the CPU resources used by TiKV foreground to process read and write requests |
| `quota.foreground-write-bandwidth` | The soft limit on the bandwidth with which foreground transactions write data |
| `quota.foreground-read-bandwidth` | The soft limit on the bandwidth with which foreground transactions and the Coprocessor read data |
| `quota.background-cpu-time` | The soft limit on the CPU resources used by TiKV background to process read and write requests |
| `quota.background-write-bandwidth` | The soft limit on the bandwidth with which background transactions write data |
| `quota.background-read-bandwidth` | The soft limit on the bandwidth with which background transactions and the Coprocessor read data |
| `quota.enable-auto-tune` | Whether to enable the auto-tuning of quota. If this configuration item is enabled, TiKV dynamically adjusts the quota for the background requests based on the load of TiKV instances.  |
| `quota.max-delay-duration` | The maximum time that a single read or write request is forced to wait before it is processed in the foreground |
| `gc.ratio-threshold` | The threshold at which Region GC is skipped (the number of GC versions/the number of keys) |
| `gc.batch-keys` | The number of keys processed in one batch |
| `gc.max-write-bytes-per-sec` | The maximum bytes that can be written into RocksDB per second |
| `gc.enable-compaction-filter` | Whether to enable compaction filter |
| `gc.compaction-filter-skip-version-check` | Whether to skip the cluster version check of compaction filter (not released) |
| `{db-name}.max-total-wal-size` | The maximum size of total WAL |
| `{db-name}.max-background-jobs` | The number of background threads in RocksDB |
| `{db-name}.max-background-flushes` | The maximum number of flush threads in RocksDB |
| `{db-name}.max-open-files` | The total number of files that RocksDB can open |
| `{db-name}.compaction-readahead-size` | The size of `readahead` during compaction |
| `{db-name}.bytes-per-sync` | The rate at which OS incrementally synchronizes files to disk while these files are being written asynchronously |
| `{db-name}.wal-bytes-per-sync` | The rate at which OS incrementally synchronizes WAL files to disk while the WAL files are being written |
| `{db-name}.writable-file-max-buffer-size` | The maximum buffer size used in WritableFileWrite |
| `{db-name}.{cf-name}.block-cache-size` | The cache size of a block |
| `{db-name}.{cf-name}.write-buffer-size` | The size of a memtable |
| `{db-name}.{cf-name}.max-write-buffer-number` | The maximum number of memtables |
| `{db-name}.{cf-name}.max-bytes-for-level-base` | The maximum number of bytes at base level (L1) |
| `{db-name}.{cf-name}.target-file-size-base` | The size of the target file at base level |
| `{db-name}.{cf-name}.level0-file-num-compaction-trigger` | The maximum number of files at L0 that trigger compaction |
| `{db-name}.{cf-name}.level0-slowdown-writes-trigger` | The maximum number of files at L0 that trigger write stall |
| `{db-name}.{cf-name}.level0-stop-writes-trigger` | The maximum number of files at L0 that completely block write |
| `{db-name}.{cf-name}.max-compaction-bytes` | The maximum number of bytes written into disk per compaction |
| `{db-name}.{cf-name}.max-bytes-for-level-multiplier` | The default amplification multiple for each layer |
| `{db-name}.{cf-name}.disable-auto-compactions` | Enables or disables automatic compaction |
| `{db-name}.{cf-name}.soft-pending-compaction-bytes-limit` | The soft limit on the pending compaction bytes |
| `{db-name}.{cf-name}.hard-pending-compaction-bytes-limit` | The hard limit on the pending compaction bytes |
| `{db-name}.{cf-name}.titan.blob-run-mode` | The mode of processing blob files |
| `{db-name}.{cf-name}.titan.min-blob-size` | The threshold at which data is stored in Titan. Data is stored in a Titan blob file when its value reaches this threshold. |
| `{db-name}.{cf-name}.titan.blob-file-compression` | The compression algorithm used by Titan blob files |
| `{db-name}.{cf-name}.titan.discardable-ratio` | The threshold of garbage data ratio in Titan data files for GC. When the ratio of useless data in a blob file exceeds the threshold, Titan GC is triggered. |
| `server.grpc-memory-pool-quota` | Limits the memory size that can be used by gRPC |
| `server.max-grpc-send-msg-len` | Sets the maximum length of a gRPC message that can be sent |
| `server.snap-io-max-bytes-per-sec` | Sets the maximum allowable disk bandwidth when processing snapshots |
| `server.concurrent-send-snap-limit` | Sets the maximum number of snapshots sent at the same time |
| `server.concurrent-recv-snap-limit` | Sets the maximum number of snapshots received at the same time |
| `server.raft-msg-max-batch-size` | Sets the maximum number of Raft messages that are contained in a single gRPC message |
| `server.simplify-metrics`        | Controls whether to simplify the sampling monitoring metrics                   |
| `storage.block-cache.capacity` | The size of shared block cache (supported since v4.0.3) |
| storage.flow-control.enable | Determines whether to enable the flow control mechanism |
| storage.flow-control.memtables-threshold | The maximum number of kvDB memtables that trigger flow control |
| storage.flow-control.l0-files-threshold | The maximum number of kvDB L0 files that trigger flow control |
| storage.flow-control.soft-pending-compaction-bytes-limit | The threshold of kvDB pending compaction bytes that triggers flow control mechanism to reject some write requests |
| storage.flow-control.hard-pending-compaction-bytes-limit | The threshold of kvDB pending compaction bytes that triggers flow control mechanism to reject all write requests |
| `storage.scheduler-worker-pool-size` | The number of threads in the Scheduler thread pool |
| `import.num-threads` | The number of threads to process restore or import RPC requests (dynamic modification is supported starting from v8.1.2) |
| `backup.num-threads` | The number of backup threads (supported since v4.0.3) |
| `split.qps-threshold` | The threshold to execute `load-base-split` on a Region. If the QPS of read requests for a Region exceeds `qps-threshold` for 10 consecutive seconds, this Region should be split.|
| `split.byte-threshold` | The threshold to execute `load-base-split` on a Region. If the traffic of read requests for a Region exceeds the `byte-threshold` for 10 consecutive seconds, this Region should be split. |
| `split.region-cpu-overload-threshold-ratio` | The threshold to execute `load-base-split` on a Region. If the CPU usage in the Unified Read Pool for a Region exceeds the `region-cpu-overload-threshold-ratio` for 10 consecutive seconds, this Region should be split. (supported since v6.2.0) |
| `split.split-balance-score` | The parameter of `load-base-split`, which ensures the load of the two split Regions is as balanced as possible. The smaller the value is, the more balanced the load is. But setting it too small might cause split failure. |
| `split.split-contained-score` | The parameter of `load-base-split`. The smaller the value, the fewer cross-Region visits after Region split. |
| `cdc.min-ts-interval` | The time interval at which Resolved TS is forwarded  |
| `cdc.old-value-cache-memory-quota` | The upper limit of memory occupied by the TiCDC Old Value entries |
| `cdc.sink-memory-quota` | The upper limit of memory occupied by TiCDC data change events |
| `cdc.incremental-scan-speed-limit` | The upper limit on the speed of incremental scanning for historical data |
| `cdc.incremental-scan-concurrency` | The maximum number of concurrent incremental scanning tasks for historical data |

In the table above, parameters with the `{db-name}` or `{db-name}.{cf-name}` prefix are configurations related to RocksDB. The optional values of `db-name` are `rocksdb` and `raftdb`.

- When `db-name` is `rocksdb`, the optional values of `cf-name` are `defaultcf`, `writecf`, `lockcf`, and `raftcf`.
- When `db-name` is `raftdb`, the value of `cf-name` can be `defaultcf`.

For detailed parameter description, refer to [TiKV Configuration File](/tikv-configuration-file.md).

### Modify PD configuration dynamically

Currently, PD does not support the separate configuration for each instance. All PD instances share the same configuration.

You can modify the PD configurations using the following statement:


```sql
set config pd `log.level`='info';
```

If the modification is successful, `Query OK` is returned:

```sql
Query OK, 0 rows affected (0.01 sec)
```

If a configuration item is successfully modified, the result is persisted in etcd instead of in the configuration file; the configuration in etcd will prevail in the subsequent operations. The names of some configuration items might conflict with TiDB reserved words. For these configuration items, use backtick `` ` `` to enclose them. For example, `` `schedule.leader-schedule-limit` ``.

The following PD configuration items can be modified dynamically:

| Configuration item | Description |
| :--- | :--- |
| `log.level` | The log level |
| `cluster-version` | The cluster version |
| `schedule.max-merge-region-size` | Controls the size limit of `Region Merge` (in MiB) |
| `schedule.max-merge-region-keys` | Specifies the maximum numbers of the `Region Merge` keys |
| `schedule.patrol-region-interval` | Determines the frequency at which the checker inspects the health state of a Region |
| `schedule.split-merge-interval` | Determines the time interval of performing split and merge operations on the same Region |
| `schedule.max-snapshot-count` | Determines the maximum number of snapshots that a single store can send or receive at the same time |
| `schedule.max-pending-peer-count` | Determines the maximum number of pending peers in a single store |
| `schedule.max-store-down-time` | The downtime after which PD judges that the disconnected store cannot be recovered |
| `schedule.max-store-preparing-time` | Controls the maximum waiting time for the store to go online |
| `schedule.leader-schedule-policy` | Determines the policy of Leader scheduling |
| `schedule.leader-schedule-limit` | The number of Leader scheduling tasks performed at the same time |
| `schedule.region-schedule-limit` | The number of Region scheduling tasks performed at the same time |
| `schedule.replica-schedule-limit` | The number of Replica scheduling tasks performed at the same time |
| `schedule.merge-schedule-limit` | The number of the `Region Merge` scheduling tasks performed at the same time |
| `schedule.hot-region-schedule-limit` | The number of hot Region scheduling tasks performed at the same time |
| `schedule.hot-region-cache-hits-threshold` | Determines the threshold at which a Region is considered a hot spot |
| `schedule.high-space-ratio` | The threshold ratio below which the capacity of the store is sufficient |
| `schedule.low-space-ratio` | The threshold ratio above which the capacity of the store is insufficient |
| `schedule.tolerant-size-ratio` | Controls the `balance` buffer size|
| `schedule.enable-remove-down-replica` | Determines whether to enable the feature that automatically removes `DownReplica` |
| `schedule.enable-replace-offline-replica` | Determines whether to enable the feature that migrates `OfflineReplica` |
| `schedule.enable-make-up-replica` | Determines whether to enable the feature that automatically supplements replicas |
| `schedule.enable-remove-extra-replica` | Determines whether to enable the feature that removes extra replicas |
| `schedule.enable-location-replacement` | Determines whether to enable isolation level check |
| `schedule.enable-cross-table-merge` | Determines whether to enable cross-table merge |
| `schedule.enable-one-way-merge` | Enables one-way merge, which only allows merging with the next adjacent Region |
| `schedule.region-score-formula-version` | Controls the version of the Region score formula |
| `schedule.scheduler-max-waiting-operator` | Controls the number of waiting operators in each scheduler |
| `schedule.enable-debug-metrics` | Enables the metrics for debugging |
| `schedule.enable-heartbeat-concurrent-runner` | Enables asynchronous concurrent processing for Region heartbeats |
| `schedule.enable-heartbeat-breakdown-metrics` | Enables breakdown metrics for Region heartbeats to measure the time consumed in each stage of Region heartbeat processing |
| `schedule.enable-joint-consensus` | Controls whether to use Joint Consensus for replica scheduling |
| `schedule.hot-regions-write-interval` | The time interval at which PD stores hot Region information |
| `schedule.hot-regions-reserved-days` | Specifies how many days the hot Region information is retained |
| `schedule.max-movable-hot-peer-size` | Controls the maximum Region size that can be scheduled for hot Region scheduling. |
| `schedule.store-limit-version` | Controls the version of [store limit](/configure-store-limit.md) |
| `schedule.patrol-region-worker-count` | Controls the number of concurrent operators created by the checker when inspecting the health state of a Region |
| `replication.max-replicas` | Sets the maximum number of replicas |
| `replication.location-labels` | The topology information of a TiKV cluster |
| `replication.enable-placement-rules` | Enables Placement Rules |
| `replication.strictly-match-label` | Enables the label check |
| `replication.isolation-level` | The minimum topological isolation level of a TiKV cluster |
| `pd-server.use-region-storage` | Enables independent Region storage |
| `pd-server.max-gap-reset-ts` | Sets the maximum interval of resetting timestamp (BR) |
| `pd-server.key-type` | Sets the cluster key type |
| `pd-server.metric-storage` | Sets the storage address of the cluster metrics |
| `pd-server.dashboard-address` | Sets the dashboard address |
| `pd-server.flow-round-by-digit` | Specifies the number of lowest digits to round for the Region flow information |
| `pd-server.min-resolved-ts-persistence-interval` | Determines the interval at which the minimum resolved timestamp is persistent to the PD |
| `pd-server.server-memory-limit` | The memory limit ratio for a PD instance |
| `pd-server.server-memory-limit-gc-trigger` | The threshold ratio at which PD tries to trigger GC |
| `pd-server.enable-gogc-tuner` | Controls whether to enable the GOGC Tuner |
| `pd-server.gc-tuner-threshold` | The maximum memory threshold ratio for tuning GOGC |
| `replication-mode.replication-mode` | Sets the backup mode |
| `replication-mode.dr-auto-sync.label-key` | Distinguishes different AZs and needs to match Placement Rules |
| `replication-mode.dr-auto-sync.primary` | The primary AZ |
| `replication-mode.dr-auto-sync.dr` | The disaster recovery (DR) AZ |
| `replication-mode.dr-auto-sync.primary-replicas` | The number of Voter replicas in the primary AZ |
| `replication-mode.dr-auto-sync.dr-replicas` | The number of Voter replicas in the disaster recovery (DR) AZ |
| `replication-mode.dr-auto-sync.wait-store-timeout` | The waiting time for switching to asynchronous replication mode when network isolation or failure occurs |
| `replication-mode.dr-auto-sync.wait-recover-timeout` | The waiting time for switching back to the `sync-recover` status after the network recovers |
| `replication-mode.dr-auto-sync.pause-region-split` | Controls whether to pause Region split operations in the `async_wait` and `async` statuses |

For detailed parameter description, refer to [PD Configuration File](/pd-configuration-file.md).

### Modify TiDB configuration dynamically

Currently, the method of changing TiDB configuration is different from that of changing TiKV and PD configurations. You can modify TiDB configuration by using [system variables](/system-variables.md).

The following example shows how to dynamically modify `slow-threshold` by using the `tidb_slow_log_threshold` variable.

The default value of `slow-threshold` is 300 ms. You can set it to 200 ms by using `tidb_slow_log_threshold`.


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

The following TiDB configuration items can be modified dynamically:

| Configuration item | SQL variable | Description |
| --- | --- | --- |
| `instance.tidb_enable_slow_log` | `tidb_enable_slow_log` | Controls whether to enable slow log |
| `instance.tidb_slow_log_threshold` | `tidb_slow_log_threshold` | Specifies the threshold of slow log |
| `instance.tidb_expensive_query_time_threshold` | `tidb_expensive_query_time_threshold` | Specifies the threshold of an expensive query |
| `instance.tidb_enable_collect_execution_info` | `tidb_enable_collect_execution_info` | Controls whether to record the execution information of operators |
| `instance.tidb_record_plan_in_slow_log` | `tidb_record_plan_in_slow_log` | Controls whether to record execution plans in the slow log |
| `instance.tidb_force_priority` | `tidb_force_priority` | Specifies the priority of statements that are submitted from this TiDB instance |
| `instance.max_connections` | `max_connections` | Specifies the maximum number of concurrent connections permitted for this TiDB instance |
| `instance.tidb_enable_ddl` | `tidb_enable_ddl` | Controls whether this TiDB instance can become a DDL owner |
| `pessimistic-txn.constraint-check-in-place-pessimistic` | `tidb_constraint_check_in_place_pessimistic` | Controls whether to defer the unique constraint check of a unique index to the next time when this index requires a lock or to the time when the transaction is committed |

### Modify TiFlash configuration dynamically

Currently, you can modify the TiFlash configuration `max_threads` by using the system variable [`tidb_max_tiflash_threads`](/system-variables.md#tidb_max_tiflash_threads-new-in-v610), which specifies the maximum concurrency for TiFlash to execute a request.

The default value of `tidb_max_tiflash_threads` is `-1`, indicating that this system variable is invalid and depends on the setting of the TiFlash configuration file. You can set `max_threads` to 10 by using `tidb_max_tiflash_threads`:


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
