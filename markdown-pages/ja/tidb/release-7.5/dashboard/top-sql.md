---
title: TiDB Dashboard Top SQL page
summary: TiDBのTop SQLページは、データベース内のSQLステートメントのCPUオーバーヘッドをリアルタイムで監視し、問題を特定するのに役立ちます。特定の期間にわたる高いCPU負荷の原因となっているSQLステートメントを素早く特定し、パフォーマンスの問題を解決できます。また、特定のTiDBまたはTiKVインスタンスのデータの表示を許可します。Top SQLはパフォーマンス以外の問題を特定するためには使用できません。
---

# TiDB ダッシュボードのTop SQLページ {#tidb-dashboard-top-sql-page}

Top SQLを使用すると、データベース内の各 SQL ステートメントの CPU オーバーヘッドをリアルタイムで監視して視覚的に調査できるため、データベースのパフォーマンスの問題を最適化し、解決するのに役立ちます。 Top SQL は、 SQL ステートメントによって要約された CPU 負荷データをすべての TiDB および TiKV インスタンスから任意の秒単位で継続的に収集し、保存します。収集されたデータは最大 30 日間保存できます。 「Top SQL」では、視覚的なチャートと表を表示して、特定の期間にわたる TiDB または TiKV インスタンスの高い CPU 負荷の原因となっている SQL ステートメントを素早く特定します。

Top SQL は次の機能を提供します。

-   CPU オーバーヘッドが最も高い上位 5 種類の SQL ステートメントをグラフと表で視覚化します。
-   1 秒あたりのクエリ、平均レイテンシー、クエリ プランなどの詳細な実行情報を表示します。
-   まだ実行中のものも含め、実行されたすべての SQL ステートメントを収集します。
-   特定の TiDB および TiKV インスタンスのデータの表示を許可します。

## 推奨されるシナリオ {#recommended-scenarios}

Top SQL は、パフォーマンスの問題の分析に適しています。次に、いくつかの典型的なTop SQLシナリオを示します。

-   Grafana グラフから、クラスター内の個々の TiKV インスタンスの CPU 使用率が非常に高いことがわかりました。 CPU ホットスポットを最適化し、すべての分散リソースをより有効に活用できるように、どの SQL ステートメントが CPU ホットスポットの原因となっているのかを知りたいと考えています。
-   クラスター全体の CPU 使用率が非常に高く、クエリが遅いことがわかりました。どの SQL ステートメントが現在 CPU リソースを最も多く消費しているかをすばやく把握し、最適化できるようにしたいと考えています。
-   クラスターの CPU 使用率が大幅に変化したため、主な原因を知りたいと考えています。
-   クラスター内で最もリソースを大量に消費する SQL ステートメントを分析し、それらを最適化してハードウェア コストを削減します。

Top SQL は、不正なデータや異常なクラッシュなど、パフォーマンス以外の問題を正確に特定するために使用することはできません。

Top SQL機能はまだ初期段階にあり、継続的に強化されています。現時点では**サポートされていない**シナリオをいくつか示します。

-   上位 5 以外の SQL ステートメントのオーバーヘッドを分析します (たとえば、複数のビジネス ワークロードが混在している場合)。
-   ユーザーやデータベースなどのさまざまな次元による上位 N SQL ステートメントのオーバーヘッドを分析します。
-   トランザクション ロックの競合など、高い CPU 負荷が原因ではないデータベースのパフォーマンスの問題を分析します。

## ページにアクセスする {#access-the-page}

次のいずれかの方法を使用して、 「Top SQL」ページにアクセスできます。

-   TiDB ダッシュボードにログインした後、左側のナビゲーション メニューで**[Top SQL]**をクリックします。

    ![Top SQL](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-access.png)

