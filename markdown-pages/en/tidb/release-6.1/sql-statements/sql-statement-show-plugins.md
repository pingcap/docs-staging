---
title: SHOW PLUGINS
summary: An overview of the usage of SHOW PLUGINS for the TiDB database.
---

# SHOW PLUGINS

`SHOW PLUGINS` shows all plugins installed in TiDB, including each plugin's status and version information.

## Synopsis

**ShowStmt:**

![ShowStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowStmt.png)

**ShowTargetFilterable:**

![ShowTargetFilterable](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowTargetFilterable.png)

## Examples


```sql
SHOW PLUGINS;
```

```
+-------+--------------+-------+-----------------------------+---------+---------+
| Name  | Status       | Type  | Library                     | License | Version |
+-------+--------------+-------+-----------------------------+---------+---------+
| audit | Ready-enable | Audit | /tmp/tidb/plugin/audit-1.so |         | 1       |
+-------+--------------+-------+-----------------------------+---------+---------+
1 row in set (0.000 sec)
```


```sql
SHOW PLUGINS LIKE 'a%';
```

```
+-------+--------------+-------+-----------------------------+---------+---------+
| Name  | Status       | Type  | Library                     | License | Version |
+-------+--------------+-------+-----------------------------+---------+---------+
| audit | Ready-enable | Audit | /tmp/tidb/plugin/audit-1.so |         | 1       |
+-------+--------------+-------+-----------------------------+---------+---------+
1 row in set (0.000 sec)
```

## MySQL compatibility

This statement is understood to be fully compatible with MySQL. Any compatibility differences should be [reported via an issue](https://github.com/pingcap/tidb/issues/new/choose) on GitHub.
