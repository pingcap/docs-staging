---
title: TiCDC Overview
summary: Learn what TiCDC is, what features TiCDC provides, etc.
---

# TiCDCの概要 {#ticdc-overview}

[TiCDC](https://github.com/pingcap/tiflow/tree/master/cdc)は、TiDBの増分データを複製するために使用されるツールです。具体的には、TiCDCはTiKV変更ログをプルし、キャプチャされたデータを並べ替え、行ベースの増分データをダウンストリームデータベースにエクスポートします。

## 使用シナリオ {#usage-scenarios}

-   データベースのディザスタリカバリ：TiCDCを同種データベース間のディザスタリカバリに使用して、ディザスタイベント後のプライマリデータベースとセカンダリデータベースの最終的なデータの一貫性を確保できます。この関数は、TiDBプライマリおよびセカンダリクラスターでのみ機能します。
-   データ統合：TiCDCは[TiCDC運河-JSONプロトコル](/ticdc/ticdc-canal-json.md)を提供します。これにより、他のシステムがTiCDCからのデータ変更をサブスクライブできます。このように、TiCDCは、監視、キャッシング、グローバルインデックス作成、データ分析、異種データベース間のプライマリ-セカンダリレプリケーションなどのさまざまなシナリオのデータソースを提供します。

## TiCDCアーキテクチャ {#ticdc-architecture}

TiCDCが実行されている場合、PDのetcdを介して高可用性を実現するステートレスノードです。 TiCDCクラスタは、複数の異なるダウンストリームプラットフォームにデータを複製するための複数の複製タスクの作成をサポートします。

TiCDCのアーキテクチャを次の図に示します。

![TiCDC architecture](https://docs-download.pingcap.com/media/images/docs/ticdc/cdc-architecture.png)

### システムの役割 {#system-roles}

-   TiKV CDCコンポーネント：Key-Value（KV）変更ログのみを出力します。

    -   KV変更ログを内部ロジックにアセンブルします。
    -   KV変更ログを出力するためのインターフェースを提供します。送信されるデータには、リアルタイムの変更ログと増分スキャンの変更ログが含まれます。

-   `capture` ：TiCDCの操作プロセス。複数`captures`は、KV変更ログを複製するTiCDCクラスタを形成します。

    -   各`capture`は、KV変更ログの一部をプルします。
    -   プルされたKV変更ログをソートします。
    -   トランザクションをダウンストリームに復元するか、TiCDCオープンプロトコルに基づいてログを出力します。

## レプリケーション機能 {#replication-features}

このセクションでは、TiCDCのレプリケーション機能を紹介します。

### シンクサポート {#sink-support}

現在、TiCDCシンクコンポーネントは、次のダウンストリームプラットフォームへのデータの複製をサポートしています。

-   MySQLプロトコルと互換性のあるデータベース。シンクコンポーネントは、最終的な整合性サポートを提供します。
-   TiCDCオープンプロトコルに基づくKafka。シンクコンポーネントは、行レベルの順序、最終的な一貫性、または厳密なトランザクションの一貫性を保証します。

### レプリケーションの順序と一貫性を確保する {#ensure-replication-order-and-consistency}

#### 複製順序 {#replication-order}

-   すべてのDDLまたはDMLステートメントについて、TiCDCはそれら**を少なくとも1回**出力します。
-   TiKVまたはTiCDCクラスタで障害が発生すると、TiCDCは同じDDL/DMLステートメントを繰り返し送信する場合があります。重複したDDL/DMLステートメントの場合：

    -   MySQLシンクはDDLステートメントを繰り返し実行できます。 `truncate table`など、ダウンストリームで繰り返し実行できるDDLステートメントの場合、ステートメントは正常に実行されます。 `create table`など、繰り返し実行できないものの場合、実行は失敗し、TiCDCはエラーを無視して複製を続行します。
    -   Kafkaシンクはメッセージを繰り返し送信しますが、重複したメッセージは`Resolved Ts`の制約に影響しません。ユーザーは、Kafkaコンシューマーからの重複メッセージをフィルタリングできます。

#### レプリケーションの一貫性 {#replication-consistency}

-   MySQLシンク

    -   TiCDCは、単一テーブルトランザクションを分割せず、単一テーブルトランザクションの原子性を**保証**します。
    -   TiCDCは、ダウンストリームトランザクションの実行順序がアップストリームトランザクションの実行順序と同じであることを**保証しません**。
    -   TiCDCは、クロステーブルトランザクションをテーブルの単位で分割し、クロステーブルトランザクションの原子性を**保証しません**。
    -   TiCDCは、単一行の更新の順序がアップストリームの順序と一致することを**保証**します。

-   カフカシンク

    -   TiCDCは、データ配布のためのさまざまな戦略を提供します。テーブル、主キー、またはタイムスタンプに基づいて、さまざまなKafkaパーティションにデータを配布できます。
    -   さまざまな配布戦略の場合、さまざまなコンシューマー実装は、行レベルの一貫性、結果整合性、またはクロステーブルトランザクションの一貫性など、さまざまなレベルの一貫性を実現できます。
    -   TiCDCにはKafkaコンシューマーの実装はありませんが、提供するのは[TiCDCオープンプロトコル](/ticdc/ticdc-open-protocol.md)だけです。このプロトコルに従って、Kafkaコンシューマーを実装できます。

## 制限 {#restrictions}

TiCDCを使用する場合、いくつかの制限があります。

### 有効なインデックスの要件 {#requirements-for-valid-index}

TiCDCは、少なくとも1つの**有効なインデックス**を持つテーブルのみを複製します。<strong>有効なインデックス</strong>は次のように定義されます。

-   主キー（ `PRIMARY KEY` ）は有効なインデックスです。
-   次の条件を満たす一意のインデックス（ `UNIQUE INDEX` ）は、有効なインデックスです。
    -   インデックスのすべての列は、null許容ではないものとして明示的に定義されています（ `NOT NULL` ）。
    -   インデックスには、仮想的に生成された列（ `VIRTUAL GENERATED COLUMNS` ）がありません。

v4.0.8以降、TiCDCは、タスク構成を変更することにより**、有効なインデックスなしで**テーブルを複製することをサポートしています。ただし、これにより、データの一貫性の保証がある程度損なわれます。詳細については、 [有効なインデックスなしでテーブルを複製する](/ticdc/manage-ticdc.md#replicate-tables-without-a-valid-index)を参照してください。

### サポートされていないシナリオ {#unsupported-scenarios}

現在、次のシナリオはサポートされていません。

-   RawKVのみを使用するTiKVクラスタ。
-   TiDBの[DDL操作`CREATE SEQUENCE`](/sql-statements/sql-statement-create-sequence.md)と[SEQUENCE関数](/sql-statements/sql-statement-create-sequence.md#sequence-function) 。アップストリームTiDBが`SEQUENCE`を使用する場合、TiCDCはアップストリームで実行される`SEQUENCE`のDDL操作/機能を無視します。ただし、 `SEQUENCE`の関数を使用したDML操作は正しく複製できます。

TiCDCは、アップストリームでの大規模なトランザクションのシナリオに対して部分的なサポートのみを提供します。詳しくは[FAQ：TiCDCは大規模なトランザクションの複製をサポートしていますか？リスクはありますか？](/ticdc/troubleshoot-ticdc.md#does-ticdc-support-replicating-large-transactions-is-there-any-risk)をご覧ください。

> **ノート：**
>
> v5.3.0以降、TiCDCはサイクリックレプリケーション機能をサポートしなくなりました。

## TiCDCをインストールして展開します {#install-and-deploy-ticdc}

TiCDCを新しいTiDBクラスタと一緒にデプロイするか、TiCDCコンポーネントを既存のTiDBクラスタに追加することができます。詳細については、 [TiCDCをデプロイ](/ticdc/deploy-ticdc.md)を参照してください。

## TiCDCクラスターおよびレプリケーションタスクの管理 {#manage-ticdc-cluster-and-replication-tasks}

現在、 `cdc cli`のツールを使用して、TiCDCクラスタとデータレプリケーションタスクのステータスを管理できます。詳細については、以下を参照してください。

-   [`cdc cli`を使用して、クラスタステータスとデータレプリケーションタスクを管理します](/ticdc/manage-ticdc.md#use-cdc-cli-to-manage-cluster-status-and-data-replication-task)
-   [OpenAPIを使用して、クラスタのステータスとデータレプリケーションタスクを管理します](/ticdc/ticdc-open-api.md)

## TiCDCオープンプロトコル {#ticdc-open-protocol}

TiCDC Open Protocolは、行レベルのデータ変更通知プロトコルであり、監視、キャッシング、フルテキストインデックス作成、分析エンジン、および異なるデータベース間のプライマリ-セカンダリレプリケーション用のデータソースを提供します。 TiCDCはTiCDCOpenProtocolに準拠し、TiDBのデータ変更をMQ（メッセージキュー）などのサードパーティのデータメディアに複製します。詳細については、 [TiCDCオープンプロトコル](/ticdc/ticdc-open-protocol.md)を参照してください。

## 互換性に関する注意事項 {#compatibility-notes}

### TiCDC v5.0.0- <code>cdc cli</code>ツールを使用してv4.0.xクラスタを操作することによって引き起こされる非互換性の問題 {#incompatibility-issue-caused-by-using-the-ticdc-v5-0-0-rc-code-cdc-cli-code-tool-to-operate-a-v4-0-x-cluster}

TiCDCv5.0.0-rcの`cdc cli`ツールを使用してv4.0.xTiCDCクラスタを操作すると、次の異常な状況が発生する可能性があります。

-   TiCDCクラスタがv4.0.8以前のバージョンの場合、v5.0.0-rc `cdc cli`ツールを使用してレプリケーションタスクを作成すると、クラスタの異常が発生し、レプリケーションタスクがスタックする可能性があります。

-   TiCDCクラスタがv4.0.9以降のバージョンの場合、v5.0.0-rc `cdc cli`ツールを使用してレプリケーションタスクを作成すると、デフォルトで古い値と統合ソーター機能が予期せず有効になります。

解決策：TiCDCクラスタバージョンに対応する`cdc`の実行可能ファイルを使用して、次の操作を実行します。

1.  v5.0.0- `cdc cli`ツールを使用して作成されたチェンジフィードを削除します。たとえば、 `tiup cdc:v4.0.9 cli changefeed remove -c xxxx --pd=xxxxx --force`コマンドを実行します。
2.  レプリケーションタスクがスタックしている場合は、TiCDCクラスタを再起動します。たとえば、 `tiup cluster restart <cluster_name> -R cdc`コマンドを実行します。
3.  チェンジフィードを再作成します。たとえば、 `tiup cdc:v4.0.9 cli changefeed create --sink-uri=xxxx --pd=xxx`コマンドを実行します。

> **ノート：**
>
> 上記の問題は、 `cdc cli`がv5.0.0-rcの場合にのみ発生します。他の`cdc cli`ツールは、v4.0.xクラスターと互換性があります。

### <code>sort-dir</code>と<code>data-dir</code>の互換性に関する注意 {#compatibility-notes-for-code-sort-dir-code-and-code-data-dir-code}

`sort-dir`構成は、TiCDCソーターの一時ファイルディレクトリを指定するために使用されます。その機能はバージョンによって異なる場合があります。次の表に、バージョン間の`sort-dir`の互換性の変更を示します。

| バージョン                                                 | `sort-engine`機能                                                    | ノート                                                                                                                                                                                                                                                                                                                                                                                   | おすすめ                                                          |
| :---------------------------------------------------- | :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------ |
| v4.0.11またはそれ以前のv4.0バージョン、v5.0.0-rc                    | これはチェンジフィード構成アイテムであり、 `file`ソーターと`unified`ソーターの一時ファイルディレクトリを指定します。 | これらのバージョンでは、 `file`のソーターと`unified`のソーターは**実験的機能**であり、実稼働環境には推奨され<strong>ません</strong>。<br/><br/>複数のチェンジフィードが`unified`ソーターを`sort-engine`として使用する場合、実際の一時ファイルディレクトリはチェンジフィードの`sort-dir`構成である可能性があり、各TiCDCノードに使用されるディレクトリは異なる可能性があります。                                                                                                                                                     | 実稼働環境で`unified`のソーターを使用することはお勧めしません。                          |
| v4.0.12、v4.0.13、v5.0.0、およびv5.0.1                      | チェンジフィードまたは`cdc server`の構成項目です。                                    | デフォルトでは、チェンジフィードの`sort-dir`の構成は有効にならず、 `cdc server`つの`sort-dir`の構成はデフォルトで`/tmp/cdc_sort`になります。実稼働環境では`cdc server`のみを構成することをお勧めします。<br/><br/> TiUPを使用してTiCDCを展開する場合は、最新のTiUPバージョンを使用し、TiCDCサーバー構成で`sorter.sort-dir`を設定することをお勧めします。<br/><br/> `unified`ソーターは、v4.0.13、v5.0.0、およびv5.0.1ではデフォルトで有効になっています。クラスタをこれらのバージョンにアップグレードする場合は、TiCDCサーバー構成で`sorter.sort-dir`が正しく構成されていることを確認してください。 | `cdc server`コマンドラインパラメータ（またはTiUP）を使用して`sort-dir`を設定する必要があります。 |
| v4.0.14以降のv4.0バージョン、v5.0.3以降のv5.0バージョン、それ以降のTiDBバージョン | `sort-dir`は非推奨です。 `data-dir`を構成することをお勧めします。                        | 最新バージョンのTiUPを使用して`data-dir`を構成できます。これらのTiDBバージョンでは、 `unified`ソーターがデフォルトで有効になっています。クラスタをアップグレードするときは、 `data-dir`が正しく構成されていることを確認してください。それ以外の場合は、デフォルトで`/tmp/cdc_data`が一時ファイルディレクトリとして使用されます。<br/><br/>ディレクトリが配置されているデバイスのストレージ容量が不足している場合、ハードディスク容量が不足しているという問題が発生する可能性があります。この状況では、変更フィードの以前の`sort-dir`の構成は無効になります。                                                                   | `cdc server`コマンドラインパラメータ（またはTiUP）を使用して`data-dir`を設定する必要があります。 |

### 一時テーブルとの互換性 {#compatibility-with-temporary-tables}

v5.3.0以降、TiCDCは[グローバル一時テーブル](/temporary-tables.md#global-temporary-tables)をサポートします。 v5.3.0より前のバージョンのTiCDCを使用してグローバル一時テーブルをダウンストリームに複製すると、テーブル定義エラーが発生します。

アップストリームクラスタにグローバル一時テーブルが含まれている場合、ダウンストリームTiDBクラスタはv5.3.0以降のバージョンであると予想されます。そうしないと、レプリケーションプロセス中にエラーが発生します。

## TiCDCのトラブルシューティング {#troubleshoot-ticdc}

詳しくは[TiCDCのトラブルシューティング](/ticdc/troubleshoot-ticdc.md)をご覧ください。
