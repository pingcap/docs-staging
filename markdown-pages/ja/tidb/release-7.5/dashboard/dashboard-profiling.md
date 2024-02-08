---
title: TiDB Dashboard Instance Profiling - Manual Profiling
summary: Manual Profiling allows users to collect current performance data on demand for TiDB, TiKV, PD, and TiFlash instances. Experts can analyze resource consumption details like CPU and memory to pinpoint ongoing performance problems. Access the page through TiDB Dashboard or a browser. Start profiling by choosing target instances and modify the duration if needed. View real-time progress and download performance data after profiling is completed. View profiling history for detailed operations.
---

# TiDB ダッシュボード インスタンス プロファイリング - 手動プロファイリング {#tidb-dashboard-instance-profiling-manual-profiling}

> **注記：**
>
> この機能はデータベースの専門家向けに設計されています。専門家以外のユーザーの場合は、PingCAP テクニカル サポートの指導の下でこの機能を使用することをお勧めします。

手動プロファイリングを使用すると、ユーザーはワンクリックで各 TiDB、TiKV、PD、およびTiFlashインスタンスの現在のパフォーマンス データを**オンデマンドで**収集できます。収集されたパフォーマンス データは、FlameGraph または DAG として視覚化できます。

これらのパフォーマンス データを使用して、専門家はインスタンスの CPU やメモリなどの現在のリソース消費の詳細を分析し、高い CPU オーバーヘッド、高いメモリ使用量、プロセスの停止など、進行中の高度なパフォーマンス問題を特定するのに役立ちます。

プロファイリングを開始した後、TiDB ダッシュボードは一定期間 (デフォルトでは 30 秒) の間、現在のパフォーマンス データを収集します。したがって、この機能はクラスターが現在直面している進行中の問題を分析するためにのみ使用でき、過去の問題には大きな影響を与えません。パフォーマンス データを**いつでも**収集して分析したい場合は、 [継続的なプロファイリング](/dashboard/continuous-profiling.md)参照してください。

## サポートされているパフォーマンスデータ {#supported-performance-data}

現在、次のパフォーマンス データがサポートされています。

-   CPU: TiDB、TiKV、PD、 TiFlashインスタンスの各内部関数の CPU オーバーヘッド

    > TiKV およびTiFlashインスタンスの CPU オーバーヘッドは、現在 ARMアーキテクチャではサポートされていません。

-   ヒープ: TiDB、TiKV、PD インスタンス上の各内部関数のメモリ消費量

-   Mutex: TiDB および PD インスタンスのミューテックス競合状態

-   Goroutine: TiDB および PD インスタンス上のすべての Goroutine の実行状態とコール スタック

## ページにアクセスする {#access-the-page}

次のいずれかの方法を使用して、インスタンス プロファイリング ページにアクセスできます。

-   TiDB ダッシュボードにログインした後、左側のナビゲーション メニューで**[高度なデバッグ**] &gt; **[プロファイリング インスタンス]** &gt; **[手動プロファイリング]**をクリックします。

    ![Access instance profiling page](https://download.pingcap.com/images/docs/dashboard/dashboard-profiling-access.png)

-   ブラウザで[http://127.0.0.1:2379/dashboard/#/instance_profiling](http://127.0.0.1:2379/dashboard/#/instance_profiling)にアクセスしてください。 `127.0.0.1:2379`を実際の PD インスタンスのアドレスとポートに置き換えます。

## プロファイリングの開始 {#start-profiling}

インスタンス プロファイリング ページで、少なくとも 1 つのターゲット インスタンスを選択し、 **[プロファイリングの開始]**をクリックしてインスタンス プロファイリングを開始します。

![Start instance profiling](https://download.pingcap.com/images/docs/dashboard/dashboard-profiling-start.png)

プロファイリングを開始する前に、プロファイリングの期間を変更できます。この期間は、プロファイリングに必要な時間によって決まります。デフォルトでは 30 秒です。 30 秒の期間が完了するまでに 30 秒かかります。

[継続的なプロファイリング](/dashboard/continuous-profiling.md)が有効になっているクラスターでは手動プロファイリングを開始できません。現時点でのパフォーマンス データを表示するには、 [継続的プロファイリングページ](/dashboard/continuous-profiling.md#access-the-page)で最新のプロファイリング結果をクリックします。

## プロファイリングステータスのビュー {#view-profiling-status}

プロファイリングを開始すると、プロファイリングのステータスと進行状況をリアルタイムで表示できます。

![Profiling detail](https://download.pingcap.com/images/docs/dashboard/dashboard-profiling-view-progress.png)

プロファイリングはバックグラウンドで実行されます。現在のページを更新または終了しても、実行中のプロファイリング タスクは停止しません。

## パフォーマンスデータのダウンロード {#download-performance-data}

すべてのインスタンスのプロファイリングが完了したら、右上隅にある**[プロファイリング結果のダウンロード]**をクリックして、すべてのパフォーマンス データをダウンロードできます。

![Download profiling result](https://download.pingcap.com/images/docs/dashboard/dashboard-profiling-download.png)

テーブル内の個々のインスタンスをクリックして、そのプロファイリング結果を表示することもできます。または、... にカーソルを合わせると、生データをダウンロードできます。

![Single instance result](https://download.pingcap.com/images/docs/dashboard/dashboard-profiling-view-single.png)

## プロファイリング履歴のビュー {#view-profiling-history}

オンデマンド プロファイリング履歴がページにリストされます。行をクリックすると詳細が表示されます。

![View profiling history](https://download.pingcap.com/images/docs/dashboard/dashboard-profiling-history.png)

プロファイリング ステータス ページの詳細な操作については、 [プロファイリングステータスのビュー](#view-profiling-status)を参照してください。
