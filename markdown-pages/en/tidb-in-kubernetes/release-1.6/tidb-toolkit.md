---
title: Tools on Kubernetes
summary: Learn about operation tools for TiDB on Kubernetes.
---

# Tools on Kubernetes

Operations on TiDB on Kubernetes require some open source tools. In the meantime, there are some special requirements for operations using TiDB tools in the Kubernetes environment. This documents introduces in details the related operation tools for TiDB on Kubernetes.

## Use PD Control on Kubernetes

[PD Control](https://docs.pingcap.com/tidb/stable/pd-control) is the command-line tool for PD (Placement Driver). To use PD Control to operate on TiDB clusters on Kubernetes, firstly you need to establish the connection from local to the PD service using `kubectl port-forward`:


```shell
kubectl port-forward -n ${namespace} svc/${cluster_name}-pd 2379:2379 &>/tmp/portforward-pd.log &
```

After the above command is executed, you can access the PD service via `127.0.0.1:2379`, and then use the default parameters of `pd-ctl` to operate. For example:


```shell
pd-ctl -d config show
```

Assume that your local port `2379` has been occupied and you want to switch to another port:


```shell
kubectl port-forward -n ${namespace} svc/${cluster_name}-pd ${local_port}:2379 &>/tmp/portforward-pd.log &
```

Then you need to explicitly assign a PD port for `pd-ctl`:


```shell
pd-ctl -u 127.0.0.1:${local_port} -d config show
```

## Use TiKV Control on Kubernetes

[TiKV Control](https://docs.pingcap.com/tidb/stable/tikv-control) is the command-line tool for TiKV. When using TiKV Control for TiDB clusters on Kubernetes, be aware that each operation mode involves different steps, as described below:

* **Remote Mode**: In this mode, `tikv-ctl` accesses the TiKV service or the PD service through network. Firstly you need to establish the connection from local to the PD service and the target TiKV node using `kubectl port-forward`:

    
    ```shell
    kubectl port-forward -n ${namespace} svc/${cluster_name}-pd 2379:2379 &>/tmp/portforward-pd.log &
    ```

    
    ```shell
    kubectl port-forward -n ${namespace} ${pod_name} 20160:20160 &>/tmp/portforward-tikv.log &
    ```

    After the connection is established, you can access the PD service and the TiKV node via the corresponding port in local:

    
    ```shell
    tikv-ctl --host 127.0.0.1:20160 ${subcommands}
    ```

    
    ```shell
    tikv-ctl --pd 127.0.0.1:2379 compact-cluster
    ```

* **Local Mode**：In this mode, `tikv-ctl` accesses data files of TiKV, and the running TiKV instances must be stopped. To operate in the local mode, first you need to enter the [Debug Mode](tips.md#use-the-debug-mode) to turn off automatic re-starting for the TiKV instance, stop the TiKV process, and enter the target TiKV Pod and use `tikv-ctl` to perform the operation. The steps are as follows:

    1. Enter the debug mode:

        
        ```shell
        kubectl annotate pod ${pod_name} -n ${namespace} runmode=debug
        ```

    2. Stop the TiKV process:

        
        ```shell
        kubectl exec ${pod_name} -n ${namespace} -c tikv -- kill -s TERM 1
        ```

    3. Wait for the TiKV container to restart, and enter the container:

        
        ```shell
        kubectl exec -it ${pod_name} -n ${namespace} -- sh
        ```

    4. Start using `tikv-ctl` in local mode. The default db path in the TiKV container is `/var/lib/tikv/db`:

        
        ```shell
        ./tikv-ctl --data-dir /var/lib/tikv size -r 2
        ```

## Use TiDB Control on Kubernetes

[TiDB Control](https://docs.pingcap.com/tidb/stable/tidb-control) is the command-line tool for TiDB. To use TiDB Control on Kubernetes, you need to access the TiDB node and the PD service from local. It is suggested you turn on the connection from local to the TiDB node and the PD service using `kubectl port-forward`:


```shell
kubectl port-forward -n ${namespace} svc/${cluster_name}-pd 2379:2379 &>/tmp/portforward-pd.log &
```


```shell
kubectl port-forward -n ${namespace} ${pod_name} 10080:10080 &>/tmp/portforward-tidb.log &
```

Then you can use the `tidb-ctl`:


```shell
tidb-ctl schema in mysql
```

## Use Helm

[Helm](https://helm.sh/) is a package management tool for Kubernetes. The installation steps are as follows:

### Install the Helm client

Refer to [Helm official documentation](https://helm.sh/docs/intro/install/) to install the Helm client.

If the server does not have access to the Internet, you need to download Helm on a machine with Internet access, and then copy it to the server. Here is an example of installing the Helm client `3.4.1`:


```shell
wget https://get.helm.sh/helm-v3.4.1-linux-amd64.tar.gz
tar zxvf helm-v3.4.1-linux-amd64.tar.gz
```

After decompression, you can see the following files:

```shell
linux-amd64/
linux-amd64/README.md
linux-amd64/helm
linux-amd64/LICENSE
```

Copy the `linux-amd64/helm` file to the server and place it under the `/usr/local/bin/` directory.

Then execute `helm version`. If the command outputs normally, the Helm installation is successful:


```shell
helm version
```

```shell
version.BuildInfo{Version:"v3.4.1", GitCommit:"c4e74854886b2efe3321e185578e6db9be0a6e29", GitTreeState:"clean", GoVersion:"go1.14.11"}
```

### Configure the Helm repo

Kubernetes applications are packed as charts in Helm. PingCAP provides the following Helm charts for TiDB on Kubernetes:

* `tidb-operator`: used to deploy TiDB Operator;
* `tidb-lightning`: used to import data into a TiDB cluster;

These charts are hosted in the Helm chart repository `https://charts.pingcap.org/` maintained by PingCAP. You can add this repository to your local server or computer using the following command:


```shell
helm repo add pingcap https://charts.pingcap.org/
```

Then you can search the chart provided by PingCAP using the following command:


```shell
helm search repo pingcap
```

```
NAME                    CHART VERSION   APP VERSION     DESCRIPTION
pingcap/tidb-lightning  v1.6.3                          A Helm chart for TiDB Lightning
pingcap/tidb-operator   v1.6.3          v1.6.3          tidb-operator Helm chart for Kubernetes
```

When a new version of chart has been released, you can use `helm repo update` to update the repository cached locally:


```
helm repo update
```

### Helm common operations

Common Helm operations include `helm install`, `helm upgrade`, and `helm uninstall`. Helm chart usually contains many configurable parameters which could be tedious to configure manually. For convenience, it is recommended that you configure using a YAML file. Based on the conventions in the Helm community, the YAML file used for Helm configuration is named `values.yaml` in this document.

Before performing the deploy, upgrade and deploy, you can view the deployed applications via `helm ls`:


```shell
helm ls
```

When performing a deployment or upgrade, you must specify the chart name (`chart-name`) and the name for the deployed application (`release-name`). You can also specify one or multiple `values.yaml` files to configure charts. In addition, you can use `chart-version` to specify the chart version (by default the latest GA is used). The steps in command line are as follows:

* Install:

    
    ```shell
    helm install ${release_name} ${chart_name} --namespace=${namespace} --version=${chart_version} -f ${values_file}
    ```

* Upgrade (the upgrade can be either modifying the `chart-version` to upgrade to the latest chart version, or editing the `values.yaml` file to update the configuration):

    
    ```shell
    helm upgrade ${release_name} ${chart_name} --version=${chart_version} -f ${values_file}
    ```

* Delete:

    To delete the application deployed by Helm, run the following command:

    
    ```shell
    helm uninstall ${release_name} -n ${namespace}
    ```

For more information on Helm, refer to [Helm Documentation](https://helm.sh/docs/).

### Use Helm chart offline

If the server has no Internet access, you cannot configure the Helm repo to install the TiDB Operator component and other applications. At this time, you need to download the chart file needed for cluster installation on a machine with Internet access, and then copy it to the server.

Use the following command to download the chart file required for cluster installation:


```shell
wget http://charts.pingcap.org/tidb-operator-v1.6.3.tgz
wget http://charts.pingcap.org/tidb-lightning-v1.6.3.tgz
```

Copy these chart files to the server and decompress them. You can use these charts to install the corresponding components by running the `helm install` command. Take `tidb-operator` as an example:


```shell
tar zxvf tidb-operator.v1.6.3.tgz
helm install ${release_name} ./tidb-operator --namespace=${namespace}
```

## Use Terraform

[Terraform](https://www.terraform.io/) is a Infrastructure as Code management tool. It enables users to define their own infrastructure in a manifestation style, based on which execution plans are generated to create or schedule real world compute resources. TiDB on Kubernetes use Terraform to create and manage TiDB clusters on public clouds.

Follow the steps in [Terraform Documentation](https://www.terraform.io/downloads.html) to install Terraform.
