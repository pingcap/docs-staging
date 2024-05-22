---
title: Connect to TiDB with Rails framework and ActiveRecord ORM
summary: Learn how to connect to TiDB using the Rails framework. This tutorial gives Ruby sample code snippets that work with TiDB using the Rails framework and ActiveRecord ORM.
---

# Rails フレームワークと ActiveRecord ORM を使用して TiDB に接続する {#connect-to-tidb-with-rails-framework-and-activerecord-orm}

TiDB は MySQL 互換のデータベース、 [レール](https://github.com/rails/rails)は Ruby で書かれた人気の Web アプリケーション フレームワーク、 [アクティブレコードORM](https://github.com/rails/rails/tree/main/activerecord) Rails のオブジェクト リレーショナル マッピングです。

このチュートリアルでは、TiDB と Rails を使用して次のタスクを実行する方法を学習します。

-   環境を設定します。
-   Rails を使用して TiDB クラスターに接続します。
-   アプリケーションをビルドして実行します。オプションで、ActiveRecord ORM を使用した基本的な CRUD 操作の[サンプルコードスニペット](#sample-code-snippets)を見つけることができます。

> **注記：**
>
> このチュートリアルは、TiDB Serverless、TiDB Dedicated、および TiDB Self-Hosted で機能します。

## 前提条件 {#prerequisites}

このチュートリアルを完了するには、次のものが必要です。

-   [ルビー](https://www.ruby-lang.org/en/) &gt;= 3.0 がマシンにインストールされている
-   [バンドラー](https://bundler.io/)マシンにインストールされています
-   [ギット](https://git-scm.com/downloads)マシンにインストールされています
-   TiDBクラスタが稼働中

**TiDB クラスターがない場合は、次のように作成できます。**

<CustomContent platform="tidb">

-   (推奨) [TiDB サーバーレス クラスターの作成](/develop/dev-guide-build-cluster-in-cloud.md)に従って、独自のTiDB Cloudクラスターを作成します。
-   [ローカルテストTiDBクラスタをデプロイ](/quick-start-with-tidb.md#deploy-a-local-test-cluster)または[本番のTiDBクラスタをデプロイ](/production-deployment-using-tiup.md)に従ってローカル クラスターを作成します。

</CustomContent>
<CustomContent platform="tidb-cloud">

-   (推奨) [TiDB サーバーレス クラスターの作成](/develop/dev-guide-build-cluster-in-cloud.md)に従って、独自のTiDB Cloudクラスターを作成します。
-   [ローカルテストTiDBクラスタをデプロイ](https://docs.pingcap.com/tidb/stable/quick-start-with-tidb#deploy-a-local-test-cluster)または[本番のTiDBクラスタをデプロイ](https://docs.pingcap.com/tidb/stable/production-deployment-using-tiup)に従ってローカル クラスターを作成します。

</CustomContent>

## サンプルアプリを実行してTiDBに接続する {#run-the-sample-app-to-connect-to-tidb}

このセクションでは、サンプル アプリケーション コードを実行して TiDB に接続する方法を示します。

### ステップ1: サンプルアプリのリポジトリをクローンする {#step-1-clone-the-sample-app-repository}

サンプル コード リポジトリを複製するには、ターミナル ウィンドウで次のコマンドを実行します。

```shell
git clone https://github.com/tidb-samples/tidb-ruby-rails-quickstart.git
cd tidb-ruby-rails-quickstart
```

### ステップ2: 依存関係をインストールする {#step-2-install-dependencies}

次のコマンドを実行して、サンプル アプリに必要なパッケージ ( `mysql2`と`dotenv`を含む) をインストールします。

```shell
bundle install
```

<details><summary><b>既存のプロジェクトの依存関係をインストールする</b></summary>

既存のプロジェクトの場合は、次のコマンドを実行してパッケージをインストールします。

```shell
bundle add mysql2 dotenv
```

</details>

### ステップ3: 接続情報を構成する {#step-3-configure-connection-information}

選択した TiDB デプロイメント オプションに応じて、TiDB クラスターに接続します。

<SimpleTab>
<div label="TiDB Serverless">

1.  [**クラスター**](https://tidbcloud.com/console/clusters)ページに移動し、ターゲット クラスターの名前をクリックして概要ページに移動します。

2.  右上隅の**「接続」**をクリックします。接続ダイアログが表示されます。

3.  接続ダイアログで、 **「接続先」**ドロップダウン リストから`Rails`選択し、**エンドポイント タイプ**のデフォルト設定を`Public`のままにします。

4.  まだパスワードを設定していない場合は、 **「パスワードの生成」**をクリックしてランダムなパスワードを生成します。

5.  次のコマンドを実行して`.env.example`コピーし、名前を`.env`に変更します。

    ```shell
    cp .env.example .env
    ```

6.  `.env`ファイルを編集し、 `DATABASE_URL`環境変数を次のように設定し、接続ダイアログから接続文字列を変数値としてコピーします。

    ```dotenv
    DATABASE_URL='mysql2://{user}:{password}@{host}:{port}/{database_name}?ssl_mode=verify_identity'
    ```

    > **注記**
    >
    > TiDB Serverless の場合、パブリック エンドポイントを使用する場合は、 `ssl_mode=verify_identity`クエリ パラメータを使用して TLS 接続を有効にする**必要があります**。

7.  `.env`ファイルを保存します。

</div>
<div label="TiDB Dedicated">

1.  [**クラスター**](https://tidbcloud.com/console/clusters)ページに移動し、ターゲット クラスターの名前をクリックして概要ページに移動します。

2.  右上隅の**「接続」**をクリックします。接続ダイアログが表示されます。

3.  **「どこからでもアクセスを許可」**をクリックし、 **「CA 証明書のダウンロード」**をクリックして CA 証明書をダウンロードします。

    接続文字列を取得する方法の詳細については、 [TiDB専用標準接続](https://docs.pingcap.com/tidbcloud/connect-via-standard-connection)を参照してください。

4.  次のコマンドを実行して`.env.example`コピーし、名前を`.env`に変更します。

    ```shell
    cp .env.example .env
    ```

5.  `.env`ファイルを編集し、 `DATABASE_URL`環境変数を次のように設定し、接続ダイアログから接続文字列を変数値としてコピーし、 `sslca`クエリ パラメータを接続ダイアログからダウンロードした CA 証明書のファイル パスに設定します。

    ```dotenv
    DATABASE_URL='mysql2://{user}:{password}@{host}:{port}/{database}?ssl_mode=verify_identity&sslca=/path/to/ca.pem'
    ```

    > **注記**
    >
    > パブリック エンドポイントを使用して TiDB Dedicated に接続する場合は、TLS 接続を有効にすることをお勧めします。
    >
    > TLS 接続を有効にするには、クエリ パラメータ`ssl_mode`の値を`verify_identity`に変更し、値`sslca`接続ダイアログからダウンロードした CA 証明書のファイル パスに変更します。

6.  `.env`ファイルを保存します。

</div>
<div label="TiDB Self-Hosted">

1.  次のコマンドを実行して`.env.example`コピーし、名前を`.env`に変更します。

    ```shell
    cp .env.example .env
    ```

2.  `.env`ファイルを編集し、 `DATABASE_URL`環境変数を次のように設定し、 `{user}` 、 `{password}` 、 `{host}` 、 `{port}` 、および`{database}`を独自の TiDB 接続情報に置き換えます。

    ```dotenv
    DATABASE_URL='mysql2://{user}:{password}@{host}:{port}/{database}'
    ```

    TiDB をローカルで実行している場合、デフォルトのホスト アドレスは`127.0.0.1`で、パスワードは空です。

3.  `.env`ファイルを保存します。

</div>
</SimpleTab>

### ステップ4: コードを実行して結果を確認する {#step-4-run-the-code-and-check-the-result}

1.  データベースとテーブルを作成します。

    ```shell
    bundle exec rails db:create
    bundle exec rails db:migrate
    ```

2.  サンプルデータをシードします。

    ```shell
    bundle exec rails db:seed
    ```

3.  サンプルコードを実行するには、次のコマンドを実行します。

    ```shell
    bundle exec rails runner ./quickstart.rb
    ```

接続が成功すると、コンソールに次のように TiDB クラスターのバージョンが出力されます。

    🔌 Connected to TiDB cluster! (TiDB version: 8.0.11-TiDB-v7.5.1)
    ⏳ Loading sample game data...
    ✅ Loaded sample game data.

    🆕 Created a new player with ID 12.
    ℹ️ Got Player 12: Player { id: 12, coins: 100, goods: 100 }
    🔢 Added 50 coins and 50 goods to player 12, updated 1 row.
    🚮 Deleted 1 player data.

## サンプルコードスニペット {#sample-code-snippets}

次のサンプル コード スニペットを参照して、独自のアプリケーション開発を完了することができます。

完全なサンプル コードとその実行方法については、 [tidb サンプル/tidb-ruby-rails-クイックスタート](https://github.com/tidb-samples/tidb-ruby-rails-quickstart)リポジトリを参照してください。

### 接続オプションを使用してTiDBに接続する {#connect-to-tidb-with-connection-options}

`config/database.yml`の次のコードは、環境変数で定義されたオプションを使用して TiDB への接続を確立します。

```yml
default: &default
  adapter: mysql2
  encoding: utf8mb4
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  url: <%= ENV["DATABASE_URL"] %>

development:
  <<: *default

test:
  <<: *default
  database: quickstart_test

production:
  <<: *default
```

> **注記**
>
> TiDB Serverless の場合、パブリック エンドポイントを使用するときは、 `DATABASE_URL`で`ssl_mode`クエリ パラメータを`verify_identity`に設定して TLS 接続を有効にする**必要があります**が、mysql2 gem はファイルが見つかるまで特定の順序で既存の CA 証明書を検索するため、 `DATABASE_URL`で SSL CA 証明書を指定する必要は**ありません**。

### データを挿入 {#insert-data}

次のクエリは、2 つのフィールドを持つ単一の Player を作成し、作成された`Player`オブジェクトを返します。

```ruby
new_player = Player.create!(coins: 100, goods: 100)
```

詳細については[データを挿入](/develop/dev-guide-insert-data.md)を参照してください。

### クエリデータ {#query-data}

次のクエリは、ID によって特定のプレーヤーのレコードを返します。

```ruby
player = Player.find_by(id: new_player.id)
```

詳細については[クエリデータ](/develop/dev-guide-get-data-from-single-table.md)を参照してください。

### データの更新 {#update-data}

次のクエリは`Player`オブジェクトを更新します。

```ruby
player.update(coins: 50, goods: 50)
```

詳細については[データの更新](/develop/dev-guide-update-data.md)を参照してください。

### データを削除する {#delete-data}

次のクエリは`Player`オブジェクトを削除します。

```ruby
player.destroy
```

詳細については[データを削除する](/develop/dev-guide-delete-data.md)を参照してください。

## ベストプラクティス {#best-practices}

デフォルトでは、mysql2 gem (ActiveRecord ORM が TiDB に接続するために使用) は、ファイルが見つかるまで特定の順序で既存の CA 証明書を検索します。

1.  /etc/ssl/certs/ca-certificates.crt # Debian / Ubuntu / Gentoo / Arch / Slackware
2.  /etc/pki/tls/certs/ca-bundle.crt # RedHat / Fedora / CentOS / Mageia / Vercel / Netlify
3.  /etc/ssl/ca-bundle.pem # OpenSUSE
4.  /etc/ssl/cert.pem # MacOS / Alpine (docker コンテナ)

CA 証明書のパスを手動で指定することも可能ですが、この方法では、マシンや環境によって CA 証明書がさまざまな場所に保存される可能性があるため、複数の環境を展開するシナリオで大きな不便が生じる可能性があります。したがって、柔軟性と異なる環境間での展開の容易さのために、 `sslca` ～ `nil`に設定することをお勧めします。

## 次のステップ {#next-steps}

-   [ActiveRecordのドキュメント](https://guides.rubyonrails.org/active_record_basics.html)から ActiveRecord ORM の使用方法を詳しく学びます。
-   [開発者ガイド](/develop/dev-guide-overview.md)の[データを挿入](/develop/dev-guide-insert-data.md) 、 [データの更新](/develop/dev-guide-update-data.md) 、 [データを削除する](/develop/dev-guide-delete-data.md) 、 [クエリデータ](/develop/dev-guide-get-data-from-single-table.md) 、 [取引](/develop/dev-guide-transaction-overview.md) 、 [SQLパフォーマンスの最適化](/develop/dev-guide-optimize-sql-overview.md)などの章で、 TiDB アプリケーション開発のベスト プラクティスを学習します。
-   プロフェッショナル[TiDB 開発者コース](https://www.pingcap.com/education/)を通じて学び、試験に合格すると[TiDB 認定](https://www.pingcap.com/education/certification/)獲得します。

## 助けが必要？ {#need-help}

[不和](https://discord.gg/vYU9h56kAX)チャンネルで質問してください。
