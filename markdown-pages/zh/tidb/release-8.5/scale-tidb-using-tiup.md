---
title: 使用 TiUP 扩容缩容 TiDB 集群
summary: TiUP 可以在不中断线上服务的情况下扩容和缩容 TiDB 集群。使用 `tiup cluster list` 查看当前集群名称列表。扩容 TiDB/PD/TiKV 节点需要编写扩容拓扑配置，并执行扩容命令。扩容后，使用 `tiup cluster display <cluster-name>` 检查集群状态。缩容 TiDB/PD/TiKV 节点需要查看节点 ID 信息，执行缩容操作，然后检查集群状态。缩容 TiFlash/TiCDC 节点也需要执行相似的操作。
---

# 使用 TiUP 扩容缩容 TiDB 集群

TiDB 集群可以在不中断线上服务的情况下进行扩容和缩容。

本文介绍如何使用 TiUP 扩容缩容集群中的 TiDB、TiKV、PD、TiCDC 或者 TiFlash 节点。如未安装 TiUP，可参考[部署文档中的步骤](/production-deployment-using-tiup.md#第-2-步在中控机上部署-tiup-组件)。

你可以通过 `tiup cluster list` 查看当前的集群名称列表。

例如，集群原拓扑结构如下所示：

| 主机 IP   | 服务   |
|:----|:----|
| 10.0.1.3   | TiDB + TiFlash  |
| 10.0.1.4   | TiDB + PD   |
| 10.0.1.5   | TiKV + Monitor   |
| 10.0.1.1   | TiKV   |
| 10.0.1.2   | TiKV   |

## 扩容 TiDB/PD/TiKV 节点

如果要添加一个 TiDB 节点，IP 地址为 10.0.1.5，可以按照如下步骤进行操作。

> **注意：**
>
> 添加 PD 节点和添加 TiDB 节点的步骤类似。添加 TiKV 节点前，建议预先根据集群的负载情况调整 PD 调度参数。

### 1. 编写扩容拓扑配置

> **注意：**
>
> - 默认情况下，可以不填写端口以及目录信息。但在单机多实例场景下，则需要分配不同的端口以及目录，如果有端口或目录冲突，会在部署或扩容时提醒。
>
> - 从 TiUP v1.0.0 开始，扩容配置会继承原集群配置的 global 部分。

在 scale-out.yml 文件添加扩容拓扑配置：

```shell
vi scale-out.yml
```


```ini
tidb_servers:
  - host: 10.0.1.5
    ssh_port: 22
    port: 4000
    status_port: 10080
    deploy_dir: /tidb-deploy/tidb-4000
    log_dir: /tidb-deploy/tidb-4000/log
```

TiKV 配置文件参考：


```ini
tikv_servers:
  - host: 10.0.1.5
    ssh_port: 22
    port: 20160
    status_port: 20180
    deploy_dir: /tidb-deploy/tikv-20160
    data_dir: /tidb-data/tikv-20160
    log_dir: /tidb-deploy/tikv-20160/log
```

PD 配置文件参考：


```ini
pd_servers:
  - host: 10.0.1.5
    ssh_port: 22
    name: pd-1
    client_port: 2379
    peer_port: 2380
    deploy_dir: /tidb-deploy/pd-2379
    data_dir: /tidb-data/pd-2379
    log_dir: /tidb-deploy/pd-2379/log
```

可以使用 `tiup cluster edit-config <cluster-name>` 查看当前集群的配置信息，因为其中的 `global` 和 `server_configs` 参数配置默认会被 `scale-out.yml` 继承，因此也会在 `scale-out.yml` 中生效。

### 2. 执行扩容命令

执行 scale-out 命令前，先使用 `check` 及 `check --apply` 命令，检查和自动修复集群存在的潜在风险：

> **注意：**
>
> 针对 scale-out 命令的检查功能在 tiup cluster v1.9.3 及后续版本中支持，请操作前先升级 tiup cluster 版本。

（1）检查集群存在的潜在风险：

  
  ```shell
  tiup cluster check <cluster-name> scale-out.yml --cluster --user root [-p] [-i /home/root/.ssh/gcp_rsa]
  ```

（2）自动修复集群存在的潜在风险：

  
  ```shell
  tiup cluster check <cluster-name> scale-out.yml --cluster --apply --user root [-p] [-i /home/root/.ssh/gcp_rsa]
  ```

（3）执行 scale-out 命令扩容 TiDB 集群：

  
  ```shell
  tiup cluster scale-out <cluster-name> scale-out.yml [-p] [-i /home/root/.ssh/gcp_rsa]
  ```

以上操作示例中：

- 扩容配置文件为 `scale-out.yml`。
- `--user root` 表示通过 root 用户登录到目标主机完成集群部署，该用户需要有 ssh 到目标机器的权限，并且在目标机器有 sudo 权限。也可以用其他有 ssh 和 sudo 权限的用户完成部署。
- [-i] 及 [-p] 为可选项，如果已经配置免密登录目标机，则不需填写。否则选择其一即可，[-i] 为可登录到目标机的 root 用户（或 --user 指定的其他用户）的私钥，也可使用 [-p] 交互式输入该用户的密码。

预期日志结尾输出 ```Scaled cluster `<cluster-name>` out successfully``` 信息，表示扩容操作成功。

### 3. 刷新集群配置

> **注意：**
>
> - 刷新集群配置仅适用于扩容 PD 节点，扩容 TiDB 或 TiKV 节点时无需执行此操作。
> - 如果你使用的是 TiUP v1.15.0 或之后版本，请跳过该操作，因为 TiUP 会完成相应操作；如果你使用的是 TiUP v1.15.0 之前的版本，则需执行以下步骤。

1. 更新集群配置：

    ```shell
    tiup cluster reload <cluster-name> --skip-restart
    ```

2. 更新 Prometheus 配置并重启：

    ```shell
    tiup cluster reload <cluster-name> -R prometheus
    ```

### 4. 查看集群状态


```shell
tiup cluster display <cluster-name>
```

打开浏览器访问监控平台 <http://10.0.1.5:3000>，监控整个集群和新增节点的状态。

扩容后，集群拓扑结构如下所示：

| 主机 IP   | 服务   |
|:----|:----|
| 10.0.1.3   | TiDB + TiFlash  |
| 10.0.1.4   | TiDB + PD   |
| 10.0.1.5   | **TiDB** + TiKV + Monitor   |
| 10.0.1.1   | TiKV   |
| 10.0.1.2   | TiKV   |

## 扩容 TiFlash 节点

如果要添加一个 TiFlash 节点，其 IP 地址为 `10.0.1.4`，可以按照如下步骤进行操作。

> **注意：**
>
> 在原有 TiDB 集群上新增 TiFlash 组件需要注意：
>
> 1. 首先确认当前 TiDB 的版本支持 TiFlash，否则需要先升级 TiDB 集群至 v5.0 以上版本。
> 2. 执行 `tiup ctl:v<CLUSTER_VERSION> pd -u http://<pd_ip>:<pd_port> config set enable-placement-rules true` 命令，以开启 PD 的 Placement Rules 功能。或通过 [pd-ctl](/pd-control.md) 执行对应的命令。

### 1. 添加节点信息到 scale-out.yml 文件

编写 scale-out.yml 文件，添加该 TiFlash 节点信息（目前只支持 ip，不支持域名）：


```ini
tiflash_servers:
  - host: 10.0.1.4
```

### 2. 运行扩容命令


```shell
tiup cluster scale-out <cluster-name> scale-out.yml
```

> **注意：**
>
> 此处假设当前执行命令的用户和新增的机器打通了互信，如果不满足已打通互信的条件，需要通过 `-p` 来输入新机器的密码，或通过 `-i` 指定私钥文件。

### 3. 查看集群状态


```shell
tiup cluster display <cluster-name>
```

打开浏览器访问监控平台 <http://10.0.1.5:3000>，监控整个集群和新增节点的状态。

扩容后，集群拓扑结构如下所示：

| 主机 IP   | 服务   |
|:----|:----|
| 10.0.1.3   | TiDB + TiFlash  |
| 10.0.1.4   | TiDB + PD + **TiFlash**    |
| 10.0.1.5   | TiDB+ TiKV + Monitor   |
| 10.0.1.1   | TiKV   |
| 10.0.1.2   | TiKV   |

## 扩容 TiCDC 节点

如果要添加 TiCDC 节点，IP 地址为 10.0.1.3、10.0.1.4，可以按照如下步骤进行操作。

### 1. 添加节点信息到 scale-out.yml 文件

编写 scale-out.yml 文件：


```ini
cdc_servers:
  - host: 10.0.1.3
    gc-ttl: 86400
    data_dir: /tidb-data/cdc-8300
  - host: 10.0.1.4
    gc-ttl: 86400
    data_dir: /tidb-data/cdc-8300
```

### 2. 运行扩容命令


```shell
tiup cluster scale-out <cluster-name> scale-out.yml
```

> **注意：**
>
> 此处假设当前执行命令的用户和新增的机器打通了互信，如果不满足已打通互信的条件，需要通过 `-p` 来输入新机器的密码，或通过 `-i` 指定私钥文件。

### 3. 查看集群状态


```shell
tiup cluster display <cluster-name>
```

打开浏览器访问监控平台 <http://10.0.1.5:3000>，监控整个集群和新增节点的状态。

扩容后，集群拓扑结构如下所示：

| 主机 IP   | 服务   |
|:----|:----|
| 10.0.1.3   | TiDB + TiFlash + **TiCDC**  |
| 10.0.1.4   | TiDB + PD + TiFlash + **TiCDC**  |
| 10.0.1.5   | TiDB+ TiKV + Monitor   |
| 10.0.1.1   | TiKV   |
| 10.0.1.2   | TiKV   |

## 缩容 TiDB/PD/TiKV 节点

如果要移除 IP 地址为 10.0.1.5 的一个 TiKV 节点，可以按照如下步骤进行操作。

> **注意：**
>
> - 移除 TiDB、PD 节点和移除 TiKV 节点的步骤类似。
> - 由于 TiKV 和 TiFlash 组件是异步下线的，且下线过程耗时较长，所以 TiUP 对 TiKV 和 TiFlash 组件做了特殊处理，详情参考[下线特殊处理](/tiup/tiup-component-cluster-scale-in.md#下线特殊处理)。
> - TiKV 中的 PD Client 会缓存 PD 节点的列表。当前版本的 TiKV 有定期自动更新 PD 节点的机制，可以降低 TiKV 缓存的 PD 节点列表过旧这一问题出现的概率。但你应尽量避免在扩容新 PD 后直接一次性缩容所有扩容前就已经存在的 PD 节点。如果需要，请确保在下线所有之前存在的 PD 节点前将 PD 的 leader 切换至新扩容的 PD 节点。

### 1. 查看节点 ID 信息


```shell
tiup cluster display <cluster-name>
```

```
Starting /root/.tiup/components/cluster/v1.12.3/cluster display <cluster-name>

TiDB Cluster: <cluster-name>

TiDB Version: v8.5.2

ID       Role         Host    Ports                            Status  Data Dir        Deploy Dir

--       ----         ----      -----                            ------  --------        ----------

10.0.1.3:8300  cdc          10.0.1.3    8300                            Up      data/cdc-8300      deploy/cdc-8300

10.0.1.4:8300  cdc          10.0.1.4    8300                            Up      data/cdc-8300      deploy/cdc-8300

10.0.1.4:2379  pd           10.0.1.4    2379/2380                        Healthy data/pd-2379      deploy/pd-2379

10.0.1.1:20160 tikv         10.0.1.1    20160/20180                      Up      data/tikv-20160     deploy/tikv-20160

10.0.1.2:20160 tikv         10.0.1.2    20160/20180                      Up      data/tikv-20160     deploy/tikv-20160

10.0.1.5:20160 tikv        10.0.1.5    20160/20180                     Up      data/tikv-20160     deploy/tikv-20160

10.0.1.3:4000  tidb        10.0.1.3    4000/10080                      Up      -                 deploy/tidb-4000

10.0.1.4:4000  tidb        10.0.1.4    4000/10080                      Up      -                 deploy/tidb-4000

10.0.1.5:4000  tidb         10.0.1.5    4000/10080                       Up      -            deploy/tidb-4000

10.0.1.3:9000   tiflash      10.0.1.3    9000/8123/3930/20170/20292/8234  Up      data/tiflash-9000       deploy/tiflash-9000

10.0.1.4:9000   tiflash      10.0.1.4    9000/8123/3930/20170/20292/8234  Up      data/tiflash-9000       deploy/tiflash-9000

10.0.1.5:9090  prometheus   10.0.1.5    9090                             Up      data/prometheus-9090  deploy/prometheus-9090

10.0.1.5:3000  grafana      10.0.1.5    3000                             Up      -            deploy/grafana-3000

10.0.1.5:9093  alertmanager 10.0.1.5    9093/9094                        Up      data/alertmanager-9093 deploy/alertmanager-9093
```

### 2. 执行缩容操作


```shell
tiup cluster scale-in <cluster-name> --node 10.0.1.5:20160
```

其中 `--node` 参数为需要下线节点的 ID。

预期输出 Scaled cluster `<cluster-name>` in successfully 信息，表示缩容操作成功。

### 3. 刷新集群配置

> **注意：**
>
> - 刷新集群配置仅适用于缩容 PD 节点，缩容 TiDB 或 TiKV 节点时无需执行此操作。
> - 如果你使用的是 TiUP v1.15.0 或之后版本，请跳过该操作，因为 TiUP 会完成相应操作；如果你使用的是 TiUP v1.15.0 之前的版本，则需执行以下步骤。

1. 更新集群配置：

    ```shell
    tiup cluster reload <cluster-name> --skip-restart
    ```

2. 更新 Prometheus 配置并重启：

    ```shell
    tiup cluster reload <cluster-name> -R prometheus
    ```

### 4. 查看集群状态

下线需要一定时间，下线节点的状态变为 Tombstone 就说明下线成功。

执行如下命令检查节点是否下线成功：


```shell
tiup cluster display <cluster-name>
```

打开浏览器访问监控平台 <http://10.0.1.5:3000>，监控整个集群的状态。

调整后，拓扑结构如下：

| Host IP   | Service   |
|:----|:----|
| 10.0.1.3   | TiDB + TiFlash + TiCDC  |
| 10.0.1.4   | TiDB + PD + TiFlash + TiCDC |
| 10.0.1.5   | TiDB + Monitor**（TiKV 已删除）**   |
| 10.0.1.1   | TiKV    |
| 10.0.1.2   | TiKV    |

## 缩容 TiFlash 节点

如果要缩容 IP 地址为 10.0.1.4 的一个 TiFlash 节点，可以按照如下步骤进行操作。

### 1. 根据 TiFlash 剩余节点数调整数据表的副本数

1. 查询是否有数据表的 TiFlash 副本数大于缩容后的 TiFlash 节点数。`tobe_left_nodes` 表示缩容后的 TiFlash 节点数。如果查询结果为空，可以开始执行缩容。如果查询结果不为空，则需要修改相关表的 TiFlash 副本数。

    ```sql
    SELECT * FROM information_schema.tiflash_replica WHERE REPLICA_COUNT >  'tobe_left_nodes';
    ```

2. 对所有 TiFlash 副本数大于缩容后的 TiFlash 节点数的表执行以下语句，`new_replica_num` 必须小于等于 `tobe_left_nodes`：

    ```sql
    ALTER TABLE <db-name>.<table-name> SET tiflash replica 'new_replica_num';
    ```

    在执行该语句之后，TiDB 会相应地修改或删除 PD 的 [Placement Rules](/configure-placement-rules.md)，PD 再根据 Placement Rules 进行数据调度。

3. 重新执行步骤 1，确保没有数据表的 TiFlash 副本数大于缩容后的 TiFlash 节点数。

### 2. 执行缩容操作

接下来，请任选下列方案其一进行缩容。

#### 方案一：通过 TiUP 缩容 TiFlash 节点

1. 通过以下命令确定需要下线的节点名称：

    ```shell
    tiup cluster display <cluster-name>
    ```

2. 执行 scale-in 命令来下线节点，假设步骤 1 中获得该节点名为 `10.0.1.4:9000`

    ```shell
    tiup cluster scale-in <cluster-name> --node 10.0.1.4:9000
    ```

3. 查看下线 TiFlash 节点的状态：

    ```shell
    tiup cluster display <cluster-name>
    ```

4. 等待下线 TiFlash 节点的状态变为 `Tombstone` 后，删除 TiUP 拓扑信息中已下线节点的信息（TiUP 会自动清理 `Tombstone` 状态节点的相关数据文件）：

    ```shell
    tiup cluster prune <cluster-name>
    ```

#### 方案二：手动缩容 TiFlash 节点

在特殊情况下（比如需要强制下线节点），或者 TiUP 操作失败的情况下，可以使用以下方法手动下线 TiFlash 节点。

1. 使用 pd-ctl 的 store 命令在 PD 中查看该 TiFlash 节点对应的 store id。

    * 在 [pd-ctl](/pd-control.md)（tidb-ansible 目录下的 `resources/bin` 包含对应的二进制文件）中输入 store 命令。

    * 若使用 TiUP 部署，可以调用以下命令代替 `pd-ctl`：

        ```shell
        tiup ctl:v<CLUSTER_VERSION> pd -u http://<pd_ip>:<pd_port> store
        ```

        > **注意：**
        >
        > 如果集群中有多个 PD 实例，只需在以上命令中指定一个活跃 PD 实例的 `IP:端口`即可。

2. 在 pd-ctl 中下线该 TiFlash 节点。

    * 在 pd-ctl 中输入 `store delete <store_id>`，其中 `<store_id>` 为上一步查到的该 TiFlash 节点对应的 store id。

    * 若通过 TiUP 部署，可以调用以下命令代替 `pd-ctl`：

        ```shell
        tiup ctl:v<CLUSTER_VERSION> pd -u http://<pd_ip>:<pd_port> store delete <store_id>
        ```

        > **注意：**
        >
        > 如果集群中有多个 PD 实例，只需在以上命令中指定一个活跃 PD 实例的 `IP:端口`即可。

3. 等待该 TiFlash 节点对应的 store 消失或者 state_name 变成 Tombstone 再关闭 TiFlash 进程。

4. 删除 TiUP 拓扑信息中已下线节点的信息（TiUP 会自动清理 `Tombstone` 状态节点的相关数据文件）：

    ```shell
    tiup cluster prune <cluster-name>
    ```

### 3. 查看集群状态


```shell
tiup cluster display <cluster-name>
```

打开浏览器访问监控平台 <http://10.0.1.5:3000>，监控整个集群的状态。

调整后，拓扑结构如下：

| Host IP   | Service   |
|:----|:----|
| 10.0.1.3   | TiDB + TiFlash + TiCDC  |
| 10.0.1.4   | TiDB + PD + TiCDC **（TiFlash 已删除）**  |
| 10.0.1.5   | TiDB + Monitor  |
| 10.0.1.1   | TiKV    |
| 10.0.1.2   | TiKV    |

## 缩容 TiCDC 节点

如果要缩容 IP 地址为 10.0.1.4 的一个 TiCDC 节点，可以按照如下步骤进行操作。

### 1. 下线该 TiCDC 节点


```shell
tiup cluster scale-in <cluster-name> --node 10.0.1.4:8300
```

### 2. 查看集群状态


```shell
tiup cluster display <cluster-name>
```

打开浏览器访问监控平台 <http://10.0.1.5:3000>，监控整个集群的状态。

调整后，拓扑结构如下：

| Host IP   | Service   |
|:----|:----|
| 10.0.1.3   | TiDB + TiFlash + TiCDC  |
| 10.0.1.4   | TiDB + PD + **(TiCDC 已删除）**  |
| 10.0.1.5   | TiDB + Monitor  |
| 10.0.1.1   | TiKV    |
| 10.0.1.2   | TiKV    |
