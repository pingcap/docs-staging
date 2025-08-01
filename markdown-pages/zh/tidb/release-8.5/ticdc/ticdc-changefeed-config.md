---
title: TiCDC Changefeed 命令行参数和配置参数
summary: 了解 TiCDC Changefeed 详细的命令行参数和配置文件定义。
---

# TiCDC Changefeed 命令行参数和配置参数

## TiCDC Changefeed 命令行参数

本章节将以创建同步任务为例，介绍 TiCDC Changefeed 的命令行参数：

```shell
cdc cli changefeed create --server=http://10.0.10.25:8300 --sink-uri="mysql://root:123456@127.0.0.1:3306/" --changefeed-id="simple-replication-task"
```

```shell
Create changefeed successfully!
ID: simple-replication-task
Info: {"upstream_id":7178706266519722477,"namespace":"default","id":"simple-replication-task","sink_uri":"mysql://root:xxxxx@127.0.0.1:4000/?time-zone=","create_time":"2025-06-12T15:05:46.679218+08:00","start_ts":438156275634929669,"engine":"unified","config":{"case_sensitive":false,"enable_old_value":true,"force_replicate":false,"ignore_ineligible_table":false,"check_gc_safe_point":true,"enable_sync_point":true,"bdr_mode":false,"sync_point_interval":30000000000,"sync_point_retention":3600000000000,"filter":{"rules":["test.*"],"event_filters":null},"mounter":{"worker_num":16},"sink":{"protocol":"","schema_registry":"","csv":{"delimiter":",","quote":"\"","null":"\\N","include_commit_ts":false},"column_selectors":null,"transaction_atomicity":"none","encoder_concurrency":16,"terminator":"\r\n","date_separator":"none","enable_partition_separator":false},"consistent":{"level":"none","max_log_size":64,"flush_interval":2000,"storage":""}},"state":"normal","creator_version":"v8.5.2"}
```

