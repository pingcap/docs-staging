---
title: BR 备份与恢复场景示例
---

# BR 备份与恢复场景示例

[Backup & Restore (BR)](/br/backup-and-restore-overview.md) 是一款分布式的快速备份和恢复工具。

本文介绍 BR 常用的几种备份和恢复场景：

* [将单表数据备份到网络盘（推荐生产环境使用）](#将单表数据备份到网络盘推荐生产环境使用)
* [从网络盘恢复备份数据（推荐生产环境使用）](#从网络盘恢复备份数据推荐生产环境使用)
* [将单表数据备份到本地磁盘](#将单表数据备份到本地磁盘推荐测试环境试用)
* [从本地磁盘恢复备份数据](#从本地磁盘恢复备份数据推荐测试环境试用)

阅读本文，你将能：

* 正确使用网络盘或本地盘进行备份或恢复
* 通过相关监控指标了解备份或恢复的状态
* 了解在备份或恢复时如何调优性能
* 处理备份时可能发生的异常

## 目标读者

你需要对 TiDB 和 TiKV 有一定的了解。

在阅读本文前，请确保你已通读 [BR 简介](/br/backup-and-restore-overview.md)，尤其是[使用限制](/br/backup-and-restore-overview.md#使用限制)和[使用建议](/br/backup-and-restore-overview.md#使用建议)这两节。

## 环境准备

本节介绍 TiDB 的推荐部署方式、BR 使用示例中的集群版本、TiKV 集群硬件信息和集群配置。

你可以根据自己的硬件和配置来预估备份恢复的性能。推荐使用网络盘来进行备份和恢复操作，这样可以省去收集备份数据文件的繁琐步骤。尤其在 TiKV 集群规模较大的情况下，使用网络盘可以大幅提升操作效率。

### 部署方式

推荐使用 [TiUP](/tiup/tiup-cluster.md) 部署 TiDB 集群，然后通过 TiUP 安装 BR。

### 集群版本

* TiDB：v6.1.7
* TiKV：v6.1.7
* PD：v6.1.7
* BR：v6.1.7

> **注意：**
>
> 推荐使用[最新版本 TiDB/TiKV/PD/BR](/releases/release-notes.md)，同时需要确保 BR 版本和 TiDB 版本**相同**。

### TiKV 集群硬件信息

* 操作系统：CentOS Linux release 7.6.1810 (Core)
* CPU：16-Core Common KVM processor
* RAM：32GB
* 硬盘：500G SSD * 2
* 网卡：万兆网卡

### 配置

BR 可以直接将命令下发到 TiKV 集群来执行备份和恢复，不依赖 TiDB server 组件，因此无需对 TiDB server 进行配置。

* TiKV：默认配置
* PD：默认配置

### 其他

除了以上准备工作，执行备份和恢复命令前，还应做如下检查。

#### 备份前的准备工作

BR 工具已支持自适应 GC，会自动将 `backupTS`（默认是最新的 PD timestamp）注册到 PD 的 `safePoint`，保证 TiDB 的 GC Safe Point 在备份期间不会向前移动，即可避免手动设置 GC。

运行 [`br backup`](/br/use-br-command-line-tool.md#br-命令行描述) 命令进行备份前，请确保用于创建备份的存储设备有足够的空间（具有备份集群的 1/3 的磁盘空间即可）。

#### 恢复前的准备工作

运行 [`br restore` 命令](/br/use-br-command-line-tool.md#br-命令行描述)进行恢复前，需要检查新集群，确保集群内没有同名的表。

## 将单表数据备份到网络盘（推荐生产环境使用）

执行 `br backup` 命令，将单表数据 `--db batchmark --table order_line` 备份到指定的网络盘路径 `local:///br_data` 下。

### 前置要求

* [备份前的准备工作](#备份前的准备工作)。
* 配置一台高性能 SSD 硬盘主机为 NFS server 存储数据。其他所有 BR 节点、TiKV 节点和 TiFlash 节点为 NFS client，挂载相同的路径（例如 `/br_data`）到 NFS server 上以访问 NFS server。
* NFS server 和 NFS client 间的数据传输速率至少要达到备份集群的 `TiKV 实例数 * 150MB/s`。否则，网络 I/O 有可能成为性能瓶颈。

> **注意：**
>
> * 因为备份时候只备份单副本 (leader) 数据，所以即使集群中存在 TiFlash 副本，无需挂载 TiFlash 节点 BR 也能完成备份。
> * BR 在恢复数据时，会恢复全部副本的数据。因此在恢复时，TiFlash 节点需要有备份数据的访问权限 BR 才能完成恢复，此时也必须将 TiFlash 节点挂载到 NFS server 上。

### 部署拓扑

部署拓扑如下图所示：

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/backup-nfs-deploy.png)

### 运行备份

运行 BR 备份命令：


```shell
bin/br backup table \
    --db batchmark \
    --table order_line \
    -s local:///br_data \
    --pd ${PD_ADDR}:2379 \
    --log-file backup-nfs.log
```

### 备份过程中的运行指标

在 BR 备份过程中，需关注以下监控面版中的运行指标来了解备份的状态。

**Backup CPU Utilization**：参与备份的 TiKV 节点（例如 backup-worker 和 backup-endpoint）的 CPU 使用率。

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/backup-cpu.png)

**IO Utilization**：参与备份的 TiKV 节点的 I/O 使用率。

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/backup-io.png)

**BackupSST Generation Throughput**：参与备份的 TiKV 节点生成 backupSST 文件的吞吐。正常时单个 TiKV 节点的吞吐在 150 MB/s 左右。

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/backup-throughput.png)

**One Backup Range Duration**：备份一个 range 的操作耗时，包括扫描耗时 (scan KV) 和保存耗时（保存为 backupSST 文件）。

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/backup-range-duration.png)

**One Backup Subtask Duration**：一次备份任务会被拆分成多个子任务。该监控项显示子任务的耗时。

> **注意：**
>
> * 虽然本次任务是备份单表，但因为表中有 3 个索引，所以正常会拆分成 4 个子任务。
> * 下图中有 20 个点，蓝色和黄色各 10 个，代表 10 个子任务。备份过程中可能发生 Region 调度行为，少量重试是正常的。

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/backup-subtask-duration.png)

**Backup Errors**：备份过程中的错误。正常时无错误。即使出现少量错误，备份操作也有重试机制，可能会导致备份时间增加，但不会影响备份的正确性。

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/backup-errors.png)

**Checksum Request Duration**：对备份集群执行 admin checksum 的耗时统计。

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/checksum-duration.png)

