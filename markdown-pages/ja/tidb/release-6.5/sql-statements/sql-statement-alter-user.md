---
title: ALTER USER | TiDB SQL Statement Reference
summary: An overview of the usage of ALTER USER for the TiDB database.
---

# ユーザーの変更 {#alter-user}

このステートメントは、TiDB 特権システム内の既存のユーザーを変更します。 MySQL 特権システムでは、ユーザーはユーザー名と接続元のホストの組み合わせです。これにより、ＩＰアドレス`192.168.1.1`からしか接続できないユーザ`'newuser2'@'192.168.1.1'`を作成することができる。 2 人のユーザーが同じユーザー部分を持ち、異なるホストからログインするときに異なる権限を持つことも可能です。

## あらすじ {#synopsis}

```ebnf+diagram
AlterUserStmt ::=
    'ALTER' 'USER' IfExists (UserSpecList RequireClauseOpt ConnectionOptions PasswordOption LockOption AttributeOption | 'USER' '(' ')' 'IDENTIFIED' 'BY' AuthString)

UserSpecList ::=
    UserSpec ( ',' UserSpec )*

UserSpec ::=
    Username AuthOption

Username ::=
    StringName ('@' StringName | singleAtIdentifier)? | 'CURRENT_USER' OptionalBraces

AuthOption ::=
    ( 'IDENTIFIED' ( 'BY' ( AuthString | 'PASSWORD' HashString ) | 'WITH' StringName ( 'BY' AuthString | 'AS' HashString )? ) )?

PasswordOption ::= ( 'PASSWORD' 'EXPIRE' ( 'DEFAULT' | 'NEVER' | 'INTERVAL' N 'DAY' )? | 'PASSWORD' 'HISTORY' ( 'DEFAULT' | N ) | 'PASSWORD' 'REUSE' 'INTERVAL' ( 'DEFAULT' | N 'DAY' ) | 'FAILED_LOGIN_ATTEMPTS' N | 'PASSWORD_LOCK_TIME' ( N | 'UNBOUNDED' ) )*

LockOption ::= ( 'ACCOUNT' 'LOCK' | 'ACCOUNT' 'UNLOCK' )?

AttributeOption ::= ( 'COMMENT' CommentString | 'ATTRIBUTE' AttributeString )?
```

## 例 {#examples}

```sql
mysql> CREATE USER 'newuser' IDENTIFIED BY 'newuserpassword';
Query OK, 1 row affected (0.01 sec)

mysql> SHOW CREATE USER 'newuser';
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| CREATE USER for newuser@%                                                                                                                                            |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| CREATE USER 'newuser'@'%' IDENTIFIED WITH 'mysql_native_password' AS '*5806E04BBEE79E1899964C6A04D68BCA69B1A879' REQUIRE NONE PASSWORD EXPIRE DEFAULT ACCOUNT UNLOCK |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> ALTER USER 'newuser' IDENTIFIED BY 'newnewpassword';
Query OK, 0 rows affected (0.02 sec)

mysql> SHOW CREATE USER 'newuser';
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| CREATE USER for newuser@%                                                                                                                                            |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| CREATE USER 'newuser'@'%' IDENTIFIED WITH 'mysql_native_password' AS '*FB8A1EA1353E8775CA836233E367FBDFCB37BE73' REQUIRE NONE PASSWORD EXPIRE DEFAULT ACCOUNT UNLOCK |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

```sql
ALTER USER 'newuser' ACCOUNT LOCK;
```

```
Query OK, 0 rows affected (0.02 sec)
```

`newuser`の属性を変更します。

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

`ALTER USER ... COMMENT`を使用して`newuser`のコメントを変更します。

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

`ALTER USER ... ATTRIBUTE`使用して`newuser`のコメントを削除します。

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

`newuser`の自動パスワード有効期限ポリシーを`ALTER USER ... PASSWORD EXPIRE NEVER`経由で期限切れにならないように変更します。

```sql
ALTER USER 'newuser' PASSWORD EXPIRE NEVER;
```

```
Query OK, 0 rows affected (0.02 sec)
```

`newuser`のパスワード再利用ポリシーを変更して、 `ALTER USER ... PASSWORD REUSE INTERVAL ... DAY`使用して過去 90 日間に使用されたパスワードの再利用を禁止します。

```sql
ALTER USER 'newuser' PASSWORD REUSE INTERVAL 90 DAY;
```

```
Query OK, 0 rows affected (0.02 sec)
```

## こちらもご覧ください {#see-also}

<CustomContent platform="tidb">

-   [MySQL とのSecurityの互換性](/security-compatibility-with-mysql.md)

</CustomContent>

-   [ユーザーを作成](/sql-statements/sql-statement-create-user.md)
-   [ユーザーをドロップ](/sql-statements/sql-statement-drop-user.md)
-   [ユーザーの作成を表示](/sql-statements/sql-statement-show-create-user.md)
