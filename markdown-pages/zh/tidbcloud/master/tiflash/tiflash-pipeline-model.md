---
title: TiFlash 流水线执行模型
summary: 了解 TiFlash 流水线执行模型。
---

# TiFlash 流水线执行模型

本文介绍 TiFlash 流水线执行模型。

从 v7.2.0 版本开始，TiFlash 支持新的执行模型——流水线执行模型。

- 对于 v7.2.0 和 v7.3.0 版本：流水线执行模型处于实验阶段，由系统变量 [`tidb_enable_tiflash_pipeline_model`](https://docs.pingcap.com/tidb/v7.2/system-variables#tidb_enable_tiflash_pipeline_model-introduced-since-v720) 控制。
- 对于 v7.4.0 及更高版本：流水线执行模型已正式发布。它是 TiFlash 的内部功能，与 TiFlash 资源控制紧密集成。当启用 TiFlash 资源控制时，流水线执行模型会自动启用。关于如何使用 TiFlash 资源控制的更多信息，请参考[使用资源控制实现资源隔离](/tidb-resource-control.md#parameters-for-resource-control)。此外，从 v7.4.0 版本开始，系统变量 `tidb_enable_tiflash_pipeline_model` 已被废弃。

受论文 [Morsel-Driven Parallelism: A NUMA-Aware Query Evaluation Framework for the Many-Core Age](https://dl.acm.org/doi/10.1145/2588555.2610507) 的启发，TiFlash 流水线执行模型提供了一个细粒度的任务调度模型，这与传统的线程调度模型不同。它减少了操作系统线程应用和调度的开销，并提供了细粒度的调度机制。

## 设计与实现

原始的 TiFlash 流模型是一个线程调度执行模型。每个查询独立申请若干线程进行协同执行。

线程调度模型有以下两个缺陷：

- 在高并发场景下，过多的线程会导致大量的上下文切换，造成较高的线程调度成本。
- 线程调度模型无法准确衡量查询的资源使用情况，也无法进行细粒度的资源控制。

新的流水线执行模型做了以下优化：

- 将查询划分为多个流水线并按顺序执行。在每个流水线中，尽可能将数据块保持在缓存中，以实现更好的时间局部性，提高整个执行过程的效率。
- 为摆脱操作系统原生的线程调度模型，实现更细粒度的调度机制，每个流水线被实例化为若干任务，采用任务调度模型。同时使用固定的线程池，减少操作系统线程调度的开销。

流水线执行模型的架构如下：

![TiFlash 流水线执行模型设计](https://docs-download.pingcap.com/media/images/docs/tiflash/tiflash-pipeline-model.png)

如上图所示，流水线执行模型主要由两个组件组成：流水线查询执行器和任务调度器。

- 流水线查询执行器

    流水线查询执行器将从 TiDB 节点发送的查询请求转换为流水线有向无环图（DAG）。

    它会在查询中找到流水线断点算子，根据流水线断点将查询拆分为若干个流水线。然后根据流水线之间的依赖关系，将流水线组装成 DAG。

    流水线断点是具有暂停/阻塞逻辑的算子。这类算子会持续接收上游算子的数据块，直到接收完所有数据块后，才向下游算子返回处理结果。这类算子打断了数据处理的流水线，所以称为流水线断点。其中一个流水线断点是聚合算子，它会将上游算子的所有数据写入哈希表，然后计算哈希表中的数据并将结果返回给下游算子。

    查询被转换为流水线 DAG 后，流水线查询执行器会根据依赖关系按顺序执行每个流水线。流水线根据查询并发度被实例化为若干任务，提交给任务调度器执行。

- 任务调度器

    任务调度器执行流水线查询执行器提交的任务。任务根据不同的执行逻辑在任务调度器的不同组件之间动态切换。

    - CPU 任务线程池

        执行任务中的 CPU 密集型计算逻辑，如数据过滤和函数计算。

    - IO 任务线程池

        执行任务中的 IO 密集型计算逻辑，如将中间结果写入磁盘。

    - 等待反应器

        执行任务中的等待逻辑，如等待网络层将数据包传输到计算层。
