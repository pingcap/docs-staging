---
title: SHOW CREATE USER
summary: TiDB 数据库中 SHOW CREATE USER 的使用概况。
---

# SHOW CREATE USER

`SHOW CREATE USER` 语句用于显示如何使用 `CREATE USER` 语法来重新创建用户。

## 语法图

**ShowCreateUserStmt:**

![ShowCreateUserStmt](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ShowCreateUserStmt.png)

**Username:**

![Username](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/Username.png)

## 示例


```sql
SHOW CREATE USER 'root';
```

```
+--------------------------------------------------------------------------------------------------------------------------+
| CREATE USER for root@%                                                                                                   |
+--------------------------------------------------------------------------------------------------------------------------+
| CREATE USER 'root'@'%' IDENTIFIED WITH 'mysql_native_password' AS '' REQUIRE NONE PASSWORD EXPIRE DEFAULT ACCOUNT UNLOCK |
+--------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> SHOW GRANTS FOR 'root';
+-------------------------------------------+
| Grants for root@%                         |
+-------------------------------------------+
| GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' |
+-------------------------------------------+
1 row in set (0.00 sec)
```

## MySQL 兼容性

* `SHOW CREATE USER` 的输出结果旨在匹配 MySQL，但 TiDB 尚不支持若干 `CREATE` 选项。尚未支持的选项在语句执行过程中会被解析但会被跳过执行。详情可参阅 [security compatibility]。

## 另请参阅

* [CREATE USER](/sql-statements/sql-statement-create-user.md)
* [SHOW GRANTS](/sql-statements/sql-statement-show-grants.md)
* [DROP USER](/sql-statements/sql-statement-drop-user.md)
