---
title: CREATE USER
summary: TiDB 数据库中 CREATE USER 的使用概况。
aliases: ['/docs-cn/dev/sql-statements/sql-statement-create-user/','/docs-cn/dev/reference/sql/statements/create-user/']
---

# CREATE USER

`CREATE USER` 语句用于创建带有指定密码的新用户。和 MySQL 一样，在 TiDB 权限系统中，用户是用户名和用户名所连接主机的组合。因此，可创建一个用户 `'newuser2'@'192.168.1.1'`，使其只能通过 IP 地址 `192.168.1.1` 进行连接。相同的用户名从不同主机登录时可能会拥有不同的权限。

## 语法图

```ebnf+diagram
CreateUserStmt ::=
    'CREATE' 'USER' IfNotExists UserSpecList RequireClauseOpt ConnectionOptions PasswordOption LockOption AttributeOption ResourceGroupNameOption

IfNotExists ::=
    ('IF' 'NOT' 'EXISTS')?

UserSpecList ::=
    UserSpec ( ',' UserSpec )*

RequireClauseOpt ::=
    ( 'REQUIRE' 'NONE' | 'REQUIRE' 'SSL' | 'REQUIRE' 'X509' | 'REQUIRE' RequireList )?

RequireList ::=
    ( "ISSUER" stringLit | "SUBJECT" stringLit | "CIPHER" stringLit | "SAN" stringLit | "TOKEN_ISSUER" stringLit )*

UserSpec ::=
    Username AuthOption

AuthOption ::=
    ( 'IDENTIFIED' ( 'BY' ( AuthString | 'PASSWORD' HashString ) | 'WITH' StringName ( 'BY' AuthString | 'AS' HashString )? ) )?

StringName ::=
    stringLit
|   Identifier

ConnectionOptions ::=
    ( 'WITH' 'MAX_USER_CONNECTIONS' N )?

PasswordOption ::= ( 'PASSWORD' 'EXPIRE' ( 'DEFAULT' | 'NEVER' | 'INTERVAL' N 'DAY' )?
| 'PASSWORD' 'HISTORY' ( 'DEFAULT' | N )
| 'PASSWORD' 'REUSE' 'INTERVAL' ( 'DEFAULT' | N 'DAY' )
| 'PASSWORD' 'REQUIRE' 'CURRENT' 'DEFAULT'
| 'FAILED_LOGIN_ATTEMPTS' N
| 'PASSWORD_LOCK_TIME' ( N | 'UNBOUNDED' ) )*

LockOption ::= ( 'ACCOUNT' 'LOCK' | 'ACCOUNT' 'UNLOCK' )?

AttributeOption ::= ( 'COMMENT' CommentString | 'ATTRIBUTE' AttributeString )?

ResourceGroupNameOption::= ( 'RESOURCE' 'GROUP' Identifier)?

RequireClauseOpt ::= ('REQUIRE' ('NONE' | 'SSL' | 'X509' | RequireListElement ('AND'? RequireListElement)*))?

RequireListElement ::= 'ISSUER' Issuer | 'SUBJECT' Subject | 'CIPHER' Cipher | 'SAN' SAN | 'TOKEN_ISSUER' TokenIssuer
```

## 示例

创建一个密码为 `newuserpassword` 的用户。


```sql
CREATE USER 'newuser' IDENTIFIED BY 'newuserpassword';
```

```
Query OK, 1 row affected (0.04 sec)
```

创建一个只能在 `192.168.1.1` 登录的用户，密码为 `newuserpassword`。


```sql
CREATE USER 'newuser2'@'192.168.1.1' IDENTIFIED BY 'newuserpassword';
```

```
Query OK, 1 row affected (0.02 sec)
```

创建一个要求在登录时使用 TLS 连接的用户。


```sql
CREATE USER 'newuser3'@'%' IDENTIFIED BY 'newuserpassword' REQUIRE SSL;
```

```
Query OK, 1 row affected (0.02 sec)
```

