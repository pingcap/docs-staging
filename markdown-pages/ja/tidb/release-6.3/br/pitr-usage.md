---
title: Use PITR
summary: Learn how to use PITR.
---

# PITR を使用する {#use-pitr}

このドキュメントでは、関連するツールを展開し、ポイント イン タイム リカバリ (PITR) を使用する方法について説明します。この機能を使い始めるのに役立つことを目的としています。

AWS の本番環境に TiDB クラスターをデプロイし、ビジネス チームが次の要件を提案したとします。

-   データの変更を適時にバックアップします。データベースでエラーが発生した場合、最小限のデータ損失でアプリケーション データを迅速に回復できます (数分間のデータ損失のみが許容されます)。
-   毎月特定の時間にビジネス監査を実行します。監査要求を受け取ったら、要求に応じて過去 1 か月の特定の時点でデータをクエリするためのデータベースを提供する必要があります。

PITR を使用すると、上記の要件を満たすことができます。

## TiDB クラスターと BR をデプロイ {#deploy-the-tidb-cluster-and-br}

PITR を使用するには、TiDB クラスター &gt;= v6.2.0 をデプロイし、BR を TiDB クラスターと同じバージョンに更新する必要があります。このドキュメントでは、例として v6.2.0 を使用しています。

次の表は、TiDB クラスターで PITR を使用するために推奨されるハードウェア リソースを示しています。

| 成分   | CPU  | メモリー   | ローカルストレージ | AWS インスタンス | インスタンス数 |
| ---- | ---- | ------ | --------- | ---------- | ------- |
| TiDB | 8コア+ | 16GB以上 | SAS       | c5.2xlarge | 2       |
| PD   | 8コア+ | 16GB以上 | SSD       | c5.2xlarge | 3       |
| TiKV | 8コア+ | 32GB以上 | SSD       | m5.2x大     | 3       |
| ブラジル | 8コア+ | 16GB以上 | SAS       | c5.2xlarge | 1       |
| モニター | 8コア+ | 16GB以上 | SAS       | c5.2xlarge | 1       |

> **ノート：**
>
> -   BR がバックアップおよび復元タスクを実行するとき、PD および TiKV にアクセスする必要があります。 BR とすべての PD および TiKV サーバーが接続されていることを確認します。
> -   BR サーバーと PD サーバーは同じタイム ゾーンを使用する必要があります。

TiUP を使用して TiDB クラスターをデプロイまたはアップグレードします。

-   新しい TiDB クラスターをデプロイするには、 [TiDB クラスターをデプロイする](/production-deployment-using-tiup.md)を参照してください。
-   既存の TiDB クラスターをアップグレードするには、 [TiDB クラスターをアップグレードする](/upgrade-tidb-using-tiup.md)を参照してください。

TiUP を使用して BR をインストールまたはアップグレードします。

-   インストール: `tiup install br:v6.2.0`を実行します。
-   アップグレード: `tiup update br:v6.2.0`を実行します。

## ログのバックアップを有効にする {#enable-log-backup}

