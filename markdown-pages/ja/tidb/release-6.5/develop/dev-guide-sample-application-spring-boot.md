---
title: Build a TiDB Application Using Spring Boot
summary: Learn an example of how to build a TiDB application using Spring Boot.
---

<!-- markdownlint-disable MD029 -->

# Spring Boot を使用して TiDB アプリケーションを構築する {#build-a-tidb-application-using-spring-boot}

このチュートリアルでは、TiDB を使用して[スプリングブーツ](https://spring.io/projects/spring-boot) Web アプリケーションを構築する方法を示します。 [春のデータ JPA](https://spring.io/projects/spring-data-jpa)モジュールは、データ アクセス機能のフレームワークとして使用されます。このサンプル アプリケーションのコードは[GitHub](https://github.com/pingcap-inc/tidb-example-java)からダウンロードできます。

これは RESTful API を構築するためのサンプル アプリケーションであり、 **TiDB**をデータベースとして使用する汎用<strong>Spring Boot</strong>バックエンド サービスを示しています。次のプロセスは、実際のシナリオを再現するように設計されています。

これは、各プレイヤーが`coins`と`goods` 2 つの属性を持つゲームの例です。各プレイヤーは`id`フィールドで一意に識別されます。十分なコインと商品があれば、プレーヤーは自由に取引できます。

この例に基づいて独自のアプリケーションを構築できます。

## ステップ 1: TiDB クラスターを起動する {#step-1-launch-your-tidb-cluster}

<CustomContent platform="tidb">

以下にTiDBクラスターの起動方法を紹介します。

**TiDB Cloud Serverless Tierクラスターを使用する**

詳細な手順については、 [Serverless Tierクラスターを作成する](/develop/dev-guide-build-cluster-in-cloud.md#step-1-create-a-serverless-tier-cluster)を参照してください。

**ローカル クラスターを使用する**

詳細な手順については、 [ローカル テスト クラスターをデプロイ](/quick-start-with-tidb.md#deploy-a-local-test-cluster)または[TiUPを使用して TiDBクラスタをデプロイ](/production-deployment-using-tiup.md)を参照してください。

</CustomContent>

<CustomContent platform="tidb-cloud">

[Serverless Tierクラスターを作成する](/develop/dev-guide-build-cluster-in-cloud.md#step-1-create-a-serverless-tier-cluster)を参照してください。

</CustomContent>

## ステップ 2: JDK をインストールする {#step-2-install-jdk}

コンピュータに**Java Development Kit** (JDK) をダウンロードしてインストールします。 Java開発に必要なツールです。 <strong>Spring Boot は、</strong> Java 8 以降のバージョンの JDK をサポートしています。ただし、 <strong>Hibernate の</strong>バージョンにより、 Java 11 以降のバージョンの JDK を使用することをお勧めします。

**Oracle JDK**と<strong>OpenJDK の</strong>両方がサポートされています。ご自身の判断でお選びいただけます。このチュートリアルでは、 <strong>OpenJDK</strong>の JDK 17 を使用します。

## ステップ 3: Maven をインストールする {#step-3-install-maven}

このサンプル アプリケーションでは、 **Apache Maven**を使用してアプリケーションの依存関係を管理します。 Spring は Maven 3.3 以降のバージョンをサポートします。依存関係管理ソフトウェアとして、 <strong>Maven</strong>の最新の安定バージョンをお勧めします。

コマンドラインから**Maven**をインストールするには。

-   マックOS：


    ```shell
    brew install maven
    ```

-   Debian ベースの Linux ディストリビューション (Ubuntu など):


    ```shell
    apt-get install maven
    ```

-   Red Hat ベースの Linux ディストリビューション (Fedora、CentOS など):

    -   dnf:


        ```shell
        dnf install maven
        ```

    -   うーん:


        ```shell
        yum install maven
        ```

その他のインストール方法については、 [Mavenの公式ドキュメント](https://maven.apache.org/install.html)を参照してください。

## ステップ 4: アプリケーション コードを取得する {#step-4-get-the-application-code}

[サンプル コード リポジトリ](https://github.com/pingcap-inc/tidb-example-java)ダウンロードまたは複製して、 `spring-jpa-hibernate`ディレクトリに移動します。

## ステップ 5: アプリケーションを実行する {#step-5-run-the-application}

このステップでは、アプリケーション コードをコンパイルして実行し、Web アプリケーションを作成します。 Hibernate は`test`データベース内に`player_jpa`テーブルを作成します。アプリケーションの RESTful API を使用してリクエストを行う場合、これらのリクエストは TiDB クラスターで実行さ[データベース トランザクション](/develop/dev-guide-transaction-overview.md)ます。

このアプリケーションのコードについて詳しく知りたい場合は、 [実装の詳細](#implementation-details)を参照してください。

### ステップ 5.1 パラメータの変更 {#step-5-1-change-parameters}

TiDB Cloud Serverless Tierクラスターを使用している場合は、 `application.yml` ( `src/main/resources`にあります) の`spring.datasource.url` 、 `spring.datasource.username` 、 `spring.datasource.password`パラメーターを変更します。

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:4000/test
    username: root
    #    password: xxx
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    show-sql: true
    database-platform: org.hibernate.dialect.TiDBDialect
    hibernate:
      ddl-auto: create-drop
```

設定したパスワードが`123456`で、クラスターの詳細ページから取得した接続パラメーターが次のとおりであるとします。

-   エンドポイント: `xxx.tidbcloud.com`
-   ポート: `4000`
-   ユーザー: `2aEp24QWEDLqRFs.root`

したがって、パラメータは次のように設定する必要があります。

```yaml
spring:
  datasource:
    url: jdbc:mysql://xxx.tidbcloud.com:4000/test?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3
    username: 2aEp24QWEDLqRFs.root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    show-sql: true
    database-platform: org.hibernate.dialect.TiDBDialect
    hibernate:
      ddl-auto: create-drop
```

### ステップ 5.2 実行 {#step-5-2-run}

ターミナル セッションを開き、 `spring-jpa-hibernate`ディレクトリにいることを確認します。このディレクトリにまだ移動していない場合は、次のコマンドを使用してディレクトリに移動します。

```shell
cd <path>/tidb-example-java/spring-jpa-hibernate
```

#### Make でビルドして実行する (推奨) {#build-and-run-with-make-recommended}

```shell
make
```

#### 手動でビルドして実行する {#build-and-run-manually}

手動でビルドする場合は、次の手順に従います。

1.  キャッシュとパッケージをクリアします。


    ```shell
    mvn clean package
    ```

2.  JAR ファイルを使用してアプリケーションを実行します。


    ```shell
    java -jar target/spring-jpa-hibernate-0.0.1.jar
    ```

### ステップ 5.3 出力 {#step-5-3-output}

出力の最終部分は次のようになります。

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.0.1)

2023-01-05T14:06:54.427+08:00  INFO 22005 --- [           main] com.pingcap.App                          : Starting App using Java 17.0.2 with PID 22005 (/Users/cheese/IdeaProjects/tidb-example-java/spring-jpa-hibernate/target/classes started by cheese in /Users/cheese/IdeaProjects/tidb-example-java)
2023-01-05T14:06:54.428+08:00  INFO 22005 --- [           main] com.pingcap.App                          : No active profile set, falling back to 1 default profile: "default"
2023-01-05T14:06:54.642+08:00  INFO 22005 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Bootstrapping Spring Data JPA repositories in DEFAULT mode.
2023-01-05T14:06:54.662+08:00  INFO 22005 --- [           main] .s.d.r.c.RepositoryConfigurationDelegate : Finished Spring Data repository scanning in 17 ms. Found 1 JPA repository interfaces.
2023-01-05T14:06:54.830+08:00  INFO 22005 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port(s): 8080 (http)
2023-01-05T14:06:54.833+08:00  INFO 22005 --- [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2023-01-05T14:06:54.833+08:00  INFO 22005 --- [           main] o.apache.catalina.core.StandardEngine    : Starting Servlet engine: [Apache Tomcat/10.1.4]
2023-01-05T14:06:54.865+08:00  INFO 22005 --- [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2023-01-05T14:06:54.865+08:00  INFO 22005 --- [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 421 ms
2023-01-05T14:06:54.916+08:00  INFO 22005 --- [           main] o.hibernate.jpa.internal.util.LogHelper  : HHH000204: Processing PersistenceUnitInfo [name: default]
2023-01-05T14:06:54.929+08:00  INFO 22005 --- [           main] org.hibernate.Version                    : HHH000412: Hibernate ORM core version 6.1.6.Final
2023-01-05T14:06:54.969+08:00  WARN 22005 --- [           main] org.hibernate.orm.deprecation            : HHH90000021: Encountered deprecated setting [javax.persistence.sharedCache.mode], use [jakarta.persistence.sharedCache.mode] instead
2023-01-05T14:06:55.005+08:00  INFO 22005 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2023-01-05T14:06:55.074+08:00  INFO 22005 --- [           main] com.zaxxer.hikari.pool.HikariPool        : HikariPool-1 - Added connection com.mysql.cj.jdbc.ConnectionImpl@5e905f2c
2023-01-05T14:06:55.075+08:00  INFO 22005 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2023-01-05T14:06:55.089+08:00  INFO 22005 --- [           main] SQL dialect                              : HHH000400: Using dialect: org.hibernate.dialect.TiDBDialect
Hibernate: drop table if exists player_jpa
Hibernate: drop sequence player_jpa_id_seq
Hibernate: create sequence player_jpa_id_seq start with 1 increment by 1
Hibernate: create table player_jpa (id bigint not null, coins integer, goods integer, primary key (id)) engine=InnoDB
2023-01-05T14:06:55.332+08:00  INFO 22005 --- [           main] o.h.e.t.j.p.i.JtaPlatformInitiator       : HHH000490: Using JtaPlatform implementation: [org.hibernate.engine.transaction.jta.platform.internal.NoJtaPlatform]
2023-01-05T14:06:55.335+08:00  INFO 22005 --- [           main] j.LocalContainerEntityManagerFactoryBean : Initialized JPA EntityManagerFactory for persistence unit 'default'
2023-01-05T14:06:55.579+08:00  WARN 22005 --- [           main] JpaBaseConfiguration$JpaWebConfiguration : spring.jpa.open-in-view is enabled by default. Therefore, database queries may be performed during view rendering. Explicitly configure spring.jpa.open-in-view to disable this warning
2023-01-05T14:06:55.710+08:00  INFO 22005 --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http) with context path ''
2023-01-05T14:06:55.714+08:00  INFO 22005 --- [           main] com.pingcap.App                          : Started App in 1.432 seconds (process running for 1.654)
```

出力ログは、起動中のアプリケーションの動作を示します。この例では、アプリケーションは[トムキャット](https://tomcat.apache.org/)使用して**サーブレット**を開始し、ORM として Hibernate を使用し、データベース接続プールの実装として[HikariCP](https://github.com/brettwooldridge/HikariCP)を使用し、データベースの方言として`org.hibernate.dialect.TiDBDialect`を使用します。起動後、Hibernate は`player_jpa`テーブルと`player_jpa_id_seq`シーケンスを削除して再作成します。起動の最後に、アプリケーションはポート`8080`でリッスンし、HTTP サービスを外部に提供します。

このアプリケーションのコードについて詳しく知りたい場合は、 [実装の詳細](#implementation-details)を参照してください。

## ステップ 6: HTTP リクエスト {#step-6-http-requests}

サービスが起動して実行されたら、HTTP 要求をバックエンド アプリケーションに送信できます。 [http://localhost:8080](http://localhost:8080)は、サービスを提供するベース URL です。このチュートリアルでは、一連の HTTP 要求を使用して、サービスの使用方法を示します。

### ステップ 6.1 Postman リクエストを使用する (推奨) {#step-6-1-use-postman-requests-recommended}

この[構成ファイル](https://raw.githubusercontent.com/pingcap-inc/tidb-example-java/main/spring-jpa-hibernate/Player.postman_collection.json)ローカルにダウンロードして、次に示すように[郵便屋さん](https://www.postman.com/)にインポートできます。

![import the collection into Postman](https://docs-download.pingcap.com/media/images/docs/develop/IMG_20220402-003303222.png)

#### プレーヤーを作成する {#create-players}

**[作成]**タブをクリックし、 <strong>[送信]</strong>ボタンをクリックして、POST 要求を`http://localhost:8080/player/`に送信します。戻り値は追加されたプレーヤーの数で、1 であると予想されます。

![Postman-Create a player](https://docs-download.pingcap.com/media/images/docs/develop/IMG_20220402-003350731.png)

#### IDでプレイヤー情報を取得する {#get-player-information-by-id}

**GetByID**タブをクリックし、 <strong>[送信]</strong>ボタンをクリックして、GET 要求を`http://localhost:8080/player/1`に送信します。戻り値は ID `1`のプレイヤーの情報です。

![Postman-GetByID](https://docs-download.pingcap.com/media/images/docs/develop/IMG_20220402-003416079.png)

#### 制限付きでプレイヤー情報を一括取得 {#get-player-information-in-bulk-by-limit}

**GetByLimit**タブをクリックし、 <strong>Send</strong>ボタンをクリックして、GET リクエストを`http://localhost:8080/player/limit/3`に送信します。戻り値は、最大 3 人のプレイヤーの情報のリストです。

![Postman-GetByLimit](https://docs-download.pingcap.com/media/images/docs/develop/IMG_20220402-003505846.png)

#### ページごとにプレイヤー情報を取得する {#get-player-information-by-page}

**GetByPage**タブをクリックし、 <strong>[送信]</strong>ボタンをクリックして、GET 要求を`http://localhost:8080/player/page?index=0&size=2`に送信します。戻り値はインデックス`0`のページで、1 ページあたり`2`人のプレイヤーがいます。戻り値には、オフセット、totalPages、および並べ替えなどのページング情報も含まれています。

![Postman-GetByPage](https://docs-download.pingcap.com/media/images/docs/develop/IMG_20220402-003528474.png)

#### プレイヤーを数える {#count-players}

**[カウント]**タブと<strong>[送信]</strong>ボタンをクリックして、GET 要求を`http://localhost:8080/player/count`に送信します。戻り値はプレイヤー数です。

![Postman-Count](https://docs-download.pingcap.com/media/images/docs/develop/IMG_20220402-003549966.png)

#### プレイヤーの取引 {#player-trading}

**[取引]**タブをクリックし、[<strong>送信]</strong>ボタンをクリックして、PUT リクエストを`http://localhost:8080/player/trade`に送信します。要求パラメータは、売り手の ID `sellID` 、買い手の ID `buyID` 、購入された商品の数`amount` 、購入のために消費されたコインの数`price`です。

戻り値は、トランザクションが成功したかどうかです。売り手にとって不十分な商品、買い手にとって不十分なコイン、またはデータベース エラーがある場合、 [データベース トランザクション](/develop/dev-guide-transaction-overview.md)取引が成功せず、プレイヤーのコインや商品が失われないことを保証します。

![Postman-Trade](https://docs-download.pingcap.com/media/images/docs/develop/IMG_20220402-003659102.png)

### ステップ 6.2 curl リクエストの使用 {#step-6-2-using-curl-requests}

curl を使用して直接リクエストを行うこともできます。

#### プレーヤーを作成する {#create-players}

プレーヤーを作成するには、 **POST**リクエストを`/player`エンドポイントに送信します。例えば：

```shell
curl --location --request POST 'http://localhost:8080/player/' --header 'Content-Type: application/json' --data-raw '[{"coins":100,"goods":20}]'
```

リクエストは JSON をペイロードとして使用します。上記の例は、100 `coins`と 20 `goods`でプレーヤーを作成することを示しています。戻り値は、作成されたプレーヤーの数です。

```json
1
```

#### IDでプレイヤー情報を取得する {#get-player-information-by-id}

プレイヤー情報を取得するには、 **GET**リクエストを`/player`エンドポイントに送信します。次のように、パス パラメーターでプレーヤーの`id`指定する必要があります: `/player/{id}` 。次の例は、 `id` 1 のプレーヤーの情報を取得する方法を示しています。

```shell
curl --location --request GET 'http://localhost:8080/player/1'
```

戻り値はプレイヤーの情報です:

```json
{
  "coins": 200,
  "goods": 10,
  "id": 1
}
```

#### 制限付きでプレイヤー情報を一括取得 {#get-player-information-in-bulk-by-limit}

プレイヤー情報を一括で取得するには、 **GET**リクエストを`/player/limit`エンドポイントに送信します。次のように、パス パラメーターでプレイヤーの総数を指定する必要があります: `/player/limit/{limit}` 。次の例は、最大 3 人のプレーヤーの情報を取得する方法を示しています。

```shell
curl --location --request GET 'http://localhost:8080/player/limit/3'
```

戻り値はプレイヤー情報のリストです:

```json
[
  {
    "coins": 200,
    "goods": 10,
    "id": 1
  },
  {
    "coins": 0,
    "goods": 30,
    "id": 2
  },
  {
    "coins": 100,
    "goods": 20,
    "id": 3
  }
]
```

#### ページごとにプレイヤー情報を取得する {#get-player-information-by-page}

ページ分割されたプレイヤー情報を取得するには、 **GET**リクエストを`/player/page`エンドポイントに送信します。追加のパラメーターを指定するには、URL パラメーターを使用する必要があります。次の例は、 `index`が 0 のページから情報を取得する方法を示しています。各ページには最大`size`のプレイヤーが 2 人います。

```shell
curl --location --request GET 'http://localhost:8080/player/page?index=0&size=2'
```

戻り値は`index` 0 のページで、1 ページに 2 人のプレイヤーがリストされています。さらに、戻り値には、オフセット、総ページ数、結果がソートされているかどうかなどのページ付け情報が含まれます。

```json
{
  "content": [
    {
      "coins": 200,
      "goods": 10,
      "id": 1
    },
    {
      "coins": 0,
      "goods": 30,
      "id": 2
    }
  ],
  "empty": false,
  "first": true,
  "last": false,
  "number": 0,
  "numberOfElements": 2,
  "pageable": {
    "offset": 0,
    "pageNumber": 0,
    "pageSize": 2,
    "paged": true,
    "sort": {
      "empty": true,
      "sorted": false,
      "unsorted": true
    },
    "unpaged": false
  },
  "size": 2,
  "sort": {
    "empty": true,
    "sorted": false,
    "unsorted": true
  },
  "totalElements": 4,
  "totalPages": 2
}
```

#### プレイヤーを数える {#count-players}

プレーヤーの数を取得するには、 **GET**リクエストを`/player/count`エンドポイントに送信します。

```shell
curl --location --request GET 'http://localhost:8080/player/count'
```

戻り値はプレイヤーの数です:

```json
4
```

#### プレイヤーの取引 {#player-trading}

プレイヤー間のトランザクションを開始するには、 **PUT**リクエストを`/player/trade`エンドポイントに送信します。例えば：

```shell
curl --location --request PUT 'http://localhost:8080/player/trade' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'sellID=1' \
  --data-urlencode 'buyID=2' \
  --data-urlencode 'amount=10' \
  --data-urlencode 'price=100'
```

リクエストは**フォーム データを**ペイロードとして使用します。例のリクエストは、売り手の ID ( `sellID` ) が 1 、買い手の ID ( `buyID` ) が 2 、購入された商品の数 ( `amount` ) が 10 、購入のために消費されたコインの数 ( `price` ) が 100 であることを示しています。

戻り値は、トランザクションが成功したかどうかです。売り手にとって不十分な商品、買い手にとって不十分なコイン、またはデータベース エラーがある場合、 [データベース トランザクション](/develop/dev-guide-transaction-overview.md)取引が成功せず、プレイヤーのコインや商品が失われないことを保証します。

```json
true
```

### ステップ 6.3 シェル スクリプトを使用したリクエスト {#step-6-3-requests-with-shell-script}

テスト目的で[このシェルスクリプト](https://github.com/pingcap-inc/tidb-example-java/blob/main/spring-jpa-hibernate/request.sh)をダウンロードできます。スクリプトは次の操作を実行します。

1.  ループで 10 人のプレイヤーを作成します。
2.  `id` of 1 でプレイヤーの情報を取得します。
3.  最大 3 人のプレイヤーのリストを取得します。
4.  `index` of 0 と`size` of 2 のプレーヤーのページを取得します。
5.  プレイヤーの総数を取得します。
6.  `id` of 1 のプレイヤーが売り手、 `id` of 2 のプレイヤーが買い手の取引を行い、10 `goods`を 100 `coins`で購入します。

このスクリプトは`make request`または`./request.sh`で実行できます。結果は次のようになります。

```shell
cheese@CheesedeMacBook-Pro spring-jpa-hibernate % make request
./request.sh
loop to create 10 players:
1111111111

get player 1:
{"id":1,"coins":200,"goods":10}

get players by limit 3:
[{"id":1,"coins":200,"goods":10},{"id":2,"coins":0,"goods":30},{"id":3,"coins":100,"goods":20}]

get first players:
{"content":[{"id":1,"coins":200,"goods":10},{"id":2,"coins":0,"goods":30}],"pageable":{"sort":{"empty":true,"unsorted":true,"sorted":false},"offset":0,"pageNumber":0,"pageSize":2,"paged":true,"unpaged":false},"last":false,"totalPages":7,"totalElements":14,"first":true,"size":2,"number":0,"sort":{"empty":true,"unsorted":true,"sorted":false},"numberOfElements":2,"empty":false}

get players count:
14

trade by two players:
false
```

## 実装の詳細 {#implementation-details}

このサブセクションでは、サンプル アプリケーション プロジェクトのコンポーネントについて説明します。

### 概要 {#overview}

このサンプル プロジェクトのカタログ ツリーを以下に示します (一部のわかりにくい部分は削除されています)。

```
.
├── pom.xml
└── src
    └── main
        ├── java
        │   └── com
        │       └── pingcap
        │           ├── App.java
        │           ├── controller
        │           │   └── PlayerController.java
        │           ├── dao
        │           │   ├── PlayerBean.java
        │           │   └── PlayerRepository.java
        │           └── service
        │               ├── PlayerService.java
        │               └── impl
        │                   └── PlayerServiceImpl.java
        └── resources
            └── application.yml
```

-   `pom.xml`依存関係やパッケージ化など、プロジェクトの Maven 構成を宣言します。
-   `application.yml` 、使用するデータベース アドレス、パスワード、データベースの方言など、プロジェクトのユーザー構成を宣言します。
-   `App.java`はプロジェクトのエントリ ポイントです。
-   `controller`は、HTTP インターフェイスを外部に公開するパッケージです。
-   `service`は、プロジェクトのインターフェイスとロジックを実装するパッケージです。
-   `dao`は、データベースへの接続とデータの永続性を実装するパッケージです。

### コンフィグレーション {#configuration}

この部分では、 `pom.xml`ファイルの Maven 構成と`application.yml`ファイルのユーザー構成について簡単に説明します。

#### Maven 構成 {#maven-configuration}

`pom.xml`ファイルは、プロジェクトの Maven 依存関係、パッケージ化方法、およびパッケージ化情報を宣言する Maven 構成ファイルです。この構成ファイルを生成するプロセスを[同じ依存関係を持つ空のアプリケーションを作成する](#create-a-blank-application-with-the-same-dependency-optional)複製するか、プロジェクトに直接コピーすることができます。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.0.1</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <groupId>com.pingcap</groupId>
    <artifactId>spring-jpa-hibernate</artifactId>
    <version>0.0.1</version>
    <name>spring-jpa-hibernate</name>
    <description>an example for spring boot, jpa, hibernate and TiDB</description>

    <properties>
        <java.version>17</java.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

#### ユーザー構成 {#user-configuration}

`application.yml`構成ファイルは、データベース アドレス、パスワード、使用するデータベースの方言などのユーザー構成を宣言します。

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:4000/test
    username: root
    #    password: xxx
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    show-sql: true
    database-platform: org.hibernate.dialect.TiDBDialect
    hibernate:
      ddl-auto: create-drop
```

設定は[YAML](https://yaml.org/)に書かれています。フィールドの説明は次のとおりです。

-   `spring.datasource.url` : データベース接続の URL。
-   `spring.datasource.username` : データベースのユーザー名。
-   `spring.datasource.password` : データベースのパスワード。空。このフィールドをコメントアウトするか削除する必要があります。
-   `spring.datasource.driver-class-name` : データベース ドライバー。 TiDB は MySQL と互換性があるため、mysql-connector-java ドライバー クラス`com.mysql.cj.jdbc`を使用します。
-   `jpa.show-sql` : このフィールドが`true`に設定されている場合、JPA によって実行される SQL ステートメントが出力されます。
-   `jpa.database-platform` : 選択されたデータベースの方言。アプリケーションは TiDB に接続するため、 **TiDB 方言**を選択します。このダイアレクトは Hibernate `6.0.0.Beta2`以降のバージョンでのみ使用できることに注意してください。そのため、該当する依存バージョンを選択してください。
-   `jpa.hibernate.ddl-auto` : `create-drop` 、プログラムの開始時にテーブルを作成し、終了時にテーブルを削除します。本番環境ではこのオプションを設定しないでください。これはサンプル アプリケーションであるため、このオプションはデータベース データへの影響を最小限に抑えるように設定されています。

### エントリーポイント {#entry-point}

`App.java`ファイルはエントリ ポイントです。

```java
package com.pingcap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.ApplicationPidFileWriter;

@SpringBootApplication
public class App {
   public static void main(String[] args) {
      SpringApplication springApplication = new SpringApplication(App.class);
      springApplication.addListeners(new ApplicationPidFileWriter("spring-jpa-hibernate.pid"));
      springApplication.run(args);
   }
}
```

エントリ クラスは、Spring Boot アプリケーションの標準構成アノテーション[`@SpringBootApplication`](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/autoconfigure/SpringBootApplication.html)で始まります。詳細については、Spring Boot 公式ドキュメントの[`@SpringBootApplication`アノテーションの使用](https://docs.spring.io/spring-boot/docs/current/reference/html/using-spring-boot.html#using-boot-using-springbootapplication-annotation)参照してください。次に、プログラムは`ApplicationPidFileWriter`を使用して、アプリケーションの起動時に`spring-jpa-hibernate.pid`という名前の PID (プロセス識別番号) ファイルを書き込みます。 PID ファイルを使用して、外部ソースからこのアプリケーションを閉じることができます。

### データ アクセス オブジェクト {#data-access-object}

`dao` (データ アクセス オブジェクト) パッケージは、データ オブジェクトの永続性を実装します。

#### エンティティ オブジェクト {#entity-objects}

`PlayerBean.java`ファイルは、データベース内のテーブルに対応するエンティティ オブジェクトです。

```java
package com.pingcap.dao;

import jakarta.persistence.*;

/**
 * it's core entity in hibernate
 * @Table appoint to table name
 */
@Entity
@Table(name = "player_jpa")
public class PlayerBean {
    /**
     * @ID primary key
     * @GeneratedValue generated way. this field will use generator named "player_id"
     * @SequenceGenerator using `sequence` feature to create a generator,
     *    and it named "player_jpa_id_seq" in database, initial form 1 (by `initialValue`
     *    parameter default), and every operator will increase 1 (by `allocationSize`)
     */
    @Id
    @GeneratedValue(generator="player_id")
    @SequenceGenerator(name="player_id", sequenceName="player_jpa_id_seq", allocationSize=1)
    private Long id;

    /**
     * @Column field
     */
    @Column(name = "coins")
    private Integer coins;
    @Column(name = "goods")
    private Integer goods;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getCoins() {
        return coins;
    }

    public void setCoins(Integer coins) {
        this.coins = coins;
    }

    public Integer getGoods() {
        return goods;
    }

    public void setGoods(Integer goods) {
        this.goods = goods;
    }
}
```

エンティティ クラスには、エンティティ クラスをテーブルにバインドするための追加情報を Hibernate に与えるいくつかの注釈があります。

-   `@Entity` `PlayerBean`エンティティ クラスであることを宣言します。
-   `@Table`アノテーション属性`name`を使用して、このエンティティ クラスを`player_jpa`テーブルに関連付けます。
-   `@Id` 、このプロパティがテーブルの主キー列に関連していることを宣言します。
-   `@GeneratedValue` 、この列の値が自動的に生成され、手動で設定する必要がないことを示します。属性`generator`ジェネレーターの名前を`player_id`として指定するために使用されます。
-   `@SequenceGenerator` [順序](/sql-statements/sql-statement-create-sequence.md)を使用するジェネレーターを宣言し、アノテーション属性`name`を使用してジェネレーターの名前を`player_id`として宣言します ( `@GeneratedValue`で指定された名前と一致します)。注釈属性`sequenceName` 、データベース内のシーケンスの名前を指定するために使用されます。最後に、注釈属性`allocationSize`使用して、シーケンスのステップ サイズが 1 であることを宣言します。
-   `@Column` 、各プライベート属性を`player_jpa`テーブルの列として宣言し、注釈属性`name`を使用して、属性に対応する列の名前を決定します。

#### リポジトリ {#repository}

データベースレイヤーを抽象化するために、Spring アプリケーションは[`Repository`](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#repositories)インターフェース、または`Repository`のサブインターフェースを使用します。このインターフェイスは、テーブルなどのデータベース オブジェクトにマップされます。 JPA は、primay キーを使用して[`INSERT`](/sql-statements/sql-statement-insert.md)や[`SELECT`](/sql-statements/sql-statement-select.md)などのいくつかの事前構築済みメソッドを実装します。

```java
package com.pingcap.dao;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<PlayerBean, Long> {
    /**
     * use HQL to query by page
     * @param pageable a pageable parameter required by hibernate
     * @return player list package by page message
     */
    @Query(value = "SELECT player_jpa FROM PlayerBean player_jpa")
    Page<PlayerBean> getPlayersByPage(Pageable pageable);

    /**
     * use SQL to query by limit, using named parameter
     * @param limit sql parameter
     * @return player list (max size by limit)
     */
    @Query(value = "SELECT * FROM player_jpa LIMIT :limit", nativeQuery = true)
    List<PlayerBean> getPlayersByLimit(@Param("limit") Integer limit);

    /**
     * query player and add a lock for update
     * @param id player id
     * @return player
     */
    @Lock(value = LockModeType.PESSIMISTIC_WRITE)
    @Query(value = "SELECT player FROM PlayerBean player WHERE player.id = :id")
    // @Query(value = "SELECT * FROM player_jpa WHERE id = :id FOR UPDATE", nativeQuery = true)
    PlayerBean getPlayerAndLock(@Param("id") Long id);
}
```

`PlayerRepository`インターフェースは、Spring が JPA データ アクセスに使用する`JpaRepository`インターフェースを拡張します。 `@Query`アノテーションは、このインターフェースでクエリを実装する方法を Hibernate に伝えるために使用されます。次の 2 つのクエリ構文が使用されます。

-   `getPlayersByPage`インターフェイスでは、 [Hibernate クエリ言語](https://docs.jboss.org/hibernate/orm/6.0/userguide/html_single/Hibernate_User_Guide.html#hql) (HQL) が使用されます。
-   `getPlayersByLimit`インターフェースでは、ネイティブ SQL が使用されます。インターフェースがネイティブ SQL 構文を使用する場合、 `@Query`注釈パラメーター`nativeQuery` `true`に設定する必要があります。

`getPlayersByLimit`注釈の SQL では、 `:limit`は Hibernate では[名前付きパラメーター](https://docs.jboss.org/hibernate/orm/6.0/userguide/html_single/Hibernate_User_Guide.html#jpql-query-parameters)と呼ばれます。 Hibernate は、アノテーションが存在するインターフェース内の名前でパラメーターを自動的に見つけてスプライスします。 `@Param`使用して、注入のパラメーターとは異なる名前を指定することもできます。

`getPlayerAndLock`では、注釈[`@Lock`](https://docs.spring.io/spring-data/jpa/docs/current/api/org/springframework/data/jpa/repository/Lock.html)を使用して悲観的ロックが適用されることを宣言します。その他のロック方法については、 [エンティティのロック](https://openjpa.apache.org/builds/2.2.2/apache-openjpa/docs/jpa_overview_em_locking.html)を参照してください。 `@Lock`注釈は`HQL`と共に使用する必要があります。そうしないと、エラーが発生します。ロックに SQL を直接使用する場合は、コメントの注釈を使用できます。

```java
@Query(value = "SELECT * FROM player_jpa WHERE id = :id FOR UPDATE", nativeQuery = true)
```

上記の SQL ステートメントでは、 `FOR UPDATE`を使用してロックを直接追加しています。また、TiDB [`SELECT`ステートメント](/sql-statements/sql-statement-select.md)を使用して、原則をさらに深く掘り下げることもできます。

### ロジックの実装 {#logic-implementation}

ロジック実装レイヤーは、プロジェクトによって実装されるインターフェイスとロジックを含む`service`パッケージです。

#### インターフェース {#interface}

`PlayerService.java`ファイルは、クラスを直接記述するのではなく、論理インターフェイスを定義し、インターフェイスを実装します。これは、例をできるだけ実際の使用に近づけ、設計の[開閉原理](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle)を反映するためです。このインターフェースを省略して、実装クラスを依存関係クラスに直接注入することもできますが、この方法はお勧めしません。

```java
package com.pingcap.service;

import com.pingcap.dao.PlayerBean;
import org.springframework.data.domain.Page;

import java.util.List;

public interface PlayerService {
    /**
     * create players by passing in a List of PlayerBean
     *
     * @param players will create players list
     * @return The number of create accounts
     */
    Integer createPlayers(List<PlayerBean> players);

    /**
     * buy goods and transfer funds between one player and another in one transaction
     * @param sellId sell player id
     * @param buyId buy player id
     * @param amount goods amount, if sell player has not enough goods, the trade will break
     * @param price price should pay, if buy player has not enough coins, the trade will break
     */
    void buyGoods(Long sellId, Long buyId, Integer amount, Integer price) throws RuntimeException;

    /**
     * get the player info by id.
     *
     * @param id player id
     * @return the player of this id
     */
    PlayerBean getPlayerByID(Long id);

    /**
     * get a subset of players from the data store by limit.
     *
     * @param limit return max size
     * @return player list
     */
    List<PlayerBean> getPlayers(Integer limit);

    /**
     * get a page of players from the data store.
     *
     * @param index page index
     * @param size page size
     * @return player list
     */
    Page<PlayerBean> getPlayersByPage(Integer index, Integer size);

    /**
     * count players from the data store.
     *
     * @return all players count
     */
    Long countPlayers();
}
```

#### 実装 (重要) {#implementation-important}

`PlayerService.java`ファイルは、すべてのデータ処理ロジックを含む`PlayerService`インターフェイスを実装します。

```java
package com.pingcap.service.impl;

import com.pingcap.dao.PlayerBean;
import com.pingcap.dao.PlayerRepository;
import com.pingcap.service.PlayerService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * PlayerServiceImpl implements PlayerService interface
 * @Transactional it means every method in this class, will package by a pair of
 *     transaction.begin() and transaction.commit(). and it will be call
 *     transaction.rollback() when method throw an exception
 */
@Service
@Transactional
public class PlayerServiceImpl implements PlayerService {
    @Autowired
    private PlayerRepository playerRepository;

    @Override
    public Integer createPlayers(List<PlayerBean> players) {
        return playerRepository.saveAll(players).size();
    }

    @Override
    public void buyGoods(Long sellId, Long buyId, Integer amount, Integer price) throws RuntimeException {
        PlayerBean buyPlayer = playerRepository.getPlayerAndLock(buyId);
        PlayerBean sellPlayer = playerRepository.getPlayerAndLock(sellId);
        if (buyPlayer == null || sellPlayer == null) {
            throw new RuntimeException("sell or buy player not exist");
        }

        if (buyPlayer.getCoins() < price || sellPlayer.getGoods() < amount) {
            throw new RuntimeException("coins or goods not enough, rollback");
        }

        buyPlayer.setGoods(buyPlayer.getGoods() + amount);
        buyPlayer.setCoins(buyPlayer.getCoins() - price);
        playerRepository.save(buyPlayer);

        sellPlayer.setGoods(sellPlayer.getGoods() - amount);
        sellPlayer.setCoins(sellPlayer.getCoins() + price);
        playerRepository.save(sellPlayer);
    }

    @Override
    public PlayerBean getPlayerByID(Long id) {
        return playerRepository.findById(id).orElse(null);
    }

    @Override
    public List<PlayerBean> getPlayers(Integer limit) {
        return playerRepository.getPlayersByLimit(limit);
    }

    @Override
    public Page<PlayerBean> getPlayersByPage(Integer index, Integer size) {
        return playerRepository.getPlayersByPage(PageRequest.of(index, size));
    }

    @Override
    public Long countPlayers() {
        return playerRepository.count();
    }
}
```

`@Service`アノテーションは、このオブジェクトのライフサイクルが`Spring`によって管理されることを宣言するために使用されます。

`PlayerServiceImpl`実装クラスには、 `@Service`アノテーションに加えて[`@Transactional`](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#transaction-declarative-annotations)アノテーションもあります。アプリケーションでトランザクション管理が有効になっている場合 ( [`@EnableTransactionManagement`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/annotation/EnableTransactionManagement.html)使用して有効にできますが、デフォルトでは`Spring Boot`で有効になっています。手動で構成する必要はありません)、 `Spring`自動的に`@Transactional`アノテーションを持つすべてのオブジェクトをプロキシでラップし、オブジェクト呼び出し処理にこのプロキシを使用します。

エージェントが`@Transactional`アノテーションを使用してオブジェクト内の関数を呼び出すと、次のように単純に想定できます。

-   関数の先頭で、 `transaction.begin()`でトランザクションを開始します。
-   関数が戻ると、 `transaction.commit()`を呼び出してトランザクションをコミットします。
-   実行時エラーが発生すると、エージェントは`transaction.rollback()`を呼び出してロールバックします。

取引の詳細については[データベース トランザクション](/develop/dev-guide-transaction-overview.md)を参照するか、 `Spring` Web サイトの[Spring Framework の宣言型トランザクションの実装を理解する](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#tx-decl-explained)を参照してください。

すべての実装クラスで、 `buyGoods`機能に注意が必要です。関数が非論理的な操作に遭遇すると、例外をスローし、Hibernate にトランザクションのロールバックを実行して不正なデータを防ぐように指示します。

### 外部 HTTP インターフェイス {#external-http-interface}

`controller`パッケージは、HTTP インターフェイスを外部に公開し、 [残りの API](https://www.redhat.com/en/topics/api/what-is-a-rest-api#)経由でサービスにアクセスできるようにします。

```java
package com.pingcap.controller;

import com.pingcap.dao.PlayerBean;
import com.pingcap.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/player")
public class PlayerController {
    @Autowired
    private PlayerService playerService;

    @PostMapping
    public Integer createPlayer(@RequestBody @NonNull List<PlayerBean> playerList) {
        return playerService.createPlayers(playerList);
    }

    @GetMapping("/{id}")
    public PlayerBean getPlayerByID(@PathVariable Long id) {
        return playerService.getPlayerByID(id);
    }

    @GetMapping("/limit/{limit_size}")
    public List<PlayerBean> getPlayerByLimit(@PathVariable("limit_size") Integer limit) {
        return playerService.getPlayers(limit);
    }

    @GetMapping("/page")
    public Page<PlayerBean> getPlayerByPage(@RequestParam Integer index, @RequestParam("size") Integer size) {
        return playerService.getPlayersByPage(index, size);
    }

    @GetMapping("/count")
    public Long getPlayersCount() {
        return playerService.countPlayers();
    }

    @PutMapping("/trade")
    public Boolean trade(@RequestParam Long sellID, @RequestParam Long buyID, @RequestParam Integer amount, @RequestParam Integer price) {
        try {
            playerService.buyGoods(sellID, buyID, amount, price);
        } catch (RuntimeException e) {
            return false;
        }

        return true;
    }
}
```

`PlayerController`機能を示すためにできるだけ多くの注釈を使用します。実際のプロジェクトでは、会社やチームのルールに従いながら、一貫したスタイルを維持してください。 `PlayerController`の注釈は次のように説明されています。

-   [`@RestController`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RestController.html) `PlayerController` [ウェブコントローラー](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)として宣言し、戻り値を`JSON`出力としてシリアル化します。
-   [`@RequestMapping`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestMapping.html) URL エンドポイントを`/player`にマップします。つまり、この`Web Controller` `/player` URL に送信されたリクエストのみをリッスンします。
-   `@Autowired` `Spring`コンテナーが協力する Bean 間の関係をオートワイヤーできることを意味します。宣言には`PlayerService`オブジェクトが必要です。これはインターフェイスであり、使用する実装クラスを指定しません。これはSpringによって組み立てられます。このアセンブリのルールについては、Spring の公式 Web サイトの[IoC コンテナー](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/beans.html)を参照してください。
-   [`@PostMapping`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/PostMapping.html) 、この関数が HTTP の[役職](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST)要求に応答することを宣言します。
    -   `@RequestBody` 、HTTP ペイロード全体が`playerList`パラメーターに解析されることを宣言します。
    -   `@NonNull` 、パラメーターが null であってはならないことを宣言します。そうでない場合は、エラーが返されます。
-   [`@GetMapping`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/GetMapping.html) 、この関数が HTTP の[得る](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET)要求に応答することを宣言します。
    -   [`@PathVariable`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/PathVariable.html) 、アノテーションに`{id}`や`{limit_size}`などのプレースホルダーがあり、これらは`@PathVariable`でアノテーションが付けられた変数にバインドされていることを示します。このようなバインディングは、注釈属性`name`に基づいています。注釈属性`name`が指定されていない場合は、変数名と同じです。変数名は省略できます。つまり、 `@PathVariable(name="limit_size")` `@PathVariable("limit_size")`のように記述できます。
-   [`@PutMapping`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/PutMapping.html) 、この関数が HTTP の[置く](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT)要求に応答することを宣言します。
-   [`@RequestParam`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestParam.html)は、この関数がリクエスト内の URL パラメーター、フォーム パラメーター、およびその他のパラメーターを解析し、それらを注釈付き変数にバインドすることを宣言します。

## 同じ依存関係を持つ空のアプリケーションを作成する (オプション) {#create-a-blank-application-with-the-same-dependency-optional}

このアプリケーションは[春の初期化](https://start.spring.io/)を使用して構築されています。次のオプションをクリックし、いくつかの構成項目を変更することで、このサンプル アプリケーションと同じ依存関係を持つ空のアプリケーションをすばやく取得できます。

**計画**

-   Maven プロジェクト

**言語**

-   Java

**スプリングブーツ**

-   最新の安定版

**プロジェクトのメタデータ**

-   グループ: com.pingcap
-   アーティファクト: spring-jpa-hibernate
-   名前: spring-jpa-hibernate
-   パッケージ名: com.pingcap
-   包装: 瓶
-   Java：17

**依存関係**

-   春のウェブ
-   春のデータ JPA
-   MySQLDriver

完全な構成は次のとおりです。

![Spring Initializr Configuration](https://docs-download.pingcap.com/media/images/docs/develop/develop-spring-initializr-configuration.png)

> **ノート：**
>
> SQL は比較的標準化されていますが、各データベース ベンダーは ANSI SQL 定義の構文のサブセットとスーパーセットを使用しています。これは、データベースの方言と呼ばれます。 Hibernate は、その`org.hibernate.dialect.Dialect`クラスと各データベース ベンダーのさまざまなサブクラスを通じて、これらのダイアレクト全体のバリエーションを処理します。
>
> ほとんどの場合、Hibernate は、ブートストラップ中に JDBC 接続に関するいくつかの質問をすることで、使用する適切なダイアレクトを決定できます。使用する適切な方言を決定する Hibernate の機能 (およびその解決に影響を与える機能) については、 [方言解決](https://docs.jboss.org/hibernate/orm/6.0/userguide/html_single/Hibernate_User_Guide.html#portability-dialectresolver)を参照してください。
>
> 何らかの理由で適切な方言を決定できない場合、またはカスタム方言を使用したい場合は、 `hibernate.dialect`設定を行う必要があります。
>
> *—— Hibernate の公式ドキュメントからの抜粋: <a href="https://docs.jboss.org/hibernate/orm/6.0/userguide/html_single/Hibernate_User_Guide.html#database-dialect">Database Dialect</a>*

構成後、サンプル アプリケーションと同じ依存関係を持つ空の**Spring Boot**アプリケーションを取得できます。
