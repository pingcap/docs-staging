---
title: TiDB Dashboard Top SQL page
summary: TiDB ダッシュボードTop SQLすると、データベース内の SQL ステートメントの CPU オーバーヘッドをリアルタイムで監視および視覚化できます。CPU 負荷の高いステートメントを識別してパフォーマンスを最適化し、詳細な実行情報を提供します。パフォーマンスの問題を分析するのに適しており、TiDB ダッシュボードまたはブラウザからアクセスできます。この機能はクラスターのパフォーマンスにわずかな影響を与えますが、現在、本番での使用に一般提供されています。
---

# TiDBダッシュボードのTop SQLページ {#tidb-dashboard-top-sql-page}

Top SQLを使用すると、データベース内の各 SQL ステートメントの CPU オーバーヘッドをリアルタイムで監視して視覚的に調べることができるため、データベースのパフォーマンスの問題を最適化して解決するのに役立ちます。Top Top SQL は、すべての TiDB および TiKV インスタンスから、任意の秒数の SQL ステートメントで要約された CPU 負荷データを継続的に収集して保存します。収集されたデータは、最大 30 日間保存できます。Top Top SQL は、視覚的なグラフと表を表示して、一定期間にわたって TiDB または TiKV インスタンスの CPU 負荷が高くなっている原因となっている SQL ステートメントをすばやく特定します。

Top SQL は次の機能を提供します。

-   グラフと表を使用して、CPU オーバーヘッドが最も高い上位 5 種類の SQL ステートメントを視覚化します。
-   1 秒あたりのクエリ数、平均レイテンシー、クエリ プランなどの詳細な実行情報を表示します。
-   まだ実行中のものも含め、実行されたすべての SQL ステートメントを収集します。
-   特定の TiDB および TiKV インスタンスのデータを表示できるようにします。

## 推奨シナリオ {#recommended-scenarios}

Top SQL はパフォーマンスの問題を分析するのに適しています。次に、 Top SQL の一般的なシナリオをいくつか示します。

-   Grafana チャートから、クラスター内の個々の TiKV インスタンスの CPU 使用率が非常に高いことがわかりました。どの SQL ステートメントが CPU ホットスポットを引き起こしているかを把握して、それらを最適化し、分散リソース全体をより有効に活用したいと考えています。
-   クラスター全体の CPU 使用率が非常に高く、クエリが遅いことがわかりました。どの SQL ステートメントが現在最も多くの CPU リソースを消費しているかをすぐに把握し、最適化したいと考えています。
-   クラスターの CPU 使用率が大幅に変化したため、その主な原因を知りたいと考えています。
-   クラスター内で最もリソースを消費する SQL ステートメントを分析し、最適化してハードウェア コストを削減します。

Top SQL は、不正なデータや異常なクラッシュなど、パフォーマンス以外の問題を正確に特定するために使用することはできません。

Top SQL機能はまだ初期段階にあり、継続的に強化されています。現時点では**サポートされていない**シナリオをいくつか示します。

-   上位 5 つ以外の SQL ステートメントのオーバーヘッドを分析します (たとえば、複数のビジネス ワークロードが混在している場合)。
-   ユーザーやデータベースなどのさまざまなディメンション別に、上位 N 個の SQL ステートメントのオーバーヘッドを分析します。
-   トランザクション ロックの競合など、CPU の高負荷が原因ではないデータベース パフォーマンスの問題を分析します。

## ページにアクセスする {#access-the-page}

次のいずれかの方法で「Top SQL」ページにアクセスできます。

-   TiDB ダッシュボードにログインしたら、左側のナビゲーション メニューで**「Top SQL」**をクリックします。

    ![Top SQL](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-access.png)

