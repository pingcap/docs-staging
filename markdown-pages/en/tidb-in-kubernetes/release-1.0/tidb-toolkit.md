---
title: Tools in Kubernetes
summary: Learn about operation tools for TiDB in Kubernetes.
aliases: ['/docs/tidb-in-kubernetes/v1.0/tidb-toolkit/','/docs/dev/tidb-in-kubernetes/reference/tools/in-kubernetes/','/docs/v3.1/tidb-in-kubernetes/reference/tools/in-kubernetes/','/docs/v3.0/tidb-in-kubernetes/reference/tools/in-kubernetes/']
---

# Tools in Kubernetes

Operations on TiDB in Kubernetes require some open source tools. In the meantime, there are some special requirements for operations using TiDB tools in the Kubernetes environment. This documents introduces in details the related operation tools for TiDB in Kubernetes.

## Use PD Control in Kubernetes

[PD Control](https://pingcap.com/docs/v3.0/reference/tools/pd-control) is the command-line tool for PD (Placement Driver). To use PD Control to operate on TiDB clusters in Kubernetes, firstly you need to establish the connection from local to the PD service using `kubectl port-forward`:


```shell
kubectl port-forward -n <namespace> svc/<cluster-name>-pd 2379:2379 &>/tmp/portforward-pd.log &
```

After the above command is executed, you can access the PD service via `127.0.0.1:2379`, and then use the default parameters of `pd-ctl` to operate. For example:


```shell
pd-ctl -d config show
```

Assume that your local port `2379` has been occupied and you want to switch to another port:


```shell
kubectl port-forward -n <namespace> svc/<cluster-name>-pd <local-port>:2379 &>/tmp/portforward-pd.log &
```

Then you need to explicitly assign a PD port for `pd-ctl`:


```shell
pd-ctl -u 127.0.0.1:<local-port> -d config show
```

## Use TiKV Control in Kubernetes

[TiKV Control](https://pingcap.com/docs/v3.0/reference/tools/tikv-control) is the command-line tool for TiKV. When using TiKV Control for TiDB clusters in Kubernetes, be aware that each operation mode involves different steps, as described below:

* **Remote Mode**: In this mode, `tikv-ctl` accesses the TiKV service or the PD service through network. Firstly you need to establish the connection from local to the PD service and the target TiKV node using `kubectl port-forward`:

    
    ```shell
    kubectl port-forward -n <namespace> svc/<cluster-name>-pd 2379:2379 &>/tmp/portforward-pd.log &
    ```

    
    ```shell
    kubectl port-forward -n <namespace> <tikv-pod-name> 20160:20160 &>/tmp/portforward-tikv.log &
    ```

    After the connection is established, you can access the PD service and the TiKV node via the corresponding port in local:

    
    ```shell
    tikv-ctl --host 127.0.0.1:20160 <subcommands>
    ```

    
    ```shell
    tikv-ctl --pd 127.0.0.1:2379 compact-cluster
    ```

* **Local Mode**：In this mode, `tikv-ctl` accesses data files of TiKV, and the running TiKV instances must be stopped. To operate in the local mode, first you need to enter the [Diagnostic Mode](troubleshoot.md#use-the-diagnostic-mode) to turn off automatic re-starting for the TiKV instance, stop the TiKV process, and use the `tkctl debug` command to start in the target TiKV Pod a new container that contains the `tikv-ctl` executable. The steps are as follows:

    1. Enter the Diagnostic mode:

        
        ```shell
        kubectl annotate pod <tikv-pod-name> -n <namespace> runmode=debug
        ```

    2. Stop the TiKV process:

        
        ```shell
        kubectl exec <tikv-pod-name> -n <namespace> -c tikv -- kill -s TERM 1
        ```

    3. Start the debug container:

        
        ```shell
        tkctl debug <tikv-pod-name> -c tikv
        ```

    4. Start using `tikv-ctl` in local mode. It should be noted that the root file system of `tikv` is under `/proc/1/root`, so you need to adjust the path of the data directory accordingly when executing a command:

        
        ```shell
        tikv-ctl --db /path/to/tikv/db size -r 2
        ```

        > **Note:**
        >
        >   The default db path of TiKV instances in the debug container is `/proc/1/root/var/lib/tikv/db`

## Use TiDB Control in Kubernetes

[TiDB Control](https://pingcap.com/docs/v3.0/reference/tools/tidb-control) is the command-line tool for TiDB. To use TiDB Control in Kubernetes, you need to access the TiDB node and the PD service from local. It is suggested you turn on the connection from local to the TiDB node and the PD service using `kubectl port-forward`:


```shell
kubectl port-forward -n <namespace> svc/<cluster-name>-pd 2379:2379 &>/tmp/portforward-pd.log &
```


```shell
kubectl port-forward -n <namespace> <tidb-pod-name> 10080:10080 &>/tmp/portforward-tidb.log &
```

Then you can use the `tidb-ctl`:


```shell
tidb-ctl schema in mysql
```

## Use Helm

[Helm](https://helm.sh/) is a package management tool for Kubernetes. Make sure your Helm version >= 2.11.0 and < 2.16.4. The installation steps are as follows:

1. Refer to [Helm official documentation](https://v2.helm.sh/docs/using_helm/#installing-helm) to install Helm client.

2. Install Helm server.

    Apply the `RBAC` rule required by the `tiller` component in the cluster and install `tiller`:

    
    ```shell
    kubectl apply -f https://raw.githubusercontent.com/pingcap/tidb-operator/master/manifests/tiller-rbac.yaml && \
    helm init --service-account=tiller --upgrade
    ```

    If you cannot access `gcr.io`, try using the mirror repository:

    
    ``` shell
    helm init --service-account=tiller --upgrade --tiller-image registry.cn-hangzhou.aliyuncs.com/google_containers/tiller:$(helm version --client --short | grep -Eo 'v[0-9]\.[0-9]+\.[0-9]+')
    ```

    Confirm that the tiller pod is in the `running` state by the following command:

    
    ```shell
    kubectl get po -n kube-system -l name=tiller
    ```

    If `RBAC` is not enabled for the Kubernetes cluster, use the following command to install `tiller`:

    
    ```shell
    helm init --upgrade
    ```

Kubernetes applications are packed as chart in Helm. PingCAP provides the following Helm charts for TiDB in Kubernetes:

* `tidb-operator`: used to deploy TiDB Operator;
* `tidb-cluster`: used to deploy TiDB clusters;
* `tidb-backup`: used to backup or restore TiDB clusters;
* `tidb-lightning`: used to import data into a TiDB cluster;
* `tidb-drainer`: used to deploy TiDB Drainer;
* `tikv-importer`: used to deploy TiKV Importer.

These charts are hosted in the Helm chart repository `https://charts.pingcap.org/` maintained by PingCAP. You can add this repository to your local using the following command:


```shell
helm repo add pingcap https://charts.pingcap.org/
```

After adding, use `helm search` to search for the charts provided by PingCAP:


```shell
helm search pingcap -l
```

```
NAME                    CHART VERSION   APP VERSION DESCRIPTION
pingcap/tidb-backup     v1.0.0                      A Helm chart for TiDB Backup or Restore
pingcap/tidb-cluster    v1.0.0                      A Helm chart for TiDB Cluster
pingcap/tidb-operator   v1.0.0                      tidb-operator Helm chart for Kubernetes
```

When a new version of chart has been released, you can use `helm repo update` to update the repository cached locally:


```shell
helm repo update
```

Common Helm operations include `helm install`, `helm upgrade`, and `helm del`. Helm chart usually contains many configurable parameters which could be tedious to configure manually. For convenience, it is recommended that you configure using a YAML file. Based on the conventions in the Helm community, the YAML file used for Helm configuration is named `values.yaml` in this document.

When performing a deployment or upgrade, you must specify the chart name (`chart-name`) and the name for the deployed application (`release-name`). You can also specify one or multiple `values.yaml` files to configure charts. In addition, you can use `chart-version` to specify the chart version (by default the latest GA is used). The steps in command line are as follows:

* Install:

    
    ```shell
    helm install <chart-name> --name=<release-name> --namespace=<namespace> --version=<chart-version> -f <values-file>
    ```

* Upgrade (upgrade can be done by modifying the `chart-version` to upgrade to the latest chart version or the `values.yaml` file to update the configuration):

    
    ```shell
    helm upgrade <release-name> <chart-name> --version=<chart-version> -f <values-file>
    ```

* To delete the application deployed by Helm, run the following command:

    
    ```shell
    helm del --purge <release-name>
    ```

For more information on Helm, refer to [Helm Documentation](https://helm.sh/docs/).

## Use Terraform

[Terraform](https://www.terraform.io/) is a Infrastructure as Code management tool. It enables users to define their own infrastructure in a  manifestation style, based on which execution plans are generated to create or schedule real world compute resources. TiDB in Kubernetes use Terraform to create and manage TiDB clusters on public clouds.

Follow the steps in [Terraform Documentation](https://www.terraform.io/downloads.html) to install Terraform.
