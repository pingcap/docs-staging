---
title: Key Visualizer Page
summary: Learn how to use Key Visualizer to monitor traffic.
---

# キービジュアライザーページ {#key-visualizer-page}

TiDBダッシュボードのキービジュアライザーページは、TiDBの使用状況を分析し、トラフィックのホットスポットをトラブルシューティングするために使用されます。このページには、一定期間のTiDBクラスタのトラフィックが視覚的に表示されます。

## キービジュアライザーページにアクセス {#access-key-visualizer-page}

次の2つの方法のいずれかを使用して、KeyVisualizerページにアクセスできます。

-   TiDBダッシュボードにログインした後、左側のナビゲーションメニューで[**キービジュア**ライザー]をクリックします。

![Access Key Visualizer](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-access.png)

-   ブラウザで[http://127.0.0.1:2379/dashboard/#/keyviz](http://127.0.0.1:2379/dashboard/#/keyviz)にアクセスします。 `127.0.0.1:2379`を実際のPDインスタンスのアドレスとポートに置き換えます。

## インターフェイスのデモンストレーション {#interface-demonstration}

次の画像は、KeyVisualizerページのデモンストレーションです。

![Key Visualizer page](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-overview.png)

上記のインターフェイスから、次のオブジェクトを確認できます。

-   時間の経過に伴う全体的なトラフィックの変化を示す大きなヒートマップ。
-   ある座標点の詳細情報。
-   テーブル、インデックスなどの情報（ヒートマップの左側）。

## 基本概念 {#basic-concepts}

このセクションでは、キービジュアライザーに関連する基本的な概念を紹介します。

### 領域 {#region}

TiDBクラスタでは、保存されたデータはTiKVインスタンス間で分散されます。論理的には、TiKVは巨大で整然としたKey-Valueマップです。 Key-Valueスペース全体が多くのセグメントに分割され、各セグメントは一連の隣接するキーで構成されます。このようなセグメントは`Region`と呼ばれます。

リージョンの詳細な紹介については、 [TiDB内部（I）-データストレージ](https://en.pingcap.com/blog/tidb-internal-data-storage/)を参照してください。

### ホットスポット {#hotspot}

TiDBデータベースを使用する場合、ホットスポットの問題が一般的であり、トラフィックが多く、狭い範囲のデータに集中します。連続するデータ範囲は同じTiKVインスタンスで処理されることが多いため、ホットスポットが発生するTiKVインスタンスは、アプリケーション全体のパフォーマンスのボトルネックになります。ホットスポットの問題は、次のシナリオでよく発生します。

-   隣接するデータを`AUTO_INCREMENT`の主キーを使用してテーブルに書き込みます。これにより、このテーブルでホットスポットの問題が発生します。
-   隣接する時間データをテーブルの時間インデックスに書き込みます。これにより、テーブルインデックスでホットスポットの問題が発生します。

ホットスポットの詳細については、 [非常に同時の書き込みのベストプラクティス](/best-practices/high-concurrency-best-practices.md#hotspot-causes)を参照してください。

### ヒートマップ {#heatmap}

ヒートマップはKeyVisualizerのコア部分であり、時間の経過に伴うメトリックの変化を示します。ヒートマップのX軸は時間を示します。ヒートマップのY軸は、TiDBクラスタのすべてのスキーマとテーブルをカバーするキー範囲に基づいた連続するリージョンを示します。

ヒートマップの色が薄いほど、その期間のリージョンの読み取りおよび書き込みトラフィックが少ないことを示します。高温（明るい）の色は、トラフィックが多いことを示します。

### 領域圧縮 {#region-compression}

TiDBクラスタには、最大で数十万のリージョンが含まれる場合があります。画面にこれほど多くの地域を表示することは困難です。したがって、各ヒートマップで、これらのリージョンは1,500の連続した範囲に圧縮され、各範囲はバケットと呼ばれます。ヒートマップでは、よりホットなインスタンスにはより注意が必要なため、Key Visualizerは、トラフィックの少ない多数のリージョンを1つのバケットに圧縮し、トラフィックの多いリージョンも1つのバケットに表示する傾向があります。

## キービジュアライザーを使用する {#use-key-visualizer}

このセクションでは、キービジュアライザーの使用方法を紹介します。

### 設定 {#settings}

Key Visualizerページを初めて使用するには、 **[設定]**ページでこの機能を手動で有効にする必要があります。ページガイドに従い、[<strong>設定</strong>を開く]をクリックして設定ページを開きます。

![Feature disabled](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-not-enabled.png)

この機能を有効にした後、右上隅にある**[設定]**アイコンをクリックして設定ページを開くことができます。

![Settings icon](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-settings-button.png)

設定ページは次のように表示されます。

![Settings page](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-settings.png)

スイッチを介してデータ収集を開始するかどうかを設定し、[**保存**]をクリックして有効にします。この機能を有効にすると、ツールバーが使用可能になっていることがわかります。

![Toolbar](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-toolbar.png)

この機能を有効にすると、バックエンドでデータ収集が行われます。すぐにヒートマップを見ることができます。

### 特定の期間または地域の範囲を観察する {#observe-a-certain-period-of-time-or-region-range}

Key Visualizerを開くと、デフォルトで過去6時間のデータベース全体のヒートマップが表示されます。このヒートマップでは、右側（現在の時間）に近いほど、バケットの各列に対応する時間間隔が短くなります。特定の期間または特定の地域の範囲を観察したい場合は、ズームインして詳細を取得できます。具体的な手順は次のとおりです。

1.  ヒートマップを上下にスクロールします。
2.  次のボタンのいずれかをクリックしてドラッグし、範囲を選択します。

    -   [**選択してズーム**]ボタンをクリックします。次に、このボタンをクリックしてドラッグし、ズームインする領域を選択します。

    ![Selection box](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-select-zoom.gif)

    -   [**リセット**]ボタンをクリックして、リージョン範囲をデータベース全体にリセットします。
    -   **時間選択ボックス**（上のインターフェースの`6 hours`の位置）をクリックして、観測期間を再度選択します。

    ![Select time](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-select-time.png)

> **ノート：**
>
> 上記の手順の手順2に従うと、ヒートマップが再描画されます。これは、元のヒートマップとは大きく異なる場合があります。より詳細に観察すると、領域圧縮の粒度が変更されたか、特定の範囲の`hot`の基準が変更されたため、この違いは正常です。

### 明るさを調整する {#adjust-brightness}

ヒートマップは、さまざまな明るさの色を使用してバケットトラフィックを示します。ヒートマップの色が薄いほど、その期間のリージョンの読み取りおよび書き込みトラフィックが少ないことを示します。高温（明るい）の色は、トラフィックが多いことを示します。色が冷たすぎたり、熱すぎたりすると、詳細に観察するのが難しくなります。この状況では、[**明るさ**]ボタンをクリックしてから、スライダーを使用してページの明るさを調整できます。

> **ノート：**
>
> Key Visualizerがエリアのヒートマップを表示するとき、このエリアのトラフィックに応じて、寒さと暑さの基準を定義します。エリア全体のトラフィックが比較的均一である場合、全体のトラフィックの値が低くても、明るい色の大きなエリアが表示される場合があります。分析に値を含めることを忘れないでください。

### 指標を選択 {#select-metrics}

![Select metrics](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-select-type.png)

**メトリック選択ボックス**（上のインターフェイスの`Write (bytes)`の位置）でこのメトリックを選択すると、関心のあるメトリックを表示できます。

-   `Read (bytes)` ：トラフィックを読み取ります。
-   `Write (bytes)` ：トラフィックを書き込みます。
-   `Read (keys)` ：読み取った行の数。
-   `Write (keys)` ：書き込まれた行の数。
-   `All` ：読み取りトラフィックと書き込みトラフィックの合計。

### 更新と自動更新 {#refresh-and-automatic-refresh}

現在の時刻に基づいてヒートマップを復元するには、[**更新**]ボタンをクリックします。データベースのトラフィック分布をリアルタイムで監視する必要がある場合は、[<strong>更新</strong>]ボタンの右側にある下向き矢印をクリックし、ヒートマップの固定時間間隔を選択して、この間隔で自動的に更新します。

> **ノート：**
>
> 時間範囲または地域範囲を調整すると、自動更新は無効になります。

### バケットの詳細を見る {#see-bucket-details}

関心のあるバケットにマウスを合わせると、このリージョン範囲の詳細情報が表示されます。以下の画像は、この情報の例です。

![Bucket details](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-tooltip.png)

この情報をコピーする場合は、バケットをクリックします。次に、関連する詳細が記載されたページが一時的に固定されます。情報をクリックすると、クリップボードにコピーされます。

![Copy Bucket details](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-tooltip-copy.png)

## 一般的なヒートマップタイプ {#common-heatmap-types}

このセクションでは、KeyVisualizerの4つの一般的なタイプのヒートマップを示して解釈します。

### 均等に分散されたワークロード {#evenly-distributed-workload}

![Balanced](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-well-dist.png)

上記のヒートマップでは、明るい色と暗い色がきめ細かく混ざっています。これは、読み取りまたは書き込みが時間の経過とともにキー範囲間で均等に分散されていることを示しています。ワークロードはすべてのノードに均等に分散されます。これは分散データベースに最適です。

### 定期的に読み取りと書き込み {#periodically-reads-and-writes}

![Periodically](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-period.png)

上記のヒートマップでは、X軸（時間）に沿って明るさと暗さが交互になっていますが、明るさはY軸（領域）に沿って比較的均一です。これは、読み取りと書き込みが定期的に変更されることを示しています。これは、定期的にスケジュールされたタスクのシナリオで発生する可能性があります。たとえば、ビッグデータプラットフォームは、TiDBから毎日定期的にデータを抽出します。この種のシナリオでは、ピーク使用時にリソースが十分であるかどうかに注意してください。

### 集中的な読み取りまたは書き込み {#concentrated-reads-or-writes}

![Concentrated](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-continue.png)

上のヒートマップでは、いくつかの明るい線を見ることができます。 Y軸に沿って、明るい線の周りのフリンジは暗くなります。これは、明るい線に対応する領域の読み取りおよび書き込みトラフィックが多いことを示しています。アプリケーションでトラフィック分散が期待されているかどうかを確認できます。たとえば、すべてのサービスがユーザーテーブルに関連付けられている場合、ユーザーテーブルの全体的なトラフィックが高くなる可能性があるため、ヒートマップに明るい線を表示するのが妥当です。

さらに、輝線の高さ（Y軸に沿った太さ）も重要です。 TiKVには独自のリージョンベースのホットスポットバランシングメカニズムがあるため、ホットスポットに関与するリージョンが多いほど、すべてのTiKVインスタンス間でトラフィックのバランシングに適しています。太くて明るい線は、ホットスポットがより分散していることを示しており、TiKVの方が適しています。細い線と明るい線が少ないことは、ホットスポットがより集中していることを示し、ホットスポットの問題はTiKVでより明白になり、手動による介入が必要になる場合があります。

### シーケンシャル読み取りまたは書き込み {#sequential-reads-or-writes}

![Sequential](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-sequential.png)

上のヒートマップでは、明るい線を見ることができます。これは、データの読み取りまたは書き込みがシーケンシャルであることを意味します。シーケンシャルデータの読み取りまたは書き込みの一般的なシナリオは、データのインポートまたはテーブルとインデックスのスキャンです。たとえば、自動インクリメントIDを使用してテーブルにデータを継続的に書き込みます。

明るい領域の領域は、読み取りおよび書き込みトラフィックのホットスポットであり、クラスタ全体のパフォーマンスのボトルネックになることがよくあります。この状況では、アプリケーションの主キーを再調整する必要がある場合があります。これを行うことにより、リージョンを可能な限り分散させて、複数のリージョンに圧力を分散させます。また、低ピーク期間中にアプリケーションタスクをスケジュールすることもできます。

> **ノート：**
>
> このセクションでは、一般的なタイプのヒートマップのみを示します。 Key Visualizerは、実際にはクラスタ全体のすべてのスキーマとテーブルのヒートマップを表示するため、さまざまな領域にさまざまなタイプのヒートマップが表示されたり、複数のヒートマップタイプの結果が混在したりする場合があります。実際の状況に基づいてヒートマップを使用します。

## ホットスポットの問題に対処する {#address-hotspot-issues}

TiDBには、一般的なホットスポットの問題を軽減するための組み込み機能がいくつかあります。詳細は[非常に同時の書き込みのベストプラクティス](/best-practices/high-concurrency-best-practices.md)を参照してください。
