---
title: TiDB 1.0.1 Release Notes
---

# TiDB 1.0.1 リリースノート {#tidb-1-0-1-release-notes}

2017 年 11 月 1 日に、次の更新を含む TiDB 1.0.1 がリリースされました。

## TiDB {#tidb}

-   DDL ジョブのキャンセルをサポートします。
-   `IN`式を最適化します。
-   `Show`ステートメントの結果の型を修正してください。
-   遅いクエリの別のログ ファイルへのログ記録をサポートします。
-   バグを修正します。

## TiKV {#tikv}

-   書き込みバイトによるフロー制御をサポートします。
-   Raft の割り当てを減らします。
-   コプロセッサのスタック サイズを 10MB に増やします。
-   不要なログをコプロセッサから削除します。
