---
title: TiDB Control 使用说明
summary: TiDB Control 是 TiDB 的命令行工具，用于获取 TiDB 状态信息和调试。可通过 TiUP 安装或从源代码编译安装。使用介绍包括命令、选项和参数组成，以及全局参数和各子命令的功能。其中包括获取帮助信息、解码 base64 数据、解码 row key 和 value、操作 etcd、格式化日志文件，以及查询关键 key range 信息。注意：TiDB Control 主要用于诊断调试，不保证和 TiDB 未来引入的新特性完全兼容。
---

# TiDB Control 使用说明

TiDB Control 是 TiDB 的命令行工具，用于获取 TiDB 状态信息，多用于调试。本文介绍了 TiDB Control 的主要功能和各个功能的使用方法。

> **注意：**
>
> TiDB Control 主要用于诊断调试，不保证和 TiDB 未来引入的新特性完全兼容。因此不推荐客户在应用程序开发或工具开发中利用 TiDB Control 获取结果。 

## 获取 TiDB Control

本节提供了两种方式获取 TiDB Control 工具。

> **注意：**
>
> 建议使用的 Control 工具版本与集群版本保持一致。

### 通过 TiUP 安装

在安装 TiUP 之后，可以使用 `tiup ctl:v<CLUSTER_VERSION> tidb` 命令来获取 TiDB Control 的二进制程序以及运行 TiDB Control。

### 从源代码编译安装

