---
title: High Availability FAQs
summary: TiDB の高可用性に関連する FAQ について説明します。
---

# 高可用性に関するよくある質問 {#high-availability-faqs}

このドキュメントでは、TiDB の高可用性に関連する FAQ をまとめています。

## TiDB はどのように強力に一貫性を保ちますか? {#how-is-tidb-strongly-consistent}

ノード障害が発生した場合でも回復可能性を確保するために、データは[Raftコンセンサスアルゴリズム](https://raft.github.io/)使用して TiKV ノード間で冗長的に複製されます。

最レイヤーでは、TiKV はレプリケーション ログ + ステート マシンのモデルを使用してデータを複製します。書き込み要求の場合、データはLeaderに書き込まれ、Leaderはログの形式でコマンドをフォロワーに複製します。クラスター内の大多数のノードがこのログを受信すると、このログはコミットされ、ステート マシンに適用できます。

## 地理的に分散した 3 つのデータ センターを展開する場合に推奨されるソリューションは何ですか? {#what-s-the-recommended-solution-for-the-deployment-of-three-geo-distributed-data-centers}

TiDB のアーキテクチャは、地理的分散とマルチアクティブ性を完全にサポートすることを保証します。データとアプリケーションは常時オンです。すべての停止はアプリケーションに対して透過的であり、データは自動的に回復できます。操作はネットワークのレイテンシーと安定性に依存します。レイテンシーは5 ミリ秒以内に抑えることをお勧めします。現在、TiDB には同様のユースケースがすでにあります。詳細については、 [2 つの地域に配置された 3 つのデータ センター](/three-data-centers-in-two-cities-deployment.md)参照してください。
