---
title: Upgrade a TiDB Cluster on Kubernetes
summary: Learn how to upgrade a TiDB cluster on Kubernetes.
---

# Upgrade a TiDB Cluster on Kubernetes

If you deploy and manage your TiDB clusters on Kubernetes using TiDB Operator, you can upgrade your TiDB clusters using the rolling update feature. Rolling update can limit the impact of upgrade on your application.

This document describes how to upgrade a TiDB cluster on Kubernetes using rolling updates.

## Rolling update introduction

Kubernetes provides the [rolling update](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/) feature to update your application with zero downtime.

When you perform a rolling update, TiDB Operator serially deletes an old Pod and creates the corresponding new Pod in the order of PD, TiProxy, TiFlash, TiKV, and TiDB. After the new Pod runs normally, TiDB Operator proceeds with the next Pod.

> **Note:**
>
> If [PD microservices](https://docs.pingcap.com/tidb/dev/pd-microservices) (introduced in TiDB v8.0.0) are deployed in a cluster, when you perform a rolling update to upgrade the cluster, TiDB Operator serially deletes an old Pod and creates the corresponding new Pod in the order of each PD microservice component, PD, TiKV, and TiDB. After the new Pod runs normally, TiDB Operator proceeds with the next Pod.

During the rolling update, TiDB Operator automatically completes Leader transfer for PD and TiKV. Under the highly available deployment topology (minimum requirements: PD \* 3, TiKV \* 3, TiDB \* 2), performing a rolling update to PD and TiKV servers does not impact the running application. If your client supports retrying stale connections, performing a rolling update to TiDB servers does not impact application, either.

> **Warning:**
>
> - For the clients that cannot retry stale connections, **performing a rolling update to TiDB servers closes the client connections and cause the request to fail**. In such cases, it is recommended to add a retry function for the clients to retry, or to perform a rolling update to TiDB servers in idle time.
> - Before upgrading, refer to the [documentation](https://docs.pingcap.com/tidb/stable/sql-statement-admin-show-ddl) to confirm that there are no DDL operations in progress.

## Preparations before upgrade

1. Refer to the [upgrade caveat](https://docs.pingcap.com/tidb/dev/upgrade-tidb-using-tiup#upgrade-caveat) to learn about the precautions. Note that all TiDB versions, including patch versions, currently do not support downgrade or rollback after upgrade.
2. Refer to [TiDB release notes](https://docs.pingcap.com/tidb/dev/release-notes) to learn about the compatibility changes in each intermediate version. If any changes affect your upgrade, take appropriate measures.

    For example, if you upgrade from TiDB v6.4.0 to v6.5.2, you need to check the compatibility changes in the following versions:

    - TiDB v6.5.0 [compatibility changes](https://docs.pingcap.com/tidb/stable/release-6.5.0#compatibility-changes) and [deprecated features](https://docs.pingcap.com/tidb/stable/release-6.5.0#deprecated-feature)
    - TiDB v6.5.1 [compatibility changes](https://docs.pingcap.com/tidb/stable/release-6.5.1#compatibility-changes)
    - TiDB v6.5.2 [compatibility changes](https://docs.pingcap.com/tidb/stable/release-6.5.2#compatibility-changes)

    If you upgrade from v6.3.0 or an earlier version to v6.5.2, you also need to check the compatibility changes in all intermediate versions.

## Upgrade steps

> **Note:**
>
> By default, TiDB (versions starting from v4.0.2 and released before February 20, 2023) periodically shares usage details with PingCAP to help understand how to improve the product. For details about what is shared and how to disable the sharing, see [Telemetry](https://docs.pingcap.com/tidb/stable/telemetry). Starting from February 20, 2023, the telemetry feature is disabled by default in newly released TiDB versions. See [TiDB Release Timeline](https://docs.pingcap.com/tidb/stable/release-timeline) for details.

1. In `TidbCluster` CR, modify the image configurations of all components of the cluster to be upgraded.

    
    ```shell
    kubectl edit tc ${cluster_name} -n ${namespace}
    ```

    Usually, all components in a cluster are in the same version. You can upgrade the TiDB cluster simply by modifying `spec.version`. If you need to use different versions for different components, modify `spec.<pd/tidb/tikv/pump/tiflash/ticdc>.version`.

    The `version` field has following formats:

    - `spec.version`: the format is `imageTag`, such as `v8.5.2`
    - `spec.<pd/tidb/tikv/pump/tiflash/ticdc>.version`: the format is `imageTag`, such as `v3.1.0`

2. Check the upgrade progress:

    
    ```shell
    watch kubectl -n ${namespace} get pod -o wide
    ```

    After all the Pods finish rebuilding and become `Running`, the upgrade is completed.

## Troubleshoot the upgrade

If the PD cluster is unavailable due to PD configuration errors, PD image tag errors, NodeAffinity, or other causes, you might not be able to successfully upgrade the TiDB cluster. In such cases, you can force an upgrade of the cluster to recover the cluster functionality.

The steps of force upgrade are as follows:

1. Set `annotation` for the cluster:

    
    ```shell
    kubectl annotate --overwrite tc ${cluster_name} -n ${namespace} tidb.pingcap.com/force-upgrade=true
    ```

2. Change the related PD configuration to make sure that PD turns into a normal state.

3. After the PD cluster recovers, you *must* execute the following command to disable the forced upgrade; otherwise, an exception may occur in the next upgrade:

    
    ```shell
    kubectl annotate tc ${cluster_name} -n ${namespace} tidb.pingcap.com/force-upgrade-
    ```

After taking the steps above, your TiDB cluster recovers its functionality. You can upgrade the cluster normally.