编译环境要求：[Go](https://golang.org/) 1.23 或以上版本

编译步骤：在 [TiDB Control 项目](https://github.com/pingcap/tidb-ctl)根目录，使用 `make` 命令进行编译，生成 tidb-ctl。

编译文档：帮助文档在 doc 文件夹下，如丢失或需要更新，可通过 `make doc` 命令生成帮助文档。

## 使用介绍

`tidb-ctl` 的使用由命令（包括子命令）、选项和参数组成。命令即不带 `-` 或者 `--` 的字符，选项即带有 `-` 或者 `--` 的字符，参数即命令或选项字符后紧跟的传递给命令和选项的字符。

如：`tidb-ctl schema in mysql -n db`

* schema: 命令
* in: schema 的子命令
* mysql: in 的参数
* -n: 选项
* db: -n 的参数

目前，TiDB Control 包含以下子命令。

* `tidb-ctl base64decode` 用于 BASE64 解码
* `tidb-ctl decoder` 用于 KEY 解码
* `tidb-ctl etcd` 用于操作 etcd
* `tidb-ctl log` 用于格式化日志文件，将单行的堆栈信息展开
* `tidb-ctl mvcc` 用于获取 MVCC 信息
* `tidb-ctl region` 用于获取 Region 信息
* `tidb-ctl schema` 用于获取 Schema 信息
* `tidb-ctl table` 用于获取 Table 信息

### 获取帮助

`tidb-ctl -h/--help` 用于获取帮助信息。tidb-ctl 由多层命令组成，tidb-ctl 及其所有子命令都可以通过 `-h/--help` 来获取使用帮助。

以获取 Schema 信息为例：

通过 `tidb-ctl schema -h` 可以获取这个子命令的使用帮助。schema 有两个子命令——in 和 tid。in 用来通过数据库名获取数据库中所有表的表结构，tid 用来通过全数据库唯一的 table_id 获取表的表结构。

### 全局参数

`tidb-ctl` 有 4 个与连接相关的全局参数，分别为：

- `--host` TiDB 服务地址
- `--port` TiDB status 端口
- `--pdhost` PD 服务地址
- `--pdport` PD 服务端口
- `--ca` 连接使用的 TLS CA 文件路径
- `--ssl-key` 连接使用的 TLS 密钥文件路径
- `--ssl-cert` 连接使用的 TLS 证书文件路径

其中 `--pdhost` 和 `--pdport` 主要是用于 `etcd` 子命令，例如：`tidb-ctl etcd ddlinfo`。如不添加地址和端口将使用默认值，TiDB/PD 服务默认的地址是 127.0.0.1（服务地址只能使用 IP 地址），TiDB 服务端口默认的端口是 10080，PD 服务端口默认的端口是 2379 **连接选项是全局选项，适用于以下所有命令。**

### schema 命令

#### in 子命令

in 子命令用来通过数据库名获取数据库中所有表的表结构。

`tidb-ctl schema in {数据库名}`

如：`tidb-ctl schema in mysql` 将得到以下结果

```json
[
    {
        "id": 13,
        "name": {
            "O": "columns_priv",
            "L": "columns_priv"
        },
              ...
        "update_timestamp": 399494726837600268,
        "ShardRowIDBits": 0,
        "Partition": null
    }
]
```

结果将以 json 形式展示，内容较长，这里做了截断。

如希望指定表名，可以使用 `tidb-ctl schema in {数据库名} -n {表名}` 进行过滤。

如：`tidb-ctl schema in mysql -n db` 将得到 mysql 库中 db 表的表结构。结果如下：

```json
{
    "id": 9,
    "name": {
        "O": "db",
        "L": "db"
    },
    ...
    "Partition": null
}
```

这里同样做了截断。

如使用的 TiDB 地址不为默认地址和端口，可以使用命令行参数 `--host`, `--port` 选项，如：`tidb-ctl --host 172.16.55.88 --port 8898 schema in mysql -n db`。

#### tid 子命令

tid 子命令用来通过表的 id 获取数据库中表的表结构。

通过使用 in 子命令查询到数据库中表的 id，之后可以通过 tid 子命令查看表的详细信息。

例如，查询到 `mysql.stat_meta` 表的 id 是 21，可以通过 `tidb-ctl schema tid -i 21` 查看表的详细信息。

```json
{
 "id": 21,
 "name": {
  "O": "stats_meta",
  "L": "stats_meta"
 },
 "charset": "utf8mb4",
 "collate": "utf8mb4_bin",
  ...
}
```

同 in 子命令一样，如果使用的 TiDB 地址不是默认的地址和端口，需要通过 `--host` 和 `--port` 参数指定 TiDB 的地址和 status 端口。

### base64decode 命令

`base64decode` 用来解码 base64 数据。

基本用法：

```shell
tidb-ctl base64decode [base64_data]
tidb-ctl base64decode [db_name.table_name] [base64_data]
tidb-ctl base64decode [table_id] [base64_data]
```

1. 准备环境，执行以下 SQL

    
    ```sql
    use test;
    create table t (a int, b varchar(20),c datetime default current_timestamp , d timestamp default current_timestamp, unique index(a));
    insert into t (a,b,c) values(1,"哈哈 hello",NULL);
    alter table t add column e varchar(20);
    ```

2. 用 HTTP API 接口获取 MVCC 数据

    
    ```shell
    curl "http://$IP:10080/mvcc/index/test/t/a/1?a=1"
    ```

    ```
    {
     "info": {
      "writes": [
       {
        "start_ts": 407306449994645510,
        "commit_ts": 407306449994645513,
        "short_value": "AAAAAAAAAAE="    # unique index a 存的值是对应行的 handle id.
       }
      ]
     }
    }%
    ```

    
    ```shell
    curl "http://$IP:10080/mvcc/key/test/t/1"
    ```

    ```
    {
     "info": {
      "writes": [
       {
        "start_ts": 407306588892692486,
        "commit_ts": 407306588892692489,
        "short_value": "CAIIAggEAhjlk4jlk4ggaGVsbG8IBgAICAmAgIDwjYuu0Rk="  # handle id 为 1 的行数据。
       }
      ]
     }
    }%
    ```

3. 用 `base64decode` 解码 handle id (uint64).

    
    ```shell
    tidb-ctl base64decode AAAAAAAAAAE=
    ```

    ```
    hex: 0000000000000001
    uint64: 1
    ```

4. 用 `base64decode` 解码行数据。

    
    ```shell
    ./tidb-ctl base64decode test.t CAIIAggEAhjlk4jlk4ggaGVsbG8IBgAICAmAgIDwjYuu0Rk=
    ```

    ```
    a:      1
    b:      哈哈 hello
    c is NULL
    d:      2019-03-28 05:35:30
    e not found in data
    ```

    如果 `test.t` 的 table id 是 60，你也可以使用下列命令获得同样结果：

    
    ```shell
    ./tidb-ctl base64decode 60 CAIIAggEAhjlk4jlk4ggaGVsbG8IBgAICAmAgIDwjYuu0Rk=
    ```

    ```
    a:      1
    b:      哈哈 hello
    c is NULL
    d:      2019-03-28 05:35:30
    e not found in data
    ```

### decoder 命令

* 以下示例解码 row key，index key 类似。

    
    ```shell
    ./tidb-ctl decoder "t\x00\x00\x00\x00\x00\x00\x00\x1c_r\x00\x00\x00\x00\x00\x00\x00\xfa"
    ```

    ```
    format: table_row
    table_id: -9223372036854775780
    row_id: -9223372036854775558
    ```

* 以下示例解码 value

    
    ```shell
    ./tidb-ctl decoder AhZoZWxsbyB3b3JsZAiAEA==
    ```

    ```
    format: index_value
    index_value[0]: {type: bytes, value: hello world}
    index_value[1]: {type: bigint, value: 1024}
    ```

### etcd 命令

* `tidb-ctl etcd ddlinfo` 获取 DDL 信息。
* `tidb-ctl etcd putkey KEY VALUE` 添加 KEY VALUE 到 etcd（所有的 KEY 会添加到 `/tidb/ddl/all_schema_versions/` 之下）。

    
    ```shell
    tidb-ctl etcd putkey "foo" "bar"
    ```

    实际是添加 KEY 为 `/tidb/ddl/all_schema_versions/foo`，VALUE 为 `bar` 的键值对到 etcd 中。

* `tidb-ctl etcd delkey` 删除 etcd 中的 KEY，只有前缀以 `/tidb/ddl/fg/owner/` 和 `/tidb/ddl/all_schema_versions/` 开头才允许被删除。

    
    ```shell
    tidb-ctl etcd delkey "/tidb/ddl/fg/owner/foo" &&
    tidb-ctl etcd delkey "/tidb/ddl/all_schema_versions/bar"
    ```

### log 命令

TiDB 错误日志的堆栈信息是一行的格式，可以使用 `tidb-ctl log` 将堆栈信息格式化成多行形式。

### keyrange 命令

`keyrange` 子命令用于查询全局或表相关的关键 key range 信息，以十六进制形式输出。

* 使用 `tidb-ctl keyrange` 命令查看全局的关键 key range。

    
    ```shell
    tidb-ctl keyrange
    ```

    ```
    global ranges:
      meta: (6d, 6e)
      table: (74, 75)
    ```

* 添加 `--encode` 选项可以显示 encode 过的 key（与 TiKV 及 PD 中的格式相同）。

    
    ```shell
    tidb-ctl keyrange --encode
    ```

    ```
    global ranges:
      meta: (6d00000000000000f8, 6e00000000000000f8)
      table: (7400000000000000f8, 7500000000000000f8)
    ```

* 使用 `tidb-ctl keyrange --database={db} --table={tbl}` 命令查看全局和表相关的关键 key range。

    
    ```shell
    tidb-ctl keyrange --database test --table ttt
    ```

    ```
    global ranges:
      meta: (6d, 6e)
      table: (74, 75)
    table ttt ranges: (NOTE: key range might be changed after DDL)
      table: (74800000000000002f, 748000000000000030)
      table indexes: (74800000000000002f5f69, 74800000000000002f5f72)
        index c2: (74800000000000002f5f698000000000000001, 74800000000000002f5f698000000000000002)
        index c3: (74800000000000002f5f698000000000000002, 74800000000000002f5f698000000000000003)
        index c4: (74800000000000002f5f698000000000000003, 74800000000000002f5f698000000000000004)
      table rows: (74800000000000002f5f72, 748000000000000030)
    ```
