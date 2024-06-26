---
title: TiDB Accelerated Table Creation
aliases: ['/tidb/stable/ddl-v2/']
summary: Learn the concept, principles, and implementation details of performance optimization for creating tables in TiDB.
---

# TiDB Accelerated Table Creation

TiDB v7.6.0 introduces the system variable [`tidb_ddl_version`](https://docs.pingcap.com/tidb/v7.6/system-variables#tidb_enable_fast_create_table-new-in-v800) to support accelerating table creation, which improves the efficiency of bulk table creation. Starting from v8.0.0, this system variable is renamed to [`tidb_enable_fast_create_table`](/system-variables.md#tidb_enable_fast_create_table-new-in-v800).

TiDB uses the online asynchronous schema change algorithm to change the metadata. All DDL jobs are submitted to the `mysql.tidb_ddl_job` table, and the owner node pulls the DDL job to execute. After executing each phase of the online DDL algorithm, the DDL job is marked as completed and moved to the `mysql.tidb_ddl_history` table. Therefore, DDL statements can only be executed on the owner node and cannot be linearly extended.

However, for some DDL statements, it is not necessary to strictly follow the online DDL algorithm. For example, the `CREATE TABLE` statement only has two states for the job: `none` and `public`. Therefore, TiDB can simplify the execution process of DDL, and executes the `CREATE TABLE` statement on a non-owner node to accelerate table creation.

> **Warning:**
>
> This feature is currently an experimental feature and it is not recommended to use in a production environment. This feature might change or be removed without prior notice. If you find a bug, please give feedback by raising an [issue](https://github.com/pingcap/tidb/issues) on GitHub.

## Compatibility with TiDB tools

- [TiCDC](https://docs.pingcap.com/tidb/stable/ticdc-overview) does not support replicating the tables that are created by `tidb_enable_fast_create_table`.

## Limitation

You can now use performance optimization for table creation only in the [`CREATE TABLE`](/sql-statements/sql-statement-create-table.md) statement, and this statement must not include any foreign key constraints.

## Use `tidb_enable_fast_create_table` to accelerate table creation

You can enable or disable performance optimization for creating tables by specifying the value of the system variable [`tidb_enable_fast_create_table`](/system-variables.md#tidb_enable_fast_create_table-new-in-v800).

To enable performance optimization for creating tables, set the value of this variable to `ON`:

```sql
SET GLOBAL tidb_enable_fast_create_table = ON;
```

To disable performance optimization for creating tables, set the value of this variable to `OFF`:

```sql
SET GLOBAL tidb_enable_fast_create_table = OFF;
```

## Implementation principle

The detailed implementation principle of performance optimization for table creation is as follows:

1. Create a `CREATE TABLE` Job.

   The corresponding DDL Job is generated by parsing the `CREATE TABLE` statement.

2. Execute the `CREATE TABLE` job.

   The TiDB node that receives the `CREATE TABLE` statement executes it directly, and then persists the table structure to TiKV. At the same time, the `CREATE TABLE` job is marked as completed and inserted into the `mysql.tidb_ddl_history` table.

3. Synchronize the table information.

   TiDB notifies other nodes to synchronize the newly created table structure.
