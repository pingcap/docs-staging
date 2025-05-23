---
title: TiKV Control 使用说明
aliases: ['/docs-cn/dev/tikv-control/','/docs-cn/dev/reference/tools/tikv-control/']
summary: TiKV Control（tikv-ctl）是 TiKV 的命令行工具，用于管理 TiKV 集群。它的安装目录在 `~/.tiup/components/ctl/{VERSION}/` 目录下。通过 TiUP 使用 TiKV Control，可以调用 `tikv-ctl` 工具。通用参数包括远程模式和本地模式，以及两个简单的命令 `--to-hex` 和 `--to-escaped`。其他子命令包括查看 Raft 状态机的信息、查看 Region 的大小、扫描查看给定范围的 MVCC、查看给定 key 的 MVCC、扫描 raw key、打印某个 key 的值、打印 Region 的 properties 信息、手动 compact 单个 TiKV 的数据、手动 compact 整个 TiKV 集群的数据、设置一个 Region 副本为 tombstone 状态、向 TiKV 发出 consistency-check 请求、Dump snapshot 元文件、打印 Raft 状态机出错的 Region、动态修改 TiKV 的配置、强制 Region 从多副本失败状态恢复服务、恢复损坏的 MVCC 数据、Ldb 命令、打印加密元数据、打印损坏的 SST 文件信息、获取一个 Region 的 RegionReadProgress 状态。
---

# TiKV Control 使用说明

TiKV Control（以下简称 tikv-ctl）是 TiKV 的命令行工具，用于管理 TiKV 集群。它的安装目录如下：

+ 如果是使用 TiUP 部署的集群，在 `~/.tiup/components/ctl/{VERSION}/` 目录下。

## 通过 TiUP 使用 TiKV Control

> **注意：**
>
> 建议使用的 Control 工具版本与集群版本保持一致。

`tikv-ctl` 也集成在了 `tiup` 命令中。执行以下命令，即可调用 `tikv-ctl` 工具：

```shell
tiup ctl:v<CLUSTER_VERSION> tikv
```

```
Starting component `ctl`: /home/tidb/.tiup/components/ctl/v4.0.8/ctl tikv
TiKV Control (tikv-ctl)
Release Version:   4.0.8
Edition:           Community
Git Commit Hash:   83091173e960e5a0f5f417e921a0801d2f6635ae
Git Commit Branch: heads/refs/tags/v4.0.8
UTC Build Time:    2020-10-30 08:40:33
Rust Version:      rustc 1.42.0-nightly (0de96d37f 2019-12-19)
Enable Features:   jemalloc mem-profiling portable sse protobuf-codec
Profile:           dist_release

A tool for interacting with TiKV deployments.

USAGE:
    TiKV Control (tikv-ctl) [FLAGS] [OPTIONS] [SUBCOMMAND]

FLAGS:
    -h, --help                    Prints help information
        --skip-paranoid-checks    Skip paranoid checks when open rocksdb
    -V, --version                 Prints version information

OPTIONS:
        --ca-path <ca-path>              Set the CA certificate path
        --cert-path <cert-path>          Set the certificate path
        --config <config>                TiKV config path, by default it's <deploy-dir>/conf/tikv.toml
        --data-dir <data-dir>            TiKV data directory path, check <deploy-dir>/scripts/run.sh to get it
        --decode <decode>                Decode a key in escaped format
        --encode <encode>                Encode a key in escaped format
        --to-hex <escaped-to-hex>        Convert an escaped key to hex key
        --to-escaped <hex-to-escaped>    Convert a hex key to escaped key
        --host <host>                    Set the remote host
        --key-path <key-path>            Set the private key path
        --log-level <log-level>          Set the log level [default:warn]
        --pd <pd>                        Set the address of pd

SUBCOMMANDS:
    bad-regions           Get all regions with corrupt raft
    cluster               Print the cluster id
    compact               Compact a column family in a specified range
    compact-cluster       Compact the whole cluster in a specified range in one or more column families
    consistency-check     Force a consistency-check for a specified region
    decrypt-file          Decrypt an encrypted file
    diff                  Calculate difference of region keys from different dbs
    dump-snap-meta        Dump snapshot meta file
    encryption-meta       Dump encryption metadata
    fail                  Inject failures to TiKV and recovery
    help                  Prints this message or the help of the given subcommand(s)
    metrics               Print the metrics
    modify-tikv-config    Modify tikv config, eg. tikv-ctl --host ip:port modify-tikv-config -n
                          rocksdb.defaultcf.disable-auto-compactions -v true
    mvcc                  Print the mvcc value
    print                 Print the raw value
    raft                  Print a raft log entry
    raw-scan              Print all raw keys in the range
    recover-mvcc          Recover mvcc data on one node by deleting corrupted keys
    recreate-region       Recreate a region with given metadata, but alloc new id for it
    region-properties     Show region properties
    scan                  Print the range db range
    size                  Print region size
    split-region          Split the region
    store                 Print the store id
    tombstone             Set some regions on the node to tombstone by manual
    unsafe-recover        Unsafely recover the cluster when the majority replicas are failed
```

