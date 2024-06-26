---
title: TiCDC Compatibility
summary: TiCDCの互換性に関する問題と対処方法について説明します。CLIと設定ファイルの互換性については、バージョンごとに変更があります。また、v5.0.0-rcのcdc cliツールを使用してv4.0.xクラスターを操作すると非互換性の問題が発生する可能性があります。sort-dirとdata-dirの互換性に関する注意事項もあります。また、一時テーブルの互換性についても説明します。
---

# TiCDC の互換性 {#ticdc-compatibility}

このセクションでは、TiCDC に関連する互換性の問題とその対処方法について説明します。

<!--
## component compatibility matrix

TODO

## feature compatibility matrix

TODO
-->

## CLIと設定ファイルの互換性 {#cli-and-configuration-file-compatibility}

-   TiCDC v4.0.0 では、 `ignore-txn-commit-ts`が削除され、 `ignore-txn-start-ts`が追加され、start_ts を使用してトランザクションをフィルタリングします。
-   TiCDC v4.0.2 では、 `db-dbs` / `db-tables` / `ignore-dbs` / `ignore-tables`が削除され、データベースとテーブルに新しいフィルター ルールを使用する`rules`が追加されています。フィルター構文の詳細については、 [テーブルフィルター](/table-filter.md)を参照してください。
-   TiCDC v6.2.0 以降、TiCDC Open API を介して TiCDCサーバーと直接対話できるようになりまし`cdc cli` 。 `--server`パラメータを使用して、TiCDCサーバーのアドレスを指定できます。 `--pd`は非推奨です。
-   v6.4.0 以降、TiCDC Syncpoint 機能を使用できるのは、 `SYSTEM_VARIABLES_ADMIN`または`SUPER`権限を持つ変更フィードのみです。

## 互換性の問題を処理する {#handle-compatibility-issues}

このセクションでは、TiCDC に関連する互換性の問題とその対処方法について説明します。

### TiCDC v5.0.0-rc <code>cdc cli</code>ツールを使用して v4.0.x クラスターを操作することによって発生する非互換性の問題 {#incompatibility-issue-caused-by-using-the-ticdc-v5-0-0-rc-code-cdc-cli-code-tool-to-operate-a-v4-0-x-cluster}

TiCDC v5.0.0-rc の`cdc cli`ツールを使用して v4.0.x TiCDC クラスターを操作すると、次のような異常な状況が発生する可能性があります。

-   TiCDC クラスターが v4.0.8 以前のバージョンの場合、v5.0.0-rc `cdc cli`ツールを使用してレプリケーション タスクを作成すると、クラスターに異常が発生し、レプリケーション タスクが停止する可能性があります。

-   TiCDC クラスターが v4.0.9 以降のバージョンの場合、v5.0.0-rc `cdc cli`ツールを使用してレプリケーション タスクを作成すると、古い値と統合ソーター機能が予期せずデフォルトで有効になります。

解決策:

TiCDC クラスターのバージョンに対応する`cdc`実行可能ファイルを使用して、次の操作を実行します。

1.  v5.0.0-rc `cdc cli`ツールを使用して作成された変更フィードを削除します。たとえば、 `tiup cdc:v4.0.9 cli changefeed remove -c xxxx --pd=xxxxx --force`コマンドを実行します。
2.  レプリケーション タスクが停止した場合は、TiCDC クラスターを再起動します。たとえば、 `tiup cluster restart <cluster_name> -R cdc`コマンドを実行します。
3.  チェンジフィードを再作成します。たとえば、 `tiup cdc:v4.0.9 cli changefeed create --sink-uri=xxxx --pd=xxx`コマンドを実行します。

> **注記：**
>
> この問題は、 `cdc cli`が v5.0.0-rc の場合にのみ発生します。他の v5.0.x バージョンの`cdc cli`ツールは、v4.0.x クラスターと互換性があります。

### <code>sort-dir</code>と<code>data-dir</code>の互換性に関する注意事項 {#compatibility-notes-for-code-sort-dir-code-and-code-data-dir-code}

