---
title: TiCDC Overview
summary: Learn what TiCDC is, what features TiCDC provides, and how to install and deploy TiCDC.
---

# TiCDC Overview

[TiCDC](https://github.com/pingcap/tiflow/tree/master/cdc) is a tool used for replicating incremental data of TiDB. Specifically, TiCDC pulls TiKV change logs, sorts captured data, and exports row-based incremental data to downstream databases. For detailed data replication capabilities, see [TiCDC Data Replication Capabilities](/ticdc/ticdc-data-replication-capabilities.md).

## Usage scenarios

- Provides data high availability and disaster recovery solutions for multiple TiDB clusters, ensuring eventual data consistency between primary and secondary clusters in case of disaster.
- Replicates real-time data changes to homogeneous systems so as to provide data sources for various scenarios such as monitoring, caching, global indexing, data analysis, and primary-secondary replication between heterogeneous databases.

## Major features

### Key capabilities

- Replicate incremental data from one TiDB cluster to another TiDB cluster with second-level RPO and minute-level RTO.
- Replicate data bidirectionally between TiDB clusters, based on which you can create a multi-active TiDB solution using TiCDC.
- Replicate incremental data from a TiDB cluster to a MySQL database (or other MySQL-compatible databases) with low latency.
- Replicate incremental data from a TiDB cluster to a Kafka cluster. The recommended data format includes [Canal-JSON](/ticdc/ticdc-canal-json.md) and [Avro](/ticdc/ticdc-avro-protocol.md).
- Replicating incremental data from a TiDB cluster to storage services, such as Amazon S3, GCS, Azure Blob Storage, and NFS.
- Replicate tables with the ability to filter databases, tables, DMLs, and DDLs.
- Be highly available with no single point of failure. Supports dynamically adding and deleting TiCDC nodes.
- Support cluster management through [Open API](/ticdc/ticdc-open-api-v2.md), including querying task status, dynamically modifying task configuration, and creating or deleting tasks.

### Replication order

- For all DDL or DML statements, TiCDC outputs them **at least once**.
- When the TiKV or TiCDC cluster encounters a failure, TiCDC might send the same DDL/DML statement repeatedly. For duplicated DDL/DML statements:

    - MySQL sink can execute DDL statements repeatedly. For DDL statements that can be executed repeatedly in the downstream, such as `truncate table`, the statement is executed successfully. For those that cannot be executed repeatedly, such as `create table`, the execution fails, and TiCDC ignores the error and continues the replication.
    - Kafka sink
        - Kafka sink provides different strategies for data distribution. You can distribute data to different Kafka partitions based on the table, primary key, or timestamp. This ensures that the updated data of a row is sent to the same partition in order.
        - All these distribution strategies send Resolved TS messages to all topics and partitions periodically. This indicates that all messages earlier than the Resolved TS have been sent to the topics and partitions. The Kafka consumer can use the Resolved TS to sort the messages received.
        - Kafka sink sends duplicated messages sometimes, but these duplicated messages do not affect the constraints of `Resolved Ts`. For example, if a changefeed is paused and then resumed, Kafka sink might send  `msg1`, `msg2`, `msg3`, `msg2`, and `msg3` in order. You can filter the duplicated messages from Kafka consumers.

### Replication consistency

- MySQL sink

    - TiCDC enables redo log to ensure eventual consistency of data replication.
    - TiCDC **ensures** that the order of single-row updates is consistent with that in the upstream.
    - TiCDC does **not ensure** that the execution order of downstream transactions is the same as that of upstream transactions.

    > **Note:**
    >
    > Since v6.2, you can use the sink uri parameter [`transaction-atomicity`](/ticdc/ticdc-sink-to-mysql.md#configure-sink-uri-for-mysql-or-tidb) to control whether to split single-table transactions. Splitting single-table transactions can greatly reduce the latency and memory consumption of replicating large transactions.

## TiCDC architecture

As an incremental data replication tool for TiDB, TiCDC is highly available through PD's etcd. The replication process is as follows:

1. Multiple TiCDC processes pull data changes from TiKV nodes.
2. Data changes pulled from TiKV are sorted and merged internally.
3. Data changes are replicated to multiple downstream systems through multiple replication tasks (changefeeds).

The architecture of TiCDC is shown in the following figure:

![TiCDC architecture](https://docs-download.pingcap.com/media/images/docs/ticdc/cdc-architecture.png)

The components in the preceding architecture diagram are described as follows:

- TiKV Server: TiKV nodes in a TiDB cluster. When data changes, TiKV nodes send the changes as change logs (KV change logs) to TiCDC nodes. If TiCDC nodes find the change logs not continuous, they will actively request the TiKV nodes to provide change logs.
- TiCDC: TiCDC nodes where the TiCDC processes run. Each node runs a TiCDC process. Each process pulls data changes from one or more tables in TiKV nodes, and replicates the changes to the downstream system through the sink component.
- PD: The scheduling module in a TiDB cluster. This module is in charge of scheduling cluster data and usually consists of three PD nodes. PD provides high availability through the etcd cluster. In the etcd cluster, TiCDC stores its metadata, such as node status information and changefeed configurations.

As shown in the preceding architecture diagram, TiCDC supports replicating data to TiDB, MySQL, Kafka, and storage services.

## Best practices

- When you use TiCDC to replicate data between two TiDB clusters, if the network latency between the two clusters is higher than 100 ms:

    - For TiCDC versions earlier than v6.5.2, it is recommended to deploy TiCDC in the region (IDC) where the downstream TiDB cluster is located.
    - With a series of improvements introduced starting from TiCDC v6.5.2, it is recommended to deploy TiCDC in the region (IDC) where the upstream TiDB cluster is located.

- TiCDC only replicates the table that has at least one **valid index**. A **valid index** is defined as follows:

    - A primary key (`PRIMARY KEY`) is a valid index.
    - A unique index (`UNIQUE INDEX`) is valid if every column of the index is explicitly defined as non-nullable (`NOT NULL`) and the index does not have the virtual generated column (`VIRTUAL GENERATED COLUMNS`).

- To ensure eventual consistency when using TiCDC for disaster recovery, you need to configure [redo log](/ticdc/ticdc-sink-to-mysql.md#eventually-consistent-replication-in-disaster-scenarios) and ensure that the storage system where the redo log is written can be read normally when a disaster occurs in the upstream.

## Implementation of processing data changes

This section mainly describes how TiCDC processes data changes generated by upstream DML operations.

For data changes generated by upstream DDL operations, TiCDC obtains the complete DDL SQL statement, converts it into the corresponding format based on the sink type of the downstream, and sends it to the downstream. This section does not elaborate on this.

> **Note:**
>
> The logic of how TiCDC processes data changes might be adjusted in subsequent versions.

MySQL binlog directly records all DML SQL statements executed in the upstream. Unlike MySQL, TiCDC listens to the real-time information of each Region Raft Log in the upstream TiKV, and generates data change information based on the difference between the data before and after each transaction, which corresponds to multiple SQL statements. TiCDC only guarantees that the output change events are equivalent to the changes in the upstream TiDB, and does not guarantee that it can accurately restore the SQL statements that caused the data changes in the upstream TiDB.

Data change information includes the data change types and the data values before and after the change. The difference between the data before and after the transaction can result in three types of events:

1. The `DELETE` event: corresponds to a `DELETE` type data change message, which contains the data before the change.

2. The `INSERT` event: corresponds to a `PUT` type data change message, which contains the data after the change.

3. The `UPDATE` event: corresponds to a `PUT` type data change message, which contains the data both before and after the change.

Based on the data change information, TiCDC generates data in the appropriate formats for different downstream types, and sends the data to the downstream. For example, it generates data in formats such as Canal-JSON and Avro, and writes the data to Kafka, or converts the data back into SQL statements and sends them to the downstream MySQL or TiDB.

Currently, when TiCDC adapts data change information for the corresponding protocol, for specific `UPDATE` events, it might split them into one `DELETE` event and one `INSERT` event. For more information, see [Split `UPDATE` events for MySQL sinks](/ticdc/ticdc-split-update-behavior.md#split-update-events-for-mysql-sinks) and [Split primary or unique key `UPDATE` events for non-MySQL sinks](/ticdc/ticdc-split-update-behavior.md#split-primary-or-unique-key-update-events-for-non-mysql-sinks).

When the downstream is MySQL or TiDB, TiCDC cannot guarantee that the SQL statements written to the downstream are exactly the same as the SQL statements executed in the upstream. This is because TiCDC does not directly obtain the original DML statements executed in the upstream, but generates SQL statements based on the data change information. However, TiCDC ensures the consistency of the final results.

For example, the following SQL statement is executed in the upstream:

```sql
Create Table t1 (A int Primary Key, B int);

BEGIN;
Insert Into t1 values(1,2);
Insert Into t1 values(2,2);
Insert Into t1 values(3,3);
Commit;

Update t1 set b = 4 where b = 2;
```

TiCDC generates the following two SQL statements based on the data change information, and writes them to the downstream:

```sql
INSERT INTO `test.t1` (`A`,`B`) VALUES (1,2),(2,2),(3,3);
UPDATE `test`.`t1`
SET `A` = CASE
        WHEN `A` = 1 THEN 1
        WHEN `A` = 2 THEN 2
END, `B` = CASE
        WHEN `A` = 1 THEN 4
        WHEN `A` = 2 THEN 4
END
WHERE `A` = 1 OR `A` = 2;
```

## Unsupported scenarios

Currently, the following scenarios are not supported:

- The TiKV cluster that uses RawKV alone.
- The [DDL operation `CREATE SEQUENCE`](/sql-statements/sql-statement-create-sequence.md) and the [SEQUENCE function](/sql-statements/sql-statement-create-sequence.md#sequence-function) in TiDB. When the upstream TiDB uses `SEQUENCE`, TiCDC ignores `SEQUENCE` DDL operations/functions performed upstream. However, DML operations using `SEQUENCE` functions can be correctly replicated.
- Currently, performing [BR data recovery](/br/backup-and-restore-overview.md) and [TiDB Lightning](/tidb-lightning/tidb-lightning-overview.md) imports on tables and databases that are being replicated by TiCDC is not supported. For more information, see [Why does replication using TiCDC stall or even stop after data restore using TiDB Lightning and BR from upstream](/ticdc/ticdc-faq.md#why-does-replication-using-ticdc-stall-or-even-stop-after-data-restore-using-tidb-lightning-and-br-from-upstream).

TiCDC only provides partial support for scenarios of large transactions in the upstream. For details, refer to [Does TiCDC support replicating large transactions? Is there any risk?](/ticdc/ticdc-faq.md#does-ticdc-support-replicating-large-transactions-is-there-any-risk).
