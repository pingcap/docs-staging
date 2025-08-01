---
title: 数据迁移计费
summary: 了解 TiDB Cloud 中数据迁移的计费情况。
---

# 数据迁移计费

本文档描述了 TiDB Cloud 中数据迁移的计费情况。

## 数据迁移规格

TiDB Cloud 使用复制容量单位（RCU）来衡量数据迁移的容量。创建数据迁移任务时，你可以选择适当的规格。RCU 越高，迁移性能越好。这些数据迁移 RCU 将会产生费用。

下表列出了每个数据迁移规格可以迁移的相应性能和最大表数。

| 规格 | 全量数据迁移 | 增量数据迁移 | 最大表数 |
|---------------|---------------------|---------------------------|-----------------------|
| 2 RCU  | 25 MiB/s | 10,000 行/秒 | 500   |
| 4 RCU  | 35 MiB/s | 20,000 行/秒 | 10000 |
| 8 RCU  | 40 MiB/s | 40,000 行/秒 | 30000 |
| 16 RCU | 45 MiB/s | 80,000 行/秒 | 60000 |

有关数据迁移 RCU 的价格信息，请参阅[数据迁移成本](https://www.pingcap.com/tidb-dedicated-pricing-details/#dm-cost)。

> **注意：**
>
> - 如果要迁移的表数量超过最大表数，数据迁移任务可能仍会运行，但任务可能变得不稳定甚至失败。
> - 本表中的所有性能值都是最大和最优值。假设上游和下游数据库没有性能、网络带宽或其他瓶颈。性能值仅供参考，在不同场景下可能会有所不同。

数据迁移任务以 MiB/s 衡量全量数据迁移性能。此单位表示数据迁移任务每秒迁移的数据量（以 MiB 为单位）。

数据迁移任务以行/秒衡量增量数据迁移性能。此单位表示每秒迁移到目标数据库的行数。例如，如果上游数据库在大约 1 秒内执行 10,000 行的 `INSERT`、`UPDATE` 或 `DELETE` 语句，相应规格的数据迁移任务可以在大约 1 秒内将这 10,000 行复制到下游。

## 价格

要了解 TiDB Cloud 支持的区域和每个数据迁移 RCU 的价格，请参阅[数据迁移成本](https://www.pingcap.com/tidb-cloud-pricing-details/#dm-cost)。

数据迁移任务与目标 TiDB 节点位于同一区域。

请注意，如果你使用 AWS PrivateLink 或 VPC 对等连接，且源数据库和 TiDB 节点不在同一区域或不在同一可用区（AZ），将产生两项额外的流量费用：跨区域和跨可用区流量费用。

- 如果源数据库和 TiDB 节点不在同一区域，当数据迁移任务从源数据库收集数据时，将产生跨区域流量费用。

    ![跨区域流量费用](https://docs-download.pingcap.com/media/images/docs/tidb-cloud/dm-billing-cross-region-fees.png)

- 如果源数据库和 TiDB 节点在同一区域但在不同的可用区，当数据迁移任务从源数据库收集数据时，将产生跨可用区流量费用。

    ![跨可用区流量费用](https://docs-download.pingcap.com/media/images/docs/tidb-cloud/dm-billing-cross-az-fees.png)

- 如果数据迁移任务和 TiDB 节点不在同一可用区，当数据迁移任务向目标 TiDB 节点写入数据时，将产生跨可用区流量费用。此外，如果数据迁移任务和 TiDB 节点与源数据库不在同一可用区（或区域），当数据迁移任务从源数据库收集数据时，将产生跨可用区（或跨区域）流量费用。

    ![跨区域和跨可用区流量费用](https://docs-download.pingcap.com/media/images/docs/tidb-cloud/dm-billing-cross-region-and-az-fees.png)

跨区域和跨可用区流量的价格与 TiDB Cloud 的价格相同。更多信息，请参阅 [TiDB Cloud 价格详情](https://www.pingcap.com/tidb-dedicated-pricing-details/)。

## 另请参阅

- [使用数据迁移从 MySQL 兼容数据库迁移](/tidb-cloud/migrate-from-mysql-using-data-migration.md)
