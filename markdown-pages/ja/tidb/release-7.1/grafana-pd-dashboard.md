---
title: Key Monitoring Metrics of PD
summary: Learn some key metrics displayed on the Grafana PD dashboard.
---

# PD の主要なモニタリング指標 {#key-monitoring-metrics-of-pd}

TiUPを使用して TiDB クラスターをデプロイすると、監視システム (Prometheus および Grafana) も同時にデプロイされます。詳細については、 [監視フレームワークの概要](/tidb-monitoring-framework.md)を参照してください。

Grafana ダッシュボードは、概要、PD、TiDB、TiKV、Node_exporter、Disk Performance、および Performance_overview を含む一連のサブ ダッシュボードに分割されています。診断に役立つ指標が多数あります。

主要なメトリクスが表示される PD ダッシュボードからコンポーネントPD ステータスの概要を取得できます。このドキュメントでは、これらの主要な指標について詳しく説明します。

以下は、PD ダッシュボードのメトリクス項目の説明です。

-   PD ロール: 現在の PD インスタンスのロール
-   ストレージ容量: この TiDB クラスターの合計storage容量
-   現在のstorageサイズ: TiDB クラスターによって現在使用されているstorageサイズ
-   現在のstorage使用率: 現在のstorage使用率
-   通常のストア: 正常なstorageインスタンスの数
-   領域の数: クラスター領域の合計数
-   異常店舗: 異常店舗の数。通常の値は`0`です。数値が`0`より大きい場合は、少なくとも 1 つのインスタンスが異常であることを意味します。
-   リージョンの健全性: 保留中のピア、ダウンしているピア、余分なピア、オフライン ピア、欠落しているピア、学習者ピア、不正な名前空間など、異常なリージョンの数によって示されるリージョンの健全性ステータス。一般に、保留中のピアの数は`100`未満である必要があります。欠落しているピアは常に`0`を超えてはなりません。多くの空のリージョンが存在する場合は、時間内にリージョンの結合を有効にしてください。
-   現在のピア数: すべてのクラスター ピアの現在の数![PD Dashboard - Header](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-header-v4.png)

## 主要な指標の説明 {#key-metrics-description}

## クラスタ {#cluster}

-   PD スケジューラ構成: PD スケジューラ構成のリスト
-   クラスタID: クラスターの一意の識別子
-   現在の TSO: 現在割り当てられている TSO の物理部分
-   現在の ID 割り当て: 新しいストア/ピアに割り当て可能な最大 ID
-   リージョンラベル分離レベル: 異なるラベル レベルの領域の数
-   ラベルの分布: クラスタ内のラベルの分布状況
-   ストア制限: ストアでのスケジュールのフロー制御制限

![PD Dashboard - Cluster metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-cluster-v4.png)

## オペレーター {#operator}

-   スケジュール オペレータの作成: タイプごとに新しく作成されたオペレータの数
-   オペレータ チェックのスケジュール: タイプごとにチェックされるオペレータの数。主に、現在のステップが完了したかどうかをチェックします。 「はい」の場合、実行される次のステップを返します。
-   オペレータの終了スケジュール: タイプごとの終了したオペレータの数
-   スケジュール オペレータ タイムアウト: タイプごとのタイムアウト オペレータの数
-   置換またはキャンセルされたスケジュール オペレータ: タイプごとの置換またはキャンセルされたオペレータの数
-   状態ごとのスケジュール オペレータ数: 状態ごとのオペレータの数
-   オペレータ終了期間: 終了したオペレータの最大期間
-   オペレーター ステップの継続時間: 完了したオペレーター ステップの最大継続時間

![PD Dashboard - Operator metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-operator-v4.png)

## 統計- 残高 {#statistics-balance}

-   ストア容量: TiKV インスタンスごとの容量サイズ
-   利用可能なストア: TiKV インスタンスごとの利用可能な容量サイズ
-   使用ストア: TiKV インスタンスごとの使用容量サイズ
-   サイズ増幅率: TiKV インスタンスごとのサイズ増幅率。これは、(ストアリージョンサイズ)/(ストア使用容量サイズ) に等しくなります。
-   利用可能なサイズの比率: TiKV インスタンスごとのサイズの利用可能な比率。これは、(ストアの利用可能な容量サイズ)/(ストアの容量サイズ) に等しくなります。
-   ストア リーダー スコア: TiKV インスタンスごとのリーダー スコア
-   ストアリージョンスコア: TiKV インスタンスごとのリージョンスコア
-   ストア リーダー サイズ: TiKV インスタンスごとのリーダーの合計サイズ
-   ストアリージョンサイズ: TiKV インスタンスごとの合計リージョンサイズ
-   ストア リーダー数: TiKV インスタンスごとのリーダー数
-   ストアリージョン数: TiKV インスタンスごとのリージョン数

![PD Dashboard - Balance metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-balance-v4.png)

## 統計- ホットライト {#statistics-hot-write}