### 结果解读

BR 会在备份结束时输出备份总结到控制台。

同时在之前设置的日志存放路径，可以获取此次备份的相关统计信息。在日志中搜关键字 "summary"，可以看到以下信息：

```
["Full backup Success summary:
    total backup ranges: 2,
    total success: 2,
    total failed: 0,
    total take(Full backup time): 31.802912166s,
    total take(real time): 49.799662427s,
    total size(MB): 5997.49,
    avg speed(MB/s): 188.58,
    total kv: 120000000"]
    ["backup checksum"=17.907153678s]
    ["backup fast checksum"=349.333µs]
    ["backup total regions"=43]
    [BackupTS=422618409346269185]
    [Size=826765915]
```

以上日志信息中包含以下内容：

* `total take(Full backup time)`：备份耗时
* `total take(real time)`：程序运行总耗时
* `total size(MB)`：备份数据大小
* `avg speed(MB/s)`：备份吞吐
* `total kv`：备份 KV 对数
* `backup checksum`：校验耗时
* `backup fast checksum`：计算各表 checksum、KV 和 bytes 信息总和的耗时
* `backup total regions`：备份 Region 总数
* `BackupTS`：备份存档的快照时间戳
* `Size`：备份存档经压缩后在磁盘中的实际大小

通过以上数据可以计算得到单个 TiKV 实例的吞吐为：`avg speed(MB/s)`/`tikv_count` = `62.86`。

### 性能调优

如果 TiKV 的资源使用没有出现明显的瓶颈（例如[备份过程中的运行指标](#备份过程中的运行指标)中的 **Backup CPU Utilization** 最高为 `1500%` 左右，**IO Utilization** 普遍低于 `30%`），可以尝试调大 `--concurrency`（默认是 4）参数以进行性能调优。

示例如下：


```shell
bin/br backup table \
    --db batchmark \
    --table order_line \
    -s local:///br_data/ \
    --pd ${PD_ADDR}:2379 \
    --log-file backup-nfs.log \
    --concurrency 16
```

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/backup-diff.png)

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/backup-diff2.png)

性能调优后的结果如下（保持数据大小不变）：

* 备份耗时 (`total take(s)`)：从 `986.43` 减少到 `535.53`
* 数据大小 (`total size(MB)`)：353227.18
* 备份吞吐 (`avg speed(MB/s)`)：从 `358.09` 提升到 `659.59`
* 单个 TiKV 实例的吞吐 (`avg speed(MB/s)/tikv_count`)：从 `89` 提升到 `164.89`

## 从网络盘恢复备份数据（推荐生产环境使用）