创建一个要求在登录时提供指定客户端证书的用户。


```sql
CREATE USER 'newuser4'@'%' IDENTIFIED BY 'newuserpassword' REQUIRE ISSUER '/C=US/ST=California/L=San Francisco/O=PingCAP';
```

```
Query OK, 1 row affected (0.02 sec)
```

创建一个初始状态下被锁住的用户。


```sql
CREATE USER 'newuser5'@'%' ACCOUNT LOCK;
```

```
Query OK, 1 row affected (0.02 sec)
```

创建一个带注释的用户。

```sql
CREATE USER 'newuser6'@'%' COMMENT 'This user is created only for test';
SELECT * FROM information_schema.user_attributes;
```

```
+-----------+------+---------------------------------------------------+
| USER      | HOST | ATTRIBUTE                                         |
+-----------+------+---------------------------------------------------+
| newuser6  | %    | {"comment": "This user is created only for test"} |
+-----------+------+---------------------------------------------------+
1 rows in set (0.00 sec)
```

创建一个具有邮箱 (`email`) 属性的用户。

```sql
CREATE USER 'newuser7'@'%' ATTRIBUTE '{"email": "user@pingcap.com"}';
SELECT * FROM information_schema.user_attributes;
```

```sql
+-----------+------+---------------------------------------------------+
| USER      | HOST | ATTRIBUTE                                         |
+-----------+------+---------------------------------------------------+
| newuser7  | %    | {"email": "user@pingcap.com"} |
+-----------+------+---------------------------------------------------+
1 rows in set (0.00 sec)
```

创建一个禁止重复使用最近 5 次密码的用户。

```sql
CREATE USER 'newuser8'@'%' PASSWORD HISTORY 5;
```

```
Query OK, 1 row affected (0.02 sec)
```

创建一个密码已经手动过期的用户。

```sql
CREATE USER 'newuser9'@'%' PASSWORD EXPIRE;
```

```
Query OK, 1 row affected (0.02 sec)
```

创建一个限制最大连接数为 3 的用户。

```sql
CREATE USER 'newuser10'@'%' WITH MAX_USER_CONNECTIONS 3;
SELECT User, Host, max_user_connections FROM mysql.user WHERE User='newuser10';
```

```
+-----------+------+----------------------+
| user      | host | max_user_connections |
+-----------+------+----------------------+
| newuser10 | %    |                    3 |
+-----------+------+----------------------+
1 row in set (0.01 sec)
```

创建一个使用资源组 `rg1` 的用户：

```sql
CREATE USER 'newuser11'@'%' RESOURCE GROUP rg1;
SELECT USER, HOST, USER_ATTRIBUTES FROM MYSQL.USER WHERE USER='newuser11';
```

```sql
+-----------+------+---------------------------------------------------+
| USER      | HOST | USER_ATTRIBUTES                                   |
+-----------+------+---------------------------------------------------+
| newuser11 | %    | {"resource_group": "rg1"}                         |
+-----------+------+---------------------------------------------------+
1 rows in set (0.00 sec)
```

## MySQL 兼容性

TiDB 不支持以下 `CREATE USER` 选项。这些选项可被解析，但会被忽略。

* `PASSWORD REQUIRE CURRENT DEFAULT`
* `WITH MAX_QUERIES_PER_HOUR`
* `WITH MAX_UPDATES_PER_HOUR`

TiDB 也不支持以下 `CREATE USER` 选项。这些选项无法被语法解析器解析。

* `DEFAULT ROLE`
* `PASSWORD REQUIRE CURRENT OPTIONAL`

## 另请参阅

* [Security Compatibility with MySQL](/security-compatibility-with-mysql.md)
* [DROP USER](/sql-statements/sql-statement-drop-user.md)
* [SHOW CREATE USER](/sql-statements/sql-statement-show-create-user.md)
* [ALTER USER](/sql-statements/sql-statement-alter-user.md)
* [Privilege Management](/privilege-management.md)
