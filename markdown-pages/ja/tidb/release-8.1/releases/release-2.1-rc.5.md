---
title: TiDB 2.1 RC5 Release Notes
summary: TiDB 2.1 RC5 は、安定性、SQL オプティマイザー、統計、実行エンジンの改善を伴い、2018 年 11 月 12 日にリリースされました。修正には、IndexReader、IndexScan Prepared ステートメント、Union ステートメント、JSON データ変換に関する問題が含まれます。サーバーの改善には、ログの可読性、テーブル データの取得、環境変数の追加が含まれます。PD では、リージョンキーの読み取り、regions/check` API、PD 再起動結合、イベント損失に関する問題が修正されています。TiKV では、エラー メッセージが改善され、panicマーク ファイルが追加され、grpcio がダウングレードされ、`kv_scan` インターフェイスに上限が追加されました。ツールでは、TiDB-Binlog クラスターがサポートされるようになりました。
---

<!-- markdownlint-disable MD032 -->

# TiDB 2.1 RC5 リリースノート {#tidb-2-1-rc5-release-notes}

2018 年 11 月 12 日に、TiDB 2.1 RC5 がリリースされました。TiDB 2.1 RC4 と比較して、このリリースでは安定性、SQL オプティマイザー、統計情報、実行エンジンが大幅に改善されています。

## ティビ {#tidb}

-   SQL オプティマイザー
    -   `IndexReader`場合によっては間違ったハンドルを読み取る問題を修正[＃8132](https://github.com/pingcap/tidb/pull/8132)
    -   `IndexScan Prepared`文で`Plan Cache` [＃8055](https://github.com/pingcap/tidb/pull/8055)使用しているときに発生する問題を修正
    -   `Union`文の結果が不安定になる問題を修正[＃8165](https://github.com/pingcap/tidb/pull/8165)
-   SQL実行エンジン
    -   ワイドテーブル[＃8024](https://github.com/pingcap/tidb/pull/8024)挿入または更新時の TiDB のパフォーマンスを向上
    -   `Truncate`組み込み関数[＃8068](https://github.com/pingcap/tidb/pull/8068)で unsigned `int`フラグをサポートする
    -   JSONデータを10進数型に変換する際に発生したエラーを修正しました[＃8109](https://github.com/pingcap/tidb/pull/8109)
    -   `Update` float型[＃8170](https://github.com/pingcap/tidb/pull/8170)で発生したエラーを修正
-   統計
    -   ポイントクエリ中に一部のケースで誤った統計情報が発生する問題を修正[＃8035](https://github.com/pingcap/tidb/pull/8035)
    -   いくつかのケースにおける主キーの統計の選択性推定を修正[＃8149](https://github.com/pingcap/tidb/pull/8149)
    -   削除されたテーブルの統計が長期間クリアされない問題を修正[＃8182](https://github.com/pingcap/tidb/pull/8182)
-   サーバ
    -   ログの読みやすさを改善し、ログをより良くする
        -   [＃8063](https://github.com/pingcap/tidb/pull/8063)
        -   [＃8053](https://github.com/pingcap/tidb/pull/8053)
        -   [＃8224](https://github.com/pingcap/tidb/pull/8224)

    <!---->

    -   `infoschema.profiling` [＃8096](https://github.com/pingcap/tidb/pull/8096)のテーブルデータを取得する際に発生したエラーを修正
    -   バイナリログを書き込むために、UNIXソケットをポンプクライアントに置き換えます[＃8098](https://github.com/pingcap/tidb/pull/8098)
    -   `tidb_slow_log_threshold`環境変数のしきい値を追加します。これは、スローログ[＃8094](https://github.com/pingcap/tidb/pull/8094)を動的に設定します。
    -   `tidb_query_log_max_len`環境変数が動的にログ[＃8200](https://github.com/pingcap/tidb/pull/8200)を設定する間に切り捨てられたSQL文の元の長さを追加します
    -   `tidb_opt_write_row_id`環境変数を追加して、書き込みを許可するかどうかを制御する`_tidb_rowid` [＃8218](https://github.com/pingcap/tidb/pull/8218)
    -   ticlientの`Scan`コマンドに上限を追加して、オーバーバウンドスキャン[＃8081](https://github.com/pingcap/tidb/pull/8081) [＃8247](https://github.com/pingcap/tidb/pull/8247)回避する
-   DDL
    -   トランザクション内でDDL文を実行するとエラーが発生する場合がある問題を修正[＃8056](https://github.com/pingcap/tidb/pull/8056)
    -   パーティションテーブルで`truncate table`実行しても効果がない問題を修正[＃8103](https://github.com/pingcap/tidb/pull/8103)
    -   一部のケースで DDL 操作がキャンセルされた後に正しくロールバックされない問題を修正[＃8057](https://github.com/pingcap/tidb/pull/8057)
    -   `admin show next_row_id`コマンドを追加して、次に利用可能な行ID [＃8268](https://github.com/pingcap/tidb/pull/8268)を返します。

## PD {#pd}

-   `pd-ctl`リージョンキーの読み取りに関連する問題を修正
    -   [＃1298](https://github.com/pingcap/pd/pull/1298)
    -   [＃1299](https://github.com/pingcap/pd/pull/1299)
    -   [＃1308](https://github.com/pingcap/pd/pull/1308)
-   `regions/check` APIが間違った結果を返す問題を修正[＃1311](https://github.com/pingcap/pd/pull/1311)
-   PD参加失敗後にPDが参加を再開できない問題を修正[＃1279](https://github.com/pingcap/pd/pull/1279)
-   `watch leader`場合によってはイベントが失われる可能性がある問題を修正[＃1317](https://github.com/pingcap/pd/pull/1317)

## ティクヴ {#tikv}

-   `WriteConflict` [＃3750](https://github.com/tikv/tikv/pull/3750)のエラーメッセージを改善する
-   panicマークファイル[＃3746](https://github.com/tikv/tikv/pull/3746)を追加
-   gRPC [＃3650](https://github.com/tikv/tikv/pull/3650)の新バージョンによって発生するセグメント障害の問題を回避するために、grpcio をダウングレードします。
-   `kv_scan`インターフェース[＃3749](https://github.com/tikv/tikv/pull/3749)に上限を追加する

## ツール {#tools}

-   古いバージョンのbinlog [＃8093](https://github.com/pingcap/tidb/pull/8093)と互換性のないTiDB-Binlogクラスターをサポートします[ドキュメント](/tidb-binlog/tidb-binlog-overview.md)
