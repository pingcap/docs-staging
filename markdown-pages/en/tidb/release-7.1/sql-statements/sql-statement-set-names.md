---
title: SET [NAMES|CHARACTER SET] |  TiDB SQL Statement Reference
summary: An overview of the usage of SET [NAMES|CHARACTER SET] for the TiDB database.
---

# SET [NAMES|CHARACTER SET]

The statements `SET NAMES`, `SET CHARACTER SET` and `SET CHARSET` modify the variables `character_set_client`, `character_set_results` and `character_set_connection` for the current connection.

## Synopsis

**SetNamesStmt:**

![SetNamesStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/SetNamesStmt.png)

**VariableAssignmentList:**

![VariableAssignmentList](https://docs-download.pingcap.com/media/images/docs/sqlgram/VariableAssignmentList.png)

**VariableAssignment:**

![VariableAssignment](https://docs-download.pingcap.com/media/images/docs/sqlgram/VariableAssignment.png)

**CharsetName:**

![CharsetName](https://docs-download.pingcap.com/media/images/docs/sqlgram/CharsetName.png)

**StringName:**

![StringName](https://docs-download.pingcap.com/media/images/docs/sqlgram/StringName.png)

**CharsetKw:**

![CharsetKw](https://docs-download.pingcap.com/media/images/docs/sqlgram/CharsetKw.png)

**CharsetNameOrDefault:**

![CharsetNameOrDefault](https://docs-download.pingcap.com/media/images/docs/sqlgram/CharsetNameOrDefault.png)

## Examples

```sql
mysql> SHOW VARIABLES LIKE 'character_set%';
+--------------------------+--------------------------------------------------------+
| Variable_name            | Value                                                  |
+--------------------------+--------------------------------------------------------+
| character_sets_dir       | /usr/local/mysql-5.6.25-osx10.8-x86_64/share/charsets/ |
| character_set_connection | utf8mb4                                                |
| character_set_system     | utf8                                                   |
| character_set_results    | utf8mb4                                                |
| character_set_client     | utf8mb4                                                |
| character_set_database   | utf8mb4                                                |
| character_set_filesystem | binary                                                 |
| character_set_server     | utf8mb4                                                |
+--------------------------+--------------------------------------------------------+
8 rows in set (0.01 sec)

mysql> SET NAMES utf8;
Query OK, 0 rows affected (0.00 sec)

mysql> SHOW VARIABLES LIKE 'character_set%';
+--------------------------+--------------------------------------------------------+
| Variable_name            | Value                                                  |
+--------------------------+--------------------------------------------------------+
| character_sets_dir       | /usr/local/mysql-5.6.25-osx10.8-x86_64/share/charsets/ |
| character_set_connection | utf8                                                   |
| character_set_system     | utf8                                                   |
| character_set_results    | utf8                                                   |
| character_set_client     | utf8                                                   |
| character_set_server     | utf8mb4                                                |
| character_set_database   | utf8mb4                                                |
| character_set_filesystem | binary                                                 |
+--------------------------+--------------------------------------------------------+
8 rows in set (0.00 sec)

mysql> SET CHARACTER SET utf8mb4;
Query OK, 0 rows affected (0.00 sec)

mysql> SHOW VARIABLES LIKE 'character_set%';
+--------------------------+--------------------------------------------------------+
| Variable_name            | Value                                                  |
+--------------------------+--------------------------------------------------------+
| character_set_connection | utf8mb4                                                |
| character_set_system     | utf8                                                   |
| character_set_results    | utf8mb4                                                |
| character_set_client     | utf8mb4                                                |
| character_sets_dir       | /usr/local/mysql-5.6.25-osx10.8-x86_64/share/charsets/ |
| character_set_database   | utf8mb4                                                |
| character_set_filesystem | binary                                                 |
| character_set_server     | utf8mb4                                                |
+--------------------------+--------------------------------------------------------+
8 rows in set (0.00 sec)
```

## MySQL compatibility

The `SET [NAMES|CHARACTER SET]` statement in TiDB is fully compatible with MySQL. If you find any compatibility differences, [report a bug](https://docs.pingcap.com/tidb/stable/support).

## See also

* [SHOW \[GLOBAL|SESSION\] VARIABLES](/sql-statements/sql-statement-show-variables.md)
* [`SET <variable>`](/sql-statements/sql-statement-set-variable.md)
* [Character Set and Collation Support](/character-set-and-collation.md)
