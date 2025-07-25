---
title: 2023-11-14 TiDB Cloud Dedicated Scale Feature Maintenance Notification
summary: 2023 年 11 月 14 日のTiDB Cloud Dedicated Scale 機能メンテナンスの詳細 (メンテナンス ウィンドウや影響など) について説明します。
---

# [2023-11-14] TiDB Cloud専用スケール機能メンテナンスのお知らせ {#2023-11-14-tidb-cloud-dedicated-scale-feature-maintenance-notification}

この通知では、2023 年 11 月 14 日のTiDB Cloud Dedicated の[スケール機能](https://docs.pingcap.com/tidbcloud/scale-tidb-cluster#scale-your-tidb-cluster)メンテナンスについて知っておく必要のある詳細について説明します。

## メンテナンス期間 {#maintenance-window}

-   開始時間: 2023-11-14 16:00 (UTC+0)
-   終了時間: 2023-11-21 16:00 (UTC+0)
-   期間: 7日間

> **注記：**
>
> 2023-11-16 更新: メンテナンス ウィンドウの終了時刻が 2023-11-16 から 2023-11-21 に延長されました。

## インパクト {#impact}

メンテナンス期間中は、 [vCPUとRAMを変更する](https://docs.pingcap.com/tidbcloud/scale-tidb-cluster#change-vcpu-and-ram)が無効になり、専用クラスターの vCPU と RAM を変更することはできません。ただし、 [クラスタの変更] ページでノード番号またはstorageを変更することはできます。TiDB クラスターは、データの読み取りと書き込みの通常の操作を維持し、オンライン ビジネスに悪影響を与えないようにします。

### TiDB Cloudコンソール UI の影響を受ける機能 {#affected-features-of-tidb-cloud-console-ui}

-   クラスタレベル
    -   クラスタ管理
        -   クラスターを変更する
            -   TiDB、TiKV、またはTiFlashノードの vCPU と RAM を変更します。

### TiDB Cloud API の影響を受ける機能 {#affected-features-of-tidb-cloud-api}

-   クラスタ管理
    -   [クラスターの更新](https://docs.pingcap.com/tidbcloud/api/v1beta#tag/Cluster/operation/UpdateCluster)

## 完了と再開 {#completion-and-resumption}

メンテナンスが正常に完了すると、影響を受けた機能が復元され、さらに優れたエクスペリエンスが提供されます。

## サポートを受ける {#get-support}

ご質問やサポートが必要な場合は、 [サポートチーム](/tidb-cloud/tidb-cloud-support.md)ご連絡ください。お客様の懸念に対処し、必要なガイダンスを提供いたします。
