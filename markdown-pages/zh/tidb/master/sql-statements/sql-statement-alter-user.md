---
title: ALTER USER
summary: TiDB 数据库中 ALTER USER 的使用概况。
aliases: ['/docs-cn/dev/sql-statements/sql-statement-alter-user/','/docs-cn/dev/reference/sql/statements/alter-user/']
---

# ALTER USER

`ALTER USER` 语句用于更改 TiDB 权限系统内的已有用户。和 MySQL 一样，在 TiDB 权限系统中，用户是用户名和用户名所连接主机的组合。因此，可创建一个用户 `'newuser2'@'192.168.1.1'`，使其只能通过 IP 地址 `192.168.1.1` 进行连接。相同的用户名从不同主机登录时可能会拥有不同的权限。

## 语法图

```ebnf+diagram
AlterUserStmt ::=
    'ALTER' 'USER' IfExists (UserSpecList RequireClauseOpt ConnectionOptions PasswordOption LockOption AttributeOption | 'USER' '(' ')' 'IDENTIFIED' 'BY' AuthString) ResourceGroupNameOption

UserSpecList ::=
    UserSpec ( ',' UserSpec )*

UserSpec ::=
    Username AuthOption

RequireClauseOpt ::=
    ( 'REQUIRE' 'NONE' | 'REQUIRE' 'SSL' | 'REQUIRE' 'X509' | 'REQUIRE' RequireList )?

RequireList ::=
    ( "ISSUER" stringLit | "SUBJECT" stringLit | "CIPHER" stringLit | "SAN" stringLit | "TOKEN_ISSUER" stringLit )*

Username ::=
    StringName ('@' StringName | singleAtIdentifier)? | 'CURRENT_USER' OptionalBraces

AuthOption ::=
    ( 'IDENTIFIED' ( 'BY' ( AuthString | 'PASSWORD' HashString ) | 'WITH' StringName ( 'BY' AuthString | 'AS' HashString )? ) )?

ConnectionOptions ::=
    ( 'WITH' 'MAX_USER_CONNECTIONS' N )?

PasswordOption ::= ( 'PASSWORD' 'EXPIRE' ( 'DEFAULT' | 'NEVER' | 'INTERVAL' N 'DAY' )? | 'PASSWORD' 'HISTORY' ( 'DEFAULT' | N ) | 'PASSWORD' 'REUSE' 'INTERVAL' ( 'DEFAULT' | N 'DAY' ) | 'FAILED_LOGIN_ATTEMPTS' N | 'PASSWORD_LOCK_TIME' ( N | 'UNBOUNDED' ) )*

LockOption ::= ( 'ACCOUNT' 'LOCK' | 'ACCOUNT' 'UNLOCK' )?

AttributeOption ::= ( 'COMMENT' CommentString | 'ATTRIBUTE' AttributeString )?

ResourceGroupNameOption::= ( 'RESOURCE' 'GROUP' Identifier)?

RequireClauseOpt ::= ('REQUIRE' ('NONE' | 'SSL' | 'X509' | RequireListElement ('AND'? RequireListElement)*))?

RequireListElement ::= 'ISSUER' Issuer | 'SUBJECT' Subject | 'CIPHER' Cipher | 'SAN' SAN | 'TOKEN_ISSUER' TokenIssuer
```

## 示例


```sql
CREATE USER 'newuser' IDENTIFIED BY 'newuserpassword';
```

```
Query OK, 1 row affected (0.01 sec)
```


```sql
SHOW CREATE USER 'newuser';
```

```
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| CREATE USER for newuser@%                                                                                                                                            |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| CREATE USER 'newuser'@'%' IDENTIFIED WITH 'mysql_native_password' AS '*5806E04BBEE79E1899964C6A04D68BCA69B1A879' REQUIRE NONE PASSWORD EXPIRE DEFAULT ACCOUNT UNLOCK |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

### 修改用户基本信息

修改用户 `newuser` 的密码：

```sql
ALTER USER 'newuser' IDENTIFIED BY 'newnewpassword';
```

```
Query OK, 0 rows affected (0.02 sec)
```


```sql
SHOW CREATE USER 'newuser';
```

```
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| CREATE USER for newuser@%                                                                                                                                            |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| CREATE USER 'newuser'@'%' IDENTIFIED WITH 'mysql_native_password' AS '*FB8A1EA1353E8775CA836233E367FBDFCB37BE73' REQUIRE NONE PASSWORD EXPIRE DEFAULT ACCOUNT UNLOCK |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

锁定用户 `newuser`：

```sql
ALTER USER 'newuser' ACCOUNT LOCK;
```

