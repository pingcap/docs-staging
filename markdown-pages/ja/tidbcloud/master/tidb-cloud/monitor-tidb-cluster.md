---
title: Monitor a TiDB Cluster
summary: Learn how to monitor your TiDB cluster.
---

# TiDBクラスタを監視する {#monitor-a-tidb-cluster}

このドキュメントでは、 TiDB Cloudで TiDB クラスターを監視する方法について説明します。

## クラスタのステータスとノードのステータス {#cluster-status-and-node-status}

クラスター ページで、実行中の各クラスターの現在の状態を確認できます。

### クラスタの状態 {#cluster-status}

| クラスタの状態     | 説明                                 |
| :---------- | :--------------------------------- |
| **利用可能**    | クラスタは正常で利用可能です。                    |
| **作成**      | クラスターを作成しています。クラスターの作成中はアクセスできません。 |
| **輸入**      | クラスターへのデータのインポート。                  |
| **変更中**     | クラスタは変更中です。                        |
| **利用できません** | クラスターに障害が発生したため、TiDB はそれを回復できません。  |
| **一時停止**    | クラスターは一時停止しています。                   |
| **再開中**     | クラスターは一時停止から再開しています。               |
| **復元中**     | クラスタは現在バックアップから復元中です。              |

### TiDB ノードのステータス {#tidb-node-status}

> **ノート：**
>
> TiDB ノードのステータスは、Dedicated Tier クラスターでのみ使用できます。

| TiDB ノードのステータス | 説明                  |
| :------------- | :------------------ |
| **利用可能**       | TiDB ノードは正常で利用可能です。 |
| **作成**         | TiDB ノードを作成しています。   |
| **利用不可**       | TiDB ノードは使用できません。   |
| **削除中**        | TiDB ノードを削除しています。   |

### TiKV ノードのステータス {#tikv-node-status}

> **ノート：**
>
> TiKV ノードのステータスは、Dedicated Tier クラスターでのみ使用できます。

| TiKV ノードのステータス | 説明                  |
| :------------- | :------------------ |
| **利用可能**       | TiKV ノードは正常で利用可能です。 |
| **作成**         | TiKV ノードを作成しています。   |
| **利用不可**       | TiKV ノードは使用できません。   |
| **削除中**        | TiKV ノードを削除しています。   |

## 指標のモニタリング {#monitoring-metrics}

TiDB Cloudでは、次のページからクラスターの一般的に使用されるメトリックを表示できます。

-   クラスタの概要ページ
-   クラスタ監視ページ

### クラスタの概要ページの指標 {#metrics-on-the-cluster-overview-page}

クラスターの概要ページには、合計 QPS、クエリ期間、アクティブな接続、TiDB CPU、TiKV CPU、TiFlash CPU、TiDB メモリ、TiKV メモリ、TiFlash メモリ、TiKV 使用ストレージ サイズ、TiFlash 使用ストレージ サイズなど、クラスタの一般的なメトリックが表示されます。

> **ノート：**
>
> これらのメトリックの一部は、Dedicated Tier クラスターでのみ使用できる場合があります。

クラスターの概要ページでメトリックを表示するには、次の手順を実行します。

1.  [**クラスター]**ページに移動します。

2.  クラスターの名前をクリックして、そのクラスターの概要ページに移動します。

### クラスター監視ページの指標 {#metrics-on-the-cluster-monitoring-page}

クラスター監視ページには、クラスターの標準メトリックの完全なセットが表示されます。これらのメトリックを表示することで、パフォーマンスの問題を簡単に特定し、現在のデータベースの展開が要件を満たしているかどうかを判断できます。

> **ノート：**
>
> 現在、クラスター監視ページは[サーバーレス階層クラスター](/tidb-cloud/select-cluster-tier.md#serverless-tier-beta)で利用できません。

クラスター監視ページでメトリックを表示するには、次の手順を実行します。

1.  クラスターの [**診断**] タブに移動します。

2.  [**監視**] タブをクリックします。

詳細については、 [ビルトインモニタリング](/tidb-cloud/built-in-monitoring.md)を参照してください。
