---
title: Integrate TiDB Cloud Serverless with Amazon Lambda Using AWS CloudFormation
summary: TiDB Cloud Serverless を Amazon Lambda および CloudFormation と統合する方法を段階的に紹介します。
---

# AWS CloudFormation を使用してTiDB Cloud Serverless を Amazon Lambda と統合する {#integrate-tidb-cloud-serverless-with-amazon-lambda-using-aws-cloudformation}

このドキュメントでは、 [AWS クラウドフォーメーション](https://aws.amazon.com/cloudformation/)使用して、クラウドネイティブの分散 SQL データベース[TiDB Cloudサーバーレス](https://www.pingcap.com/tidb-cloud/) 、サーバーレスでイベント駆動型のコンピューティングサービス[AWS ラムダ](https://aws.amazon.com/lambda/)と統合する方法について、ステップバイステップで説明します。TiDB TiDB Cloud Serverless を Amazon Lambda と統合することで、 TiDB Cloud Serverless と AWS Lambda を通じてマイクロサービスのスケーラビリティとコスト効率を活用できます。AWS CloudFormation は、Lambda関数、API Gateway、Secrets Manager などの AWS リソースの作成と管理を自動化します。

## ソリューションの概要 {#solution-overview}

このガイドでは、次のコンポーネントを使用して完全に機能するオンライン書店を作成します。

-   AWS Lambda 関数: Sequelize ORM と Fastify API フレームワークを使用して、 TiDB Cloud Serverless クラスターからのリクエストを処理し、データをクエリします。
-   AWS Secrets Manager SDK: TiDB Cloud Serverless クラスターの接続構成を取得および管理します。
-   AWS API Gateway: HTTP リクエストルートを処理します。
-   TiDB Cloud Serverless: クラウドネイティブの分散 SQL データベース。

AWS CloudFormation は、Secrets Manager、API Gateway、Lambda 関数など、プロジェクトに必要なリソースを作成するために使用されます。

書店プロジェクトの構造は次のとおりです。

![AWS Lambda structure overview](https://docs-download.pingcap.com/media/images/docs/develop/aws-lambda-structure-overview.png)

## 前提条件 {#prerequisites}

始める前に、次のものを用意してください。

-   次の AWS サービスにアクセスできる AWS アカウント:
    -   [AWS クラウドフォーメーション](https://aws.amazon.com/cloudformation/)
    -   [シークレットマネージャー](https://aws.amazon.com/secrets-manager/)
    -   [APIゲートウェイ](https://aws.amazon.com/api-gateway/)
    -   [ラムダサービス](https://aws.amazon.com/lambda/)
    -   [S3](https://aws.amazon.com/s3/)
    -   [IAMロール](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)

-   [TiDB Cloud](https://tidbcloud.com)アカウントとTiDB Cloud Serverless クラスター。TiDB TiDB Cloud Serverless クラスターの接続情報を取得します。

    ![TiDB Cloud connection information](https://docs-download.pingcap.com/media/images/docs/develop/aws-lambda-tidbcloud-connection-info.png)

-   [郵便配達員](https://www.postman.com/)や[カール](https://curl.se/)などの API テスト ツール。このドキュメントのほとんどの例では cURL を使用しています。Windows ユーザーの場合は、Postman をお勧めします。

-   プロジェクトの[最新リリースアセット](https://github.com/pingcap/TiDB-Lambda-integration/releases/latest)ローカル マシンにダウンロードします。これには、 `cloudformation_template.yml`と`cloudformation_template.json`ファイルが含まれます。

> **注記：**
>
> -   AWS リソースを作成するときは、クラスターのリージョンとして`us-east-1`使用することをお勧めします。これは、このデモの Lambda 関数コードがリージョンを`us-east-1`としてハードコードし、コードバンドルが`us-east-1`リージョンに保存されるためです。
> -   別のリージョンを使用する場合は、次の手順に従って Lambda 関数コードを変更し、再構築して、コードバンドルを独自の S3 バケットにアップロードする必要があります。

<details><summary><code>us-east-1</code>以外のリージョンを使用する場合は、Lambda関数コードを変更して再構築します。</summary>

クラスター リージョンとして`us-east-1`使用する場合は、このセクションをスキップして[ステップ 1: AWS CloudFormation を使用してプロジェクトをセットアップする](#step-1-set-up-the-bookshop-project-using-aws-cloudformation)に進みます。

AWS リソースを作成するために`us-east-1`以外の別の AWS リージョンを使用する場合は、Lambda 関数コードを変更して再構築し、コードバンドルを独自の S3 バケットにアップロードする必要があります。

ローカル開発環境の問題を回避するには、 [ギットポッド](https://www.gitpod.io/)などのクラウドネイティブ開発環境を使用することをお勧めします。

コードバンドルを再構築して独自の S3 バケットにアップロードするには、次の手順を実行します。

1.  開発環境を初期化します。

    -   [ギットポッド](https://gitpod.io/#/https://github.com/pingcap/TiDB-Lambda-integration)ワークスペースを開き、GitHub アカウントでログインします。

2.  Lambda 関数コードを変更します。

    1.  左側のサイドバーで`aws-lambda-cloudformation/src/secretManager.ts`ファイルを開きます。
    2.  22 行目を見つけて、 `region`変数を自分の地域に合わせて変更します。

3.  コード バンドルを再構築します。

    1.  依存関係をインストールします。

        1.  Gitpod でターミナルを開きます。

        2.  作業ディレクトリを入力してください:

            ```shell
            cd aws-lambda-cloudformation
            ```

        3.  依存関係をインストールします:

            ```shell
            yarn
            ```

    2.  コード バンドルを再構築します。

        1.  コードバンドルをビルドします。

            ```shell
            yarn build
            ```

        2.  `aws-lambda-cloudformation/dist/index.zip`ファイルを確認してください。

        3.  `index.zip`ファイルを右クリックし、 **[ダウンロード]**を選択します。

4.  再構築されたコードバンドルを独自の S3 バケットにアップロードします。

    1.  AWS マネジメントコンソールの[S3 サービス](https://console.aws.amazon.com/s3)にアクセスします。
    2.  選択したリージョンに新しいバケットを作成します。
    3.  `index.zip`ファイルをバケットにアップロードします。
    4.  後で使用するために、S3 バケット名とリージョンを書き留めておきます。

</details>

## ステップ 1. AWS CloudFormation を使用してブックショップ プロジェクトをセットアップする {#step-1-set-up-the-bookshop-project-using-aws-cloudformation}

AWS CloudFormation を使用してブックショップ プロジェクトを設定するには、次の手順を実行します。

1.  AWS マネジメントコンソールに移動し、 [AWS CloudFormation サービス](https://console.aws.amazon.com/cloudformation)にアクセスします。
2.  **[スタックの作成]** &gt; **[新しいリソースを使用 (標準)]**をクリックします。
3.  **「スタックの作成」**ページで、スタック作成プロセスを完了します。

    1.  **前提条件**領域で、**既存のテンプレートを選択**を選択します。

    2.  **[テンプレートの指定]**領域で、 **[テンプレート ファイルのアップロード]**を選択し、 **[ファイルの選択]**をクリックしてテンプレート ファイル (YAML または JSON) をアップロードし、 **[次へ**] をクリックします。

        ファイルがまだない場合は、 [GitHub](https://github.com/pingcap/TiDB-Lambda-integration/releases/latest)からダウンロードしてください。ファイルには、プロジェクトに必要なリソースを作成する AWS CloudFormation テンプレートが含まれています。

        ![Create a stack](https://docs-download.pingcap.com/media/images/docs/develop/aws-lambda-cf-create-stack.png)

    3.  スタックの詳細を指定します。

        -   クラスター リージョンとして`us-east-1`使用する場合は、次のスクリーンショットのようにフィールドに入力します。

            ![Specify AWS Lambda stack details](https://docs-download.pingcap.com/media/images/docs/develop/aws-lambda-cf-stack-config.png)

            -   **スタック名**: スタック名を入力します。
            -   **S3Bucket** : zip ファイルを保存する S3 バケットを入力します。
            -   **S3Key** : S3 キーを入力します。
            -   **TiDBDatabase** : TiDB Cloudクラスター名を入力します。
            -   **TiDBHost** : TiDB Cloudデータベース アクセス用のホスト URL を入力します。2 と入力します`localhost`
            -   **TiDBPassword** : TiDB Cloudデータベース アクセス用のパスワードを入力します。
            -   **TiDBPort** : TiDB Cloudデータベース アクセス用のポートを入力します。
            -   **TiDBUser** : TiDB Cloudデータベース アクセスのユーザー名を入力します。

        -   `us-east-1`以外の別の AWS リージョンを使用する場合は、次の手順に従ってください。

            1.  [`us-east-1`以外のリージョンを使用する場合は、Lambda関数コードを変更して再構築します。](#prerequisites)を参照して Lambda 関数コードを変更し、再構築して、コードバンドルを独自の S3 バケットにアップロードします。
            2.  スタックの詳細フィールドで、独自の設定に応じて、 `S3Bucket`と`S3Key`のパラメータに S3 バケット名とリージョンを指定します。
            3.  前のスクリーンショットのように他のフィールドに入力します。

    4.  スタック オプションを構成します。デフォルトの構成を使用できます。

        ![Configure stack options](https://docs-download.pingcap.com/media/images/docs/develop/aws-lambda-cf-stack-config-option.png)

    5.  スタックを確認して作成します。

        ![Review and create the stack](https://docs-download.pingcap.com/media/images/docs/develop/aws-lambda-cf-stack-config-review.png)

## ステップ2. 書店プロジェクトを使用する {#step-2-use-the-bookshop-project}

スタックが作成されたら、次のようにプロジェクトを使用できます。

1.  AWS マネジメントコンソールの[APIゲートウェイサービス](https://console.aws.amazon.com/apigateway)アクセスし、 `TiDBCloudApiGatewayV2` API をクリックして、左側のペインで**API: TiDBCloudApiGatewayV2**をクリックします。

2.  **概要**ページから`Invoke URL`をコピーします。この URL は API エンドポイントとして機能します。

    ![API Gateway Invoke URL](https://docs-download.pingcap.com/media/images/docs/develop/aws-lambda-get-apigateway-invoke-url.png)

3.  API をテストするには、Postman や cURL などの API テスト ツールを使用してください。

    -   模擬本を初期化します:

        ```shell
        curl -X POST -H "Content-Type: application/json" -d '{"count":100}' https://<your-api-endpoint>/book/init
        ```

    -   すべての書籍を入手:

        ```shell
        curl https://<your-api-endpoint>/book
        ```

    -   書籍IDで書籍を入手:

        ```shell
        curl https://<your-api-endpoint>/book/<book-id>
        ```

    -   本を作成する:

        ```shell
        curl -X POST -H "Content-Type: application/json" -d '{ "title": "Book Title", "type": "Test", "publishAt": "2022-12-15T21:01:49.000Z", "stock": 123, "price": 12.34, "authors": "Test Test" }' https://  <your-api-endpoint>/book
        ```

    -   本を更新する:

        ```shell
        curl -X PUT -H "Content-Type: application/json" -d '{ "title": "Book Title(updated)" }' https://<your-api-endpoint>/book/<book-id>
        ```

    -   本を削除する:

        ```shell
        curl -X DELETE https://<your-api-endpoint>/book/<book-id>
        ```

## ステップ3. リソースをクリーンアップする {#step-3-clean-up-resources}

不要な料金を回避するには、作成されたすべてのリソースをクリーンアップします。

1.  [AWS マネジメントコンソール](https://console.aws.amazon.com/cloudformation)にアクセスします。
2.  作成した AWS CloudFormation スタックを削除します。
