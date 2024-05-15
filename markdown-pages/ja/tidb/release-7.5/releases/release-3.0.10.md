---
title: TiDB 3.0.10 Release Notes
summary: TiDB 3.0.10 was released on February 20, 2020. It includes various bug fixes and improvements for TiDB, TiKV, PD, and TiDB Ansible. Some notable fixes include wrong Join results, data visibility issues, and system panic problems. TiDB Ansible also added new monitoring items to the dashboard. The release notes recommend using the latest 3.0.x version due to known issues in this release.
---

# TiDB 3.0.10 リリースノート {#tidb-3-0-10-release-notes}

発売日: 2020年2月20日

TiDB バージョン: 3.0.10

TiDB Ansible バージョン: 3.0.10

> **警告：**
>
> このバージョンではいくつかの既知の問題が見つかりましたが、これらの問題は新しいバージョンで修正されています。最新の 3.0.x バージョンを使用することをお勧めします。

## ティビ {#tidb}

-   `IndexLookUpJoin` `OtherCondition`を使用して`InnerRange` [＃14599](https://github.com/pingcap/tidb/pull/14599)を構築したときに間違った`Join`結果が発生する問題を修正
-   `tidb_pprof_sql_cpu`設定項目を削除し、 `tidb_pprof_sql_cpu`変数[＃14416](https://github.com/pingcap/tidb/pull/14416)を追加します。
-   ユーザーがグローバル権限を持っている場合にのみすべてのデータベースを照会できる問題を修正[＃14386](https://github.com/pingcap/tidb/pull/14386)
-   `PointGet`操作[＃14480](https://github.com/pingcap/tidb/pull/14480)を実行するときにトランザクション タイムアウトによりデータの可視性が期待どおりにならない問題を修正しました
-   楽観的トランザクションモード[＃14474](https://github.com/pingcap/tidb/pull/14474)と一致するように、悲観的トランザクションのアクティベーションのタイミングを遅延アクティベーションに変更する
-   `unixtimestamp`式がテーブル パーティション[＃14476](https://github.com/pingcap/tidb/pull/14476)のタイム ゾーンを計算するときに、誤ったタイム ゾーン結果が返される問題を修正しました。
-   デッドロック検出期間を監視するための監視項目を`tidb_session_statement_deadlock_detect_duration_seconds`追加します[＃14484](https://github.com/pingcap/tidb/pull/14484)
-   GCワーカー[＃14439](https://github.com/pingcap/tidb/pull/14439)のいくつかのロジックエラーによって引き起こされるシステムpanicの問題を修正
-   `IsTrue`関数[＃14516](https://github.com/pingcap/tidb/pull/14516)の式名を修正
-   一部のメモリ使用量が不正確にカウントされる問題を修正[＃14533](https://github.com/pingcap/tidb/pull/14533)
-   CM-Sketch統計初期化中の誤った処理ロジックによって発生するシステムpanicの問題を修正[＃14470](https://github.com/pingcap/tidb/pull/14470)
-   パーティションテーブルをクエリする際の不正確なパーティションプルーニングの問題を修正[＃14546](https://github.com/pingcap/tidb/pull/14546)
-   SQLバインディング内のSQLステートメントのデフォルトのデータベース名が誤って設定されている問題を修正[＃14548](https://github.com/pingcap/tidb/pull/14548)
-   `json_key` MySQL [＃14561](https://github.com/pingcap/tidb/pull/14561)と互換性がない問題を修正
-   パーティションテーブルの統計情報を自動更新する機能を追加[＃14566](https://github.com/pingcap/tidb/pull/14566)
-   `PointGet`操作を実行するとプラン ID が変わる問題を修正 (プラン ID は常に`1`になるはずです) [＃14595](https://github.com/pingcap/tidb/pull/14595)
-   SQLバインディングが正確[＃14263](https://github.com/pingcap/tidb/pull/14263)一致しない場合に誤った処理ロジックによって発生するシステムpanicの問題を修正しました。
-   悲観的トランザクション[＃14619](https://github.com/pingcap/tidb/pull/14619)のロック失敗後の再試行回数を監視するための監視項目`tidb_session_statement_pessimistic_retry_count`を追加します。
-   `show binding`ステートメント[＃14618](https://github.com/pingcap/tidb/pull/14618)の不正な権限チェックを修正
-   `backoff`ロジックに`killed`タグ[＃14614](https://github.com/pingcap/tidb/pull/14614)のチェックが含まれていないため、クエリを強制終了できない問題を修正しました。
-   内部ロックを保持する時間を短縮することでステートメントサマリーのパフォーマンスを向上[＃14627](https://github.com/pingcap/tidb/pull/14627)
-   TiDBの文字列を時間に変換する結果がMySQL [＃14570](https://github.com/pingcap/tidb/pull/14570)と互換性がない問題を修正
-   監査ログにユーザーのログイン失敗を記録する[＃14620](https://github.com/pingcap/tidb/pull/14620)
-   悲観的トランザクション[＃14634](https://github.com/pingcap/tidb/pull/14634)のロックキーの数を監視するための`tidb_session_ statement_lock_keys_count`監視項目を追加します。
-   JSON内の`&` `>`の文字が誤ってエスケープされる問題`<`修正しました[＃14637](https://github.com/pingcap/tidb/pull/14637)
-   `HashJoin`操作でハッシュ テーブル[＃14642](https://github.com/pingcap/tidb/pull/14642)を構築しているときにメモリ使用量が過剰になることで発生するシステムpanicの問題を修正しました。
-   SQL バインディングが不正なレコードを処理するときに、誤った処理ロジックによって発生するpanic問題を修正しました[＃14645](https://github.com/pingcap/tidb/pull/14645)
-   ix 小数点割り算計算に切り捨てエラー検出を追加することでMySQLの非互換性の問題を修正[＃14673](https://github.com/pingcap/tidb/pull/14673)
-   存在しないテーブルに対する権限をユーザーに付与してしまう問題を修正[＃14611](https://github.com/pingcap/tidb/pull/14611)

## ティクヴ {#tikv}

-   Raftstore
    -   リージョンマージの失敗によるシステムpanicの問題 #6460 またはデータ損失の問題 #598 を修正[＃6481](https://github.com/tikv/tikv/pull/6481)
    -   スケジューリングの公平性を最適化するために`yield`サポートし、リーダーのスケジューリングの安定性を向上させるためにリーダーの事前転送をサポートする[＃6563](https://github.com/tikv/tikv/pull/6563)

## PD {#pd}

-   システムトラフィックの変化時にリージョンキャッシュ情報を自動的に更新できるようにすることで、無効なキャッシュの問題を修正しました[＃2103](https://github.com/pingcap/pd/pull/2103)
-   リーダーリース時間を使用してTSOサービスの有効性を判断する[＃2117](https://github.com/pingcap/pd/pull/2117)

## ツール {#tools}

-   TiDBBinlog
    -   Drainer[＃893](https://github.com/pingcap/tidb-binlog/pull/893)のリレーログをサポート
-   TiDB Lightning
    -   設定ファイルが見つからない場合に、一部の設定項目でデフォルト値を使用するようにする[＃255](https://github.com/pingcap/tidb-lightning/pull/255)
    -   非サーバーモードでWebインターフェースを開けない問題を修正[＃259](https://github.com/pingcap/tidb-lightning/pull/259)

## TiDB アンシブル {#tidb-ansible}

-   一部のシナリオでPDリーダーの取得に失敗したためにコマンドの実行が失敗する問題を修正[＃1121](https://github.com/pingcap/tidb-ansible/pull/1121)
-   TiDBダッシュボード[＃1127](https://github.com/pingcap/tidb-ansible/pull/1127)に`Deadlock Detect Duration`監視項目を追加する
-   TiDBダッシュボード[＃1132](https://github.com/pingcap/tidb-ansible/pull/1132)に`Statement Lock Keys Count`監視項目を追加する
-   TiDBダッシュボード[＃1133](https://github.com/pingcap/tidb-ansible/pull/1133)に`Statement Pessimistic Retry Count`監視項目を追加する
