---
title: SHOW CREATE TABLE | TiDB SQL Statement Reference
summary: TiDB データベースに対する SHOW CREATE TABLE の使用法の概要。
---

# 表示テーブルの作成 {#show-create-table}

このステートメントは、SQL を使用して既存のテーブルを再作成するための正確なステートメントを示しています。

## 概要 {#synopsis}

```ebnf+diagram
ShowCreateTableStmt ::=
    "SHOW" "CREATE" "TABLE" (SchemaName ".")? TableName
```

## 例 {#examples}

```sql
mysql> CREATE TABLE t1 (a INT);
Query OK, 0 rows affected (0.12 sec)

mysql> SHOW CREATE TABLE t1\G
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE `t1` (
  `a` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
1 row in set (0.00 sec)
```

## MySQL 互換性 {#mysql-compatibility}

TiDB の`SHOW CREATE TABLE`ステートメントは MySQL と完全に互換性があります。互換性の違いが見つかった場合は、 [バグを報告](https://docs.pingcap.com/tidb/stable/support) 。

## 参照 {#see-also}

-   [テーブルの作成](/sql-statements/sql-statement-create-table.md)
-   [テーブルを削除](/sql-statements/sql-statement-drop-table.md)
-   [テーブルを表示](/sql-statements/sql-statement-show-tables.md)
-   [列を表示](/sql-statements/sql-statement-show-columns-from.md)
