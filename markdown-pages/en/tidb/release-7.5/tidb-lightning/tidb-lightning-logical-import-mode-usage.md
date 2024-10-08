---
title: Use Logical Import Mode
summary: Learn how to use the logical import mode in TiDB Lightning.
---

# Use Logical Import Mode

This document introduces how to use the [logical import mode](/tidb-lightning/tidb-lightning-logical-import-mode.md) in TiDB Lightning, including writing the configuration file and tuning performance.

## Configure and use the logical import mode

You can use the logical import mode via the following configuration file to import data:

```toml
[lightning]
# log
level = "info"
file = "tidb-lightning.log"
max-size = 128 # MB
max-days = 28
max-backups = 14

# Checks the cluster minimum requirements before start.
check-requirements = true

[mydumper]
# The local data source directory or the URI of the external storage. For more information about the URI of the external storage, see https://docs.pingcap.com/tidb/v6.6/backup-and-restore-storages#uri-format.
data-source-dir = "/data/my_database"

[tikv-importer]
# Import mode. "tidb" means using the logical import mode.
backend = "tidb"

[tidb]
# The information of the target cluster. The address of any tidb-server from the cluster.
host = "172.16.31.1"
port = 4000
user = "root"
# Configure the password to connect to TiDB. Either plaintext or Base64 encoded.
password = ""
# tidb-lightning imports the TiDB library, and generates some logs.
# Set the log level of the TiDB library.
log-level = "error"
```

For the complete configuration file, refer to [TiDB Lightning Configuration](/tidb-lightning/tidb-lightning-configuration.md).

## Conflict detection

Conflicting data refers to two or more records with the same data in the PK or UK column. In the logical import mode, you can configure the strategy for handling conflicting data by setting the [`conflict.strategy`](/tidb-lightning/tidb-lightning-configuration.md#tidb-lightning-task) configuration item. Based on the strategy, TiDB Lightning imports data with different SQL statements.

| Strategy | Default behavior of conflicting data | The corresponding SQL statement |
| :-- | :-- | :-- |
| `"replace"` | Replacing existing data with new data. | `REPLACE INTO ...` |
| `"ignore"` | Keeping existing data and ignoring new data. | If `conflict.max-record-rows` is greater than 0, `INSERT INTO` is used; if `conflict.max-record-rows` is `0`, `INSERT IGNORE INTO ...` is used |
| `"error"` | Pausing the import and reporting an error. | `INSERT INTO ...` |
|  `""`  | TiDB Lightning does not detect or handle conflicting data. If data with primary and unique key conflicts exists, the subsequent step reports an error. |  None   |

When the strategy is `"error"`, errors caused by conflicting data directly terminates the import task. When the strategy is `"replace"` or `"ignore"`, you can control the maximum tolerant conflicts by configuring [`conflict.threshold`](/tidb-lightning/tidb-lightning-configuration.md#tidb-lightning-task). The default value is `9223372036854775807`, which means that almost all errors are tolerant.

When the strategy is `"ignore"`, conflicting data is recorded in the downstream `conflict_records` table. For further details, see [Error report](/tidb-lightning/tidb-lightning-error-resolution.md#error-report). In this case, you can limit the records by configuring [`conflict.max-record-rows`](/tidb-lightning/tidb-lightning-configuration.md#tidb-lightning-task), and conflicting data that exceeds the limit is skipped and not recorded. The default value is `100`.

## Performance tuning

- In the logical import mode, the performance of TiDB Lightning largely depends on the write performance of the target TiDB cluster. If the cluster hits a performance bottleneck, refer to [Highly Concurrent Write Best Practices](/best-practices/high-concurrency-best-practices.md).

- If the target TiDB cluster does not hit a write bottleneck, consider increasing the value of `region-concurrency` in TiDB Lightning configuration. The default value of `region-concurrency` is the number of CPU cores. The meaning of `region-concurrency` is different between the physical import mode and the logical import mode. In the logical import mode, `region-concurrency` is the write concurrency.

    Example configuration:

    ```toml
    [lightning]
    region-concurrency = 32
    ```

- Adjusting the `raftstore.apply-pool-size` and `raftstore.store-pool-size` configuration items in the target TiDB cluster might improve the import speed.
