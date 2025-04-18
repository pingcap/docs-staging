---
title: TiDB 2.1 GA Release Notes
summary: TiDB 2.1 GA was released on November 30, 2018, with significant improvements in stability, performance, compatibility, and usability. The release includes optimizations in SQL optimizer, SQL executor, statistics, expressions, server, DDL, compatibility, Placement Driver (PD), TiKV, and tools. It also introduces TiDB Lightning for fast full data import. However, TiDB 2.1 does not support downgrading to v2.0.x or earlier due to the adoption of the new storage engine. Additionally, parallel DDL is enabled in TiDB 2.1, so clusters with TiDB version earlier than 2.0.1 cannot upgrade to 2.1 using rolling update. If upgrading from TiDB 2.0.6 or earlier to TiDB 2.1, ongoing DDL operations may slow down the upgrading process.
---

# TiDB 2.1 GA Release Notes

On November 30, 2018, TiDB 2.1 GA is released. See the following updates in this release. Compared with TiDB 2.0, this release has great improvements in stability, performance, compatibility, and usability.

## TiDB

+ SQL Optimizer

    - Optimize the selection range of `Index Join` to improve the execution performance

    - Optimize the selection of outer table for `Index Join` and use the table with smaller estimated value of Row Count the as the outer table

    - Optimize Join Hint `TIDB_SMJ` so that Merge Join can be used even without proper index available

    - Optimize Join Hint `TIDB_INLJ` to specify the Inner table to Join

    - Optimize correlated subquery, push down Filter, and extend the index selection range, to improve the efficiency of some queries by orders of magnitude

    - Support using Index Hint and Join Hint in the `UPDATE` and `DELETE` statement

    - Support pushing down more functions: `ABS`/`CEIL`/`FLOOR`/`IS TRUE`/`IS FALSE`

    - Optimize the constant folding algorithm for the `IF` and `IFNULL` built-in functions

    - Optimize the output of the `EXPLAIN` statement and use hierarchy structure to show the relationship between operators

+ SQL executor

    - Refactor all the aggregation functions and improve execution efficiency of the `Stream` and `Hash` aggregation operators

    - Implement the parallel `Hash Aggregate` operators and improve the computing performance by 350% in some scenarios

    - Implement the parallel `Project` operators and improve the performance by 74% in some scenarios

    - Read the data of the Inner table and Outer table of `Hash Join` concurrently to improve the execution performance

    - Optimize the execution speed of the `REPLACE INTO` statement and increase the performance nearly by 10 times

    - Optimize the memory usage of the time data type and decrease the memory usage of the time data type by fifty percent

    - Optimize the point select performance and improve the point select efficiency result of Sysbench by 60%

    - Improve the performance of TiDB on inserting or updating wide tables by 20 times

    - Support configuring the memory upper limit of a single statement in the configuration file

    - Optimize the execution of Hash Join, if the Join type is Inner Join or Semi Join and the inner table is empty, return the result without reading data from the outer table

    - Support using the [`EXPLAIN ANALYZE` statement](/sql-statements/sql-statement-explain-analyze.md) to check the runtime statistics including the execution time and the number of returned rows of each operator

+ Statistics

    - Support enabling auto ANALYZE statistics only during certain period of the day

    - Support updating the table statistics automatically according to the feedback of the queries

    - Support configuring the number of buckets in the histogram using the `ANALYZE TABLE WITH BUCKETS` statement

    - Optimize the Row Count estimation algorithm using histogram for mixed queries of equality query and range queries

+ Expressions

    + Support following built-in function:

        - `json_contains`

        - `json_contains_path`

        - `encode/decode`

