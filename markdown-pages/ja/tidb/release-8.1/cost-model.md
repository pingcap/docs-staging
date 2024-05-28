---
title: Cost Model
summary: 物理的な最適化中に TiDB によって使用されるコスト モデルがどのように機能するかを学習します。
---

# コストモデル {#cost-model}

TiDB は、 [物理的な最適化](/sql-physical-optimization.md)の間にコスト モデルを使用してインデックスと演算子を選択します。このプロセスを次の図に示します。

![CostModel](https://download.pingcap.com/images/docs/cost-model.png)

TiDB は、各インデックスのアクセス コストとプラン内の各物理演算子 (HashJoin や IndexJoin など) の実行コストを計算し、最小コストのプランを選択します。

以下は、コスト モデルの仕組みを説明する簡略化された例です。表`t`があるとします。

```sql
mysql> SHOW CREATE TABLE t;
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                                        |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| t     | CREATE TABLE `t` (
  `a` int(11) DEFAULT NULL,
  `b` int(11) DEFAULT NULL,
  `c` int(11) DEFAULT NULL,
  KEY `b` (`b`),
  KEY `c` (`c`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

`SELECT * FROM t WHERE b < 100 and c < 100`ステートメントを実行するときに、TiDB が`b < 100`条件を満たす行が 20 行、 `c < 100`条件を満たす行が 500 行で、 `INT`タイプのインデックスの長さが 8 であると推定するとします。この場合、TiDB は 2 つのインデックスのコストを計算します。

-   インデックス`b`のコスト = 行数`b < 100` * インデックス`b`の長さ = 20 * 8 = 160
-   インデックス`c`のコスト = 行数`c < 100` * インデックス`c`の長さ = 500 * 8 = 4000

インデックス`b`のコストが低いため、TiDB はインデックスとして`b`選択します。

上記の例は簡略化されており、基本原理を説明するためにのみ使用されています。実際の SQL 実行では、TiDB コスト モデルはより複雑になります。

## コストモデル バージョン 2 {#cost-model-version-2}

TiDB v6.2.0 では、新しいコスト モデルであるコスト モデル バージョン 2 が導入されています。

コスト モデル バージョン 2 では、コスト式のより正確な回帰キャリブレーションが提供され、コスト式の一部が調整され、以前のバージョンのコスト式よりも正確になっています。

コストモデルのバージョンを切り替えるには、 [`tidb_cost_model_version`](/system-variables.md#tidb_cost_model_version-new-in-v620)変数を設定します。

> **注記：**
>
> コスト モデルのバージョンを切り替えると、クエリ プランが変更される可能性があります。