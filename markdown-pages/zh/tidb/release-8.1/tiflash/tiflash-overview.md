---
title: TiFlash 简介
summary: TiFlash 是 TiDB HTAP 形态的关键组件，提供了良好的隔离性和强一致性。它使用列存扩展和 Raft Learner 协议异步复制，通过 Raft 校对索引配合 MVCC 实现一致性隔离级别。TiFlash 架构解决了 HTAP 场景的隔离性和列存同步问题。它提供列式存储和借助 ClickHouse 高效实现的协处理器层。TiFlash 可以兼容 TiDB 和 TiSpark，推荐与 TiKV 不同节点部署以实现 Workload 隔离。具有异步复制、一致性、智能选择和计算加速等核心特性。部署完成后需要手动指定需要同步的表。
---

# TiFlash 简介

[TiFlash](https://github.com/pingcap/tiflash) 是 TiDB HTAP 形态的关键组件，它是 TiKV 的列存扩展，在提供了良好的隔离性的同时，也兼顾了强一致性。列存副本通过 Raft Learner 协议异步复制，但是在读取的时候通过 Raft 校对索引配合 MVCC 的方式获得 Snapshot Isolation 的一致性隔离级别。这个架构很好地解决了 HTAP 场景的隔离性以及列存同步的问题。

## 整体架构

![TiFlash 架构](https://docs-download.pingcap.com/media/images/docs-cn/tidb-storage-architecture-1.png)

上图为 TiDB HTAP 形态架构，其中包含 TiFlash 节点。

TiFlash 提供列式存储，且拥有借助 ClickHouse 高效实现的协处理器层。除此以外，它与 TiKV 非常类似，依赖同样的 Multi-Raft 体系，以 Region 为单位进行数据复制和分散（详情见[《说存储》](https://pingcap.com/blog-cn/tidb-internal-1/)一文）。

TiFlash 以低消耗不阻塞 TiKV 写入的方式，实时复制 TiKV 集群中的数据，并同时提供与 TiKV 一样的一致性读取，且可以保证读取到最新的数据。TiFlash 中的 Region 副本与 TiKV 中完全对应，且会跟随 TiKV 中的 Leader 副本同时进行分裂与合并。

在 Linux AMD64 架构的硬件平台部署 TiFlash 时，CPU 必须支持 AVX2 指令集。确保命令 `cat /proc/cpuinfo | grep avx2` 有输出。而在 Linux ARM64 架构的硬件平台部署 TiFlash 时，CPU 必须支持 ARMv8 架构。确保命令 `cat /proc/cpuinfo | grep 'crc32' | grep 'asimd'` 有输出。通过使用向量扩展指令集，TiFlash 的向量化引擎能提供更好的性能。

TiFlash 可以兼容 TiDB 与 TiSpark，用户可以选择使用不同的计算引擎。

TiFlash 推荐使用和 TiKV 不同的节点以做到 Workload 隔离，但在无业务隔离的前提下，也可以选择与 TiKV 同节点部署。

TiFlash 暂时无法直接接受数据写入，任何数据必须先写入 TiKV 再同步到 TiFlash。TiFlash 以 learner 角色接入 TiDB 集群，TiFlash 支持表粒度的数据同步，部署后默认情况下不会同步任何数据，需要按照[按表构建 TiFlash 副本](/tiflash/create-tiflash-replicas.md#按表构建-tiflash-副本)一节完成指定表的数据同步。

TiFlash 主要包含两个组件，一个是列式存储引擎组件，另一个是处理 Multi-Raft 协议通信相关工作的 TiFlash proxy 组件。

对于按表构建 TiFlash 副本的流程，TiDB 接收到相应的 DDL 命令后，会自动在 PD 创建对应的 [Placement Rules](/configure-placement-rules.md)，PD 根据该信息进行相关的数据调度。

## 核心特性

TiFlash 主要有异步复制、一致性、智能选择、计算加速等几个核心特性。

### 异步复制

TiFlash 中的副本以特殊角色 (Raft Learner) 进行异步的数据复制。这表示当 TiFlash 节点宕机或者网络高延迟等状况发生时，TiKV 的业务仍然能确保正常进行。

这套复制机制也继承了 TiKV 体系的自动负载均衡和高可用：并不用依赖附加的复制管道，而是直接以多对多方式接收 TiKV 的数据传输；且只要 TiKV 中数据不丢失，就可以随时恢复 TiFlash 的副本。

### 一致性

TiFlash 提供与 TiKV 一样的快照隔离支持，且保证读取数据最新（确保之前写入的数据能被读取）。这个一致性是通过对数据进行复制进度校验做到的。

每次收到读取请求，TiFlash 中的 Region 副本会向 Leader 副本发起进度校对（一个非常轻的 RPC 请求），只有当进度确保至少所包含读取请求时间戳所覆盖的数据之后才响应读取。

### 智能选择

TiDB 可以自动选择使用 TiFlash 列存或者 TiKV 行存，甚至在同一查询内混合使用提供最佳查询速度。这个选择机制与 TiDB 选取不同索引提供查询类似：根据统计信息判断读取代价并作出合理选择。

### 计算加速

TiFlash 对 TiDB 的计算加速分为两部分：列存本身的读取效率提升以及为 TiDB 分担计算。其中分担计算的原理和 TiKV 的协处理器一致：TiDB 会将可以由存储层分担的计算下推。能否下推取决于 TiFlash 是否可以支持相关下推。具体介绍请参阅[“TiFlash 支持的计算下推”](/tiflash/tiflash-supported-pushdown-calculations.md)一节。

## 使用 TiFlash

TiFlash 部署完成后并不会自动同步数据，而需要手动指定需要同步的表。

你可以使用 TiDB 或者 TiSpark 读取 TiFlash，TiDB 适合用于中等规模的 OLAP 计算，而 TiSpark 适合大规模的 OLAP 计算，你可以根据自己的场景和使用习惯自行选择。具体参见：

- [构建 TiFlash 副本](/tiflash/create-tiflash-replicas.md)
- [使用 TiDB 读取 TiFlash](/tiflash/use-tidb-to-read-tiflash.md)
- [使用 TiSpark 读取 TiFlash](/tiflash/use-tispark-to-read-tiflash.md)
- [使用 MPP 模式](/tiflash/use-tiflash-mpp-mode.md)

如果需要快速体验以 TPC-H 为例子，从导入到查询的完整流程，可以参考 [HTAP 快速上手指南](/quick-start-with-htap.md)。

## 另请参阅

- 全新部署一个包含 TiFlash 节点的集群，请参考[使用 TiUP 部署 TiDB 集群](/production-deployment-using-tiup.md)
- 已有集群新增一个 TiFlash 节点，请参考[扩容 TiFlash 节点](/scale-tidb-using-tiup.md#扩容-tiflash-节点)
- [TiFlash 常见运维操作](/tiflash/maintain-tiflash.md)
- [TiFlash 性能调优](/tiflash/tune-tiflash-performance.md)
- [TiFlash 配置参数介绍](/tiflash/tiflash-configuration.md)
- [TiFlash 监控说明](/tiflash/monitor-tiflash.md)
- [TiFlash 报警规则](/tiflash/tiflash-alert-rules.md)
- [TiFlash 常见问题处理](/tiflash/troubleshoot-tiflash.md)
- [TiFlash 支持的计算下推](/tiflash/tiflash-supported-pushdown-calculations.md)
- [TiFlash 数据校验](/tiflash/tiflash-data-validation.md)
- [TiFlash 兼容性说明](/tiflash/tiflash-compatibility.md)
