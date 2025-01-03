---
title: Data Migration Monitoring Metrics
summary: Data Migration を使用してデータを移行する場合の監視メトリックについて学習します。
---

# データ移行監視メトリクス {#data-migration-monitoring-metrics}

DM クラスターがTiUP を使用してデプロイされている場合、 [監視システム](/dm/migrate-data-using-dm.md#step-8-monitor-the-task-and-check-logs)も同時にデプロイされます。このドキュメントでは、DM-worker によって提供される監視メトリックについて説明します。

## タスク {#task}

Grafana ダッシュボードでは、DM のデフォルト名は`DM-task`です。

### <code>overview</code> {#code-overview-code}

`Overview`は、現在選択されているタスク内のすべての DM ワーカーおよび DM マスター インスタンスまたはソースの監視メトリックが含まれています。現在のデフォルトのアラート ルールは、単一の DM ワーカー/DM マスター インスタンス/ソースのみを対象としています。

| メトリック名                      | 説明                                                                                   | 警告   | 重大度レベル |
| :-------------------------- | :----------------------------------------------------------------------------------- | :--- | :----- |
| タスクの状態                      | 移行のサブタスクの状態                                                                          | 該当なし | 該当なし   |
| storage容量                   | リレーログが占めるディスクの総storage容量                                                             | 該当なし | 該当なし   |
| storage残り                   | リレーログが占めるディスクの残りstorage                                                              | 該当なし | 該当なし   |
| マスターとリレー間のbinlogログファイルのギャップ | `relay`の処理ユニットが上流マスターより遅れているbinlogファイルの数                                             | 該当なし | 該当なし   |
| 読み込みの進行状況                   | ロードユニットの完了したロードプロセスの割合。値は0%〜100%です。                                                  | 該当なし | 該当なし   |
| マスターと同期装置間のbinlogファイルのギャップ  | binlogレプリケーションユニットが上流マスターより遅れているbinlogファイルの数                                         | 該当なし | 該当なし   |
| シャードロックの解決                  | 現在のサブタスクがシャーディング DDL 移行を待機しているかどうか。0 より大きい値は、現在のサブタスクがシャーディング DDL 移行を待機していることを意味します。 | 該当なし | 該当なし   |

### 操作エラー {#operation-errors}

| メトリック名       | 説明                    | 警告   | 重大度レベル |
| :----------- | :-------------------- | :--- | :----- |
| 操作エラーが発生する前に | 操作前のエラー数              | 該当なし | 該当なし   |
| ソース境界エラー     | データソースバインディング操作のエラー数  | 該当なし | 該当なし   |
| 開始エラー        | サブタスクの開始時に発生したエラーの数   | 該当なし | 該当なし   |
| 一時停止エラー      | サブタスクの一時停止中に発生したエラーの数 | 該当なし | 該当なし   |
| 再開エラー        | サブタスクの再開中に発生したエラーの数   | 該当なし | 該当なし   |
| 自動再開エラー      | サブタスクの自動再開中に発生したエラーの数 | 該当なし | 該当なし   |
| 更新エラー        | サブタスクの更新中に発生したエラーの数   | 該当なし | 該当なし   |
| 停止エラー        | サブタスクの停止中に発生したエラーの数   | 該当なし | 該当なし   |

### 高可用性 {#high-availability}

| メトリック名                          | 説明                                          | 警告                               | 重大度レベル |
| :------------------------------ | :------------------------------------------ | :------------------------------- | :----- |
| 1 分あたりの DM マスター開始リーダー コンポーネントの数 | DM マスターがリーダー関連コンポーネントを有効にしようとする 1 分あたりの試行回数 | 該当なし                             | 該当なし   |
| 異なる州の労働者の数                      | 各州のDM労働者の数                                  | 一部の DM ワーカーが 1 時間以上オフラインになっています  | 致命的    |
| 労働者国家                           | DMワーカーの状態                                   | 該当なし                             | 該当なし   |
| ワーカーイベントエラーの数                   | DMワーカーエラーの種類の数                              | 該当なし                             | 該当なし   |
| 1 分あたりのシャード DDL エラー数            | 1 分あたりのさまざまな種類のシャーディング DDL エラーの数            | シャーディングDDLエラーが発生する               | 致命的    |
| 保留中のシャード DDL の数                 | 保留中のシャーディング DDL 操作の数                        | 保留中のシャーディング DDL 操作が 1 時間以上存在している | 致命的    |

### タスクの状態 {#task-state}

| メトリック名 | 説明       | 警告                                     | 重大度レベル |
| :----- | :------- | :------------------------------------- | :----- |
| タスクの状態 | サブタスクの状態 | サブタスクが20分以上`Paused`状態にある場合、アラートが発生します。 | 致命的    |

### ダンプ/ロードユニット {#dump-load-unit}

次のメトリックは、 `task-mode`が`full`または`all`モードの場合にのみ表示されます。

| メトリック名             | 説明                                                               | 警告     | 重大度レベル |
| :----------------- | :--------------------------------------------------------------- | :----- | :----- |
| ダンプの進行状況           | ダンプユニットの完了したダンプ処理の割合。値の範囲は 0%～100% です。                           | 該当なし   | 該当なし   |
| 読み込みの進行状況          | ロードユニットの完了したロードプロセスの割合。値の範囲は0%～100%です。                           | 該当なし   | 該当なし   |
| チェックサムの進行状況        | ロードユニットがダンプを終了した後の完了したチェックサム処理の割合。値の範囲は 0%～100% です。              | 該当なし   | 該当なし   |
| ロードユニットの合計バイト数     | ロードユニットによるインポートプロセスの解析、データKVの生成、インデックスKVの生成の各段階で処理されたバイト         | 該当なし   | 該当なし   |
| チャンク処理期間           | データソースファイルチャンクを処理するロードユニットの所要時間（秒単位）                             | 該当なし   | 該当なし   |
| データファイルサイズ         | ロードユニットによってインポートされた全データ内のデータファイルの合計サイズ（ `INSERT INTO`ステートメントを含む） | 該当なし   | 該当なし   |
| ダンププロセスがエラーで終了しました | ダンプユニットはDMワーカー内でエラーに遭遇し、終了します。                                   | 即時アラート | 致命的    |
| ロードプロセスがエラーで終了しました | ロードユニットはDMワーカー内でエラーに遭遇し、終了します。                                   | 即時アラート | 致命的    |

### Binlogレプリケーション {#binlog-replication}

次のメトリックは、 `task-mode`が`incremental`または`all`モードの場合にのみ表示されます。

| メトリック名                     | 説明                                                                       | 警告                                                                                         | 重大度レベル |
| :------------------------- | :----------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- | :----- |
| 同期の残り時間                    | `syncer`がアップストリーム マスターに完全に移行されるまでにかかる予測残り時間 (分単位)                        | 該当なし                                                                                       | 該当なし   |
| 遅延ゲージを複製する                 | binlogを上流から下流に複製するのにかかるレイテンシー時間（秒単位）                                     | 該当なし                                                                                       | 該当なし   |
| 複製ラグヒストグラム                 | binlogを上流から下流に複製するヒストグラム（秒単位）。統計メカニズムが異なるため、データが不正確になる可能性があることに注意してください。 | 該当なし                                                                                       | 該当なし   |
| プロセスはエラーありで存在します           | binlogレプリケーションユニットはDMワーカー内でエラーに遭遇し、終了します。                                | 即時アラート                                                                                     | 致命的    |
| マスターと同期装置間のbinlogファイルのギャップ | `syncer`の処理ユニットが上流マスターより遅れているbinlogファイルの数                                | `syncer`処理ユニットが上流マスターより遅れているbinlogファイルの数が 1 を超え (&gt;1)、その状態が 10 分以上続くと、アラートが発生します。        | 致命的    |
| リレーと同期の間のbinlogファイルのギャップ   | `syncer`が`relay`より遅れているbinlogファイルの数                                      | `syncer`処理ユニットが`relay`処理ユニットより遅れているbinlogファイルの数が 1 を超え (&gt;1)、その状態が 10 分以上続くと、アラートが発生します。 | 致命的    |
| binlogイベント QPS             | 単位時間あたりに受信されたbinlogイベントの数 (この数にはスキップする必要があるイベントは含まれません)                  | 該当なし                                                                                       | 該当なし   |
| スキップされたbinlogイベント QPS      | スキップする必要がある単位時間あたりに受信されるbinlogイベントの数                                     | 該当なし                                                                                       | 該当なし   |
| binlogイベントの期間の読み取り         | binlogレプリケーションユニットがリレーログまたはアップストリームMySQLからbinlogを読み取る時間（秒単位）             | 該当なし                                                                                       | 該当なし   |
| binlogイベント期間を変換する          | binlogログレプリケーションユニットがbinlogを解析してSQL文に変換する時間（秒単位）                         | 該当なし                                                                                       | 該当なし   |
| ディスパッチbinlogイベント期間         | binlogレプリケーションユニットがbinlogイベントを送信する期間（秒単位）                                | 該当なし                                                                                       | 該当なし   |
| トランザクション実行のレイテンシー          | binlogレプリケーションユニットがダウンストリームへのトランザクションを実行する期間（秒単位）                        | 該当なし                                                                                       | 該当なし   |
| binlogイベント サイズ             | binlogレプリケーションユニットがリレーログまたはアップストリームMySQLから読み取るbinlogイベントのサイズ             | 該当なし                                                                                       | 該当なし   |
| DMLキューの残り長さ                | 残りのDMLジョブキューの長さ                                                          | 該当なし                                                                                       | 該当なし   |
| 合計SQLジョブ                   | 単位時間当たりの新規追加ジョブ数                                                         | 該当なし                                                                                       | 該当なし   |
| 完了したSQLジョブ                 | 単位時間あたりの完了した仕事の数                                                         | 該当なし                                                                                       | 該当なし   |
| ステートメント実行のレイテンシー           | binlogレプリケーションユニットが下流にステートメントを実行する期間（秒単位）                                | 該当なし                                                                                       | 該当なし   |
| ジョブ期間を追加                   | binlogレプリケーションユニットがキューにジョブを追加する期間（秒単位）                                   | 該当なし                                                                                       | 該当なし   |
| DML競合検出期間                  | binlogレプリケーションユニットがDMLの競合を検出する期間（秒単位）                                    | 該当なし                                                                                       | 該当なし   |
| スキップされたイベント期間              | binlogレプリケーションユニットがbinlogイベントをスキップする期間（秒単位）                              | 該当なし                                                                                       | 該当なし   |
| 同期されていないテーブル               | 現在のサブタスクでシャードDDLステートメントを受け取っていないテーブルの数                                   | 該当なし                                                                                       | 該当なし   |
| シャードロックの解決                 | 現在のサブタスクがシャードDDLロックの解決を待機しているかどうか。0より大きい値は、シャードDDLロックの解決を待機していることを示します。  | 該当なし                                                                                       | 該当なし   |
| 理想的なQPS                    | DMの実行時間が0のときに達成できる最高のQPS                                                 | 該当なし                                                                                       | 該当なし   |
| binlogイベント行                | binlogイベントの行数                                                            | 該当なし                                                                                       | 該当なし   |
| 完了した取引の合計                  | 完了した取引の合計数                                                               | 該当なし                                                                                       | 該当なし   |
| レプリケーショントランザクションバッチ        | 下流に実行されたトランザクション内のSQL行の数                                                 | 該当なし                                                                                       | 該当なし   |
| フラッシュチェックポイントの時間間隔         | チェックポイントをフラッシュする時間間隔（秒単位）                                                | 該当なし                                                                                       | 該当なし   |

### リレーログ {#relay-log}

> **注記：**
>
> 現在、DM v2.0 ではリレー ログ機能の有効化はサポートされていません。

| メトリック名                      | 説明                                                         | 警告                                                                                 | 重大度レベル |
| :-------------------------- | :--------------------------------------------------------- | :--------------------------------------------------------------------------------- | :----- |
| storage容量                   | リレーログが占有するディスクのstorage容量                                   | 該当なし                                                                               | 該当なし   |
| storage残り                   | リレーログが占有するディスクの残りstorage容量                                 | 値が10G未満になるとアラートが必要になります                                                            | 致命的    |
| プロセスはエラーで終了しました             | リレーログはDMワーカー内でエラーが発生し、終了します。                               | 即時アラート                                                                             | 致命的    |
| リレーログデータの破損                 | 破損したリレーログファイルの数                                            | 即時アラート                                                                             | 緊急     |
| マスターからのbinlogの読み取りに失敗しました   | リレーログが上流のMySQLからbinlogを読み取るときに発生したエラーの数                    | 即時アラート                                                                             | 致命的    |
| リレーログの書き込みに失敗しました           | リレーログがbinlogをディスクに書き込むときに発生したエラーの数                         | 即時アラート                                                                             | 致命的    |
| binlogファイル インデックス           | リレーログファイルの最大インデックス番号。たとえば、「値 = 1」は「relay-log.000001」を示します。 | 該当なし                                                                               | 該当なし   |
| マスターとリレー間のbinlogログファイルのギャップ | 上流マスターの背後にあるリレーログ内のbinlogファイルの数                            | `relay`処理ユニットが上流マスターより遅れているbinlogファイルの数が 1 を超え (&gt;1)、その状態が 10 分以上続くと、アラートが発生します。 | 致命的    |
| binlogPOS                   | 最新のリレーログファイルの書き込みオフセット                                     | 該当なし                                                                               | 該当なし   |
| binlogイベントの期間の読み取り          | リレーログがアップストリーム MySQL からbinlog を読み取る期間 (秒単位)                | 該当なし                                                                               | 該当なし   |
| 書き込みリレーログ期間                 | リレーログが毎回ディスクにbinlogを書き込む時間（秒単位）                            | 該当なし                                                                               | 該当なし   |
| binlogイベント サイズ              | リレーログがディスクに書き込む単一のbinlogイベントのサイズ                           | 該当なし                                                                               | 該当なし   |

## 実例 {#instance}

Grafana ダッシュボードでは、インスタンスのデフォルト名は`DM-instance`です。

### リレーログ {#relay-log}

| メトリック名                      | 説明                                                         | 警告                                                                                 | 重大度レベル |
| :-------------------------- | :--------------------------------------------------------- | :--------------------------------------------------------------------------------- | :----- |
| storage容量                   | リレーログが占有するディスクの総storage容量                                  | 該当なし                                                                               | 該当なし   |
| storage残り                   | リレーログが占めるディスク内の残りのstorage容量                                | 値が10G未満になるとアラートが発生します                                                              | 致命的    |
| プロセスはエラーで終了しました             | リレーログはDMワーカーでエラーが発生し、終了します                                 | 即時アラート                                                                             | 致命的    |
| リレーログデータの破損                 | 破損したリレーログの数                                                | 即時アラート                                                                             | 緊急     |
| マスターからのbinlogの読み取りに失敗しました   | リレーログが上流のMySQLからbinlogを読み込む際に発生したエラーの数                     | 即時アラート                                                                             | 致命的    |
| リレーログの書き込みに失敗しました           | リレーログがbinlogをディスクに書き込むときに発生したエラーの数                         | 即時アラート                                                                             | 致命的    |
| binlogファイル インデックス           | リレーログファイルの最大インデックス番号。たとえば、「値 = 1」は「relay-log.000001」を示します。 | 該当なし                                                                               | 該当なし   |
| マスターとリレー間のbinlogログファイルのギャップ | `relay`の処理ユニットが上流マスターより遅れているbinlogファイルの数                   | `relay`処理ユニットが上流マスターより遅れているbinlogファイルの数が 1 を超え (&gt;1)、その状態が 10 分以上続くと、アラートが発生します。 | 致命的    |
| binlogPOS                   | 最新のリレーログファイルの書き込みオフセット                                     | 該当なし                                                                               | 該当なし   |
| binlogの読み取り期間               | リレーログがアップストリーム MySQL からbinlogを読み取る時間 (秒単位)                 | 該当なし                                                                               | 該当なし   |
| 書き込みリレーログ期間                 | リレーログが毎回binlogをディスクに書き込む時間（秒単位）                            | 該当なし                                                                               | 該当なし   |
| binlogのサイズ                  | リレーログがディスクに書き込む単一のbinlogイベントのサイズ                           | 該当なし                                                                               | 該当なし   |

### タスク {#task}

| メトリック名                     | 説明                                                                                   | 警告                            | 重大度レベル |
| :------------------------- | :----------------------------------------------------------------------------------- | :---------------------------- | :----- |
| タスクの状態                     | 移行のサブタスクの状態                                                                          | サブタスクが10分以上一時停止されるとアラートが発生します | 致命的    |
| 読み込みの進行状況                  | ロードユニットの完了したロードプロセスの割合。値の範囲は0%～100%です。                                               | 該当なし                          | 該当なし   |
| マスターと同期装置間のbinlogファイルのギャップ | binlogレプリケーションユニットが上流マスターより遅れているbinlogファイルの数                                         | 該当なし                          | 該当なし   |
| シャードロックの解決                 | 現在のサブタスクがシャーディング DDL 移行を待機しているかどうか。0 より大きい値は、現在のサブタスクがシャーディング DDL 移行を待機していることを意味します。 | 該当なし                          | 該当なし   |
