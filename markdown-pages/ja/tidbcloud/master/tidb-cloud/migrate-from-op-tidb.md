---
title: Migrate from TiDB Self-Managed to TiDB Cloud
summary: TiDB Self-Managed からTiDB Cloudにデータを移行する方法を学びます。
---

# TiDBセルフマネージドからTiDB Cloudへの移行 {#migrate-from-tidb-self-managed-to-tidb-cloud}

このドキュメントでは、 Dumplingと TiCDC を介して TiDB セルフマネージド クラスターからTiDB Cloud (AWS) にデータを移行する方法について説明します。

全体的な手順は次のとおりです。

1.  環境を構築し、ツールを準備します。
2.  完全なデータを移行します。プロセスは次のとおりです。
    1.  Dumplingを使用して、TiDB Self-Managed から Amazon S3 にデータをエクスポートします。
    2.  Amazon S3 からTiDB Cloudにデータをインポートします。
3.  TiCDC を使用して増分データを複製します。
4.  移行したデータを確認します。

## 前提条件 {#prerequisites}

S3 バケットとTiDB Cloudクラスターを同じリージョンに配置することをお勧めします。リージョン間の移行では、データ変換に追加コストが発生する可能性があります。

移行する前に、次のものを準備する必要があります。

-   管理者アクセス権を持つ[AWS アカウント](https://docs.aws.amazon.com/AmazonS3/latest/userguide/setting-up-s3.html#sign-up-for-aws-gsg)
-   [AWS S3 バケット](https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html)個
-   AWS でホストされているターゲットTiDB Cloudクラスターへのアクセス権が少なくとも[`Project Data Access Read-Write`](/tidb-cloud/manage-user-access.md#user-roles)つある[TiDB Cloudアカウント](/tidb-cloud/tidb-cloud-quickstart.md)

## ツールを準備する {#prepare-tools}

以下のツールを準備する必要があります。

-   Dumpling: データエクスポートツール
-   TiCDC: データ複製ツール

### Dumpling {#dumpling}

[Dumpling](https://docs.pingcap.com/tidb/dev/dumpling-overview) 、TiDB または MySQL から SQL または CSV ファイルにデータをエクスポートするツールです。Dumplingを使用すると、TiDB Self-Managed から完全なデータをエクスポートできます。

Dumplingをデプロイする前に、次の点に注意してください。

-   TiDB Cloudの TiDB クラスターと同じ VPC 内の新しい EC2 インスタンスにDumplingをデプロイすることをお勧めします。
-   推奨される EC2 インスタンスタイプは**c6g.4xlarge** (16 vCPU および 32 GiBメモリ) です。ニーズに応じて他の EC2 インスタンスタイプを選択することもできます。Amazon マシンイメージ (AMI) は、Amazon Linux、Ubuntu、または Red Hat にすることができます。

Dumpling は、 TiUPまたはインストール パッケージを使用して展開できます。

#### TiUPを使用してDumplingをデプロイ {#deploy-dumpling-using-tiup}

[TiUP](https://docs.pingcap.com/tidb/stable/tiup-overview)使用してDumplingを展開します：

```bash
## Deploy TiUP
curl --proto '=https' --tlsv1.2 -sSf https://tiup-mirrors.pingcap.com/install.sh | sh
source /root/.bash_profile
## Deploy Dumpling and update to the latest version
tiup install dumpling
tiup update --self && tiup update dumpling
```

#### インストールパッケージを使用してDumplingをデプロイ {#deploy-dumpling-using-the-installation-package}

インストール パッケージを使用してDumplingを展開するには:

1.  [ツールキットパッケージ](https://docs.pingcap.com/tidb/stable/download-ecosystem-tools)ダウンロードしてください。

2.  それをターゲットマシンに解凍します。 `tiup install dumpling`実行すると、 TiUPを使用してDumpling を取得できます。その後、 `tiup dumpling ...`使用してDumpling を実行できます。詳細については、 [Dumplingの紹介](https://docs.pingcap.com/tidb/stable/dumpling-overview#dumpling-introduction)参照してください。

#### Dumplingの権限を設定する {#configure-privileges-for-dumpling}

アップストリーム データベースからデータをエクスポートするには、次の権限が必要です。

-   選択
-   リロード
-   ロックテーブル
-   レプリケーションクライアント
-   プロセス

### TiCDCをデプロイ {#deploy-ticdc}

アップストリーム TiDB クラスターからTiDB Cloudに増分データを複製するには、 [TiCDCを展開する](https://docs.pingcap.com/tidb/dev/deploy-ticdc)が必要です。

1.  現在の TiDB バージョンが TiCDC をサポートしているかどうかを確認します。TiDB v4.0.8.rc.1 以降のバージョンは TiCDC をサポートしています。TiDB クラスターで`select tidb_version();`実行すると、TiDB バージョンを確認できます。アップグレードが必要な場合は[TiUPを使用して TiDB をアップグレードする](https://docs.pingcap.com/tidb/dev/deploy-ticdc#upgrade-ticdc-using-tiup)参照してください。

2.  TiCDCコンポーネントを TiDB クラスターに追加します。1 を参照してください[TiUPを使用して既存の TiDB クラスターに TiCDC を追加またはスケールアウトする](https://docs.pingcap.com/tidb/dev/deploy-ticdc#add-or-scale-out-ticdc-to-an-existing-tidb-cluster-using-tiup) `scale-out.yml`を編集して TiCDC を追加します。

    ```yaml
    cdc_servers:
    - host: 10.0.1.3
      gc-ttl: 86400
      data_dir: /tidb-data/cdc-8300
    - host: 10.0.1.4
      gc-ttl: 86400
      data_dir: /tidb-data/cdc-8300
    ```

3.  TiCDCコンポーネントを追加し、ステータスを確認します。

    ```shell
    tiup cluster scale-out <cluster-name> scale-out.yml
    tiup cluster display <cluster-name>
    ```

## 全データを移行 {#migrate-full-data}

TiDB Self-Managed クラスターからTiDB Cloudにデータを移行するには、次のようにして完全なデータ移行を実行します。

1.  TiDB セルフマネージド クラスターから Amazon S3 にデータを移行します。
2.  Amazon S3 からTiDB Cloudにデータを移行します。

### TiDB セルフマネージド クラスターから Amazon S3 にデータを移行する {#migrate-data-from-the-tidb-self-managed-cluster-to-amazon-s3}

Dumplingを使用して、TiDB セルフマネージド クラスターから Amazon S3 にデータを移行する必要があります。

TiDB クラスターがローカル IDC 内にある場合、またはDumplingサーバーと Amazon S3 間のネットワークが接続されていない場合は、最初にファイルをローカルstorageにエクスポートし、後で Amazon S3 にアップロードすることができます。

#### ステップ1.上流のTiDBセルフマネージドクラスタのGCメカニズムを一時的に無効にする {#step-1-disable-the-gc-mechanism-of-the-upstream-tidb-self-managed-cluster-temporarily}

増分移行中に新しく書き込まれたデータが失われないようにするには、移行を開始する前にアップストリーム クラスターのガベージコレクション(GC) メカニズムを無効にして、システムが履歴データをクリーンアップしないようにする必要があります。

設定が成功したかどうかを確認するには、次のコマンドを実行します。

```sql
SET GLOBAL tidb_gc_enable = FALSE;
```

以下は出力例です`0`無効であることを示します。

```sql
SELECT @@global.tidb_gc_enable;
+-------------------------+
| @@global.tidb_gc_enable |
+-------------------------+
|                       0 |
+-------------------------+
1 row in set (0.01 sec)
```

#### ステップ 2. Dumplingの Amazon S3 バケットへのアクセス権限を設定する {#step-2-configure-access-permissions-to-the-amazon-s3-bucket-for-dumpling}

AWS コンソールでアクセスキーを作成します。詳細は[アクセスキーを作成する](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)参照してください。

1.  AWS アカウント ID またはアカウントエイリアス、 IAMユーザー名、およびパスワードを使用して[IAMコンソール](https://console.aws.amazon.com/iam/home#/security_credentials)にサインインします。

2.  右上のナビゲーション バーでユーザー名を選択し、 **[Security資格情報]**をクリックします。

3.  アクセス キーを作成するには、 **[アクセス キーの作成]**をクリックします。次に、 **[.csv ファイルのダウンロード]**を選択して、アクセス キー ID とシークレット アクセス キーをコンピューター上の CSV ファイルに保存します。ファイルは安全な場所に保存してください。このダイアログ ボックスを閉じると、シークレット アクセス キーに再度アクセスできなくなります。CSV ファイルをダウンロードしたら、 **[閉じる]**を選択します。アクセス キーを作成すると、キー ペアは既定でアクティブになり、すぐに使用できます。

    ![Create access key](https://docs-download.pingcap.com/media/images/docs/tidb-cloud/op-to-cloud-create-access-key01.png)

    ![Download CSV file](https://docs-download.pingcap.com/media/images/docs/tidb-cloud/op-to-cloud-create-access-key02.png)

#### ステップ 3. Dumplingを使用して上流の TiDB クラスターから Amazon S3 にデータをエクスポートする {#step-3-export-data-from-the-upstream-tidb-cluster-to-amazon-s3-using-dumpling}

Dumplingを使用してアップストリーム TiDB クラスターから Amazon S3 にデータをエクスポートするには、次の手順を実行します。

1.  Dumplingの環境変数を設定します。

    ```shell
    export AWS_ACCESS_KEY_ID=${AccessKey}
    export AWS_SECRET_ACCESS_KEY=${SecretKey}
    ```

2.  AWS コンソールから S3 バケット URI とリージョン情報を取得します。詳細については[バケットを作成する](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html)参照してください。

    次のスクリーンショットは、S3 バケット URI 情報を取得する方法を示しています。

    ![Get the S3 URI](https://docs-download.pingcap.com/media/images/docs/tidb-cloud/op-to-cloud-copy-s3-uri.png)

    次のスクリーンショットは、地域情報を取得する方法を示しています。

    ![Get the region information](https://docs-download.pingcap.com/media/images/docs/tidb-cloud/op-to-cloud-copy-region-info.png)

3.  Dumplingを実行して、データを Amazon S3 バケットにエクスポートします。

    ```shell
    dumpling \
    -u root \
    -P 4000 \
    -h 127.0.0.1 \
    -r 20000 \
    --filetype {sql|csv}  \
    -F 256MiB  \
    -t 8 \
    -o "${S3 URI}" \
    --s3.region "${s3.region}"
    ```

    `-t`オプションは、エクスポートのスレッド数を指定します。スレッド数を増やすと、 Dumplingの同時実行性とエクスポート速度が向上しますが、データベースのメモリ消費も増加します。したがって、このパラメータにあまり大きな数値を設定しないでください。

    詳細については[Dumpling](https://docs.pingcap.com/tidb/stable/dumpling-overview#export-to-sql-files)参照してください。

4.  エクスポート データを確認します。通常、エクスポートされたデータには次のものが含まれます。

    -   `metadata` : このファイルには、エクスポートの開始時刻とマスター バイナリ ログの場所が含まれています。
    -   `{schema}-schema-create.sql` : スキーマを作成するためのSQLファイル
    -   `{schema}.{table}-schema.sql` : テーブルを作成するためのSQLファイル
    -   `{schema}.{table}.{0001}.{sql|csv}` : データファイル
    -   `*-schema-view.sql` : その他のエクスポート`*-schema-post.sql`れたSQL `*-schema-trigger.sql`

### Amazon S3 からTiDB Cloudにデータを移行する {#migrate-data-from-amazon-s3-to-tidb-cloud}

TiDB セルフマネージド クラスターから Amazon S3 にデータをエクスポートした後、そのデータをTiDB Cloudに移行する必要があります。

1.  TiDB Cloudコンソールでクラスターのアカウント ID と外部 ID を取得します。詳細については、 [ステップ2. Amazon S3アクセスを構成する](/tidb-cloud/tidb-cloud-auditing.md#step-2-configure-amazon-s3-access)参照してください。

    次のスクリーンショットは、アカウント ID と外部 ID を取得する方法を示しています。

    ![Get the Account ID and External ID](https://docs-download.pingcap.com/media/images/docs/tidb-cloud/op-to-cloud-get-role-arn.png)

2.  Amazon S3 のアクセス権限を設定します。通常、次の読み取り専用権限が必要です。

    -   s3:オブジェクトの取得
    -   s3:オブジェクトバージョンの取得
    -   s3:リストバケット
    -   s3:バケットの場所を取得する

    S3 バケットがサーバー側暗号化 SSE-KMS を使用する場合は、KMS 権限も追加する必要があります。

    -   kms:復号化

3.  アクセス ポリシーを構成します。 [AWS コンソール &gt; IAM &gt; アクセス管理 &gt; ポリシー](https://console.aws.amazon.com/iamv2/home#/policies)に移動してリージョンに切り替え、 TiDB Cloudのアクセス ポリシーがすでに存在するかどうかを確認します。存在しない場合は、このドキュメント[JSON タブでポリシーを作成する](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_create-console.html)に従ってポリシーを作成します。

    以下は、json ポリシーのテンプレートの例です。

    ```json
    ## Create a json policy template
    ##<Your customized directory>: fill in the path to the folder in the S3 bucket where the data files to be imported are located.
    ##<Your S3 bucket ARN>: fill in the ARN of the S3 bucket. You can click the Copy ARN button on the S3 Bucket Overview page to get it.
    ##<Your AWS KMS ARN>: fill in the ARN for the S3 bucket KMS key. You can get it from S3 bucket > Properties > Default encryption > AWS KMS Key ARN. For more information, see https://docs.aws.amazon.com/AmazonS3/latest/userguide/viewing-bucket-key-settings.html

    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:GetObjectVersion"
                ],
                "Resource": "arn:aws:s3:::<Your customized directory>"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "s3:ListBucket",
                    "s3:GetBucketLocation"
                ],
                "Resource": "<Your S3 bucket ARN>"
            }
            // If you have enabled SSE-KMS for the S3 bucket, you need to add the following permissions.
            {
                "Effect": "Allow",
                "Action": [
                    "kms:Decrypt"
                ],
                "Resource": "<Your AWS KMS ARN>"
            }
            ,
            {
                "Effect": "Allow",
                "Action": "kms:Decrypt",
                "Resource": "<Your AWS KMS ARN>"
            }
        ]
    }
    ```

4.  ロールを設定します。1 [IAMロールの作成 (コンソール)](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-user.html)参照してください。アカウント ID フィールドに、手順 1 で書き留めたTiDB Cloudアカウント ID とTiDB Cloud外部 ID を入力します。

5.  Role-ARN を取得します。 [AWS コンソール &gt; IAM &gt; アクセス管理 &gt; ロール](https://console.aws.amazon.com/iamv2/home#/roles)に進みます。 リージョンに切り替えます。 作成したロールをクリックし、ARN を書き留めます。 TiDB Cloudにデータをインポートするときに使用します。

6.  TiDB Cloudにデータをインポートします。1 [Amazon S3 または GCS から CSV ファイルをTiDB Cloudにインポートする](/tidb-cloud/import-csv-files.md)参照してください。

## 増分データを複製する {#replicate-incremental-data}

増分データを複製するには、次の手順を実行します。

1.  増分データ移行の開始時刻を取得します。たとえば、完全データ移行のメタデータ ファイルから取得できます。

    ![Start Time in Metadata](https://docs-download.pingcap.com/media/images/docs/tidb-cloud/start_ts_in_metadata.png)

2.  TiCDC にTiDB Cloudへの接続を許可します。 [TiDB Cloudコンソール](https://tidbcloud.com/console/clusters)でクラスターを見つけて、 **「ネットワーク」**ページに移動します。 **「IP アドレスの追加」** &gt; **「IP アドレスの使用」**をクリックします。 **「IP アドレス」**フィールドに TiCDCコンポーネントのパブリック IP アドレスを入力し、 **「確認」**をクリックして保存します。これで、TiCDC はTiDB Cloud にアクセスできるようになります。詳細については、 [IPアクセスリストを構成する](/tidb-cloud/configure-ip-access-list.md)参照してください。

3.  ダウンストリームTiDB Cloudクラスターの接続情報を取得します。 [TiDB Cloudコンソール](https://tidbcloud.com/console/clusters)で、 **[概要]** &gt; **[接続]**に移動します。接続ダイアログで、[**接続タイプ]**ドロップダウン リストから**[パブリック]**を選択し、 **[接続先]**ドロップダウン リストから**[一般]**を選択します。接続情報から、クラスターのホスト IP アドレスとポートを取得できます。詳細については、 [パブリック接続経由で接続](/tidb-cloud/connect-via-standard-connection.md)参照してください。

4.  増分レプリケーション タスクを作成して実行します。アップストリーム クラスターで、次のコマンドを実行します。

    ```shell
    tiup cdc cli changefeed create \
    --pd=http://172.16.6.122:2379  \
    --sink-uri="tidb://root:123456@172.16.6.125:4000"  \
    --changefeed-id="upstream-to-downstream"  \
    --start-ts="431434047157698561"
    ```

    -   `--pd` : 上流クラスタのPDアドレス。形式は次の通りです: `[upstream_pd_ip]:[pd_port]`

    -   `--sink-uri` : レプリケーション タスクのダウンストリーム アドレス。次の形式に従って`--sink-uri`設定します。現在、このスキームは`mysql` 、 `tidb` 、 `kafka` 、 `s3` 、および`local`サポートしています。

        ```shell
        [scheme]://[userinfo@][host]:[port][/path]?[query_parameters]
        ```

    -   `--changefeed-id` : レプリケーション タスクの ID。形式は、^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$ 正規表現と一致する必要があります。この ID が指定されていない場合、TiCDC は ID として UUID (バージョン 4 形式) を自動的に生成します。

    -   `--start-ts` : 変更フィードの開始 TSO を指定します。この TSO から、TiCDC クラスターはデータのプルを開始します。デフォルト値は現在の時刻です。

    詳細については[TiCDC 変更フィードの CLI とコンフィグレーションパラメータ](https://docs.pingcap.com/tidb/dev/ticdc-changefeed-config)参照してください。

5.  アップストリーム クラスターで GC メカニズムを再度有効にします。増分レプリケーションでエラーや遅延が見つからない場合は、GC メカニズムを有効にしてクラスターのガベージコレクションを再開します。

    設定が機能するかどうかを確認するには、次のコマンドを実行します。

    ```sql
    SET GLOBAL tidb_gc_enable = TRUE;
    ```

    以下は出力例です。1 `1` GC が無効であることを示します。

    ```sql
    SELECT @@global.tidb_gc_enable;
    +-------------------------+
    | @@global.tidb_gc_enable |
    +-------------------------+
    |                       1 |
    +-------------------------+
    1 row in set (0.01 sec)
    ```

6.  増分レプリケーション タスクを確認します。

    -   出力に「Create changefeed successfully!」というメッセージが表示されたら、レプリケーション タスクは正常に作成されています。

    -   状態が`normal`場合、レプリケーション タスクは正常です。

        ```shell
         tiup cdc cli changefeed list --pd=http://172.16.6.122:2379
        ```

        ![Update Filter](https://docs-download.pingcap.com/media/images/docs/tidb-cloud/normal_status_in_replication_task.png)

    -   レプリケーションを確認します。アップストリーム クラスターに新しいレコードを書き込み、そのレコードがダウンストリームTiDB Cloudクラスターにレプリケートされているかどうかを確認します。

7.  アップストリーム クラスターとダウンストリーム クラスターに同じタイムゾーンを設定します。デフォルトでは、 TiDB Cloud はタイムゾーンを UTC に設定します。アップストリーム クラスターとダウンストリーム クラスターのタイムゾーンが異なる場合は、両方のクラスターに同じタイムゾーンを設定する必要があります。

    1.  アップストリーム クラスターで、次のコマンドを実行してタイムゾーンを確認します。

        ```sql
        SELECT @@global.time_zone;
        ```

    2.  ダウンストリーム クラスターで、次のコマンドを実行してタイムゾーンを設定します。

        ```sql
        SET GLOBAL time_zone = '+08:00';
        ```

    3.  設定を確認するには、タイムゾーンをもう一度確認してください。

        ```sql
        SELECT @@global.time_zone;
        ```

8.  アップストリーム クラスターの[クエリバインディング](/sql-plan-management.md)バックアップし、ダウンストリーム クラスターで復元します。クエリ バインディングをバックアップするには、次のクエリを使用できます。

    ```sql
    SELECT DISTINCT(CONCAT('CREATE GLOBAL BINDING FOR ', original_sql,' USING ', bind_sql,';')) FROM mysql.bind_info WHERE status='enabled';
    ```

    出力が表示されない場合は、アップストリーム クラスターでクエリ バインディングが使用されていない可能性があります。この場合、この手順をスキップできます。

    クエリ バインディングを取得したら、ダウンストリーム クラスターで実行して、クエリ バインディングを復元します。

9.  アップストリーム クラスターのユーザーと権限の情報をバックアップし、ダウンストリーム クラスターで復元します。次のスクリプトを使用して、ユーザーと権限の情報をバックアップできます。プレースホルダーを実際の値に置き換える必要があることに注意してください。

    ```shell
    #!/bin/bash

    export MYSQL_HOST={tidb_op_host}
    export MYSQL_TCP_PORT={tidb_op_port}
    export MYSQL_USER=root
    export MYSQL_PWD={root_password}
    export MYSQL="mysql -u${MYSQL_USER} --default-character-set=utf8mb4"

    function backup_user_priv(){
        ret=0
        sql="SELECT CONCAT(user,':',host,':',authentication_string) FROM mysql.user WHERE user NOT IN ('root')"
        for usr in `$MYSQL -se "$sql"`;do
            u=`echo $usr | awk -F ":" '{print $1}'`
            h=`echo $usr | awk -F ":" '{print $2}'`
            p=`echo $usr | awk -F ":" '{print $3}'`
            echo "-- Grants for '${u}'@'${h}';"
            [[ ! -z "${p}" ]] && echo "CREATE USER IF NOT EXISTS '${u}'@'${h}' IDENTIFIED WITH 'mysql_native_password' AS '${p}' ;"
            $MYSQL -se "SHOW GRANTS FOR '${u}'@'${h}';" | sed 's/$/;/g'
            [ $? -ne 0 ] && ret=1 && break
        done
        return $ret
    }

    backup_user_priv
    ```

    ユーザーと権限の情報を取得したら、ダウンストリーム クラスターで生成された SQL ステートメントを実行して、ユーザーと権限の情報を復元します。
