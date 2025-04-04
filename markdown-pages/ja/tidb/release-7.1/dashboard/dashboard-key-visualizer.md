---
title: Key Visualizer Page
summary: Learn how to use Key Visualizer to monitor traffic.
---

# キービジュアライザーページ {#key-visualizer-page}

TiDB ダッシュボードの Key Visualizer ページは、TiDB の使用状況を分析し、トラフィック ホットスポットのトラブルシューティングを行うために使用されます。このページには、一定期間にわたる TiDB クラスターのトラフィックが視覚的に表示されます。

## Key Visualizer ページにアクセスする {#access-key-visualizer-page}

次の 2 つの方法のいずれかを使用して、Key Visualizer ページにアクセスできます。

-   TiDB ダッシュボードにログインした後、左側のナビゲーション メニューで**[Key Visualizer]**をクリックします。

    ![Access Key Visualizer](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-access-v650.png)

-   ブラウザで[http://127.0.0.1:2379/dashboard/#/keyviz](http://127.0.0.1:2379/dashboard/#/keyviz)にアクセスしてください。 `127.0.0.1:2379`を実際の PD インスタンスのアドレスとポートに置き換えます。

## インターフェイスのデモンストレーション {#interface-demonstration}

次の画像は、Key Visualizer ページのデモです。

![Key Visualizer page](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-overview.png)

前述のインターフェイスから、次のオブジェクトが表示されます。

-   全体的なトラフィックの時間の経過に伴う変化を示す大きなヒートマップ。
-   ある座標点の詳細情報。
-   テーブルとインデックスの情報 (ヒートマップの左側)。

## 基本概念 {#basic-concepts}

このセクションでは、Key Visualizer に関連する基本概念を紹介します。

### リージョン {#region}

TiDB クラスターでは、保存されたデータは TiKV インスタンス間で分散されます。論理的には、TiKV は巨大で整然としたキーと値のマップです。キーと値の空間全体は多くのセグメントに分割され、各セグメントは一連の隣接するキーで構成されます。このようなセグメントは`Region`と呼ばれます。

リージョンの詳細については、 [TiDB 内部 (I) - データ ストレージ](https://en.pingcap.com/blog/tidb-internal-data-storage/)を参照してください。

### ホットスポット {#hotspot}

TiDB データベースを使用すると、狭い範囲のデータに大量のトラフィックが集中するホットスポットの問題が典型的に発生します。連続したデータ範囲は同じ TiKV インスタンス上で処理されることが多いため、ホットスポットが発生する TiKV インスタンスがアプリケーション全体のパフォーマンスのボトルネックになります。ホットスポットの問題は、次のシナリオでよく発生します。

-   隣接するデータを`AUTO_INCREMENT`の主キーを持つテーブルに書き込むと、このテーブルでホットスポットの問題が発生します。
-   隣接する時間データをテーブルの時間インデックスに書き込むと、テーブル インデックスでホットスポットの問題が発生します。

ホットスポットの詳細については、 [高度な同時書き込みのベスト プラクティス](/best-practices/high-concurrency-best-practices.md#hotspot-causes)を参照してください。

### ヒートマップ {#heatmap}

ヒートマップは Key Visualizer の中核部分であり、時間の経過に伴うメトリックの変化を示します。ヒートマップの X 軸は時間を示します。ヒートマップの Y 軸は、TiDB クラスターのすべてのスキーマとテーブルをカバーするキー範囲に基づく連続したリージョンを示します。

ヒートマップ内の寒色は、その期間におけるリージョンの読み取りおよび書き込みトラフィックが少ないことを示します。熱い (明るい) 色は、トラフィックが多いことを示します。

### リージョン圧縮 {#region-compression}

TiDB クラスターには最大数十万のリージョンが含まれる場合があります。非常に多くのリージョンを画面上に表示するのは困難です。したがって、各ヒートマップでは、これらのリージョンは 1,500 の連続した範囲に圧縮され、各範囲はバケットと呼ばれます。ヒートマップでは、ホットなインスタンスほど多くの注意が必要となるため、Key Visualizer はトラフィックの少ない多数のリージョンを 1 つのバケットに圧縮し、トラフィックの多いリージョンも 1 つのバケットに表示する傾向があります。

## キービジュアライザーを使用する {#use-key-visualizer}

Key Visualizerの使い方を紹介します。

### 設定 {#settings}

Key Visualizer ページを初めて使用するには、**設定**ページでこの機能を手動で有効にする必要があります。ページのガイドに従い、 **「設定を開く」**をクリックして設定ページを開きます。

![Feature disabled](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-not-enabled.png)

この機能を有効にすると、右上隅にある**[設定]**アイコンをクリックして設定ページを開くことができます。

![Settings icon](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-settings-button.png)

設定ページは次のように表示されます。

![Settings page](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-settings.png)

スイッチを介してデータ収集を開始するかどうかを設定し、 **[保存]**をクリックして有効にします。機能を有効にすると、ツールバーが使用可能になっていることがわかります。

![Toolbar](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-toolbar.png)

この機能を有効にすると、バックエンドでデータ収集が開始されます。ヒートマップはすぐに表示されます。

### 一定期間またはリージョン範囲を観察する {#observe-a-certain-period-of-time-or-region-range}

Key Visualizer を開くと、デフォルトで最近 6 時間のデータベース全体のヒートマップが表示されます。このヒートマップでは、右側 (現在時刻) に近づくほど、バケットの各列に対応する時間間隔が短くなります。特定の期間または特定のリージョン範囲を観察したい場合は、ズームインして詳細を確認できます。具体的な手順は次のとおりです。

1.  ヒートマップ内を上下にスクロールします。
2.  次のいずれかのボタンをクリックしてドラッグし、範囲を選択します。

    -   **「選択してズーム」**ボタンをクリックします。次に、このボタンをクリックしてドラッグし、ズームインする領域を選択します。

    ![Selection box](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-select-zoom.gif)

    -   **[リセット]**ボタンをクリックして、リージョン範囲をデータベース全体にリセットします。
    -   **時間選択ボックス**(前のインターフェイスの`6 hour`の位置) をクリックし、観測期間を再度選択します。

    ![Select time](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-select-time.png)

> **注記：**
>
> 上記の手順のステップ 2 に従うと、ヒートマップが再描画されますが、元のヒートマップとは大きく異なる可能性があります。さらに詳細に観察すると、リージョン圧縮の粒度が変更されているか、特定の範囲の`hot`の基準が変更されているため、この違いは正常です。

### 明るさを調整する {#adjust-brightness}

ヒートマップでは、異なる明るさの色を使用してバケットのトラフィックを示します。ヒートマップ内の寒色は、その期間におけるリージョンの読み取りおよび書き込みトラフィックが少ないことを示します。熱い (明るい) 色は、トラフィックが多いことを示します。色が寒すぎたり、暑すぎたりすると、細部まで観察することが困難になります。この状況では、 **[明るさ]**ボタンをクリックし、スライダーを使用してページの明るさを調整できます。

> **注記：**
>
> Key Visualizer がエリアのヒートマップを表示するとき、このエリアの交通量に応じて寒さと暑さの基準を定義します。エリア全体のトラフィックが比較的均等な場合、全体のトラフィックの値が低くても、明るい色のエリアが広く表示されることがあります。分析には必ず値を含めてください。

### メトリクスの選択 {#select-metrics}

![Select metrics](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-select-type.png)

**メトリック選択ボックス**(上のインターフェイスの`Write (bytes)`の位置) でこのメトリックを選択すると、関心のあるメトリックを表示できます。

-   `Read (bytes)` : 読み取りトラフィック。
-   `Write (bytes)` : 書き込みトラフィック。
-   `Read (keys)` : 読み取られた行数。
-   `Write (keys)` : 書き込まれた行数。
-   `All` : 読み取りトラフィックと書き込みトラフィックの合計。

### リフレッシュと自動リフレッシュ {#refresh-and-automatic-refresh}

現在の時刻に基づいてヒートマップを再表示するには、 **[更新]**ボタンをクリックします。データベースのトラフィック分布をリアルタイムで観察する必要がある場合は、 **[更新]**ボタンの右側にある下矢印をクリックし、ヒートマップがこの間隔で自動的に更新されるように固定時間間隔を選択します。

> **注記：**
>
> 時間範囲またはリージョン範囲を調整すると、自動更新は無効になります。

### バケットの詳細を参照 {#see-bucket-details}

関心のあるバケットの上にマウスを置くと、このリージョン範囲の詳細情報が表示されます。以下の画像は、この情報の例です。

![Bucket details](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-tooltip.png)

この情報をコピーする場合は、バケットをクリックします。次に、関連する詳細を含むページが一時的に固定されます。情報をクリックすると、情報がクリップボードにコピーされます。

![Copy Bucket details](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-tooltip-copy.png)

## 一般的なヒートマップのタイプ {#common-heatmap-types}

このセクションでは、Key Visualizer の 4 つの一般的なタイプのヒートマップを示し、解釈します。

### 均等に分散されたワークロード {#evenly-distributed-workload}

![Balanced](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-well-dist.png)

上のヒートマップでは、明るい色と暗い色が細かく混合されています。これは、読み取りまたは書き込みが時間の経過とともにキー範囲間で均等に分散されていることを示します。ワークロードはすべてのノードに均等に分散されるため、分散データベースには理想的です。

### 定期的に読み取りと書き込みを行う {#periodically-reads-and-writes}

![Periodically](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-period.png)

上のヒートマップでは、X 軸 (時間) に沿って明暗が交互に現れていますが、Y 軸 (リージョン) に沿った明るさは比較的均一です。これは、読み取りと書き込みが定期的に変更されることを示しており、これは定期的にスケジュールされたタスクのシナリオで発生する可能性があります。たとえば、ビッグ データ プラットフォームは毎日定期的に TiDB からデータを抽出します。この種のシナリオでは、ピーク使用時にリソースが十分であるかどうかに注意してください。

### 集中した読み取りまたは書き込み {#concentrated-reads-or-writes}

![Concentrated](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-continue.png)

上のヒートマップでは、いくつかの明るい線が見られます。 Y 軸に沿って、明るい線の周囲の縁が暗くなります。これは、明るい線に対応する領域の読み取りおよび書き込みトラフィックが高いことを示しています。アプリケーションがトラフィック分散を期待しているかどうかを観察できます。たとえば、すべてのサービスがユーザー テーブルに関連付けられている場合、ユーザー テーブルの全体的なトラフィックが高くなる可能性があるため、ヒートマップに明るい線を表示するのが適切です。

また、輝線の高さ（Y軸方向の太さ）も重要です。 TiKV には独自のリージョンベースのホットスポット分散メカニズムがあるため、ホットスポットに関与するリージョンが増えるほど、すべての TiKV インスタンス間のトラフィックのバランスが向上します。線が太く明るいほど、ホットスポットがより分散していることを示しており、TiKV がよりよく使用されます。輝線が細くて少ないことは、ホットスポットがより集中していることを示しており、TiKV ではホットスポットの問題がより明白であり、手動介入が必要になる可能性があります。

### シーケンシャル読み取りまたは書き込み {#sequential-reads-or-writes}

![Sequential](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-sequential.png)

上のヒートマップでは、明るい線が見られます。これは、データの読み取りまたは書き込みがシーケンシャルであることを意味します。順次データの読み取りまたは書き込みの一般的なシナリオは、データのインポートまたはテーブルとインデックスのスキャンです。たとえば、自動インクリメント ID を使用してテーブルにデータを継続的に書き込みます。

明るい領域の領域は読み取りおよび書き込みトラフィックのホットスポットであり、クラスター全体のパフォーマンスのボトルネックになることがよくあります。この状況では、アプリケーションの主キーを再調整する必要がある場合があります。こうすることで、リージョンをできるだけ分散させて、複数のリージョンに圧力を分散します。低ピーク時間帯にアプリケーション タスクをスケジュールすることもできます。

> **注記：**
>
> このセクションでは、一般的なタイプのヒートマップのみを示します。 Key Visualizer は、実際にはクラスター全体のすべてのスキーマとテーブルのヒートマップを表示するため、異なる領域に異なるタイプのヒートマップが表示されたり、複数のヒートマップ タイプの結果が混在したりする場合があります。実際の状況に基づいてヒートマップを使用します。

## ホットスポットの問題に対処する {#address-hotspot-issues}

TiDB には、一般的なホットスポットの問題を軽減するための機能がいくつか組み込まれています。詳細は[高度な同時書き込みのベスト プラクティス](/best-practices/high-concurrency-best-practices.md)を参照してください。
