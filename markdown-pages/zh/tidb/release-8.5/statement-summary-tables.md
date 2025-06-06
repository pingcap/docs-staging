---
title: Statement Summary Tables
summary: MySQL 的 `performance_schema` 提供了 `statement summary tables`，用于监控和统计 SQL 性能。TiDB 在 `information_schema` 中提供了类似功能的系统表，包括 `statements_summary`、`statements_summary_history`、`cluster_statements_summary` 和 `cluster_statements_summary_history`。这些表用于保存 SQL 监控指标聚合后的结果，帮助用户定位 SQL 问题。同时，还提供了参数配置来控制 statement summary 的功能，如清空周期、保存历史的数量等。
---

# Statement Summary Tables

针对 SQL 性能相关的问题，MySQL 在 `performance_schema` 提供了 [statement summary tables](https://dev.mysql.com/doc/refman/8.0/en/performance-schema-statement-summary-tables.html)，用来监控和统计 SQL。例如其中的一张表 `events_statements_summary_by_digest`，提供了丰富的字段，包括延迟、执行次数、扫描行数、全表扫描次数等，有助于用户定位 SQL 问题。

为此，从 4.0.0-rc.1 版本开始，TiDB 在 `information_schema`（_而不是_ `performance_schema`）中提供与 `events_statements_summary_by_digest` 功能相似的系统表：

- `statements_summary`
- `statements_summary_history`
- `cluster_statements_summary`
- `cluster_statements_summary_history`

本文将详细介绍这些表，以及如何利用它们来排查 SQL 性能问题。

## `statements_summary`

`statements_summary` 是 `information_schema` 里的一张系统表，它把 SQL 按所属资源组、SQL digest 和 plan digest 分组，统计每一组的 SQL 信息。

此处的 SQL digest 与 slow log 里的 SQL digest 一样，是把 SQL 规一化后算出的唯一标识符。SQL 的规一化会忽略常量、空白符、大小写的差别。即语法一致的 SQL 语句，其 digest 也相同。

例如：

```sql
SELECT * FROM employee WHERE id IN (1, 2, 3) AND salary BETWEEN 1000 AND 2000;
select * from EMPLOYEE where ID in (4, 5) and SALARY between 3000 and 4000;
```

归一化后都是：

```sql
select * from employee where id in (...) and salary between ? and ?;
```

此处的 plan digest 是把执行计划规一化后算出的唯一标识符。执行计划的规一化会忽略常量的差别。由于相同的 SQL 可能产生不同的执行计划，所以可能分到多个组，同一个组内的执行计划是相同的。

`statements_summary` 用于保存 SQL 监控指标聚合后的结果。一般来说，每一项监控指标都包含平均值和最大值。例如执行延时对应 `AVG_LATENCY` 和 `MAX_LATENCY` 两个字段，分别是平均延时和最大延时。

为了监控指标的即时性，`statements_summary` 里的数据定期被清空，只展现最近一段时间内的聚合结果。清空周期由系统变量 `tidb_stmt_summary_refresh_interval` 设置。如果刚好在清空之后进行查询，显示的数据可能很少。

以下为查询 `statements_summary` 的部分结果：

```
   SUMMARY_BEGIN_TIME: 2020-01-02 11:00:00
     SUMMARY_END_TIME: 2020-01-02 11:30:00
            STMT_TYPE: Select
          SCHEMA_NAME: test
               DIGEST: 0611cc2fe792f8c146cc97d39b31d9562014cf15f8d41f23a4938ca341f54182
          DIGEST_TEXT: select * from employee where id = ?
          TABLE_NAMES: test.employee
          INDEX_NAMES: NULL
          SAMPLE_USER: root
           EXEC_COUNT: 3
          SUM_LATENCY: 1035161
          MAX_LATENCY: 399594
          MIN_LATENCY: 301353
          AVG_LATENCY: 345053
    AVG_PARSE_LATENCY: 57000
    MAX_PARSE_LATENCY: 57000
  AVG_COMPILE_LATENCY: 175458
  MAX_COMPILE_LATENCY: 175458
  ...........
              AVG_MEM: 103
              MAX_MEM: 103
              AVG_DISK: 65535
              MAX_DISK: 65535
    AVG_AFFECTED_ROWS: 0
           FIRST_SEEN: 2020-01-02 11:12:54
            LAST_SEEN: 2020-01-02 11:25:24
    QUERY_SAMPLE_TEXT: select * from employee where id=3100
     PREV_SAMPLE_TEXT:
          PLAN_DIGEST: f415b8d52640b535b9b12a9c148a8630d2c6d59e419aad29397842e32e8e5de3
                 PLAN:  Point_Get_1     root    1       table:employee, handle:3100
```

> **注意：**
>
> - 在 TiDB 中，statement summary tables 中字段的时间单位是纳秒 (ns)，而 MySQL 中的时间单位是皮秒 (ps)。
> - 从 v7.5.1 和 v7.6.0 版本开始，对于开启[资源管控](/tidb-resource-control-ru-groups.md)的集群，`statements_summary` 会分资源组进行聚合，即在不同资源组执行的相同语句会被收集为不同的记录。

## `statements_summary_history`

`statements_summary_history` 的表结构与 `statements_summary` 完全相同，用于保存历史时间段的数据。通过历史数据，可以排查过去出现的异常，也可以对比不同时间的监控指标。

字段 `SUMMARY_BEGIN_TIME` 和 `SUMMARY_END_TIME` 代表历史时间段的开始时间和结束时间。

## `statements_summary_evicted`

[`tidb_stmt_summary_max_stmt_count`](/system-variables.md#tidb_stmt_summary_max_stmt_count-从-v40-版本开始引入) 系统变量用于限制 `statements_summary` 和 `statements_summary_history` 这两张表在内存中可存储的 SQL digest 总数。当超出该限制时，TiDB 会从 `statements_summary` 和 `statements_summary_history` 这两张表中驱逐最久未使用的 SQL digest。

> **注意：**
>
> 当启用 [`tidb_stmt_summary_enable_persistent`](#持久化-statements-summary) 时，`statements_summary_history` 表中的数据会持久化到磁盘。此时，`tidb_stmt_summary_max_stmt_count` 仅限制 `statements_summary` 表在内存中可存储的 SQL digest 数量；当超出 `tidb_stmt_summary_max_stmt_count` 的限制时，TiDB 仅会从 `statements_summary` 表中驱逐最久未使用的 SQL digest。

`statements_summary_evicted` 表记录了发生 SQL digest 驱逐的时间段，以及该时间段内被驱逐的 SQL digest 数量。通过该表，你可以评估当前 `tidb_stmt_summary_max_stmt_count` 的配置是否适合你的工作负载。如果该表中存在记录，说明在某个时间点上 SQL digest 的数量曾超出过 `tidb_stmt_summary_max_stmt_count` 的限制。

在 [TiDB Dashboard 的 SQL 语句分析列表页面](/dashboard/dashboard-statement-list.md#others)中，被驱逐的语句信息会显示在 `Others` 行中。

## statement summary 的 cluster 表

`statements_summary`、`statements_summary_history` 和 `statements_summary_evicted` 仅显示单台 TiDB server 的 statement summary 数据。若要查询整个集群的数据，需要查询 `cluster_statements_summary`、`cluster_statements_summary_history` 或 `cluster_statements_summary_evicted` 表。

`cluster_statements_summary` 显示各台 TiDB server 的 `statements_summary` 数据，`cluster_statements_summary_history` 显示各台 TiDB server 的 `statements_summary_history` 数据，而 `cluster_statements_summary_evicted` 则显示各台 TiDB server 的 `statements_summary_evicted` 数据。这三张表用字段 `INSTANCE` 表示 TiDB server 的地址，其他字段与 `statements_summary`、`statements_summary_history` 和 `statements_summary_evicted` 表相同。

## 参数配置

以下系统变量用于控制 statement summary：

- `tidb_enable_stmt_summary`：是否打开 statement summary 功能。1 代表打开，0 代表关闭，默认打开。statement summary 关闭后，系统表里的数据会被清空，下次打开后重新统计。经测试，打开后对性能几乎没有影响。
- `tidb_stmt_summary_refresh_interval`：`statements_summary` 的清空周期，单位是秒 (s)，默认值是 `1800`。
- `tidb_stmt_summary_history_size`：`statements_summary_history` 保存每种 SQL 的历史的数量，也是 `statements_summary_evicted` 的表容量，默认值是 `24`。
- `tidb_stmt_summary_max_stmt_count`：限制 `statements_summary` 和 `statements_summary_history` 这两张表在内存中可存储的 SQL digest 总数。默认值为 3000 条。

    当超出该限制时，TiDB 会从 `statements_summary` 和 `statements_summary_history` 这两张表中驱逐最久未使用的 SQL digest。这些被驱逐的 SQL digest 的数量将会被记录在 [`statements_summary_evicted`](#statements_summary_evicted) 表中。

    > **注意：**
    >
    > - 当 SQL digest 被驱逐时，其相关的所有时间段的 summary 数据都会从 `statements_summary` 和 `statements_summary_history` 这两张表中移除。因此，即使一个时间段的 SQL digest 数量没有超过限制，`statements_summary_history` 表中的 SQL digest 数量也可能小于实际的 SQL digest 数量。如果遇到该情况，并且影响了性能，建议调大 `tidb_stmt_summary_max_stmt_count` 的值。
    > - 当启用 [`tidb_stmt_summary_enable_persistent`](#持久化-statements-summary) 时，`statements_summary_history` 表中的数据会持久化到磁盘。此时，`tidb_stmt_summary_max_stmt_count` 仅限制 `statements_summary` 表在内存中可存储的 SQL digest 数量；当超出 `tidb_stmt_summary_max_stmt_count` 的限制时，TiDB 仅会从 `statements_summary` 表中驱逐最久未使用的 SQL digest。

- `tidb_stmt_summary_max_sql_length`：字段 `DIGEST_TEXT` 和 `QUERY_SAMPLE_TEXT` 的最大显示长度，默认值是 4096。
- `tidb_stmt_summary_internal_query`：是否统计 TiDB 的内部 SQL。1 代表统计，0 代表不统计，默认不统计。

statement summary 配置示例如下：

```sql
set global tidb_stmt_summary_max_stmt_count = 3000;
set global tidb_enable_stmt_summary = true;
set global tidb_stmt_summary_refresh_interval = 1800;
set global tidb_stmt_summary_history_size = 24;
```

以上配置生效后，`statements_summary` 每 30 分钟清空一次，`statements_summary_history` 最多保存 3000 种 SQL 种类的数据，每种类型的 SQL 保存最近出现过的 24 个时间段的数据。`statements_summary_evicted` 保存最近 24 个发生了 evict 的时间段记录；`statements_summary_evicted` 则以 30 分钟为一个记录周期，表容量为 24 个时间段。

> **注意：**
>
> - 假设某种 SQL 每分钟都出现，那 `statements_summary_history` 中会保存这种 SQL 最近 12 个小时的数据。但如果某种 SQL 只在每天 00:00 ~ 00:30 出现，则 `statements_summary_history` 中会保存这种 SQL 24 个时间段的数据，每个时间段的间隔都是 1 天，所以会有这种 SQL 最近 24 天的数据。
> - `tidb_stmt_summary_history_size`、`tidb_stmt_summary_max_stmt_count`、`tidb_stmt_summary_max_sql_length` 这些配置都影响内存占用，建议根据实际情况调整（取决于 SQL 大小、SQL 数量、机器配置）不宜设置得过大。内存大小可通过 `tidb_stmt_summary_history_size` \* `tidb_stmt_summary_max_stmt_count` \* `tidb_stmt_summary_max_sql_length` \* `3` 来进行估算。

### 为 statement summary 设定合适的大小

在系统运行一段时间后（视系统负载而定），可以查看 `statements_summary` 表检查是否发生了 evict，例如：

```sql
select @@global.tidb_stmt_summary_max_stmt_count;
select count(*) from information_schema.statements_summary;
```

```
+-------------------------------------------+
| @@global.tidb_stmt_summary_max_stmt_count |
+-------------------------------------------+
| 3000                                      |
+-------------------------------------------+
1 row in set (0.001 sec)

+----------+
| count(*) |
+----------+
|     3001 |
+----------+
1 row in set (0.001 sec)
```

可以发现 `statements_summary` 表已经满了。再查看 `statements_summary_evicted` 表检查 evict 的数据。

```sql
select * from information_schema.statements_summary_evicted;
```

```
+---------------------+---------------------+---------------+
| BEGIN_TIME          | END_TIME            | EVICTED_COUNT |
+---------------------+---------------------+---------------+
| 2020-01-02 16:30:00 | 2020-01-02 17:00:00 |            59 |
+---------------------+---------------------+---------------+
| 2020-01-02 16:00:00 | 2020-01-02 16:30:00 |            45 |
+---------------------+---------------------+---------------+
2 row in set (0.001 sec)
```

由上可知，对最多 59 种 SQL 发生了 evict。此时，建议将 `statements_summary` 表的容量至少增大 59 条记录，即至少增大至 3059 条。

## 目前的限制

由于 statement summary tables 默认都存储在内存中，TiDB server 重启后，statement summary 会全部丢失。

为解决该问题，TiDB v6.6.0 实验性地引入了 [statement summary 持久化](#持久化-statements-summary)功能，该功能默认为关闭。开启该功能后，历史数据不再存储在内存内，而是直接写入磁盘。TiDB server 重启后，历史数据也依然可用。

## 持久化 statements summary

> **警告：**
>
> statements summary 持久化目前为实验特性，不建议在生产环境中使用。该功能可能会在未事先通知的情况下发生变化或删除。如果发现 bug，请在 GitHub 上提 [issue](https://github.com/pingcap/tidb/issues) 反馈。

如[目前的限制](#目前的限制)一节所描述，默认情况下 statements summary 只在内存中维护，一旦 TiDB server 发生重启，所有 statements summary 数据都会丢失。自 v6.6.0 起，TiDB 实验性地提供了配置项 [`tidb_stmt_summary_enable_persistent`](/tidb-configuration-file.md#tidb_stmt_summary_enable_persistent-从-v660-版本开始引入) 来允许用户控制是否开启 statements summary 持久化。

如果要开启 statements summary 持久化，可以在 TiDB 配置文件中添加如下配置：

```toml
[instance]
tidb_stmt_summary_enable_persistent = true
# 以下配置为默认值，可根据需求调整。
# tidb_stmt_summary_filename = "tidb-statements.log"
# tidb_stmt_summary_file_max_days = 3
# tidb_stmt_summary_file_max_size = 64 # MiB
# tidb_stmt_summary_file_max_backups = 0
```

开启 statements summary 持久化后，内存中只维护当前的实时数据，不再维护历史数据。历史数据生成后直接被写入磁盘文件，写入周期参考[参数配置](#参数配置)一节所描述的 `tidb_stmt_summary_refresh_interval`。后续针对 `statements_summary_history` 或 `cluster_statements_summary_history` 表的查询将结合内存和磁盘两处数据返回结果。

> **注意：**
>
> - 当开启持久化后，由于不再于内存中维护历史数据，因此[参数配置](#参数配置)一节所描述的 `tidb_stmt_summary_history_size` 将不再生效，而是由 [`tidb_stmt_summary_file_max_days`](/tidb-configuration-file.md#tidb_stmt_summary_file_max_days-从-v660-版本开始引入)、[`tidb_stmt_summary_file_max_size`](/tidb-configuration-file.md#tidb_stmt_summary_file_max_size-从-v660-版本开始引入) 和 [`tidb_stmt_summary_file_max_backups`](/tidb-configuration-file.md#tidb_stmt_summary_file_max_backups-从-v660-版本开始引入) 这三项配置来决定历史数据在磁盘上的保留数量和时间。
> - `tidb_stmt_summary_refresh_interval` 取值越小，数据写入到磁盘就越实时，但写入磁盘的冗余数据也会随之增多。

## 排查示例

下面用两个示例问题演示如何利用 statement summary 来排查。

### SQL 延迟比较大，是不是服务端的问题？

例如客户端显示 employee 表的点查比较慢，那么可以按 SQL 文本来模糊查询：

```sql
SELECT avg_latency, exec_count, query_sample_text
    FROM information_schema.statements_summary
    WHERE digest_text LIKE 'select * from employee%';
```

结果如下，`avg_latency` 是 1 ms 和 0.3 ms，在正常范围，所以可以判定不是服务端的问题，继而排查客户端或网络问题。

```
+-------------+------------+------------------------------------------+
| avg_latency | exec_count | query_sample_text                        |
+-------------+------------+------------------------------------------+
|     1042040 |          2 | select * from employee where name='eric' |
|      345053 |          3 | select * from employee where id=3100     |
+-------------+------------+------------------------------------------+
2 rows in set (0.00 sec)
```

### 哪类 SQL 的总耗时最高？

假如上午 10:00 到 10:30 的 QPS 明显下降，可以从历史表中找出当时耗时最高的三类 SQL：

```sql
SELECT sum_latency, avg_latency, exec_count, query_sample_text
    FROM information_schema.statements_summary_history
    WHERE summary_begin_time='2020-01-02 10:00:00'
    ORDER BY sum_latency DESC LIMIT 3;
```

结果显示以下三类 SQL 的总延迟最高，所以这些 SQL 需要重点优化。

```
+-------------+-------------+------------+-----------------------------------------------------------------------+
| sum_latency | avg_latency | exec_count | query_sample_text                                                     |
+-------------+-------------+------------+-----------------------------------------------------------------------+
|     7855660 |     1122237 |          7 | select avg(salary) from employee where company_id=2013                |
|     7241960 |     1448392 |          5 | select * from employee join company on employee.company_id=company.id |
|     2084081 |     1042040 |          2 | select * from employee where name='eric'                              |
+-------------+-------------+------------+-----------------------------------------------------------------------+
3 rows in set (0.00 sec)
```

## 表的字段介绍

### `statements_summary` 字段介绍

下面介绍 `statements_summary` 表中各个字段的含义。

SQL 的基础信息：

- `STMT_TYPE`：SQL 语句的类型
- `SCHEMA_NAME`：执行这类 SQL 的当前 schema
- `DIGEST`：这类 SQL 的 digest
- `DIGEST_TEXT`：规一化后的 SQL
- `QUERY_SAMPLE_TEXT`：这类 SQL 的原 SQL 语句，多条语句只取其中一条
- `TABLE_NAMES`：SQL 中涉及的所有表，多张表用 `,` 分隔
- `INDEX_NAMES`：SQL 中使用的索引名，多个索引用 `,` 分隔
- `SAMPLE_USER`：执行这类 SQL 的用户名，多个用户名只取其中一个
- `PLAN_DIGEST`：执行计划的 digest
- `PLAN`：原执行计划，多条语句只取其中一条的执行计划
- `BINARY_PLAN`：以二进制格式编码后的原执行计划，存在多条语句时，只取其中一条语句的执行计划。用 [`SELECT tidb_decode_binary_plan('xxx...')`](/functions-and-operators/tidb-functions.md#tidb_decode_binary_plan) SQL 语句可以解析出具体的执行计划。
- `PLAN_CACHE_HITS`：这类 SQL 语句命中 plan cache 的总次数
- `PLAN_IN_CACHE`：这类 SQL 语句的上次执行是否命中了 plan cache
- `PLAN_CACHE_UNQUALIFIED`：这类 SQL 语句没有命中 plan cache 的次数
- `PLAN_CACHE_UNQUALIFIED_LAST_REASON`：这类 SQL 语句最后一次没有命中 plan cache 的原因

执行时间相关的信息：

- `SUMMARY_BEGIN_TIME`：当前统计的时间段的开始时间
- `SUMMARY_END_TIME`：当前统计的时间段的结束时间
- `FIRST_SEEN`：这类 SQL 的首次出现时间
- `LAST_SEEN`：这类 SQL 的最后一次出现时间

在 TiDB server 上的执行数据：

- `EXEC_COUNT`：这类 SQL 的总执行次数
- `SUM_ERRORS`：执行过程中遇到的 error 的总数
- `SUM_WARNINGS`：执行过程中遇到的 warning 的总数
- `SUM_LATENCY`：这类 SQL 的总延时
- `MAX_LATENCY`：这类 SQL 的最大延时
- `MIN_LATENCY`：这类 SQL 的最小延时
- `AVG_LATENCY`：这类 SQL 的平均延时
- `AVG_PARSE_LATENCY`：解析器的平均延时
- `MAX_PARSE_LATENCY`：解析器的最大延时
- `AVG_COMPILE_LATENCY`：优化器的平均延时
- `MAX_COMPILE_LATENCY`：优化器的最大延时
- `AVG_MEM`：使用的平均内存，单位 byte
- `MAX_MEM`：使用的最大内存，单位 byte
- `AVG_DISK`：使用的平均硬盘空间，单位 byte
- `MAX_DISK`：使用的最大硬盘空间，单位 byte
- `AVG_TIDB_CPU_TIME`：这类 SQL 平均占用 TiDB 服务器 CPU 的时间。该列仅在开启 [Top SQL 特性](/dashboard/top-sql.md)时显示实际值，否则始终显示为 `0`

和 TiKV Coprocessor Task 相关的字段：

- `SUM_COP_TASK_NUM`：发送 Coprocessor 请求的总数
- `MAX_COP_PROCESS_TIME`：cop-task 的最大处理时间
- `MAX_COP_PROCESS_ADDRESS`：执行时间最长的 cop-task 所在地址
- `MAX_COP_WAIT_TIME`：cop-task 的最大等待时间
- `MAX_COP_WAIT_ADDRESS`：等待时间最长的 cop-task 所在地址
- `AVG_PROCESS_TIME`：SQL 在 TiKV 的平均处理时间
- `MAX_PROCESS_TIME`：SQL 在 TiKV 的最大处理时间
- `AVG_WAIT_TIME`：SQL 在 TiKV 的平均等待时间
- `MAX_WAIT_TIME`：SQL 在 TiKV 的最大等待时间
- `AVG_BACKOFF_TIME`：SQL 遇到需要重试的错误时在重试前的平均等待时间
- `MAX_BACKOFF_TIME`：SQL 遇到需要重试的错误时在重试前的最大等待时间
- `AVG_TOTAL_KEYS`：Coprocessor 扫过的 key 的平均数量
- `MAX_TOTAL_KEYS`：Coprocessor 扫过的 key 的最大数量
- `AVG_PROCESSED_KEYS`：Coprocessor 处理的 key 的平均数量。相比 `avg_total_keys`，`avg_processed_keys` 不包含 MVCC 的旧版本。如果 `avg_total_keys` 和 `avg_processed_keys` 相差很大，说明旧版本比较多
- `MAX_PROCESSED_KEYS`：Coprocessor 处理的 key 的最大数量
- `AVG_TIKV_CPU_TIME`：这类 SQL 平均占用 TiKV 服务器 CPU 的时间

和事务相关的字段：

- `AVG_PREWRITE_TIME`：prewrite 阶段消耗的平均时间
- `MAX_PREWRITE_TIME` prewrite 阶段消耗的最大时间
- `AVG_COMMIT_TIME`：commit 阶段消耗的平均时间
- `MAX_COMMIT_TIME`：commit 阶段消耗的最大时间
- `AVG_GET_COMMIT_TS_TIME`：获取 commit_ts 的平均时间
- `MAX_GET_COMMIT_TS_TIME`：获取 commit_ts 的最大时间
- `AVG_COMMIT_BACKOFF_TIME`：commit 时遇到需要重试的错误时在重试前的平均等待时间
- `MAX_COMMIT_BACKOFF_TIME`：commit 时遇到需要重试的错误时在重试前的最大等待时间
- `AVG_RESOLVE_LOCK_TIME`：解决事务的锁冲突的平均时间
- `MAX_RESOLVE_LOCK_TIME`：解决事务的锁冲突的最大时间
- `AVG_LOCAL_LATCH_WAIT_TIME`：本地事务等待的平均时间
- `MAX_LOCAL_LATCH_WAIT_TIME`：本地事务等待的最大时间
- `AVG_WRITE_KEYS`：写入 key 的平均数量
- `MAX_WRITE_KEYS`：写入 key 的最大数量
- `AVG_WRITE_SIZE`：写入的平均数据量，单位 byte
- `MAX_WRITE_SIZE`：写入的最大数据量，单位 byte
- `AVG_PREWRITE_REGIONS`：prewrite 涉及的平均 Region 数量
- `MAX_PREWRITE_REGIONS`：prewrite 涉及的最大 Region 数量
- `AVG_TXN_RETRY`：事务平均重试次数
- `MAX_TXN_RETRY`：事务最大重试次数
- `SUM_BACKOFF_TIMES`：这类 SQL 遇到需要重试的错误后的总重试次数
- `BACKOFF_TYPES`：遇到需要重试的错误时的所有错误类型及每种类型重试的次数，格式为 `类型:次数`。如有多种错误则用 `,` 分隔，例如 `txnLock:2,pdRPC:1`
- `AVG_AFFECTED_ROWS`：平均影响行数
- `PREV_SAMPLE_TEXT`：当 SQL 是 `COMMIT` 时，该字段为 `COMMIT` 的前一条语句；否则该字段为空字符串。当 SQL 是 `COMMIT` 时，按 digest 和 `prev_sample_text` 一起分组，即不同 `prev_sample_text` 的 `COMMIT` 也会分到不同的行

和资源管控相关的字段：

- `AVG_REQUEST_UNIT_WRITE`：执行 SQL 语句平均消耗的写 RU
- `MAX_REQUEST_UNIT_WRITE`：执行 SQL 语句最大消耗的写 RU
- `AVG_REQUEST_UNIT_READ`：执行 SQL 语句平均消耗的读 RU
- `MAX_REQUEST_UNIT_READ`：执行 SQL 语句最大消耗的读 RU
- `AVG_QUEUED_RC_TIME`：执行 SQL 语句等待可用 RU 的平均耗时
- `MAX_QUEUED_RC_TIME`：执行 SQL 语句等待可用 RU 的最大耗时
- `RESOURCE_GROUP`：执行 SQL 语句绑定的资源组

### `statements_summary_evicted` 字段介绍

- `BEGIN_TIME`: 记录的开始时间；
- `END_TIME`: 记录的结束时间；
- `EVICTED_COUNT`：在记录的时间段内 evict 了多少种 SQL。
