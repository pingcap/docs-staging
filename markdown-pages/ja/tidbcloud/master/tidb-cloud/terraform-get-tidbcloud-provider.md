---
title: Get TiDB Cloud Terraform Provider
summary: Learn how to get TiDB Cloud Terraform Provider.
---

# TiDB Cloud Terraform プロバイダーを入手する {#get-tidb-cloud-terraform-provider}

このドキュメントでは、 TiDB Cloud Terraform プロバイダーを取得する方法を学習します。

## 前提条件 {#prerequisites}

[TiDB Cloud Terraform プロバイダーの概要](/tidb-cloud/terraform-tidbcloud-provider-overview.md#requirements)の要件が満たされていることを確認します。

## ステップ 1.Terraform をインストールする {#step-1-install-terraform}

TiDB Cloud Terraform Provider が[Terraform レジストリ](https://registry.terraform.io/)にリリースされました。 Terraform (&gt;=1.0) をインストールするだけです。

macOS の場合、次の手順に従って、Homebrew で Terraform をインストールできます。

1.  必要なすべての Homebrew パッケージを含むリポジトリである HashiCorp タップをインストールします。

    ```shell
    brew tap hashicorp/tap
    ```

2.  `hashicorp/tap/terraform`で Terraform をインストールします。

    ```shell
    brew install hashicorp/tap/terraform
    ```

その他のオペレーティング システムについては、手順について[Terraform ドキュメント](https://learn.hashicorp.com/tutorials/terraform/install-cli)を参照してください。

## ステップ 2. API キーを作成する {#step-2-create-an-api-key}

TiDB Cloud API は HTTP ダイジェスト認証を使用します。秘密鍵がネットワーク経由で送信されるのを防ぎます。

現在、 TiDB Cloud Terraform Provider は API キーの管理をサポートしていません。したがって、 [TiDB Cloudコンソール](https://tidbcloud.com/console/clusters)で API キーを作成する必要があります。

詳細な手順については、 [TiDB CloudAPI ドキュメント](https://docs.pingcap.com/tidbcloud/api/v1beta#section/Authentication/API-Key-Management)を参照してください。

## ステップTiDB Cloud Terraform プロバイダーをダウンロードする {#step-3-download-tidb-cloud-terraform-provider}

1.  `main.tf`ファイルを作成します。

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
    ```

    -   `source`属性は、 [Terraform レジストリ](https://registry.terraform.io/)からダウンロードされるターゲット Terraform プロバイダーを指定します。
    -   `version`属性はオプションで、Terraform プロバイダーのバージョンを指定します。指定しない場合、デフォルトで最新のプロバイダー バージョンが使用されます。
    -   `required_version`はオプションで、Terraform のバージョンを指定します。指定しない場合、デフォルトで最新の Terraform バージョンが使用されます。

2.  `terraform init`コマンドを実行して、Terraform Registry からTiDB Cloud Terraform Provider をダウンロードします。

    ```
    $ terraform init

    Initializing the backend...

    Initializing provider plugins...
    - Reusing previous version of tidbcloud/tidbcloud from the dependency lock file
    - Using previously-installed tidbcloud/tidbcloud v0.1.0

    Terraform has been successfully initialized!

    You may now begin working with Terraform. Try running "terraform plan" to see
    any changes that are required for your infrastructure. All Terraform commands
    should now work.

    If you ever set or change modules or backend configuration for Terraform,
    rerun this command to reinitialize your working directory. If you forget, other
    commands will detect it and remind you to do so if necessary.
    ```

## ステップ 4. API キーを使用してTiDB Cloud Terraform プロバイダーを構成する {#step-4-configure-tidb-cloud-terraform-provider-with-the-api-key}

次のように`main.tf`のファイルを構成できます。

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
```

`public_key`と`private_key`は API キーの公開鍵と秘密鍵です。環境変数を介して渡すこともできます。

```
export TIDBCLOUD_PUBLIC_KEY = ${public_key}
export TIDBCLOUD_PRIVATE_KEY = ${private_key}
```

これで、 TiDB Cloud Terraform プロバイダーを使用できるようになりました。

## 次のステップ {#next-step}

[クラスタ リソース](/tidb-cloud/terraform-use-cluster-resource.md)でクラスターを管理することから始めます。
