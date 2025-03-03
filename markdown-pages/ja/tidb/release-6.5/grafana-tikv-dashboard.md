---
title: Key Monitoring Metrics of TiKV
summary: Learn some key metrics displayed on the Grafana TiKV dashboard.
---

# TiKV の主要な監視指標 {#key-monitoring-metrics-of-tikv}

TiUPを使用して TiDB クラスターをデプロイすると、監視システム (Prometheus/Grafana) が同時にデプロイされます。詳細については、 [監視フレームワークの概要](/tidb-monitoring-framework.md)を参照してください。

Grafana ダッシュボードは、Overview、PD、TiDB、TiKV、Node_exporter、および Performance_overview を含む一連のサブ ダッシュボードに分かれています。診断に役立つ多くの指標があります。

## TiKV-詳細ダッシュボード {#tikv-details-dashboard}

主要なメトリックが表示される**TiKV-Details**ダッシュボードから、コンポーネントの TiKV ステータスの概要を取得できます。 [パフォーマンス マップ](https://asktug.com/_/tidb-performance-map/#/)に従って、クラスターのステータスが期待どおりであるかどうかを確認できます。

このセクションでは、 **TiKV-Details**ダッシュボードのこれらの主要な指標について詳しく説明します。

### クラスタ {#cluster}

-   ストア サイズ: TiKV インスタンスあたりのstorageサイズ
-   利用可能なサイズ: TiKV インスタンスあたりの利用可能な容量
-   容量サイズ: TiKV インスタンスあたりの容量サイズ
-   CPU: TiKV インスタンスごとの CPU 使用率
-   メモリ: TiKV インスタンスごとのメモリ使用量
-   IO 使用率: TiKV インスタンスごとの I/O 使用率
-   MBps: 各 TiKV インスタンスでの読み取りと書き込みの合計バイト数
-   QPS: 各 TiKV インスタンスのコマンドあたりの QPS
-   Errps: gRPC メッセージの失敗率
-   リーダー: TiKV インスタンスごとのリーダーの数
-   リージョン: TiKV インスタンスあたりのリージョン数
-   稼働時間: 最後の再起動以降の TiKV の実行時間

![TiKV Dashboard - Cluster metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-cluster.png)

### エラー {#errors}

-   重大なエラー: 重大なエラーの数
-   サーバーがビジーです: 書き込みストールやチャネル フルなど、TiKV インスタンスを一時的に使用できなくするイベントの発生を示します。通常は`0`のはずです。
-   サーバー レポートの失敗:サーバーによって報告されたエラー メッセージの数。通常は`0`のはずです。
-   Raftstoreエラー: 各 TiKV インスタンスのタイプごとのRaftstoreエラーの数
-   スケジューラ エラー: 各 TiKV インスタンスのタイプごとのスケジューラ エラーの数
-   コプロセッサー・エラー: 各 TiKV インスタンスのタイプごとのコプロセッサー・エラーの数
-   gRPC メッセージ エラー: 各 TiKV インスタンスのタイプごとの gRPC メッセージ エラーの数
-   Leaderドロップ: TiKV インスタンスごとにドロップされたリーダーの数
-   欠落しているLeader: TiKV インスタンスごとの欠落しているリーダーの数
-   Log Replication Reject: 各 TiKV インスタンスのメモリ不足が原因で拒否された logappend メッセージの数

![TiKV Dashboard - Errors metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-errors-v610.png)

### サーバ {#server}

-   CF サイズ: 各カラムファミリーのサイズ
-   ストア サイズ: TiKV インスタンスあたりのstorageサイズ
-   Channel full: TiKV インスタンスごとの Channel Full エラーの数。通常は`0`のはずです。
-   アクティブな書き込みリーダー: 各 TiKV インスタンスに書き込まれているリーダーの数
-   おおよそのリージョンサイズ: おおよそのリージョンサイズ
-   おおよそのリージョンサイズ ヒストグラム: 各おおよそのリージョンサイズのヒストグラム
-   リージョン平均書き込みキー: TiKV インスタンスあたりのリージョンに書き込まれたキーの平均数
-   リージョン平均書き込みバイト数: TiKV インスタンスごとのリージョンへの平均書き込みバイト数

![TiKV Dashboard - Server metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-server.png)

### gRPC {#grpc}

-   gRPC メッセージ数: タイプごとの gRPC メッセージの割合
-   gRPC message failed: 失敗した gRPC メッセージの割合
-   99% gRPC メッセージ期間: メッセージ タイプごとの gRPC メッセージ期間 (P99)
-   平均 gRPC メッセージ期間: gRPC メッセージの平均実行時間
-   gRPC バッチ サイズ: TiDB と TiKV 間の gRPC メッセージのバッチ サイズ
-   Raftメッセージ バッチ サイズ: TiKV インスタンス間のRaftメッセージのバッチ サイズ

### スレッドCPU {#thread-cpu}

-   Raft store CPU: `raftstore`スレッドの CPU 使用率。通常、CPU 使用率は 80% * `raftstore.store-pool-size`未満である必要があります。
-   非同期適用 CPU: `async apply`スレッドの CPU 使用率。通常、CPU 使用率は 90% * `raftstore.apply-pool-size`未満である必要があります。
-   スケジューラ ワーカー CPU: `scheduler worker`スレッドの CPU 使用率。通常、CPU 使用率は 90% * `storage.scheduler-worker-pool-size`未満である必要があります。
-   gRPC poll CPU: `gRPC`スレッドの CPU 使用率。通常、CPU 使用率は 80% * `server.grpc-concurrency`未満である必要があります。
-   統合読み取りプール CPU: `unified read pool`のスレッドの CPU 使用率
-   Storage ReadPool CPU: `storage read pool`スレッドの CPU 使用率
-   コプロセッサーCPU: `coprocessor`スレッドの CPU 使用率
-   RocksDB CPU: RocksDB スレッドの CPU 使用率
-   GC ワーカー CPU: `GC worker`スレッドの CPU 使用率
-   バックグラウンド ワーカー CPU: `background worker`スレッドの CPU 使用率

### PD {#pd}

-   PD リクエスト: TiKV が PD に送信するレート
-   PD リクエスト期間 (平均): TiKV が PD に送信するリクエストを処理する平均期間
-   PD ハートビート:ハートビートメッセージが TiKV から PD に送信される速度
-   PD 検証ピア: TiKV ピアを検証するためにメッセージが TiKV から PD に送信される速度

### RaftIO {#raft-io}

-   Apply log duration: Raft がログを適用するのにかかった時間
-   Apply log duration per サーバー: Raft がTiKV インスタンスごとにログを適用するのにかかった時間
-   ログ追加期間: Raft がログを追加するのにかかった時間
-   Append log duration per サーバー: Raft がTiKV インスタンスごとにログを追加するのにかかった時間
-   コミット ログ期間: ログをコミットするためにRaftが費やした時間
-   サーバーごとのコミット ログ期間 : Raftが TiKV インスタンスごとにログをコミットするために費やした時間

![TiKV Dashboard - Raft IO metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-raftio.png)

### Raftプロセス {#raft-process}

-   処理済みの準備完了: 1 秒あたりの種類ごとに処理された準備完了操作の数
    -   count: 1 秒あたりに処理された準備完了操作の数
    -   has_ready_region: 1 秒あたりの準備ができているリージョンの数
    -   pending_region: リージョンの準備ができているかどうかがチェックされているリージョンの 1 秒あたりの操作数。このメトリックは v3.0.0 以降非推奨です
    -   message: 1 秒あたりの準備完了操作に含まれるメッセージの数
    -   append: 1 秒あたりの準備完了オペレーションに含まれるRaftログ エントリの数
    -   commit: 1 秒あたりの準備完了操作に含まれるコミットされたRaftログ エントリの数
    -   スナップショット: 1 秒あたりの準備完了操作に含まれるスナップショットの数
-   0.99 Raftストア イベントの継続時間: Raftstoreイベントにかかった時間 (P99)
-   プロセス準備完了時間: Raftでプロセスが準備完了になるまでにかかった時間
-   サーバーごとのプロセス準備期間 : TiKV インスタンスごとのRaftでピア プロセスの準備が整うまでにかかった時間。 2 秒未満 (P99.99) である必要があります。

![TiKV Dashboard - Raft process metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-raft-process.png)

### Raftメッセージ {#raft-message}

-   Sent messages per サーバー: 各 TiKV インスタンスによって 1 秒あたりに送信されるRaftメッセージの数
-   Flush messages per サーバー : 各 TiKV インスタンスで 1 秒あたりにRaftクライアントによってフラッシュされたRaftメッセージの数
-   Receive messages per サーバー: 各 TiKV インスタンスが 1 秒間に受信したRaftメッセージの数
-   メッセージ: 1 秒あたりのタイプごとに送信されたRaftメッセージの数
-   投票: 1 秒あたりのRaftで送信された投票メッセージの数
-   Raft がドロップしたメッセージ: 1 秒あたりのタイプごとのドロップされたRaftメッセージの数

![TiKV Dashboard - Raft message metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-raft-message.png)

### Raftプロポーズ {#raft-propose}

-   準備完了ごとのRaft適用提案: 提案の適用中に、各準備完了操作がバッチに含む提案の数のヒストグラム。
-   Raft read/write プロポーザル: 1 秒あたりのタイプごとのプロポーザルの数
-   サーバーごとのRaft読み取り提案 : 1 秒あたりの各 TiKV インスタンスによる読み取り提案の数
-   サーバーごとのRaft書き込み提案 : 1 秒あたりの各 TiKV インスタンスによる書き込み提案の数
-   提案待機時間: 各提案の待機時間のヒストグラム
-   サーバーごとの待機時間の提案 : TiKV インスタンスごとの各提案の待機時間のヒストグラム
-   申請待機時間: 各提案の申請時間のヒストグラム
-   サーバーごとの適用待機時間 : TiKV インスタンスごとの各提案の適用時間のヒストグラム
-   Raftログ速度: ピアがログを提案する平均レート

![TiKV Dashboard - Raft propose metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-raft-propose.png)

### Raft管理者 {#raft-admin}

-   管理者の提案: 1 秒あたりの管理者の提案の数
-   管理適用: 1 秒あたりに処理された適用コマンドの数
-   Check split: 1 秒あたりのRaftstore分割チェック コマンドの数
-   99.99% チェックスプリット時間：スプリットチェックコマンド実行時の消費時間（P99.99）

![TiKV Dashboard - Raft admin metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-raft-admin.png)

### ローカルリーダー {#local-reader}

-   ローカル リーダー リクエスト: ローカル リード スレッドからの合計リクエスト数と拒否数

![TiKV Dashboard - Local reader metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-local-reader.png)

### 統合読み取りプール {#unified-read-pool}

-   レベルごとに使用された時間: 統合読み取りプール内の各レベルで消費された時間。レベル 0 は小さなクエリを意味します。
-   レベル 0 の可能性: 統合読み取りプール内のレベル 0 タスクの割合
-   実行中のタスク: 統合読み取りプールで同時に実行されているタスクの数

### 保管所 {#storage}

-   Storage command total: 1 秒あたりの種類別の受信コマンド数
-   ストレージ非同期要求エラー: 1 秒あたりのエンジン非同期要求エラーの数
-   ストレージ非同期スナップショット期間: 非同期スナップショット要求の処理にかかった時間。 `.99`の`1s`未満である必要があります。
-   ストレージの非同期書き込み時間: 非同期書き込み要求の処理にかかった時間。 `.99`の`1s`未満である必要があります。

![TiKV Dashboard - Storage metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-storage.png)

### スケジューラー {#scheduler}

-   スケジューラ ステージの合計: 1 秒あたりの各ステージでのコマンド数。短時間に多くのエラーが発生してはなりません。
-   スケジューラの書き込みバイト数: 各 TiKV インスタンスで処理されたコマンドによって書き込まれた合計バイト数
-   スケジューラ優先度コマンド: 1 秒あたりのさまざまな優先度コマンドの数
-   スケジューラの保留中のコマンド: 1 秒あたりの TiKV インスタンスごとの保留中のコマンドの数

![TiKV Dashboard - Scheduler metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-scheduler.png)

### スケジューラ - コミット {#scheduler-commit}

-   スケジューラ ステージの合計: commit コマンドを実行したときの各ステージでの 1 秒あたりのコマンド数。短時間に多くのエラーが発生してはなりません。
-   スケジューラ コマンドの所要時間: commit コマンドの実行にかかった時間。 `1s`未満である必要があります。
-   スケジューラ ラッチ待機時間: コミット コマンドの実行時にラッチによって発生する待機時間。 `1s`未満である必要があります。
-   スケジューラ キーの読み取り: commit コマンドによって読み取られたキーの数
-   書き込まれたスケジューラ キー: コミット コマンドによって書き込まれたキーの数
-   スケジューラ スキャンの詳細: キーは、commit コマンドの実行時に各 CF の詳細をスキャンします。
-   スケジューラ スキャンの詳細 [ロック]: コミット コマンドの実行時にロック CF のキー スキャンの詳細
-   スケジューラ スキャンの詳細 [書き込み]: commit コマンドの実行時に書き込み CF のキー スキャンの詳細
-   スケジューラ スキャンの詳細 [デフォルト]: コミット コマンドを実行するときのデフォルト CF のキー スキャンの詳細

![TiKV Dashboard - Scheduler commit metrics](https://docs-download.pingcap.com/media/images/docs/tikv-dashboard-scheduler-commit.png)

### スケジューラ - pessimistic_rollback {#scheduler-pessimistic-rollback}

-   スケジューラ ステージ合計: `pessimistic_rollback`のコマンドを実行したときの、1 秒あたりの各ステージでのコマンドの数。短時間に多くのエラーが発生してはなりません。
-   スケジューラーコマンド所要時間: `pessimistic_rollback`のコマンドの実行にかかった時間。 `1s`未満である必要があります。
-   スケジューララッチ待ち時間： `pessimistic_rollback`コマンド実行時のラッチによる待ち時間。 `1s`未満である必要があります。
-   Scheduler keys read: `pessimistic_rollback`のコマンドで読み取られたキーの数
-   Scheduler keys written: `pessimistic_rollback`コマンドで書き込まれたキーの数
-   スケジューラ スキャンの詳細: `pessimistic_rollback`コマンドを実行したときの各 CF のキー スキャンの詳細。
-   スケジューラ スキャンの詳細 [ロック]: `pessimistic_rollback`コマンド実行時のロック CF のキー スキャンの詳細
-   スケジューラ スキャンの詳細 [書き込み]: `pessimistic_rollback`コマンド実行時の書き込み CF のキー スキャンの詳細
-   スケジューラ スキャンの詳細 [デフォルト]: `pessimistic_rollback`コマンド実行時のデフォルト CF のキー スキャンの詳細

### スケジューラ - 事前書き込み {#scheduler-prewrite}

-   スケジューラ ステージ合計: プリライト コマンドを実行したときの各ステージでの 1 秒あたりのコマンド数。短時間に多くのエラーが発生してはなりません。
-   スケジューラーコマンド時間: prewrite コマンドの実行にかかった時間。 `1s`未満である必要があります。
-   スケジューララッチ待ち時間：プリライトコマンド実行時のラッチによる待ち時間。 `1s`未満である必要があります。
-   スケジューラ キーの読み取り: 事前書き込みコマンドによって読み取られたキーの数
-   書き込まれたスケジューラ キー: 事前書き込みコマンドによって書き込まれたキーの数
-   スケジューラ スキャンの詳細: キーは、事前書き込みコマンドの実行時に各 CF の詳細をスキャンします。
-   スケジューラ スキャンの詳細 [ロック]: プリライト コマンドの実行時にロック CF のキー スキャンの詳細
-   スケジューラ スキャンの詳細 [write]: prewrite コマンドを実行するときの書き込み CF のキー スキャンの詳細
-   スケジューラ スキャンの詳細 [デフォルト]: 事前書き込みコマンドの実行時に、デフォルト CF のキー スキャンの詳細

### スケジューラ - ロールバック {#scheduler-rollback}

-   スケジューラ ステージの合計: ロールバック コマンドを実行したときの、1 秒あたりの各ステージでのコマンドの数。短時間に多くのエラーが発生してはなりません。
-   スケジューラ コマンドの所要時間: ロールバック コマンドの実行にかかった時間。 `1s`未満である必要があります。
-   スケジューラ ラッチ待機時間: ロールバック コマンドの実行時にラッチによって発生する待機時間。 `1s`未満である必要があります。
-   スケジューラ キーの読み取り: ロールバック コマンドによって読み取られたキーの数
-   書き込まれたスケジューラ キー: ロールバック コマンドによって書き込まれたキーの数
-   スケジューラ スキャンの詳細: キーは、ロールバック コマンドの実行時に各 CF の詳細をスキャンします。
-   スケジューラ スキャンの詳細 [ロック]: ロールバック コマンドの実行時にキーがロック CF の詳細をスキャンします。
-   スケジューラ スキャンの詳細 [書き込み]: ロールバック コマンドの実行時に書き込み CF のキー スキャンの詳細
-   スケジューラ スキャンの詳細 [デフォルト]: ロールバック コマンドを実行するときのデフォルト CF のキー スキャンの詳細

### GC {#gc}

-   GC タスク: gc_worker によって処理された GC タスクの数
-   GC タスクの所要時間: GC タスクの実行にかかった時間
-   TiDB GC 秒: GC 期間
-   TiDB GC ワーカー アクション: TiDB GC ワーカー アクションの数
-   ResolveLocks Progress: GC の第 1 フェーズ (Resolve Locks) の進行状況
-   TiKV Auto GC Progress: GC の第 2 フェーズの進行状況
-   GC 速度: GC によって 1 秒あたりに削除されるキーの数
-   TiKV Auto GC SafePoint: TiKV GC セーフポイントの値。安全なポイントは現在の GC タイムスタンプです
-   GC ライフタイム: TiDB GC のライフタイム
-   GC 間隔: TiDB GC の間隔
-   圧縮フィルターの GC: 書き込み CF の圧縮フィルターでフィルター処理されたバージョンの数。

### スナップショット {#snapshot}

-   レート スナップショット メッセージ: Raftスナップショット メッセージが送信されるレート
-   99% スナップショットの処理時間: スナップショットの処理にかかった時間 (P99)
-   スナップショット状態数: 状態ごとのスナップショットの数
-   99.99% スナップショット サイズ: スナップショット サイズ (P99.99)
-   99.99% スナップショット KV カウント: スナップショット内の KV の数 (P99.99)

### タスク {#task}

-   ワーカーが処理したタスク: ワーカーが 1 秒あたりに処理したタスクの数
-   ワーカーの保留中のタスク: 1 秒あたりのワーカーの保留中および実行中のタスクの現在の数。通常は`1000`未満である必要があります。
-   FuturePool で処理されたタスク: 1 秒あたりの Future プールによって処理されたタスクの数
-   FuturePool の保留中のタスク: 1 秒あたりの将来のプールの保留中および実行中のタスクの現在の数

### コプロセッサーの概要 {#coprocessor-overview}

-   リクエスト期間: コプロセッサーのリクエストを受信してからリクエストの処理が完了するまでの合計期間
-   Total Requests: 1 秒あたりのタイプ別のリクエスト数
-   処理時間: コプロセッサー要求の 1 分あたりの処理に実際に費やされた時間のヒストグラム
-   Total Request Errors:コプロセッサーの 1 秒あたりの要求エラー数。短時間に多くのエラーが発生してはなりません。
-   Total KV Cursor Operations: `select` 、 `index` 、 `analyze_table` 、 `analyze_index` 、 `checksum_table` 、 `checksum_index`など、タイプ別の 1 秒あたりの KV カーソル操作の総数。
-   KV カーソル操作: 1 秒あたりのタイプ別の KV カーソル操作のヒストグラム
-   Total RocksDB Perf 統計: RocksDB パフォーマンスの統計
-   Total Response Size: コプロセッサー応答の合計サイズ

### コプロセッサーの詳細 {#coprocessor-detail}

-   処理時間: コプロセッサー要求の 1 分あたりの処理に実際に費やされた時間のヒストグラム
-   ストアごとの 95% 処理時間: 1 秒あたりの TiKV インスタンスごとのコプロセッサ要求の処理にかかった時間 (P95)
-   待機時間: コプロセッサー要求が処理されるのを待機しているときに消費される時間。 `10s`未満である必要があります (P99.99)。
-   ストアごとの 95% 待機時間: コプロセッサー要求が 1 秒あたりの TiKV インスタンスごとの処理を待機しているときに費やされた時間 (P95)
-   合計 DAG リクエスト: 1 秒あたりの DAG リクエストの合計数
-   Total DAG Executors: 1 秒あたりの DAG エグゼキュータの総数
-   Total Ops Details (Table Scan): コプロセッサーで選択スキャンを実行するときの 1 秒あたりの RocksDB 内部操作の数
-   Total Ops Details (Index Scan): コプロセッサーでインデックススキャンを実行する際の 1 秒あたりの RocksDB 内部操作の数
-   Total Ops Details by CF (Table Scan): コプロセッサーで選択スキャンを実行する際の 1 秒あたりの各 CF の RocksDB 内部操作の数
-   Total Ops Details by CF (Index Scan): コプロセッサーでインデックススキャンを実行する際の 1 秒あたりの各 CF の RocksDB 内部操作の数

### スレッド {#threads}

-   スレッドの状態: TiKV スレッドの状態
-   Threads IO: 各 TiKV スレッドの I/O トラフィック
-   スレッドの自発的なコンテキスト スイッチ: TiKV スレッドの自発的なコンテキスト スイッチの数
-   スレッドの非自発的コンテキスト スイッチ: TiKV スレッドの非自発的コンテキスト スイッチの数

### RocksDB - kv/いかだ {#rocksdb-kv-raft}

-   取得操作: 1 秒あたりの取得操作の数
-   取得時間: 取得操作の実行にかかった時間
-   シーク操作: 1 秒あたりのシーク操作の数
-   シーク時間: シーク操作の実行にかかった時間
-   書き込み操作: 1 秒あたりの書き込み操作の数
-   書き込み時間: 書き込み操作の実行にかかった時間
-   WAL 同期操作: 1 秒あたりの WAL 同期操作の数
-   Write WAL duration: WAL の書き込みにかかった時間
-   WAL 同期時間: WAL 同期操作の実行にかかった時間
-   圧縮操作: 1 秒あたりの圧縮およびフラッシュ操作の数
-   圧縮時間: 圧縮およびフラッシュ操作の実行にかかった時間
-   SST 読み取り時間: SST ファイルの読み取りにかかった時間
-   書き込みストール期間: 書き込みストール期間。通常は`0`のはずです。
-   Memtable サイズ: 各カラムファミリーの memtable サイズ
-   Memtable hit: memtable のヒット率
-   ブロック キャッシュ サイズ:ブロックキャッシュサイズ。共有ブロックキャッシュが無効になっている場合は、カラムファミリーごとに分類されます。
-   ブロックキャッシュヒット：ブロックキャッシュのヒット率
-   ブロック キャッシュ フロー: タイプごとのブロックキャッシュ操作のフロー率
-   ブロック キャッシュ操作: タイプごとのブロックキャッシュ操作の数
-   キー フロー: タイプごとのキー操作のフロー レート
-   合計キー: 各カラムファミリーのキーの数
-   読み取りフロー: タイプごとの読み取り操作の流量
-   Bytes / Read: 読み取り操作あたりのバイト数
-   書き込みフロー: タイプごとの書き込み操作の流量
-   Bytes / Write: 書き込み操作あたりのバイト数
-   締固め流量：タイプごとの締固め操作の流量
-   圧縮保留中のバイト: 圧縮する保留中のバイト
-   読み取り増幅: TiKV インスタンスごとの読み取り増幅
-   圧縮率：各レベルの圧縮率
-   スナップショットの数: TiKV インスタンスごとのスナップショットの数
-   最も古いスナップショットの期間: 最も古い未リリースのスナップショットが存続する時間
-   Number files at each level: 各レベルの異なる列ファミリーの SST ファイルの数
-   取り込み SST duration seconds: SST ファイルの取り込みにかかった時間
-   各 CF のストール条件が変更されました: 各カラムファミリーのストール条件が変更されました

### タイタン - すべて {#titan-all}

-   BLOB ファイル数: Titan BLOB ファイルの数
-   Blob file size: Titan blob ファイルの合計サイズ
-   ライブ BLOB サイズ: 有効な BLOB レコードの合計サイズ
-   Blob キャッシュ ヒット: Titanブロックキャッシュのヒット率
-   Iter touched blob file count: 1 つの反復子に含まれる BLOB ファイルの数
-   Blobファイル破棄可能率分布：blobファイルのblob記録失敗率分布
-   BLOB キーのサイズ: Titan Blob キーのサイズ
-   ブロブ値のサイズ: Titan ブロブ値のサイズ
-   BLOB の取得操作: Titan BLOB での取得操作の数
-   Blob get duration: Titan blob で get 操作を実行するときにかかった時間
-   Blob iter 操作: Titan blob で iter 操作を実行するときにかかった時間
-   BLOB のシーク時間: Titan BLOB でシーク操作を実行するときにかかった時間
-   Blob next duration: Titan blob で次の操作を実行するときに消費される時間
-   Blob prev duration: Titan blob で前の操作を実行するときにかかった時間
-   BLOB キー フロー: Titan BLOB キーの操作のフロー レート
-   Blob バイト フロー: Titan blob キーのバイト フロー レート
-   BLOB ファイルの読み取り時間: Titan BLOB ファイルの読み取りにかかった時間
-   BLOB ファイルの書き込み時間: Titan BLOB ファイルの書き込みにかかった時間
-   BLOB ファイルの同期操作: BLOB ファイルの同期操作の数
-   BLOB ファイルの同期期間: BLOB ファイルの同期にかかった時間
-   Blob GC アクション: Titan GC アクションの数
-   Blob GC 期間: Titan GC 期間
-   Blob GC キー フロー: Titan GC によって読み書きされるキーのフロー レート
-   Blob GC バイト フロー: Titan GC によって読み書きされるバイトの流量
-   Blob GC 入力ファイル サイズ: Titan GC 入力ファイルのサイズ
-   Blob GC 出力ファイル サイズ: Titan GC 出力ファイルのサイズ
-   Blob GC file count: Titan GC に関係する blob ファイルの数

### 悲観的ロック {#pessimistic-locking}

-   ロック マネージャー スレッド CPU: ロック マネージャー スレッドの CPU 使用率
-   ロック マネージャーによって処理されたタスク: ロック マネージャーによって処理されたタスクの数
-   待機期間: ロックが解放されるまでのトランザクションの待機時間
-   待機テーブル: ロックの数とロックを待機しているトランザクションの数を含む、待機テーブルのステータス情報
-   デッドロック検出時間: デッドロックの検出にかかった時間
-   エラーの検出: デッドロックの数を含む、デッドロックの検出時に発生したエラーの数
-   デッドロック検出リーダー: デッドロック検出リーダーが配置されているノードの情報
-   悲観的ロックの合計メモリサイズ: メモリ内の悲観的ロックが占有するメモリサイズ
-   インメモリの悲観的ロックの結果:悲観的ロックのみをメモリに保存した結果。 `full`メモリ制限を超えたために悲観的ロックがメモリに保存されなかった回数を意味します。

### メモリー {#memory}

-   Allocator Stats:メモリアロケータの統計

### バックアップ {#backup}

-   バックアップ CPU: バックアップ スレッドの CPU 使用率
-   範囲サイズ: バックアップ範囲サイズのヒストグラム
-   バックアップ期間: バックアップにかかった時間
-   バックアップ フロー: バックアップの合計バイト数
-   ディスク スループット: インスタンスあたりのディスク スループット
-   バックアップ範囲期間: 範囲のバックアップにかかった時間
-   バックアップ エラー: バックアップ中に発生したエラーの数

### 暗号化 {#encryption}

-   暗号化データ キー: 暗号化されたデータ キーの総数
-   暗号化されたファイル: 暗号化されたファイルの数
-   暗号化が初期化されました: 暗号化が有効になっているかどうかを示します。 `1`有効であることを意味します。
-   暗号化メタ ファイルのサイズ: 暗号化メタ ファイルのサイズ
-   データ ナノの暗号化/復号化: 毎回のデータの暗号化/復号化にかかる時間のヒストグラム
-   読み取り/書き込み暗号化メタ期間: 暗号化メタ ファイルの読み取り/書き込みにかかった時間

### 共通パラメータの説明 {#explanation-of-common-parameters}

#### gRPC メッセージ タイプ {#grpc-message-type}

1.  トランザクション API:

    -   kv_get: `ts`で指定された最新バージョンのデータを取得するコマンド
    -   kv_scan: データの範囲をスキャンするコマンド
    -   kv_prewrite: 2PC の最初のフェーズでコミットするデータを事前に書き込むコマンド
    -   kv_pessimistic_lock: キーに悲観的ロックを追加して、他のトランザクションがこのキーを変更できないようにするコマンド
    -   kv_pessimistic_rollback: キーの悲観的ロックを削除するコマンド
    -   kv_txn_heart_beat:悲観的トランザクションまたは大規模なトランザクションのロールバックを防ぐために`lock_ttl`を更新するコマンド
    -   kv_check_txn_status: トランザクションのステータスを確認するコマンド
    -   kv_commit：プリライトコマンドで書き込んだデータをコミットするコマンド
    -   kv_cleanup: v4.0 で非推奨になった、トランザクションをロールバックするコマンド
    -   kv_batch_get: バッチキーの値を一括で取得するコマンド、 `kv_get`と同様
    -   kv_batch_rollback: 複数の事前書き込みトランザクションの一括ロールバックのコマンド
    -   kv_scan_lock: バージョン番号が`max_version`より前のすべてのロックをスキャンして、期限切れのトランザクションをクリーンアップするコマンド
    -   kv_resolve_lock: トランザクションの状態に応じて、トランザクション ロックをコミットまたはロールバックするコマンド。
    -   kv_gc: GC のコマンド
    -   kv_delete_range: TiKV から一定範囲のデータを削除するコマンド

2.  生の API:

    -   raw_get: キーの値を取得するコマンド
    -   raw_batch_get: バッチキーの値を取得するコマンド
    -   raw_scan: データの範囲をスキャンするコマンド
    -   raw_batch_scan: 複数の連続したデータ範囲をスキャンするコマンド
    -   raw_put: キーと値のペアを書き込むコマンド
    -   raw_batch_put: キーと値のペアのバッチを書き込むコマンド
    -   raw_delete: キーと値のペアを削除するコマンド
    -   raw_batch_delete: キーと値のペアのバッチのコマンド
    -   raw_delete_range: データの範囲を削除するコマンド

## TiKV-FastTune ダッシュボード {#tikv-fasttune-dashboard}

QPS ジッター、レイテンシージッター、レイテンシー増加傾向など、TiKV のパフォーマンスの問題が発生した場合は、 **TiKV-FastTune**ダッシュボードを確認できます。このダッシュボードには、特にクラスター内の書き込みワークロードが中規模または大規模である場合に、診断に役立つ一連のパネルが含まれています。

書き込み関連のパフォーマンスの問題が発生した場合、まず TiDB 関連のダッシュボードを確認できます。問題がstorage側にある場合は、 **TiKV-FastTune**ページを開き、すべてのパネルを参照して確認します。

**TiKV-FastTune**ダッシュボードで、パフォーマンスの問題の考えられる原因を示唆するタイトルを確認できます。提案された原因が正しいかどうかを確認するには、ページ上のグラフを確認します。

グラフの左 Y 軸はstorage側の書き込み RPC QPS を表し、右 Y 軸の一連のグラフは上下逆に描かれています。左のグラフの形状が右のグラフの形状と一致する場合、提案された原因は真です。

詳細なメトリックと説明については、ダッシュボード[ユーザーマニュアル](https://docs.google.com/presentation/d/1aeBF2VCKf7eo4-3TMyP7oPzFWIih6UBA53UI8YQASCQ/edit#slide=id.gab6b984c2a_1_352)を参照してください。