你可以在 `tiup ctl:v<CLUSTER_VERSION> tikv` 后面再接上相应的参数与子命令。

## 通用参数

tikv-ctl 提供以下两种运行模式：

- **远程模式**。通过 `--host` 选项接受 TiKV 的服务地址作为参数。在此模式下，如果 TiKV 启用了 SSL，则 tikv-ctl 也需要指定相关的证书文件，例如：

    
    ```shell
    tikv-ctl --ca-path ca.pem --cert-path client.pem --key-path client-key.pem --host 127.0.0.1:20160 <subcommands>
    ```

    某些情况下，tikv-ctl 与 PD 进行通信，而不与 TiKV 通信。此时你需要使用 `--pd` 选项而非 `--host` 选项，例如：

    
    ```shell
    tikv-ctl --pd 127.0.0.1:2379 compact-cluster
    ```

    ```
    store:"127.0.0.1:20160" compact db:KV cf:default range:([], []) success!
    ```

- **本地模式**：

    - 通过 `--data-dir` 选项来指定本地 TiKV 数据的目录路径。
    - 通过 `--config` 选项来指定本地 TiKV 配置文件到路径。

  在此模式下，需要停止正在运行的 TiKV 实例。

以下如无特殊说明，所有命令都同时支持这两种模式。

除此之外，tikv-ctl 还有两个简单的命令 `--to-hex` 和 `--to-escaped`，用于对 key 的形式作简单的变换。一般使用 `escaped` 形式，示例如下：

```shell
tikv-ctl --to-escaped 0xaaff
```

```
\252\377
```

```shell
tikv-ctl --to-hex "\252\377"
```

```
AAFF
```

> **注意：**
>
> 在命令行上指定 `escaped` 形式的 key 时，需要用双引号引起来，否则 bash 会将反斜杠吃掉，导致结果错误。

## 各项子命令及部分参数、选项

下面逐一对 tikv-ctl 支持的子命令进行举例说明。有的子命令支持很多可选参数，要查看全部细节，可运行 `tikv-ctl --help <subcommand>`。

### 查看 Raft 状态机的信息

`raft` 子命令可以查看 Raft 状态机在某一时刻的状态。状态信息包括 **RegionLocalState**、**RaftLocalState** 和 **RegionApplyState** 三个结构体，及某一条 log 对应的 Entries。

可以使用 `region` 和 `log` 两个子命令分别查询以上信息。两条子命令都同时支持远程模式和本地模式。

对于 `region` 子命令：

- 要查看指定的 Region，可在命令中使用 `-r` 参数，多个 Region 以 `,` 分隔。也可以使用 `--all-regions` 参数来返回所有 Region（`-r` 与 `--all-regions` 不能同时使用）
- 要限制输出的 Region 的数量，可在命令中使用 `--limit` 参数（默认为 `16`）
- 要查询某个 key 范围中包含哪些 Region，可在命令中使用 `--start` 和 `--end` 参数（默认不限范围，采用 Hex 格式）

需要输出 ID 为 `1239` 的 Region 时，用法及输出内容如下所示：

```shell
tikv-ctl --host 127.0.0.1:20160 raft region -r 1239
```

