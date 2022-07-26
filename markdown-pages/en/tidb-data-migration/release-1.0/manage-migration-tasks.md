---
title: Manage the Data Migration Task
summary: Use dmctl to manage the data migration task.
aliases: ['/tidb-data-migration/stable/manage-migration-tasks','/docs/tidb-data-migration/stable/manage-replication-tasks/','/docs/tidb-data-migration/v1.0/manage-replication-tasks/','/docs/dev/reference/tools/data-migration/manage-tasks/','/docs/v3.1/reference/tools/data-migration/manage-tasks/','/docs/v3.0/reference/tools/data-migration/manage-tasks/','/docs/v2.1/reference/tools/data-migration/manage-tasks/','/docs/tools/dm/manage-task/','/tidb-data-migration/stable/manage-replication-tasks/','/docs/stable/reference/tools/data-migration/manage-tasks/']
---

# Manage the Data Migration Task

This document describes how to manage and maintain the data migration task using the [dmctl](overview.md#dmctl) component. For the Data Migration cluster deployed using DM-Ansible, the dmctl binary file is in `dm-ansible/dmctl`.

The dmctl component supports the interactive mode for manual operations, and also supports the command mode for the script.

## dmctl interactive mode

This section describes the basic use of dmctl commands in the interactive mode.

> **Note:**
>
> The interactive mode does not support Bash features. For example, you need to directly pass string flags instead of passing them in quotes.

### dmctl help

```bash
$ ./dmctl --help
Usage of dmctl:
 # Prints the version information.
 -V prints version and exit
 -config string
       path to config file
 # Encrypts the database password according to the encryption method provided by DM; used in DM configuration files.
 -encrypt string
       encrypt plaintext to ciphertext
 # The DM-master access address. dmctl interacts with the DM-master to complete task management operations.
 -master-addr string
       master API server addr
 -rpc-timeout string
       rpc timeout ("10m" by default)
```

### Database password encryption

In DM configuration files, you need to use the password encrypted using dmctl, otherwise an error occurs. For a same original password, the password is different after each encryption.

```bash
$ ./dmctl -encrypt 123456
VjX8cEeTX+qcvZ3bPaO4h0C80pe/1aU=
```

### Task management overview

Enter the interactive mode to interact with DM-master.


```bash
./dmctl -master-addr 172.16.30.14:8261
```

```
Welcome to dmctl
Release Version: v1.0.1
Git Commit Hash: e63c6cdebea0edcf2ef8c91d84cff4aaa5fc2df7
Git Branch: release-1.0
UTC Build Time: 2019-09-10 06:15:05
Go Version: go version go1.12 linux/amd64

» help
DM control

Usage:
  dmctl [command]

Available Commands:
  break-ddl-lock       forcefully break DM-worker's DDL lock
  check-task           check the config file of the task
  help                 help about any command
  migrate-relay        migrate DM-worker's relay unit
  pause-relay          pause DM-worker's relay unit
  pause-task           pause a specified running task
  purge-relay          purge relay log files of the DM-worker according to the specified filename
  query-error          query task error
  query-status         query task status
  refresh-worker-tasks refresh worker -> tasks mapper
  resume-relay         resume DM-worker's relay unit
  resume-task          resume a specified paused task
  show-ddl-locks       show un-resolved DDL locks
  sql-inject           inject (limited) SQLs into binlog replication unit as binlog events
  sql-replace          replace SQLs matched by a specific binlog position (binlog-pos) or a SQL pattern (sql-pattern); each SQL must end with a semicolon
  sql-skip             skip the binlog event matched by a specific binlog position (binlog-pos) or a SQL pattern (sql-pattern)
  start-task           start a task as defined in the config file
  stop-task            stop a specified task
  switch-relay-master  switch the master server of the DM-worker's relay unit
  unlock-ddl-lock      forcefully unlock DDL lock
  update-master-config update the config of the DM-master
  update-relay         update the relay unit config of the DM-worker
  update-task          update a task's config for routes, filters, or block-allow-list

Flags:
  -h, --help             help for dmctl
  -w, --worker strings   DM-worker ID

# Use "dmctl [command] --help" for more information about a command.
```

## Manage the data migration task

This section describes how to use the task management commands to execute corresponding operations.

### Create the data migration task

You can use the `start-task` command to create the data migration task. Data Migration [prechecks the corresponding privileges and configuration automatically](precheck.md) while starting the data migration.


```bash
help start-task
```

```
start a task as defined in the config file

Usage:
 dmctl start-task [-w worker ...] <config-file> [flags]

Flags:
 -h, --help   help for start-task

Global Flags:
 -w, --worker strings   DM-worker ID
```

#### Command usage example


```bash
start-task [ -w "172.16.30.15:8262"] ./task.yaml
```

#### Flags description

- `-w`: (Optional) Specifies the group of DM-workers to execute `task.yaml`. If it is set, only subtasks of the specified task on these DM-workers are started.
- `config-file`: (Required) Specifies the file path of `task.yaml`.

#### Returned results

```bash
{
​    "result": true,
​    "msg": "",
​    "workers": [
​        {
​            "result": true,
​            "worker": "172.16.30.15:8262",
​            "msg": ""
​        },
​        {
​            "result": true,
​            "worker": "172.16.30.16:8262",
​            "msg": ""
​        }
​    ]
}
```

### Check the data migration task status

You can use the `query-status` task management command to check the status of the data migration task. For details about the query result and subtask status, see [Query Status](query-status.md).

```bash
help query-status
```

```
query task status

Usage:
 dmctl query-status [-w worker ...] [task-name] [flags]

Flags:
 -h, --help   help for query-status

Global Flags:
 -w, --worker strings   DM-worker ID
```

#### Command usage example

```bash
query-status
```

#### Flags description

- `-w`: (Optional) Specifies the group of DM-workers where the subtasks of the migration task (that you want to query) run.
- `task-name`: (Optional) Specifies the task name. If it is not set, the results of all data migration tasks are returned.

#### Returned results

For detailed description of query parameters and a complete list of returned result, refer to [Query status](query-status.md#query-result).

### Check query errors

You can use `query-error` to check error information on migration tasks or relay units. Compared to `query-status`, `query-error` only retrieves information related to the error itself.

`query-error` is often used to obtain the binlog position information required by `sql-skip`/`sql-replace`. For details on the flags and results of `query-error`, refer to [`query-error` in Skip or Replace Abnormal SQL Statements](skip-or-replace-abnormal-sql-statements.md#query-error).

### Pause the data migration task

You can use the `pause-task` command to pause a data migration task.


```bash
help pause-task
```

```
pause a specified running task

Usage:
 dmctl pause-task [-w worker ...] <task-name | task-file> [flags]

Flags:
 -h, --help   help for pause-task

Global Flags:
 -w, --worker strings   DM-worker ID
```

> **Note:**
>
> The differences between `pause-task` and `stop-task` are:
>
> - `pause-task` only pauses a migration task, and the task information is retained in the memory, so that you can query using `query-status`. `stop-task` terminates a migration task and removes all task related information from the memory. This means you cannot use `query-status` to query. Data and the corresponding `dm_meta` like "checkpoint" that have been migrated to the downstream are not affected.
>
> - `pause-task` is generally used to pause the task for troubleshooting, while `stop-task` is used to permanently end a migration task, or co-work with `start-task` to update the configuration information.

#### Command usage example

```bash
pause-task [-w "127.0.0.1:8262"] task-name
```

#### Flags description

- `-w`: (Optional) Specifies the group of DM-workers where the subtasks of the migration task (that you want to pause) run. If it is set, only subtasks on the specified DM-workers are paused.
- `task-name | task-file`: (Required) Specifies the task name or task file path.

#### Returned results

```bash
pause-task test
```

```
{
​    "op": "Pause",
​    "result": true,
​    "msg": "",
​    "workers": [
​        {
            "meta": {
                "result": true,
                "worker": "172.16.30.15:8262",
                "msg": ""
            },
            "op": "Pause",
            "logID": "2"
​        },
​        {
            "meta": {
                "result": true,
                "worker": "172.16.30.16:8262",
                "msg": ""
            },
            "op": "Pause",
            "logID": "2"
​        }
​    ]
}
```

### Resume the data migration task

You can use the `resume-task` command to resume the data migration task in the `Paused` state. This is generally used in scenarios where you want to manually resume a data migration task after you handle the errors that cause the task to pause.

```bash
help resume-task
```

```
resume a specified paused task

Usage:
 dmctl resume-task [-w worker ...] <task-name | task-file> [flags]

Flags:
 -h, --help   help for resume-task

Global Flags:
 -w, --worker strings   DM-worker ID
```

#### Command usage example

```bash
resume-task [-w "127.0.0.1:8262"] task-name
```

#### Flags description

- `-w`: (Optional) Specifies the group of DM-workers where the subtasks of the migration task (that you want to restart) run. If it is set, only subtasks on the specified DM-workers are restarted.
- `task-name | task-file`: (Required) Specifies the task name or task file path.

#### Returned results

```bash
resume-task test
```

```bash
{
     "op": "Resume",
     "result": true,
     "msg": "",
     "workers": [
         {
             "meta": {
                 "result": true,
                 "worker": "172.16.30.15:8262",
                 "msg": ""
             },
             "op": "Resume",
             "logID": "3"
         },
         {
             "meta": {
                 "result": true,
                 "worker": "172.16.30.16:8262",
                 "msg": ""
             },
             "op": "Resume",
             "logID": "3"
         }
     ]
}
```

### Stop the data migration task

You can use the `stop-task` command to stop a data migration task. For differences between `stop-task` and `pause-task`, refer to [Pause the data migration task](#pause-the-data-migration-task).

```bash
help stop-task
```

```
stop a specified task

Usage:
 dmctl stop-task [-w worker ...] <task-name | task-file> [flags]

Flags:
 -h, --help   help for stop-task

Global Flags:
 -w, --worker strings   DM-worker ID
```

#### Command usage example

```bash
stop-task [-w "127.0.0.1:8262"]  task-name
```

#### Flags description

- `-w`: (Optional) Specifies the group of DM-workers where the subtasks of the migration task (that you want to stop) run. If it is set, only subtasks on the specified DM-workers are stopped.
- `task-name | task-file`: (Required) Specifies the task name or task file path.

#### Returned results

```bash
stop-task test
```

```
{
     "op": "Stop",
     "result": true,
     "msg": "",
     "workers": [
         {
             "meta": {
                 "result": true,
                 "worker": "172.16.30.15:8262",
                 "msg": ""
             },
             "op": "Stop",
             "logID": "4"
         },
         {
             "meta": {
                 "result": true,
                 "worker": "172.16.30.16:8262",
                 "msg": ""
             },
             "op": "Stop",
             "logID": "4"
         }
     ]
}
```

### Update the data migration task

You can use the `update-task` command to update the data migration task. The following items support online update, while all other items do not support online update.

- table route rules
- block allow list
- binlog filter rules

> **Note:**
>
> If you can make sure that the relay log required by the migration task will not be removed when the task is stopped, it is recommended that you use [Update items that do not support online update](#update-items-that-do-not-support-online-update) to update task configurations.

#### Update items that support online update

1. Check the status of the corresponding data migration task using `query-status <task-name>`.

    If `stage` is not `Paused`, use `pause-task <task-name | task-file>` to pause the task.

2. Edit the `task.yaml` file to update the custom configuration that you need to modify and the incorrect configuration.

3. Update the task configuration using `update-task task.yaml`.

4. Resume the task using `<task-name | task-file>`.

#### Update items that do not support online update

1. Check the status of the corresponding data migration task using `query-status <task-name>`.

    If the task exists, use `stop-task <task-name | task-file>` to stop the task.

2. Edit the `task.yaml` file to update the custom configuration that you need to modify and the incorrect configuration.

3. Restart the task using `start-task <config-file>`.

#### Command usage help

```bash
help update-task
```

```
update a task's config for routes, filters, block-allow-list

Usage:
  dmctl update-task [-w worker ...] <config-file> [flags]

Flags:
  -h, --help   help for update-task

Global Flags:
  -w, --worker strings   DM-worker ID
```

#### Command usage example

```bash
update-task [-w "127.0.0.1:8262"] ./task.yaml
```

#### Flags description

- `-w`: (Optional) Specifies the group of DM-workers where the subtasks of the migration task (that you want to update) run. If it is set, only subtasks on the specified DM-workers are updated.
- `config-file`: (Required) Specifies the file path of `task.yaml`.

#### Returned results

```bash
update-task task.yaml
```

```bash
{
​    "result": true,
​    "msg": "",
​    "workers": [
​        {
​            "result": true,
​            "worker": "172.16.30.15:8262",
​            "msg": ""
​        },
​        {
​            "result": true,
​            "worker": "172.16.30.16:8262",
​            "msg": ""
​        }
​    ]
}
```

## Manage DDL locks

Currently, DDL lock related commands mainly include `show-ddl-locks`, `unlock-ddl-lock`, `break-ddl-lock`, etc. For more information on their functions, usages, and applicable scenarios, refer to [Handle Sharding DDL Locks Manually](feature-manually-handling-sharding-ddl-locks.md).

## Other task and cluster management commands

In addition to the common task management commands above, DM also provides some other commands to manage data migration tasks and DM clusters.

### Check the task configuration file

You can use the `check-task` command to check whether a specified configuration file (`task.yaml`) of the migration task is valid, or whether the configuration of upstream/downstream database, permission setting, and schema meet the migration requirements. For more details, refer to [Precheck the upstream MySQL instance configuration](precheck.md).

When you use `start-task` to start a migration task, DM also executes all checks done by `check-task`.


```bash
help check-task
```

```
check the config file of the task

Usage:
 dmctl check-task <config-file> [flags]

Flags:
 -h, --help   help for check-task

Global Flags:
 -w, --worker strings   DM-worker ID
```

#### Command usage example


```bash
check-task task.yaml
```

#### Flags description

+ `config-file`: (Required) Specifies the path of the `task.yaml` file

#### Returned results


```bash
check-task task-test.yaml
```

```
{
    "result": true,
    "msg": "check pass!!!"
}
```

### Pause a relay unit

Relay units automatically run after the DM-worker thread starts. You can use the `pause-relay` command to pause the running relay units.

When you want to switch the DM-worker to connect to an upstream MySQL via a virtual IP, use `pause-relay` to make corresponding changes on DM.


```bash
help pause-relay
```

```
pause DM-worker's relay unit

Usage:
  dmctl pause-relay <-w worker ...> [flags]

Flags:
  -h, --help   help for pause-relay

Global Flags:
  -w, --worker strings   DM-worker ID
```

#### Command usage example


```bash
pause-relay -w "127.0.0.1:8262"
```

#### Flags description

- `-w`: (Required) Specifies the DM-worker for which to pause the relay unit

#### Returned results


```bash
pause-relay -w "172.16.30.15:8262"
```

```
{
    "op": "InvalidRelayOp",
    "result": true,
    "msg": "",
    "workers": [
        {
            "op": "PauseRelay",
            "result": true,
            "worker": "172.16.30.15:8262",
            "msg": ""
        }
    ]
}
```

### Resume a relay unit

You can use the `resume-relay` command to resume a relay unit in `Paused` state.

When you want to switch the DM-worker to connect to an upstream MySQL via a virtual IP, use `resume-relay` to make corresponding changes on DM.


```bash
help resume-relay
```

```
resume DM-worker's relay unit

Usage:
  dmctl resume-relay <-w worker ...> [flags]

Flags:
  -h, --help   help for resume-relay

Global Flags:
  -w, --worker strings   DM-worker ID
```

#### Command usage example


```bash
resume-relay -w "127.0.0.1:8262"
```

#### Flags description

- `-w`: (Required) Specifies the DM-worker for which to resume the relay unit

#### Returned results


```bash
resume-relay -w "172.16.30.15:8262"
```

```
{
    "op": "InvalidRelayOp",
    "result": true,
    "msg": "",
    "workers": [
        {
            "op": "ResumeRelay",
            "result": true,
            "worker": "172.16.30.15:8262",
            "msg": ""
        }
    ]
}
```

### Switch the sub-directory for relay logs

Relay units store the binlog data from upstream MySQL instances in sub-directories. You can use the `switch-relay-master` command to swith the relay unit to use a new sub-directory.

When you want to switch the DM-worker to connect to an upstream MySQL via a virtual IP, use `switch-relay-master` to make corresponding changes on DM.


```bash
help switch-relay-master
```

```
switch the master server of the DM-worker's relay unit

Usage:
  dmctl switch-relay-master <-w worker ...> [flags]

Flags:
  -h, --help   help for switch-relay-master

Global Flags:
  -w, --worker strings   DM-worker ID
```

#### Command usage example


```bash
switch-relay-master -w "127.0.0.1:8262"
```

#### Flags description

- `-w`: (Required) Specifies the DM-worker for which to switch the relay unit

#### Returned results


```bash
switch-relay-master -w "172.16.30.15:8262"
```

```
{
    "result": true,
    "msg": "",
    "workers": [
        {
            "result": true,
            "worker": "172.16.30.15:8262",
            "msg": ""
        }
    ]
}
```

### Manually purge relay log

DM supports [Automatic data purge](relay-log.md#automatic-data-purge). You can also use `purge-relay` to [manually purge data](relay-log.md#manual-data-purge).


```bash
help purge-relay
```

```
purge relay log files of the DM-worker according to the specified filename

Usage:
  dmctl purge-relay <-w worker> [--filename] [--sub-dir] [flags]

Flags:
  -f, --filename string   name of the terminal file before which to purge relay log files. Sample format: "mysql-bin.000006"
  -h, --help              help for purge-relay
  -s, --sub-dir string    specify relay sub directory for --filename. If not specified, the latest one will be used. Sample format: "2ae76434-f79f-11e8-bde2-0242ac130008.000001"

Global Flags:
  -w, --worker strings   DM-worker ID
```

#### Command usage example


```bash
purge-relay -w "127.0.0.1:8262" --filename "mysql-bin.000003"
```

#### Flags description

- `-w`: (Required) Specifies the DM-worker for which to perform a clean operation
- `--filename`: (Required) Specifies the name of the terminal file before which to purge relay log files. For example, if the value is `mysql-bin.000100`, the clean operation stops at `mysql-bin.000099`.
- `--sub-dir`: (Optional) Specifies the relay log sub-directory corresponding to `--filename`. If not specified, the latest one is used.

#### Returned results


```bash
purge-relay -w "127.0.0.1:8262" --filename "mysql-bin.000003"
```

```
[warn] no --sub-dir specified for --filename; the latest one will be used
{
    "result": true,
    "msg": "",
    "workers": [
        {
            "result": true,
            "worker": "127.0.0.1:8262",
            "msg": ""
        }
    ]
}
```

### Preset skip operation

You can use `sql-skip` to preset a skip operation to be executed when the position or the SQL statement of the binlog event matches with the specified `binlog-pos` or `sql-pattern`. For descriptions of related parameters and results, refer to [`sql-skip`](skip-or-replace-abnormal-sql-statements.md#sql-skip).

### Preset replace operation

You can use `sql-replace` to preset a replace operation to be executed when the position or the SQL statement of the binlog event matches with the specified `binlog-pos` or `sql-pattern`. For descriptions of related parameters and results, refer to [`sql-replace`](skip-or-replace-abnormal-sql-statements.md#sql-replace).

### Forcefully refresh the `task => DM-workers` mapping

You can use the `refresh-worker-tasks` command to forcefully refresh the `task => DM-workers` mapping cached in the memory of the DM-master.

> **Note:**
>
> Normally it is not necessary to use this command. Use it only when the `task => DM-workers` already exists and you are prompted to refresh it when executing other commands.

## Refresh worker tasks

You can use the `refresh-worker-tasks` command to forcefully refresh the `task => DM-workers` mapping maintained in the DM-master memory.

> **Note:**
>
> Normally, you do not need to use this command. Use it only when you are sure that the `task => DM-workers` mapping exists, but you are still prompted to refresh while you are executing other commands.

## dmctl command mode

The command mode differs from the interactive mode in that you need to append the task operation right after the dmctl command. The parameters of the task operation in the command mode are the same as those in the interactive mode.

> **Note:**
>
> + A dmctl command must be followed by only one task operation.
> + The task operation can be placed only at the end of the dmctl command.


```bash
./dmctl -master-addr 172.16.30.14:8261 start-task task.yaml
./dmctl -master-addr 172.16.30.14:8261 stop-task task
./dmctl -master-addr 172.16.30.14:8261 query-status
```

```
Available Commands:
  break-ddl-lock        break-ddl-lock <-w worker ...> <task-name> [--remove-id] [--exec] [--skip]
  check-task            check-task <config-file>
  migrate-relay         migrate-relay <worker> <binlogName> <binlogPos>
  pause-relay           pause-relay <-w worker ...>
  pause-task            pause-task [-w worker ...] <task-name>
  purge-relay           purge-relay <-w worker> [--filename] [--sub-dir]
  query-error           query-error [-w worker ...] [task-name]
  query-status          query-status [-w worker ...] [task-name]
  refresh-worker-tasks  refresh-worker-tasks
  resume-relay          resume-relay <-w worker ...>
  resume-task           resume-task [-w worker ...] <task-name>
  show-ddl-locks        show-ddl-locks [-w worker ...] [task-name]
  sql-inject            sql-inject <-w worker> <task-name> <sql1;sql2;>
  sql-replace           sql-replace <-w worker> [-b binlog-pos] [-s sql-pattern] [--sharding] <task-name> <sql1;sql2;>
  sql-skip              sql-skip <-w worker> [-b binlog-pos] [-s sql-pattern] [--sharding] <task-name>
  start-task            start-task [-w worker ...] <config-file>
  stop-task             stop-task [-w worker ...] <task-name>
  switch-relay-master   switch-relay-master <-w worker ...>
  unlock-ddl-lock       unlock-ddl-lock [-w worker ...] <lock-ID>
  update-master-config  update-master-config <config-file>
  update-relay          update-relay [-w worker ...] <config-file>
  update-task           update-task [-w worker ...] <config-file>
```

## Deprecated or unrecommended commands

The following commands are either deprecated or only used for debugging purposes. They might be completely removed or their semantics might be changed in future versions. **Strongly Not Recommended**.

- `migrate-relay`
- `sql-inject`
- `update-master-config`
- `update-relay`
