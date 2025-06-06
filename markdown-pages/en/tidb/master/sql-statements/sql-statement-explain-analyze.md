---
title: EXPLAIN ANALYZE | TiDB SQL Statement Reference
summary: An overview of the usage of EXPLAIN ANALYZE for the TiDB database.
aliases: ['/docs/dev/sql-statements/sql-statement-explain-analyze/','/docs/dev/reference/sql/statements/explain-analyze/']
---

# EXPLAIN ANALYZE

The `EXPLAIN ANALYZE` statement works similar to `EXPLAIN`, with the major difference being that it will actually execute the statement. This allows you to compare the estimates used as part of query planning to actual values encountered during execution. If the estimates differ significantly from the actual values, you should consider running `ANALYZE TABLE` on the affected tables.

> **Note:**
>
> When you use `EXPLAIN ANALYZE` to execute DML statements, modification to data is normally executed. Currently, the execution plan for DML statements **cannot** be shown yet.

## Synopsis

```ebnf+diagram
ExplainSym ::=
    'EXPLAIN'
|   'DESCRIBE'
|    'DESC'

ExplainStmt ::=
    ExplainSym ( TableName ColumnName? | 'ANALYZE'? ExplainableStmt | 'FOR' 'CONNECTION' NUM | 'FORMAT' '=' ( stringLit | ExplainFormatType ) ( 'FOR' 'CONNECTION' NUM | ExplainableStmt ) )

ExplainableStmt ::=
    SelectStmt
|   DeleteFromStmt
|   UpdateStmt
|   InsertIntoStmt
|   ReplaceIntoStmt
|   UnionStmt
```

## EXPLAIN ANALYZE output format

Different from `EXPLAIN`, `EXPLAIN ANALYZE` executes the corresponding SQL statement, records its runtime information, and returns the information together with the execution plan. Therefore, you can regard `EXPLAIN ANALYZE` as an extension of the `EXPLAIN` statement. Compared to `EXPLAIN` (for debugging query execution), the return results of `EXPLAIN ANALYZE` also include columns of information such as `actRows`, `execution info`, `memory`, and `disk`. The details of these columns are shown as follows:

| attribute name          | description |
|:----------------|:---------------------------------|
| `actRows`       | Number of rows output by the operator. |
| `execution info`  | Execution information of the operator. `time` represents the total `wall time` from entering the operator to leaving the operator, including the total execution time of all sub-operators. If the operator is called multiple times by the parent operator (in loops), then the time refers to the accumulated time. `loops` is the number of times the current operator is called by the parent operator. `open` represents the time spent initializing the operator. `close` refers to the time taken from when the operator finishes processing data to when it ends execution. The `time` value includes both `open` and `close` time. When the operator is executed concurrently, `execution info` shows the sum of all used `wall time`. In this case, `time`, `open`, and `close` are replaced with `total_time`, `total_open`, and `total_close`. |
| `memory`  | Maximum memory space occupied by the operator. |
| `disk`  | Maximum disk space occupied by the operator. |

## Examples


```sql
CREATE TABLE t1 (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, c1 INT NOT NULL);
```

```sql
Query OK, 0 rows affected (0.12 sec)
```


```sql
INSERT INTO t1 (c1) VALUES (1), (2), (3);
```

```sql
Query OK, 3 rows affected (0.02 sec)
Records: 3  Duplicates: 0  Warnings: 0
```


```sql
EXPLAIN ANALYZE SELECT * FROM t1 WHERE id = 1;
```

```sql
+-------------+---------+---------+------+---------------+----------------------------------------------------------------+---------------+--------+------+
| id          | estRows | actRows | task | access object | execution info                                                 | operator info | memory | disk |
+-------------+---------+---------+------+---------------+----------------------------------------------------------------+---------------+--------+------+
| Point_Get_1 | 1.00    | 1       | root | table:t1      | time:757.205µs, loops:2, Get:{num_rpc:1, total_time:697.051µs} | handle:1      | N/A    | N/A  |
+-------------+---------+---------+------+---------------+----------------------------------------------------------------+---------------+--------+------+
1 row in set (0.01 sec)
```


```sql
EXPLAIN ANALYZE SELECT * FROM t1;
```