- `--changefeed-id`：同步任务的 ID，格式需要符合正则表达式 `^[a-zA-Z0-9]+(\-[a-zA-Z0-9]+)*$`。如果不指定该 ID，TiCDC 会自动生成一个 UUID（version 4 格式）作为 ID。
- `--sink-uri`：同步任务下游的地址，需要按照以下格式进行配置，目前 scheme 支持 `mysql`、`tidb` 和 `kafka`。

    ```
    [scheme]://[userinfo@][host]:[port][/path]?[query_parameters]
    ```

    URI 的参数包含特殊字符时，如 `! * ' ( ) ; : @ & = + $ , / ? % # [ ]`，需要对 URI 特殊字符进行转义处理。你可以在 [URI Encoder](https://www.urlencoder.org/) 中对 URI 进行转义。

- `--start-ts`：指定 changefeed 的开始 TSO。TiCDC 集群将从这个 TSO 开始拉取数据。默认为当前时间。
- `--target-ts`：指定 changefeed 的目标 TSO。TiCDC 集群拉取数据直到这个 TSO 停止。默认为空，即 TiCDC 不会自动停止。
- `--config`：指定 changefeed 配置文件。

## TiCDC Changefeed 配置文件说明

本章节详细介绍了同步任务的配置。

### `memory-quota`

- 指定该 Changefeed 在 Capture Server 中内存配额的上限。对于超额使用部分，会在运行中被 Go runtime 优先回收。
- 默认值：`1073741824`，即 1 GiB

### `case-sensitive`

- 指定配置文件中涉及的库名、表名是否为大小写敏感。自 v6.5.6、v7.1.3 和 v7.5.0 起，默认值由 `true` 改为 `false`。
- 该配置会同时影响 filter 和 sink 相关配置。
- 默认值：`false`

### `force-replicate`

- 指定是否强制[同步没有有效索引的表](/ticdc/ticdc-manage-changefeed.md#同步没有有效索引的表)。
- 默认值: `false`

### `enable-sync-point` <span class="version-mark">从 v6.3.0 版本开始引入</span>

- 是否开启 Syncpoint 功能，从 v6.3.0 开始支持，该功能默认关闭。
- 从 v6.4.0 开始，使用 Syncpoint 功能需要同步任务拥有下游集群的 SYSTEM_VARIABLES_ADMIN 或者 SUPER 权限。
- 该参数只有当下游为 TiDB 时，才会生效。
- 默认值：`false`

### `sync-point-interval`

- Syncpoint 功能对齐上下游 snapshot 的时间间隔。
- 该参数只有当下游为 TiDB 时，才会生效。
- 配置格式为 `"h m s"`，例如 `"1h30m30s"`
- 默认值：`"10m"`
- 最小值：`"30s"`

### `sync-point-retention`

- Syncpoint 功能在下游表中保存的数据的时长，超过这个时间的数据会被清理。
- 该参数只有当下游为 TiDB 时，才会生效。
- 配置格式为 `"h m s"`，例如 `"24h30m30s"`
- 默认值：`"24h"`

### `sql-mode` <span class="version-mark">从 v6.5.6、v7.1.3 和 v7.5.0 版本开始引入</span>

- 用于设置解析 DDL 时使用的 [SQL 模式](/sql-mode.md)，多个模式之间用逗号分隔。
- 默认值：`"ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION"`，与 TiDB 的默认 SQL 模式一致

### `bdr-mode`

- 如果要使用 TiCDC 搭建 BDR (Bidirectional replication) 集群，需要将该参数设置为 `true`，同时要将 TiDB 集群设置为 BDR 模式。详情请参考 [TiCDC 双向复制](/ticdc/ticdc-bidirectional-replication.md#ticdc-双向复制)
- 默认值：`false`，表示不处于 BDR 模式

### `changefeed-error-stuck-duration`

- Changefeed 发生内部错误或异常时允许自动重试的时间。
- 若 Changefeed 发生内部错误或异常，且持续时间超过该参数设置的时间，Changefeed 会进入 Failed 状态。
- 当 Changefeed 处于 Failed 状态时，需要手动重启 Changefeed 才能恢复。
- 配置格式为 `"h m s"`，例如 `"1h30m30s"`
- 默认值：`"30m"`

### mounter

#### `worker-num`

- mounter 解码 KV 数据的线程数。
- 默认值：`16`

### filter

#### `ignore-txn-start-ts`

- 忽略指定 start_ts 的事务。

<!-- 示例值：`[1, 2]` -->

#### `rules`

- 过滤器规则，过滤规则语法参考[表库过滤语法](/table-filter.md#表库过滤语法)。

<!-- 示例值：`['*.*', '!test.*']` -->

#### filter.event-filters

##### `matcher`

- matcher 是一个白名单，`matcher = ["test.worker"]` 表示该过滤规则只应用于 `test` 库中的 `worker` 表。

##### `ignore-event`

- `ignore-event = ["insert"]` 表示过滤掉 `INSERT` 事件。
- `ignore-event = ["drop table", "delete"]` 表示忽略 `DROP TABLE` 的 DDL 事件和 `DELETE` 类型的 DML 事件。需要注意的是，在更新 TiDB 中聚簇索引的列值时，TiCDC 会将一个 `UPDATE` 事件拆分成为 `DELETE` 和 `INSERT` 事件，TiCDC 无法将该类事件识别为 `UPDATE` 事件，因此无法正确地进行过滤。

##### `ignore-sql`

- `ignore-sql = ["^drop", "add column"]` 表示过滤掉以 `DROP` 开头或者包含 `ADD COLUMN` 的 DDL。

##### `ignore-delete-value-expr`

- `ignore-delete-value-expr = "name = 'john'"` 表示过滤掉包含 `name = 'john'` 条件的 `DELETE` DML。

##### `ignore-insert-value-expr`

- `ignore-insert-value-expr = "id >= 100"` 表示过滤掉包含 `id >= 100` 条件的 `INSERT` DML。

##### `ignore-update-old-value-expr`

- `ignore-update-old-value-expr = "age < 18"` 表示过滤掉旧值 `age < 18` 的 `UPDATE` DML。

##### `ignore-update-new-value-expr`

- `ignore-update-new-value-expr = "gender = 'male'"` 表示过滤掉新值 `gender = 'male'` 的 `UPDATE` DML。

### scheduler

#### `enable-table-across-nodes`

- 将表以 Region 为单位分配给多个 TiCDC 节点进行同步。
- 该功能只在 Kafka changefeed 上生效，暂不支持 MySQL changefeed。
- `enable-table-across-nodes` 开启后，有两种分配模式：

    1. 按 Region 的数量分配，即每个 TiCDC 节点处理 Region 的个数基本相等。当某个表 Region 个数大于 `region-threshold` 值时，会将表分配到多个节点处理。`region-threshold` 默认值为 `100000`。
    2. 按写入的流量分配，即每个 TiCDC 节点处理 Region 总修改行数基本相当。只有当表中每分钟修改行数超过 `write-key-threshold` 值时，该表才会生效。

  两种方式配置一种即可生效，当 `region-threshold` 和 `write-key-threshold` 同时配置时，TiCDC 将优先采用按流量分配的模式，即 `write-key-threshold`。

- 默认为 `false`。设置为 `true` 以打开该功能。
- 默认值：`false`

#### `region-threshold`

- 默认值：`100000`

#### `write-key-threshold`

- 默认值：`0`，代表默认不会采用流量的分配模式

### sink

<!-- 以下是 MQ 类型 sink 配置 -->

#### `dispatchers`

- 对于 MQ 类的 Sink，可以通过 dispatchers 配置 event 分发器。
- 支持 partition 及 topic（从 v6.1 开始支持）两种 event 分发器。二者的详细说明见下一节。
- matcher 的匹配语法和过滤器规则语法相同，matcher 匹配规则的详细说明见下一节。
- 该参数只有当下游为消息队列时，才会生效。
- 当下游 MQ 为 Pulsar 时，如果 partition 的路由规则未指定为 `ts`、`index-value`、`table`、`default` 中的任意一个，那么将会使用你设置的字符串作为每一条 Pulsar message 的 key 进行路由。例如，如果你指定的路由规则为 `'code'` 字符串，那么符合该 matcher 的所有 Pulsar message 都将会以 `'code'` 作为 key 进行路由。

#### `column-selectors` <span class="version-mark">从 v7.5.0 版本开始引入</span>

- 用于选择部分列进行同步。仅对 Kafka Sink 生效。

#### `protocol`

- 用于指定编码消息时使用的格式协议。
- 当下游类型是 Kafka 时，支持 canal-json、avro、debezium、open-protocol、simple。
- 当下游类型是 Pulsar 时，仅支持 canal-json 协议。
- 当下游类型是存储服务时，目前仅支持 canal-json、csv 两种协议。
- 注意：该参数只有当下游为 Kafka、Pulsar，或存储服务时，才会生效。

<!-- 示例值：`"canal-json"` -->

#### `delete-only-output-handle-key-columns` <span class="version-mark">从 v7.2.0 版本开始引入</span>

- 用于指定 Delete 事件的输出内容，只对 canal-json 和 open-protocol 协议有效。
- 该参数和 `force-replicate` 参数不兼容，如果同时将该参数和 `force-replicate` 设置为 `true`，创建 changefeed 会报错。
- Avro 协议不受该参数控制，总是只输出主键列，或唯一索引列的内容。
- CSV 协议不受该参数控制，总是输出所有列的内容。
- 默认值：`false`，即输出所有列的内容。
- 当设置为 `true` 时，只输出主键列，或唯一索引列的内容。

#### `schema-registry`

- Schema 注册表的 URL。
- 该参数只有当下游为消息队列时，才会生效。

<!-- 示例值：`"http://localhost:80801/subjects/{subject-name}/versions/{version-number}/schema"` -->

#### `encoder-concurrency`

- 编码数据时所用编码器的线程数。
- 该参数只有当下游为消息队列时，才会生效。
- 默认值：`32`

#### `enable-kafka-sink-v2`

- 是否开启 Kafka Sink V2。Kafka Sink V2 内部使用 kafka-go 实现。
- 该参数是一个实验特性，并且只有当下游为消息队列时才会生效。
- 默认值：`false`

#### `only-output-updated-columns` <span class="version-mark">从 v7.1.0 版本开始引入</span>

- 是否只向下游同步有内容更新的列。
- 注意：该参数只有当下游为消息队列，并且使用 Open Protocol 或 Canal-JSON 时，才会生效。
- 默认值：`false`

<!-- 以下是存储服务类型 sink 配置 -->

#### `terminator`

- 该配置项仅在同步到存储服务的 sink 中使用，在 MQ 和 MySQL 类 sink 中无需设置。
- 换行符，用来分隔两个数据变更事件。
- 默认值：`""`，表示使用 `\r\n` 作为换行符。

#### `date-separator`

- 文件路径的日期分隔类型。详情参考[数据变更记录](/ticdc/ticdc-sink-to-cloud-storage.md#数据变更记录)。
- 该参数只有当下游为存储服务时，才会生效。
- 默认值：`day`，即按天分隔
- 可选值：`none`、`year`、`month`、`day`

#### `enable-partition-separator`

- 是否使用 partition 作为分隔字符串。
- 该参数只有当下游为存储服务时，才会生效
- 默认值：`true`，即一张表中各个 partition 的数据会分不同的目录来存储
- 注意：后续版本中该配置项将会被废弃，并强制设置成 `true`。建议保持该配置项为默认值，以避免下游分区表可能丢数据的问题。详情请参见 [Issue #11979](https://github.com/pingcap/tiflow/issues/11979)。使用示例详见[数据变更记录](/ticdc/ticdc-sink-to-cloud-storage.md#数据变更记录)。

#### `debezium-disable-schema`

- 是否关闭 schema 信息的输出。
- 默认值：`false`，即输出 schema 信息
- 该参数只有当 sink 类型为 MQ 且输出协议为 Debezium 时才生效。

#### sink.csv <span class="version-mark">从 v6.5.0 版本开始引入</span>

从 v6.5.0 开始，TiCDC 支持以 CSV 格式将数据变更记录保存至存储服务中，在 MQ 和 MySQL 类 sink 中无需设置。

##### `delimiter`

- 字段之间的分隔符。必须为 ASCII 字符。
- 默认值：`,`

##### `quote`

- 用于包裹字段的引号字符。空值代表不使用引号字符。
- 默认值：`"`

##### `null`

- CSV 中列为 NULL 时将以什么字符来表示。
- 默认值：`\N`

##### `include-commit-ts`

- 是否在 CSV 行中包含 commit-ts。
- 默认值：`false`

##### `binary-encoding-method`

- 二进制类型数据的编码方式。
- 默认值：`base64`
- 可选值：`base64`、`hex`

##### `output-handle-key`

- 是否输出 handle 列信息。该配置项仅用于内部实现，不推荐设置该配置项。
- 默认值：`false`

##### `output-old-value`

- 是否输出行数据更改前的值。
- 开启后，即当该参数设为 `true` 时，UPDATE 事件会输出两行数据：第一行为 DELETE 事件，输出更改前的数据；第二行为 INSERT 事件，输出更改后的数据。
- 开启后，会在变更数据列前增加 `"is-update"` 列。该列用来标识当前行的变更数据是来自 Update 事件，还是原始的 INSERT/DELETE 事件。如果当前行的变更数据来自 UPDATE 事件，则 `"is-update"` 列为 `true`，否则为 `false`。
- 默认值：`false`

从 v8.0.0 开始，TiCDC 新增了 Simple Protocol 消息编码协议，以下为该协议的配置参数。关于该协议的详情，请参考 [TiCDC Simple Protocol](/ticdc/ticdc-simple-protocol.md)。

以下为 Simple Protocol 参数，用来控制 bootstrap 消息的发送行为。

#### `send-bootstrap-interval-in-sec`

- 控制发送 bootstrap 消息的时间间隔。
- 默认值：`120`，即每张表每隔 120 秒发送一次 bootstrap 消息
- 单位：秒

#### `send-bootstrap-in-msg-count`

- 控制发送 bootstrap 的消息间隔，单位为消息数。
- 默认值：`10000`，即每张表每发送 10000 条行变更消息就发送一次 bootstrap 消息
- 如果要关闭 bootstrap 消息的发送，则将 `send-bootstrap-interval-in-sec` 和 `send-bootstrap-in-msg-count` 均设置为 `0`。

#### `send-bootstrap-to-all-partition`

- 控制是否发送 bootstrap 消息到所有的 partition。
- 如果设置为 `false`，则只发送 bootstrap 消息到对应表 topic 的第一个 partition。
- 默认值：`true`

#### sink.kafka-config.codec-config

##### `encoding-format`

- 用来控制 simple protocol 的消息的编码格式，目前支持 `json` 和 `avro` 两种格式。
- 默认值：`json`
- 可选值：`json`、`avro`

#### sink.open

##### `output-old-value`

- 是否输出行数据更改前的值。关闭后，UPDATE 事件不会输出 "p" 字段的数据。
- 默认值：`true`

#### sink.debezium

##### `output-old-value`

- 是否输出行数据更改前的值。关闭后，UPDATE 事件不会输出 "before" 字段的数据。
- 默认值：`true`

### consistent

consistent 中的字段用于配置 Changefeed 的数据一致性。详细信息请参考[灾难场景的最终一致性复制](/ticdc/ticdc-sink-to-mysql.md#灾难场景的最终一致性复制)。

注意：一致性相关参数只有当下游为数据库并且开启 redo log 功能时，才会生效。

#### `level`

- 数据一致性级别。设置为 `"none"` 时将关闭 redo log。
- 默认值：`"none"`
- 可选值：`"none"`、`"eventual"`

#### `max-log-size`

- redo log 的最大日志大小。
- 默认值：`64`
- 单位：MiB

#### `flush-interval`

- 两次 redo log 刷新的时间间隔。
- 默认值：`2000`
- 单位：毫秒

#### `storage`

- redo log 使用存储服务的 URI。
- 默认值：`""`

#### `use-file-backend`

- 是否将 redo log 存储到本地文件中。
- 默认值：`false`

#### `encoding-worker-num`

- 控制 redo 模块中编解码 worker 的数量。
- 默认值：`16`

#### `flush-worker-num`

- 控制 redo 模块中上传文件 worker 的数量。
- 默认值：`8`

#### `compression` <span class="version-mark">从 v6.5.6、v7.1.3、v7.5.1 和 v7.6.0 版本开始引入</span>

- redo log 文件的压缩行为。
- 默认值：`""`，表示不进行压缩
- 可选值：`""`、`"lz4"`

#### `flush-concurrency` <span class="version-mark">从 v6.5.6、v7.1.3、v7.5.1 和 v7.6.0 版本开始引入</span>

- redo log 上传单个文件的并发数。
- 默认值：`1`，表示禁用并发

### integrity

#### `integrity-check-level`

- 是否开启单行数据的 Checksum 校验功能。
- 默认值：`"none"`，即不开启
- 可选值：`"none"`、`"correctness"`

#### `corruption-handle-level`

- 当单行数据的 Checksum 校验失败时，Changefeed 打印错误行数据相关日志的级别。
- 默认值：`"warn"` 
- 可选值：`"warn"`、`"error"`

### sink.kafka-config

以下参数仅在下游为 Kafka 时生效。

#### `sasl-mechanism`

- Kafka SASL 认证机制。
- 默认值：`""`，表示不使用 SASL 认证

<!-- 示例值：`OAUTHBEARER` -->

#### `sasl-oauth-client-id`

- Kafka SASL OAUTHBEARER 认证机制中的 client-id。在使用该认证机制时，该参数必填。
- 默认值：`""`

#### `sasl-oauth-client-secret`

- Kafka SASL OAUTHBEARER 认证机制中的 client-secret。需要 Base64 编码。在使用该认证机制时，该参数必填。
- 默认值：`""`

#### `sasl-oauth-token-url`

- Kafka SASL OAUTHBEARER 认证机制中的 token-url 用于获取 token。在使用该认证机制时，该参数必填。
- 默认值：`""`

#### `sasl-oauth-scopes`

- Kafka SASL OAUTHBEARER 认证机制中的 scopes。在使用该认证机制时，该参数可选填。
- 默认值：`""`

#### `sasl-oauth-grant-type`

- Kafka SASL OAUTHBEARER 认证机制中的 grant-type。在使用该认证机制时，该参数可选填。
- 默认值：`"client_credentials"`

#### `sasl-oauth-audience`

- Kafka SASL OAUTHBEARER 认证机制中的 audience。在使用该认证机制时，该参数可选填。
- 默认值：`""`

<!-- 示例值：`"kafka"` -->

#### `output-raw-change-event`

- 控制是否输出原始的数据变更事件。更多信息，请参考[控制是否拆分主键或唯一键 `UPDATE` 事件](/ticdc/ticdc-split-update-behavior.md#控制是否拆分主键或唯一键-update-事件)。
- 默认值：`false`

### sink.kafka-config.glue-schema-registry-config

以下配置仅在选用 avro 作为协议，并且使用 AWS Glue Schema Registry 时需要配置。

```toml
region="us-west-1"
registry-name="ticdc-test"
access-key="xxxx"
secret-access-key="xxxx"
token="xxxx"
```

详细信息请参考 [TiCDC 集成 AWS Glue Schema Registry](/ticdc/ticdc-sink-to-kafka.md#ticdc-集成-aws-glue-schema-registry)。

### sink.pulsar-config

以下配置项仅在下游为 Pulsar 时生效。

#### `authentication-token`

- 使用 token 进行 Pulsar 服务端的认证，此处为 token 的值。

#### `token-from-file`

- 指定使用 token 进行 Pulsar 服务端的认证，此处为 token 所在文件的路径。

#### `basic-user-name`

- Pulsar 使用 basic 账号密码验证身份。

#### `basic-password`

- Pulsar 使用 basic 账号密码验证身份，此处为密码。

#### `auth-tls-certificate-path`

- Pulsar TLS 加密认证证书路径。

#### `auth-tls-private-key-path`

- Pulsar TLS 加密认证私钥路径。

#### `tls-trust-certs-file-path`

- Pulsar TLS 加密可信证书文件路径。

#### `oauth2.oauth2-issuer-url`

- Pulsar oauth2 issuer-url
- 详细配置请参考 [Pulsar 官方介绍](https://pulsar.apache.org/docs/2.10.x/client-libraries-go/#tls-encryption-and-authentication)。

#### `oauth2.oauth2-audience`

- Pulsar oauth2 audience
- 详细配置请参考 [Pulsar 官方介绍](https://pulsar.apache.org/docs/2.10.x/client-libraries-go/#tls-encryption-and-authentication)。

#### `oauth2.oauth2-private-key`

- Pulsar oauth2 private-key
- 详细配置请参考 [Pulsar 官方介绍](https://pulsar.apache.org/docs/2.10.x/client-libraries-go/#tls-encryption-and-authentication)。

#### `oauth2.oauth2-client-id`

- Pulsar oauth2 client-id
- 详细配置请参考 [Pulsar 官方介绍](https://pulsar.apache.org/docs/2.10.x/client-libraries-go/#tls-encryption-and-authentication)。

#### `oauth2.oauth2-scope`

- Pulsar oauth2 oauth2-scope
- 详细配置请参考 [Pulsar 官方介绍](https://pulsar.apache.org/docs/2.10.x/client-libraries-go/#tls-encryption-and-authentication)。

#### `pulsar-producer-cache-size`

- TiCDC 中缓存 Pulsar Producer 的个数。每个 Pulsar Producer 对应一个 topic，如果你需要同步的 topic 数量大于默认值，则需要调大该数量。
- 默认值：`10240`

#### `compression-type`

- Pulsar 数据压缩方式。
- 默认值：`""`，表示不压缩
- 可选值：`"lz4"`、`"zlib"`、`"zstd"`

#### `connection-timeout`

- Pulsar 客户端与服务端建立 TCP 连接的超时时间。
- 默认值：`5`（秒）

#### `operation-timeout`

- Pulsar 客户端发起创建、订阅等操作的超时时间。
- 默认值：`30`（秒）

#### `batching-max-messages`

- Pulsar Producer 发送消息时的单个 batch 内的消息数量上限。
- 默认值：`1000`

#### `batching-max-publish-delay`

- Pulsar Producer 消息攒批的时间间隔。
- 默认值：`10`（毫秒）

#### `send-timeout`

- Pulsar Producer 发送消息的超时时间。
- 默认值：`30`（秒）

#### `output-raw-change-event`

- 控制是否输出原始的数据变更事件。更多信息，请参考[控制是否拆分主键或唯一键 `UPDATE` 事件](/ticdc/ticdc-split-update-behavior.md#控制是否拆分主键或唯一键-update-事件)。
- 默认值：`false`

### sink.cloud-storage-config

#### `worker-count`

- 向下游存储服务保存数据变更记录的并发度。
- 默认值：`16`

#### `flush-interval`

- 向下游存储服务保存数据变更记录的间隔。
- 默认值：`"2s"`

#### `file-size`

- 单个数据变更文件的字节数超过 `file-size` 时将其保存至存储服务中。
- 默认值：`67108864`，即 64 MiB

#### `file-expiration-days`

- 文件保留的时长，仅在 `date-separator` 配置为 `day` 时生效。
- 默认值：`0`，表示禁用文件清理
- 假设 `file-expiration-days = 1` 且 `file-cleanup-cron-spec = "0 0 0 * * *"`，TiCDC 将在每天 00:00:00 时刻清理已保存超过 24 小时的文件。例如，2023/12/02 00:00:00 将清理 2023/12/01 之前（注意：不包括 2023/12/01）的文件。

#### `file-cleanup-cron-spec`

- 定时清理任务的运行周期，与 crontab 配置兼容。
- 格式为 `<Second> <Minute> <Hour> <Day of the month> <Month> <Day of the week (Optional)>`
- 默认值：`"0 0 2 * * *"`，表示每天凌晨两点执行清理任务

#### `flush-concurrency`

- 上传单个文件的并发数。
- 默认值：`1`，表示禁用并发

#### `output-raw-change-event`

- 控制是否输出原始的数据变更事件。更多信息，请参考[控制是否拆分主键或唯一键 `UPDATE` 事件](/ticdc/ticdc-split-update-behavior.md#控制是否拆分主键或唯一键-update-事件)。
- 默认值：`false`
