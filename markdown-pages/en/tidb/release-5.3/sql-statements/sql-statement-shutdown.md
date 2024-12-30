---
title: SHUTDOWN
summary: An overview of the usage of SHUTDOWN for the TiDB database.
---

# SHUTDOWN

The `SHUTDOWN` statement is used to perform a shutdown operation in TiDB. Execution of the `SHUTDOWN` statement requires the user to have `SHUTDOWN privilege`.

## Synopsis

**Statement:**

![Statement](https://download.pingcap.com/images/docs/sqlgram/ShutdownStmt.png)

## Examples


```sql
SHUTDOWN;
```

```
Query OK, 0 rows affected (0.00 sec)
```

## MySQL compatibility

> **Note:**
>
> Because TiDB is a distributed database, the shutdown operation in TiDB stops the client-connected TiDB instance, not the entire TiDB cluster.

The `SHUTDOWN` statement is partly compatible with MySQL. If you encounter any compatibility issues, you can report the issues [on GitHub](https://github.com/pingcap/tidb/issues/new/choose).
