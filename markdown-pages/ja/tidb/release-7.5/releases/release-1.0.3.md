---
title: TiDB 1.0.3 Release Notes
summary: TiDB 1.0.3 was released on November 28, 2017. Updates include performance optimization, new configuration options, and bug fixes. PD now supports adding more schedulers using API, and TiKV has fixed deadlock and leader value issues. To upgrade from 1.0.2 to 1.0.3, follow the rolling upgrade order of PD, TiKV, and TiDB.
---

# TiDB 1.0.3 リリースノート {#tidb-1-0-3-release-notes}

2017 年 11 月 28 日に、次の更新を含む TiDB 1.0.3 がリリースされました。

## ティビ {#tidb}

-   [トランザクション競合シナリオでのパフォーマンスを最適化](https://github.com/pingcap/tidb/pull/5051)
-   [設定ファイルに`TokenLimit`オプションを追加する](https://github.com/pingcap/tidb/pull/5107)
-   [スロークエリログにデフォルトのデータベースを出力する](https://github.com/pingcap/tidb/pull/5107)
-   [クエリ実行時間メトリックからDDLステートメントを削除する](https://github.com/pingcap/tidb/pull/5107)
-   [クエリコストの見積もりを最適化する](https://github.com/pingcap/tidb/pull/5140)
-   [テーブル作成時のインデックスプレフィックスの問題を修正](https://github.com/pingcap/tidb/pull/5149)
-   [Float 型の式を TiKV にプッシュダウンする機能をサポート](https://github.com/pingcap/tidb/pull/5153)
-   [離散整数プライマリインデックスを持つテーブルにインデックスを追加するのが遅い問題を修正しました](https://github.com/pingcap/tidb/pull/5155)
-   [不要な統計更新を減らす](https://github.com/pingcap/tidb/pull/5164)
-   [トランザクションの再試行中に発生する可能性のある問題を修正](https://github.com/pingcap/tidb/pull/5219)

## PD {#pd}

-   APIを使用してより多くの種類のスケジューラの追加をサポート

## ティクヴ {#tikv}

-   PDクライアントのデッドロック問題を修正
-   `NotLeader`に間違ったリーダー値が要求される問題を修正
-   コプロセッサのチャンクサイズが大きすぎる問題を修正

1.0.2 から 1.0.3 にアップグレードするには、PD -&gt; TiKV -&gt; TiDB のローリング アップグレード順序に従います。
