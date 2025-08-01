---
title: 本地快速部署 TiDB 集群
summary: TiDB 集群是分布式系统，由多个组件构成。想要快速体验 TiDB，可以使用 TiUP 中的 playground 组件快速搭建本地测试环境。通过命令行参数可以设置各组件的数量和配置，也可以启动多个组件实例。使用 `tiup client` 可以快速连接到本地启动的 TiDB 集群。还可以查看已启动集群的信息，扩容或缩容集群。
---

# 本地快速部署 TiDB 集群

TiDB 集群是由多个组件构成的分布式系统，一个典型的 TiDB 集群至少由 3 个 PD 节点、3 个 TiKV 节点和 2 个 TiDB 节点构成。对于想要快速体验 TiDB 的用户来说，手工部署这么多组件是非常耗时且麻烦的事情。本文介绍 TiUP 中的 playground 组件，以及如何通过 playground 组件快速搭建一套本地的 TiDB 测试环境。

## playground 组件介绍

playground 组件的基本用法：

```bash
tiup playground ${version} [flags]
```

如果直接执行 `tiup playground` 命令，则 TiUP playground 会使用本地安装的 TiDB/TiKV/PD 组件或者安装这些组件的稳定版本，来启动一个由 1 个 TiKV、1 个 TiDB、1 个 PD 和 1 个 TiFlash 实例构成的集群。该命令实际做了以下事情：

- 因为该命令没有指定 playground 的版本，TiUP 会先查找已安装的 playground 的最新版本，假设已安装的 playground 最新版为 v1.12.3，则该命令相当于 tiup playground:v1.12.3
- 如果 playground 从未安装过任何版本的 TiDB/TiKV/PD 组件，TiUP 会先安装这些组件的最新稳定版，然后再启动运行这些组件的实例
- 因为该命令没有指定 TiDB/PD/TiKV 各组件的版本，默认情况下，它会使用各组件的最新发布版本，假设当前为 v8.5.2，则该命令相当于 tiup playground:1.12.3 v8.5.2
- 因为该命令也没有指定各组件的个数，默认情况下，它会启动由 1 个 TiDB、1 个 TiKV、1 个 PD 和 1 个 TiFlash 实例构成的最小化集群
- 在依次启动完各个 TiDB 组件后，playground 会提醒集群启动成功，并告诉你一些有用的信息，譬如如何通过 MySQL 客户端连接集群、如何访问 [TiDB Dashboard](/dashboard/dashboard-intro.md) 等

可以使用以下命令查看 playground 的命令行参数说明：

```shell
tiup playground --help
```

## 使用示例

### 查看可用的 TiDB 版本


```shell
tiup list tidb
```

### 启动一个指定版本的 TiDB 集群


```shell
tiup playground ${version}
```

将 `${version}` 替换为所需的版本号。

### 启动一个每日构建版的 TiDB 集群


```shell
tiup playground nightly
```

nightly 就是这个集群的版本号，这里指定为每日构建版本。

### 覆盖 PD 的默认配置

