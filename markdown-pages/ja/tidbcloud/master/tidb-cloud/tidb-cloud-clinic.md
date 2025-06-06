---
title: TiDB Cloud Clinic
summary: 高度な監視と診断のためにTiDB Cloud Clinic を使用する方法を学習します。
---

# TiDB Cloudクリニック {#tidb-cloud-clinic}

TiDB Cloud Clinic は、 TiDB Cloud上で高度な監視および診断機能を提供します。詳細な分析と実用的な洞察により、パフォーマンスの問題を迅速に特定し、データベースを最適化し、全体的なパフォーマンスを向上させることができるように設計されています。

![tidb-cloud-clinic](https://docs-download.pingcap.com/media/images/docs/tidb-cloud/tidb-cloud-clinic.png)

> **注記：**
>
> 現在、 TiDB Cloud Clinic は[TiDB Cloud専用](/tidb-cloud/select-cluster-tier.md#tidb-cloud-dedicated)クラスターでのみ使用できます。

## 前提条件 {#prerequisites}

TiDB Cloud Clinic は、**エンタープライズ**または**プレミアム**サポート プランに加入している組織でのみご利用いただけます。

## クラスタページをビュー {#view-the-cluster-page}

**クラスタ**ページを表示するには、次の手順を実行します。

1.  [TiDB Cloudクリニック コンソール](https://clinic.pingcap.com/)にログインし、 **「TiDB アカウントで続行」**を選択して、 TiDB Cloudログイン ページに入ります。

2.  組織リストから対象の組織を選択します。選択したプロジェクト内のクラスターが表示されます。

3.  ターゲットクラスタの名前をクリックします。クラスタの概要ページが表示され、クラスタに関する以下の詳細情報を確認できます。

    -   高度なメトリクス
    -   最も遅いクエリ（クラスターの TiDB バージョンが v8.1.1 以降、v7.5.4 以降の場合にのみサポートされます）
    -   TopSQL (クラスターの TiDB バージョンが v8.1.1 以降、v7.5.4 以降の場合にのみサポートされます)
    -   ベンチマークレポート

## 高度な指標を監視する {#monitor-advanced-metrics}

TiDB Cloud ClinicはGrafanaを使用して、TiDBクラスターの包括的なメトリクスセットを提供します。高度なメトリクスの保持ポリシーは90日間です。

メトリクス ダッシュボードを表示するには、次の手順を実行します。

1.  [TiDB Cloudクリニック コンソール](https://clinic.pingcap.com/)で、クラスターの**「クラスタ」**ページに移動します。

2.  **「メトリクス」**をクリックします。

3.  表示したいダッシュボードの名前をクリックします。ダッシュボードが表示されます。

ダッシュボードとその内容は変更される場合があります。現在、以下のダッシュボードをご利用いただけます。

-   バックアップとインポート
-   DMプロフェッショナル
-   DM標準
-   稲妻
-   パフォーマンス概要
-   TiCDC-概要
-   TiDB
-   TiDB リソース制御
-   TiFlash-概要
-   TiKV詳細
-   ユーザーノード情報

## 最も遅いクエリを分析する {#analyze-top-slow-queries}

デフォルトでは、300 ミリ秒以上かかる SQL クエリは遅いクエリと見なされます。

TiDB Cloudコンソールのデフォルトの[**遅いクエリ**](/tidb-cloud/tune-performance.md#slow-query)ページでは、パフォーマンスに影響を与えるクエリを特定するのが困難な場合があります。特に、スロークエリが多数存在するクラスタではなおさらです。TiDB TiDB Cloud Clinicの**「Top Slow Queries」**機能は、スロークエリのログに基づいて集計分析を提供します。この機能により、パフォーマンスに問題のあるクエリを簡単に特定できるため、全体的なパフォーマンスチューニング時間を少なくとも半分に短縮できます。

「上位の遅いクエリ」には、SQL ダイジェストによって集計された上位 10 件のクエリが、次のディメンションで並べ替えられて表示されます。

-   合計レイテンシー
-   最大レイテンシー
-   平均レイテンシー
-   合計メモリ
-   最大メモリ
-   平均メモリ
-   合計数

クラスター内の遅いクエリを表示するには、次の手順を実行します。

1.  [TiDB Cloudクリニック コンソール](https://clinic.pingcap.com/)で、クラスターの**「クラスタ」**ページに移動します。

2.  **[スロー クエリ]**をクリックします。

3.  最も遅いクエリが表に表示されます。結果は列ごとに並べ替えることができます。

4.  (オプション) リスト内の遅いクエリをクリックすると、詳細な実行情報が表示されます。

5.  (オプション) 時間範囲、データベース、またはステートメントの種類別に遅いクエリをフィルタリングします。

低速クエリの保持ポリシーは 7 日間です。

詳細については[TiDBダッシュボードの遅いクエリ](https://docs.pingcap.com/tidb/stable/dashboard-slow-query)参照してください。

## TopSQLを監視する {#monitor-topsql}

TiDB Cloud ClinicはTopSQL情報を提供し、データベース内の各SQL文のCPUオーバーヘッドをリアルタイムで監視し、視覚的に調査することができます。これにより、データベースのパフォーマンスに関する問題の最適化と解決に役立ちます。

TopSQL を表示するには、次の手順を実行します。

1.  [TiDB Cloudクリニック コンソール](https://clinic.pingcap.com/)で、クラスターの**「クラスタ」**ページに移動します。

2.  **TopSQL**をクリックします。

3.  特定のTiDBまたはTiKVインスタンスを選択して、その負荷を監視します。時間ピッカーを使用するか、チャートで時間範囲を選択して、分析を絞り込むことができます。

4.  TopSQL によって表示されるグラフと表を分析します。

詳細については[TiDBダッシュボードのTopSQL](https://docs.pingcap.com/tidb/stable/top-sql)参照してください。

## ベンチマークレポートを生成する {#generate-benchmark-reports}

**ベンチマークレポート**機能は、パフォーマンステスト中にTiDBクラスタのパフォーマンス問題を特定するのに役立ちます。ストレステストを完了すると、ベンチマークレポートを生成してクラスタのパフォーマンスを分析できます。レポートには、特定されたボトルネックが強調表示され、最適化の提案が提示されます。これらの提案を適用した後、もう一度ストレステストを実行し、新しいベンチマークレポートを生成してパフォーマンスの改善を比較できます。

ベンチマーク レポートを生成するには、次の手順を実行します。

1.  [TiDB Cloudクリニック コンソール](https://clinic.pingcap.com/)で、クラスターの**「クラスタ」**ページに移動します。

2.  **ベンチマークレポート**をクリックします。

3.  ベンチマーク レポートで分析する時間範囲を選択します。

4.  ベンチマーク レポートを生成するには、 **[レポートの作成] を**クリックします。

5.  レポートの生成が完了するまでお待ちください。レポートが完成したら、 **「ビュー」**をクリックして開きます。
