---
title: Multiple Data Centers in One City Deployment
summary: Learn the deployment solution to multi-data centers in one city.
---

# 1 つの地域展開における複数のデータセンター {#multiple-data-centers-in-one-city-deployment}

NewSQL データベースとして、TiDB は従来のリレーショナル データベースの最高の機能と NoSQL データベースのスケーラビリティを組み合わせ、データ センター (DC) 全体で高い可用性を実現します。このドキュメントでは、1 つの都市に複数の DC を配置する方法について説明します。

## Raftプロトコル {#raft-protocol}

Raftは分散コンセンサス アルゴリズムです。このアルゴリズムを使用して、TiDB クラスターのコンポーネントの中で PD と TiKV の両方がデータのディザスター リカバリーを実現します。これは、次のメカニズムによって実装されます。

-   Raftメンバーの重要な役割は、ログのレプリケーションを実行し、ステート マシンとして機能することです。 Raftメンバー間では、ログを複製することでデータ複製が実装されます。 Raftメンバーは、サービスを提供するリーダーを選出するために、さまざまな条件で自身の状態を変更します。
-   Raftは、多数決プロトコルに従う投票システムです。 Raftグループでは、メンバーが過半数の票を獲得すると、そのメンバーシップはリーダーに変わります。つまり、大多数のノードがRaftグループに残っている場合、サービスを提供するリーダーを選出できます。

Raft の信頼性を利用するには、実際の展開シナリオで次の条件を満たす必要があります。

-   1 台のサーバーに障害が発生した場合に備えて、少なくとも 3 台のサーバーを使用してください。
-   1 つのラックが故障した場合に備えて、少なくとも 3 つのラックを使用してください。
-   1 つの DC に障害が発生した場合に備えて、少なくとも 3 つの DC を使用します。
-   1 つの都市でデータの安全性の問題が発生した場合に備えて、少なくとも 3 つの都市に TiDB をデプロイします。

ネイティブのRaftプロトコルは、偶数のレプリカを適切にサポートしていません。都市間のネットワークレイテンシーの影響を考慮すると、同じ都市にある 3 つの DC は、可用性が高く災害に強いRaft展開に最適なソリューションである可能性があります。

## 1 つの都市展開で 3 つの DC {#three-dcs-in-one-city-deployment}

TiDB クラスターは、同じ都市の 3 つの DC にデプロイできます。このソリューションでは、クラスター内のRaftプロトコルを使用して、3 つの DC 間のデータ レプリケーションが実装されます。これら 3 つの DC は、読み取りサービスと書き込みサービスを同時に提供できます。 1 つの DC に障害が発生しても、データの整合性は影響を受けません。

### シンプルなアーキテクチャ {#simple-architecture}

TiDB、TiKV、および PD は 3 つの DC に分散されます。これは、最も高い可用性を備えた最も一般的な展開です。