```sql
+-------------------+----------+---------+-----------+---------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------------------------------+-----------+------+
| id                | estRows  | actRows | task      | access object | execution info                                                                                                                                                                                                                            | operator info                  | memory    | disk |
+-------------------+----------+---------+-----------+---------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------------------------------+-----------+------+
| TableReader_5     | 10000.00 | 3       | root      |               | time:278.2µs, loops:2, cop_task: {num: 1, max: 437.6µs, proc_keys: 3, copr_cache_hit_ratio: 0.00}, rpc_info:{Cop:{num_rpc:1, total_time:423.9µs}}                                                                                         | data:TableFullScan_4           | 251 Bytes | N/A  |
| └─TableFullScan_4 | 10000.00 | 3       | cop[tikv] | table:t1      | tikv_task:{time:0s, loops:1}, scan_detail: {total_process_keys: 3, total_process_keys_size: 111, total_keys: 4, rocksdb: {delete_skipped_count: 0, key_skipped_count: 3, block: {cache_hit_count: 0, read_count: 0, read_byte: 0 Bytes}}} | keep order:false, stats:pseudo | N/A       | N/A  |
+-------------------+----------+---------+-----------+---------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+--------------------------------+-----------+------+
2 rows in set (0.00 sec)
```

## Execution information of operators

In addition to the basic `time`, `open`, `close` and `loop` execution information, `execution info` also contains operator-specific execution information, which mainly includes the time consumed for the operator to send RPC requests and the duration of other steps.

### Point_Get

The execution information from a `Point_Get` operator will typically contain the following information:

- `Get:{num_rpc:1, total_time:697.051µs}`: The number of the `Get` RPC requests (`num_rpc`) sent to TiKV and the total duration (`total_time`) of all RPC requests.
- `ResolveLock:{num_rpc:1, total_time:12.117495ms}`: If TiDB encounters a lock when reading data, it has to resolve the lock first, which generally occurs in the scenario of read-write conflict. This information indicates the duration of resolving locks.
- `regionMiss_backoff:{num:11, total_time:2010 ms},tikvRPC_backoff:{num:11, total_time:10691 ms}`: When an RPC request fails, TiDB will wait the backoff time before retrying the request. Backoff statistics include the type of backoff (such as `regionMiss` and `tikvRPC`), the total waiting time (`total_time`), and the total number of backoffs (`num`).

### Batch_Point_Get

The execution information of the `Batch_Point_Get` operator is similar to that of the `Point_Get` operator, but `Batch_Point_Get` generally sends `BatchGet` RPC requests to TiKV to read data.

`BatchGet:{num_rpc:2, total_time:83.13µs}`: The number of RPC requests (`num_rpc`) of the `BatchGet` type sent to TiKV and the total time consumed (`total_time`) for all RPC requests.

### TableReader

The execution information of a `TableReader` operator is typically as follows:

```
cop_task: {num: 6, max: 1.07587ms, min: 844.312µs, avg: 919.601µs, p95: 1.07587ms, max_proc_keys: 16, p95_proc_keys: 16, tot_proc: 1ms, tot_wait: 1ms, copr_cache_hit_ratio: 0.00}, rpc_info:{Cop:{num_rpc:6, total_time:5.313996ms}}
```

- `cop_task`: Contains the execution information of `cop` tasks. For example:
    - `num`: The number of cop tasks.
    - `max`, `min`, `avg`, `p95`: The maximum, minimum, average, and P95 values of the execution time consumed for executing cop tasks.
    - `max_proc_keys` and `p95_proc_keys`: The maximum and P95 key-values scanned by TiKV in all cop tasks. If the difference between the maximum value and the P95 value is large, the data distribution might be imbalanced.
    - `copr_cache_hit_ratio`: The hit rate of Coprocessor Cache for `cop` task requests.
- `rpc_info`: The total number and total time of RPC requests sent to TiKV aggregated by request type.
- `backoff`: Contains different types of backoff and the total waiting time of backoff.

### Insert

The execution information of an `Insert` operator is typically as follows:

```
prepare:109.616µs, check_insert:{total_time:1.431678ms, mem_insert_time:667.878µs, prefetch:763.8µs, rpc:{BatchGet:{num_rpc:1, total_time:699.166µs},Get:{num_rpc:1, total_time:378.276µs }}}
```

