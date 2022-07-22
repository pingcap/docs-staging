---
title: Maintain Kubernetes Nodes that Hold the TiDB Cluster
summary: Learn how to maintain Kubernetes nodes that hold the TiDB cluster.
---

# Maintain Kubernetes Nodes that Hold the TiDB Cluster

TiDB is a highly available database that can run smoothly when some of the database nodes go offline. For this reason, you can safely shut down and maintain the Kubernetes nodes at the bottom layer without influencing TiDB's service. Specifically, you need to adopt various maintenance strategies when handling PD, TiKV, and TiDB Pods because of their different characteristics.

This document introduces how to perform a temporary or long-term maintenance task for the Kubernetes nodes.

## Prerequisites

- [`kubectl`](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [`tkctl`](use-tkctl.md)
- [`jq`](https://stedolan.github.io/jq/download/)

> **Note:**
>
> Before you maintain a node, you need to make sure that the remaining resources in the Kubernetes cluster are enough for running the TiDB cluster.

## Maintain a node that can be recovered shortly

1. Mark the node to be maintained as non-schedulable to ensure that no new Pod is scheduled to it:

    
    ```shell
    kubectl cordon ${node_name}
    ```

2. Check whether there is any TiKV Pod on the node to be maintained:

    
    ```shell
    kubectl get pod --all-namespaces -o wide | grep ${node_name} | grep tikv
    ```

    If any TiKV Pod is found, for each TiKV Pod, perform the following operations:

    1. [Evict the TiKV Region Leader](#evict-tikv-region-leader) to another Pod.

    2. Increase the maximum offline duration for TiKV Pods by configuring `max-store-down-time` of PD. After you maintain and recover the Kubernetes node within that duration, all TiKV Pods on that node will be automatically recovered.

        The following example shows how to set `max-store-down-time` to `60m`. You can set it to any reasonable value.

        
        ```shell
        pd-ctl config set max-store-down-time 60m
        ```

3. Check whether there is any PD Pod on the node to be maintained:

    
    ```shell
    kubectl get pod --all-namespaces -o wide | grep ${node_name} | grep pd
    ```

    If any PD Pod is found, for each PD Pod, [transfer the PD leader](#transfer-pd-leader) to other Pods.

4. Confirm that the node to be maintained no longer has any TiKV Pod or PD Pod:

    
    ```shell
    kubectl get pod --all-namespaces -o wide | grep ${node_name}
    ```

5. Migrate all Pods on the node to be maintained to other nodes:

    
    ```shell
    kubectl drain ${node_name} --ignore-daemonsets
    ```

    After running this command, all Pods on this node are automatically migrated to another available node.

6. Confirm that the node to be maintained no longer has any TiKV, TiDB, or PD Pod:

    
    ```shell
    kubectl get pod --all-namespaces -o wide | grep ${node_name}
    ```

7. When the maintenance is completed, after you recover the node, make sure that the node is in a healthy state:

    
    ```shell
    watch kubectl get node ${node_name}
    ```

    After the node goes into the `Ready` state, proceed with the following operations.

8. Lift the scheduling restriction on the node:

    
    ```shell
    kubectl uncordon ${node_name}
    ```

9. Confirm that all Pods are running normally:

    
    ```shell
    kubectl get pod --all-namespaces -o wide | grep ${node_name}
    ```

    When all Pods are running normally, you have successfully finished the maintenance task.

## Maintain a node that cannot be recovered shortly

1. Check whether there is any TiKV Pod on the node to be maintained:

    
    ```shell
    kubectl get pod --all-namespaces -o wide | grep ${node_name} | grep tikv
    ```

    If any TiKV Pod is found, for each TiKV Pod, [reschedule the TiKV Pod](#reschedule-tikv-pods) to another node.

2. Check whether there is any PD Pod on the node to be maintained:

    
    ```shell
    kubectl get pod --all-namespaces -o wide | grep ${node_name} | grep pd
    ```

    If any PD Pod is found, for each PD Pod, [reschedule the PD Pod](#reschedule-pd-pods) to another node.

3. Confirm that the node to be maintained no longer has any TiKV Pod or PD Pod:

    
    ```shell
    kubectl get pod --all-namespaces -o wide | grep ${node_name}
    ```

4. Migrate all Pods on the node to be maintained to other nodes:

    
    ```shell
    kubectl drain ${node_name} --ignore-daemonsets
    ```

    After running this command, all Pods on this node are automatically migrated to another available node.

5. Confirm that the node to be maintained no longer has any TiKV, TiDB, or PD Pod:

    
    ```shell
    kubectl get pod --all-namespaces -o wide | grep ${node_name}
    ```

6. (Optional) If the node will be offline for a long time, it is recommended to delete the node from your Kubernetes cluster:

    
    ```shell
    kubectl delete node ${node_name}
    ```

## Reschedule PD Pods

If a node will be offline for a long time, to minimize the impact on your application, you can reschedule the PD Pods on this node to other nodes in advance.

### If the node storage can be automatically migrated

If the node storage can be automatically migrated (such as EBS), to reschedule a PD Pod, you do not need to delete the PD member. You only need to transfer the PD Leader to another Pod and delete the old Pod.

1. Mark the node to be maintained as non-schedulable to ensure that no new Pod is scheduled to it:

    
    ```shell
    kubectl cordon ${node_name}
    ```

2. Check the PD Pod on the node to be maintained:

    
    ```shell
    kubectl get pod --all-namespaces -o wide | grep ${node_name} | grep pd
    ```

3. [Transfer the PD Leader](#transfer-pd-leader) to another Pod.

4. Delete the old PD Pod:

    
    ```shell
    kubectl delete -n ${namespace} pod ${pod_name}
    ```

5. Confirm that the PD Pod is successfully scheduled to another node:

    
    ```shell
    watch kubectl -n ${namespace} get pod -o wide
    ```

### If the node storage cannot be automatically migrated

If the node storage cannot be automatically migrated (such as local storage), to reschedule a PD Pod, you need to delete the PD member.

1. Mark the node to be maintained as non-schedulable to ensure that no new Pod is scheduled to it:

    
    ```shell
    kubectl cordon ${node_name}
    ```

2. Check the PD Pod on the node to be maintained:

    
    ```shell
    kubectl get pod --all-namespaces -o wide | grep ${node_name} | grep pd
    ```

3. [Transfer the PD Leader](#transfer-pd-leader) to another Pod.

4. Take the PD Pod offline:

    
    ```shell
    pd-ctl member delete name ${pod_name}
    ```

5. Confirm that the PD member is deleted:

    
    ```shell
    pd-ctl member
    ```

6. Unbind the PD Pod with the local disk on the node.

    1. Check the `PersistentVolumeClaim` used by the Pod:

        
        ```shell
        kubectl -n ${namespace} get pvc -l tidb.pingcap.com/pod-name=${pod_name}
        ```

    2. Delete the `PersistentVolumeClaim`:

        
        ```shell
        kubectl delete -n ${namespace} pvc ${pvc_name} --wait=false
        ```

7. Delete the old PD Pod:

    
    ```shell
    kubectl delete -n ${namespace} pod ${pod_name}
    ```

8. Confirm that the PD Pod is successfully scheduled to another node:

    
    ```shell
    watch kubectl -n ${namespace} get pod -o wide
    ```

## Reschedule TiKV Pods

If a node will be offline for a long time, to minimize the impact on your application, you can reschedule the TiKV Pods on this node to other nodes in advance.

### If the node storage can be automatically migrated

If the node storage can be automatically migrated (such as EBS), to reschedule a TiKV Pod, you do not need to delete the whole TiKV store. You only need to evict the TiKV Region Leader to another Pod and delete the old Pod.

1. Mark the node to be maintained as non-schedulable to ensure that no new Pod is scheduled to it:

    
    ```shell
    kubectl cordon ${node_name}
    ```

2. Check the TiKV Pod on the node to be maintained:

    
    ```shell
    kubectl get pod --all-namespaces -o wide | grep ${node_name} | grep tikv
    ```

3. [Evict the TiKV Region Leader](#evict-tikv-region-leader) to another Pod.

4. Delete the old TiKV Pod:

    
    ```shell
    kubectl delete -n ${namespace} pod ${pod_name}
    ```

5. Confirm that the TiKV Pod is successfully scheduled to another node:

    
    ```shell
    watch kubectl -n ${namespace} get pod -o wide
    ```

6. Remove evict-leader-scheduler, and wait for the Region Leader to automatically schedule back:

    
    ```shell
    pd-ctl scheduler remove evict-leader-scheduler-${ID}
    ```

### If the node storage cannot be automatically migrated

If the node storage cannot be automatically migrated (such as local storage), to reschedule a TiKV Pod, you need to delete the whole TiKV store.

1. Mark the node to be maintained as non-schedulable to ensure that no new Pod is scheduled to it:

    
    ```shell
    kubectl cordon ${node_name}
    ```

2. Check the TiKV Pod on the node to be maintained:

    
    ```shell
    kubectl get pod --all-namespaces -o wide | grep ${node_name} | grep tikv
    ```

3. [Evict the TiKV Region Leader](#evict-tikv-region-leader) to another Pod.

4. Take the TiKV Pod offline.

    > **Note:**
    >
    > Before you take the TiKV Pod offline, make sure that the remaining TiKV Pods are not fewer than the TiKV replica number set in PD configuration (`max-replicas`, 3 by default). If the remaining TiKV Pods are not enough, scale out TiKV Pods before you take the TiKV Pod offline.

    1. Check `store-id` of the TiKV Pod:

        
        ```shell
        kubectl get tc ${cluster_name} -ojson | jq ".status.tikv.stores | .[] | select ( .podName == \"${pod_name}\" ) | .id"
        ```

    2. Take the Pod offline:

        
        ```shell
        pd-ctl store delete ${ID}
        ```

5. Wait for the store status (`state_name`) to become `Tombstone`:

    
    ```shell
    watch pd-ctl store ${ID}
    ```

6. Unbind the TiKV Pod with the local disk on the node.

    1. Check the `PersistentVolumeClaim` used by the Pod:

        
        ```shell
        kubectl -n ${namespace} get pvc -l tidb.pingcap.com/pod-name=${pod_name}
        ```

    2. Delete the `PersistentVolumeClaim`:

        
        ```shell
        kubectl delete -n ${namespace} pvc ${pvc_name} --wait=false
        ```

7. Delete the old TiKV Pod:

    
    ```shell
    kubectl delete -n ${namespace} pod ${pod_name}
    ```

8. Confirm that the TiKV Pod is successfully scheduled to another node:

    
    ```shell
    watch kubectl -n ${namespace} get pod -o wide
    ```

9. Remove evict-leader-scheduler, and wait for the Region Leader to automatically schedule back:

    
    ```shell
    pd-ctl scheduler remove evict-leader-scheduler-${ID}
    ```

## Transfer PD Leader

1. Check the PD Leader:

    
    ```shell
    pd-ctl member leader show
    ```

2. If the Leader Pod is on the node to be maintained, you need to transfer the PD Leader to a Pod on another node:

    
    ```shell
    pd-ctl member leader transfer ${pod_name}
    ```

    `${pod_name}` is the name of the PD Pod on another node.

## Evict TiKV Region Leader

1. Check `store-id` of the TiKV Pod:

    
    ```shell
    kubectl get tc ${cluster_name} -ojson | jq ".status.tikv.stores | .[] | select ( .podName == \"${pod_name}\" ) | .id"
    ```

2. Evict the Region Leader:

    
    ```shell
    pd-ctl scheduler add evict-leader-scheduler ${ID}
    ```

3. Confirm that all Region Leaders are migrated:

    
    ```shell
    kubectl get tc ${cluster_name} -ojson | jq ".status.tikv.stores | .[] | select ( .podName == \"${pod_name}\" ) | .leaderCount"
    ```
