---
title: SET ROLE | TiDB SQL Statement Reference
summary: An overview of the usage of SET ROLE for the TiDB database.
---

# ロールを設定 {#set-role}

`SET ROLE`ステートメントは、現在のセッションでロールを有効にするために使用されます。ロールを有効にすると、ユーザーはロールの権限を使用できます。

## あらすじ {#synopsis}

**SetRoleStmt:**

![SetRoleStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/SetRoleStmt.png)

**SetRoleOpt:**

![SetRoleOpt](https://docs-download.pingcap.com/media/images/docs/sqlgram/SetRoleOpt.png)

**SetDefaultRoleOpt:**

![SetDefaultRoleOpt](https://docs-download.pingcap.com/media/images/docs/sqlgram/SetDefaultRoleOpt.png)

## 例 {#examples}

ユーザー`'u1'@'%'`と 3 つのロール ( `'r1'@'%'` 、 `'r2'@'%'` 、および`'r3'@'%'` ) を作成します。これらのロールを`'u1'@'%'`に付与し、 `'r1'@'%'`をデフォルトのロール`'u1'@'%'`として設定します。


```sql
CREATE USER 'u1'@'%';
CREATE ROLE 'r1', 'r2', 'r3';
GRANT 'r1', 'r2', 'r3' TO 'u1'@'%';
SET DEFAULT ROLE 'r1' TO 'u1'@'%';
```

`'u1'@'%'`としてログインし、次の`SET ROLE`のステートメントを実行してすべてのロールを有効にします。


```sql
SET ROLE ALL;
SELECT CURRENT_ROLE();
```

```
+----------------------------+
| CURRENT_ROLE()             |
+----------------------------+
| `r1`@`%`,`r2`@`%`,`r3`@`%` |
+----------------------------+
1 row in set (0.000 sec)
```

`'r2'`と`'r3'`を有効にするには、次の`SET ROLE`ステートメントを実行します。


```sql
SET ROLE 'r2', 'r3';
SELECT CURRENT_ROLE();
```

```
+-------------------+
| CURRENT_ROLE()    |
+-------------------+
| `r2`@`%`,`r3`@`%` |
+-------------------+
1 row in set (0.000 sec)
```

次の`SET ROLE`のステートメントを実行して、デフォルトの役割を有効にします。


```sql
SET ROLE DEFAULT;
SELECT CURRENT_ROLE();
```

```
+----------------+
| CURRENT_ROLE() |
+----------------+
| `r1`@`%`       |
+----------------+
1 row in set (0.000 sec)
```

次の`SET ROLE`のステートメントを実行して、有効なすべてのロールをキャンセルします。


```sql
SET ROLE NONE;
SELECT CURRENT_ROLE();
```

```
+----------------+
| CURRENT_ROLE() |
+----------------+
|                |
+----------------+
1 row in set (0.000 sec)
```

## MySQL の互換性 {#mysql-compatibility}

このステートメントは、MySQL 8.0 の機能であるロールと完全に互換性があると理解されています。互換性の違いは、GitHub で[問題を介して報告された](https://github.com/pingcap/tidb/issues/new/choose)にする必要があります。

## こちらもご覧ください {#see-also}

-   [役割を作成](/sql-statements/sql-statement-create-role.md)
-   [ロールを削除](/sql-statements/sql-statement-drop-role.md)
-   [`GRANT &#x3C;role>`](/sql-statements/sql-statement-grant-role.md)
-   [`REVOKE &#x3C;role>`](/sql-statements/sql-statement-revoke-role.md)
-   [デフォルトの役割を設定](/sql-statements/sql-statement-set-default-role.md)

<CustomContent platform="tidb">

-   [役割ベースのアクセス制御](/role-based-access-control.md)

</CustomContent>
