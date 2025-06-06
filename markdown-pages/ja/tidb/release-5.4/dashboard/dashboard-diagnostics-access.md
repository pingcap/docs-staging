---
title: TiDB Dashboard Cluster Diagnostic Page
summary: Learn how to use the cluster diagnostic page.
---

# TiDBダッシュボードクラスター診断ページ {#tidb-dashboard-cluster-diagnostics-page}

> **警告：**
>
> TiDBダッシュボードの診断はまだ実験的機能です。実稼働環境で使用することはお勧めし**ません**。

TiDBダッシュボードのクラスタ診断機能は、指定された時間範囲内にクラスタに存在する可能性のある問題を診断し、診断結果とクラスター関連の負荷監視情報を診断レポートに要約します。この診断レポートは、Webページの形式です。ブラウザからページを保存した後、オフラインでページを閲覧し、このページのリンクを回覧することができます。

> **ノート：**
>
> クラスタ診断機能は、クラスタにデプロイされたPrometheusに依存します。この監視コンポーネントを展開する方法の詳細については、 [TiUP](/tiup/tiup-overview.md)展開ドキュメントを参照してください。監視コンポーネントがクラスタにデプロイされていない場合、生成された診断レポートは障害を示します。

## ページにアクセスする {#access-the-page}

次のいずれかの方法を使用して、クラスタ診断ページにアクセスできます。

-   TiDBダッシュボードにログインした後、左側のナビゲーションメニューで[**クラスター診断**]をクリックします。

    ![Access Cluster Diagnostics page](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-diagnostics-access.png)

-   ブラウザで`http://127.0.0.1:2379/dashboard/#/diagnose`にアクセスします。 `127.0.0.1:2379`を実際のPDアドレスとポート番号に置き換えます。

## 診断レポートを生成する {#generate-diagnostic-report}

指定した時間範囲内でクラスタを診断し、クラスタの負荷を確認するには、次の手順を実行して診断レポートを生成します。

1.  **範囲開始時刻**を`2020-05-21 14:40:00`などに設定します。
2.  `10 min`などの**範囲期間**を設定します。
3.  [**開始]を**クリックします。

![Generate diagnostic report](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-diagnostics-gen-report.png)

> **ノート：**
>
> レポートの**範囲期間**は1分から60分の間であることが推奨されます。この<strong>範囲期間</strong>は60分を超えることはできません。

上記の手順では、 `2020-05-21 14:40:00`の時間範囲の診断レポートが生成され`2020-05-21 14:50:00` 。 [**スタート**]をクリックすると、以下のインターフェースが表示されます。<strong>進行状況</strong>は、診断レポートの進行状況バーです。レポートが生成されたら、[<strong>完全なレポートを表示</strong>]をクリックします。

![Report progress](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-diagnostics-gen-process.png)

## 比較レポートを生成する {#generate-comparison-report}

QPSジッターや待ち時間の延長など、特定の時点でシステム例外が発生した場合、診断レポートを生成できます。特に、このレポートでは、異常な時間範囲のシステムと正常な時間範囲のシステムを比較します。例えば：

-   異常な時間`2020-05-21 14:45:00` `2020-05-21 14:40:00`この時間範囲内で、システムは異常です。
-   通常の時間`2020-05-21 14:35:00` `2020-05-21 14:30:00`この時間範囲内では、システムは正常です。

次の手順を実行して、上記の2つの時間範囲の比較レポートを生成できます。

1.  **範囲開始時刻**を設定します。これは、システムが異常になる範囲の開始時刻（ `2020-05-21 14:40:00`など）です。
2.  **範囲期間**を設定します。通常、この期間は、5分などのシステム異常の期間です。
3.  **ベースラインによる比較を**有効にします。
4.  **ベースライン範囲開始時刻**を設定します。これは、システムが正常である範囲（比較対象）の開始時刻（ `2020-05-21 14:30:00`など）です。
5.  [**開始]を**クリックします。

![Generate comparison report](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-diagnostics-gen-compare-report.png)

次に、レポートが生成されるのを待ち、[**完全なレポートの表示**]をクリックします。

さらに、履歴診断レポートは、診断レポートのメインページのリストに表示されます。クリックすると、これらの履歴レポートを直接表示できます。
