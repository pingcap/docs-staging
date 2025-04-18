---
title: CLUSTER_CONFIG
summary: Learn the `CLUSTER_CONFIG` information_schema table.
---

# CLUSTER_CONFIG

You can use the `CLUSTER_CONFIG` cluster configuration table to get the current configuration of all server components in the cluster. This simplifies the usage over earlier releases of TiDB, where obtaining similar information would require accessing the HTTP API endpoints of each instance.

> **Note:**
>
> This table is only applicable to TiDB Self-Managed and not available on [TiDB Cloud](https://docs.pingcap.com/tidbcloud/).


```sql
USE information_schema;
DESC cluster_config;
```

```sql
+----------+--------------+------+------+---------+-------+
| Field    | Type         | Null | Key  | Default | Extra |
+----------+--------------+------+------+---------+-------+
| TYPE     | varchar(64)  | YES  |      | NULL    |       |
| INSTANCE | varchar(64)  | YES  |      | NULL    |       |
| KEY      | varchar(256) | YES  |      | NULL    |       |
| VALUE    | varchar(128) | YES  |      | NULL    |       |
+----------+--------------+------+------+---------+-------+
```

Field description:

* `TYPE`: The instance type. The optional values are `tidb`, `pd`, and `tikv`.
* `INSTANCE`: The service address of the instance.
* `KEY`: The configuration item name.
* `VALUE`: The configuration item value.

The following example shows how to query the `coprocessor` configuration on the TiKV instance using the `CLUSTER_CONFIG` table:


```sql
SELECT * FROM cluster_config WHERE type='tikv' AND `key` LIKE 'coprocessor%';
```

```sql
+------+-----------------+-----------------------------------+---------+
| TYPE | INSTANCE        | KEY                               | VALUE   |
+------+-----------------+-----------------------------------+---------+
| tikv | 127.0.0.1:20165 | coprocessor.batch-split-limit     | 10      |
| tikv | 127.0.0.1:20165 | coprocessor.region-max-keys       | 3840000 |
| tikv | 127.0.0.1:20165 | coprocessor.region-max-size       | 384MiB  |
| tikv | 127.0.0.1:20165 | coprocessor.region-split-keys     | 2560000  |
| tikv | 127.0.0.1:20165 | coprocessor.region-split-size     | 256MiB   |
| tikv | 127.0.0.1:20165 | coprocessor.split-region-on-table | false   |
+------+-----------------+-----------------------------------+---------+
6 rows in set (0.00 sec)
```
