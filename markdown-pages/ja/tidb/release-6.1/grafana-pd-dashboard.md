---
title: Key Monitoring Metrics of PD
summary: Learn some key metrics displayed on the Grafana PD dashboard.
---

# PD の主要な監視指標 {#key-monitoring-metrics-of-pd}

TiUP を使用して TiDB クラスターをデプロイすると、監視システム (Prometheus &amp; Grafana) が同時にデプロイされます。詳細については、 [監視フレームワークの概要](/tidb-monitoring-framework.md)を参照してください。

Grafana ダッシュボードは、Overview、PD、TiDB、TiKV、Node_exporter、Disk Performance、および Performance_overview を含む一連のサブ ダッシュボードに分かれています。診断に役立つ多くの指標があります。

主要なメトリックが表示される PD ダッシュボードから、コンポーネントの PD ステータスの概要を取得できます。このドキュメントでは、これらの主要な指標について詳しく説明します。

以下は、PD ダッシュボード メトリック アイテムの説明です。

-   PD ロール: 現在の PD インスタンスのロール
-   ストレージ容量: この TiDB クラスターの合計ストレージ容量
-   現在のストレージ サイズ: TiDB クラスターによって現在使用されているストレージ サイズ
-   現在のストレージ使用率: 現在のストレージ使用率
-   通常のストア: 正常なストレージ インスタンスの数
-   Number of Regions: クラスタ リージョンの合計数
-   異常な店舗: 異常な店舗の数。通常の値は`0`です。数値が`0`より大きい場合、少なくとも 1 つのインスタンスが異常であることを意味します。
-   リージョンの正常性: 保留中のピア、ダウンしているピア、余分なピア、オフラインのピア、欠落しているピア、学習者のピア、不適切な名前空間など、異常なリージョンの数によって示されるリージョンの正常性ステータス。通常、保留中のピアの数は`100`未満にする必要があります。不足しているピアが永続的に`0`を超えないようにする必要があります。空のリージョンが多数存在する場合は、時間内にリージョンマージを有効にします。
-   現在のピア数: すべてのクラスタ ピアの現在の数![PD Dashboard - Header](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-header-v4.png)

## 主要指標の説明 {#key-metrics-description}

## クラスタ {#cluster}

-   PD スケジューラ構成: PD スケジューラ構成のリスト
-   クラスタID: クラスターの一意の識別子
-   現在の TSO: 現在割り当てられている TSO の物理部分
-   現在の ID 割り当て: 新しいストア/ピアに割り当て可能な最大 ID
-   リージョンラベル分離レベル: 異なるラベル レベルのリージョンの数
-   ラベルの配布: クラスタ内のラベルの配布ステータス

![PD Dashboard - Cluster metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-cluster-v4.png)

## オペレーター {#operator}

-   Schedule operator create: タイプごとの新しく作成されたオペレーターの数
-   オペレーター チェックのスケジュール: タイプごとのチェックされたオペレーターの数。主に、現在のステップが終了したかどうかをチェックします。はいの場合、実行する次のステップを返します
-   オペレータの終了スケジュール: タイプごとの終了したオペレータの数
-   オペレーターのタイムアウトのスケジュール: タイプごとのタイムアウト オペレーターの数
-   交換またはキャンセルされたスケジュール オペレーター: タイプごとの交換またはキャンセルされたオペレーターの数
-   州ごとのオペレーター数のスケジュール: 州ごとのオペレーター数
-   オペレーターの終了時間: 終了したオペレーターの最大時間
-   オペレーターのステップ所要時間: 完了したオペレーターのステップの最大所要時間

![PD Dashboard - Operator metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-operator-v4.png)

## 統計- バランス {#statistics-balance}

-   ストア容量: TiKV インスタンスあたりの容量サイズ
-   Store available: TiKV インスタンスあたりの利用可能な容量サイズ
-   Store used: TiKV インスタンスあたりの使用済み容量サイズ
-   サイズ増幅: TiKV インスタンスあたりのサイズ増幅率。これは、(ストアリージョンサイズ)/(ストア使用容量サイズ) に等しくなります。
-   サイズ使用可能率: TiKV インスタンスあたりのサイズ使用可能率であり、(ストア使用可能容量サイズ)/(ストア容量サイズ) に等しくなります。
-   ストア リーダー スコア: TiKV インスタンスごとのリーダー スコア
-   ストアリージョンスコア: TiKV インスタンスごとのリージョンスコア
-   ストア リーダー サイズ: TiKV インスタンスあたりの合計リーダー サイズ
-   ストアリージョンサイズ: TiKV インスタンスあたりの合計リージョンサイズ
-   Store リーダー数: TiKV インスタンスごとのリーダー数
-   ストアリージョン数: TiKV インスタンスごとのリージョン数

![PD Dashboard - Balance metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-balance-v4.png)

## 統計- ホットライト {#statistics-hot-write}

