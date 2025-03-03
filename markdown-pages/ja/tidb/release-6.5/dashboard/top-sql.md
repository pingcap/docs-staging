---
title: TiDB Dashboard Top SQL page
summary: Learn how to use Top SQL to find SQL statements with high CPU overhead.
---

# TiDB ダッシュボードTop SQLページ {#tidb-dashboard-top-sql-page}

Top SQLを使用すると、データベース内の各 SQL ステートメントの CPU オーバーヘッドをリアルタイムで監視して視覚的に調べることができ、データベースのパフォーマンスの問題を最適化および解決するのに役立ちます。 Top SQL は、すべての TiDB および TiKV インスタンスから任意の秒で SQL ステートメントによって要約された CPU 負荷データを継続的に収集して保存します。収集したデータは最大 30 日間保存できます。 Top SQLは視覚的なチャートと表を提示し、特定の期間に TiDB または TiKV インスタンスの高い CPU 負荷を引き起こしている SQL ステートメントをすばやく特定します。

Top SQL は次の機能を提供します。

-   CPU オーバーヘッドが最も高い上位 5 種類の SQL ステートメントをグラフと表で視覚化します。
-   1 秒あたりのクエリ数、平均レイテンシー、クエリ プランなどの詳細な実行情報を表示します。
-   まだ実行中のものも含め、実行されたすべての SQL ステートメントを収集します。
-   特定の TiDB および TiKV インスタンスのデータを表示できるようにします。

## 推奨されるシナリオ {#recommended-scenarios}

Top SQL は、パフォーマンスの問題を分析するのに適しています。次に、いくつかの一般的なTop SQLシナリオを示します。

-   クラスター内の個々の TiKV インスタンスの CPU 使用率が非常に高いことが、Grafana グラフでわかりました。どの SQL ステートメントが CPU ホットスポットを引き起こしているかを知りたいので、それらを最適化し、すべての分散リソースをより有効に活用できます。
-   クラスターの全体的な CPU 使用率が非常に高く、クエリが遅いことがわかりました。どの SQL ステートメントが現在最も多くの CPU リソースを消費しているかをすばやく把握して、それらを最適化できるようにする必要があります。
-   クラスターの CPU 使用率が大幅に変化し、主な原因を知りたい。
-   クラスター内で最もリソースを集中的に使用する SQL ステートメントを分析し、それらを最適化してハードウェア コストを削減します。

Top SQLを使用して、不正なデータや異常なクラッシュなど、パフォーマンス以外の問題を特定することはできません。

Top SQL機能はまだ初期段階にあり、継続的に強化されています。現時点で**サポートされていない**シナリオは次のとおりです。

-   上位 5 以外の SQL ステートメントのオーバーヘッドを分析する (たとえば、複数のビジネス ワークロードが混在している場合)。
-   ユーザーやデータベースなどのさまざまなディメンションによる上位 N SQL ステートメントのオーバーヘッドの分析。
-   トランザクション ロックの競合など、高い CPU 負荷が原因ではないデータベース パフォーマンスの問題を分析します。

## ページにアクセスする {#access-the-page}

次のいずれかの方法を使用して、Top SQLページにアクセスできます。

-   TiDB ダッシュボードにログインしたら、左側のナビゲーション バーで**[Top SQL]**をクリックします。

    ![Top SQL](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-access.png)