- `prepare`: The time consumed for preparing to write, including expression, default value and auto-increment value calculations.
- `check_insert`: This information generally appears in `insert ignore` and `insert on duplicate` statements, including conflict checking and the time consumed for writing data to TiDB transaction cache. Note that this time consumption does not include the time consumed for transaction commit. It contains the following information:
    - `total_time`: The total time spent on the `check_insert` step.
    - `mem_insert_time`: The time consumed for writing data to the TiDB transaction cache.
    - `prefetch`: The duration of retrieving the data that needs to be checked for conflicts from TiKV. This step sends a `Batch_Get` RPC request to TiKV to retrieve data.
    - `rpc`: The total time consumed for sending RPC requests to TiKV, which generally includes two types of RPC time, `BatchGet` and `Get`, among which:
        - `BatchGet` RPC request is sent in the `prefetch` step.
        - `Get` RPC request is sent when the `insert on duplicate` statement executes `duplicate update`.
- `backoff`: Contains different types of backoff and the total waiting time of backoff.

### IndexJoin

The `IndexJoin` operator has 1 outer worker and N inner workers for concurrent execution. The join result preserves the order of the outer table. The detailed execution process is as follows:

1. The outer worker reads N outer rows, then wraps it into a task, and sends it to the result channel and the inner worker channel.
2. The inner worker receives the task, build key ranges from the task, and fetches inner rows according to the key ranges. It then builds the inner row hash table.
3. The main `IndexJoin` thread receives the task from the result channel and waits for the inner worker to finish handling the task.
4. The main `IndexJoin` thread joins each outer row by looking up to the inner rows' hash table.

The `IndexJoin` operator contains the following execution information:

```
inner:{total:4.297515932s, concurrency:5, task:17, construct:97.96291ms, fetch:4.164310088s, build:35.219574ms}, probe:53.574945ms
```

- `Inner`: The execution information of inner worker:
    - `total`: The total time consumed by the inner worker.
    - `concurrency`: The number of concurrent inner workers.
    - `task`: The total number of tasks processed by the inner worker.
    - `construct`: The preparation time before the inner worker reads the inner table rows corresponding to the task.
    - `fetch`: The total time consumed for it takes for the inner worker to read inner table rows.
    - `Build`: The total time consumed for it takes for the inner worker to construct the hash table of the corresponding inner table rows.
- `probe`: The total time consumed by the main `IndexJoin` thread to perform join operations with the hash table of the outer table rows and the inner table rows.

### IndexHashJoin

The execution process of the `IndexHashJoin` operator is similar to that of the `IndexJoin` operator. `IndexHashJoin` operator also has 1 outer worker and N inner workers to execute in parallel, but the output order is not guaranteed to be consistent with that of the outer table. The detailed execution process is as follows:

1. The outer worker reads N outer rows, builds a task, and sends it to the inner worker channel.
2. The inner worker receives the tasks from the inner worker channel and performs the following three operations in order for every task:
   a. Build a hash table from the outer rows
   b. Build key ranges from outer rows and fetches inner rows
   c. Probe the hash table and sends the join result to the result channel. Note: step a and step b are running concurrently.
3. The main thread of `IndexHashJoin` receives the join results from the result channel.

The `IndexHashJoin` operator contains the following execution information:

```sql
inner:{total:4.429220003s, concurrency:5, task:17, construct:96.207725ms, fetch:4.239324006s, build:24.567801ms, join:93.607362ms}
```

- `Inner`: the execution information of inner worker:
    - `total`: the total time consumed by the inner worker.
    - `concurrency`: the number of inner workers.
    - `task`: The total number of tasks processed by the inner worker.
    - `construct`: The preparation time before the inner worker reads the inner table rows.
    - `fetch`: The total time consumed for inner worker to read inner table rows.
    - `Build`: The total time consumed for inner worker to construct the hash table of the outer table rows.
    - `join`:  The total time consumed for inner worker to do join with the inner table rows and the hash table of outer table rows.

### HashJoin

