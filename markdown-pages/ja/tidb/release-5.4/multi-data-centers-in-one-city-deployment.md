---
title: Multiple Data Centers in One City Deployment
summary: Learn the deployment solution to multi-data centers in one city.
---

# 1 つの地域展開における複数のデータセンター {#multiple-data-centers-in-one-city-deployment}

NewSQLデータベースとして、TiDBは従来のリレーショナルデータベースの最高の機能とNoSQLデータベースのスケーラビリティを組み合わせており、データセンター（DC）全体で高可用性を実現します。このドキュメントでは、1つの都市に複数のDCを導入する方法を紹介します。

## いかだプロトコル {#raft-protocol}

Raftは、分散コンセンサスアルゴリズムです。このアルゴリズムを使用すると、TiDBクラスタのコンポーネントの中でPDとTiKVの両方が、データのディザスタリカバリを実現します。これは、次のメカニズムによって実装されます。

-   Raftメンバーの重要な役割は、ログレプリケーションを実行し、ステートマシンとして機能することです。 Raftメンバーの中で、データ複製はログを複製することによって実装されます。いかだメンバーは、サービスを提供するリーダーを選出するために、さまざまな条件で自分の状態を変更します。
-   Raftは、多数決プロトコルに従う投票システムです。ラフトグループでは、メンバーが過半数の票を獲得すると、メンバーシップがリーダーに変わります。つまり、ノードの大部分がRaftグループに残っている場合、サービスを提供するリーダーを選出できます。

Raftの信頼性を活用するには、実際の展開シナリオで次の条件を満たす必要があります。

-   1台のサーバーに障害が発生した場合に備えて、少なくとも3台のサーバーを使用してください。
-   1つのラックに障害が発生した場合に備えて、少なくとも3つのラックを使用してください。
-   1つのDCに障害が発生した場合に備えて、少なくとも3つのDCを使用してください。
-   1つの都市でデータの安全性の問題が発生した場合に備えて、少なくとも3つの都市にTiDBをデプロイします。

ネイティブRaftプロトコルは、偶数のレプリカを適切にサポートしていません。都市間のネットワーク遅延の影響を考慮すると、同じ都市にある3つのDCが、可用性が高く、災害に強いRaftの展開に最適なソリューションになる可能性があります。

## 1つの都市展開における3つのDC {#three-dcs-in-one-city-deployment}

TiDBクラスターは、同じ都市の3つのDCに展開できます。このソリューションでは、3つのDC間でのデータ複製は、クラスタ内のRaftプロトコルを使用して実装されます。これらの3つのDCは、読み取りサービスと書き込みサービスを同時に提供できます。 1つのDCに障害が発生しても、データの整合性は影響を受けません。

### シンプルなアーキテクチャ {#simple-architecture}

TiDB、TiKV、およびPDは、3つのDCに分散されています。これは、最も一般的な展開であり、可用性が最も高くなっています。

