---
title: Kubernetes 上的持久化存储类型配置
summary: 介绍 Kubernetes 上的数据持久化存储类型配置。
---

# Kubernetes 上的持久化存储类型配置

TiDB 集群中 PD、TiKV、监控等组件以及 TiDB Binlog 和备份等工具都需要使用将数据持久化的存储。Kubernetes 上的数据持久化需要使用 [PersistentVolume (PV)](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)。Kubernetes 提供多种[存储类型](https://kubernetes.io/docs/concepts/storage/volumes/)，主要分为两大类：

* 网络存储

    存储介质不在当前节点，而是通过网络方式挂载到当前节点。一般有多副本冗余提供高可用保证，在节点出现故障时，对应网络存储可以再挂载到其它节点继续使用。

* 本地存储

    存储介质在当前节点，通常能提供比网络存储更低的延迟，但没有多副本冗余，一旦节点出故障，数据就有可能丢失。如果是 IDC 服务器，节点故障可以一定程度上对数据进行恢复，但公有云上使用本地盘的虚拟机在节点故障后，数据是**无法找回**的。

PV 一般由系统管理员或 volume provisioner 自动创建，PV 与 Pod 是通过 [PersistentVolumeClaim (PVC)](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#persistentvolumeclaims) 进行关联的。普通用户在使用 PV 时并不需要直接创建 PV，而是通过 PVC 来申请使用 PV，对应的 volume provisioner 根据 PVC 创建符合要求的 PV，并将 PVC 与该 PV 进行绑定。

> **警告：**
>
> 为了数据安全，任何情况下都不要直接删除 PV，除非对 volume provisioner 原理非常清楚。手动删除 PV 可能导致非预期的行为。

## TiDB 集群推荐存储类型

TiKV 自身借助 Raft 实现了数据复制，出现节点故障后，PD 会自动进行数据调度补齐缺失的数据副本，同时 TiKV 要求存储有较低的读写延迟，所以生产环境强烈推荐使用本地 SSD 存储。

PD 同样借助 Raft 实现了数据复制，但作为存储集群元信息的数据库，并不是 IO 密集型应用，所以一般本地普通 SAS 盘或网络 SSD 存储（例如 AWS 上 gp2 类型的 EBS 存储卷，Google Cloud 上的持久化 SSD 盘）就可以满足要求。

监控组件以及 TiDB Binlog、备份等工具，由于自身没有做多副本冗余，所以为保证可用性，推荐用网络存储。其中 TiDB Binlog 的 pump 和 drainer 组件属于 IO 密集型应用，需要较低的读写延迟，所以推荐用高性能的网络存储（例如 AWS 上的 io1 类型的 EBS 存储卷，Google Cloud 上的持久化 SSD 盘）。

在利用 TiDB Operator 部署 TiDB 集群或者备份工具的时候，需要持久化存储的组件都可以通过 values.yaml 配置文件中对应的 `storageClassName` 设置存储类型。不设置时默认都使用 `local-storage`。

## 网络 PV 配置

为相应的 `StorageClass` 开启动态扩容支持。


```shell
kubectl patch storageclass ${storage_class} -p '{"allowVolumeExpansion": true}'
```

开启动态扩容后，通过下面方式对 PV 进行扩容：

1. 修改 PVC 大小

    假设之前 PVC 大小是 10 Gi，现在需要扩容到 100 Gi

    
    ```shell
    kubectl patch pvc -n ${namespace} ${pvc_name} -p '{"spec": {"resources": {"requests": {"storage": "100Gi"}}}}'
    ```

2. 查看 PV 扩容成功

    扩容成功后，通过 `kubectl get pvc -n ${namespace} ${pvc_name}` 显示的大小仍然是初始大小，但查看 PV 大小会显示已经扩容到预期的大小。

    
    ```shell
    kubectl get pv | grep ${pvc_name}
    ```

## 本地 PV 配置

Kubernetes 当前支持静态分配的本地存储。可使用 [local-static-provisioner](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner) 项目中的 `local-volume-provisioner` 程序创建本地存储对象。

### 第 1 步：准备本地存储

- 给 TiKV 数据使用的盘，可通过[普通挂载](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner/blob/master/docs/operations.md#use-a-whole-disk-as-a-filesystem-pv)方式将盘挂载到 `/mnt/ssd` 目录。

    出于性能考虑，推荐 TiKV 独占一个磁盘，并且推荐磁盘类型为 SSD。

- 给 PD 数据使用的盘，可以参考[步骤](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner/blob/master/docs/operations.md#sharing-a-disk-filesystem-by-multiple-filesystem-pvs)挂载盘，创建目录，并将新建的目录以 bind mount 方式挂载到 `/mnt/sharedssd` 目录下。

    > **注意：**
    >
    > 该步骤中创建的目录个数取决于规划的 TiDB 集群数量及每个集群内的 PD 数量。1 个目录会对应创建 1 个 PV。每个 PD 会使用一个 PV。

- 给监控数据使用的盘，可以参考[步骤](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner/blob/master/docs/operations.md#sharing-a-disk-filesystem-by-multiple-filesystem-pvs)挂载盘，创建目录，并将新建的目录以 bind mount 方式挂载到 `/mnt/monitoring` 目录下。

    > **注意：**
    >
    > 该步骤中创建的目录个数取决于规划的 TiDB 集群数量。1 个目录会对应创建 1 个 PV。每个 TiDB 集群的监控数据会使用 1 个 PV。

- 给 TiDB Binlog 和备份数据使用的盘，可以参考[步骤](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner/blob/master/docs/operations.md#sharing-a-disk-filesystem-by-multiple-filesystem-pvs)挂载盘，创建目录，并将新建的目录以 bind mount 方式挂载到 `/mnt/backup` 目录下。

    > **注意：**
    >
    > 该步骤中创建的目录个数取决于规划的 TiDB 集群数量、每个集群内的 Pump 数量及备份方式。1 个目录会对应创建 1 个 PV。每个 Pump 会使用 1 个 PV，每个 drainer 会使用 1 个 PV，所有 [Ad-hoc 全量备份](backup-to-s3.md#ad-hoc-全量备份)和所有[定时全量备份](backup-to-s3.md#定时全量备份)会共用 1 个 PV。

上述的 `/mnt/ssd`、`/mnt/sharedssd`、`/mnt/monitoring` 和 `/mnt/backup` 是 local-volume-provisioner 使用的发现目录（discovery directory），local-volume-provisioner 会为发现目录下的每一个子目录创建对应的 PV。

### 第 2 步：部署 local-volume-provisioner

#### 在线部署

1. 下载 local-volume-provisioner 部署文件。

    
    ```shell
    wget https://raw.githubusercontent.com/pingcap/tidb-operator/v1.6.3/examples/local-pv/local-volume-provisioner.yaml
    ```

2. 如果你使用的发现路径与[第 1 步：准备本地存储](#第-1-步准备本地存储)中的示例一致，可跳过这一步。如果你使用与上一步中不同路径的发现目录，需要修改 ConfigMap 和 DaemonSet 定义。

    * 修改 ConfigMap 定义中的 `data.storageClassMap` 字段：

        ```yaml
        apiVersion: v1
        kind: ConfigMap
        metadata:
          name: local-provisioner-config
          namespace: kube-system
        data:
          # ...
          storageClassMap: |
            ssd-storage: # 给 TiKV 使用
              hostDir: /mnt/ssd
              mountDir: /mnt/ssd
            shared-ssd-storage: # 给 PD 使用
              hostDir: /mnt/sharedssd
              mountDir: /mnt/sharedssd
            monitoring-storage: # 给监控数据使用
              hostDir: /mnt/monitoring
              mountDir: /mnt/monitoring
            backup-storage: # 给 TiDB Binlog 和备份数据使用
              hostDir: /mnt/backup
              mountDir: /mnt/backup
        ```

        关于 local-volume-provisioner 更多的配置项，参考文档 [Configuration](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner/blob/master/docs/provisioner.md#configuration) 。

    * 修改 DaemonSet 定义中的 `volumes` 与 `volumeMounts` 字段，以确保发现目录能够挂载到 Pod 中的对应目录：

        ```yaml
        ......
              volumeMounts:
                - mountPath: /mnt/ssd
                  name: local-ssd
                  mountPropagation: "HostToContainer"
                - mountPath: /mnt/sharedssd
                  name: local-sharedssd
                  mountPropagation: "HostToContainer"
                - mountPath: /mnt/backup
                  name: local-backup
                  mountPropagation: "HostToContainer"
                - mountPath: /mnt/monitoring
                  name: local-monitoring
                  mountPropagation: "HostToContainer"
          volumes:
            - name: local-ssd
              hostPath:
                path: /mnt/ssd
            - name: local-sharedssd
              hostPath:
                path: /mnt/sharedssd
            - name: local-backup
              hostPath:
                path: /mnt/backup
            - name: local-monitoring
              hostPath:
                path: /mnt/monitoring
        ......
        ```

3. 部署 local-volume-provisioner 程序。

    
    ```shell
    kubectl apply -f local-volume-provisioner.yaml
    ```

4. 检查 Pod 和 PV 状态。

    
    ```shell
    kubectl get po -n kube-system -l app=local-volume-provisioner && \
    kubectl get pv | grep -e ssd-storage -e shared-ssd-storage -e monitoring-storage -e backup-storage
    ```

    `local-volume-provisioner` 会为发现目录下的每一个挂载点创建一个 PV。

    > **注意：**
    >
    > 如果发现目录下无任何挂载点，则不会创建任何 PV，那么输出将为空。

更多信息，可参阅 [Kubernetes 本地存储](https://kubernetes.io/docs/concepts/storage/volumes/#local)和 [local-static-provisioner 文档](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner#overview)。

#### 离线部署

离线部署步骤与在线部署步骤相同，需要注意的是：

* 先在有外网的服务器下载 local-volume-provisioner 部署文件，上传到服务器上后再进行安装。

* local-volume-provisioner 程序是一个 DaemonSet，会在每个 Kubernetes 工作节点上启动一个 Pod，这个 Pod 使用的镜像是 `quay.io/external_storage/local-volume-provisioner:v2.5.0`，如果服务器没有外网，需要先将此 Docker 镜像在有外网的机器下载下来：

     
     ``` shell
     docker pull quay.io/external_storage/local-volume-provisioner:v2.5.0
     docker save -o local-volume-provisioner-v2.5.0.tar quay.io/external_storage/local-volume-provisioner:v2.5.0
     ```

     将 `local-volume-provisioner-v2.5.0.tar` 文件拷贝到服务器上，执行 `docker load` 命令将其 load 到服务器上：

     
     ``` shell
     docker load -i local-volume-provisioner-v2.5.0.tar
     ```

### 最佳实践

- 本地 PV 的路径是本地存储卷的唯一标示符。为了保证唯一性并避免冲突，推荐使用设备的 UUID 来生成唯一的路径。
- 如果想要 IO 隔离，建议每个存储卷使用一块物理盘，在硬件层隔离。
- 如果想要容量隔离，建议每个存储卷一个分区使用一块物理盘，或者每个存储卷使用一块物理盘。

更多信息，可参阅 local-static-provisioner 的[最佳实践文档](https://github.com/kubernetes-sigs/sig-storage-local-static-provisioner/blob/master/docs/best-practices.md)。

## 数据安全

一般情况下 PVC 在使用完删除后，与其绑定的 PV 会被 provisioner 清理回收再放入资源池中被调度使用。为避免数据意外丢失，可在全局配置 `StorageClass` 的回收策略 (reclaim policy) 为 `Retain` 或者只将某个 PV 的回收策略修改为 `Retain`。`Retain` 模式下，PV 不会自动被回收。

* 全局配置

    `StorageClass` 的回收策略一旦创建就不能再修改，所以只能在创建时进行设置。如果创建时没有设置，可以再创建相同 provisioner 的 `StorageClass`，例如 GKE 上默认的 pd 类型的 `StorageClass` 默认保留策略是 `Delete`，可以再创建一个名为 `pd-standard` 的保留策略是 `Retain` 的存储类型，并在创建 TiDB 集群时将相应组件的 `storageClassName` 修改为 `pd-standard`。

    
    ```yaml
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: pd-standard
    parameters:
      type: pd-standard
    provisioner: kubernetes.io/gce-pd
    reclaimPolicy: Retain
    volumeBindingMode: Immediate
    ```

* 配置单个 PV

    
    ```shell
    kubectl patch pv ${pv_name} -p '{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}'
    ```

> **注意：**
>
> TiDB Operator 默认会自动将 PD 和 TiKV 的 PV 保留策略修改为 `Retain` 以确保数据安全。

### 删除 PV 以及对应的数据

PV 保留策略是 `Retain` 时，如果确认某个 PV 的数据可以被删除，需要严格按照下面的操作顺序来删除 PV 以及对应的数据：

1. 删除 PV 对应的 PVC 对象：

    
    ```shell
    kubectl delete pvc ${pvc_name} --namespace=${namespace}
    ```

2. 设置 PV 的保留策略为 `Delete`，PV 会被自动删除并回收：

    
    ```shell
    kubectl patch pv ${pv_name} -p '{"spec":{"persistentVolumeReclaimPolicy":"Delete"}}'
    ```

要了解更多关于 PV 的保留策略可参考[修改 PV 保留策略](https://kubernetes.io/docs/tasks/administer-cluster/change-pv-reclaim-policy/)。
