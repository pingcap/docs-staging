---
title: SESSION_CONNECT_ATTRS
summary: "了解 `SESSION_CONNECT_ATTRS` performance_schema 表。"
---

# SESSION\_CONNECT\_ATTRS

`SESSION_CONNECT_ATTRS` 表提供了连接属性的信息。会话属性是客户端在建立连接时发送的键值对。

常见属性：

| 属性名称          | 示例          | 描述                     |
|-------------------|---------------|--------------------------|
| `_client_name`    | `libmysql`    | 客户端库名称             |
| `_client_version` | `8.0.33`      | 客户端库版本             |
| `_os`             | `Linux`       | 操作系统                 |
| `_pid`            | `712927`      | 进程 ID                  |
| `_platform`       | `x86_64`      | CPU 架构                 |
| `program_name`    | `mysqlsh`     | 程序名称                 |

你可以按如下方式查看 `SESSION_CONNECT_ATTRS` 表的列：


```sql
USE performance_schema;
DESCRIBE session_connect_attrs;
```

```
+------------------+---------------------+------+-----+---------+-------+
| Field            | Type                | Null | Key | Default | Extra |
+------------------+---------------------+------+-----+---------+-------+
| PROCESSLIST_ID   | bigint(20) unsigned | NO   |     | NULL    |       |
| ATTR_NAME        | varchar(32)         | NO   |     | NULL    |       |
| ATTR_VALUE       | varchar(1024)       | YES  |     | NULL    |       |
| ORDINAL_POSITION | int(11)             | YES  |     | NULL    |       |
+------------------+---------------------+------+-----+---------+-------+
```

你可以按如下方式查看存储在 `SESSION_CONNECT_ATTRS` 表中的会话属性信息：


```sql
USE performance_schema;
TABLE SESSION_CONNECT_ATTRS;
```

```
+----------------+-----------------+------------+------------------+
| PROCESSLIST_ID | ATTR_NAME       | ATTR_VALUE | ORDINAL_POSITION |
+----------------+-----------------+------------+------------------+
|        2097154 | _client_name    | libmysql   |                0 |
|        2097154 | _client_version | 8.1.2      |                1 |
|        2097154 | _os             | Linux      |                2 |
|        2097154 | _pid            | 1299203    |                3 |
|        2097154 | _platform       | x86_64     |                4 |
|        2097154 | program_name    | mysqlsh    |                5 |
+----------------+-----------------+------------+------------------+
```

`SESSION_CONNECT_ATTRS` 表中的字段说明如下：

* `PROCESSLIST_ID`：会话的进程列表 ID。
* `ATTR_NAME`：属性名称。
* `ATTR_VALUE`：属性值。
* `ORDINAL_POSITION`：名称/值对的序号位置。