使用 `br restore` 命令，将一份完整的备份数据恢复到一个离线集群。暂不支持恢复到在线集群。

### 前置要求

[恢复前的准备工作](#恢复前的准备工作)

### 部署拓扑

部署拓扑如下图所示：

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/restore-nfs-deploy.png)

### 运行恢复

运行 `br restore` 命令：


```shell
bin/br restore table --db batchmark --table order_line -s local:///br_data --pd 172.16.5.198:2379 --log-file restore-nfs.log
```

### 恢复过程中的运行指标

在 BR 恢复过程中，需关注以下监控面版中的运行指标来了解恢复的状态。

**CPU**：参与恢复的 TiKV 节点 CPU 使用率。

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/restore-cpu.png)

**IO Utilization**：参与恢复的 TiKV 节点的 I/O 使用率。

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/restore-io.png)

**Region** 分布：Region 分布越均匀，说明恢复资源利用越充分。

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/restore-region.png)

**Process SST Duration**：处理 SST 文件的延迟。恢复一张表时，如果 `tableID` 发生了变化，需要对 `tableID` 进行 `rewrite`，否则会进行 `rename`。通常 `rewrite` 延迟要高于 `rename` 的延迟。

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/restore-process-sst.png)

**DownLoad SST Throughput**：从 External Storage 下载 SST 文件的吞吐。

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/restore-download-sst.png)

**Restore Errors**：恢复过程中的错误。

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/restore-errors.png)

**Checksum Request Duration**：对恢复集群执行 admin checksum 的耗时统计，会比备份时的 checksum 延迟高。

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/restore-checksum.png)

### 结果解读

在之前设置的日志存放路径，可以获取此次恢复相关的统计信息。在日志中搜关键字 "summary"，可以看到以下信息：

```
["Table Restore summary:
    total restore tables: 1,
    total success: 1,
    total failed: 0,
    total take(Full restore time): 17m1.001611365s,
    total take(real time): 16m1.371611365s,
    total kv: 5659888624,
    total size(MB): 353227.18,
    avg speed(MB/s): 367.42"]
    ["restore files"=9263]
    ["restore ranges"=6888]
    ["split region"=49.049182743s]
    ["restore checksum"=6m34.879439498s]
    [Size=48693068713]
```

以上日志信息中包含以下内容：

* `total take(Full restore time)`：恢复耗时
* `total take(real time)`：程序运行总耗时
* `total size(MB)`：恢复数据大小
* `total kv`：恢复 KV 对数
* `avg speed(MB/s)`：恢复吞吐
* `split region`：Region split 耗时
* `restore checksum`：校验耗时
* `Size`：恢复存档在磁盘中的实际大小

根据上表数据可以计算得到：

* 单个 TiKV 吞吐：`avg speed(MB/s)`/`tikv_count` = `91.8`
* 单个 TiKV 平均恢复速度：`total size(MB)`/(`split time` + `restore time`)/`tikv_count` = `87.4`

### 性能调优

如果 TiKV 资源使用没有明显的瓶颈，可以尝试调大 `--concurrency` 参数（默认为 `128`）进行性能调优，示例如下：


```shell
bin/br restore table --db batchmark --table order_line -s local:///br_data/ --pd 172.16.5.198:2379 --log-file restore-concurrency.log --concurrency 1024
```

性能调优后的结果如下（保持数据大小不变）：

* 恢复耗时（`total take(s)`）：从 `961.37` 减少到 `443.49`
* 恢复吞吐（`avg speed(MB/s)`）：从 `367.42` 提升到 `796.47`
* 单个 TiKV 实例的吞吐（`avg speed(MB/s)`/`tikv_count`）：从 `91.8` 提升到 `199.1`
* 单个 TiKV 实例的平均恢复速度（`total size(MB)`/(`split time` + `restore time`)/`tikv_count`）：从 `87.4` 提升到 `162.3`

## 将单表数据备份到本地磁盘（推荐测试环境试用）

使用 `br backup 命令`，将单表数据 `--db batchmark --table order_line` 备份到指定的本地磁盘路径 `local:///home/tidb/backup_local` 下。

### 前置要求

* [备份前的准备工作](#备份前的准备工作)。
* 各个 TiKV 节点有单独的磁盘用来存放 backupSST 数据。
* `backup_endpoint` 节点有单独的磁盘用来存放备份的 `backupmeta` 文件。
* TiKV 和 `backup_endpoint` 节点需要有相同的备份目录，例如 `/home/tidb/backup_local`。

### 部署拓扑

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/backup-local-deploy.png)

### 运行备份

运行 `br backup` 命令：