-   ブラウザで[http://127.0.0.1:2379/dashboard/#/topsql](http://127.0.0.1:2379/dashboard/#/topsql)にアクセスします。 `127.0.0.1:2379`を実際の PD インスタンスのアドレスとポートに置き換えます。

## Top SQLを有効にする {#enable-top-sql}

> **ノート：**
>
> Top SQLを使用するには、最新バージョンのTiUP (v1.9.0 以降) またはTiDB Operator (v1.3.0 以降) を使用してクラスターをデプロイまたはアップグレードする必要があります。以前のバージョンのTiUPまたはTiDB Operatorを使用してクラスターをアップグレードした場合は、手順について[FAQ](/dashboard/dashboard-faq.md#a-required-component-ngmonitoring-is-not-started-error-is-shown)を参照してください。

Top SQL は、有効にするとクラスターのパフォーマンスにわずかな影響 (平均で 3% 以内) があるため、デフォルトでは有効になっていません。次の手順でTop SQL を有効にできます。

1.  [Top SQLページ](#access-the-page)ご覧ください。
2.  **[設定を開く]**をクリックします。 <strong>[設定]</strong>領域の右側で、 <strong>[機能を有効にする</strong>] をオンにします。
3.  **[保存]**をクリックします。

この機能を有効にした後、 Top SQL がデータをロードするまで最大 1 分間待ちます。次に、CPU 負荷の詳細を確認できます。

UI に加えて、TiDB システム変数[`tidb_enable_top_sql`](/system-variables.md#tidb_enable_top_sql-new-in-v540)を設定してTop SQL機能を有効にすることもできます。


```sql
SET GLOBAL tidb_enable_top_sql = 1;
```

## Top SQLを使用 {#use-top-sql}

以下は、 Top SQL を使用するための一般的な手順です。

1.  [Top SQLページ](#access-the-page)ご覧ください。

2.  負荷を監視する特定の TiDB または TiKV インスタンスを選択します。

    ![Select Instance](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-usage-select-instance.png)

    どの TiDB または TiKV インスタンスを監視するかわからない場合は、任意のインスタンスを選択できます。また、クラスターの CPU 負荷が極端に不均衡な場合は、最初に Grafana チャートを使用して、観察する特定のインスタンスを決定できます。

3.  Top SQLによって表示されるグラフと表を確認してください。

    ![Chart and Table](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-usage-chart.png)

    棒グラフのバーのサイズは、その時点で SQL ステートメントによって消費される CPU リソースのサイズを表します。さまざまな色によって、さまざまな種類の SQL ステートメントが区別されます。ほとんどの場合、グラフ内の対応する時間範囲で CPU リソースのオーバーヘッドが高い SQL ステートメントにのみ注目する必要があります。

4.  テーブル内の SQL ステートメントをクリックすると、詳細情報が表示されます。 Call/sec (1 秒あたりの平均クエリ数) や Scan Indexes/sec (1 秒あたりにスキャンされるインデックス行の平均数) など、そのステートメントのさまざまなプランの詳細な実行メトリックを確認できます。

    ![Details](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-details.png)

5.  これらの最初の手がかりに基づいて、 [SQL ステートメント](/dashboard/dashboard-statement-list.md)または[遅いクエリ](/dashboard/dashboard-slow-query.md)ページをさらに調べて、CPU の高消費または SQL ステートメントの大量のデータ スキャンの根本原因を見つけることができます。

さらに、Top SQL を次のように構成できます。

-   タイム ピッカーで時間範囲を調整するか、チャートで時間範囲を選択して、問題をより正確かつ詳細に確認できます。時間範囲を狭くすると、最大 1 秒の精度で、より詳細なデータを提供できます。

    ![Change time range](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-usage-change-timerange.png)

-   チャートが古くなっている場合は、 **[更新]**ボタンをクリックするか、 <strong>[更新]</strong>ドロップダウン リストから [自動更新] オプションを選択できます。

    ![Refresh](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-usage-refresh.png)

## Top SQLを無効にする {#disable-top-sql}

次の手順に従って、この機能を無効にすることができます。

1.  [Top SQLページ](#access-the-page)をご覧ください。
2.  右上隅の歯車アイコンをクリックして設定画面を開き、 **Enable Feature**をオフにします。
3.  **[保存]**をクリックします。
4.  表示されたダイアログ ボックスで、 **[無効にする]**をクリックします。

UI に加えて、TiDB システム変数[`tidb_enable_top_sql`](/system-variables.md#tidb_enable_top_sql-new-in-v540)を設定してTop SQL機能を無効にすることもできます。


```sql
SET GLOBAL tidb_enable_top_sql = 0;
```

## よくある質問 {#frequently-asked-questions}

**1.Top SQL を有効にできず、UI に「必要なコンポーネントNgMonitoring が開始されていません」と表示されます**。

[TiDB ダッシュボードFAQ](/dashboard/dashboard-faq.md#a-required-component-ngmonitoring-is-not-started-error-is-shown)を参照してください。

**2. Top SQLを有効にした後、パフォーマンスは影響を受けますか?**

この機能は、クラスターのパフォーマンスにわずかな影響を与えます。ベンチマークによると、この機能が有効になっている場合、平均的なパフォーマンスへの影響は通常 3% 未満です。

**3. この機能のステータスは?**

これは現在、一般提供 (GA) 機能であり、本番環境で使用できます。

**4. 「その他のステートメント」とは何を意味していますか?**

「その他のステートメント」は、上位 5 ステートメント以外のすべてのステートメントの合計 CPU オーバーヘッドをカウントします。この情報を使用すると、上位 5 つのステートメントが寄与する CPU オーバーヘッドを全体と比較して知ることができます。

**5. Top SQLによって表示される CPU オーバーヘッドとプロセスの実際の CPU 使用率との関係は?**

それらの相関関係は強いですが、まったく同じものではありません。たとえば、複数のレプリカを書き込むコストは、 Top SQLによって表示される TiKV CPU オーバーヘッドにはカウントされません。一般に、CPU 使用率が高い SQL ステートメントは、Top SQLに表示される CPU オーバーヘッドが高くなります。

**6.Top SQLチャートの Y 軸の意味は何ですか?**

消費される CPU リソースのサイズを表します。 SQL ステートメントによって消費されるリソースが多いほど、値が高くなります。ほとんどの場合、特定の値の意味や単位を気にする必要はありません。

**7. Top SQL は、実行中の (未完了の) SQL ステートメントを収集しますか?**

はい。各時点でTop SQLチャートに表示されるバーは、その時点で実行中のすべての SQL ステートメントの CPU オーバーヘッドを示します。
