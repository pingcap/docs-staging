---
title: Configure Cluster Password Settings
summary: クラスターに接続するためのルート パスワードを構成する方法を学習します。
---

# クラスタパスワード設定を構成する {#configure-cluster-password-settings}

TiDB Cloud Dedicated クラスターの場合、クラスターに接続するためのルート パスワードと許可された IP アドレスを構成できます。

> **注記：**
>
> TiDB Cloud Serverless クラスターの場合、このドキュメントは適用されません。代わりに[TiDB Cloud ServerlessへのTLS接続](/tidb-cloud/secure-connections-to-serverless-clusters.md)を参照してください。

1.  TiDB Cloudコンソールで、プロジェクトの[**クラスター**](https://tidbcloud.com/console/clusters)ページに移動します。

    > **ヒント：**
    >
    > 複数のプロジェクトがある場合は、<mdsvgicon name="icon-left-projects">左下隅にある をクリックして、別のプロジェクトに切り替えます。</mdsvgicon>

2.  ターゲット クラスターの行で、 **[...]**をクリックし、 **[パスワード設定]**を選択します。

3.  クラスターに接続するためのルート パスワードを設定し、 **[保存]**をクリックします。

    **「パスワードの自動生成」をクリックすると、ランダムなパスワード**を生成できます。生成されたパスワードは再度表示されないので、パスワードは安全な場所に保存してください。

> **ヒント：**
>
> クラスターの概要ページを表示している場合は、ページの右上隅にある**...**をクリックし、**パスワード設定を**選択して、これらの設定も構成できます。
