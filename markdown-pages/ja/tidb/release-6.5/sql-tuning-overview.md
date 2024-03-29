---
title: SQL Tuning Overview
---

# SQL チューニングの概要 {#sql-tuning-overview}

SQL は宣言型言語です。つまり、SQL ステートメントは*最終結果がどのように見えるかを*記述し、順番に実行する一連のステップを記述しません。 TiDB は実行を最適化し、説明どおりに最終結果を正しく返すという条件で、クエリの一部を任意の順序で実行することを意味的に許可します。

SQL 最適化との比較に役立つのは、GPS ナビゲーションを使用したときに何が起こるかを説明することです。 GPS ソフトウェアは、提供された住所*2955 Campus Drive San Mateo CA 94403*から、最も時間効率のよい経路を計画します。過去の旅行などのさまざまな統計情報、速度制限などのメタデータ、最新の場合は交通情報のライブ フィードを利用する場合があります。これらのアナロジーのいくつかは、TiDB に変換されます。

このセクションでは、クエリの実行に関するいくつかの概念を紹介します。

-   [クエリ実行プランについて](/explain-overview.md) 、 `EXPLAIN`ステートメントを使用して、TiDB がステートメントの実行を決定した方法を理解する方法を紹介します。
-   [SQL 最適化プロセス](/sql-optimization-concepts.md)クエリ実行パフォーマンスを向上させるために TiDB が使用できる最適化を紹介します。
-   [実行計画の管理](/control-execution-plan.md)は、実行計画の生成を制御する方法を導入します。これは、TiDB によって決定された実行計画が最適ではない場合に役立ちます。
