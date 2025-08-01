---
title: TiDB 集群报警规则
summary: TiDB 集群中各组件的报警规则详解。
---

# TiDB 集群报警规则

本文介绍了 TiDB 集群中各组件的报警规则，包括 TiDB、TiKV、PD、TiFlash、TiCDC、Node_exporter 和 Blackbox_exporter 的各报警项的规则描述及处理方法。

按照严重程度由高到低，报警项可分为紧急级别 \> 严重级别 \> 警告级别三类。该分级适用于以下各组件的报警项。

|  严重程度 |  说明   |
| :-------- | :----- |
|  紧急级别  | 最高严重程度，服务不可用，通常由于服务停止或节点故障导致，此时需要**马上进行人工干预** |
|  严重级别  |  服务可用性下降，需要用户密切关注异常指标 |
|  警告级别  |  对某一问题或错误的提醒   |

## TiDB 报警规则

本节介绍了 TiDB 组件的报警项。

### 紧急级别报警项

#### `TiDB_schema_error`

* 报警规则：

    `increase(tidb_session_schema_lease_error_total{type="outdated"}[15m]) > 0`

* 规则描述：

    TiDB 在一个 Lease 时间内没有重载到最新的 Schema 信息。如果 TiDB 无法继续对外提供服务，则报警。

* 处理方法：

    该问题通常由于 TiKV Region 不可用或超时导致，需要看 TiKV 的监控指标定位问题。

#### `TiDB_tikvclient_region_err_total`

* 报警规则：

    `increase(tidb_tikvclient_region_err_total[10m]) > 6000`

* 规则描述：

    TiDB server 根据自己的缓存信息访问 TiKV 的 Region leader。如果 Region leader 有变化或者当前 TiKV 的 Region 信息与 TiDB 的缓存不一致，就会产生 Region 缓存错误。如果在 10 分钟之内该错误多于 6000 次，则报警。

