---
title: Quick start with HTAP
summary: Learn how to quickly get started with the TiDB HTAP.
---

# TiDB HTAPのクイック スタート ガイド {#quick-start-guide-for-tidb-htap}

このガイドでは、ハイブリッド トランザクションおよび分析処理 (HTAP) の TiDB のワンストップ ソリューションを開始するための最も簡単な方法について説明します。

> **ノート：**
>
> このガイドに記載されている手順は、テスト環境でのクイック スタート専用です。本番環境では、 [HTAP を調べる](/explore-htap.md)をお勧めします。

## 基本概念 {#basic-concepts}

TiDB HTAPを使用する前に、 [TiKV](/tikv-overview.md) 、TiDB Online Transactional Processing (OLTP) 用の行ベースのstorageエンジン、および[TiFlash](/tiflash/tiflash-overview.md) 、TiDB Online Analytical Processing (OLAP) 用の列型storageエンジンに関する基本的な知識が必要です。

-   HTAP のストレージ エンジン: HTAP では、行ベースのstorageエンジンと列ベースのstorageエンジンが共存します。どちらのstorageエンジンもデータを自動的にレプリケートし、強力な整合性を維持できます。行ベースのstorageエンジンは OLTP のパフォーマンスを最適化し、列ベースのstorageエンジンは OLAP のパフォーマンスを最適化します。
-   HTAP のデータ整合性: 分散型のトランザクション キー値データベースとして、TiKV はACID準拠のトランザクション インターフェイスを提供し、複数のレプリカ間のデータ整合性と[Raftコンセンサスアルゴリズム](https://raft.github.io/raft.pdf)の実装による高可用性を保証します。 TiKV のカラムナstorage拡張として、 TiFlash はRaft Learnerコンセンサス アルゴリズムに従ってリアルタイムでTiFlashからデータをレプリケートします。
-   HTAP のデータ分離: HTAP リソースの分離の問題を解決するために、必要に応じて TiKV とTiFlash を異なるマシンに展開できます。
-   MPP コンピューティング エンジン: [MPP](/tiflash/use-tiflash-mpp-mode.md#control-whether-to-select-the-mpp-mode) 、TiDB 5.0 以降のTiFlashエンジンによって提供される分散コンピューティング フレームワークであり、ノード間のデータ交換を可能にし、高性能で高スループットの SQL アルゴリズムを提供します。 MPP モードでは、分析クエリの実行時間を大幅に短縮できます。

## 手順 {#steps}

このドキュメントでは、 [TPC-H](http://www.tpc.org/tpch/)データセットでサンプル テーブルをクエリすることにより、 TiDB HTAPの利便性と高性能を体験できます。 TPC-H は、大量のデータと非常に複雑な一連のビジネス指向のアドホック クエリで構成される、一般的な意思決定支援ベンチマークです。 TPC-H を使用して 22 個の完全な SQL クエリを体験するには、 [tidb-bench リポジトリ](https://github.com/pingcap/tidb-bench/tree/master/tpch/queries)または[TPC-H](http://www.tpc.org/tpch/)にアクセスして、クエリ ステートメントとデータを生成する方法を確認してください。

### ステップ 1. ローカル テスト環境をデプロイ {#step-1-deploy-a-local-test-environment}

TiDB HTAPを使用する前に、 [TiDB データベース プラットフォームのクイック スタート ガイド](/quick-start-with-tidb.md)の手順に従ってローカル テスト環境を準備し、次のコマンドを実行して TiDB クラスターをデプロイします。


```shell
tiup playground
```

> **ノート：**
>
> `tiup playground`コマンドは、本番用ではなく、クイック スタート専用です。

### ステップ 2. テスト データの準備 {#step-2-prepare-test-data}

次の手順では、 TiDB HTAPを使用するためのテスト データとして[TPC-H](http://www.tpc.org/tpch/)データセットを作成できます。 TPC-H に興味がある場合は、 [一般的な実装ガイドライン](http://tpc.org/tpc_documents_current_versions/pdf/tpc-h_v3.0.0.pdf)参照してください。

> **ノート：**
>
> 分析クエリに既存のデータを使用する場合は、 [データを TiDB に移行する](/migration-overview.md)ことができます。独自のテスト データを設計して作成する場合は、SQL ステートメントを実行するか、関連ツールを使用して作成できます。

1.  次のコマンドを実行して、テスト データ生成ツールをインストールします。

    
    ```shell
    tiup install bench
    ```

2.  次のコマンドを実行して、テスト データを生成します。

    
    ```shell
    tiup bench tpch --sf=1 prepare
    ```

    このコマンドの出力に`Finished`表示された場合、データが作成されたことを示します。

3.  次の SQL ステートメントを実行して、生成されたデータを表示します。

    
    ```sql
    SELECT
      CONCAT(table_schema,'.',table_name) AS 'Table Name',
      table_rows AS 'Number of Rows',
      FORMAT_BYTES(data_length) AS 'Data Size',
      FORMAT_BYTES(index_length) AS 'Index Size',
      FORMAT_BYTES(data_length+index_length) AS'Total'
    FROM
      information_schema.TABLES
    WHERE
      table_schema='test';
    ```

    出力からわかるように、合計 8 つのテーブルが作成され、最大のテーブルには 650 万行あります (データがランダムに生成されるため、ツールによって作成される行の数は、実際の SQL クエリの結果によって異なります)。

    ```sql
    +---------------+----------------+-----------+------------+-----------+
    |  Table Name   | Number of Rows | Data Size | Index Size |   Total   |
    +---------------+----------------+-----------+------------+-----------+
    | test.nation   |             25 | 2.44 KiB  | 0 bytes    | 2.44 KiB  |
    | test.region   |              5 | 416 bytes | 0 bytes    | 416 bytes |
    | test.part     |         200000 | 25.07 MiB | 0 bytes    | 25.07 MiB |
    | test.supplier |          10000 | 1.45 MiB  | 0 bytes    | 1.45 MiB  |
    | test.partsupp |         800000 | 120.17 MiB| 12.21 MiB  | 132.38 MiB|
    | test.customer |         150000 | 24.77 MiB | 0 bytes    | 24.77 MiB |
    | test.orders   |        1527648 | 174.40 MiB| 0 bytes    | 174.40 MiB|
    | test.lineitem |        6491711 | 849.07 MiB| 99.06 MiB  | 948.13 MiB|
    +---------------+----------------+-----------+------------+-----------+
    8 rows in set (0.06 sec)
    ```

    商用発注システムのデータベースです。 `test.nation`表は国に関する情報を示し、 `test.region`表は地域に関する情報を示し、 `test.part`表は部品に関する情報を示し、 `test.supplier`表はサプライヤーに関する情報を示し、 `test.partsupp`表はサプライヤーの部品に関する情報を示し、表`test.customer`は顧客に関する情報、表`test.customer`は注文に関する情報、表`test.lineitem`はオンライン アイテムに関する情報を示します。

### ステップ 3. 行ベースのstorageエンジンを使用してデータをクエリする {#step-3-query-data-with-the-row-based-storage-engine}

行ベースのstorageエンジンのみを使用した TiDB のパフォーマンスを確認するには、次の SQL ステートメントを実行します。


```sql
SELECT
    l_orderkey,
    SUM(
        l_extendedprice * (1 - l_discount)
    ) AS revenue,
    o_orderdate,
    o_shippriority
FROM
    customer,
    orders,
    lineitem
WHERE
    c_mktsegment = 'BUILDING'
AND c_custkey = o_custkey
AND l_orderkey = o_orderkey
AND o_orderdate < DATE '1996-01-01'
AND l_shipdate > DATE '1996-02-01'
GROUP BY
    l_orderkey,
    o_orderdate,
    o_shippriority
ORDER BY
    revenue DESC,
    o_orderdate
limit 10;
```

これは出荷優先度クエリで、指定された日付までに出荷されなかった最高収益の注文の優先度と潜在的な収益を提供します。潜在的な収益は`l_extendedprice * (1-l_discount)`の合計として定義されます。注文は収益の降順でリストされます。この例では、このクエリは未出荷の注文を上位 10 位までリストします。

### 手順 4. テスト データを列指向storageエンジンにレプリケートする {#step-4-replicate-the-test-data-to-the-columnar-storage-engine}

TiFlashがデプロイされた後、TiKV はデータをすぐにTiFlashに複製しません。レプリケートする必要があるテーブルを指定するには、TiDB の MySQL クライアントで次の DDL ステートメントを実行する必要があります。その後、TiDB はそれに応じて指定されたレプリカをTiFlashに作成します。


```sql
ALTER TABLE test.customer SET TIFLASH REPLICA 1;
ALTER TABLE test.orders SET TIFLASH REPLICA 1;
ALTER TABLE test.lineitem SET TIFLASH REPLICA 1;
```

特定のテーブルのレプリケーション ステータスを確認するには、次のステートメントを実行します。


```sql
SELECT * FROM information_schema.tiflash_replica WHERE TABLE_SCHEMA = 'test' and TABLE_NAME = 'customer';
SELECT * FROM information_schema.tiflash_replica WHERE TABLE_SCHEMA = 'test' and TABLE_NAME = 'orders';
SELECT * FROM information_schema.tiflash_replica WHERE TABLE_SCHEMA = 'test' and TABLE_NAME = 'lineitem';
```

上記のステートメントの結果:

-   `AVAILABLE`特定のテーブルのTiFlashレプリカが使用可能かどうかを示します。 `1`利用可能であることを意味し、 `0`利用できないことを意味します。 `AVAILABLE`フィールドが`1`になると、このステータスは変更されなくなります。
-   `PROGRESS`レプリケーションの進行状況を意味します。値は 0.0 ～ 1.0 です。 1 は、 TiFlashレプリカの複製の進行が完了したことを意味します。

### ステップ 5. HTAP を使用してデータをより迅速に分析する {#step-5-analyze-data-faster-using-htap}

[ステップ 3](#step-3-query-data-with-the-row-based-storage-engine)の SQL ステートメントを再度実行すると、 TiDB HTAPのパフォーマンスを確認できます。

TiFlashレプリカを含むテーブルの場合、TiDB オプティマイザは、コストの見積もりに基づいてTiFlashレプリカを使用するかどうかを自動的に決定します。 TiFlashレプリカが選択されているかどうかを確認するには、 `desc`または`explain analyze`ステートメントを使用できます。例えば：


```sql
explain analyze SELECT
    l_orderkey,
    SUM(
        l_extendedprice * (1 - l_discount)
    ) AS revenue,
    o_orderdate,
    o_shippriority
FROM
    customer,
    orders,
    lineitem
WHERE
    c_mktsegment = 'BUILDING'
AND c_custkey = o_custkey
AND l_orderkey = o_orderkey
AND o_orderdate < DATE '1996-01-01'
AND l_shipdate > DATE '1996-02-01'
GROUP BY
    l_orderkey,
    o_orderdate,
    o_shippriority
ORDER BY
    revenue DESC,
    o_orderdate
limit 10;
```

`EXPLAIN`ステートメントの結果が`ExchangeSender`つと`ExchangeReceiver`演算子を示している場合、MPP モードが有効になっていることを示します。

さらに、クエリ全体の各部分がTiFlashエンジンのみを使用して計算されるように指定できます。詳細については、 [TiDB を使用してTiFlashレプリカを読み取る](/tiflash/use-tidb-to-read-tiflash.md)を参照してください。

これら 2 つの方法のクエリ結果とクエリ パフォーマンスを比較できます。

## 次は何ですか {#what-s-next}

-   [TiDB HTAPのアーキテクチャ](/tiflash/tiflash-overview.md#architecture)
-   [HTAP を調べる](/explore-htap.md)
-   [TiFlashを使用する](/tiflash/tiflash-overview.md#use-tiflash)