-   ホット リージョンのリーダー分布: 各 TiKV インスタンスで書き込みホットスポットになったリーダー リージョンの総数
-   ホット リーダー領域の書き込みバイトの合計: 各 TiKV インスタンスで書き込みホットスポットになったリーダー領域による書き込みバイトの合計
-   ホット書き込みリージョンのピア分布: 各 TiKV インスタンスで書き込みホットスポットになったピア リージョンの総数
-   ホット ピア リージョン上の書き込みバイトの合計: 各 TiKV インスタンスで書き込みホットスポットとなったすべてのピア リージョンの書き込みバイト数
-   ストア書き込み速度バイト: 各 TiKV インスタンスの合計書き込みバイト数
-   書き込みレート キーの保存: 各 TiKV インスタンスに書き込まれたキーの合計
-   ホット キャッシュ書き込みエントリ番号: 書き込みホットスポット統計モジュール内の各 TiKV インスタンス上のピアの数
-   セレクター イベント: ホットスポット スケジューリング モジュールのセレクターのイベント数
-   ホットスポット移動リーダーの方向: ホットスポット スケジュールにおけるリーダーの移動の方向。正の数は、インスタンスへのスケジュールを意味します。負の数は、インスタンスの外でスケジュールを設定することを意味します
-   ホットスポット移動ピアの方向: ホットスポット スケジューリングにおけるピアの移動の方向。正の数は、インスタンスへのスケジュールを意味します。負の数はインスタンス外でスケジュールすることを意味します

![PD Dashboard - Hot write metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-hotwrite-v4.png)

## 統計- ホットリード {#statistics-hot-read}

-   ホット リージョンのピア分布: 各 TiKV インスタンスで読み取りホットスポットになったピア リージョンの総数
-   ホット ピア リージョンの読み取りバイトの合計: 各 TiKV インスタンスで読み取りホットスポットになったピアの読み取りバイトの合計
-   ストア読み取り速度バイト: 各 TiKV インスタンスの合計読み取りバイト数
-   読み取りレート キーのストア: 各 TiKV インスタンスの読み取りキーの合計
-   ホット キャッシュ読み取りエントリ番号: 各 TiKV インスタンスの読み取りホットスポット統計モジュール内のピアの数

![PD Dashboard - Hot read metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-hotread-v4.png)

## スケジューラ {#scheduler}

-   スケジューラが実行中: 現在実行中のスケジューラ
-   リーダーの動きのバランスをとる: TiKV インスタンス間のリーダーの動きの詳細
-   リージョン移動のバランス: TiKV インスタンス間のリージョン移動の詳細
-   バランス リーダー イベント: バランス リーダー イベントの数
-   バランスリージョンイベント: バランスリージョンイベントの数
-   バランス リーダー スケジューラ: バランス リーダー スケジューラの内部ステータス
-   バランスリージョンスケジューラ: バランスリージョンスケジューラの内部ステータス
-   レプリカ チェッカー: レプリカ チェッカーのステータス
-   ルール チェッカー: ルール チェッカーのステータス
-   リージョンマージ チェッカー: マージ チェッカーのステータス
-   フィルター対象: ストアがスケジュール対象として選択されているにもかかわらず、フィルターを通過できなかった試行回数
-   フィルター ソース: ストアがスケジュール ソースとして選択されたものの、フィルターを通過できなかった試行回数
-   バランスの方向: ストアがスケジュールのターゲットまたはソースとして選択された回数

![PD Dashboard - Scheduler metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-scheduler-v4.png)

## gRPC {#grpc}

-   完了したコマンドの割合: gRPC コマンドが完了したコマンド タイプごとの割合
-   99% 完了したコマンドの継続時間: gRPC コマンドが完了したコマンド タイプごとの割合 (P99)

![PD Dashboard - gRPC metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-grpc-v2.png)

## etcd {#etcd}

-   ハンドル トランザクション数: etcd がトランザクションを処理する速度
-   99% 取引処理期間：取引処理率（P99）
-   99% WAL fsync 持続時間: WAL を永続storageに書き込むために消費された時間。 `1s`未満です（P99）
-   99% ピア往復時間秒: etcd のネットワークレイテンシー(P99) |値は`1s`未満です
-   etcd ディスク WAL fsync レート: WAL を永続storageに書き込む速度
-   Raft期間: Raftの現在の期間
-   Raft がコミットしたインデックス: Raftの最後にコミットされたインデックス
-   Raft適用インデックス: Raftの最後に適用されたインデックス

![PD Dashboard - etcd metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-etcd-v2.png)

## TiDB {#tidb}

-   PD サーバー TSO ハンドル時間とクライアント受信時間: PD が TSO 要求を受信して​​から PD クライアントが TSO 応答を取得するまでの時間
-   ハンドル リクエスト数: TiDB リクエストの数
-   リクエストの処理時間: TiDB リクエストの処理に費やされた時間。 `100ms`未満である必要があります(P99)

![PD Dashboard - TiDB metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-tidb-v4.png)

## ハートビート {#heartbeat}

-   ハートビート領域イベント QPS: キャッシュの更新やデータの永続化など、ハートビートメッセージの処理の QPS
-   リージョンのハートビートレポート: インスタンスごとに PD に報告されたハートビートの数
-   リージョンハートビートレポート エラー: ステータス`error`のハートビート数
-   リージョンハートビートレポート アクティブ: ステータスが`ok`のハートビートの数
-   リージョンスケジュール プッシュ: TiKV インスタンスごとの PD から送信された対応するスケジュール コマンドの数
-   99%リージョンのハートビートレイテンシー: TiKV インスタンスごとのハートビートレイテンシー(P99)

![PD Dashboard - Heartbeat metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-heartbeat-v4.png)

## リージョンstorage {#region-storage}

-   Syncer Index: リーダーによって記録されたリージョン変更履歴の最大インデックス
-   履歴の最後のインデックス:リージョン変更履歴がフォロワーと正常に同期された最後のインデックス

![PD Dashboard - Region storage](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-region-storage.png)
