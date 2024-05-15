---
title: Third-Party Metrics Integrations（Beta）
summary: Learn how to use third-party metrics integrations.
---

# サードパーティメトリクス統合（ベータ版） {#third-party-metrics-integrations-beta}

TiDB Cloudをサードパーティのメトリクス サービスと統合して、 TiDB Cloudアラートを受信し、メトリクス サービスを使用して TiDB クラスターのパフォーマンス メトリクスを表示できます。サードパーティのメトリクス統合は現在ベータ版です。

## 必要なアクセス {#required-access}

サードパーティ統合設定を編集するには、組織の`Organization Owner`のロールまたは対象プロジェクトの`Project Owner`のロールを持っている必要があります。

## サードパーティの統合をビューまたは変更する {#view-or-modify-third-party-integrations}

1.  [TiDB Cloudコンソール](https://tidbcloud.com)にログインします。
2.  クリック<mdsvgicon name="icon-left-projects">左下隅で、複数のプロジェクトがある場合は対象プロジェクトに切り替えて、 **[プロジェクト設定]**をクリックします。</mdsvgicon>
3.  プロジェクトの**プロジェクト設定**ページで、左側のナビゲーション ペインの**[統合] を**クリックします。

利用可能なサードパーティ統合が表示されます。

## 制限 {#limitation}

-   [TiDB サーバーレス](/tidb-cloud/select-cluster-tier.md#tidb-serverless)クラスターの場合、サードパーティのメトリック統合はサポートされていません。

-   クラスターのステータスが**CREATING** 、 **RESTORING** 、 **PAUSED** 、または**RESUMING の**場合、サードパーティのメトリクス統合は使用できません。

## 利用可能な統合 {#available-integrations}

### Datadog 統合 (ベータ版) {#datadog-integration-beta}

Datadog 統合を使用すると、 TiDB Cloudを構成して、TiDB クラスターに関するメトリック データを[データドッグ](https://www.datadoghq.com/)に送信し、これらのメトリックを Datadog ダッシュボードで表示できます。

詳細な統合手順と Datadog が追跡するメトリクスのリストについては、 [TiDB Cloudと Datadog を統合する](/tidb-cloud/monitor-datadog-integration.md)を参照してください。

### Prometheus と Grafana の統合 (ベータ版) {#prometheus-and-grafana-integration-beta}

Prometheus と Grafana の統合により、 TiDB Cloudから Prometheus 用の`scrape_config`ファイルを取得し、そのファイルの内容を使用して Prometheus を構成できます。これらのメトリックは Grafana ダッシュボードで表示できます。

詳細な統合手順と Prometheus が追跡するメトリックのリストについては、 [TiDB Cloud をPrometheus および Grafana と統合する](/tidb-cloud/monitor-prometheus-and-grafana-integration.md)参照してください。

### New Relic 統合 (ベータ版) {#new-relic-integration-beta}

New Relic 統合を使用すると、 TiDB Cloudを構成して、TiDB クラスターに関するメトリック データを[ニューレリック](https://newrelic.com/)に送信し、これらのメトリックを New Relic ダッシュボードで表示できます。

詳細な統合手順と New Relic が追跡するメトリックのリストについては、 [TiDB CloudとNew Relicを統合する](/tidb-cloud/monitor-new-relic-integration.md)参照してください。
