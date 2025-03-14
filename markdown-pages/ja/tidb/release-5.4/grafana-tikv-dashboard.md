---
title: Key Monitoring Metrics of TiKV
summary: Learn some key metrics displayed on the Grafana TiKV dashboard.
---

# TiKVの主要な監視指標 {#key-monitoring-metrics-of-tikv}

TiUPを使用してTiDBクラスタをデプロイする場合、監視システム（Prometheus / Grafana）も同時にデプロイされます。詳細については、 [モニタリングフレームワークの概要](/tidb-monitoring-framework.md)を参照してください。

Grafanaダッシュボードは、Overview、PD、TiDB、TiKV、Node_exporterなどを含む一連のサブダッシュボードに分割されています。診断に役立つ多くのメトリックがあります。

コンポーネントのTiKVステータスの概要は、主要なメトリックが表示される**TiKV-詳細**ダッシュボードから取得できます。 [パフォーマンスマップ](https://asktug.com/_/tidb-performance-map/#/)によると、クラスタのステータスが期待どおりであるかどうかを確認できます。

このドキュメントでは、 **TiKV-詳細**ダッシュボードでこれらの主要なメトリックについて詳しく説明します。

## 集まる {#cluster}

-   ストアサイズ：TiKVインスタンスあたりのストレージサイズ
-   使用可能なサイズ：TiKVインスタンスごとの使用可能な容量
-   容量サイズ：TiKVインスタンスあたりの容量サイズ
-   CPU：TiKVインスタンスごとのCPU使用率
-   メモリ：TiKVインスタンスごとのメモリ使用量
-   IO使用率：TiKVインスタンスごとのI/O使用率
-   MBps：各TiKVインスタンスでの読み取りと書き込みの合計バイト数
-   QPS：各TiKVインスタンスのコマンドごとのQPS
-   Errps：gRPCメッセージの失敗率
-   リーダー：TiKVインスタンスあたりのリーダーの数
-   リージョン：TiKVインスタンスごとのリージョンの数
-   稼働時間：最後の再起動以降のTiKVの実行時間

![TiKV Dashboard - Cluster metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-cluster.png)

## エラー {#errors}

-   重大なエラー：重大なエラーの数
-   サーバーがビジー状態：書き込みストール、チャネルフルなど、TiKVインスタンスを一時的に使用不可にするイベントの発生を示します。通常は`0`になります。
-   サーバーレポートの失敗：サーバーによって報告されたエラーメッセージの数。通常は`0`になります。
-   Raftstoreエラー：各TiKVインスタンスのタイプごとのRaftstoreエラーの数
-   スケジューラエラー：各TiKVインスタンスのタイプごとのスケジューラエラーの数
-   コプロセッサーエラー：各TiKVインスタンスのタイプごとのコプロセッサーエラーの数
-   gRPCメッセージエラー：各TiKVインスタンスのタイプごとのgRPCメッセージエラーの数
-   リーダーのドロップ：TiKVインスタンスごとにドロップされたリーダーの数
-   リーダーの欠落：TiKVインスタンスごとの欠落しているリーダーの数

![TiKV Dashboard - Errors metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-errors.png)

## サーバ {#server}

-   CFサイズ：各列ファミリーのサイズ
-   ストアサイズ：TiKVインスタンスあたりのストレージサイズ
-   チャネルフル：TiKVインスタンスごとのチャネルフルエラーの数。通常は`0`になります。
-   アクティブな書かれたリーダー：各TiKVインスタンスに書かれているリーダーの数
-   おおよそのリージョンサイズ：おおよそのリージョンサイズ
-   おおよその領域サイズヒストグラム：各おおよその領域サイズのヒストグラム
-   リージョン平均書き込みキー：TiKVインスタンスごとのリージョンへの書き込みキーの平均数
-   リージョンの平均書き込みバイト数：TiKVインスタンスごとのリージョンへの平均書き込みバイト数

![TiKV Dashboard - Server metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-server.png)

## gRPC {#grpc}

-   gRPCメッセージ数：タイプごとのgRPCメッセージの割合
-   gRPCメッセージの失敗：失敗したgRPCメッセージの割合
-   99％gRPCメッセージ期間：メッセージタイプごとのgRPCメッセージ期間（P99）
-   平均gRPCメッセージ期間：gRPCメッセージの平均実行時間
-   gRPCバッチサイズ：TiDBとTiKV間のgRPCメッセージのバッチサイズ
-   ラフトメッセージのバッチサイズ：TiKVインスタンス間のラフトメッセージのバッチサイズ

## スレッドCPU {#thread-cpu}

-   ラフトストアCPU： `raftstore`スレッドのCPU使用率。通常の場合、CPU使用率は80％* `raftstore.store-pool-size`未満である必要があります。
-   非同期適用CPU： `async apply`スレッドのCPU使用率。通常の場合、CPU使用率は90％* `raftstore.apply-pool-size`未満である必要があります。
-   スケジューラワーカーCPU： `scheduler worker`スレッドのCPU使用率。通常の場合、CPU使用率は90％* `storage.scheduler-worker-pool-size`未満である必要があります。
-   gRPCポーリングCPU： `gRPC`スレッドのCPU使用率。通常の場合、CPU使用率は80％* `server.grpc-concurrency`未満である必要があります。
-   統合読み取りプールCPU： `unified read pool`スレッドのCPU使用率
-   Storage ReadPool CPU： `storage read pool`スレッドのCPU使用率
-   コプロセッサーCPU： `coprocessor`スレッドのCPU使用率
-   RocksDB CPU：RocksDBスレッドのCPU使用率
-   GCワーカーCPU： `GC worker`スレッドのCPU使用率
-   BackGroundワーカーCPU： `background worker`スレッドのCPU使用率

## PD {#pd}

-   PD要求：TiKVがPDに送信するレート
-   PD要求期間（平均）：TiKVがPDに送信する要求の処理の平均期間
-   PDハートビート：ハートビートメッセージがTiKVからPDに送信される速度
-   PD検証ピア：TiKVピアを検証するためにメッセージがTiKVからPDに送信される速度

## いかだIO {#raft-io}

-   ログの適用期間：Raftがログを適用するのにかかる時間
-   サーバーごとのログ期間の適用：RaftがTiKVインスタンスごとにログを適用するのにかかる時間
-   ログの追加期間：Raftがログを追加するのにかかる時間
-   サーバーごとのログ期間の追加：RaftがTiKVインスタンスごとにログを追加するのにかかる時間
-   コミットログ期間：Raftがログをコミットするために費やした時間
-   サーバーごとのコミットログ期間：TiKVインスタンスごとにログをコミットするためにRaftが消費する時間

![TiKV Dashboard - Raft IO metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-raftio.png)

## いかだプロセス {#raft-process}

-   準備完了処理済み：1秒あたりのタイプごとの処理済み準備完了操作の数
    -   count：1秒あたりに処理された準備完了操作の数
    -   has_ready_region：1秒あたりに準備ができているリージョンの数
    -   保留中のリージョン：準備ができているかどうかをチェックするリージョンの1秒あたりの操作数。このメトリックは、v3.0.0以降非推奨になりました
    -   message：1秒あたりの準備完了操作に含まれるメッセージの数
    -   追加：1秒あたりの準備完了操作に含まれるRaftログエントリの数
    -   commit：1秒あたりの準備完了操作に含まれるコミット済みRaftログエントリの数
    -   スナップショット：1秒あたりの準備完了操作に含まれるスナップショットの数
-   0.99ラフトストアイベントの期間：ラフトストアイベントに費やされた時間（P99）
-   プロセス準備期間：Raftでプロセスの準備ができるまでにかかる時間
-   サーバーごとのプロセス準備期間：TiKVインスタンスごとにRaftでピアプロセスの準備ができるまでにかかる時間。 2秒未満である必要があります（P99.99）。

![TiKV Dashboard - Raft process metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-raft-process.png)

## いかだメッセージ {#raft-message}

-   サーバーごとに送信されたメッセージ：1秒あたりに各TiKVインスタンスによって送信されたRaftメッセージの数
-   サーバーごとのフラッシュメッセージ：1秒あたりの各TiKVインスタンスでRaftクライアントによってフラッシュされたRaftメッセージの数
-   サーバーごとのメッセージの受信：1秒あたりの各TiKVインスタンスによって受信されたRaftメッセージの数
-   メッセージ：1秒あたりのタイプごとに送信されたRaftメッセージの数
-   投票：1秒あたりにRaftで送信された投票メッセージの数
-   Raftドロップメッセージ：1秒あたりのタイプごとのドロップされたRaftメッセージの数

![TiKV Dashboard - Raft message metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-raft-message.png)

## いかだ提案 {#raft-propose}

-   レディごとのラフト適用プロポーザル：プロポーザルの適用中に、各レディ操作にバッチで含まれるプロポーザルの数のヒストグラム。
-   いかだ読み取り/書き込みプロポーザル：1秒あたりのタイプごとのプロポーザルの数
-   サーバーごとのラフト読み取りプロポーザル：1秒あたりの各TiKVインスタンスによって行われた読み取りプロポーザルの数
-   サーバーごとのRaft書き込みプロポーザル：1秒あたりの各TiKVインスタンスによって行われた書き込みプロポーザルの数
-   提案の待機時間：各提案の待機時間のヒストグラム
-   サーバーごとの提案待機時間：TiKVインスタンスごとの各提案の待機時間のヒストグラム
-   適用待機時間：各提案の適用時間のヒストグラム
-   サーバーごとの適用待機時間：TiKVインスタンスごとの各プロポーザルの適用時間のヒストグラム
-   いかだログ速度：ピアがログを提案する平均速度

![TiKV Dashboard - Raft propose metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-raft-propose.png)

## いかだ管理者 {#raft-admin}

-   管理者プロポーザル：1秒あたりの管理者プロポーザルの数
-   管理者適用：1秒あたりに処理された適用コマンドの数
-   チェックスプリット：1秒あたりのRaftstoreスプリットチェックコマンドの数
-   99.99％チェック分割時間：分割チェックコマンドの実行にかかる時間（P99.99）

![TiKV Dashboard - Raft admin metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-raft-admin.png)

## ローカルリーダー {#local-reader}

-   ローカルリーダーリクエスト：ローカルリードスレッドからのリクエストの総数と拒否の数

![TiKV Dashboard - Local reader metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-local-reader.png)

## 統合読み取りプール {#unified-read-pool}

-   レベルごとに使用される時間：統合読み取りプールの各レベルで消費される時間。レベル0は小さなクエリを意味します。
-   レベル0の可能性：統合読み取りプール内のレベル0タスクの割合
-   実行中のタスク：統合読み取りプールで同時に実行されているタスクの数

## 保管所 {#storage}

-   ストレージコマンドの合計：1秒あたりのタイプごとの受信コマンドの数
-   ストレージ非同期リクエストエラー：1秒あたりのエンジン非同期リクエストエラーの数
-   ストレージ非同期スナップショット期間：非同期スナップショット要求の処理にかかる時間。 `.99`分の`1s`未満である必要があります。
-   ストレージ非同期書き込み期間：非同期書き込み要求の処理にかかる時間。 `.99`分の`1s`未満である必要があります。

![TiKV Dashboard - Storage metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-storage.png)

## スケジューラー {#scheduler}

-   スケジューラーステージの合計：1秒あたりの各ステージでのコマンドの数。短時間で多くのエラーが発生することはありません。
-   スケジューラ書き込みバイト数：各TiKVインスタンスで処理されたコマンドによって書き込まれた合計バイト数
-   スケジューラ優先コマンド：1秒あたりのさまざまな優先コマンドの数
-   スケジューラの保留中のコマンド：1秒あたりのTiKVインスタンスごとの保留中のコマンドの数

![TiKV Dashboard - Scheduler metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-scheduler.png)

## スケジューラー-コミット {#scheduler-commit}

-   スケジューラステージの合計：commitコマンドを実行するときの1秒あたりの各ステージでのコマンドの数。短時間で多くのエラーが発生することはありません。
-   スケジューラコマンドの継続時間：commitコマンドの実行にかかる時間。 `1s`未満である必要があります。
-   スケジューラのラッチ待機時間：commitコマンドの実行時にラッチによって発生する待機時間。 `1s`未満である必要があります。
-   スケジューラーのキーの読み取り：commitコマンドによって読み取られたキーの数
-   書き込まれたスケジューラーキー：commitコマンドによって書き込まれたキーの数
-   スケジューラスキャンの詳細：キーは、commitコマンドの実行時に各CFの詳細をスキャンします。
-   スケジューラスキャン詳細[ロック]：コミットコマンド実行時にキーがロックCFの詳細をスキャンします
-   スケジューラスキャン詳細[書き込み]：コミットコマンド実行時にキーが書き込みCFの詳細をスキャンします
-   スケジューラスキャンの詳細[デフォルト]：コミットコマンドの実行時に、キーがデフォルトCFの詳細をスキャンします

![TiKV Dashboard - Scheduler commit metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-scheduler-commit.png)

## スケジューラ-pessimistic_rollback {#scheduler-pessimistic-rollback}

-   スケジューラステージ合計：1つのコマンドを実行するときの`pessimistic_rollback`秒あたりの各ステージでのコマンドの数。短時間で多くのエラーが発生することはありません。
-   スケジューラコマンドの継続時間： `pessimistic_rollback`のコマンドを実行するときに消費される時間。 `1s`未満である必要があります。
-   スケジューララッチ待機時間： `pessimistic_rollback`コマンド実行時のラッチによる待機時間。 `1s`未満である必要があります。
-   読み取られたスケジューラキー： `pessimistic_rollback`のコマンドによって読み取られたキーの数
-   書き込まれたスケジューラーキー： `pessimistic_rollback`のコマンドによって書き込まれたキーの数
-   スケジューラスキャンの詳細：キーは、 `pessimistic_rollback`コマンドを実行するときに各CFの詳細をスキャンします。
-   スケジューラスキャン詳細[ロック]：キーは、 `pessimistic_rollback`コマンド実行時にロックCFの詳細をスキャンします
-   スケジューラスキャン詳細[書き込み]：キーは、 `pessimistic_rollback`コマンドを実行するときに書き込みCFの詳細をスキャンします
-   スケジューラスキャン詳細[デフォルト]：キーは、 `pessimistic_rollback`コマンドを実行するときにデフォルトCFの詳細をスキャンします

## スケジューラー-事前書き込み {#scheduler-prewrite}

-   スケジューラーステージ合計：プリライトコマンドを実行するときの1秒あたりの各ステージでのコマンドの数。短時間で多くのエラーが発生することはありません。
-   スケジューラコマンドの継続時間：prewriteコマンドの実行にかかる時間。 `1s`未満である必要があります。
-   スケジューラのラッチ待機時間：prewriteコマンドの実行時にラッチによって発生する待機時間。 `1s`未満である必要があります。
-   スケジューラーのキーの読み取り：事前書き込みコマンドによって読み取られたキーの数
-   書き込まれたスケジューラーキー：prewriteコマンドによって書き込まれたキーの数
-   スケジューラスキャンの詳細：キーは、prewriteコマンドを実行するときに各CFの詳細をスキャンします。
-   スケジューラスキャン詳細[ロック]：キーは、prewriteコマンドを実行するときにロックCFの詳細をスキャンします
-   スケジューラスキャン詳細[書き込み]：キーは、prewriteコマンドを実行するときに書き込みCFの詳細をスキャンします
-   スケジューラスキャンの詳細[デフォルト]：キーは、prewriteコマンドの実行時にデフォルトCFの詳細をスキャンします

## スケジューラ-ロールバック {#scheduler-rollback}

-   スケジューラステージの合計：ロールバックコマンドを実行するときの1秒あたりの各ステージでのコマンドの数。短時間で多くのエラーが発生することはありません。
-   スケジューラコマンドの継続時間：ロールバックコマンドの実行にかかる時間。 `1s`未満である必要があります。
-   スケジューラのラッチ待機時間：ロールバックコマンドの実行時にラッチによって発生する待機時間。 `1s`未満である必要があります。
-   スケジューラーのキーの読み取り：ロールバックコマンドによって読み取られたキーの数
-   書き込まれたスケジューラーキー：ロールバックコマンドによって書き込まれたキーの数
-   スケジューラスキャンの詳細：キーは、ロールバックコマンドを実行するときに各CFの詳細をスキャンします。
-   スケジューラスキャン詳細[ロック]：ロールバックコマンド実行時にキーがロックCFの詳細をスキャンします
-   スケジューラスキャン詳細[書き込み]：ロールバックコマンド実行時にキーが書き込みCFの詳細をスキャンします
-   スケジューラスキャンの詳細[デフォルト]：キーは、ロールバックコマンドの実行時にデフォルトCFの詳細をスキャンします

## GC {#gc}

-   GCタスク：gc_workerによって処理されたGCタスクの数
-   GCタスク期間：GCタスクの実行にかかる時間
-   TiDB GC秒：GC期間
-   TiDB GCワーカーアクション：TiDBGCワーカーアクションの数
-   ResolveLocksの進行状況：GCの最初のフェーズの進行状況（ロックの解決）
-   TiKV Auto GC Progress：GCの第2フェーズの進捗状況
-   GC速度：1秒あたりのGCによって削除されたキーの数
-   TiKV Auto GC SafePoint：TiKVGCセーフポイントの値。安全なポイントは、現在のGCタイムスタンプです
-   GCの寿命：TiDBGCの寿命
-   GC間隔：TiDBGCの間隔
-   圧縮フィルターのGC：書き込みCFの圧縮フィルターでフィルター処理されたバージョンの数。

## スナップショット {#snapshot}

-   スナップショットメッセージのレート：Raftスナップショットメッセージが送信されるレート
-   99％スナップショット期間の処理：スナップショットの処理にかかる時間（P99）
-   スナップショット状態数：状態ごとのスナップショットの数
-   99.99％スナップショットサイズ：スナップショットサイズ（P99.99）
-   99.99％スナップショットKVカウント：スナップショット内のKVの数（P99.99）

## 仕事 {#task}

-   ワーカーが処理するタスク：1秒あたりにワーカーが処理するタスクの数
-   ワーカーの保留中のタスク：1秒あたりのワーカーの保留中および実行中のタスクの現在の数。通常の場合は`1000`未満である必要があります。
-   FuturePoolが処理するタスク：1秒あたりの将来のプールによって処理されるタスクの数
-   FuturePool保留中のタスク：1秒あたりの将来のプールの保留中および実行中のタスクの現在の数

## コプロセッサーの概要 {#coprocessor-overview}

-   要求期間：コプロセッサー要求を受信してから要求の処理を終了するまでの合計期間
-   リクエストの総数：1秒あたりのタイプ別のリクエスト数
-   処理時間：1分あたりのコプロセッサー要求の実際の処理に費やされた時間のヒストグラム
-   合計要求エラー：1秒あたりのコプロセッサーの要求エラーの数。短時間で多くのエラーが発生することはありません。
-   合計`analyze_index`カーソル操作`analyze_table` `index`などの`select`秒あたりのタイプごとの`checksum_table`カーソル操作の`checksum_index`数。
-   KVカーソル操作：1秒あたりのタイプ別のKVカーソル操作のヒストグラム
-   合計RocksDBパフォーマンス統計：RocksDBパフォーマンスの統計
-   合計応答サイズ：コプロセッサー応答の合計サイズ

## コプロセッサーの詳細 {#coprocessor-detail}

-   処理時間：1分あたりのコプロセッサー要求の実際の処理に費やされた時間のヒストグラム
-   ストアごとの95％処理時間：1秒あたりのTiKVインスタンスごとのコプロセッサー要求の処理にかかる時間（P95）
-   待機時間：コプロセッサー要求が処理されるのを待機しているときに消費される時間。 `10s`未満である必要があります（P99.99）。
-   ストアごとの95％待機時間：コプロセッサー要求が1秒あたりのTiKVインスタンスごとに処理されるのを待機しているときに消費される時間（P95）
-   DAGリクエストの総数：1秒あたりのDAGリクエストの総数
-   DAGエグゼキュータの総数：1秒あたりのDAGエグゼキュータの総数
-   Total Ops Details（テーブルスキャン）：コプロセッサーで選択スキャンを実行するときの1秒あたりのRocksDB内部操作の数
-   Total Ops Details（Index Scan）：コプロセッサーでインデックススキャンを実行するときの1秒あたりのRocksDB内部操作の数
-   CFごとの合計操作の詳細（テーブルスキャン）：コプロセッサーで選択スキャンを実行するときの1秒あたりの各CFのRocksDB内部操作の数
-   CF別の合計操作詳細（インデックススキャン）：コプロセッサーでインデックススキャンを実行する場合の、1秒あたりの各CFのRocksDB内部操作の数

## スレッド {#threads}

-   スレッドの状態：TiKVスレッドの状態
-   スレッドIO：各TiKVスレッドのI/Oトラフィック
-   スレッドの任意のコンテキストスイッチ：TiKVスレッドの任意のコンテキストスイッチの数
-   スレッドの非自発的コンテキストスイッチ：TiKVスレッドの非自発的コンテキストスイッチの数

## RocksDB-kv / raft {#rocksdb-kv-raft}

-   取得操作：1秒あたりの取得操作の数
-   取得期間：取得操作の実行にかかる時間
-   シーク操作：1秒あたりのシーク操作の数
-   シーク期間：シーク操作の実行にかかる時間
-   書き込み操作：1秒あたりの書き込み操作の数
-   書き込み時間：書き込み操作の実行にかかる時間
-   WAL同期操作：1秒あたりのWAL同期操作の数
-   WALの書き込み期間：WALの書き込みにかかる時間
-   WAL同期期間：WAL同期操作の実行にかかる時間
-   圧縮操作：1秒あたりの圧縮およびフラッシュ操作の数
-   圧縮期間：圧縮およびフラッシュ操作の実行にかかる時間
-   SST読み取り時間：SSTファイルの読み取りにかかる時間
-   書き込みストール期間：書き込みストール期間。通常は`0`になります。
-   記憶可能なサイズ：各列ファミリーの記憶可能なサイズ
-   Memtableヒット：Memtableのヒット率
-   ブロックキャッシュサイズ：ブロックキャッシュサイズ。共有ブロックキャッシュが無効になっている場合は、列ファミリーごとに分類されます。
-   ブロックキャッシュヒット：ブロックキャッシュのヒット率
-   ブロックキャッシュフロー：タイプごとのブロックキャッシュ操作のフローレート
-   ブロックキャッシュ操作：タイプごとのブロックキャッシュ操作の数
-   キーフロー：タイプごとのキーの操作のフローレート
-   キーの総数：各列ファミリーのキーの数
-   読み取りフロー：タイプごとの読み取り操作のフローレート
-   バイト/読み取り：読み取り操作あたりのバイト数
-   書き込みフロー：タイプごとの書き込み操作のフローレート
-   バイト/書き込み：書き込み操作あたりのバイト数
-   圧縮流量：タイプごとの圧縮操作の流量
-   圧縮保留バイト：圧縮される保留バイト
-   読み取り増幅：TiKVインスタンスごとの読み取り増幅
-   圧縮率：各レベルの圧縮率
-   スナップショットの数：TiKVインスタンスごとのスナップショットの数
-   最も古いスナップショットの期間：リリースされていない最も古いスナップショットが存続する時間
-   各レベルのファイル数：各レベルの異なる列ファミリーのSSTファイルの数
-   取り込みSST継続時間秒：SSTファイルの取り込みに費やされた時間
-   各CFのストール条件の変更：各カラムファミリのストール条件の変更

## タイタン-すべて {#titan-all}

-   BLOBファイル数：TitanBLOBファイルの数
-   ブロブファイルサイズ：Titanブロブファイルの合計サイズ
-   ライブBLOBサイズ：有効なBLOBレコードの合計サイズ
-   Blobキャッシュヒット：Titanブロックキャッシュのヒット率
-   Iter touched blob file count：単一のイテレーターに含まれるblobファイルの数
-   BLOBファイルの破棄可能な比率分布：BLOBファイルのBLOBレコード障害の比率分布
-   ブロブキーのサイズ：Titanブロブキーのサイズ
-   BLOB値のサイズ：TitanBLOB値のサイズ
-   Blob get操作：Titanblobでのget操作の数
-   Blob get duration：Titanblobでget操作を実行するときに消費される時間
-   Blob iter操作：Titanblobでiter操作を実行するときに消費される時間
-   Blobシーク期間：TitanBLOBでシーク操作を実行するときに消費される時間
-   Blob next duration：Titanblobで次の操作を実行するときに消費される時間
-   Blob prev duration：Titanblobでprev操作を実行するときに消費される時間
-   ブロブキーのフロー：Titanブロブキーの操作のフローレート
-   Blobバイトフロー：TitanBLOBキーのバイトのフローレート
-   BLOBファイルの読み取り時間：TitanBLOBファイルの読み取りにかかる時間
-   BLOBファイルの書き込み時間：TitanBLOBファイルの書き込みにかかる時間
-   BLOBファイル同期操作：BLOBファイル同期操作の数
-   BLOBファイルの同期期間：BLOBファイルの同期にかかる時間
-   Blob GCアクション：TitanGCアクションの数
-   Blob GC期間：TitanGC期間
-   Blob GCキーフロー：TitanGCによって読み書きされるキーのフローレート
-   Blob GCバイトフロー：TitanGCによって読み書きされるバイトのフローレート
-   Blob GC入力ファイルのサイズ：TitanGC入力ファイルのサイズ
-   Blob GC出力ファイルのサイズ：TitanGC出力ファイルのサイズ
-   Blob GCファイル数：TitanGCに関係するBlobファイルの数

## ロックマネージャー {#lock-manager}

-   スレッドCPU：ロックマネージャースレッドのCPU使用率
-   処理されたタスク：ロックマネージャーによって処理されたタスクの数
-   ウェイターの存続期間：ロックが解放されるまでのトランザクションの待機時間
-   待機テーブル：ロックの数やロックを待機しているトランザクションの数など、待機テーブルのステータス情報
-   デッドロック検出期間：デッドロックの検出に費やされた時間
-   エラーの検出：デッドロックの数を含む、デッドロックの検出時に発生したエラーの数
-   デッドロック検出器リーダー：デッドロック検出器リーダーが配置されているノードの情報

## メモリー {#memory}

-   アロケータ統計：メモリアロケータの統計

## バックアップ {#backup}

-   バックアップCPU：バックアップスレッドのCPU使用率
-   範囲サイズ：バックアップ範囲サイズのヒストグラム
-   バックアップ期間：バックアップにかかる時間
-   バックアップフロー：バックアップの合計バイト数
-   ディスクスループット：インスタンスあたりのディスクスループット
-   バックアップ範囲の期間：範囲のバックアップにかかる時間
-   バックアップエラー：バックアップ中に発生したエラーの数

## 暗号化 {#encryption}

-   暗号化データキー：暗号化されたデータキーの総数
-   暗号化されたファイル：暗号化されたファイルの数
-   初期化された暗号化：暗号化が有効かどうかを示します。 `1`は有効であることを意味します。
-   暗号化メタファイルのサイズ：暗号化メタファイルのサイズ
-   データの暗号化/復号化nanos：毎回のデータの暗号化/復号化の期間のヒストグラム
-   暗号化メタファイルの読み取り/書き込み期間：暗号化メタファイルの読み取り/書き込みにかかる時間

## 共通パラメータの説明 {#explanation-of-common-parameters}

### gRPCメッセージタイプ {#grpc-message-type}

1.  トランザクションAPI：

    -   kv_get： `ts`で指定された最新バージョンのデータを取得するコマンド
    -   kv_scan：ある範囲のデータをスキャンするコマンド
    -   kv_prewrite：2PCの最初のフェーズでコミットされるデータを事前に書き込むコマンド
    -   kv_pessimistic_lock：他のトランザクションがこのキーを変更できないように、キーにペシミスティックロックを追加するコマンド
    -   kv_pessimistic_rollback：キーのペシミスティックロックを削除するコマンド
    -   kv_txn_heart_beat：悲観的なトランザクションまたは大規模なトランザクションの`lock_ttl`を更新して、ロールバックを防止するコマンド
    -   kv_check_txn_status：トランザクションのステータスをチェックするコマンド
    -   kv_commit：prewriteコマンドによって書き込まれたデータをコミットするコマンド
    -   kv_cleanup：v4.0で非推奨となったトランザクションをロールバックするコマンド
    -   kv_batch_get： `kv_get`と同様に、バッチキーの値を一度に取得するコマンド
    -   kv_batch_rollback：複数の事前書き込みトランザクションのバッチロールバックのコマンド
    -   kv_scan_lock：バージョン番号が`max_version`より前のすべてのロックをスキャンして、期限切れのトランザクションをクリーンアップするコマンド
    -   kv_resolve_lock：トランザクションステータスに応じて、トランザクションロックをコミットまたはロールバックするコマンド。
    -   kv_gc：GCのコマンド
    -   kv_delete_range：TiKVからデータの範囲を削除するコマンド

2.  生のAPI：

    -   raw_get：キーの値を取得するコマンド
    -   raw_batch_get：バッチキーの値を取得するコマンド
    -   raw_scan：ある範囲のデータをスキャンするコマンド
    -   raw_batch_scan：複数の連続するデータ範囲をスキャンするコマンド
    -   raw_put：キーと値のペアを書き込むコマンド
    -   raw_batch_put：キーと値のペアのバッチを書き込むコマンド
    -   raw_delete：キーと値のペアを削除するコマンド
    -   raw_batch_delete：キーと値のペアのバッチのコマンド
    -   raw_delete_range：データの範囲を削除するコマンド
