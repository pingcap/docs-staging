---
title: Use Restore Resource
summary: Learn how to use restore resource.
---

# 復元リソースを使用 {#use-restore-resource}

このドキュメントの`tidbcloud_restore`のリソースを使用して、復元タスクを作成する方法を学習できます。復元タスクは、バックアップに従って復元されたクラスターを作成します。

## 前提条件 {#prerequisites}

-   [TiDB Cloud Terraform プロバイダーを入手する](/tidb-cloud/terraform-get-tidbcloud-provider.md) .
-   バックアップと復元の機能は、サーバーレス層クラスターでは使用できません。復元リソースを使用するには、Dedicated Tier クラスターを作成済みであることを確認してください。

## 復元リソースを使用して復元タスクを作成する {#create-a-restore-task-with-the-restore-resource}

クラスターのバックアップを作成した後、 `tidbcloud_restore`のリソースで復元タスクを作成することにより、クラスターを復元できます。

> **ノート：**
>
> 小さいノード サイズから同じまたは大きいノード サイズにのみデータを復元できます。

1.  復元用のディレクトリを作成して入力します。

2.  `restore.tf`ファイルを作成します。

    例えば：

    ```
    terraform {
     required_providers {
       tidbcloud = {
         source = "tidbcloud/tidbcloud"
         version = "~> 0.1.0"
       }
     }
     required_version = ">= 1.0.0"
    }

    provider "tidbcloud" {
     public_key = "fake_public_key"
     private_key = "fake_private_key"
    }
    resource "tidbcloud_restore" "example_restore" {
      project_id = tidbcloud_cluster.example_cluster.project_id
      backup_id  = tidbcloud_backup.example_backup.id
      name       = "restoreCluster"
      config = {
        root_password = "Your_root_password1."
        port          = 4000
        components = {
          tidb = {
            node_size : "8C16G"
            node_quantity : 2
          }
          tikv = {
            node_size : "8C32G"
            storage_size_gib : 500
            node_quantity : 6
          }
          tiflash = {
            node_size : "8C64G"
            storage_size_gib : 500
            node_quantity : 2
          }
        }
      }
    }
    ```

3.  `terraform apply`コマンドを実行し、確認のために`yes`を入力します。

    ```
    $ terraform apply
    tidbcloud_cluster.example_cluster: Refreshing state... [id=1379661944630234067]
    tidbcloud_backup.example_backup: Refreshing state... [id=1350048]

    Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the following symbols:
      + create

    Terraform will perform the following actions:

      # tidbcloud_restore.example_restore will be created
      + resource "tidbcloud_restore" "example_restore" {
          + backup_id        = "1350048"
          + cluster          = {
              + id     = (known after apply)
              + name   = (known after apply)
              + status = (known after apply)
            }
          + cluster_id       = (known after apply)
          + config           = {
              + components    = {
                  + tidb    = {
                      + node_quantity = 2
                      + node_size     = "8C16G"
                    }
                  + tiflash = {
                      + node_quantity    = 2
                      + node_size        = "8C64G"
                      + storage_size_gib = 500
                    }
                  + tikv    = {
                      + node_quantity    = 6
                      + node_size        = "8C32G"
                      + storage_size_gib = 500
                    }
                }
              + port          = 4000
              + root_password = "Your_root_password1."
            }
          + create_timestamp = (known after apply)
          + error_message    = (known after apply)
          + id               = (known after apply)
          + name             = "restoreCluster"
          + project_id       = "1372813089189561287"
          + status           = (known after apply)
        }

    Plan: 1 to add, 0 to change, 0 to destroy.

    Do you want to perform these actions?
      Terraform will perform the actions described above.
      Only 'yes' will be accepted to approve.

      Enter a value: yes

    tidbcloud_restore.example_restore: Creating...
    tidbcloud_restore.example_restore: Creation complete after 1s [id=780114]

    Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
    ```

4.  `terraform state show tidbcloud_restore.${resource-name}`コマンドを使用して、復元タスクのステータスを確認します。

    ```
    $ terraform state show tidbcloud_restore.example_restore

    # tidbcloud_restore.example_restore:
    resource "tidbcloud_restore" "example_restore" {
        backup_id        = "1350048"
        cluster          = {
            id     = "1379661944630264072"
            name   = "restoreCluster"
            status = "INITIALIZING"
        }
        cluster_id       = "1379661944630234067"
        config           = {
            components    = {
                tidb    = {
                    node_quantity = 2
                    node_size     = "8C16G"
                }
                tiflash = {
                    node_quantity    = 2
                    node_size        = "8C64G"
                    storage_size_gib = 500
                }
                tikv    = {
                    node_quantity    = 6
                    node_size        = "8C32G"
                    storage_size_gib = 500
                }
            }
            port          = 4000
            root_password = "Your_root_password1."
        }
        create_timestamp = "2022-08-26T08:16:33Z"
        id               = "780114"
        name             = "restoreCluster"
        project_id       = "1372813089189561287"
        status           = "PENDING"
    }
    ```

    復元タスクのステータスが`PENDING`で、クラスターのステータスが`INITIALIZING`であることがわかります。

5.  数分待ちます。次に、 `terraform refersh`を使用してステータスを更新します。

6.  クラスターのステータスが`AVAILABLE`に変わった後、復元タスクは`RUNNING`になり、最後に`SUCCESS`になります。

復元されたクラスターは Terraform によって管理されないことに注意してください。復元されたクラスターを[それをインポートする](/tidb-cloud/terraform-use-cluster-resource.md#import-a-cluster)で管理できます。

## 復元タスクを削除する {#delete-a-restore-task}

復元タスクは削除できません。
