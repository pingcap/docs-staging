---
title: TiDB 2.0.4 release notes
summary: TiDB 2.0.4 版本发布，改进了系统兼容性和稳定性。TiDB 支持了新的语法和变量设置，优化了监控项和查询代价估计精度。PD 改进了调度参数行为，TiKV 新增了调试接口和命令，优化了问题和修复了崩溃。
---

# TiDB 2.0.4 Release Notes

2018 年 6 月 15 日，TiDB 发布 2.0.4 版。该版本在 2.0.3 版的基础上，对系统兼容性、稳定性做出了改进。

## TiDB

- 支持 `ALTER TABLE t DROP COLUMN a CASCADE` 语法
- 支持设置 `tidb_snapshot` 变量的值为 `TSO`
- 优化监控项中语句类型展示
- 优化查询代价估计精度
- 设置 gRPC 的 `backoff max delay` 参数
- 支持通过配置文件设置单条语句的内存使用阈值
- 重构 Optimizer 的 error
- 解决 Cast Decimal 数据的副作用问题
- 解决特定场景下 `Merge Join` 算子结果错误的问题
- 解决转换 `Null` 对象到 String 的问题
- 解决 Cast JSON 数据为 JSON 类型的问题
- 解决 `Union` + `OrderBy` 情况下结果顺序和 MySQL 不一致的问题
- 解决 `Union` 语句中对 `Limit`/`OrderBy` 子句的合法性检查规则问题
- 解决 `Union All` 的结果兼容性问题
- 解决谓词下推中的一个 Bug
- 解决 `Union` 语句对 `For Update` 子句的兼容性问题
- 解决 `concat_ws` 函数对结果错误截断的问题

## PD

- 改进 `max-pending-peer-count` 调度参数未设置时的行为，调整为不限制最大 `PendingPeer` 的数量

## TiKV

- 新增 RocksDB `PerfContext` 接口用于调试
- 移除 `import-mode` 参数
- 为 `tikv-ctl` 添加 `region-properties` 命令
- 优化有大量 RocksDB tombstone 时 `reverse-seek` 过慢的问题
- 修复 `do_sub` 导致的崩溃问题
- 当 GC 遇到有太多版本的数据时记录日志
