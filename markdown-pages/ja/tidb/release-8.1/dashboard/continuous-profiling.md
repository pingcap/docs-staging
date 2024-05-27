---
title: TiDB Dashboard Instance Profiling - Continuous Profiling
summary: TiDB ダッシュボード継続プロファイリングを使用すると、専門家は各インスタンスからパフォーマンス データを継続的に収集して分析できるため、高度なパフォーマンスの問題を特定して解決できます。手動プロファイリングよりも多くのデータが保存されるため、現在の問題と過去の問題の両方を分析できます。この機能はダッシュボードまたはブラウザーからアクセスでき、必要に応じて有効または無効にできます。パフォーマンスへの影響は最小限であるため、本番環境に適しています。
---

# TiDB ダッシュボード インスタンス プロファイリング - 継続的なプロファイリング {#tidb-dashboard-instance-profiling-continuous-profiling}

> **注記：**
>
> この機能はデータベースの専門家向けに設計されています。専門家でないユーザーは、PingCAP テクニカル サポートの指導の下でこの機能を使用することをお勧めします。

継続的プロファイリングにより、各 TiDB、TiKV、PD インスタンスからパフォーマンス データを**継続的に**収集できます。収集されたパフォーマンス データは、FlameGraph または DAG として視覚化できます。

これらのパフォーマンス データを使用すると、専門家はインスタンスの CPU やメモリなどのリソース消費の詳細を分析して、CPU オーバーヘッドの高さ、メモリ使用量の高さ、プロセスの停止など、高度なパフォーマンスの問題をいつでも正確に特定できます。問題を再現できない場合でも、専門家はその時点で収集されたパフォーマンス履歴データを表示して、問題を深く掘り下げることができます。このようにして、MTTR を効果的に削減できます。

## 手動プロファイリングと比較 {#compare-with-manual-profiling}

継続的プロファイリングは[手動プロファイリング](/dashboard/dashboard-profiling.md)の拡張機能です。どちらも各インスタンスのさまざまな種類のパフォーマンス データを収集および分析するために使用できます。それらの違いは次のとおりです。

-   手動プロファイリングでは、プロファイリングを開始した瞬間に短期間 (たとえば、30 秒) のみパフォーマンス データが収集されますが、継続的プロファイリングは有効になっている場合に継続的にデータを収集します。
-   手動プロファイリングは現在発生している問題を分析するためにのみ使用できますが、継続的プロファイリングは現在の問題と履歴の問題の両方を分析するために使用できます。
-   手動プロファイリングでは特定のインスタンスの特定のパフォーマンス データを収集できますが、継続的プロファイリングではすべてのインスタンスのすべてのパフォーマンス データを収集します。
-   継続的なプロファイリングではより多くのパフォーマンス データが保存されるため、より多くのディスク領域を占有します。

## サポートされているパフォーマンスデータ {#supported-performance-data}

