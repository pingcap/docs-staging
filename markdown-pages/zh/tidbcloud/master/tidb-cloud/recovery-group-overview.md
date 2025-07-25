---
title: 恢复组概述（Beta）
summary: 了解如何使用 TiDB Cloud 恢复组保护数据库免受灾难影响。
---

# 恢复组概述（Beta）

TiDB Cloud 恢复组允许你在 TiDB Cloud Dedicated 集群之间复制数据库，以防止区域性灾难。你可以编排数据库从一个集群到另一个集群的故障转移。在故障转移到备用集群后，如果原主集群恢复可用，你可以重新建立反向复制以重新保护你的数据库。

## 架构

恢复组由一组可以在两个 TiDB Cloud Dedicated 集群之间进行故障转移的复制数据库组成。每个恢复组都分配有一个主集群，该主集群上的数据库与该组关联，然后复制到备用集群。

![恢复组](https://docs-download.pingcap.com/media/images/docs/tidb-cloud/recovery-group/recovery-group-overview.png)

- 恢复组：在两个集群之间复制的一组数据库
- 主集群：应用程序主动写入数据库的集群
- 备用集群：存放数据库副本的集群

> **注意**
>
> 恢复组功能不会显式强制将客户端连接到副本数据库设置为只读。确保连接到副本数据库的应用程序只执行只读查询是应用程序的责任。

## 主要特性和限制

- 目前，只有在 AWS 上托管的 TiDB Cloud Dedicated 集群支持恢复组。
- 恢复组在两个集群之间建立。
- 恢复组不支持数据库的双向复制。

> **警告**
>
> 此功能处于 beta 阶段，不建议在生产环境中使用。

## 下一步

- 要开始使用恢复组，请参见[创建数据库恢复组](/tidb-cloud/recovery-group-get-started.md)。
- 要了解如何使用恢复组，请参见[数据库故障转移和重新保护](/tidb-cloud/recovery-group-failover.md)。
