---
title: TiDB 2.0.5 release notes
summary: TiDB 2.0.5 版本发布，改进了系统兼容性和稳定性。新增系统变量 `tidb_disable_txn_auto_retry`，调整计算 `Selection` 代价的方式，优化查询条件匹配唯一索引或主键，修复多个 bug。PD 修复副本迁移导致 TiKV 磁盘空间耗尽和 `AdjacentRegionScheduler` 导致的崩溃问题。TiKV 修复 decimal 运算中的溢出和 merge 过程中的脏读问题。
---

# TiDB 2.0.5 Release Notes

2018 年 7 月 6 日，TiDB 发布 2.0.5 版。该版本在 2.0.4 版的基础上，对系统兼容性、稳定性做出了改进。

## TiDB

- New Features
    - 增加一个系统变量 `tidb_disable_txn_auto_retry`，用于关闭事务自动重试 [#6877](https://github.com/pingcap/tidb/pull/6877)
- Improvements
    - 调整计算 `Selection` 代价的方式，结果更准确 [#6989](https://github.com/pingcap/tidb/pull/6989)
    - 查询条件能够完全匹配唯一索引或者主键时，直接选择作为查询路径 [#6966](https://github.com/pingcap/tidb/pull/6966)
    - 启动服务失败时，做必要的清理工作 [#6964](https://github.com/pingcap/tidb/pull/6964)
    - 在 `Load Data` 语句中，将 `\N` 处理为 NULL [#6962](https://github.com/pingcap/tidb/pull/6962)
    - 优化 CBO 代码结构 [#6953](https://github.com/pingcap/tidb/pull/6953)
    - 启动服务时，尽早上报监控数据 [#6931](https://github.com/pingcap/tidb/pull/6931)
    - 对慢查询日志格式进行优化：去除 SQL 语句中的换行符，增加用户信息 [#6920](https://github.com/pingcap/tidb/pull/6920)
    - 支持注释中存在多个星号的情况 [#6858](https://github.com/pingcap/tidb/pull/6858)
- Bug Fixes
    - 修复 `KILL QUERY` 语句权限检查问题 [#7003](https://github.com/pingcap/tidb/pull/7003)
    - 修复用户数量超过 1024 时可能造成无法登录的问题 [#6986](https://github.com/pingcap/tidb/pull/6986)
    - 修复一个写入无符号类型 `float`/`double` 数据的问题 [#6940](https://github.com/pingcap/tidb/pull/6940)
    - 修复 `COM_FIELD_LIST` 命令的兼容性，解决部分 MariaDB 客户端遇到 Panic 的问题 [#6929](https://github.com/pingcap/tidb/pull/6929)
    - 修复 `CREATE TABLE IF NOT EXISTS LIKE` 行为 [#6928](https://github.com/pingcap/tidb/pull/6928)
    - 修复一个 TopN 下推过程中的问题 [#6923](https://github.com/pingcap/tidb/pull/6923)
    - 修复 `Add Index` 过程中遇到错误时当前处理的行 ID 记录问题 [#6903](https://github.com/pingcap/tidb/pull/6903)

## PD

- 修复某些场景下副本迁移导致 TiKV 磁盘空间耗尽的问题
- 修复 `AdjacentRegionScheduler` 导致的崩溃问题

## TiKV

- 修复 decimal 运算中潜在的溢出问题
- 修复 merge 过程中可能发生的脏读问题
