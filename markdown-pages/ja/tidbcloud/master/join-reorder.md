---
title: Introduction to Join Reorder
summary: 結合したテーブルの再配置アルゴリズムを使用して、TiDB 内の複数のテーブルを結合します。
---

# 結合したテーブルの再配置の変更の概要 {#introduction-to-join-reorder}

実際のアプリケーション シナリオでは、複数のテーブルを結合するのが一般的です。結合の実行効率は、各テーブルが結合される順序に関係します。

例えば：

```sql
SELECT * FROM t1, t2, t3 WHERE t1.a=t2.a AND t3.a=t2.a;
```

このクエリでは、テーブルを次の 2 つの順序で結合できます。

-   t1はt2に結合し、次にt3に結合します。
-   t2はt3に結合し、次にt1に結合します。

t1 と t3 はデータ量と分布が異なるため、これら 2 つの実行順序ではパフォーマンスが異なる場合があります。

したがって、オプティマイザには結合順序を決定するアルゴリズムが必要です。現在、TiDB では次の 2 つの結合したテーブルの再配置アルゴリズムが使用されています。

-   貪欲アルゴリズム: 結合に参加するすべてのノードの中で、TiDB は行数が最も少ないテーブルを選択し、他の各テーブルとの結合結果をそれぞれ推定し、結合結果が最小のペアを選択します。その後、TiDB は同様のプロセスを継続し、すべてのノードが結合を完了するまで、次のラウンドで他のノードを選択して結合します。
-   動的プログラミング アルゴリズム: 結合に参加するすべてのノード間で、TiDB はすべての可能な結合順序を列挙し、最適な結合順序を選択します。

## 例: 結合したテーブルの再配置の貪欲アルゴリズム {#example-the-greedy-algorithm-of-join-reorder}

前述の 3 つのテーブル (t1、t2、t3) を例に挙げます。

まず、TiDB は結合操作に参加するすべてのノードを取得し、行番号の昇順でノードをソートします。

![join-reorder-1](https://download.pingcap.com/images/docs/join-reorder-1.png)

その後、行数が最も少ないテーブルが選択され、それぞれ他の 2 つのテーブルと結合されます。出力結果セットのサイズを比較して、TiDB は結果セットが小さい方のペアを選択します。

![join-reorder-2](https://download.pingcap.com/images/docs/join-reorder-2.png)

その後、TiDB は次の選択ラウンドに入ります。4 つのテーブルを結合しようとすると、TiDB は出力結果セットのサイズを比較し続け、結果セットが小さい方のペアを選択します。

この場合、結合されるテーブルは 3 つだけなので、TiDB は最終的な結合結果を取得します。

![join-reorder-3](https://download.pingcap.com/images/docs/join-reorder-3.png)

## 例: 結合したテーブルの再配置の動的プログラミングアルゴリズム {#example-the-dynamic-programming-algorithm-of-join-reorder}

前述の 3 つのテーブル (t1、t2、t3) を再び例にとると、動的プログラミング アルゴリズムはすべての可能性を列挙できます。したがって、 `t1`テーブル (行数が最も少ないテーブル) から開始する必要がある貪欲アルゴリズムと比較すると、動的プログラミング アルゴリズムは次のように結合順序を列挙できます。

![join-reorder-4](https://download.pingcap.com/images/docs/join-reorder-4.png)

この選択が貪欲アルゴリズムよりも優れている場合、動的プログラミング アルゴリズムはより適切な結合順序を選択できます。

すべての可能性が列挙されるため、動的プログラミング アルゴリズムはより多くの時間を消費し、統計の影響を受けやすくなります。

## 結合したテーブルの再配置アルゴリズムの選択 {#selection-of-the-join-reorder-algorithms}

TiDB結合したテーブルの再配置アルゴリズムの選択は、 [`tidb_opt_join_reorder_threshold`](/system-variables.md#tidb_opt_join_reorder_threshold)変数によって制御されます。結合したテーブルの再配置に参加するノードの数がこのしきい値より大きい場合、TiDB は貪欲アルゴリズムを使用します。それ以外の場合、TiDB は動的プログラミング アルゴリズムを使用します。

## 結合したテーブルの再配置アルゴリズムの制限 {#limitations-of-join-reorder-algorithms}

現在の結合したテーブルの再配置アルゴリズムには次の制限があります。

-   結果セットの計算方法によって制限されるため、アルゴリズムでは最適な結合順序が確実に選択されるわけではありません。
-   結合したテーブルの再配置アルゴリズムの外部結合のサポートは、 [`tidb_enable_outer_join_reorder`](/system-variables.md#tidb_enable_outer_join_reorder-new-in-v610)システム変数によって制御されます。
-   現在、動的プログラミング アルゴリズムでは、外部結合の結合したテーブルの再配置を実行できません。

現在、結合順序を強制するために、TiDB では`STRAIGHT_JOIN`構文がサポートされています。詳細については、 [構文要素の説明](/sql-statements/sql-statement-select.md#description-of-the-syntax-elements)を参照してください。
