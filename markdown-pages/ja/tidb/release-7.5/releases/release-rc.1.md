---
title: TiDB RC1 Release Notes
summary: TiDB RC1は2016年12月23日にリリースされました。TiKVでは書き込み速度が向上し、ディスク容量の使用量が削減され、数百TBのデータをサポートできます。PDではスケジューリング戦略のフレームワークが最適化され、クロスデータセンタースケジューリングをサポートするためにlabelのサポートが追加されました。TiDBではSQLクエリオプティマイザーが改善され、MySQLとの互換性が向上しました。また、新しいツールとしてLoaderが追加され、マルチスレッドインポートやワンクリックで導入できるツールが提供されます。
---

# TiDB RC1 リリースノート {#tidb-rc1-release-notes}

2016 年 12 月 23 日に、TiDB RC1 がリリースされました。このリリースの次の更新を参照してください。

## TiKV {#tikv}

-   書き込み速度が向上しました。
-   ディスク容量の使用量が削減されます。
-   数百 TB のデータをサポートできます。
-   安定性が向上し、TiKV は 200 ノードのクラスターをサポートできます。
-   Raw KV API とGolangクライアントをサポートします。

## 配置Driver(PD) {#placement-driver-pd}

-   スケジューリング戦略のフレームワークが最適化され、戦略がより柔軟かつ合理的になりました。
-   `label`のサポートは、クロス データセンター スケジューリングをサポートするために追加されました。
-   PD クラスターをより簡単に操作するために、PD コントローラーが提供されます。

## TiDB {#tidb}

-   SQL クエリ オプティマイザーでは、次の機能が追加または改善されています。
    -   熱心な集約
    -   さらに詳しい`EXPLAIN`情報
    -   `UNION`演算子の並列化
    -   サブクエリのパフォーマンスの最適化
    -   条件付きプッシュダウンの最適化
    -   Cost Based Optimizer (CBO) フレームワークの最適化
-   MySQL との互換性を向上させるために、時間関連のデータ型の実装がリファクタリングされました。
-   MySQL のさらに多くの組み込み関数がサポートされています。
-   `add index`ステートメントの速度が向上しました。
-   次のステートメントがサポートされています。
    -   列の名前を変更するには、 `CHANGE COLUMN`ステートメントを使用します。
    -   一部の列タイプの転送には、 `ALTER TABLE`ステートメントのうち`MODIFY COLUMN`と`CHANGE COLUMN`を使用します。

## 新しいツール {#new-tools}

-   `Loader`は、Percona の`mydumper`データ形式と互換性を持たせるために追加され、次の関数を提供します。
    -   マルチスレッドインポート
    -   エラーが発生した場合は再試行してください
    -   ブレークポイントの再開
    -   TiDB のターゲットを絞った最適化
-   ワンクリックで導入できるツールが追加されました。
