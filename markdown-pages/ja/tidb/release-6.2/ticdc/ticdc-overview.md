---
title: TiCDC Overview
summary: Learn what TiCDC is, what features TiCDC provides, etc.
---

# TiCDC の概要 {#ticdc-overview}

[TiCDC](https://github.com/pingcap/tiflow/tree/master/cdc)は、TiDB の増分データを複製するために使用されるツールです。具体的には、TiCDC は TiKV 変更ログをプルし、キャプチャされたデータを並べ替え、行ベースの増分データをダウンストリーム データベースにエクスポートします。

## 使用シナリオ {#usage-scenarios}

-   データベースのディザスター リカバリー: TiCDC を同種のデータベース間のディザスター リカバリーに使用して、災害イベント後のプライマリ データベースとセカンダリ データベースの最終的なデータ整合性を確保できます。この機能は、TiDB のプライマリ クラスタとセカンダリ クラスタでのみ機能します。
-   データ統合: TiCDC は、他のシステムが TiCDC からのデータ変更をサブスクライブできるようにする[TiCDC Canal- JSON プロトコル](/ticdc/ticdc-canal-json.md)を提供します。このように、TiCDC は、監視、キャッシング、グローバル インデックス作成、データ分析、異種データベース間のプライマリ/セカンダリ レプリケーションなど、さまざまなシナリオにデータ ソースを提供します。

## TiCDCアーキテクチャ {#ticdc-architecture}

TiCDC が実行されている場合、PD で etcd を介して高可用性を実現するステートレス ノードです。 TiCDC クラスターは、複数のレプリケーション タスクの作成をサポートして、複数の異なるダウンストリーム プラットフォームにデータをレプリケートします。

TiCDC のアーキテクチャを次の図に示します。

![TiCDC architecture](https://docs-download.pingcap.com/media/images/docs/ticdc/cdc-architecture.png)

### システムの役割 {#system-roles}

-   TiKV CDC コンポーネント: キー値 (KV) 変更ログのみを出力します。

    -   内部ロジックで KV 変更ログを収集します。
    -   KV 変更ログを出力するためのインターフェイスを提供します。送信されるデータには、リアルタイム変更ログとインクリメンタル スキャン変更ログが含まれます。

-   `capture` : TiCDC の動作プロセス。複数の`captures`は、KV 変更ログをレプリケートする TiCDC クラスターを形成します。

    -   `capture`ごとに KV 変更ログの一部を取得します。
    -   プルされた KV 変更ログを並べ替えます。
    -   TiCDC オープン プロトコルに基づいて、トランザクションをダウンストリームに復元するか、ログを出力します。

## レプリケーション機能 {#replication-features}

このセクションでは、TiCDC のレプリケーション機能について紹介します。

### シンクサポート {#sink-support}

現在、TiCDC シンク コンポーネントは、次のダウンストリーム プラットフォームへのデータのレプリケートをサポートしています。

-   MySQL プロトコルと互換性のあるデータベース。シンク コンポーネントは、最終的な一貫性のサポートを提供します。
-   TiCDC Open Protocol に基づく Kafka。シンク コンポーネントは、行レベルの順序、最終的な一貫性、または厳密なトランザクションの一貫性を保証します。

### レプリケーションの順序と一貫性を確保する {#ensure-replication-order-and-consistency}

#### 複製順序 {#replication-order}

-   すべての DDL または DML ステートメントについて、TiCDC はそれら**を少なくとも 1 回**出力します。
-   TiKV または TiCDC クラスターで障害が発生すると、TiCDC は同じ DDL/DML ステートメントを繰り返し送信する場合があります。重複する DDL/DML ステートメントの場合:

    -   MySQL シンクは、DDL ステートメントを繰り返し実行できます。 `truncate table`など、ダウンストリームで繰り返し実行できる DDL ステートメントの場合、ステートメントは正常に実行されます。 `create table`のように繰り返し実行できないものについては、実行は失敗し、TiCDC はエラーを無視してレプリケーションを続行します。
    -   Kafka シンクはメッセージを繰り返し送信しますが、メッセージの重複は`Resolved Ts`の制約には影響しません。ユーザーは、Kafka コンシューマーからの重複メッセージをフィルタリングできます。

#### レプリケーションの一貫性 {#replication-consistency}

-   MySQL シンク

    -   TiCDC は単一テーブル トランザクションを分割せず、単一テーブル トランザクションの原子性を**保証**します。

    -   TiCDC は、ダウンストリーム トランザクションの実行順序がアップストリーム トランザクションの実行順序と同じであることを**保証しません**。

    -   TiCDC はクロステーブル トランザクションをテーブル単位で分割し、クロステーブル トランザクションの原子性を**保証しません**。

    -   TiCDC は、単一行の更新の順序がアップストリームの順序と一致することを**保証**します。

    > **ノート：**
    >
    > v6.2 以降、シンク uri パラメータ[`transaction-atomicity`](/ticdc/manage-ticdc.md#configure-sink-uri-with-mysqltidb)を使用して、単一テーブル トランザクションを分割するかどうかを制御できます。単一テーブル トランザクションを分割すると、大規模なトランザクションをレプリケートする際のレイテンシーとメモリ消費を大幅に削減できます。

-   カフカシンク

    -   TiCDC は、データ配布のためのさまざまな戦略を提供します。テーブル、主キー、またはタイムスタンプに基づいて、さまざまな Kafka パーティションにデータを分散できます。
    -   さまざまな分散戦略の場合、さまざまなコンシューマーの実装によって、行レベルの一貫性、結果の一貫性、テーブル間のトランザクションの一貫性など、さまざまなレベルの一貫性を実現できます。
    -   TiCDC には Kafka コンシューマーの実装はありませんが、提供されるのは[TiCDC オープン プロトコル](/ticdc/ticdc-open-protocol.md)のみです。このプロトコルに従って Kafka コンシューマを実装できます。

## 制限 {#restrictions}

TiCDC を使用する場合、いくつかの制限があります。

### 有効なインデックスの要件 {#requirements-for-valid-index}

TiCDC は、少なくとも 1 つの**有効なインデックス**を持つテーブルのみを複製します。<strong>有効なインデックス</strong>は次のように定義されます。

-   主キー ( `PRIMARY KEY` ) は有効なインデックスです。
-   次の条件を同時に満たす一意のインデックス ( `UNIQUE INDEX` ) は、有効なインデックスです。
    -   インデックスのすべての列は、null 非許容 ( `NOT NULL` ) として明示的に定義されています。
    -   索引には、仮想生成列 ( `VIRTUAL GENERATED COLUMNS` ) がありません。

v4.0.8 以降、TiCDC は、タスク構成を変更することにより**、有効なインデックスなしで**テーブルを複製することをサポートします。ただし、これにより、データの一貫性の保証がある程度損なわれます。詳細については、 [有効なインデックスのないテーブルをレプリケートする](/ticdc/manage-ticdc.md#replicate-tables-without-a-valid-index)を参照してください。

### サポートされていないシナリオ {#unsupported-scenarios}

現在、次のシナリオはサポートされていません。

-   RawKV のみを使用する TiKV クラスター。
-   TiDB の[DDL 操作`CREATE SEQUENCE`](/sql-statements/sql-statement-create-sequence.md)と[SEQUENCE関数](/sql-statements/sql-statement-create-sequence.md#sequence-function) 。アップストリームの TiDB が`SEQUENCE`を使用する場合、TiCDC はアップストリームで実行された`SEQUENCE`の DDL 操作/関数を無視します。ただし、 `SEQUENCE`の関数を使用する DML 操作は正しくレプリケートできます。

TiCDC は、アップストリームでの大規模なトランザクションのシナリオに対して部分的なサポートのみを提供します。詳細については、 [FAQ: TiCDC は大規模なトランザクションの複製をサポートしていますか?リスクはありますか？](/ticdc/ticdc-faq.md#does-ticdc-support-replicating-large-transactions-is-there-any-risk)を参照してください。

> **ノート：**
>
> v5.3.0 以降、TiCDC は循環レプリケーション機能をサポートしなくなりました。

## TiCDC をインストールしてデプロイする {#install-and-deploy-ticdc}

TiCDC を新しい TiDB クラスターと共にデプロイするか、TiCDC コンポーネントを既存の TiDB クラスターに追加することができます。詳細については、 [TiCDC をデプロイ](/ticdc/deploy-ticdc.md)を参照してください。

## TiCDCクラスタとレプリケーション タスクの管理 {#manage-ticdc-cluster-and-replication-tasks}

現在、 `cdc cli`のツールを使用して、TiCDC クラスターのステータスとデータ レプリケーション タスクを管理できます。詳細については、次を参照してください。

-   [`cdc cli`を使用してクラスターのステータスとデータ複製タスクを管理する](/ticdc/manage-ticdc.md#use-cdc-cli-to-manage-cluster-status-and-data-replication-task)
-   [OpenAPI を使用してクラスターのステータスとデータ複製タスクを管理する](/ticdc/ticdc-open-api.md)

## TiCDC オープン プロトコル {#ticdc-open-protocol}

TiCDC Open Protocol は、監視、キャッシング、フルテキスト インデックス作成、分析エンジン、および異なるデータベース間のプライマリ/セカンダリ レプリケーションのためのデータ ソースを提供する、行レベルのデータ変更通知プロトコルです。 TiCDC は TiCDC Open Protocol に準拠し、TiDB のデータ変更を MQ (Message Queue) などのサードパーティのデータ媒体に複製します。詳細については、 [TiCDC オープン プロトコル](/ticdc/ticdc-open-protocol.md)を参照してください。

## 互換性に関する注意事項 {#compatibility-notes}

### TiCDC v5.0.0-rc <code>cdc cli</code>ツールを使用して v4.0.x クラスターを操作することによって引き起こされる非互換性の問題 {#incompatibility-issue-caused-by-using-the-ticdc-v5-0-0-rc-code-cdc-cli-code-tool-to-operate-a-v4-0-x-cluster}

TiCDC v5.0.0-rc の`cdc cli`ツールを使用して v4.0.x の TiCDC クラスターを操作すると、次の異常な状況が発生する場合があります。

-   TiCDC クラスターが v4.0.8 以前のバージョンである場合、v5.0.0-rc `cdc cli`ツールを使用してレプリケーション タスクを作成すると、クラスターの異常が発生し、レプリケーション タスクがスタックする可能性があります。

-   TiCDC クラスターが v4.0.9 以降のバージョンの場合、v5.0.0-rc `cdc cli`ツールを使用してレプリケーション タスクを作成すると、古い値と統合ソーター機能が予期せずデフォルトで有効になります。

解決策: TiCDC クラスターのバージョンに対応する`cdc`の実行可能ファイルを使用して、次の操作を実行します。

1.  v5.0.0-rc `cdc cli`ツールを使用して作成された変更フィードを削除します。たとえば、 `tiup cdc:v4.0.9 cli changefeed remove -c xxxx --pd=xxxxx --force`コマンドを実行します。
2.  レプリケーション タスクがスタックしている場合は、TiCDC クラスターを再起動します。たとえば、 `tiup cluster restart <cluster_name> -R cdc`コマンドを実行します。
3.  変更フィードを再作成します。たとえば、 `tiup cdc:v4.0.9 cli changefeed create --sink-uri=xxxx --pd=xxx`コマンドを実行します。

> **ノート：**
>
> 上記の問題は、 `cdc cli`が v5.0.0-rc の場合にのみ存在します。その他の v5.0.x `cdc cli`ツールは、v4.0.x クラスターと互換性があります。

### <code>sort-dir</code>と<code>data-dir</code>の互換性に関する注意事項 {#compatibility-notes-for-code-sort-dir-code-and-code-data-dir-code}

`sort-dir`構成は、TiCDC ソーターの一時ファイル ディレクトリを指定するために使用されます。その機能は、バージョンによって異なる場合があります。次の表は、バージョン間の`sort-dir`の互換性の変更を示しています。

| バージョン                                                       | `sort-engine`機能                                                     | ノート                                                                                                                                                                                                                                                                                                                                                                                              | おすすめ                                                              |
| :---------------------------------------------------------- | :------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| v4.0.11 またはそれ以前の v4.0 バージョン、v5.0.0-rc                       | これは changefeed 設定項目で、 `file`ソーターと`unified`ソーターの一時ファイル ディレクトリを指定します。 | これらのバージョンでは、 `file`のソーターと`unified`のソーターは**実験的機能**であり、実稼働環境には推奨され<strong>ません</strong>。<br/><br/>複数のチェンジフィードが`unified`ソーターを`sort-engine`として使用する場合、実際の一時ファイル ディレクトリはいずれかのチェンジフィードの`sort-dir`構成である可能性があり、各 TiCDC ノードに使用されるディレクトリは異なる可能性があります。                                                                                                                                                        | 本番環境で`unified`のソーターを使用することはお勧めしません。                               |
| v4.0.12、v4.0.13、v5.0.0、および v5.0.1                           | changefeed または`cdc server`の設定項目です。                                  | デフォルトでは、changefeed の`sort-dir`構成は有効にならず、 `cdc server`の`sort-dir`構成はデフォルトで`/tmp/cdc_sort`になります。実稼働環境では`cdc server`のみを構成することをお勧めします。<br/><br/> TiUP を使用して TiCDC をデプロイする場合は、最新の TiUP バージョンを使用し、TiCDCサーバー構成で`sorter.sort-dir`を設定することをお勧めします。<br/><br/> v4.0.13、v5.0.0、および v5.0.1 では、 `unified`ソーターがデフォルトで有効になっています。クラスターをこれらのバージョンにアップグレードする場合は、TiCDCサーバー構成で`sorter.sort-dir`が正しく構成されていることを確認してください。 | `cdc server`コマンドライン パラメータ (または TiUP) を使用して`sort-dir`を構成する必要があります。 |
| v4.0.14 以降の v4.0 バージョン、v5.0.3 以降の v5.0 バージョン、以降の TiDB バージョン | `sort-dir`は非推奨です。 `data-dir`を設定することをお勧めします。                         | `data-dir`は、最新バージョンの TiUP を使用して構成できます。これらの TiDB バージョンでは、デフォルトで`unified`のソーターが有効になっています。クラスターをアップグレードするときは、 `data-dir`が正しく構成されていることを確認してください。それ以外の場合、一時ファイル ディレクトリとしてデフォルトで`/tmp/cdc_data`が使用されます。<br/><br/>ディレクトリが配置されているデバイスのストレージ容量が不足している場合、ハードディスク容量が不足する問題が発生する可能性があります。この状況では、changefeed の以前の`sort-dir`の構成は無効になります。                                                                        | `cdc server`コマンドライン パラメータ (または TiUP) を使用して`data-dir`を構成する必要があります。 |

### 一時テーブルとの互換性 {#compatibility-with-temporary-tables}

v5.3.0 以降、TiCDC は[グローバル一時テーブル](/temporary-tables.md#global-temporary-tables)をサポートしています。 v5.3.0 より前のバージョンの TiCDC を使用してグローバル一時テーブルをダウンストリームに複製すると、テーブル定義エラーが発生します。

アップストリーム クラスターにグローバル一時テーブルが含まれている場合、ダウンストリーム TiDB クラスターは v5.3.0 以降のバージョンであると予想されます。そうしないと、レプリケーション プロセス中にエラーが発生します。

## TiCDC の FAQ とトラブルシューティング {#ticdc-faqs-and-troubleshooting}

-   TiCDC の FAQ については、 [TiCDC よくある質問](/ticdc/ticdc-faq.md)を参照してください。
-   TiCDC のトラブルシューティング方法については、 [TiCDC のトラブルシューティング](/ticdc/troubleshoot-ticdc.md)を参照してください。
