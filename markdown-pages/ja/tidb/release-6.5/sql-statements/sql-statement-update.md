---
title: UPDATE | TiDB SQL Statement Reference
summary: An overview of the usage of UPDATE for the TiDB database.
---

# アップデート {#update}

`UPDATE`ステートメントは、指定されたテーブルのデータを変更するために使用されます。

## あらすじ {#synopsis}

**UpdateStmt:**

![UpdateStmt](https://docs-download.pingcap.com/media/images/docs/sqlgram/UpdateStmt.png)

**プライオリティオプト:**

![PriorityOpt](https://docs-download.pingcap.com/media/images/docs/sqlgram/PriorityOpt.png)

**テーブル参照:**

![TableRef](https://docs-download.pingcap.com/media/images/docs/sqlgram/TableRef.png)

**テーブル参照:**

![TableRefs](https://docs-download.pingcap.com/media/images/docs/sqlgram/TableRefs.png)

**割り当てリスト:**

![AssignmentList](https://docs-download.pingcap.com/media/images/docs/sqlgram/AssignmentList.png)

**Where句オプション:**

![WhereClauseOptional](https://docs-download.pingcap.com/media/images/docs/sqlgram/WhereClauseOptional.png)

## 例 {#examples}

```sql
mysql> CREATE TABLE t1 (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, c1 INT NOT NULL);
Query OK, 0 rows affected (0.11 sec)

mysql> INSERT INTO t1 (c1) VALUES (1), (2), (3);
Query OK, 3 rows affected (0.02 sec)
Records: 3  Duplicates: 0  Warnings: 0

mysql> SELECT * FROM t1;
+----+----+
| id | c1 |
+----+----+
|  1 |  1 |
|  2 |  2 |
|  3 |  3 |
+----+----+
3 rows in set (0.00 sec)

mysql> UPDATE t1 SET c1=5 WHERE c1=3;
Query OK, 1 row affected (0.01 sec)
Rows matched: 1  Changed: 1  Warnings: 0

mysql> SELECT * FROM t1;
+----+----+
| id | c1 |
+----+----+
|  1 |  1 |
|  2 |  2 |
|  3 |  5 |
+----+----+
3 rows in set (0.00 sec)
```

## MySQL の互換性 {#mysql-compatibility}

式を評価するとき、TiDB は常に列の元の値を使用します。例えば：

```sql
CREATE TABLE t (a int, b int);
INSERT INTO t VALUES (1,2);
UPDATE t SET a = a+1,b=a;
```

MySQL では、列`b`値`a`に設定されているため 2 に更新され、 `a` (1) の値は同じステートメントで`a+1` (2) に更新されます。

TiDB はより標準的な SQL の動作に従い、 `b`対 1 で更新します。

## こちらもご覧ください {#see-also}

-   [入れる](/sql-statements/sql-statement-insert.md)
-   [選択する](/sql-statements/sql-statement-select.md)
-   [消去](/sql-statements/sql-statement-delete.md)
-   [交換](/sql-statements/sql-statement-replace.md)
