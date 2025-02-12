---
title: Build a TiDB Cluster in TiDB Cloud (Developer Tier)
summary: Learn how to build a TiDB cluster in TiDB Cloud (Developer Tier) and connect to a TiDB Cloud cluster.
---

<!-- markdownlint-disable MD029 -->

# TiDB Cloud(開発者層) で TiDBクラスタを構築する {#build-a-tidb-cluster-in-tidb-cloud-developer-tier}

<CustomContent platform="tidb">

このドキュメントでは、TiDB を使い始める最も簡単な方法について説明します。 [TiDB Cloud](https://en.pingcap.com/tidb-cloud)を使用して、無料の TiDB クラスターを作成し、それに接続して、サンプル アプリケーションを実行します。

ローカル マシンで TiDB を実行する必要がある場合は、 [TiDB をローカルで起動する](/quick-start-with-tidb.md)を参照してください。

</CustomContent>

<CustomContent platform="tidb-cloud">

このドキュメントでは、 TiDB Cloudを開始するための最も簡単な方法について説明します。無料の TiDB クラスターを作成して接続し、サンプル アプリケーションを実行します。

</CustomContent>

## ステップ 1.無料のクラスターを作成する {#step-1-create-a-free-cluster}

1.  TiDB Cloudアカウントを持っていない場合は、 [TiDB Cloud](https://tidbcloud.com/free-trial)をクリックしてアカウントにサインアップします。

2.  [ログイン](https://tidbcloud.com/)をTiDB Cloudアカウントで。

3.  Developer Tier クラスターを 1 年間無料で作成するには、 [プランページ](https://tidbcloud.com/console/plans)ページで**Developer Tier**プランを選択するか、 [**アクティブなクラスター**](https://tidbcloud.com/console/clusters)ページで [<strong>クラスタの作成</strong>] をクリックします。

4.  [**クラスタの作成]**ページで、クラスター名、クラウド プロバイダー (現時点では、開発者層で使用できるのは AWS のみ)、およびリージョン (近くのリージョンをお勧めします) を設定します。次に、[<strong>作成</strong>] をクリックしてクラスターを作成します。

    クラスターの作成プロセスが開始され、 **[セキュリティの設定**] ダイアログ ボックスが表示されます。

5.  [**セキュリティ設定**] ダイアログ ボックスで、ルート パスワードと許可された IP アドレスを設定してクラスターに接続し、[<strong>適用</strong>] をクリックします。

    TiDB Cloudクラスターは、約 5 ～ 15 分で作成されます。

6.  クラスターを作成したら、右上隅にある [**接続**] をクリックします。接続ダイアログボックスが表示されます。

    > **ヒント：**
    >
    > または、新しく作成したクラスターの名前をクリックしてクラスターの詳細ページに移動し、右上隅にある [**接続**] をクリックすることもできます。

7.  ダイアログ ボックスで、 [**ステップ 2: SQL クライアントに接続**する] を探し、文字列をコピーして SQL クライアントに接続し、後で使用できるようにします。

    ![SQL string](https://docs-download.pingcap.com/media/images/docs/develop/tidb-cloud-connect.png)

    <CustomContent platform="tidb">

    > **ノート：**
    >
    > [開発者層のクラスター](https://docs.pingcap.com/tidbcloud/select-cluster-tier#developer-tier)の場合、クラスターに接続するときに、ユーザー名にクラスターのプレフィックスを含め、名前を引用符で囲む必要があります。詳細については、 [ユーザー名のプレフィックス](https://docs.pingcap.com/tidbcloud/select-cluster-tier#user-name-prefix)を参照してください。

    </CustomContent>

    <CustomContent platform="tidb-cloud">

    > **ノート：**
    >
    > [開発者層のクラスター](/tidb-cloud/select-cluster-tier.md#developer-tier)の場合、クラスターに接続するときに、ユーザー名にクラスターのプレフィックスを含め、名前を引用符で囲む必要があります。詳細については、 [ユーザー名のプレフィックス](/tidb-cloud/select-cluster-tier.md#user-name-prefix)を参照してください。

    </CustomContent>

## ステップ 2. クラスターに接続する {#step-2-connect-to-a-cluster}

1.  MySQL クライアントがインストールされていない場合は、オペレーティング システムを選択し、以下の手順に従ってインストールします。

<SimpleTab>

<div label="macOS">

macOS の場合、 [自作](https://brew.sh/index)がない場合はインストールしてから、次のコマンドを実行して MySQL クライアントをインストールします。


```shell
brew install mysql-client
```

出力は次のとおりです。

```
mysql-client is keg-only, which means it was not symlinked into /opt/homebrew,
because it conflicts with mysql (which contains client libraries).

If you need to have mysql-client first in your PATH, run:
  echo 'export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"' >> ~/.zshrc

For compilers to find mysql-client you may need to set:
  export LDFLAGS="-L/opt/homebrew/opt/mysql-client/lib"
  export CPPFLAGS="-I/opt/homebrew/opt/mysql-client/include"
```

MySQL クライアントを PATH に追加するには、上記の出力で次のコマンドを見つけて (出力がドキュメントの上記の出力と一致しない場合は、代わりに出力で対応するコマンドを使用してください)、それを実行します。


```shell
echo 'export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"' >> ~/.zshrc
```

次に、 `source`コマンドでグローバル環境変数を宣言し、MySQL クライアントが正常にインストールされていることを確認します。


```shell
source ~/.zshrc
mysql --version
```

予想される出力の例:

```
mysql  Ver 8.0.28 for macos12.0 on arm64 (Homebrew)
```

</div>

<div label="Linux">

Linux の場合、次の例では CentOS 7 を使用しています。


```shell
yum install mysql
```

次に、MySQL クライアントが正常にインストールされたことを確認します。


```shell
mysql --version
```

予想される出力の例:

```
mysql  Ver 15.1 Distrib 5.5.68-MariaDB, for Linux (x86_64) using readline 5.1
```

</div>

</SimpleTab>

2.  [ステップ1](#step-1-create-a-free-cluster)で取得した接続文字列を実行します。


    ```shell
    mysql --connect-timeout 15 -u '<prefix>.root' -h <host> -P 4000 -p
    ```

3.  パスワードを入力してサインインします。

## ステップ 3. サンプル アプリケーションを実行する {#step-3-run-the-sample-application}

1.  `tidb-example-java`のプロジェクトを複製します。


```shell
git clone https://github.com/pingcap-inc/tidb-example-java.git
```

2.  接続パラメーターを変更します。

    `plain-java-jdbc/src/main/java/com/pingcap/JDBCExample.java`で、ホスト、ポート、ユーザー、およびパスワードのパラメーターを変更します。


    ```java
    mysqlDataSource.setServerName("localhost");
    mysqlDataSource.setPortNumber(4000);
    mysqlDataSource.setDatabaseName("test");
    mysqlDataSource.setUser("root");
    mysqlDataSource.setPassword("");
    ```

    設定したパスワードが`123456`で、 TiDB Cloudから取得した接続文字列が次のとおりであるとします。


    ```shell
    mysql --connect-timeout 15 -u '4JC1i9KroBMFRwW.root' -h xxx.tidbcloud.com -P 4000 -D test -p
    ```

    この場合、次のようにパラメータを変更できます。


    ```java
    mysqlDataSource.setServerName("xxx.tidbcloud.com");
    mysqlDataSource.setPortNumber(4000);
    mysqlDataSource.setDatabaseName("test");
    mysqlDataSource.setUser("4JC1i9KroBMFRwW.root");
    mysqlDataSource.setPassword("123456");
    ```

3.  `make plain-java-jdbc`を実行します。

[期待される出力](https://github.com/pingcap-inc/tidb-example-java/blob/main/Expected-Output.md#plain-java-jdbc)の例を次に示します。
