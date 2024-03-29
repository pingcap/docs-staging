---
title: Optimize Configuration of DM
summary: Learn how to optimize the configuration of the data migration task to improve the performance of data migration.
---

# DM のコンフィグレーションを最適化する {#optimize-configuration-of-dm}

このドキュメントでは、データ移行タスクの構成を最適化して、データ移行のパフォーマンスを向上させる方法を紹介します。

## 完全なデータのエクスポート {#full-data-export}

`mydumpers`はフル データ エクスポートに関連する設定項目です。このセクションでは、パフォーマンス関連のオプションを構成する方法について説明します。

### <code>rows</code> {#code-rows-code}

`rows`オプションを設定すると、マルチスレッドを使用して単一のテーブルから同時にデータをエクスポートできます。値`rows`は、エクスポートされた各チャンクに含まれる行の最大数です。このオプションを有効にすると、MySQL 単一テーブルのデータが同時にエクスポートされるときに、DM は分割ベンチマークとして列を選択します。この列は、主キー列、一意のインデックス列、および通常のインデックス列 (優先順位の高いものから低いものへ) のいずれかになります。この列が整数型であることを確認してください (たとえば、 `INT` 、 `MEDIUMINT` 、 `BIGINT` )。

`rows`の値は 10000 に設定できます。この値は、テーブル内の行の総数とデータベースのパフォーマンスに応じて変更できます。さらに、同時スレッド数を制御するには、 `threads`を設定する必要があります。デフォルトでは、値`threads`は 4 です。この値は必要に応じて調整できます。

### <code>chunk-filesize</code> {#code-chunk-filesize-code}

フル バックアップ中、DM は`chunk-filesize`オプションの値に従って、各テーブルのデータを複数のチャンクに分割します。各チャンクは、約`chunk-filesize`のサイズのファイルに保存されます。このように、データは複数のファイルに分割され、DM Load ユニットの並列処理を使用してインポート速度を向上させることができます。このオプションのデフォルト値は 64 (MB) です。通常、このオプションを設定する必要はありません。設定する場合は、完全なデータのサイズに応じてこのオプションの値を調整してください。

> **ノート：**
>
> -   移行タスクの作成後に値`mydumpers`を更新することはできません。タスクを作成する前に、各オプションの値を確認してください。値を更新する必要がある場合は、dmctl を使用してタスクを停止し、構成ファイルを更新して、タスクを再作成します。
> -   `mydumpers` .簡単にするために、 `threads` `mydumper-thread`構成アイテムに置き換えることができます。
> -   `rows`が設定されている場合、DM は`chunk-filesize`の値を無視します。

## 完全なデータのインポート {#full-data-import}

`loaders`はフル データ インポートに関連する設定項目です。このセクションでは、パフォーマンス関連のオプションを構成する方法について説明します。

### <code>pool-size</code> {#code-pool-size-code}

`pool-size`オプションは、DM Load ユニット内のスレッド数を決定します。デフォルト値は 16 です。通常、このオプションを設定する必要はありません。設定する場合は、完全なデータのサイズとデータベースのパフォーマンスに応じて、このオプションの値を調整してください。

> **ノート：**
>
> -   移行タスクの作成後に値`loaders`を更新することはできません。タスクを作成する前に、各オプションの値を確認してください。値を更新する必要がある場合は、dmctl を使用してタスクを停止し、構成ファイルを更新して、タスクを再作成します。
> -   `loaders` .簡単にするために、 `pool-size` `loader-thread`構成アイテムに置き換えることができます。

## 増分データ複製 {#incremental-data-replication}

`syncers`は増分データ レプリケーションに関連する構成項目です。このセクションでは、パフォーマンス関連のオプションを構成する方法について説明します。

### <code>worker-count</code> {#code-worker-count-code}

`worker-count` DM Sync ユニットでの DML の同時レプリケーションのスレッド数を決定します。デフォルト値は 16 です。データ複製を高速化するには、このオプションの値を適切に増やします。

### <code>batch</code> {#code-batch-code}

`batch` DM 同期ユニット中にデータがダウンストリーム データベースにレプリケートされるときに、各トランザクションに含まれる DML の数を決定します。デフォルト値は 100 です。通常、このオプションの値を変更する必要はありません。

> **ノート：**
>
> -   レプリケーション タスクの作成後に値`syncers`を更新することはできません。タスクを作成する前に、各オプションの値を確認してください。値を更新する必要がある場合は、dmctl を使用してタスクを停止し、構成ファイルを更新して、タスクを再作成します。
> -   `syncers` .簡単にするために、 `worker-count` `syncer-thread`構成アイテムに置き換えることができます。
> -   実際のシナリオに応じて、 `worker-count`と`batch`の値を変更できます。たとえば、DM とダウンストリーム データベース間のネットワーク遅延が大きい場合は、 `worker-count`の値を増やして`batch`の値を適切に減らすことができます。
