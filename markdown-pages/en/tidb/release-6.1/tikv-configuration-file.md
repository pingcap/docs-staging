---
title: TiKV Configuration File
summary: Learn the TiKV configuration file.
aliases: ['/docs/stable/reference/configuration/tikv-server/configuration-file/']
---

# TiKV Configuration File

<!-- markdownlint-disable MD001 -->

The TiKV configuration file supports more options than command-line parameters. You can find the default configuration file in [etc/config-template.toml](https://github.com/tikv/tikv/blob/master/etc/config-template.toml) and rename it to `config.toml`.

This document only describes the parameters that are not included in command-line parameters. For more details, see [command-line parameter](/command-line-flags-for-tikv-configuration.md).

> **Tip:**
>
> If you need to adjust the value of a configuration item, refer to [Modify the configuration](/maintain-tidb-using-tiup.md#modify-the-configuration).

## Global configuration

### `abort-on-panic`

+ Sets whether to call `abort()` to exit the process when TiKV panics. This option affects whether TiKV allows the system to generate core dump files.

    + If the value of this configuration item is `false`, when TiKV panics, it calls `exit()` to exit the process.
    + If the value of this configuration item is `true`, when TiKV panics, TiKV calls `abort()` to exit the process. At this time, TiKV allows the system to generate core dump files when exiting. To generate the core dump file, you also need to perform the system configuration related to core dump (for example, setting the size limit of the core dump file via `ulimit -c` command, and configure the core dump path. Different operating systems have different related configurations). To avoid the core dump files occupying too much disk space and causing insufficient TiKV disk space, it is recommended to set the core dump generation path to a disk partition different to that of TiKV data.

+ Default value: `false`

### `slow-log-file`

+ The file that stores slow logs
+ If this configuration item is not set, but `log.file.filename` is set, slow logs are output to the log file specified by `log.file.filename`.
+ If neither `slow-log-file` nor `log.file.filename` are set, all logs are output to "stderr" by default.
+ If both configuration items are set, ordinary logs are output to the log file specified by `log.file.filename`, and slow logs are output to the log file set by `slow-log-file`.
+ Default value: `""`

### `slow-log-threshold`

+ The threshold for outputing slow logs. If the processing time is longer than this threshold, slow logs are output.
+ Default value: `"1s"`

## log <span class="version-mark">New in v5.4.0</span>

+ Configuration items related to the log.

+ From v5.4.0, to make the log configuration items of TiKV and TiDB consistent, TiKV deprecates the former configuration item `log-rotation-timespan` and changes `log-level`, `log-format`, `log-file`, `log-rotation-size` to the following ones. If you only set the old configuration items, and their values are set to non-default values, the old items remain compatible with the new items. If both old and new configuration items are set, the new items take effect.

### `level` <span class="version-mark">New in v5.4.0</span>

+ The log level
+ Optional values: `"debug"`, `"info"`, `"warn"`, `"error"`, `"fatal"`
+ Default value: `"info"`

### `format` <span class="version-mark">New in v5.4.0</span>

+ The log format
+ Optional values: `"json"`, `"text"`
+ Default value: `"text"`

### `enable-timestamp` <span class="version-mark">New in v5.4.0</span>

+ Determines whether to enable or disable the timestamp in the log
+ Optional values: `true`, `false`
+ Default value: `true`

## log.file <span class="version-mark">New in v5.4.0</span>

+ Configuration items related to the log file.

### `filename` <span class="version-mark">New in v5.4.0</span>

+ The log file. If this configuration item is not set, logs are output to "stderr" by default. If this configuration item is set, logs are output to the corresponding file.
+ Default value: `""`

### `max-size` <span class="version-mark">New in v5.4.0</span>

+ The maximum size of a single log file. When the file size is larger than the value set by this configuration item, the system automatically splits the single file into multiple files.
+ Default value: `300`
+ Maximum value: `4096`
+ Unit: MiB

### `max-days` <span class="version-mark">New in v5.4.0</span>

+ The maximum number of days that TiKV keeps log files.
    + If the configuration item is not set, or the value of it is set to the default value `0`, TiKV does not clean log files.
    + If the parameter is set to a value other than `0`, TiKV cleans up the expired log files after `max-days`.
+ Default value: `0`

### `max-backups` <span class="version-mark">New in v5.4.0</span>

+ The maximum number of log files that TiKV keeps.
    + If the configuration item is not set, or the value of it is set to the default value `0`, TiKV keeps all log files.
    + If the configuration item is set to a value other than `0`, TiKV keeps at most the number of old log files specified by `max-backups`. For example, if the value is set to `7`, TiKV keeps up to 7 old log files.
+ Default value: `0`

## server

+ Configuration items related to the server.

### `status-thread-pool-size`

+ The number of worker threads for the `HTTP` API service
+ Default value: `1`
+ Minimum value: `1`

### `grpc-compression-type`

+ The compression algorithm for gRPC messages
+ Optional values: `"none"`, `"deflate"`, `"gzip"`
+ Default value: `"none"`

### `grpc-concurrency`

+ The number of gRPC worker threads. When you modify the size of the gRPC thread pool, refer to [Performance tuning for TiKV thread pools](/tune-tikv-thread-performance.md#performance-tuning-for-tikv-thread-pools).
+ Default value: `5`
+ Minimum value: `1`

### `grpc-concurrent-stream`

+ The maximum number of concurrent requests allowed in a gRPC stream
+ Default value: `1024`
+ Minimum value: `1`

### `grpc-memory-pool-quota`

+ Limits the memory size that can be used by gRPC
+ Default value: No limit
+ Limit the memory in case OOM is observed. Note that limit the usage can lead to potential stall

### `grpc-raft-conn-num`

+ The maximum number of connections between TiKV nodes for Raft communication
+ Default value: `1`
+ Minimum value: `1`

### `max-grpc-send-msg-len`

+ Sets the maximum length of a gRPC message that can be sent
+ Default value: `10485760`
+ Unit: Bytes
+ Maximum value: `2147483647`

### `grpc-stream-initial-window-size`

+ The window size of the gRPC stream
+ Default value: `2MB`
+ Unit: KB|MB|GB
+ Minimum value: `"1KB"`

### `grpc-keepalive-time`

+ The time interval at which that gRPC sends `keepalive` Ping messages
+ Default value: `"10s"`
+ Minimum value: `"1s"`

### `grpc-keepalive-timeout`

+ Disables the timeout for gRPC streams
+ Default value: `"3s"`
+ Minimum value: `"1s"`

### `concurrent-send-snap-limit`

+ The maximum number of snapshots sent at the same time
+ Default value: `32`
+ Minimum value: `1`

### `concurrent-recv-snap-limit`

+ The maximum number of snapshots received at the same time
+ Default value: `32`
+ Minimum value: `1`

### `end-point-recursion-limit`

+ The maximum number of recursive levels allowed when TiKV decodes the Coprocessor DAG expression
+ Default value: `1000`
+ Minimum value: `1`

### `end-point-request-max-handle-duration`

+ The longest duration allowed for a TiDB's push down request to TiKV for processing tasks
+ Default value: `"60s"`
+ Minimum value: `"1s"`

### `snap-max-write-bytes-per-sec`

+ The maximum allowable disk bandwidth when processing snapshots
+ Default value: `"100MB"`
+ Unit: KB|MB|GB
+ Minimum value: `"1KB"`

### `end-point-slow-log-threshold`

+ The time threshold for a TiDB's push-down request to output slow log. If the processing time is longer than this threshold, the slow logs are output.
+ Default value: `"1s"`
+ Minimum value: `0`

### `raft-client-queue-size`

+ Specifies the queue size of the Raft messages in TiKV. If too many messages not sent in time result in a full buffer, or messages discarded, you can specify a greater value to improve system stability.
+ Default value: `8192`

### `simplify-metrics` <span class="version-mark">New in v6.1.1</span>

+ Specifies whether to simplify the returned monitoring metrics. After you set the value to `true`, TiKV reduces the amount of data returned for each request by filtering out some metrics.
+ Default value: `false`

### `forward-max-connections-per-address` <span class="version-mark">New in v5.0.0</span>

+ Sets the size of the connection pool for service and forwarding requests to the server. Setting it to too small a value affects the request latency and load balancing.
+ Default value: `4`

## readpool.unified

Configuration items related to the single thread pool serving read requests. This thread pool supersedes the original storage thread pool and coprocessor thread pool since the 4.0 version.

### `min-thread-count`

+ The minimal working thread count of the unified read pool
+ Default value: `1`

### `max-thread-count`

+ The maximum working thread count of the unified read pool or the UnifyReadPool thread pool. When you modify the size of this thread pool, refer to [Performance tuning for TiKV thread pools](/tune-tikv-thread-performance.md#performance-tuning-for-tikv-thread-pools).
+ Value range: `[min-thread-count, MAX(4, CPU)]`. In `MAX(4, CPU)`, `CPU` means the number of your CPU cores. `MAX(4, CPU)` takes the greater value out of `4` and the `CPU`.
+ Default value: MAX(4, CPU * 0.8)

### `stack-size`

+ The stack size of the threads in the unified thread pool
+ Type: Integer + Unit
+ Default value: `"10MB"`
+ Unit: KB|MB|GB
+ Minimum value: `"2MB"`
+ Maximum value: The number of Kbytes output in the result of the `ulimit -sH` command executed in the system.

### `max-tasks-per-worker`

+ The maximum number of tasks allowed for a single thread in the unified read pool. `Server Is Busy` is returned when the value is exceeded.
+ Default value: `2000`
+ Minimum value: `2`

## readpool.storage

Configuration items related to storage thread pool.

### `use-unified-pool`

+ Determines whether to use the unified thread pool (configured in [`readpool.unified`](#readpoolunified)) for storage requests. If the value of this parameter is `false`, a separate thread pool is used, which is configured through the rest parameters in this section (`readpool.storage`).
+ Default value: If this section (`readpool.storage`) has no other configurations, the default value is `true`. Otherwise, for the backward compatibility, the default value is `false`. Change the configuration in [`readpool.unified`](#readpoolunified) as needed before enabling this option.

### `high-concurrency`

+ The allowable number of concurrent threads that handle high-priority `read` requests
+ When `8` ≤ `cpu num` ≤ `16`, the default value is `cpu_num * 0.5`; when `cpu num` is smaller than `8`, the default value is `4`; when `cpu num` is greater than `16`, the default value is `8`.
+ Minimum value: `1`

### `normal-concurrency`

+ The allowable number of concurrent threads that handle normal-priority `read` requests
+ When `8` ≤ `cpu num` ≤ `16`, the default value is `cpu_num * 0.5`; when `cpu num` is smaller than `8`, the default value is `4`; when `cpu num` is greater than `16`, the default value is `8`.
+ Minimum value: `1`

### `low-concurrency`

+ The allowable number of concurrent threads that handle low-priority `read` requests
+ When `8` ≤ `cpu num` ≤ `16`, the default value is `cpu_num * 0.5`; when `cpu num` is smaller than `8`, the default value is `4`; when `cpu num` is greater than `16`, the default value is `8`.
+ Minimum value: `1`

### `max-tasks-per-worker-high`

+ The maximum number of tasks allowed for a single thread in a high-priority thread pool. `Server Is Busy` is returned when the value is exceeded.
+ Default value: `2000`
+ Minimum value: `2`

### `max-tasks-per-worker-normal`

+ The maximum number of tasks allowed for a single thread in a normal-priority thread pool. `Server Is Busy` is returned when the value is exceeded.
+ Default value: `2000`
+ Minimum value: `2`

### `max-tasks-per-worker-low`

+ The maximum number of tasks allowed for a single thread in a low-priority thread pool. `Server Is Busy` is returned when the value is exceeded.
+ Default value: `2000`
+ Minimum value: `2`

### `stack-size`

+ The stack size of threads in the Storage read thread pool
+ Type: Integer + Unit
+ Default value: `"10MB"`
+ Unit: KB|MB|GB
+ Minimum value: `"2MB"`
+ Maximum value: The number of Kbytes output in the result of the `ulimit -sH` command executed in the system.

## `readpool.coprocessor`

Configuration items related to the Coprocessor thread pool.

### `use-unified-pool`

+ Determines whether to use the unified thread pool (configured in [`readpool.unified`](#readpoolunified)) for coprocessor requests. If the value of this parameter is `false`, a separate thread pool is used, which is configured through the rest parameters in this section (`readpool.coprocessor`).
+ Default value: If none of the parameters in this section (`readpool.coprocessor`) are set, the default value is `true`. Otherwise, the default value is `false` for the backward compatibility. Adjust the configuration items in [`readpool.unified`](#readpoolunified) before enabling this parameter.

### `high-concurrency`

+ The allowable number of concurrent threads that handle high-priority Coprocessor requests, such as checkpoints
+ Default value: `CPU * 0.8`
+ Minimum value: `1`

### `normal-concurrency`

+ The allowable number of concurrent threads that handle normal-priority Coprocessor requests
+ Default value: `CPU * 0.8`
+ Minimum value: `1`

### `low-concurrency`

+ The allowable number of concurrent threads that handle low-priority Coprocessor requests, such as table scan
+ Default value: `CPU * 0.8`
+ Minimum value: `1`

### `max-tasks-per-worker-high`

+ The number of tasks allowed for a single thread in a high-priority thread pool. When this number is exceeded, `Server Is Busy` is returned.
+ Default value: `2000`
+ Minimum value: `2`

### `max-tasks-per-worker-normal`

+ The number of tasks allowed for a single thread in a normal-priority thread pool. When this number is exceeded, `Server Is Busy` is returned.
+ Default value: `2000`
+ Minimum value: `2`

### `max-tasks-per-worker-low`

+ The number of tasks allowed for a single thread in a low-priority thread pool. When this number is exceeded, `Server Is Busy` is returned.
+ Default value: `2000`
+ Minimum value: `2`

### `stack-size`

+ The stack size of the thread in the Coprocessor thread pool
+ Type: Integer + Unit
+ Default value: `"10MB"`
+ Unit: KB|MB|GB
+ Minimum value: `"2MB"`
+ Maximum value: The number of Kbytes output in the result of the `ulimit -sH` command executed in the system.

## storage

Configuration items related to storage.

### `scheduler-concurrency`

+ A built-in memory lock mechanism to prevent simultaneous operations on a key. Each key has a hash in a different slot.
+ Default value: `524288`
+ Minimum value: `1`

### `scheduler-worker-pool-size`

+ The number of threads in the Scheduler thread pool. Scheduler threads are mainly used for checking transaction consistency before data writing. If the number of CPU cores is greater than or equal to `16`, the default value is `8`; otherwise, the default value is `4`. When you modify the size of the Scheduler thread pool, refer to [Performance tuning for TiKV thread pools](/tune-tikv-thread-performance.md#performance-tuning-for-tikv-thread-pools).
+ Default value: `4`
+ Value range: `[1, MAX(4, CPU)]`. In `MAX(4, CPU)`, `CPU` means the number of your CPU cores. `MAX(4, CPU)` takes the greater value out of `4` and the `CPU`.

### `scheduler-pending-write-threshold`

+ The maximum size of the write queue. A `Server Is Busy` error is returned for a new write to TiKV when this value is exceeded.
+ Default value: `"100MB"`
+ Unit: MB|GB

### `reserve-space`

+ When TiKV is started, some space is reserved on the disk as disk protection. When the remaining disk space is less than the reserved space, TiKV restricts some write operations. The reserved space is divided into two parts: 80% of the reserved space is used as the extra disk space required for operations when the disk space is insufficient, and the other 20% is used to store the temporary file. In the process of reclaiming space, if the storage is exhausted by using too much extra disk space, this temporary file serves as the last protection for restoring services.
+ The name of the temporary file is `space_placeholder_file`, located in the `storage.data-dir` directory. When TiKV goes offline because its disk space ran out, if you restart TiKV, the temporary file is automatically deleted and TiKV tries to reclaim the space.
+ When the remaining space is insufficient, TiKV does not create the temporary file. The effectiveness of the protection is related to the size of the reserved space. The size of the reserved space is the larger value between 5% of the disk capacity and this configuration value. When the value of this configuration item is `"0MB"`, TiKV disables this disk protection feature.
+ Default value: `"5GB"`
+ Unit: MB|GB

### `enable-ttl`

> **Warning:**
>
> - Set `enable-ttl` to `true` or `false` **ONLY WHEN** deploying a new TiKV cluster. **DO NOT** modify the value of this configuration item in an existing TiKV cluster. TiKV clusters with different `enable-ttl` values use different data formats. Therefore, if you modify the value of this item in an existing TiKV cluster, the cluster will store data in different formats, which causes the "can't enable TTL on a non-ttl" error when you restart the TiKV cluster.
> - Use `enable-ttl` **ONLY IN** a TiKV cluster. **DO NOT** use this configuration item in a cluster that has TiDB nodes (which means setting `enable-ttl` to `true` in such clusters) unless `storage.api-version = 2` is configured. Otherwise, critical issues such as data corruption and the upgrade failure of TiDB clusters will occur.

+ TTL is short for "Time to live". If this item is enabled, TiKV automatically deletes data that reaches its TTL. To set the value of TTL, you need to specify it in the requests when writing data via the client. If the TTL is not specified, it means that TiKV does not automatically delete the corresponding data.
+ Default value: `false`

### `ttl-check-poll-interval`

+ The interval of checking data to reclaim physical spaces. If data reaches its TTL, TiKV forcibly reclaims its physical space during the check.
+ Default value: `"12h"`
+ Minimum value: `"0s"`

### `background-error-recovery-window` <span class="version-mark">New in v6.1.0</span>

+ The maximum allowable time for TiKV to recover after RocksDB detects a recoverable background error. If some background SST files are damaged, RocksDB will report to PD via heartbeat after locating the Peer to which the damaged SST files belong. PD then performs scheduling operations to remove this Peer. Finally, the damaged SST files are deleted directly, and the TiKV background will work as normal again.
+ The damaged SST files still exist before the recovery finishes. During such a period, RocksDB can continue writing data, but an error will be reported when the damaged part of the data is read.
+ If the recovery fails to finish within this time window, TiKV will panic.
+ Default value: 1h

### `api-version` <span class="version-mark">New in v6.1.0</span>

+ The storage format and interface version used by TiKV when TiKV serves as the raw key-value store.
+ Value options:
    + `1`: Uses API V1, does not encode the data passed from the client, and stores data as it is. In versions earlier than v6.1.0, TiKV uses API V1 by default.
    + `2`: Uses API V2:
        + The data is stored in the [Multi-Version Concurrency Control (MVCC)](/glossary.md#multi-version-concurrency-control-mvcc) format, where the timestamp is obtained from PD (which is TSO) by tikv-server.
        + When API V2 is used, you are expected to set `storage.enable-ttl = true` at the same time. Because API V2 supports the TTL feature, you must turn on [`enable-ttl`](#enable-ttl) explicitly. Otherwise, it will be in conflict because `storage.enable-ttl` defaults to `false`.
        + When API V2 is enabled, you need to deploy at least one tidb-server instance to reclaim expired data. Note that this tidb-server instance cannot provide read or write services. To ensure high availability, you can deploy multiple tidb-server instances.
        + Client support is required for API V2. For details, see the corresponding instruction of the client for the API V2.
+ Default value: `1`

> **Warning:**

> - TiKV API V2 is still an experimental feature. It is not recommended to use it in production environments.
> - You can set the value of `api-version` to `2` **only when** deploying a new TiKV cluster. **Do not** modify the value of this configuration item in an existing TiKV cluster. TiKV clusters with different `api-version` values use different data formats. Therefore, if you modify the value of this item in an existing TiKV cluster, the cluster will store data in different formats and causes data corruption. It will raise the "unable to switch storage.api_version" error when you start the TiKV cluster.
> - After API V2 is enabled, you **cannot** downgrade the TiKV cluster to a version earlier than v6.1.0. Otherwise, data corruption might occur.

## storage.block-cache

Configuration items related to the sharing of block cache among multiple RocksDB Column Families (CF). When these configuration items are enabled, block cache separately configured for each column family is disabled.

### `shared`

+ Enables or disables the sharing of block cache.
+ Default value: `true`

### `capacity`

+ The size of the shared block cache.
+ Default value: 45% of the size of total system memory
+ Unit: KB|MB|GB

## storage.flow-control

Configuration items related to the flow control mechanism in TiKV. This mechanism replaces the write stall mechanism in RocksDB and controls flow at the scheduler layer, which avoids secondary disasters caused by the stuck Raftstore or Apply threads.

### `enable`

+ Determines whether to enable the flow control mechanism. After it is enabled, TiKV automatically disables the write stall mechanism of KvDB and the write stall mechanism of RaftDB (excluding memtable).
+ Default value: `true`

### `memtables-threshold`

+ When the number of kvDB memtables reaches this threshold, the flow control mechanism starts to work. When `enable` is set to `true`, this configuration item overrides `rocksdb.(defaultcf|writecf|lockcf).max-write-buffer-number`.
+ Default value: `5`

### `l0-files-threshold`

+ When the number of kvDB L0 files reaches this threshold, the flow control mechanism starts to work. When `enable` is set to `true`, this configuration item overrides `rocksdb.(defaultcf|writecf|lockcf).level0-slowdown-writes-trigger`.
+ Default value: `20`

### `soft-pending-compaction-bytes-limit`

+ When the pending compaction bytes in KvDB reach this threshold, the flow control mechanism starts to reject some write requests and reports the `ServerIsBusy` error. When `enable` is set to `true`, this configuration item overrides `rocksdb.(defaultcf|writecf|lockcf).soft-pending-compaction-bytes-limit`.
+ Default value: `"192GB"`

### `hard-pending-compaction-bytes-limit`

+ When the pending compaction bytes in KvDB reach this threshold, the flow control mechanism rejects all write requests and reports the `ServerIsBusy` error. When `enable` is set to `true`, this configuration item overrides `rocksdb.(defaultcf|writecf|lockcf).hard-pending-compaction-bytes-limit`.
+ Default value: `"1024GB"`

## storage.io-rate-limit

Configuration items related to the I/O rate limiter.

### `max-bytes-per-sec`

+ Limits the maximum I/O bytes that a server can write to or read from the disk (determined by the `mode` configuration item below) in one second. When this limit is reached, TiKV prefers throttling background operations over foreground ones. The value of this configuration item should be set to the disk's optimal I/O bandwidth, for example, the maximum I/O bandwidth specified by your cloud disk vendor. When this configuration value is set to zero, disk I/O operations are not limited.
+ Default value: `"0MB"`

### `mode`

+ Determines which types of I/O operations are counted and restrained below the `max-bytes-per-sec` threshold. Currently, only the write-only mode is supported.
+ Optional value: `"write-only"`
+ Default value: `"write-only"`

## pd

### `enable-forwarding` <span class="version-mark">New in v5.0.0</span>

+ Controls whether the PD client in TiKV forwards requests to the leader via the followers in the case of possible network isolation.
+ Default value: `false`
+ If the environment might have isolated network, enabling this parameter can reduce the window of service unavailability.
+ If you cannot accurately determine whether isolation, network interruption, or downtime has occurred, using this mechanism has the risk of misjudgment and causes reduced availability and performance. If network failure has never occurred, it is not recommended to enable this parameter.

### `endpoints`

+ The endpoints of PD. When multiple endpoints are specified, you need to separate them using commas.
+ Default value: `["127.0.0.1:2379"]`

### `retry-interval`

+ The interval for retrying the PD connection.
+ Default value: `"300ms"`

### `retry-log-every`

+ Specified the frequency at which the PD client skips reporting errors when the client observes errors. For example, when the value is `5`, after the PD client observes errors, the client skips reporting errors every 4 times and reports errors every 5th time.
+ To disable this feature, set the value to `1`.
+ Default value: `10`

### `retry-max-count`

+ The maximum number of times to retry to initialize PD connection
+ To disable the retry, set its value to `0`. To release the limit on the number of retries, set the value to `-1`.
+ Default value: `-1`

## raftstore

Configuration items related to Raftstore.

### `prevote`

+ Enables or disables `prevote`. Enabling this feature helps reduce jitter on the system after recovery from network partition.
+ Default value: `true`

### `capacity`

+ The storage capacity, which is the maximum size allowed to store data. If `capacity` is left unspecified, the capacity of the current disk prevails. To deploy multiple TiKV instances on the same physical disk, add this parameter to the TiKV configuration. For details, see [Key parameters of the hybrid deployment](/hybrid-deployment-topology.md#key-parameters).
+ Default value: `0`
+ Unit: KB|MB|GB

### `raftdb-path`

+ The path to the Raft library, which is `storage.data-dir/raft` by default
+ Default value: `""`

### `raft-base-tick-interval`

> **Note:**
>
> This configuration item cannot be queried via SQL statements but can be configured in the configuration file.

+ The time interval at which the Raft state machine ticks
+ Default value: `"1s"`
+ Minimum value: greater than `0`

### `raft-heartbeat-ticks`

> **Note:**
>
> This configuration item cannot be queried via SQL statements but can be configured in the configuration file.

+ The number of passed ticks when the heartbeat is sent. This means that a heartbeat is sent at the time interval of `raft-base-tick-interval` * `raft-heartbeat-ticks`.
+ Default value: `2`
+ Minimum value: greater than `0`

### `raft-election-timeout-ticks`

> **Note:**
>
> This configuration item cannot be queried via SQL statements but can be configured in the configuration file.

+ The number of passed ticks when Raft election is initiated. This means that if Raft group is missing the leader, a leader election is initiated approximately after the time interval of `raft-base-tick-interval` * `raft-election-timeout-ticks`.
+ Default value: `10`
+ Minimum value: `raft-heartbeat-ticks`

### `raft-min-election-timeout-ticks`

> **Note:**
>
> This configuration item cannot be queried via SQL statements but can be configured in the configuration file.

+ The minimum number of ticks during which the Raft election is initiated. If the number is `0`, the value of `raft-election-timeout-ticks` is used. The value of this parameter must be greater than or equal to `raft-election-timeout-ticks`.
+ Default value: `0`
+ Minimum value: `0`

### `raft-max-election-timeout-ticks`

> **Note:**
>
> This configuration item cannot be queried via SQL statements but can be configured in the configuration file.

+ The maximum number of ticks during which the Raft election is initiated. If the number is `0`, the value of `raft-election-timeout-ticks` * `2` is used.
+ Default value: `0`
+ Minimum value: `0`

### `raft-max-size-per-msg`

+ The soft limit on the size of a single message packet
+ Default value: `"1MB"`
+ Minimum value: greater than `0`
+ Maximum value: `3GB`
+ Unit: KB|MB|GB

### `raft-max-inflight-msgs`

+ The number of Raft logs to be confirmed. If this number is exceeded, the Raft state machine slows down log sending.
+ Default value: `256`
+ Minimum value: greater than `0`
+ Maximum value: `16384`

### `raft-entry-max-size`

+ The hard limit on the maximum size of a single log
+ Default value: `"8MB"`
+ Minimum value: `0`
+ Unit: MB|GB

### `raft-log-compact-sync-interval` <span class="version-mark">New in v5.3</span>

+ The time interval to compact unnecessary Raft logs
+ Default value: `"2s"`
+ Minimum value: `"0s"`

### `raft-log-gc-tick-interval`

+ The time interval at which the polling task of deleting Raft logs is scheduled. `0` means that this feature is disabled.
+ Default value: `"3s"`
+ Minimum value: `"0s"`

### `raft-log-gc-threshold`

+ The soft limit on the maximum allowable count of residual Raft logs
+ Default value: `50`
+ Minimum value: `1`

### `raft-log-gc-count-limit`

+ The hard limit on the allowable number of residual Raft logs
+ Default value: the log number that can be accommodated in the 3/4 Region size (calculated as 1MB for each log)
+ Minimum value: `0`

### `raft-log-gc-size-limit`

+ The hard limit on the allowable size of residual Raft logs
+ Default value: 3/4 of the Region size
+ Minimum value: greater than `0`

### `raft-log-reserve-max-ticks` <span class="version-mark">New in v5.3</span>

+ After the number of ticks set by this configuration item passes, even if the number of residual Raft logs does not reach the value set by `raft-log-gc-threshold`, TiKV still performs garbage collection (GC) to these logs.
+ Default value: `6`
+ Minimum value: greater than `0`

### `raft-entry-cache-life-time`

+ The maximum remaining time allowed for the log cache in memory.
+ Default value: `"30s"`
+ Minimum value: `0`

### `hibernate-regions`

+ Enables or disables Hibernate Region. When this option is enabled, a Region idle for a long time is automatically set as hibernated. This reduces the extra overhead caused by heartbeat messages between the Raft leader and the followers for idle Regions. You can use `peer-stale-state-check-interval` to modify the heartbeat interval between the leader and the followers of hibernated Regions.
+ Default value: `true` in v5.0.2 and later versions; `false` in versions before v5.0.2

### `split-region-check-tick-interval`

+ Specifies the interval at which to check whether the Region split is needed. `0` means that this feature is disabled.
+ Default value: `"10s"`
+ Minimum value: `0`

### `region-split-check-diff`

+ The maximum value by which the Region data is allowed to exceed before Region split
+ Default value: 1/16 of the Region size.
+ Minimum value: `0`

### `region-compact-check-interval`

+ The time interval at which to check whether it is necessary to manually trigger RocksDB compaction. `0` means that this feature is disabled.
+ Default value: `"5m"`
+ Minimum value: `0`

### `region-compact-check-step`

+ The number of Regions checked at one time for each round of manual compaction
+ Default value: `100`
+ Minimum value: `0`

### `region-compact-min-tombstones`

+ The number of tombstones required to trigger RocksDB compaction
+ Default value: `10000`
+ Minimum value: `0`

### `region-compact-tombstones-percent`

+ The proportion of tombstone required to trigger RocksDB compaction
+ Default value: `30`
+ Minimum value: `1`
+ Maximum value: `100`

### `report-region-buckets-tick-interval` <span class="version-mark">New in v6.1.0</span>

> **Warning:**
>
> `report-region-buckets-tick-interval` is an experimental feature introduced in TiDB v6.1.0. It is not recommended that you use it in production environments.

+ The interval at which TiKV reports bucket information to PD when `enable-region-bucket` is true.
+ Default value: `10s`

### `pd-heartbeat-tick-interval`

+ The time interval at which a Region's heartbeat to PD is triggered. `0` means that this feature is disabled.
+ Default value: `"1m"`
+ Minimum value: `0`

### `pd-store-heartbeat-tick-interval`

+ The time interval at which a store's heartbeat to PD is triggered. `0` means that this feature is disabled.
+ Default value: `"10s"`
+ Minimum value: `0`

### `snap-mgr-gc-tick-interval`

+ The time interval at which the recycle of expired snapshot files is triggered. `0` means that this feature is disabled.
+ Default value: `"1m"`
+ Minimum value: `0`

### `snap-gc-timeout`

+ The longest time for which a snapshot file is saved
+ Default value: `"4h"`
+ Minimum value: `0`

### `snap-generator-pool-size` <span class="version-mark">New in v5.4.0</span>

+ Configures the size of the `snap-generator` thread pool.
+ To make Regions generate snapshot faster in TiKV in recovery scenarios, you need to increase the count of the `snap-generator` threads of the corresponding worker. You can use this configuration item to increase the size of the `snap-generator` thread pool.
+ Default value: `2`
+ Minimum value: `1`

### `lock-cf-compact-interval`

+ The time interval at which TiKV triggers a manual compaction for the Lock Column Family
+ Default value: `"10m"`
+ Minimum value: `0`

### `lock-cf-compact-bytes-threshold`

+ The size out of which TiKV triggers a manual compaction for the Lock Column Family
+ Default value: `"256MB"`
+ Minimum value: `0`
+ Unit: MB

### `notify-capacity`

+ The longest length of the Region message queue.
+ Default value: `40960`
+ Minimum value: `0`

### `messages-per-tick`

+ The maximum number of messages processed per batch
+ Default value: `4096`
+ Minimum value: `0`

### `max-peer-down-duration`

+ The longest inactive duration allowed for a peer. A peer with timeout is marked as `down`, and PD tries to delete it later.
+ Default value: `"10m"`
+ Minimum value: When Hibernate Region is enabled, the minimum value is `peer-stale-state-check-interval * 2`; when Hibernate Region is disabled, the minimum value is `0`.

### `max-leader-missing-duration`

+ The longest duration allowed for a peer to be in the state where a Raft group is missing the leader. If this value is exceeded, the peer verifies with PD whether the peer has been deleted.
+ Default value: `"2h"`
+ Minimum value: greater than `abnormal-leader-missing-duration`

### `abnormal-leader-missing-duration`

+ The longest duration allowed for a peer to be in the state where a Raft group is missing the leader. If this value is exceeded, the peer is seen as abnormal and marked in metrics and logs.
+ Default value: `"10m"`
+ Minimum value: greater than `peer-stale-state-check-interval`

### `peer-stale-state-check-interval`

+ The time interval to trigger the check for whether a peer is in the state where a Raft group is missing the leader.
+ Default value: `"5m"`
+ Minimum value: greater than `2 * election-timeout`

### `leader-transfer-max-log-lag`

+ The maximum number of missing logs allowed for the transferee during a Raft leader transfer
+ Default value: `128`
+ Minimum value: `10`

### `max-snapshot-file-raw-size` <span class="version-mark">New in v6.1.0</span>

+ When the size of a snapshot file exceeds this configuration value, this file will be split into multiple files.
+ Default value: `100MiB`
+ Minimum value: `100MiB`

### `snap-apply-batch-size`

+ The memory cache size required when the imported snapshot file is written into the disk
+ Default value: `"10MB"`
+ Minimum value: `0`
+ Unit: MB

### `consistency-check-interval`

> **Warning:**
>
> It is **NOT** recommended to enable the consistency check in production environments, because it affects cluster performance and is incompatible with the garbage collection in TiDB.

+ The time interval at which the consistency check is triggered. `0` means that this feature is disabled.
+ Default value: `"0s"`
+ Minimum value: `0`

### `raft-store-max-leader-lease`

+ The longest trusted period of a Raft leader
+ Default value: `"9s"`
+ Minimum value: `0`

### `right-derive-when-split`

+ Specifies the start key of the new Region when a Region is split. When this configuration item is set to `true`, the start key is the maximum split key. When this configuration item is set to `false`, the start key is the original Region's start key.
+ Default value: `true`

### `merge-max-log-gap`

+ The maximum number of missing logs allowed when `merge` is performed
+ Default value: `10`
+ Minimum value: greater than `raft-log-gc-count-limit`

### `merge-check-tick-interval`

+ The time interval at which TiKV checks whether a Region needs merge
+ Default value: `"2s"`
+ Minimum value: greater than `0`

### `use-delete-range`

+ Determines whether to delete data from the `rocksdb delete_range` interface
+ Default value: `false`

### `cleanup-import-sst-interval`

+ The time interval at which the expired SST file is checked. `0` means that this feature is disabled.
+ Default value: `"10m"`
+ Minimum value: `0`

### `local-read-batch-size`

+ The maximum number of read requests processed in one batch
+ Default value: `1024`
+ Minimum value: greater than `0`

### `apply-max-batch-size`

+ Raft state machines process data write requests in batches by the BatchSystem. This configuration item specifies the maximum number of Raft state machines that can process the requests in one batch.
+ Default value: `256`
+ Minimum value: greater than `0`
+ Maximum value: `10240`

### `apply-pool-size`

+ The allowable number of threads in the pool that flushes data to the disk, which is the size of the Apply thread pool. When you modify the size of this thread pool, refer to [Performance tuning for TiKV thread pools](/tune-tikv-thread-performance.md#performance-tuning-for-tikv-thread-pools).
+ Default value: `2`
+ Value ranges: `[1, CPU * 10]`. `CPU` means the number of your CPU cores.

### `store-max-batch-size`

+ Raft state machines process requests for flushing logs into the disk in batches by the BatchSystem. This configuration item specifies the maximum number of Raft state machines that can process the requests in one batch.
+ If `hibernate-regions` is enabled, the default value is `256`. If `hibernate-regions` is disabled, the default value is `1024`.
+ Minimum value: greater than `0`
+ Maximum value: `10240`

### `store-pool-size`

+ The allowable number of threads in the pool that processes Raft, which is the size of the Raftstore thread pool. When you modify the size of this thread pool, refer to [Performance tuning for TiKV thread pools](/tune-tikv-thread-performance.md#performance-tuning-for-tikv-thread-pools).
+ Default value: `2`
+ Value ranges: `[1, CPU * 10]`. `CPU` means the number of your CPU cores.

### `store-io-pool-size` <span class="version-mark">New in v5.3.0</span>

+ The allowable number of threads that process Raft I/O tasks, which is the size of the StoreWriter thread pool. When you modify the size of this thread pool, refer to [Performance tuning for TiKV thread pools](/tune-tikv-thread-performance.md#performance-tuning-for-tikv-thread-pools).
+ Default value: `0`
+ Minimum value: `0`

### `future-poll-size`

+ The allowable number of threads that drive `future`
+ Default value: `1`
+ Minimum value: greater than `0`

### `cmd-batch`

+ Controls whether to enable batch processing of the requests. When it is enabled, the write performance is significantly improved.
+ Default value: `true`

### `inspect-interval`

+ At a certain interval, TiKV inspects the latency of the Raftstore component. This parameter specifies the interval of the inspection. If the latency exceeds this value, this inspection is marked as timeout.
+ Judges whether the TiKV node is slow based on the ratio of timeout inspection.
+ Default value: `"500ms"`
+ Minimum value: `"1ms"`

### `raft-write-size-limit` <span class="version-mark">New in v5.3.0</span>

+ Determines the threshold at which Raft data is written into the disk. If the data size is larger than the value of this configuration item, the data is written to the disk. When the value of `store-io-pool-size` is `0`, this configuration item does not take effect.
+ Default value: `1MB`
+ Minimum value: `0`

### `report-min-resolved-ts-interval` <span class="version-mark">New in v6.0.0</span>

+ Determines the interval at which the minimum resolved timestamp is reported to the PD leader. If this value is set to `0`, it means that the reporting is disabled.
+ Default value: `"0s"`
+ Minimum value: `0`
+ Unit: second

## coprocessor

Configuration items related to Coprocessor.

### `split-region-on-table`

+ Determines whether to split Region by table. It is recommended for you to use the feature only in TiDB mode.
+ Default value: `false`

### `batch-split-limit`

+ The threshold of Region split in batches. Increasing this value speeds up Region split.
+ Default value: `10`
+ Minimum value: `1`

### `region-max-size`

+ The maximum size of a Region. When the value is exceeded, the Region splits into many.
+ Default value: `region-split-size / 2 * 3`
+ Unit: KiB|MiB|GiB

### `region-split-size`

+ The size of the newly split Region. This value is an estimate.
+ Default value: `"96MiB"`
+ Unit: KiB|MiB|GiB

### `region-max-keys`

+ The maximum allowable number of keys in a Region. When this value is exceeded, the Region splits into many.
+ Default value: `region-split-keys / 2 * 3`

### `region-split-keys`

+ The number of keys in the newly split Region. This value is an estimate.
+ Default value: `960000`

### `enable-region-bucket` <span class="version-mark">New in v6.1.0</span>

+ Determines whether to divide a Region into smaller ranges called buckets. The bucket is used as the unit of the concurrent query to improve the scan concurrency. For more about the design of the bucket, refer to [Dynamic size Region](https://github.com/tikv/rfcs/blob/master/text/0082-dynamic-size-region.md).
+ Default value: false

> **Warning:**
>
> - `enable-region-bucket` is an experimental feature introduced in TiDB v6.1.0. It is not recommended that you use it in production environments.
> - This configuration makes sense only when `region-split-size` is twice of `region-bucket-size` or above; otherwise, no bucket is actually generated.
> - Adjusting `region-split-size` to a larger value might have the risk of performance regression and slow scheduling.

### `region-bucket-size` <span class="version-mark">New in v6.1.0</span>

+ The size of a bucket when `enable-region-bucket` is true.
+ Default value: `96MiB`

> **Warning:**
>
> `region-bucket-size` is an experimental feature introduced in TiDB v6.1.0. It is not recommended that you use it in production environments.

## rocksdb

Configuration items related to RocksDB

### `max-background-jobs`

+ The number of background threads in RocksDB. When you modify the size of the RocksDB thread pool, refer to [Performance tuning for TiKV thread pools](/tune-tikv-thread-performance.md#performance-tuning-for-tikv-thread-pools).
+ Default value:
    + When the number of CPU cores is 10, the default value is `9`.
    + When the number of CPU cores is 8, the default value is `7`.
    + When the number of CPU cores is `N`, the default value is `max(2, min(N - 1, 9))`.
+ Minimum value: `2`

### `max-background-flushes`

+ The maximum number of concurrent background memtable flush jobs
+ Default value:
    + When the number of CPU cores is 10, the default value is `3`.
    + When the number of CPU cores is 8, the default value is `2`.
    + When the number of CPU cores is `N`, the default value is `[(max-background-jobs + 3) / 4]`.
+ Minimum value: `1`

### `max-sub-compactions`

+ The number of sub-compaction operations performed concurrently in RocksDB
+ Default value: `3`
+ Minimum value: `1`

### `max-open-files`

+ The total number of files that RocksDB can open
+ Default value: `40960`
+ Minimum value: `-1`

### `max-manifest-file-size`

+ The maximum size of a RocksDB Manifest file
+ Default value: `"128MB"`
+ Minimum value: `0`
+ Unit: B|KB|MB|GB

### `create-if-missing`

+ Determines whether to automatically create a DB switch
+ Default value: `true`

### `wal-recovery-mode`

+ WAL recovery mode
+ Optional values:
    + `"tolerate-corrupted-tail-records"`: tolerates and discards the records that have incomplete trailing data on all logs
    + `"absolute-consistency"`: abandons recovery when corrupted logs are found
    + `"point-in-time"`: recovers logs sequentially until the first corrupted log is encountered
    + `"skip-any-corrupted-records"`: post-disaster recovery. The data is recovered as much as possible, and corrupted records are skipped.
+ Default value: `"point-in-time"`

### `wal-dir`

+ The directory in which WAL files are stored. If not specified, the WAL files will be stored in the same directory as the data.
+ Default value: `""`

### `wal-ttl-seconds`

+ The living time of the archived WAL files. When the value is exceeded, the system deletes these files.
+ Default value: `0`
+ Minimum value: `0`
+ unit: second

### `wal-size-limit`

+ The size limit of the archived WAL files. When the value is exceeded, the system deletes these files.
+ Default value: `0`
+ Minimum value: `0`
+ Unit: B|KB|MB|GB

### `enable-statistics`

+ Determines whether to enable the statistics of RocksDB
+ Default value: `true`

### `stats-dump-period`

+ The interval at which statistics are output to the log.
+ Default value: `10m`

### `compaction-readahead-size`

+ Enables the readahead feature during RocksDB compaction and specifies the size of readahead data. If you are using mechanical disks, it is recommended to set the value to 2MB at least.
+ Default value: `0`
+ Minimum value: `0`
+ Unit: B|KB|MB|GB

### `writable-file-max-buffer-size`

+ The maximum buffer size used in WritableFileWrite
+ Default value: `"1MB"`
+ Minimum value: `0`
+ Unit: B|KB|MB|GB

### `use-direct-io-for-flush-and-compaction`

+ Determines whether to use `O_DIRECT` for both reads and writes in the background flush and compactions. The performance impact of this option: enabling `O_DIRECT` bypasses and prevents contamination of the OS buffer cache, but the subsequent file reads require re-reading the contents to the buffer cache.
+ Default value: `false`

### `rate-bytes-per-sec`

+ The maximum rate permitted by RocksDB's compaction rate limiter
+ Default value: `10GB`
+ Minimum value: `0`
+ Unit: B|KB|MB|GB

### `rate-limiter-mode`

+ RocksDB's compaction rate limiter mode
+ Optional values: `"read-only"`, `"write-only"`, `"all-io"`
+ Default value: `"write-only"`

### `rate-limiter-auto-tuned` <span class="version-mark">New in v5.0</span>

+ Determines whether to automatically optimize the configuration of the RocksDB's compaction rate limiter based on recent workload. When this configuration is enabled, compaction pending bytes will be slightly higher than usual.
+ Default value: `true`

### `enable-pipelined-write`

+ Controls whether to enable Pipelined Write. When this configuration is enabled, the previous Pipelined Write is used. When this configuration is disabled, the new Pipelined Commit mechanism is used.
+ Default value: `false`

### `bytes-per-sync`

+ The rate at which OS incrementally synchronizes files to disk while these files are being written asynchronously
+ Default value: `"1MB"`
+ Minimum value: `0`
+ Unit: B|KB|MB|GB

### `wal-bytes-per-sync`

+ The rate at which OS incrementally synchronizes WAL files to disk while the WAL files are being written
+ Default value: `"512KB"`
+ Minimum value: `0`
+ Unit: B|KB|MB|GB

### `info-log-max-size`

> **Warning:**
>
> Starting from v5.4.0, RocksDB logs are managed by the logging module of TiKV. Therefore, this configuration item is deprecated, and its function is replaced by the configuration item [`log.file.max-size`](#max-size-new-in-v540).

+ The maximum size of Info log
+ Default value: `"1GB"`
+ Minimum value: `0`
+ Unit: B|KB|MB|GB

### `info-log-roll-time`

> **Warning:**
>
> Starting from v5.4.0, RocksDB logs are managed by the logging module of TiKV. Therefore, this configuration item is deprecated. TiKV no longer supports automatic log splitting based on time. Instead, you can use the configuration item [`log.file.max-size`](#max-size-new-in-v540) to set the threshold for automatic log splitting based on file size.

+ The time interval at which Info logs are truncated. If the value is `0s`, logs are not truncated.
+ Default value: `"0s"`

### `info-log-keep-log-file-num`

> **Warning:**
>
> Starting from v5.4.0, RocksDB logs are managed by the logging module of TiKV. Therefore, this configuration item is deprecated, and its function is replaced by the configuration item [`log.file.max-backups`](#max-backups-new-in-v540).

+ The maximum number of kept log files
+ Default value: `10`
+ Minimum value: `0`

### `info-log-dir`

+ The directory in which logs are stored
+ Default value: `""`

### `info-log-level`

> **Warning:**
>
> Starting from v5.4.0, RocksDB logs are managed by the logging module of TiKV. Therefore, this configuration item is deprecated, and its function is replaced by the configuration item [`log.level`](#level-new-in-v540).

+ Log levels of RocksDB
+ Default value: `"info"`

## rocksdb.titan

Configuration items related to Titan.

### `enabled`

> **Warning**
>
> When disabling Titan for TiDB versions earlier than v8.5.0, it is not recommended to modify this configuration item to `false`, as this might cause TiKV to crash. To disable Titan, refer to the steps in [Disable Titan (experimental)](/storage-engine/titan-configuration.md#disable-titan-experimental).

+ Enables or disables Titan
+ Default value: `false`

### `dirname`

+ The directory in which the Titan Blob file is stored
+ Default value: `"titandb"`

### `disable-gc`

+ Determines whether to disable Garbage Collection (GC) that Titan performs to Blob files
+ Default value: `false`

### `max-background-gc`

+ The maximum number of GC threads in Titan
+ Default value: `4`
+ Minimum value: `1`

## rocksdb.defaultcf | rocksdb.writecf | rocksdb.lockcf

Configuration items related to `rocksdb.defaultcf`, `rocksdb.writecf`, and `rocksdb.lockcf`.

### `block-size`

+ The default size of a RocksDB block
+ Default value for `defaultcf` and `writecf`: `"64KB"`
+ Default value for `lockcf`: `"16KB"`
+ Minimum value: `"1KB"`
+ Unit: KB|MB|GB

### `block-cache-size`

+ The cache size of a RocksDB block
+ Default value for `defaultcf`: `Total machine memory * 25%`
+ Default value for `writecf`: `Total machine memory * 15%`
+ Default value for `lockcf`: `Total machine memory * 2%`
+ Minimum value: `0`
+ Unit: KB|MB|GB

### `disable-block-cache`

+ Enables or disables block cache
+ Default value: `false`

### `cache-index-and-filter-blocks`

+ Enables or disables caching index and filter
+ Default value: `true`

### `pin-l0-filter-and-index-blocks`

+ Determines whether to pin the index and filter blocks of the level 0 SST files in memory.
+ Default value: `true`

### `use-bloom-filter`

+ Enables or disables bloom filter
+ Default value: `true`

### `optimize-filters-for-hits`

+ Determines whether to optimize the hit ratio of filters
+ Default value for `defaultcf`: `true`
+ Default value for `writecf` and `lockcf`: `false`

### `whole-key-filtering`

+ Determines whether to put the entire key to bloom filter
+ Default value for `defaultcf` and `lockcf`: `true`
+ Default value for `writecf`: `false`

### `bloom-filter-bits-per-key`

+ The length that bloom filter reserves for each key
+ Default value: `10`
+ Unit: byte

### `block-based-bloom-filter`

+ Determines whether each block creates a bloom filter
+ Default value: `false`

### `read-amp-bytes-per-bit`

+ Enables or disables statistics of read amplification.
+ Optional values: `0` (disabled), > `0` (enabled).
+ Default value: `0`
+ Minimum value: `0`

### `compression-per-level`

+ The default compression algorithm for each level
+ Default value for `defaultcf`: ["no", "no", "lz4", "lz4", "lz4", "zstd", "zstd"]
+ Default value for `writecf`: ["no", "no", "lz4", "lz4", "lz4", "zstd", "zstd"]
+ Default value for `lockcf`: ["no", "no", "no", "no", "no", "no", "no"]

### `bottommost-level-compression`

+ Sets the compression algorithm of the bottommost layer. This configuration item overrides the `compression-per-level` setting.
+ Ever since data is written to LSM-tree, RocksDB does not directly adopt the last compression algorithm specified in the `compression-per-level` array for the bottommost layer. `bottommost-level-compression` enables the bottommost layer to use the compression algorithm of the best compression effect from the beginning.
+ If you do not want to set the compression algorithm for the bottommost layer, set the value of this configuration item to `disable`.
+ Default value: `"zstd"`

### `write-buffer-size`

+ Memtable size
+ Default value for `defaultcf` and `writecf`: `"128MB"`
+ Default value for `lockcf`: `"32MB"`
+ Minimum value: `0`
+ Unit: KB|MB|GB

### `max-write-buffer-number`

+ The maximum number of memtables. When `storage.flow-control.enable` is set to `true`, `storage.flow-control.memtables-threshold` overrides this configuration item.
+ Default value: `5`
+ Minimum value: `0`

### `min-write-buffer-number-to-merge`

+ The minimum number of memtables required to trigger flush
+ Default value: `1`
+ Minimum value: `0`

### `max-bytes-for-level-base`

+ The maximum number of bytes at base level (level-1). Generally, it is set to 4 times the size of a memtable. When the level-1 data size reaches the limit value of `max-bytes-for-level-base`, the SST files of level-1 and their overlapping SST files of level-2 will be compacted.
+ Default value for `defaultcf` and `writecf`: `"512MB"`
+ Default value for `lockcf`: `"128MB"`
+ Minimum value: `0`
+ Unit: KB|MB|GB
+ It is recommended that the value of `max-bytes-for-level-base` is set approximately equal to the data volume in L0 to reduce unnecessary compaction. For example, if the compression method is "no:no:lz4:lz4:lz4:lz4:lz4", the value of `max-bytes-for-level-base` should be `write-buffer-size * 4`, because there is no compression of L0 and L1 and the trigger condition of compaction for L0 is that the number of the SST files reaches 4 (the default value). When L0 and L1 both adopt compaction, you need to analyze RocksDB logs to understand the size of an SST file compressed from a memtable. For example, if the file size is 32 MB, it is recommended to set the value of `max-bytes-for-level-base` to 128 MB (`32 MB * 4`).

### `target-file-size-base`

+ The size of the target file at base level. This value is overridden by `compaction-guard-max-output-file-size` when the `enable-compaction-guard` value is `true`.
+ Default value: `"8MB"`
+ Minimum value: `0`
+ Unit: KB|MB|GB

### `level0-file-num-compaction-trigger`

+ The maximum number of files at L0 that trigger compaction
+ Default value for `defaultcf` and `writecf`: `4`
+ Default value for `lockcf`: `1`
+ Minimum value: `0`

### `level0-slowdown-writes-trigger`

+ The maximum number of files at L0 that trigger write stall. When `storage.flow-control.enable` is set to `true`, `storage.flow-control.l0-files-threshold` overrides this configuration item.
+ Default value: `20`
+ Minimum value: `0`

### `level0-stop-writes-trigger`

+ The maximum number of files at L0 required to completely block write
+ Default value: `36`
+ Minimum value: `0`

### `max-compaction-bytes`

+ The maximum number of bytes written into disk per compaction
+ Default value: `"2GB"`
+ Minimum value: `0`
+ Unit: KB|MB|GB

### `compaction-pri`

+ The priority type of compaction
+ Optional values:
    - `"by-compensated-size"`: compact files in order of file size and large files are compacted with higher priority.
    - `"oldest-largest-seq-first"`: prioritize compaction on files with the oldest update time. Use this value **only** when updating hot keys in small ranges.
    - `"oldest-smallest-seq-first"`: prioritize compaction on files with ranges that are not compacted to the next level for a long time. If you randomly update hot keys across the key space, this value can slightly reduce write amplification.
    - `"min-overlapping-ratio"`: prioritize compaction on files with a high overlap ratio. When a file is small in different levels (the result of `the file size in the next level` ÷ `the file size in this level` is small), TiKV compacts this file first. In many cases, this value can effectively reduce write amplification.
+ Default value for `defaultcf` and `writecf`: `"min-overlapping-ratio"`
+ Default value for `lockcf`: `"by-compensated-size"`

### `dynamic-level-bytes`

+ Determines whether to optimize dynamic level bytes
+ Default value: `true`

### `num-levels`

+ The maximum number of levels in a RocksDB file
+ Default value: `7`

### `max-bytes-for-level-multiplier`

+ The default amplification multiple for each layer
+ Default value: `10`

### `compaction-style`

+ Compaction method
+ Optional values: `"level"`, `"universal"`, `"fifo"`
+ Default value: `"level"`

### `disable-auto-compactions`

+ Determines whether to disable auto compaction.
+ Default value: `false`

### `soft-pending-compaction-bytes-limit`

+ The soft limit on the pending compaction bytes. When `storage.flow-control.enable` is set to `true`, `storage.flow-control.soft-pending-compaction-bytes-limit` overrides this configuration item.
+ Default value: `"192GB"`
+ Unit: KB|MB|GB

### `hard-pending-compaction-bytes-limit`

+ The hard limit on the pending compaction bytes. When `storage.flow-control.enable` is set to `true`, `storage.flow-control.hard-pending-compaction-bytes-limit` overrides this configuration item.
+ Default value: `"256GB"`
+ Unit: KB|MB|GB

### `enable-compaction-guard`

+ Enables or disables the compaction guard, which is an optimization to split SST files at TiKV Region boundaries. This optimization can help reduce compaction I/O and allows TiKV to use larger SST file size (thus less SST files overall) and at the time efficiently clean up stale data when migrating Regions.
+ Default value for `defaultcf` and `writecf`: `true`
+ Default value for `lockcf`: `false`

### `compaction-guard-min-output-file-size`

+ The minimum SST file size when the compaction guard is enabled. This configuration prevents SST files from being too small when the compaction guard is enabled.
+ Default value: `"8MB"`
+ Unit: KB|MB|GB

### `compaction-guard-max-output-file-size`

+ The maximum SST file size when the compaction guard is enabled. The configuration prevents SST files from being too large when the compaction guard is enabled. This configuration overrides `target-file-size-base` for the same column family.
+ Default value: `"128MB"`
+ Unit: KB|MB|GB

## rocksdb.defaultcf.titan

Configuration items related to `rocksdb.defaultcf.titan`.

### `min-blob-size`

+ The smallest value stored in a Blob file. Values smaller than the specified size are stored in the LSM-Tree.
+ Default value: `"1KB"`
+ Minimum value: `0`
+ Unit: KB|MB|GB

### `blob-file-compression`

+ The compression algorithm used in a Blob file
+ Optional values: `"no"`, `"snappy"`, `"zlib"`, `"bzip2"`, `"lz4"`, `"lz4hc"`, `"zstd"`
+ Default value: `"lz4"`

### `blob-cache-size`

+ The cache size of a Blob file
+ Default value: `"0GB"`
+ Minimum value: `0`
+ Unit: KB|MB|GB

### `min-gc-batch-size`

+ The minimum total size of Blob files required to perform GC for one time
+ Default value: `"16MB"`
+ Minimum value: `0`
+ Unit: KB|MB|GB

### `max-gc-batch-size`

+ The maximum total size of Blob files allowed to perform GC for one time
+ Default value: `"64MB"`
+ Minimum value: `0`
+ Unit: KB|MB|GB

### `discardable-ratio`

+ The ratio at which GC is triggered for Blob files. The Blob file can be selected for GC only if the proportion of the invalid values in a Blob file exceeds this ratio.
+ Default value: `0.5`
+ Minimum value: `0`
+ Maximum value: `1`

### `sample-ratio`

+ The ratio of (data read from a Blob file/the entire Blob file) when sampling the file during GC
+ Default value: `0.1`
+ Minimum value: `0`
+ Maximum value: `1`

### `merge-small-file-threshold`

+ When the size of a Blob file is smaller than this value, the Blob file might still be selected for GC. In this situation, `discardable-ratio` is ignored.
+ Default value: `"8MB"`
+ Minimum value: `0`
+ Unit: KB|MB|GB

### `blob-run-mode`

+ Specifies the running mode of Titan.
+ Optional values:
    + `normal`: Writes data to the blob file when the value size exceeds `min-blob-size`.
    + `read_only`: Refuses to write new data to the blob file, but still reads the original data from the blob file.
    + `fallback`: Writes data in the blob file back to LSM.
+ Default value: `normal`

### `level-merge`

+ Determines whether to optimize the read performance. When `level-merge` is enabled, there is more write amplification.
+ Default value: `false`

### `gc-merge-rewrite`

+ Determines whether to use the merge operator to write back blob indexes for Titan GC. When `gc-merge-rewrite` is enabled, it reduces the effect of Titan GC on the writes in the foreground.
+ Default value: `false`

## raftdb

Configuration items related to `raftdb`

### `max-background-jobs`

+ The number of background threads in RocksDB. When you modify the size of the RocksDB thread pool, refer to [Performance tuning for TiKV thread pools](/tune-tikv-thread-performance.md#performance-tuning-for-tikv-thread-pools).
+ Default value: `4`
+ Minimum value: `2`

### `max-sub-compactions`

+ The number of concurrent sub-compaction operations performed in RocksDB
+ Default value: `2`
+ Minimum value: `1`

### `wal-dir`

+ The directory in which WAL files are stored
+ Default value: `"/tmp/tikv/store"`

## raft-engine

Configuration items related to Raft Engine.

> **Note:**
>
> - When you enable Raft Engine for the first time, TiKV transfers its data from RocksDB to Raft Engine. Therefore, you need to wait extra tens of seconds for TiKV to start.
> - The data format of Raft Engine in TiDB v5.4.0 is not compatible with earlier TiDB versions. Therefore, if you need to downgrade a TiDB cluster from v5.4.0 to an earlier version, **before** downgrading, disable Raft Engine by setting `enable` to `false` and restart TiKV for the configuration to take effect.

### `enable`

+ Determines whether to use Raft Engine to store Raft logs. When it is enabled, configurations of `raftdb` are ignored.
+ Default value: `true`

### `dir`

+ The directory at which raft log files are stored. If the directory does not exist, it will be created when TiKV is started.
+ When this configuration is not set, `{data-dir}/raft-engine` is used.
+ If there are multiple disks on your machine, it is recommended to store the data of Raft Engine on a different disk to improve TiKV performance.
+ Default value: `""`

### `batch-compression-threshold`

+ Specifies the threshold size of a log batch. A log batch larger than this configuration is compressed. If you set this configuration item to `0`, compression is disabled.
+ Default value: `"8KB"`

### `bytes-per-sync`

+ Specifies the maximum accumulative size of buffered writes. When this configuration value is exceeded, buffered writes are flushed to the disk.
+ If you set this configuration item to `0`, incremental sync is disabled.
+ Default value: `"4MB"`

### `target-file-size`

+ Specifies the maximum size of log files. When a log file is larger than this value, it is rotated.
+ Default value: `"128MB"`

### `purge-threshold`

+ Specifies the threshold size of the main log queue. When this configuration value is exceeded, the main log queue is purged.
+ This configuration can be used to adjust the disk space usage of Raft Engine.
+ Default value: `"10GB"`

### `recovery-mode`

+ Determines how to deal with file corruption during recovery.
+ Value options: `"absolute-consistency"`, `"tolerate-tail-corruption"`, `"tolerate-any-corruption"`
+ Default value: `"tolerate-tail-corruption"`

### `recovery-read-block-size`

+ The minimum I/O size for reading log files during recovery.
+ Default value: `"16KB"`
+ Minimum value: `"512B"`

### `recovery-threads`

+ The number of threads used to scan and recover log files.
+ Default value: `4`
+ Minimum value: `1`

### `memory-limit`

+ Specifies the limit on the memory usage of Raft Engine.
+ When this configuration value is not set, 15% of the available system memory is used.
+ Default value: `Total machine memory * 15%`

## security

Configuration items related to security.

### `ca-path`

+ The path of the CA file
+ Default value: `""`

### `cert-path`

+ The path of the Privacy Enhanced Mail (PEM) file that contains the X.509 certificate
+ Default value: `""`

### `key-path`

+ The path of the PEM file that contains the X.509 key
+ Default value: `""`

### `cert-allowed-cn`

+ A list of acceptable X.509 Common Names in certificates presented by clients. Requests are permitted only when the presented Common Name is an exact match with one of the entries in the list.
+ Default value: `[]`. This means that the client certificate CN check is disabled by default.

### `redact-info-log` <span class="version-mark">New in v4.0.8</span>

+ This configuration item enables or disables log redaction. If the configuration value is set to `true`, all user data in the log will be replaced by `?`.
+ Default value: `false`

## security.encryption

Configuration items related to [encryption at rest](/encryption-at-rest.md) (TDE).

### `data-encryption-method`

+ The encryption method for data files
+ Value options: "plaintext", "aes128-ctr", "aes192-ctr", and "aes256-ctr"
+ A value other than "plaintext" means that encryption is enabled, in which case the master key must be specified.
+ Default value: `"plaintext"`

### `data-key-rotation-period`

+ Specifies how often TiKV rotates the data encryption key.
+ Default value: `7d`

### enable-file-dictionary-log

+ Enables the optimization to reduce I/O and mutex contention when TiKV manages the encryption metadata.
+ To avoid possible compatibility issues when this configuration parameter is enabled (by default), see [Encryption at Rest - Compatibility between TiKV versions](/encryption-at-rest.md#compatibility-between-tikv-versions) for details.
+ Default value: `true`

### master-key

+ Specifies the master key if encryption is enabled. To learn how to configure a master key, see [Encryption at Rest - Configure encryption](/encryption-at-rest.md#configure-encryption).

### previous-master-key

+ Specifies the old master key when rotating the new master key. The configuration format is the same as that of `master-key`. To learn how to configure a master key, see [Encryption at Rest - Configure encryption](/encryption-at-rest.md#configure-encryption).

## import

Configuration items related to TiDB Lightning import and BR restore.

### `num-threads`

+ The number of threads to process RPC requests
+ Default value: `8`
+ Minimum value: `1`

## gc

### `enable-compaction-filter` <span class="version-mark">New in v5.0</span>

+ Controls whether to enable the GC in Compaction Filter feature
+ Default value: `true`

## backup

Configuration items related to BR backup.

### `num-threads`

+ The number of worker threads to process backup
+ Default value: `MIN(CPU * 0.5, 8)`
+ Value range: `[1, CPU]`
+ Minimum value: `1`

### `enable-auto-tune` <span class="version-mark">New in v5.4.0</span>

+ Controls whether to limit the resources used by backup tasks to reduce the impact on the cluster when the cluster resource utilization is high. For more information, refer to [BR Auto-Tune](/br/br-auto-tune.md).
+ Default value: `true`

### `s3-multi-part-size` <span class="version-mark">New in v5.3.2</span>

> **Note:**
>
> This configuration is introduced to address backup failures caused by S3 rate limiting. This problem has been fixed by [refining the backup data storage structure](/br/backup-and-restore-design.md#backup-file-structure). Therefore, this configuration is deprecated from v6.1.1 and is no longer recommended.

+ The part size used when you perform multipart upload to S3 during backup. You can adjust the value of this configuration to control the number of requests sent to S3.
+ If data is backed up to S3 and the backup file is larger than the value of this configuration item, [multipart upload](https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPart.html) is automatically enabled. Based on the compression ratio, the backup file generated by a 96-MiB Region is approximately 10 MiB to 30 MiB.
+ Default value: 5MiB

## cdc

Configuration items related to TiCDC.

### `min-ts-interval`

+ The interval at which Resolved TS is calculated and forwarded.
+ Default value: `"1s"`

### `old-value-cache-memory-quota`

+ The upper limit of memory usage by TiCDC old values.
+ Default value: `512MB`

### `sink-memory-quota`

+ The upper limit of memory usage by TiCDC data change events.
+ Default value: `512MB`

### `incremental-scan-speed-limit`

+ The maximum speed at which historical data is incrementally scanned.
+ Default value: `"128MB"`, which means 128 MB per second.

### `incremental-scan-threads`

+ The number of threads for the task of incrementally scanning historical data.
+ Default value: `4`, which means 4 threads.

### `incremental-scan-concurrency`

+ The maximum number of concurrent executions for the tasks of incrementally scanning historical data.
+ Default value: `6`, which means 6 tasks can be concurrent executed at most.
+ Note: The value of `incremental-scan-concurrency` must be greater than or equal to that of `incremental-scan-threads`; otherwise, TiKV will report an error at startup.

## resolved-ts

Configuration items related to maintaining the Resolved TS to serve Stale Read requests.

### `enable`

+ Determines whether to maintain the Resolved TS for all Regions.
+ Default value: `true`

### `advance-ts-interval`

+ The interval at which Resolved TS is calculated and forwarded.
+ Default value: `"1s"`

### `scan-lock-pool-size`

+ The number of threads that TiKV uses to scan the MVCC (multi-version concurrency control) lock data when initializing the Resolved TS.
+ Default value: `2`, which means 2 threads.

## pessimistic-txn

For pessimistic transaction usage, refer to [TiDB Pessimistic Transaction Mode](/pessimistic-transaction.md).

### `wait-for-lock-timeout`

- The longest time that a pessimistic transaction in TiKV waits for other transactions to release the lock. If the time is out, an error is returned to TiDB, and TiDB retries to add a lock. The lock wait timeout is set by `innodb_lock_wait_timeout`.
- Default value: `"1s"`
- Minimum value: `"1ms"`

### `wake-up-delay-duration`

- When pessimistic transactions release the lock, among all the transactions waiting for lock, only the transaction with the smallest `start_ts` is woken up. Other transactions will be woken up after `wake-up-delay-duration`.
- Default value: `"20ms"`

### `pipelined`

- This configuration item enables the pipelined process of adding the pessimistic lock. With this feature enabled, after detecting that data can be locked, TiKV immediately notifies TiDB to execute the subsequent requests and write the pessimistic lock asynchronously, which reduces most of the latency and significantly improves the performance of pessimistic transactions. But there is a still low probability that the asynchronous write of the pessimistic lock fails, which might cause the failure of pessimistic transaction commits.
- Default value: `true`

### `in-memory` <span class="version-mark">New in v6.0.0</span>

+ Enables the in-memory pessimistic lock feature. With this feature enabled, pessimistic transactions try to store their locks in memory, instead of writing the locks to disk or replicating the locks to other replicas. This improves the performance of pessimistic transactions. However, there is a still low probability that the pessimistic lock gets lost and causes the pessimistic transaction commits to fail.
+ Default value: `true`
+ Note that `in-memory` takes effect only when the value of `pipelined` is `true`.

## quota

Configuration items related to Quota Limiter.

Suppose that your machine on which TiKV is deployed has limited resources, for example, with only 4v CPU and 16 G memory. In this situation, the foreground of TiKV might process too many read and write requests so that the CPU resources used by the background are occupied to help process such requests, which affects the performance stability of TiKV. To avoid this situation, you can use the quota-related configuration items to limit the CPU resources to be used by the foreground. When a request triggers Quota Limiter, the request is forced to wait for a while for TiKV to free up CPU resources. The exact waiting time depends on the number of requests, and the maximum waiting time is no longer than the value of [`max-delay-duration`](#max-delay-duration-new-in-v600).

> **Warning:**
>
> - Quota Limiter is an experimental feature introduced in TiDB v6.0.0, and it is **NOT** recommended to use it in the production environment.
> - This feature is only suitable for environments with limited resources to ensure that TiKV can run stably in those environments. If you enable this feature in an environment with rich resources, performance degradation might occur when the amount of requests reaches a peak.

### `foreground-cpu-time` (new in v6.0.0)

+ The soft limit on the CPU resources used by TiKV foreground to process read and write requests.
+ Default value: `0` (which means no limit)
+ Unit: millicpu (for example, `1500` means that foreground requests consume 1.5v CPU)

### `foreground-write-bandwidth` (new in v6.0.0)

+ The soft limit on the bandwidth with which transactions write data.
+ Default value: `0KB` (which means no limit)

### `foreground-read-bandwidth` (new in v6.0.0)

+ The soft limit on the bandwidth with which transactions and the Coprocessor read data.
+ Default value: `0KB` (which means no limit)

### `max-delay-duration` (new in v6.0.0)

+ The maximum time that a single read or write request is forced to wait before it is processed in the foreground.
+ Default value: `500ms`

## causal-ts <span class="version-mark">New in v6.1.0</span>

Configuration items related to getting the timestamp when TiKV API V2 is enabled (`storage.api-version = 2`).

To reduce write latency and avoid frequent access to PD, TiKV periodically fetches and caches a batch of timestamps in the local. When the locally cached timestamps are exhausted, TiKV immediately makes a timestamp request. In this situation, the latency of some write requests are increased. To reduce the occurrence of this situation, TiKV dynamically adjusts the size of the locally cached timestamps according to the workload. For most of the time, you do not need to adjust the following parameters.

> **Warning:**
>
> TiKV API V2 is still an experimental feature. It is not recommended to use it in production environments.

### `renew-interval`

+ The interval at which the locally cached timestamps are refreshed.
+ At an interval of `renew-interval`, TiKV starts a batch of timestamp refresh and adjusts the number of cached timestamps according to the timestamp consumption in the previous period. If you set this parameter to too large a value, the latest TiKV workload changes are not reflected in time. If you set this parameter to too small a value, the load of PD increases. If the write traffic is strongly fluctuating, if timestamps are frequently exhausted, and if write latency increases, you can set this parameter to a smaller value. At the same time, you should also consider the load of PD.
+ Default value: `"100ms"`

### `renew-batch-min-size`

+ The minimum number of locally cached timestamps.
+ TiKV adjusts the number of cached timestamps according to the timestamp consumption in the previous period. If the usage of locally cached timestamps is low, TiKV gradually reduces the number of cached timestamps until it reaches `renew-batch-min-size`. If large bursty write traffic often occurs in your application, you can set this parameter to a larger value as appropriate. Note that this parameter is the cache size for a single tikv-server. If you set the parameter to too large a value and the cluster contains many tikv-servers, the TSO consumption will be too fast.
+ In the **TiKV-RAW** \> **Causal timestamp** panel in Grafana, **TSO batch size** is the number of locally cached timestamps that has been dynamically adjusted according to the application workload. You can refer to this metric to adjust `renew-batch-min-size`.
+ Default value: `100`
