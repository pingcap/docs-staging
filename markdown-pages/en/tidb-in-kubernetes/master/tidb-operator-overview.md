---
title: TiDB Operator Overview
summary: Learn the overview of TiDB Operator.
aliases: ['/docs/tidb-in-kubernetes/dev/tidb-operator-overview/']
---

# TiDB Operator Overview

[TiDB Operator](https://github.com/pingcap/tidb-operator) is an automatic operation system for TiDB clusters on Kubernetes. It provides a full management life-cycle for TiDB including deployment, upgrades, scaling, backup, fail-over, and configuration changes. With TiDB Operator, TiDB can run seamlessly in the Kubernetes clusters deployed on a public cloud or in a self-managed environment.

The corresponding relationship between TiDB Operator and TiDB versions is as follows:

| TiDB versions | Compatible TiDB Operator versions |
|:---|:---|
| dev               | dev                 |
| TiDB >= 8.0       | 1.6 (Recommended), 1.5 |
| 7.1 <= TiDB < 8.0 | 1.5 (Recommended), 1.4 |
| 6.5 <= TiDB < 7.1 | 1.5, 1.4 (Recommended), 1.3 |
| 5.4 <= TiDB < 6.5 | 1.4, 1.3 (Recommended)   |
| 5.1 <= TiDB < 5.4 | 1.4, 1.3 (Recommended), 1.2 (End of support)      |
| 3.0 <= TiDB < 5.1 | 1.4, 1.3 (Recommended), 1.2 (End of support), 1.1 (End of support) |
| 2.1 <= TiDB < v3.0| 1.0 (End of support)       |

## Manage TiDB clusters using TiDB Operator

TiDB Operator provides several ways to deploy TiDB clusters on Kubernetes:

+ For test environment:

    - [Get Started](get-started.md) using kind, Minikube, or the Google Cloud Shell

+ For production environment:

    + On public cloud:
        - [Deploy TiDB on AWS EKS](deploy-on-aws-eks.md)
        - [Deploy TiDB on Google Cloud GKE](deploy-on-gcp-gke.md)
        - [Deploy TiDB on Azure AKS](deploy-on-azure-aks.md)

    - In an existing Kubernetes cluster:

        First install TiDB Operator on a Kubernetes cluster according to [Deploy TiDB Operator on Kubernetes](deploy-tidb-operator.md), then deploy your TiDB clusters according to [Deploy TiDB on General Kubernetes](deploy-on-general-kubernetes.md).

        You also need to adjust the configuration of the Kubernetes cluster based on [Prerequisites for TiDB on Kubernetes](prerequisites.md) and configure the local PV for your Kubernetes cluster to achieve low latency of local storage for TiKV according to [Local PV Configuration](configure-storage-class.md#local-pv-configuration).

Before deploying TiDB on any of the above two environments, you can always refer to [TiDB Cluster Configuration Document](configure-a-tidb-cluster.md) to customize TiDB configurations.

After the deployment is complete, see the following documents to use, operate, and maintain TiDB clusters on Kubernetes:

+ [Access the TiDB Cluster](access-tidb.md)
+ [Scale TiDB Cluster](scale-a-tidb-cluster.md)
+ [Upgrade a TiDB Cluster](upgrade-a-tidb-cluster.md)
+ [Change the Configuration of TiDB Cluster](configure-a-tidb-cluster.md)
+ [Back up and Restore a TiDB Cluster](backup-restore-overview.md)
+ [Automatic Failover](use-auto-failover.md)
+ [Monitor a TiDB Cluster on Kubernetes](monitor-a-tidb-cluster.md)
+ [View TiDB Logs on Kubernetes](view-logs.md)
+ [Maintain Kubernetes Nodes that Hold the TiDB Cluster](maintain-a-kubernetes-node.md)

When a problem occurs and the cluster needs diagnosis, you can:

+ See [TiDB FAQs on Kubernetes](faq.md) for any available solution;
+ See [Troubleshoot TiDB on Kubernetes](tips.md) to shoot troubles.

Some of TiDB's tools are used differently on Kubernetes. You can see [Tools on Kubernetes](tidb-toolkit.md) to understand how TiDB tools are used on Kubernetes.

Finally, when a new version of TiDB Operator is released, you can refer to [Upgrade TiDB Operator](upgrade-tidb-operator.md) to upgrade to the latest version.
