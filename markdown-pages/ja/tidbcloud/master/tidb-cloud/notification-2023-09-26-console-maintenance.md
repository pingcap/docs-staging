---
title: 2023-09-26 TiDB Cloud Console Maintenance Notification
summary: Learn about the details of the TiDB Cloud Console maintenance on Sep 26, 2023, such as the maintenance window, reason, and impact.
---

# [2023-09-26] TiDB Cloudコンソールメンテナンス通知 {#2023-09-26-tidb-cloud-console-maintenance-notification}

この通知では、2023 年 9 月 26 日の[TiDB Cloudコンソール](https://tidbcloud.com/)メンテナンスについて知っておく必要のある詳細について説明します。

## メンテナンス期間 {#maintenance-window}

-   日付: 2023-09-26
-   開始時間: 8:00 (UTC+0)
-   終了時間: 8:30 (UTC+0)
-   所要時間: 約30分

> **注記：**
>
> 現在、 TiDB Cloudコンソールの全体的なメンテナンス スケジュールでは、メンテナンスのタイミングに対するユーザーによる変更はサポートされていません。

## メンテナンスの理由 {#reason-for-maintenance}

当社は、パフォーマンスと効率性を向上させ、すべてのユーザーに優れたエクスペリエンスを提供するために、 TiDB Cloud Serverless の管理インフラストラクチャをアップグレードしています。これは、高品質なサービスを提供するという当社の継続的な取り組みの一環です。

## インパクト {#impact}

メンテナンス期間中、 TiDB Cloudコンソール UI および API 内での作成と更新に関連する機能に断続的な中断が発生する可能性があります。ただし、TiDB クラスターはデータの読み取りと書き込みの通常の操作を維持し、オンライン ビジネスに悪影響が及ばないようにします。

### TiDB Cloudコンソール UI の影響を受ける機能 {#affected-features-of-tidb-cloud-console-ui}

-   クラスタレベル
    -   クラスタ管理
        -   クラスターを作成する
        -   クラスターを削除する
        -   スケールクラスター
        -   クラスターをビュー
        -   クラスターを一時停止または再開する
        -   クラスターのパスワードを変更する
        -   クラスタートラフィックフィルターを変更する
    -   輸入
        -   インポートジョブを作成する
    -   データ移行
        -   移行ジョブを作成する
    -   チェンジフィード
        -   チェンジフィードジョブを作成する
    -   バックアップ
        -   手動バックアップジョブを作成する
        -   自動バックアップジョブ
    -   復元する
        -   復元ジョブを作成する
    -   データベース監査ログ
        -   接続性をテストする
        -   アクセスレコードの追加または削除
        -   データベース監査ログを有効または無効にする
        -   データベース監査ログを再開する
-   プロジェクトレベル
    -   ネットワークアクセス
        -   プライベートエンドポイントを作成する
        -   プライベートエンドポイントを削除する
        -   VPC ピアリングを追加する
        -   VPC ピアリングの削除
    -   メンテナンス
        -   メンテナンスウィンドウを変更する
        -   タスクを延期する
    -   ごみ箱
        -   クラスターを削除する
        -   バックアップを削除する
        -   クラスターを復元する

### TiDB Cloud API の影響を受ける機能 {#affected-features-of-tidb-cloud-api}

-   [APIリクエスト](https://docs.pingcap.com/tidbcloud/api/v1beta)件すべてに500で応答します。
-   [データサービスAPI](https://docs.pingcap.com/tidbcloud/data-service-overview)影響を受けません。

## 完了と再開 {#completion-and-resumption}

メンテナンスが正常に完了すると、影響を受けた機能が復元され、さらに優れたエクスペリエンスが提供されます。

## 支持を得ます {#get-support}

ご質問やサポートが必要な場合は、 [支援チーム](/tidb-cloud/tidb-cloud-support.md)ご連絡ください。お客様の懸念に対処し、必要なガイダンスを提供いたします。
