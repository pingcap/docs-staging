---
title: 2024-04-11 TiDB Cloud Data Migration (DM) Feature Maintenance Notification
summary: Learn about the details of TiDB Cloud Data Migration (DM) feature maintenance on April 11, 2024, such as the maintenance window and impact.
---

# [2024-04-11] TiDB Cloudデータ移行 (DM) 機能メンテナンス通知 {#2024-04-11-tidb-cloud-data-migration-dm-feature-maintenance-notification}

この通知では、2024 年 4 月 11 日のTiDB Cloud Dedicated [データ移行 (DM) 機能](/tidb-cloud/migrate-from-mysql-using-data-migration.md)のメンテナンスについて知っておく必要のある詳細について説明します。

## メンテナンス期間 {#maintenance-window}

-   開始時間: 2024-04-11 08:00 (UTC+0)
-   終了時間: 2024-04-11 09:00 (UTC+0)
-   所要時間: 1時間

## インパクト {#impact}

メンテナンス期間中、次のリージョンの TiDB 専用クラスターの DM 機能が影響を受けます。

-   クラウドプロバイダー: AWS、リージョン: オレゴン (us-west-2)
-   クラウドプロバイダー: AWS、リージョン: 北バージニア (us-east-1)
-   クラウドプロバイダー: AWS、リージョン: シンガポール (ap-southeast-1)
-   クラウドプロバイダー: AWS、リージョン: ソウル (ap-northeast-2)
-   クラウドプロバイダー: AWS、リージョン: フランクフルト (eu-central-1)
-   クラウドプロバイダー: AWS、リージョン: サンパウロ (sa-east-1)
-   クラウドプロバイダー: AWS、リージョン: オレゴン (us-west-2)
-   クラウド プロバイダー: Google Cloud、リージョン: オレゴン (us-west1)
-   クラウドプロバイダー: Google Cloud、リージョン: 東京 (asia-northeast1)
-   クラウド プロバイダー: Google Cloud、リージョン: シンガポール (asia-southeast1)

メンテナンスは TiDB クラスターの DM 機能にのみ影響します。その他の機能はすべて影響を受けません。引き続き TiDB クラスターを管理し、通常どおり読み取り/書き込み操作やその他の操作を実行できます。

AWS にデプロイされたクラスターの場合:

-   アップグレード中も、DM タスクは中断することなく実行を継続できます。DM コンソールは正常に使用できます。

Google Cloud にデプロイされたクラスタの場合:

-   DM コンソールは最大 30 分間使用できなくなります。この期間中は、DM タスクを作成または管理することはできません。
-   DM タスクが増分移行段階にある場合、最大 30 分間中断されます。この期間中は、MySQL データベースのバイナリ ログを消去しないでください。アップグレードが完了すると、DM タスクは自動的に再開されます。
-   DM タスクがフル データのエクスポートおよびインポートの段階にある場合、アップグレード中に失敗し、アップグレード後に再開することはできません。アップグレードの開始時にフル データのエクスポートおよびインポートの段階にある DM タスクがないように、アップグレードを実行する日に DM タスクを作成しないことをお勧めします。

## 完了と再開 {#completion-and-resumption}

メンテナンスが正常に完了すると、影響を受けた機能が復元され、より良いエクスペリエンスが提供されます。

## 支持を得ます {#get-support}

ご質問やサポートが必要な場合は、 [支援チーム](/tidb-cloud/tidb-cloud-support.md)ご連絡ください。お客様の懸念に対処し、必要なガイダンスを提供いたします。