首先，你需要复制 PD 的[配置模版](https://github.com/tikv/pd/blob/release-8.5/conf/config.toml)。假设你将复制的配置文件放置在 `~/config/pd.toml`，按需修改一些内容后，执行以下命令可以覆盖 PD 的默认配置：


```shell
tiup playground --pd.config ~/config/pd.toml
```

### 替换默认的二进制文件

默认启动 playground 时，各个组件都是使用官方镜像组件包中的二进制文件启动的，如果本地编译了一个临时的二进制文件想要放入集群中测试，可以使用 `--{comp}.binpath` 这个参数替换，例如执行以下命令替换 TiDB 的二进制文件：


```shell
tiup playground --db.binpath /xx/tidb-server
```

### 启动多个组件实例

默认情况下各启动一个 TiDB、TiKV 和 PD 实例，如果希望启动多个，可以加上如下参数：


```shell
tiup playground --db 3 --pd 3 --kv 3
```

### 启动集群时指定 `tag` 以保留数据

Playground 集群在命令行退出时，会默认清空所有的集群数据。如果想要启动一个数据不被自动删除的 Playground 集群，需要在启动时指定集群 tag，指定后可以在 `~/.tiup/data` 路径下找到该集群的数据。在集群启动时指定 tag 的方法如下：

```shell
tiup playground --tag ${tag_name}
```

以这种方式启动的集群，在集群关闭以后，数据文件会保留。下一次可以继续使用该 tag 启动集群，从而使用从上一次集群关闭时的数据。

## 快速连接到由 playground 启动的 TiDB 集群

TiUP 提供了 `client` 组件，用于自动寻找并连接 playground 在本地启动的 TiDB 集群，使用方式为：


```shell
tiup client
```

该命令会在控制台上提供当前机器上由 playground 启动的 TiDB 集群列表，选中需要连接的 TiDB 集群，点击回车后，可以打开一个自带的 MySQL 客户端以连接 TiDB。

## 查看已启动集群的信息


```shell
tiup playground display
```

可以看到如下信息：

```
Pid    Role     Uptime
---    ----     ------
84518  pd       35m22.929404512s
84519  tikv     35m22.927757153s
86189  tidb     exited
86526  tidb     34m28.293148663s
```

## 扩容集群

扩容集群的命令行参数与启动集群的相似。以下命令可以扩容两个 TiDB：


```shell
tiup playground scale-out --db 2
```

## 缩容集群

可在 `tiup playground scale-in` 命令中指定 `pid`，以缩容对应的实例。可以通过 `tiup playground display` 命令查看 `pid`。


```shell
tiup playground scale-in --pid 86526
```

## 部署 TiProxy

[TiProxy](/tiproxy/tiproxy-overview.md) 是 PingCAP 的官方代理组件，位于客户端和 TiDB server 之间，为 TiDB 提供负载均衡、连接保持、服务发现等功能。

从 TiUP v1.15.0 版本起，你可以通过 TiUP Playground 为集群部署 TiProxy。

1. 创建 `tidb.toml` 文件，并添加如下配置：

    ```
    graceful-wait-before-shutdown=15
    ```

    该配置项用于控制关闭服务器时 TiDB 等待的秒数，避免缩容集群时客户端断连。

2. 启动 TiDB 集群：

    ```shell
    tiup playground v8.5.2 --tiproxy 1 --db.config tidb.toml
    ```

    `tiup playground` 命令行中与 TiProxy 相关的选项说明：

    ```bash
    Flags:
          --tiproxy int                设置集群中 TiProxy 节点的数量。如果未指定，不会部署 TiProxy。
          --tiproxy.binpath string     指定 TiProxy 的二进制文件位置。
          --tiproxy.config string      指定 TiProxy 的配置文件。
          --tiproxy.host host          Playground 的 TiProxy host。如果没有提供，TiProxy 会使用 host 参数作为它的 host。
          --tiproxy.port int           Playground 的 TiProxy 端口。如果没有提供，TiProxy 会使用 6000 作为它的端口。
          --tiproxy.timeout int        TiProxy 最长等待超时时间，单位为秒。若配置为 0，则永不超时（默认为 60）。
          --tiproxy.version string     指定 TiProxy 的版本号。如果没有提供，会部署最新的 TiProxy 版本。
    ```

关于 TiProxy 的部署和使用详情，请参考[安装和使用 TiProxy](/tiproxy/tiproxy-overview.md#安装和使用)。

如需使用 TiProxy 客户端程序 `tiproxyctl`，请参考[安装 TiProxy Control](/tiproxy/tiproxy-command-line-flags.md#安装-tiproxy-control)。

## 部署 PD 微服务

从 v8.2.0 起，[PD 微服务](/pd-microservices.md)（实验特性）支持通过 TiUP 部署。你可以通过 TiUP Playground 为集群部署 `tso` 微服务和 `scheduling` 微服务。

```shell
tiup playground v8.5.2 --pd.mode ms --pd 3 --tso 2 --scheduling 2
```

- `--pd.mode`：当指定 `--pd.mode` 为 `ms` 时，代表启用 PD 微服务模式。
- `--pd <num>`：指定 PD 微服务 API 的数量，需要大于等于 `1`。
- `--tso <num>`：指定要部署的 `tso` 微服务的实例数量。
- `--scheduling <num>`：指定要部署的 `scheduling` 微服务的实例数量。
