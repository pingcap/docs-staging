---
title: TiDB 2.0 RC4 Release Notes
---

# TiDB 2.0 RC4 リリースノート {#tidb-2-0-rc4-release-notes}

2018 年 3 月 30 日に、TiDB 2.0 RC4 がリリースされました。このリリースでは、MySQL の互換性、SQL の最適化、および安定性が大幅に改善されています。

## TiDB {#tidb}

-   サポート`SHOW GRANTS FOR CURRENT_USER();`
-   `UnionScan`分の`Expression`複製されない問題を修正
-   `SET TRANSACTION`構文をサポート
-   潜在的なゴルーチン リークの問題を`copIterator`で修正
-   `admin check table`がnullを含むユニークインデックスを誤判定する問題を修正
-   科学表記法を使用した浮動小数点数の表示をサポート
-   バイナリ リテラル コンピューティング中の型推論の問題を修正します。
-   `CREATE VIEW`ステートメントを解析する際の問題を修正します
-   1 つのステートメントに`ORDER BY`と`LIMIT 0`の両方が含まれている場合のpanicの問題を修正します。
-   `DecodeBytes`の実行パフォーマンスを向上させる
-   `LIMIT 0`から`TableDual`を最適化して、無駄な実行計画を作成しないようにする

## PD {#pd}

-   単一のリージョンでホット スポットを処理するためにリージョンを手動で分割することをサポートします
-   `pdctl` `config show all`実行時にラベルプロパティが表示されない問題を修正
-   指標とコード構造を最適化する

## TiKV {#tikv}

-   極端な状況での OOM を回避するために、スナップショットの受信中のメモリ使用量を制限します
-   警告が発生したときのコプロセッサーの動作の構成をサポート
-   TiKV でのデータ パターンのインポートをサポート
-   中央のリージョンの分割をサポート
-   CI テストの速度を上げる
-   使用`crossbeam channel`
-   TiKV の隔離時にリーダーの欠落が原因でログが大量に出力される問題を修正
