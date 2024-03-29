---
title: ADMIN RESUME DDL JOBS
summary: TiDB 数据库中 ADMIN RESUME DDL 的使用概况。
---

# ADMIN RESUME DDL JOBS

`ADMIN RESUME DDL` 语句用于恢复当前处于暂停中的 DDL 作业。可以通过 [`ADMIN SHOW DDL JOBS`](/sql-statements/sql-statement-admin-show-ddl.md) 语句获取 DDL 作业的 `job_id`。

该语句可用于恢复处于暂停中的 DDL 任务。成功恢复后，执行 DDL 任务的 SQL 语句会一直表现为正在执行。如果尝试恢复已经完成的 DDL 任务，会在 `RESULT` 列看到 `DDL Job:90 not found` 的错误，表示该任务已从 DDL 等待队列中被移除。

> **注意：**
>
> + 该操作可以恢复已被暂停的 DDL 作业。
> + 版本升级时，正在运行的 DDL 作业将被暂停，同时在升级过程中发起的 DDL 作业也将被暂停。升级结束后，所有已暂停的 DDL 作业将恢复执行。升级过程中的操作为自动进行，详情查阅 [TiDB 平滑升级](/smooth-upgrade-tidb.md)。
> + 该操作可以同时恢复多个 DDL 作业，可以通过 [`ADMIN SHOW DDL JOBS`](/sql-statements/sql-statement-admin-show-ddl.md) 语句来获取 DDL 作业的 `job_id`。
> + 处于非暂停状态中的作业无法被恢复，操作将失败。
> + 如果重复恢复同一个 DDL 作业，会报错 `Error Number: 8261`。

> **警告：**
>
> 该功能目前为实验特性，不建议在生产环境中使用。该功能可能会在未事先通知的情况下发生变化或删除。如果发现 bug，请在 GitHub 上提 [issue](https://github.com/pingcap/tidb/issues) 反馈。

## 语法图

```ebnf+diagram
AdminStmt ::=
    'ADMIN' ( 'SHOW' ( 'DDL' ( 'JOBS' Int64Num? WhereClauseOptional | 'JOB' 'QUERIES' NumList )? | TableName 'NEXT_ROW_ID' | 'SLOW' AdminShowSlow ) | 'CHECK' ( 'TABLE' TableNameList | 'INDEX' TableName Identifier ( HandleRange ( ',' HandleRange )* )? ) | 'RECOVER' 'INDEX' TableName Identifier | 'CLEANUP' ( 'INDEX' TableName Identifier | 'TABLE' 'LOCK' TableNameList ) | 'CHECKSUM' 'TABLE' TableNameList | 'CANCEL' 'DDL' 'JOBS' NumList | 'PAUSE' 'DDL' 'JOBS' NumList | 'RESUME' 'DDL' 'JOBS' NumList | 'RELOAD' ( 'EXPR_PUSHDOWN_BLACKLIST' | 'OPT_RULE_BLACKLIST' | 'BINDINGS' ) | 'PLUGINS' ( 'ENABLE' | 'DISABLE' ) PluginNameList | 'REPAIR' 'TABLE' TableName CreateTableStmt | ( 'FLUSH' | 'CAPTURE' | 'EVOLVE' ) 'BINDINGS' )

NumList ::=
    Int64Num ( ',' Int64Num )*
```

## 示例

可以通过 `ADMIN RESUME DDL JOBS` 语句恢复当前处于暂停中的 DDL 作业，并返回对应作业是否恢复执行：

```sql
ADMIN RESUME DDL JOBS job_id [, job_id] ...;
```

如果恢复失败，会显示失败的具体原因。

## MySQL 兼容性

`ADMIN RESUME DDL` 语句是 TiDB 对 MySQL 语法的扩展。

## 另请参阅

* [`ADMIN SHOW DDL [JOBS|QUERIES]`](/sql-statements/sql-statement-admin-show-ddl.md)
* [`ADMIN CANCEL DDL`](/sql-statements/sql-statement-admin-cancel-ddl.md)
* [`ADMIN PAUSE DDL`](/sql-statements/sql-statement-admin-pause-ddl.md)
