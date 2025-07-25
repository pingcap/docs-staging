---
title: Upgrade TiDB Using TiUP
summary: Learn how to upgrade TiDB using TiUP.
---

# Upgrade TiDB Using TiUP

This document is targeted for the following upgrade paths:

- Upgrade from TiDB 4.0 versions to TiDB 7.5.
- Upgrade from TiDB 5.0-5.4 versions to TiDB 7.5.
- Upgrade from TiDB 6.0-6.6 to TiDB 7.5.
- Upgrade from TiDB 7.0-7.4 to TiDB 7.5.

> **Warning:**
>
> 1. You cannot upgrade TiFlash online from versions earlier than 5.3 to 5.3 or later. Instead, you must first stop all the TiFlash instances of the early version, and then upgrade the cluster offline. If other components (such as TiDB and TiKV) do not support an online upgrade, follow the instructions in warnings in [Online upgrade](#online-upgrade).
> 2. **DO NOT** run DDL statements during the upgrade process. Otherwise, the issue of undefined behavior might occur.
> 3. **DO NOT** upgrade a TiDB cluster when a DDL statement is being executed in the cluster (usually for the time-consuming DDL statements such as `ADD INDEX` and the column type changes). Before the upgrade, it is recommended to use the [`ADMIN SHOW DDL`](/sql-statements/sql-statement-admin-show-ddl.md) command to check whether the TiDB cluster has an ongoing DDL job. If the cluster has a DDL job, to upgrade the cluster, wait until the DDL execution is finished or use the [`ADMIN CANCEL DDL`](/sql-statements/sql-statement-admin-cancel-ddl.md) command to cancel the DDL job before you upgrade the cluster.
> 4. If the TiDB version before upgrade is 7.1.0 or later, you can ignore the preceding warnings 2 and 3. For more information, see [limitations on using TiDB smooth upgrade](/smooth-upgrade-tidb.md#limitations).
> 5. Be sure to read [limitations on user operations](/smooth-upgrade-tidb.md#limitations-on-user-operations) before upgrading your TiDB cluster using TiUP.

> **Note:**
>
> - If your cluster to be upgraded is v3.1 or an earlier version (v3.0 or v2.1), the direct upgrade to v7.5.0 or a later v7.5.x version is not supported. You need to upgrade your cluster first to v4.0 and then to the target TiDB version.
> - If your cluster to be upgraded is earlier than v6.2, the upgrade might get stuck when you upgrade the cluster to v6.2 or later versions in some scenarios. You can refer to [How to fix the issue](#how-to-fix-the-issue-that-the-upgrade-gets-stuck-when-upgrading-to-v620-or-later-versions).
> - TiDB nodes use the value of the [`server-version`](/tidb-configuration-file.md#server-version) configuration item to verify the current TiDB version. Therefore, to avoid unexpected behaviors, before upgrading the TiDB cluster, you need to set the value of `server-version` to empty or the real version of the current TiDB cluster.

## Upgrade caveat

- TiDB currently does not support version downgrade or rolling back to an earlier version after the upgrade.
- For the v4.0 cluster managed using TiDB Ansible, you need to import the cluster to TiUP (`tiup cluster`) for new management according to [Upgrade TiDB Using TiUP (v4.0)](https://docs-archive.pingcap.com/tidb/v4.0/upgrade-tidb-using-tiup#import-tidb-ansible-and-the-inventoryini-configuration-to-tiup). Then you can upgrade the cluster to v7.5.6 according to this document.
- To update versions earlier than v3.0 to v7.5.6:
    1. Update this version to 3.0 using [TiDB Ansible](https://docs-archive.pingcap.com/tidb/v3.0/upgrade-tidb-using-ansible).
    2. Use TiUP (`tiup cluster`) to import the TiDB Ansible configuration.
    3. Update the 3.0 version to 4.0 according to [Upgrade TiDB Using TiUP (v4.0)](https://docs-archive.pingcap.com/tidb/v4.0/upgrade-tidb-using-tiup#import-tidb-ansible-and-the-inventoryini-configuration-to-tiup).
    4. Upgrade the cluster to v7.5.6 according to this document.
- Support upgrading the versions of TiDB Binlog, TiCDC, TiFlash, and other components.
- When upgrading TiFlash from versions earlier than v6.3.0 to v6.3.0 and later versions, note that the CPU must support the AVX2 instruction set under the Linux AMD64 architecture and the ARMv8 instruction set architecture under the Linux ARM64 architecture. For details, see the description in [v6.3.0 Release Notes](/releases/release-6.3.0.md#others).
- For detailed compatibility changes of different versions, see the [Release Notes](/releases/release-notes.md) of each version. Modify your cluster configuration according to the "Compatibility Changes" section of the corresponding release notes.
- For clusters that upgrade from versions earlier than v5.3 to v5.3 or later versions, the default deployed Prometheus will upgrade from v2.8.1 to v2.27.1. Prometheus v2.27.1 provides more features and fixes a security issue. Compared with v2.8.1, alert time representation in v2.27.1 is changed. For more details, see [Prometheus commit](https://github.com/prometheus/prometheus/commit/7646cbca328278585be15fa615e22f2a50b47d06) for more details.

## Preparations

This section introduces the preparation works needed before upgrading your TiDB cluster, including upgrading TiUP and the TiUP Cluster component.

### Step 1: Review compatibility changes

Review compatibility changes in TiDB release notes. If any changes affect your upgrade, take actions accordingly.

The following provides compatibility changes you need to know when you upgrade from v7.5.0 to the current version (v7.5.6). If you are upgrading from v7.4.0 or earlier versions to the current version, you might also need to check the compatibility changes introduced in intermediate versions in the corresponding [release notes](/releases/release-notes.md).

- TiDB v7.5.0 [compatibility changes](/releases/release-7.5.0.md#compatibility-changes)
- TiDB v7.5.1 [compatibility changes](/releases/release-7.5.1.md#compatibility-changes)
- TiDB v7.5.2 [compatibility changes](/releases/release-7.5.2.md#compatibility-changes)
- TiDB v7.5.3 [compatibility changes](/releases/release-7.5.3.md#compatibility-changes)
- TiDB v7.5.4 [compatibility changes](/releases/release-7.5.4.md#compatibility-changes)
- TiDB v7.5.5 [compatibility changes](/releases/release-7.5.5.md#compatibility-changes)
- TiDB v7.5.6 [compatibility changes](/releases/release-7.5.6.md#compatibility-changes)

### Step 2: Upgrade TiUP or TiUP offline mirror

Before upgrading your TiDB cluster, you first need to upgrade TiUP or TiUP mirror.

#### Upgrade TiUP and TiUP Cluster

> **Note:**
>
> If the control machine of the cluster to upgrade cannot access `https://tiup-mirrors.pingcap.com`, skip this section and see [Upgrade TiUP offline mirror](#upgrade-tiup-offline-mirror).

1. Upgrade the TiUP version. It is recommended that the TiUP version is `1.11.3` or later.

    
    ```shell
    tiup update --self
    tiup --version
    ```

2. Upgrade the TiUP Cluster version. It is recommended that the TiUP Cluster version is `1.11.3` or later.

    
    ```shell
    tiup update cluster
    tiup cluster --version
    ```

#### Upgrade TiUP offline mirror

> **Note:**
>
> If the cluster to upgrade was deployed not using the offline method, skip this step.

Refer to [Deploy a TiDB Cluster Using TiUP - Deploy TiUP offline](/production-deployment-using-tiup.md#deploy-tiup-offline) to download the TiUP mirror of the new version and upload it to the control machine. After executing `local_install.sh`, TiUP will complete the overwrite upgrade.


```shell
tar xzvf tidb-community-server-${version}-linux-amd64.tar.gz
sh tidb-community-server-${version}-linux-amd64/local_install.sh
source /home/tidb/.bash_profile
```

After the overwrite upgrade, run the following command to merge the server and toolkit offline mirrors to the server directory:


```bash
tar xf tidb-community-toolkit-${version}-linux-amd64.tar.gz
ls -ld tidb-community-server-${version}-linux-amd64 tidb-community-toolkit-${version}-linux-amd64
cd tidb-community-server-${version}-linux-amd64/
cp -rp keys ~/.tiup/
tiup mirror merge ../tidb-community-toolkit-${version}-linux-amd64
```

After merging the mirrors, run the following command to upgrade the TiUP Cluster component:


```shell
tiup update cluster
```

Now, the offline mirror has been upgraded successfully. If an error occurs during TiUP operation after the overwriting, it might be that the `manifest` is not updated. You can try `rm -rf ~/.tiup/manifests/*` before running TiUP again.

### Step 3: Edit TiUP topology configuration file

> **Note:**
>
> Skip this step if one of the following situations applies:
>
> + You have not modified the configuration parameters of the original cluster. Or you have modified the configuration parameters using `tiup cluster` but no more modification is needed.
> + After the upgrade, you want to use the default parameter values of v7.5.6 for the unmodified configuration items.

1. Enter the `vi` editing mode to edit the topology file:

    
    ```shell
    tiup cluster edit-config <cluster-name>
    ```

2. Refer to the format of [topology](https://github.com/pingcap/tiup/blob/master/embed/examples/cluster/topology.example.yaml) configuration template and fill the parameters you want to modify in the `server_configs` section of the topology file.

3. After the modification, enter <kbd>:</kbd> + <kbd>w</kbd> + <kbd>q</kbd> to save the change and exit the editing mode. Enter <kbd>Y</kbd> to confirm the change.

> **Note:**
>
> Before you upgrade the cluster to v7.5.6, make sure that the parameters you have modified in v4.0 are compatible in v7.5.6. For details, see [TiKV Configuration File](/tikv-configuration-file.md).

### Step 4: Check the DDL and backup status of the cluster

To avoid undefined behaviors or other unexpected problems during the upgrade, it is recommended to check the following items before the upgrade.

- Cluster DDLs:

    - If you use [smooth upgrade](/smooth-upgrade-tidb.md), you do not need to check the DDL operations of your TiDB cluster. You do not need to wait for the completion of DDL jobs or cancel ongoing DDL jobs.
    - If you do not use [smooth upgrade](/smooth-upgrade-tidb.md), it is recommended to use the [`ADMIN SHOW DDL`](/sql-statements/sql-statement-admin-show-ddl.md) statement to check whether ongoing DDL jobs exist. If an ongoing DDL job exists, wait for the completion of its execution or cancel it using the [`ADMIN CANCEL DDL`](/sql-statements/sql-statement-admin-cancel-ddl.md) statement before performing an upgrade.

- Cluster backup: It is recommended to execute the [`SHOW [BACKUPS|RESTORES]`](/sql-statements/sql-statement-show-backups.md) statement to check whether there is an ongoing backup or restore task in the cluster. If yes, wait for its completion before performing an upgrade.

### Step 5: Check the health status of the current cluster

To avoid the undefined behaviors or other issues during the upgrade, it is recommended to check the health status of Regions of the current cluster before the upgrade. To do that, you can use the `check` sub-command.


```shell
tiup cluster check <cluster-name> --cluster
```

After the command is executed, the "Region status" check result will be output.

+ If the result is "All Regions are healthy", all Regions in the current cluster are healthy and you can continue the upgrade.
+ If the result is "Regions are not fully healthy: m miss-peer, n pending-peer" with the "Please fix unhealthy regions before other operations." prompt, some Regions in the current cluster are abnormal. You need to troubleshoot the anomalies until the check result becomes "All Regions are healthy". Then you can continue the upgrade.

## Upgrade the TiDB cluster

This section describes how to upgrade the TiDB cluster and verify the version after the upgrade.

### Upgrade the TiDB cluster to a specified version

You can upgrade your cluster in one of the two ways: online upgrade and offline upgrade.

By default, TiUP Cluster upgrades the TiDB cluster using the online method, which means that the TiDB cluster can still provide services during the upgrade process. With the online method, the leaders are migrated one by one on each node before the upgrade and restart. Therefore, for a large-scale cluster, it takes a long time to complete the entire upgrade operation.

If your application has a maintenance window for the database to be stopped for maintenance, you can use the offline upgrade method to quickly perform the upgrade operation.

#### Online upgrade


```shell
tiup cluster upgrade <cluster-name> <version>
```

For example, if you want to upgrade the cluster to v7.5.6:


```shell
tiup cluster upgrade <cluster-name> v7.5.6
```

> **Note:**
>
> + An online upgrade upgrades all components one by one. During the upgrade of TiKV, all leaders in a TiKV instance are evicted before stopping the instance. The default timeout time is 5 minutes (300 seconds). The instance is directly stopped after this timeout time.
>
> + You can use the `--force` parameter to upgrade the cluster immediately without evicting the leader. However, the errors that occur during the upgrade will be ignored, which means that you are not notified of any upgrade failure. Therefore, use the `--force` parameter with caution.
>
> + To keep a stable performance, make sure that all leaders in a TiKV instance are evicted before stopping the instance. You can set `--transfer-timeout` to a larger value, for example, `--transfer-timeout 3600` (unit: second).
>
> + To upgrade TiFlash from versions earlier than v5.3.0 to v5.3.0 or later, you must stop TiFlash and then upgrade it, and the TiUP version must be earlier than v1.12.0. For more information, see [Upgrade TiFlash using TiUP](/tiflash-upgrade-guide.md#upgrade-tiflash-using-tiup).
>
> + Try to avoid creating a new clustered index table when you apply rolling updates to the clusters using TiDB Binlog.

#### Specify the component version during upgrade

Starting from tiup-cluster v1.14.0, you can specify certain components to a specific version during cluster upgrade. These components will remain at their fixed version in the subsequent upgrade unless you specify a different version.

> **Note:**
>
> For components that share a version number, such as TiDB, TiKV, PD, and TiCDC, there are no complete tests to ensure that they work properly in a mixed-version deployment scenario. Ensure that you use this section only in test environments, or with the help of [technical support](/support.md).

```shell
tiup cluster upgrade -h | grep "version string"
      --alertmanager-version string        Fix the version of alertmanager and no longer follows the cluster version.
      --blackbox-exporter-version string   Fix the version of blackbox-exporter and no longer follows the cluster version.
      --cdc-version string                 Fix the version of cdc and no longer follows the cluster version.
      --ignore-version-check               Ignore checking if target version is bigger than current version.
      --node-exporter-version string       Fix the version of node-exporter and no longer follows the cluster version.
      --pd-version string                  Fix the version of pd and no longer follows the cluster version.
      --tidb-dashboard-version string      Fix the version of tidb-dashboard and no longer follows the cluster version.
      --tiflash-version string             Fix the version of tiflash and no longer follows the cluster version.
      --tikv-cdc-version string            Fix the version of tikv-cdc and no longer follows the cluster version.
      --tikv-version string                Fix the version of tikv and no longer follows the cluster version.
      --tiproxy-version string             Fix the version of tiproxy and no longer follows the cluster version.
```

#### Offline upgrade

1. Before the offline upgrade, you first need to stop the entire cluster.

    
    ```shell
    tiup cluster stop <cluster-name>
    ```

2. Use the `upgrade` command with the `--offline` option to perform the offline upgrade. Fill in the name of your cluster for `<cluster-name>` and the version to upgrade to for `<version>`, such as `v7.5.6`.

    
    ```shell
    tiup cluster upgrade <cluster-name> <version> --offline
    ```

3. After the upgrade, the cluster will not be automatically restarted. You need to use the `start` command to restart it.

    
    ```shell
    tiup cluster start <cluster-name>
    ```

### Verify the cluster version

Execute the `display` command to view the latest cluster version `TiDB Version`:


```shell
tiup cluster display <cluster-name>
```

```
Cluster type:       tidb
Cluster name:       <cluster-name>
Cluster version:    v7.5.6
```

## FAQ

This section describes common problems encountered when updating the TiDB cluster using TiUP.

### If an error occurs and the upgrade is interrupted, how to resume the upgrade after fixing this error?

Re-execute the `tiup cluster upgrade` command to resume the upgrade. The upgrade operation restarts the nodes that have been previously upgraded. If you do not want the upgraded nodes to be restarted, use the `replay` sub-command to retry the operation:

1. Execute `tiup cluster audit` to see the operation records:

    
    ```shell
    tiup cluster audit
    ```

    Find the failed upgrade operation record and keep the ID of this operation record. The ID is the `<audit-id>` value in the next step.

2. Execute `tiup cluster replay <audit-id>` to retry the corresponding operation:

    
    ```shell
    tiup cluster replay <audit-id>
    ```

### How to fix the issue that the upgrade gets stuck when upgrading to v6.2.0 or later versions?

Starting from v6.2.0, TiDB enables the [concurrent DDL framework](/ddl-introduction.md#how-the-online-ddl-asynchronous-change-works-in-tidb) by default to execute concurrent DDLs. This framework changes the DDL job storage from a KV queue to a table queue. This change might cause the upgrade to get stuck in some scenarios. The following are some scenarios that might trigger this issue and the corresponding solutions:

- Upgrade gets stuck due to plugin loading

    During the upgrade, loading certain plugins that require executing DDL statements might cause the upgrade to get stuck.

    **Solution**: avoid loading plugins during the upgrade. Instead, load plugins only after the upgrade is completed.

- Upgrade gets stuck due to using the `kill -9` command for offline upgrade

    - Precautions: avoid using the `kill -9` command to perform the offline upgrade. If it is necessary, restart the new version TiDB node after 2 minutes.
    - If the upgrade is already stuck, restart the affected TiDB node. If the issue has just occurred, it is recommended to restart the node after 2 minutes.

- Upgrade gets stuck due to DDL Owner change

    In multi-instance scenarios, network or hardware failures might cause DDL Owner change. If there are unfinished DDL statements in the upgrade phase, the upgrade might get stuck.

    **Solution**:

    1. Terminate the stuck TiDB node (avoid using `kill -9`).
    2. Restart the new version TiDB node.

### The evict leader has waited too long during the upgrade. How to skip this step for a quick upgrade?

You can specify `--force`. Then the processes of transferring PD leader and evicting TiKV leader are skipped during the upgrade. The cluster is directly restarted to update the version, which has a great impact on the cluster that runs online. In the following command, `<version>` is the version to upgrade to, such as `v7.5.6`.


```shell
tiup cluster upgrade <cluster-name> <version> --force
```

### How to update the version of tools such as pd-ctl after upgrading the TiDB cluster?

You can upgrade the tool version by using TiUP to install the `ctl` component of the corresponding version:


```shell
tiup install ctl:v7.5.6
```
