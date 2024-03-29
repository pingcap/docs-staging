---
title: Pre-GA release notes
---

# プレ GA リリースノート {#pre-ga-release-notes}

2017 年 8 月 30 日に、TiDB Pre-GA がリリースされました。このリリースは、MySQL の互換性、SQL の最適化、安定性、パフォーマンスに重点を置いています。

## TiDB {#tidb}

-   SQL クエリ オプティマイザー:
    -   コストモデルを調整する
    -   インデックス スキャンを使用して、両側に異なる型を持つ`compare`式を含む`where`句を処理します。
    -   結合したテーブルの再配置ベースの Greedy アルゴリズムをサポート
-   MySQL との互換性を高めるために、多くの機能強化が導入されました。
-   サポート`Natural Join`
-   JSON フィールドのクエリ、更新、インデックスを含む JSON タイプ (Experimental) をサポートします。
-   無駄なデータを削除してエグゼキュータのメモリの消費を削減します。
-   SQL ステートメントでの優先順位の設定をサポートし、クエリ タイプに応じて一部のステートメントの優先順位を自動的に設定します。
-   式のリファクタリングが完了し、速度が約 30% 向上しました

## 配置Driver(PD) {#placement-driver-pd}

-   PD クラスターのリーダーの手動変更をサポート

## TiKV {#tikv}

-   専用の Rocksdb インスタンスを使用してRaftログを保存する
-   レプリカの削除を高速化するには`DeleteRange`使用します
-   コプロセッサーはより多くのプッシュダウン演算子をサポートするようになりました
-   パフォーマンスと安定性の向上

## Spark ベータ版用 TiDB コネクタ {#tidb-connector-for-spark-beta-release}

-   述語プッシュダウンを実装する
-   集約プッシュダウンを実装する
-   範囲枝刈りの実装
-   ビューのサポートが必要な 1 つのクエリを除いて、TPC+H のフルセットを実行可能
