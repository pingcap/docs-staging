---
title: SHOW [FULL] COLUMNS FROM | TiDB SQL Statement Reference
summary: An overview of the usage of SHOW [FULL] COLUMNS FROM for the TiDB database.
---

# 次の [FULL] 列を表示 {#show-full-columns-from}

ステートメント`SHOW [FULL] COLUMNS FROM <table_name>`は、テーブルまたはビューの列を便利な表形式で記述します。オプションのキーワード`FULL`は、現在のユーザーがその列に対して持っている権限と、テーブル定義からの`comment`を表示します。

ステートメント`SHOW [FULL] FIELDS FROM <table_name>` 、 `DESC <table_name>` 、 `DESCRIBE <table_name>` 、および`EXPLAIN <table_name>`は、このステートメントの別名です。

> **ノート：**
>
> `DESC TABLE <table_name>` 、 `DESCRIBE TABLE <table_name>` 、および`EXPLAIN TABLE <table_name>`は、上記のステートメントと同等ではありません。それらは[`DESC SELECT * FROM &#x3C;table_name>`](/sql-statements/sql-statement-explain.md)の別名です。

## あらすじ {#synopsis}

**表示ステートメント:**

![ShowStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowStmt.png)

**ShowColumnsFilterable:**

![ShowColumnsFilterable](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowColumnsFilterable.png)

**OptFull:**

![OptFull](https://docs-download.pingcap.com/media/images/docs/sqlgram/OptFull.png)

**フィールドまたは列:**

![FieldsOrColumns](https://docs-download.pingcap.com/media/images/docs/sqlgram/FieldsOrColumns.png)

**ShowTableAliasOpt:**

![ShowTableAliasOpt](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowTableAliasOpt.png)

**FromOrIn:**

![FromOrIn](https://docs-download.pingcap.com/media/images/docs/sqlgram/FromOrIn.png)

**テーブル名:**

![TableName](https://docs-download.pingcap.com/media/images/docs/sqlgram/TableName.png)

**ShowDatabaseNameOpt:**

![ShowDatabaseNameOpt](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowDatabaseNameOpt.png)

**DB名:**

![DBName](https://docs-download.pingcap.com/media/images/docs/sqlgram/DBName.png)

**ShowLikeOrWhereOpt:**

![ShowLikeOrWhereOpt](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShowLikeOrWhereOpt.png)

## 例 {#examples}

```sql
mysql> create view v1 as select 1;
Query OK, 0 rows affected (0.11 sec)

mysql> show columns from v1;
+-------+-----------+------+------+---------+-------+
| Field | Type      | Null | Key  | Default | Extra |
+-------+-----------+------+------+---------+-------+
| 1     | bigint(1) | YES  |      | NULL    |       |
+-------+-----------+------+------+---------+-------+
1 row in set (0.00 sec)

mysql> desc v1;
+-------+-----------+------+------+---------+-------+
| Field | Type      | Null | Key  | Default | Extra |
+-------+-----------+------+------+---------+-------+
| 1     | bigint(1) | YES  |      | NULL    |       |
+-------+-----------+------+------+---------+-------+
1 row in set (0.00 sec)

mysql> describe v1;
+-------+-----------+------+------+---------+-------+
| Field | Type      | Null | Key  | Default | Extra |
+-------+-----------+------+------+---------+-------+
| 1     | bigint(1) | YES  |      | NULL    |       |
+-------+-----------+------+------+---------+-------+
1 row in set (0.00 sec)

mysql> explain v1;
+-------+-----------+------+------+---------+-------+
| Field | Type      | Null | Key  | Default | Extra |
+-------+-----------+------+------+---------+-------+
| 1     | bigint(1) | YES  |      | NULL    |       |
+-------+-----------+------+------+---------+-------+
1 row in set (0.00 sec)

mysql> show fields from v1;
+-------+-----------+------+------+---------+-------+
| Field | Type      | Null | Key  | Default | Extra |
+-------+-----------+------+------+---------+-------+
| 1     | bigint(1) | YES  |      | NULL    |       |
+-------+-----------+------+------+---------+-------+
1 row in set (0.00 sec)

mysql> show full columns from v1;
+-------+-----------+-----------+------+------+---------+-------+---------------------------------+---------+
| Field | Type      | Collation | Null | Key  | Default | Extra | Privileges                      | Comment |
+-------+-----------+-----------+------+------+---------+-------+---------------------------------+---------+
| 1     | bigint(1) | NULL      | YES  |      | NULL    |       | select,insert,update,references |         |
+-------+-----------+-----------+------+------+---------+-------+---------------------------------+---------+
1 row in set (0.00 sec)

mysql> show full columns from mysql.user;
+-----------------------+---------------+-------------+------+------+---------+-------+---------------------------------+---------+
| Field                 | Type          | Collation   | Null | Key  | Default | Extra | Privileges                      | Comment |
+-----------------------+---------------+-------------+------+------+---------+-------+---------------------------------+---------+
| Host                  | char(64)      | utf8mb4_bin | NO   | PRI  | NULL    |       | select,insert,update,references |         |
| User                  | char(32)      | utf8mb4_bin | NO   | PRI  | NULL    |       | select,insert,update,references |         |
| authentication_string | text          | utf8mb4_bin | YES  |      | NULL    |       | select,insert,update,references |         |
| Select_priv           | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Insert_priv           | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Update_priv           | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Delete_priv           | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Create_priv           | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Drop_priv             | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Process_priv          | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Grant_priv            | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| References_priv       | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Alter_priv            | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Show_db_priv          | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Super_priv            | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Create_tmp_table_priv | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Lock_tables_priv      | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Execute_priv          | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Create_view_priv      | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Show_view_priv        | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Create_routine_priv   | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Alter_routine_priv    | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Index_priv            | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Create_user_priv      | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Event_priv            | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Trigger_priv          | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Create_role_priv      | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Drop_role_priv        | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Account_locked        | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Shutdown_priv         | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Reload_priv           | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| FILE_priv             | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
| Config_priv           | enum('N','Y') | utf8mb4_bin | NO   |      | N       |       | select,insert,update,references |         |
+-----------------------+---------------+-------------+------+------+---------+-------+---------------------------------+---------+
33 rows in set (0.01 sec)
```

## MySQL の互換性 {#mysql-compatibility}

このステートメントは、MySQL と完全に互換性があると理解されています。互換性の違いは、GitHub で[問題を介して報告された](https://github.com/pingcap/tidb/issues/new/choose)にする必要があります。

## こちらもご覧ください {#see-also}

-   [テーブルの作成を表示](/sql-statements/sql-statement-show-create-table.md)
