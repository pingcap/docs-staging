---
title: Wrong Index Solution
summary: 間違ったインデックスの問題を解決する方法を学びます。
---

# インデックス問題の解決方法 {#wrong-index-solution}

一部のクエリの実行速度が期待値に達しない場合、オプティマイザーがクエリを実行するために間違ったインデックスを選択している可能性があります。

まず統計の[テーブルの健全性状態](/statistics.md#health-state-of-tables)表示し、次にさまざまなヘルス状態に応じてこの問題を解決できます。

## 健康状態が低い {#low-health-state}

ヘルス状態が低いということは、TiDB が`ANALYZE`のステートメントを長時間実行していないことを意味します。3 `ANALYZE`のコマンドを実行すると、統計を更新できます。更新後もオプティマイザーが間違ったインデックスを使用する場合は、次のセクションを参照してください。

## ほぼ100%の健康状態 {#near-100-health-state}

ほぼ 100% のヘルス状態は、 `ANALYZE`ステートメントが完了したばかりか、少し前に完了したことを示しています。この場合、間違ったインデックスの問題は、TiDB の行数の推定ロジックに関連している可能性があります。

同等性クエリの場合、原因は[カウントミニマムスケッチ](/statistics.md#count-min-sketch)である可能性があります。Count-Min Sketch が原因であるかどうかを確認し、対応する解決策を実行できます。

上記の原因が問題に当てはまらない場合は、 `USE_INDEX`または`use index`オプティマイザーヒントを使用してインデックスを強制的に選択できます (詳細については[使用インデックス](/optimizer-hints.md#use_indext1_name-idx1_name--idx2_name-)参照)。また、 [SQL プラン管理](/sql-plan-management.md)使用して非侵入的な方法でクエリの動作を変更することもできます。

## その他の状況 {#other-situations}

前述の状況以外にも、データの更新によってすべてのインデックスが適用できなくなった場合にも、間違ったインデックスの問題が発生する可能性があります。このような場合は、条件とデータ分布を分析して、新しいインデックスによってクエリが高速化されるかどうかを確認する必要があります。高速化できる場合は、 [`ADD INDEX`](/sql-statements/sql-statement-add-index.md)コマンドを実行して新しいインデックスを追加できます。
