---
title: TiDB Lightning Overview
summary: Learn about Lightning and the whole architecture.
aliases: ['/tidb/stable/tidb-lightning-backends','/tidb/v6.1/tidb-lightning-backends']
---

# TiDB Lightningの概要 {#tidb-lightning-overview}

[TiDB Lightning](https://github.com/pingcap/tidb-lightning)は、TB 規模のデータを TiDB クラスターにインポートするために使用されるツールです。これは、TiDB クラスターへの初期データ インポートによく使用されます。

TiDB Lightningは、次のファイル形式をサポートしています。

-   [Dumpling](/dumpling-overview.md)によってエクスポートされたファイル
-   CSVファイル
-   [Amazon Auroraによって生成された Apache Parquet ファイル](/migrate-aurora-to-tidb.md)

TiDB Lightningは、次のソースからデータを読み取ることができます。

-   ローカル
-   [アマゾン S3](/br/backup-and-restore-storages.md#s3-url-parameters)
-   [Google クラウド ストレージ](/br/backup-and-restore-storages.md#gcs-url-parameters)

## TiDB Lightningアーキテクチャ {#tidb-lightning-architecture}

![Architecture of TiDB Lightning tool set](https://docs-download.pingcap.com/media/images/docs/tidb-lightning-architecture.png)

TiDB Lightningは`backend`で設定される 2 つのインポート モードをサポートします。インポート モードは、データが TiDB にインポートされる方法を決定します。

-   [物理インポート モード](/tidb-lightning/tidb-lightning-physical-import-mode.md) : TiDB Lightningは、最初にデータをキーと値のペアにエンコードしてローカルの一時ディレクトリに保存し、次にこれらのキーと値のペアを各 TiKV ノードにアップロードし、最後に TiKV 取り込みインターフェイスを呼び出してデータを TiKV の RocksDB に挿入します。初期インポートを実行する必要がある場合は、インポート速度が速い物理インポート モードを検討してください。

-   [論理インポート モード](/tidb-lightning/tidb-lightning-logical-import-mode.md) : TiDB Lightningは最初にデータを SQL ステートメントにエンコードし、次にこれらの SQL ステートメントを直接実行してデータをインポートします。インポートするクラスターが実稼働中の場合、またはインポートするターゲット テーブルに既にデータが含まれている場合は、論理インポート モードを使用します。

| インポート モード                         | 物理インポート モード         | 論理インポート モード      |
| :-------------------------------- | :------------------ | :--------------- |
| スピード                              | 高速 (100~500 GiB/時間) | 低 (10~50 GiB/時間) |
| リソース消費                            | 高い                  | 低い               |
| ネットワーク帯域幅の消費                      | 高い                  | 低い               |
| インポート中のACIDコンプライアンス               | いいえ                 | はい               |
| 対象テーブル                            | 空である必要があります         | データを含めることができます   |
| TiDB クラスターのバージョン                  | = 4.0.0             | 全て               |
| インポート中に TiDB クラスターがサービスを提供できるかどうか | いいえ                 | はい               |

<Note>上記のパフォーマンス データは、2 つのモード間のインポート パフォーマンスの違いを比較するために使用されます。実際のインポート速度は、ハードウェア構成、テーブル スキーマ、インデックス数などのさまざまな要因の影響を受けます。</Note>
