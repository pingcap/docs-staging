---
title: Introduction to Join Reorder
summary: 結合したテーブルの再配置は、複数のテーブルを結合する際の効率を向上させます。TiDBでは、貪欲アルゴリズムと動的プログラミングアルゴリズムの2つの再配置アルゴリズムが使用されます。結合順序はtidb_opt_join_reorder_thresholdによって制御され、外部結合のサポートはtidb_enable_outer_join_reorderによって制御されます。現在、動的プログラミングアルゴリズムは外部結合の再配置を実行できません。
---

# 結合したテーブルの再配置の概要 {#introduction-to-join-reorder}

実際のアプリケーションのシナリオでは、複数のテーブルを結合するのが一般的です。結合の実行効率は、各テーブルの結合順序に関係します。

例えば：

```sql
SELECT * FROM t1, t2, t3 WHERE t1.a=t2.a AND t3.a=t2.a;
```

このクエリでは、次の 2 つの順序でテーブルを結合できます。

-   t1 は t2 に結合し、その後 t3 に結合します
-   t2 は t3 に結合し、その後 t1 に結合します

t1 と t3 はデータ量と分布が異なるため、これら 2 つの実行順序は異なるパフォーマンスを示す可能性があります。

したがって、オプティマイザには結合順序を決定するアルゴリズムが必要です。現在、TiDB では次の 2 つの結合したテーブルの再配置アルゴリズムが使用されています。

-   貪欲アルゴリズム: 結合に参加しているすべてのノードの中で、TiDB は行数が最も少ないテーブルを選択して、他の各テーブルとの結合結果をそれぞれ推定し、結合結果が最小のペアを選択します。その後、TiDB は、すべてのノードが結合を完了するまで、次のラウンドで他のノードを選択して結合する同様のプロセスを継続します。
-   動的プログラミング アルゴリズム: 結合に参加しているすべてのノードの間で、TiDB は考えられるすべての結合順序を列挙し、最適な結合順序を選択します。

## 例: 結合したテーブルの再配置の貪欲なアルゴリズム {#example-the-greedy-algorithm-of-join-reorder}

前述の 3 つのテーブル (t1、t2、および t3) を例に挙げます。

まず、TiDB は結合操作に参加するすべてのノードを取得し、行番号の昇順にノードをソートします。

![join-reorder-1](https://docs-download.pingcap.com/media/images/docs/join-reorder-1.png)

その後、行数が最も少ないテーブルが選択され、他の 2 つのテーブルとそれぞれ結合されます。出力結果セットのサイズを比較することにより、TiDB は結果セットが小さいペアを選択します。

![join-reorder-2](https://docs-download.pingcap.com/media/images/docs/join-reorder-2.png)

その後、TiDB は次の選考ラウンドに入ります。 4 つのテーブルを結合しようとすると、TiDB は出力結果セットのサイズを比較し続け、より小さい結果セットを持つペアを選択します。

この場合、結合されるテーブルは 3 つだけなので、TiDB が最終的な結合結果を取得します。

![join-reorder-3](https://docs-download.pingcap.com/media/images/docs/join-reorder-3.png)

## 例: 結合したテーブルの再配置の動的計画アルゴリズム {#example-the-dynamic-programming-algorithm-of-join-reorder}

前述の 3 つのテーブル (t1、t2、および t3) を再び例として挙げると、動的計画法アルゴリズムはすべての可能性を列挙できます。したがって、 `t1`のテーブル (行数が最も少ないテーブル) から開始する必要がある貪欲アルゴリズムと比較して、動的プログラミング アルゴリズムは次のように結合順序を列挙できます。

![join-reorder-4](https://docs-download.pingcap.com/media/images/docs/join-reorder-4.png)

この選択が貪欲アルゴリズムよりも優れている場合、動的プログラミング アルゴリズムはより適切な結合順序を選択できます。

すべての可能性が列挙されるため、動的プログラミング アルゴリズムはより多くの時間を費やし、統計の影響を受けやすくなります。

## 結合したテーブルの再配置アルゴリズムの選択 {#selection-of-the-join-reorder-algorithms}

TiDB 結合したテーブルの再配置アルゴリズムの選択は、変数[`tidb_opt_join_reorder_threshold`](/system-variables.md#tidb_opt_join_reorder_threshold)によって制御されます。 結合したテーブルの再配置に参加しているノードの数がこのしきい値より大きい場合、TiDB は貪欲アルゴリズムを使用します。それ以外の場合、TiDB は動的プログラミング アルゴリズムを使用します。

## 結合したテーブルの再配置アルゴリズムの制限 {#limitations-of-join-reorder-algorithms}

現在の結合したテーブルの再配置アルゴリズムには次の制限があります。

-   結果セットの計算方法によって制限されるため、アルゴリズムは最適な結合順序を選択することを保証できません。
-   結合したテーブルの再配置アルゴリズムによる外部結合のサポートは、 [`tidb_enable_outer_join_reorder`](/system-variables.md#tidb_enable_outer_join_reorder-new-in-v610)システム変数によって制御されます。
-   現在、動的プログラミング アルゴリズムは、外部結合の結合したテーブルの再配置を実行できません。

現在、結合順序を強制する`STRAIGHT_JOIN`構文が TiDB でサポートされています。詳細については、 [構文要素の説明](/sql-statements/sql-statement-select.md#description-of-the-syntax-elements)を参照してください。
