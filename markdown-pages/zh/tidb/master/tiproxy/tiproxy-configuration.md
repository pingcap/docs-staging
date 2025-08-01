---
title: TiProxy 配置文件
summary: 了解与 TiProxy 部署和使用相关的配置参数。
---

# TiProxy 配置文件

本文档介绍了与 TiProxy 部署和使用相关的配置参数。关于 TiUP 的拓扑文件配置参数，请参阅 [tiproxy-servers 配置参数](/tiup/tiup-cluster-topology-reference.md#tiproxy_servers)。

以下是一个配置示例：

```toml
[proxy]
addr = "0.0.0.0:6000"
max-connections = 100

[api]
addr = "0.0.0.0:3080"

[ha]
virtual-ip = "10.0.1.10/24"
interface = "eth0"

[security]
[security.cluster-tls]
skip-ca = true

[security.sql-tls]
skip-ca = true
```

## 配置 `tiproxy.toml` 文件

本小节介绍了 TiProxy 的配置参数。

> **建议：**
>
> 如需调整配置项的值，参见[修改配置参数](/maintain-tidb-using-tiup.md#修改配置参数)。通常情况下，修改配置项会导致重启，但是 TiProxy 支持热加载，你可以通过 `tiup cluster reload --skip-restart` 跳过重启。

### proxy

SQL 端口的配置。

#### `addr`

+ 默认值：`0.0.0.0:6000`
+ 支持热加载：否
+ SQL 服务的监听地址。格式为 `<ip>:<port>`。使用 TiUP 或 TiDB Operator 部署 TiProxy 时，此配置项会自动设置。

#### `advertise-addr`

+ 默认值：`""`
+ 支持热加载：否
+ 指定其他组件连接 TiProxy 时使用的地址，该地址只包含主机名，不包含端口。该地址可能与 [`addr`](#addr) 中的主机名不同。例如，TiProxy 的 TLS 证书中的 `Subject Alternative Name` 只包含域名时，其他组件通过 IP 连接 TiProxy 会失败。使用 TiUP 或 TiDB Operator 部署 TiProxy 时，此配置项会自动设置。如果未设置该配置项，将使用该 TiProxy 实例的外部 IP 地址。

#### `graceful-wait-before-shutdown`

+ 默认值：`0`
+ 支持热加载：是
+ 单位：秒
+ 在 TiProxy 关闭时，在 `graceful-wait-before-shutdown` 秒内，HTTP 状态返回不健康，但 SQL 端口仍接受新连接。`graceful-wait-before-shutdown` 秒之后 SQL 端口将拒绝新连接并关闭现有连接。如果客户端和 TiProxy 之间没有其他代理（例如 NLB），建议将这个配置的值设置为 `0`。

#### `graceful-close-conn-timeout`

+ 默认值：`15`
+ 支持热加载：是
+ 单位：秒
+ 在 TiProxy 关闭前，最多等待 `graceful-close-conn-timeout` 秒，连接的当前事务完成后将关闭连接。超时之后 TiProxy 将强制关闭所有连接。`graceful-close-conn-timeout` 发生在 `graceful-wait-before-shutdown` 之后。建议将此超时时间设置为长于事务的生命周期。

#### `max-connections`

+ 默认值：`0`
+ 支持热加载：是
+ 每个 TiProxy 实例最多可以接受 `max-connections` 个连接。`0` 表示没有限制。

#### `conn-buffer-size`

+ 默认值：`32768`
+ 支持热加载：是，但只对新连接有效
+ 单位：字节
+ 取值范围：`[1024, 16777216]`
+ 每个连接的缓冲区大小，读和写分别使用一个缓冲区。它是内存空间和性能之间的平衡，较大的缓冲区可能会有更高的性能，但占用更多内存。当值为 `0` 时，TiProxy 会使用默认大小的缓冲区。

#### `pd-addrs`

+ 默认值：`127.0.0.1:2379`
+ 支持热加载：否
+ TiProxy 连接的 PD 地址。TiProxy 通过从 PD 获取 TiDB 列表来发现 TiDB 实例。如果使用 TiUP 或 TiDB Operator 部署 TiProxy，则会自动设置此项。

#### `proxy-protocol`

+ 默认值：`""`
+ 支持热加载：是，但只对新连接有效
+ 可选值：`""`, `"v2"`
+ 在 SQL 端口启用 [PROXY 协议](https://www.haproxy.org/download/1.8/doc/proxy-protocol.txt)。开启 PROXY 协议后能让 TiProxy 透传客户端真实的 IP 地址给 TiDB。`"v2"` 代表使用 PROXY 协议 v2 版本，`""` 代表不使用 PROXY 协议。在 TiProxy 启用 PROXY 协议后，需要同时在 TiDB 服务器上启用 [PROXY 协议](/tidb-configuration-file.md#proxy-protocol)。

### api

HTTP 网关的配置。

#### `addr`

+ 默认值：`0.0.0.0:3080`
+ 支持热加载：否
+ API 网关地址。格式为 `<ip>:<port>`。

#### `proxy-protocol`

+ 默认值：`""`
+ 支持热加载：否
+ 可选值：`""`, `"v2"`
+ 在端口启用 [PROXY 协议](https://www.haproxy.org/download/1.8/doc/proxy-protocol.txt)。`"v2"` 代表使用 PROXY 协议 v2 版本，`""` 代表不使用 PROXY 协议。

### balance

TiProxy 负载均衡策略的配置。

#### `label-name`

+ 默认值：`""`
+ 支持热加载：是
+ 指定用于[基于标签的负载均衡](/tiproxy/tiproxy-load-balance.md#基于标签的负载均衡)的标签名。TiProxy 根据该标签名匹配 TiDB server 的标签值，并优先将请求路由到与自身具有相同标签值的 TiDB server。
+ `label-name` 的默认值为空字符串，表示不使用基于标签的负载均衡。要启用该负载均衡策略，需要将此配置项设置为非空字符串，并配置 TiProxy 的 [`labels`](#labels) 和 TiDB 的 [`labels`](/tidb-configuration-file.md#labels) 配置项。有关详细信息，请参阅[基于标签的负载均衡](/tiproxy/tiproxy-load-balance.md#基于标签的负载均衡)。

#### `policy`

+ 默认值：`resource`
+ 支持热加载：是
+ 可选值：`resource`、`location`、`connection`
+ 指定负载均衡策略。各个可选值的含义请参阅 [TiProxy 负载均衡策略](/tiproxy/tiproxy-load-balance.md#负载均衡策略配置)。

### `enable-traffic-replay`

+ 默认值：`true`
+ 支持热加载：是
+ 可选值：`true`、`false`
+ 指定是否开启[流量回放](/tiproxy/tiproxy-traffic-replay.md)功能。如果为 `false`，则在流量捕获和流量回放时会报错。

### ha

TiProxy 的高可用配置。

#### `virtual-ip`

+ 默认值：`""`
+ 支持热加载：否
+ 指定虚拟 IP 地址，使用 CIDR 格式表示，例如 `"10.0.1.10/24"`。当集群中有多台 TiProxy 配置同一虚拟 IP 时，只有一台 TiProxy 会绑定该虚拟 IP。当该 TiProxy 下线时，另外一台 TiProxy 会自动绑定该 IP，确保客户端始终能通过虚拟 IP 连接到可用的 TiProxy。

配置示例：

```yaml
server_configs:
  tiproxy:
    ha.virtual-ip: "10.0.1.10/24"
    ha.interface: "eth0"
```

当需要隔离计算层资源时，可以配置多个虚拟 IP，并结合使用[基于标签的负载均衡](/tiproxy/tiproxy-load-balance.md#基于标签的负载均衡)。示例可参见[基于标签的负载均衡](/tiproxy/tiproxy-load-balance.md#基于标签的负载均衡)。

> **注意：**
>
> - 虚拟 IP 仅支持 Linux 操作系统。
> - 运行 TiProxy 的 Linux 用户必须具有绑定 IP 地址的权限。
> - TiProxy 实例的真实 IP 和虚拟 IP 必须处于同一个 CIDR 范围内。

#### `interface`

+ 默认值：`""`
+ 支持热加载：否
+ 指定绑定虚拟 IP 的网络接口，例如 `"eth0"`。只有同时设置 [`ha.virtual-ip`](#virtual-ip) 和 `ha.interface` 时，该 TiProxy 实例才能绑定虚拟 IP。

### `labels`

+ 默认值：`{}`
+ 支持热加载：是
+ 指定服务器标签，例如 `{ zone = "us-west-1", dc = "dc1" }`。

### log

#### `level`

+ 默认值：`info`
+ 支持热加载：是
+ 可选值：`debug`, `info`, `warn`, `error`, `panic`
+ 指定日志的级别。当指定 `panic` 级别时，TiProxy 遇到错误时会 panic。

#### `encoder`

+ 默认值：`tidb`
+ 可选值：

    + `tidb`：TiDB 使用的格式。有关详细信息，请参见 [统一日志格式](https://github.com/tikv/rfcs/blob/master/text/0018-unified-log-format.md)。
    + `json`：结构化 JSON 格式。
    + `console`：易读的日志格式。

### log.log-file

#### `filename`

+ 默认值：`""`
+ 支持热加载：是
+ 日志文件路径。非空值将启用日志记录到文件。使用 TiUP 部署时会自动设置文件路径。

#### `max-size`

+ 默认值：`300`
+ 支持热加载：是
+ 单位：MB
+ 日志文件的最大大小。超过该大小后，日志将被轮转。

#### `max-days`

+ 默认值：`3`
+ 支持热加载：是
+ 指定保留旧日志文件的最大天数。超过此期限后，将删除过时的日志文件。

#### `max-backups`

+ 默认值：`3`
+ 支持热加载：是
+ 指定要保留的日志文件的最大数量。当超过此数量时，将自动删除多余的日志文件。

### security

在 `[security]` 部分有四个名称不同的 TLS 对象，它们共享相同的配置格式和字段，但是不同名称对象的字段解释可能不同。

```toml
[security]
    [sql-tls]
    skip-ca = true
    [server-tls]
    auto-certs = true
```

所有 TLS 选项都支持热加载。

TLS 对象字段：

+ `ca`：指定 CA
+ `cert`：指定证书
+ `key`：指定私钥
+ `cert-allowed-cn`：当其他组件通过 TLS 连接 TiProxy 时，TiProxy 可通过校验调用者证书中的 `Common Name` 以防止非法访问者访问。该配置项指定了合法的调用者的 `Common Name` 列表。设置了该配置项后，该 TLS 对象必须要开启 TLS，否则该配置项不生效。关于组件间认证调用者身份的详细信息，请参见[认证组件调用者身份](/enable-tls-between-components.md#认证组件调用者身份)。
+ `auto-certs`：主要用于测试。如果没有指定证书或密钥，则会生成证书。
+ `skip-ca`：在客户端对象上跳过使用 CA 验证证书，或在服务器对象上跳过服务器端验证。
+ `min-tls-version`：设置最低 TLS 版本。可选值：`1.0`、`1.1`、`1.2` 和 `1.3`。默认为 `1.2`，代表支持 TLSv1.2 及以上版本。
+ `rsa-key-size`：启用 `auto-certs` 时设置 RSA 密钥大小。
+ `autocert-expire-duration`：设置自动生成证书的默认到期时间。

对象根据名称被分类为客户端或服务器对象。

对客户端 TLS 对象：

- 必须设置 `ca` 或 `skip-ca` 来跳过验证服务器证书。
- 可选：可以设置 `cert` 或 `key` 来通过服务器端客户端验证。
- 无用字段：`cert-allowed-cn`、`auto-certs`、`rsa-key-size`、`autocert-expire-duration`。

对服务器 TLS 对象：

- 设置 `cert`、`key` 或 `auto-certs` 后支持 TLS 连接，否则不支持 TLS 连接。
- 可选：如果 `ca` 不为空，则启用服务器端的客户端验证。客户端必须提供证书。如果 `skip-ca` 为 `true` 且 `ca` 不为空，则服务器仅在客户端提供证书时才验证客户端证书。

#### `cluster-tls`

客户端 TLS 对象。用于访问 TiDB 或 PD。

#### `encryption-key-path`

+ 默认值：`""`
+ 支持热加载：是
+ 指定流量捕获时用于加密流量文件的密钥的文件路径。回放时的 TiProxy 实例需要配置相同的密钥文件。该文件须包含一个 256 位（32 字节）的十六进制字符串，且不包含其他任何内容。密钥文件示例如下：

```
3b5896b5be691006e0f71c3040a2949
```

#### `require-backend-tls`

+ 默认值：`false`
+ 支持热加载：是，但只对新连接有效
+ 要求 TiProxy 和 TiDB 服务器之间使用 TLS 连接。如果 TiDB 服务器不支持 TLS，则客户端在连接到 TiProxy 时会报错。

#### `sql-tls`

客户端 TLS 对象。用于访问 TiDB SQL 端口（4000）。

#### `server-tls`

服务器 TLS 对象。用于在 SQL 端口（6000）上提供 TLS。

#### `server-http-tls`

服务器 TLS 对象。用于在 HTTP 状态端口（3080）上提供 TLS。