```shell
bin/br backup table \
    --db batchmark \
    --table order_line \
    -s local:///home/tidb/backup_local/ \
    --pd ${PD_ADDR}:2379 \
    --log-file backup_local.log
```

运行备份时，参考[备份过程中的运行指标](#备份过程中的运行指标)对相关指标进行监控，以了解备份状态。

### 结果解读

在之前设置的日志存放路径，可以获取此次备份相关的统计信息。在日志中搜关键字 "summary"，可以看到以下信息：

```
["Table backup summary:
    total backup ranges: 4,
    total success: 4,
    total failed: 0,
    total take(s): 551.31,
    total kv: 5659888624,
    total size(MB): 353227.18,
    avg speed(MB/s): 640.71"]
    ["backup total regions"=6795]
    ["backup checksum"=6m33.962719217s]
    ["backup fast checksum"=22.995552ms]
```

以上日志信息中包含以下内容：

* `total take(s)`：备份耗时
* `total size(MB)`：数据大小
* `avg speed(MB/s)`：备份吞吐
* `backup checksum`：校验耗时

根据上表数据可以计算得到单个 TiKV 实例的吞吐：`avg speed(MB/s)`/`tikv_count` = `160`。

## 从本地磁盘恢复备份数据（推荐测试环境试用）

使用 `br restore` 命令，将一份完整的备份数据恢复到一个离线集群。暂不支持恢复到在线集群。

### 前置要求

* [恢复前的准备工作](#恢复前的准备工作)。
* 集群中没有与备份数据相同的库表。目前 BR 不支持 table route。
* 集群中各个 TiKV 节点有单独的磁盘用来存放要恢复的 backupSST 数据。
* `restore_endpoint` 节点有单独的磁盘用来存放要恢复的 `backupmeta` 文件。
* 集群中 TiKV 和 `restore_endpoint` 节点需要有相同的备份目录，例如 `/home/tidb/backup_local/`。

如果备份数据存放在本地磁盘，那么需要执行以下的步骤：

1. 汇总所有 backupSST 文件到一个统一的目录下。
2. 将汇总后的 backupSST 文件到复制到集群的所有 TiKV 节点下。
3. 将 `backupmeta` 文件复制到到 `restore endpoint` 节点下。

### 部署拓扑

![img](https://docs-download.pingcap.com/media/images/docs-cn/br/restore-local-deploy.png)

### 运行恢复

运行 `br restore` 命令：


```shell
bin/br restore table --db batchmark --table order_line -s local:///home/tidb/backup_local/ --pd 172.16.5.198:2379 --log-file restore_local.log
```

运行恢复时，参考[恢复过程中的运行指标](#恢复过程中的运行指标)对相关指标进行监控，以了解恢复状态。

### 结果解读

在之前设置的日志存放路径，可以获取此次恢复相关的统计信息。在日志中搜关键字 "summary"，可以看到以下信息：

```
["Table Restore summary:
    total restore tables: 1,
    total success: 1,
    total failed: 0,
    total take(s): 908.42,
    total kv: 5659888624,
    total size(MB): 353227.18,
    avg speed(MB/s): 388.84"]
    ["restore files"=9263]
    ["restore ranges"=6888]
    ["split region"=58.7885518s]
    ["restore checksum"=6m19.349067937s]
```

以上日志信息中包含以下内容：

* `total take(s)`：恢复耗时
* `total size(MB)`：数据大小
* `avg speed(MB/s)`：恢复吞吐
* `split region`：Region split 耗时
* `restore checksum`：校验耗时

根据上表数据可以计算得到：

* 单个 TiKV 实例的吞吐：`avg speed(MB/s)`/`tikv_count` = `97.2`
* 单个 TiKV 实例的平均恢复速度：`total size(MB)`/(`split time` + `restore time`)/`tikv_count` = `92.4`

## 备份过程中的异常处理

本节介绍如何处理备份过程中出现的常见错误。

### 备份日志中出现 `key locked Error`

日志中的错误消息：`log - ["backup occur kv error"][error="{\"KvError\":{\"locked\":`

如果在备份过程中遇到 key 被锁住，目前 BR 会尝试清锁。少量报错不会影响备份的正确性。

### 备份失败

日志中的错误消息：`log - Error: msg:"Io(Custom { kind: AlreadyExists, error: \"[5_5359_42_123_default.sst] is already exists in /dir/backup_local/\" })"`

若备份失败并出现以上错误消息，采取以下其中一种操作后再重新备份：

* 更换备份数据目录。例如将 `/dir/backup-2020-01-01/` 改为 `/dir/backup_local/`。
* 删除所有 TiKV 和 BR 节点的备份目录。