```
"region id": 1239
"region state": { 
    id: 1239, 
    start_key: 7480000000000000FF4E5F728000000000FF1443770000000000FA, 
    end_key: 7480000000000000FF4E5F728000000000FF21C4420000000000FA, 
    region_epoch: {conf_ver: 1 version: 43}, 
    peers: [ {id: 1240 store_id: 1 role: Voter} ] 
}
"raft state": {
    hard_state {term: 8 vote: 5 commit: 7} 
    last_index: 8)
}
"apply state": {
    applied_index: 8 commit_index: 8 commit_term: 8
    truncated_state {index: 5 term: 5} 
}
```

需要查询某个 key 范围中包含哪些 Region 时，用法及输出内容如下所示：

- 当 key 范围包含在某个 Region 中时，将会输出该 Region 信息。
- 当 key 范围精准到某个 Region 的范围时，以上述 Region `1239` 为例：当给定的 key 范围为 Region `1239` 的范围时，由于 Region 范围为左闭右开区间，并且 Region `1009` 以 Region `1239` 的 `end_key` 作为 `start_key`，因此会同时输出 Region `1009` 和 Region `1239` 的信息。

```shell
tikv-ctl --host 127.0.0.1:20160 raft region --start 7480000000000000FF4E5F728000000000FF1443770000000000FA --end 7480000000000000FF4E5F728000000000FF21C4420000000000FA
```

```
"region state": { 
    id: 1009
    start_key: 7480000000000000FF4E5F728000000000FF21C4420000000000FA, 
    end_key: 7480000000000000FF5000000000000000F8, 
    ...
}
"region state": { 
    id: 1239
    start_key: 7480000000000000FF4E5F728000000000FF06C6D60000000000FA, 
    end_key: 7480000000000000FF4E5F728000000000FF1443770000000000FA, 
    ...
}
```

### 查看 Region 的大小

使用 `size` 命令可以查看 Region 的大小：

```shell
tikv-ctl --data-dir /path/to/tikv size -r 2
```

```
region id: 2
cf default region size: 799.703 MB
cf write region size: 41.250 MB
cf lock region size: 27616
```

### 扫描查看给定范围的 MVCC

`scan` 命令的 `--from` 和 `--to` 参数接受两个 escaped 形式的 raw key，并用 `--show-cf` 参数指定只需要查看哪些列族。

```shell
tikv-ctl --data-dir /path/to/tikv scan --from 'zm' --limit 2 --show-cf lock,default,write
```

```
key: zmBootstr\377a\377pKey\000\000\377\000\000\373\000\000\000\000\000\377\000\000s\000\000\000\000\000\372
         write cf value: start_ts: 399650102814441473 commit_ts: 399650102814441475 short_value: "20"
key: zmDB:29\000\000\377\000\374\000\000\000\000\000\000\377\000H\000\000\000\000\000\000\371
         write cf value: start_ts: 399650105239273474 commit_ts: 399650105239273475 short_value: "\000\000\000\000\000\000\000\002"
         write cf value: start_ts: 399650105199951882 commit_ts: 399650105213059076 short_value: "\000\000\000\000\000\000\000\001"
```

### 查看给定 key 的 MVCC

与 `scan` 命令类似，`mvcc` 命令可以查看给定 key 的 MVCC：

```shell
tikv-ctl --data-dir /path/to/tikv mvcc -k "zmDB:29\000\000\377\000\374\000\000\000\000\000\000\377\000H\000\000\000\000\000\000\371" --show-cf=lock,write,default
```

```
key: zmDB:29\000\000\377\000\374\000\000\000\000\000\000\377\000H\000\000\000\000\000\000\371
         write cf value: start_ts: 399650105239273474 commit_ts: 399650105239273475 short_value: "\000\000\000\000\000\000\000\002"
         write cf value: start_ts: 399650105199951882 commit_ts: 399650105213059076 short_value: "\000\000\000\000\000\000\000\001"
```

> **注意：**
>
> 该命令中，key 同样需要是 escaped 形式的 raw key。

### 扫描 raw key

使用 `raw-scan` 命令，TiKV 可直接在 RocksDB 中扫描 raw key。

> **注意：**
>
> 如果要扫描数据 key，需要在 key 前添加 `'z'` 前缀。

