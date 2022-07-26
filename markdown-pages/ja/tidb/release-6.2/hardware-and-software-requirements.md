---
title: Software and Hardware Recommendations
summary: Learn the software and hardware recommendations for deploying and running TiDB.
---

# ソフトウェアおよびハードウェアの推奨事項 {#software-and-hardware-recommendations}

TiDB は、高性能なオープン ソースの分散型 NewSQL データベースとして、Intelアーキテクチャサーバー、ARMアーキテクチャサーバー、および主要な仮想化環境にデプロイでき、適切に動作します。 TiDB は、主要なハードウェア ネットワークと Linux オペレーティング システムのほとんどをサポートしています。

## Linux OS のバージョン要件 {#linux-os-version-requirements}

|        Linux OS       |       バージョン      |
| :-------------------: | :--------------: |
| レッドハット エンタープライズ リナックス | 7.3 以降の 7.x リリース |
|         CentOS        | 7.3 以降の 7.x リリース |
|  オラクル エンタープライズ Linux  | 7.3 以降の 7.x リリース |
|       アマゾン Linux      |         2        |
|       Ubuntu LTS      |     16.04 以降     |

> **ノート：**
>
> -   Oracle Enterprise Linux の場合、TiDB は Red Hat Compatible Kernel (RHCK) をサポートしますが、Oracle Enterprise Linux が提供する Unbreakable Enterprise Kernel はサポートしません。
> -   CentOS 7.3 システムで多数の TiDB テストが実行されており、私たちのコミュニティには、TiDB を Linux オペレーティング システムに展開するための多くのベスト プラクティスがあります。したがって、CentOS 7.3 以降に TiDB をデプロイすることをお勧めします。
> -   上記の Linux オペレーティング システムのサポートには、物理サーバーだけでなく、VMware、KVM、XEN などの主要な仮想化環境での展開と運用が含まれます。
> -   Red Hat Enterprise Linux 8.0、CentOS 8 Stream、および Oracle Enterprise Linux 8.0 は、これらのプラットフォームのテストが進行中であるため、まだサポートされていません。
> -   CentOS 8 Linux のアップストリーム サポートは 2021 年 12 月 31 日に終了するため、CentOS 8 Linux のサポートは予定されていません。
> -   Ubuntu 16.04 のサポートは、TiDB の将来のバージョンでは削除される予定です。 Ubuntu 18.04 以降にアップグレードすることを強くお勧めします。

Debian Linux や Fedora Linux などの他の Linux OS バージョンは動作する可能性がありますが、公式にはサポートされていません。

## ソフトウェアの推奨事項 {#software-recommendations}

### 制御機 {#control-machine}

| ソフトウェア | バージョン   |
| :----- | :------ |
| sshパス  | 1.06以降  |
| TiUP   | 1.5.0以降 |