-   ホット リージョンのリーダー分布: 各 TiKV インスタンスで書き込みホットスポットになったリーダー リージョンの総数
-   ホット リーダー リージョンに書き込まれた合計バイト数: 各 TiKV インスタンスで書き込みホットスポットになったリーダー リージョンによって書き込まれた合計バイト数
-   ホット書き込みリージョンのピア分布: 各 TiKV インスタンスで書き込みホットスポットになったピア リージョンの総数
-   ホット ピア リージョンの合計書き込みバイト数: 各 TiKV インスタンスで書き込みホットスポットになったすべてのピア リージョンの書き込みバイト数
-   Store Write rate bytes: 各 TiKV インスタンスに書き込まれた合計バイト数
-   Store Write rate keys: 各 TiKV インスタンスに書き込まれたキーの合計
-   ホット キャッシュ書き込みエントリ数: 書き込みホットスポット統計モジュールにある各 TiKV インスタンスのピアの数
-   セレクター イベント: ホットスポット スケジューリング モジュールのセレクターのイベント数
-   ホットスポット移動リーダーの方向: ホットスポット スケジューリングにおけるリーダー移動の方向。正の数は、インスタンスへのスケジューリングを意味します。負の数は、インスタンスからスケジュールされていることを意味します
-   ホットスポット移動ピアの方向: ホットスポット スケジューリングにおけるピア移動の方向。正の数は、インスタンスへのスケジューリングを意味します。負の数は、インスタンスのスケジュール アウトを意味します

![PD Dashboard - Hot write metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-hotwrite-v4.png)

## 統計- ホットリード {#statistics-hot-read}

-   ホット リージョンのピア分布: 各 TiKV インスタンスで読み取りホットスポットになったピア リージョンの総数
-   ホット ピア リージョンの合計読み取りバイト数: 各 TiKV インスタンスで読み取りホットスポットになったピアの合計読み取りバイト数
-   Store read rate bytes: 各 TiKV インスタンスの合計読み取りバイト数
-   読み取り率キーの保存: 各 TiKV インスタンスの合計読み取りキー
-   ホット キャッシュ読み取りエントリ数: 各 TiKV インスタンスの読み取りホットスポット統計モジュールにあるピアの数

![PD Dashboard - Hot read metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-hotread-v4.png)

## スケジューラー {#scheduler}

-   スケジューラーが実行中: 現在実行中のスケジューラー
-   リーダーの動きのバランス: TiKV インスタンス間のリーダーの動きの詳細
-   リージョン移動のバランス: TiKV インスタンス間のリージョン移動の詳細
-   バランス リーダー イベント: バランス リーダー イベントの数
-   Balance リージョン event: バランスリージョンイベントの数
-   バランス リーダー スケジューラ: バランス リーダー スケジューラの内部ステータス
-   バランスリージョンスケジューラ: バランスリージョンスケジューラの内部ステータス
-   レプリカ チェッカー: レプリカ チェッカーのステータス
-   ルール チェッカー: ルール チェッカーのステータス
-   リージョンマージ チェッカー: マージ チェッカーのステータス
-   フィルター対象: ストアがスケジューリング対象として選択されたものの、フィルターを通過できなかった試行回数
-   フィルター ソース: ストアがスケジュール ソースとして選択されたものの、フィルターを通過できなかった回数
-   バランス方向: ストアがスケジュールのターゲットまたはソースとして選択された回数
-   ストア制限: ストアでのスケジューリングのフロー制御制限

![PD Dashboard - Scheduler metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-scheduler-v4.png)

## gRPC {#grpc}

-   コマンドの完了率: gRPC コマンドが完了したコマンドの種類ごとの率
-   99% 完了したコマンドの持続時間: gRPC コマンドが完了したコマンドの種類ごとの割合 (P99)

![PD Dashboard - gRPC metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-grpc-v2.png)

## etcd {#etcd}

-   トランザクション数の処理: etcd がトランザクションを処理する割合
-   99% 取引処理時間: 取引処理率 (P99)
-   99% WAL fsync 期間: WAL を永続ストレージに書き込むのにかかった時間。 `1s`未満です（P99）
-   99% ピア ラウンド トリップ時間 (秒): etcd のネットワークレイテンシー(P99) |値が`1s`未満です
-   etcd disk WAL fsync rate: WAL を永続ストレージに書き込む速度
-   Raft term: Raftの現在の用語
-   Raftコミット インデックス: Raftの最後にコミットされたインデックス
-   Raft適用インデックス: Raftの最後の適用インデックス

![PD Dashboard - etcd metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-etcd-v2.png)

## TiDB {#tidb}

-   PD サーバー TSO 処理時間とクライアント受信時間: PD が TSO 要求を受信してから PD クライアントが TSO 応答を取得するまでの時間
-   処理リクエスト数: TiDB リクエストの数
-   リクエストの処理時間: TiDB リクエストの処理にかかった時間。 `100ms`未満であること（P99）

![PD Dashboard - TiDB metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-tidb-v4.png)

## ハートビート {#heartbeat}

-   ハートビート リージョン イベントの QPS: キャッシュの更新やデータの永続化を含む、ハートビート メッセージの処理の QPS
-   リージョンハートビート レポート: インスタンスごとに PD に報告されたハートビートの数
-   リージョンハートビート レポート エラー: ステータスが`error`のハートビートの数
-   リージョン heartbeat report active: ステータスが`ok`のハートビートの数
-   リージョンスケジュール プッシュ: PD から送信された、TiKV インスタンスごとの対応するスケジュール コマンドの数
-   99%リージョンハートビートレイテンシー: TiKV インスタンスごとのハートビートレイテンシー(P99)

![PD Dashboard - Heartbeat metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-heartbeat-v4.png)

## リージョンストレージ {#region-storage}

-   Syncer Index: リーダーが記録したリージョン変更履歴の最大インデックス
-   history last index:リージョンの変更履歴がフォロワーと正常に同期された最後のインデックス

![PD Dashboard - Region storage](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-region-storage.png)