- 要指定扫描范围，可在 `raw-scan` 命令中使用 `--from` 和 `--to` 参数（默认不限范围）
- 要限制能够打印出的 key 的数量（默认为 `30`），可在命令中使用 `--limit` 参数
- 要指定扫描的 CF，可在命令中使用 `--cf` 参数（可选值为 `default`，`write`，`lock`）

```shell
tikv-ctl --data-dir /var/lib/tikv raw-scan --from 'zt' --limit 2 --cf default
```

```
key: "zt\200\000\000\000\000\000\000\377\005_r\200\000\000\000\000\377\000\000\001\000\000\000\000\000\372\372b2,^\033\377\364", value: "\010\002\002\002%\010\004\002\010root\010\006\002\000\010\010\t\002\010\n\t\002\010\014\t\002\010\016\t\002\010\020\t\002\010\022\t\002\010\024\t\002\010\026\t\002\010\030\t\002\010\032\t\002\010\034\t\002\010\036\t\002\010 \t\002\010\"\t\002\010s\t\002\010&\t\002\010(\t\002\010*\t\002\010,\t\002\010.\t\002\0100\t\002\0102\t\002\0104\t\002"
key: "zt\200\000\000\000\000\000\000\377\025_r\200\000\000\000\000\377\000\000\023\000\000\000\000\000\372\372b2,^\033\377\364", value: "\010\002\002&slow_query_log_file\010\004\002P/usr/local/mysql/data/localhost-slow.log"

Total scanned keys: 2
```

### 打印某个 key 的值

打印某个 key 的值需要用到 `print` 命令。示例从略。

### 打印 Region 的 properties 信息

为了记录 Region 的状态信息，TiKV 将一些数据写入 Region 的 SST 文件中。你可以用子命令 `region-properties` 运行 tikv-ctl 来查看这些 properties 信息。例如：

```shell
tikv-ctl --host localhost:20160 region-properties -r 2
```

```
num_files: 0
num_entries: 0
num_deletes: 0
mvcc.min_ts: 18446744073709551615
mvcc.max_ts: 0
mvcc.num_rows: 0
mvcc.num_puts: 0
mvcc.num_versions: 0
mvcc.max_row_versions: 0
middle_key_by_approximate_size:
```

这些 properties 信息可以用于检查某个 Region 是否健康或者修复不健康的 Region。例如，使用 `middle_key_approximate_size` 可以手动分裂 Region。

### 手动 compact 单个 TiKV 的数据

`compact` 命令可以对单个 TiKV 进行手动 compact。

- `--from` 和 `--to` 选项以 escaped raw key 形式指定 compact 的范围。如果没有设置，表示 compact 整个 TiKV。
- `--region` 选项指定 compact Region 的范围。如果设置，则 `--from` 和 `--to` 选项会被忽略。
- `-c` 选项指定 column family 名称，默认值为 `default`，可选值为 `default`、`lock` 和 `write`。
- `-d` 选项指定要 compact 的 RocksDB，默认值为 `kv`，可选值为 `kv` 和 `raft`。
- `--threads` 选项可以指定 compact 的并发数，默认值是 8。一般来说，并发数越大，compact 的速度越快，但是也会对服务造成影响，所以需要根据情况选择合适的并发数。
- `--bottommost` 选项可以指定 compact 是否包括最下层的文件。可选值为 `default`、`skip` 和 `force`，默认为 `default`。
    - `default` 表示只有开启了 Compaction Filter 时 compact 才会包括最下层文件。
    - `skip` 表示 compact 不包括最下层文件。
    - `force` 表示 compact 总是包括最下层文件。

- 在本地模式 compact data，执行如下命令：

    ```shell
    tikv-ctl --data-dir /path/to/tikv compact -d kv
    ```

- 在远程模式 compact data，执行如下命令：

    ```shell
    tikv-ctl --host ip:port compact -d kv
    ```

### 手动 compact 整个 TiKV 集群的数据

`compact-cluster` 命令可以对整个 TiKV 集群进行手动 compact。该命令参数的含义和使用与 `compact` 命令一样，唯一的区别如下：

- 使用 `compact-cluster` 命令时，通过 `--pd` 指定 PD 所在的地址，以便 `tikv-ctl` 可以找到集群中的所有 TiKV 节点作为 compact 目标。
- 使用 `compact` 命令时，通过 `--data-dir` 或者 `--host` 指定单个 TiKV 作为 compact 目标。

