---
title: TiDB Data Migration 简介
summary: 了解 TiDB Data Migration
aliases: ['/docs-cn/tidb-data-migration/dev/overview/','/docs-cn/tools/dm/overview/','/zh/tidb/dev/quick-create-migration-task','/zh/tidb/dev/scenarios','/docs-cn/tidb-data-migration/dev/key-features/','/docs-cn/tidb-data-migration/dev/feature-overview/','/zh/tidb/dev/dm-key-features']
---

# TiDB Data Migration 简介

<!--
![star](https://img.shields.io/github/stars/pingcap/tiflow?style=for-the-badge&logo=github) ![license](https://img.shields.io/github/license/pingcap/tiflow?style=for-the-badge) ![forks](https://img.shields.io/github/forks/pingcap/tiflow?style=for-the-badge)
-->

[TiDB Data Migration](https://github.com/pingcap/tiflow/tree/master/dm) (DM) 是一款便捷的数据迁移工具，支持从与 MySQL 协议兼容的数据库（MySQL、MariaDB、Aurora MySQL）到 TiDB 的全量数据迁移和增量数据同步。使用 DM 工具有利于简化数据迁移过程，降低数据迁移运维成本。

## 产品特性

- **与 TiDB 同样保持 MySQL 兼容性。**高度兼容 MySQL 协议、MySQL 5.7 和 MySQL 8.0 的常用功能及语法。
- **支持 DML & DDL 事件同步。**支持解析和同步 binlog 中的 DML 和 DDL 事件。
- **支持合库合表同步模式。**可以方便的将上游各个分片 MySQL 实例的各个分表数据，合并同步到下游 TiDB 的一张表。支持自定义编写同步规则以方便各种可能的同步需求，且具备自动识别和处理上游分片 MySQL 的 DDL 变更，大幅简化运维成本。
- **内置多种过滤器以灵活适应不同场景。**支持以预定义事件类型、正则表达式、SQL 表达式等多种方式在数据同步过程中对 MySQL binlog 事件进行过滤。
- **集中管理。**DM 支持上千个节点的集群规模，可同时运行并集中管理大量数据迁移同步任务。
- **对第三方 Online Schema Change 工具变更过程的同步优化。**在 MySQL 生态中，gh-ost 与 pt-osc 等工具被广泛使用，DM 对其变更过程进行了特殊的优化，以避免对不必要的中间数据进行迁移。详细信息可参考 [online-ddl](/dm/dm-online-ddl-tool-support.md)。
- **高可用。**支持迁移任务在不同节点自由调度，少量工作节点宕机并不会影响进行中的任务。

## 快速安装


```shell
curl --proto '=https' --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh
tiup install dm dmctl
```

## 使用限制

在使用 DM 工具之前，需了解以下限制：

+ 数据库版本要求

    - MySQL 版本 5.6 ~ 8.0
    - MariaDB 版本 >= 10.1.2 （实验特性）

    > **注意：**
    >
    > 如果上游 MySQL/MariaDB servers 间构成主从复制结构，则需要 MySQL 版本高于 5.7.1 或者 MariaDB 版本等于或高于 10.1.3。

+ DDL 语法兼容性限制

    - 目前，TiDB 部分兼容 MySQL 支持的 DDL 语句。因为 DM 使用 TiDB parser 来解析处理 DDL 语句，所以目前仅支持 TiDB parser 支持的 DDL 语法。详见 [TiDB DDL 语法支持](/mysql-compatibility.md#ddl-的限制)。

    - DM 遇到不兼容的 DDL 语句时会报错。要解决此报错，需要使用 dmctl 手动处理，要么跳过该 DDL 语句，要么用指定的 DDL 语句来替换它。详见[如何处理不兼容的 DDL 语句](/dm/dm-faq.md#如何处理不兼容的-ddl-语句)。

    - DM 不会将视图的 DDL 语句同步到下游的 TiDB 集群，也不会将针对视图的 DML 语句同步到下游。在该场景下，建议用户在下游 TiDB 集群中自行创建视图。

+ GBK 字符集兼容性限制

    - DM 在 v5.4.0 之前不支持将 `charset=GBK` 的表迁移到 TiDB。

+ Binlog 兼容性限制

    - DM 不支持 MySQL 8.0 的新特性 binlog 事务压缩 [Transaction_payload_event](https://dev.mysql.com/doc/refman/8.0/en/binary-log-transaction-compression.html)。使用 binlog 事务压缩有导致上下游数据不一致的风险。

+ 向量类型数据同步

    - DM 不支持迁移或同步 MySQL 9.0 的向量数据类型到 TiDB。

## Contributing

欢迎参与 DM 开源项目并万分感谢您的贡献，可以查看 [CONTRIBUTING.md](https://github.com/pingcap/tiflow/blob/master/dm/CONTRIBUTING.md) 了解更多信息。

## 社区技术支持

您可以通过在线文档了解和使用 DM，如果您遇到无法解决的问题，可以选择以下途径之一联系我们。

- [GitHub](https://github.com/pingcap/tiflow/tree/master/dm)
- [AskTUG](https://asktug.com/tags/dm)

## License

DM 遵循 Apache 2.0 协议，在 [LICENSE](https://github.com/pingcap/tiflow/blob/master/LICENSE) 了解更多信息。

## 版本变更说明

在 v5.4 之前，DM 工具的文档独立于 TiDB 文档。要访问这些早期版本的 DM 文档，请点击以下链接：

- [DM v5.3 文档](https://docs.pingcap.com/zh/tidb-data-migration/v5.3)
- [DM v2.0 文档](https://docs.pingcap.com/zh/tidb-data-migration/v2.0/)
- [DM v1.0 文档](https://docs.pingcap.com/zh/tidb-data-migration/v1.0/)

> **注意：**
>
> - DM 的 GitHub 代码仓库已于 2021 年 10 月迁移至 [pingcap/tiflow](https://github.com/pingcap/tiflow/tree/master/dm)。如有任何关于 DM 的问题，请在 `pingcap/tiflow` 仓库提交，以获得后续支持。
> - 在较早版本中（v1.0 和 v2.0），DM 采用独立于 TiDB 的版本号。从 DM v5.3 起，DM 采用与 TiDB 相同的版本号。DM v2.0 的下一个版本为 DM v5.3。DM v2.0 到 v5.3 无兼容性变更，升级过程与正常升级无差异。

要快速了解 DM 的原理架构、适用场景，建议先观看下面的培训视频。注意本视频只作为学习参考，具体操作步骤和最新功能，请以文档内容为准。

<video src="https://docs-download.pingcap.com/media/videos/docs-cn%2FLesson20_dm_part01.mp4" width="100%" height="100%" controls="controls" poster="https://docs-download.pingcap.com/media/videos/docs-cn/poster_lesson20.png"></video>

<video src="https://docs-download.pingcap.com/media/videos/docs-cn/Lesson20_dm_part02.mp4" width="100%" height="100%" controls="controls" poster="https://docs-download.pingcap.com/media/videos/docs-cn/poster_lesson20.png"></video>

<video src="https://docs-download.pingcap.com/media/videos/docs-cn/Lesson20_part03.mp4" width="100%" height="100%" controls="controls" poster="https://docs-download.pingcap.com/media/videos/docs-cn/poster_lesson20.png"></video>
