---
title: TiDB RC2 Release Notes
summary: TiDB RC2 版本发布，提升了 MySQL 兼容性、SQL 优化器、系统稳定性和性能。对于 OLTP 场景，读取性能提升 60%，写入性能提升 30%。新增权限管理功能，支持基本权限管理和大量 MySQL 内建函数。完善监控，修复 Bug 和内存泄漏问题。PD 支持 Label 对副本进行 Location 调度，基于 region 数量的快速调度，pd-ctl 支持更多功能。TiKV 支持 Async Apply 提升整体写入性能，优化单行读事务性能，支持更多下推功能，加入更多统计，修复 Bug。
---

# TiDB RC2 Release Notes

2017 年 3 月 1 日，TiDB 正式发布 RC2 版。该版本对 MySQL 兼容性、SQL 优化器、系统稳定性、性能做了大量的工作。对于 OLTP 场景，读取性能提升 60%，写入性能提升 30%。另外提供了权限管理功能，用户可以按照 MySQL 的权限管理方式控制数据访问权限。

## TiDB

+ SQL 查询优化器
    - 统计信息收集和使用
    - 关联子查询优化
    - 优化 CBO 框架
    - 通过 Unique Key 信息消除聚合
    - 重构 Expression
    - Distinct 转换为 GroupBy
    - 支持 topn 操作下推
+ 支持基本权限管理
+ 新增大量 MySQL 内建函数
+ 完善 Alter Table 语句，支持修改表名、默认值、注释
+ 支持 Create Table Like 语句
+ 支持 Show Warnings 语句
+ 支持 Rename Table 语句
+ 限制单个事务大小，避免大事务阻塞整个集群
+ Load Data 过程中对数据进行自动拆分
+ 优化 AddIndex、Delete 语句性能
+ 支持 "ANSI_QUOTES" sql_mode
+ 完善监控
+ 修复 Bug
+ 修复内存泄漏问题

## PD

+ 支持 Label 对副本进行 Location 调度
+ 基于 region 数量的快速调度
+ pd-ctl 支持更多功能
    - 添加、删除 PD
    - 通过 Key 获取 Region 信息
    - 添加、删除 scheduler 和 operator
    - 获取集群 label 信息

## TiKV

+ 支持 Async Apply 提升整体写入性能
+ 使用 prefix seek 提升 Write CF 的读取性能
+ 使用 memory hint prefix 提升 Raft CF 插入性能
+ 优化单行读事务性能
+ 支持更多下推功能
+ 加入更多统计
+ 修复 Bug
