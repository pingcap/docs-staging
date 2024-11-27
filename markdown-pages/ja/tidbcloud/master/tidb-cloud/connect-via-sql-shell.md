---
title: Connect via SQL Shell
summary: SQL Shell 経由で TiDB クラスターに接続する方法を学習します。
---

# SQL シェル経由で接続する {#connect-via-sql-shell}

TiDB Cloud SQL Shell では、 TiDB SQL を試したり、TiDB と MySQL の互換性を素早くテストしたり、データベース ユーザー権限を管理したりできます。

> **注記：**
>
> SQL Shell を使用して[TiDB サーバーレス クラスター](/tidb-cloud/select-cluster-tier.md#tidb-serverless)に接続することはできません。TiDB Serverless クラスターに接続するには、 [TiDB サーバーレス クラスターに接続する](/tidb-cloud/connect-to-tidb-cluster-serverless.md)を参照してください。

SQL シェルを使用して TiDB クラスターに接続するには、次の手順を実行します。

1.  [TiDB Cloudコンソール](https://tidbcloud.com/)にログインし、プロジェクトの[**クラスター**](https://tidbcloud.com/console/clusters)ページに移動します。

    > **ヒント：**
    >
    > 複数のプロジェクトがある場合は、<mdsvgicon name="icon-left-projects">左下隅にある をクリックして、別のプロジェクトに切り替えます。</mdsvgicon>

2.  ターゲット クラスターの名前をクリックしてクラスターの概要ページに移動し、右上隅の**[接続]**をクリックします。接続ダイアログが表示されます。

3.  ダイアログで、 **「Web SQL Shell」**タブを選択し、 **「SQL Shell を開く」**をクリックします。

4.  プロンプトの**「パスワードの入力」**行に、現在のクラスターのルート パスワードを入力します。これで、アプリケーションが TiDB クラスターに接続されます。
