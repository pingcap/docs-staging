---
title: SHOW PROFILES
summary: An overview of the usage of SHOW PROFILES for the TiDB database.
aliases: ['/docs/stable/sql-statements/sql-statement-show-profiles/','/docs/v4.0/sql-statements/sql-statement-show-profiles/']
---

# SHOW PROFILES

The `SHOW PROFILES` statement currently only returns an empty result.

## Synopsis

**ShowStmt:**

![ShowStmt](https://download.pingcap.com/images/docs/sqlgram/ShowStmt.png)

## Examples


```sql
SHOW PROFILES
```

```
Empty set (0.00 sec)
```

## MySQL compatibility

This statement is included only for compatibility with MySQL. Executing `SHOW PROFILES` always returns an empty result.