```
Query OK, 0 rows affected (0.02 sec)
```

修改 `newuser` 的属性：

```sql
ALTER USER 'newuser' ATTRIBUTE '{"newAttr": "value", "deprecatedAttr": null}';
SELECT * FROM information_schema.user_attributes;
```

```sql
+-----------+------+--------------------------+
| USER      | HOST | ATTRIBUTE                |
+-----------+------+--------------------------+
| newuser   | %    | {"newAttr": "value"}     |
+-----------+------+--------------------------+
1 rows in set (0.00 sec)
```

通过 `ALTER USER ... COMMENT` 修改用户 `newuser` 的注释：

```sql
ALTER USER 'newuser' COMMENT 'Here is the comment';
SELECT * FROM information_schema.user_attributes;
```

```sql
+-----------+------+--------------------------------------------------------+
| USER      | HOST | ATTRIBUTE                                              |
+-----------+------+--------------------------------------------------------+
| newuser   | %    | {"comment": "Here is the comment", "newAttr": "value"} |
+-----------+------+--------------------------------------------------------+
1 rows in set (0.00 sec)
```

通过 `ALTER USER ... ATTRIBUTE` 删除用户 `newuser` 的注释：

```sql
ALTER USER 'newuser' ATTRIBUTE '{"comment": null}';
SELECT * FROM information_schema.user_attributes;
```

```sql
+-----------+------+---------------------------+
| USER      | HOST | ATTRIBUTE                 |
+-----------+------+---------------------------+
| newuser   | %    | {"newAttr": "value"}      |
+-----------+------+---------------------------+
1 rows in set (0.00 sec)
```

通过 `ALTER USER ... PASSWORD EXPIRE NEVER` 修改用户 `newuser` 的自动密码过期策略为永不过期：

```sql
ALTER USER 'newuser' PASSWORD EXPIRE NEVER;
```

```
Query OK, 0 rows affected (0.02 sec)
```

通过 `ALTER USER ... PASSWORD REUSE INTERVAL ... DAY` 修改用户 `newuser` 的密码重用策略为不允许重复使用最近 90 天内使用过的密码：

```sql
ALTER USER 'newuser' PASSWORD REUSE INTERVAL 90 DAY;
```

```
Query OK, 0 rows affected (0.02 sec)
```

通过 `ALTER USER ... WITH MAX_USER_CONNECTIONS N` 修改用户 `newuser` 允许登录的最大连接数：

```sql
ALTER USER 'newuser' WITH MAX_USER_CONNECTIONS 3;
SELECT User, Host, max_user_connections FROM mysql.user WHERE User='newuser';
```

```
+---------+------+----------------------+
| User    | Host | max_user_connections |
+---------+------+----------------------+
| newuser | %    |                    3 |
+---------+------+----------------------+
1 row in set (0.01 sec)
```

### 修改用户绑定的资源组

通过 `ALTER USER ... RESOURCE GROUP` 修改用户 `newuser` 的资源组到 `rg1`：

```sql
ALTER USER 'newuser' RESOURCE GROUP rg1;
```

```
Query OK, 0 rows affected (0.02 sec)
```

查看当前用户绑定的资源组：

```sql
SELECT USER, JSON_EXTRACT(User_attributes, "$.resource_group") FROM mysql.user WHERE user = "newuser";
```

```
+---------+---------------------------------------------------+
| USER    | JSON_EXTRACT(User_attributes, "$.resource_group") |
+---------+---------------------------------------------------+
| newuser | "rg1"                                             |
+---------+---------------------------------------------------+
1 row in set (0.02 sec)
```

取消用户绑定的资源组，即将用户绑定到 `default` 资源组。

```sql
ALTER USER 'newuser' RESOURCE GROUP `default`;
SELECT USER, JSON_EXTRACT(User_attributes, "$.resource_group") FROM mysql.user WHERE user = "newuser";
```

```
+---------+---------------------------------------------------+
| USER    | JSON_EXTRACT(User_attributes, "$.resource_group") |
+---------+---------------------------------------------------+
| newuser | "default"                                         |
+---------+---------------------------------------------------+
1 row in set (0.02 sec)
```

## 另请参阅

* [TiDB 用户账户管理](/user-account-management.md)
* [TiDB 与 MySQL 安全特性差异](/security-compatibility-with-mysql.md)
* [CREATE USER](/sql-statements/sql-statement-create-user.md)
* [DROP USER](/sql-statements/sql-statement-drop-user.md)
* [SHOW CREATE USER](/sql-statements/sql-statement-show-create-user.md)