+ Server

    - Support queuing the locally conflicted transactions within tidb-server instance to optimize the performance of conflicted transactions

    - Support Server Side Cursor

    + Add the [HTTP API](https://github.com/pingcap/tidb/blob/release-2.1/docs/tidb_http_api.md)

        - Scatter the distribution of table Regions in the TiKV cluster

        - Control whether to open the `general log`

        - Support modifying the log level online

        - Check the TiDB cluster information

    - [Add the `auto_analyze_ratio` system variables to control the ratio of Analyze](/faq/sql-faq.md#whats-the-trigger-strategy-for-auto-analyze-in-tidb)

    - [Add the `tidb_retry_limit` system variable to control the automatic retry times of transactions](/system-variables.md#tidb_retry_limit)

    - [Add the `tidb_disable_txn_auto_retry` system variable to control whether the transaction retries automatically](/system-variables.md#tidb_disable_txn_auto_retry)

    - [Support using`admin show slow` statement to obtain the slow queries](/identify-slow-queries.md#admin-show-slow-command)

    - [Add the `tidb_slow_log_threshold` environment variable to set the threshold of slow log automatically](/system-variables.md#tidb_slow_log_threshold)

    - [Add the `tidb_query_log_max_len` environment variable to set the length of the SQL statement to be truncated in the log dynamically](/system-variables.md#tidb_query_log_max_len)

+ DDL

    - Support the parallel execution of the Add index statement and other statements to avoid the time consuming Add index operation blocking other operations

    - Optimize the execution speed of `ADD INDEX` and improve it greatly in some scenarios

    - Support the `select tidb_is_ddl_owner()` statement to facilitate deciding whether TiDB is `DDL Owner`

    - Support the `ALTER TABLE FORCE` syntax

    - Support the `ALTER TABLE RENAME KEY TO` syntax

    - Add the table name and database name in the output information of `admin show ddl jobs`

    - [Support using the `ddl/owner/resign` HTTP interface to release the DDL owner and start electing a new DDL owner](https://github.com/pingcap/tidb/blob/release-2.1/docs/tidb_http_api.md)

+ Compatibility

    - Support more MySQL syntaxes

    - Make the `BIT` aggregate function support the `ALL` parameter

    - Support the `SHOW PRIVILEGES` statement

    - Support the `CHARACTER SET` syntax in the `LOAD DATA` statement

    - Support the `IDENTIFIED WITH` syntax in the `CREATE USER` statement

    - Support the `LOAD DATA IGNORE LINES` statement

    - The `Show ProcessList` statement returns more accurate information

## Placement Driver (PD)

+ Optimize availability

    - Introduce the version control mechanism and support rolling update of the cluster compatibly

    - [Enable `Raft PreVote`](https://github.com/pingcap/pd/blob/5c7b18cf3af91098f07cf46df0b59fbf8c7c5462/conf/config.toml#L22) among PD nodes to avoid leader reelection when network recovers after network isolation

    - Enable `raft learner` by default to lower the risk of unavailable data caused by machine failure during scheduling

    - TSO allocation is no longer affected by the system clock going backwards

    - Support the `Region merge` feature to reduce the overhead brought by metadata

+ Optimize the scheduler

    - Optimize the processing of Down Store to speed up making up replicas

    - Optimize the hotspot scheduler to improve its adaptability when traffic statistics information jitters

    - Optimize the start of Coordinator to reduce the unnecessary scheduling caused by restarting PD

    - Optimize the issue that Balance Scheduler schedules small Regions frequently

    - Optimize Region merge to consider the number of rows within the Region

    - [Add more commands to control the scheduling policy](/pd-control.md#config-show--set-option-value--placement-rules)

    - Improve [PD simulator](https://github.com/pingcap/pd/tree/release-2.1/tools/pd-simulator) to simulate the scheduling scenarios

+ API and operation tools

    - Add the [`GetPrevRegion` interface](https://github.com/pingcap/kvproto/blob/8e3f33ac49297d7c93b61a955531191084a2f685/proto/pdpb.proto#L40) to support the `TiDB reverse scan` feature

    - Add the [`BatchSplitRegion` interface](https://github.com/pingcap/kvproto/blob/8e3f33ac49297d7c93b61a955531191084a2f685/proto/pdpb.proto#L54) to speed up TiKV Region splitting

    - Add the [`GCSafePoint` interface](https://github.com/pingcap/kvproto/blob/8e3f33ac49297d7c93b61a955531191084a2f685/proto/pdpb.proto#L64-L66) to support distributed GC in TiDB

    - Add the [`GetAllStores` interface](https://github.com/pingcap/kvproto/blob/8e3f33ac49297d7c93b61a955531191084a2f685/proto/pdpb.proto#L32), to support distributed GC in TiDB

    + pd-ctl supports:
        - [using statistics for Region split](/pd-control.md#operator-check--show--add--remove)

        - [calling `jq` to format the JSON output](/pd-control.md#jq-formatted-json-output-usage)

        - [checking the Region information of the specified store](/pd-control.md#region-store-store_id)

        - [checking topN Region list sorted by versions](/pd-control.md#region-topconfver-limit)

        - [checking topN Region list sorted by size](/pd-control.md#region-topsize-limit)

        - [more precise TSO encoding](/pd-control.md#tso)

    - [pd-recover](/pd-recover.md) doesn't need to provide the `max-replica` parameter

+ Metrics

    - Add related metrics for `Filter`

    - Add metrics about etcd Raft state machine

+ Performance

    - Optimize the performance of Region heartbeat to reduce the memory overhead brought by heartbeats

    - Optimize the Region tree performance

    - Optimize the performance of computing hotspot statistics

## TiKV

+ Coprocessor

    - Add more built-in functions

    - [Add Coprocessor `ReadPool` to improve the concurrency in processing the requests](https://github.com/tikv/rfcs/blob/master/text/0010-read-pool.md)

    - Fix the time function parsing issue and the time zone related issues

    - Optimize the memory usage for pushdown aggregation computing

+ Transaction

    - Optimize the read logic and memory usage of MVCC to improve the performance of the scan operation and the performance of full table scan is 1 time better than that in TiDB 2.0

    - Fold the continuous Rollback records to ensure the read performance

    - [Add the `UnsafeDestroyRange` API to support to collecting space for the dropping table/index](https://github.com/tikv/rfcs/blob/master/text/0002-unsafe-destroy-range.md)

    - Separate the GC module to reduce the impact on write

    - Add the `upper bound` support in the `kv_scan` command

+ Raftstore

    - Improve the snapshot writing process to avoid RocksDB stall

    - [Add the `LocalReader` thread to process read requests and reduce the delay for read requests](https://github.com/tikv/rfcs/pull/17)

    - [Support `BatchSplit` to avoid large Region brought by large amounts of write](https://github.com/tikv/rfcs/pull/6)

    - Support `Region Split` according to statistics to reduce the I/O overhead

    - Support `Region Split` according to the number of keys to improve the concurrency of index scan

    - Improve the Raft message process to avoid unnecessary delay brought by `Region Split`

    - Enable the `PreVote` feature by default to reduce the impact of network isolation on services

+ Storage Engine

    - Fix the `CompactFiles`bug in RocksDB and reduce the impact on importing data using Lightning

    - Upgrade RocksDB to v5.15 to fix the possible issue of snapshot file corruption

    - Improve `IngestExternalFile` to avoid the issue that flush could block write

+ tikv-ctl

    - [Add the `ldb` command to diagnose RocksDB related issues](https://tikv.org/docs/3.0/reference/tools/tikv-ctl/#ldb-command)

    - The `compact` command supports specifying whether to compact data in the bottommost level

## Tools

- Fast full import of large amounts of data: [TiDB Lightning](/tidb-lightning/tidb-lightning-overview.md)

- Support new [TiDB Binlog](https://docs-archive.pingcap.com/tidb/v2.1/tidb-binlog-overview)

## Upgrade caveat

- TiDB 2.1 does not support downgrading to v2.0.x or earlier due to the adoption of the new storage engine

+ Parallel DDL is enabled in TiDB 2.1, so the clusters with TiDB version earlier than 2.0.1 cannot upgrade to 2.1 using rolling update. You can choose either of the following two options:

    - Stop the cluster and upgrade to 2.1 directly
    - Roll update to 2.0.1 or later 2.0.x versions, and then roll update to the 2.1 version

- If you upgrade from TiDB 2.0.6 or earlier to TiDB 2.1, check if there is any ongoing DDL operation, especially the time consuming `Add Index` operation, because the DDL operations slow down the upgrading process. If there is ongoing DDL operation, wait for the DDL operation finishes and then roll update.
