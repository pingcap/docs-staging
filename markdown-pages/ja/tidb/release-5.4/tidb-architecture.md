---
title: TiDB Architecture
summary: The key architecture components of the TiDB platform
---

# TiDBアーキテクチャ {#tidb-architecture}

従来のスタンドアロンデータベースと比較すると、TiDBには次の利点があります。

-   柔軟で弾力性のあるスケーラビリティを備えた分散アーキテクチャを備えています。
-   MySQL 5.7プロトコル、MySQLの共通機能および構文と完全に互換性があります。アプリケーションをTiDBに移行するために、多くの場合、1行のコードを変更する必要はありません。
-   少数のレプリカに障害が発生した場合の自動フェイルオーバーにより、高可用性をサポートします。アプリケーションに対して透過的です。
-   銀行振込などの強力な一貫性を必要とするシナリオに適したACIDトランザクションをサポートします。

<CustomContent platform="tidb">

-   データの移行、複製、またはバックアップのための豊富な[データ移行ツール](/migration-overview.md)のシリーズを提供します。

</CustomContent>

分散データベースとして、TiDBは複数のコンポーネントで構成されるように設計されています。これらのコンポーネントは相互に通信し、完全なTiDBシステムを形成します。アーキテクチャは次のとおりです。

![TiDB Architecture](https://docs-download.pingcap.com/media/images/docs/tidb-architecture-v3.1.png)

## TiDBサーバー {#tidb-server}

TiDBサーバーは、MySQLプロトコルの接続エンドポイントを外部に公開するステートレスSQLレイヤーです。 TiDBサーバーはSQL要求を受信し、SQLの解析と最適化を実行し、最終的に分散実行プランを生成します。水平方向にスケーラブルであり、Linux Virtual Server（LVS）、HAProxy、F5などの負荷分散コンポーネントを介して外部への統合インターフェイスを提供します。データは保存されず、コンピューティングとSQL分析専用であり、実際のデータ読み取り要求をTiKVノード（またはTiFlashノード）に送信します。

## 配置ドライバー（PD）サーバー {#placement-driver-pd-server}

PDサーバーは、クラスタ全体のメタデータ管理コンポーネントです。これは、すべての単一TiKVノードのリアルタイムデータ分散のメタデータとTiDBクラスタ全体のトポロジー構造を格納し、TiDBダッシュボード管理UIを提供し、分散トランザクションにトランザクションIDを割り当てます。 PDサーバーは、クラスタのメタデータを格納するだけでなく、TiKVノードによってリアルタイムで報告されたデータ分散状態に従って特定のTiKVノードにデータスケジューリングコマンドを送信するため、TiDBクラスタ全体の「頭脳」です。さらに、PDサーバーは少なくとも3つのノードで構成されており、高可用性を備えています。奇数のPDノードを展開することをお勧めします。

## ストレージサーバー {#storage-servers}

### TiKVサーバー {#tikv-server}

TiKVサーバーはデータの保存を担当します。 TiKVは、分散トランザクションのKey-Valueストレージエンジンです。

<CustomContent platform="tidb">

[領域](/glossary.md#regionpeerraft-group)はデータを格納するための基本単位です。各リージョンには、StartKeyからEndKeyまでの左閉と右開の間隔である特定のキー範囲のデータが格納されます。

</CustomContent>

<CustomContent platform="tidb-cloud">

[領域](/tidb-cloud/tidb-cloud-glossary.md#region)はデータを格納するための基本単位です。各リージョンには、StartKeyからEndKeyまでの左閉と右開の間隔である特定のキー範囲のデータが格納されます。

</CustomContent>

各TiKVノードには複数のリージョンが存在します。 TiKV APIは、キーと値のペアレベルで分散トランザクションをネイティブにサポートし、デフォルトでスナップショットアイソレーションレベルの分離をサポートします。これは、TiDBがSQLレベルで分散トランザクションをサポートする方法の中核です。 SQLステートメントを処理した後、TiDBサーバーはSQL実行プランをTiKVAPIへの実際の呼び出しに変換します。したがって、データはTiKVに保存されます。 TiKVのすべてのデータは、複数のレプリカ（デフォルトでは3つのレプリカ）で自動的に維持されるため、TiKVはネイティブの高可用性を備え、自動フェイルオーバーをサポートします。

### TiFlashサーバー {#tiflash-server}

TiFlashサーバーは特別なタイプのストレージサーバーです。通常のTiKVノードとは異なり、TiFlashはデータを列ごとに保存し、主に分析処理を高速化するように設計されています。
