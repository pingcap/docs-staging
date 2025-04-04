---
title: Database Audit Logging
summary: TiDB Cloudでクラスターを監査する方法について説明します。
---

# データベース監査ログ {#database-audit-logging}

TiDB Cloud は、ユーザー アクセスの詳細 (実行された SQL ステートメントなど) の履歴をログに記録するデータベース監査ログ機能を提供します。

> **注記：**
>
> 現在、データベース監査ログ機能はリクエストに応じてのみ利用可能です。この機能をリクエストするには、 [TiDB Cloudコンソール](https://tidbcloud.com)の右下隅にある [ **?]**をクリックし、 **[サポートのリクエスト]**をクリックします。次に、 **[説明]**フィールドに「データベース監査ログの申請」と入力し、 **[送信] を**クリックします。

組織のユーザー アクセス ポリシーやその他の情報セキュリティ対策の有効性を評価するには、データベース監査ログを定期的に分析することがセキュリティのベスト プラクティスです。

監査ログ機能はデフォルトで無効になっています。クラスターを監査するには、まず監査ログを有効にしてから、監査フィルター ルールを指定する必要があります。

> **注記：**
>
> 監査ログはクラスターのリソースを消費するため、クラスターを監査するかどうかは慎重に検討してください。

## 前提条件 {#prerequisites}

-   TiDB Cloud Dedicated クラスターを使用しています。監査ログはTiDB Cloud Serverless クラスターでは利用できません。
-   組織内で`Organization Owner`または`Project Owner`ロールを担っています。そうでない場合、 TiDB Cloudコンソールでデータベース監査関連のオプションは表示されません。詳細については、 [ユーザーロール](/tidb-cloud/manage-user-access.md#user-roles)参照してください。

## 監査ログを有効にする {#enable-audit-logging}

TiDB Cloud は、 TiDB Cloud Dedicated クラスターの監査ログをクラウドstorageサービスに記録することをサポートしています。データベース監査ログを有効にする前に、クラスターが配置されているクラウド プロバイダーでクラウドstorageサービスを構成します。

> **注記：**
>
> AWS にデプロイされた TiDB クラスターの場合、データベース監査ログを有効にするときに、監査ログ ファイルをTiDB Cloudに保存することを選択できます。現在、この機能はリクエストに応じてのみ利用できます。この機能をリクエストするには、 [TiDB Cloudコンソール](https://tidbcloud.com)の右下隅にある**[?]**をクリックし、 **[サポートのリクエスト]**をクリックします。次に、 **[説明]**フィールドに「監査ログ ファイルをTiDB Cloudに保存する適用」と入力し、 **[送信] を**クリックします。

### AWSの監査ログを有効にする {#enable-audit-logging-for-aws}

AWS の監査ログを有効にするには、次の手順を実行します。

#### ステップ 1. Amazon S3 バケットを作成する {#step-1-create-an-amazon-s3-bucket}

TiDB Cloud が監査ログを書き込む宛先として、企業所有の AWS アカウント内の Amazon S3 バケットを指定します。

> 注記：
>
> AWS S3 バケットでオブジェクト ロックを有効にしないでください。オブジェクト ロックを有効にすると、 TiDB Cloud が監査ログ ファイルを S3 にプッシュできなくなります。

詳細については、AWS ユーザーガイドの[バケットの作成](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html)参照してください。

#### ステップ2. Amazon S3アクセスを構成する {#step-2-configure-amazon-s3-access}

1.  監査ログを有効にする TiDB クラスターのTiDB Cloudアカウント ID と外部 ID を取得します。

    1.  TiDB Cloudコンソールで、プロジェクトの[**クラスター**](https://tidbcloud.com/console/clusters)ページに移動します。

        > **ヒント：**
        >
        > 複数のプロジェクトがある場合は、<mdsvgicon name="icon-left-projects">左下隅にある をクリックして、別のプロジェクトに切り替えます。</mdsvgicon>

    2.  ターゲット クラスターの名前をクリックして概要ページに移動し、左側のナビゲーション ペインで**[DB 監査ログ] を**クリックします。

    3.  **DB 監査ログ**ページで、右上隅の**[有効化]**をクリックします。

    4.  **[データベース監査ログの有効化]**ダイアログで、 **[AWS IAMポリシー設定]**セクションを見つけて、後で使用するために**TiDB Cloudアカウント ID**と**TiDB Cloud外部 ID**を記録します。

2.  AWS マネジメントコンソールで、 **IAM** &gt;**アクセス管理**&gt;**ポリシー**に移動し、書き込み専用権限`s3:PutObject`を持つstorageバケットポリシーがあるかどうかを確認します。

    -   はいの場合は、後で使用するために一致したstorageバケット ポリシーを記録します。
    -   そうでない場合は、 **「IAM」** &gt; **「アクセス管理」** &gt; **「ポリシー」** &gt; **「ポリシーの作成」**に移動し、次のポリシー テンプレートに従ってバケット ポリシーを定義します。

        ```json
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": "s3:PutObject",
                    "Resource": "<Your S3 bucket ARN>/*"
                }
            ]
        }
        ```

        テンプレートでは、 `<Your S3 bucket ARN>`監査ログファイルが書き込まれる S3 バケットの Amazon リソース名 (ARN) です。S3 バケットの [**プロパティ]**タブに移動し、 **[バケットの概要]**領域で ARN 値を取得できます。 `"Resource"`フィールドでは、ARN の後に`/*`追加する必要があります。たとえば、ARN が`arn:aws:s3:::tidb-cloud-test`の場合、 `"Resource"`フィールドの値を`"arn:aws:s3:::tidb-cloud-test/*"`に設定する必要があります。

3.  **「IAM」** &gt; **「アクセス管理」** &gt; **「ロール」**に移動し、信頼エンティティが先ほど記録したTiDB Cloudアカウント ID と外部 ID に対応するロールが既に存在するかどうかを確認します。

    -   はいの場合は、後で使用するために一致したロールを記録します。
    -   そうでない場合は、 **「ロールの作成」**をクリックし、信頼エンティティタイプとして**「別の AWS アカウント」**を選択して、「**アカウント ID」**フィールドにTiDB Cloudアカウント ID の値を入力します。次に、「**外部 ID が必要」**オプションを選択し、「**外部 ID」**フィールドにTiDB Cloud外部 ID の値を入力します。

4.  **IAM** &gt;**アクセス管理**&gt;**ロール**で、前の手順のロール名をクリックして**概要**ページに移動し、次の手順を実行します。

    1.  **「権限」**タブで、書き込み専用権限`s3:PutObject`を持つ記録されたポリシーがロールにアタッチされているかどうかを確認します。アタッチされていない場合は、 **「ポリシーのアタッチ」**を選択し、必要なポリシーを検索して、 **「ポリシーのアタッチ」を**クリックします。
    2.  **概要**ページに戻り、**ロール ARN**値をクリップボードにコピーします。

#### ステップ3. 監査ログを有効にする {#step-3-enable-audit-logging}

TiDB Cloudコンソールで、 TiDB Cloudアカウント ID と外部 ID 値を取得した**[データベース監査ログの有効化]**ダイアログ ボックスに戻り、次の手順を実行します。

1.  **「バケット URI」**フィールドに、監査ログファイルが書き込まれる S3 バケットの URI を入力します。

2.  **「バケットリージョン」**ドロップダウンリストで、バケットが配置されている AWS リージョンを選択します。

3.  **「ロール ARN」**フィールドに、 [ステップ2. Amazon S3アクセスを構成する](#step-2-configure-amazon-s3-access)でコピーしたロール ARN 値を入力します。

4.  **「テスト接続」**をクリックして、 TiDB Cloud がバケットにアクセスして書き込むことができるかどうかを確認します。

    成功した場合は、 **「接続に成功しました」と**表示されます。それ以外の場合は、アクセス構成を確認してください。

5.  クラスターの監査ログを有効にするには、 **[有効]**をクリックします。

    TiDB Cloud は、指定されたクラスターの監査ログを Amazon S3 バケットに書き込む準備ができました。

> **注記：**
>
> -   監査ログを有効にした後、バケットの URI、場所、または ARN に新しい変更を加えた場合は、もう一度**[接続のテスト]**をクリックして、 TiDB Cloud がバケットに接続できることを確認する必要があります。次に、 **[有効化]**をクリックして変更を適用します。
> -   TiDB Cloud の Amazon S3 へのアクセスを削除するには、AWS マネジメントコンソールでこのクラスターに付与された信頼ポリシーを削除するだけです。

### Google Cloud の監査ログを有効にする {#enable-audit-logging-for-google-cloud}

Google Cloud の監査ログを有効にするには、次の手順に従います。

#### ステップ1. GCSバケットを作成する {#step-1-create-a-gcs-bucket}

TiDB Cloud が監査ログを書き込む宛先として、企業所有の Google Cloud アカウント内の Google Cloud Storage (GCS) バケットを指定します。

詳細については、Google Cloud Storage ドキュメントの[storageバケットの作成](https://cloud.google.com/storage/docs/creating-buckets)ご覧ください。

#### ステップ2. GCSアクセスを構成する {#step-2-configure-gcs-access}

1.  監査ログを有効にする TiDB クラスタの Google Cloud サービス アカウント ID を取得します。

    1.  TiDB Cloudコンソールで、プロジェクトの[**クラスター**](https://tidbcloud.com/console/clusters)ページに移動します。

        > **ヒント：**
        >
        > 複数のプロジェクトがある場合は、<mdsvgicon name="icon-left-projects">左下隅にある をクリックして、別のプロジェクトに切り替えます。</mdsvgicon>

    2.  ターゲット クラスターの名前をクリックして概要ページに移動し、左側のナビゲーション ペインで**[DB 監査ログ] を**クリックします。

    3.  **DB 監査ログ**ページで、右上隅の**[有効化]**をクリックします。

    4.  **[データベース監査ログを有効にする]**ダイアログで、 **[Google Cloud Server アカウント ID]**セクションを見つけて、後で使用するために**サービス アカウント ID**を記録します。

2.  Google Cloud コンソールで、 **[IAMと管理]** &gt; **[ロール]**に移動し、storageコンテナの次の書き込み専用権限を持つロールが存在するかどうかを確認します。

    -   storage.オブジェクト.作成
    -   storage.オブジェクト.削除

    はいの場合は、後で使用するために TiDB クラスターの一致したロールを記録します。いいえの場合は、 **[IAMと管理]** &gt; **[ロール]** &gt; **[ロールの作成]**に移動して、TiDB クラスターのロールを定義します。

3.  **[Cloud Storage]** &gt; **[ブラウザ]**に移動し、 TiDB Cloudがアクセスする GCS バケットを選択して、 **[情報パネルを表示]**をクリックします。

    パネルが表示されます。

4.  パネルで、 **「プリンシパルの追加」を**クリックします。

    プリンシパルを追加するためのダイアログ ボックスが表示されます。

5.  ダイアログ ボックスで、次の手順を実行します。

    1.  **[新しいプリンシパル]**フィールドに、TiDB クラスタの Google Cloud サービス アカウント ID を貼り付けます。
    2.  **[ロール]**ドロップダウン リストで、ターゲット TiDB クラスターのロールを選択します。
    3.  **[保存]**をクリックします。

#### ステップ3. 監査ログを有効にする {#step-3-enable-audit-logging}

TiDB Cloudコンソールで、 TiDB Cloudアカウント ID を取得した**「データベース監査ログの有効化」**ダイアログ ボックスに戻り、次の手順を実行します。

1.  **「バケット URI」**フィールドに、完全な GCS バケット名を入力します。

2.  **「バケットリージョン」**フィールドで、バケットが配置されている GCS リージョンを選択します。

3.  **「テスト接続」**をクリックして、 TiDB Cloud がバケットにアクセスして書き込むことができるかどうかを確認します。

    成功した場合は、 **「接続に成功しました」と**表示されます。それ以外の場合は、アクセス構成を確認してください。

4.  クラスターの監査ログを有効にするには、 **[有効]**をクリックします。

    TiDB Cloud は、指定されたクラスタの監査ログを GCS バケットに書き込む準備ができました。

> **注記：**
>
> -   監査ログを有効にした後、バケットの URI または場所に新しい変更を加えた場合は、もう一度**[接続のテスト]**をクリックして、 TiDB Cloud がバケットに接続できることを確認する必要があります。次に、 **[有効化]**をクリックして変更を適用します。
> -   TiDB Cloud の GCS バケットへのアクセスを削除するには、Google Cloud コンソールでこのクラスタに付与された信頼ポリシーを削除します。

## 監査フィルタルールを指定する {#specify-auditing-filter-rules}

監査ログを有効にした後、監査フィルタ ルールを指定して、どのユーザー アクセス イベントをキャプチャして監査ログに書き込むかを制御する必要があります。フィルタ ルールが指定されていない場合、 TiDB Cloud は何もログに記録しません。

クラスターの監査フィルター ルールを指定するには、次の手順を実行します。

1.  **「DB 監査ログ」**ページで、 **「ログ フィルター ルール」**セクションの**「フィルター ルールの追加」**をクリックして、監査フィルター ルールを追加します。

    一度に追加できる監査ルールは 1 つだけです。各ルールでは、ユーザー式、データベース式、テーブル式、およびアクセス タイプを指定します。監査要件を満たすために、複数の監査ルールを追加できます。

2. **「ログ フィルター ルール」**セクションで、 **「&gt;」**をクリックして展開し、追加した監査ルールのリストを表示します。

> **注記：**
>
> -   フィルター ルールは正規表現であり、大文字と小文字が区別されます。ワイルドカード ルール`.*`使用すると、クラスター内のすべてのユーザー、データベース、またはテーブル イベントがログに記録されます。
> -   監査ログはクラスター リソースを消費するため、フィルター ルールを指定する際には慎重に行う必要があります。消費を最小限に抑えるには、可能であれば、監査ログの範囲を特定のデータベース オブジェクト、ユーザー、およびアクションに制限するフィルター ルールを指定することをお勧めします。

## 監査ログをビュー {#view-audit-logs}

デフォルトでは、 TiDB Cloudはデータベース監査ログ ファイルをstorageサービスに保存するため、storageサービスから監査ログ情報を読み取る必要があります。

> **注記：**
>
> 監査ログ ファイルをTiDB Cloudに保存するように要求して選択した場合は、**データベース監査ログ**ページの**監査ログ アクセス**セクションからダウンロードできます。

TiDB Cloud監査ログは、クラスター ID、Pod ID、ログ作成日が完全修飾ファイル名に組み込まれた読み取り可能なテキスト ファイルです。

たとえば、 `13796619446086334065/tidb-0/tidb-audit-2022-04-21T18-16-29.529.log` 。この例では、 `13796619446086334065`クラスター ID を示し、 `tidb-0`ポッド ID を示します。

## 監査ログを無効にする {#disable-audit-logging}

クラスターの監査が不要になった場合は、クラスターのページに移動し、 **[設定]** &gt; **[監査設定]**をクリックして、右上隅の監査設定を**[オフ]**に切り替えます。

> **注記：**
>
> ログ ファイルのサイズが 10 MiB に達するたびに、ログ ファイルはクラウドstorageバケットにプッシュされます。そのため、監査ログを無効にした後は、サイズが 10 MiB 未満のログ ファイルはクラウドstorageバケットに自動的にプッシュされなくなります。この状況でログ ファイルを取得するには、 [PingCAP サポート](/tidb-cloud/tidb-cloud-support.md)お問い合わせください。

## 監査ログフィールド {#audit-log-fields}

監査ログ内の各データベース イベント レコードに対して、TiDB は次のフィールドを提供します。

> **注記：**
>
> 次の表では、フィールドの最大長が空の場合、このフィールドのデータ型には明確に定義された定数長 (たとえば、INTEGER の場合は 4 バイト) があることを意味します。

| 列番号 | フィールド名    | TiDB データ型 | 最大長  | 説明                               |
| --- | --------- | --------- | ---- | -------------------------------- |
| 1   | 該当なし      | 該当なし      | 該当なし | 内部使用のために予約済み                     |
| 2   | 該当なし      | 該当なし      | 該当なし | 内部使用のために予約済み                     |
| 3   | 該当なし      | 該当なし      | 該当なし | 内部使用のために予約済み                     |
| 4   | ID        | 整数        |      | 一意のイベントID                        |
| 5   | タイムスタンプ   | タイムスタンプ   |      | イベント開催時間                         |
| 6   | イベントクラス   | バルチャー     | 15   | イベントタイプ                          |
| 7   | イベントサブクラス | バルチャー     | 15   | イベントのサブタイプ                       |
| 8   | ステータスコード  | 整数        |      | 声明の回答状況                          |
| 9   | コスト_時間    | フロート      |      | 声明に費やされた時間                       |
| 10  | ホスト       | バルチャー     | 16   | サーバーIP                           |
| 11  | クライアントIP  | バルチャー     | 16   | クライアントIP                         |
| 12  | ユーザー      | バルチャー     | 17   | ログインユーザー名                        |
| 13  | データベース    | バルチャー     | 64   | イベント関連データベース                     |
| 14  | テーブル      | バルチャー     | 64   | イベント関連テーブル名                      |
| 15  | SQL_TEXT  | バルチャー     | 64KB | マスクされたSQL文                       |
| 16  | 行         | 整数        |      | 影響を受ける行の数（ `0`影響を受ける行がないことを示します） |

TiDB によって設定された EVENT_CLASS フィールド値に応じて、監査ログ内のデータベース イベント レコードには次の追加フィールドも含まれます。

-   EVENT_CLASS 値が`CONNECTION`場合、データベース イベント レコードには次のフィールドも含まれます。

    | 列番号 | フィールド名         | TiDB データ型 | 最大長  | 説明                                               |
    | --- | -------------- | --------- | ---- | ------------------------------------------------ |
    | 17  | クライアントポート      | 整数        |      | クライアントポート番号                                      |
    | 18  | 接続ID           | 整数        |      | 接続ID                                             |
    | 19  | 接続タイプ          | バルチャー     | 12   | `socket`または`unix-socket`経由の接続                    |
    | 20  | サーバーID         | 整数        |      | TiDBサーバーID                                       |
    | 21  | サーバーポート        | 整数        |      | TiDBサーバーがMySQLプロトコル経由でクライアントの通信をリッスンするために使用するポート |
    | 22  | サーバーOSログインユーザー | バルチャー     | 17   | TiDBプロセス起動システムのユーザー名                             |
    | 23  | OS_バージョン       | バルチャー     | 該当なし | TiDBサーバーが配置されているオペレーティング システムのバージョン              |
    | 24  | SSL_バージョン      | バルチャー     | 6    | TiDBの現在のSSLバージョン                                 |
    | 25  | ピッド            | 整数        |      | TiDBプロセスのPID                                     |

-   EVENT_CLASS 値が`TABLE_ACCESS`または`GENERAL`場合、データベース イベント レコードには次のフィールドも含まれます。

    | 列番号 | フィールド名      | TiDB データ型 | 最大長 | 説明                 |
    | --- | ----------- | --------- | --- | ------------------ |
    | 17  | 接続ID        | 整数        |     | 接続ID               |
    | 18  | 指示          | バルチャー     | 14  | MySQLプロトコルのコマンドタイプ |
    | 19  | SQL_ステートメント | バルチャー     | 17  | SQL文の種類            |
    | 20  | ピッド         | 整数        |     | TiDBプロセスのPID       |
