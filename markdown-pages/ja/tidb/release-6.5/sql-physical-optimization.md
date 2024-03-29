---
title: SQL Physical Optimization
---

# SQL 物理最適化 {#sql-physical-optimization}

物理的最適化はコストベースの最適化であり、前段階で生成された論理的実行計画に対して物理的実行計画を作成します。この段階では、オプティマイザは、論理実行計画の各演算子に対して特定の物理実装を選択します。論理演算子の物理的な実装が異なれば、時間の複雑さ、リソース消費、および物理的特性も異なります。このプロセスでは、オプティマイザはデータの統計に基づいてさまざまな物理実装のコストを決定し、全体的なコストが最小の物理実行計画を選択します。

[クエリ実行計画を理解する](/explain-overview.md)ではいくつかの物理演算子が導入されました。この章では、次の側面に焦点を当てます。

-   [インデックスの選択](/choose-index.md)では、TiDB がテーブルに複数のインデックスを持っている場合に、テーブルにアクセスするための最適なインデックスを選択する方法を学びます。
-   [統計入門](/statistics.md)では、テーブルのデータ分布を取得するために TiDB が収集する統計について学習します。
-   [インデックス問題の解決方法](/wrong-index-solution.md)インデックスが間違って選択されていることがわかった場合に、正しいインデックスを使用する方法を紹介します。
-   [クエリの最適化](/agg-distinct-optimization.md)物理最適化中に`DISTINCT`キーワードに関連する最適化を導入します。このセクションでは、その長所と短所、およびその使用方法について説明します。
-   [コストモデル](/cost-model.md)では、物理最適化時にコスト モデルに基づいて最適な実行計画を選択する方法を紹介します。
