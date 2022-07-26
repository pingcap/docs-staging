---
title: Limitations and Quotas in TiDB Cloud
summary: Learn the limitations and quotas in TiDB Cloud.
---

# TiDB Cloudの制限とクォータ {#limitations-and-quotas-in-tidb-cloud}

TiDB Cloudは、作成できる各種類のコンポーネントの数と、TiDB の一般的な使用制限を制限します。さらに、実際に必要以上のリソースを作成しないように、ユーザーが作成するリソースの量を制限する組織レベルのクォータがいくつかあります。これらの表は、制限とクォータの概要を示しています。

> **ノート：**
>
> これらの制限またはクォータのいずれかが組織に問題をもたらす場合は、 [TiDB Cloudのサポート](/tidb-cloud/tidb-cloud-support.md)にお問い合わせください。

## クラスタの制限 {#cluster-limits}

| 成分                         | リミット |
| :------------------------- | :--- |
| データ レプリカの数                 | 3    |
| クロスゾーン デプロイのアベイラビリティ ゾーンの数 | 3    |

> **ノート：**
>
> TiDB の一般的な使用制限について詳しく知りたい場合は、 [TiDB の制限事項](https://docs.pingcap.com/tidb/stable/tidb-limitations)を参照してください。

## クラスタクォータ {#cluster-quotas}

| 成分                               | クォータ (デフォルト) |
| :------------------------------- | :----------- |
| 組織内のすべてのクラスターの合計 TiDB ノードの最大数    | 10           |
| 組織内のすべてのクラスターの合計 TiKV ノードの最大数    | 15           |
| 組織内のすべてのクラスターの合計 TiFlash ノードの最大数 | 5            |
