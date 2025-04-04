---
title: SHOW ERRORS
summary: TiDB 数据库中 SHOW ERRORS 的使用概况。
---

# SHOW ERRORS

`SHOW ERRORS` 语句用于显示已执行语句中的错误。一旦先前的语句成功执行，就会清除错误缓冲区，这时 `SHOW ERRORS` 会返回一个空集。

当前的 `sql_mode` 很大程度决定了哪些语句会产生错误与警告。

## 语法图

**ShowErrorsStmt:**

![ShowErrorsStmt](https://docs-download.pingcap.com/media/images/docs-cn/sqlgram/ShowErrorsStmt.png)

## 示例


```sql
select invalid;
```

```
ERROR 1054 (42S22): Unknown column 'invalid' in 'field list'
```


```sql
create invalid;
```

```
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your TiDB version for the right syntax to use line 1 column 14 near "invalid"
```


```sql
SHOW ERRORS;
```

```
+-------+------+-----------------------------------------------------------------------------------------------------------------------------------------------------------+
| Level | Code | Message                                                                                                                                                   |
+-------+------+-----------------------------------------------------------------------------------------------------------------------------------------------------------+
| Error | 1054 | Unknown column 'invalid' in 'field list'                                                                                                                  |
| Error | 1064 | You have an error in your SQL syntax; check the manual that corresponds to your TiDB version for the right syntax to use line 1 column 14 near "invalid"  |
+-------+------+-----------------------------------------------------------------------------------------------------------------------------------------------------------+
2 rows in set (0.00 sec)
```


```sql
CREATE invalid2;
```

```
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your TiDB version for the right syntax to use line 1 column 15 near "invalid2"
```


```sql
SELECT 1;
```

```
+------+
| 1    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)
```


```sql
SHOW ERRORS;
```

```
Empty set (0.00 sec)
```

## MySQL 兼容性

`SHOW ERRORS` 语句与 MySQL 完全兼容。如发现任何兼容性差异，请在 GitHub 上提交 [issue](https://github.com/pingcap/tidb/issues/new/choose)。

## 另请参阅

* [SHOW WARNINGS](/sql-statements/sql-statement-show-warnings.md)
