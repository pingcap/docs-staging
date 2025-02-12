---
title: TiDB Dashboard Cluster Diagnostic Page
summary: Learn how to use the cluster diagnostic page.
---

# TiDB ダッシュボードクラスタ診断ページ {#tidb-dashboard-cluster-diagnostics-page}

> **警告：**
>
> TiDB ダッシュボードの診断はまだ実験的機能です。本番環境で使用することはお勧めし**ません**。

TiDB ダッシュボードのクラスター診断機能は、指定された時間範囲内にクラスターに存在する可能性がある問題を診断し、診断結果とクラスター関連の負荷監視情報を診断レポートに要約します。この診断レポートは、Web ページの形式になっています。ブラウザからページを保存した後、オフラインでページを閲覧し、このページのリンクを循環させることができます。

> **ノート：**
>
> クラスター診断機能は、クラスターにデプロイされた Prometheus に依存します。この監視コンポーネントのデプロイ方法の詳細については、 [TiUP](/tiup/tiup-overview.md)デプロイ ドキュメントを参照してください。監視コンポーネントがクラスタにデプロイされていない場合、生成された診断レポートは失敗を示します。

## ページにアクセスする {#access-the-page}

次のいずれかの方法を使用して、クラスター診断ページにアクセスできます。

-   TiDB ダッシュボードにログインした後、左側のナビゲーション メニューで [ **クラスタ Diagnostics** ] をクリックします。

    ![Access Cluster Diagnostics page](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-diagnostics-access.png)

-   ブラウザで`http://127.0.0.1:2379/dashboard/#/diagnose`にアクセスします。 `127.0.0.1:2379`を実際の PD アドレスとポート番号に置き換えます。

## 診断レポートの生成 {#generate-diagnostic-report}

指定された時間範囲内でクラスターを診断し、クラスターの負荷を確認するには、次の手順を実行して診断レポートを生成できます。

1.  **Range Start Time**を`2020-05-21 14:40:00`などに設定します。
2.  **Range Duration**を`10 min`などに設定します。
3.  [**開始] を**クリックします。

![Generate diagnostic report](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-diagnostics-gen-report.png)

> **ノート：**
>
> レポートの [ **Range Duration]**は 1 ～ 60 分にすることをお勧めします。この<strong>範囲期間</strong>は 60 分を超えることはできません。

上記の手順により、 `2020-05-21 14:40:00`から`2020-05-21 14:50:00`までの時間範囲の診断レポートが生成されます。 [**開始**] をクリックすると、以下のインターフェイスが表示されます。 <strong>Progress</strong>は、診断レポートの進行状況バーです。レポートが生成されたら、[ <strong>ビュー Full Report</strong> ] をクリックします。

![Report progress](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-diagnostics-gen-process.png)

## 比較レポートの生成 {#generate-comparison-report}

特定の時点でシステム例外が発生した場合 (たとえば、QPS ジッターや高いレイテンシー)、診断レポートを生成できます。特に、このレポートでは、異常な時間帯のシステムと正常な時間帯のシステムを比較します。例えば：

-   異常時間範囲: `2020-05-21 14:40:00` - `2020-05-21 14:45:00` .この時間範囲内では、システムは異常です。
-   通常の時間範囲: `2020-05-21 14:30:00` - `2020-05-21 14:35:00` .この時間範囲内では、システムは正常です。

次の手順を実行して、上記の 2 つの時間範囲の比較レポートを生成できます。

1.  `2020-05-21 14:40:00`など、システムが異常になる範囲の開始時間である**Range Start Time**を設定します。
2.  **範囲期間**を設定します。通常、この期間は、5 分間などのシステム異常の期間です。
3.  **ベースラインによる比較 を**有効にします。
4.  システムが正常である (比較される) 範囲の**開始時間であるベースライン範囲**の開始時間 ( `2020-05-21 14:30:00`など) を設定します。
5.  [**開始] を**クリックします。

![Generate comparison report](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-diagnostics-gen-compare-report.png)

次に、レポートが生成されるのを待ち、[ **ビュー Full Report** ] をクリックします。

また、履歴診断レポートは、診断レポートのメイン ページのリストに表示されます。クリックして、これらの履歴レポートを直接表示できます。
