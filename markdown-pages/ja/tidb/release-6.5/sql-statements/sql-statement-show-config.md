---
title: SHOW CONFIG
summary: Overview of the use of SHOW CONFIG in the TiDB database
---

# 構成を表示 {#show-config}

`SHOW CONFIG`ステートメントは、TiDB のさまざまなコンポーネントの現在の構成を表示するために使用されます。構成変数とシステム変数は異なる次元で機能するため、混同しないでください。システム変数情報を取得する場合は、 [変数を表示](/sql-statements/sql-statement-show-variables.md)構文を使用します。

## あらすじ {#synopsis}

**表示ステートメント:**

![ShowStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowStmt.png)

**ShowTargetFilterable:**

![ShowTargetFilterable](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowTargetFilterable.png)

## 例 {#examples}

すべての構成を表示:


```sql
SHOW CONFIG;
```

```
+------+----------------+-------------------------------------------------+---------------------------------------------------------------------+
| Type | Instance       | Name                                            | Value                                                               |
+------+----------------+-------------------------------------------------+---------------------------------------------------------------------+
| tidb | 127.0.0.1:4000 | advertise-address                               | 127.0.0.1                                                           |
| tidb | 127.0.0.1:4000 | binlog.binlog-socket                            |                                                                     |
| tidb | 127.0.0.1:4000 | binlog.enable                                   | false                                                               |
...
120 rows in set (0.01 sec)
```

`type`が`tidb`である構成を表示します。


```sql
SHOW CONFIG WHERE type = 'tidb' AND name = 'advertise-address';
```

```
+------+----------------+-------------------+-----------+
| Type | Instance       | Name              | Value     |
+------+----------------+-------------------+-----------+
| tidb | 127.0.0.1:4000 | advertise-address | 127.0.0.1 |
+------+----------------+-------------------+-----------+
1 row in set (0.05 sec)
```

`LIKE`節を使用して、 `type`が`tidb`である構成を示すこともできます。


```sql
SHOW CONFIG LIKE 'tidb';
```

```
+------+----------------+-------------------------------------------------+---------------------------------------------------------------------+
| Type | Instance       | Name                                            | Value                                                               |
+------+----------------+-------------------------------------------------+---------------------------------------------------------------------+
| tidb | 127.0.0.1:4000 | advertise-address                               | 127.0.0.1                                                           |
| tidb | 127.0.0.1:4000 | binlog.binlog-socket                            |                                                                     |
| tidb | 127.0.0.1:4000 | binlog.enable                                   | false                                                               |
...
40 rows in set (0.01 sec)
```

## MySQL の互換性 {#mysql-compatibility}

このステートメントは、MySQL 構文に対する TiDB 拡張です。

## こちらもご覧ください {#see-also}

-   [変数を表示](/sql-statements/sql-statement-show-variables.md)
