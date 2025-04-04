---
title: Key Visualizer Page
summary: TiDB ダッシュボードの Key Visualizer ページでは、TiDB クラスター内のトラフィック ホットスポットを分析してトラブルシューティングを行います。時間の経過に伴うトラフィックの変化を視覚的に表示し、ユーザーは特定の期間または地域範囲を拡大表示できます。このページでは、明るさを調整したり、メトリックを選択したり、ヒートマップを更新したりするための設定も提供されます。一般的なヒートマップの種類を識別し、ホットスポットの問題に対処するためのソリューションを提供します。
---

# キービジュアライザーページ {#key-visualizer-page}

TiDB ダッシュボードの Key Visualizer ページは、TiDB の使用状況を分析し、トラフィックのホットスポットをトラブルシューティングするために使用されます。このページには、一定期間にわたる TiDB クラスターのトラフィックが視覚的に表示されます。

## アクセスキービジュアライザーページ {#access-key-visualizer-page}

Key Visualizer ページにアクセスするには、次の 2 つの方法のいずれかを使用できます。

-   TiDB ダッシュボードにログインしたら、左側のナビゲーション メニューで**Key Visualizer**をクリックします。

    ![Access Key Visualizer](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-access-v650.png)

-   ブラウザで[http://127.0.0.1:2379/dashboard/#/keyviz](http://127.0.0.1:2379/dashboard/#/keyviz)アクセスします。3 `127.0.0.1:2379`実際の PD インスタンスのアドレスとポートに置き換えます。

## インターフェースのデモンストレーション {#interface-demonstration}

次の画像は、Key Visualizer ページのデモです。

![Key Visualizer page](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-overview.png)

上記のインターフェースから、次のオブジェクトを確認できます。

-   時間の経過に伴う全体的なトラフィックの変化を示す大きなヒートマップ。
-   ある座標点の詳細情報。
-   テーブルとインデックスの情報 (ヒートマップの左側)。

## 基本概念 {#basic-concepts}

このセクションでは、Key Visualizer に関連する基本的な概念について説明します。

### リージョン {#region}

TiDB クラスターでは、保存されたデータは TiKV インスタンス間で分散されます。論理的には、TiKV は巨大で整然としたキー値マップです。キー値空間全体は多数のセグメントに分割され、各セグメントは隣接する一連のキーで構成されます。このようなセグメントは`Region`と呼ばれます。

リージョンの詳しい紹介については[TiDB 内部 (I) - データ ストレージ](https://www.pingcap.com/blog/tidb-internal-data-storage/)を参照してください。

### ホットスポット {#hotspot}

TiDB データベースを使用する場合、高トラフィックが狭い範囲のデータに集中するホットスポット問題がよく発生します。連続したデータ範囲が同じ TiKV インスタンスで処理されることが多いため、ホットスポットが発生する TiKV インスタンスがアプリケーション全体のパフォーマンスのボトルネックになります。ホットスポット問題は、次のようなシナリオでよく発生します。

-   主キーが`AUTO_INCREMENT`あるテーブルに隣接するデータを書き込むと、このテーブルでホットスポットの問題が発生します。
-   隣接する時間データをテーブルの時間インデックスに書き込むと、テーブル インデックスでホットスポットの問題が発生します。

ホットスポットの詳細については、 [高度な同時書き込みのベストプラクティス](/best-practices/high-concurrency-best-practices.md#hotspot-causes)を参照してください。

### ヒートマップ {#heatmap}

ヒートマップは Key Visualizer の中核部分であり、時間の経過に伴うメトリックの変化を示します。ヒートマップの X 軸は時間を示します。ヒートマップの Y 軸は、TiDB クラスターのすべてのスキーマとテーブルをカバーするキー範囲に基づいて連続するリージョンを示します。

ヒートマップ内の色が冷たいほど、その期間のリージョンの読み取りおよび書き込みトラフィックが低いことを示します。色が熱い (明るい) ほど、トラフィックが多いことを示します。

### リージョン圧縮 {#region-compression}

TiDB クラスターには、最大数十万のリージョンが存在する場合があります。画面にこれほど多くのリージョンを表示するのは困難です。そのため、各ヒートマップでは、これらのリージョンは 1,500 の連続した範囲に圧縮され、各範囲はバケットと呼ばれます。ヒートマップでは、ホットなインスタンスほど注意が必要なため、Key Visualizer はトラフィックの少ない多数のリージョンを 1 つのバケットに圧縮し、トラフィックの多いリージョンも 1 つのバケットに表示するリージョンがあります。

## キービジュアライザーを使用する {#use-key-visualizer}

このセクションでは、Key Visualizer の使い方を紹介します。

### 設定 {#settings}

Key Visualizer ページを初めて使用する場合は、**設定**ページでこの機能を手動で有効にする必要があります。ページのガイドに従って、[設定を開く] をクリックして設定ページを**開き**ます。

![Feature disabled](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-not-enabled.png)

この機能を有効にすると、右上隅にある**設定**アイコンをクリックして設定ページを開くことができます。

![Settings icon](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-settings-button.png)

設定ページは次のように表示されます。

![Settings page](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-settings.png)

スイッチを介してデータ収集を開始するかどうかを設定し、 **[保存]**をクリックして有効にします。機能を有効にすると、ツールバーが使用可能になります。

![Toolbar](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-toolbar.png)

この機能を有効にすると、バックエンドでデータ収集が行われます。すぐにヒートマップが表示されます。

### 特定の期間またはリージョン範囲を観察する {#observe-a-certain-period-of-time-or-region-range}

Key Visualizer を開くと、デフォルトで過去 6 時間のデータベース全体のヒートマップが表示されます。このヒートマップでは、右側 (現在時刻) に近いほど、バケットの各列に対応する時間間隔が短くなります。特定の期間または特定のリージョン範囲を観察したい場合は、ズームインして詳細を確認できます。具体的な手順は次のとおりです。

1.  ヒートマップを上または下にスクロールします。
2.  範囲を選択するには、次のいずれかのボタンをクリックしてドラッグします。

    -   **[選択とズーム]**ボタンをクリックします。次に、このボタンをクリックしてドラッグし、ズームインする領域を選択します。

    ![Selection box](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-select-zoom.gif)

    -   リージョン範囲をデータベース全体にリセットするには、 **[リセット]**ボタンをクリックします。
    -   **時間選択ボックス**（前のインターフェイスの`6 hour`の位置）をクリックし、観測期間を再度選択します。

    ![Select time](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-select-time.png)

> **注記：**
>
> 上記の手順 2 に従うと、ヒートマップが再描画されますが、元のヒートマップとは大きく異なる可能性があります。この違いは正常です。詳細に観察すると、リージョン圧縮の粒度が変更されたか、特定の範囲の`hot`の基準が変更されたためです。

### 明るさを調整する {#adjust-brightness}

ヒートマップは、異なる明るさの色を使用してバケット トラフィックを示します。ヒートマップの色が寒色系であるほど、その期間のリージョンの読み取りおよび書き込みトラフィックが少ないことを示します。色が暖色系であるほど (明るいほど)、トラフィックが多いことを示します。色が寒色系または暖色系すぎると、詳細を観察することが難しくなります。このような場合は、 **[明るさ**] ボタンをクリックし、スライダーを使用してページの明るさを調整できます。

> **注記：**
>
> Key Visualizer がエリアのヒートマップを表示する場合、そのエリアのトラフィックに応じてコールドとホットの基準を定義します。エリア全体のトラフィックが比較的均一な場合、全体のトラフィックの値が低くても、明るい色の大きなエリアが表示されることがあります。分析にはその値を含めることを忘れないでください。

### 指標を選択 {#select-metrics}

![Select metrics](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-select-type.png)

関心のあるメトリックを表示するには**、メトリック選択ボックス**(上記のインターフェイスの`Write (bytes)`番目の位置) でこのメトリックを選択します。

-   `Read (bytes)` : トラフィックを読み取ります。
-   `Write (bytes)` : トラフィックを書き込みます。
-   `Read (keys)` : 読み取られた行数。
-   `Write (keys)` : 書き込まれた行数。
-   `All` : 読み取りトラフィックと書き込みトラフィックの合計。

### 更新と自動更新 {#refresh-and-automatic-refresh}

現在の時刻に基づいてヒートマップを再度取得するには、 **[更新]**ボタンをクリックします。データベースのトラフィック分布をリアルタイムで観察する必要がある場合は、 **[更新]**ボタンの右側にある下矢印をクリックし、ヒートマップの固定時間間隔を選択して、この間隔で自動的に更新します。

> **注記：**
>
> 時間範囲またはリージョン範囲を調整すると、自動更新は無効になります。

### バケットの詳細を見る {#see-bucket-details}

関心のあるバケットの上にマウスを置くと、そのリージョン範囲の詳細情報が表示されます。次の画像は、この情報の例です。

![Bucket details](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-tooltip.png)

この情報をコピーしたい場合は、バケットをクリックします。すると、関連する詳細を含むページが一時的にピン留めされます。情報をクリックすると、クリップボードにコピーされます。

![Copy Bucket details](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-tooltip-copy.png)

## 一般的なヒートマップの種類 {#common-heatmap-types}

このセクションでは、Key Visualizer の一般的な 4 種類のヒートマップを示し、解釈します。

### 均等に分散された作業負荷 {#evenly-distributed-workload}

![Balanced](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-well-dist.png)

上のヒートマップでは、明るい色と暗い色が細かく混在しています。これは、読み取りまたは書き込みが時間の経過とともに、キー範囲間で均等に分散されていることを示しています。ワークロードはすべてのノードに均等に分散されており、分散データベースに最適です。

### 定期的に読み取りと書き込みを行う {#periodically-reads-and-writes}

![Periodically](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-period.png)

上記のヒートマップでは、X 軸 (時間) に沿って明暗が交互に変化していますが、Y 軸 (リージョン) に沿って明るさは比較的均一です。これは、読み取りと書き込みが定期的に変化することを示しており、これは定期的にスケジュールされたタスクのシナリオで発生する可能性があります。たとえば、ビッグデータ プラットフォームは、毎日定期的に TiDB からデータを抽出します。このようなシナリオでは、ピーク使用時にリソースが十分であるかどうかに注意してください。

### 集中的な読み取りまたは書き込み {#concentrated-reads-or-writes}

![Concentrated](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-continue.png)

上のヒートマップでは、明るい線がいくつか見られます。Y 軸に沿って、明るい線の周りの縁が暗くなっています。これは、明るい線に対応するリージョンで読み取りおよび書き込みトラフィックが高いことを示しています。トラフィックの分散がアプリケーションで想定されているかどうかを観察できます。たとえば、すべてのサービスがユーザー テーブルに関連付けられている場合、ユーザー テーブルの全体的なトラフィックが高くなる可能性があるため、ヒートマップに明るい線を表示するのは妥当です。

さらに、明るい線の高さ (Y 軸に沿った太さ) も重要です。TiKV には独自のリージョンベースのホットスポット分散メカニズムがあるため、ホットスポットに関係するリージョンが多いほど、すべての TiKV インスタンス間でトラフィックを分散させるのに適しています。太くて明るい線が多いほど、ホットスポットがより分散しており、TiKV がより適切に使用されていることを示します。明るい線が細く少ないほど、ホットスポットがより集中しており、TiKV でホットスポットの問題がより顕著であり、手動による介入が必要になる可能性があることを示します。

### 連続読み取りまたは書き込み {#sequential-reads-or-writes}

![Sequential](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-keyviz-sequential.png)

上のヒートマップには、明るい線が見られます。これは、データの読み取りまたは書き込みが連続的であることを意味します。連続的なデータの読み取りまたは書き込みの一般的なシナリオは、データのインポートやテーブルとインデックスのスキャンです。たとえば、自動増分 ID を持つテーブルにデータを継続的に書き込みます。

明るいエリアのリージョンは読み取りおよび書き込みトラフィックのホットスポットであり、多くの場合、クラスター全体のパフォーマンスのボトルネックになります。この状況では、アプリケーションのプライマリキーを再調整する必要がある場合があります。これを行うと、リージョンを可能な限り分散させて、複数のリージョンに負荷を分散できます。また、ピークの少ない期間にアプリケーションタスクをスケジュールすることもできます。

> **注記：**
>
> このセクションでは、一般的なタイプのヒートマップのみを示します。Key Visualizer は実際にはクラスター全体のすべてのスキーマとテーブルのヒートマップを表示するため、領域によって異なるタイプのヒートマップが表示されたり、複数のヒートマップ タイプが混在した結果が表示されたりすることがあります。実際の状況に応じてヒートマップを使用してください。

## ホットスポットの問題に対処する {#address-hotspot-issues}

TiDB には、共通ホットスポットの問題を軽減するための機能がいくつか組み込まれています。詳細については[高度な同時書き込みのベストプラクティス](/best-practices/high-concurrency-best-practices.md)を参照してください。