> **ノート：**
>
> TiDB クラスターを操作および管理するには、 [制御マシンに TiUP を展開する](/production-deployment-using-tiup.md#step-2-deploy-tiup-on-the-control-machine)必要があります。

### 対象マシン {#target-machines}

| ソフトウェア | バージョン     |
| :----- | :-------- |
| sshパス  | 1.06以降    |
| 沼      | 2.0.12 以降 |
| タール    | どれか       |

## サーバーの推奨事項 {#server-recommendations}

TiDB は、Intel x86-64アーキテクチャの 64 ビット汎用ハードウェアサーバープラットフォーム、または ARMアーキテクチャのハードウェアサーバープラットフォームにデプロイして実行できます。開発、テスト、および実稼働環境のサーバーハードウェア構成に関する要件と推奨事項 (オペレーティング システム自体が占有するリソースは無視) は次のとおりです。

### 開発およびテスト環境 {#development-and-test-environments}

|    成分   |  CPU  |  メモリー  |  ローカルストレージ  |        通信網       |     インスタンス番号 (最小要件)    |
| :-----: | :---: | :----: | :---------: | :--------------: | :--------------------: |
|   TiDB  |  8コア+ | 16GB以上 | 特別な要件はありません | ギガビット ネットワーク カード |  1 (PD と同じマシンにデプロイ可能)  |
|    PD   |  4コア+ |  8GB以上 |  SAS、200GB+ | ギガビット ネットワーク カード | 1 (TiDB と同じマシンにデプロイ可能) |
|   TiKV  |  8コア+ | 32GB以上 |  SAS、200GB+ | ギガビット ネットワーク カード |            3           |
| ティフラッシュ | 32コア+ | 64GB以上 |  SSD、200GB+ | ギガビット ネットワーク カード |            1           |
|  TiCDC  |  8コア+ | 16GB以上 |  SAS、200GB+ | ギガビット ネットワーク カード |            1           |

> **ノート：**
>
> -   テスト環境では、TiDB と PD インスタンスを同じサーバーにデプロイできます。
> -   パフォーマンス関連のテストでは、テスト結果の正確性を保証するために、パフォーマンスの低いストレージおよびネットワーク ハードウェア構成を使用しないでください。
> -   TiKVサーバーの場合、NVMe SSD を使用してより高速な読み取りと書き込みを行うことをお勧めします。
> -   機能のテストと検証のみを行う場合は、 [TiDB のクイック スタート ガイド](/quick-start-with-tidb.md)に従って TiDB を 1 台のマシンにデプロイします。
> -   TiDBサーバーはディスクを使用してサーバーログを保存するため、テスト環境ではディスクの種類と容量に関する特別な要件はありません。

### 本番環境 {#production-environment}

|    成分   |   CPU  |   メモリー  | ハードディスクの種類 |             通信網             | インスタンス番号 (最小要件) |
| :-----: | :----: | :-----: | :--------: | :-------------------------: | :-------------: |
|   TiDB  |  16コア+ |  48GB以上 |     SAS    | 10 ギガビット ネットワーク カード (2 枚推奨) |        2        |
|    PD   |  8コア+  |  16GB以上 |     SSD    | 10 ギガビット ネットワーク カード (2 枚推奨) |        3        |
|   TiKV  |  16コア+ |  64GB以上 |     SSD    | 10 ギガビット ネットワーク カード (2 枚推奨) |        3        |
| ティフラッシュ | 48コア以上 | 128GB以上 | 1 つ以上の SSD | 10 ギガビット ネットワーク カード (2 枚推奨) |        2        |
|  TiCDC  |  16コア+ |  64GB以上 |     SSD    | 10 ギガビット ネットワーク カード (2 枚推奨) |        2        |
|   モニター  |  8コア+  |  16GB以上 |     SAS    |       ギガビット ネットワーク カード      |        1        |

> **ノート：**
>
> -   本番環境では、TiDB と PD インスタンスを同じサーバーにデプロイできます。パフォーマンスと信頼性に関してより高い要件がある場合は、それらを個別に展開してみてください。
> -   本番環境ではより高い構成を使用することを強くお勧めします。
> -   PCIe SSD を使用している場合は 2 TB 以内、通常の SSD を使用している場合は 1.5 TB 以内に TiKV ハードディスクのサイズを維持することをお勧めします。

TiFlash を展開する前に、次の項目に注意してください。

-   TiFlash は[複数のディスクに展開](/tiflash/tiflash-configuration.md#multi-disk-deployment)にすることができます。
-   TiFlash データ ディレクトリの最初のディスクとして高性能 SSD を使用して、TiKV データのリアルタイム レプリケーションをバッファリングすることをお勧めします。このディスクのパフォーマンスは、PCI-E SSD などの TiKV のパフォーマンスよりも低くなってはいけません。ディスク容量は、総容量の 10% 以上にする必要があります。そうしないと、このノードのボトルネックになる可能性があります。他のディスクに通常の SSD を展開できますが、PCI-E SSD が優れているほどパフォーマンスが向上することに注意してください。
-   TiKV とは異なるノードに TiFlash をデプロイすることをお勧めします。 TiFlash と TiKV を同じノードに展開する必要がある場合は、CPU コアとメモリの数を増やし、TiFlash と TiKV を別のディスクに展開して相互に干渉しないようにしてください。
-   TiFlash ディスクの合計容量は、次のように計算され`the data volume of the entire TiKV cluster to be replicated / the number of TiKV replicas * the number of TiFlash replicas` 。たとえば、TiKV の全体的な計画容量が 1 TB、TiKV レプリカの数が 3、TiFlash レプリカの数が 2 の場合、TiFlash の推奨合計容量は`1024 GB / 3 * 2`です。一部のテーブルのデータのみを複製できます。その場合、複製するテーブルのデータ量に応じてTiFlashの容量を決定してください。

TiCDC を展開する前に、1 TB を超える PCIe-SSD ディスクに TiCDC を展開することをお勧めします。

## ネットワーク要件 {#network-requirements}

オープン ソースの分散型 NewSQL データベースである TiDB を実行するには、次のネットワーク ポート構成が必要です。実際の環境での TiDB の展開に基づいて、管理者はネットワーク側とホスト側で関連するポートを開くことができます。

|         成分        | デフォルトのポート | 説明                                                    |
| :---------------: | :-------: | :---------------------------------------------------- |
|        TiDB       |    4000   | アプリケーションおよび DBA ツール用の通信ポート                            |
|        TiDB       |   10080   | TiDB ステータスを報告するための通信ポート                               |
|        TiKV       |   20160年  | TiKV通信ポート                                             |
|        TiKV       |   20180年  | TiKV ステータスを報告するための通信ポート                               |
|         PD        |    2379   | TiDB と PD 間の通信ポート                                     |
|         PD        |    2380   | PD クラスタ内のノード間通信ポート                                    |
|      ティフラッシュ      |    9000   | TiFlash TCP サービス ポート                                  |
|      ティフラッシュ      |    8123   | TiFlash HTTP サービス ポート                                 |
|      ティフラッシュ      |    3930   | TiFlash RAFT およびコプロセッサー サービス ポート                      |
|      ティフラッシュ      |   20170年  | TiFlash プロキシ サービス ポート                                 |
|      ティフラッシュ      |   20292   | Prometheus が TiFlash Proxy メトリックをプルするためのポート           |
|      ティフラッシュ      |    8234   | Prometheus が TiFlash メトリクスをプルするためのポート                 |
|        Pump       |    8250   | Pump通信ポート                                             |
|      Drainer      |    8249   | Drainer通信ポート                                          |
|       TiCDC       |    8300   | TiCDC通信ポート                                            |
|       モニタリング      |    9090   | Prometheus サービスの通信ポート                                 |
|       モニタリング      |   20120   | NgMonitoring サービスの通信ポート                               |
|   Node_exporter   |    9100   | すべての TiDB クラスター ノードのシステム情報を報告するための通信ポート               |
| Blackbox_exporter |    9115   | Blackbox_exporter 通信ポート。TiDB クラスター内のポートを監視するために使用されます |
|       グラファナ       |    3000   | 外部 Web 監視サービスおよびクライアント (ブラウザ) アクセス用のポート               |
|     アラートマネージャー    |    9093   | アラート Web サービスのポート                                     |
|     アラートマネージャー    |    9094   | アラート通信ポート                                             |

## ディスク容量要件 {#disk-space-requirements}

| 成分      | ディスク容量要件                                                                                                                                                                                                                                                                                                                 | 健全なディスク使用率 |
| :------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| TiDB    | ログディスク用に少なくとも 30 GB                                                                                                                                                                                                                                                                                                      | 90%未満      |
| PD      | データ ディスクとログ ディスクにそれぞれ 20 GB 以上                                                                                                                                                                                                                                                                                           | 90%未満      |
| TiKV    | データ ディスクとログ ディスクにそれぞれ 100 GB 以上                                                                                                                                                                                                                                                                                          | 80%未満      |
| ティフラッシュ | データ ディスクに 100 GB 以上、ログ ディスクに 30 GB 以上、それぞれ                                                                                                                                                                                                                                                                               | 80%未満      |
| TiUP    | <li>制御マシン: 単一バージョンの TiDB クラスターをデプロイするために必要なスペースは 1 GB 未満です。複数のバージョンの TiDB クラスターをデプロイすると、必要なスペースが増加します。</li><li>展開サーバー (TiDB コンポーネントが実行されるマシン): TiFlash は約 700 MB のスペースを占有し、その他のコンポーネント (PD、TiDB、TiKV など) はそれぞれ約 200 MB のスペースを占有します。クラスターの展開プロセス中、TiUP クラスターは、一時ファイルを格納するために 1 MB 未満の一時スペース ( `/tmp`ディレクトリ) を必要とします。</li> | なし         |
| モニタリング  | <li>Conprof: 3 x 1 GB x コンポーネントの数 (各コンポーネントは 1 日あたり約 1 GB、合計 3 日を占めます) + 20 GB の予約済みスペース</li><li>Top SQL: 30 x 50 MB x コンポーネントの数 (各コンポーネントは 1 日あたり約 50 MB、合計で 30 日を占めます)</li><li> Conprof とTop SQLは予約済みスペースを共有します</li>                                                                                                   | なし         |

## Web ブラウザーの要件 {#web-browser-requirements}

TiDB は[グラファナ](https://grafana.com/)に依存して、データベース メトリックの視覚化を提供します。 Javascript が有効になっている最新バージョンの Internet Explorer、Chrome、または Firefox で十分です。
