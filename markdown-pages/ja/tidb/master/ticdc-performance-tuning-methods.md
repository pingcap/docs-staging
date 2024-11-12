---
title: TiCDC Performance Analysis and Tuning Methods
summary: パフォーマンス概要ダッシュボードに TiCDC メトリックを導入し、TiCDC ワークロードをより適切に理解して監視できるようにします。
---

# TiCDC パフォーマンス分析とチューニング方法 {#ticdc-performance-analysis-and-tuning-methods}

このドキュメントでは、TiCDC のリソース使用率と主要なパフォーマンス メトリックを紹介します。パフォーマンス概要ダッシュボードの[CDCパネル](/grafana-performance-overview-dashboard.md#cdc)を通じて、データ レプリケーションに関する TiCDC のパフォーマンスを監視および評価できます。

## TiCDC クラスターのリソース利用 {#resource-utilization-of-a-ticdc-cluster}

次の 3 つのメトリックを使用すると、TiCDC クラスターのリソース使用率をすぐに取得できます。

-   CPU 使用率: TiCDC ノードごとの CPU 使用率。
-   メモリ使用量: TiCDC ノードごとのメモリ使用量。
-   ゴルーチン数: TiCDC ノードあたりのゴルーチンの数。

## TiCDCデータレプリケーションの主要指標 {#key-metrics-for-ticdc-data-replication}

### TiCDC 全体指標 {#ticdc-overall-metrics}

次のメトリックを使用すると、TiCDC データ レプリケーションの概要を把握できます。

-   Changefeed チェックポイント ラグ: アップストリームとダウンストリーム間のデータ複製の進行ラグ (秒単位で測定)。

    TiCDC がデータを消費してダウンストリームに書き込む速度がアップストリーム データの変更に追いついている場合、このメトリックは小さなレイテンシー範囲内 (通常は 10 秒以内) に留まります。そうでない場合、このメトリックは増加し続けます。

    このメトリック (つまり`Changefeed checkpoint lag` ) が増加する場合、一般的な理由は次のとおりです。

    -   システム リソースが不十分: TiCDC の CPU、メモリ、またはディスク領域が不十分な場合、データ処理が遅くなりすぎて、TiCDC 変更フィードのチェックポイントが長くなる可能性があります。
    -   ネットワークの問題: TiCDC でネットワークの中断、遅延、または帯域幅不足が発生すると、データ転送速度に影響し、TiCDC 変更フィードのチェックポイントが長くなる可能性があります。
    -   アップストリームでの QPS が高い: TiCDC で処理されるデータが大きすぎる場合、データ処理のタイムアウトが発生し、TiCDC 変更フィードのチェックポイントが増加する可能性があります。通常、単一の TiCDC ノードは最大約 60K の QPS を処理できます。
    -   データベースの問題:
        -   アップストリーム TiKV クラスターの`min resolved ts`と最新の PD TSO の間のギャップは大きいです。この問題は通常、アップストリームの書き込みワークロードが過度に重い場合に、TiKV が解決された ts を時間内に進めることができないために発生します。
        -   ダウンストリーム データベースの書き込みレイテンシーが大きいため、TiCDC がダウンストリームにデータをタイムリーに複製できなくなります。

-   Changefeed 解決 ts ラグ: TiCDC ノードの内部レプリケーション ステータスとアップストリーム間の進行ラグ (秒単位で測定)。このメトリックが高い場合、TiCDC Puller または Sorter モジュールのデータ処理能力が不十分であるか、ネットワークレイテンシーまたはディスクの読み取り/書き込み速度の遅い問題が発生している可能性があります。このような場合、TiCDC の効率的で安定した動作を確保するには、TiCDC ノードの数を増やすか、ネットワーク構成を最適化するなどの適切な対策を講じる必要があります。

-   changefeed のステータス: changefeed のステータスの説明については、 [チェンジフィード状態転送](/ticdc/ticdc-changefeed-overview.md)参照してください。

例 1: 単一の TiCDC ノードの場合、上流 QPS が高いためにチェックポイントの遅延が大きくなる

次の図に示すように、アップストリーム QPS が過度に高く、クラスター内に TiCDC ノードが 1 つしかないため、TiCDC ノードが過負荷になり、CPU 使用率が高くなり、 `Changefeed checkpoint lag`と`Changefeed resolved ts lag`の両方が増加し続けます。changefeed ステータスは断続的に`0`から`1`に遷移し、changefeed でエラーが発生し続けていることを示しています。次のようにリソースを追加して、この問題を解決してみてください。

-   TiCDC ノードを追加します。処理能力を高めるために、TiCDC クラスターを複数のノードにスケールアウトします。
-   TiCDC ノードのリソースを最適化します。TiCDC ノードの CPU とメモリの構成を増やしてパフォーマンスを向上させます。

![TiCDC overview](https://download.pingcap.com/images/docs/performance/cdc/cdc-slow.png)

### データフローのスループット指標とダウンストリームのレイテンシー {#data-flow-throughput-metrics-and-downstream-latency}

次のメトリックを使用すると、TiCDC のデータフロー スループットとダウンストリームレイテンシーを確認できます。

-   Puller 出力イベント/秒: TiCDC ノードの Puller モジュールが Sorter モジュールに 1 秒あたりに送信する行数。
-   ソーター出力イベント/秒: TiCDC ノードのソーター モジュールがマウント モジュールに 1 秒あたりに送信する行数。
-   マウンタ出力イベント/秒: TiCDC ノードのマウンタ モジュールがシンク モジュールに 1 秒あたりに送信する行数。
-   テーブル シンク出力イベント/秒: TiCDC ノードのテーブル ソーター モジュールがシンク モジュールに 1 秒あたりに送信する行数。
-   SinkV2 - シンク フラッシュ行数/秒: TiCDC ノードのシンク モジュールがダウンストリームに 1 秒あたりに送信する行数。
-   トランザクションシンクの完全フラッシュ期間: TiCDC ノードの MySQL シンクによるダウンストリーム トランザクションの書き込みの平均レイテンシーと p999レイテンシー。
-   MQ ワーカーのメッセージ送信期間パーセンタイル: ダウンストリームが Kafka の場合の MQ ワーカーによるメッセージ送信のレイテンシー。
-   Kafka 送信バイト: MQ ワークロードでのダウンストリーム トランザクションの書き込みトラフィック。

例 2: 下流データベースの書き込み速度が TiCDC データ複製パフォーマンスに与える影響

次の図に示すように、アップストリームとダウンストリームの両方が TiDB クラスターです。TiCDC `Puller output events/s`メトリックは、アップストリーム データベースの QPS を示します。3 メトリック`Transaction Sink Full Flush Duration` 、ダウンストリーム データベースの平均書き込みレイテンシーを示します。これは、最初のワークロードでは高く、2 番目のワークロードでは低くなります。

-   最初のワークロードでは、下流の TiDB クラスターがゆっくりとデータを書き込むため、TiCDC は上流の QPS よりも遅い速度でデータを消費し、 `Changefeed checkpoint lag`が継続的に増加します。ただし、 `Changefeed resolved ts lag` 300 ミリ秒以内に留まり、レプリケーションの遅延とスループットのボトルネックは、プラー モジュールとソーター モジュールではなく、下流のシンク モジュールによって発生していることを示しています。
-   2 番目のワークロードでは、ダウンストリームの TiDB クラスターがデータをより速く書き込むため、TiCDC はアップストリームに完全に追いつく速度でデータを複製し、 `Changefeed checkpoint lag`と`Changefeed resolved ts lag` 500 ミリ秒以内に留まります。これは、TiCDC にとって比較的理想的なレプリケーション速度です。

![TiCDC overview](https://download.pingcap.com/images/docs/performance/cdc/cdc-fast-1.png)

![data flow and txn latency](https://download.pingcap.com/images/docs/performance/cdc/cdc-fast-2.png)
