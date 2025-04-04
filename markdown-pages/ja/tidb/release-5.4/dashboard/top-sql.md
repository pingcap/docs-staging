---
title: Top SQL
summary: This document describes how to use Top SQL to locate SQL queries that contribute to a high load.
---

# Top SQL {#top-sql}

> **警告：**
>
> 現在、 Top SQLは実験的機能です。実稼働環境での使用はお勧めしません。

このドキュメントでは、Top SQLを使用して、指定した時間範囲でTiDBまたはTiKVノードの高負荷に寄与するSQLクエリを見つける方法について説明します。たとえば、 Top SQLを使用して、低負荷データベースの負荷の99％を消費する分析クエリを見つけることができます。

指定されたTiDBまたはTiKVノードに対して、 Top SQLは次の機能を提供します。

-   指定された時間範囲で負荷に最も寄与する上位5種類のSQLクエリを表示します。
-   特定のクエリのCPU使用率、1秒あたりのリクエスト数、平均レイテンシ、クエリプランなどの情報を表示します。これらの情報は、ビジネスを改善するための潜在的なパフォーマンスの最適化に使用できます。

## Top SQLを有効にする {#enable-top-sql}

Top SQL機能はデフォルトで無効になっています。次のいずれかの方法を使用して、クラスタ全体で機能を有効にできます。

-   方法1：TiDBダッシュボードにログインし、左側のペインで[**Top SQL** ]をクリックし、ページの右上隅にある歯車ボタンをクリックして、[トップTop SQL ]機能を有効にします。
-   方法2：TiDBシステム変数[`tidb_enable_top_sql`](/system-variables.md#tidb_enable_top_sql-new-in-v540)の値を`ON`に設定します。

> **ノート：**
>
> Top SQLを有効にすると、クラスタのパフォーマンスにわずかな影響があります。

## Top SQLを使用する {#use-top-sql}

Top SQLを有効にしたら、TiDBダッシュボードにログインし、左側のペインで[**Top SQL** ]をクリックして使用できます。

![Top SQL](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-overview.png)

使用上のヒント：

-   ページ上部のドロップダウンリストでターゲットノードと時間範囲を選択するか、グラフで時間範囲を選択できます。
-   グラフのデータが古くなっている場合は、[**更新**]をクリックするか、[自動更新]を選択して、[更新]ドロップダウンリストで自動<strong>更新</strong>間隔を指定できます。
-   グラフには、選択した時間範囲で選択したノードの負荷に最も寄与する上位5種類のクエリが表示されます。
-   リストでクエリタイプを選択すると、このノードでのそのクエリタイプの実行プランと、呼び出し/秒、スキャン行/秒、スキャンインデックス/秒、遅延/呼び出しなどの実行の詳細を表示できます。

![Top SQL Details](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-details.png)
