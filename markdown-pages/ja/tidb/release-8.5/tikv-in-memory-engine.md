---
title: TiKV MVCC In-Memory Engine
summary: インメモリ エンジンの適用可能なシナリオと動作原理、およびインメモリ エンジンを使用して MVCC バージョンのクエリを高速化する方法について学習します。
---

# TiKV MVCC インメモリエンジン {#tikv-mvcc-in-memory-engine}

TiKV MVCC インメモリ エンジン (IME) は、主に、多数の MVCC 履歴バージョン (つまり[スキャンされたバージョンの合計数 ( `total_keys` ) が、処理されたバージョン数 ( `processed_keys` ) よりもはるかに大きい](/analyze-slow-queries.md#obsolete-mvcc-versions-and-excessive-keys)をスキャンする必要があるクエリを高速化するために使用されます。

TiKV MVCC インメモリ エンジンは、次のシナリオに適しています。

-   頻繁に更新または削除されるレコードを照会する必要があるアプリケーション。
-   履歴バージョンを TiDB に長期間 (たとえば、24 時間) 保持するために[`tidb_gc_life_time`](/garbage-collection-configuration.md#garbage-collection-configuration)調整する必要のあるアプリケーション。

## 実施原則 {#implementation-principles}

TiKV MVCC インメモリ エンジンは、書き込まれた最新の MVCC バージョンをメモリにキャッシュし、TiDB から独立した MVCC GC メカニズムを実装します。これにより、メモリ内の MVCC バージョンに対して GC を迅速に実行できるため、クエリ中にスキャンされるバージョンの数が減り、リクエストのレイテンシーが短縮され、CPU オーバーヘッドが削減されます。

次の図は、TiKV が MVCC バージョンを整理する方法を示しています。

![IME caches recent versions to reduce CPU overhead](https://docs-download.pingcap.com/media/images/docs/tikv-ime-data-organization.png)

上の図には、それぞれ 9 つの MVCC バージョンを持つ 2 行のレコードが表示されています。インメモリ エンジンを有効にした場合と無効にした場合の動作の比較は次のとおりです。

-   左側 (メモリ内エンジンが無効): テーブル レコードは、主キーの昇順で RocksDB に保存され、同じ行のすべての MVCC バージョンが互いに隣接しています。
-   右側 (インメモリ エンジンが有効): RocksDB 内のデータは左側と同じですが、インメモリ エンジンは 2 つの行ごとに最新の 2 つの MVCC バージョンをキャッシュします。
-   TiKV が範囲`[k1, k2]` 、開始タイムスタンプ`8`のスキャン要求を処理する場合:
    -   インメモリ エンジン (左) がない場合、11 個の MVCC バージョンを処理する必要があります。
    -   インメモリ エンジン (右) では、4 つの MVCC バージョンのみが処理されるため、リクエストのレイテンシーと CPU 消費が削減されます。
-   TiKV が範囲`[k1, k2]` 、開始タイムスタンプ`7`のスキャン要求を処理する場合:
    -   必要な履歴バージョンがメモリ内エンジンにないため (右)、キャッシュが無効になり、TiKV は RocksDB からデータを読み取るようになります。

## 使用法 {#usage}

TiKV MVCC インメモリ エンジン (IME) を有効にするには、TiKV 構成を調整し、TiKV を再起動する必要があります。構成の詳細は次のとおりです。

```toml
[in-memory-engine]
# This parameter is the switch for the in-memory engine feature, which is disabled by default. You can set it to true to enable it.
enable = false

# This parameter controls the memory size available to the in-memory engine.
# The default value is 10% of the system memory, and the maximum value is 5 GiB.
# You can manually adjust this configuration to allocate more memory.
# Note: When the in-memory engine is enabled, block-cache.capacity automatically decreases by 10%.
capacity = "5GiB"

# This parameter controls the time interval for the in-memory engine to GC the cached MVCC versions.
# The default value is 3 minutes, representing that GC is performed every 3 minutes on the cached MVCC versions.
# Decreasing the value of this parameter can increase the GC frequency, reduce the number of MVCC versions, but will increase CPU consumption for GC and increase the probability of in-memory engine cache miss.
gc-run-interval = "3m"

# This parameter controls the threshold for the in-memory engine to select and load Regions based on MVCC read amplification.
# The default value is 10, indicating that if reading a single row in a Region requires processing more than 10 MVCC versions, this Region might be loaded into the in-memory engine.
mvcc-amplification-threshold = 10
```

> **注記：**
>
> -   インメモリ エンジンはデフォルトで無効になっています。有効にした後、TiKV を再起動する必要があります。
> -   `enable`を除き、他のすべての構成項目は動的に調整できます。

### 自動読み込み {#automatic-loading}

インメモリ エンジンを有効にすると、TiKV はリージョンの読み取りトラフィックと MVCC 増幅に基づいて、ロードするリージョンを自動的に選択します。具体的なプロセスは次のとおりです。

1.  リージョンは、最近の`next` (RocksDB Iterator next API) および`prev` (RocksDB Iterator prev API) の呼び出しの数に基づいてソートされます。
2.  領域は`mvcc-amplification-threshold`構成パラメータを使用してフィルタリングされます。デフォルト値は`10`です。MVCC 増幅は読み取り増幅を測定し、 ( `next` + `prev` ) / `processed_keys`として計算されます。
3.  深刻な MVCC 増幅を持つ上位 N 個の領域がロードされます。N はメモリ推定に基づいて決定されます。

インメモリ エンジンは定期的にリージョンを削除します。プロセスは次のとおりです。

1.  インメモリ エンジンは、読み取りトラフィックが低い、または MVCC 増幅が低い領域を排除します。
2.  メモリ使用量が`capacity`の 90% に達し、新しいリージョンをロードする必要がある場合、インメモリ エンジンは読み取りトラフィックに基づいてリージョンを選択して削除します。

## 互換性 {#compatibility}

-   [BR](/br/br-use-overview.md) : インメモリ エンジンはBRと一緒に使用できます。ただし、 BR の復元中は、復元プロセスに関係するリージョンはインメモリ エンジンから削除されます。BRの復元が完了した後、対応するリージョンがホットスポットのままであれば、インメモリ エンジンによって自動的にロードされます。
-   [TiDB Lightning](/tidb-lightning/tidb-lightning-overview.md) : インメモリ エンジンはTiDB Lightningと一緒に使用できます。ただし、 TiDB Lightning が物理インポート モードで動作する場合、復元プロセスに関係するリージョンはインメモリ エンジンから削除されます。物理インポートが完了すると、対応するリージョンがホットスポットのままであれば、インメモリ エンジンによって自動的にロードされます。
-   [Follower Read](/develop/dev-guide-use-follower-read.md)および[ステイル読み取り](/develop/dev-guide-use-stale-read.md) : インメモリ エンジンは、これら 2 つの機能と一緒に使用できます。ただし、インメモリ エンジンは、Leader上のコプロセッサ要求のみを高速化でき、Follower Readとステイル読み取り操作を高速化することはできません。
-   [`FLASHBACK CLUSTER`](/sql-statements/sql-statement-flashback-cluster.md) : インメモリ エンジンは Flashback と一緒に使用できます。ただし、Flashback はインメモリ エンジン キャッシュを無効にします。Flashback プロセスが完了すると、インメモリ エンジンはホットスポット領域を自動的にロードします。

## FAQ {#faq}

### インメモリ エンジンは書き込みレイテンシーを削減し、書き込みスループットを向上させることができますか? {#can-the-in-memory-engine-reduce-write-latency-and-increase-write-throughput}

いいえ。インメモリ エンジンは、多数の MVCC バージョンをスキャンする読み取り要求のみを高速化できます。

### インメモリ エンジンがシナリオを改善できるかどうかを判断するにはどうすればよいですか? {#how-to-determine-if-the-in-memory-engine-can-improve-my-scenario}

次の SQL ステートメントを実行すると、 `Total_keys`が`Process_keys`より大幅に大きい遅いクエリがあるかどうかを確認できます。

```sql
SELECT
    Time,
    DB,
    Index_names,
    Process_keys,
    Total_keys,
    CONCAT(
        LEFT(REGEXP_REPLACE(Query, '\\s+', ' '), 20),
        '...',
        RIGHT(REGEXP_REPLACE(Query, '\\s+', ' '), 10)
    ) as Query,
    Query_time,
    Cop_time,
    Process_time
FROM
    INFORMATION_SCHEMA.SLOW_QUERY
WHERE
    Is_internal = 0
    AND Cop_time > 1
    AND Process_keys > 0
    AND Total_keys / Process_keys >= 10
    AND Time >= NOW() - INTERVAL 10 MINUTE
ORDER BY Total_keys DESC
LIMIT 5;
```

例：

次の結果は、 `db1.tbl1`テーブルに深刻な MVCC 増幅を伴うクエリが存在することを示しています。TiKV は 1358517 個の MVCC バージョンを処理し、2 つのバージョンのみを返します。

    +----------------------------+-----+-------------------+--------------+------------+-----------------------------------+--------------------+--------------------+--------------------+
    | Time                       | DB  | Index_names       | Process_keys | Total_keys | Query                             | Query_time         | Cop_time           | Process_time       |
    +----------------------------+-----+-------------------+--------------+------------+-----------------------------------+--------------------+--------------------+--------------------+
    | 2024-11-18 11:56:10.303228 | db1 | [tbl1:some_index] |            2 |    1358517 |  SELECT * FROM tbl1 ... LIMIT 1 ; | 1.2581352350000001 |         1.25651062 |        1.251837479 |
    | 2024-11-18 11:56:11.556257 | db1 | [tbl1:some_index] |            2 |    1358231 |  SELECT * FROM tbl1 ... LIMIT 1 ; |        1.252694002 |        1.251129038 |        1.240532546 |
    | 2024-11-18 12:00:10.553331 | db1 | [tbl1:some_index] |            2 |    1342914 |  SELECT * FROM tbl1 ... LIMIT 1 ; |        1.473941872 | 1.4720495900000001 | 1.3666103170000001 |
    | 2024-11-18 12:01:52.122548 | db1 | [tbl1:some_index] |            2 |    1128064 |  SELECT * FROM tbl1 ... LIMIT 1 ; |        1.058942591 |        1.056853228 |        1.023483875 |
    | 2024-11-18 12:01:52.107951 | db1 | [tbl1:some_index] |            2 |    1128064 |  SELECT * FROM tbl1 ... LIMIT 1 ; |        1.044847031 |        1.042546122 |        0.934768555 |
    +----------------------------+-----+-------------------+--------------+------------+-----------------------------------+--------------------+--------------------+--------------------+
    5 rows in set (1.26 sec)