-   ブラウザで[http://127.0.0.1:2379/dashboard/#/topsql](http://127.0.0.1:2379/dashboard/#/topsql)にアクセスしてください。 `127.0.0.1:2379`を実際の PD インスタンスのアドレスとポートに置き換えます。

## Top SQLを有効にする {#enable-top-sql}

> **注記：**
>
> Top SQLを使用するには、最新バージョンのTiUP (v1.9.0 以降) またはTiDB Operator (v1.3.0 以降) を使用してクラスターをデプロイまたはアップグレードする必要があります。クラスターが以前のバージョンのTiUPまたはTiDB Operatorを使用してアップグレードされた場合、手順については[FAQ](/dashboard/dashboard-faq.md#a-required-component-ngmonitoring-is-not-started-error-is-shown)を参照してください。

Top SQL は、有効にするとクラスターのパフォーマンスにわずかな影響 (平均 3% 以内) を与えるため、デフォルトでは有効になりません。次の手順でTop SQL を有効にできます。

1.  [Top SQLページ](#access-the-page)にアクセスしてください。
2.  **[設定を開く]**をクリックします。 **[設定]**領域の右側で、 **[機能を有効にする**] をオンにします。
3.  **「保存」**をクリックします。

機能を有効にした後、 Top SQL がデータをロードするまで最大 1 分間待ちます。次に、CPU 負荷の詳細を確認できます。

UI に加えて、TiDB システム変数[`tidb_enable_top_sql`](/system-variables.md#tidb_enable_top_sql-new-in-v540)を設定してTop SQL機能を有効にすることもできます。

```sql
SET GLOBAL tidb_enable_top_sql = 1;
```

## Top SQLを使用する {#use-top-sql}

以下は、 Top SQL を使用するための一般的な手順です。

1.  [Top SQLページ](#access-the-page)にアクセスしてください。

2.  負荷を観察したい特定の TiDB または TiKV インスタンスを選択します。

    ![Select Instance](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-usage-select-instance.png)

    どの TiDB または TiKV インスタンスを観察すればよいかわからない場合は、任意のインスタンスを選択できます。また、クラスターの CPU 負荷が極端に不均衡な場合は、最初に Grafana チャートを使用して、観察する特定のインスタンスを決定できます。

3.  Top SQLによって表示されるグラフと表を観察してください。

    ![Chart and Table](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-usage-chart.png)

    棒グラフの棒のサイズは、その時点で SQL ステートメントによって消費される CPU リソースのサイズを表します。色によって SQL ステートメントの種類が区別されます。ほとんどの場合、グラフ内の対応する時間範囲内で CPU リソースのオーバーヘッドが高い SQL ステートメントに注目するだけで済みます。

4.  表内の SQL ステートメントをクリックすると、詳細が表示されます。 Call/sec (1 秒あたりの平均クエリ数) や Scan Indexes/sec (1 秒あたりにスキャンされたインデックス行の平均数) など、そのステートメントのさまざまなプランの詳細な実行メトリクスを確認できます。

    ![Details](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-details.png)

5.  これらの最初の手がかりに基づいて、 [SQL文](/dashboard/dashboard-statement-list.md)または[遅いクエリ](/dashboard/dashboard-slow-query.md)ページをさらに調査して、CPU 消費量の増加や SQL ステートメントの大規模なデータ スキャンの根本原因を見つけることができます。

さらに、次のようにTop SQLを構成できます。

-   時間ピッカーで時間範囲を調整したり、チャートで時間範囲を選択したりして、問題をより正確かつ詳細に調べることができます。時間範囲を小さくすると、最大 1 秒の精度で、より詳細なデータが得られます。

    ![Change time range](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-usage-change-timerange.png)

-   グラフが古い場合は、 **「更新」**ボタンをクリックするか、 **「更新」**ドロップダウン リストから自動更新オプションを選択できます。

    ![Refresh](https://docs-download.pingcap.com/media/images/docs/dashboard/top-sql-usage-refresh.png)

## Top SQLを無効にする {#disable-top-sql}

次の手順に従って、この機能を無効にできます。

1.  訪問[Top SQLページ](#access-the-page) 。
2.  右上隅にある歯車アイコンをクリックして設定画面を開き、 **[機能を有効にする]**をオフにします。
3.  **「保存」**をクリックします。
4.  ポップアップダイアログボックスで、 **「無効にする」**をクリックします。

UI に加えて、TiDB システム変数[`tidb_enable_top_sql`](/system-variables.md#tidb_enable_top_sql-new-in-v540)を設定してTop SQL機能を無効にすることもできます。

```sql
SET GLOBAL tidb_enable_top_sql = 0;
```

## よくある質問 {#frequently-asked-questions}

**1. Top SQL を有効にできず、UI に「必須コンポーネントNgMonitoring が開始されていません」と表示されます**。

[TiDB ダッシュボードFAQ](/dashboard/dashboard-faq.md#a-required-component-ngmonitoring-is-not-started-error-is-shown)を参照してください。

**2. Top SQL を有効にするとパフォーマンスに影響しますか?**

この機能はクラスターのパフォーマンスにわずかな影響を与えます。弊社のベンチマークによると、この機能が有効になっている場合、平均パフォーマンスへの影響は通常 3% 未満です。

**3. この機能のステータスはどうなっていますか?**

現在、一般提供 (GA) 機能となっており、本番環境で使用できます。

**4. 「その他の発言」とはどういう意味ですか?**

「その他のステートメント」は、上位 5 以外のすべてのステートメントの合計 CPU オーバーヘッドをカウントします。この情報を使用すると、上位 5 つのステートメントが寄与する CPU オーバーヘッドを全体と比較して知ることができます。

**5. Top SQLによって表示される CPU オーバーヘッドとプロセスの実際の CPU 使用率の間にはどのような関係がありますか?**

それらの相関関係は強いですが、まったく同じものではありません。たとえば、複数のレプリカの書き込みコストは、 Top SQLで表示される TiKV CPU オーバーヘッドにはカウントされません。一般に、CPU 使用率が高い SQL ステートメントは、Top SQLに表示される CPU オーバーヘッドも高くなります。

**6.Top SQLチャートの Y 軸の意味は何ですか?**

消費される CPU リソースのサイズを表します。 SQL ステートメントによって消費されるリソースが多いほど、値は高くなります。ほとんどの場合、特定の値の意味や単位を気にする必要はありません。

**7. Top SQL は実行中の (未完了の) SQL ステートメントを収集しますか?**

はい。Top SQLグラフに各瞬間に表示されるバーは、その時点で実行されているすべての SQL ステートメントの CPU オーバーヘッドを示します。
