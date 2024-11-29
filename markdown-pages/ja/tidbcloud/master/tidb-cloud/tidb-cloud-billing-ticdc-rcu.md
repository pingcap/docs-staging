---
title: Changefeed Billing
summary: TiDB Cloudの変更フィードに対する課金について説明します。
aliases: ['/tidbcloud/tidb-cloud-billing-tcu']
---

# チェンジフィード課金 {#changefeed-billing}

TiDB Cloud は、 [チェンジフィード](/tidb-cloud/changefeed-overview.md)の容量を TiCDC レプリケーション容量単位 (RCU) で測定します。クラスターに[チェンジフィードを作成する](/tidb-cloud/changefeed-overview.md#create-a-changefeed)設定すると、適切な仕様を選択できます。RCU が高いほど、レプリケーション パフォーマンスが向上します。これらの TiCDC 変更フィード RCU に対して料金が発生します。

## TiCDC RCU の数 {#number-of-ticdc-rcus}

次の表は、変更フィードの仕様と対応するレプリケーション パフォーマンスを示しています。

| 仕様       | 最大のレプリケーションパフォーマンス |
| -------- | ------------------ |
| 2 RCU    | 5,000行/秒           |
| 4 つの RCU | 10,000行/秒          |
| 8 RCU    | 20,000行/秒          |
| 16 RCU   | 40,000 行/秒         |
| 24 RCU   | 60,000行/秒          |
| 32 RCU   | 80,000行/秒          |
| 40 RCU   | 100,000行/秒         |

> **注記：**
>
> 上記のパフォーマンス データは参考用であり、シナリオによって異なる場合があります。本番環境で changefeed 機能を使用する前に、実際のワークロード テストを実施することを強くお勧めします。さらにサポートが必要な場合は、 [TiDB Cloudサポート](/tidb-cloud/tidb-cloud-support.md#get-support-for-a-cluster)お問い合わせください。

## 価格 {#price}

各 TiCDC RCU でサポートされているリージョンとTiDB Cloudの価格については、 [チェンジフィードコスト](https://www.pingcap.com/tidb-cloud-pricing-details/#changefeed-cost)参照してください。
