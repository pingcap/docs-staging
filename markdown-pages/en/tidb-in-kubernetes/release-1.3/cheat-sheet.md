---
title: Command Cheat Sheet for TiDB Cluster Management
summary: Learn the commonly used commands for managing TiDB clusters.
---

# Command Cheat Sheet for TiDB Cluster Management

This document is an overview of the commands used for TiDB cluster management.

## kubectl

### View resources

* View CRD:

    
    ```shell
    kubectl get crd
    ```

* View TidbCluster:

    
    ```shell
    kubectl -n ${namespace} get tc ${name}
    ```

* View TidbMonitor:

    
    ```shell
    kubectl -n ${namespace} get tidbmonitor ${name}
    ```

* View Backup:

    
    ```shell
    kubectl -n ${namespace} get bk ${name}
    ```

* View BackupSchedule:

    
    ```shell
    kubectl -n ${namespace} get bks ${name}
    ```

* View Restore:

    
    ```shell
    kubectl -n ${namespace} get restore ${name}
    ```

* View TidbClusterAutoScaler:

    
    ```shell
    kubectl -n ${namespace} get tidbclusterautoscaler ${name}
    ```

* View TidbInitializer:

    
    ```shell
    kubectl -n ${namespace} get tidbinitializer ${name}
    ```

* View Advanced StatefulSet:

    
    ```shell
    kubectl -n ${namespace} get asts ${name}
    ```

* View a Pod:

    
    ```shell
    kubectl -n ${namespace} get pod ${name}
    ```

    View a TiKV Pod:

    
    ```shell
    kubectl -n ${namespace} get pod -l app.kubernetes.io/component=tikv
    ```

    View the continuous status change of a Pod:

    ```shell
    watch kubectl -n ${namespace} get pod
    ```

    View the detailed information of a Pod:

    ```shell
    kubectl -n ${namespace} describe pod ${name}
    ```

* View the node on which Pods are located:

    
    ```shell
    kubectl -n ${namespace} get pods -l "app.kubernetes.io/component=tidb,app.kubernetes.io/instance=${cluster_name}" -ojsonpath="{range .items[*]}{.spec.nodeName}{'\n'}{end}"
    ```

* View Service:

    
    ```shell
    kubectl -n ${namespace} get service ${name}
    ```

* View ConfigMap:

    
    ```shell
    kubectl -n ${namespace} get cm ${name}
    ```

* View a PersistentVolume (PV):

    
    ```shell
    kubectl -n ${namespace} get pv ${name}
    ```

    View the PV used by the cluster:

    
    ```shell
    kubectl get pv -l app.kubernetes.io/namespace=${namespace},app.kubernetes.io/managed-by=tidb-operator,app.kubernetes.io/instance=${cluster_name}
    ```

* View a PersistentVolumeClaim (PVC):

    
    ```shell
    kubectl -n ${namespace} get pvc ${name}
    ```

* View StorageClass:

    
    ```shell
    kubectl -n ${namespace} get sc
    ```

* View StatefulSet:

    
    ```shell
    kubectl -n ${namespace} get sts ${name}
    ```

    View the detailed information of StatefulSet:

    
    ```shell
    kubectl -n ${namespace} describe sts ${name}
    ```

### Update resources

* Add an annotation for TiDBCluster:

    
    ```shell
    kubectl -n ${namespace} annotate tc ${cluster_name} ${key}=${value}
    ```

    Add a force-upgrade annotation for TiDBCluster:

    
    ```shell
    kubectl -n ${namespace} annotate --overwrite tc ${cluster_name} tidb.pingcap.com/force-upgrade=true
    ```

    Delete a force-upgrade annotation for TiDBCluster:

    
    ```shell
    kubectl -n ${namespace} annotate tc ${cluster_name} tidb.pingcap.com/force-upgrade-
    ```

    Enable the debug mode for Pods:

    
    ```shell
    kubectl -n ${namespace} annotate pod ${pod_name} runmode=debug
    ```

### Edit resources

* Edit TidbCluster:

    
    ```shell
    kubectl -n ${namespace} edit tc ${name}
    ```

### Patch Resources

* Patch TidbCluster:

  
    ```shell
    kubectl -n ${namespace} patch tc ${name} --type merge -p '${json_path}'
    ```

* Patch PV ReclaimPolicy:

    
    ```shell
    kubectl patch pv ${name} -p '{"spec":{"persistentVolumeReclaimPolicy":"Delete"}}'
    ```

* Patch a PVC:

    
    ```shell
    kubectl -n ${namespace} patch pvc ${name} -p '{"spec": {"resources": {"requests": {"storage": "100Gi"}}}'
    ```