### 设置一个 Region 副本为 tombstone 状态

`tombstone` 命令常用于因为机器掉电导致 Raft 状态机丢失部分写入的情况。它可以在一个 TiKV 实例上将一些 Region 的副本设置为 Tombstone 状态，从而在重启时跳过这些 Region，避免因为这些 Region 的副本的 Raft 状态机损坏而无法启动服务。这些 Region 应该在其他 TiKV 上有足够多的健康的副本以便能够继续通过 Raft 机制进行读写。

一般情况下，可以先在 PD 上将 Region 的副本通过 `remove-peer` 命令删除掉：


```shell
pd-ctl>> operator add remove-peer <region_id> <store_id>
```

然后再用 tikv-ctl 在那个 TiKV 实例上将 Region 的副本标记为 tombstone 以便跳过启动时对他的健康检查：

```shell
tikv-ctl --data-dir /path/to/tikv tombstone -p 127.0.0.1:2379 -r <region_id>
```

```
success!
```

但是有些情况下，当不能方便地从 PD 上移除这个副本时，可以指定 tikv-ctl 的 `--force` 选项来强制设置它为 tombstone：

```shell
tikv-ctl --data-dir /path/to/tikv tombstone -p 127.0.0.1:2379 -r <region_id>,<region_id> --force
```

```
success!
```

> **注意：**
>
> - **该命令只支持本地模式**
> - `-p` 选项的参数指定 PD 的 endpoints，无需 `http` 前缀。指定 PD 的 endpoints 是为了询问 PD 是否可以安全切换至 Tombstone 状态。

### 向 TiKV 发出 consistency-check 请求

`consistency-check` 命令用于在某个 Region 对应的 Raft 副本之间进行一致性检查。如果检查失败，TiKV 自身会 panic。如果 `--host` 指定的 TiKV 不是这个 Region 的 Leader，则会报告错误。

```shell
tikv-ctl --host 127.0.0.1:20160 consistency-check -r 2
```

```
success!
```

```shell
tikv-ctl --host 127.0.0.1:20161 consistency-check -r 2
```

```
DebugClient::check_region_consistency: RpcFailure(RpcStatus { status: Unknown, details: Some("StringError(\"Leader is on store 1\")") })
```

> **注意：**
>
> - 目前 consistency-check 与 TiDB GC 操作不兼容，存在误报错误的可能，因此不建议使用该命令。
> - **该命令只支持远程模式**。
> - 即使该命令返回了成功信息，也需要检查是否有 TiKV panic 了。因为该命令只是向 Leader 请求进行一致性检查，但整个检查流程是否成功并不能在客户端知道。

### Dump snapshot 元文件

这条子命令可以用于解析指定路径下的 Snapshot 元文件并打印结果。

### 打印 Raft 状态机出错的 Region

前面 `tombstone` 命令可以将 Raft 状态机出错的 Region 设置为 Tombstone 状态，避免 TiKV 启动时对它们进行检查。在运行 `tombstone` 命令之前，可使用 `bad-regions` 命令找到出错的 Region，以便将多个工具组合起来进行自动化的处理。

```shell
tikv-ctl --data-dir /path/to/tikv bad-regions
```

```
all regions are healthy
```

命令执行成功后会打印以上信息，否则会打印出有错误的 Region 列表。目前可以检出的错误包括 `last index`、`commit index` 和 `apply index` 之间的不匹配，以及 Raft log 的丢失。其他一些情况，比如 Snapshot 文件损坏等仍然需要后续的支持。

### 查看 Region 属性

- 本地查看部署在 `/path/to/tikv` 的 TiKV 上面 Region 2 的 properties 信息：

    ```shell
    tikv-ctl --data-dir /path/to/tikv/data region-properties -r 2
    ```

- 在线查看运行在 `127.0.0.1:20160` 的 TiKV 上面 Region 2 的 properties 信息：

    ```shell
    tikv-ctl --host 127.0.0.1:20160 region-properties -r 2
    ```

### 动态修改 TiKV 的配置

