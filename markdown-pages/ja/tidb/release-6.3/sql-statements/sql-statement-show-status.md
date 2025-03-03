---
title: SHOW [GLOBAL|SESSION] STATUS | TiDB SQL Statement Reference
summary: An overview of the usage of SHOW [GLOBAL|SESSION] STATUS for the TiDB database.
---

# [グローバル|セッション] ステータスを表示 {#show-global-session-status}

このステートメントは、MySQL との互換性のために含まれています。 `SHOW STATUS`の代わりに Prometheus と Grafana を集中メトリック収集に使用する TiDB には影響しません。

## あらすじ {#synopsis}

**表示ステートメント:**

![ShowStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowStmt.png)

**ShowTargetFilterable:**

![ShowTargetFilterable](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowTargetFilterable.png)

**グローバルスコープ:**

![GlobalScope](https://docs-download.pingcap.com/media/images/docs/sqlgram/GlobalScope.png)

## 例 {#examples}

```sql
mysql> show status;
+--------------------+--------------------------------------+
| Variable_name      | Value                                |
+--------------------+--------------------------------------+
| Ssl_cipher_list    |                                      |
| server_id          | 93e2e07d-6bb4-4a1b-90b7-e035fae154fe |
| ddl_schema_version | 141                                  |
| Ssl_verify_mode    | 0                                    |
| Ssl_version        |                                      |
| Ssl_cipher         |                                      |
+--------------------+--------------------------------------+
6 rows in set (0.01 sec)

mysql> show global status;
+--------------------+--------------------------------------+
| Variable_name      | Value                                |
+--------------------+--------------------------------------+
| Ssl_cipher         |                                      |
| Ssl_cipher_list    |                                      |
| Ssl_verify_mode    | 0                                    |
| Ssl_version        |                                      |
| server_id          | 93e2e07d-6bb4-4a1b-90b7-e035fae154fe |
| ddl_schema_version | 141                                  |
+--------------------+--------------------------------------+
6 rows in set (0.00 sec)
```

## MySQL の互換性 {#mysql-compatibility}

-   このステートメントは、MySQL との互換性のためにのみ含まれています。

## こちらもご覧ください {#see-also}

-   [フラッシュ状態](/sql-statements/sql-statement-flush-status.md)
