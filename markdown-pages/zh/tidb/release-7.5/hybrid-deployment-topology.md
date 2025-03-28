---
title: 混合部署拓扑
summary: 介绍混合部署 TiDB 集群的拓扑结构。
---

# 混合部署拓扑

本文介绍 TiDB 集群的 TiKV 和 TiDB 混合部署拓扑以及主要参数。常见的场景为，部署机为多路 CPU 处理器，内存也充足，为提高物理机资源利用率，可单机多实例部署，即 TiDB、TiKV 通过 numa 绑核，隔离 CPU 资源。PD 和 Prometheus 混合部署，但两者的数据目录需要使用独立的文件系统。

## 拓扑信息

| 实例 | 个数 | 物理机配置 | IP | 配置 |
| :-- | :-- | :-- | :-- | :-- |
| TiDB | 6 | 32 VCore 64GB | 10.0.1.1<br/> 10.0.1.2<br/> 10.0.1.3 | 配置 numa 绑核操作 |
| PD | 3 | 16 VCore 32 GB | 10.0.1.4<br/> 10.0.1.5<br/> 10.0.1.6 | 配置 location_labels 参数 |
| TiKV | 6 | 32 VCore 64GB | 10.0.1.7<br/> 10.0.1.8<br/> 10.0.1.9 | 1. 区分实例级别的 port、status_port；<br/> 2. 配置全局参数 readpool、storage 以及 raftstore；<br/> 3. 配置实例级别 host 维度的 labels；<br/> 4. 配置 numa 绑核操作|
| Monitoring & Grafana | 1 | 4 VCore 8GB * 1 500GB (ssd)  | 10.0.1.10 | 默认配置 |

> **注意：**
>
> 该表中拓扑实例的 IP 为示例 IP。在实际部署时，请替换为实际的 IP。

### 拓扑模版

<details>
<summary>简单混部配置模板</summary>

```yaml
# # Global variables are applied to all deployments and used as the default value of
# # the deployments if a specific deployment value is missing.
global:
  user: "tidb"
  ssh_port: 22
  deploy_dir: "/tidb-deploy"
  data_dir: "/tidb-data"

server_configs:
  tikv:
    readpool.unified.max-thread-count: <The value refers to the calculation formula result of the multi-instance topology document.>
    readpool.storage.use-unified-pool: false
    readpool.coprocessor.use-unified-pool: true
    storage.block-cache.capacity: "<The value refers to the calculation formula result of the multi-instance topology document.>"
    raftstore.capacity: "<The value refers to the calculation formula result of the multi-instance topology document.>"
  pd:
    replication.location-labels: ["host"]

pd_servers:
  - host: 10.0.1.4
  - host: 10.0.1.5
  - host: 10.0.1.6

tidb_servers:
  - host: 10.0.1.1
    port: 4000
    status_port: 10080
    numa_node: "0"
  - host: 10.0.1.1
    port: 4001
    status_port: 10081
    numa_node: "1"
  - host: 10.0.1.2
    port: 4000
    status_port: 10080
    numa_node: "0"
  - host: 10.0.1.2
    port: 4001
    status_port: 10081
    numa_node: "1"
  - host: 10.0.1.3
    port: 4000
    status_port: 10080
    numa_node: "0"
  - host: 10.0.1.3
    port: 4001
    status_port: 10081
    numa_node: "1"

tikv_servers:
  - host: 10.0.1.7
    port: 20160
    status_port: 20180
    numa_node: "0"
    config:
      server.labels: { host: "tikv1" }
  - host: 10.0.1.7
    port: 20161
    status_port: 20181
    numa_node: "1"
    config:
      server.labels: { host: "tikv1" }
  - host: 10.0.1.8
    port: 20160
    status_port: 20180
    numa_node: "0"
    config:
      server.labels: { host: "tikv2" }
  - host: 10.0.1.8
    port: 20161
    status_port: 20181
    numa_node: "1"
    config:
      server.labels: { host: "tikv2" }
  - host: 10.0.1.9
    port: 20160
    status_port: 20180
    numa_node: "0"
    config:
      server.labels: { host: "tikv3" }
  - host: 10.0.1.9
    port: 20161
    status_port: 20181
    numa_node: "1"
    config:
      server.labels: { host: "tikv3" }

monitoring_servers:
  - host: 10.0.1.10

grafana_servers:
  - host: 10.0.1.10

alertmanager_servers:
  - host: 10.0.1.10
```

