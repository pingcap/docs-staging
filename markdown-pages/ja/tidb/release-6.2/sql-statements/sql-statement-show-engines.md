---
title: SHOW ENGINES | TiDB SQL Statement Reference
summary: An overview of the usage of SHOW ENGINES for the TiDB database.
---

# エンジンを表示 {#show-engines}

このステートメントは、サポートされているすべてのストレージ エンジンを一覧表示するために使用されます。この構文は、MySQL との互換性のためにのみ含まれています。

## あらすじ {#synopsis}

**ShowEnginesStmt:**

![ShowEnginesStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowEnginesStmt.png)

```sql
SHOW ENGINES
```

## 例 {#examples}

```sql
mysql> SHOW ENGINES;
+--------+---------+------------------------------------------------------------+--------------+------+------------+
| Engine | Support | Comment                                                    | Transactions | XA   | Savepoints |
+--------+---------+------------------------------------------------------------+--------------+------+------------+
| InnoDB | DEFAULT | Supports transactions, row-level locking, and foreign keys | YES          | YES  | YES        |
+--------+---------+------------------------------------------------------------+--------------+------+------------+
1 row in set (0.00 sec)
```

## MySQL の互換性 {#mysql-compatibility}

-   このステートメントは、サポートされているエンジンとして常に InnoDB のみを返します。内部的には、TiDB は通常 TiKV をストレージ エンジンとして使用します。
