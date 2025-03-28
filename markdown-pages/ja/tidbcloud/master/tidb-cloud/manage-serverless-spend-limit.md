---
title: Manage Spending Limit for TiDB Cloud Serverless Scalable Clusters
summary: TiDB Cloud Serverless スケーラブル クラスターの支出制限を管理する方法を学びます。
---

# TiDB Cloudサーバーレス スケーラブル クラスターの支出制限を管理する {#manage-spending-limit-for-tidb-cloud-serverless-scalable-clusters}

> **注記：**
>
> 使用制限はTiDB Cloud Serverless [スケーラブルなクラスター](/tidb-cloud/select-cluster-tier.md#scalable-cluster-plan)にのみ適用されます。

支出限度額とは、1 か月に特定のワークロードに費やせる最大金額を指します。これは、 TiDB Cloud Serverless スケーラブル クラスターの予算を設定できるコスト管理メカニズムです。

TiDB Cloudの各組織では、デフォルトで最大 5 [フリークラスター](/tidb-cloud/select-cluster-tier.md#free-cluster-plan)のクラスターを作成できます。TiDB TiDB Cloud Serverless クラスターをさらに作成するには、クレジットカードを追加し、使用に合わせてスケーラブルなクラスターを作成する必要があります。ただし、クラスターをさらに作成する前に以前のクラスターの一部を削除すれば、クレジットカードがなくても新しいクラスターを作成できます。

## 使用量制限 {#usage-quota}

組織内の最初の 5 つのTiDB Cloud Serverless クラスターについては、無料かスケーラブルかに関係なく、 TiDB Cloud はそれぞれに対して次のように無料使用量の割り当てを提供します。

-   行ベースのstorage: 5 GiB
-   列指向storage: 5 GiB
-   [リクエストユニット (RU)](/tidb-cloud/tidb-cloud-glossary.md#request-unit) : 毎月5000万RU

クラスターが使用量の割り当てに達すると、新しい月の開始時に使用量がリセットされるか、 [割り当てを増やす](#update-spending-limit)なるまで、クラスターは新しい接続試行を直ちに拒否します。割り当てに達する前に確立された既存の接続はアクティブなままですが、スロットリングが発生します。たとえば、クラスターの行ベースのstorageが空きクラスターに対して 5 GiB を超えると、クラスターは新しい接続試行を自動的に制限します。

さまざまなリソース (読み取り、書き込み、SQL CPU、ネットワーク送信など) の RU 消費量、価格の詳細、スロットル情報の詳細については、 [TiDB Cloud Serverless の価格詳細](https://www.pingcap.com/tidb-cloud-serverless-pricing-details)参照してください。

追加のクォータを持つTiDB Cloud Serverless クラスターを作成する場合は、クラスター作成ページで使用制限を編集できます。詳細については、 [TiDB Cloud Serverless クラスターを作成する](/tidb-cloud/create-tidb-cluster-serverless.md)参照してください。

## 支出限度額の更新 {#update-spending-limit}

TiDB Cloud Serverless の無料クラスターの場合、スケーラブル クラスターにアップグレードすることで使用量の割り当てを増やすことができます。既存のスケーラブル クラスターの場合は、月間使用制限を直接調整できます。

TiDB Cloud Serverless クラスターの使用制限を更新するには、次の手順を実行します。

1.  プロジェクトの[**クラスター**](https://tidbcloud.com/console/clusters)ページで、ターゲット クラスターの名前をクリックして、概要ページに移動します。

    > **ヒント：**
    >
    > 複数のプロジェクトがある場合は、<mdsvgicon name="icon-left-projects">左下隅にある をクリックして、別のプロジェクトに切り替えます。</mdsvgicon>

2.  **「今月の使用状況」**領域で、 **「スケーラブルクラスタにアップグレード」**をクリックします。

    既存のスケーラブルクラスタの支出限度額を調整するには、 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 3.99998H6.8C5.11984 3.99998 4.27976 3.99998 3.63803 4.32696C3.07354 4.61458 2.6146 5.07353 2.32698 5.63801C2 6.27975 2 7.11983 2 8.79998V17.2C2 18.8801 2 19.7202 2.32698 20.362C2.6146 20.9264 3.07354 21.3854 3.63803 21.673C4.27976 22 5.11984 22 6.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9264 19.673 20.362C20 19.7202 20 18.8801 20 17.2V13M7.99997 16H9.67452C10.1637 16 10.4083 16 10.6385 15.9447C10.8425 15.8957 11.0376 15.8149 11.2166 15.7053C11.4184 15.5816 11.5914 15.4086 11.9373 15.0627L21.5 5.49998C22.3284 4.67156 22.3284 3.32841 21.5 2.49998C20.6716 1.67156 19.3284 1.67155 18.5 2.49998L8.93723 12.0627C8.59133 12.4086 8.41838 12.5816 8.29469 12.7834C8.18504 12.9624 8.10423 13.1574 8.05523 13.3615C7.99997 13.5917 7.99997 13.8363 7.99997 14.3255V16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>**編集**。

3.  必要に応じて月間支出限度額を編集します。支払い方法を追加していない場合は、限度額を編集した後にクレジットカードを追加する必要があります。

4.  **クラスタプランの更新を**クリックします。
