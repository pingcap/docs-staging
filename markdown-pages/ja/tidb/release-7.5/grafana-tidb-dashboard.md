---
title: TiDB Monitoring Metrics
summary: TiUPを使用してTiDBクラスターをデプロイすると、監視システム（PrometheusおよびGrafana）も同時にデプロイされます。Grafanaダッシュボードは、概要、PD、TiDB、TiKV、Node_exporter、Disk Performance、およびPerformance_overviewを含む一連のサブダッシュボードに分割されています。このドキュメントでは、TiDBダッシュボードに表示されるいくつかの主要な監視メトリクスについて説明します。
---

# TiDB モニタリングメトリクス {#tidb-monitoring-metrics}

TiUPを使用して TiDB クラスターをデプロイすると、監視システム (Prometheus および Grafana) も同時にデプロイされます。監視アーキテクチャについては、 [TiDB モニタリング フレームワークの概要](/tidb-monitoring-framework.md)を参照してください。

Grafana ダッシュボードは、概要、PD、TiDB、TiKV、Node_exporter、Disk Performance、および Performance_overview を含む一連のサブ ダッシュボードに分割されています。 TiDB ダッシュボードは、TiDB パネルと TiDB 概要パネルで構成されます。 2 つのパネルの違いは次の点です。

-   TiDB パネル: クラスターの異常をトラブルシューティングするための可能な限り包括的な情報を提供します。
-   TiDB 概要パネル: TiDB パネル情報のうち、ユーザーが最も関心のある部分を一部変更して抽出します。日々のデータベース運用においてユーザーが気になるデータ（QPS、TPS、応答遅延など）を表示・レポートする監視情報として提供します。

このドキュメントでは、TiDB ダッシュボードに表示されるいくつかの主要な監視メトリクスについて説明します。

## 主要な指標の説明 {#key-metrics-description}

TiDB ダッシュボードに表示される主要なメトリクスを理解するには、次のセクションを確認してください。

### クエリの概要 {#query-summary}

-   期間: 実行時間
    -   クライアントのネットワーク リクエストが TiDB に送信されてから、TiDB がリクエストを実行した後にリクエストがクライアントに返されるまでの期間。一般に、クライアント要求は SQL ステートメントの形式で送信されますが、 `COM_PING` 、 `COM_SLEEP` 、 `COM_STMT_FETCH` 、 `COM_SEND_LONG_DATA`などのコマンドの実行時間が含まれる場合もあります。
    -   TiDB はマルチクエリをサポートしているため、複数の SQL ステートメント ( `select 1; select 1; select 1;`など) を一度に送信することができます。この場合、このクエリの合計実行時間には、すべての SQL ステートメントの実行時間が含まれます。
-   Command Per Second: TiDB によって処理される 1 秒あたりのコマンド数。コマンド実行結果の成功または失敗に従って分類されます。
-   QPS: すべての TiDB インスタンスで 1 秒あたりに実行される SQL ステートメントの数。 `SELECT` 、 `INSERT` 、 `UPDATE` 、およびその他のタイプのステートメントに従ってカウントされます。
-   CPS By Instance: コマンド実行結果の成功または失敗に従って分類された、各 TiDB インスタンスのコマンド統計。
-   失敗したクエリ OPM: 各 TiDB インスタンスで 1 分あたりの SQL ステートメントの実行時に発生したエラーに応じたエラー タイプ (構文エラーや主キーの競合など) の統計。エラーが発生したモジュールとエラーコードが含まれています
-   スロー クエリ: スロー クエリの処理時間の統計 (スロー クエリ全体の時間コスト、 コプロセッサーの時間コスト、およびコプロセッサースケジューリングの待機時間)。遅いクエリは内部 SQL ステートメントと一般 SQL ステートメントに分類されます。
-   接続アイドル期間: アイドル接続の期間
-   999/99/95/80 期間: さまざまなタイプの SQL ステートメントの実行時間の統計 (さまざまなパーセンタイル)

### クエリの詳細 {#query-detail}

