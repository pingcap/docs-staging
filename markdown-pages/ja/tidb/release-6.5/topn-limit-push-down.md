---
title: TopN and Limit Operator Push Down
summary: Learn the implementation of TopN and Limit operator pushdown.
---

# TopN および Limit オペレーターのプッシュダウン {#topn-and-limit-operator-push-down}

このドキュメントでは、TopN および Limit オペレーター プッシュダウンの実装について説明します。

TiDB 実行計画ツリーでは、SQL の`LIMIT`句が Limit 演算子ノードに対応し、 `ORDER BY`句が Sort 演算子ノードに対応します。隣接する Limit 演算子と Sort 演算子は TopN 演算子ノードとして結合されます。これは、特定の並べ替え規則に従って上位 N レコードが返されることを意味します。つまり、Limit オペレーターは、NULL ソート・ルールを持つ TopN オペレーター・ノードと同等です。

述語のプッシュダウンと同様に、TopN と Limit は実行計画ツリー内でできるだけデータ ソースに近い位置にプッシュ ダウンされ、必要なデータが早い段階でフィルタリングされます。このように、プッシュダウンはデータ送信と計算のオーバーヘッドを大幅に削減します。

このルールを無効にするには、 [式プッシュダウンの最適化ルールとブロックリスト](/blocklist-control-plan.md)を参照してください。

## 例 {#examples}

このセクションでは、いくつかの例を通じて TopN プッシュダウンを示します。

### 例 1:storageレイヤーのコプロセッサーにプッシュダウンする {#example-1-push-down-to-the-coprocessors-in-the-storage-layer}


```sql
create table t(id int primary key, a int not null);
explain select * from t order by a limit 10;
```

```
+----------------------------+----------+-----------+---------------+--------------------------------+
| id                         | estRows  | task      | access object | operator info                  |
+----------------------------+----------+-----------+---------------+--------------------------------+
| TopN_7                     | 10.00    | root      |               | test.t.a, offset:0, count:10   |
| └─TableReader_15           | 10.00    | root      |               | data:TopN_14                   |
|   └─TopN_14                | 10.00    | cop[tikv] |               | test.t.a, offset:0, count:10   |
|     └─TableFullScan_13     | 10000.00 | cop[tikv] | table:t       | keep order:false, stats:pseudo |
+----------------------------+----------+-----------+---------------+--------------------------------+
4 rows in set (0.00 sec)
```

このクエリでは、データ フィルタリングのために TopN オペレータ ノードが TiKV にプッシュ ダウンされ、各コプロセッサーは 10 レコードのみを TiDB に返します。 TiDB がデータを集約した後、最終的なフィルタリングが実行されます。

### 例 2: TopN を Join にプッシュ ダウンできます (並べ替えルールは、外部テーブルの列にのみ依存します) {#example-2-topn-can-be-pushed-down-into-join-the-sorting-rule-only-depends-on-the-columns-in-the-outer-table}


```sql
create table t(id int primary key, a int not null);
create table s(id int primary key, a int not null);
explain select * from t left join s on t.a = s.a order by t.a limit 10;
```

```
+----------------------------------+----------+-----------+---------------+-------------------------------------------------+
| id                               | estRows  | task      | access object | operator info                                   |
+----------------------------------+----------+-----------+---------------+-------------------------------------------------+
| TopN_12                          | 10.00    | root      |               | test.t.a, offset:0, count:10                    |
| └─HashJoin_17                    | 12.50    | root      |               | left outer join, equal:[eq(test.t.a, test.s.a)] |
|   ├─TopN_18(Build)               | 10.00    | root      |               | test.t.a, offset:0, count:10                    |
|   │ └─TableReader_26             | 10.00    | root      |               | data:TopN_25                                    |
|   │   └─TopN_25                  | 10.00    | cop[tikv] |               | test.t.a, offset:0, count:10                    |
|   │     └─TableFullScan_24       | 10000.00 | cop[tikv] | table:t       | keep order:false, stats:pseudo                  |
|   └─TableReader_30(Probe)        | 10000.00 | root      |               | data:TableFullScan_29                           |
|     └─TableFullScan_29           | 10000.00 | cop[tikv] | table:s       | keep order:false, stats:pseudo                  |
+----------------------------------+----------+-----------+---------------+-------------------------------------------------+
8 rows in set (0.01 sec)
```

