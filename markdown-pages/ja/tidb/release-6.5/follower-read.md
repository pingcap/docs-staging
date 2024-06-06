---
title: Follower Read
summary: This document describes the use and implementation of Follower Read.
---

# Follower Read {#follower-read}

リージョンに読み取りホットスポットが現れると、 リージョンリーダーがシステム全体の読み取りボトルネックになる可能性があります。この状況では、Follower Read機能を有効にすると、リーダーの負荷が大幅に軽減され、複数のフォロワー間で負荷が分散されるため、システム全体のスループットが向上します。このドキュメントでは、 Follower Readの使用と実装メカニズムを紹介します。

## 概要 {#overview}

Follower Read機能とは、リージョンの任意のフォロワー レプリカを使用して、強力な一貫性のある読み取りを前提として読み取り要求を処理することを指します。この機能により、TiDB クラスターのスループットが向上し、リーダーの負荷が軽減されます。これには、リージョン内のリーダー レプリカからフォロワー レプリカに TiKV 読み取り負荷をオフロードする一連の負荷分散メカニズムが含まれています。 TiKV のFollower Read実装は、ユーザーに強力な一貫性のある読み取りを提供します。

> **ノート：**
>
> 強力な一貫性のある読み取りを実現するために、フォロワー ノードは現在、リーダー ノード (つまり`ReadIndex` ) から現在の実行の進行状況を要求する必要があります。これにより、追加のネットワーク要求オーバーヘッドが発生します。したがって、Follower Readの主な利点は、クラスター内で読み取り要求を書き込み要求から分離し、全体的な読み取りスループットを向上させることです。

## 使用法 {#usage}

TiDB のFollower Read機能を有効にするには、次のように`tidb_replica_read`変数の値を変更します。


```sql
set [session | global] tidb_replica_read = '<target value>';
```

スコープ: セッション |グローバル

デフォルト: リーダー

この変数は、予想されるデータ読み取りモードを設定するために使用されます。