-   期間 80/95/99/999 インスタンス別: 各 TiDB インスタンスでの SQL ステートメントの実行時間の統計 (さまざまなパーセンタイル)
-   失敗したクエリ OPM の詳細: 各 TiDB インスタンスで 1 分あたりの SQL ステートメントの実行時に発生したエラーに応じたエラー タイプ (構文エラーや主キーの競合など) の統計。
-   内部 SQL OPS: TiDB クラスター全体で 1 秒あたりに実行される内部 SQL ステートメント。内部 SQL ステートメントは内部で実行され、通常はユーザー SQL ステートメントまたは内部でスケジュールされたタスクによってトリガーされます。

### サーバ {#server}

-   稼働時間: 各 TiDB インスタンスの実行時間
-   メモリ使用量: 各 TiDB インスタンスのメモリ使用量統計。プロセスによって占有されているメモリとGolangによってヒープ上に適用されるメモリに分けられます。
-   CPU 使用率: 各 TiDB インスタンスの CPU 使用率の統計
-   接続数: 各 TiDB インスタンスに接続されているクライアントの数
-   Open FD Count: 各 TiDB インスタンスのオープンされたファイル記述子の統計
-   切断数: 各 TiDB インスタンスに切断されたクライアントの数
-   イベント OPM: 「start」、「close」、「graceful-shutdown」、「kill」、「hang」などの主要なイベントの統計。
-   Goroutine Count: 各 TiDB インスタンス上の Goroutine の数
-   Prepare ステートメント数: 各 TiDB インスタンスで実行される`Prepare`ステートメントの数とその合計数
-   Keep Alive OPM: 各 TiDB インスタンスでメトリクスが 1 分ごとに更新される回数。通常は注意する必要はありません。
-   パニックおよびクリティカル エラー: TiDB で発生したパニックおよびクリティカル エラーの数
-   Time Jump Back OPS: 各 TiDB インスタンスでオペレーティング システムが 1 秒ごとに巻き戻す回数
-   トークンの取得期間: 各接続でトークンを取得する時間コスト
-   Skip Binlog Count: TiDB でのbinlog書き込み失敗の数
-   クライアント データ トラフィック: TiDB とクライアントのデータ トラフィック統計

### トランザクション {#transaction}

-   トランザクションOPS: 1 秒あたりに実行されるトランザクションの数
-   期間: トランザクションの実行期間
-   トランザクション Statement Num: トランザクション内の SQL ステートメントの数
-   トランザクション再試行回数: トランザクションが再試行される回数
-   セッション再試行エラー OPS: トランザクションの再試行中に発生したエラーの 1 秒あたりの数。このメトリクスには、再試行の失敗と再試行の最大数の超過という 2 つのエラー タイプが含まれます。
-   コミットトークン待機期間: トランザクションコミット中のフロー制御キュー内の待機期間。待機時間が長い場合は、コミットするトランザクションが大きすぎるため、フローが制御されていることを意味します。システムに利用可能なリソースがまだある場合は、システム変数`tidb_committer_concurrency`を増やすことでコミット プロセスを高速化できます。
-   KVトランザクションOPS: 各 TiDB インスタンス内で 1 秒あたりに実行されるトランザクションの数
    -   ユーザー トランザクションは、内部メタデータの読み取りやユーザー トランザクションのアトミック再試行など、TiDB で複数のトランザクション実行をトリガーする場合があります。
    -   TiDB の内部でスケジュールされたタスクも、このパネルに含まれるトランザクションを通じてデータベース上で動作します。