The HashJoin operator has two versions: HashJoinV1 and HashJoinV2. You can specify the desired version using the [`tidb_hash_join_version`](/system-variables.md#tidb_hash_join_version-new-in-v840) system variable. The following sections describe the execution process of each version respectively.

#### HashJoinv1

The `HashJoin` operator has an inner worker, an outer worker, and N join workers. The detailed execution process is as follows:

1. The inner worker reads inner table rows and constructs a hash table.
2. The outer worker reads the outer table rows, then wraps it into a task and sends it to the join worker.
3. The join worker waits for the hash table construction in step 1 to finish.
4. The join worker uses the outer table rows and hash table in the task to perform join operations, and then sends the join result to the result channel.
5. The main thread of `HashJoin` receives the join result from the result channel.

The `HashJoin` operator contains the following execution information:

```
build_hash_table:{total:146.071334ms, fetch:110.338509ms, build:35.732825ms}, probe:{concurrency:5, total:857.162518ms, max:171.48271ms, probe:125.341665ms, fetch:731.820853ms}
```

- `build_hash_table`: Reads the data of the inner table and constructs the execution information of the hash table:
    - `total`: The total time consumption.
    - `fetch`: The total time spent reading inner table data.
    - `build`: The total time spent constructing a hash table.
- `probe`: The execution information of join workers:
    - `concurrency`: The number of join workers.
    - `total`: The total time consumed by all join workers.
    - `max`: The longest time for a single join worker to execute.
    - `probe`: The total time consumed for joining with outer table rows and the hash table.
    - `fetch`: The total time that the join worker waits to read the outer table rows data.

#### HashJoinv2

The `HashJoin` operator has one fetcher, N row table builders, and N hash table builders on the build side, and has one fetcher and N workers on the probe side. The detailed execution process is as follows:

1. The fetcher on the build side reads data from the downstream executor and dispatches data to each row table builder.
2. Each row table builder receives data chunks, splits them into several partitions, and builds row tables.
3. The process waits until all row tables are built.
4. Hash table builders build hash tables using row tables.
5. The fetcher on the probe side reads data from the downstream executor and dispatches it to workers.
6. After receiving data, workers look up hash tables, build the final results, and dispatch the results to the result channel.
7. The main thread of `HashJoin` retrieves the join results from the result channel.

The `HashJoin` operator contains the following execution information:

```
build_hash_table:{concurrency:5, time:2.25s, fetch:1.06s, max_partition:1.06s, total_partition:5.27s, max_build:124ms, total_build:439.5ms}, probe:{concurrency:5, time:13s, fetch_and_wait:3.03s, max_worker_time:13s, total_worker_time:1m4.5s, max_probe:9.93s, total_probe:49.4s, probe_collision:59818971}, spill:{round:1, spilled_partition_num_per_round:[5/8], total_spill_GiB_per_round:[1.64], build_spill_row_table_GiB_per_round:[0.50], build_spill_hash_table_per_round:[0.12]}
```

- `build_hash_table`: The execution information of reading data from the downstream operator and building hash tables.
    - `time`: The total time consumption of building hash tables.
    - `fetch`: The total time spent reading data from the downstream.
    - `max_partition`: The longest execution time among all row table builders.
    - `total_partition`: The total execution time taken by all row table builders.
    - `max_build`: The longest execution time among all hash table builders.
    - `total_build`: The total execution time taken by all hash table builders.
- `probe`: The execution information of reading data from the downstream operator and performing probe operations.
    - `time`: The total time consumption of probing.
    - `fetch_and_wait`: The total time spent reading data from downstream and waiting for the data to be received by the upstream.
    - `max_worker_time`: The longest execution time among all workers, including reading data from downstream, executing probe operations, and waiting for the data received by the upstream.
    - `total_worker_time`: The total execution time of all workers.
    - `max_probe`: The longest probe time among all workers.
    - `total_probe`: The total probing time of all workers.
    - `probe_collision`: The number of hash collisions encountered during probing.
- `spill`: The execution information during the spill.
    - `round`: The number of spill rounds.
    - `spilled_partition_num_per_round`: The number of spilled partitions per round, formatted as `x/y`, where `x` is the number of spilled partitions and `y` is the total number of partitions.
    - `total_spill_GiB_per_round`: The total size of data written into the disk in each spill round.
    - `build_spill_row_table_GiB_per_round`: The total size of row table data written into the disk in each spill round on the build side.
    - `build_spill_hash_table_per_round`: The total size of hash table data written into the disk in each spill round on the build side.

### TableFullScan (TiFlash)

The `TableFullScan` operator executed on a TiFlash node contains the following execution information:

```sql
tiflash_scan: {
  dtfile: {
    total_scanned_packs: 2, 
    total_skipped_packs: 1, 
    total_scanned_rows: 16000, 
    total_skipped_rows: 8192, 
    total_rough_set_index_load_time: 2ms, 
    total_read_time: 20ms
  }, 
  total_create_snapshot_time: 1ms
}
```

+ `dtfile`: the DTFile (DeltaTree File) related information during the table scan, which reflects the data scan status of the TiFlash Stable layer.
    - `total_scanned_packs`: the total number of packs that have been scanned in the DTFile. A pack is the minimum unit that can be read in the TiFlash DTFile. By default, every 8192 rows constitute a pack.
    - `total_skipped_packs`: the total number of packs that have been skipped by the scan in the DTFile. When a `WHERE` clause hits rough set indexes or matches the range filtering of a primary key, the irrelevant packs are skipped.
    - `total_scanned_rows`: the total number of rows that have been scanned in the DTFile. If there are multiple versions of updates or deletions because of MVCC, each version is counted independently.
    - `total_skipped_rows`: the total number of rows that are skipped by the scan in the DTFile.
    - `total_rs_index_load_time`: the total time used to read DTFile rough set indexes.
    - `total_read_time`:  the total time used to read DTFile data.
+ `total_create_snapshot_time`: the total time used to create snapshots during the table scan.

### lock_keys execution information

When a DML statement is executed in a pessimistic transaction, the execution information of the operator might also include the execution information of `lock_keys`. For example:

```
lock_keys: {time:94.096168ms, region:6, keys:8, lock_rpc:274.503214ms, rpc_count:6}
```

- `time`: The total duration of executing the `lock_keys` operation.
- `region`: The number of Regions involved in executing the `lock_keys` operation.
- `keys`: The number of `Key`s that need `Lock`.
- `lock_rpc`: The total time spent sending an RPC request of the `Lock` type to TiKV. Because multiple RPC requests can be sent in parallel, the total RPC time consumption might be greater than the total time consumption of the `lock_keys` operation.
- `rpc_count`: The total number of RPC requests of the `Lock` type sent to TiKV.

### commit_txn execution information

When a write-type DML statement is executed in a transaction with `autocommit=1`, the execution information of the write operator will also include the duration information of the transaction commit. For example:

```
commit_txn: {prewrite:48.564544ms, wait_prewrite_binlog:47.821579, get_commit_ts:4.277455ms, commit:50.431774ms, region_num:7, write_keys:16, write_byte:536}
```

- `prewrite`: The time consumed for the `prewrite` phase of the 2PC commit of the transaction.
- `wait_prewrite_binlog:`: The time consumed for waiting to write the prewrite Binlog.
- `get_commit_ts`: The time consumed for getting the transaction commit timestamp.
- `commit`: The time consumed for the `commit` phase during the 2PC commit of the transaction.
- `write_keys`: The total `keys` written in the transaction.
- `write_byte`: The total bytes of `key-value` written in the transaction, and the unit is byte.

### RU (Request Unit) consumption

[Request Unit (RU)](/tidb-resource-control-ru-groups.md#what-is-request-unit-ru) is a unified abstraction unit of system resources, which is defined in TiDB resource control. The `execution info` of the top-level operator shows the overall RU consumption of this particular SQL statement.

```
RU:273.842670
```

> **Note:**
>
> This value shows the actual RUs consumed by this execution. The same SQL statement might consume different amounts of RUs each time it is executed due to the effects of caching (for example, [coprocessor cache](/coprocessor-cache.md)).

You can calculate the RU from the other values in `EXPLAIN ANALYZE`, specifically the `execution info` column. For example:

```json
'executeInfo':
   time:2.55ms, 
   loops:2, 
   RU:0.329460, 
   Get:{
       num_rpc:1,
       total_time:2.13ms
   }, 
   total_process_time: 231.5µs,
   total_wait_time: 732.9µs, 
   tikv_wall_time: 995.8µs,
   scan_detail: {
      total_process_keys: 1, 
      total_process_keys_size: 150, 
      total_keys: 1, 
      get_snapshot_time: 691.7µs,
      rocksdb: {
          block: {
              cache_hit_count: 2,
              read_count: 1,
              read_byte: 8.19 KB,
              read_time: 10.3µs
          }
      }
  },
```

The base costs are defined in the [`tikv/pd` source code](https://github.com/tikv/pd/blob/aeb259335644d65a97285d7e62b38e7e43c6ddca/client/resource_group/controller/config.go#L58C19-L67) and the calculations are performed in the [`model.go`](https://github.com/tikv/pd/blob/54219d649fb4c8834cd94362a63988f3c074d33e/client/resource_group/controller/model.go#L107) file.

If you are using TiDB v7.1, the calculation is the sum of `BeforeKVRequest()` and `AfterKVRequest()` in `pd/pd-client/model.go`, that is:

```
before key/value request is processed:
      consumption.RRU += float64(kc.ReadBaseCost) -> kv.ReadBaseCost * rpc_nums

after key/value request is processed:
      consumption.RRU += float64(kc.ReadBytesCost) * readBytes -> kc.ReadBytesCost * total_process_keys_size
      consumption.RRU += float64(kc.CPUMsCost) * kvCPUMs -> kc.CPUMsCost * total_process_time
```

For writes and batch gets, the calculation is similar with different base costs.

### tiflash_wait information

When a query involves MPP tasks, the execution time is also affected by various tiflash_wait times, for example:

```
tiflash_wait: {minTSO_wait: 425ms, pipeline_breaker_wait: 133ms, pipeline_queue_wait: 512ms}
```

<CustomContent platform="tidb">

- `minTSO_wait`: records the time spent waiting for an MPP task to be scheduled by the [TiFlash MinTSO Scheduler](/tiflash/tiflash-mintso-scheduler.md).
- `pipeline_breaker_wait`: when TiFlash uses the [Pipeline Execution Model](/tiflash/tiflash-pipeline-model.md), it records the time taken by the pipeline containing the pipeline breaker operator to wait for all data in the upstream pipeline. Currently, it is only used to display the time taken by the pipeline containing the `Join` operator to wait for all hash table builds to complete.
- `pipeline_queue_wait`: when TiFlash uses the [Pipeline Execution Model](/tiflash/tiflash-pipeline-model.md), it records the waiting time in the CPU Task Thread Pool and IO Task Thread Pool during the execution of the pipeline.

</CustomContent>
<CustomContent platform="tidb-cloud">

- `minTSO_wait`: records the time spent waiting for an MPP task to be scheduled by the [TiFlash MinTSO Scheduler](https://docs.pingcap.com/tidb/stable/tiflash-mintso-scheduler).
- `pipeline_breaker_wait`: when TiFlash uses the [Pipeline Execution Model](/tiflash/tiflash-pipeline-model.md), it records the time taken by the pipeline containing the pipeline breaker operator to wait for all data in the upstream pipeline. Currently, it is only used to display the time taken by the pipeline containing the `Join` operator to wait for all hash table builds to complete.
- `pipeline_queue_wait`: when TiFlash uses the [Pipeline Execution Model](/tiflash/tiflash-pipeline-model.md), it records the waiting time in the CPU Task Thread Pool and IO Task Thread Pool during the execution of the pipeline.

</CustomContent>

### Other common execution information

The Coprocessor operators usually contain two parts of execution time information: `cop_task` and `tikv_task`. `cop_task` is the time recorded by TiDB, and it is from the moment that the request is sent to the server to the moment that the response is received. `tikv_task` is the time recorded by TiKV Coprocessor itself. If there is much difference between the two, it might indicate that the time spent waiting for the response is too long, or the time spent on gRPC or network is too long.

## MySQL compatibility

`EXPLAIN ANALYZE` is a feature of MySQL 8.0, but both the output format and the potential execution plans in TiDB differ substantially from MySQL.

## See also

* [Understanding the Query Execution Plan](/explain-overview.md)
* [EXPLAIN](/sql-statements/sql-statement-explain.md)
* [ANALYZE TABLE](/sql-statements/sql-statement-analyze-table.md)
* [TRACE](/sql-statements/sql-statement-trace.md)