* 处理方法：

    查看 [**TiKV-Details** > **Cluster** 面板](/grafana-tikv-dashboard.md#cluster)，检查 leader 的分布是否均衡。

#### `TiDB_domain_load_schema_total`

* 报警规则：

    `increase(tidb_domain_load_schema_total{type="failed"}[10m]) > 10`

* 规则描述：

    TiDB 重载最新的 Schema 信息失败的总次数。如果在 10 分钟之内重载失败次数超过 10 次，则报警。

* 处理方法：

    参考 [`TiDB_schema_error`](#tidb_schema_error) 的处理方法。

### 严重级别报警项

#### `TiDB_server_panic_total`

* 报警规则：

    `increase(tidb_server_panic_total[10m]) > 0`

* 规则描述：

    发生崩溃的 TiDB 线程的数量。当出现崩溃的时候会报警。该线程通常会被恢复，否则 TiDB 会频繁重启。

* 处理方法：

    收集 panic 日志，定位原因。

### 警告级别报警项

#### `TiDB_memory_abnormal`

* 报警规则：

    `go_memstats_heap_inuse_bytes{job="tidb"} > 1e+10`

* 规则描述：

    对 TiDB 内存使用量的监控。如果内存使用大于 10 G，则报警。

* 处理方法：

    通过 HTTP API 来排查 goroutine 泄露的问题。

#### `TiDB_query_duration`

* 报警规则：

    `histogram_quantile(0.99, sum(rate(tidb_server_handle_query_duration_seconds_bucket[1m])) BY (le, instance)) > 1`

* 规则描述：

    TiDB 处理请求的延时。99% 的请求的响应时间都应在 1 秒之内，否则报警。

* 处理方法：

    查看 TiDB 的日志，搜索 SLOW_QUERY 和 TIME_COP_PROCESS 关键字，查找慢 SQL。

#### `TiDB_server_event_error`

* 报警规则：

    `increase(tidb_server_event_total{type=~"server_start|server_hang"}[15m]) > 0`

* 规则描述：

    TiDB 服务中发生的事件数量。当出现以下事件的时候会报警：

    1. start：TiDB 服务启动。
    2. hang：当发生了 Critical 级别的事件时，TiDB 进入 `hang` 模式，并等待人工 Kill。

* 处理方法：

    重启 TiDB 以恢复服务。

#### `TiDB_tikvclient_backoff_seconds_count`

* 报警规则：

    `increase(tidb_tikvclient_backoff_seconds_count[10m]) > 10`

* 规则描述：

    TiDB 访问 TiKV 发生错误时发起重试的次数。如果在 10 分钟之内重试次数多于 10 次，则报警。

* 处理方法：

    查看 TiKV 的监控状态。

#### `TiDB_monitor_time_jump_back_error`

* 报警规则：

    `increase(tidb_monitor_time_jump_back_total[10m]) > 0`

* 规则描述：

    如果 TiDB 所在机器的时间发生了回退，则报警。

* 处理方法：

    排查 NTP 配置。

#### `TiDB_ddl_waiting_jobs`

* 报警规则：

    `sum(tidb_ddl_waiting_jobs) > 5`

* 规则描述：

    如果 TiDB 中等待执行的 DDL 任务的数量大于 5，则报警。

* 处理方法：

    通过 `admin show ddl` 语句检查是否有耗时的 add index 操作正在执行。

## PD 报警规则

本节介绍了 PD 组件的报警项。

### 紧急级别报警项

#### `PD_cluster_down_store_nums`

* 报警规则：

    `(sum(pd_cluster_status{type="store_down_count"}) by (instance) > 0) and (sum(etcd_server_is_leader) by (instance) > 0)`

* 规则描述：

    PD 长时间（默认配置是 30 分钟）没有收到 TiKV/TiFlash 心跳。

* 处理方法：

    * 检查 TiKV/TiFlash 进程是否正常、网络是否隔离以及负载是否过高，并尽可能地恢复服务。
    * 如果确定 TiKV/TiFlash 无法恢复，可做下线处理。

### 严重级别报警项

#### `PD_etcd_write_disk_latency`

* 报警规则：

    `histogram_quantile(0.99, sum(rate(etcd_disk_wal_fsync_duration_seconds_bucket[1m])) by (instance, job, le)) > 1`

* 规则描述：

    fsync 操作延迟大于 1s，代表 etcd 写盘慢，这很容易引起 PD leader 超时或者 TSO 无法及时存盘等问题，从而导致整个集群停止服务。

* 处理方法：

    * 排查写入慢的原因。可能是由于其他服务导致系统负载过高。可以检查 PD 本身是否占用了大量 CPU 或 IO 资源。
    * 可尝试重启 PD 或手动 transfer leader 至其他的 PD 来恢复服务。
    * 如果由于环境原因无法恢复，可将有问题的 PD 下线替换。

#### `PD_miss_peer_region_count`

* 报警规则：

    `(sum(pd_regions_status{type="miss-peer-region-count"}) by (instance)  > 100) and (sum(etcd_server_is_leader) by (instance) > 0)`

* 规则描述：

    Region 的副本数小于 `max-replicas` 配置的值。

* 处理方法：

    * 查看是否有 TiKV 宕机或在做下线操作，尝试定位问题产生的原因。
    * 观察 region health 面板，查看 `miss-peer-region-count` 是否在不断减少。

### 警告级别报警项

#### `PD_cluster_lost_connect_store_nums`

* 报警规则：

    `(sum(pd_cluster_status{type="store_disconnected_count"}) by (instance) > 0) and (sum(etcd_server_is_leader) by (instance) > 0)`

* 规则描述：

    PD 在 20 秒之内未收到 TiKV/TiFlash 上报心跳。正常情况下是每 10 秒收到 1 次心跳。

* 处理方法：

    * 排查是否在重启 TiKV/TiFlash。
    * 检查 TiKV/TiFlash 进程是否正常、网络是否隔离以及负载是否过高，并尽可能地恢复服务。
    * 如果确定 TiKV/TiFlash 无法恢复，可做下线处理。
    * 如果确定 TiKV/TiFlash 可以恢复，但在短时间内还无法恢复，可以考虑延长 `max-down-time` 配置，防止超时后 TiKV/TiFlash 被判定为无法恢复并开始搬移数据。

#### `PD_cluster_unhealthy_tikv_nums`

* 报警规则：

    `(sum(pd_cluster_status{type="store_unhealth_count"}) by (instance) > 0) and (sum(etcd_server_is_leader) by (instance) > 0)`

* 规则描述：

    表示存在异常状态的 Store。如果这种状态持续一段时间（取决于配置的 [`max-store-down-time`](/pd-configuration-file.md#max-store-down-time)，默认值为 `30m`），Store 可能会变为 `Offline` 状态并触发 [`PD_cluster_down_store_nums`](#pd_cluster_down_store_nums) 报警。

* 处理方法：

    检查 TiKV Store 的状态。

#### `PD_cluster_low_space`

* 报警规则：

    `(sum(pd_cluster_status{type="store_low_space_count"}) by (instance) > 0) and (sum(etcd_server_is_leader) by (instance) > 0)`

* 规则描述：

    表示 TiKV/TiFlash 节点空间不足。

* 处理方法：

    * 检查集群中的空间是否普遍不足。如果是，则需要扩容。
    * 检查 Region balance 调度是否有问题。如果有问题，会导致数据分布不均衡。
    * 检查是否有文件占用了大量磁盘空间，比如日志、快照、core dump 等文件。
    * 降低该节点的 Region weight 来减少数据量。
    * 无法释放空间时，可以考虑主动下线该节点，防止由于磁盘空间不足而宕机。

#### `PD_etcd_network_peer_latency`

* 报警规则：

    `histogram_quantile(0.99, sum(rate(etcd_network_peer_round_trip_time_seconds_bucket[1m])) by (To, instance, job, le)) > 1`

* 规则描述：

    PD 节点之间网络延迟高，严重情况下会导致 leader 超时和 TSO 存盘超时，从而影响集群服务。

* 处理方法：

    * 检查网络状况和系统负载情况。
    * 如果由于环境原因无法恢复，可将有问题的 PD 下线替换。

#### `PD_tidb_handle_requests_duration`

* 报警规则：

    `histogram_quantile(0.99, sum(rate(pd_client_request_handle_requests_duration_seconds_bucket{type="tso"}[1m])) by (instance, job, le)) > 0.1`

* 规则描述：

    PD 处理 TSO 请求耗时过长，一般是由于负载过高。

* 处理方法：

    * 检查服务器负载状况。
    * 使用 pprof 抓取 PD 的 CPU profile 进行分析。
    * 手动切换 PD leader。
    * 如果是环境问题，则将有问题的 PD 下线替换。

#### `PD_down_peer_region_nums`

* 报警规则：

    `(sum(pd_regions_status{type="down-peer-region-count"}) by (instance)  > 0) and (sum(etcd_server_is_leader) by (instance) > 0)`

* 规则描述：

    Raft leader 上报有不响应 peer 的 Region 数量。

* 处理方法：

    * 检查是否有 TiKV 宕机，或刚发生重启，或者繁忙。
    * 观察 region health 面板，检查 `down_peer_region_count` 是否在不断减少。
    * 检查是否有 TiKV 之间网络不通。

#### `PD_pending_peer_region_count`

* 报警规则：

    `(sum(pd_regions_status{type="pending-peer-region-count"}) by (instance) > 100) and (sum(etcd_server_is_leader) by (instance) > 0)`

* 规则描述：

    Raft log 落后的 Region 过多。由于调度产生少量的 pending peer 是正常的，但是如果持续很高，就可能有问题。

* 处理方法：

    * 观察 region health 面板，检查 `pending_peer_region_count` 是否在不断减少。
    * 检查 TiKV 之间的网络状况，特别是带宽是否足够。

#### `PD_leader_change`

* 报警规则：

    `count(changes(pd_tso_events{type="save"}[10m]) > 0) >= 2`

* 规则描述：

    近期发生了 PD leader 切换。

* 处理方法：

    * 排除人为因素，比如重启 PD、手动 transfer leader 或调整 leader 优先级等。
    * 检查网络状况和系统负载情况。
    * 如果由于环境原因无法恢复，可将有问题的 PD 下线替换。

#### `TiKV_space_used_more_than_80%`

* 报警规则：

    `sum(pd_cluster_status{type="storage_size"}) / sum(pd_cluster_status{type="storage_capacity"}) * 100 > 80`

* 规则描述：

    集群空间占用超过 80%。

* 处理方法：

    * 确认是否需要扩容。
    * 排查是否有文件占用了大量磁盘空间，比如日志、快照或 core dump 等文件。

#### `PD_system_time_slow`

* 报警规则：

    `changes(pd_tso_events{type="system_time_slow"}[10m]) >= 1`

* 规则描述：

    系统时间可能发生回退。

* 处理方法：

    检查系统时间设置是否正确。

#### `PD_no_store_for_making_replica`

* 报警规则：

    `increase(pd_checker_event_count{type="replica_checker", name="no_target_store"}[1m]) > 0`

* 规则描述：

    没有合适的 store 用来补副本。

* 处理方法：

    * 检查 store 是否空间不足。
    * 根据 label 配置（如果有这个配置的话）来检查是否有可以补副本的 store。

#### `PD_cluster_slow_tikv_nums`

* 报警规则：

    `sum(pd_cluster_status{type="store_slow_count"}) by (instance) > 0) and (sum(etcd_server_is_leader) by (instance) > 0`

* 规则描述：

    某一个 TiKV 被检测为慢节点。慢节点的检测由 TiKV `raftstore.inspect-interval` 参数控制，参见 [TiKV 配置文件描述](/tikv-configuration-file.md#inspect-interval)。

* 处理方法：

    * 观察 [**TiKV-Details** > **PD** 面板](/grafana-tikv-dashboard.md#pd)，查看 Store Slow Score 监控指标，找出指标数值超过 80 的节点，该节点即为被检测到的慢节点。
    * 观察 [**TiKV-Details** > **Raft IO** 面板](/grafana-tikv-dashboard.md#raft-io)，查看延迟是否升高。如果延迟很高，表明磁盘可能存在瓶颈。
    * 调大 TiKV [`raftstore.inspect-interval`](/tikv-configuration-file.md#inspect-interval) 参数，提高延迟检测的超时上限。
    * 如果需要进一步分析报警的 TiKV 节点的性能问题，找到优化方法，可以参考[性能分析和优化方法](/performance-tuning-methods.md#storage-async-write-durationstore-duration-和-apply-duration)。

## TiKV 报警规则

本节介绍了 TiKV 组件的报警项。

### 紧急级别报警项

#### `TiKV_memory_used_too_fast`

* 报警规则：

    `process_resident_memory_bytes{job=~"tikv",instance=~".*"} - (process_resident_memory_bytes{job=~"tikv",instance=~".*"} offset 5m) > 5*1024*1024*1024`

* 规则描述：

    目前没有和内存相关的 TiKV 的监控，你可以通过 Node_exporter 监控集群内机器的内存使用情况。如上规则表示，如果在 5 分钟之内内存使用超过 5GB（TiKV 内存占用的太快），则报警。

* 处理方法：

    调整 `rocksdb.defaultcf` 和 `rocksdb.writecf` 的 `block-cache-size` 的大小。

#### `TiKV_GC_can_not_work`

* 报警规则：

    `sum(increase(tikv_gcworker_gc_tasks_vec{task="gc"}[1d])) < 1 and (sum(increase(tikv_gc_compaction_filter_perform[1d])) < 1 and sum(increase(tikv_engine_event_total{db="kv", cf="write", type="compaction"}[1d])) >= 1)`

* 规则描述：

    在 24 小时内一个 TiKV 实例上没有成功执行 GC，说明 GC 不能正常工作了。短期内 GC 不运行不会造成太大的影响，但如果 GC 一直不运行，版本会越来越多，从而导致查询变慢。

* 处理方法：

    1. 执行 `SELECT VARIABLE_VALUE FROM mysql.tidb WHERE VARIABLE_NAME="tikv_gc_leader_desc"` 来找到 gc leader 对应的 `tidb-server`；
    2. 查看该 `tidb-server` 的日志，grep gc_worker tidb.log；
    3. 如果发现这段时间一直在 resolve locks（最后一条日志是 `start resolve locks`）或者 delete ranges（最后一条日志是 `start delete {number} ranges`），说明 GC 进程是正常的。否则请从 PingCAP 官方或 TiDB 社区[获取支持](/support.md)。

### 严重级别报警项

#### `TiKV_server_report_failure_msg_total`

* 报警规则：

    `sum(rate(tikv_server_report_failure_msg_total{type="unreachable"}[10m])) BY (store_id) > 10`

* 规则描述：

    表明无法连接远端的 TiKV。

* 处理方法：

    1. 检查网络是否通畅。
    2. 检查远端 TiKV 是否挂掉。
    3. 如果远端 TiKV 没有挂掉，检查压力是否太大，参考 [`TiKV_channel_full_total`](#tikv_channel_full_total) 处理方法。

#### `TiKV_channel_full_total`

* 报警规则：

    `sum(rate(tikv_channel_full_total[10m])) BY (type, instance) > 0`

* 规则描述：

    该错误通常是因为 Raftstore 线程卡死，TiKV 的压力已经非常大了。

* 处理方法：

    1. 观察 [**TiKV-Details** > **Raft Propose** 面板](/grafana-tikv-dashboard.md#raft-propose)，查看这个报警的 TiKV 节点是否明显比其他 TiKV 高很多。如果是，表明这个 TiKV 上有热点，需要检查热点调度是否能正常工作。
    2. 观察 [**TiKV-Details** > **Raft IO** 面板](/grafana-tikv-dashboard.md#raft-io)，查看延迟是否升高。如果延迟很高，表明磁盘可能存在瓶颈。
    3. 观察 [**TiKV-Details** > **Raft process** 面板](/grafana-tikv-dashboard.md#raft-process)，关注 `tick duration` 是否很高。如果是，需要将 TiKV 配置项 [`raftstore.raft-base-tick-interval`](/tikv-configuration-file.md#raft-base-tick-interval) 设置为 `"2s"`。

#### `TiKV_write_stall`

* 报警规则：

    `delta(tikv_engine_write_stall[10m]) > 0`

* 规则描述：

    RocksDB 写入压力太大，出现了 stall。

* 处理方法：

    1. 观察磁盘监控，排除磁盘问题。
    2. 看 TiKV 是否有写入热点。
    3. 在 `[rocksdb]` 和 `[raftdb]` 配置下调大 `max-sub-compactions` 的值。

#### `TiKV_raft_log_lag`

* 报警规则：

    `histogram_quantile(0.99, sum(rate(tikv_raftstore_log_lag_bucket[1m])) by (le, instance)) > 5000`

* 规则描述：

    这个值偏大，表明 Follower 已经远远落后于 Leader，Raft 没法正常同步了。可能的原因是 Follower 所在的 TiKV 卡住或者挂掉了。

#### `TiKV_async_request_snapshot_duration_seconds`

* 报警规则：

    `histogram_quantile(0.99, sum(rate(tikv_storage_engine_async_request_duration_seconds_bucket{type="snapshot"}[1m])) by (le, instance, type)) > 1`

* 规则描述：

    这个值偏大，表明 Raftstore 负载压力很大，可能已经卡住。

* 处理方法：

    参考 [`TiKV_channel_full_total`](#tikv_channel_full_total) 的处理方法。

#### `TiKV_async_request_write_duration_seconds`

* 报警规则：

    `histogram_quantile(0.99, sum(rate(tikv_storage_engine_async_request_duration_seconds_bucket{type="write"}[1m])) by (le, instance, type)) > 1`

* 规则描述：

    这个值偏大，表明 Raft write 耗时很长。

* 处理方法：

    1. 观察 [**TiKV-Details** > **Raft propose** 面板](/grafana-tikv-dashboard.md#raft-propose)，查看这个报警的 TiKV 节点的 **99% Propose wait duration per server** 是否明显比其他 TiKV 高很多。如果是，表明这个 TiKV 上有热点，需要检查热点调度是否能正常工作。
    2. 观察 [**TiKV-Details** > **Raft IO** 面板](/grafana-tikv-dashboard.md#raft-io)，查看延迟是否升高。如果延迟很高，表明磁盘可能存在瓶颈。
    3. 如果需要进一步分析报警的 TiKV 节点的性能问题，找到优化方法，可以参考[性能分析和优化方法](/performance-tuning-methods.md#storage-async-write-durationstore-duration-和-apply-duration)。

#### `TiKV_coprocessor_request_wait_seconds`

* 报警规则：

    `histogram_quantile(0.9999, sum(rate(tikv_coprocessor_request_wait_seconds_bucket[1m])) by (le, instance, req)) > 10`

* 规则描述：

    这个值偏大，表明 Coprocessor worker 压力很大。可能有比较慢的任务卡住了 Coprocessor 线程。

* 处理方法：

    1. 从 TiDB 日志中查看慢查询日志，看查询是否用到了索引或全表扫，或者看是否需要做 analyze。
    2. 排查是否有热点。
    3. 查看 Coprocessor 监控，看 `coprocessor table/index scan` 里 `total` 和 `process` 是否匹配。如果相差太大，表明做了太多的无效查询。看是否有 `over seek bound`，如果有，表明版本太多，GC 工作不及时，需要增大并行 GC 的线程数。

#### `TiKV_raftstore_thread_cpu_seconds_total`

* 报警规则：

    `sum(rate(tikv_thread_cpu_seconds_total{name=~"raftstore_.*"}[1m])) by (instance) > 1.6`

* 规则描述：

    监测 raftstore 的 CPU 消耗。如果该值偏大，表明 Raftstore 线程压力很大。

    该报警项的阈值为 [`raftstore.store-pool-size`](/tikv-configuration-file.md#store-pool-size) 的 80%。`raftstore.store-pool-size` 默认为 2，所以该阈值为 1.6。 

* 处理方法：

    参考 [`TiKV_channel_full_total`](#tikv_channel_full_total) 的处理方法。

#### `TiKV_raft_append_log_duration_secs`

* 报警规则：

    `histogram_quantile(0.99, sum(rate(tikv_raftstore_append_log_duration_seconds_bucket[1m])) by (le, instance)) > 1`

* 规则描述：

    表示 append Raft log 的耗时，如果高，通常是因为 IO 太忙了。

#### `TiKV_raft_apply_log_duration_secs`

* 报警规则：

    `histogram_quantile(0.99, sum(rate(tikv_raftstore_apply_log_duration_seconds_bucket[1m])) by (le, instance)) > 1`

* 规则描述：

    表示 apply Raft log 耗时，如果高，通常是因为 IO 太忙了。

#### `TiKV_scheduler_latch_wait_duration_seconds`

* 报警规则：

    `histogram_quantile(0.99, sum(rate(tikv_scheduler_latch_wait_duration_seconds_bucket[1m])) by (le, instance, type)) > 1`

* 规则描述：

    Scheduler 中写操作获取内存锁时的等待时间。如果这个值高，表明写操作冲突较多，也可能是某些引起冲突的操作耗时较长，阻塞了其它等待相同锁的操作。

* 处理方法：

    1. 查看 `Scheduler` 和 `Scheduler-${cmd}`（`${cmd}` 为指定待查询的写命令）监控中的 scheduler command duration，看哪一个命令耗时最大。
    2. 查看 `Scheduler` 和 `Scheduler-${cmd}` 监控中的 scheduler scan details，检查 `total` 和 `process` 是否匹配。如果相差太大，表明有很多无效的扫描。同时观察是否有 `over seek bound`，如果太多，表明 GC 不及时。
    3. 查看 Storage 监控中的 storage async snapshot/write duration，看是否 Raft 操作不及时。

#### `TiKV_thread_apply_worker_cpu_seconds`

* 报警规则：

    `max(rate(tikv_thread_cpu_seconds_total{name=~"apply_.*"}[1m])) by (instance) > 0.9`

* 规则描述：

    Apply Raft log 线程压力太大，已经接近或超过 apply 线程的处理上限。通常是因为短期内写入的数据量太多造成的。

### 警告级别报警项

#### `TiKV_leader_drops`

* 报警规则：

    `delta(tikv_pd_heartbeat_tick_total{type="leader"}[30s]) < -10`

* 规则描述：

    该问题通常是因为 Raftstore 线程卡住了。

* 处理方法：

    1. 参考 [`TiKV_channel_full_total`](#tikv_channel_full_total) 的处理方法。
    2. 如果 TiKV 压力很小，考虑 PD 的调度是否太频繁。可以查看 PD 页面的 Operator Create 面板，排查 PD 产生调度的类型和数量。

#### `TiKV_raft_process_ready_duration_secs`

* 报警规则：

    `histogram_quantile(0.999, sum(rate(tikv_raftstore_raft_process_duration_secs_bucket{type='ready'}[1m])) by (le, instance, type)) > 2`

* 规则描述：

    表示处理 Raft ready 的耗时。这个值大，通常是因为 append log 任务卡住了。

#### `TiKV_raft_process_tick_duration_secs`

* 报警规则：

    `histogram_quantile(0.999, sum(rate(tikv_raftstore_raft_process_duration_secs_bucket{type=’tick’}[1m])) by (le, instance, type)) > 2`

* 规则描述：

    表示处理 Raft tick 的耗时，这个值大，通常是因为 Region 太多导致的。

* 处理方法：

    1. 考虑使用更高等级的日志，比如 `warn` 或者 `error`。
    2. 在 `[raftstore]` 配置下添加 `raft-base-tick-interval = “2s”`。

#### `TiKV_scheduler_context_total`

* 报警规则：

    `abs(delta( tikv_scheduler_context_total[5m])) > 1000`

* 规则描述：

    Scheduler 正在执行的写命令数量。这个值高，表示任务完成得不及时。

* 处理方法：

    参考 [`TiKV_scheduler_latch_wait_duration_seconds`](#tikv_scheduler_latch_wait_duration_seconds) 的处理方法。

#### `TiKV_scheduler_command_duration_seconds`

* 报警规则：

    `histogram_quantile(0.99, sum(rate(tikv_scheduler_command_duration_seconds_bucket[1m])) by (le, instance, type)) > 1`

* 规则描述：

    表明 Scheduler 执行命令的耗时。

* 处理方法：

    参考 [`TiKV_scheduler_latch_wait_duration_seconds`](#tikv_scheduler_latch_wait_duration_seconds) 的处理方法。

#### `TiKV_coprocessor_outdated_request_wait_seconds`

* 报警规则：

    `delta(tikv_coprocessor_outdated_request_wait_seconds_count[10m]) > 0`

* 规则描述：

    Coprocessor 已经过期的请求等待的时间。这个值高，表示 Coprocessor 压力已经非常大了。

* 处理方法：

    参考 [`TiKV_coprocessor_request_wait_seconds`](#tikv_coprocessor_request_wait_seconds) 的处理方法。

#### `TiKV_coprocessor_pending_request`

* 报警规则：

    `delta(tikv_coprocessor_pending_request[10m]) > 5000`

* 规则描述：

    Coprocessor 排队的请求。

* 处理方法：

    参考 [`TiKV_coprocessor_request_wait_seconds`](#tikv_coprocessor_request_wait_seconds) 的处理方法。

#### `TiKV_batch_request_snapshot_nums`

* 报警规则：

    `sum(rate(tikv_thread_cpu_seconds_total{name=~"cop_.*"}[1m])) by (instance) / (count(tikv_thread_cpu_seconds_total{name=~"cop_.*"}) * 0.9) / count(count(tikv_thread_cpu_seconds_total) by (instance)) > 0`

* 规则描述：

    某个 TiKV 的 Coprocessor CPU 使用率超过了 90%。

#### `TiKV_pending_task`

* 报警规则：

    `sum(tikv_worker_pending_task_total) BY (instance,name)  > 1000`

* 规则描述：

    TiKV 等待的任务数量。

* 处理方法：

    观察 [**TiKV-Details** > **Task** 面板](/grafana-tikv-dashboard.md#task)，查看是哪一类任务的 `Worker pending tasks` 值偏高。

#### `TiKV_low_space`

* 报警规则：

    `sum(tikv_store_size_bytes{type="available"}) by (instance) / sum(tikv_store_size_bytes{type="capacity"}) by (instance) < 0.2`

* 规则描述：

    TiKV 数据量超过节点配置容量或物理磁盘容量的 80%。

* 处理方法：

    确认节点空间均衡情况，做好扩容计划。

#### `TiKV_approximate_region_size`

* 报警规则：

    `histogram_quantile(0.99, sum(rate(tikv_raftstore_region_size_bucket[1m])) by (le)) > 1073741824`

* 规则描述：

    TiKV split checker 扫描到的最大的 Region approximate size 在 1 分钟内持续大于 1 GB。

* 处理方法：

    Region 分裂的速度不及写入的速度。为缓解这种情况，建议更新到支持 batch-split 的版本 (>= 2.1.0-rc1)。如暂时无法更新，可以使用 `pd-ctl operator add split-region <region_id> --policy=approximate` 手动分裂 Region。

## TiFlash 报警规则

关于 TiFlash 报警规则的详细描述，参见 [TiFlash 报警规则](/tiflash/tiflash-alert-rules.md)。

## TiCDC 报警规则

关于 TiCDC 报警规则的详细描述，参见 [TiCDC 集群监控报警](/ticdc/ticdc-alert-rules.md)。

## Node_exporter 主机报警规则

本节介绍了 Node_exporter 主机的报警项。

### 紧急级别报警项

#### `NODE_disk_used_more_than_80%`

* 报警规则：

    `node_filesystem_avail_bytes{fstype=~"(ext.|xfs)", mountpoint!~"/boot"} / node_filesystem_size_bytes{fstype=~"(ext.|xfs)", mountpoint!~"/boot"} * 100 <= 20`

* 规则描述：

    机器磁盘空间使用率超过 80%。

* 处理方法：

    登录机器，执行 `df -h` 命令，查看磁盘空间使用率，做好扩容计划。

#### `NODE_disk_inode_more_than_80%`

* 报警规则：

    `node_filesystem_files_free{fstype=~"(ext.|xfs)"} / node_filesystem_files{fstype=~"(ext.|xfs)"} * 100 < 20`

* 规则描述：

    机器磁盘挂载目录文件系统 inode 使用率超过 80%。

* 处理方法：

    登录机器，执行 `df -i` 命令，查看磁盘挂载目录文件系统 inode 使用率，做好扩容计划。

#### `NODE_disk_readonly`

* 报警规则：

    `node_filesystem_readonly{fstype=~"(ext.|xfs)"} == 1`

* 规则描述：

    磁盘挂载目录文件系统只读，无法写入数据，一般是因为磁盘故障或文件系统损坏。

* 处理方法：

    * 登录机器创建文件测试是否正常。
    * 检查该服务器硬盘指示灯是否正常，如异常，需更换磁盘并修复该机器文件系统。

### 严重级别报警项

#### `NODE_memory_used_more_than_80%`

* 报警规则：

    `(((node_memory_MemTotal_bytes-node_memory_MemFree_bytes-node_memory_Cached_bytes)/(node_memory_MemTotal_bytes)*100)) >= 80`

* 规则描述：

    机器内存使用率超过 80%。

* 处理方法：

    * 在 Grafana Node Exporter 页面查看该主机的 Memory 面板，检查 `Used` 是否过高，`Available` 内存是否过低。
    * 登录机器，执行 `free -m` 命令查看内存使用情况，执行 `top` 看是否有异常进程的内存使用率过高。

### 警告级别报警项

#### `NODE_node_overload`

* 报警规则：

    `(node_load5 / count without (cpu, mode) (node_cpu_seconds_total{mode="system"})) > 1`

* 规则描述：

    机器 CPU 负载较高。

* 处理方法：

    * 在 Grafana Node exporter 页面上查看该主机的 CPU Usage 及 Load Average，检查是否过高。
    * 登录机器，执行 `top` 查看 load average 及 CPU 使用率，看是否是异常进程的 CPU 使用率过高。

#### `NODE_cpu_used_more_than_80%`

* 报警规则：

    `avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) by(instance) * 100 <= 20`

* 规则描述：

    机器 CPU 使用率超过 80%。

* 处理方法：

    * 在 Grafana Node exporter 页面上查看该主机的 CPU Usage 及 Load Average，检查是否过高。
    * 登录机器，执行 `top` 查看 load average 及 CPU 使用率，看是否是异常进程的 CPU 使用率过高。

#### `NODE_tcp_estab_num_more_than_50000`

* 报警规则：

    `node_netstat_Tcp_CurrEstab > 50000`

* 规则描述：

    机器 `establish` 状态的 TCP 链接超过 50,000。

* 处理方法：

    登录机器执行 `ss -s` 可查看当前系统 `estab` 状态的 TCP 链接数，执行 `netstat` 查看是否有异常链接。

#### `NODE_disk_read_latency_more_than_32ms`

* 报警规则：

    `((rate(node_disk_read_time_seconds_total{device=~".+"}[5m]) / rate(node_disk_reads_completed_total{device=~".+"}[5m])) or (irate(node_disk_read_time_seconds_total{device=~".+"}[5m]) / irate(node_disk_reads_completed_total{device=~".+"}[5m])) ) * 1000 > 32`

* 规则描述：

    磁盘读延迟超过 32 毫秒。

* 处理方法：

    * 查看 Grafana Disk Performance Dashboard 观察磁盘使用情况。
    * 查看 Disk Latency 面板观察磁盘的读延迟。
    * 查看 Disk IO Utilization 面板观察 IO 使用率。

#### `NODE_disk_write_latency_more_than_16ms`

* 报警规则：

    `((rate(node_disk_write_time_seconds_total{device=~".+"}[5m]) / rate(node_disk_writes_completed_total{device=~".+"}[5m])) or (irate(node_disk_write_time_seconds_total{device=~".+"}[5m]) / irate(node_disk_writes_completed_total{device=~".+"}[5m])))> 16`

* 规则描述：

    机器磁盘写延迟超过 16 毫秒。

* 处理方法：

    * 查看 Grafana Disk Performance Dashboard 观察磁盘使用情况。
    * 查看 Disk Latency 面板可查看磁盘的写延迟。
    * 查看 Disk IO Utilization 面板可查看 IO 使用率。

## Blackbox_exporter TCP、ICMP 和 HTTP 报警规则

本节介绍了 Blackbox_exporter TCP、ICMP 和 HTTP 的报警项。

### 紧急级别报警项

#### `TiDB_server_is_down`

* 报警规则：

    `probe_success{group="tidb"} == 0`

* 规则描述：

    TiDB 服务端口探测失败。

* 处理方法：

    * 检查 TiDB 服务所在机器是否宕机。
    * 检查 TiDB 进程是否存在。
    * 检查监控机与 TiDB 服务所在机器之间网络是否正常。

#### `TiFlash_server_is_down`

* 报警规则：

    `probe_success{group="tiflash"} == 0`

* 规则描述：

    TiFlash 服务端口探测失败。

* 处理方法：

    * 检查 TiFlash 服务所在机器是否宕机。
    * 检查 TiFlash 进程是否存在。
    * 检查监控机与 TiFlash 服务所在机器之间网络是否正常。

#### `TiKV_server_is_down`

* 报警规则：

    `probe_success{group="tikv"} == 0`

* 规则描述：

    TiKV 服务端口探测失败。

* 处理方法：

    * 检查 TiKV 服务所在机器是否宕机。
    * 检查 TiKV 进程是否存在。
    * 检查监控机与 TiKV 服务所在机器之间网络是否正常。

#### `PD_server_is_down`

* 报警规则：

    `probe_success{group="pd"} == 0`

* 规则描述：

    PD 服务端口探测失败。

* 处理方法：

    * 检查 PD 服务所在机器是否宕机。
    * 检查 PD 进程是否存在。
    * 检查监控机与 PD 服务所在机器之间网络是否正常。

#### `Node_exporter_server_is_down`

* 报警规则：

    `probe_success{group="node_exporter"} == 0`

* 规则描述：

    Node_exporter 服务端口探测失败。

* 处理方法：

    * 检查 Node_exporter 服务所在机器是否宕机。
    * 检查 Node_exporter 进程是否存在。
    * 检查监控机与 Node_exporter 服务所在机器之间网络是否正常。

#### `Blackbox_exporter_server_is_down`

* 报警规则：

    `probe_success{group="blackbox_exporter"} == 0`

* 规则描述：

    Blackbox_exporter 服务端口探测失败。

* 处理方法：

    * 检查 Blackbox_exporter 服务所在机器是否宕机。
    * 检查 Blackbox_exporter 进程是否存在。
    * 检查监控机与 Blackbox_exporter 服务所在机器之间网络是否正常。

#### `Grafana_server_is_down`

* 报警规则：

    `probe_success{group="grafana"} == 0`

* 规则描述：

    Grafana 服务端口探测失败。

* 处理方法：

    * 检查 Grafana 服务所在机器是否宕机。
    * 检查 Grafana 进程是否存在。
    * 检查监控机与 Grafana 服务所在机器之间网络是否正常。

#### `Pushgateway_server_is_down`

* 报警规则：

    `probe_success{group="pushgateway"} == 0`

* 规则描述：

    Pushgateway 服务端口探测失败。

* 处理方法：

    * 检查 Pushgateway 服务所在机器是否宕机。
    * 检查 Pushgateway 进程是否存在。
    * 检查监控机与 Pushgateway 服务所在机器之间网络是否正常。

#### `Kafka_exporter_is_down`

* 报警规则：

    `probe_success{group="kafka_exporter"} == 0`

* 规则描述：

    Kafka_exporter 服务端口探测失败。

* 处理方法：

    * 检查 Kafka_exporter 服务所在机器是否宕机。
    * 检查 Kafka_exporter 进程是否存在。
    * 检查监控机与 Kafka_exporter 服务所在机器之间网络是否正常。

#### `Pushgateway_metrics_interface`

* 报警规则：

    `probe_success{job="blackbox_exporter_http"} == 0`

* 规则描述：

    Pushgateway 服务 http 接口探测失败。

* 处理方法：

    * 检查 Pushgateway 服务所在机器是否宕机。
    * 检查 Pushgateway 进程是否存在。
    * 检查监控机与 Pushgateway 服务所在机器之间网络是否正常。

### 警告级别报警项

#### `BLACKER_ping_latency_more_than_1s`

* 报警规则：

    `max_over_time(probe_duration_seconds{job=~"blackbox_exporter.*_icmp"}[1m]) > 1`

* 规则描述：

    Ping 延迟超过 1 秒。

* 处理方法：

    * 在 Grafana Blackbox Exporter 页面上检查两个节点间的 ping 延迟是否太高。
    * 在 Grafana Node Exporter 页面的 TCP 面板上检查是否有丢包。
