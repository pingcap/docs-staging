---
title: Key Monitoring Metrics of PD
summary: Learn some key metrics displayed on the Grafana PD dashboard.
---

# PDの主要な監視指標 {#key-monitoring-metrics-of-pd}

TiUPを使用して TiDB クラスターをデプロイすると、監視システム (Prometheus および Grafana) も同時にデプロイされます。詳細については、 [監視フレームワークの概要](/tidb-monitoring-framework.md)参照してください。

Grafana ダッシュボードは、Overview、PD、TiDB、TiKV、Node_exporter、Disk Performance、Performance_overview などの一連のサブダッシュボードに分かれています。診断に役立つメトリックが多数あります。

PD ダッシュボードでは、主要なメトリックが表示され、コンポーネントのPD ステータスの概要を確認できます。このドキュメントでは、これらの主要なメトリックについて詳しく説明します。

PD ダッシュボード メトリック項目の説明は次のとおりです。

-   PDロール: 現在のPDインスタンスのロール
-   ストレージ容量: この TiDB クラスターの合計storage容量
-   現在のstorageサイズ: TiDB クラスターで現在使用されているstorageサイズ
-   現在のstorage使用量: 現在のstorage使用率
-   通常のストア: 正常なstorageインスタンスの数
-   リージョン数: クラスターリージョンの合計数
-   異常なストア: 不健全なストアの数。正常値は`0`です。数値が`0`より大きい場合、少なくとも 1 つのインスタンスが異常であることを意味します。
-   リージョンの健全性: 保留中のピア、ダウンしているピア、余分なピア、オフラインのピア、欠落しているピア、学習者ピア、および不正な名前空間を含む異常なリージョンの数によって示されるリージョンの健全性状態。通常、保留中のピアの数は`100`未満である必要があります。欠落しているピアは`0`を超えてはなりません。空のリージョンが多数存在する場合は、適時にリージョンのマージを有効にしてください。
-   現在のピア数: すべてのクラスタピアの現在の数![PD Dashboard - Header](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-header-v4.png)

## 主要な指標の説明 {#key-metrics-description}

## クラスタ {#cluster}

-   PDスケジューラ設定: PDスケジューラ設定のリスト
-   クラスタID: クラスターの一意の識別子
-   現在のTSO: 現在割り当てられているTSOの物理部分
-   現在のID割り当て: 新しいストア/ピアに割り当てられる最大ID
-   リージョンラベル分離レベル: 異なるラベルレベルの地域数
-   ラベルの配布: クラスター内のラベルの配布状況
-   ストア制限: ストアでのスケジュールのフロー制御制限

![PD Dashboard - Cluster metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-cluster-v4.png)

## オペレーター {#operator}

-   オペレータ作成のスケジュール: タイプごとに新しく作成されるオペレータの数
-   スケジュール演算子チェック: 種類ごとにチェックされる演算子の数。主に現在のステップが終了したかどうかをチェックし、終了した場合は、実行する次のステップを返します。
-   スケジュールオペレータ終了: タイプごとに終了したオペレータの数
-   スケジュールオペレータのタイムアウト: タイプごとのタイムアウトオペレータの数
-   スケジュールオペレータの交代またはキャンセル: タイプごとに交代またはキャンセルされたオペレータの数
-   州別のスケジュールオペレーター数: 州ごとのオペレーターの数
-   オペレータ終了時間: 終了したオペレータの最大時間
-   オペレータステップの所要時間: 完了したオペレータステップの最大所要時間

![PD Dashboard - Operator metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-operator-v4.png)

## 統計- バランス {#statistics-balance}

-   ストア容量: TiKVインスタンスあたりの容量サイズ
-   利用可能なストア: TiKVインスタンスあたりの利用可能な容量サイズ
-   使用済みストア: TiKVインスタンスごとの使用済み容量サイズ
-   サイズ増幅: TiKVインスタンスあたりのサイズ増幅率。これは、(ストアリージョンのサイズ)/(ストアの使用済み容量のサイズ)に等しい。
-   利用可能なサイズ比率: TiKV インスタンスあたりの利用可能なサイズ比率。これは (ストアの利用可能な容量サイズ)/(ストアの容量サイズ) に等しくなります。
-   ストアリーダースコア: TiKVインスタンスごとのリーダースコア
-   ストアリージョンスコア: TiKVインスタンスごとのリージョンスコア
-   ストアリーダーサイズ: TiKVインスタンスあたりのリーダーサイズの合計
-   ストアリージョンサイズ: TiKVインスタンスあたりのリージョンの合計サイズ
-   ストアリーダー数: TiKVインスタンスごとのリーダー数
-   ストアリージョン数: TiKVインスタンスあたりのリージョン数

![PD Dashboard - Balance metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-balance-v4.png)

## 統計- ホットライト {#statistics-hot-write}

