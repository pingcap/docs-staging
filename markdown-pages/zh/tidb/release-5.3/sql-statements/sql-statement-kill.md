---
title: KILL [TIDB]
summary: TiDB 数据库中 KILL [TIDB] 的使用概况。
---

# KILL [TIDB]

`KILL TIDB` 语句用于终止 TiDB 中的连接。

## 语法图

```ebnf+diagram
KillStmt ::= KillOrKillTiDB ( 'CONNECTION' | 'QUERY' )? NUM

KillOrKillTiDB ::= 'KILL' 'TIDB'?
```

## 示例


```sql
SHOW PROCESSLIST;
```

```
+------+------+-----------+------+---------+------+-------+------------------+
| Id   | User | Host      | db   | Command | Time | State | Info             |
+------+------+-----------+------+---------+------+-------+------------------+
|    1 | root | 127.0.0.1 | test | Query   |    0 | 2     | SHOW PROCESSLIST |
|    2 | root | 127.0.0.1 |      | Sleep   |    4 | 2     |                  |
+------+------+-----------+------+---------+------+-------+------------------+
2 rows in set (0.00 sec)
```

通过查询 `INFORMATION_SCHEMA.CLUSTER_PROCESSLIST` 的 `INSTANCE` 列，可以获取被 kill 的会话连接的 TiDB Server 信息：

```sql
SELECT ID, USER, INSTANCE, INFO FROM INFORMATION_SCHEMA.CLUSTER_PROCESSLIST;
```

```sql
+---------------------+------+-----------------+-----------------------------------------------------------------------------+
| ID | USER | INSTANCE | INFO |
+---------------------+------+-----------------+-----------------------------------------------------------------------------+
| 1 | root | 127.0.0.1:10082 | SELECT ID, USER, INSTANCE, INFO FROM INFORMATION_SCHEMA.CLUSTER_PROCESSLIST |
| 2 | root | 127.0.0.1:10080 |  |
+---------------------+------+-----------------+-------------------------------------------------------------
2 rows in set (0.00 sec)
```

连接到与被 kill 的会话相同的 TiDB 节点，执行 `KILL TIDB` 语句：

```shell
mysql -h 127.0.0.1 -P 10080 -u root -p
```


```sql
KILL TIDB 2;
```

```
Query OK, 0 rows affected (0.00 sec)
```

## MySQL 兼容性

* 按照设计，`KILL` 语句默认与 MySQL 不兼容。负载均衡器后面通常放有多个 TiDB 服务器，这种默认不兼容有助于防止在错误的 TiDB 服务器上终止连接。
* 请**不要**在配置文件里设置 [`compatible-kill-query = true`](/tidb-configuration-file.md#compatible-kill-query)，**除非**你确定客户端将始终连接到同一个 TiDB 节点。这是因为当你在默认的 MySQL 客户端按下 <kbd>ctrl</kbd>+<kbd>c</kbd> 时，客户端会开启一个新连接，并在这个新连接中执行 `KILL` 语句。此时，如果客户端和 TiDB 中间有代理，新连接可能会被路由到其他的 TiDB 节点，从而错误地终止其他会话。
* `KILL TIDB` 语句是 TiDB 的扩展语法，其功能与 MySQL 命令 `KILL [CONNECTION|QUERY]` 和 MySQL 命令行 <kbd>ctrl</kbd>+<kbd>c</kbd> 相同。在同一个 TiDB 节点上，你可以安全地使用 `KILL TIDB` 语句。

## 另请参阅

* [SHOW \[FULL\] PROCESSLIST](/sql-statements/sql-statement-show-processlist.md)
* [CLUSTER_PROCESSLIST](/information-schema/information-schema-processlist.md#cluster_processlist)
