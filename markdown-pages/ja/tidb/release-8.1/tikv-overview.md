---
title: TiKV Overview
summary: TiKVstorageエンジンの概要。
---

# TiKVの概要 {#tikv-overview}

TiKV は分散型トランザクション キー値データベースであり、 ACID準拠のトランザクション API を提供します。RocksDB に保存される[Raftコンセンサスアルゴリズム](https://raft.github.io/raft.pdf)およびコンセンサス状態の実装により、TiKV は複数のレプリカ間のデータの一貫性と高可用性を保証します。TiDB 分散データベースのstorageレイヤーとして、TiKV は読み取りおよび書き込みサービスを提供し、アプリケーションから書き込まれたデータを永続化します。また、TiDB クラスターの統計データも保存します。

## アーキテクチャの概要 {#architecture-overview}

TiKV は、Google Spanner の設計に基づいて、マルチ ラフト グループ レプリカ メカニズムを実装します。リージョンは、キーと値のデータの移動の基本単位で、ストア内のデータ範囲を指します。各リージョンは複数のノードに複製されます。これらの複数のレプリカがRaftグループを形成します。リージョンのレプリカはピアと呼ばれます。通常、リージョンには 3 つのピアがあります。そのうちの 1 つがリーダーで、読み取りおよび書き込みサービスを提供します。PDコンポーネントは、すべてのリージョンのバランスを自動的に調整して、TiKV クラスター内のすべてのノード間で読み取りおよび書き込みスループットのバランスが保たれるようにします。PD と慎重に設計されたRaftグループにより、TiKV は水平方向のスケーラビリティに優れ、100 TB を超えるデータを簡単に保存できます。

![TiKV Architecture](https://download.pingcap.com/images/docs/tikv-arch.png)

### リージョンとRocksDB {#region-and-rocksdb}

各ストア内には RocksDB データベースがあり、ローカル ディスクにデータを保存します。すべてのリージョンデータは、各ストアの同じ RocksDB インスタンスに保存されます。Raft コンセンサス アルゴリズムに使用されるすべてのログは、各ストアの別の RocksDB インスタンスに保存されます。これは、シーケンシャル I/O のパフォーマンスがランダム I/O よりも優れているためです。異なる RocksDB インスタンスに Raffed ログとリージョンデータを保存すると、TiKV は Raffed ログと TiKV リージョンのすべてのデータ書き込み操作を 1 つの I/O 操作に統合して、パフォーマンスを向上させます。

### リージョンとRaft合意アルゴリズム {#region-and-raft-consensus-algorithm}

リージョンのレプリカ間のデータの一貫性は、 Raftコンセンサス アルゴリズムによって保証されます。リージョンのリーダーのみが書き込みサービスを提供でき、リージョンのレプリカの過半数にデータが書き込まれた場合にのみ、書き込み操作が成功します。

TiKV は、クラスター内の各リージョンに適切なサイズを維持しようとします。リージョンサイズは現在、デフォルトで 96 MiB です。このメカニズムは、PDコンポーネントがTiKV クラスター内のノード間でリージョンのバランスをとるのに役立ちます。リージョンのサイズがしきい値 (デフォルトでは 144 MiB) を超えると、TiKV はそれを 2 つ以上のリージョンに分割します。リージョンのサイズがしきい値 (デフォルトでは 20 MiB) より小さい場合、TiKV は 2 つの小さい隣接するリージョンを 1 つのリージョンに結合します。

PD がレプリカをある TiKV ノードから別の TiKV ノードに移動する場合、まずターゲット ノードにLearnerレプリカを追加します。LearnerレプリカのデータがLeaderレプリカのデータとほぼ同じになったら、PD はそれをFollowerレプリカに変更し、ソース ノードのFollowerレプリカを削除します。

Leaderレプリカをあるノードから別のノードに移動する場合も、同様のメカニズムが採用されています。違いは、LearnerレプリカがFollowerレプリカになった後、FollowerレプリカがLeaderとして自らを選出するための選挙を積極的に提案する「Leader転送」操作が行われることです。最後に、新しいLeaderがソース ノードの古いLeaderレプリカを削除します。

## 分散トランザクション {#distributed-transaction}

TiKV は分散トランザクションをサポートします。ユーザー (または TiDB) は、同じリージョンに属しているかどうかを気にせずに、複数のキーと値のペアを書き込むことができます。TiKV は 2 フェーズ コミットを使用してACID制約を実現します。詳細については[TiDB 楽観的トランザクションモデル](/optimistic-transaction.md)参照してください。

## TiKVコプロセッサー {#tikv-coprocessor}

TiDB は、一部のデータ計算ロジックを TiKVコプロセッサーにプッシュします。TiKVコプロセッサーは、各リージョンの計算を処理します。TiKVコプロセッサーに送信される各リクエストには、1 つのリージョンのデータのみが含まれます。