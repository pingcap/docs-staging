---
title: SHOW CREATE USER | TiDB SQL Statement Reference
summary: An overview of the usage of SHOW CREATE USER for the TiDB database.
---

# ユーザーの作成を表示 {#show-create-user}

このステートメントは、 `CREATE USER`構文を使用してユーザーを再作成する方法を示しています。

## あらすじ {#synopsis}

**ShowCreateUserStmt:**

![ShowCreateUserStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowCreateUserStmt.png)

**ユーザー名:**

![Username](https://docs-download.pingcap.com/media/images/docs/sqlgram/Username.png)

## 例 {#examples}

```sql
mysql> SHOW CREATE USER 'root';
+--------------------------------------------------------------------------------------------------------------------------+
| CREATE USER for root@%                                                                                                   |
+--------------------------------------------------------------------------------------------------------------------------+
| CREATE USER 'root'@'%' IDENTIFIED WITH 'mysql_native_password' AS '' REQUIRE NONE PASSWORD EXPIRE DEFAULT ACCOUNT UNLOCK |
+--------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> SHOW GRANTS FOR 'root';
+-------------------------------------------+
| Grants for root@%                         |
+-------------------------------------------+
| GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' |
+-------------------------------------------+
1 row in set (0.00 sec)
```

## MySQL の互換性 {#mysql-compatibility}

-   `SHOW CREATE USER`の出力は MySQL と一致するように設計されていますが、 `CREATE`のオプションのいくつかはまだ TiDB でサポートされていません。まだサポートされていないオプションは解析されますが無視されます。詳細については、[セキュリティの互換性] を参照してください。

## こちらもご覧ください {#see-also}

-   [ユーザーを作成](/sql-statements/sql-statement-create-user.md)
-   [助成金を表示](/sql-statements/sql-statement-show-grants.md)
-   [ユーザーをドロップ](/sql-statements/sql-statement-drop-user.md)
