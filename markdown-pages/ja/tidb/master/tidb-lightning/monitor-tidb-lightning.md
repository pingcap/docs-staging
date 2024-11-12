---
title: TiDB Lightning Monitoring
summary: TiDB Lightningのモニター構成と監視メトリックについて学習します。
---

# TiDB Lightning監視 {#tidb-lightning-monitoring}

`tidb-lightning` [プロメテウス](https://prometheus.io/)を介したメトリック収集をサポートします。このドキュメントでは、 TiDB Lightningのモニター構成と監視メトリックについて説明します。

## モニター構成 {#monitor-configuration}

TiDB Lightning を手動でインストールする場合は、以下の手順に従ってください。

`tidb-lightning`のメトリックは、検出されれば Prometheus によって直接収集できます。 `tidb-lightning.toml`のメトリック ポートを設定できます。

```toml
[lightning]
# HTTP port for debugging and Prometheus metrics pulling (0 to disable)
pprof-port = 8289

...
```

Prometheus がサーバーを検出するように設定する必要があります。たとえば、 `scrape_configs`セクションにサーバーアドレスを直接追加できます。

```yaml
...
scrape_configs:
  - job_name: 'tidb-lightning'
    static_configs:
      - targets: ['192.168.20.10:8289']
```

## Grafanaダッシュボード {#grafana-dashboard}

[グラファナ](https://grafana.com/)は、Prometheus メトリックをダッシュ​​ボードとして視覚化するための Web インターフェースです。

### 1行目: 速度 {#row-1-speed}

![Panels in first row](https://download.pingcap.com/images/docs/lightning-grafana-row-1.png)

| パネル       | シリーズ                 | 説明                                                              |
| :-------- | :------------------- | :-------------------------------------------------------------- |
| インポート速度   | TiDB Lightningから書き込む | TiDB Lightningから TiKV Importer への KV の送信速度は、各テーブルの複雑さによって異なります。 |
| インポート速度   | TIKVにアップロード          | TiKVインポーターからすべてのTiKVレプリカへの合計アップロード速度                            |
| Chunk処理期間 |                      | 1つのデータファイルを完全にエンコードするのに必要な平均時間                                  |

場合によっては、インポート速度がゼロに低下し、他の部分が追いつくことがあります。これは正常です。

### 2行目: 進捗 {#row-2-progress}

![Panels in second row](https://download.pingcap.com/images/docs/lightning-grafana-row-2.png)

| パネル         | 説明                           |
| :---------- | :--------------------------- |
| インポートの進行状況  | これまでにエンコードされたデータファイルの割合      |
| チェックサムの進行状況 | 正常にインポートされたことが確認されたテーブルの割合   |
| 失敗          | 障害が発生したテーブルの数と障害発生ポイント（通常は空） |

### 行3: リソース {#row-3-resource}

![Panels in third row](https://download.pingcap.com/images/docs/lightning-grafana-row-3.png)

| パネル                         | 説明                                    |
| :-------------------------- | :------------------------------------ |
| メモリ使用量                      | 各サービスが占有するメモリの量                       |
| TiDB Lightning Goroutine の数 | TiDB Lightningで使用される実行中の goroutine の数 |
| CPU％                        | 各サービスで使用される論理 CPU コアの数                |

### 4行目: 割り当て {#row-4-quota}

![Panels in fourth row](https://download.pingcap.com/images/docs/lightning-grafana-row-4.png)

| パネル     | シリーズ       | 説明                                                                                                                                                     |
| :------ | :--------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 怠け者の労働者 | io         | 未使用の数は`io-concurrency`で、通常は設定された値（デフォルトは5）に近いが、0に近い場合はディスクが遅すぎることを意味する。                                                                                |
| 怠け者の労働者 | 密閉型エンジン    | 閉じられているがまだクリーンアップされていないエンジンの数。通常はインデックス + テーブル同時実行性 (デフォルト 8) に近い値で、0 に近い場合はTiDB Lightning がTiKV Importer よりも高速であることを意味し、 TiDB Lightning が停止する原因となります。 |
| 怠け者の労働者 | テーブル       | 未使用の数は`table-concurrency` 、通常はプロセス終了まで 0 です                                                                                                            |
| 怠け者の労働者 | 索引         | 未使用の数は`index-concurrency` 、通常はプロセス終了まで 0                                                                                                               |
| 怠け者の労働者 | 地域         | 未使用の数は`region-concurrency` 、通常はプロセス終了まで 0                                                                                                              |
| 外部リソース  | KVエンコーダ    | アクティブな KV エンコーダをカウントします。通常はプロセスが終了するまで`region-concurrency`と同じです。                                                                                       |
| 外部リソース  | インポーターエンジン | 開かれたエンジンファイルの数をカウントします。1 `max-open-engines`設定を超えないようにしてください。                                                                                           |

### 5行目: 読み取り速度 {#row-5-read-speed}

![Panels in fifth row](https://download.pingcap.com/images/docs/lightning-grafana-row-5.png)

| パネル                  | シリーズ      | 説明                                  |
| :------------------- | :-------- | :---------------------------------- |
| Chunkパーサーの読み取りブロック期間 | ブロックを読み込む | 解析の準備のために1ブロックのバイトを読み取るのにかかる時間      |
| Chunkパーサーの読み取りブロック期間 | 応募する労働者   | アイドル状態のIO同時実行を待機するのに経過した時間          |
| SQL プロセス期間           | 行エンコード    | 1行を解析してエンコードするのにかかる時間               |
| SQL プロセス期間           | ブロック配信    | KV ペアのブロックを TiKV インポーターに送信するのにかかる時間 |

いずれかの期間が長すぎる場合は、 TiDB Lightningが使用するディスクが遅すぎるか、I/O でビジー状態であることを示します。

### 6行目: ストレージ {#row-6-storage}

![Panels in sixth row](https://download.pingcap.com/images/docs/lightning-grafana-row-6.png)

| パネル     | シリーズ         | 説明                                         |
| :------ | :----------- | :----------------------------------------- |
| SQL処理速度 | データ配信率       | TiKVインポーターへのデータKVペアの配信速度                   |
| SQL処理速度 | インデックス配信率    | TiKVインポーターへのインデックスKVペアの配信速度                |
| SQL処理速度 | 総配達率         | 上記の2つのレートの合計                               |
| 合計バイト数  | パーサー読み取りサイズ  | TiDB Lightningによって読み取られるバイト数               |
| 合計バイト数  | データ配信サイズ     | TiKVインポーターにすでに配信されているデータKVペアのバイト数          |
| 合計バイト数  | インデックス配信サイズ  | TiKVインポーターにすでに配信されたインデックスKVペアのバイト数         |
| 合計バイト数  | ストレージサイズ / 3 | TiKV クラスターが占める合計サイズを 3 で割った値 (レプリカのデフォルト数) |

### 7行目: インポート速度 {#row-7-import-speed}

![Panels in seventh row](https://download.pingcap.com/images/docs/lightning-grafana-row-7.png)

| パネル        | シリーズ      | 説明                                    |
| :--------- | :-------- | :------------------------------------ |
| 配送期間       | レンジデリバリー  | 一連の KV ペアを TiKV クラスターにアップロードするのにかかる時間 |
| 配送期間       | SST 配信    | SST ファイルを TiKV クラスターにアップロードするのにかかる時間  |
| SST プロセス期間 | スプリットSST  | KV ペアのストリームを SST ファイルに分割するのにかかる時間     |
| SST プロセス期間 | SSTアップロード | SST ファイルのアップロードにかかる時間                 |
| SST プロセス期間 | SST摂取     | アップロードされた SST ファイルの取り込みにかかる時間         |
| SST プロセス期間 | SSTサイズ    | SST ファイルのファイルサイズ                      |

## 監視メトリクス {#monitoring-metrics}

このセクションでは、 `tidb-lightning`の監視メトリックについて説明します。

`tidb-lightning`によって提供されるメトリックは、名前空間`lightning_*`の下にリストされます。

-   **`lightning_importer_engine`** (カウンター)

    開いているエンジン ファイルと閉じているエンジン ファイルをカウントします。ラベル:

    -   **タイプ**：
        -   `open`
        -   `closed`

-   **`lightning_idle_workers`** (ゲージ)

    アイドル状態のワーカーをカウントします。ラベル:

    -   **名前**：
        -   `table` : `table-concurrency`の余り。通常はプロセス終了まで 0 です。
        -   `index` : `index-concurrency`の余り。通常はプロセス終了まで 0 です。
        -   `region` : `region-concurrency`の余り。通常はプロセス終了まで 0 です。
        -   `io` : `io-concurrency`の余り。通常は設定された値（デフォルトは5）に近い。0に近い場合はディスクが遅すぎることを意味する。
        -   `closed-engine` : 閉じられたがまだクリーンアップされていないエンジンの数。通常はインデックス + テーブル同時実行数に近い値です (デフォルトは 8)。0 に近い値は、 TiDB Lightning がTiKV Importer よりも高速であることを意味し、 TiDB Lightning が停止する可能性があります。

-   **`lightning_kv_encoder`** (カウンター)

    オープンおよびクローズされた KV エンコーダーをカウントします。KV エンコーダーは、SQL `INSERT`ステートメントを KV ペアに変換するメモリ内 TiDB インスタンスです。正常な状況では、ネット値が制限される必要があります。ラベル:

    -   **タイプ**：
        -   `open`
        -   `closed`

<!---->

-   **`lightning_tables`** (カウンター)

    処理されたテーブルとそのステータスをカウントします。ラベル:

    -   **状態**: テーブルの状態。どのフェーズを完了する必要があるかを示します。
        -   `pending` : まだ処理されていません
        -   `written` : すべてのデータがエンコードされて送信されました
        -   `closed` : 対応するエンジンファイルはすべて閉じられています
        -   `imported` : すべてのエンジン ファイルがターゲット クラスターにインポートされました
        -   `altered_auto_inc` : AUTO_INCREMENT IDが変更されました
        -   `checksum` : チェックサムを実行
        -   `analyzed` : 統計分析を実行
        -   `completed` : テーブルは完全にインポートされ、検証されました
    -   **結果**: 現在のフェーズの結果
        -   `success` : フェーズが正常に完了しました
        -   `failure` : フェーズが失敗しました (完了しませんでした)

-   **`lightning_engines`** (カウンター)

    処理されたエンジン ファイルの数とそのステータスをカウントします。ラベル:

    -   **状態**: エンジンの状態。どのフェーズを完了する必要があるかを示します。
        -   `pending` : まだ処理されていません
        -   `written` : すべてのデータがエンコードされて送信されました
        -   `closed` : エンジンファイルが閉じられました
        -   `imported` : エンジンファイルがターゲットクラスターにインポートされました
        -   `completed` : エンジンが完全にインポートされました
    -   **結果**: 現在のフェーズの結果
        -   `success` : フェーズが正常に完了しました
        -   `failure` : フェーズが失敗しました (完了しませんでした)

<!---->

-   **`lightning_chunks`** (カウンター)

    処理されたチャンクの数とそのステータスをカウントします。ラベル:

    -   **状態**: チャンクの状態。チャンクがどのフェーズにあるかを示します。
        -   `estimated` : (状態ではない) この値は現在のタスク内のチャンクの合計数を示します
        -   `pending` : 読み込まれているがまだ処理されていない
        -   `running` : データがエンコードされ送信されています
        -   `finished` : チャンク全体が処理されました
        -   `failed` : 処理中にエラーが発生しました

-   **`lightning_import_seconds`** (ヒストグラム)

    テーブルのインポートに必要な時間のバケット化されたヒストグラム。

-   **`lightning_row_read_bytes`** (ヒストグラム)

    単一の SQL 行のサイズのバケット化されたヒストグラム。

-   **`lightning_row_encode_seconds`** (ヒストグラム)

    単一の SQL 行を KV ペアにエンコードするのに必要な時間のバケット化されたヒストグラム。

-   **`lightning_row_kv_deliver_seconds`** (ヒストグラム)

    1 つの SQL 行に対応する KV ペアのセットを配信するために必要な時間のバケット化されたヒストグラム。

-   **`lightning_block_deliver_seconds`** (ヒストグラム)

    KV ペアのブロックをインポーターに配信するために必要な時間のバケット化されたヒストグラム。

-   **`lightning_block_deliver_bytes`** (ヒストグラム)

    インポーターに配信された KV ペアのブロックの非圧縮サイズのバケット化されたヒストグラム。

-   **`lightning_chunk_parser_read_block_seconds`** (ヒストグラム)

    データ ファイル パーサーがブロックを読み取るために必要な時間のバケット化されたヒストグラム。

-   **`lightning_checksum_seconds`** (ヒストグラム)

    テーブルのチェックサムを計算するために必要な時間のバケット化されたヒストグラム。

-   **`lightning_apply_worker_seconds`** (ヒストグラム)

    アイドル状態のワーカーを取得するのに必要な時間のバケット化されたヒストグラム ( `lightning_idle_workers`ゲージも参照)。ラベル:

    -   **名前**：
        -   `table`
        -   `index`
        -   `region`
        -   `io`
        -   `closed-engine`
