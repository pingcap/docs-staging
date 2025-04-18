---
title: Import CSV Files from Amazon S3 or GCS into TiDB Cloud Dedicated
summary: Amazon S3 または GCS からTiDB Cloud Dedicated に CSV ファイルをインポートする方法を学びます。
aliases: ['/tidbcloud/migrate-from-amazon-s3-or-gcs','/tidbcloud/migrate-from-aurora-bulk-import']
---

# Amazon S3 または GCS から CSV ファイルをTiDB Cloud Dedicated にインポートする {#import-csv-files-from-amazon-s3-or-gcs-into-tidb-cloud-dedicated}

このドキュメントでは、Amazon Simple Storage Service (Amazon S3) または Google Cloud Storage (GCS) からTiDB Cloud Dedicated に CSV ファイルをインポートする方法について説明します。

## 制限事項 {#limitations}

-   データの一貫性を確保するために、 TiDB Cloud、CSV ファイルを空のテーブルにのみインポートできます。すでにデータが含まれている既存のテーブルにデータをインポートするには、このドキュメントに従ってTiDB Cloudを使用して一時的な空のテーブルにデータをインポートし、 `INSERT SELECT`ステートメントを使用してデータを対象の既存のテーブルにコピーします。

-   TiDB Cloud Dedicated クラスターで[チェンジフィード](/tidb-cloud/changefeed-overview.md)または[ポイントインタイム復元](/tidb-cloud/backup-and-restore.md#turn-on-point-in-time-restore)有効になっている場合、現在のデータ インポート機能は[物理インポートモード](https://docs.pingcap.com/tidb/stable/tidb-lightning-physical-import-mode)使用するため、クラスターにデータをインポートできません ([**データのインポート]**ボタンは無効になります)。このモードでは、インポートされたデータは変更ログを生成しないため、変更フィードとポイントインタイム リストアはインポートされたデータを検出できません。

## ステップ1. CSVファイルを準備する {#step-1-prepare-the-csv-files}

1.  CSV ファイルが 256 MB より大きい場合は、サイズがそれぞれ約 256 MB の小さなファイルに分割することを検討してください。

    TiDB Cloud は非常に大きな CSV ファイルのインポートをサポートしていますが、サイズが約 256 MB の複数の入力ファイルを使用すると最高のパフォーマンスを発揮します。これは、 TiDB Cloud が複数のファイルを並行して処理できるため、インポート速度が大幅に向上するためです。

2.  CSV ファイルに次のように名前を付けます。

    -   CSV ファイルにテーブル全体のすべてのデータが含まれている場合は、データをインポートするときに`${db_name}.${table_name}`テーブルにマップされる`${db_name}.${table_name}.csv`形式でファイルに名前を付けます。

    -   1 つのテーブルのデータが複数の CSV ファイルに分割されている場合は、これらの CSV ファイルに数値サフィックスを追加します。たとえば、 `${db_name}.${table_name}.000001.csv`と`${db_name}.${table_name}.000002.csv` 。数値サフィックスは連続していなくてもかまいませんが、昇順である必要があります。また、すべてのサフィックスが同じ長さになるように、数字の前にゼロを追加する必要があります。

    -   TiDB Cloud は、 `.gzip` 、 `.gz` 、 `.zstd` 、 `.zst` 、 `.snappy`の形式の圧縮ファイルのインポートをサポートしています。圧縮された CSV ファイルをインポートする場合は、ファイルに`${db_name}.${table_name}.${suffix}.csv.${compress}`形式で名前を付けます`${suffix}`はオプションで、「000001」などの任意の整数にすることができます。たとえば、 `trips.000001.csv.gz`ファイルを`bikeshare.trips`テーブルにインポートする場合は、ファイルの名前を`bikeshare.trips.000001.csv.gz`に変更する必要があります。

    > **注記：**
    >
    > -   圧縮する必要があるのはデータ ファイルのみであり、データベース ファイルやテーブル スキーマ ファイルは圧縮する必要はありません。
    > -   より良いパフォーマンスを実現するために、各圧縮ファイルのサイズを 100 MiB に制限することをお勧めします。
    > -   Snappy 圧縮ファイルは[公式Snappyフォーマット](https://github.com/google/snappy)である必要があります。Snappy 圧縮の他のバリエーションはサポートされていません。
    > -   非圧縮ファイルの場合、前述のルールに従って CSV ファイル名を更新できない場合があります (たとえば、CSV ファイル リンクが他のプログラムでも使用されている場合)。ファイル名を変更せずに、 [ステップ4](#step-4-import-csv-files-to-tidb-cloud)の**マッピング設定**を使用してソース データを単一のターゲット テーブルにインポートできます。

## ステップ2. ターゲットテーブルスキーマを作成する {#step-2-create-the-target-table-schemas}

CSV ファイルにはスキーマ情報が含まれていないため、CSV ファイルからTiDB Cloudにデータをインポートする前に、次のいずれかの方法でテーブル スキーマを作成する必要があります。

-   方法 1: TiDB Cloudで、ソース データのターゲット データベースとテーブルを作成します。

-   方法 2: CSV ファイルが配置されている Amazon S3 または GCS ディレクトリで、次のようにソース データのターゲット テーブル スキーマ ファイルを作成します。

    1.  ソース データのデータベース スキーマ ファイルを作成します。

        CSV ファイルが[ステップ1](#step-1-prepare-the-csv-files)の命名規則に従っている場合、データのインポートではデータベース スキーマ ファイルはオプションです。それ以外の場合は、データベース スキーマ ファイルは必須です。

        各データベース スキーマ ファイルは`${db_name}-schema-create.sql`形式で、 `CREATE DATABASE` DDL ステートメントが含まれている必要があります。このファイルを使用して、 TiDB Cloud はデータをインポートするときにデータを格納する`${db_name}`データベースを作成します。

        たとえば、次のステートメントを含む`mydb-scehma-create.sql`ファイルを作成すると、 TiDB Cloud はデータをインポートするときに`mydb`データベースを作成します。

        ```sql
        CREATE DATABASE mydb;
        ```

    2.  ソース データのテーブル スキーマ ファイルを作成します。

        CSV ファイルが配置されている Amazon S3 または GCS ディレクトリにテーブル スキーマ ファイルを含めない場合、 TiDB Cloud はデータをインポートするときに対応するテーブルを作成しません。

        各テーブル スキーマ ファイルは`${db_name}.${table_name}-schema.sql`形式で、 `CREATE TABLE` DDL ステートメントが含まれている必要があります。このファイルを使用すると、 TiDB Cloud はデータをインポートするときに`${db_name}`データベースに`${db_table}`テーブルを作成します。

        たとえば、次のステートメントを含む`mydb.mytable-schema.sql`ファイルを作成すると、 TiDB Cloud はデータをインポートするときに`mydb`データベースに`mytable`テーブルを作成します。

        ```sql
        CREATE TABLE mytable (
        ID INT,
        REGION VARCHAR(20),
        COUNT INT );
        ```

        > **注記：**
        >
        > `${db_name}.${table_name}-schema.sql`ファイルには 1 つの DDL ステートメントのみを含める必要があります。ファイルに複数の DDL ステートメントが含まれている場合、最初のステートメントのみが有効になります。

## ステップ3. クロスアカウントアクセスを構成する {#step-3-configure-cross-account-access}

TiDB Cloud がAmazon S3 または GCS バケット内の CSV ファイルにアクセスできるようにするには、次のいずれかを実行します。

-   CSV ファイルが Amazon S3 にある場合は、 [Amazon S3 アクセスを構成する](/tidb-cloud/config-s3-and-gcs-access.md#configure-amazon-s3-access) 。

    バケットにアクセスするには、AWS アクセスキーまたはロール ARN のいずれかを使用できます。完了したら、アクセスキー (アクセスキー ID とシークレットアクセスキーを含む) またはロール ARN 値をメモしてください。これらは[ステップ4](#step-4-import-csv-files-to-tidb-cloud)で必要になります。

-   CSV ファイルが GCS にある場合は、 [GCS アクセスを構成する](/tidb-cloud/config-s3-and-gcs-access.md#configure-gcs-access) 。

## ステップ4. CSVファイルをTiDB Cloudにインポートする {#step-4-import-csv-files-to-tidb-cloud}

CSV ファイルをTiDB Cloudにインポートするには、次の手順を実行します。

<SimpleTab>
<div label="Amazon S3">

1.  ターゲット クラスターの**インポート**ページを開きます。

    1.  [TiDB Cloudコンソール](https://tidbcloud.com/)にログインし、プロジェクトの[**クラスター**](https://tidbcloud.com/console/clusters)ページに移動します。

        > **ヒント：**
        >
        > 複数のプロジェクトがある場合は、<mdsvgicon name="icon-left-projects">左下隅にある をクリックして、別のプロジェクトに切り替えます。</mdsvgicon>

    2.  ターゲット クラスターの名前をクリックして概要ページに移動し、左側のナビゲーション ペインで**[インポート]**をクリックします。

2.  **S3 からデータをインポート**を選択します。

    このクラスターにデータを初めてインポートする場合は、 **「Amazon S3 からのインポート」**を選択します。

3.  **「Amazon S3 からのデータのインポート」**ページで、ソース CSV ファイルについて次の情報を入力します。

    -   **インポート ファイル数**: 必要に応じて**1 つのファイル**または**複数のファイル**を選択します。
    -   **含まれるスキーマ ファイル**: このフィールドは、複数のファイルをインポートする場合にのみ表示されます。ソース フォルダーにターゲット テーブル スキーマが含まれている場合は、 **[はい**] を選択します。それ以外の場合は、 **[いいえ]**を選択します。
    -   **データ形式**: **CSV**を選択します。
    -   **ファイルURI**または**フォルダーURI** :
        -   1 つのファイルをインポートする場合は、ソース ファイルの URI と名前を次の形式で入力します`s3://[bucket_name]/[data_source_folder]/[file_name].csv` 。たとえば、 `s3://sampledata/ingest/TableName.01.csv` 。
        -   複数のファイルをインポートする場合は、ソース ファイルの URI と名前を次の形式で入力します`s3://[bucket_name]/[data_source_folder]/` 。たとえば、 `s3://sampledata/ingest/` 。
    -   **バケットアクセス**: バケットにアクセスするには、AWS ロール ARN または AWS アクセスキーのいずれかを使用できます。詳細については、 [Amazon S3 アクセスを構成する](/tidb-cloud/config-s3-and-gcs-access.md#configure-amazon-s3-access)参照してください。
        -   **AWS ロール ARN** : AWS ロール ARN 値を入力します。
        -   **AWS アクセスキー**: AWS アクセスキー ID と AWS シークレットアクセスキーを入力します。

4.  **[接続]**をクリックします。

5.  **[宛先]**セクションで、ターゲット データベースとテーブルを選択します。

    複数のファイルをインポートする場合は、 **[詳細設定]** &gt; **[マッピング設定]**を使用して、各ターゲット テーブルとそれに対応する CSV ファイルのカスタム マッピング ルールを定義できます。その後、提供されたカスタム マッピング ルールを使用してデータ ソース ファイルが再スキャンされます。

    ソース ファイルの URI と名前を**[ソース ファイルの URI と名前]**に入力するときは、次の形式`s3://[bucket_name]/[data_source_folder]/[file_name].csv`になっていることを確認してください。たとえば、 `s3://sampledata/ingest/TableName.01.csv` 。

    ソース ファイルを一致させるためにワイルドカードを使用することもできます。例:

    -   `s3://[bucket_name]/[data_source_folder]/my-data?.csv` : そのフォルダー内の`my-data`で始まり、その後に 1 文字 ( `my-data1.csv`や`my-data2.csv`など) が続くすべての CSV ファイルが同じターゲット テーブルにインポートされます。

    -   `s3://[bucket_name]/[data_source_folder]/my-data*.csv` : フォルダー内の`my-data`で始まるすべての CSV ファイルが同じターゲット テーブルにインポートされます。

    サポートされているのは`?`と`*`のみであることに注意してください。

    > **注記：**
    >
    > URI にはデータ ソース フォルダーが含まれている必要があります。

6.  **[インポートの開始]を**クリックします。

7.  インポートの進行状況が**「完了」と**表示されたら、インポートされたテーブルを確認します。

</div>

<div label="Google Cloud">

1.  ターゲット クラスターの**インポート**ページを開きます。

    1.  [TiDB Cloudコンソール](https://tidbcloud.com/)にログインし、プロジェクトの[**クラスター**](https://tidbcloud.com/console/clusters)ページに移動します。

        > **ヒント：**
        >
        > 複数のプロジェクトがある場合は、<mdsvgicon name="icon-left-projects">左下隅にある をクリックして、別のプロジェクトに切り替えます。</mdsvgicon>

    2.  ターゲット クラスターの名前をクリックして概要ページに移動し、左側のナビゲーション ペインで**[インポート]**をクリックします。

2.  右上隅の**「データのインポート」**をクリックします。

    このクラスタにデータを初めてインポートする場合は、 **[GCS からのインポート]**を選択します。

3.  **GCS からのデータのインポート**ページで、ソース CSV ファイルに関する次の情報を入力します。

    -   **インポート ファイル数**: 必要に応じて**1 つのファイル**または**複数のファイル**を選択します。
    -   **含まれるスキーマ ファイル**: このフィールドは、複数のファイルをインポートする場合にのみ表示されます。ソース フォルダーにターゲット テーブル スキーマが含まれている場合は、 **[はい**] を選択します。それ以外の場合は、 **[いいえ]**を選択します。
    -   **データ形式**: **CSV**を選択します。
    -   **ファイルURI**または**フォルダーURI** :
        -   1 つのファイルをインポートする場合は、ソース ファイルの URI と名前を次の形式で入力します`gs://[bucket_name]/[data_source_folder]/[file_name].csv` 。たとえば、 `gs://sampledata/ingest/TableName.01.csv` 。
        -   複数のファイルをインポートする場合は、ソース ファイルの URI と名前を次の形式で入力します`gs://[bucket_name]/[data_source_folder]/` 。たとえば、 `gs://sampledata/ingest/` 。
    -   **バケット アクセス**: GCS IAMロールを使用してバケットにアクセスできます。詳細については、 [GCS アクセスを構成する](/tidb-cloud/config-s3-and-gcs-access.md#configure-gcs-access)参照してください。

4.  **[接続]**をクリックします。

5.  **[宛先]**セクションで、ターゲット データベースとテーブルを選択します。

    複数のファイルをインポートする場合は、 **[詳細設定]** &gt; **[マッピング設定]**を使用して、各ターゲット テーブルとそれに対応する CSV ファイルのカスタム マッピング ルールを定義できます。その後、提供されたカスタム マッピング ルールを使用してデータ ソース ファイルが再スキャンされます。

    ソース ファイルの URI と名前を**[ソース ファイルの URI と名前]**に入力するときは、次の形式`gs://[bucket_name]/[data_source_folder]/[file_name].csv`になっていることを確認してください。たとえば、 `gs://sampledata/ingest/TableName.01.csv` 。

    ソース ファイルを一致させるためにワイルドカードを使用することもできます。例:

    -   `gs://[bucket_name]/[data_source_folder]/my-data?.csv` : そのフォルダー内の`my-data`で始まり、その後に 1 文字 ( `my-data1.csv`や`my-data2.csv`など) が続くすべての CSV ファイルが同じターゲット テーブルにインポートされます。

    -   `gs://[bucket_name]/[data_source_folder]/my-data*.csv` : フォルダー内の`my-data`で始まるすべての CSV ファイルが同じターゲット テーブルにインポートされます。

    サポートされているのは`?`と`*`のみであることに注意してください。

    > **注記：**
    >
    > URI にはデータ ソース フォルダーが含まれている必要があります。

6.  **[インポートの開始]を**クリックします。

7.  インポートの進行状況が**「完了」と**表示されたら、インポートされたテーブルを確認します。

</div>

</SimpleTab>

インポート タスクを実行するときに、サポートされていない変換や無効な変換が検出されると、 TiDB Cloud はインポート ジョブを自動的に終了し、インポート エラーを報告します。

インポート エラーが発生した場合は、次の手順を実行します。

1.  部分的にインポートされたテーブルを削除します。
2.  テーブル スキーマ ファイルを確認します。エラーがある場合は、テーブル スキーマ ファイルを修正します。
3.  CSV ファイル内のデータ型を確認します。
4.  インポートタスクをもう一度試してください。

## トラブルシューティング {#troubleshooting}

### データのインポート中に警告を解決する {#resolve-warnings-during-data-import}

**[インポートの開始]**をクリックした後、 `can't find the corresponding source files`などの警告メッセージが表示された場合は、正しいソース ファイルを指定するか、 [データインポートの命名規則](/tidb-cloud/naming-conventions-for-data-import.md)に従って既存のファイルの名前を変更するか、**詳細設定**を使用して変更を加えることで解決してください。

これらの問題を解決した後、データを再度インポートする必要があります。

### インポートされたテーブルに行が 0 行あります {#zero-rows-in-the-imported-tables}

インポートの進行状況が**「完了」**と表示されたら、インポートされたテーブルを確認します。行数がゼロの場合は、入力したバケット URI に一致するデータ ファイルがなかったことを意味します。この場合、正しいソース ファイルを指定するか、 [データインポートの命名規則](/tidb-cloud/naming-conventions-for-data-import.md)に従って既存のファイルの名前を変更するか、**詳細設定**を使用して変更を加えることで、この問題を解決します。その後、それらのテーブルを再度インポートします。