ログ バックアップを使用する前に、TiKV 構成ファイルの[`log-backup.enable`](/tikv-configuration-file.md#enable-new-in-v620)が既定値の`true`であることを確認してください。設定変更方法は[構成を変更する](/maintain-tidb-using-tiup.md#modify-the-configuration)を参照してください。

## バックアップ ストレージの構成 (Amazon S3) {#configure-backup-storage-amazon-s3}

バックアップ タスクを開始する前に、次の点を含めてバックアップ ストレージを準備します。

1.  バックアップデータを格納する S3 バケットとディレクトリを準備します。
2.  S3 バケットにアクセスする権限を設定します。
3.  バックアップ データを格納するディレクトリを計画します。

詳細な手順は次のとおりです。

1.  バックアップデータを保存するディレクトリを S3 に作成します。この例のディレクトリは`s3://tidb-pitr-bucket/backup-data`です。

    1.  バケットを作成します。バックアップ データを保存する既存の S3 を選択できます。無い場合は[AWS ドキュメント - バケットの作成](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html)を参照してS3バケットを作成してください。この例では、バケット名は`tidb-pitr-bucket`です。
    2.  バックアップ データ用のディレクトリを作成します。バケット ( `tidb-pitr-bucket` ) で、 `backup-data`という名前のディレクトリを作成します。詳細な手順については、 [AWS ドキュメント - フォルダを使用して Amazon S3 コンソールでオブジェクトを整理する](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-folders.html)を参照してください。

2.  S3 ディレクトリにアクセスするための BR と TiKV のアクセス許可を構成します。 S3 バケットにアクセスする最も安全な方法であるIAMメソッドを使用してアクセス許可を付与することをお勧めします。詳細な手順については、 [AWS ドキュメント - ユーザー ポリシーによるバケットへのアクセスの制御](https://docs.aws.amazon.com/AmazonS3/latest/userguide/walkthrough1.html)を参照してください。必要な権限は次のとおりです。

    -   バックアップ クラスター内の TiKV および BR には、 `s3://tidb-pitr-bucket/backup-data`ディレクトリの`s3:ListBucket` 、 `s3:PutObject` 、および`s3:AbortMultipartUpload`のアクセス許可が必要です。
    -   復元クラスタの TiKV と BR には、 `s3://tidb-pitr-bucket/backup-data`ディレクトリの`s3:ListBucket`と`s3:GetObject`の権限が必要です。

3.  スナップショット (完全) バックアップとログ バックアップを含む、バックアップ データを格納するディレクトリ構造を計画します。

    -   すべてのスナップショット バックアップ データは、 `s3://tidb-pitr-bucket/backup-data/snapshot-${date}`ディレクトリに格納されます。 `${date}`は、スナップショット バックアップの開始時刻です。たとえば、2022/05/12 00:01:30 から始まるスナップショット バックアップは`s3://tidb-pitr-bucket/backup-data/snapshot-20220512000130`に格納されます。
    -   ログバックアップデータは`s3://tidb-pitr-bucket/backup-data/log-backup/`ディレクトリに格納されます。

## バックアップ ポリシーを決定する {#determine-the-backup-policy}

最小限のデータ損失、迅速な復旧、および 1 か月以内のビジネス監査の要件を満たすために、次のようにバックアップ ポリシーを設定できます。

-   ログ バックアップを実行して、データベースのデータ変更を継続的にバックアップします。
-   2 日ごとに 00:00 にスナップショット バックアップを実行します。
-   スナップショット バックアップ データとログ バックアップ データを 30 日以内に保持し、30 日より古いバックアップ データをクリーンアップします。

## ログのバックアップを実行する {#run-log-backup}

ログ バックアップ タスクが開始されると、TiKV クラスターでログ バックアップ プロセスが実行され、データベース内のデータ変更が S3 ストレージに継続的に送信されます。ログ バックアップ タスクを開始するには、次のコマンドを実行します。

```shell
tiup br log start --task-name=pitr --pd=172.16.102.95:2379 --storage='s3://tidb-pitr-bucket/backup-data/log-backup'
```

ログ バックアップ タスクの実行中に、バックアップ ステータスを照会できます。

```shell
tiup br log status --task-name=pitr --pd=172.16.102.95:2379

● Total 1 Tasks.
> #1 <
    name: pitr
    status: ● NORMAL
    start: 2022-05-13 11:09:40.7 +0800
      end: 2035-01-01 00:00:00 +0800
    storage: s3://tidb-pitr-bucket/backup-data/log-backup
    speed(est.): 0.00 ops/s
checkpoint[global]: 2022-05-13 11:31:47.2 +0800; gap=4m53s
```

## スナップショット バックアップの実行 {#run-snapshot-backup}

crontab などの自動ツールを使用して、定期的にスナップショット バックアップ タスクを実行できます。たとえば、2 日おきに 00:00 にスナップショット バックアップを実行します。

次に、2 つのスナップショット バックアップの例を示します。

-   2022/05/14 00:00:00 にスナップショット バックアップを実行します。

    ```shell
    tiup br backup full --pd=172.16.102.95:2379 --storage='s3://tidb-pitr-bucket/backup-data/snapshot-20220514000000' --backupts='2022/05/14 00:00:00'
    ```

-   2022/05/16 00:00:00 にスナップショット バックアップを実行します。

    ```shell
    tiup br backup full --pd=172.16.102.95:2379 --storage='s3://tidb-pitr-bucket/backup-data/snapshot-20220516000000' --backupts='2022/05/16 00:00:00'
    ```

## PITR を実行する {#run-pitr}

2022/05/15 18:00:00 にデータをクエリする必要があるとします。 PITR を使用して、2022/05/14 に作成されたスナップショット バックアップと、スナップショットと 2022/05/15 18:00:00 の間のログ バックアップを復元することで、クラスターをそのタイムスタンプに復元できます。

コマンドは次のとおりです。

```shell
tiup br restore point --pd=172.16.102.95:2379
--storage='s3://tidb-pitr-bucket/backup-data/log-backup'
--full-backup-storage='s3://tidb-pitr-bucket/backup-data/snapshot-20220514000000'
--restored-ts '2022-05-15 18:00:00+0800'

Full Restore <--------------------------------------------------------------------------------------------------------------------------------------------------------> 100.00%
[2022/05/29 18:15:39.132 +08:00] [INFO] [collector.go:69] ["Full Restore success summary"] [total-ranges=12] [ranges-succeed=xxx] [ranges-failed=0] [split-region=xxx.xxxµs] [restore-ranges=xxx] [total-take=xxx.xxxs] [restore-data-size(after-compressed)=xxx.xxx] [Size=xxxx] [BackupTS={TS}] [total-kv=xxx] [total-kv-size=xxx] [average-speed=xxx]
Restore Meta Files <--------------------------------------------------------------------------------------------------------------------------------------------------> 100.00%
Restore KV Files <----------------------------------------------------------------------------------------------------------------------------------------------------> 100.00%
[2022/05/29 18:15:39.325 +08:00] [INFO] [collector.go:69] ["restore log success summary"] [total-take=xxx.xx] [restore-from={TS}] [restore-to={TS}] [total-kv-count=xxx] [total-size=xxx]
```

## 古いデータのクリーンアップ {#clean-up-outdated-data}

crontab などの自動ツールを使用して、2 日ごとに古いデータをクリーンアップできます。

たとえば、次のコマンドを実行して古いデータをクリーンアップできます。

-   2022/05/14 00:00:00より前のスナップショットデータを削除

    ```shell
    rm s3://tidb-pitr-bucket/backup-data/snapshot-20220514000000
    ```

-   2022/05/14 00:00:00より前のログバックアップデータを削除

    ```shell
    tiup br log truncate --until='2022-05-14 00:00:00 +0800' --storage='s3://tidb-pitr-bucket/backup-data/log-backup'
    ```

## もっと詳しく知る {#learn-more}

-   [CLI 経由で PITR を使用する](/br/br-log-command-line.md)
-   [PITRの概要](/br/point-in-time-recovery.md)
