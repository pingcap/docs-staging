---
title: Enable TLS Between TiDB Components
summary: Learn how to enable TLS authentication between TiDB components.
---

# TiDB コンポーネント間の TLS を有効にする {#enable-tls-between-tidb-components}

このドキュメントでは、TiDB クラスター内のコンポーネント間で暗号化されたデータ転送を有効にする方法について説明します。有効にすると、次のコンポーネント間で暗号化された転送が使用されます。

-   TiDB、TiKV、PD、 TiFlash間の通信
-   TiDB コントロールと TiDB、 TiKV Controlと TiKV、 PD Controlと PD
-   各 TiDB、TiKV、PD、およびTiFlashクラスタ内の内部通信

現在、特定のコンポーネントの暗号化された送信のみを有効にすることはサポートされていません。

## 暗号化されたデータ転送を設定して有効にする {#configure-and-enable-encrypted-data-transmission}

1.  証明書を準備します。

    TiDB、TiKV、PD のサーバー証明書を個別に準備することをお勧めします。これらのコンポーネントが相互に認証できることを確認してください。TiDB、TiKV、PD のコントロール ツールは、1 つのクライアント証明書を共有することを選択できます。

    `openssl` `easy-rsa` `cfssl`ツールを使用して自己署名証明書を生成できます。

    <CustomContent platform="tidb">

    `openssl`選択した場合は[自己署名証明書の生成](/generate-self-signed-certificates.md)を参照できます。

    </CustomContent>

    <CustomContent platform="tidb-cloud">

    `openssl`選択した場合は[自己署名証明書の生成](https://docs.pingcap.com/tidb/stable/generate-self-signed-certificates)を参照できます。

    </CustomContent>

2.  証明書を構成します。

    TiDB コンポーネント間の相互認証を有効にするには、TiDB、TiKV、PD の証明書を次のように構成します。

    -   ティビ

        設定ファイルまたはコマンドライン引数で設定します。

        ```toml
        [security]
        # Path of the file that contains list of trusted SSL CAs for connection with cluster components.
        cluster-ssl-ca = "/path/to/ca.pem"
        # Path of the file that contains X509 certificate in PEM format for connection with cluster components.
        cluster-ssl-cert = "/path/to/tidb-server.pem"
        # Path of the file that contains X509 key in PEM format for connection with cluster components.
        cluster-ssl-key = "/path/to/tidb-server-key.pem"
        ```

    -   ティクヴ

        設定ファイルまたはコマンドライン引数で設定し、対応する URL を`https`に設定します。

        ```toml
        [security]
        ## The path for certificates. An empty string means that secure connections are disabled.
        # Path of the file that contains a list of trusted SSL CAs. If it is set, the following settings `cert_path` and `key_path` are also needed.
        ca-path = "/path/to/ca.pem"
        # Path of the file that contains X509 certificate in PEM format.
        cert-path = "/path/to/tikv-server.pem"
        # Path of the file that contains X509 key in PEM format.
        key-path = "/path/to/tikv-server-key.pem"
        ```

    -   PD

        設定ファイルまたはコマンドライン引数で設定し、対応する URL を`https`に設定します。

        ```toml
        [security]
        ## The path for certificates. An empty string means that secure connections are disabled.
        # Path of the file that contains a list of trusted SSL CAs. If it is set, the following settings `cert_path` and `key_path` are also needed.
        cacert-path = "/path/to/ca.pem"
        # Path of the file that contains X509 certificate in PEM format.
        cert-path = "/path/to/pd-server.pem"
        # Path of the file that contains X509 key in PEM format.
        key-path = "/path/to/pd-server-key.pem"
        ```

    -   TiFlash (v4.0.5 の新機能)

        `tiflash.toml`ファイルで設定し、 `http_port`項目を`https_port`に変更します。

        ```toml
        [security]
        ## The path for certificates. An empty string means that secure connections are disabled.
        # Path of the file that contains a list of trusted SSL CAs. If it is set, the following settings `cert_path` and `key_path` are also needed.
        ca_path = "/path/to/ca.pem"
        # Path of the file that contains X509 certificate in PEM format.
        cert_path = "/path/to/tiflash-server.pem"
        # Path of the file that contains X509 key in PEM format.
        key_path = "/path/to/tiflash-server-key.pem"
        ```

        `tiflash-learner.toml`ファイルで設定します:

        ```toml
        [security]
        # Path of the file that contains a list of trusted SSL CAs. If it is set, the following settings `cert_path` and `key_path` are also needed.
        ca-path = "/path/to/ca.pem"
        # Path of the file that contains X509 certificate in PEM format.
        cert-path = "/path/to/tiflash-server.pem"
        # Path of the file that contains X509 key in PEM format.
        key-path = "/path/to/tiflash-server-key.pem"
        ```

    -   ティCDC

        設定ファイルで設定：

        ```toml
        [security]
        ca-path = "/path/to/ca.pem"
        cert-path = "/path/to/cdc-server.pem"
        key-path = "/path/to/cdc-server-key.pem"
        ```

        または、コマンドライン引数で設定し、対応する URL を`https`に設定します。

        ```bash
        cdc server --pd=https://127.0.0.1:2379 --log-file=ticdc.log --addr=0.0.0.0:8301 --advertise-addr=127.0.0.1:8301 --ca=/path/to/ca.pem --cert=/path/to/ticdc-cert.pem --key=/path/to/ticdc-key.pem
        ```

        現在、TiDB コンポーネント間の暗号化された送信が有効になっています。

    > **注記：**
    >
    > TiDB クラスターで暗号化された送信を有効にした後、tidb-ctl、tikv-ctl、または pd-ctl を使用してクラスターに接続する必要がある場合は、クライアント証明書を指定します。例:

    ```bash
    ./tidb-ctl -u https://127.0.0.1:10080 --ca /path/to/ca.pem --ssl-cert /path/to/client.pem --ssl-key /path/to/client-key.pem
    ```

    ```bash
    tiup ctl:v<CLUSTER_VERSION> pd -u https://127.0.0.1:2379 --cacert /path/to/ca.pem --cert /path/to/client.pem --key /path/to/client-key.pem
    ```

    ```bash
    ./tikv-ctl --host="127.0.0.1:20160" --ca-path="/path/to/ca.pem" --cert-path="/path/to/client.pem" --key-path="/path/to/clinet-key.pem"
    ```

### コンポーネント呼び出し元のIDを確認する {#verify-component-caller-s-identity}

共通名は、発信者の検証に使用されます。通常、着信側は、発信者が提供するキー、証明書、および CA を検証するだけでなく、発信者の ID も検証する必要があります。たとえば、TiKV には TiDB のみがアクセスでき、他の訪問者は正当な証明書を持っていてもブロックされます。

コンポーネントの呼び出し元の ID を確認するには、証明書を生成するときに`Common Name`使用して証明書のユーザー ID をマークし、呼び出し先の`Common Name`リストを構成して呼び出し元の ID を確認する必要があります。

> **注記：**
>
> 現在、PD の`cert-allowed-cn`つの構成項目には 1 つの値しか設定できません。したがって、すべての認証オブジェクトの`commonName`を同じ値に設定する必要があります。

-   ティビ

    設定ファイルまたはコマンドライン引数で設定します。

    ```toml
    [security]
    cluster-verify-cn = ["TiDB"]
    ```

-   ティクヴ

    設定ファイルまたはコマンドライン引数で設定します。

    ```toml
    [security]
    cert-allowed-cn = ["TiDB"]
    ```

-   PD

    設定ファイルまたはコマンドライン引数で設定します。

    ```toml
    [security]
    cert-allowed-cn = ["TiDB"]
    ```

-   TiFlash (v4.0.5 の新機能)

    `tiflash.toml`ファイルまたはコマンドライン引数で設定します。

    ```toml
    [security]
    cert_allowed_cn = ["TiDB"]
    ```

    `tiflash-learner.toml`ファイルで設定します:

    ```toml
    [security]
    cert-allowed-cn = ["TiDB"]
    ```

## 証明書を再読み込み {#reload-certificates}

-   TiDB クラスターがローカル データ センターに展開されている場合、証明書とキーを再ロードするために、TiDB、PD、TiKV、 TiFlash、TiCDC、およびあらゆる種類のクライアントは、新しい接続が作成されるたびに、TiDB クラスターを再起動せずに、現在の証明書とキー ファイルを再読み取ります。

-   TiDB クラスターが独自の管理クラウドにデプロイされている場合は、TLS 証明書の発行がクラウド プロバイダーの証明書管理サービスと統合されていることを確認してください。TiDB、PD、TiKV、 TiFlash、および TiCDC コンポーネントの TLS 証明書は、TiDB クラスターを再起動せずに自動的にローテーションできます。

## 証明書の有効期間 {#certificate-validity}

TiDB クラスター内の各コンポーネントの TLS 証明書の有効期間をカスタマイズできます。たとえば、OpenSSL を使用して TLS 証明書を発行および生成する場合、 **days**パラメータを使用して有効期間を設定できます。詳細については、 [自己署名証明書を生成する](/generate-self-signed-certificates.md)を参照してください。

## 参照 {#see-also}

-   [TiDBクライアントとサーバー間のTLSを有効にする](/enable-tls-between-clients-and-servers.md)
