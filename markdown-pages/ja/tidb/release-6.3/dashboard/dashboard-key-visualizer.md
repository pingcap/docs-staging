---
title: Key Visualizer Page
summary: Learn how to use Key Visualizer to monitor traffic.
---

# キー ビジュアライザー ページ {#key-visualizer-page}

TiDB ダッシュボードの Key Visualizer ページは、TiDB の使用状況を分析し、トラフィックのホットスポットをトラブルシューティングするために使用されます。このページには、一定期間の TiDB クラスターのトラフィックが視覚的に表示されます。

## Key Visualizer ページにアクセス {#access-key-visualizer-page}

Key Visualizer ページにアクセスするには、次の 2 つの方法のいずれかを使用できます。

-   TiDB ダッシュボードにログインした後、左側のナビゲーション メニューで**Key Visualizer**をクリックします。

![Access Key Visualizer](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-access.png)

-   ブラウザで[http://127.0.0.1:2379/dashboard/#/keyviz](http://127.0.0.1:2379/dashboard/#/keyviz)にアクセスします。 `127.0.0.1:2379`を実際の PD インスタンスのアドレスとポートに置き換えます。

## インターフェイスのデモンストレーション {#interface-demonstration}

次の画像は、キー ビジュアライザー ページのデモです。

![Key Visualizer page](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-overview.png)

上記のインターフェイスから、次のオブジェクトを確認できます。

-   時間の経過に伴う全体的なトラフィックの変化を示す大きなヒートマップ。
-   ある座標点の詳細情報。
-   テーブル、インデックスなどの情報 (ヒートマップの左側)。

## 基本概念 {#basic-concepts}

このセクションでは、Key Visualizer に関連する基本的な概念を紹介します。

### リージョン {#region}

TiDB クラスターでは、格納されたデータは TiKV インスタンス間で分散されます。論理的には、TiKV は巨大で整然としたキーと値のマップです。 Key-Value スペース全体は多くのセグメントに分割され、各セグメントは一連の隣接するキーで構成されます。このようなセグメントは`Region`と呼ばれます。

リージョンの詳細な紹介については、 [TiDB 内部 (I) - データストレージ](https://en.pingcap.com/blog/tidb-internal-data-storage/)を参照してください。

### ホットスポット {#hotspot}

TiDB データベースを使用する場合、ホットスポットの問題は典型的であり、高トラフィックが狭い範囲のデータに集中します。連続するデータ範囲は同じ TiKV インスタンスで処理されることが多いため、ホットスポットが発生する TiKV インスタンスがアプリケーション全体のパフォーマンスのボトルネックになります。ホットスポットの問題は、次のシナリオでよく発生します。

-   主キーが`AUTO_INCREMENT`のテーブルに隣接するデータを書き込むと、このテーブルでホットスポットの問題が発生します。
-   隣接する時間データをテーブルの時間インデックスに書き込みます。これにより、テーブル インデックスでホットスポットの問題が発生します。

ホットスポットの詳細については、 [高度な同時書き込みのベスト プラクティス](/best-practices/high-concurrency-best-practices.md#hotspot-causes)を参照してください。

### ヒートマップ {#heatmap}

ヒートマップはキー ビジュアライザーの中核部分であり、経時的な指標の変化を示します。ヒートマップの X 軸は時間を示します。ヒートマップの Y 軸は、TiDB クラスターのすべてのスキーマとテーブルをカバーするキー範囲に基づく連続したリージョンを示します。

ヒートマップの寒色は、その期間におけるリージョンの読み取りおよび書き込みトラフィックが少ないことを示します。色が熱くなる (明るい) ほど、トラフィックが多いことを示します。

### リージョン圧縮 {#region-compression}

TiDB クラスターには、最大で数十万のリージョンが含まれる場合があります。これだけ多くのリージョンを画面に表示するのは困難です。したがって、各ヒートマップでは、これらのリージョンは 1,500 の連続する範囲に圧縮され、各範囲はバケットと呼ばれます。ヒートマップでは、ホットなインスタンスほど注意が必要なため、Key Visualizer はトラフィックの少ない多数のリージョンを 1 つのバケットに圧縮し、トラフィックの多いリージョンも 1 つのバケットに表示する傾向があります。

## キー ビジュアライザーを使用する {#use-key-visualizer}

このセクションでは、Key Visualizer の使用方法を紹介します。

### 設定 {#settings}

Key Visualizer ページを初めて使用するには、 **[設定]**ページでこの機能を手動で有効にする必要があります。ページ ガイドに従い、[<strong>設定</strong>を開く] をクリックして設定ページを開きます。

![Feature disabled](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-not-enabled.png)

この機能を有効にすると、右上隅の**[設定]**アイコンをクリックして設定ページを開くことができます。

![Settings icon](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-settings-button.png)

設定ページは次のように表示されます。

![Settings page](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-settings.png)

スイッチを介してデータ収集を開始するかどうかを設定し、[**保存**] をクリックして有効にします。この機能を有効にすると、ツールバーが使用可能になることがわかります。

![Toolbar](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-toolbar.png)

この機能を有効にすると、バックエンドでデータ収集が行われます。ヒートマップがすぐに表示されます。

### 一定期間またはリージョン範囲を観察する {#observe-a-certain-period-of-time-or-region-range}

Key Visualizer を開くと、デフォルトで最近 6 時間のデータベース全体のヒートマップが表示されます。このヒートマップでは、右側 (現在の時間) に近づくほど、バケットの各列に対応する時間間隔が短くなります。特定の期間または特定のリージョン範囲を観察したい場合は、ズームインして詳細を取得できます。具体的な指示は次のとおりです。

1.  ヒートマップを上下にスクロールします。
2.  次のいずれかのボタンをクリックしてドラッグし、範囲を選択します。

    -   [**選択してズーム**] ボタンをクリックします。次に、このボタンをクリックしてドラッグし、拡大する領域を選択します。

    ![Selection box](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-select-zoom.gif)

    -   [**リセット**] ボタンをクリックして、リージョン範囲をデータベース全体にリセットします。
    -   **時間選択ボックス**(上のインターフェイスの`6 hours`の位置) をクリックして、観測期間を再度選択します。

    ![Select time](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-select-time.png)

> **ノート：**
>
> 上記の手順 2 に従うと、ヒートマップが再描画され、元のヒートマップとは大きく異なる場合があります。より詳細に観察すると、リージョン圧縮の粒度が変更されたか、特定の範囲の`hot`の基準が変更されたため、この違いは正常です。

### 明るさを調整する {#adjust-brightness}

ヒートマップは、異なる明るさの色を使用してバケット トラフィックを示します。ヒートマップの寒色は、その期間のリージョンの読み取りおよび書き込みトラフィックが少ないことを示します。色が熱くなる (明るい) ほど、トラフィックが多いことを示します。色が寒すぎたり暑すぎたりすると、詳細な観察が困難になります。この場合、[**明るさ**] ボタンをクリックし、スライダーを使用してページの明るさを調整できます。

> **ノート：**
>
> Key Visualizer がエリアのヒートマップを表示すると、そのエリアの交通量に応じて寒さと暑さの基準が定義されます。エリア全体の交通量が比較的均一である場合、全体的な交通量の値が低くても、大きな明るい色のエリアが表示されることがあります。分析に値を含めることを忘れないでください。

### 指標を選択 {#select-metrics}

![Select metrics](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-select-type.png)

**メトリック選択ボックス**(上のインターフェースの`Write (bytes)`番目の位置) でこのメトリックを選択することにより、関心のあるメトリックを表示できます。

-   `Read (bytes)` : 読み取りトラフィック。
-   `Write (bytes)` : 書き込みトラフィック。
-   `Read (keys)` : 読み取った行数。
-   `Write (keys)` : 書き込まれた行数。
-   `All` : 読み取りトラフィックと書き込みトラフィックの合計。

### リフレッシュと自動リフレッシュ {#refresh-and-automatic-refresh}

現在の時刻に基づいてヒートマップを再表示するには、[**更新**] ボタンをクリックします。データベースのトラフィック分布をリアルタイムで観察する必要がある場合は、[<strong>更新</strong>] ボタンの右側にある下矢印をクリックし、ヒートマップがこの間隔で自動的に更新されるように一定の時間間隔を選択します。

> **ノート：**
>
> 時間範囲またはリージョン範囲を調整すると、自動更新は無効になります。

### バケットの詳細を見る {#see-bucket-details}

関心のあるバケットの上にマウスを置くと、このリージョン範囲の詳細情報を表示できます。以下の画像は、この情報の例です。

![Bucket details](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-tooltip.png)

この情報をコピーする場合は、バケットをクリックします。次に、関連する詳細を含むページが一時的に固定されます。情報をクリックすると、クリップボードにコピーされます。

![Copy Bucket details](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-tooltip-copy.png)

## 一般的なヒートマップ タイプ {#common-heatmap-types}

このセクションでは、Key Visualizer の 4 つの一般的なタイプのヒートマップを示して解釈します。

### 均等に分散されたワークロード {#evenly-distributed-workload}

![Balanced](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-well-dist.png)

上のヒートマップでは、明るい色と暗い色がきめの細かい混合になっています。これは、読み取りまたは書き込みが時間の経過とともにキー範囲間で均等に分散されていることを示しています。ワークロードはすべてのノードに均等に分散されます。これは、分散データベースに最適です。

### 定期的に読み書きする {#periodically-reads-and-writes}

![Periodically](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-period.png)

上のヒートマップでは、X 軸 (時間) に沿って明るさと暗さが交互になっていますが、Y 軸 (リージョン) に沿って明るさは比較的均一です。これは、定期的にスケジュールされたタスクのシナリオで発生する可能性がある、読み取りと書き込みが定期的に変化することを示しています。たとえば、ビッグ データ プラットフォームは、TiDB から毎日定期的にデータを抽出します。この種のシナリオでは、ピーク使用時にリソースが十分かどうかに注意してください。

### 集中的な読み取りまたは書き込み {#concentrated-reads-or-writes}

![Concentrated](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-continue.png)

上のヒートマップでは、いくつかの明るい線が見えます。 Y 軸に沿って、明るい線の周りのフリンジは暗く、これは、明るい線に対応するリージョンの読み取りおよび書き込みトラフィックが高いことを示しています。アプリケーションでトラフィックの分散が期待されているかどうかを確認できます。たとえば、すべてのサービスがユーザー テーブルに関連付けられている場合、ユーザー テーブルの全体的なトラフィックが高くなる可能性があるため、ヒートマップに明るい線を表示するのが合理的です。

さらに、輝線の高さ (Y 軸に沿った太さ) も重要です。 TiKV には独自のリージョンベースのホットスポット バランシング メカニズムがあるため、ホットスポットに関与するリージョンが多いほど、すべての TiKV インスタンス間でトラフィックのバランスをとるのに適しています。より太く明るい線は、ホットスポットがより散らばっていることを示しており、TiKV がより適切に使用されています。細くて明るい線が少ないことは、ホットスポットがより集中していることを示しており、ホットスポットの問題は TiKV でより明白であり、手動の介入が必要になる可能性があります。

### 順次読み取りまたは書き込み {#sequential-reads-or-writes}

![Sequential](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-sequential.png)

上のヒートマップでは、明るい線が見えます。これは、データの読み取りまたは書き込みがシーケンシャルであることを意味します。シーケンシャル データの読み取りまたは書き込みの典型的なシナリオは、データのインポートまたはテーブルとインデックスのスキャンです。たとえば、自動インクリメント ID を持つテーブルにデータを継続的に書き込むとします。

明るい領域の領域は、読み取りおよび書き込みトラフィックのホットスポットであり、クラスター全体のパフォーマンスのボトルネックになることがよくあります。この状況では、アプリケーションの主キーを再調整する必要がある場合があります。これにより、リージョンを可能な限り分散させて、複数のリージョンに圧力を分散させます。また、低ピーク時にアプリケーション タスクをスケジュールすることもできます。

> **ノート：**
>
> このセクションでは、一般的なタイプのヒートマップのみを示します。 Key Visualizer は実際にはクラスター全体のすべてのスキーマとテーブルのヒートマップを表示するため、さまざまな領域でさまざまなタイプのヒートマップが表示されたり、複数のヒートマップ タイプの混合結果が表示される場合があります。実際の状況に基づいてヒートマップを使用します。

## ホットスポットの問題に対処する {#address-hotspot-issues}

TiDB には、一般的なホットスポットの問題を軽減するための組み込み機能がいくつかあります。詳細は[高度な同時書き込みのベスト プラクティス](/best-practices/high-concurrency-best-practices.md)を参照してください。
