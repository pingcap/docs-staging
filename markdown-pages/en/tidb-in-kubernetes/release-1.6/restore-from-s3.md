---
title: Restore Data from S3-Compatible Storage Using TiDB Lightning (Helm)
summary: Learn how to restore data from the S3-compatible storage.
---

# Restore Data from S3-Compatible Storage Using TiDB Lightning (Helm)

> **Warning:**
>
> The Helm deployment method described in this document is deprecated. It is recommended to use the [Job method](restore-from-s3-using-job.md) for data restore operations.

This document describes how to restore the TiDB cluster data backed up using TiDB Operator on Kubernetes.

The restore method described in this document is implemented based on CustomResourceDefinition (CRD) in TiDB Operator v1.1 or later versions. For the underlying implementation, [TiDB Lightning TiDB-backend](https://docs.pingcap.com/tidb/stable/tidb-lightning-backends#tidb-lightning-tidb-backend) is used to perform the restore.

TiDB Lightning is a tool used for fast full import of large amounts of data into a TiDB cluster. It reads data from local disks, Google Cloud Storage (GCS) or Amazon S3. TiDB Lightning supports three backends: `Importer-backend`, `Local-backend`, and `TiDB-backend`. In this document, `TiDB-backend` is used. For the differences of these backends and how to choose backends, see [TiDB Lightning Backends](https://docs.pingcap.com/tidb/stable/tidb-lightning-backends). To import data using `Importer-backend` or `Local-backend`, see [Import Data](restore-data-using-tidb-lightning.md).

This document shows an example in which the backup data stored in the specified path on the S3-compatible storage is restored to the TiDB cluster.

## Usage scenarios

You can use the restore solution introduced in this document if you need to export the backup data from S3 to a TiDB cluster, with the following requirements:

- To restore data with lower resource usage and lower network bandwidth usage. A restore speed of 50 GB/h is acceptable.
- To import data into the cluster with ACID compliance.
- The TiDB cluster can still provide services during the restore process.

## Prerequisites

Before you perform the data restore, you need to prepare the restore environment and get the required database account privileges.

### Prepare the restore environment

1. Download [`backup-rbac.yaml`](<https://github.com/pingcap/tidb-operator/blob/v1.6.3/manifests/backup/backup-rbac.yaml>) and execute the following command to create the role-based access control (RBAC) resources in the `test2` namespace:

    
    ```shell
    kubectl apply -f backup-rbac.yaml -n test2
    ```

2. Grant permissions to the remote storage.

    To grant permissions to access S3-compatible remote storage, refer to [AWS account permissions](grant-permissions-to-remote-storage.md#aws-account-permissions).

    If you use Ceph as the backend storage for testing, you can grant permissions by [using AccessKey and SecretKey](grant-permissions-to-remote-storage.md#grant-permissions-by-accesskey-and-secretkey).

3. Create the `restore-demo2-tidb-secret` secret which stores the root account and password needed to access the TiDB cluster:

    
    ```shell
    kubectl create secret generic restore-demo2-tidb-secret --from-literal=password=${password} --namespace=test2
    ```

### Get the required database account privileges

Before you use TiDB Lightning to restore the backup data in S3 to the TiDB cluster, make sure that you have the following database account privileges:

| Privileges | Scope |
|:----|:------|
| SELECT | Tables |
| INSERT | Tables |
| UPDATE | Tables |
| DELETE | Tables |
| CREATE | Databases, tables |
| DROP | Databases, tables |
| ALTER | Tables |

## Restore process

> **Note:**
>
> Because of the `rclone` [issue](https://rclone.org/s3/#key-management-system-kms), if the backup data is stored in Amazon S3 and the `AWS-KMS` encryption is enabled, you need to add the following `spec.s3.options` configuration to the YAML file in the examples of this section:
>
> ```yaml
> spec:
>   ...
>   s3:
>     ...
>     options:
>     - --ignore-checksum
> ```

This section lists multiple storage access methods. Only follow the method that matches your situation. The methods are as follows:

- Amazon S3 by importing AccessKey and SecretKey
- Ceph by importing AccessKey and SecretKey
- Amazon S3 by binding IAM with Pod
- Amazon S3 by binding IAM with ServiceAccount

1. Create Restore customer resource (CR) and restore the specified backup data to the TiDB cluster.

    + Method 1: Create the `Restore` CR, and restore the cluster data from Ceph by importing AccessKey and SecretKey to grant permissions:

        
        ```shell
        kubectl apply -f restore.yaml
        ```

        The content of `restore.yaml` is as follows:

        ```yaml
        ---
        apiVersion: pingcap.com/v1alpha1
        kind: Restore
        metadata:
          name: demo2-restore
          namespace: test2
        spec:
          backupType: full
          to:
            host: ${tidb_host}
            port: ${tidb_port}
            user: ${tidb_user}
            secretName: restore-demo2-tidb-secret
          s3:
            provider: ceph
            endpoint: ${endpoint}
            secretName: s3-secret
            path: s3://${backup_path}
          # storageClassName: local-storage
          storageSize: 1Gi
        ```

    + Method 2: Create the `Restore` CR, and restore the cluster data from Amazon S3 by importing AccessKey and SecretKey to grant permissions:

        
        ```shell
        kubectl apply -f restore.yaml
        ```

        The `restore.yaml` file has the following content:

        ```yaml
        ---
        apiVersion: pingcap.com/v1alpha1
        kind: Restore
        metadata:
          name: demo2-restore
          namespace: test2
        spec:
          backupType: full
          to:
            host: ${tidb_host}
            port: ${tidb_port}
            user: ${tidb_user}
            secretName: restore-demo2-tidb-secret
          s3:
            provider: aws
            region: ${region}
            secretName: s3-secret
            path: s3://${backup_path}
          # storageClassName: local-storage
          storageSize: 1Gi
        ```

    + Method 3: Create the `Restore` CR, and restore the cluster data from Amazon S3 by binding IAM with Pod to grant permissions:

        
        ```shell
        kubectl apply -f restore.yaml
        ```

        The content of `restore.yaml` is as follows:

        ```yaml
        ---
        apiVersion: pingcap.com/v1alpha1
        kind: Restore
        metadata:
          name: demo2-restore
          namespace: test2
          annotations:
            iam.amazonaws.com/role: arn:aws:iam::123456789012:role/user
        spec:
          backupType: full
          to:
            host: ${tidb_host}
            port: ${tidb_port}
            user: ${tidb_user}
            secretName: restore-demo2-tidb-secret
          s3:
            provider: aws
            region: ${region}
            path: s3://${backup_path}
          # storageClassName: local-storage
          storageSize: 1Gi
        ```

    + Method 4: Create the `Restore` CR, and restore the cluster data from Amazon S3 by binding IAM with ServiceAccount to grant permissions:

        
        ```shell
        kubectl apply -f restore.yaml
        ```

        The content of `restore.yaml` is as follows:

        ```yaml
        ---
        apiVersion: pingcap.com/v1alpha1
        kind: Restore
        metadata:
          name: demo2-restore
          namespace: test2
        spec:
          backupType: full
          serviceAccount: tidb-backup-manager
          to:
            host: ${tidb_host}
            port: ${tidb_port}
            user: ${tidb_user}
            secretName: restore-demo2-tidb-secret
          s3:
            provider: aws
            region: ${region}
            path: s3://${backup_path}
          # storageClassName: local-storage
          storageSize: 1Gi
        ```

2. After creating the `Restore` CR, execute the following command to check the restore status:

    
    ```shell
    kubectl get rt -n test2 -owide
    ```

The example above restores data from the `spec.s3.path` path on S3-compatible storage to the `spec.to.host` TiDB cluster. For more information about S3-compatible storage configuration, refer to [S3 storage fields](backup-restore-cr.md#s3-storage-fields).

For more information about the `Restore` CR fields, refer to [Restore CR fields](backup-restore-cr.md#restore-cr-fields).

> **Note:**
>
> TiDB Operator creates a PVC for data recovery. The backup data is downloaded from the remote storage to the PV first, and then restored. If you want to delete this PVC after the recovery is completed, you can refer to [Delete Resource](cheat-sheet.md#delete-resources) to delete the recovery Pod first, and then delete the PVC.

## Troubleshooting

If you encounter any problem during the restore process, refer to [Common Deployment Failures](deploy-failures.md).