[手動プロファイリング](/dashboard/dashboard-profiling.md#supported-performance-data)のすべてのパフォーマンス データが収集されます。

-   CPU: TiDB、TiKV、 TiFlash、PDインスタンスの各内部関数のCPUオーバーヘッド

-   ヒープ: TiDB、TiKV、PDインスタンス上の各内部関数のメモリ消費量

-   ミューテックス: TiDBおよびPDインスタンス上のミューテックスの競合状態

-   Goroutine: TiDB および PD インスタンス上のすべての Goroutine の実行状態と呼び出しスタック

## ページにアクセスする {#access-the-page}

次のいずれかの方法で継続的プロファイリング ページにアクセスできます。

-   TiDB ダッシュボードにログインしたら、左側のナビゲーション メニューで**[高度なデバッグ]** &gt; **[インスタンスのプロファイリング]** &gt; **[継続的なプロファイリング**] をクリックします。

    ![Access page](https://download.pingcap.com/images/docs/dashboard/dashboard-conprof-access.png)

-   ブラウザで[http://127.0.0.1:2379/ダッシュボード/#/継続的なプロファイリング](http://127.0.0.1:2379/dashboard/#/continuous_profiling)アクセスします。3 `127.0.0.1:2379`実際の PD インスタンスのアドレスとポートに置き換えます。

## 継続的なプロファイリングを有効にする {#enable-continuous-profiling}

> **注記：**
>
> 継続的プロファイリングを使用するには、クラスターを最新バージョンのTiUP (v1.9.0 以上) またはTiDB Operator (v1.3.0 以上) でデプロイまたはアップグレードする必要があります。クラスターを以前のバージョンのTiUPまたはTiDB Operatorを使用してアップグレードした場合は、手順[FAQ](/dashboard/dashboard-faq.md#a-required-component-ngmonitoring-is-not-started-error-is-shown)参照してください。

継続的プロファイリングを有効にすると、Web ページを常にアクティブにしなくても、バックグラウンドでパフォーマンス データを継続的に収集できます。収集されたデータは一定期間保持され、期限切れのデータは自動的にクリアされます。

この機能を有効にするには:

1.  [継続的プロファイリングページ](#access-the-page)ご覧ください。
2.  **「設定を開く」**をクリックします。右側の**設定**領域で、 **「機能の有効化」**をオンにし、必要に応じて**「保存期間」**のデフォルト値を変更します。
3.  **「保存」を**クリックします。

![Enable feature](https://download.pingcap.com/images/docs/dashboard/dashboard-conprof-start.png)

## 現在のパフォーマンスデータをビュー {#view-current-performance-data}

継続的なプロファイリングが有効になっているクラスターでは、手動プロファイリングを開始できません。現時点でのパフォーマンス データを表示するには、最新のプロファイリング結果をクリックするだけです。

## 過去のパフォーマンスデータをビュー {#view-historical-performance-data}

リスト ページでは、この機能を有効にしてから収集されたすべてのパフォーマンス データを確認できます。

![History results](https://download.pingcap.com/images/docs/dashboard/dashboard-conprof-history.png)

## パフォーマンスデータをダウンロード {#download-performance-data}

プロファイリング結果ページで、右上隅の**「プロファイリング結果のダウンロード」**をクリックすると、すべてのプロファイリング結果をダウンロードできます。

![Download profiling result](https://download.pingcap.com/images/docs/dashboard/dashboard-conprof-download.png)

表内の個々のインスタンスをクリックして、そのプロファイリング結果を表示することもできます。または、... にマウスを移動して生データをダウンロードすることもできます。

![View profiling result](https://download.pingcap.com/images/docs/dashboard/dashboard-conprof-single.png)

## 継続的なプロファイリングを無効にする {#disable-continuous-profiling}

1.  [継続的プロファイリングページ](#access-the-page)ご覧ください。
2.  右上隅の歯車アイコンをクリックして設定ページを開きます。 **[機能の有効化]**をオフにします。
3.  **「保存」を**クリックします。
4.  ポップアップされたダイアログボックスで、 **[無効にする]**をクリックします。

![Disable feature](https://download.pingcap.com/images/docs/dashboard/dashboard-conprof-stop.png)

## よくある質問 {#frequently-asked-questions}

**1. 継続的なプロファイリングを有効にできず、UI に「必要なコンポーネントNgMonitoring が開始されていません」と表示されます**。

[TiDBダッシュボードに関するFAQ](/dashboard/dashboard-faq.md#a-required-component-ngmonitoring-is-not-started-error-is-shown)参照。

**2. 継続的プロファイリングを有効にするとパフォーマンスに影響はありますか?**

当社のベンチマークによると、この機能を有効にした場合の平均パフォーマンスへの影響は 1% 未満です。

**3. この機能のステータスはどうなっていますか?**

これは現在、一般提供 (GA) された機能であり、本番環境で使用できます。
