---
title: Modify TiDB Cluster Configuration
summary: Learn how to modify the configuration of TiDB clusters deployed on Kubernetes.
---

# Modify TiDB Cluster Configuration

For a TiDB cluster, you can [update the configuration of components](https://docs.pingcap.com/tidb/stable/dynamic-config/) online using SQL statements, including TiDB, TiKV, and PD, without restarting the cluster components. However, for TiDB clusters deployed on Kubernetes, after you upgrade or restart the cluster, the configurations updated using SQL statements will be overwritten by those in the `TidbCluster` CR. This leads to the online configuration update being invalid.

This document describes how to modify the configuration of TiDB clusters deployed on Kubernetes. Due to the special nature of PD, you need to separately modify the configuration of PD and other components.

## Modify configuration for TiDB, TiKV, and other components

For TiDB and TiKV, if you [modify their configuration online](https://docs.pingcap.com/tidb/stable/dynamic-config/) using SQL statements, after you upgrade or restart the cluster, the configurations will be overwritten by those in the `TidbCluster` CR. This leads to the online configuration update being invalid. Therefore, to persist the configuration, you must directly modify their configurations in the `TidbCluster` CR.

For TiFlash, TiProxy, TiCDC, and Pump, you can only modify their configurations in the `TidbCluster` CR.

To modify the configuration in the `TidbCluster` CR, take the following steps:

1. Refer to the parameters in [Configure TiDB components](configure-a-tidb-cluster.md#configure-tidb-components) to modify the component configuration in the `TidbCluster` CR:

    
    ```shell
    kubectl edit tc ${cluster_name} -n ${namespace}
    ```

2. After the configuration is modified, view the updating progress:

    
    ```shell
    watch kubectl -n ${namespace} get pod -o wide
    ```

    After all the Pods are recreated and are in the `Running` state, the configuration is successfully modified.

## Modify PD configuration

After PD is started for the first time, some PD configuration items are persisted in etcd. The persisted configuration in etcd takes precedence over the configuration file in PD. Therefore, after the first start, you cannot modify some PD configuration by using the `TidbCluster` CR.

Among all the PD configuration items listed in [Modify PD configuration online](https://docs.pingcap.com/tidb/stable/dynamic-config/#modify-pd-configuration-online), after the first start, only `log.level` can be modified by using the `TidbCluster` CR. Other configurations cannot be modified by using CR.

For TiDB clusters deployed on Kubernetes, if you need to modify the PD configuration, you can modify the configuration online using [SQL statements](https://docs.pingcap.com/tidb/stable/dynamic-config/#modify-pd-configuration-online), [pd-ctl](https://docs.pingcap.com/tidb/stable/pd-control#config-show--set-option-value--placement-rules), or PD server API.

### Modify PD microservice configuration

> **Note:**
>
> Starting from v8.0.0, PD supports the [microservice mode](https://docs.pingcap.com/tidb/dev/pd-microservices) (experimental).

After each component of the PD microservices is started for the first time, some PD configuration items are persisted in etcd. The persisted configuration in etcd takes precedence over the configuration file in PD. Therefore, after the first start of each PD microservice component, you cannot modify some PD configuration items by using the `TidbCluster` CR.

Among all the configuration items of PD microservices listed in [Modify PD configuration dynamically](https://docs.pingcap.com/tidb/stable/dynamic-config/#modify-pd-configuration-online), after the first start of each PD microservice component, only `log.level` can be modified by using the `TidbCluster` CR. Other configurations cannot be modified by using CR.

For TiDB clusters deployed on Kubernetes, if you need to modify configuration items of PD microservices, you can modify them dynamically using [SQL statements](https://docs.pingcap.com/tidb/stable/dynamic-config/#modify-pd-configuration-dynamically), [pd-ctl](https://docs.pingcap.com/tidb/stable/pd-control#config-show--set-option-value--placement-rules), or PD server API.

## Modify TiProxy configuration

Modifying the configuration of the TiProxy component never restarts the Pod. If you want to restart the Pod, you need to manually kill the Pod or change the Pod image to manually trigger the restart.