-   KVトランザクション期間: 各 TiDB 内でのトランザクションの実行に費やされた時間
-   トランザクション領域数: トランザクションで操作された領域の数
-   トランザクション書き込み KV 数値のレートと合計: トランザクション内で KV が書き込まれるレートと、これらの書き込まれた KV の合計
-   トランザクション書き込み KV 数: トランザクションで操作された KV の数
-   ステートメント ロック キー: 単一ステートメントのロックの数
-   ハートビート送信期間: トランザクションがハートビートを送信する期間
-   トランザクション書き込みサイズ バイト数 レートと合計: トランザクション内でのバイトの書き込みレートとこれらの書き込みバイトの合計
-   トランザクション書き込みサイズ バイト: トランザクションで書き込まれるデータのサイズ
-   悲観的ロックの取得期間: ロックの追加にかかる時間
-   TTL Lifetime Reach Counter: TTL の上限に達したトランザクションの数。 TTL 上限のデフォルト値は 1 時間です。これは、悲観的的なトランザクションの最初のロック、または楽観的トランザクションの最初の事前書き込みから 1 時間が経過したことを意味します。 TTL の上限のデフォルト値は 1 時間です。 TTL 寿命の上限は、TiDB 設定ファイルの`max-txn-TTL`を変更することで変更できます。
-   ロード セーフポイント OPS: `Safepoint`がロードされる回数。 `Safepoint`は、トランザクションがデータを読み取るときに`Safepoint`より前のデータが読み込まれないようにすることで、データの安全性を確保します。 `Safepoint`より前のデータは GC によってクリーンアップされる可能性があります
-   悲観的ステートメントの再試行 OPS:悲観的ステートメントの再試行回数。ステートメントがロックを追加しようとすると、書き込み競合が発生する可能性があります。このとき、ステートメントは新しいスナップショットを取得し、ロックを再度追加します。
-   秒あたりのトランザクションタイプ: 2 フェーズ コミット (2PC)、非同期コミット、および 1 フェーズ コミット (1PC) メカニズムを使用して 1 秒あたりにコミットされたトランザクションの数 (成功したトランザクションと失敗したトランザクションの両方を含む)

### 執行者 {#executor}

-   解析時間: SQL ステートメントの解析時間の統計
-   コンパイル時間: 解析された SQL AST を実行計画にコンパイルする時間の統計
-   実行時間: SQL ステートメントの実行時間の統計
-   高価なエグゼキューター OPS: 1 秒あたり多くのシステム リソースを消費するオペレーターの統計 ( `Merge Join` 、 `Hash Join` 、 `Index Look Up Join` 、 `Hash Agg` 、 `Stream Agg` 、 `Sort` 、 `TopN`を含む)
-   プラン キャッシュを使用したクエリ OPS: 1 秒あたりのプラン キャッシュを使用したクエリの統計
-   プラン キャッシュ ミス OPS: 1 秒あたりのプラン キャッシュがミスされた回数の統計
-   プラン キャッシュ メモリ使用量: 各 TiDB インスタンスにキャッシュされた実行プランによって消費されるメモリの合計
-   プラン キャッシュ プラン数: 各 TiDB インスタンスにキャッシュされた実行プランの総数

### ディスSQL {#distsql}

-   Distsql 期間: Distsql ステートメントの処理時間
-   Distsql QPS: Distsql ステートメントの統計
-   Distsql 部分 QPS: 1 秒あたりの部分結果の数
-   Scan Keys Num: 各クエリがスキャンするキーの数
-   スキャン キーの部分的な数: 各部分的な結果がスキャンするキーの数
-   Partial Num: 各 SQL ステートメントの部分結果の数

### KVエラー {#kv-errors}

-   KV バックオフ期間: KV 再試行リクエストが継続する合計期間。 TiDB が TiKV にリクエストを送信するときにエラーが発生する場合があります。 TiDB には、TiKV へのすべてのリクエストに対する再試行メカニズムがあります。この`KV Backoff Duration`項目には、リクエストのリトライの合計時間が記録されます。
-   TiClientリージョンエラー OPS: TiKV によって返されたリージョン関連のエラー メッセージの数
-   KV バックオフ OPS: TiKV によって返されたエラー メッセージの数
-   ロック解決 OPS: ロックを解決するための TiDB 操作の数。 TiDB の読み取りまたは書き込みリクエストがロックに遭遇すると、ロックを解決しようとします。
-   その他のエラー OPS: ロックのクリアや更新`SafePoint`など、その他の種類のエラーの数

### KV リクエスト {#kv-request}

