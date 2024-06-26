---
title: 信息函数
summary: TiDB 支持大部分 MySQL 5.7 的信息函数，包括 BENCHMARK(), CONNECTION_ID(), CURRENT_USER(), DATABASE(), FOUND_ROWS(), LAST_INSERT_ID(), ROW_COUNT(), SCHEMA(), SESSION_USER(), SYSTEM_USER(), USER(), 和 VERSION()。此外，TiDB 还有一个特有的信息函数 CURRENT_RESOURCE_GROUP()，而不支持 CHARSET(), COERCIBILITY(), 和 COLLATION() 函数。
---

# 信息函数

TiDB 支持使用 MySQL 5.7 中提供的大部分[信息函数](https://dev.mysql.com/doc/refman/5.7/en/information-functions.html)。

## TiDB 支持的 MySQL 信息函数

| 函数名 | 功能描述                                 |
| ------ | ---------------------------------------- |
| [`BENCHMARK()`](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_benchmark) | 循环执行一个表达式 |
| [`CONNECTION_ID()`](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_connection-id) | 返回当前连接的连接 ID (线程 ID)                     |
| [`CURRENT_USER()`, `CURRENT_USER`](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_current-user) | 返回当前用户的用户名和主机名                           |
| [`DATABASE()`](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_database) | 返回默认(当前)的数据库名                            |
| [`FOUND_ROWS()`](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_found-rows) | 该函数返回对于一个包含 LIMIT 的 SELECT 查询语句，在不包含 LIMIT 的情况下回返回的记录数 |
| [`LAST_INSERT_ID()`](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_last-insert-id) | 返回最后一条 INSERT 语句中自增列的值                   |
| [`ROW_COUNT()`](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_row-count) | 影响的行数 |
| [`SCHEMA()`](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_schema) | 与 DATABASE() 同义                          |
| [`SESSION_USER()`](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_session-user) | 与 USER() 同义                              |
| [`SYSTEM_USER()`](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_system-user) | 与 USER() 同义                              |
| [`USER()`](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_user) | 返回客户端提供的用户名和主机名                          |
| [`VERSION()`](https://dev.mysql.com/doc/refman/8.0/en/information-functions.html#function_version) | 返回当前 MySQL 服务器的版本信息                      |

## TiDB 特有的信息函数

下列函数为 TiDB 中特有的信息函数，MySQL 中无对应的函数。

| 函数名 | 功能描述                                 |
| ------ | ---------------------------------------- |
| [`CURRENT_RESOURCE_GROUP()`](/functions-and-operators/tidb-functions.md#current_resource_group) | 返回当前连接的资源组名 |

## TiDB 不支持的信息函数

* `CHARSET()`
* `COERCIBILITY()`
* `COLLATION()`
