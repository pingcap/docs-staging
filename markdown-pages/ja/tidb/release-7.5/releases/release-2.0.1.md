---
title: TiDB 2.0.1 Release Notes
summary: TiDB 2.0.1 was released on May 16, 2018, with improvements in MySQL compatibility and system stability. Updates include real-time progress for 'Add Index', a new session variable for automatic statistics update, bug fixes, compatibility improvements, and behavior changes. PD added a new scheduler, optimized region balancing, and fixed various issues. TiKV fixed issues related to reading, thread calls, raftstore blocking, and split causing dirty read. Overall, the release focuses on enhancing performance, stability, and compatibility.
---

# TiDB 2.0.1 リリースノート {#tidb-2-0-1-release-notes}

2018 年 5 月 16 日に、TiDB 2.0.1 がリリースされました。TiDB 2.0.0 (GA) と比較して、このリリースでは MySQL の互換性とシステムの安定性が大幅に向上しています。

## ティビ {#tidb}

-   `Add Index`の進行状況をDDLジョブ情報にリアルタイムで更新する
-   自動統計更新のしきい値を制御するためのセッション変数`tidb_auto_analyze_ratio`を追加します
-   トランザクションのコミットが失敗したときに、すべての残留状態がクリーンアップされない問題を修正しました。
-   いくつかの条件でインデックスを追加する際のバグを修正
-   一部の同時シナリオで DDL が表面操作を変更する際の正確性に関する問題を修正しました。
-   いくつかの条件で`LIMIT`の結果が正しくないというバグを修正
-   `ADMIN CHECK INDEX`ステートメントの大文字小文字の問題を修正し、インデックス名の大文字と小文字を区別しないようにしました。
-   `UNION`文の互換性の問題を修正
-   `TIME`種類のデータを挿入する際の互換性の問題を修正
-   いくつかの条件で`copIteratorTaskSender`によって発生する goroutine リークの問題を修正
-   TiDBにBinlog障害の動作を制御するオプションを追加
-   `Coprocessor`スローログをリファクタリングして、処理時間が長いタスクと待機時間が長いタスクのシナリオを区別します。
-   MySQL プロトコル ハンドシェイク エラーが発生した場合は、ロード バランサの Keep Alive メカニズムによって発生するログが多すぎることを避けるため、何もログに記録しません。
-   「列の値が範囲外です」というエラーメッセージを改善する
-   `Update`文にサブクエリがある場合のバグを修正
-   `SIGTERM`の処理動作を変更し、すべてのクエリが終了するのを待たないようにします。

## PD {#pd}

-   指定されたキー範囲でリージョンのバランスをとるために`Scatter Range`スケジューラを追加します。
-   新しく分割されたリージョンがマージされないように、マージリージョンのスケジュールを最適化します。
-   Learner関連の指標を追加する
-   再起動後にスケジューラが誤って削除される問題を修正
-   設定ファイルの解析時に発生するエラーを修正
-   etcdリーダーとPDリーダーが複製されない問題を修正
-   Learnerを閉じた後も表示される問題を修正しました
-   パケットサイズが大きすぎるためにリージョンの読み込みに失敗する問題を修正しました

## ティクヴ {#tikv}

-   `SELECT FOR UPDATE`他の人が読めない問題を修正
-   スロークエリログを最適化する
-   `thread_yield`の通話回数を減らす
-   スナップショットを生成するときに raftstore が誤ってブロックされるバグを修正しました
-   特別な状況でLearnerを正常に選出できない問題を修正
-   極端な状況で分割によりダーティリードが発生する可能性がある問題を修正
-   読み取りスレッドプール構成のデフォルト値を修正する
-   範囲削除の高速化