![3-DC Deployment Architecture](https://docs-download.pingcap.com/media/images/docs/deploy-3dc.png)

**利点:**

-   すべてのレプリカは 3 つの DC に分散され、高可用性と災害復旧機能を備えています。
-   1 つの DC がダウンしても (RPO = 0)、データが失われることはありません。
-   1 つの DC がダウンしても、他の 2 つの DC は自動的にリーダーの選出を開始し、妥当な時間内 (ほとんどの場合 20 秒以内) にサービスを自動的に再開します。詳細については、次の図を参照してください。

![Disaster Recovery for 3-DC Deployment](https://docs-download.pingcap.com/media/images/docs/deploy-3dc-dr.png)

**短所:**

パフォーマンスは、ネットワークレイテンシーの影響を受ける可能性があります。

-   書き込みの場合、すべてのデータを少なくとも 2 つの DC にレプリケートする必要があります。 TiDB は書き込みに 2 フェーズ コミットを使用するため、書き込みのレイテンシー時間は、2 つの DC 間のネットワークのレイテンシーの少なくとも 2 倍になります。
-   リーダーが読み取り要求を送信する TiDB ノードと同じ DC にない場合、読み取りパフォーマンスはネットワークレイテンシーの影響も受けます。
-   各 TiDB トランザクションは、PD リーダーから TimeStamp Oracle (TSO) を取得する必要があります。そのため、TiDB リーダーと PD リーダーが同じ DC にない場合、書き込み要求を伴う各トランザクションは TSO を 2 回取得する必要があるため、トランザクションのパフォーマンスもネットワークレイテンシーの影響を受けます。

### 最適化されたアーキテクチャ {#optimized-architecture}

3 つの DC のすべてがアプリケーションにサービスを提供する必要がない場合は、すべての要求を 1 つの DC にディスパッチし、すべての TiKVリージョンリーダーと PD リーダーを同じ DC に移行するようにスケジューリング ポリシーを構成できます。このようにして、TSO の取得も TiKV リージョンの読み取りも、DC 間のネットワークレイテンシーの影響を受けません。この DC がダウンしている場合、PD リーダーと TiKVリージョンリーダーは、他の生き残った DC で自動的に選出され、まだ生きている DC に要求を切り替えるだけで済みます。

![Read Performance Optimized 3-DC Deployment](https://docs-download.pingcap.com/media/images/docs/deploy-3dc-optimize.png)

**利点:**

クラスターの読み取りパフォーマンスと TSO を取得する機能が改善されました。スケジューリング ポリシーの構成テンプレートは次のとおりです。

```shell
-- Evicts all leaders of other DCs to the DC that provides services to the application.
config set label-property reject-leader LabelName labelValue

-- Migrates PD leaders and sets priority.
member leader transfer pdName1
member leader_priority pdName1 5
member leader_priority pdName2 4
member leader_priority pdName3 3
```

> **ノート：**
>
> TiDB 5.2 以降、デフォルトでは`label-property`構成はサポートされていません。レプリカ ポリシーを設定するには、 [配置ルール](/configure-placement-rules.md)を使用します。

**短所:**

-   書き込みシナリオは、DC 間のネットワークレイテンシーの影響を受けます。これは、 Raftが多数決プロトコルに従い、書き込まれたすべてのデータを少なくとも 2 つの DC に複製する必要があるためです。
-   サービスを提供する TiDBサーバーは 1 つの DC にのみ存在します。
-   すべてのアプリケーション トラフィックは 1 つの DC によって処理され、パフォーマンスはその DC のネットワーク帯域幅のプレッシャーによって制限されます。
-   TSO を取得する機能と読み取りパフォーマンスは、アプリケーション トラフィックを処理する DC で PDサーバーと TiKVサーバーが稼働しているかどうかによって影響を受けます。これらのサーバーがダウンした場合でも、アプリケーションはセンター間のネットワークレイテンシーの影響を受けます。

### 導入例 {#deployment-example}

このセクションでは、トポロジの例を示し、TiKV ラベルと TiKV ラベルの計画を紹介します。

#### トポロジの例 {#topology-example}

次の例では、3 つの DC (IDC1、IDC2、および IDC3) が 1 つの都市にあると想定しています。各 IDC には 2 セットのラックがあり、各ラックには 3 台のサーバーがあります。この例では、ハイブリッド デプロイまたは複数のインスタンスが 1 台のマシンにデプロイされるシナリオは無視されています。 1 つの都市の 3 つの DC での TiDB クラスター (3 つのレプリカ) の展開は次のとおりです。

![3-DC in One City](https://docs-download.pingcap.com/media/images/docs/multi-data-centers-in-one-city-deployment-sample.png)

#### TiKV ラベル {#tikv-labels}

TiKV は、データがリージョンに分割され、各リージョンのサイズがデフォルトで 96 MB である Multi-Raft システムです。各リージョンの 3 つのレプリカがRaftグループを形成します。 3 つのレプリカの TiDB クラスターの場合、リージョンレプリカの数は TiKV インスタンスの数とは無関係であるため、リージョンの 3 つのレプリカは 3 つの TiKV インスタンスに対してのみスケジュールされます。これは、クラスターが N 個の TiKV インスタンスを持つようにスケールアウトされたとしても、それは 3 つのレプリカのクラスターであることを意味します。

3 つのレプリカのRaftグループは 1 つのレプリカの障害のみを許容するため、クラスターが N TiKV インスタンスを持つようにスケールアウトされた場合でも、このクラスターは 1 つのレプリカの障害のみを許容します。 2 つの TiKV インスタンスが失敗すると、一部のリージョンでレプリカが失われ、このクラスター内のデータが完全ではなくなる可能性があります。これらのリージョンからデータにアクセスする SQL リクエストは失敗します。 N 個の TiKV インスタンス間で 2 つの同時障害が発生する確率は、3 つの TiKV インスタンス間で 2 つの同時障害が発生する確率よりもはるかに高くなります。これは、Multi-Raft システムがスケールアウトされる TiKV インスタンスが多いほど、システムの可用性が低下することを意味します。

上記の制限により、TiKV の位置情報の記述には`label`を使用します。ラベル情報は、展開またはローリング アップグレード操作で TiKV 起動構成ファイルに更新されます。起動した TiKV は、最新のラベル情報を PD に報告します。ユーザーが登録したラベル名 (ラベル メタデータ) と TiKV トポロジに基づいて、PD はリージョンレプリカを最適にスケジュールし、システムの可用性を向上させます。

#### TiKVラベルの企画例 {#tikv-labels-planning-example}

システムの可用性と災害復旧を改善するには、既存の物理リソースと災害復旧機能に従って TiKV ラベルを設計および計画する必要があります。また、計画されたトポロジに従って、クラスターの初期化構成ファイルで構成する必要があります。

```ini
server_configs:
  pd:
    replication.location-labels: ["zone","dc","rack","host"]

tikv_servers:
  - host: 10.63.10.30
    config:
      server.labels: { zone: "z1", dc: "d1", rack: "r1", host: "30" }
  - host: 10.63.10.31
    config:
      server.labels: { zone: "z1", dc: "d1", rack: "r1", host: "31" }
  - host: 10.63.10.32
    config:
      server.labels: { zone: "z1", dc: "d1", rack: "r2", host: "32" }
  - host: 10.63.10.33
    config:
      server.labels: { zone: "z1", dc: "d1", rack: "r2", host: "33" }
  - host: 10.63.10.34
    config:
      server.labels: { zone: "z2", dc: "d1", rack: "r1", host: "34" }
  - host: 10.63.10.35
    config:
      server.labels: { zone: "z2", dc: "d1", rack: "r1", host: "35" }
  - host: 10.63.10.36
    config:
      server.labels: { zone: "z2", dc: "d1", rack: "r2", host: "36" }
  - host: 10.63.10.37
    config:
      server.labels: { zone: "z2", dc: "d1", rack: "r2", host: "37" }
  - host: 10.63.10.38
    config:
      server.labels: { zone: "z3", dc: "d1", rack: "r1", host: "38" }
  - host: 10.63.10.39
    config:
      server.labels: { zone: "z3", dc: "d1", rack: "r1", host: "39" }
  - host: 10.63.10.40
    config:
      server.labels: { zone: "z3", dc: "d1", rack: "r2", host: "40" }
  - host: 10.63.10.41
    config:
      server.labels: { zone: "z3", dc: "d1", rack: "r2", host: "41" }
```

上記の例では、 `zone`はレプリカ (例のクラスターでは 3 つのレプリカ) の分離を制御する論理的な可用性ゾーンレイヤーです。

将来的に DC がスケールアウトされる可能性を考慮して、3 層ラベル構造 ( `dc` 、 `rack` 、 `host` ) は直接採用されていません。 `d2` 、 `d3` 、および`d4`をスケールアウトすると仮定すると、対応する可用性ゾーンの DC をスケールアウトし、対応する DC のラックをスケールアウトするだけで済みます。

この 3 層ラベル構造を直接採用した場合、DC をスケールアウトした後、新しいラベルを適用し、TiKV のデータを再調整する必要がある場合があります。

### 高可用性と災害復旧の分析 {#high-availability-and-disaster-recovery-analysis}

1 つの都市に複数の DC を配置することで、1 つの DC に障害が発生した場合でも、クラスターは手動の介入なしにサービスを自動的に回復できることが保証されます。データの一貫性も保証されます。スケジュール ポリシーはパフォーマンスを最適化するために使用されますが、障害が発生した場合、これらのポリシーはパフォーマンスよりも可用性を優先することに注意してください。
