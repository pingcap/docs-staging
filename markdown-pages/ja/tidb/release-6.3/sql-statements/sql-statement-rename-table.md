---
title: RENAME TABLE | TiDB SQL Statement Reference
summary: An overview of the usage of RENAME TABLE for the TiDB database.
---

# テーブル名の変更 {#rename-table}

このステートメントは、既存のテーブルの名前を新しい名前に変更します。

## あらすじ {#synopsis}

```ebnf+diagram
RenameTableStmt ::=
    'RENAME' 'TABLE' TableToTable ( ',' TableToTable )*

TableToTable ::=
    TableName 'TO' TableName
```

## 例 {#examples}

```sql
mysql> CREATE TABLE t1 (a int);
Query OK, 0 rows affected (0.12 sec)

mysql> SHOW TABLES;
+----------------+
| Tables_in_test |
+----------------+
| t1             |
+----------------+
1 row in set (0.00 sec)

mysql> RENAME TABLE t1 TO t2;
Query OK, 0 rows affected (0.08 sec)

mysql> SHOW TABLES;
+----------------+
| Tables_in_test |
+----------------+
| t2             |
+----------------+
1 row in set (0.00 sec)
```

## MySQL の互換性 {#mysql-compatibility}

このステートメントは、MySQL と完全に互換性があると理解されています。互換性の違いは、GitHub で[問題を介して報告された](https://github.com/pingcap/tidb/issues/new/choose)にする必要があります。

## こちらもご覧ください {#see-also}

-   [テーブルを作成](/sql-statements/sql-statement-create-table.md)
-   [テーブルを表示](/sql-statements/sql-statement-show-tables.md)
-   [他の机](/sql-statements/sql-statement-alter-table.md)