次のメトリクスは、TiKV に送信されたリクエストに関連しています。リトライ要求は複数回カウントされます。

-   KV リクエスト OPS: TiKV に従って表示される KV リクエストの実行時間
-   ストア別の KV リクエスト期間 99: TiKV に従って表示される KV リクエストの実行時間
-   タイプ別の KV リクエスト期間 99: リクエストのタイプに応じて表示される、KV リクエストの実行時間
-   ステイル読み取りヒット/ミス操作
    -   **hit** : 古い読み取りを正常に実行した 1 秒あたりのリクエストの数
    -   **miss** : 古い読み取りを試行したが失敗した 1 秒あたりのリクエストの数
-   ステイル読み取り要求操作:
    -   **Cross-zone** : リモート ゾーンで古い読み取りを試行する 1 秒あたりのリクエストの数
    -   **local** : ローカル ゾーンで古い読み取りを試行する 1 秒あたりのリクエストの数
-   ステイル読み取り要求トラフィック:
    -   **Cross-zone-in** : リモート ゾーンで古い読み取りを試みるリクエストに対する応答の受信トラフィック
    -   **Cross-zone-out** : リモート ゾーンで古い読み取りを試行するリクエストの送信トラフィック
    -   **local-in** : ローカルゾーンで古い読み取りを試みるリクエストに対する応答の受信トラフィック
    -   **local-out** : ローカルゾーンで古い読み取りを試みるリクエストの送信トラフィック

### PDクライアント {#pd-client}

-   PD Client CMD OPS: PD Client によって 1 秒あたりに実行されたコマンドの統計
-   PD クライアント CMD 持続時間: PD クライアントがコマンドを実行するのにかかる時間
-   PD Client CMD Fail OPS: PD Client によって実行された失敗したコマンドの 1 秒あたりの統計
-   PD TSO OPS: TiDB が 1 秒あたり PD から取得する TSO の数
-   PD TSO 待機時間: TiDB が PD が TSO を返すのを待機する時間
-   PD TSO RPC 期間: TiDB が (TSO を取得するために) PD にリクエストを送信してから、TiDB が TSO を受信するまでの期間
-   TSO 開始待機期間: TiDB が PD にリクエストを送信して ( `start TSO`を取得する) から TiDB が`start TSO`を受信するまでの期間

### スキーマのロード {#schema-load}

-   スキーマの読み込み時間: TiDB が TiKV からスキーマを取得するのにかかる時間
-   ロード スキーマ OPS: TiDB が TiKV から取得する 1 秒あたりのスキーマの統計
-   スキーマ リース エラー OPM: スキーマ リース エラーには`change`と`outdate` 2 つのタイプがあります。 `change`スキーマが変更されたことを意味し、 `outdate`スキーマを更新できないことを意味します。これはより重大なエラーであり、アラートがトリガーされます。
-   Load Privilege OPS: TiDB が TiKV から取得した 1 秒あたりの権限情報の数の統計

### DDL {#ddl}

-   DDL 期間 95: DDL ステートメント処理時間の 95% 分位数
-   バッチ追加インデックス期間 100: インデックスの作成に各バッチが費やした最大時間の統計
-   DDL 待機ジョブ数: 待機している DDL タスクの数
-   DDL META OPM: DDL が毎分 META を取得する回数
-   DDL ワーカー期間 99: 各 DDL ワーカーの実行時間の 99% 分位数
-   Syncerのデプロイ時間: Schema Version Syncer の初期化、再起動、および操作のクリアにかかる時間
-   オーナー ハンドル シンサー期間: DDL オーナーがスキーマ バージョンを更新、取得、確認するのにかかる時間
-   自己バージョン更新期間: Schema Version Syncer のバージョン情報の更新にかかる時間
-   DDL OPM: 1 秒あたりの DDL 実行数
-   DDL バックフィルの進行状況 (パーセンテージ): DDL タスクのバックフィルの進行状況

### 統計 {#statistics}

