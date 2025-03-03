---
title: Encryption at Rest Using Customer-Managed Encryption Keys
summary: TiDB Cloudで顧客管理暗号化キー (CMEK) を使用する方法について説明します。
---

# 顧客管理の暗号化キーを使用した保存時の暗号化 {#encryption-at-rest-using-customer-managed-encryption-keys}

顧客管理の暗号化キー (CMEK) を使用すると、完全に制御できる対称暗号化キーを使用して、 TiDB Cloud Dedicated クラスター内の静的データを保護できます。このキーは CMEK キーと呼ばれます。

プロジェクトで CMEK を有効にすると、そのプロジェクト内で作成されたすべてのクラスターは、CMEK キーを使用して静的データを暗号化します。さらに、これらのクラスターによって生成されたバックアップ データも同じキーを使用して暗号化されます。CMEK が有効になっていない場合、 TiDB Cloud はエスクロー キーを使用して、保存されているクラスター内のすべてのデータを暗号化します。

> **注記：**
>
> 現在、この機能はリクエストに応じてのみ利用可能です。この機能を試す必要がある場合は、 [サポート](/tidb-cloud/tidb-cloud-support.md)にお問い合わせください。

## 制限 {#restrictions}

-   現在、 TiDB Cloud はCMEK を提供するために AWS KMS の使用のみをサポートしています。
-   CMEK を使用するには、プロジェクトの作成時に CMEK を有効にし、クラスタを作成する前に CMEK 関連の構成を完了する必要があります。既存のプロジェクトに対して CMEK を有効にすることはできません。
-   現在、CMEK 対応プロジェクトでは、AWS でホストされる[TiDB Cloud専用](/tidb-cloud/select-cluster-tier.md#tidb-cloud-dedicated)クラスタのみを作成できます。Google Cloud でホストされるTiDB Cloud Dedicated クラスタと[TiDB Cloudサーバーレス](/tidb-cloud/select-cluster-tier.md#tidb-cloud-serverless)クラスタはサポートされていません。
-   現在、特定のプロジェクトでは、1 つの AWS リージョンに対してのみ CMEK を有効にできます。一度設定すると、同じプロジェクト内の他のリージョンにクラスターを作成することはできません。

## CMEKを有効にする {#enable-cmek}

アカウントが所有する KMS を使用してデータを暗号化する場合は、次の手順を実行します。

### ステップ 1. CMEK 対応プロジェクトを作成する {#step-1-create-a-cmek-enabled-project}

組織で`Organization Owner`のロールを担っている場合は、 TiDB Cloudコンソールまたは API を使用して CMEK 対応プロジェクトを作成できます。

<SimpleTab groupId="method">
<div label="Use Console" value="console">

CMEK 対応プロジェクトを作成するには、次の手順を実行します。

1.  クリック<mdsvgicon name="icon-top-organization">TiDB Cloudコンソールの左下隅にあります。</mdsvgicon>
2.  **[組織設定] を**クリックし、左側のナビゲーション ペインで**[プロジェクト]**タブをクリックします。 **[プロジェクト]**タブが表示されます。
3.  **「新しいプロジェクトの作成」**をクリックして、プロジェクト作成ダイアログを開きます。
4.  プロジェクト名を入力してください。
5.  プロジェクトの CMEK 機能を有効にすることを選択します。
6.  **「確認」**をクリックしてプロジェクトの作成を完了します。

</div>
<div label="Use API" value="api">

この手順は、 [CMEK対応プロジェクトを作成する](https://docs.pingcap.com/tidbcloud/api/v1beta#tag/Project/operation/CreateProject)エンドポイントを介してTiDB Cloud API を使用して完了できます。 `aws_cmek_enabled`フィールドが`true`に設定されていることを確認してください。

現在、 TiDB Cloud API はまだベータ版です。詳細については、 [TiDB CloudAPI ドキュメント](https://docs.pingcap.com/tidbcloud/api/v1beta)参照してください。

</div>
</SimpleTab>

### ステップ2. プロジェクトのCMEK構成を完了する {#step-2-complete-the-cmek-configuration-of-the-project}

TiDB Cloudコンソールまたは API を使用して、プロジェクトの CMEK 構成を完了できます。

> **注記：**
>
> キーのポリシーが要件を満たしており、権限不足やアカウントの問題などのエラーがないことを確認してください。これらのエラーにより、このキーを使用してクラスターが誤って作成される可能性があります。

<SimpleTab groupId="method">
<div label="Use Console" value="console">

プロジェクトの CMEK 構成を完了するには、次の手順を実行します。

1.  クリック<mdsvgicon name="icon-left-projects">左下隅で、複数のプロジェクトがある場合は対象プロジェクトに切り替えて、 **[プロジェクト設定]**をクリックします。</mdsvgicon>
2.  **「暗号化アクセス」**をクリックして、プロジェクトの暗号化管理ページに入ります。
3.  **「暗号化キーの作成」**をクリックして、キー作成ページに入ります。
4.  キープロバイダーは AWS KMS のみをサポートします。暗号化キーを使用できるリージョンを選択できます。
5.  JSON ファイルをコピーして`ROLE-TRUST-POLICY.JSON`として保存します。このファイルは信頼関係を記述します。
6.  この信頼関係を AWS KMS のキーポリシーに追加します。詳細については、 [AWS KMS のキーポリシー](https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html)を参照してください。
7.  TiDB Cloudコンソールで、キー作成ページの一番下までスクロールし、AWS KMS から取得した**KMS キー ARN**を入力します。
8.  キーを作成するには、 **[作成]**をクリックします。

</div>
<div label="Use API" value="api">

1.  AWS KMS でキーポリシーを設定し、キーポリシーに次の情報を追加します。

    ```json
    {
        "Version": "2012-10-17",
        "Id": "cmek-policy",
        "Statement": [
            // EBS-related policy
            {
                "Sid": "Allow access through EBS for all principals in the account that are authorized to use EBS",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "*"
                },
                "Action": [
                    "kms:Encrypt",
                    "kms:Decrypt",
                    "kms:ReEncrypt*",
                    "kms:GenerateDataKey*",
                    "kms:CreateGrant",
                    "kms:DescribeKey"
                ],
                "Resource": "*",
                "Condition": {
                    "StringEquals": {
                        "kms:CallerAccount": "<pingcap-account>",
                        "kms:ViaService": "ec2.<region>.amazonaws.com"
                    }
                }
            },
            // S3-related policy
            {
                "Sid": "Allow TiDB cloud role to use KMS to store encrypted backup to S3",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "arn:aws:iam::<pingcap-account>:root"
                },
                "Action": [
                    "kms:Decrypt",
                    "kms:GenerateDataKey"
                ],
                "Resource": "*"
            },
            ... // user's own admin access to KMS
        ]
    }
    ```

    -   `<pingcap-account>`クラスターが実行されるアカウントです。アカウントがわからない場合は、 [TiDB Cloudサポート](/tidb-cloud/tidb-cloud-support.md)お問い合わせください。
    -   `<region>`はクラスターを作成するリージョンです (例: `us-west-2` )。リージョンを指定しない場合は、 `<region>`ワイルドカード`*`に置き換えて、 `StringLike`ブロックに配置します。
    -   前のブロックのEBS関連のポリシーについては、 [AWS ドキュメント](https://docs.aws.amazon.com/kms/latest/developerguide/conditions-kms.html#conditions-kms-caller-account)を参照してください。
    -   前のブロックの S3 関連のポリシーについては、 [AWS ブログ](https://repost.aws/knowledge-center/s3-bucket-access-default-encryption)を参照してください。

2.  TiDB Cloud API の[AWS CMEK を構成する](https://docs.pingcap.com/tidbcloud/api/v1beta#tag/Cluster/operation/CreateAwsCmek)のエンドポイントを呼び出します。

    現在、 TiDB Cloud API はまだベータ版です。詳細については、 [TiDB CloudAPI ドキュメント](https://docs.pingcap.com/tidbcloud/api/v1beta)参照してください。

</div>
</SimpleTab>

> **注記：**
>
> この機能は今後さらに強化され、今後の機能には追加の権限が必要になる可能性があります。そのため、このポリシー要件は変更される可能性があります。

### ステップ3. クラスターを作成する {#step-3-create-a-cluster}

[ステップ1](#step-1-create-a-cmek-enabled-project)で作成したプロジェクトの下に、AWS でホストされるTiDB Cloud Dedicated クラスターを作成します。詳細な手順については、 [この文書](/tidb-cloud/create-tidb-cluster.md)を参照してください。クラスターが配置されているリージョンが[ステップ2](/tidb-cloud/tidb-cloud-encrypt-cmek.md#step-2-complete-the-cmek-configuration-of-the-project)と同じであることを確認します。

> **注記：**
>
> CMEK を有効にすると、クラスターのノードで使用される EBS ボリュームとクラスターのバックアップに使用される S3 が CMEK を使用して暗号化されます。

## CMEKを回転させる {#rotate-cmek}

AWS KMS で[自動CMEKローテーション](http://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html)設定できます。このローテーションを有効にすると、CMEK ID を含むTiDB Cloudのプロジェクト設定で**暗号化アクセス**を更新する必要はありません。

## CMEK の取り消しと復元 {#revoke-and-restore-cmek}

TiDB Cloud の CMEK へのアクセスを一時的に取り消す必要がある場合は、次の手順に従います。

1.  AWS KMS コンソールで、対応する権限を取り消し、KMS キーポリシーを更新します。
2.  TiDB Cloudコンソールで、プロジェクト内のすべてのクラスターを一時停止します。

> **注記：**
>
> AWS KMS で CMEK を取り消しても、実行中のクラスターは影響を受けません。ただし、クラスターを一時停止してから復元すると、クラスターは CMEK にアクセスできないため、正常に復元できなくなります。

TiDB Cloud の CMEK へのアクセスを取り消した後、アクセスを復元する必要がある場合は、次の手順に従います。

1.  AWS KMS コンソールで、CMEK アクセスポリシーを復元します。
2.  TiDB Cloudコンソールで、プロジェクト内のすべてのクラスターを復元します。
