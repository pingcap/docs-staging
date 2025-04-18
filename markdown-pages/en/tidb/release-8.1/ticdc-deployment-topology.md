---
title: TiCDC Deployment Topology
summary: Learn the deployment topology of TiCDC based on the minimal TiDB topology.
---

# TiCDC Deployment Topology

> **Note:**
>
> TiCDC is a feature for general availability (GA) since v4.0.6. You can use it in the production environment.

This document describes the deployment topology of [TiCDC](/ticdc/ticdc-overview.md) based on the minimal cluster topology.

TiCDC is a tool for replicating the incremental data of TiDB, introduced in TiDB 4.0. It supports multiple downstream platforms, such as TiDB, MySQL, Kafka, MQ, and storage services. Compared with TiDB Binlog, TiCDC has lower latency and native high availability.

## Topology information

| Instance | Count | Physical machine configuration | IP | Configuration |
| :-- | :-- | :-- | :-- | :-- |
| TiDB | 3 | 16 VCore 32GB * 1 | 10.0.1.1 <br/> 10.0.1.2 <br/> 10.0.1.3 | Default port <br/> Global directory configuration |
| PD | 3 | 4 VCore 8GB * 1 | 10.0.1.4 <br/> 10.0.1.5 <br/> 10.0.1.6 | Default port <br/> Global directory configuration |
| TiKV | 3 | 16 VCore 32GB 2TB (nvme ssd) * 1 | 10.0.1.7 <br/> 10.0.1.8 <br/> 10.0.1.9 | Default port <br/> Global directory configuration |
| CDC | 3 | 8 VCore 16GB * 1 | 10.0.1.11 <br/> 10.0.1.12 <br/> 10.0.1.13 | Default port <br/> Global directory configuration |
| Monitoring & Grafana | 1 | 4 VCore 8GB * 1 500GB (ssd) | 10.0.1.11 | Default port <br/> Global directory configuration |

> **Note:**
>
> The IP addresses of the instances are given as examples only. In your actual deployment, replace the IP addresses with your actual IP addresses.

### Topology templates

- [The simple template for the TiCDC topology](https://github.com/pingcap/docs/blob/master/config-templates/simple-cdc.yaml)
- [The complex template for the TiCDC topology](https://github.com/pingcap/docs/blob/master/config-templates/complex-cdc.yaml)

For detailed descriptions of the configuration items in the above TiDB cluster topology file, see [Topology Configuration File for Deploying TiDB Using TiUP](/tiup/tiup-cluster-topology-reference.md).

> **Note:**
>
> - You do not need to manually create the `tidb` user in the configuration file. The TiUP cluster component automatically creates the `tidb` user on the target machines. You can customize the user, or keep the user consistent with the control machine.
> - If you configure the deployment directory as a relative path, the cluster will be deployed in the home directory of the user.
