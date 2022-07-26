---
title: 基于 EBS 卷快照备份恢复的性能介绍
summary: 了解 EBS 卷快照备份恢复的性能基线。
---

# 基于 EBS 卷快照备份恢复的性能介绍

本文介绍 EBS 备份恢复的性能、性能的影响因素以及性能测试结果。以下性能指标基于 AWS region `us-west-2`。

> **注意：**
>
> 此性能测试结果仅供查考，实际情况会有些差别。

## 备份性能

本节介绍影响备份的性能、影响因素以及性能测试结果。

### 备份耗时

EBS 卷快照备份阶段包含创建备份任务、停止调度、停止 GC、获取备份时间 backupts 以及卷快照。详细信息，参考[基于 EBS 卷快照的备份恢复功能架构](volume-snapshot-backup-restore.md)。其中，耗时最多的阶段是创建卷快照。备份过程中卷的快照并行创建，一个备份完成时间取决于用时最长卷的快照创建完成时间。

### 备份耗时占比

| 备份阶段     | 备份耗时    | 备份总占比 | 备注                                     |
| :--------: | :---------: | :------: | :-------------------------------------: |
| 创建卷快照   | 16 m (50 GB) | 99%      | AWS EBS 卷快照创建完成的时间               |
| 其他        | 1s          | 1%       | 包含停止调度、停止 GC 及获取备份时间 backupts 的时间 |

### 备份性能数据

卷备份过程是完全并发进行的，因此整个备份的时间取决于耗时最久数据卷快照创建时间，与集群规模无关。该环节由 AWS EBS 服务来完成，当前 AWS 没有提供卷快照完成量化指标。根据测试，在 TiDB-Operator 推荐机型配置下，使用存储卷类型 GP3，配置 400 MiB/s 与 7000 IOPS，整个备份过程耗时大致如下：

![EBS Snapshot backup perf](https://download.pingcap.com/images/tidb-in-kubernetes/volume-snapshot-backup-perf.png)

| 卷数据    | 卷总容量 | 卷配置             | 大概备份时间 |
| :------: | :-----: | :---------------: | :--------: |
| 50 GB    | 500 GB  | 7000IOPS/400 MiB/s | 20 min    |
| 100 GB   | 500 GB  | 7000IOPS/400 MiB/s | 50 min    |
| 200 GB   | 500 GB  | 7000IOPS/400 MiB/s | 100 min   |
| 500 GB   | 1024 GB | 7000IOPS/400 MiB/s | 150 min   |
| 1024 GB  | 3500 GB | 7000IOPS/400 MiB/s | 350 min   |

> **注意：**
>
> 上述性能数据是全量数据备份，即第一次备份。
>
> 因为 AWS 卷快照是以卷为单位，除第一个卷快照是全量，后续卷快照都是以增量的形式进行。每日备份一般情况下可以在 1 小时完成，如遇特殊情况，可缩短备份频率，如 12 小时或者 8 小时备份一次。

### 备份影响

使用 GP3 卷进行备份时，经过测试集群影响小于 3%。如下图所示，10:25 分之后发起备份。

![EBS Snapshot backup impact](https://download.pingcap.com/images/tidb-in-kubernetes/volume-snapshot-backup-impact.jpg)

## 恢复性能

本节介绍恢复的性能、影响因素以及性能测试结果。恢复性能是可扩展的，整体恢复时间取决于恢复最慢的 TiKV 节点，与集群规模没有特别大的关系。

### 恢复耗时

EBS 卷快照恢复阶段包含以下阶段，详细信息，参考[基于 EBS 卷快照的备份恢复功能架构](volume-snapshot-backup-restore.md)。

1. 创建集群

    TiDB Operator 创建 recoveryMode 的待恢复集群，启动所有 PD 节点。

2. 卷恢复

    TiDB Operator 创建 BR 卷恢复子任务，BR 从卷快照中恢复出 TiKV 启动需要的数据卷。

3. 启动 TiKV

    TiDB Operator 挂载 TiKV 卷，启动 TiKV。

4. 数据恢复

    TiDB Operator 创建 TiKV 卷数据恢复子任务，BR 把所有 TiKV 数据卷恢复到一致性状态。

5. 启动 TiDB

    启动 TiDB，恢复完成。

### 恢复耗时占比

| 恢复阶段     | 恢复大致耗时 | 恢复总占比 | 备注                                                                            |
| :--------: | :---------: | :------: | :----------------------------------------------------------------------------: |
| 创建集群     | 30s         | 1%      | 包含下载 docker image 和启动 PD 的时间                                                 |
| 卷恢复      | 20s         | 1%     | 包含启动 BR pod 和卷恢复的时间                                                         |
| 启动 TiKV   | 2～30 min    | 58%      | TiKV 启动时长受卷性能影响，一般 3 分钟左右，当恢复数据包含事务时，此阶段耗时可能达到 30 分钟 |
| 数据恢复阶段 | 2～20 min    | 38%       | 包含恢复 raft 共识层数据以及删除 MVCC 数据的时间                                      |
| 启动 TiDB   | 1 min        | 2%       | 包含下载 docker image 和启动 TiDB 的时间                                           |

> **注意：**
>
> 因为卷快照具有崩溃一致性 (Crash Consistency) 的特点，EBS 卷快照恢复阶段 TiKV 启动阶段，需要数据自检和自动修复。经测试，该阶段耗时在 30 分钟以内，如使用高性能盘恢复，如提升 IOPS 和带宽, 额外耗时可缩短到 5 分钟内。使用高性能盘恢复请参考[恢复时间太长（大于 2 小时）](backup-restore-faq.md#恢复时间太长大于-2-小时)。

### 恢复性能数据

卷快照恢复时间取主要决于 TiKV 启动和数据恢复阶段，TiKV 启动受 EBS 卷快照恢复延迟初始化影响，当前 AWS 并没有提供恢复卷延迟初始完成量化指标。根据测试，在 TiDB Operator 推荐 EC2 机型配置下使用 GP3 如下配置，整个恢复时间大致如下：

![EBS Snapshot restore perf](https://download.pingcap.com/images/tidb-in-kubernetes/volume-snapshot-restore-perf.png)

| 卷数据  | 卷总容量   | 卷配置             | 恢复大致耗时 |
| :------: | :-----: | :---------------: | :--------: |
| 50 GB    | 500 GB  | 7000IOPS/400 MiB/s | 16 min    |
| 100 GB   | 500 GB  | 7000IOPS/400 MiB/s | 18 min    |
| 200 GB   | 500 GB  | 7000IOPS/400 MiB/s | 21 min   |
| 500 GB   | 1024 GB | 7000IOPS/400 MiB/s | 25 min   |
| 1024 GB  | 3500 GB | 7000IOPS/400 MiB/s | 34 min   |
