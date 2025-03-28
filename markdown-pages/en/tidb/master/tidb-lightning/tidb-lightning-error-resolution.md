---
title: TiDB Lightning Error Resolution
summary: Learn how to resolve type conversion and duplication errors during data import.
---

# TiDB Lightning Error Resolution

Starting from v5.4.0, you can configure TiDB Lightning to skip errors like invalid type conversion and unique key conflicts, and to continue the data processing as if those wrong row data does not exist. A report will be generated for you to read and manually fix errors afterward. This is ideal for importing from a slightly dirty data source, where locating the errors manually is difficult and restarting TiDB Lightning on every encounter is costly.

This document introduces TiDB Lightning error types, how to query the errors, and provides an example. The following configuration items are involved:

- `lightning.max-error`: the tolerance threshold of type error
- `conflict.strategy`, `conflict.threshold`, and `conflict.max-record-rows`: configurations related to conflicting data
- `tikv-importer.duplicate-resolution` (deprecated in v8.0.0 and will be removed in a future release): the conflict handling configuration that can only be used in the physical import mode
- `lightning.task-info-schema-name`: the database where conflicting data is stored when TiDB Lightning detects conflicts

For more information, see [TiDB Lightning (Task)](/tidb-lightning/tidb-lightning-configuration.md#tidb-lightning-task).

## Type error

You can use the `lightning.max-error` configuration to increase the tolerance of errors related to data types. If this configuration is set to *N*, TiDB Lightning allows and skips up to *N* type errors from the data source before it exists. The default value `0` means that no error is allowed.

These errors are recorded in a database. After the import is completed, you can view the errors in the database and process them manually. For more information, see [Error Report](#error-report).


```toml
[lightning]
max-error = 0
```

The above configuration covers the following errors:

* Invalid values (example: set `'Text'` to an INT column).
* Numeric overflow (example: set `500` to a TINYINT column)
* String overflow (example: set `'Very Long Text'` to a VARCHAR(5) column).
* Zero date-time (namely `'0000-00-00'` and `'2021-12-00'`).
* Set NULL to a NOT NULL column.
* Failed to evaluate a generated column expression.
* Column count mismatch. The number of values in the row does not match the number of columns of the table.
* Any other SQL errors.

The following errors are always fatal, and cannot be skipped by changing `lightning.max-error`:

* Syntax error (such as unclosed quotation marks) in the original CSV, SQL or Parquet file.
* I/O, network or system permission errors.

## Conflict errors

You can use the [`conflict.threshold`](/tidb-lightning/tidb-lightning-configuration.md#tidb-lightning-task) configuration item to increase the tolerance of errors related to data conflict. If this configuration item is set to *N*, TiDB Lightning allows and skips up to *N* conflict errors from the data source before it exits. The default value is `10000`, which means that 10000 errors are tolerant.

These errors are recorded in a table. After the import is completed, you can view the errors in the database and process them manually. For more information, see [Error Report](#error-report)

## Error report

If TiDB Lightning encounters errors during the import, it outputs a statistics summary about these errors in both your terminal and the log file when it exits.

* The error report in the terminal is similar to the following table:

    | # | ERROR TYPE | ERROR COUNT | ERROR DATA TABLE |
    | - | --- | --- | ------ |
    | 1 | Data Type | 1000 | `lightning_task_info`.`type_error_v1` |

* The error report in the TiDB Lightning log file is as follows:

    ```shell
    [2022/03/13 05:33:57.736 +08:00] [WARN] [errormanager.go:459] ["Detect 1000 data type errors in total, please refer to table `lightning_task_info`.`type_error_v1` for more details"]
    ```

All errors are written to tables in the `lightning_task_info` database in the downstream TiDB cluster. After the import is completed, if the error data is collected, you can view the errors in the database and process them manually.

You can change the database name by configuring `lightning.task-info-schema-name`.


```toml
[lightning]
task-info-schema-name = 'lightning_task_info'
```

TiDB Lightning creates three tables and one view in this database:

```sql
CREATE TABLE type_error_v1 (
    task_id     bigint NOT NULL,
    create_time datetime(6) NOT NULL DEFAULT now(6),
    table_name  varchar(261) NOT NULL,
    path        varchar(2048) NOT NULL,
    offset      bigint NOT NULL,
    error       text NOT NULL,
    row_data    text NOT NULL
);
CREATE TABLE conflict_error_v3 (
    task_id     bigint NOT NULL,
    create_time datetime(6) NOT NULL DEFAULT now(6),
    table_name  varchar(261) NOT NULL,
    index_name  varchar(128) NOT NULL,
    key_data    text NOT NULL,
    row_data    text NOT NULL,
    raw_key     mediumblob NOT NULL,
    raw_value   mediumblob NOT NULL,
    raw_handle  mediumblob NOT NULL,
    raw_row     mediumblob NOT NULL,
    kv_type     tinyint NOT NULL,
    INDEX (task_id, table_name),
    INDEX (index_name),
    INDEX (table_name, index_name),
    INDEX (kv_type)
);
CREATE TABLE conflict_records (
    task_id     bigint NOT NULL,
    create_time datetime(6) NOT NULL DEFAULT now(6),
    table_name  varchar(261) NOT NULL,
    path        varchar(2048) NOT NULL,
    offset      bigint NOT NULL,
    error       text NOT NULL,
    row_id      bigint NOT NULL COMMENT 'the row id of the conflicted row',
    row_data    text NOT NULL COMMENT 'the row data of the conflicted row',
    KEY (task_id, table_name)
);
CREATE VIEW conflict_view AS
    SELECT 0 AS is_precheck_conflict, task_id, create_time, table_name, index_name, key_data, row_data, raw_key, raw_value, raw_handle, raw_row, kv_type, NULL AS path, NULL AS offset, NULL AS error, NULL AS row_id
    FROM conflict_error_v3
    UNION ALL
    SELECT 1 AS is_precheck_conflict, task_id, create_time, table_name, NULL AS index_name, NULL AS key_data, row_data, NULL AS raw_key, NULL AS raw_value, NULL AS raw_handle, NULL AS raw_row, NULL AS kv_type, path, offset, error, row_id
    FROM conflict_records;
```

The `type_error_v1` table records all [type errors](#type-error) managed by `lightning.max-error`. Each error corresponds to one row.

The `conflict_error_v3` table records conflicts detected during postprocess conflict detection, managed by the `conflict` configuration group in the physical import mode. Each pair of conflicts corresponds to two rows.

The `conflict_records` table records conflicts detected during pre-import conflict detection, managed by the `conflict` configuration group in both logical and physical import modes. Each error corresponds to one row.

The `conflict_view` view records conflicts that are detected by both pre-import and postprocess conflict detection, managed by the `conflict` configuration group in both logical and physical import modes. This view is created by performing a `UNION` operation on the `conflict_error_v3` and `conflict_records` tables.

| Column       | Syntax | Type | Conflict | Description                                                                                                                         |
| ------------ | ------ | ---- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| task_id      | ✓      | ✓    | ✓        | The TiDB Lightning task ID that generates this error                                                                                    |
| create_time | ✓      | ✓    | ✓        | The time at which the error is recorded                                                                                                         |
| table_name   | ✓      | ✓    | ✓        | The name of the table that contains the error, in the form of ``'`db`.`tbl`'``                                                                |
| path         | ✓      | ✓    |          | The path of the file that contains the error                                                                                               |
| offset       | ✓      | ✓    |          | The byte position in the file where the error is found                                                                                  |
| error        | ✓      | ✓    |          | The error message                                                                                                                       |
| context      | ✓      |      |          | The text that surrounds the error                                                                                                          |
| index_name   |        |      | ✓        | The name of the unique key in conflict. It is `'PRIMARY'` for primary key conflicts.                                                          |
| key_data     |        |      | ✓        | The formatted key handle of the row that causes the error. The content is for human reference only, and not intended to be machine-readable. |
| row_data     |        | ✓    | ✓        | The formatted row data that causes the error. The content is for human reference only, and not intended to be machine-readable              |
| raw_key      |        |      | ✓        | The key of the conflicted KV pair                                                                                                       |
| raw_value    |        |      | ✓        | The value of the conflicted KV pair                                                                                                     |
| raw_handle   |        |      | ✓        | The row handle of the conflicted row                                                                                                    |
| raw_row      |        |      | ✓        | The encoded value of the conflicted row                                                                                                 |

> **Note:**
>
> The error report records the file offset, not line/column number which is inefficient to obtain. You can quickly jump near a byte position (using 183 as example) using the following commands:
>
> * shell, printing the first several lines.
>
>     ```shell
>     head -c 183 file.csv | tail
>     ```
>
> * shell, printing the next several lines:
>
>     ```shell
>     tail -c +183 file.csv | head
>     ```
>
> * vim — `:goto 183` or `183go`

## Example

In this example, a data source is prepared with some known errors.

1. Prepare the database and table schema.

    
    ```shell
    mkdir example && cd example

    echo 'CREATE SCHEMA example;' > example-schema-create.sql
    echo 'CREATE TABLE t(a TINYINT PRIMARY KEY, b VARCHAR(12) NOT NULL UNIQUE);' > example.t-schema.sql
    ```

2. Prepare the data.

    
    ```shell
    cat <<EOF > example.t.1.sql

        INSERT INTO t (a, b) VALUES
        (0, NULL),              -- column is NOT NULL
        (1, 'one'),
        (2, 'two'),
        (40, 'forty'),          -- conflicts with the other 40 below
        (54, 'fifty-four'),     -- conflicts with the other 'fifty-four' below
        (77, 'seventy-seven'),  -- the string is longer than 12 characters
        (600, 'six hundred'),   -- the number overflows TINYINT
        (40, 'forty'),         -- conflicts with the other 40 above
        (42, 'fifty-four');     -- conflicts with the other 'fifty-four' above

    EOF
    ```

3. Configure TiDB Lightning to enable strict SQL mode, use the Local-backend to import data, replace duplicates, and skip up to 10 errors.

    
    ```shell
    cat <<EOF > config.toml

        [lightning]
        max-error = 10

        [tikv-importer]
        backend = 'local'
        sorted-kv-dir = '/tmp/lightning-tmp/'

        [conflict]
        strategy = 'replace'
        [mydumper]
        data-source-dir = '.'
        [tidb]
        host = '127.0.0.1'
        port = 4000
        user = 'root'
        password = ''
        sql-mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE'

    EOF
    ```

4. Run TiDB Lightning. This command will exit successfully because all errors are skipped.

    
    ```shell
    tiup tidb-lightning -c config.toml
    ```

5. Verify that the imported table only contains the two normal rows:

    ```sql
    $ mysql -u root -h 127.0.0.1 -P 4000 -e 'select * from example.t'
    +---+-----+
    | a | b   |
    +---+-----+
    | 1 | one |
    | 2 | two |
    +---+-----+
    ```

6. Check whether the `type_error_v1` table has caught the three rows involving type conversion:

    ```sql
    $ mysql -u root -h 127.0.0.1 -P 4000 -e 'select * from lightning_task_info.type_error_v1;' -E

    *************************** 1. row ***************************
        task_id: 1635888701843303564
    create_time: 2021-11-02 21:31:42.620090
     table_name: `example`.`t`
           path: example.t.1.sql
         offset: 46
          error: failed to cast value as varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin for column `b` (#2): [table:1048]Column 'b' cannot be null
       row_data: (0,NULL)

    *************************** 2. row ***************************
        task_id: 1635888701843303564
    create_time: 2021-11-02 21:31:42.627496
     table_name: `example`.`t`
           path: example.t.1.sql
         offset: 183
          error: failed to cast value as varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin for column `b` (#2): [types:1406]Data Too Long, field len 12, data len 13
       row_data: (77,'seventy-seven')

    *************************** 3. row ***************************
        task_id: 1635888701843303564
    create_time: 2021-11-02 21:31:42.629929
     table_name: `example`.`t`
           path: example.t.1.sql
         offset: 253
          error: failed to cast value as tinyint for column `a` (#1): [types:1690]constant 600 overflows tinyint
       row_data: (600,'six hundred')
    ```

7. Check whether the `conflict_error_v3` table has caught the four rows that have unique/primary key conflicts:

    ```sql
    $ mysql -u root -h 127.0.0.1 -P 4000 -e 'select * from lightning_task_info.conflict_error_v3;' --binary-as-hex -E

    *************************** 1. row ***************************
        task_id: 1635888701843303564
    create_time: 2021-11-02 21:31:42.669601
     table_name: `example`.`t`
     index_name: PRIMARY
       key_data: 40
       row_data: (40, "forty")
        raw_key: 0x7480000000000000C15F728000000000000028
      raw_value: 0x800001000000020500666F727479
     raw_handle: 0x7480000000000000C15F728000000000000028
        raw_row: 0x800001000000020500666F727479

    *************************** 2. row ***************************
        task_id: 1635888701843303564
    create_time: 2021-11-02 21:31:42.674798
     table_name: `example`.`t`
     index_name: PRIMARY
       key_data: 40
       row_data: (40, "forty")
        raw_key: 0x7480000000000000C15F728000000000000028
      raw_value: 0x800001000000020600666F75727479
     raw_handle: 0x7480000000000000C15F728000000000000028
        raw_row: 0x800001000000020600666F75727479

    *************************** 3. row ***************************
        task_id: 1635888701843303564
    create_time: 2021-11-02 21:31:42.680332
     table_name: `example`.`t`
     index_name: b
       key_data: 54
       row_data: (54, "fifty-four")
        raw_key: 0x7480000000000000C15F6980000000000000010166696674792D666FFF7572000000000000F9
      raw_value: 0x0000000000000036
     raw_handle: 0x7480000000000000C15F728000000000000036
        raw_row: 0x800001000000020A0066696674792D666F7572

    *************************** 4. row ***************************
        task_id: 1635888701843303564
    create_time: 2021-11-02 21:31:42.681073
     table_name: `example`.`t`
     index_name: b
       key_data: 42
       row_data: (42, "fifty-four")
        raw_key: 0x7480000000000000C15F6980000000000000010166696674792D666FFF7572000000000000F9
      raw_value: 0x000000000000002A
     raw_handle: 0x7480000000000000C15F72800000000000002A
        raw_row: 0x800001000000020A0066696674792D666F7572
    ```
