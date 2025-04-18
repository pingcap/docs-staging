---
title: SHOW TABLE STATUS
summary: TiDB 数据库中 SHOW TABLE STATUS 的使用概况。
---

# SHOW TABLE STATUS

`SHOW TABLE STATUS` 语句用于显示 TiDB 中表的各种统计信息。如果显示统计信息过期，建议运行 [`ANALYZE TABLE`](/sql-statements/sql-statement-analyze-table.md)。

## 语法图

**ShowTableStatusStmt:**

![ShowTableStatusStmt](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ShowTableStatusStmt.png)

**FromOrIn:**

![FromOrIn](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/FromOrIn.png)

**StatusTableName:**

![StatusTableName](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/StatusTableName.png)

## 示例


```sql
CREATE TABLE t1 (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, c1 INT NOT NULL);
```

```
Query OK, 0 rows affected (0.11 sec)
```


```sql
INSERT INTO t1 (c1) VALUES (1),(2),(3),(4),(5);
```

```
Query OK, 5 rows affected (0.02 sec)
Records: 5  Duplicates: 0  Warnings: 0
```


```sql
SHOW TABLE STATUS LIKE 't1';
```

```
*************************** 1. row ***************************
           Name: t1
         Engine: InnoDB
        Version: 10
     Row_format: Compact
           Rows: 0
 Avg_row_length: 0
    Data_length: 0
Max_data_length: 0
   Index_length: 0
      Data_free: 0
 Auto_increment: 30001
    Create_time: 2019-04-19 08:32:06
    Update_time: NULL
     Check_time: NULL
      Collation: utf8mb4_bin
       Checksum:
 Create_options:
        Comment:
1 row in set (0.00 sec)
```


```sql
analyze table t1;
```

```
Query OK, 0 rows affected (0.12 sec)
```


```sql
SHOW TABLE STATUS LIKE 't1';
```

```
*************************** 1. row ***************************
           Name: t1
         Engine: InnoDB
        Version: 10
     Row_format: Compact
           Rows: 5
 Avg_row_length: 16
    Data_length: 80
Max_data_length: 0
   Index_length: 0
      Data_free: 0
 Auto_increment: 30001
    Create_time: 2019-04-19 08:32:06
    Update_time: NULL
     Check_time: NULL
      Collation: utf8mb4_bin
       Checksum:
 Create_options:
        Comment:
1 row in set (0.00 sec)
```

## MySQL 兼容性

`SHOW TABLE STATUS` 语句与 MySQL 完全兼容。如发现任何兼容性差异，请在 GitHub 上提交 [issue](https://github.com/pingcap/tidb/issues/new/choose)。

## 另请参阅

* [SHOW TABLES](/sql-statements/sql-statement-show-tables.md)
* [CREATE TABLE](/sql-statements/sql-statement-create-table.md)
* [DROP TABLE](/sql-statements/sql-statement-drop-table.md)
* [SHOW CREATE TABLE](/sql-statements/sql-statement-show-create-table.md)
