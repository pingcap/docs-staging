---
title: Titan Overview
summary: タイタンは、RocksDBプラグインであり、大きな値の書き込み増幅を減らすことができます。値のサイズが大きい場合に優れたパフォーマンスを発揮し、TiKVの大量データ書き込みに適しています。ただし、範囲クエリのパフォーマンスは低くなります。Titanを使用するための前提条件は、大きな値の平均サイズが大きいこと、範囲クエリが実行されないこと、十分なディスク容量があることです。また、Titanはガベージコレクションを使用してスペースを再利用し、レベルマージと範囲マージを実行します。
---

# タイタンの概要 {#titan-overview}

[巨人](https://github.com/pingcap/rocksdb/tree/titan-5.15)キーと値を分離するための高性能[ロックスDB](https://github.com/facebook/rocksdb)プラグインです。 Titan は、大きな値が使用された場合に、RocksDB での書き込み増幅を減らすことができます。

Key-Value ペアの値のサイズが大きい (1 KB または 512 B より大きい) 場合、Titan は書き込み、更新、およびポイント読み取りのシナリオで RocksDB よりも優れたパフォーマンスを発揮します。ただし、Titan はstorage領域と範囲クエリのパフォーマンスを犠牲にすることで、より高い書き込みパフォーマンスを実現します。 SSD の価格が下がり続けるにつれて、このトレードオフの意味はますます大きくなります。

## 主な特徴 {#key-features}

-   値をログ構造化マージ ツリー (LSM ツリー) から分離し、個別に保存することで、書き込み増幅を削減します。
-   RocksDB インスタンスを Titan にシームレスにアップグレードします。アップグレードには人間の介入は必要なく、オンライン サービスには影響しません。
-   現在の TiKV で使用されているすべての RocksDB 機能と 100% の互換性を実現します。

## 使用シナリオ {#usage-scenarios}

Titan は、大量のデータが TiKV フォアグラウンドに書き込まれるシナリオに適しています。

-   RocksDB は大量のコンパクションをトリガーし、大量の I/O 帯域幅または CPU リソースを消費します。これにより、フォアグラウンドの読み取りおよび書き込みパフォーマンスが低下します。
-   RocksDB の圧縮は (I/O 帯域幅制限または CPU ボトルネックのため) 大幅に遅れ、頻繁に書き込み停止を引き起こします。
-   RocksDB は大量のコンパクションをトリガーします。これにより、大量の I/O 書き込みが発生し、SSD ディスクの寿命に影響を与えます。

## 前提条件 {#prerequisites}

Titan を有効にするための前提条件は次のとおりです。

-   値の平均サイズが大きいか、すべての大きな値のサイズが合計値サイズの大部分を占めます。現在、1 KB を超える値のサイズは大きな値とみなされます。状況によっては、この数値 (1 KB) は 512 B になることがあります。TiKV Raftレイヤーの制限により、TiKV に書き込まれる単一の値は 8 MB を超えることができないことに注意してください。 [`raft-entry-max-size`](/tikv-configuration-file.md#raft-entry-max-size)構成値を調整して制限を緩和できます。
-   範囲クエリは実行されないか、範囲クエリの高いパフォーマンスは必要ありません。 Titan に保存されているデータは適切に順序付けされていないため、範囲クエリのパフォーマンスは RocksDB のパフォーマンスよりも低く、特に大きな範囲のクエリのパフォーマンスが劣ります。 PingCAP の内部テストによると、Titan の範囲クエリのパフォーマンスは RocksDB のパフォーマンスよりも 40% から数分の 1 低いことがわかっています。
-   十分なディスク容量 (同じデータボリュームで RocksDB のディスク消費量の 2 倍のスペースを予約することを検討してください)。これは、Titan がディスク容量を犠牲にして書き込み増幅を減らすためです。また、Titan は値を 1 つずつ圧縮するため、RocksDB よりも圧縮率が低くなります。 RocksDB はブロックを 1 つずつ圧縮します。したがって、Titan は RocksDB よりも多くのstorageスペースを消費しますが、これは予想されることであり、正常です。状況によっては、Titan のstorage消費量が RocksDB の 2 倍になる可能性があります。

Titan のパフォーマンスを向上させたい場合は、ブログ投稿[Titan: 書き込み増幅を軽減する RocksDB プラグイン](https://pingcap.com/blog/titan-storage-engine-design-and-implementation/)を参照してください。

## アーキテクチャと実装 {#architecture-and-implementation}

次の図は、Titan のアーキテクチャを示しています。

![Titan Architecture](https://docs-download.pingcap.com/media/images/docs/titan/titan-1.png)

フラッシュおよび圧縮操作中に、Titan は LSM ツリーから値を分離します。このアプローチの利点は、書き込みプロセスが RocksDB と一貫しているため、RocksDB に対する侵襲的な変更の可能性が低減されることです。

### BLOBファイル {#blobfile}

Titan は、値ファイルを LSM ツリーから分離するときに、値ファイルを BlobFile に保存します。次の図は、BlobFile 形式を示しています。

![BlobFile Format](https://docs-download.pingcap.com/media/images/docs/titan/titan-2.png)

BLOB ファイルは主に、BLOB レコード、メタ ブロック、メタ インデックス ブロック、およびフッターで構成されます。各ブロック レコードには、キーと値のペアが格納されます。メタ ブロックはスケーラビリティのために使用され、BLOB ファイルに関連するプロパティを保存します。メタ インデックス ブロックは、メタ ブロックの検索に使用されます。

> **注記：**
>
> -   BLOB ファイル内の Key-Value ペアは順番に格納されるため、Iterator を実装すると、プリフェッチによって順次読み取りのパフォーマンスを向上させることができます。
> -   各 BLOB レコードは、値に対応するユーザー キーのコピーを保持します。このようにして、Titan がガベージ コレクション (GC) を実行するときに、ユーザー キーをクエリして、対応する値が古いかどうかを識別できます。ただし、このプロセスでは書き込み増幅が発生します。
> -   BlobFile は、BLOB レコード レベルでの圧縮をサポートしています。 Titan は、 [キビキビ](https://github.com/google/snappy) 、 [LZ4](https://github.com/lz4/lz4) 、 [Zstd](https://github.com/facebook/zstd)などの複数の圧縮アルゴリズムをサポートしています。現在、Titan が使用するデフォルトの圧縮アルゴリズムは LZ4 です。
> -   Snappy 圧縮ファイルは[公式の Snappy フォーマット](https://github.com/google/snappy)に存在する必要があります。 Snappy 圧縮の他のバリアントはサポートされていません。

### TitanTableBuilder {#titantablebuilder}

![TitanTableBuilder](https://docs-download.pingcap.com/media/images/docs/titan/titan-3.png)

TitanTableBuilder は、キーと値の分離を実現するための鍵です。 TitanTableBuilder は、キーと値のペアの値のサイズを決定し、それに基づいて、値をキーと値のペアから分離して BLOB ファイルに格納するかどうかを決定します。

-   値のサイズが`min_blob_size`以上の場合、TitanTableBuilder は値を分割して BLOB ファイルに格納します。 TitanTableBuilder はインデックスも生成し、それを SST に書き込みます。
-   値のサイズが`min_blob_size`より小さい場合、TitanTableBuilder は値を SST に直接書き込みます。

上記のプロセスで Titan を RocksDB にダウングレードすることもできます。 RocksDB が圧縮を実行している場合、分離された値を新しく生成された SST ファイルに書き戻すことができます。

## ガベージコレクション {#garbage-collection}

Titan はガベージ コレクション (GC) を使用してスペースを再利用します。 LSM ツリー圧縮でキーが再利用されるため、BLOB ファイルに格納されている一部の値は同時に削除されません。したがって、Titan は定期的に GC を実行して古い値を削除する必要があります。 Titan は、次の 2 種類の GC を提供します。

-   BLOB ファイルは定期的に統合され、書き換えられて古い値が削除されます。これは GC を実行する通常の方法です。
-   BLOB ファイルは、LSM ツリーの圧縮と同時に書き換えられます。これがレベルマージの機能です。

### 通常の GC {#regular-gc}

Titan は、RocksDB の TablePropertiesCollector コンポーネントと EventListener コンポーネントを使用して GC の情報を収集します。

#### テーブルプロパティコレクター {#tablepropertiescollector}

RocksDB は、カスタム テーブル プロパティ コレクターである BlobFileSizeCollector の使用をサポートし、対応する SST ファイルに書き込まれるプロパティを SST から収集します。収集されたプロパティには BlobFileSizeProperties という名前が付けられます。次の図は、BlobFileSizeCollector のワークフローとデータ形式を示しています。

![BlobFileSizeProperties](https://docs-download.pingcap.com/media/images/docs/titan/titan-4.png)

左側は SST インデックス形式です。最初の列は BLOB ファイル ID です。 2 番目の列は、BLOB ファイル内の BLOB レコードのオフセットです。 3 番目の列は BLOB レコードのサイズです。

右側は BlobFileSizeProperties 形式です。各行は、BLOB ファイルと、この BLOB ファイルに保存されるデータの量を表します。最初の列は BLOB ファイル ID です。 2 番目の列はデータのサイズです。

#### イベントリスナー {#eventlistener}

RocksDB は圧縮を使用して古いデータを破棄し、スペースを再利用します。圧縮するたびに、Titan の一部の BLOB ファイルに部分的または全体的に古いデータが含まれる可能性があります。したがって、圧縮イベントをリッスンすることで GC をトリガーできます。圧縮中に、SST の入力/出力 BLOB ファイル サイズ プロパティを収集および比較して、GC が必要な BLOB ファイルを判断できます。次の図は、一般的なプロセスを示しています。

![EventListener](https://docs-download.pingcap.com/media/images/docs/titan/titan-5.png)

-   *inputs は、*圧縮に参加するすべての SST の BLOB ファイル サイズ プロパティを表します。
-   *出力は、*圧縮で生成されたすべての SST の BLOB ファイル サイズ プロパティを表します。
-   *破棄可能サイズ*は、入力と出力に基づいて計算された、各 BLOB ファイルごとに破棄されるファイルのサイズです。最初の列は BLOB ファイル ID です。 2 番目の列は、破棄されるファイルのサイズです。

Titan は、有効な BLOB ファイルごとに、破棄可能なサイズ変数をメモリ内に保持します。各圧縮の後、この変数は対応する BLOB ファイルに対して蓄積されます。 GC が開始されるたびに、破棄可能なサイズが最大の BLOB ファイルが GC の候補ファイルとして選択されます。書き込み増幅を減らすために、一定レベルのスペース増幅が許可されます。これは、破棄可能なファイルのサイズが特定の割合に達した場合にのみ、BLOB ファイルに対して GC を開始できることを意味します。

Titan は、選択された BLOB ファイルについて、各値に対応するキーの BLOB インデックスが存在するか、または更新されているかをチェックして、この値が古いかどうかを判断します。値が古くない場合、Titan はその値を新しい BLOB ファイルにマージして並べ替え、WriteCallback または MergeOperator を使用して更新された BLOB インデックスを SST に書き込みます。次に、Titan は RocksDB の最新のシーケンス番号を記録し、最も古いスナップショットのシーケンスが記録されたシーケンス番号を超えるまで古い BLOB ファイルを削除しません。その理由は、BLOB インデックスが SST に書き戻された後も、以前のスナップショットを介して古い BLOB インデックスにアクセスできるためです。したがって、GC が対応する BLOB ファイルを安全に削除できるようにするには、スナップショットが古い BLOB インデックスにアクセスしないようにする必要があります。

### レベルマージ {#level-merge}

Level Merge は、Titan に新しく導入されたアルゴリズムです。レベル マージの実装原理に従って、Titan は SST ファイルに対応する BLOB ファイルをマージおよび書き換え、LSM ツリーで圧縮が実行されている間に新しい BLOB ファイルを生成します。次の図は、一般的なプロセスを示しています。

![LevelMerge General Process](https://docs-download.pingcap.com/media/images/docs/titan/titan-6.png)

レベル z-1 とレベル z の SST で圧縮が実行されると、Titan はキーと値のペアを順番に読み取りおよび書き込みます。次に、選択した BLOB ファイルの値を新しい BLOB ファイルに順番に書き込み、新しい SST が生成されるときにキーの BLOB インデックスを更新します。圧縮で削除されたキーの場合、対応する値は新しい BLOB ファイルに書き込まれません。これは GC と同様に機能します。

通常の GC 方法と比較して、レベル マージ アプローチでは、LSM ツリーで圧縮が実行されている間に BLOB GC が完了します。このようにして、Titan は LSM ツリー内の BLOB インデックスのステータスを確認したり、新しい BLOB インデックスを LSM ツリーに書き込んだりする必要がなくなります。これにより、フォアグラウンド操作に対する GC の影響が軽減されます。 BLOB ファイルが繰り返し書き換えられると、互いに重複するファイルが減り、システム全体の状態が良くなり、スキャンのパフォーマンスが向上します。

ただし、階層化圧縮と同様に BLOB ファイルを階層化すると、書き込み増幅が発生します。 LSM ツリー内のデータの 99% は最下位の 2 レベルに格納されるため、Titan は、LSM ツリーの最下位 2 レベルにのみ圧縮されたデータに対応する BLOB ファイルに対してレベル マージ操作を実行します。

#### 範囲の結合 {#range-merge}

範囲マージは、レベル マージに基づいた GC の最適化されたアプローチです。ただし、次の状況では、LSM ツリーの最下位レベルの順序が悪化する可能性があります。

-   `level_compaction_dynamic_level_bytes`を有効にすると、LSM ツリーの各レベルのデータ量が動的に増加し、最下位レベルでソートされた実行が増加し続けます。
-   データの特定の範囲が頻繁に圧縮されるため、その範囲内で大量の並べ替えが実行されます。

![RangeMerge](https://docs-download.pingcap.com/media/images/docs/titan/titan-7.png)

したがって、ソートされた実行数を一定のレベル内に維持するには、範囲マージ操作が必要です。 OnCompactionComplete の時点で、Titan は範囲内でソートされた実行の数をカウントします。この数が大きい場合、Titan は対応する BLOB ファイルを ToMerge としてマークし、次の圧縮で書き換えます。
