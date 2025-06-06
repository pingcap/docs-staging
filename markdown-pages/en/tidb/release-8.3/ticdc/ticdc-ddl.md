---
title: Changefeed DDL Replication
summary: Learn about the DDL statements supported by TiCDC and some special cases.
---

# Changefeed DDL Replication

This document describes the rules and special cases of DDL replication in TiCDC.

## DDL allow list

Currently, TiCDC uses an allow list to determine whether to replicate a DDL statement. Only the DDL statements in the allow list are replicated to the downstream. The DDL statements not in the allow list are not replicated.

The allow list of DDL statements supported by TiCDC is as follows:

- create database
- drop database
- create table
- drop table
- add column
- drop column
- create index / add index
- drop index
- truncate table
- modify column
- rename table
- alter column default value
- alter table comment
- rename index
- add partition
- drop partition
- truncate partition
- create view
- drop view
- alter table character set
- alter database character set
- recover table
- add primary key
- drop primary key
- rebase auto id
- alter table index visibility
- exchange partition
- reorganize partition
- alter table ttl
- alter table remove ttl

## DDL replication considerations

### Asynchronous execution of `ADD INDEX` and `CREATE INDEX` DDLs

When the downstream is TiDB, TiCDC executes `ADD INDEX` and `CREATE INDEX` DDL operations asynchronously to minimize the impact on changefeed replication latency. This means that, after replicating `ADD INDEX` and `CREATE INDEX` DDLs to the downstream TiDB for execution, TiCDC returns immediately without waiting for the completion of the DDL execution. This avoids blocking subsequent DML executions.

> **Note:**
>
> - If the execution of certain downstream DMLs relies on indexes that have not completed replication, these DMLs might be executed slowly, thereby affecting TiCDC replication latency.
> - Before replicating DDLs to the downstream, if a TiCDC node crashes or if the downstream is performing other write operations, the DDL replication has an extremely low probability of failure. You can check the downstream to see whether that occurs.

### DDL replication considerations for renaming tables

Due to the lack of some context during the replication process, TiCDC has some constraints on the replication of `RENAME TABLE` DDLs.

#### Rename a single table in a DDL statement

If a DDL statement renames a single table, TiCDC only replicates the DDL statement when the old table name matches the filter rule. The following is an example.

Assume that the configuration file of your changefeed is as follows:

```toml
[filter]
rules = ['test.t*']
```

TiCDC processes this type of DDL as follows:

| DDL | Whether to replicate | Reason for the handling |
| --- | --- | --- |
| `RENAME TABLE test.t1 TO test.t2` | Replicate | `test.t1` matches the filter rule |
| `RENAME TABLE test.t1 TO ignore.t1` | Replicate | `test.t1` matches the filter rule |
| `RENAME TABLE ignore.t1 TO ignore.t2` | Ignore | `ignore.t1` does not match the filter rule |
| `RENAME TABLE test.n1 TO test.t1` | Report an error and exit the replication | The old table name `test.n1` does not match the filter rule, but the new table name `test.t1` matches the filter rule. This operation is illegal. In this case, refer to the error message for handling. |
| `RENAME TABLE ignore.t1 TO test.t1` | Report an error and exit the replication | Same reason as above. |

#### Rename multiple tables in a DDL statement

If a DDL statement renames multiple tables, TiCDC replicates the DDL statement only when the **old database name**, **old table names**, and **new database name** all match the filter rule.

In addition, TiCDC does not support the `RENAME TABLE` DDL that swaps the table names. The following is an example.

Assume that the configuration file of your changefeed is as follows:

```toml
[filter]
rules = ['test.t*']
```

TiCDC processes this type of DDL as follows:

| DDL | Whether to replicate | Reason for the handling |
| --- | --- | --- |
| `RENAME TABLE test.t1 TO test.t2, test.t3 TO test.t4` | Replicate | All database names and table names match the filter rule. |
| `RENAME TABLE test.t1 TO test.ignore1, test.t3 TO test.ignore2` | Replicate | The old database name, the old table names, and the new database name match the filter rule. |
| `RENAME TABLE test.t1 TO ignore.t1, test.t2 TO test.t22;` | Report an error | The new database name `ignore` does not match the filter rule. |
| `RENAME TABLE test.t1 TO test.t4, test.t3 TO test.t1, test.t4 TO test.t3;` | Report an error | The `RENAME TABLE` DDL swaps the names of `test.t1` and `test.t3` in one DDL statement, which TiCDC cannot handle correctly. In this case, refer to the error message for handling. |

### DDL statement considerations

When executing cross-database DDL statements (such as `CREATE TABLE db1.t1 LIKE t2`) in the upstream, it is recommended that you explicitly specify all relevant database names in DDL statements (such as `CREATE TABLE db1.t1 LIKE db2.t2`). Otherwise, cross-database DDL statements might not be executed correctly in the downstream due to the lack of database name information.

### Notes on using event filter rules to filter DDL events

If a filtered DDL statement involves table creation or deletion, TiCDC only filters out the DDL statement without affecting the replication behavior of DML statements. The following is an example.

Assume that the configuration file of your changefeed is as follows:

```toml
[filter]
rules = ['test.t*']

matcher = ["test.t1"] # This filter rule applies only to the t1 table in the test database.
ignore-event = ["create table", "drop table", "truncate table", "rename table"]
```

| DDL | DDL behavior | DML behavior | Explanation |
| --- | --- | --- | --- |
| `CREATE TABLE test.t1 (id INT, name VARCHAR(50));` | Ignore | Replicate | `test.t1` matches the event filter rule, so the `CREATE TABLE` event is ignored. The replication of DML events remains unaffected. |
| `CREATE TABLE test.t2 (id INT, name VARCHAR(50));` | Replicate | Replicate | `test.t2` does not match the event filter rule. |
| `CREATE TABLE test.ignore (id INT, name VARCHAR(50));` | Ignore | Ignore | `test.ignore` matches the event filter rule, so both DDL and DML events are ignored. |
| `DROP TABLE test.t1;` | Ignore | - | `test.t1` matches the event filter rule, so the `DROP TABLE` event is ignored. Because the table is deleted, TiCDC no longer replicates DML events for `t1`. |
| `TRUNCATE TABLE test.t1;` | Ignore | Replicate | `test.t1` matches the event filter rule, so the `TRUNCATE TABLE` event is ignored. The replication of DML events remains unaffected. |
| `RENAME TABLE test.t1 TO test.t2;` | Ignore | Replicate | `test.t1` matches the event filter rule, so the `RENAME TABLE` event is ignored. The replication of DML events remains unaffected. |
| `RENAME TABLE test.t1 TO test.ignore;` | Ignore | Ignore | `test.t1` matches the event filter rule, so the `RENAME TABLE` event is ignored. `test.ignore` matches the event filter rule, so both DDL and DML events are ignored. |

> **Note:**
>
> - When replicating data to a database, use the event filter to filter DDL events with caution. Ensure that the upstream and downstream database schemas remain consistent during replication. Otherwise, TiCDC might report errors or cause undefined replication behavior.
> - For versions earlier than v6.5.8, v7.1.4, and v7.5.1, using the event filter to filter DDL events involving table creation or deletion affects DML replication. It is not recommended to use this feature in these versions.