-   ホットリージョンのリーダー分布: 各 TiKV インスタンスで書き込みホットスポットとなったリーダーリージョンの合計数
-   ホットリーダー領域の合計書き込みバイト数: 各 TiKV インスタンスで書き込みホットスポットとなったリーダー領域による合計書き込みバイト数
-   ホット書き込みリージョンのピア分布: 各 TiKV インスタンスで書き込みホットスポットとなったピアリージョンの合計数
-   ホットピアリージョンの合計書き込みバイト数: 各 TiKV インスタンスで書き込みホットスポットとなったすべてのピアリージョンの書き込みバイト数
-   ストア書き込みレートバイト: 各 TiKV インスタンスに書き込まれた合計バイト数
-   書き込みレートキーの保存: 各 TiKV インスタンスに書き込まれたキーの合計
-   ホットキャッシュ書き込みエントリ数: 書き込みホットスポット統計モジュールにある各 TiKV インスタンス上のピアの数
-   セレクターイベント: ホットスポットスケジューリングモジュールのセレクターのイベント数
-   ホットスポット移動リーダーの方向: ホットスポット スケジューリングにおけるリーダーの移動方向。正の数はインスタンスへのスケジューリングを意味します。負の数はインスタンスからのスケジューリングを意味します。
-   ホットスポット移動ピアの方向: ホットスポット スケジューリングにおけるピアの移動方向。正の数はインスタンスへのスケジューリングを意味します。負の数はインスタンスからのスケジューリングを意味します。

![PD Dashboard - Hot write metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-hotwrite-v4.png)

## 統計- ホットリード {#statistics-hot-read}

-   ホットリージョンのピア分布: 各 TiKV インスタンスで読み取りホットスポットとなったピアリージョンの合計数
-   ホットピア領域の合計読み取りバイト数: 各 TiKV インスタンスで読み取りホットスポットとなったピアの合計読み取りバイト数
-   ストア読み取りレートバイト: 各 TiKV インスタンスの合計読み取りバイト数
-   読み取りレートキーを保存: 各 TiKV インスタンスの合計読み取りキー
-   ホット キャッシュ読み取りエントリ数: 各 TiKV インスタンスの読み取りホットスポット統計モジュールにあるピアの数

![PD Dashboard - Hot read metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-hotread-v4.png)

## スケジューラ {#scheduler}

-   スケジューラが実行中: 現在実行中のスケジューラ
-   リーダーの動きのバランス: TiKVインスタンス間のリーダーの動きの詳細
-   バランスリージョン移動: TiKVインスタンス間のリージョン移動の詳細
-   バランスリーダーイベント:バランスリーダーイベントの数
-   バランスリージョンイベント: バランスリージョンイベントの数
-   バランスリーダースケジューラ: バランスリーダースケジューラの内部状態
-   バランスリージョンスケジューラ: バランスリージョンスケジューラの内部状態
-   レプリカチェッカー: レプリカチェッカーのステータス
-   ルールチェッカー: ルールチェッカーのステータス
-   リージョンマージチェッカー: マージチェッカーのステータス
-   フィルターターゲット: 店舗がスケジュールターゲットとして選択されたが、フィルターを通過できなかった試行回数
-   フィルターソース: ストアがスケジュールソースとして選択されたが、フィルターを通過できなかった試行回数
-   バランス方向: ストアがスケジュールのターゲットまたはソースとして選択された回数

![PD Dashboard - Scheduler metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-scheduler-v4.png)

## GRPC とは {#grpc}

-   完了コマンド率: gRPC コマンドが完了するコマンド タイプごとの率
-   99% 完了コマンド期間: gRPC コマンドが完了するコマンド タイプごとの割合 (P99)

![PD Dashboard - gRPC metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-grpc-v2.png)

## など {#etcd}

-   トランザクション処理数: etcdがトランザクションを処理する速度
-   99% トランザクション処理期間: トランザクション処理率 (P99)
-   99% WAL fsync 期間: WAL を永続storageに書き込むのにかかる時間。1 `1s` (P99)
-   99% ピア ラウンド トリップ時間 (秒): etcd のネットワークレイテンシー(P99) | 値は`1s`未満です
-   etcd ディスク WAL fsync レート: 永続storageへの WAL の書き込みレート
-   Raftの用語: Raftの現在の用語
-   Raftコミットインデックス: Raftの最後のコミットインデックス
-   Raft適用インデックス: Raftの最後に適用されたインデックス

![PD Dashboard - etcd metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-etcd-v2.png)

## ティビ {#tidb}

-   PDサーバTSO処理時間とクライアント受信時間: PDがTSO要求を受信して​​からPDクライアントがTSO応答を受信するまでの時間
-   処理要求数: TiDB要求の数
-   リクエスト処理時間: TiDB リクエストの処理にかかる時間。1 `100ms`である必要があります (P99)

![PD Dashboard - TiDB metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-tidb-v4.png)

## ハートビート {#heartbeat}

-   ハートビート領域イベントQPS: キャッシュの更新やデータの永続化を含むハートビートメッセージの処理のQPS
-   リージョンハートビートレポート: インスタンスごとにPDに報告されたハートビートの数
-   リージョンハートビートレポートエラー: ステータス`error`ハートビートの数
-   リージョンハートビートレポートがアクティブ: ステータスが`ok`ハートビートの数
-   リージョンスケジュールプッシュ: TiKVインスタンスごとにPDから送信された対応するスケジュールコマンドの数
-   99%リージョンハートビートレイテンシー: TiKV インスタンスあたりのハートビートレイテンシー(P99)

![PD Dashboard - Heartbeat metrics](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-heartbeat-v4.png)

## リージョンstorage {#region-storage}

-   Syncer Index: リーダーによって記録されたリージョン変更履歴の最大インデックス
-   履歴最終インデックス:リージョン変更履歴がフォロワーと正常に同期された最後のインデックス

![PD Dashboard - Region storage](https://docs-download.pingcap.com/media/images/docs/pd-dashboard-region-storage.png)
