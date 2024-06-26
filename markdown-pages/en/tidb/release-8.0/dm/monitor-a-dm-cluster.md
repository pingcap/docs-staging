---
title: Data Migration Monitoring Metrics
summary: Learn about the monitoring metrics when you use Data Migration to migrate data.
---

# Data Migration Monitoring Metrics

If your DM cluster is deployed using TiUP, the [monitoring system](/dm/migrate-data-using-dm.md#step-8-monitor-the-task-and-check-logs) is also deployed at the same time. This document describes the monitoring metrics provided by DM-worker.

## Task

In the Grafana dashboard, the default name of DM is `DM-task`.

### `overview`

`Overview` contains some monitoring metrics of all the DM-worker and DM-master instances or sources in the currently selected task. The current default alert rule is only for a single DM-worker/DM-master instance/source.

| Metric name | Description | Alert | Severity level |
|:----|:------------|:----|:----|
| task state | The state of subtasks for migration | N/A | N/A |
| storage capacity | The total storage capacity of the disk occupied by relay logs | N/A | N/A |
| storage remain | The remaining storage capacity of the disk occupied by relay logs | N/A | N/A |
| binlog file gap between master and relay | The number of binlog files by which the `relay` processing unit is behind the upstream master | N/A | N/A |
| load progress | The percentage of the completed loading process of the load unit. The value is between 0%~100% | N/A | N/A |
| binlog file gap between master and syncer | The number of binlog files by which the binlog replication unit is behind the upstream master | N/A | N/A |
| shard lock resolving | Whether the current subtask is waiting for sharding DDL migration. A value greater than 0 means that the current subtask is waiting for sharding DDL migration | N/A | N/A |

### Operation errors

| Metric name | Description | Alert | Severity level |
|:----|:------------|:----|:----|
| before any operate error | The number of errors before any operation | N/A | N/A |
| source bound error | The number of errors of data source binding operations | N/A | N/A |
| start error | The number of errors during the start of a subtask | N/A | N/A |
| pause error | The number of errors during the pause of a subtask | N/A | N/A |
| resume error | The number of errors during the resuming of a subtask | N/A | N/A |
| auto-resume error | The number of errors during the auto-resuming of a subtask | N/A | N/A |
| update error | The number of errors during the update of a subtask | N/A | N/A |
| stop error | The number of errors during the stop of a subtask | N/A | N/A |

### High availability

| Metric name | Description | Alert | Severity level |
|:----|:------------|:----|:----|
| number of dm-masters start leader components per minute | The number of DM-master attempts to enable leader related components per minute | N/A | N/A |
| number of workers in different state | The number of DM-workers in different states | Some DM-worker(s) has (have) been offline for more than one hour | critical |
| workers' state | The state of the DM-worker | N/A | N/A |
| number of worker event error | The number of different types of DM-worker errors | N/A | N/A |
| shard ddl error per minute | The number of different types of sharding DDL errors per minute | Any sharding DDL error occurs | critical |
| number of pending shard ddl | The number of pending sharding DDL operations | Any pending sharding DDL operation has existed for more than one hour | critical |

### Task state

| Metric name | Description | Alert | Severity level |
|:----|:------------|:----|:----|
| task state | The state of subtasks | An alert occurs when the subtask has been in the `Paused` state for more than 20 minutes | critical |

### Dump/Load unit

The following metrics show only when `task-mode` is in the `full` or `all` mode.

| Metric name | Description | Alert | Severity level |
|:----|:------------|:----|:----|
| dump progress | The percentage of the completed dumping process of the dump unit. The value range is 0%~100% | N/A | N/A |
| load progress | The percentage of the completed loading process of the load unit. The value range is 0%~100% | N/A | N/A |
| checksum progress | The percentage of the completed checksum process after the load unit finishes dumping. The value range is 0%~100% | N/A | N/A |
| total bytes for load unit | The bytes processed in the parsing, in generating data KV, and in generating index KV stages of the import process by the load unit | N/A | N/A |
| chunk process duration | The duration of the load unit processing the data source file chunk (in seconds) | N/A | N/A |
| data file size | The total size of the data files (includes the `INSERT INTO` statement) in the full data imported by the load unit | N/A | N/A |
| dump process exits with error | The dump unit encounters an error within the DM-worker and exits | Immediate alerts | critical |
| load process exits with error | The load unit encounters an error within the DM-worker and exits | Immediate alerts | critical |

### Binlog replication

The following metrics show only when `task-mode` is in the `incremental` or `all` mode.

| Metric name | Description | Alert | Severity level |
|:----|:------------|:----|:----|
| remaining time to sync | The predicted remaining time it takes for `syncer` to be completely migrated with the upstream master (in minutes) | N/A | N/A |
| replicate lag gauge | The latency time it takes to replicate the binlog from upstream to downstream (in seconds) | N/A | N/A |
| replicate lag histogram | The histogram of replicating the binlog from upstream to downstream (in seconds). Note that due to different statistical mechanisms, the data might be inaccurate | N/A | N/A |
| process exist with error | The binlog replication unit encounters an error within the DM-worker and exits | Immediate alerts | critical |
| binlog file gap between master and syncer | The number of binlog files by which the `syncer` processing unit is behind the upstream master | An alert occurs when the number of binlog files by which the `syncer` processing unit is behind the upstream master exceeds one (>1) and the condition lasts over 10 minutes | critical |
| binlog file gap between relay and syncer | The number of binlog files by which `syncer` is behind `relay` | An alert occurs when the number of binlog files by which the `syncer` processing unit is behind the `relay` processing unit exceeds one (>1) and the condition lasts over 10 minutes | critical |
| binlog event QPS | The number of binlog events received per unit of time (this number does not include the events that need to be skipped) | N/A | N/A |
| skipped binlog event QPS | The number of binlog events received per unit of time that need to be skipped | N/A | N/A |
| read binlog event duration | The duration that the binlog replication unit reads the binlog from the relay log or the upstream MySQL (in seconds) | N/A | N/A |
| transform binlog event duration | The duration that the binlog replication unit parses and transforms the binlog into SQL statements (in seconds) | N/A | N/A |
| dispatch binlog event duration | The duration that the binlog replication unit dispatches a binlog event (in seconds) | N/A | N/A |
| transaction execution latency | The duration that the binlog replication unit executes the transaction to the downstream (in seconds) | N/A | N/A |
| binlog event size | The size of a binlog event that the binlog replication unit reads from the relay log or the upstream MySQL | N/A | N/A |
| DML queue remain length | The length of the remaining DML job queue | N/A | N/A |
| total sqls jobs | The number of newly added jobs per unit of time | N/A | N/A |
| finished sqls jobs | The number of finished jobs per unit of time | N/A | N/A |
| statement execution latency | The duration that the binlog replication unit executes the statement to the downstream (in seconds) | N/A | N/A |
| add job duration | The duration that the binlog replication unit adds a job to the queue (in seconds) | N/A | N/A |
| DML conflict detect duration | The duration that the binlog replication unit detects the conflict in DML (in seconds) | N/A | N/A |
| skipped event duration | The duration that the binlog replication unit skips a binlog event (in seconds) | N/A | N/A |
| unsynced tables | The number of tables that have not received the shard DDL statement in the current subtask | N/A | N/A |
| shard lock resolving | Whether the current subtask is waiting for the shard DDL lock to be resolved. A value greater than 0 indicates that it is waiting for the shard DDL lock to be resolved | N/A | N/A |
| ideal QPS | The highest QPS that can be achieved when the running time of DM is 0 | N/A | N/A |
| binlog event row | The number of rows in a binlog event | N/A | N/A |
| finished transaction total | The number of finished transactions in total | N/A | N/A |
| replication transaction batch | The number of sql rows in the transaction executed to the downstream | N/A | N/A |
| flush checkpoints time interval | The time interval for flushing the checkpoints (in seconds) | N/A | N/A |

### Relay log

> **Note:**
>
> Currently, DM v2.0 does not support enabling the relay log feature.

| Metric name | Description | Alert | Severity level |
|:----|:------------|:----|:----|
| storage capacity | The storage capacity of the disk occupied by the relay log | N/A | N/A |
| storage remain | The remaining storage capacity of the disk occupied by the relay log | An alert is needed once the value is smaller than 10G | critical |
| process exits with error | The relay log encounters an error within the DM-worker and exits | Immediate alerts | critical |
| relay log data corruption | The number of corrupted relay log files | Immediate alerts | emergency |
| fail to read binlog from master | The number of errors encountered when the relay log reads the binlog from the upstream MySQL | Immediate alerts | critical |
| fail to write relay log | The number of errors encountered when the relay log writes the binlog to disks | Immediate alerts | critical |
| binlog file index | The largest index number of relay log files. For example, "value = 1" indicates "relay-log.000001" | N/A | N/A |
| binlog file gap between master and relay | The number of binlog files in the relay log that are behind the upstream master | An alert occurs when the number of binlog files by which the `relay` processing unit is behind the upstream master exceeds one (>1) and the condition lasts over 10 minutes | critical |
| binlog pos | The write offset of the latest relay log file | N/A | N/A |
| read binlog event duration | The duration that the relay log reads binlog from the upstream MySQL (in seconds) | N/A | N/A |
| write relay log duration | The duration that the relay log writes binlog into the disks each time (in seconds) | N/A | N/A |
| binlog event size | The size of a single binlog event that the relay log writes into the disks | N/A | N/A |

## Instance

In the Grafana dashboard, the default name of an instance is `DM-instance`.

### Relay log

| Metric name | Description | Alert | Severity level |
|:----|:------------|:----|:----|
| storage capacity | The total storage capacity of the disk occupied by the relay log | N/A | N/A |
| storage remain | The remaining storage capacity within the disk occupied by the relay log | An alert occurs once the value is smaller than 10G | critical |
| process exits with error | The relay log encounters an error in DM-worker and exits | Immediate alerts | critical |
| relay log data corruption | The number of corrupted relay logs | Immediate alerts | emergency |
| fail to read binlog from master | The number of errors encountered when relay log reads the binlog from the upstream MySQL | Immediate alerts | critical |
| fail to write relay log | The number of errors encountered when the relay log writes the binlog to disks | Immediate alerts | critical |
| binlog file index | The largest index number of relay log files. For example, "value = 1" indicates "relay-log.000001" | N/A | N/A |
| binlog file gap between master and relay | The number of binlog files by which the `relay` processing unit is behind the upstream master | An alert occurs when the number of binlog files by which the `relay` processing unit is behind the upstream master exceeds one (>1) and the condition lasts over 10 minutes | critical |
| binlog pos | The write offset of the latest relay log file | N/A | N/A |
| read binlog duration | The duration that the relay log reads the binlog from the upstream MySQL (in seconds) | N/A | N/A |
| write relay log duration | The duration that the relay log writes the binlog into the disk each time (in seconds) | N/A | N/A |
| binlog size | The size of a single binlog event that the relay log writes into the disks | N/A | N/A |

### Task

| Metric name | Description | Alert | Severity level |
|:----|:------------|:----|:----|
| task state | The state of subtasks for migration | An alert occurs when the subtask has been paused for more than 10 minutes | critical |
| load progress | The percentage of the completed loading process of the load unit. The value range is 0%~100% | N/A | N/A |
| binlog file gap between master and syncer | The number of binlog files by which the binlog replication unit is behind the upstream master | N/A | N/A |
| shard lock resolving | Whether the current subtask is waiting for sharding DDL migration. A value greater than 0 means that the current subtask is waiting for sharding DDL migration | N/A | N/A |
