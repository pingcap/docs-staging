---
title: SESSION_VARIABLES
summary: Learn the `SESSION_VARIABLES` information_schema table.
---

# セッション変数 {#session-variables}

`SESSION_VARIABLES`テーブルは、セッション変数に関する情報を提供します。テーブル データは、 `SHOW SESSION VARIABLES`ステートメントの結果と同様です。


```sql
USE information_schema;
DESC session_variables;
```

```sql
+----------------+---------------+------+------+---------+-------+
| Field          | Type          | Null | Key  | Default | Extra |
+----------------+---------------+------+------+---------+-------+
| VARIABLE_NAME  | varchar(64)   | YES  |      | NULL    |       |
| VARIABLE_VALUE | varchar(1024) | YES  |      | NULL    |       |
+----------------+---------------+------+------+---------+-------+
2 rows in set (0.00 sec)
```


```sql
SELECT * FROM session_variables ORDER BY variable_name LIMIT 10;
```

```sql
+-----------------------------------+------------------+
| VARIABLE_NAME                     | VARIABLE_VALUE   |
+-----------------------------------+------------------+
| allow_auto_random_explicit_insert | off              |
| auto_increment_increment          | 1                |
| auto_increment_offset             | 1                |
| autocommit                        | 1                |
| automatic_sp_privileges           | 1                |
| avoid_temporal_upgrade            | 0                |
| back_log                          | 80               |
| basedir                           | /usr/local/mysql |
| big_tables                        | 0                |
| bind_address                      | *                |
+-----------------------------------+------------------+
10 rows in set (0.00 sec)
```

`SESSION_VARIABLES`テーブルの列の説明は次のとおりです。

-   `VARIABLE_NAME` : データベース内のセッション レベル変数の名前。
-   `VARIABLE_VALUE` : データベース内のセッション レベル変数の値。
