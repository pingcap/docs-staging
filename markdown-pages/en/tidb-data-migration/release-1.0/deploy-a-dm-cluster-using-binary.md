---
title: Deploy Data Migration Cluster Using DM Binary
summary: Learn how to deploy the Data Migration cluster using DM binary.
aliases: ['/docs/tidb-data-migration/stable/deploy-a-dm-cluster-using-binary/','/docs/tidb-data-migration/v1.0/deploy-a-dm-cluster-using-binary/','/docs/dev/how-to/deploy/data-migration-with-binary/','/docs/v3.1/how-to/deploy/data-migration-with-binary/','/docs/v3.0/how-to/deploy/data-migration-with-binary/','/docs/v2.1/how-to/deploy/data-migration-with-binary/']
---

# Deploy Data Migration Cluster Using DM Binary

This document introduces how to quickly deploy the Data Migration (DM) cluster using DM binary.

## Preparations

Download the official binary using the download link in the following table:

| Package name | OS | Architecture | SHA256 checksum |
|:---|:---|:---|:---|
| `https://download.pingcap.org/dm-{version}-linux-amd64.tar.gz` | Linux | amd64 | `https://download.pingcap.org/dm-{version}-linux-amd64.sha256` |

> **Note:**
>
> `{version}` in the above download link indicates the version number of TiDB. For example, the download link for `v1.0.1` is `https://download.pingcap.org/dm-v1.0.1-linux-amd64.tar.gz`. You can check the published DM versions in the [DM Release](https://github.com/pingcap/dm/releases) page.

The downloaded files have two subdirectories, `bin` and `conf`. The `bin` directory contains the binary files of DM-master, DM-worker, dmctl and Mydumper. The `conf` directory contains the sample configuration files.

## Sample scenario

Suppose that you are going to deploy a DM cluster based on this sample scenario:

+ Two MySQL instances are deployed on two servers.
+ One TiDB instance is deployed on one server (in the mocktikv mode).
+ Two DM-worker nodes and one DM-master node are deployed on three servers.

Here is the address of each node:

| Instance or node        | Server address   |
| :---------- | :----------- |
| MySQL1     | 192.168.0.1 |
| MySQL2     | 192.168.0.2 |
| TiDB       | 192.168.0.3 |
| DM-master  | 192.168.0.4 |
| DM-worker1 | 192.168.0.5 |
| DM-worker2 | 192.168.0.6 |

Enable the binlog on MySQL1 and on MySQL2. DM-worker1 migrates the data from MySQL1 and DM-worker2 migrates the data from MySQL2.

Based on this scenario, the following sections describe how to deploy the DM cluster.

### Deploy DM-worker

Establish the connection between DM-worker and the upstream MySQL instances, and for safety reasons, you must configure the encrypted password.

Encrypt the MySQL password by executing the following command. Suppose the password is "123456".


```bash
./bin/dmctl --encrypt "123456"
```

Then, you get the encrypted password as shown below. Record this encrypted value, which is used for deploying DM-worker in the following steps.

```
fCxfQ9XKCezSzuCD0Wf5dUD+LsKegSg=
```

You can configure DM-worker by using command-line parameters or the configuration file.

**Deployment method 1: DM-worker command-line parameters**

Below is the description of the DM-worker command-line parameters:


```bash
./bin/dm-worker --help
```

```
Usage of worker:
  -L string
        Log level. Available values: "debug", "info" (default value), "warn", "error" or "fatal"
  -V    The output version number
  -checker-backoff-max duration
        The longest waiting time for the automatic recovery after errors are found in the task check module. The default value is "5m0s" which generally needs no change. It is not recommended to change this default value unless you have an in-depth understanding of this parameter.
  -checker-backoff-rollback duration
        The time interval for adjusting the waiting time of the automatic recovery in the task check module. The default value is "5m0s" which generally needs no change. It is not recommended to change this default value unless you have an in-depth understanding of this parameter.
  -checker-check-enable
        Enables or disables the task status check. When it is enabled, DM automatically tries to resume the data migration tasks interrupted by errors. Default value: "true".
  -config string
        The path of the configuration file
  -log-file string
        The path of log files
  -print-sample-config
        Prints the sample configuration
  -purge-expires int
        The expiration time of relay logs. DM-worker tries to delete the relay logs whose last modified time exceeds this value. Unit: hour.
  -purge-interval int
        The time interval at which relay logs are regularly checked for expiration. Default value: "3600". Unit: second.
  -purge-remain-space int
        Sets the minimum available disk space. When the disk space is smaller than this value, DM-worker tries to delete relay logs. Default value: "15". Unit: GB.
  -relay-dir string
        The path in which relay logs are stored. Default value: "./relay_log".
  -worker-addr string
        DM-worker address
```

> **Note:**
>
> In some situations, you cannot use the above method to configure DM-worker because some configurations are not exposed to the command line. Then use the configuration file instead.

**Deployment method 2: configuration file**

Below is the DM-worker configuration file. It is recommended that you use this method and write the following configuration to `conf/dm-worker1.toml`.

```toml
# Worker Configuration.

# Log configuration
log-level = "info"
log-file = "dm-worker.log"

# DM-worker address
worker-addr = ":8262"

# The server ID of MySQL secondary, used when pulling binlog from MySQL
# In a migration group, each instance (primary and secondary) must have a unique server ID
server-id = 101
# In v1.0.2 and later versions, the server ID is automatically generated by DM

# Used to mark a migration group or MySQL/MariaDB instance
source-id = "mysql-replica-01"

# The type of the upstream instance
# Available values: "mysql", "mariadb"
#  In v1.0.2 and later versions, DM automatically detects and fills in the type of the upstream instance
flavor = "mysql"

# MySQL connection address
[from]
host = "192.168.0.1"
user = "root"
password = "fCxfQ9XKCezSzuCD0Wf5dUD+LsKegSg="
port = 3306
```

Then, execute the following command in the terminal to run DM-worker:


```bash
bin/dm-worker -config conf/dm-worker1.toml
```

In DM-worker2, change `source-id` in the configuration file to `mysql-replica-02` and change the `from` configuration to the address of MySQL2. If you deploy Dm-worker2 and Dm-worker1 on one machine, you need to deploy two dm-worker instances in different paths, otherwise the default path for saving meta-information and relay log will conflict.

### Deploy DM-master

You can configure DM-master by using command-line parameters or the configuration file.

**Deployment method 1: DM-master command-line parameters**

Below is the description of DM-master command-line parameters:

```bash
./bin/dm-master --help
```

```
Usage of dm-master:
  -L string
        Log level. Available values: "debug", "info" (default value), "warn", "error" or "fatal"
  -V    Outputs the version information
  -config string
        The path of the configuration file
  -log-file string
        The path of log files
  -master-addr string
        DM-master address
  -print-sample-config
        Prints the sample configuration of DM-master
```

> **Note:**
>
> In some situations, you cannot use the above method to configure DM-master because some configurations are not exposed to the command line. Then use the configuration file instead.

**Deployment method 2: configuration file**

Below is the configuration file of DM-master. It is recommended that you use this method and write the following configuration to `conf/dm-master.toml`.

```toml
# Master Configuration.

# Log configurations
log-level = "info"
log-file = "dm-master.log"

# The listening address of DM-master
master-addr = ":8261"

# DM-worker configuration
[[deploy]]
# Corresponding to the source-id in the DM-worker1 configuration file
source-id = "mysql-replica-01"
# The service address of DM-worker1
dm-worker = "192.168.0.5:8262"

[[deploy]]
# Corresponding to the source-id in the DM-worker2 configuration file
source-id = "mysql-replica-02"
# The service address of DM-worker1
dm-worker = "192.168.0.6:8262"
```

Then, execute the following command in the terminal to run DM-master:


```bash
bin/dm-master -config conf/dm-master.toml
```

Now, a DM cluster is successfully deployed.

### Create a data migration task

Suppose that there are several sharded tables on both MySQL1 and MySQL2 instances. These tables have the same structure and the same prefix "t" in their table names. The databases where they are located are named with the same prefix "sharding". In each sharded table, the primary key and unique key are different from those of all other tables.

Now you need to migrate these sharded tables to the `db_target.t_target` table in TiDB.

1. Create the configuration file of the task:

    
    ```yaml
    ---
    name: test
    task-mode: all
    is-sharding: true

    target-database:
      host: "192.168.0.3"
      port: 4000
      user: "root"
      password: "" # if the password is not empty, you also need to configure the encrypted password using dmctl.

    mysql-instances:
      - source-id: "mysql-replica-01"
        block-allow-list:  "instance"  # Use black-white-list if the DM's version <= v1.0.6.
        route-rules: ["sharding-route-rules-table", "sharding-route-rules-schema"]
        mydumper-thread: 4             # The number of threads that the dump unit uses for dumping data, new in v1.0.2 and later versions.
        loader-thread: 16              # The number of threads that the load unit uses for loading data, new in v1.0.2 and later versions.
        syncer-thread: 16              # The number of threads that the sync unit uses for replicating incremental data, new in v1.0.2 and later versions.

      - source-id: "mysql-replica-02"
        block-allow-list:  "instance"  # Use black-white-list if the DM's version <= v1.0.6.
        route-rules: ["sharding-route-rules-table", "sharding-route-rules-schema"]
        mydumper-thread: 4
        loader-thread: 16
        syncer-thread: 16

    block-allow-list:  # Use black-white-list if the DM's version <= v1.0.6.
      instance:
        do-dbs: ["~^sharding[\\d]+"]
        do-tables:
        -  db-name: "~^sharding[\\d]+"
           tbl-name: "~^t[\\d]+"

    routes:
      sharding-route-rules-table:
        schema-pattern: sharding*
        table-pattern: t*
        target-schema: db_target
        target-table: t_target

      sharding-route-rules-schema:
        schema-pattern: sharding*
        target-schema: db_target
    ```

2. Write the above configuration to the `conf/task.yaml` file and create the task using dmctl:

    
    ```bash
    bin/dmctl -master-addr 192.168.0.4:8261
    ```

    ```
    Welcome to dmctl
    Release Version: v1.0.0-69-g5134ad1
    Git Commit Hash: 5134ad19fbf6c57da0c7af548f5ca2a890bddbe4
    Git Branch: master
    UTC Build Time: 2019-04-29 09:36:42
    Go Version: go version go1.12 linux/amd64
    »
    ```

    
    ```bash
    » start-task conf/task.yaml
    ```

    ```
    {
        "result": true,
        "msg": "",
        "workers": [
            {
                "result": true,
                "worker": "192.168.0.5:8262",
                "msg": ""
            },
            {
                "result": true,
                "worker": "192.168.0.6:8262",
                "msg": ""
            }
        ]
    }
    ```

Now, you have successfully created a task to migrate the sharded tables from the MySQL1 and MySQL2 instances to TiDB.