-   `tidb_replica_read`の値が`leader`または空の文字列に設定されている場合、TiDB はデフォルトの動作を維持し、すべての読み取り操作をリーダー レプリカに送信して実行します。
-   `tidb_replica_read`の値が`follower`に設定されている場合、TiDB はリージョンのフォロワー レプリカを選択して、すべての読み取り操作を実行します。
-   `tidb_replica_read`の値が`leader-and-follower`に設定されている場合、TiDB は任意のレプリカを選択して読み取り操作を実行できます。このモードでは、読み取り要求はリーダーとフォロワーの間で負荷分散されます。
-   `tidb_replica_read`の値が`closest-replicas`に設定されている場合、TiDB は同じアベイラビリティ ゾーン内のレプリカを選択して読み取り操作を実行することを優先します。これは、リーダーまたはフォロワーである可能性があります。同じ可用性ゾーンにレプリカがない場合、TiDB はリーダー レプリカから読み取ります。
-   `tidb_replica_read`の値が`closest-adaptive`に設定されている場合:

    -   読み取り要求の推定結果が[`tidb_adaptive_closest_read_threshold`](/system-variables.md#tidb_adaptive_closest_read_threshold-new-in-v630)の値以上の場合、TiDB は読み取り操作のために同じ可用性ゾーン内のレプリカを選択することを優先します。アベイラビリティ ゾーン間での読み取りトラフィックの不均衡な分散を回避するために、TiDB はすべてのオンライン TiDB および TiKV ノードのアベイラビリティ ゾーンの分散を動的に検出します。各アベイラビリティ ゾーンでは、 `closest-adaptive`の構成が有効になる TiDB ノードの数が制限されます。これは、TiDB ノードが最も少ないアベイラビリティ ゾーン内の TiDB ノードの数と常に同じであり、他の TiDB ノードはリーダー レプリカから自動的に読み取ります。 .たとえば、TiDB ノードが 3 つのアベイラビリティ ゾーン (A、B、および C) に分散されている場合、A と B にはそれぞれ 3 つの TiDB ノードが含まれ、C には 2 つの TiDB ノードしか含まれていない場合、それぞれで`closest-adaptive`の構成が有効になる TiDB ノードの数はアベイラビリティ ゾーンは 2 であり、A および B アベイラビリティ ゾーンのそれぞれにある他の TiDB ノードは、読み取り操作用のリーダー レプリカを自動的に選択します。
    -   読み取り要求の推定結果が値[`tidb_adaptive_closest_read_threshold`](/system-variables.md#tidb_adaptive_closest_read_threshold-new-in-v630)未満の場合、TiDB は読み取り操作用にリーダー レプリカのみを選択できます。

<CustomContent platform="tidb">

> **ノート：**
>
> `tidb_replica_read`の値が`closest-replicas`または`closest-adaptive`に設定されている場合は、指定された構成に従って可用性ゾーン全体にレプリカが分散されるようにクラスターを構成する必要があります。 PD 用に`location-labels`構成し、TiDB および TiKV 用に正しい`labels`を設定するには、 [トポロジ ラベルごとにレプリカをスケジュールする](/schedule-replicas-by-topology-labels.md)を参照してください。 TiDB は、同じアベイラビリティ ゾーン内の TiKV ノードと一致する`zone`ラベルに依存するため、 `zone`ラベルが PD の`location-labels`に含まれ、 `zone`が各 TiDB および TiKV ノードの構成に含まれていることを確認する必要があります。クラスターがTiDB Operatorを使用してデプロイされている場合は、 [データの高可用性](https://docs.pingcap.com/tidb-in-kubernetes/v1.4/configure-a-tidb-cluster#high-availability-of-data)を参照してください。

</CustomContent>

## 実施メカニズム {#implementation-mechanism}

Follower Read機能が導入される前は、TiDB は強力なリーダーの原則を適用し、すべての読み取りおよび書き込み要求をリージョンのリーダー ノードに送信して処理していました。 TiKV はリージョンを複数の物理ノードに均等に分散できますが、リージョンごとに、リーダーのみが外部サービスを提供できます。他のフォロワーは、読み取り要求を処理するために何もできませんが、常にリーダーからレプリケートされたデータを受信し、フェイルオーバーの場合にリーダーを選択するための投票の準備をします。

線形化可能性に違反したり、TiDB のスナップショット分離に影響を与えたりすることなく、フォロワー ノードでデータを読み取ることができるようにするには、リーダーでコミットされた最新のデータを読み取り要求で読み取ることができるように、フォロワー ノードでRaftプロトコルの`ReadIndex`を使用する必要があります。 TiDB レベルでは、Follower Read機能は、負荷分散ポリシーに基づいて、リージョンの読み取り要求をフォロワー レプリカに送信するだけで済みます。

### 強力な一貫性のある読み取り {#strongly-consistent-reads}

フォロワー ノードが読み取り要求を処理するとき、最初にRaftプロトコルの`ReadIndex`を使用してリージョンのリーダーと対話し、現在のRaftグループの最新のコミット インデックスを取得します。リーダーの最新のコミット インデックスがフォロワーにローカルに適用された後、読み取り要求の処理が開始されます。

### Followerレプリカ選択戦略 {#follower-replica-selection-strategy}

Follower Read機能は TiDB のスナップショット分離トランザクション分離レベルに影響を与えないため、TiDB はラウンドロビン戦略を採用してフォロワー レプリカを選択します。現在、コプロセッサー要求の場合、 Follower Readロード・バランシング・ポリシーの粒度は接続レベルです。特定のリージョンに接続された TiDB クライアントの場合、選択されたフォロワーは固定され、失敗した場合、またはスケジューリング ポリシーが調整された場合にのみ切り替えられます。

ただし、ポイント クエリなどの非コプロセッサ リクエストの場合、 Follower Readロード バランシング ポリシーの粒度はトランザクション レベルになります。特定のリージョンでの TiDB トランザクションの場合、選択されたフォロワーは固定され、失敗した場合、またはスケジューリング ポリシーが調整された場合にのみ切り替えられます。