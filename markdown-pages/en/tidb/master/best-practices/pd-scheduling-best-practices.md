---
title: Best Practices for PD Scheduling
summary: This document summarizes PD scheduling best practices, including scheduling process, load balancing, hot regions scheduling, cluster topology awareness, scale-down and failure recovery, region merge, query scheduling status, and control scheduling strategy. It also covers common scenarios such as uneven distribution of leaders/regions, slow node recovery, and troubleshooting TiKV nodes.
aliases: ['/docs/dev/best-practices/pd-scheduling-best-practices/','/docs/dev/reference/best-practices/pd-scheduling/']
---

# Best Practices for PD Scheduling

This document details the principles and strategies of PD scheduling through common scenarios to facilitate your application. This document assumes that you have a basic understanding of TiDB, TiKV and PD with the following core concepts:

- [leader/follower/learner](/glossary.md#leaderfollowerlearner)
- [operator](/glossary.md#operator)
- [operator step](/glossary.md#operator-step)
- [pending/down](/glossary.md#pendingdown)
- [region/peer/Raft group](/glossary.md#regionpeerraft-group)
- [region split](/glossary.md#region-split)
- [scheduler](/glossary.md#scheduler)
- [store](/glossary.md#store)

> **Note:**
>
> This document initially targets TiDB 3.0. Although some features are not supported in earlier versions (2.x), the underlying mechanisms are similar and this document can still be used as a reference.

## PD scheduling policies

This section introduces the principles and processes involved in the scheduling system.

### Scheduling process

The scheduling process generally has three steps:

1. Collect information

    Each TiKV node periodically reports two types of heartbeats to PD:

    - `StoreHeartbeat`: Contains the overall information of stores, including disk capacity, available storage, and read/write traffic
    - `RegionHeartbeat`: Contains the overall information of regions, including the range of each region, peer distribution, peer status, data volume, and read/write traffic

    PD collects and restores this information for scheduling decisions.

2. Generate operators

    Different schedulers generate the operators based on their own logic and requirements, with the following considerations:

     - Do not add peers to a store in abnormal states (disconnected, down, busy, low space)
     - Do not balance regions in abnormal states
     - Do not transfer a leader to a pending peer
     - Do not remove a leader directly
     - Do not break the physical isolation of various region peers
     - Do not violate constraints such as label property

3. Execute operators

    To execute the operators, the general procedure is:

    1. The generated operator first joins a queue managed by `OperatorController`.

    2. `OperatorController` takes the operator out of the queue and executes it with a certain amount of concurrency based on the configuration. This step is to assign each operator step to the corresponding region leader.

    3. The operator is marked as "finish" or "timeout" and removed from the queue.

### Load balancing

Region primarily relies on `balance-leader` and `balance-region` schedulers to achieve load balance. Both schedulers target distributing regions evenly across all stores in the cluster but with separate focuses: `balance-leader` deals with region leader to balance incoming client requests, whereas `balance-region` concerns itself with each region peer to redistribute the pressure of storage and avoid exceptions like out of storage space.

`balance-leader` and `balance-region` share a similar scheduling process:

1. Rate stores according to their resource availability.
2. `balance-leader` or `balance-region` constantly transfer leaders or peers from stores with high scores to those with low scores.

However, their rating methods are different. `balance-leader` uses the sum of all region sizes corresponding to leaders in a store, whereas the way of `balance-region` is relatively complicated. Depending on the specific storage capacity of each node, the rating method of `balance-region` might:

- based on the amount of data when there is sufficient storage (to balance data distribution among nodes).
- based on the available storage when there is insufficient storage (to balance the storage availability on different nodes).
- based on the weighted sum of the two factors above when neither of the situations applies.

Because different nodes might differ in performance, you can also set the weight of load balancing for different stores. `leader-weight` and `region-weight` are used to control the leader weight and region weight respectively ("1" by default for both). For example, when the `leader-weight` of a store is set to "2", the number of leaders on the node is about twice as many as that of other nodes after the scheduling stabilizes. Similarly, when the `leader-weight` of a store is set to "0.5", the number of leaders on the node is about half as many as that of other nodes.

### Hot regions scheduling

For hot regions scheduling, use `hot-region-scheduler`. Since TiDB v3.0, the process is performed as follows:

1. Count hot regions by determining read/write traffic that exceeds a certain threshold for a certain period based on the information reported by stores.

2. Redistribute these regions in a similar way to load balancing.

For hot write regions, `hot-region-scheduler` attempts to redistribute both region peers and leaders; for hot read regions, `hot-region-scheduler` only redistributes region leaders.

### Cluster topology awareness

Cluster topology awareness enables PD to distribute replicas of a region as much as possible. This is how TiKV ensures high availability and disaster recovery capability. PD continuously scans all regions in the background. When PD finds that the distribution of regions is not optimal, it generates an operator to replace peers and redistribute regions.

The component to check region distribution is `replicaChecker`, which is similar to a scheduler except that it cannot be disabled. `replicaChecker` schedules based on the configuration of `location-labels`. For example, `[zone,rack,host]` defines a three-tier topology for a cluster. PD attempts to schedule region peers to different zones first, or to different racks when zones are insufficient (for example, 2 zones for 3 replicas), or to different hosts when racks are insufficient.

### Scale-down and failure recovery

Scale-down refers to the process when you take a store offline and mark it as "offline" using a command. PD replicates the regions on the offline node to other nodes by scheduling. Failure recovery applies when stores failed and cannot be recovered. In this case, regions with peers distributed on the corresponding store might lose replicas, which requires PD to replenish on other nodes.

The processes of scale-down and failure recovery are basically the same. `replicaChecker` finds a region peer in abnormal states, and then generates an operator to replace the abnormal peer with a new one on a healthy store.

### Region merge

Region merge refers to the process of merging adjacent small regions. It serves to avoid unnecessary resource consumption by a large number of small or even empty regions after data deletion. Region merge is performed by `mergeChecker`, which processes in a similar way to `replicaChecker`: PD continuously scans all regions in the background, and generates an operator when contiguous small regions are found.

Specifically, when a newly split Region exists for more than the value of [`split-merge-interval`](/pd-configuration-file.md#split-merge-interval) (`1h` by default), if the following conditions occur at the same time, this Region triggers the Region merge scheduling:

- The size of this Region is smaller than the value of the [`max-merge-region-size`](/pd-configuration-file.md#max-merge-region-size). Starting from v8.4.0, the default value is changed from 20 MiB to 54 MiB. The new default value is automatically applied only to newly created clusters. Existing clusters are not affected.

- The number of keys in this Region is smaller than the value of [`max-merge-region-keys`](/pd-configuration-file.md#max-merge-region-keys). Starting from v8.4.0, the default value is changed from 200000 to 540000. The new default value is automatically applied only to newly created clusters. Existing clusters are not affected.

## Query scheduling status

You can check the status of scheduling system through metrics, pd-ctl and logs. This section briefly introduces the methods of metrics and pd-ctl. Refer to [PD Monitoring Metrics](/grafana-pd-dashboard.md) and [PD Control](/pd-control.md) for details.

### Operator status

The **Grafana PD/Operator** page shows the metrics about operators, among which:

- Schedule operator create: Operator creating information
- Operator finish duration: Execution time consumed by each operator
- Operator step duration: Execution time consumed by the operator step

You can query operators using pd-ctl with the following commands:

- `operator show`: Queries all operators generated in the current scheduling task
- `operator show [admin | leader | region]`: Queries operators by type

### Balance status

The **Grafana PD/Statistics - Balance** page shows the metrics about load balancing, among which:

- Store leader/region score: Score of each store
- Store leader/region count: The number of leaders/regions in each store
- Store available: Available storage on each store

You can use store commands of pd-ctl to query balance status of each store.

### Hot Region status

The **Grafana PD/Statistics - hotspot** page shows the metrics about hot regions, among which:

- Hot write region's leader/peer distribution: the leader/peer distribution in hot write regions
- Hot read region's leader distribution: the leader distribution in hot read regions

You can also query the status of hot regions using pd-ctl with the following commands:

- `hot read`: Queries hot read regions
- `hot write`: Queries hot write regions
- `hot store`: Queries the distribution of hot regions by store
- `region topread [limit]`: Queries the region with top read traffic
- `region topwrite [limit]`: Queries the region with top write traffic

### Region health

The **Grafana PD/Cluster/Region health** panel shows the metrics about regions in abnormal states.

You can query the list of regions in abnormal states using pd-ctl with region check commands:

- `region check miss-peer`: Queries regions without enough peers
- `region check extra-peer`: Queries regions with extra peers
- `region check down-peer`: Queries regions with down peers
- `region check pending-peer`: Queries regions with pending peers

## Control scheduling strategy

You can use pd-ctl to adjust the scheduling strategy from the following three aspects. Refer to [PD Control](/pd-control.md) for more details.

### Add/delete scheduler manually

PD supports dynamically adding and removing schedulers directly through pd-ctl. For example:

- `scheduler show`: Shows currently running schedulers in the system
- `scheduler remove balance-leader-scheduler`: Removes (disable) balance-leader-scheduler
- `scheduler add evict-leader-scheduler 1`: Adds a scheduler to remove all leaders in Store 1

### Add/delete Operators manually

PD also supports adding or removing operators directly through pd-ctl. For example:

- `operator add add-peer 2 5`: Adds peers to Region 2 in Store 5
- `operator add transfer-leader 2 5`: Migrates the leader of Region 2 to Store 5
- `operator add split-region 2`: Splits Region 2 into two regions evenly in size
- `operator remove 2`: Removes currently pending operator in Region 2

### Adjust scheduling parameter

You can check the scheduling configuration using the `config show` command in pd-ctl, and adjust the values using `config set {key} {value}`. Common adjustments include:

- `leader-schedule-limit`: Controls the concurrency of transferring leader scheduling
- `region-schedule-limit`: Controls the concurrency of adding/deleting peer scheduling
- `enable-replace-offline-replica`: Determines whether to enable the scheduling to take nodes offline
- `enable-location-replacement`: Determines whether to enable the scheduling that handles the isolation level of regions
- `max-snapshot-count`: Controls the maximum concurrency of sending/receiving snapshots for each store

## PD scheduling in common scenarios

This section illustrates the best practices of PD scheduling strategies through several typical scenarios.

### Leaders/regions are not evenly distributed

The rating mechanism of PD determines that leader count and region count of different stores cannot fully reflect the load balancing status. Therefore, it is necessary to confirm whether there is load imbalancing from the actual load of TiKV or storage usage.

Once you have confirmed that leaders/region are not evenly distributed, you need to check the rating of different stores.

If the scores of different stores are close, it means PD mistakenly believes that leaders/regions are evenly distributed. Possible reasons are:

- There are hot regions that cause load imbalancing. In this case, you need to analyze further based on [hot regions scheduling](#hot-regions-are-not-evenly-distributed).
- There are a large number of empty regions or small regions, which leads to a great difference in the number of leaders in different stores and high pressure on Raft store. This is the time for a [region merge](#region-merge-is-slow) scheduling.
- Hardware and software environment varies among stores. To control the distribution of leader/region, you can refer to [Load balancing](#load-balancing) and adjust the values of `leader-weight` and `region-weight`.
- Other unknown reasons. Still you can adjust the values of `leader-weight` and `region-weight` to control the distribution of leader/region.

If there is a big difference in the rating of different stores, you need to examine the operator-related metrics, with special focus on the generation and execution of operators. There are two main situations:

- When operators are generated normally but the scheduling process is slow, it is possible that:

    - The scheduling speed is limited by default for load balancing purpose. You can adjust `leader-schedule-limit` or `region-schedule-limit` to larger values without significantly impacting regular services. In addition, you can also properly ease the restrictions specified by `max-pending-peer-count` and `max-snapshot-count`.
    - Other scheduling tasks are running concurrently, which slows down the balancing. In this case, if the balancing takes precedence over other scheduling tasks, you can stop other tasks or limit their speeds. For example, if you take some nodes offline when balancing is in progress, both operations consume the quota of `region-schedule-limit`. In this case, you can limit the speed of scheduler to remove nodes, or simply set `enable-replace-offline-replica = false` to temporarily disable it.
    - The scheduling process is too slow. You can check the **Operator step duration** metric to confirm the cause. Generally, steps that do not involve sending and receiving snapshots (such as `TransferLeader`, `RemovePeer`, `PromoteLearner`) should be completed in milliseconds, while steps that involve snapshots (such as `AddLearner` and `AddPeer`) are expected to be completed in tens of seconds. If the duration is obviously too long, it could be caused by high pressure on TiKV or bottleneck in network, which needs specific analysis.

- PD fails to generate the corresponding balancing scheduler. Possible reasons include:

    - The scheduler is not activated. For example, the corresponding scheduler is deleted, or its limit it set to "0".
    - Other constraints. For example, `evict-leader-scheduler` in the system prevents leaders from being migrating to the corresponding store. Or label property is set, which makes some stores reject leaders.
    - Restrictions from the cluster topology. For example, in a cluster of 3 replicas across 3 data centers, 3 replicas of each region are distributed in different data centers due to replica isolation. If the number of stores is different among these data centers, the scheduling can only reach a balanced state within each data center, but not balanced globally.

### Taking nodes offline is slow

This scenario requires examining the generation and execution of operators through related metrics.

If operators are successfully generated but the scheduling process is slow, possible reasons are:

- The scheduling speed is limited by default. You can adjust `leader-schedule-limit` or `replica-schedule-limit` to larger values. Similarly, you can consider loosening the limits on `max-pending-peer-count` and `max-snapshot-count`.
- Other scheduling tasks are running concurrently and racing for resources in the system. You can refer to the solution in [Leaders/regions are not evenly distributed](#leadersregions-are-not-evenly-distributed).
- When you take a single node offline, a number of region leaders to be processed (around 1/3 under the configuration of 3 replicas) are distributed on the node to remove. Therefore, the speed is limited by the speed at which snapshots are generated by this single node. You can speed it up by manually adding an `evict-leader-scheduler` to migrate leaders.

If the corresponding operator fails to generate, possible reasons are:

- The operator is stopped, or `replica-schedule-limit` is set to "0".
- There is no proper node for region migration. For example, if the available capacity size of the replacing node (of the same label) is less than 20%, PD will stop scheduling to avoid running out of storage on that node. In such case, you need to add more nodes or delete some data to free the space.

### Bringing nodes online is slow

Currently, bringing nodes online is scheduled through the balance region mechanism. You can refer to [Leaders/regions are not evenly distributed](#leadersregions-are-not-evenly-distributed) for troubleshooting.

### Hot regions are not evenly distributed

Hot regions scheduling issues generally fall into the following categories:

- Hot regions can be observed via PD metrics, but the scheduling speed cannot keep up to redistribute hot regions in time.

    **Solution**: adjust `hot-region-schedule-limit` to a larger value, and reduce the limit quota of other schedulers to speed up hot regions scheduling. Or you can adjust `hot-region-cache-hits-threshold` to a smaller value to make PD more sensitive to traffic changes.

- Hotspot formed on a single region. For example, a small table is intensively scanned by a massive amount of requests. This can also be detected from PD metrics. Because you cannot actually distribute a single hotspot, you need to manually add a `split-region` operator to split such a region.

- The load of some nodes is significantly higher than that of other nodes from TiKV-related metrics, which becomes the bottleneck of the whole system. Currently, PD counts hotspots through traffic analysis only, so it is possible that PD fails to identify hotspots in certain scenarios. For example, when there are intensive point lookup requests for some regions, it might not be obvious to detect in traffic, but still the high QPS might lead to bottlenecks in key modules.

    **Solutions**: Firstly, locate the table where hot regions are formed based on the specific business. Then add a `scatter-range-scheduler` scheduler to make all regions of this table evenly distributed. TiDB also provides an interface in its HTTP API to simplify this operation. Refer to [TiDB HTTP API](https://github.com/pingcap/tidb/blob/master/docs/tidb_http_api.md) for more details.

### Region merge is slow

Similar to slow scheduling, the speed of region merge is most likely limited by the configurations of `merge-schedule-limit` and `region-schedule-limit`, or the region merge scheduler is competing with other schedulers. Specifically, the solutions are:

- If it is known from metrics that there are a large number of empty regions in the system, you can adjust `max-merge-region-size` and `max-merge-region-keys` to smaller values to speed up the merge. This is because the merge process involves replica migration, so the smaller the region to be merged, the faster the merge is. If the merge operators are already generated rapidly, to further speed up the process, you can set `patrol-region-interval` to `10ms` (the default value of this configuration item is `10ms` in v5.3.0 and later versions of TiDB). This makes region scanning faster at the cost of more CPU consumption.

- A lot of tables have been created and then emptied (including truncated tables). These empty Regions cannot be merged if the split table attribute is enabled. You can disable this attribute by adjusting the following parameters:

    - TiKV: Set `split-region-on-table` to `false`. You cannot modify the parameter dynamically.
    - PD: Use PD Control to set the parameters required by your cluster situation.

        - Suppose that your cluster has no TiDB instance, and the value of [`key-type`](/pd-control.md#config-show--set-option-value--placement-rules) is set to `raw` or `txn`. In this case, PD can merge Regions across tables, regardless of the value of `enable-cross-table-merge setting`. You can modify the `key-type` parameter dynamically.

        
        ```bash
        config set key-type txn
        ```

        - Suppose that your cluster has a TiDB instance, and the value of `key-type` is set to `table`. In this case, PD can merge Regions across tables only if the value of `enable-cross-table-merge` is set to `true`. You can modify the `key-type` parameter dynamically.

        
        ```bash
        config set enable-cross-table-merge true
        ```

        If the modification does not take effect, refer to [FAQ - Why the modified `toml` configuration for TiKV/PD does not take effect?](/faq/deploy-and-maintain-faq.md#why-the-modified-toml-configuration-for-tikvpd-does-not-take-effect).

        > **Note:**
        >
        > After enabling Placement Rules, properly switch the value of `key-type` to avoid the failure of decoding.

For v3.0.4 and v2.1.16 or earlier, the `approximate_keys` of regions are inaccurate in specific circumstances (most of which occur after dropping tables), which makes the number of keys break the constraints of `max-merge-region-keys`. To avoid this problem, you can adjust `max-merge-region-keys` to a larger value.

### Troubleshoot TiKV node

If a TiKV node fails, PD defaults to setting the corresponding node to the **down** state after 30 minutes (customizable by configuration item `max-store-down-time`), and rebalancing replicas for regions involved.

Practically, if a node failure is considered unrecoverable, you can immediately take it offline. This makes PD replenish replicas soon in another node and reduces the risk of data loss. In contrast, if a node is considered recoverable, but the recovery cannot be done in 30 minutes, you can temporarily adjust `max-store-down-time` to a larger value to avoid unnecessary replenishment of the replicas and resources waste after the timeout.

In TiDB v5.2.0, TiKV introduces the mechanism of slow TiKV node detection. By sampling the requests in TiKV, this mechanism works out a score ranging from 1 to 100. A TiKV node with a score higher than or equal to 80 is marked as slow. You can add [`evict-slow-store-scheduler`](/pd-control.md#scheduler-show--add--remove--pause--resume--config--describe) to detect and schedule slow nodes. If only one TiKV is detected as slow, and the slow score reaches the limit (80 by default), the Leader in this node will be evicted (similar to the effect of `evict-leader-scheduler`).

> **Note:**
>
> **Leader eviction** is accomplished by PD sending scheduling requests to TiKV slow nodes and then TiKV executing the received scheduling requests sequentially. Due to factors such as **slow I/O**, slow nodes might experience request accumulation, causing some Leaders to wait until the delayed requests are processed before handling **Leader eviction** requests. This results in an overall extended time for **Leader eviction**. Therefore, when you enable `evict-slow-store-scheduler`, it is recommended to enable [`store-io-pool-size`](/tikv-configuration-file.md#store-io-pool-size-new-in-v530) as well to mitigate this situation.