このクエリでは、TopN 演算子の並べ替え規則は外部テーブル`t`の列のみに依存するため、TopN を Join にプッシュする前に計算を実行して、Join 操作の計算コストを削減できます。その上、TiDB はまた TopN をstorageレイヤーにプッシュします。

### 例 3: Join の前に TopN をプッシュダウンすることはできません {#example-3-topn-cannot-be-pushed-down-before-join}


```sql
create table t(id int primary key, a int not null);
create table s(id int primary key, a int not null);
explain select * from t join s on t.a = s.a order by t.id limit 10;
```

```
+-------------------------------+----------+-----------+---------------+--------------------------------------------+
| id                            | estRows  | task      | access object | operator info                              |
+-------------------------------+----------+-----------+---------------+--------------------------------------------+
| TopN_12                       | 10.00    | root      |               | test.t.id, offset:0, count:10              |
| └─HashJoin_16                 | 12500.00 | root      |               | inner join, equal:[eq(test.t.a, test.s.a)] |
|   ├─TableReader_21(Build)     | 10000.00 | root      |               | data:TableFullScan_20                      |
|   │ └─TableFullScan_20        | 10000.00 | cop[tikv] | table:s       | keep order:false, stats:pseudo             |
|   └─TableReader_19(Probe)     | 10000.00 | root      |               | data:TableFullScan_18                      |
|     └─TableFullScan_18        | 10000.00 | cop[tikv] | table:t       | keep order:false, stats:pseudo             |
+-------------------------------+----------+-----------+---------------+--------------------------------------------+
6 rows in set (0.00 sec)
```

TopN を`Inner Join`より前にプッシュダウンすることはできません。上記のクエリを例にとると、Join 後に 100 レコードを取得した場合、TopN 後に 10 レコードを残すことができます。ただし、最初に TopN を実行して 10 レコードを取得すると、Join 後に 5 レコードしか残りません。このような場合、プッシュダウンの結果は異なります。

同様に、TopN は Outer Join の内部テーブルにプッシュ ダウンできません。また、その並べ替えルールが`t.a+s.a`のように複数のテーブルの列に関連付けられている場合は、プッシュ ダウンできません。 TopN の並べ替え規則が外部テーブルの列に排他的に依存する場合にのみ、TopN をプッシュ ダウンできます。

### 例 4: TopN を Limit に変換する {#example-4-convert-topn-to-limit}


```sql
create table t(id int primary key, a int not null);
create table s(id int primary key, a int not null);
explain select * from t left join s on t.a = s.a order by t.id limit 10;
```

```
+----------------------------------+----------+-----------+---------------+-------------------------------------------------+
| id                               | estRows  | task      | access object | operator info                                   |
+----------------------------------+----------+-----------+---------------+-------------------------------------------------+
| TopN_12                          | 10.00    | root      |               | test.t.id, offset:0, count:10                   |
| └─HashJoin_17                    | 12.50    | root      |               | left outer join, equal:[eq(test.t.a, test.s.a)] |
|   ├─Limit_21(Build)              | 10.00    | root      |               | offset:0, count:10                              |
|   │ └─TableReader_31             | 10.00    | root      |               | data:Limit_30                                   |
|   │   └─Limit_30                 | 10.00    | cop[tikv] |               | offset:0, count:10                              |
|   │     └─TableFullScan_29       | 10.00    | cop[tikv] | table:t       | keep order:true, stats:pseudo                   |
|   └─TableReader_35(Probe)        | 10000.00 | root      |               | data:TableFullScan_34                           |
|     └─TableFullScan_34           | 10000.00 | cop[tikv] | table:s       | keep order:false, stats:pseudo                  |
+----------------------------------+----------+-----------+---------------+-------------------------------------------------+
8 rows in set (0.00 sec)

```

上記のクエリでは、最初に TopN が外部テーブル`t`にプッシュされます。 TopN は、主キーである`t.id`でソートする必要があり、TopN で追加のソートを行うことなく、順序 ( `keep order: true` ) で直接読み取ることができます。したがって、TopN は Limit として単純化されます。