-   自動分析期間 95: 自動分析にかかる時間`ANALYZE`
-   Auto Analyze QPS: 自動`ANALYZE`の統計
-   統計不正確率: 統計不正確率の情報
-   擬似推定 OPS: 擬似統計を使用して最適化された SQL ステートメントの数
-   ダンプ フィードバック OPS: 保存された統計フィードバックの数
-   クエリ フィードバックの保存 QPS: TiDBメモリで実行される、ユニオン クエリのフィードバック情報を保存するための 1 秒あたりの操作の数。
-   重要なフィードバック: 統計情報を更新する重要なフィードバックの数
-   Update Stats OPS: フィードバックを使用して統計を更新する操作の数

### 所有者 {#owner}

-   新しい ETCD セッション期間 95: 新しい etcd セッションの作成にかかる時間。 TiDB は、etcd クライアントを通じて PD の etcd に接続し、メタデータ情報を保存/読み取ります。これは、セッションの作成に費やした時間を記録します。
-   オーナー ウォッチャー OPS: DDL オーナー ウォッチ PD の etcd メタデータの 1 秒あたりの Goroutine オペレーションの数

### メタ {#meta}

-   AutoID QPS: AutoID 関連の統計。3 つの操作 (グローバル ID 割り当て、単一テーブル AutoID 割り当て、単一テーブル AutoID Rebase) を含みます。
-   AutoID 継続時間: AutoID 関連の操作にかかる時間
-   リージョンキャッシュ エラー OPS: TiDB のキャッシュされたリージョン情報によって 1 秒あたりに発生したエラーの数
-   メタ操作期間 99: メタ操作のレイテンシー

### GC {#gc}

-   Worker Action OPM: GC 関連の操作の数 ( `run_job` 、 `resolve_lock` 、および`delete_range`を含む)
-   期間 99: GC 関連の操作に費やされる時間
-   Config: GC データの有効期間と GC 実行間隔の設定
-   GC 失敗 OPM: 失敗した GC 関連操作の数
-   範囲削除失敗 OPM: `Delete Range`が失敗した回数
-   Too Many Locks Error OPM: GC が多すぎるロックをクリアするエラーの数
-   Action Result OPM: GC 関連の操作の結果の数
-   範囲の削除タスクのステータス: タスクのステータス`Delete Range` (完了と失敗を含む)
-   プッシュ タスク期間 95: GC サブタスクを GC ワーカーにプッシュするのに費やした時間

### バッチクライアント {#batch-client}

-   TiKV ごとの保留リクエスト数: 処理が保留されているバッチ メッセージの数
-   バッチ クライアントの使用不可期間 95: バッチ クライアントが使用できない時間
-   利用可能な接続なしカウンター: Batch クライアントが利用可能なリンクを見つけられなかった回数

### TTL {#ttl}

-   TiDB CPU 使用率: 各 TiDB インスタンスの CPU 使用率。
-   TiKV IO MBps: 各 TiKV インスタンスの I/O の合計バイト数。
-   TiKV CPU: 各 TiKV インスタンスの CPU 使用率。
-   タイプ別 TTL QPS: TTL ジョブによって生成されたさまざまなタイプのステートメントの QPS 情報。
-   1 秒あたりの TTL 挿入行数: 1 秒あたりに TTL テーブルに挿入される行数。
-   1 秒あたりの TTL 処理行数: 1 秒あたりの TTL ジョブによって処理される期限切れの行数。
-   1 時間あたりの TTL 挿入行数: 1 時間ごとに TTL テーブルに挿入される行数。
-   1 時間あたりの TTL 削除行数: 1 時間ごとに TTL ジョブによって削除された期限切れの行の数。
-   TTL スキャン/削除クエリ期間: TTL スキャン/削除ステートメントの実行時間。
-   フェーズごとの TTL スキャン/削除ワーカー時間: TTL 内部ワーカー スレッドのさまざまなフェーズによって消費された時間。
-   ステータス別の TTL ジョブ数: 現在実行されている TTL ジョブの数。
-   ステータスごとの TTL タスク数: 現在実行されている TTL タスクの数。