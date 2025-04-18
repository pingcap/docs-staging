---
title: Titan Overview
summary: Learn the overview of the Titan storage engine.
---

# Titanの概要 {#titan-overview}

[巨人](https://github.com/pingcap/rocksdb/tree/titan-5.15)は、キーと値を分離するための高性能[RocksDB](https://github.com/facebook/rocksdb)プラグインです。 Titanは、大きな値が使用されている場合、RocksDBでの書き込み増幅を減らすことができます。

キーと値のペアの値のサイズが大きい場合（1KBまたは512Bより大きい場合）、Titanは、書き込み、更新、およびポイント読み取りのシナリオでRocksDBよりも優れたパフォーマンスを発揮します。ただし、Titanは、ストレージスペースと範囲クエリのパフォーマンスを犠牲にすることで、書き込みパフォーマンスを向上させます。 SSDの価格が下がり続けるにつれて、このトレードオフはますます意味のあるものになるでしょう。

## 主な機能 {#key-features}

-   ログ構造のマージツリー（LSMツリー）から値を分離し、それらを個別に保存することにより、書き込みの増幅を減らします。
-   RocksDBインスタンスをTitanにシームレスにアップグレードします。アップグレードは人間の介入を必要とせず、オンラインサービスに影響を与えません。
-   現在のTiKVで使用されているすべてのRocksDB機能と100％の互換性を実現します。

## 使用シナリオ {#usage-scenarios}

Titanは、大量のデータがTiKVフォアグラウンドに書き込まれるシナリオに適しています。

-   RocksDBは大量の圧縮をトリガーし、大量のI/O帯域幅またはCPUリソースを消費します。これにより、フォアグラウンドの読み取りおよび書き込みパフォーマンスが低下します。
-   RocksDBの圧縮は（I / O帯域幅の制限またはCPUのボトルネックのために）大幅に遅れており、書き込みストールが頻繁に発生します。
-   RocksDBは大量の圧縮をトリガーします。これにより、大量のI / O書き込みが発生し、SSDディスクの寿命に影響します。

## 前提条件 {#prerequisites}

Titanを有効にするための前提条件は次のとおりです。

-   値の平均サイズが大きいか、すべての大きい値のサイズが合計値サイズの大部分を占めています。現在、1KBを超える値のサイズは大きな値と見なされます。状況によっては、この数値（1 KB）は512 Bになる場合があります。TiKVRaftレイヤーの制限により、TiKVに書き込まれる単一の値が8MBを超えることはできないことに注意してください。 [`raft-entry-max-size`](/tikv-configuration-file.md#raft-entry-max-size)構成値を調整して、制限を緩和できます。
-   範囲クエリは実行されないか、範囲クエリの高性能は必要ありません。 Titanに格納されているデータは順序が正しくないため、範囲クエリのパフォーマンスは、特に広い範囲のクエリの場合、RocksDBのパフォーマンスよりも劣ります。 PingCAPの内部テストによると、Titanの範囲クエリのパフォーマンスはRocksDBのパフォーマンスの40％から数分の1です。
-   十分なディスク容量（同じデータボリュームでRocksDBメモリ消費量の2倍の容量を予約することを検討してください）。これは、Titanがディスクスペースを犠牲にして書き込み増幅を減らすためです。さらに、Titanは値を1つずつ圧縮し、その圧縮率はRocksDBよりも低くなっています。 RocksDBはブロックを1つずつ圧縮します。したがって、TitanはRocksDBよりも多くのストレージスペースを消費しますが、これは予想どおりであり、正常です。状況によっては、Titanのストレージ消費量がRocksDBの2倍になる場合があります。

Titanのパフォーマンスを向上させたい場合は、ブログ投稿[Titan：ライトアンプリフィケーションを減らすためのRocksDBプラグイン](https://pingcap.com/blog/titan-storage-engine-design-and-implementation/)を参照してください。

## アーキテクチャと実装 {#architecture-and-implementation}

次の図は、Titanのアーキテクチャを示しています。

![Titan Architecture](https://docs-download.pingcap.com/media/images/docs/titan/titan-1.png)

フラッシュおよび圧縮操作中に、TitanはLSMツリーから値を分離します。このアプローチの利点は、書き込みプロセスがRocksDBと一貫していることです。これにより、RocksDBへの侵襲的な変更の可能性が減少します。

### BlobFile {#blobfile}

Titanが値ファイルをLSMツリーから分離すると、値ファイルがBlobFileに保存されます。次の図は、BlobFile形式を示しています。

![BlobFile Format](https://docs-download.pingcap.com/media/images/docs/titan/titan-2.png)

BLOBファイルは、主にBLOBレコード、メタブロック、メタインデックスブロック、およびフッターで構成されます。各ブロックレコードには、Key-Valueペアが格納されます。メタブロックはスケーラビリティのために使用され、blobファイルに関連するプロパティを格納します。メタインデックスブロックは、メタブロックの検索に使用されます。

> **ノート：**
>
> -   BLOBファイルのKey-Valueペアは順番に格納されるため、Iteratorを実装すると、プリフェッチによってシーケンシャル読み取りのパフォーマンスを向上させることができます。
> -   各blobレコードは、値に対応するユーザーキーのコピーを保持します。このように、Titanはガベージコレクション（GC）を実行するときに、ユーザーキーを照会し、対応する値が古くなっているかどうかを識別できます。ただし、このプロセスでは、ライトアンプリフィケーションが発生します。
> -   BlobFileは、blobレコードレベルでの圧縮をサポートします。 Titanは、 [スナッピー](https://github.com/google/snappy)などの複数の圧縮アルゴリズムをサポートして[Zstd](https://github.com/facebook/zstd) [LZ4](https://github.com/lz4/lz4) 。現在、Titanが使用するデフォルトの圧縮アルゴリズムはLZ4です。

### TitanTableBuilder {#titantablebuilder}

![TitanTableBuilder](https://docs-download.pingcap.com/media/images/docs/titan/titan-3.png)

TitanTableBuilderは、キーと値の分離を実現するための鍵です。 TitanTableBuilderは、キーペアの値のサイズを決定し、それに基づいて、値をキーと値のペアから分離してblobファイルに保存するかどうかを決定します。

-   値のサイズが`min_blob_size`以上の場合、TitanTableBuilderは値を分離し、blobファイルに保存します。 TitanTableBuilderはインデックスも生成し、SSTに書き込みます。
-   値のサイズが`min_blob_size`より小さい場合、TitanTableBuilderは値をSSTに直接書き込みます。

上記のプロセスで、TitanをRocksDBにダウングレードすることもできます。 RocksDBが圧縮を実行しているときに、分離された値を新しく生成されたSSTファイルに書き戻すことができます。

## ガベージコレクション {#garbage-collection}

タイタンはガベージコレクション（GC）を使用してスペースを再利用します。キーはLSMツリーの圧縮で再利用されるため、blobファイルに格納されている一部の値は同時に削除されません。したがって、Titanは古い値を削除するために定期的にGCを実行する必要があります。 Titanは、次の2種類のGCを提供します。

-   Blobファイルは定期的に統合および書き換えられ、古い値が削除されます。これは、GCを実行する通常の方法です。
-   LSMツリーの圧縮が同時に実行されている間にBLOBファイルが書き換えられます。これがレベルマージの機能です。

### 通常のGC {#regular-gc}

Titanは、RocksDBのTablePropertiesCollectorおよびEventListenerコンポーネントを使用して、GCの情報を収集します。

#### TablePropertiesCollector {#tablepropertiescollector}

RocksDBは、カスタムテーブルプロパティコレクターであるBlobFileSizeCollectorを使用して、対応するSSTファイルに書き込まれるSSTからプロパティを収集することをサポートしています。収集されたプロパティの名前はBlobFileSizePropertiesです。次の図は、BlobFileSizeCollectorのワークフローとデータ形式を示しています。

![BlobFileSizeProperties](https://docs-download.pingcap.com/media/images/docs/titan/titan-4.png)

左側はSSTインデックス形式です。最初の列はblobファイルIDです。 2番目の列は、blobファイル内のblobレコードのオフセットです。 3番目の列はblobレコードサイズです。

右側はBlobFileSizeProperties形式です。各行は、blobファイルと、このblobファイルに保存されるデータの量を表します。最初の列はblobファイルIDです。 2番目の列はデータのサイズです。

#### EventListener {#eventlistener}

RocksDBは、圧縮を使用して古いデータを破棄し、スペースを再利用します。圧縮するたびに、Titanの一部のBLOBファイルに部分的または完全に古いデータが含まれる場合があります。したがって、圧縮イベントをリッスンすることでGCをトリガーできます。圧縮中に、SSTの入力/出力blobファイルサイズプロパティを収集および比較して、GCが必要なblobファイルを判別できます。次の図は、一般的なプロセスを示しています。

![EventListener](https://docs-download.pingcap.com/media/images/docs/titan/titan-5.png)

-   *input*は、圧縮に参加するすべてのSSTのblobファイルサイズプロパティを表します。
-   *出力*は、圧縮で生成されたすべてのSSTのblobファイルサイズプロパティを表します。
-   *破棄可能なサイズ*は、入力と出力に基づいて計算された、blobファイルごとに破棄されるファイルのサイズです。最初の列はblobファイルIDです。 2番目の列は、破棄されるファイルのサイズです。

有効なblobファイルごとに、Titanは破棄可能なサイズ変数をメモリに保持します。各圧縮後、この変数は対応するblobファイルに対して累積されます。 GCが起動するたびに、破棄可能なサイズが最大のblobファイルがGCの候補ファイルとして選択されます。書き込み増幅を減らすために、特定のレベルのスペース増幅が許可されます。つまり、破棄可能なファイルのサイズが特定の比率に達した場合にのみ、BLOBファイルでGCを開始できます。

選択したblobファイルについて、Titanは、各値に対応するキーのblobインデックスが存在するかどうか、またはこの値が古くなっているかどうかを判断するために更新されているかどうかを確認します。値が古くない場合、Titanは値をマージして新しいblobファイルに並べ替え、WriteCallbackまたはMergeOperatorを使用して更新されたblobインデックスをSSTに書き込みます。次に、TitanはRocksDBの最新のシーケンス番号を記録し、最も古いスナップショットのシーケンスが記録されたシーケンス番号を超えるまで、古いblobファイルを削除しません。その理由は、blobインデックスがSSTに書き戻された後も、以前のスナップショットを介して古いblobインデックスにアクセスできるためです。したがって、GCが対応するblobファイルを安全に削除する前に、スナップショットが古いblobインデックスにアクセスしないようにする必要があります。

### レベルマージ {#level-merge}

レベルマージは、Titanで新しく導入されたアルゴリズムです。レベルマージの実装原理に従って、TitanはSSTファイルに対応するblobファイルをマージして再書き込みし、LSMツリーで圧縮が実行されている間に新しいblobファイルを生成します。次の図は、一般的なプロセスを示しています。

![LevelMerge General Process](https://docs-download.pingcap.com/media/images/docs/titan/titan-6.png)

レベルz-1およびレベルzのSSTで圧縮が実行されると、Titanはキーと値のペアを順番に読み書きします。次に、選択したBLOBファイルの値を新しいBLOBファイルに順番に書き込み、新しいSSTが生成されたときにキーのBLOBインデックスを更新します。圧縮で削除されたキーの場合、対応する値は新しいblobファイルに書き込まれません。これはGCと同様に機能します。

GCの通常の方法と比較して、レベルマージアプローチは、LSMツリーで圧縮が実行されている間にブロブGCを完了します。このようにして、TitanはLSMツリーのblobインデックスのステータスを確認したり、新しいblobインデックスをLSMツリーに書き込んだりする必要がなくなりました。これにより、フォアグラウンド操作に対するGCの影響が軽減されます。 BLOBファイルが繰り返し書き換えられるため、重複するファイルが少なくなり、システム全体の順序が改善され、スキャンのパフォーマンスが向上します。

ただし、階層化圧縮と同様にBLOBファイルを階層化すると、書き込みが増幅されます。 LSMツリーのデータの99％が最下位の2つのレベルに格納されているため、Titanは、LSMツリーの最下位の2つのレベルにのみ圧縮されたデータに対応するblobファイルに対してレベルマージ操作を実行します。

#### レンジマージ {#range-merge}

範囲マージは、レベルマージに基づくGCの最適化されたアプローチです。ただし、次の状況では、LSMツリーの最下位レベルの順序が悪くなる可能性があります。

-   `level_compaction_dynamic_level_bytes`を有効にすると、LSMツリーの各レベルでのデータ量が動的に増加し、最下位レベルでの並べ替えられた実行が増加し続けます。
-   特定の範囲のデータが頻繁に圧縮されるため、その範囲で多くの並べ替えられた実行が発生します。

![RangeMerge](https://docs-download.pingcap.com/media/images/docs/titan/titan-7.png)

したがって、ソートされた実行の数を特定のレベル内に維持するには、範囲マージ操作が必要です。 OnCompactionCompleteの時点で、Titanは範囲内のソートされた実行の数をカウントします。数が多い場合、Titanは対応するblobファイルをToMergeとしてマークし、次の圧縮で再書き込みします。
