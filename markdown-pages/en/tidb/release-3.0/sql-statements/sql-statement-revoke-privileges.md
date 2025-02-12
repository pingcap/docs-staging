---
title: REVOKE <privileges> | TiDB SQL Statement Reference
summary: An overview of the usage of REVOKE <privileges> for the TiDB database.
aliases: ['/docs/v3.0/sql-statements/sql-statement-revoke-privileges/','/docs/v3.0/reference/sql/statements/revoke-privileges/']
---

# `REVOKE <privileges>`

This statement removes privileges from an existing user.

## Synopsis

**GrantStmt:**

![GrantStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/GrantStmt.png)

**PrivElemList:**

![PrivElemList](https://docs-download.pingcap.com/media/images/docs/sqlgram/PrivElemList.png)

**PrivElem:**

![PrivElem](https://docs-download.pingcap.com/media/images/docs/sqlgram/PrivElem.png)

**PrivType:**

![PrivType](https://docs-download.pingcap.com/media/images/docs/sqlgram/PrivType.png)

**ObjectType:**

![ObjectType](https://docs-download.pingcap.com/media/images/docs/sqlgram/ObjectType.png)

**PrivLevel:**

![PrivLevel](https://docs-download.pingcap.com/media/images/docs/sqlgram/PrivLevel.png)

**UserSpecList:**

![UserSpecList](https://docs-download.pingcap.com/media/images/docs/sqlgram/UserSpecList.png)

## Examples

```sql
mysql> CREATE USER newuser IDENTIFIED BY 'mypassword';
Query OK, 1 row affected (0.02 sec)

mysql> GRANT ALL ON test.* TO 'newuser';
Query OK, 0 rows affected (0.03 sec)

mysql> SHOW GRANTS FOR 'newuser';
+-------------------------------------------------+
| Grants for newuser@%                            |
+-------------------------------------------------+
| GRANT USAGE ON *.* TO 'newuser'@'%'             |
| GRANT ALL PRIVILEGES ON test.* TO 'newuser'@'%' |
+-------------------------------------------------+
2 rows in set (0.00 sec)

mysql> REVOKE ALL ON test.* FROM 'newuser';
Query OK, 0 rows affected (0.03 sec)

mysql> SHOW GRANTS FOR 'newuser';
+-------------------------------------+
| Grants for newuser@%                |
+-------------------------------------+
| GRANT USAGE ON *.* TO 'newuser'@'%' |
+-------------------------------------+
1 row in set (0.00 sec)

mysql> DROP USER newuser;
Query OK, 0 rows affected (0.14 sec)

mysql> SHOW GRANTS FOR newuser;
ERROR 1141 (42000): There is no such grant defined for user 'newuser' on host '%'
```

## MySQL compatibility

This statement is understood to be fully compatible with MySQL. Any compatibility differences should be [reported via an issue](https://github.com/pingcap/tidb/issues/new/choose) on GitHub.

## See also

* [`GRANT <privileges>`](/sql-statements/sql-statement-grant-privileges.md)
* [SHOW GRANTS](/sql-statements/sql-statement-show-grants.md)
* [Privilege Management](/privilege-management.md)