使用 `modify-tikv-config` 命令可以动态修改配置参数。目前可动态修改的 TiKV 配置与具体的修改行为与 SQL 动态修改配置功能相同，可参考[在线修改 TiKV 配置](/dynamic-config.md#在线修改-tikv-配置)。

- `-n` 用于指定完整的配置名。支持动态修改的配置名可以参考[在线修改 TiKV 配置](/dynamic-config.md#在线修改-tikv-配置)中支持的配置项列表。
- `-v` 用于指定配置值。

设置 `shared block cache` 的大小：

```shell
tikv-ctl --host ip:port modify-tikv-config -n storage.block-cache.capacity -v 10GB
```

```
success
```

当禁用 `shared block cache` 时，为 `write` CF 设置 `block cache size`：

```shell
tikv-ctl --host ip:port modify-tikv-config -n rocksdb.writecf.block-cache-size -v 256MB
```

```
success
```

```shell
tikv-ctl --host ip:port modify-tikv-config -n raftdb.defaultcf.disable-auto-compactions -v true
```

```
success
```

如果 compaction 的流量控制导致待 compact 数据量 (compaction pending bytes) 堆积，可以禁用 `rate-limiter-auto-tuned` 配置项或调高 compaction 相关的流量阈值。示例如下：

```shell
tikv-ctl --host ip:port modify-tikv-config -n rocksdb.rate-limiter-auto-tuned -v false
```

```
success
```

```shell
tikv-ctl --host ip:port modify-tikv-config -n rocksdb.rate-bytes-per-sec -v "1GB"
```

```
success
```

### 强制 Region 从多副本失败状态恢复服务（弃用）

> **警告：**
>
> 不推荐使用该功能，恢复需求可通过 `pd-ctl` 的 Online Unsafe Recovery 功能实现。它提供了一键式自动恢复的能力，无需停止服务等额外操作，具体使用方式请参考 [Online Unsafe Recovery 使用文档](/online-unsafe-recovery.md)。

`unsafe-recover remove-fail-stores` 命令可以将故障机器从指定 Region 的 peer 列表中移除。运行命令之前，需要目标 TiKV 先停掉服务以便释放文件锁。

`-s` 选项接受多个以逗号分隔的 `store_id`，并使用 `-r` 参数来指定包含的 Region。如果要对某一个 store 上的全部 Region 都执行这个操作，可简单指定 `--all-regions`。

> **警告：**
>
> - 此功能使用不当可能导致集群难以恢复，存在风险。请悉知潜在的风险，尽量避免在生产环境中使用。
> - 如果使用 `--all-regions`，必须在剩余所有连入集群的 store 上执行此命令。需要保证这些健康的 store 都停掉服务后再进行恢复，否则期间 Region 副本之间的 peer 列表不一致会导致执行 `split-region` 或者 `remove-peer` 时报错进而引起其他元数据的不一致，最终引发 Region 不可用。
> - 一旦执行了 `remove-fail-stores`，不可再重新启动被移除的节点并将其加入集群，否则会导致元数据的不一致，最终引发 Region 不可用。

```shell
tikv-ctl --data-dir /path/to/tikv unsafe-recover remove-fail-stores -s 3 -r 1001,1002
```

```
success!
```

```shell
tikv-ctl --data-dir /path/to/tikv unsafe-recover remove-fail-stores -s 4,5 --all-regions
```

之后启动 TiKV，这些 Region 便可以使用剩下的健康副本继续提供服务了。此命令常用于多个 TiKV store 损坏或被删除的情况。

> **注意：**
>
> - 一般来说，您需要为指定 Region 的 peers 所在的每个 store 运行此命令。
> - 该命令只支持本地模式。在运行成功后，会打印 `success!`。

### 恢复损坏的 MVCC 数据

`recover-mvcc` 命令用于 MVCC 数据损坏导致 TiKV 无法正常运行的情况。为了从不同种类的不一致情况中恢复，该命令会交叉检查 3 个 CF ("default", "write", "lock")。

- `-r` 选项可以通过 `region_id` 指定包含的 Region。
- `-p` 选项可以指定 PD 的 endpoints。

```shell
tikv-ctl --data-dir /path/to/tikv recover-mvcc -r 1001,1002 -p 127.0.0.1:2379
```

```
success!
```

> **注意：**
>
> - 该命令只支持本地模式。在运行成功后，会打印 `success!`。
> - `-p` 选项指定 PD 的 endpoint，不使用 `http` 前缀，用于查询指定的 `region_id` 是否有效。
> - 对于指定 Region 的 peers 所在的每个 store，均须执行该命令。

### Ldb 命令

`ldb` 命令行工具提供多种数据访问以及数据库管理命令。下方列出了一些示例用法。详细信息请在运行 `tikv-ctl ldb` 命令时查看帮助消息或查阅 RocksDB 文档。

数据访问序列的示例如下：

用 HEX 格式 dump 现有 RocksDB 数据：

```shell
tikv-ctl ldb --hex --db=/tmp/db dump
```

Dump 现有 RocksDB 的声明：

```shell
tikv-ctl ldb --hex manifest_dump --path=/tmp/db/MANIFEST-000001
```

您可以通过 `--column_family=<string>` 指定查询的目标列族。

通过 `--try_load_options` 命令加载数据库选项文件以打开数据库。在数据库运行时，建议您保持该命令为开启的状态。如果您使用默认配置打开数据库，LSM-tree 存储组织可能会出现混乱，且无法自动恢复。

### 打印加密元数据

`encryption-meta` 命令用于打印加密元数据。该子命令可以打印两种加密元数据：数据文件的加密信息，以及所有的数据加密密钥。

使用 `encryption-meta dump-file` 子命令打印数据文件的加密信息。你需要创建一个 TiKV 配置文件用以指定 TiKV 的数据目录：

```
# conf.toml
[storage]
data-dir = "/path/to/tikv/data"
```

`--path` 选项可以指定数据文件的绝对或者相对路径。如果指定的文件是明文存储的，本命令有可能没有输出。如果不指定 `--path` 选项，本命令打印所有数据文件的加密信息。

```shell
tikv-ctl --config=./conf.toml encryption-meta dump-file --path=/path/to/tikv/data/db/CURRENT
/path/to/tikv/data/db/CURRENT: key_id: 9291156302549018620 iv: E3C2FDBF63FC03BFC28F265D7E78283F method: Aes128Ctr
```

使用 `encryption-meta dump-key` 打印数据加密密钥。使用本命令的时候，除了在 TiKV 配置文件中指定 TiKV 的数据目录以外，还需要指定当前的主加密密钥。请参阅[静态加密](/encryption-at-rest.md)文档关于配置 TiKV 主加密密钥的说明。使用本命令时 `security.encryption.previous-master-key` 配置项不生效，即使配置文件中使用了该配置，本命令也不会触发更换主加密密钥。

```
# conf.toml
[storage]
data-dir = "/path/to/tikv/data"

[security.encryption.master-key]
type = "kms"
key-id = "0987dcba-09fe-87dc-65ba-ab0987654321"
region = "us-west-2"
```

注意如果使用了 AWS KMS 作为主加密密钥，使用本命令时 `tikv-ctl` 需要该 KMS 密钥的访问权限。KMS 访问权限可以通过环境变量、AWS 默认配置文件或 IAM 的方式传递给 `tikv-ctl`。详情请参阅相关 AWS 文档。

`--ids` 选项可以指定以逗号分隔的数据加密密钥 id 列表。如果不指定 `--ids` 选项，本命令打印所有的数据加密密钥，以及最新的数据加密密钥的 id。

本命令会输出一个警告，提示本命令会泄漏敏感数据。根据提示输入 "I consent" 即可。

```shell
tikv-ctl --config=./conf.toml encryption-meta dump-key
This action will expose encryption key(s) as plaintext. Do not output the result in file on disk.
Type "I consent" to continue, anything else to exit: I consent
current key id: 9291156302549018620
9291156302549018620: key: 8B6B6B8F83D36BE2467ED55D72AE808B method: Aes128Ctr creation_time: 1592938357
```

```shell
tikv-ctl --config=./conf.toml encryption-meta dump-key --ids=9291156302549018620
This action will expose encryption key(s) as plaintext. Do not output the result in file on disk.
Type "I consent" to continue, anything else to exit: I consent
9291156302549018620: key: 8B6B6B8F83D36BE2467ED55D72AE808B method: Aes128Ctr creation_time: 1592938357
```

> **注意：**
>
> 本命令会以明文方式打印数据加密密钥。在生产环境中，请勿将本命令的输出重定向到磁盘文件中。即使使用以后删除该文件也不能保证文件内容从磁盘中干净清除。

### 打印损坏的 SST 文件信息

TiKV 中损坏的 SST 文件会导致 TiKV 进程崩溃。在 TiDB v6.1.0 之前，损坏的 SST 文件会导致 TiKV 进程立即崩溃。从 TiDB v6.1.0 起，TiKV 进程会在 SST 文件损坏 1 小时后崩溃。

为了方便清理掉这些 SST 文件，你可以先使用 `bad-ssts` 命令打印出损坏的 SST 文件信息。

> **注意：**
>
> 执行此命令前，请保证关闭当前运行的 TiKV 实例。

```shell
tikv-ctl --data-dir </path/to/tikv> bad-ssts --pd <endpoint>
```

```shell
--------------------------------------------------------
corruption info:
data/tikv-21107/db/000014.sst: Corruption: Bad table magic number: expected 9863518390377041911, found 759105309091689679 in data/tikv-21107/db/000014.sst
sst meta:
14:552997[1 .. 5520]['0101' seq:1, type:1 .. '7A7480000000000000FF0F5F728000000000FF0002160000000000FAFA13AB33020BFFFA' seq:2032, type:1] at level 0 for Column family "default"  (ID 0)
it isn't easy to handle local data, start key:0101
overlap region:
RegionInfo { region: id: 4 end_key: 7480000000000000FF0500000000000000F8 region_epoch { conf_ver: 1 version: 2 } peers { id: 5 store_id: 1 }, leader: Some(id: 5 store_id: 1) }
refer operations:
tikv-ctl ldb --db=/path/to/tikv/db unsafe_remove_sst_file 000014
tikv-ctl --data-dir=/path/to/tikv tombstone -r 4 --pd <endpoint>
--------------------------------------------------------
corruption analysis has completed
```

通过上面的输出，你可以看到损坏的 SST 文件和损坏原因等信息先被打印出，然后是相关的元信息。

+ 在 `sst meta` 输出部分，`14` 表示 SST 文件号，`552997` 表示文件大小，紧随其后的是最小和最大的序列号 (seq) 等其它元信息。
+ `overlap region` 部分为损坏 SST 文件所在 Region 的信息。该信息是从 PD 组件获取的。
+ `suggested operations` 部分为你清理损坏的 SST 文件提供建议操作。你可以参考这些建议的命令，清理文件，并重新启动该 TiKV 实例。

### 获取一个 Region 的 `RegionReadProgress` 状态

从 v6.5.4 和 v7.3.0 开始，TiKV 引入 `get-region-read-progress` 子命令，用于获取 resolver 和 `RegionReadProgress` 的最新状态。你需要指定一个 Region ID 和一个 TiKV，这可以从 Grafana（`Min Resolved TS Region` 和 `Min Safe TS Region`）或 `DataIsNotReady` 日志中获得。

- `--log`（可选）：如果指定，TiKV 会在 `INFO` 日志级别下记录该 TiKV 中 Region 的 resolver 中最小的锁 `start_ts`。该选项有助于提前识别可能阻塞 resolved-ts 的锁。

- `--min-start-ts`（可选）：如果指定，TiKV 会在日志中过滤掉 `start_ts` 小于该值的锁。你可以使用该选项指定一个感兴趣的事务，以便在日志中记录。默认值为 `0`，表示不过滤。

下面是一个使用示例：

```
./tikv-ctl --host 127.0.0.1:20160 get-region-read-progress -r 14 --log --min-start-ts 0
```

输出结果如下：

```
Region read progress:
    exist: true,
    safe_ts: 0,
    applied_index: 92,
    pending front item (oldest) ts: 0,
    pending front item (oldest) applied index: 0,
    pending back item (latest) ts: 0,
    pending back item (latest) applied index: 0,
    paused: false,
Resolver:
    exist: true,
    resolved_ts: 0,
    tracked index: 92,
    number of locks: 0,
    number of transactions: 0,
    stopped: false,
```

该子命令有助于诊断与 Stale Read 和 safe-ts 相关的问题。详情请参阅[理解 TiKV 中的 Stale Read 和 safe-ts](/troubleshoot-stale-read.md)。
