---
title: SHOW CREATE SEQUENCE
summary: An overview of the usage of SHOW CREATE SEQUENCE for the TiDB database.
---

# CREATESEQUENCEを表示する {#show-create-sequence}

`SHOW CREATE SEQUENCE`は、 `SHOW CREATE TABLE`と同様のシーケンスの詳細情報を示しています。

## あらすじ {#synopsis}

**ShowCreateSequenceStmt：**

![ShowCreateSequenceStmt](https://download.pingcap.com/images/docs/sqlgram/ShowCreateSequenceStmt.png)

**TableName：**

![TableName](https://download.pingcap.com/images/docs/sqlgram/TableName.png)

## 例 {#examples}


```sql
CREATE SEQUENCE seq;
```

```
Query OK, 0 rows affected (0.03 sec)
```


```sql
SHOW CREATE SEQUENCE seq;
```

```
+-------+----------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                               |
+-------+----------------------------------------------------------------------------------------------------------------------------+
| seq   | CREATE SEQUENCE `seq` start with 1 minvalue 1 maxvalue 9223372036854775806 increment by 1 cache 1000 nocycle ENGINE=InnoDB |
+-------+----------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

## MySQLの互換性 {#mysql-compatibility}

このステートメントはTiDB拡張です。実装は、MariaDBで利用可能なシーケンスをモデルにしています。

## も参照してください {#see-also}

-   [シーケンスの作成](/sql-statements/sql-statement-create-sequence.md)
-   [ドロップシーケンス](/sql-statements/sql-statement-drop-sequence.md)
