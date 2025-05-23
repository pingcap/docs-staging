---
title: TiCDC 简介
---

# TiCDC 简介

[TiCDC](https://github.com/pingcap/tiflow/tree/master/cdc) 是一款 TiDB 增量数据同步工具，通过拉取上游 TiKV 的数据变更日志，TiCDC 可以将数据解析为有序的行级变更数据输出到下游。

## TiCDC 适用场景

- 数据库灾备：TiCDC 可以用于同构数据库之间的灾备场景，能够在灾难发生时保证主备集群数据的最终一致性，目前该场景仅支持 TiDB 作为主备集群。
- 数据集成：TiCDC 提供 [TiCDC Canal-JSON Protocol](/ticdc/ticdc-canal-json.md)，支持其他系统订阅数据变更，能够为监控、缓存、全文索引、数据分析、异构数据库的主从复制等场景提供数据源。

要快速了解 TiCDC 的基本原理和使用方法，建议先观看下面的培训视频（时长 33 分钟）。注意本视频只为学习参考，具体操作步骤和最新功能，请以文档内容为准。

<video src="https://docs-download.pingcap.com/media/videos/docs-cn%2FLesson22_ticdc.mp4" width="100%" height="100%" controls="controls" poster="https://tidb-docs.s3.us-east-2.amazonaws.com/thumbnail+-+lesson+22.png"></video>

## TiCDC 架构

TiCDC 运行时是一种无状态节点，通过 PD 内部的 etcd 实现高可用。TiCDC 集群支持创建多个同步任务，向多个不同的下游进行数据同步。

TiCDC 的系统架构如下图所示：

![TiCDC architecture](https://docs-download.pingcap.com/media/images/docs-cn/ticdc/cdc-architecture.png)

### 系统角色

- TiKV CDC 组件：只输出 key-value (KV) change log。
    - 内部逻辑拼装 KV change log。
    - 提供输出 KV change log 的接口，发送数据包括实时 change log 和增量扫的 change log。

- `capture`：TiCDC 运行进程，多个 `capture` 组成一个 TiCDC 集群，负责 KV change log 的同步。
    - 每个 `capture` 负责拉取一部分 KV change log。
    - 对拉取的一个或多个 KV change log 进行排序。
    - 向下游还原事务或按照 TiCDC Open Protocol 进行输出。

## 同步功能介绍

本部分介绍 TiCDC 的同步功能。

### sink 支持

目前 TiCDC sink 模块支持同步数据到以下下游：

- MySQL 协议兼容的数据库，提供最终一致性支持。
- 以 TiCDC Open Protocol 输出到 Kafka，可实现行级别有序、最终一致性或严格事务一致性三种一致性保证。

### 同步顺序保证和一致性保证

#### 数据同步顺序

- TiCDC 对于所有的 DDL/DML 都能对外输出**至少一次**。
- TiCDC 在 TiKV/TiCDC 集群故障期间可能会重复发相同的 DDL/DML。对于重复的 DDL/DML：
    - MySQL sink 可以重复执行 DDL，对于在下游可重入的 DDL （譬如 truncate table）直接执行成功；对于在下游不可重入的 DDL（譬如 create table），执行失败，TiCDC 会忽略错误继续同步。
    - Kafka sink 会发送重复的消息，但重复消息不会破坏 Resolved Ts 的约束，用户可以在 Kafka 消费端进行过滤。

#### 数据同步一致性

- MySQL sink

    - TiCDC 不拆分单表事务，**保证**单表事务的原子性。
    - TiCDC **不保证**下游事务的执行顺序和上游完全一致。
    - TiCDC 以表为单位拆分跨表事务，**不保证**跨表事务的原子性。
    - TiCDC **保证**单行的更新与上游更新顺序一致。

> **注意：**
>
> 从 v6.1.1 版本起，你可以通过配置 sink uri 参数 [`transaction-atomicity`](/ticdc/manage-ticdc.md#sink-uri-配置-mysqltidb) 来控制 TiCDC 是否拆分单表事务。拆分事务可以大幅降低 MySQL sink 同步大事务的延时和内存消耗。

- Kafka sink

    - TiCDC 提供不同的数据分发策略，可以按照表、主键或 ts 等策略分发数据到不同 Kafka partition。
    - 不同分发策略下 consumer 的不同实现方式，可以实现不同级别的一致性，包括行级别有序、最终一致性或跨表事务一致性。
    - TiCDC 没有提供 Kafka 消费端实现，只提供了 [TiCDC 开放数据协议](/ticdc/ticdc-open-protocol.md)，用户可以依据该协议实现 Kafka 数据的消费端。

## 同步限制

使用 TiCDC 进行同步的时候，请注意以下相关限制要求以及暂不支持的场景。

### 有效索引的相关要求

TiCDC 只能同步至少存在一个**有效索引**的表，**有效索引**的定义如下：

- 主键 (`PRIMARY KEY`) 为有效索引。
- 同时满足下列条件的唯一索引 (`UNIQUE INDEX`) 为有效索引：
    - 索引中每一列在表结构中明确定义非空 (`NOT NULL`)。
    - 索引中不存在虚拟生成列 (`VIRTUAL GENERATED COLUMNS`)。

### 暂不支持的场景

目前 TiCDC 暂不支持的场景如下：

- 暂不支持单独使用 RawKV 的 TiKV 集群。
- 暂不支持在 TiDB 中[创建 SEQUENCE 的 DDL 操作](/sql-statements/sql-statement-create-sequence.md)和 [SEQUENCE 函数](/sql-statements/sql-statement-create-sequence.md#sequence-函数)。在上游 TiDB 使用 SEQUENCE 时，TiCDC 将会忽略掉上游执行的 SEQUENCE DDL 操作/函数，但是使用 SEQUENCE 函数的 DML 操作可以正确地同步。
- 暂不支持在同步的过程中对 TiCDC 正在同步的表和库进行 [BR 数据恢复](/br/backup-and-restore-overview.md) 和 [TiDB Lightning](/tidb-lightning/tidb-lightning-overview.md) 导入。详情请参考[为什么在上游使用了 TiDB Lightning 和 BR 恢复了数据之后，TiCDC 同步会出现卡顿甚至卡住](/ticdc/ticdc-faq.md#为什么在上游使用了-tidb-lightning-和-br-恢复了数据之后ticdc-同步会出现卡顿甚至卡住)。

对上游存在较大事务的场景提供部分支持，详见 [TiCDC 是否支持同步大事务？有什么风险吗？](/ticdc/ticdc-faq.md#ticdc-支持同步大事务吗有什么风险吗)

> **注意：**
>
> 从 v5.3.0 版本起，TiCDC 不再支持环形同步功能。

## TiCDC 安装和部署

要安装 TiCDC，可以选择随新集群一起部署，也可以对现有 TiDB 集群新增 TiCDC 组件。详请参阅 [TiCDC 安装部署](/ticdc/deploy-ticdc.md)。

## TiCDC 集群管理和同步任务管理

目前支持使用 `cdc cli` 工具或 HTTP 接口来管理 TiCDC 集群状态和数据同步任务。详细操作见：

- [使用 `cdc cli` 工具来管理集群状态和数据同步](/ticdc/manage-ticdc.md#使用-cdc-cli-工具来管理集群状态和数据同步)
- [使用 OpenAPI 接口管理集群状态和数据同步](/ticdc/ticdc-open-api.md)

## TiCDC 开放数据协议

TiCDC Open Protocol 是一种行级别的数据变更通知协议，为监控、缓存、全文索引、分析引擎、异构数据库的主从复制等提供数据源。TiCDC 遵循 TiCDC Open Protocol，向 MQ (Message Queue) 等第三方数据媒介复制 TiDB 的数据变更。详细信息参考 [TiCDC 开放数据协议](/ticdc/ticdc-open-protocol.md)。

## 兼容性问题

本文介绍了兼容性相关的问题。

### 使用 TiCDC v5.0.0-rc 版本的 `cdc cli` 工具操作 v4.0.x 集群导致不兼容问题

使用 TiCDC v5.0.0-rc 版本的 `cdc cli` 工具操作 v4.0.x 版本的 TiCDC 集群时，可能会遇到如下异常情况：

- 若 TiCDC 集群版本为 v4.0.8 或以下，使用 v5.0.0-rc 版本的 `cdc cli` 创建同步任务 changefeed 时，可能导致 TiCDC 集群陷入异常状态，导致同步卡住。
- 若 TiCDC 集群版本为 v4.0.9 或以上，使用 v5.0.0-rc 版本的 `cdc cli` 创建同步任务 changefeed，会导致 Old Value 和 Unified Sorter 特性被非预期地默认开启。

处理方案：

使用和 TiCDC 集群版本对应的 `cdc` 可执行文件进行如下操作：

1. 删除使用 v5.0.0-rc 版本创建的 changefeed，例如：`tiup cdc:v4.0.9 cli changefeed remove -c xxxx --pd=xxxxx --force`。
2. 如果 TiCDC 同步已经卡住，重启 TiCDC 集群，例如：`tiup cluster restart <cluster_name> -R cdc`。
3. 重新创建 changefeed，例如：`tiup cdc:v4.0.9 cli changefeed create --sink-uri=xxxx --pd=xxx`。

> **注意：**
>
> 上述问题仅在 `cdc cli` 的版本是 v5.0.0-rc 时存在。未来其他 v5.0.x 版本的 `cdc cli` 可以兼容 v4.0.x 版本的集群。

### `sort-dir` 及 `data-dir` 配置项的兼容性说明

`sort-dir` 配置项用于给 TiCDC 内部的排序器指定临时文件目录，其作用在各版本有过如下兼容性更改：

|  版本  |  `sort-engine` 的使用  |  说明   |  使用建议  |
|  :---  |    :---               |  :--    | :-- |
| v4.0.11 及之前的 v4.0 版本，v5.0.0-rc | 作为 changefeed 配置项，给 `file` sorter 和 `unified` Sorter 指定临时文件目录 | 在这些版本中，`file` sorter 和 `unified` sorter **均不是**正式功能 (GA)，不推荐在生产环境中使用。<br/><br/>如果有多个 changefeed 被配置使用了 `unified` 作为 `sort-engine`，那么实际使用的临时文件目录可能是任何一个 changefeed 的 `sort-dir` 配置，且每个 TiCDC 节点上使用的目录可能不一致。 | 不推荐在生产环境中使用 Unified Sorter |
| v4.0.12，v4.0.13，v5.0.0 及 v5.0.1 | 作为 changefeed 配置项或 `cdc server` 配置项 | 在默认情况下 changefeed 的 `sort-dir` 配置不会生效，而 `cdc server` 的 `sort-dir` 配置默认为 `/tmp/cdc_sort`。建议生产环境下仅配置 `cdc server` 的相关配置。<br /><br />如果你使用 TiUP 部署 TiCDC，建议升级到最新的 TiUP 版本并在 TiCDC server 配置中设置 `sorter.sort-dir` 一项。<br /><br />在 v4.0.13、v5.0.0 和 v5.0.1 中 unified sorter 是默认开启的，如果要将集群升级至这些版本，请确保 TiCDC server 配置中的 `sorter.sort-dir` 已经被正确配置。| 需要通过 `cdc server` 命令行参数（或 TiUP）配置 `sort-dir` |
|  v4.0.14 及之后的 v4.0 版本，v5.0.3 及之后的 v5.0 版本，更新的版本  | `sort-dir` 被弃用，建议配置 `data-dir` |  `data-dir` 可以通过最新版本的 TiUP 进行配置。这些版本中 unified sorter 是默认开启的，升级时请确保 `data-dir` 已经被正确配置，否则将默认使用 `/tmp/cdc_data`。<br /><br />如果该目录所在设备空间不足，有可能出现硬盘空间不足的问题。之前配置的 changefeed 的 `sort-dir` 配置将会失效。| 需要通过 `cdc server` 命令行参数（或 TiUP）配置 `data-dir` |

### 全局临时表兼容性说明

TiCDC 从 v5.3.0 开始支持[全局临时表](/temporary-tables.md#全局临时表)。

你需要使用 TiCDC v5.3.0 及以上版本同步全局临时表到下游。低于该版本，会导致表定义错误。

如果 TiCDC 的上游集群包含全局临时表，下游集群也必须是 TiDB 5.3.0 及以上版本，否则同步报错。

## TiCDC 常见问题与故障处理

- 使用 TiCDC 过程中经常遇到的问题，请参考 [TiCDC 常见问题](/ticdc/ticdc-faq.md)。
- 使用 TiCDC 过程中遇到的故障及解决，请参考 [TiCDC 故障处理](/ticdc/troubleshoot-ticdc.md)。