`sort-dir`構成は、TiCDC ソーターの一時ファイル ディレクトリを指定するために使用されます。その機能はバージョンによって異なる場合があります。次の表は、バージョン間の`sort-dir`の互換性の変更を示しています。

| バージョン                                                     | `sort-engine`機能                                                   | 注記                                                                                                                                                                                                                                                                                                                                                                                   | おすすめ                                                              |
| :-------------------------------------------------------- | :---------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| v4.0.11 またはそれ以前の v4.0 バージョン、v5.0.0-rc                     | これはチェンジフィード設定項目であり、 `file`ソーターと`unified`ソーターの一時ファイル ディレクトリを指定します。 | これらのバージョンでは、 `file`ソーターと`unified`ソーターは**実験的機能**であり、本番環境には推奨され**ません**。<br/><br/>複数の変更フィードが`unified`ソーターを`sort-engine`として使用する場合、実際の一時ファイル ディレクトリは変更フィードの`sort-dir`構成になる可能性があり、各 TiCDC ノードで使用されるディレクトリは異なる可能性があります。                                                                                                                                                                     | 本番環境で`unified`ソーターを使用することはお勧めできません。                               |
| v4.0.12、v4.0.13、v5.0.0、および v5.0.1                         | これは、changefeed または`cdc server`の構成アイテムです。                          | デフォルトでは、変更フィードの`sort-dir`構成は有効にならず、 `cdc server`の`sort-dir`構成はデフォルトで`/tmp/cdc_sort`になります。本番環境では`cdc server`のみを構成することをお勧めします。<br/><br/> TiUPを使用して TiCDC を展開する場合は、最新のTiUPバージョンを使用し、TiCDCサーバー構成で`sorter.sort-dir`を設定することをお勧めします。<br/><br/> `unified`ソーターは、v4.0.13、v5.0.0、および v5.0.1 ではデフォルトで有効になっています。クラスターをこれらのバージョンにアップグレードする場合は、TiCDCサーバー構成で`sorter.sort-dir`が正しく構成されていることを確認してください。 | `cdc server`コマンドライン パラメーター (またはTiUP) を使用して`sort-dir`を構成する必要があります。 |
| v4.0.14 以降 v4.0 バージョン、v5.0.3 以降 v5.0 バージョン、以降の TiDB バージョン | `sort-dir`は非推奨です。 `data-dir`を設定することをお勧めします。                       | 最新バージョンのTiUP を使用して`data-dir`を設定できます。これらの TiDB バージョンでは、 `unified`ソーターがデフォルトで有効になっています。クラスターをアップグレードするときは、 `data-dir`正しく構成されていることを確認してください。それ以外の場合は、デフォルトで`/tmp/cdc_data`一時ファイル ディレクトリとして使用されます。<br/><br/>ディレクトリが存在するデバイスのstorage容量が不足している場合、ハードディスクの空き容量が不足する問題が発生する可能性があります。この状況では、変更フィードの以前の`sort-dir`構成は無効になります。                                                                   | `cdc server`コマンドライン パラメーター (またはTiUP) を使用して`data-dir`を構成する必要があります。 |
| v6.0.0以降のバージョン                                            | `data-dir`は、TiCDC によって生成された一時ファイルの保存に使用されます。                      | v6.0.0 以降、TiCDC はデフォルトでソート エンジンとして`db sorter`を使用します。 `data-dir`は、このエンジンのディスク ディレクトリです。                                                                                                                                                                                                                                                                                               | `cdc server`コマンドライン パラメーター (またはTiUP) を使用して`data-dir`を構成する必要があります。 |

### 一時テーブルとの互換性 {#compatibility-with-temporary-tables}

v5.3.0 以降、TiCDC は[グローバル一時テーブル](/temporary-tables.md#global-temporary-tables)をサポートします。 v5.3.0 より前のバージョンの TiCDC を使用してグローバル一時テーブルをダウンストリームにレプリケートすると、テーブル定義エラーが発生します。

アップストリーム クラスターにグローバル一時テーブルが含まれている場合、ダウンストリーム TiDB クラスターは v5.3.0 以降のバージョンであることが予想されます。そうしないと、レプリケーション プロセス中にエラーが発生します。
