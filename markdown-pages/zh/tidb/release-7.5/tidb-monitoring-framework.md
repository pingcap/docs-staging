---
title: TiDB 监控框架概述
summary: TiDB 使用 Prometheus 作为监控和性能指标存储，Grafana 用于可视化展示，以及 TiDB Dashboard 图形化界面用于监控及诊断 TiDB 集群。Prometheus 提供多个组件，包括 Prometheus Server、Client 代码库和 Alertmanager。Grafana 展示 TiDB 集群各组件的相关监控，分组包括备份恢复、Binlog、网络探活、磁盘性能、Kafka、TiDB Lightning 等。每个分组包含多个监控项页签，以及详细的监控指标看板。观看培训视频可快速了解监控与报警系统的体系、数据流转方式、系统管理方法和常用监控指标。
---

# TiDB 监控框架概述

TiDB 使用开源时序数据库 [Prometheus](https://prometheus.io) 作为监控和性能指标信息存储方案，使用 [Grafana](https://grafana.com/grafana) 作为可视化组件进行展示，并提供内置的 [TiDB Dashboard](/dashboard/dashboard-intro.md) 图形化界面，用于监控及诊断 TiDB 集群。

要快速了解 TiDB 监控与报警系统的体系、该系统背后的数据流转方式、系统管理方法、系统使用方法和常用监控指标，建议观看下面的培训视频（时长 29 分钟）。注意本视频只作为学习参考，具体的[监控指标与相关报警规则](/alert-rules.md#tidb-报警规则)，请以文档内容为准。

<video src="https://docs-download.pingcap.com/media/videos/docs-cn%2FLesson13_monitor.mp4" width="100%" height="100%" controls="controls" poster="https://docs-download.pingcap.com/media/videos/docs-cn/poster_lesson13.png"></video>

## Prometheus 在 TiDB 中的应用

Prometheus 是一个拥有多维度数据模型的、灵活的查询语句的时序数据库。Prometheus 作为热门的开源项目，拥有活跃的社区及众多的成功案例。

Prometheus 提供了多个组件供用户使用。目前，TiDB 使用了以下组件：

- Prometheus Server：用于收集和存储时间序列数据。
- Client 代码库：用于定制程序中需要的 Metric。
- Alertmanager：用于实现报警机制。

其结构如下图所示：

![Prometheus in TiDB](https://docs-download.pingcap.com/media/images/docs-cn/prometheus-in-tidb.png)

## Grafana 在 TiDB 中的应用

Grafana 是一个开源的 metric 分析及可视化系统。TiDB 使用 Grafana 来展示 TiDB 集群各组件的相关监控，监控项分组如下图所示：

![Grafana monitored_groups](https://docs-download.pingcap.com/media/images/docs-cn/grafana_monitored_groups.png)

- {TiDB_Cluster_name}-Backup-Restore：备份恢复相关的监控项。
- {TiDB_Cluster_name}-Binlog：TiDB Binlog 相关的监控项。
- {TiDB_Cluster_name}-Blackbox_exporter：网络探活相关监控项。
- {TiDB_Cluster_name}-Disk-Performance：磁盘性能相关监控项。
- {TiDB_Cluster_name}-Kafka-Overview：Kafka 相关监控项。
- {TiDB_Cluster_name}-Lightning：TiDB Lightning 组件相关监控项。
- {TiDB_Cluster_name}-Node_exporter：操作系统相关监控项。
- {TiDB_Cluster_name}-Overview：重要组件监控概览。
- {TiDB_Cluster_name}-PD：PD server 组件相关监控项。
- {TiDB_Cluster_name}-Performance-Read：读性能相关监控项。
- {TiDB_Cluster_name}-Performance-Write：写性能相关监控项。
- {TiDB_Cluster_name}-TiDB：TiDB server 组件详细监控项。
- {TiDB_Cluster_name}-TiDB-Summary：TiDB server 相关监控项概览。
- {TiDB_Cluster_name}-TiFlash-Proxy-Summary：数据同步到 TiFlash 的代理 server 监控项概览。
- {TiDB_Cluster_name}-TiFlash-Summary：TiFlash server 相关监控项概览。
- {TiDB_Cluster_name}-TiKV-Details：TiKV server 组件详细监控项。
- {TiDB_Cluster_name}-TiKV-Summary：TiKV server 监控项概览。
- {TiDB_Cluster_name}-TiKV-Trouble-Shooting：TiKV 错误诊断相关监控项。
- {TiDB_Cluster_name}-TiCDC：TiCDC 组件详细监控项。

每个分组包含多个监控项页签，页签中包含多个详细的监控项信息。以 Overview 监控组为例，其中包含 5 个页签，每个页签内有相应的监控指标看板，如下图所示：

![Grafana Overview](https://docs-download.pingcap.com/media/images/docs-cn/grafana_monitor_overview.png)

## TiDB Dashboard

TiDB Dashboard 是 TiDB 自 4.0 版本起提供的图形化界面，可用于监控及诊断 TiDB 集群。TiDB Dashboard 内置于 TiDB 的 PD 组件中，无需独立部署。更多信息，请参考 [TiDB Dashboard 介绍](/dashboard/dashboard-intro.md)。
