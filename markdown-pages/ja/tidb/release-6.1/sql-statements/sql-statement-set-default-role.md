---
title: SET DEFAULT ROLE | TiDB SQL Statement Reference
summary: An overview of the usage of SET DEFAULT ROLE for the TiDB database.
---

# <code>SET DEFAULT ROLE</code> {#code-set-default-role-code}

このステートメントは、デフォルトでユーザーに適用される特定のロールを設定します。したがって、 `SET ROLE <rolename>`または`SET ROLE ALL`を実行しなくても、ロールに関連付けられた権限が自動的に付与されます。

## あらすじ {#synopsis}

**SetDefaultRoleStmt:**

![SetDefaultRoleStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/SetDefaultRoleStmt.png)

**SetDefaultRoleOpt:**

![SetDefaultRoleOpt](https://docs-download.pingcap.com/media/images/docs/sqlgram/SetDefaultRoleOpt.png)

**RolenameList:**

![RolenameList](https://docs-download.pingcap.com/media/images/docs/sqlgram/RolenameList.png)

**ユーザー名リスト:**

![UsernameList](https://docs-download.pingcap.com/media/images/docs/sqlgram/UsernameList.png)

## 例 {#examples}

分析チーム用の新しいロールと、 `jennifer`という名前の新しいユーザーを作成します。

```sql
$ mysql -uroot
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 37
Server version: 5.7.25-TiDB-v4.0.0-beta.2-728-ga9177fe84 TiDB Server (Apache License 2.0) Community Edition, MySQL 5.7 compatible

Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> CREATE ROLE analyticsteam;
Query OK, 0 rows affected (0.02 sec)

mysql> GRANT SELECT ON test.* TO analyticsteam;
Query OK, 0 rows affected (0.02 sec)

mysql> CREATE USER jennifer;
Query OK, 0 rows affected (0.01 sec)

mysql> GRANT analyticsteam TO jennifer;
Query OK, 0 rows affected (0.01 sec)
```

ロールに関連付けられた権限を使用できるようにするには、デフォルトで`jennifer` ～ `SET ROLE analyticsteam`が必要であることに注意してください。

```sql
$ mysql -ujennifer
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 32
Server version: 5.7.25-TiDB-v4.0.0-beta.2-728-ga9177fe84 TiDB Server (Apache License 2.0) Community Edition, MySQL 5.7 compatible

Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> SHOW GRANTS;
+---------------------------------------------+
| Grants for User                             |
+---------------------------------------------+
| GRANT USAGE ON *.* TO 'jennifer'@'%'        |
| GRANT 'analyticsteam'@'%' TO 'jennifer'@'%' |
+---------------------------------------------+
2 rows in set (0.00 sec)

mysql> SHOW TABLES in test;
ERROR 1044 (42000): Access denied for user 'jennifer'@'%' to database 'test'
mysql> SET ROLE analyticsteam;
Query OK, 0 rows affected (0.00 sec)

mysql> SHOW GRANTS;
+---------------------------------------------+
| Grants for User                             |
+---------------------------------------------+
| GRANT USAGE ON *.* TO 'jennifer'@'%'        |
| GRANT Select ON test.* TO 'jennifer'@'%'    |
| GRANT 'analyticsteam'@'%' TO 'jennifer'@'%' |
+---------------------------------------------+
3 rows in set (0.00 sec)

mysql> SHOW TABLES IN test;
+----------------+
| Tables_in_test |
+----------------+
| t1             |
+----------------+
1 row in set (0.00 sec)
```

ステートメント`SET DEFAULT ROLE`を使用してロールを`jennifer`に関連付けることができるため、ロールに関連付けられた権限を引き受けるためにステートメント`SET ROLE`を実行する必要はありません。

```sql
$ mysql -uroot
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 34
Server version: 5.7.25-TiDB-v4.0.0-beta.2-728-ga9177fe84 TiDB Server (Apache License 2.0) Community Edition, MySQL 5.7 compatible

Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> SET DEFAULT ROLE analyticsteam TO jennifer;
Query OK, 0 rows affected (0.02 sec)
```

```sql
$ mysql -ujennifer
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 35
Server version: 5.7.25-TiDB-v4.0.0-beta.2-728-ga9177fe84 TiDB Server (Apache License 2.0) Community Edition, MySQL 5.7 compatible

Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> SHOW GRANTS;
+---------------------------------------------+
| Grants for User                             |
+---------------------------------------------+
| GRANT USAGE ON *.* TO 'jennifer'@'%'        |
| GRANT Select ON test.* TO 'jennifer'@'%'    |
| GRANT 'analyticsteam'@'%' TO 'jennifer'@'%' |
+---------------------------------------------+
3 rows in set (0.00 sec)

mysql> SHOW TABLES IN test;
+----------------+
| Tables_in_test |
+----------------+
| t1             |
+----------------+
1 row in set (0.00 sec)
```

`SET DEFAULT ROLE`は自動的に`GRANT`ロールをユーザーに関連付けません。 `jennifer`が付与していないロールに対して`SET DEFAULT ROLE`を実行しようとすると、次のエラーが発生します。

```sql
mysql> SET DEFAULT ROLE analyticsteam TO jennifer;
ERROR 3530 (HY000): `analyticsteam`@`%` is is not granted to jennifer@%
```

## MySQL の互換性 {#mysql-compatibility}

このステートメントは、MySQL 8.0 の機能であるロールと完全に互換性があると理解されています。互換性の違いは、GitHub で[問題を介して報告された](https://github.com/pingcap/tidb/issues/new/choose)にする必要があります。

## こちらもご覧ください {#see-also}

-   [役割を作成](/sql-statements/sql-statement-create-role.md)
-   [ロールを削除](/sql-statements/sql-statement-drop-role.md)
-   [`GRANT &#x3C;role>`](/sql-statements/sql-statement-grant-role.md)
-   [`REVOKE &#x3C;role>`](/sql-statements/sql-statement-revoke-role.md)
-   [ロールを設定](/sql-statements/sql-statement-set-role.md)

<CustomContent platform="tidb">

-   [役割ベースのアクセス制御](/role-based-access-control.md)

</CustomContent>