</details>

<details>
<summary>详细混部配置模板</summary>

```yaml
# # Global variables are applied to all deployments and used as the default value of
# # the deployments if a specific deployment value is missing.
global:
  user: "tidb"
  ssh_port: 22
  deploy_dir: "/tidb-deploy"
  data_dir: "/tidb-data"

monitored:
  node_exporter_port: 9100
  blackbox_exporter_port: 9115
  deploy_dir: "/tidb-deploy/monitored-9100"
  data_dir: "/tidb-data/monitored-9100"
  log_dir: "/tidb-deploy/monitored-9100/log"

server_configs:
  tidb:
    log.slow-threshold: 300
  tikv:
    readpool.unified.max-thread-count: <The value refers to the calculation formula result of the multi-instance topology document.>
    readpool.storage.use-unified-pool: false
    readpool.coprocessor.use-unified-pool: true
    storage.block-cache.capacity: "<The value refers to the calculation formula result of the multi-instance topology document.>"
    raftstore.capacity: "<The value refers to the calculation formula result of the multi-instance topology document.>"
  pd:
    replication.location-labels: ["host"]
    schedule.leader-schedule-limit: 4
    schedule.region-schedule-limit: 2048
    schedule.replica-schedule-limit: 64

pd_servers:
  - host: 10.0.1.4
  - host: 10.0.1.5
  - host: 10.0.1.6

tidb_servers:
  - host: 10.0.1.1
    port: 4000
    status_port: 10080
    deploy_dir: "/tidb-deploy/tidb-4000"
    log_dir: "/tidb-deploy/tidb-4000/log"
    numa_node: "0"
  - host: 10.0.1.1
    port: 4001
    status_port: 10081
    deploy_dir: "/tidb-deploy/tidb-4001"
    log_dir: "/tidb-deploy/tidb-4001/log"
    numa_node: "1"
  - host: 10.0.1.2
    port: 4000
    status_port: 10080
    deploy_dir: "/tidb-deploy/tidb-4000"
    log_dir: "/tidb-deploy/tidb-4000/log"
    numa_node: "0"
  - host: 10.0.1.2
    port: 4001
    status_port: 10081
    deploy_dir: "/tidb-deploy/tidb-4001"
    log_dir: "/tidb-deploy/tidb-4001/log"
    numa_node: "1"
  - host: 10.0.1.3
    port: 4000
    status_port: 10080
    deploy_dir: "/tidb-deploy/tidb-4000"
    log_dir: "/tidb-deploy/tidb-4000/log"
    numa_node: "0"
  - host: 10.0.1.3
    port: 4001
    status_port: 10081
    deploy_dir: "/tidb-deploy/tidb-4001"
    log_dir: "/tidb-deploy/tidb-4001/log"
    numa_node: "1"

tikv_servers:
  - host: 10.0.1.7
    port: 20160
    status_port: 20180
    deploy_dir: "/tidb-deploy/tikv-20160"
    data_dir: "/tidb-data/tikv-20160"
    log_dir: "/tidb-deploy/tikv-20160/log"
    numa_node: "0"
    config:
      server.labels: { host: "tikv1" }
  - host: 10.0.1.7
    port: 20161
    status_port: 20181
    deploy_dir: "/tidb-deploy/tikv-20161"
    data_dir: "/tidb-data/tikv-20161"
    log_dir: "/tidb-deploy/tikv-20161/log"
    numa_node: "1"
    config:
      server.labels: { host: "tikv1" }
  - host: 10.0.1.8
    port: 20160
    status_port: 20180
    deploy_dir: "/tidb-deploy/tikv-20160"
    data_dir: "/tidb-data/tikv-20160"
    log_dir: "/tidb-deploy/tikv-20160/log"
    numa_node: "0"
    config:
      server.labels: { host: "tikv2" }
  - host: 10.0.1.8
    port: 20161
    status_port: 20181
    deploy_dir: "/tidb-deploy/tikv-20161"
    data_dir: "/tidb-data/tikv-20161"
    log_dir: "/tidb-deploy/tikv-20161/log"
    numa_node: "1"
    config:
      server.labels: { host: "tikv2" }
  - host: 10.0.1.9
    port: 20160
    status_port: 20180
    deploy_dir: "/tidb-deploy/tikv-20160"
    data_dir: "/tidb-data/tikv-20160"
    log_dir: "/tidb-deploy/tikv-20160/log"
    numa_node: "0"
    config:
      server.labels: { host: "tikv3" }
  - host: 10.0.1.9
    port: 20161
    status_port: 20181
    deploy_dir: "/tidb-deploy/tikv-20161"
    data_dir: "/tidb-data/tikv-20161"
    log_dir: "/tidb-deploy/tikv-20161/log"
    numa_node: "1"
    config:
      server.labels: { host: "tikv3" }

monitoring_servers:
  - host: 10.0.1.10
    # ssh_port: 22
    # port: 9090
    # deploy_dir: "/tidb-deploy/prometheus-8249"
    # data_dir: "/tidb-data/prometheus-8249"
    # log_dir: "/tidb-deploy/prometheus-8249/log"

grafana_servers:
  - host: 10.0.1.10
    # port: 3000
    # deploy_dir: /tidb-deploy/grafana-3000

alertmanager_servers:
  - host: 10.0.1.10
    # ssh_port: 22
    # web_port: 9093
    # cluster_port: 9094
    # deploy_dir: "/tidb-deploy/alertmanager-9093"
    # data_dir: "/tidb-data/alertmanager-9093"
    # log_dir: "/tidb-deploy/alertmanager-9093/log"
```

