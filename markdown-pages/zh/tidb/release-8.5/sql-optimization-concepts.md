---
title: SQL 优化流程简介
summary: TiDB 中的 SQL 优化流程包括查询文本解析、逻辑等价变化和最终执行计划生成。经过 parser 解析和合法性验证后，TiDB 会对查询进行逻辑上的等价变化，使得查询在逻辑执行计划上更易处理。之后根据数据分布和执行开销生成最终执行计划。同时，TiDB 在执行 PREPARE 语句时可以选择开启缓存来降低执行计划生成的开销。
---

# SQL 优化流程简介

在 TiDB 中，从输入的查询文本到最终的执行计划执行结果的过程可以见下图。

![SQL Optimization](https://docs-download.pingcap.com/media/images/docs-cn/sql-optimization.png)

在经过了 `parser` 对原始查询文本的解析以及一些简单的合法性验证后，TiDB 首先会对查询做一些逻辑上的等价变化，详细的变化可以查询[逻辑优化](/sql-logical-optimization.md)章节。

通过这些等价变化，使得这个查询在逻辑执行计划上可以变得更易于处理。在等价变化结束之后，TiDB 会得到一个与原始查询等价的查询计划结构，之后根据数据分布、以及一个算子具体的执行开销，来获得一个最终的执行计划，这部分内容可以查询[物理优化](/sql-physical-optimization.md)章节。

同时，TiDB 在执行 [`PREPARE`](/sql-statements/sql-statement-prepare.md) 语句时，可以选择开启缓存来降低 TiDB 生成执行计划的开销，这部分内容会在[执行计划缓存](/sql-prepared-plan-cache.md)一节中介绍。