* Patch StorageClass:

    
    ```shell
    kubectl patch storageclass ${name} -p '{"allowVolumeExpansion": true}'
    ```

### Create resources

* Create a cluster using the YAML file:

    
    ```shell
    kubectl -n ${namespace} apply -f ${file}
    ```

* Create Namespace:

    
    ```shell
    kubectl create ns ${namespace}
    ```

* Create Secret:

    Create Secret of the certificate:

    
    ```shell
    kubectl -n ${namespace} create secret generic ${secret_name} --from-file=tls.crt=${cert_path} --from-file=tls.key=${key_path} --from-file=ca.crt=${ca_path}
    ```

    Create Secret of the user id and password:

    
    ```shell
    kubectl -n ${namespace} create secret generic ${secret_name} --from-literal=user=${user} --from-literal=password=${password}
    ```

### Interact with running Pods

* View the PD configuration file:

    
    ```shell
    kubectl -n ${namespace} -it exec ${pod_name} -- cat /etc/pd/pd.toml
    ```

* View the TiDB configuration file:

    
    ```shell
    kubectl -n ${namespace} -it exec ${pod_name} -- cat /etc/tidb/tidb.toml
    ```

* View the TiKV configuration file:

    
    ```shell
    kubectl -n ${namespace} -it exec ${pod_name} -- cat /etc/tikv/tikv.toml
    ```

* View Pod logs:

    
    ```shell
    kubectl -n ${namespace} logs ${pod_name} -f
    ```

    View logs of the previous container:

    
    ```shell
    kubectl -n ${namespace} logs ${pod_name} -p
    ```

    If there are multiple containers in a Pod, view logs of one container:

    
    ```shell
    kubectl -n ${namespace} logs ${pod_name} -c ${container_name}
    ```

* Expose services:

    
    ```shell
    kubectl -n ${namespace} port-forward svc/${service_name} ${local_port}:${port_in_pod}
    ```

    Expose PD services:

    
    ```shell
    kubectl -n ${namespace} port-forward svc/${cluster_name}-pd 2379:2379
    ```

### Interact with nodes

* Mark the node as non-schedulable:

    
    ```shell
    kubectl cordon ${node_name}
    ```

* Mark the node as schedulable:

    
    ```shell
    kubectl uncordon ${node_name}
    ```

### Delete resources

* Delete a Pod:

    
    ```shell
    kubectl delete -n ${namespace} pod ${pod_name}
    ```

* Delete a PVC:

    
    ```shell
    kubectl delete -n ${namespace} pvc ${pvc_name}
    ```

* Delete TidbCluster:

    
    ```shell
    kubectl delete -n ${namespace} tc ${tc_name}
    ```

* Delete TidbMonitor:

    
    ```shell
    kubectl delete -n ${namespace} tidbmonitor ${tidb_monitor_name}
    ```

* Delete TidbClusterAutoScaler:

    
    ```shell
    kubectl -n ${namespace} delete tidbclusterautoscaler ${name}
    ```

### More

See [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) for more kubectl usage.

## Helm

### Add Helm repository


```shell
helm repo add pingcap https://charts.pingcap.com/
```

### Update Helm repository


```shell
helm repo update
```

### View available Helm chart

- View charts in Helm Hub:

    
    ```shell
    helm search hub ${chart_name}
    ```

    For example:

    
    ```shell
    helm search hub mysql
    ```

- View charts in other repositories:

    
    ```shell
    helm search repo ${chart_name} -l --devel
    ```

    For example:

    
    ```shell
    helm search repo tidb-operator -l --devel
    ```

### Get the default `values.yaml` of the Helm chart


```shell
helm inspect values ${chart_name} --version=${chart_version} > values.yaml
```

For example:


```shell
helm inspect values pingcap/tidb-operator --version=v1.3.10 > values-tidb-operator.yaml
```

### Deploy using Helm chart


```shell
helm install ${name} ${chart_name} --namespace=${namespace} --version=${chart_version} -f ${values_file}
```

For example:


```shell
helm install tidb-operator pingcap/tidb-operator --namespace=tidb-admin --version=v1.3.10 -f values-tidb-operator.yaml
```

### View the deployed Helm release


```shell
helm ls
```

### Update Helm release


```shell
helm upgrade ${name} ${chart_name} --version=${chart_version} -f ${values_file}
```

For example:


```shell
helm upgrade tidb-operator pingcap/tidb-operator --version=v1.3.10 -f values-tidb-operator.yaml
```

### Delete Helm release


```shell
helm uninstall ${name} -n ${namespace}
```

For example:


```shell
helm uninstall tidb-operator -n tidb-admin
```

### More

See [Helm Commands](https://helm.sh/docs/helm/) for more Helm usage.
