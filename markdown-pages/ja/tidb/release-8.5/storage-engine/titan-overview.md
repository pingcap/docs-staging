---
title: Titan Overview
summary: Titanstorageエンジンの概要を学習します。
---

# タイタンの概要 {#titan-overview}

[タイタン](https://github.com/pingcap/rocksdb/tree/titan-5.15) 、キーと値の分離のための高性能な[ロックスDB](https://github.com/facebook/rocksdb)プラグインです。Titan は、大きな値が使用される場合に RocksDB での書き込み増幅を減らすことができます。

キーと値のペアの値のサイズが大きい場合 (1 KB または 512 B より大きい)、書き込み、更新、ポイント読み取りのシナリオでは、Titan の方が RocksDB よりもパフォーマンスが優れています。ただし、Titan はstorageスペースと範囲クエリのパフォーマンスを犠牲にして、より高い書き込みパフォーマンスを実現しています。SSD の価格が下がり続けるにつれて、このトレードオフはますます意味のあるものになります。

## 主な特徴 {#key-features}

-   ログ構造マージツリー (LSM ツリー) から値を分離し、個別に保存することで書き込み増幅を削減します。
-   RocksDB インスタンスを Titan にシームレスにアップグレードします。アップグレードには人的介入は必要なく、オンライン サービスにも影響しません。
-   現在の TiKV で使用されているすべての RocksDB 機能との 100% の互換性を実現します。

## 使用シナリオ {#usage-scenarios}

Titan は、大量のデータが TiKV フォアグラウンドに書き込まれるシナリオに適しています。

-   RocksDB は大量の圧縮をトリガーし、大量の I/O 帯域幅または CPU リソースを消費します。これにより、フォアグラウンドの読み取りおよび書き込みパフォーマンスが低下します。
-   RocksDB の圧縮は (I/O 帯域幅の制限または CPU ボトルネックにより) 大幅に遅れ、書き込み停止が頻繁に発生します。
-   RocksDB は大量の圧縮をトリガーし、大量の I/O 書き込みを引き起こし、SSD ディスクの寿命に影響を与えます。

## 前提条件 {#prerequisites}

Titan を有効にするための前提条件は次のとおりです。

-   値の平均サイズが大きいか、すべての大きな値のサイズが合計値のサイズの大部分を占めています。現在、1 KB を超える値のサイズは大きな値と見なされます。状況によっては、この数値 (1 KB) が 512 B になる場合があります。TiKV Raftレイヤーの制限により、TiKV に[`raft-entry-max-size`](/tikv-configuration-file.md#raft-entry-max-size)れる単一の値は 8 MB を超えることができないことに注意してください。1 構成値を調整して、制限を緩和できます。
-   範囲クエリは実行されないか、範囲クエリの高パフォーマンスは必要ありません。Titan に格納されているデータは整然としていないため、範囲クエリのパフォーマンスは RocksDB よりも劣ります。特に、大きな範囲のクエリの場合です。PingCAP の内部テストによると、Titan の範囲クエリのパフォーマンスは RocksDB よりも 40% から数倍低くなります。
-   十分なディスク容量 (同じデータ量で RocksDB ディスク消費量の 2 倍の容量を確保することを検討してください)。これは、Titan がディスク容量を犠牲にして書き込み増幅を減らすためです。さらに、Titan は値を 1 つずつ圧縮するため、圧縮率は RocksDB よりも低くなります。RocksDB はブロックを 1 つずつ圧縮します。そのため、Titan は RocksDB よりも多くのstorage容量を消費しますが、これは予想どおりで正常です。状況によっては、Titan のstorage消費量が RocksDB の 2 倍になることがあります。

v7.6.0 以降では、新しく作成されたクラスターに対して Titan がデフォルトで有効になっています。小さな TiKV 値は RocksDB に保存されたままなので、このシナリオでも Titan を有効にできます。

Titan のパフォーマンスを向上させたい場合は、ブログ投稿[Titan: 書き込み増幅を減らす RocksDB プラグイン](https://pingcap.com/blog/titan-storage-engine-design-and-implementation/)を参照してください。

## アーキテクチャと実装 {#architecture-and-implementation}

次の図は Titan のアーキテクチャを示しています。

![Titan Architecture](https://docs-download.pingcap.com/media/images/docs/titan/titan-1.png)

フラッシュおよび圧縮操作中、Titan は LSM ツリーから値を分離します。このアプローチの利点は、書き込みプロセスが RocksDB と一貫しているため、RocksDB への侵入的な変更の可能性が減ることです。

### ブロブファイル {#blobfile}

Titan は、値ファイルを LSM ツリーから分離すると、その値ファイルを BlobFile に保存します。次の図は、BlobFile 形式を示しています。

![BlobFile Format](https://docs-download.pingcap.com/media/images/docs/titan/titan-2.png)

BLOB ファイルは主に、BLOB レコード、メタ ブロック、メタ インデックス ブロック、およびフッターで構成されます。各ブロック レコードには、キーと値のペアが格納されます。メタ ブロックはスケーラビリティのために使用され、BLOB ファイルに関連するプロパティを格納します。メタ インデックス ブロックは、メタ ブロックの検索に使用されます。

> **注記：**
>
> -   BLOB ファイル内のキーと値のペアは順番に格納されるため、Iterator が実装されると、プリフェッチによって順次読み取りのパフォーマンスが向上します。
> -   各 BLOB レコードには、値に対応するユーザー キーのコピーが保持されます。これにより、Titan がガベージ コレクション (GC) を実行するときに、ユーザー キーを照会して、対応する値が古くなっているかどうかを識別できます。ただし、このプロセスによって書き込み増幅が発生します。
> -   BlobFile は、BLOB レコード レベルでの圧縮をサポートします。Titan は、 [スナッピー](https://github.com/google/snappy) 、 [`lz4`](https://github.com/lz4/lz4) 、 [`zstd`](https://github.com/facebook/zstd)などの複数の圧縮アルゴリズムをサポートします。バージョン 7.6.0 より前のバージョンでは、デフォルトの圧縮アルゴリズムは`lz4`です。バージョン 7.6.0 以降では、デフォルトの圧縮アルゴリズムは`zstd`です。
> -   Snappy 圧縮ファイルは[公式Snappyフォーマット](https://github.com/google/snappy)である必要があります。他のバリアントはサポートされていません。

### Titanテーブルビルダー {#titantablebuilder}

![TitanTableBuilder](https://docs-download.pingcap.com/media/images/docs/titan/titan-3.png)

TitanTableBuilder は、キーと値の分離を実現するための鍵です。TitanTableBuilder は、キー ペアの値のサイズを決定し、それに基づいて、キーと値のペアから値を分離して BLOB ファイルに保存するかどうかを決定します。

-   値のサイズが`min_blob_size`以上の場合、TitanTableBuilder は値を分離して BLOB ファイルに保存します。また、TitanTableBuilder はインデックスを生成して SST に書き込みます。
-   値のサイズが`min_blob_size`より小さい場合、TitanTableBuilder は値を SST に直接書き込みます。

上記のプロセスで Titan を RocksDB にダウングレードすることもできます。RocksDB が圧縮を実行しているときに、分離された値を新しく生成された SST ファイルに書き戻すことができます。

## ガベージコレクション {#garbage-collection}

Titan は、ガベージ コレクション (GC) を使用してスペースを再利用します。LSM ツリーの圧縮でキーが再利用されるときに、BLOB ファイルに格納されている一部の値は同時に削除されません。そのため、Titan は定期的に GC を実行して、古い値を削除する必要があります。Titan は、次の 2 種類の GC を提供します。

-   BLOB ファイルは定期的に統合され、古い値を削除するために書き換えられます。これが GC を実行する通常の方法です。
-   LSM ツリーの圧縮が同時に実行されながら、Blob ファイルが書き換えられます。これがレベル マージの機能です。

### 通常のGC {#regular-gc}

Titan は、RocksDB の TablePropertiesCollector および EventListener コンポーネントを使用して、GC の情報を収集します。

#### テーブルプロパティコレクター {#tablepropertiescollector}

RocksDB は、カスタム テーブル プロパティ コレクターである BlobFileSizeCollector を使用して、対応する SST ファイルに書き込まれる SST からプロパティを収集することをサポートしています。収集されたプロパティは、BlobFileSizeProperties という名前になります。次の図は、BlobFileSizeCollector のワークフローとデータ形式を示しています。

![BlobFileSizeProperties](https://docs-download.pingcap.com/media/images/docs/titan/titan-4.png)

左側は SST インデックス形式です。最初の列は BLOB ファイル ID、2 番目の列は BLOB ファイル内の BLOB レコードのオフセット、3 番目の列は BLOB レコードのサイズです。

右側は BlobFileSizeProperties 形式です。各行は BLOB ファイルと、この BLOB ファイルに保存されるデータの量を表します。最初の列は BLOB ファイル ID、2 番目の列はデータのサイズです。

#### イベントリスナー {#eventlistener}

RocksDB は、圧縮を使用して古いデータを破棄し、スペースを再利用します。各圧縮の後、Titan の一部の BLOB ファイルに、部分的または完全に古いデータが含まれる場合があります。そのため、圧縮イベントをリッスンして GC をトリガーできます。圧縮中に、SST の入力/出力 BLOB ファイルのサイズ プロパティを収集して比較し、どの BLOB ファイルに GC が必要かを判断できます。次の図は、一般的なプロセスを示しています。

![EventListener](https://docs-download.pingcap.com/media/images/docs/titan/titan-5.png)

-   *inputs は、*圧縮に参加するすべての SST の BLOB ファイル サイズのプロパティを表します。
-   *出力は、*圧縮で生成されたすべての SST の BLOB ファイル サイズのプロパティを表します。
-   *破棄可能なサイズは*、入力と出力に基づいて計算された、各 BLOB ファイルに対して破棄されるファイルのサイズです。最初の列は BLOB ファイル ID です。2 番目の列は破棄されるファイルのサイズです。

Titan は、有効な BLOB ファイルごとに、メモリ内に破棄可能なサイズ変数を保持します。各圧縮後、この変数は対応する BLOB ファイルに対して累積されます。GC が開始するたびに、破棄可能なサイズが最も大きい BLOB ファイルが GC の候補ファイルとして選択されます。書き込み増幅を減らすために、一定レベルのスペース増幅が許可されます。つまり、破棄可能なファイルのサイズが特定の割合に達した場合にのみ、BLOB ファイルで GC を開始できます。

選択された BLOB ファイルについて、Titan は各値に対応するキーの BLOB インデックスが存在するか、更新されているかをチェックし、この値が古くなっているかどうかを判断します。値が古くない場合、Titan は値を新しい BLOB ファイルにマージしてソートし、WriteCallback または MergeOperator を使用して更新された BLOB インデックスを SST に書き込みます。次に、Titan は RocksDB の最新のシーケンス番号を記録し、最も古いスナップショットのシーケンスが記録されたシーケンス番号を超えるまで、古い BLOB ファイルを削除しません。これは、BLOB インデックスが SST に書き戻された後も、以前のスナップショットを介して古い BLOB インデックスにアクセスできるためです。したがって、GC が対応する BLOB ファイルを安全に削除する前に、スナップショットが古い BLOB インデックスにアクセスしないようにする必要があります。

### レベルマージ {#level-merge}

レベル マージは Titan で新しく導入されたアルゴリズムです。レベル マージの実装原理に従って、Titan は SST ファイルに対応する BLOB ファイルをマージして書き換え、LSM ツリーで圧縮を実行しながら新しい BLOB ファイルを生成します。次の図は一般的なプロセスを示しています。

![LevelMerge General Process](https://docs-download.pingcap.com/media/images/docs/titan/titan-6.png)

レベル z-1 およびレベル z の SST で圧縮を実行すると、Titan はキーと値のペアを順番に読み書きします。次に、選択した BLOB ファイルの値を新しい BLOB ファイルに順番に書き込み、新しい SST が生成されたときにキーの BLOB インデックスを更新します。圧縮で削除されたキーについては、対応する値は新しい BLOB ファイルに書き込まれません。これは GC と同様に機能します。

通常の GC 方法と比較すると、レベル マージ アプローチでは、LSM ツリーで圧縮が実行されている間に BLOB GC が完了します。この方法では、Titan は LSM ツリーの BLOB インデックスの状態を確認したり、新しい BLOB インデックスを LSM ツリーに書き込んだりする必要がなくなります。これにより、フォアグラウンド操作に対する GC の影響が軽減されます。BLOB ファイルが繰り返し書き換えられると、ファイル同士が重複する数が少なくなり、システム全体の秩序が向上し、スキャンのパフォーマンスが向上します。

ただし、階層化圧縮と同様に BLOB ファイルを階層化すると、書き込み増幅が発生します。LSM ツリーのデータの 99% は最下位の 2 つのレベルに格納されるため、Titan は LSM ツリーの最下位の 2 つのレベルにのみ圧縮されたデータに対応する BLOB ファイルに対してレベル マージ操作を実行します。

#### 範囲結合 {#range-merge}

範囲マージは、レベル マージに基づく GC の最適化されたアプローチです。ただし、次の状況では、LSM ツリーの最下位レベルの順序が悪くなる可能性があります。

-   `level_compaction_dynamic_level_bytes`有効にすると、LSM ツリーの各レベルのデータ量が動的に増加し、最下位レベルでのソート実行が増加し続けます。
-   特定の範囲のデータが頻繁に圧縮され、その範囲内でソートされた実行が多数発生します。

![RangeMerge](https://docs-download.pingcap.com/media/images/docs/titan/titan-7.png)

したがって、ソートされた実行回数を一定のレベル内に維持するには、Range Merge 操作が必要です。OnCompactionComplete の時点で、Titan は範囲内のソートされた実行回数をカウントします。その数が多い場合、Titan は対応する BLOB ファイルを ToMerge としてマークし、次のコンパクションでそれを書き換えます。

### スケールアウトとスケールイン {#scale-out-and-scale-in}

下位互換性のため、スケーリング中の TiKV スナップショットは RocksDB 形式のままです。スケーリングされたノードはすべて最初から RocksDB からのものであるため、古い TiKV ノードよりも高い圧縮率、より小さいストア サイズ、圧縮時の比較的大きい書き込み増幅など、RocksDB の特性を備えています。RocksDB 形式のこれらの SST ファイルは、圧縮後に徐々に Titan 形式に変換されます。

### <code>min-blob-size</code>がパフォーマンスに与える影響 {#impact-of-code-min-blob-size-code-on-performance}

[`min-blob-size`](/tikv-configuration-file.md#min-blob-size) 、値が Titan に格納されるかどうかを決定します。値が`min-blob-size`以上の場合は、Titan に格納されます。それ以外の場合は、ネイティブの RocksDB 形式で格納されます。4 `min-blob-size`小さすぎたり大きすぎたりすると、パフォーマンスに影響します。

次の表は、異なる`min-blob-size`値に基づく YCSB ワークロードの QPS 比較を示しています。テストの各ラウンドで、テスト データの行幅は`min-blob-size`に等しいため、Titan が有効な場合はデータが Titan に保存されます。

| 行幅（バイト） | `Point_Get` | `Point_Get` （タイタン） | スキャン100 | scan100 (タイタン) | スキャン10000 | scan10000 (タイタン) | `UPDATE` | `UPDATE` （タイタン） |
| ------- | ----------- | ------------------ | ------- | -------------- | --------- | ---------------- | -------- | --------------- |
| 1KB     | 139255      | 140486             | 25171   | 21854          | 533       | 175              | 17913    | 30767           |
| 2KB     | 114201      | 124075             | 12466   | 11552          | 249       | 131              | 10369    | 27188           |
| 4KB     | 92385       | 103811             | 7918    | 5937           | 131       | 87               | 5327     | 22653           |
| 8KB     | 104380      | 130647             | 7365    | 5402           | 86.6      | 68               | 3180     | 16745           |
| 16KB    | 54234       | 54600              | 4937    | 5174           | 55.4      | 58.9             | 1753     | 10120           |
| 32KB    | 31035       | 31052              | 2705    | 3422           | 38        | 45.3             | 984      | 5844            |

> **注記：**
>
> `scan100` 100 件のレコードをスキャンすることを意味し、 `scan10000` 10000 件のレコードをスキャンすることを意味します。

表から、行幅が`16KB`の場合、すべての YCSB ワークロードで Titan が RocksDB よりも優れていることがわかります。ただし、 Dumplingの実行など、スキャン負荷が大きい極端なシナリオでは、行幅が`16KB`の場合の Titan のパフォーマンスは 10% 低下します。したがって、ワークロードが主に書き込みとポイント読み取りである場合は、 `min-blob-size`から`1KB`に設定することをお勧めします。ワークロードに多数のスキャンが含まれる場合は、 `min-blob-size`少なくとも`16KB`に設定することをお勧めします。
