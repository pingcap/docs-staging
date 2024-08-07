---
title: Data Migration Billing
summary: TiDB Cloudでのデータ移行の課金について説明します。
---

# データ移行の請求 {#data-migration-billing}

このドキュメントでは、 TiDB Cloudでのデータ移行の課金について説明します。

## データ移行の仕様 {#specifications-for-data-migration}

TiDB Cloud は、データ移行の容量をレプリケーション容量単位 (RCU) で測定します。データ移行ジョブを作成するときに、適切な仕様を選択できます。RCU が高いほど、移行のパフォーマンスが向上します。これらのデータ移行 RCU に対して料金が発生します。

次の表は、各データ移行仕様に対応するパフォーマンスと移行できるテーブルの最大数を示しています。

| 仕様       | 完全なデータ移行 | 増分データ移行    | テーブルの最大数 |
| -------- | -------- | ---------- | -------- |
| 2 RCU    | 25MiB/秒  | 10,000行/秒  | 500      |
| 4 つの RCU | 35MiB/秒  | 20,000行/秒  | 10000    |
| 8 RCU    | 40MiB/秒  | 40,000 行/秒 | 30000    |
| 16 RCU   | 45MiB/秒  | 80,000行/秒  | 60000    |

データ移行 RCU の価格の詳細については、 [データ移行コスト](https://www.pingcap.com/tidb-dedicated-pricing-details/#dm-cost)参照してください。

> **注記：**
>
> -   移行するテーブルの数が最大テーブル数を超える場合、データ移行ジョブは引き続き実行される可能性がありますが、ジョブが不安定になったり、失敗したりする可能性があります。
> -   この表のすべてのパフォーマンス値は、最大かつ最適な値です。アップストリーム データベースとダウンストリーム データベースには、パフォーマンス、ネットワーク帯域幅、その他のボトルネックがないことが前提となっています。パフォーマンス値は参考値であり、シナリオによって異なる場合があります。

データ移行ジョブは、完全なデータ移行パフォーマンスを MiB/秒単位で測定します。この単位は、データ移行ジョブによって 1 秒あたりに移行されるデータの量 (MiB 単位) を示します。

データ移行ジョブは、増分データ移行パフォーマンスを行/秒で測定します。この単位は、1 秒あたりにターゲット データベースに移行される行数を示します。たとえば、上流データベースが約 1 秒で 10,000 行のステートメントを`INSERT` 、 `UPDATE` 、または`DELETE`実行する場合、対応する仕様のデータ移行ジョブは、約 1 秒で 10,000 行を下流に複製できます。

## 価格 {#price}

各データ移行 RCU でサポートされているリージョンとTiDB Cloudの価格については、 [データ移行コスト](https://www.pingcap.com/tidb-cloud-pricing-details/#dm-cost)参照してください。

データ移行ジョブは、ターゲット TiDB ノードと同じリージョンにあります。

AWS PrivateLink または VPC ピアリング接続を使用しており、ソースデータベースと TiDB ノードが同じリージョンまたは同じアベイラビリティーゾーン (AZ) にない場合は、クロスリージョン トラフィック料金とクロス AZ トラフィック料金の 2 つの追加トラフィック料金が発生することに注意してください。

-   ソース データベースと TiDB ノードが同じリージョンにない場合、データ移行ジョブがソース データベースからデータを収集するときに、リージョン間のトラフィック料金が発生します。

    ![Cross-region traffic charges](https://download.pingcap.com/images/docs/tidb-cloud/dm-billing-cross-region-fees.png)

-   ソース データベースと TiDB ノードが同じリージョン内であっても異なる AZ にある場合、データ移行ジョブがソース データベースからデータを収集するときに、AZ 間のトラフィック料金が発生します。

    ![Cross-AZ traffic charges](https://download.pingcap.com/images/docs/tidb-cloud/dm-billing-cross-az-fees.png)

-   データ移行ジョブと TiDB ノードが同じ AZ にない場合、データ移行ジョブがターゲット TiDB ノードにデータを書き込むときに、AZ 間トラフィック料金が発生します。また、データ移行ジョブと TiDB ノードがソース データベースと同じ AZ (またはリージョン) にない場合、データ移行ジョブがソース データベースからデータを収集するときに、AZ 間 (またはリージョン間) トラフィック料金が発生します。

    ![Cross-region and cross-AZ traffic charges](https://download.pingcap.com/images/docs/tidb-cloud/dm-billing-cross-region-and-az-fees.png)

クロスリージョンおよびクロスAZトラフィックの料金は、 TiDB Cloudと同じです。詳細については、 [TiDB Cloudの価格詳細](https://www.pingcap.com/tidb-dedicated-pricing-details/)を参照してください。

## 参照 {#see-also}

-   [データ移行を使用して MySQL 互換データベースから移行する](/tidb-cloud/migrate-from-mysql-using-data-migration.md)
