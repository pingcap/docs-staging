---
title: GRANT <privileges>
summary: TiDB 数据库中 GRANT <privileges> 的使用概况。
---

# `GRANT <privileges>`

`GRANT <privileges>` 语句用于为 TiDB 中已存在的用户分配权限。TiDB 中的权限系统同 MySQL 一样，都基于数据库/表模式来分配凭据。执行 `GRANT <privileges>` 语句需要拥有分配的权限，并且拥有 `GRANT OPTION` 权限。

## 语法图

```ebnf+diagram
GrantStmt ::=
    'GRANT' PrivElemList 'ON' ObjectType PrivLevel 'TO' UserSpecList RequireClauseOpt WithGrantOptionOpt

PrivElemList ::=
    PrivElem ( ',' PrivElem )*

PrivElem ::=
    PrivType ( '(' ColumnNameList ')' )?

PrivType ::=
    'ALL' 'PRIVILEGES'?
|    'ALTER' 'ROUTINE'?
|   'CREATE' ( 'USER' | 'TEMPORARY' 'TABLES' | 'VIEW' | 'ROLE' | 'ROUTINE' )?
|   'TRIGGER'
|   'DELETE'
|   'DROP' 'ROLE'?
|    'PROCESS'
|   'EXECUTE'
|   'INDEX'
|   'INSERT'
|   'SELECT'
|   'SUPER'
|   'SHOW' ( 'DATABASES' | 'VIEW' )
|   'UPDATE'
|    'GRANT' 'OPTION'
|    'REFERENCES'
|    'REPLICATION' ( 'SLAVE' | 'CLIENT' )
|    'USAGE'
|   'RELOAD'
|   'FILE'
|   'CONFIG'
|   'LOCK' 'TABLES'
|   'EVENT'
|   'SHUTDOWN'

ObjectType ::=
    'TABLE'?

PrivLevel ::=
    '*' ( '.' '*' )?
|    Identifier ( '.' ( '*' | Identifier ) )?

UserSpecList ::=
    UserSpec ( ',' UserSpec )*

RequireClauseOpt ::= ('REQUIRE' ('NONE' | 'SSL' | 'X509' | RequireListElement ('AND'? RequireListElement)*))?

RequireListElement ::= 'ISSUER' Issuer | 'SUBJECT' Subject | 'CIPHER' Cipher | 'SAN' SAN | 'TOKEN_ISSUER' TokenIssuer
```

## 示例


```sql
CREATE USER 'newuser' IDENTIFIED BY 'mypassword';
```

```
Query OK, 1 row affected (0.02 sec)
```


```sql
GRANT ALL ON test.* TO 'newuser';
```

```
Query OK, 0 rows affected (0.03 sec)
```


```sql
SHOW GRANTS FOR 'newuser';
```

```
+-------------------------------------------------+
| Grants for newuser@%                            |
+-------------------------------------------------+
| GRANT USAGE ON *.* TO 'newuser'@'%'             |
| GRANT ALL PRIVILEGES ON test.* TO 'newuser'@'%' |
+-------------------------------------------------+
2 rows in set (0.00 sec)
```

## MySQL 兼容性

* 与 MySQL 类似，`USAGE` 权限表示登录 TiDB 服务器的能力。
* 目前不支持列级权限。
* 与 MySQL 类似，不存在 `NO_AUTO_CREATE_USER` sql 模式时，`GRANT` 语句将在用户不存在时自动创建一个空密码的新用户。删除此 sql-mode（默认情况下已启用）会带来安全风险。
* `GRANT <privileges>` 语句执行成功后，在 TiDB 中语句执行的结果会在当前连接立即生效，而 [MySQL 中部分权限的结果需要等到之后的连接才生效](https://dev.mysql.com/doc/refman/8.0/en/privilege-changes.html)。见 [TiDB #39356](https://github.com/pingcap/tidb/issues/39356)。

## 另请参阅

* [`GRANT <role>`](/sql-statements/sql-statement-grant-role.md)
* [`REVOKE <privileges>`](/sql-statements/sql-statement-revoke-privileges.md)
* [`SHOW GRANTS`](/sql-statements/sql-statement-show-grants.md)
* [权限管理](/privilege-management.md)
