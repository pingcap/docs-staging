---
title: SHOW DRAINER STATUS
summary: An overview of the usage of SHOW DRAINER STATUS for the TiDB database.
aliases: ['/tidb/dev/sql-statement-show-drainer-status/','/tidb/stable/sql-statement-show-drainer-status/','/docs/dev/sql-statements/sql-statement-show-drainer-status/']
---

# SHOW DRAINER STATUS

The `SHOW DRAINER STATUS` statement displays the status information for all Drainer nodes in the cluster.

> **Note:**
>
> This feature is only applicable to TiDB Self-Hosted and not available on [TiDB Cloud](https://docs.pingcap.com/tidbcloud/).

## Examples


```sql
SHOW DRAINER STATUS;
```

```sql
+----------|----------------|--------|--------------------|---------------------|
|  NodeID  |     Address    | State  |   Max_Commit_Ts    |    Update_Time      |
+----------|----------------|--------|--------------------|---------------------|
| drainer1 | 127.0.0.3:8249 | Online | 408553768673342532 | 2019-05-01 00:00:03 |
+----------|----------------|--------|--------------------|---------------------|
| drainer2 | 127.0.0.4:8249 | Online | 408553768673345531 | 2019-05-01 00:00:04 |
+----------|----------------|--------|--------------------|---------------------|
2 rows in set (0.00 sec)
```

## MySQL compatibility

This statement is a TiDB extension to MySQL syntax.

## See also

* [SHOW PUMP STATUS](/sql-statements/sql-statement-show-pump-status.md)
* [CHANGE PUMP STATUS](/sql-statements/sql-statement-change-pump.md)
* [CHANGE DRAINER STATUS](/sql-statements/sql-statement-change-drainer.md)