</details>

以上 TiDB 集群拓扑文件中，详细的配置项说明见[通过 TiUP 部署 TiDB 集群的拓扑文件配置](/tiup/tiup-cluster-topology-reference.md)。

### 混合部署的关键参数介绍

本节介绍单机多实例的关键参数，主要用于 TiDB、TiKV 的单机多实例部署场景。你需要按照提供的计算公式，将结果填写至上一步的配置模板中。

- TiKV 进行配置优化

    - readpool 线程池自适应，配置 `readpool.unified.max-thread-count` 参数可以使 `readpool.storage` 和 `readpool.coprocessor` 共用统一线程池，同时要分别设置自适应开关。

        - 开启 `readpool.storage` 和 `readpool.coprocessor`：

            ```yaml
            readpool.storage.use-unified-pool: true
            readpool.coprocessor.use-unified-pool: true
            ```

        - 计算公式如下：

            ```
            readpool.unified.max-thread-count = cores * 0.8 / TiKV 数量
            ```

    - storage CF (all RocksDB column families) 内存自适应，配置 `storage.block-cache.capacity` 参数即可实现 CF 之间自动平衡内存使用。

        - 计算公式如下：

            ```
            storage.block-cache.capacity = (MEM_TOTAL * 0.5 / TiKV 实例数量)
            ```

    - 如果多个 TiKV 实例部署在同一块物理磁盘上，需要在 tikv 配置中添加 capacity 参数：

        ```
        raftstore.capacity = 磁盘总容量 / TiKV 实例数量
        ```

- label 调度配置

    由于采用单机多实例部署 TiKV，为了避免物理机宕机导致 Region Group 默认 3 副本的 2 副本丢失，导致集群不可用的问题，可以通过 label 来实现 PD 智能调度，保证同台机器的多 TiKV 实例不会出现 Region Group 只有 2 副本的情况。

    - TiKV 配置

        相同物理机配置相同的 host 级别 label 信息：

        ```yml
        config:
          server.labels:
            host: tikv1
        ```

    - PD 配置

        PD 需要配置 labels 类型来识别并调度 Region：

        ```yml
        pd:
          replication.location-labels: ["host"]
        ```

- `numa_node` 绑核

    - 在实例参数模块配置对应的 `numa_node` 参数，并添加对应的物理 CPU 的核数；

    - numa 绑核使用前，确认已经安装 numactl 工具，以及物理机对应的物理机 CPU 的信息后，再进行参数配置；

    - `numa_node` 这个配置参数与 `numactl --membind` 配置对应。

> **注意：**
>
> - 编辑配置文件模版时，注意修改必要参数、IP、端口及目录。
> - 各个组件的 deploy_dir，默认会使用 global 中的 `<deploy_dir>/<components_name>-<port>`。例如 tidb 端口指定 4001，则 deploy_dir 默认为 '/tidb-deploy/tidb-4001'。因此，在多实例场景下指定非默认端口时，无需再次指定目录。
> - 无需手动创建配置文件中的 `tidb` 用户，TiUP cluster 组件会在部署主机上自动创建该用户。可以自定义用户，也可以和中控机的用户保持一致。
> - 如果部署目录配置为相对路径，会部署在用户的 Home 目录下。
