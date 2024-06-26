---
title: 窗口函数
summary: TiDB 中的窗口函数与 MySQL 8.0 基本一致。可以将 `tidb_enable_window_function` 设置为 `0` 来解决升级后无法解析语法的问题。TiDB 支持除 `GROUP_CONCAT()` 和 `APPROX_PERCENTILE()` 以外的所有 `GROUP BY` 聚合函数。其他支持的窗口函数包括 `CUME_DIST()`、`DENSE_RANK()`、`FIRST_VALUE()`、`LAG()`、`LAST_VALUE()`、`LEAD()`、`NTH_VALUE()`、`NTILE()`、`PERCENT_RANK()`、`RANK()` 和 `ROW_NUMBER()`。这些函数可以下推到 TiFlash。
---

# 窗口函数

TiDB 中窗口函数的使用方法与 MySQL 8.0 基本一致，详情可参见 [MySQL 窗口函数](https://dev.mysql.com/doc/refman/8.0/en/window-functions.html)。由于窗口函数会使用一些保留关键字，可能导致原先可以正常执行的 SQL 语句在升级 TiDB 后无法被解析语法，此时可以将 `tidb_enable_window_function` 设置为 `0`，该参数的默认值为 `1`。

[本页](/tiflash/tiflash-supported-pushdown-calculations.md)列出的窗口函数可以下推到 TiFlash。

TiDB 支持除 `GROUP_CONCAT()` 和 `APPROX_PERCENTILE()` 以外的所有 [`GROUP BY` 聚合函数](/functions-and-operators/aggregate-group-by-functions.md)。此外，TiDB 支持的其他窗口函数如下：

| 函数名 | 功能描述 |
| :-------------- | :------------------------------------- |
| [`CUME_DIST()`](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_cume-dist) | 返回一组值中的累积分布 |
| [`DENSE_RANK()`](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_dense-rank) | 返回分区中当前行的排名，并且排名是连续的|
| [`FIRST_VALUE()`](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_first-value) | 当前窗口中第一行的表达式值 |
| [`LAG()`](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_lag) | 分区中当前行前面第 N 行的表达式值|
| [`LAST_VALUE()`](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_last-value) | 当前窗口中最后一行的表达式值 |
| [`LEAD()`](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_lead) | 分区中当前行后面第 N 行的表达式值 |
| [`NTH_VALUE()`](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_nth-value) | 当前窗口中第 N 行的表达式值 |
| [`NTILE()`](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_ntile)| 将分区划分为 N 桶，为分区中的每一行分配桶号 |
| [`PERCENT_RANK()`](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_percent-rank)|返回分区中小于当前行的百分比 |
| [`RANK()`](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_rank)| 返回分区中当前行的排名，排名可能不连续 |
| [`ROW_NUMBER()`](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_row-number)| 返回分区中当前行的编号 |
