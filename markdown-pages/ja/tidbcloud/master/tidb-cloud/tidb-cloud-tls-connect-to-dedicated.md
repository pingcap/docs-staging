---
title: TLS Connections to TiDB Dedicated
summary: TiDB Dedicated に TLS 接続を導入します。
---

# TiDB専用へのTLS接続 {#tls-connections-to-tidb-dedicated}

TiDB Cloudでは、TLS 接続を確立することが、TiDB Dedicated クラスターに接続するための基本的なセキュリティ プラクティスの 1 つです。クライアント、アプリケーション、開発ツールから TiDB Dedicated クラスターへの複数の TLS 接続を構成して、データ転送のセキュリティを保護できます。セキュリティ上の理由から、TiDB Dedicated は TLS 1.2 と TLS 1.3 のみをサポートし、TLS 1.0 と TLS 1.1 バージョンはサポートしていません。

データのセキュリティを確保するため、TiDB 専用クラスターの TiDB クラスター CA は[AWS 証明書マネージャー (ACM)](https://aws.amazon.com/certificate-manager/)でホストされ、TiDB クラスターの秘密キーは[FIPS 140-2 レベル 3](https://csrc.nist.gov/projects/cryptographic-module-validation-program/Certificate/3139)セキュリティ標準を満たす AWS 管理のハードウェアセキュリティモジュール (HSM) に保存されます。

## 前提条件 {#prerequisites}

-   [パスワード認証](/tidb-cloud/tidb-cloud-password-authentication.md)または[SSO認証](/tidb-cloud/tidb-cloud-sso-authentication.md)でTiDB Cloudにログインし、次に[TiDB専用クラスターを作成する](/tidb-cloud/create-tidb-cluster.md)ログインします。

-   安全な設定でクラスターにアクセスするためのパスワードを設定します。

    これを行うには、プロジェクトの[**クラスター**](https://tidbcloud.com/console/clusters)ページに移動し、TiDB 専用クラスターの行で**[...]**をクリックして、 **[Security設定]**を選択します。セキュリティ設定で**[生成] を**クリックすると、数字、大文字と小文字、特殊文字を含む 16 文字の長さのルート パスワードが自動的に生成されます。

## TiDB専用クラスタへのセキュリティ接続 {#secure-connection-to-a-tidb-dedicated-cluster}

[TiDB Cloudコンソール](https://tidbcloud.com/)では、さまざまな接続方法の例を取得し、次のように TiDB 専用クラスターに接続できます。

1.  プロジェクトの[**クラスター**](https://tidbcloud.com/console/clusters)ページに移動し、TiDB 専用クラスターの名前をクリックして概要ページに移動します。

2.  右上隅の**「接続」**をクリックします。ダイアログが表示されます。

3.  このダイアログの**「標準接続」**タブで、次の 3 つの手順に従って TLS 接続を設定します。
    -   ステップ1：トラフィックフィルターを作成する
    -   ステップ2：CA証明書をダウンロードする
    -   ステップ3：SQLクライアントに接続する

4.  ダイアログの**「ステップ 1: トラフィック フィルターの作成」**で、クラスターへのアクセスを許可する IP アドレスを構成します。詳細については、 [標準接続でIPアクセスリストを構成する](/tidb-cloud/configure-ip-access-list.md#configure-an-ip-access-list-in-standard-connection)を参照してください。

5.  **「ステップ 2: CA 証明書のダウンロード**」で、 **「CA 証明書のダウンロード」**をクリックして、クライアント TLS 構成用にローカルにダウンロードします。CA 証明書により、TLS 接続が安全で信頼できることが保証されます。

    > **注記：**
    >
    > -   ダウンロードした CA 証明書は、オペレーティング システムのデフォルトのstorageパスに保存することも、別のstorageパスを指定することもできます。後続の手順では、コード例の CA 証明書パスを独自の CA 証明書パスに置き換える必要があります。
    > -   TiDB Dedicated では、クライアントに TLS 接続の使用を強制しません。また、 [`require_secure_transport`](/system-variables.md#require_secure_transport-new-in-v610)変数のユーザー定義構成は現在、TiDB Dedicated ではサポートされていません。

6.  ダイアログの**「ステップ 3: SQL クライアントを使用して接続する**」で、希望する接続方法のタブをクリックし、タブの接続文字列とサンプル コードを参照してクラスターに接続します。

次の例は、MySQL、MyCLI、JDBC、Python、Go、Node.js の接続文字列を示しています。

<SimpleTab>
<div label="MySQL CLI">

MySQL CLI クライアントは、デフォルトで TLS 接続を確立しようとします。TiDB 専用クラスターに接続する場合は、 `ssl-mode`と`ssl-ca`設定する必要があります。

```shell
mysql --connect-timeout 15 --ssl-mode=VERIFY_IDENTITY --ssl-ca=ca.pem --tls-version="TLSv1.2" -u root -h tidb.eqlfbdgthh8.clusters.staging.tidb-cloud.com -P 4000 -D test -p
```

パラメータの説明：

-   `--ssl-mode=VERIFY_IDENTITY`では、MySQL CLI クライアントは TLS を有効にし、TiDB 専用クラスターを検証することを強制します。
-   `--ssl-ca=<CA_path>`使用して、ダウンロードした TiDB クラスター`ca.pem`のローカル パスを指定します。
-   TLS プロトコルのバージョンを制限するには`--tls-version=TLSv1.2`使用します。TLS 1.3 を使用する場合は、バージョンを`TLSv1.3`に設定できます。

</div>

<div label="MyCLI">

[マイクリ](https://www.mycli.net/) 、 TLS 関連のパラメータを使用するときに TLS を自動的に有効にします。TiDB 専用クラスターに接続する場合は、 `ssl-ca`と`ssl-verify-server-cert`設定する必要があります。

```shell
mycli --ssl-ca=ca.pem --ssl-verify-server-cert -u root -h tidb.eqlfbdgthh8.clusters.staging.tidb-cloud.com -P 4000 -D test
```

パラメータの説明：

-   `--ssl-ca=<CA_path>`使用して、ダウンロードした TiDB クラスター`ca.pem`のローカル パスを指定します。
-   `--ssl-verify-server-cert`で TiDB 専用クラスターを検証します。

</div>

<div label="JDBC">

ここでは例として[MySQL コネクタ/J](https://dev.mysql.com/doc/connector-j/en/)の TLS 接続構成を使用します。

TiDB クラスター CA をダウンロードした後、それをオペレーティング システムにインポートする場合は、 `keytool -importcert -alias TiDBCACert -file ca.pem -keystore <your_custom_truststore_path> -storepass <your_truststore_password>`コマンドを使用できます。

```shell
/* Be sure to replace the parameters in the following connection string. */
/* version >= 8.0.28 */
jdbc:mysql://tidb.srgnqxji5bc.clusters.staging.tidb-cloud.com:4000/test?user=root&password=<your_password>&sslMode=VERIFY_IDENTITY&tlsVersions=TLSv1.2&trustCertificateKeyStoreUrl=file:<your_custom_truststore_path>&trustCertificateKeyStorePassword=<your_truststore_password>
```

詳細なコード例を表示するには、 **「使用例を表示」を**クリックします。

    import com.mysql.jdbc.Driver;
    import java.sql.*;

    class Main {
      public static void main(String args[]) throws SQLException, ClassNotFoundException {
        Class.forName("com.mysql.cj.jdbc.Driver");
        try {
          Connection conn = DriverManager.getConnection("jdbc:mysql://tidb.srgnqxji5bc.clusters.staging.tidb-cloud.com:4000/test?user=root&password=<your_password>&sslMode=VERIFY_IDENTITY&tlsVersions=TLSv1.2&trustCertificateKeyStoreUrl=file:<your_custom_truststore_path>&trustCertificateKeyStorePassword=<your_truststore_password>");
          Statement stmt = conn.createStatement();
          try {
            ResultSet rs = stmt.executeQuery("SELECT DATABASE();");
            if (rs.next()) {
              System.out.println("using db:" + rs.getString(1));
            }
          } catch (Exception e) {
            System.out.println("exec error:" + e);
          }
        } catch (Exception e) {
          System.out.println("connect error:" + e);
        }
      }
    }

パラメータの説明：

-   TLS を有効にし、TiDB 専用クラスターを検証するには、 `sslMode=VERIFY_IDENTITY`設定します。
-   TLS プロトコルのバージョンを制限するには`enabledTLSProtocols=TLSv1.2`設定します。TLS 1.3 を使用する場合は、バージョンを`TLSv1.3`に設定できます。
-   カスタム トラストストア パスに`trustCertificateKeyStoreUrl`設定します。
-   トラストストアのパスワードを`trustCertificateKeyStorePassword`に設定します。

</div>

<div label="Python">

ここでは例として[mysqlクライアント](https://pypi.org/project/mysqlclient/)の TLS 接続構成を使用します。

    host="tidb.srgnqxji5bc.clusters.staging.tidb-cloud.com", user="root", password="<your_password>", port=4000, database="test", ssl_mode="VERIFY_IDENTITY", ssl={"ca": "ca.pem"}

詳細なコード例を表示するには、 **「使用例を表示」を**クリックします。

    import MySQLdb

    connection = MySQLdb.connect(host="tidb.srgnqxji5bc.clusters.staging.tidb-cloud.com", port=4000, user="root", password="<your_password>", database="test", ssl_mode="VERIFY_IDENTITY", ssl={"ca": "ca.pem"})

    with connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT DATABASE();")
            m = cursor.fetchone()
            print(m[0])

パラメータの説明：

-   TLS を有効にし、TiDB 専用クラスターを検証するには、 `ssl_mode="VERIFY_IDENTITY"`設定します。
-   `ssl={"ca": "<CA_path>"}`使用して、ダウンロードした TiDB クラスター`ca.pem`のローカル パスを指定します。

</div>

<div label="Go">

ここでは例として[Go-MySQL-ドライバー](https://github.com/go-sql-driver/mysql)の TLS 接続構成を使用します。

    rootCertPool := x509.NewCertPool()
    pem, err := ioutil.ReadFile("ca.pem")
    if err != nil {
        log.Fatal(err)
    }
    if ok := rootCertPool.AppendCertsFromPEM(pem); !ok {
        log.Fatal("Failed to append PEM.")
    }
    mysql.RegisterTLSConfig("tidb", &tls.Config{
        RootCAs:    rootCertPool,
        MinVersion: tls.VersionTLS12,
        ServerName: "tidb.srgnqxji5bc.clusters.staging.tidb-cloud.com",
    })

    db, err := sql.Open("mysql", "root:<your_password>@tcp(tidb.srgnqxji5bc.clusters.staging.tidb-cloud.com:4000)/test?tls=tidb")

詳細なコード例を表示するには、 **「使用例を表示」を**クリックします。

    package main
    import (
      "crypto/tls"
      "crypto/x509"
      "database/sql"
      "fmt"
      "io/ioutil"
      "log"

      "github.com/go-sql-driver/mysql"
    )
    func main() {
      rootCertPool := x509.NewCertPool()
      pem, err := ioutil.ReadFile("ca.pem")
      if err != nil {
        log.Fatal(err)
      }
      if ok := rootCertPool.AppendCertsFromPEM(pem); !ok {
        log.Fatal("Failed to append PEM.")
      }
      mysql.RegisterTLSConfig("tidb", &tls.Config{
        RootCAs:    rootCertPool,
        MinVersion: tls.VersionTLS12,
        ServerName: "tidb.srgnqxji5bc.clusters.staging.tidb-cloud.com",
      })
      db, err := sql.Open("mysql", "root:<your_password>@tcp(tidb.srgnqxji5bc.clusters.staging.tidb-cloud.com:4000)/test?tls=tidb")
      if err != nil {
        log.Fatal("failed to connect database", err)
      }
      defer db.Close()

      var dbName string
      err = db.QueryRow("SELECT DATABASE();").Scan(&dbName)
      if err != nil {
        log.Fatal("failed to execute query", err)
      }
      fmt.Println(dbName)
    }

パラメータの説明：

-   TLS を有効にして TiDB 専用クラスターを検証するには、TLS 接続構成に`tls.Config`登録します。
-   TLS プロトコルのバージョンを制限するには`MinVersion: tls.VersionTLS12`設定します。
-   TiDB Dedicated のホスト名を確認するには`ServerName: "<host>"`設定します。
-   新しい TLS 構成を登録したくない場合は、接続文字列に`tls=true`設定するだけです。

</div>

<div label="Node.js">

ここでは例として[マイSQL2](https://www.npmjs.com/package/mysql2)の TLS 接続構成を使用します。

    var connection = mysql.createConnection({
      host: 'tidb.srgnqxji5bc.clusters.staging.tidb-cloud.com',
      port: 4000,
      user: 'root',
      password: '<your_password>',
      database: 'test',
      ssl: {
        ca: fs.readFileSync('ca.pem'),
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    });

詳細なコード例を表示するには、 **「使用例を表示」を**クリックします。

    var mysql = require('mysql2');
    var fs = require('fs');
    var connection = mysql.createConnection({
      host: 'tidb.srgnqxji5bc.clusters.staging.tidb-cloud.com',
      port: 4000,
      user: 'root',
      password: '<your_password>',
      database: 'test',
      ssl: {
        ca: fs.readFileSync('ca.pem'),
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    });
    connection.connect(function(err) {
      if (err) {
        throw err
      }
      connection.query('SELECT DATABASE();', function(err, rows) {
        if (err) {
          throw err
        }
        console.log(rows[0]['DATABASE()']);
        connection.end()
      });
    });

パラメータの説明：

-   TLS プロトコルのバージョンを制限するには`ssl: {minVersion: 'TLSv1.2'}`設定します。TLS 1.3 を使用する場合は、バージョンを`TLSv1.3`に設定できます。
-   ダウンロードした TiDB クラスター`ca.pem`のローカル CA パスを読み取るには`ssl: {ca: fs.readFileSync('<CA_path>')}`設定します。

</div>
</SimpleTab>

## TiDB専用ルート証明書の管理 {#manage-root-certificates-for-tidb-dedicated}

TiDB Dedicated は、クライアントと TiDB Dedicated クラスター間の TLS 接続に、 [AWS 証明書マネージャー (ACM)](https://aws.amazon.com/certificate-manager/)の証明書を認証局 (CA) として使用します。通常、ACM のルート証明書は、 [FIPS 140-2 レベル 3](https://csrc.nist.gov/projects/cryptographic-module-validation-program/Certificate/3139)セキュリティ標準を満たす AWS 管理のハードウェアセキュリティモジュール (HSM) に安全に保存されます。

## よくある質問 {#faqs}

### TiDB 専用クラスターに接続するためにサポートされている TLS バージョンはどれですか? {#which-tls-versions-are-supported-to-connect-to-my-tidb-dedicated-cluster}

セキュリティ上の理由から、TiDB Dedicated は TLS 1.2 と TLS 1.3 のみをサポートし、TLS 1.0 と TLS 1.1 バージョンはサポートしていません。詳細については、IETF [TLS 1.0 および TLS 1.1 の廃止](https://datatracker.ietf.org/doc/rfc8996/)を参照してください。

### クライアントと TiDB Dedicated 間の双方向 TLS 認証はサポートされていますか? {#is-two-way-tls-authentication-between-my-client-and-tidb-dedicated-supported}

いいえ。

TiDB Dedicated は片方向 TLS 認証のみをサポートしており、現在双方向 TLS 認証はサポートしていません。双方向 TLS 認証が必要な場合は、 [TiDB Cloudサポート](/tidb-cloud/tidb-cloud-support.md)お問い合わせください。