-   ブラウザで[http://127.0.0.1:2379/dashboard/#/topsql](http://127.0.0.1:2379/dashboard/#/topsql)アクセスします。3 `127.0.0.1:2379`実際の PD インスタンスのアドレスとポートに置き換えます。

## Top SQLを有効にする {#enable-top-sql}

> **注記：**
>
> Top SQL を使用するには、クラスターを最新バージョンのTiUP (v1.9.0 以上) またはTiDB Operator (v1.3.0 以上) でデプロイまたはアップグレードする必要があります。クラスターを以前のバージョンのTiUPまたはTiDB Operator を使用してアップグレードした場合は、手順[FAQ](/dashboard/dashboard-faq.md#a-required-component-ngmonitoring-is-not-started-error-is-shown)参照してください。

Top SQL は、有効にするとクラスターのパフォーマンスにわずかな影響 (平均 3% 以内) を与えるため、デフォルトでは有効になっていません。次の手順でTop SQL を有効にできます。

1.  [Top SQLページ](#access-the-page)ご覧ください。
2.  **[設定を開く] を**クリックします。**設定**領域の右側で、 **[機能を有効にする]**をオンにします。
3.  **「保存」**をクリックします。

この機能を有効にした後、 Top SQL がデータをロードするまで最大 1 分間待ちます。その後、CPU 負荷の詳細を確認できます。

UI に加えて、TiDB システム変数[`tidb_enable_top_sql`](/system-variables.md#tidb_enable_top_sql-new-in-v540)設定することでTop SQL機能を有効にすることもできます。

```sql
SET GLOBAL tidb_enable_top_sql = 1;
```

## Top SQLを使用する {#use-top-sql}

Top SQL を使用する一般的な手順は次のとおりです。

1.  [Top SQLページ](#access-the-page)ご覧ください。

2.  負荷を監視する特定の TiDB または TiKV インスタンスを選択します。

    ![Select Instance](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-usage-select-instance.png)

    どの TiDB または TiKV インスタンスを監視すればよいかわからない場合は、任意のインスタンスを選択できます。また、クラスターの CPU 負荷が極端に不均衡な場合は、まず Grafana チャートを使用して、監視する特定のインスタンスを特定できます。

3.  Top SQLが提示するグラフと表を観察します。

    ![Chart and Table](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-usage-chart.png)

    棒グラフの棒のサイズは、その時点で SQL ステートメントによって消費された CPU リソースのサイズを表します。異なる色は、異なるタイプの SQL ステートメントを区別します。ほとんどの場合、グラフの対応する時間範囲で CPU リソースのオーバーヘッドが高い SQL ステートメントにのみ注目する必要があります。

4.  表内の SQL ステートメントをクリックすると、詳細情報が表示されます。そのステートメントのさまざまなプランの詳細な実行メトリック (Call/sec (1 秒あたりの平均クエリ数)、Scan Indexes/sec (1 秒あたりにスキャンされるインデックス行の平均数) など) を確認できます。

    ![Details](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-details.png)

5.  これらの最初の手がかりに基づいて、 [SQL文](/dashboard/dashboard-statement-list.md)または[遅いクエリ](/dashboard/dashboard-slow-query.md)目をさらに調査し、CPU 消費量の増加や SQL ステートメントの大量データ スキャンの根本原因を見つけることができます。

さらに、 Top SQL を次のように構成できます。

-   問題をより正確かつ詳細に把握するには、タイム ピッカーで時間範囲を調整するか、グラフで時間範囲を選択します。時間範囲を狭くすると、最大 1 秒の精度でより詳細なデータが提供されます。

    ![Change time range](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-usage-change-timerange.png)

-   グラフが古い場合は、[**更新]**ボタンをクリックするか、 **[更新]**ドロップダウン リストから [自動更新] オプションを選択できます。

    ![Refresh](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-usage-refresh.png)

## Top SQLを無効にする {#disable-top-sql}

次の手順に従ってこの機能を無効にできます。

1.  訪問[Top SQLページ](#access-the-page) 。
2.  右上隅の歯車アイコンをクリックして設定画面を開き、**機能の有効化**をオフにします。
3.  **「保存」**をクリックします。
4.  ポップアップされたダイアログボックスで、 **[無効にする]**をクリックします。

UI に加えて、TiDB システム変数[`tidb_enable_top_sql`](/system-variables.md#tidb_enable_top_sql-new-in-v540)を設定することでTop SQL機能を無効にすることもできます。

```sql
SET GLOBAL tidb_enable_top_sql = 0;
```

## よくある質問 {#frequently-asked-questions}

**1. Top SQL を有効にできず、UI に「必要なコンポーネントNgMonitoring が開始されていません」と表示されます**。

[TiDBダッシュボードに関するFAQ](/dashboard/dashboard-faq.md#a-required-component-ngmonitoring-is-not-started-error-is-shown)参照。

**2. Top SQL を有効にするとパフォーマンスに影響はありますか?**

この機能はクラスターのパフォーマンスにわずかな影響を及ぼします。当社のベンチマークによると、この機能を有効にした場合の平均パフォーマンスへの影響は通常 3% 未満です。

**3. この機能のステータスはどうなっていますか?**

これは現在、一般提供 (GA) された機能であり、本番環境で使用できます。

**4. 「その他の記述」の意味は何ですか?**

「その他のステートメント」は、上位 5 以外のすべてのステートメントの合計 CPU オーバーヘッドをカウントします。この情報を使用すると、全体と比較して上位 5 のステートメントによって発生した CPU オーバーヘッドを知ることができます。

**5. Top SQLによって表示される CPU オーバーヘッドとプロセスの実際の CPU 使用率との間にはどのような関係がありますか?**

それらの相関関係は強いですが、まったく同じものではありません。たとえば、複数のレプリカを書き込むコストは、 Top SQLによって表示される TiKV CPU オーバーヘッドにはカウントされません。一般に、CPU 使用率が高い SQL ステートメントでは、 Top SQLに表示される CPU オーバーヘッドが高くなります。

**6. Top SQLグラフの Y 軸の意味は何ですか?**

消費された CPU リソースのサイズを表します。SQL ステートメントによって消費されるリソースが多いほど、値は高くなります。ほとんどの場合、特定の値の意味や単位を気にする必要はありません。

**7. Top SQL は実行中の (未完了の) SQL ステートメントを収集しますか?**

はい。各瞬間のTop SQLチャートに表示されるバーは、その瞬間に実行中のすべての SQL ステートメントの CPU オーバーヘッドを示します。
