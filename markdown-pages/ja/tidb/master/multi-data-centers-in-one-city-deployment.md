---
title: Multiple Availability Zones in One Region Deployment
summary: 1 つのリージョン内の複数の可用性ゾーンへのデプロイメント ソリューションについて学習します。
---

# 1 つのリージョンに複数のアベイラビリティ ゾーンを展開 {#multiple-availability-zones-in-one-region-deployment}

<!-- Localization note for TiDB:

- English: use distributed SQL, and start to emphasize HTAP
- Chinese: can keep "NewSQL" and emphasize one-stop real-time HTAP ("一栈式实时 HTAP")
- Japanese: use NewSQL because it is well-recognized

-->

分散 SQL データベースである TiDB は、従来のリレーショナル データベースの優れた機能と NoSQL データベースのスケーラビリティを組み合わせ、可用性ゾーン (AZ) 全体で高い可用性を実現します。このドキュメントでは、1 つのリージョンに複数の AZ を展開する方法について説明します。

このドキュメントの「リージョン」という用語は地理的なエリアを指し、大文字の「リージョン」は TiKV のデータstorageの基本単位を指します。「AZ」はリージョン内の隔離された場所を指し、各リージョンには複数の AZ があります。このドキュメントで説明されているソリューションは、1 つの都市に複数のデータ センターがあるシナリオにも適用されます。

## Raftプロトコル {#raft-protocol}

Raftは分散コンセンサス アルゴリズムです。このアルゴリズムを使用すると、TiDB クラスターのコンポーネントのうち PD と TiKV の両方が、次のメカニズムを通じて実装されるデータの災害復旧を実現します。

-   Raftメンバーの重要な役割は、ログのレプリケーションを実行し、ステート マシンとして機能することです。Raft メンバー間では、ログを複製することでデータのレプリケーションが実行されます。Raft メンバーはさまざまな状況で自身の状態を変更し、サービスを提供するリーダーを選出します。
-   Raftは多数決プロトコルに従う投票システムです。Raft グループでは、RaftRaftにノードの過半数が残っている場合、サービスを提供するリーダーを選出できます。

Raft の信頼性を活用するには、実際の展開シナリオで次の条件を満たす必要があります。

-   1 台のサーバーに障害が発生した場合に備えて、少なくとも 3 台のサーバーを使用します。
-   1 つのラックが故障した場合に備えて、少なくとも 3 つのラックを使用してください。
-   1 つの AZ に障害が発生した場合に備えて、少なくとも 3 つの AZ を使用します。
-   1 つのリージョンでデータの安全性の問題が発生した場合に備えて、少なくとも 3 つのリージョンに TiDBをデプロイ。

ネイティブのRaftプロトコルは、偶数個のレプリカを適切にサポートしていません。リージョン間のネットワークレイテンシーの影響を考慮すると、可用性が高く災害耐性のあるRaftデプロイメントには、同じリージョンに 3 つの AZ を配置することが最も適切なソリューションである可能性があります。

## 1 つのリージョンに 3 つの AZ を配置 {#three-azs-in-one-region-deployment}

TiDB クラスターは、同じリージョン内の 3 つの AZ にデプロイできます。このソリューションでは、クラスター内でRaftプロトコルを使用して 3 つの AZ 間のデータ レプリケーションが実装されます。これらの 3 つの AZ は、読み取りと書き込みのサービスを同時に提供できます。1 つの AZ に障害が発生しても、データの一貫性は影響を受けません。

### シンプルなアーキテクチャ {#simple-architecture}

TiDB、TiKV、PD は 3 つの AZ に分散されており、これは最も一般的な展開であり、可用性が最も高くなります。

