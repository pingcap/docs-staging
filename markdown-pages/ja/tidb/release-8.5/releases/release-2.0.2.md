---
title: TiDB 2.0.2 Release Notes
summary: TiDB 2.0.2 は、システムの安定性の向上を伴い、2018 年 5 月 21 日にリリースされました。このリリースには、小数除算式の修正、Delete` ステートメントでの `USE INDEX` 構文のサポート、および TiDB でのBinlog書き込みのタイムアウト メカニズムが含まれています。PD は、バランス リーダー スケジューラで切断されたノードをフィルターし、転送リーダー オペレータのタイムアウトを変更し、スケジューリングの問題を修正しました。TiKV は、 Raftログ印刷を修正し、gRPC パラメータの構成、リーダー選出のタイムアウト範囲をサポートし、スナップショット中間ファイルの削除の問題を解決しました。
---

# TiDB 2.0.2 リリースノート {#tidb-2-0-2-release-notes}

2018 年 5 月 21 日に、TiDB 2.0.2 がリリースされました。TiDB 2.0.1 と比較して、このリリースではシステムの安定性が大幅に向上しています。

## ティビ {#tidb}

-   小数点除算式の押し下げの問題を修正
-   `Delete`ステートメントで`USE INDEX`構文の使用をサポート
-   `Auto-Increment`列目では`shard_row_id_bits`機能の使用を禁止する
-   Binlog書き込みのタイムアウト メカニズムを追加する

## PD {#pd}

-   バランスリーダースケジューラが切断されたノードをフィルタリングするようにする
-   転送リーダーオペレータのタイムアウトを10秒に変更します
-   クラスターのリージョンが異常な状態にあるときにラベル スケジューラがスケジュールを実行しない問題を修正しました。
-   `evict leader scheduler`の不適切なスケジュール問題を修正

## ティクヴ {#tikv}

-   Raftログが印刷されない問題を修正
-   より多くのgRPC関連パラメータの設定をサポート
-   リーダー選出のタイムアウト範囲の設定をサポート
-   古くなった学習者が削除されない問題を修正
-   スナップショット中間ファイルが誤って削除される問題を修正