![3-DC Deployment Architecture](https://docs-download.pingcap.com/media/images/docs/deploy-3dc.png)

**利点：**

-   すべてのレプリカは、高可用性とディザスタリカバリ機能を備えた3つのDCに分散されています。
-   1つのDCがダウンしてもデータは失われません（RPO = 0）。
-   1つのDCがダウンしている場合でも、他の2つのDCは自動的にリーダーの選出を開始し、妥当な時間内（ほとんどの場合20秒以内）にサービスを自動的に再開します。詳細については、次の図を参照してください。

![Disaster Recovery for 3-DC Deployment](https://docs-download.pingcap.com/media/images/docs/deploy-3dc-dr.png)

**短所：**

パフォーマンスは、ネットワーク遅延の影響を受ける可能性があります。

-   書き込みの場合、すべてのデータを少なくとも2つのDCに複製する必要があります。 TiDBは書き込みに2フェーズコミットを使用するため、書き込みレイテンシは2つのDC間のネットワークのレイテンシの少なくとも2倍になります。
-   リーダーが読み取り要求を送信するTiDBノードと同じDCにない場合、読み取りパフォーマンスはネットワーク遅延の影響も受けます。
-   各TiDBトランザクションは、PDリーダーからTimeStamp Oracle（TSO）を取得する必要があります。したがって、TiDBリーダーとPDリーダーが同じDCにない場合、書き込み要求のある各トランザクションはTSOを2回取得する必要があるため、トランザクションのパフォーマンスもネットワーク遅延の影響を受けます。

### 最適化されたアーキテクチャ {#optimized-architecture}

3つのDCすべてがアプリケーションにサービスを提供する必要がない場合は、すべての要求を1つのDCにディスパッチし、すべてのTiKVリージョンリーダーとPDリーダーを同じDCに移行するようにスケジューリングポリシーを構成できます。このように、TSOの取得もTiKVリージョンの読み取りも、DC間のネットワーク遅延の影響を受けません。このDCがダウンしている場合、PDリーダーとTiKVリージョンリーダーが他の存続しているDCで自動的に選出され、まだ生きているDCにリクエストを切り替える必要があります。

![Read Performance Optimized 3-DC Deployment](https://docs-download.pingcap.com/media/images/docs/deploy-3dc-optimize.png)

**利点：**

クラスタの読み取りパフォーマンスとTSOを取得する機能が向上します。スケジューリングポリシーの構成テンプレートは次のとおりです。

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
> TiDB 5.2以降、 `label-property`構成はデフォルトでサポートされていません。レプリカポリシーを設定するには、 [配置ルール](/configure-placement-rules.md)を使用します。

**短所：**

-   書き込みシナリオは、DC間のネットワーク遅延の影響を受けます。これは、Raftが多数決プロトコルに従い、書き込まれたすべてのデータを少なくとも2つのDCに複製する必要があるためです。
-   サービスを提供するTiDBサーバーは1つのDCにのみ存在します。
-   すべてのアプリケーショントラフィックは1つのDCによって処理され、パフォーマンスはそのDCのネットワーク帯域幅のプレッシャーによって制限されます。
-   TSOを取得する機能と読み取りパフォーマンスは、PDサーバーとTiKVサーバーがアプリケーショントラフィックを処理するDCで稼働しているかどうかによって影響を受けます。これらのサーバーがダウンしている場合でも、アプリケーションはクロスセンターネットワーク遅延の影響を受けます。

### 展開例 {#deployment-example}

このセクションでは、トポロジの例を示し、TiKVラベルとTiKVラベルの計画を紹介します。

#### トポロジーの例 {#topology-example}

次の例では、3つのDC（IDC1、IDC2、およびIDC3）が1つの都市にあると想定しています。各IDCには2セットのラックがあり、各ラックには3台のサーバーがあります。この例では、ハイブリッド展開または複数のインスタンスが1台のマシンに展開されるシナリオは無視されます。 1つの都市の3つのDCにTiDBクラスタ（3つのレプリカ）を展開する方法は次のとおりです。

![3-DC in One City](https://docs-download.pingcap.com/media/images/docs/multi-data-centers-in-one-city-deployment-sample.png)

#### TiKVラベル {#tikv-labels}

TiKVはマルチラフトシステムであり、データはリージョンに分割され、各リージョンのサイズはデフォルトで96MBです。各リージョンの3つのレプリカがラフトグループを形成します。 3つのレプリカのTiDBクラスタの場合、リージョンレプリカの数はTiKVインスタンス番号に依存しないため、リージョンの3つのレプリカは3つのTiKVインスタンスにのみスケジュールされます。これは、クラスタがN個のTiKVインスタンスを持つようにスケールアウトされた場合でも、3つのレプリカのクラスタであることを意味します。

3つのレプリカのRaftグループは1つのレプリカ障害のみを許容するため、クラスタがN個のTiKVインスタンスを持つようにスケールアウトされた場合でも、このクラスタは1つのレプリカ障害のみを許容します。 2つの失敗したTiKVインスタンスにより、一部のリージョンでレプリカが失われ、このクラスタのデータが完全ではなくなる可能性があります。これらのリージョンからのデータにアクセスするSQLリクエストは失敗します。 N TiKVインスタンス間で2つの同時障害が発生する確率は、3つのTiKVインスタンス間で2つの同時障害が発生する確率よりもはるかに高くなります。これは、Multi-RaftシステムがスケールアウトされたTiKVインスタンスが多いほど、システムの可用性が低下することを意味します。

上記の制限により、 `label`はTiKVの位置情報を表すために使用されます。ラベル情報は、展開またはローリングアップグレード操作でTiKVスタートアップコンフィギュレーションファイルに更新されます。開始されたTiKVは、最新のラベル情報をPDに報告します。 PDは、ユーザー登録されたラベル名（ラベルメタデータ）とTiKVトポロジに基づいて、リージョンレプリカを最適にスケジュールし、システムの可用性を向上させます。

#### TiKVラベルの計画例 {#tikv-labels-planning-example}

システムの可用性とディザスタリカバリを改善するには、既存の物理リソースとディザスタリカバリ機能に応じてTiKVラベルを設計および計画する必要があります。また、計画されたトポロジに従って、クラスタ初期化構成ファイルで構成する必要があります。

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

上記の例では、 `zone`はレプリカ（サンプルクラスタの3つのレプリカ）の分離を制御する論理アベイラビリティーゾーンレイヤーです。

将来的にDCがスケールアウトされる可能性があることを考慮すると、 `rack`層ラベル構造（ `dc` ）は直接採用されて`host`ません。 `d2` 、および`d3`をスケールアウトする場合は、対応するアベイラビリティーゾーンのDCをスケールアウトし、対応するDCのラックをスケールアウトするだけで`d4`ます。

この3層のラベル構造を直接採用する場合、DCをスケールアウトした後、新しいラベルを適用する必要があり、TiKVのデータを再調整する必要があります。

### 高可用性とディザスタリカバリ分析 {#high-availability-and-disaster-recovery-analysis}

1つの都市展開における複数のDCは、1つのDCに障害が発生した場合に、クラスタが手動の介入なしにサービスを自動的に回復できることを保証できます。データの一貫性も保証されます。スケジューリングポリシーはパフォーマンスを最適化するために使用されますが、障害が発生した場合、これらのポリシーはパフォーマンスよりも可用性を優先することに注意してください。