![3-AZ Deployment Architecture](https://download.pingcap.com/images/docs/deploy-3dc.png)

**利点:**

-   すべてのレプリカは 3 つの AZ に分散されており、高い可用性と災害復旧機能を備えています。
-   1 つの AZ がダウンしてもデータは失われません (RPO = 0)。
-   1 つの AZ がダウンした場合でも、他の 2 つの AZ が自動的にリーダー選出を開始し、一定期間内 (ほとんどの場合 20 秒以内) にサービスを自動的に再開します。詳細については、次の図を参照してください。

![Disaster Recovery for 3-AZ Deployment](https://download.pingcap.com/images/docs/deploy-3dc-dr.png)

**デメリット:**

パフォーマンスはネットワークレイテンシーによって影響を受ける可能性があります。

-   書き込みの場合、すべてのデータを少なくとも 2 つの AZ に複製する必要があります。TiDB は書き込みに 2 フェーズ コミットを使用するため、書き込みのレイテンシーは2 つの AZ 間のネットワークのレイテンシーの2 倍以上になります。
-   リーダーが読み取り要求を送信する TiDB ノードと同じ AZ にない場合、読み取りパフォーマンスはネットワークレイテンシーによっても影響を受けます。
-   各 TiDB トランザクションは、PD リーダーから TimeStamp Oracle (TSO) を取得する必要があります。そのため、TiDB リーダーと PD リーダーが同じ AZ にない場合、書き込み要求を含む各トランザクションは TSO を 2 回取得する必要があるため、トランザクションのパフォーマンスはネットワークレイテンシーによっても影響を受けます。

### 最適化されたアーキテクチャ {#optimized-architecture}

3 つの AZ すべてがアプリケーションにサービスを提供する必要がない場合は、すべてのリクエストを 1 つの AZ にディスパッチし、TiKVリージョンリーダーと PD リーダーを同じ AZ に移行するようにスケジュール ポリシーを設定できます。このようにすると、TSO の取得も TiKV リージョンの読み取りも、AZ 間のネットワークレイテンシーの影響を受けません。この AZ がダウンしている場合は、PD リーダーと TiKVリージョンリーダーが他の存続している AZ で自動的に選出されるため、まだ存続している AZ にリクエストを切り替えるだけで済みます。

![Read Performance Optimized 3-AZ Deployment](https://download.pingcap.com/images/docs/deploy-3dc-optimize.png)

**利点:**

クラスターの読み取りパフォーマンスと TSO を取得する機能が向上しました。スケジューリング ポリシーの構成テンプレートは次のとおりです。

```shell
-- Evicts all leaders of other AZs to the AZ that provides services to the application.
config set label-property reject-leader LabelName labelValue

-- Migrates PD leaders and sets priority.
member leader transfer pdName1
member leader_priority pdName1 5
member leader_priority pdName2 4
member leader_priority pdName3 3
```

> **注記：**
>
> TiDB v5.2 以降では、 `label-property`構成はデフォルトでサポートされません。レプリカ ポリシーを設定するには、 [配置ルール](/configure-placement-rules.md)を使用します。

**デメリット:**

-   書き込みシナリオは、AZ 間のネットワークレイテンシーの影響を受けます。これは、 Raft が多数決プロトコルに従い、書き込まれたすべてのデータを少なくとも 2 つの AZ に複製する必要があるためです。
-   サービスを提供する TiDBサーバーは1 つの AZ にのみ存在します。
-   すべてのアプリケーション トラフィックは 1 つの AZ によって処理され、パフォーマンスはその AZ のネットワーク帯域幅の圧力によって制限されます。
-   TSO を取得する機能と読み取りパフォーマンスは、アプリケーション トラフィックを処理する AZ で PDサーバーと TiKVサーバーが稼働しているかどうかによって影響を受けます。これらのサーバーがダウンしている場合でも、アプリケーションはセンター間ネットワークのレイテンシーの影響を受けます。

### 導入例 {#deployment-example}

このセクションでは、トポロジの例を示し、TiKV ラベルと TiKV ラベルの計画について説明します。

#### トポロジーの例 {#topology-example}

次の例では、3 つの AZ (AZ1、AZ2、AZ3) が 1 つのリージョンに配置され、各 AZ に 2 セットのラックがあり、各ラックに 3 台のサーバーがあることを前提としています。この例では、ハイブリッド展開、つまり 1 台のマシンに複数のインスタンスが展開されるシナリオは無視されます。1 つのリージョンの 3 つの AZ に TiDB クラスター (3 つのレプリカ) を展開すると、次のようになります。

![3-AZ in One Region](https://download.pingcap.com/images/docs/multi-data-centers-in-one-city-deployment-sample.png)

#### TiKVラベル {#tikv-labels}

TiKV は、データがリージョンに分割され、各リージョンのサイズがデフォルトで 96 MB である Multi-Raft システムです。各リージョンの 3 つのレプリカがRaftグループを形成します。3 つのレプリカの TiDB クラスターの場合、リージョンのレプリカの数は TiKV インスタンスの数とは無関係であるため、リージョンの 3 つのレプリカは 3 つの TiKV インスタンスにのみスケジュールされます。つまり、クラスターが N 個の TiKV インスタンスにスケールアウトされた場合でも、クラスターは 3 つのレプリカのクラスターのままです。

3 つのレプリカのRaftグループが許容するレプリカ障害は 1 つだけなので、クラスターがスケールアウトされて N 個の TiKV インスタンスを持つようになったとしても、このクラスターが許容するレプリカ障害は 1 つだけです。2 つの TiKV インスタンスが失敗すると、一部のリージョンでレプリカが失われ、このクラスターのデータが完全ではなくなります。これらのリージョンのデータにアクセスする SQL 要求は失敗します。N 個の TiKV インスタンス間で同時に 2 つの障害が発生する確率は、3 個の TiKV インスタンス間で同時に 2 つの障害が発生する確率よりもはるかに高くなります。つまり、Multi-Raft システムをスケールアウトして TiKV インスタンスの数を増やすほど、システムの可用性は低くなります。

上記の制限のため、TiKV の位置情報の記述には`label`使用されます。ラベル情報は、デプロイメントまたはローリング アップグレード操作によって TiKV スタートアップ構成ファイルに更新されます。起動された TiKV は、最新のラベル情報を PD に報告します。PD は、ユーザーが登録したラベル名 (ラベル メタデータ) と TiKV トポロジに基づいて、リージョンレプリカを最適にスケジュールし、システムの可用性を向上させます。

#### TiKVラベル計画例 {#tikv-labels-planning-example}

システムの可用性と災害復旧を改善するには、既存の物理リソースと災害復旧機能に応じて TiKV ラベルを設計および計画する必要があります。また、計画されたトポロジに応じて、クラスター初期化構成ファイルを編集する必要があります。

```ini
server_configs:
  pd:
    replication.location-labels: ["zone","az","rack","host"]

tikv_servers:
  - host: 10.63.10.30
    config:
      server.labels: { zone: "z1", az: "az1", rack: "r1", host: "30" }
  - host: 10.63.10.31
    config:
      server.labels: { zone: "z1", az: "az1", rack: "r1", host: "31" }
  - host: 10.63.10.32
    config:
      server.labels: { zone: "z1", az: "az1", rack: "r2", host: "32" }
  - host: 10.63.10.33
    config:
      server.labels: { zone: "z1", az: "az1", rack: "r2", host: "33" }

  - host: 10.63.10.34
    config:
      server.labels: { zone: "z2", az: "az2", rack: "r1", host: "34" }
  - host: 10.63.10.35
    config:
      server.labels: { zone: "z2", az: "az2", rack: "r1", host: "35" }
  - host: 10.63.10.36
    config:
      server.labels: { zone: "z2", az: "az2", rack: "r2", host: "36" }
  - host: 10.63.10.37
    config:
      server.labels: { zone: "z2", az: "az2", rack: "r2", host: "37" }

  - host: 10.63.10.38
    config:
      server.labels: { zone: "z3", az: "az3", rack: "r1", host: "38" }
  - host: 10.63.10.39
    config:
      server.labels: { zone: "z3", az: "az3", rack: "r1", host: "39" }
  - host: 10.63.10.40
    config:
      server.labels: { zone: "z3", az: "az3", rack: "r2", host: "40" }
  - host: 10.63.10.41
    config:
      server.labels: { zone: "z3", az: "az3", rack: "r2", host: "41" }
```

前の例では、 `zone`レプリカの分離を制御する論理可用性ゾーンレイヤーです (サンプル クラスター内のレプリカは 3 つ)。

将来的に AZ をスケールアウトする可能性を考慮し、3 層のラベル構造 ( `az` 、 `rack` 、 `host` ) はそのまま採用していません。 `AZ2` 、 `AZ3` 、 `AZ4`をスケールアウトすると仮定すると、対応するアベイラビリティゾーンの AZ をスケールアウトし、対応する AZ のラックをスケールアウトするだけで済みます。

この 3 層のラベル構造を直接採用すると、AZ をスケールアウトした後に、新しいラベルを適用し、TiKV 内のデータを再調整する必要がある場合があります。

### 高可用性と災害復旧分析 {#high-availability-and-disaster-recovery-analysis}

1 つのリージョンに複数の AZ を展開すると、1 つの AZ に障害が発生した場合でも、手動による介入なしにクラスターが自動的にサービスを回復できることが保証されます。データの一貫性も保証されます。スケジュール ポリシーはパフォーマンスを最適化するために使用されますが、障害が発生した場合、これらのポリシーはパフォーマンスよりも可用性を優先することに注意してください。
