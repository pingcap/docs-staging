---
title: TiDB Binlog 版本升级方法
summary: TiDB Binlog 版本升级方法介绍了手动部署的步骤，包括升级 Pump 和 Drainer。同时，还介绍了从 Kafka/Local 版本升级到 Cluster 版本的流程，以及如何确认数据同步完成后启动新版本的 Drainer。从 v8.3.0 开始，TiDB Binlog 被完全废弃。
aliases: ['/zh/tidb/dev/upgrade-tidb-binlog/','/zh/tidb/stable/upgrade-tidb-binlog/','/docs-cn/dev/tidb-binlog/upgrade-tidb-binlog/','/docs-cn/dev/reference/tidb-binlog/upgrade/','/docs-cn/dev/how-to/upgrade/tidb-binlog/','/docs-cn/dev/reference/tools/tidb-binlog/upgrade/']
---

# TiDB Binlog 版本升级方法

如未特别指明，文中出现的 TiDB Binlog 均指最新的 [Cluster](/tidb-binlog/tidb-binlog-overview.md) 版本。

> **警告：**
>
> - 从 v7.5.0 开始，[TiDB Binlog](/tidb-binlog/tidb-binlog-overview.md) 的数据同步功能被废弃。从 v8.3.0 开始，TiDB Binlog 被完全废弃，并计划在未来版本中移除。如需进行增量数据同步，请使用 [TiCDC](/ticdc/ticdc-overview.md)。如需按时间点恢复 (point-in-time recovery, PITR)，请使用 [PITR](/br/br-pitr-guide.md)。
> - TiDB Binlog 与 TiDB v5.0 开始引入的一些特性不兼容，无法一起使用，详情参照[注意事项](/tidb-binlog/tidb-binlog-overview.md#注意事项)。

本文介绍通过手动部署的 TiDB Binlog 的版本升级方法，另外有一小节介绍如何从更早的不兼容版本（Kafka/Local 版本）升级到最新版本。

## 手动部署

### 升级 Pump

对集群里的每个 Pump 逐一升级，确保集群中总有 Pump 可以接收 TiDB 发来的 Binlog。

1. 用新版本的 `pump` 替换原来的文件
2. 重启 Pump 进程

### 升级 Drainer

1. 用新版本的 `drainer` 替换原来的文件
2. 重启 Drainer 进程

## 从 Kafka/Local 版本升级到 Cluster 版本

新版本的 TiDB（v2.0.8-binlog、v2.1.0-rc.5 及以上版本）不兼容 [Kafka 版本](https://docs.pingcap.com/zh/tidb/v2.1/tidb-binlog-kafka-deployment/)以及 [Local 版本](https://docs.pingcap.com/zh/tidb/v2.1/tidb-binlog-local-deployment/)的 TiDB Binlog，集群升级到新版本后只能使用 Cluster 版本的 TiDB Binlog。如果在升级前已经使用了 Kafka／Local 版本的 TiDB Binlog，必须将其升级到 Cluster 版本。

TiDB Binlog 版本与 TiDB 版本的对应关系如下：

| TiDB Binlog 版本 | TiDB 版本 | 说明 |
|---|---|---|
| Local | TiDB 1.0 及更低版本 ||
| Kafka | TiDB 1.0 ~ TiDB 2.1 RC5 | TiDB 1.0 支持 local 版本和 Kafka 版本的 TiDB Binlog。 |
| Cluster | TiDB v2.0.8-binlog，TiDB 2.1 RC5 及更高版本 | TiDB v2.0.8-binlog 是一个支持 Cluster 版本 TiDB Binlog 的 2.0 特殊版本。 |

### 升级流程

> **注意：**
>
> 如果能接受重新导全量数据，则可以直接废弃老版本，按 [TiDB Binlog 集群部署](/tidb-binlog/deploy-tidb-binlog.md)中的步骤重新部署。

如果想从原来的 checkpoint 继续同步，使用以下升级流程：

1. 部署新版本 Pump。
2. 暂停 TiDB 集群业务。
3. 更新 TiDB 以及配置，写 Binlog 到新的 Pump Cluster。
4. TiDB 集群重新接入业务。
5. 确认老版本的 Drainer 已经将老版本的 Pump 的数据完全同步到下游。

    查询 Drainer 的 `status` 接口，示例命令如下：

    
    ```bash
    curl 'http://172.16.10.49:8249/status'
    ```

    ```
    {"PumpPos":{"172.16.10.49:8250":{"offset":32686}},"Synced": true ,"DepositWindow":{"Upper":398907800202772481,"Lower":398907799455662081}}
    ```

    如果返回的 `Synced` 为 true，则可以认为 Binlog 数据已经全部同步到了下游。

6. 启动新版本 Drainer；
7. 下线老版本的 Pump、Drainer 以及依赖的 Kafka 和 ZooKeeper。
