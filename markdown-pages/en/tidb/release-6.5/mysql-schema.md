---
title: mysql Schema
summary: Learn about the TiDB system tables.
---

# `mysql` Schema

The `mysql` schema contains TiDB system tables. The design is similar to the `mysql` schema in MySQL, where tables such as `mysql.user` can be edited directly. It also contains a number of tables which are extensions to MySQL.

## Grant system tables

These system tables contain grant information about user accounts and their privileges:

- `user`: user accounts, global privileges, and other non-privilege columns
- `db`: database-level privileges
- `tables_priv`: table-level privileges
- `columns_priv`: column-level privileges
- `password_history`: password change history
- `default_roles`: the default roles for a user
- `global_grants`: dynamic privileges
- `global_priv`: the authentication information based on certificates
- `role_edges`: the relationship between roles

## Server-side help system tables

Currently, the `help_topic` is NULL.

## Statistics system tables

- `stats_buckets`: the buckets of statistics
- `stats_histograms`: the histograms of statistics
- `stats_top_n`: the TopN of statistics
- `stats_meta`: the meta information of tables, such as the total number of rows and updated rows
- `stats_extended`: extended statistics, such as the order correlation between columns
- `stats_feedback`: the query feedback of statistics
- `stats_fm_sketch`: the FMSketch distribution of the histogram of the statistics column
- `stats_table_locked`: information about the locked statistics
- `stats_meta_history`: the meta information in the historical statistics
- `stats_history`: the other information in the historical statistics
- `analyze_options`: the default `analyze` options for each table
- `column_stats_usage`: the usage of column statistics
- `schema_index_usage`: the usage of indexes
- `analyze_jobs`: the ongoing statistics collection tasks and the history task records within the last 7 days

## Execution plan-related system tables

- `bind_info`: the binding information of execution plans
- `capture_plan_baselines_blacklist`: the blocklist for the automatic binding of the execution plan

## System tables related to PLAN REPLAYER

- `plan_replayer_status`: the [`PLAN REPLAYER CAPTURE`](https://docs.pingcap.com/tidb/stable/sql-plan-replayer#use-plan-replayer-capture) tasks registered by the user
- `plan_replayer_task`: the results of [`PLAN REPLAYER CAPTURE`](https://docs.pingcap.com/tidb/stable/sql-plan-replayer#use-plan-replayer-capture) tasks

## GC worker system tables

- `gc_delete_range`: the KV range to be deleted
- `gc_delete_range_done`: the deleted KV range

## System tables related to cached tables

- `table_cache_meta`: stores the metadata of cached tables

## System tables related to metadata locks

* `tidb_mdl_view`: a view of metadata locks. You can use it to view information about the currently blocked DDL statements
* `tidb_mdl_info`: used internally by TiDB to synchronize metadata locks across nodes

## System tables related to DDL statements

* `tidb_ddl_history`: the history records of DDL statements
* `tidb_ddl_jobs`: the metadata of DDL statements that are currently being executed by TiDB
* `tidb_ddl_reorg`: the metadata of physical DDL statements (such as adding indexes) that are currently being executed by TiDB

## Miscellaneous system tables

- `GLOBAL_VARIABLES`: global system variable table

<CustomContent platform="tidb">

- `tidb`: to record the version information when TiDB executes `bootstrap`
- `expr_pushdown_blacklist`: the blocklist for expression pushdown
- `opt_rule_blacklist`: the blocklist for logical optimization rules
- `table_cache_meta`: the metadata of cached tables
- `advisory_locks`: information related to [Locking functions](/functions-and-operators/locking-functions.md)

</CustomContent>
