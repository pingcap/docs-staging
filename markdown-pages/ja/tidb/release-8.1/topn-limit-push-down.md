---
title: TopN and Limit Operator Push Down
summary: TopN および Limit 演算子プッシュダウンの実装を学習します。
---

# TopN と Limit 演算子のプッシュダウン {#topn-and-limit-operator-push-down}

このドキュメントでは、TopN および Limit 演算子プッシュダウンの実装について説明します。

TiDB 実行プラン ツリーでは、SQL の`LIMIT`節は Limit 演算子ノードに対応し、 `ORDER BY`節は Sort 演算子ノードに対応します。隣接する Limit 演算子と Sort 演算子は TopN 演算子ノードとして結合され、特定のソート ルールに従って上位 N レコードが返されることを意味します。つまり、Limit 演算子は、null ソート ルールを持つ TopN 演算子ノードと同等です。

述語プッシュダウンと同様に、TopN と Limit は実行プラン ツリー内でデータ ソースにできるだけ近い位置にプッシュダウンされるため、必要なデータが早い段階でフィルター処理されます。このようにして、プッシュダウンはデータ転送と計算のオーバーヘッドを大幅に削減します。

このルールを無効にするには、 [式プッシュダウンの最適化ルールとブロックリスト](/blocklist-control-plan.md)を参照してください。

## 例 {#examples}

このセクションでは、いくつかの例を通して TopN プッシュダウンについて説明します。

### 例1:storageレイヤーのコプロセッサにプッシュダウンする {#example-1-push-down-to-the-coprocessors-in-the-storage-layer}

```sql
create table t(id int primary key, a int not null);
explain select * from t order by a limit 10;
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

このクエリでは、TopN 演算子ノードがデータ フィルタリングのために TiKV にプッシュダウンされ、各コプロセッサーは10 レコードのみを TiDB に返します。TiDB がデータを集約した後、最終的なフィルタリングが実行されます。

### 例 2: TopN を Join にプッシュダウンできます (ソート規則は外部テーブルの列のみに依存します) {#example-2-topn-can-be-pushed-down-into-join-the-sorting-rule-only-depends-on-the-columns-in-the-outer-table}

```sql
create table t(id int primary key, a int not null);
create table s(id int primary key, a int not null);
explain select * from t left join s on t.a = s.a order by t.a limit 10;
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

このクエリでは、TopN 演算子のソート規則は外部テーブル`t`の列のみに依存するため、TopN を Join にプッシュダウンする前に計算を実行して、Join 操作の計算コストを削減できます。また、TiDB は TopN をstorageレイヤーにプッシュダウンします。

### 例3: TopNはJoin前にプッシュダウンできない {#example-3-topn-cannot-be-pushed-down-before-join}

```sql
create table t(id int primary key, a int not null);
create table s(id int primary key, a int not null);
explain select * from t join s on t.a = s.a order by t.id limit 10;
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

TopN は`Inner Join`より前にプッシュダウンできません。上記のクエリを例にとると、結合後に 100 件のレコードを取得した場合、TopN の後に 10 件のレコードが残ります。ただし、最初に TopN を実行して 10 件のレコードを取得した場合、結合後には 5 件のレコードしか残りません。このような場合、プッシュダウンの結果は異なります。

同様に、 TopN は Outer Join の内部テーブルにプッシュダウンすることも、そのソート規則が`t.a+s.a`などの複数のテーブルの列に関連している場合にプッシュダウンすることもできません。 TopN のソート規則が外部テーブルの列に排他的に依存する場合にのみ、 TopN をプッシュダウンできます。

### 例4: TopNをLimitに変換する {#example-4-convert-topn-to-limit}

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

上記のクエリでは、最初に TopN が外部テーブル`t`にプッシュされます。 TopN は主キーである`t.id`でソートする必要があり、 TopN で追加のソートを行わずに順序 ( `keep order: true` ) で直接読み取ることができます。 したがって、 TopN は Limit として簡略化されます。
