---
title: Connect to TiDB Cloud Serverless via Public Endpoint
summary: パブリック エンドポイント経由でTiDB Cloud Serverless クラスターに接続する方法を学習します。
---

# パブリックエンドポイント経由でTiDB Cloud Serverless に接続する {#connect-to-tidb-cloud-serverless-via-public-endpoint}

このドキュメントでは、コンピューターから SQL クライアントを使用してパブリック エンドポイント経由でTiDB Cloud Serverless クラスターに接続する方法と、パブリック エンドポイントを無効にする方法について説明します。

## パブリックエンドポイント経由で接続する {#connect-via-a-public-endpoint}

> **ヒント：**
>
> パブリック エンドポイント経由でTiDB Cloud Dedicated クラスターに接続する方法については、 [パブリック接続経由​​でTiDB Cloud Dedicated に接続](/tidb-cloud/connect-via-standard-connection.md)参照してください。

パブリック エンドポイント経由でTiDB Cloud Serverless クラスターに接続するには、次の手順を実行します。

1.  [**クラスター**](https://tidbcloud.com/project/clusters)ページに移動し、ターゲット クラスターの名前をクリックして概要ページに移動します。

2.  右上隅の**「接続」**をクリックします。接続ダイアログが表示されます。

3.  ダイアログでは、接続タイプのデフォルト設定を`Public`のままにして、希望する接続方法とオペレーティング システムを選択して、対応する接続文字列を取得します。

    > **注記：**
    >
    > -   接続タイプを`Public`ままにしておくと、標準のTLS接続が使用されます。詳細については、 [TiDB Cloud ServerlessへのTLS接続](/tidb-cloud/secure-connections-to-serverless-clusters.md)参照してください。
    > -   **「接続タイプ」**ドロップダウンリストで**「プライベートエンドポイント」**を選択した場合、接続はプライベートエンドポイント経由となります。詳細については、 [プライベートエンドポイント経由でTiDB Cloud Serverless に接続する](/tidb-cloud/set-up-private-endpoint-connections-serverless.md)参照してください。

4.  TiDB Cloud Serverlessでは、クラスターに[枝](/tidb-cloud/branch-overview.md)作成できます。ブランチを作成したら、 **「ブランチ」**ドロップダウンリストからそのブランチに接続できます。5 `main`クラスター自体を表します。

5.  まだパスワードを設定していない場合は、 **「パスワードを生成」**をクリックしてランダムなパスワードを生成します。生成されたパスワードは再度表示されないため、安全な場所に保存してください。

6.  接続文字列を使用してクラスターに接続します。

    > **注記：**
    >
    > TiDB Cloud Serverless クラスターに接続する際は、ユーザー名にクラスターのプレフィックスを含め、引用符で囲む必要があります。詳細については、 [ユーザー名のプレフィックス](/tidb-cloud/select-cluster-tier.md#user-name-prefix)ご覧ください。クライアント IP は、クラスターのパブリックエンドポイントの許可 IP ルールに含まれている必要があります。詳細については、 [パブリックエンドポイント用のTiDB Cloudサーバーレス ファイアウォール ルールを構成する](/tidb-cloud/configure-serverless-firewall-rules-for-public-endpoints.md)ご覧ください。

## パブリックエンドポイントを無効にする {#disable-a-public-endpoint}

TiDB Cloud Serverless クラスターのパブリック エンドポイントを使用する必要がない場合は、それを無効にしてインターネットからの接続を防ぐことができます。

1.  [**クラスター**](https://tidbcloud.com/project/clusters)ページに移動し、ターゲット クラスターの名前をクリックして概要ページに移動します。

2.  左側のナビゲーション ペインで、 **[設定]** &gt; **[ネットワーク] を**クリックします。

3.  **「ネットワーク」**ページで、 **「無効にする」**をクリックします。確認ダイアログが表示されます。

4.  確認ダイアログで**「無効にする」を**クリックします。

パブリックエンドポイントを無効化すると、接続ダイアログの「**接続タイプ」**ドロップダウンリストの`Public`のエントリが無効化されます。ユーザーが引き続きパブリックエンドポイントからクラスターにアクセスしようとすると、エラーが発生します。

> **注記：**
>
> パブリックエンドポイントを無効にしても、既存の接続には影響しません。インターネットからの新規接続のみがブロックされます。

パブリック エンドポイントを無効にした後、再度有効にすることができます。

1.  [**クラスター**](https://tidbcloud.com/project/clusters)ページに移動し、ターゲット クラスターの名前をクリックして概要ページに移動します。

2.  左側のナビゲーション ペインで、 **[設定]** &gt; **[ネットワーク] を**クリックします。

3.  **[ネットワーク]**ページで、 **[有効化]**をクリックします。

## 次は何？ {#what-s-next}

TiDB クラスターに正常に接続すると、 [TiDBでSQL文を調べる](/basic-sql-operations.md) 。
