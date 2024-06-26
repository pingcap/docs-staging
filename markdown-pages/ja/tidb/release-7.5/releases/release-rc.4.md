---
title: TiDB RC4 Release Notes
summary: TiDB RC4は、MySQLの互換性、SQLの最適化、安定性、パフォーマンスに焦点を当てたリリースです。書き込みパフォーマンスが向上し、OLTPに対するOLAPの影響を回避するための優先順位付けがサポートされます。オプティマイザは改訂され、MySQLとの互換性を高めるための機能強化が導入されました。TiSparkはOLAPビジネスシナリオのサポートを強化し、TiKVのデータにアクセスできるようになりました。TiDBではSQLクエリオプティマイザーがリファクタリングされ、多くの機能強化が導入されました。PDではTiKVロケーションラベルの設定をサポートし、スケジューラーを最適化しました。TiKVではクエリの優先順位付けの構成をサポートし、パフォーマンスと安定性を向上させました。TiSparkでは予測プッシュダウン、集約プッシュダウン、範囲枝刈りを実装し、TPC-Hのフルセットを実行可能にしました。
---

# TiDB RC4 リリースノート {#tidb-rc4-release-notes}

2017 年 8 月 4 日、TiDB RC4 がリリースされました。このリリースは、MySQL の互換性、SQL の最適化、安定性、パフォーマンスに重点を置いています。

## ハイライト {#highlight}

-   パフォーマンスに関しては、書き込みパフォーマンスが大幅に向上し、コンピューティング タスクのスケジューリングにより、OLTP に対する OLAP の影響を回避するための優先順位付けがサポートされます。
-   オプティマイザは、より正確なクエリ コスト推定とコストに基づいた`Join`物理演算子の自動選択のために改訂されました。
-   MySQL との互換性を高めるために、多くの機能強化が導入されました。
-   TiSpark は、OLAP ビジネス シナリオのサポートを強化するためにリリースされました。 Spark を使用して TiKV のデータにアクセスできるようになりました。

## 詳細なアップデート {#detailed-updates}

### TiDB {#tidb}

-   SQL クエリ オプティマイザーのリファクタリング:
    -   TopN クエリのサポートの向上
    -   コストに基づいて`Join`の物理オペレータの自動選択をサポート
    -   突起除去の改善
-   進行中のトランザクションに対する DDL の影響を回避するために、スキーマのバージョン チェックはテーブルに基づいて行われます。
-   サポート`BatchIndexJoin`
-   `Explain`ステートメントを改善する
-   `Index Scan`パフォーマンスを向上させる
-   MySQL との互換性を高めるために、多くの機能強化が導入されました。
-   JSON タイプと操作をサポートする
-   クエリの優先順位付けと分離レベルの構成をサポート

### 配置Driver(PD) {#placement-driver-pd}

-   PD を使用した TiKV ロケーション ラベルの設定をサポート
-   スケジューラーを最適化する
    -   TiKV へのスケジューリング コマンドを初期化するための PD がサポートされるようになりました。
    -   領域ハートビートの応答速度を高速化します。
    -   `balance`アルゴリズムを最適化する
-   データ読み込みを最適化してフェイルオーバーを高速化します

### TiKV {#tikv}

-   クエリの優先順位付けの構成をサポート
-   RC絶縁レベルをサポート
-   Jepsen テストの結果と安定性を向上
-   サポートドキュメントストア
-   コプロセッサーがより多くのプッシュダウン関数をサポートするようになりました
-   パフォーマンスと安定性の向上

### TiSpark ベータ版リリース {#tispark-beta-release}

-   予測プッシュダウンを実装する
-   集約プッシュダウンを実装する
-   範囲枝刈りの実装
-   ビューのサポートが必要な 1 つのクエリを除き、TPC-H のフルセットを実行可能
