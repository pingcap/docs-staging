---
title: SET [NAMES|CHARACTER SET]
summary: TiDB 数据库中 SET [NAMES|CHARACTER SET] 的使用概况。
---

# SET [NAMES|CHARACTER SET]

`SET NAMES`，`SET CHARACTER SET` 和 `SET CHARSET` 语句用于修改当前连接的变量 `character_set_client`，`character_set_results` 和 `character_set_connection`。

## 语法图

**SetNamesStmt:**

![SetNamesStmt](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/SetNamesStmt.png)

**VariableAssignmentList:**

![VariableAssignmentList](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/VariableAssignmentList.png)

**VariableAssignment:**

![VariableAssignment](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/VariableAssignment.png)

**CharsetName:**

![CharsetName](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/CharsetName.png)

**StringName:**

![StringName](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/StringName.png)

**CharsetKw:**

![CharsetKw](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/CharsetKw.png)

**CharsetNameOrDefault:**

![CharsetNameOrDefault](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/CharsetNameOrDefault.png)

## 示例


```sql
SHOW VARIABLES LIKE 'character_set%';
```

```
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
```


```sql
SET NAMES utf8;
```

```
Query OK, 0 rows affected (0.00 sec)
```


```sql
SHOW VARIABLES LIKE 'character_set%';
```

```
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
```


```sql
SET CHARACTER SET utf8mb4;
```

```
Query OK, 0 rows affected (0.00 sec)
```


```sql
SHOW VARIABLES LIKE 'character_set%';
```

```
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

## MySQL 兼容性

`SET [NAMES|CHARACTER SET]` 语句与 MySQL 完全兼容。如发现任何兼容性差异，请尝试 [TiDB 支持资源](/support.md)。

## 另请参阅

* [SHOW \[GLOBAL|SESSION\] VARIABLES](/sql-statements/sql-statement-show-variables.md)
* [`SET <variable>`](/sql-statements/sql-statement-set-variable.md)
* [Character Set Support](/character-set-and-collation.md)
