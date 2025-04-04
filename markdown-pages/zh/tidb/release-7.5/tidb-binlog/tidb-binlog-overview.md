---
title: TiDB Binlog 简介
summary: TiDB Binlog 是用于收集 TiDB 的 binlog 并提供实时备份和同步功能的商业工具。它支持数据同步和实时备份恢复功能。从 TiDB v7.5.0 开始，数据同步功能不再提供技术支持，建议使用 TiCDC 作为替代方案。TiDB Binlog 集群主要包括 Pump 和 Drainer 两个组件，以及 binlogctl 工具。Pump 用于记录并排序 Binlog，Drainer 用于归并排序并将 Binlog 同步到下游。TiDB Binlog 还有一些注意事项，包括与 TiDB v5.0 版本引入的一些特性不兼容，以及 Drainer 支持将 Binlog 同步到 MySQL、TiDB、Kafka 或本地文件。
---

# TiDB Binlog 简介

TiDB Binlog 是一个用于收集 TiDB 的 binlog，并提供准实时备份和同步功能的商业工具。

TiDB Binlog 支持以下功能场景：

- **数据同步**：同步 TiDB 集群数据到其他数据库。
- **实时备份和恢复**：备份 TiDB 集群数据，同时可以用于 TiDB 集群故障时恢复。

> **注意：**
>
> - TiDB Binlog 与 TiDB v5.0 开始引入的一些特性不兼容，无法一起使用，详情参照[注意事项](#注意事项)。
> - 从 TiDB v7.5.0 开始，TiDB Binlog 组件的数据同步功能不再提供技术支持，强烈建议使用 [TiCDC](/ticdc/ticdc-overview.md) 作为数据同步的替代方案。
> - 尽管 TiDB v7.5.0 仍支持 TiDB Binlog 组件的实时备份和恢复，但该组件在未来版本中将被完全废弃，推荐使用 [PITR](/br/br-pitr-guide.md) 作为数据恢复的替代方案。

要快速了解 Binlog 的基本原理和使用方法，建议先观看下面的培训视频（时长 32 分钟）。注意本视频只为学习参考，具体操作步骤和最新功能，请以文档内容为准。

<video src="https://docs-download.pingcap.com/media/videos/docs-cn%2FLesson21_binlog.mp4" width="100%" height="100%" controls="controls" poster="https://docs-download.pingcap.com/media/videos/docs-cn/poster_lesson21.png"></video>

## TiDB Binlog 整体架构

![TiDB Binlog 架构](https://docs-download.pingcap.com/media/images/docs-cn/tidb-binlog-cluster-architecture.png)

TiDB Binlog 集群主要分为 Pump 和 Drainer 两个组件，以及 binlogctl 工具：

### Pump

[Pump](https://github.com/pingcap/tidb-binlog/blob/release-7.5/pump) 用于实时记录 TiDB 产生的 Binlog，并将 Binlog 按照事务的提交时间进行排序，再提供给 Drainer 进行消费。

### Drainer

[Drainer](https://github.com/pingcap/tidb-binlog/tree/release-7.5/drainer) 从各个 Pump 中收集 Binlog 进行归并，再将 Binlog 转化成 SQL 或者指定格式的数据，最终同步到下游。

### binlogctl 工具

[`binlogctl`](https://github.com/pingcap/tidb-binlog/tree/release-7.5/binlogctl) 是一个 TiDB Binlog 配套的运维工具，具有如下功能：

* 获取 TiDB 集群当前的 TSO
* 查看 Pump/Drainer 状态
* 修改 Pump/Drainer 状态
* 暂停/下线 Pump/Drainer

## 主要特性

* 多个 Pump 形成一个集群，可以水平扩容。
* TiDB 通过内置的 Pump Client 将 Binlog 分发到各个 Pump。
* Pump 负责存储 Binlog，并将 Binlog 按顺序提供给 Drainer。
* Drainer 负责读取各个 Pump 的 Binlog，归并排序后发送到下游。
* Drainer 支持 [relay log](/tidb-binlog/tidb-binlog-relay-log.md) 功能，通过 relay log 保证下游集群的一致性状态。

## 注意事项

* TiDB Binlog 和 TiDB 在 v5.1 版本中解决了 v5.0 版本中引入的聚簇索引与 TiDB Binlog 不兼容问题。在升级 TiDB Binlog 和 TiDB Server 到 v5.1 版本后：开启 TiDB Binlog 后，TiDB 支持创建聚簇索引表；聚簇索引表的数据插入、删除和更新操作支持通过 TiDB Binlog 同步到下游。对于同步聚簇索引表时需注意：

    - 如果从 v5.0 版本手动控制组件升级顺序进行升级，请确保先将 TiDB Binlog 升级至 v5.1 版本后再将 TiDB Server 升级至 v5.1 版本。
    - 推荐将上下游的 TiDB 系统变量 [`tidb_enable_clustered_index`](/system-variables.md#tidb_enable_clustered_index-从-v50-版本开始引入) 配置为一致的值来保证上下游 TiDB 聚簇索引表结构一致。

* TiDB Binlog 与 TiDB v5.0 版本开始引入的以下特性不兼容，无法一起使用：

    - [TiDB 聚簇索引特性](/clustered-indexes.md#限制)：开启 TiDB Binlog 后 TiDB 不允许创建非单个整数列作为主键的聚簇索引；已创建的聚簇索引表的数据插入、删除和更新动作不会通过 TiDB Binlog 同步到下游。如需同步聚簇索引表，请升级至 v5.1 版本或使用 [TiCDC](/ticdc/ticdc-overview.md)；
    - TiDB 系统变量 [tidb_enable_async_commit](/system-variables.md#tidb_enable_async_commit-从-v50-版本开始引入)：启用 TiDB Binlog 后，开启该选项无法获得性能提升。要获得性能提升，建议使用 [TiCDC](/ticdc/ticdc-overview.md) 替代 TiDB Binlog。
    - TiDB 系统变量 [tidb_enable_1pc](/system-variables.md#tidb_enable_1pc-从-v50-版本开始引入)：启用 TiDB Binlog 后，开启该选项无法获得性能提升。要获得性能提升，建议使用 [TiCDC](/ticdc/ticdc-overview.md) 替代 TiDB Binlog。

* Drainer 支持将 Binlog 同步到 MySQL、TiDB、Kafka 或者本地文件。如果需要将 Binlog 同步到其他 Drainer 不支持的类型的系统中，可以设置 Drainer 将 Binlog 同步到 Kafka，然后根据 binlog consumer protocol 进行定制处理，参考 [Binlog Consumer Client 用户文档](/tidb-binlog/binlog-consumer-client.md)。

* 如果 TiDB Binlog 用于增量恢复，可以设置配置项 `db-type="file"`，Drainer 会将 binlog 转化为指定的 [proto buffer 格式](https://github.com/pingcap/tidb-binlog/blob/release-7.5/proto/pb_binlog.proto)的数据，再写入到本地文件中。这样就可以使用 [Reparo](/tidb-binlog/tidb-binlog-reparo.md) 恢复增量数据。

    关于 `db-type` 的取值，应注意：

    - 如果 TiDB 版本 < 2.1.9，则 `db-type="pb"`。
    - 如果 TiDB 版本 > = 2.1.9，则 `db-type="file"` 或 `db-type="pb"`。

* 如果下游为 MySQL/TiDB，数据同步后可以使用 [sync-diff-inspector](/sync-diff-inspector/sync-diff-inspector-overview.md) 进行数据校验。
