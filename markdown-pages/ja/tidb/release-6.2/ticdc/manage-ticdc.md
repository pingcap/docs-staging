---
title: Manage TiCDC Cluster and Replication Tasks
summary: Learn how to manage a TiCDC cluster and replication tasks.
---

# TiCDCクラスタとレプリケーション タスクの管理 {#manage-ticdc-cluster-and-replication-tasks}

このドキュメントでは、TiUP を使用して TiCDC クラスターをアップグレードし、TiCDC クラスターの構成を変更する方法、およびコマンドライン ツールを使用して TiCDC クラスターとレプリケーション タスクを管理する方法について説明します`cdc cli` 。

HTTP インターフェイス (TiCDC OpenAPI 機能) を使用して、TiCDC クラスターとレプリケーション タスクを管理することもできます。詳細については、 [TiCDC OpenAPI](/ticdc/ticdc-open-api.md)を参照してください。

## TiUP を使用して TiCDC をアップグレードする {#upgrade-ticdc-using-tiup}

このセクションでは、TiUP を使用して TiCDC クラスターをアップグレードする方法を紹介します。次の例では、TiCDC と TiDB クラスター全体を v6.2.0 にアップグレードする必要があると想定しています。


```shell
tiup update --self && \
tiup update --all && \
tiup cluster upgrade <cluster-name> v6.2.0
```

### バージョンアップ時の注意事項 {#notes-for-upgrade}

-   `changefeed`の構成は、TiCDC v4.0.2 で変更されました。詳細は[構成ファイルの互換性に関する注意事項](/production-deployment-using-tiup.md#step-3-initialize-cluster-topology-file)を参照してください。
-   問題が発生した場合は、 [TiUP を使用して TiDB をアップグレードする -FAQ](/upgrade-tidb-using-tiup.md#faq)を参照してください。

## TiUP を使用して TiCDC 構成を変更する {#modify-ticdc-configuration-using-tiup}

このセクションでは、TiUP の[`tiup cluster edit-config`](/tiup/tiup-component-cluster-edit-config.md)コマンドを使用して、TiCDC クラスターの構成を変更する方法を紹介します。次の例では、値`gc-ttl`をデフォルトの`86400`から`3600` 、つまり 1 時間に変更します。

まず、次のコマンドを実行します。 `<cluster-name>`を実際のクラスター名に置き換える必要があります。


```shell
tiup cluster edit-config <cluster-name>
```

次に、vi エディター ページに入り、 [`server-configs`](/tiup/tiup-cluster-topology-reference.md#server_configs)の下の`cdc`構成を変更します。構成を以下に示します。

```shell
 server_configs:
  tidb: {}
  tikv: {}
  pd: {}
  tiflash: {}
  tiflash-learner: {}
  pump: {}
  drainer: {}
  cdc:
    gc-ttl: 3600
```

変更後、 `tiup cluster reload -R cdc`コマンドを実行して設定をリロードします。

## TLS を使用する {#use-tls}

暗号化データ転送 (TLS) の使用について詳しくは、 [TiDB コンポーネント間の TLS を有効にする](/enable-tls-between-components.md)を参照してください。

## <code>cdc cli</code>を使用してクラスターのステータスとデータ複製タスクを管理する {#use-code-cdc-cli-code-to-manage-cluster-status-and-data-replication-task}

このセクションでは、 `cdc cli`を使用して TiCDC クラスターとデータ複製タスクを管理する方法を紹介します。 `cdc cli`は、 `cdc`バイナリを使用して実行される`cli`サブコマンドです。以下の説明では、次のことを前提としています。

-   `cli`コマンドは`cdc`バイナリを使用して直接実行されます。
-   PD は`10.0.10.25`でリッスンし、ポートは`2379`です。

> **ノート：**
>
> PD が listen する IP アドレスとポートは、 `pd-server`始動時に指定された`advertise-client-urls`パラメーターに対応します。複数の`pd-server`には複数の`advertise-client-urls`パラメータがあり、1 つまたは複数のパラメータを指定できます。たとえば、 `--pd=http://10.0.10.25:2379`または`--pd=http://10.0.10.25:2379,http://10.0.10.26:2379,http://10.0.10.27:2379`です。

TiUP を使用して TiCDC をデプロイする場合は、次のコマンドの`cdc cli`を`tiup ctl cdc`に置き換えます。

### TiCDC サービスの進行状況を管理する ( <code>capture</code> ) {#manage-ticdc-service-progress-code-capture-code}

-   `capture`のリストをクエリします。


    ```shell
    cdc cli capture list --pd=http://10.0.10.25:2379
    ```

    ```
    [
      {
        "id": "806e3a1b-0e31-477f-9dd6-f3f2c570abdd",
        "is-owner": true,
        "address": "127.0.0.1:8300"
      },
      {
        "id": "ea2a4203-56fe-43a6-b442-7b295f458ebc",
        "is-owner": false,
        "address": "127.0.0.1:8301"
      }
    ]
    ```

    -   `id` : サービス プロセスの ID。
    -   `is-owner` : サービスプロセスがオーナーノードかどうかを示します。
    -   `address` : サービス プロセスが外部へのインターフェイスを提供するためのアドレス。

### レプリケーション タスクの管理 ( <code>changefeed</code> ) {#manage-replication-tasks-code-changefeed-code}

#### レプリケーション タスクの状態転送 {#state-transfer-of-replication-tasks}

レプリケーション タスクの状態は、レプリケーション タスクの実行ステータスを表します。 TiCDC の実行中に、レプリケーション タスクがエラーで失敗したり、手動で一時停止、再開したり、指定された`TargetTs`に達したりする場合があります。これらの動作により、レプリケーション タスクの状態が変化する可能性があります。このセクションでは、TiCDC レプリケーション タスクの状態と、状態間の転送関係について説明します。

![TiCDC state transfer](https://docs-download.pingcap.com/media/images/docs/ticdc/ticdc-state-transfer.png)

上記の状態遷移図の状態は、次のように説明されています。

-   `Normal` : レプリケーション タスクは正常に実行され、checkpoint-ts は正常に進行します。
-   `Stopped` : ユーザーが変更フィードを手動で一時停止したため、レプリケーション タスクは停止されています。この状態の変更フィードは、GC 操作をブロックします。
-   `Error` : レプリケーション タスクはエラーを返します。いくつかの回復可能なエラーが原因で、レプリケーションを続行できません。この状態の changefeed は、状態が`Normal`に移行するまで再開を試み続けます。この状態の変更フィードは、GC 操作をブロックします。
-   `Finished` : レプリケーション タスクが完了し、プリセット`TargetTs`に達しました。この状態の変更フィードは、GC 操作をブロックしません。
-   `Failed` : レプリケーション タスクは失敗します。一部の回復不能なエラーが原因で、レプリケーション タスクを再開できず、回復できません。この状態の変更フィードは、GC 操作をブロックしません。

上記の状態遷移図の番号は、次のように記述されます。

-   `changefeed pause`コマンド実行
-   ② `changefeed resume`コマンドを実行してレプリケーションタスクを再開する
-   ③ `changefeed`動作中に回復可能なエラーが発生し、自動的に動作が再開されます。
-   ④ `changefeed resume`コマンドを実行してレプリケーションタスクを再開する
-   ⑤ `changefeed`の動作中に回復可能なエラーが発生した場合
-   ⑥ `changefeed`がプリセット`TargetTs`に到達し、レプリケーションが自動的に停止されます。
-   ⑦ `changefeed`は`gc-ttl`で指定された期間を超えて停止し、再開することはできません。
-   ⑧ `changefeed`は、自動回復を実行しようとしたときに、回復不能なエラーが発生しました。

#### レプリケーション タスクを作成する {#create-a-replication-task}

次のコマンドを実行して、レプリケーション タスクを作成します。


```shell
cdc cli changefeed create --pd=http://10.0.10.25:2379 --sink-uri="mysql://root:123456@127.0.0.1:3306/" --changefeed-id="simple-replication-task" --sort-engine="unified"
```

```shell
Create changefeed successfully!
ID: simple-replication-task
Info: {"sink-uri":"mysql://root:123456@127.0.0.1:3306/","opts":{},"create-time":"2020-03-12T22:04:08.103600025+08:00","start-ts":415241823337054209,"target-ts":0,"admin-job-type":0,"sort-engine":"unified","sort-dir":".","config":{"case-sensitive":true,"filter":{"rules":["*.*"],"ignore-txn-start-ts":null,"ddl-allow-list":null},"mounter":{"worker-num":16},"sink":{"dispatchers":null},"scheduler":{"type":"table-number","polling-time":-1}},"state":"normal","history":null,"error":null}
```

-   `--changefeed-id` : レプリケーション タスクの ID。形式は`^[a-zA-Z0-9]+(\-[a-zA-Z0-9]+)*$`の正規表現と一致する必要があります。この ID が指定されていない場合、TiCDC は ID として UUID (バージョン 4 形式) を自動的に生成します。

-   `--sink-uri` : レプリケーション タスクのダウンストリーム アドレス。 `--sink-uri`を次の形式に従って構成します。現在、スキームは`mysql` / `tidb` / `kafka` / `pulsar` / `s3` / `local`をサポートしています。


    ```
    [scheme]://[userinfo@][host]:[port][/path]?[query_parameters]
    ```

    URI に特殊文字が含まれている場合、URL エンコーディングを使用してこれらの特殊文字を処理する必要があります。

-   `--start-ts` : `changefeed`の開始 TSO を指定します。この TSO から、TiCDC クラスターはデータのプルを開始します。デフォルト値は現在の時刻です。

-   `--target-ts` : `changefeed`の終了 TSO を指定します。この TSO に対して、TiCDC クラスターはデータのプルを停止します。デフォルト値は空です。これは、TiCDC がデータのプルを自動的に停止しないことを意味します。

-   `--sort-engine` : `changefeed`のソート エンジンを指定します。 TiDB と TiKV は分散アーキテクチャを採用しているため、TiCDC はデータの変更をシンクに書き込む前にソートする必要があります。このオプションは`unified` (デフォルト)/ `memory` / `file`をサポートします。

    -   `unified` : `unified`を使用すると、TiCDC はメモリ内でのデータの並べ替えを優先します。メモリが不足している場合、TiCDC は自動的にディスクを使用して一時データを保存します。これはデフォルト値の`--sort-engine`です。
    -   `memory` : メモリ内のデータ変更をソートします。大量のデータをレプリケートすると OOM が簡単にトリガーされるため、この並べ替えエンジンの使用は**お勧めしません**。
    -   `file` : ディスクを完全に使用して一時データを格納します。この機能は**非推奨です**。<strong>どの</strong>ような状況でも使用することは<strong>お勧めしません</strong>。

-   `--config` : `changefeed`の構成ファイルを指定します。

-   `sort-dir` : ソート エンジンが使用する一時ファイル ディレクトリを指定します。**このオプションは、TiDB v4.0.13、v5.0.3、および v5.1.0 以降ではサポートされていないことに注意してください。もう使用しないでください**。

#### <code>mysql</code> / <code>tidb</code>でシンク URI を構成する {#configure-sink-uri-with-code-mysql-code-code-tidb-code}

サンプル構成:


```shell
--sink-uri="mysql://root:123456@127.0.0.1:3306/?worker-count=16&max-txn-row=5000&transaction-atomicity=table"
```

以下は、 `mysql` / `tidb`を使用してシンク URI に構成できるパラメーターとパラメーター値の説明です。

| パラメータ/パラメータ値            | 説明                                                                                                                                                                                                                                     |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`                  | ダウンストリーム データベースのユーザー名                                                                                                                                                                                                                  |
| `123456`                | ダウンストリーム データベースのパスワード                                                                                                                                                                                                                  |
| `127.0.0.1`             | ダウンストリーム データベースの IP アドレス                                                                                                                                                                                                               |
| `3306`                  | ダウンストリーム データのポート                                                                                                                                                                                                                       |
| `worker-count`          | ダウンストリームに対して同時に実行できる SQL ステートメントの数 (オプション、既定では`16` )                                                                                                                                                                                   |
| `max-txn-row`           | ダウンストリームに対して実行できるトランザクション バッチのサイズ (オプション、既定では`256` )                                                                                                                                                                                   |
| `ssl-ca`                | ダウンストリームの MySQL インスタンスに接続するために必要な CA 証明書ファイルのパス (オプション)                                                                                                                                                                                |
| `ssl-cert`              | ダウンストリームの MySQL インスタンスに接続するために必要な証明書ファイルのパス (オプション)                                                                                                                                                                                    |
| `ssl-key`               | ダウンストリームの MySQL インスタンスに接続するために必要な証明書キー ファイルのパス (オプション)                                                                                                                                                                                 |
| `time-zone`             | ダウンストリームの MySQL インスタンスに接続するときに使用されるタイム ゾーン。v4.0.8 以降で有効です。これはオプションのパラメーターです。このパラメーターが指定されていない場合、TiCDC サービス プロセスのタイム ゾーンが使用されます。このパラメータが空の値に設定されている場合、TiCDC がダウンストリームの MySQL インスタンスに接続するときにタイム ゾーンが指定されず、ダウンストリームのデフォルトのタイム ゾーンが使用されます。 |
| `transaction-atomicity` | トランザクションの原子性レベル。これはオプションのパラメーターで、デフォルト値は`table`です。値が`table`の場合、TiCDC は単一テーブル トランザクションの原子性を保証します。値が`none`の場合、TiCDC は単一テーブル トランザクションを分割します。                                                                                              |

#### <code>kafka</code>でシンク URI を構成する {#configure-sink-uri-with-code-kafka-code}

サンプル構成:


```shell
--sink-uri="kafka://127.0.0.1:9092/topic-name?kafka-version=2.4.0&partition-num=6&max-message-bytes=67108864&replication-factor=1"
```

以下は、 `kafka`のシンク URI に構成できるパラメーターとパラメーター値の説明です。

| パラメータ/パラメータ値                         | 説明                                                                                                                                                                                                                     |
| :----------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `127.0.0.1`                          | ダウンストリーム Kafka サービスの IP アドレス                                                                                                                                                                                           |
| `9092`                               | 下流の Kafka のポート                                                                                                                                                                                                         |
| `topic-name`                         | 変数。 Kafka トピックの名前                                                                                                                                                                                                      |
| `kafka-version`                      | ダウンストリーム Kafka のバージョン (オプション、デフォルトでは`2.4.0`現在、サポートされている最も古い Kafka バージョンは`0.11.0.2`で、最新のものは`2.7.0`です。この値は、ダウンストリーム Kafka の実際のバージョンと一致する必要があります)                                                                         |
| `kafka-client-id`                    | レプリケーション タスクの Kafka クライアント ID を指定します (オプション。既定では`TiCDC_sarama_producer_replication ID` )。                                                                                                                              |
| `partition-num`                      | ダウンストリーム Kafka パーティションの数 (オプション。値は、実際のパーティション数を**超えてはなりません**。そうでない場合、レプリケーション タスクは正常に作成されません。デフォルトでは`3` )                                                                                                              |
| `max-message-bytes`                  | 毎回 Kafka ブローカーに送信されるデータの最大サイズ (オプション、デフォルトでは`10MB` )。 v5.0.6 および v4.0.6 から、デフォルト値が 64MB および 256MB から 10MB に変更されました。                                                                                                    |
| `replication-factor`                 | 保存できる Kafka メッセージ レプリカの数 (オプション、既定では`1` )                                                                                                                                                                              |
| `protocol`                           | メッセージが Kafka に出力されるプロトコル。値のオプションは`canal-json` 、 `open-protocol` 、 `canal` 、 `avro` 、および`maxwell`です。                                                                                                                    |
| `auto-create-topic`                  | 渡された`topic-name`が Kafka クラスターに存在しない場合に、TiCDC がトピックを自動的に作成するかどうかを決定します (オプション、デフォルトでは`true` )。                                                                                                                          |
| `enable-tidb-extension`              | オプション。デフォルトでは`false`です。出力プロトコルが`canal-json`の場合、値が`true`の場合、TiCDC は Resolved イベントを送信し、TiDB 拡張フィールドを Kafka メッセージに追加します。 v6.1.0 から、このパラメーターは`avro`プロトコルにも適用されます。値が`true`の場合、TiCDC は 3 つの TiDB 拡張フィールドを Kafka メッセージに追加します。 |
| `max-batch-size`                     | v4.0.9 の新機能。メッセージ プロトコルが 1 つの Kafka メッセージへの複数のデータ変更の出力をサポートしている場合、このパラメーターは 1 つの Kafka メッセージ内のデータ変更の最大数を指定します。現在、Kafka の`protocol`が`open-protocol`の場合にのみ有効です。 (オプション、デフォルトで`16` )                                      |
| `enable-tls`                         | TLS を使用してダウンストリーム Kafka インスタンスに接続するかどうか (オプション、デフォルトでは`false` )                                                                                                                                                        |
| `ca`                                 | ダウンストリーム Kafka インスタンスに接続するために必要な CA 証明書ファイルのパス (オプション)                                                                                                                                                                 |
| `cert`                               | ダウンストリームの Kafka インスタンスに接続するために必要な証明書ファイルのパス (オプション)                                                                                                                                                                    |
| `key`                                | ダウンストリーム Kafka インスタンスに接続するために必要な証明書キー ファイルのパス (オプション)                                                                                                                                                                  |
| `sasl-user`                          | ダウンストリームの Kafka インスタンスに接続するために必要な SASL/PLAIN または SASL/SCRAM 認証の ID (authcid) (オプション)                                                                                                                                   |
| `sasl-password`                      | ダウンストリーム Kafka インスタンスに接続するために必要な SASL/PLAIN または SASL/SCRAM 認証のパスワード (オプション)                                                                                                                                            |
| `sasl-mechanism`                     | ダウンストリーム Kafka インスタンスに接続するために必要な SASL 認証の名前。値は`plain` 、 `scram-sha-256` 、 `scram-sha-512` 、または`gssapi`です。                                                                                                              |
| `sasl-gssapi-auth-type`              | gssapi 認証タイプ。値は`user`または`keytab`です (オプション)                                                                                                                                                                             |
| `sasl-gssapi-keytab-path`            | gssapi キータブ パス (オプション)                                                                                                                                                                                                 |
| `sasl-gssapi-kerberos-config-path`   | gssapi kerberos 構成パス (オプション)                                                                                                                                                                                           |
| `sasl-gssapi-service-name`           | gssapi サービス名 (オプション)                                                                                                                                                                                                   |
| `sasl-gssapi-user`                   | gssapi 認証のユーザー名 (オプション)                                                                                                                                                                                                |
| `sasl-gssapi-password`               | gssapi 認証のパスワード (オプション)                                                                                                                                                                                                |
| `sasl-gssapi-realm`                  | gssapi レルム名 (オプション)                                                                                                                                                                                                    |
| `sasl-gssapi-disable-pafxfast`       | gssapi PA-FX-FAST を無効にするかどうか (オプション)                                                                                                                                                                                   |
| `dial-timeout`                       | ダウンストリーム Kafka との接続を確立する際のタイムアウト。デフォルト値は`10s`です                                                                                                                                                                        |
| `read-timeout`                       | ダウンストリーム Kafka から返された応答を取得する際のタイムアウト。デフォルト値は`10s`です                                                                                                                                                                    |
| `write-timeout`                      | ダウンストリーム Kafka にリクエストを送信する際のタイムアウト。デフォルト値は`10s`です                                                                                                                                                                      |
| `avro-decimal-handling-mode`         | `avro`プロトコルでのみ有効です。 Avro が DECIMAL フィールドを処理する方法を決定します。値は`string`または`precise`で、DECIMAL フィールドを文字列または正確な浮動小数点数にマッピングすることを示します。                                                                                            |
| `avro-bigint-unsigned-handling-mode` | `avro`プロトコルでのみ有効です。 Avro が BIGINT UNSIGNED フィールドを処理する方法を決定します。値は`string`または`long`で、BIGINT UNSIGNED フィールドを 64 ビットの符号付き数値または文字列にマッピングすることを示します。                                                                          |

ベストプラクティス：

-   独自の Kafka トピックを作成することをお勧めします。少なくとも、トピックが Kafka ブローカーに送信できる各メッセージの最大データ量と、ダウンストリーム Kafka パーティションの数を設定する必要があります。 changefeed を作成すると、これら 2 つの設定はそれぞれ`max-message-bytes`と`partition-num`に対応します。
-   まだ存在しないトピックで変更フィードを作成すると、TiCDC は`partition-num`と`replication-factor`のパラメーターを使用してトピックを作成しようとします。これらのパラメーターを明示的に指定することをお勧めします。
-   ほとんどの場合、 `canal-json`プロトコルを使用することをお勧めします。

> **ノート：**
>
> `protocol`が`open-protocol`の場合、TiCDC は長さが`max-message-bytes`を超えるメッセージの生成を回避しようとします。ただし、1 つの変更だけで長さが`max-message-bytes`を超える行が非常に大きい場合、TiCDC はサイレント エラーを回避するために、このメッセージを出力しようとし、ログに警告を出力します。

#### TiCDC は Kafka の認証と承認を使用します {#ticdc-uses-the-authentication-and-authorization-of-kafka}

以下は、Kafka SASL 認証を使用する場合の例です。

-   SASL/プレーン

    ```shell
    --sink-uri="kafka://127.0.0.1:9092/topic-name?kafka-version=2.4.0&sasl-user=alice-user&sasl-password=alice-secret&sasl-mechanism=plain"
    ```

-   SASL/スクラム

    SCRAM-SHA-256 と SCRAM-SHA-512 は PLAIN メソッドに似ています。対応する認証方法として`sasl-mechanism`を指定するだけです。

-   SASL/GSSAPI

    SASL/GSSAPI `user`認証:

    ```shell
    --sink-uri="kafka://127.0.0.1:9092/topic-name?kafka-version=2.4.0&sasl-mechanism=gssapi&sasl-gssapi-auth-type=user&sasl-gssapi-kerberos-config-path=/etc/krb5.conf&sasl-gssapi-service-name=kafka&sasl-gssapi-user=alice/for-kafka&sasl-gssapi-password=alice-secret&sasl-gssapi-realm=example.com"
    ```

    `sasl-gssapi-user`と`sasl-gssapi-realm`の値は、kerberos で指定された[原理](https://web.mit.edu/kerberos/krb5-1.5/krb5-1.5.4/doc/krb5-user/What-is-a-Kerberos-Principal_003f.html)に関連しています。たとえば、原則が`alice/for-kafka@example.com`に設定されている場合、 `sasl-gssapi-user`と`sasl-gssapi-realm`はそれぞれ`alice/for-kafka`と`example.com`として指定されます。

    SASL/GSSAPI `keytab`認証:

    ```shell
    --sink-uri="kafka://127.0.0.1:9092/topic-name?kafka-version=2.4.0&sasl-mechanism=gssapi&sasl-gssapi-auth-type=keytab&sasl-gssapi-kerberos-config-path=/etc/krb5.conf&sasl-gssapi-service-name=kafka&sasl-gssapi-user=alice/for-kafka&sasl-gssapi-keytab-path=/var/lib/secret/alice.key&sasl-gssapi-realm=example.com"
    ```

    SASL/GSSAPI 認証方式の詳細については、 [GSSAPI の設定](https://docs.confluent.io/platform/current/kafka/authentication_sasl/authentication_sasl_gssapi.html)を参照してください。

-   TLS/SSL 暗号化

    Kafka ブローカーで TLS/SSL 暗号化が有効になっている場合は、 `-enable-tls=true`パラメーターを`--sink-uri`に追加する必要があります。自己署名証明書を使用する場合は、 `--sink-uri`で`ca` 、 `cert` 、および`key`も指定する必要があります。

-   ACL 認可

    TiCDC が適切に機能するために必要な最小限のアクセス許可セットは次のとおりです。

    -   トピック[リソースタイプ](https://docs.confluent.io/platform/current/kafka/authorization.html#resources)の`Create`と`Write`のアクセス許可。
    -   クラスタリソース タイプの`DescribeConfigs`のアクセス許可。

#### TiCDC を Kafka Connect (コンフルエント プラットフォーム) と統合する {#integrate-ticdc-with-kafka-connect-confluent-platform}

Confluent が提供する[データ コネクタ](https://docs.confluent.io/current/connect/managing/connectors.html)を使用してデータをリレーショナル データベースまたは非リレーショナル データベースにストリーミングするには、 `avro`プロトコルを使用して[コンフルエント スキーマ レジストリ](https://www.confluent.io/product/confluent-platform/data-compatibility/) in `schema-registry`の URL を提供する必要があります。

サンプル構成:


```shell
--sink-uri="kafka://127.0.0.1:9092/topic-name?&protocol=avro&replication-factor=3" --schema-registry="http://127.0.0.1:8081" --config changefeed_config.toml
```

```shell
[sink]
dispatchers = [
 {matcher = ['*.*'], topic = "tidb_{schema}_{table}"},
]
```

詳細な統合ガイドについては、 [TiDB と Confluent Platform の統合に関するクイック スタート ガイド](/ticdc/integrate-confluent-using-ticdc.md)を参照してください。

#### <code>pulsar</code>でシンク URI を構成する {#configure-sink-uri-with-code-pulsar-code}

> **警告：**
>
> これはまだ実験的機能です。本番環境では使用し**ない**でください。

サンプル構成:


```shell
--sink-uri="pulsar://127.0.0.1:6650/topic-name?connectionTimeout=2s"
```

以下は、 `pulsar`でシンク URI に構成できるパラメーターの説明です。

| パラメータ                        | 説明                                                                                                                                   |
| :--------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `connectionTimeout`          | ダウンストリーム Pulsar への接続を確立するためのタイムアウト。これはオプションであり、デフォルトは 30 (秒) です。                                                                     |
| `operationTimeout`           | ダウンストリーム Pulsar で操作を実行するためのタイムアウト。これはオプションであり、デフォルトは 30 (秒) です。                                                                      |
| `tlsTrustCertsFilePath`      | ダウンストリームの Pulsar インスタンスに接続するために必要な CA 証明書ファイルのパス (オプション)                                                                             |
| `tlsAllowInsecureConnection` | TLS が有効になった後に暗号化されていない接続を許可するかどうかを決定します (オプション)                                                                                      |
| `tlsValidateHostname`        | ダウンストリーム Pulsar からの証明書のホスト名を検証するかどうかを決定します (オプション)                                                                                   |
| `maxConnectionsPerBroker`    | 単一のダウンストリーム Pulsar ブローカーに許可される接続の最大数。これはオプションで、デフォルトは 1 です。                                                                          |
| `auth.tls`                   | TLS モードを使用して、下流のパルサーを検証します (オプション)。たとえば、 `auth=tls&auth.tlsCertFile=/path/to/cert&auth.tlsKeyFile=/path/to/key`です。                   |
| `auth.token`                 | トークン モードを使用して、下流のパルサーを検証します (オプション)。たとえば、 `auth=token&auth.token=secret-token`または`auth=token&auth.file=path/to/secret-token-file`です。 |
| `name`                       | TiCDC のパルサー プロデューサーの名前 (オプション)                                                                                                       |
| `protocol`                   | メッセージがパルサーに出力されるプロトコル。値のオプションは`canal-json` 、 `open-protocol` 、 `canal` 、 `avro` 、および`maxwell`です。                                     |
| `maxPendingMessages`         | 保留中のメッセージ キューの最大サイズを設定します。これはオプションで、デフォルトは 1000 です。たとえば、Pulsar からの確認メッセージを保留します。                                                     |
| `disableBatching`            | バッチでのメッセージの自動送信を無効にします (オプション)                                                                                                       |
| `batchingMaxPublishDelay`    | 送信されたメッセージがバッチ化される期間を設定します (デフォルト: 10ms)                                                                                             |
| `compressionType`            | メッセージの送信に使用される圧縮アルゴリズムを設定します (オプション)。値のオプションは`NONE` 、 `LZ4` 、 `ZLIB` 、および`ZSTD`です。 (デフォルトでは`NONE` )                                  |
| `hashingScheme`              | メッセージの送信先のパーティションを選択するために使用されるハッシュ アルゴリズム (オプション)。値のオプションは`JavaStringHash` (デフォルト) と`Murmur3`です。                                     |
| `properties.*`               | TiCDC の Pulsar プロデューサーに追加されたカスタマイズされたプロパティ (オプション)。たとえば、 `properties.location=Hangzhou`です。                                           |

Pulsar のその他のパラメータについては、 [pulsar-client-go ClientOptions](https://godoc.org/github.com/apache/pulsar-client-go/pulsar#ClientOptions)および[pulsar-client-go ProducerOptions](https://godoc.org/github.com/apache/pulsar-client-go/pulsar#ProducerOptions)を参照してください。

#### タスク構成ファイルを使用する {#use-the-task-configuration-file}

レプリケーション構成の詳細 (単一テーブルのレプリケーションを指定するなど) については、 [タスク構成ファイル](#task-configuration-file)を参照してください。

構成ファイルを使用して、次の方法でレプリケーション タスクを作成できます。


```shell
cdc cli changefeed create --pd=http://10.0.10.25:2379 --sink-uri="mysql://root:123456@127.0.0.1:3306/" --config changefeed.toml
```

上記のコマンドで、 `changefeed.toml`はレプリケーション タスクの構成ファイルです。

#### レプリケーション タスク リストを照会する {#query-the-replication-task-list}

次のコマンドを実行して、レプリケーション タスク リストを照会します。


```shell
cdc cli changefeed list --pd=http://10.0.10.25:2379
```

```shell
[{
    "id": "simple-replication-task",
    "summary": {
      "state": "normal",
      "tso": 417886179132964865,
      "checkpoint": "2020-07-07 16:07:44.881",
      "error": null
    }
}]
```

-   `checkpoint`は、この時点より前に TiCDC が既にデータをダウンストリームにレプリケートしたことを示します。
-   `state`は、レプリケーション タスクの状態を示します。
    -   `normal` : レプリケーション タスクは正常に実行されます。
    -   `stopped` : レプリケーション タスクは停止しています (手動で一時停止)。
    -   `error` : レプリケーション タスクは (エラーにより) 停止されました。
    -   `removed` : レプリケーション タスクは削除されます。この状態のタスクは、オプション`--all`を指定した場合にのみ表示されます。このオプションが指定されていない場合にこれらのタスクを表示するには、 `changefeed query`コマンドを実行します。
    -   `finished` : レプリケーション タスクが完了しました (データは`target-ts`にレプリケートされます)。この状態のタスクは、オプション`--all`を指定した場合にのみ表示されます。このオプションが指定されていない場合にこれらのタスクを表示するには、 `changefeed query`コマンドを実行します。

#### 特定のレプリケーション タスクを照会する {#query-a-specific-replication-task}

特定のレプリケーション タスクを照会するには、 `changefeed query`コマンドを実行します。クエリ結果には、タスク情報とタスク状態が含まれます。 `--simple`または`-s`引数を指定して、基本的なレプリケーション状態とチェックポイント情報のみを含むクエリ結果を簡素化できます。この引数を指定しない場合、詳細なタスク構成、レプリケーション状態、およびレプリケーション テーブル情報が出力されます。


```shell
cdc cli changefeed query -s --pd=http://10.0.10.25:2379 --changefeed-id=simple-replication-task
```

```
{
 "state": "normal",
 "tso": 419035700154597378,
 "checkpoint": "2020-08-27 10:12:19.579",
 "error": null
}
```

上記のコマンドと結果:

-   `state`は、現在の`changefeed`の複製状態です。各状態は`changefeed list`の状態と一致している必要があります。
-   `tso`は、現在の`changefeed`でダウンストリームに正常に複製された最大のトランザクション TSO を表します。
-   `checkpoint`は、ダウンストリームに正常に複製された現在の`changefeed`の最大トランザクション TSO の対応する時間を表します。
-   `error`は、現在の`changefeed`でエラーが発生したかどうかを記録します。


```shell
cdc cli changefeed query --pd=http://10.0.10.25:2379 --changefeed-id=simple-replication-task
```

```
{
  "info": {
    "sink-uri": "mysql://127.0.0.1:3306/?max-txn-row=20\u0026worker-number=4",
    "opts": {},
    "create-time": "2020-08-27T10:33:41.687983832+08:00",
    "start-ts": 419036036249681921,
    "target-ts": 0,
    "admin-job-type": 0,
    "sort-engine": "unified",
    "sort-dir": ".",
    "config": {
      "case-sensitive": true,
      "enable-old-value": false,
      "filter": {
        "rules": [
          "*.*"
        ],
        "ignore-txn-start-ts": null,
        "ddl-allow-list": null
      },
      "mounter": {
        "worker-num": 16
      },
      "sink": {
        "dispatchers": null,
      },
      "scheduler": {
        "type": "table-number",
        "polling-time": -1
      }
    },
    "state": "normal",
    "history": null,
    "error": null
  },
  "status": {
    "resolved-ts": 419036036249681921,
    "checkpoint-ts": 419036036249681921,
    "admin-job-type": 0
  },
  "count": 0,
  "task-status": [
    {
      "capture-id": "97173367-75dc-490c-ae2d-4e990f90da0f",
      "status": {
        "tables": {
          "47": {
            "start-ts": 419036036249681921
          }
        },
        "operation": null,
        "admin-job-type": 0
      }
    }
  ]
}
```

上記のコマンドと結果:

-   `info`は、照会された`changefeed`の複製構成です。
-   `status`は、照会された`changefeed`の複製状態です。
    -   `resolved-ts` : 現在の`changefeed`の中で最大のトランザクション`TS` 。この`TS`は TiKV から TiCDC に正常に送信されていることに注意してください。
    -   `checkpoint-ts` : 現在の`changefeed`の中で最大のトランザクション`TS` 。この`TS`はダウンストリームに正常に書き込まれていることに注意してください。
    -   `admin-job-type` : `changefeed`のステータス:
        -   `0` : 状態は正常です。
        -   `1` : タスクは一時停止されています。タスクが一時停止すると、レプリケートされたすべての`processor`が終了します。タスクの構成とレプリケーション ステータスが保持されるため、タスクを`checkpiont-ts`から再開できます。
        -   `2` : タスクは再開されます。レプリケーション タスクは`checkpoint-ts`から再開します。
        -   `3` : タスクは削除されます。タスクが削除されると、複製されたすべての`processor`が終了し、複製タスクの構成情報がクリアされます。以降のクエリでは、レプリケーション ステータスのみが保持されます。
-   `task-status`は、照会された`changefeed`の各複製サブタスクの状態を示します。

#### レプリケーション タスクを一時停止する {#pause-a-replication-task}

次のコマンドを実行して、レプリケーション タスクを一時停止します。


```shell
cdc cli changefeed pause --pd=http://10.0.10.25:2379 --changefeed-id simple-replication-task
```

上記のコマンドで:

-   `--changefeed-id=uuid`は、一時停止するレプリケーション タスクに対応する`changefeed`の ID を表します。

#### レプリケーション タスクを再開する {#resume-a-replication-task}

次のコマンドを実行して、一時停止したレプリケーション タスクを再開します。


```shell
cdc cli changefeed resume --pd=http://10.0.10.25:2379 --changefeed-id simple-replication-task
```

-   `--changefeed-id=uuid`は、再開するレプリケーション タスクに対応する`changefeed`の ID を表します。
-   `--overwrite-checkpoint-ts` : v6.2.0 以降、レプリケーション タスクを再開する開始 TSO を指定できます。 TiCDC は、指定された TSO からのデータのプルを開始します。引数は、 `now`または特定の TSO (434873584621453313 など) を受け入れます。指定された TSO は、(GC セーフ ポイント、CurrentTSO] の範囲内にある必要があります。この引数が指定されていない場合、TiCDC はデフォルトで現在の`checkpoint-ts`からデータを複製します。
-   `--no-confirm` : レプリケーションを再開する場合、関連情報を確認する必要はありません。デフォルトは`false`です。

> **ノート：**
>
> -   `--overwrite-checkpoint-ts` ( `t2` ) で指定された TSO が、変更フィード ( `t1` ) の現在のチェックポイント TSO よりも大きい場合、 `t1`と`t2`の間のデータはダウンストリームに複製されません。これにより、データが失われます。 `cdc cli changefeed query`を実行すると`t1`を取得できます。
> -   `--overwrite-checkpoint-ts`で指定された TSO ( `t2` ) が、変更フィードの現在のチェックポイント TSO より小さい場合 ( `t1` )、TiCDC は古い時点 ( `t2` ) からデータをプルします。これにより、データの重複が発生する可能性があります (たとえば、ダウンストリームが MQ シンクの場合）。

#### レプリケーション タスクを削除する {#remove-a-replication-task}

次のコマンドを実行して、レプリケーション タスクを削除します。


```shell
cdc cli changefeed remove --pd=http://10.0.10.25:2379 --changefeed-id simple-replication-task
```

上記のコマンドで:

-   `--changefeed-id=uuid`は、削除するレプリケーション タスクに対応する`changefeed`の ID を表します。

### タスク構成の更新 {#update-task-configuration}

v4.0.4 以降、TiCDC はレプリケーション タスクの構成の変更をサポートしています (動的ではありません)。 `changefeed`構成を変更するには、タスクを一時停止し、構成を変更してから、タスクを再開します。


```shell
cdc cli changefeed pause -c test-cf --pd=http://10.0.10.25:2379
cdc cli changefeed update -c test-cf --pd=http://10.0.10.25:2379 --sink-uri="mysql://127.0.0.1:3306/?max-txn-row=20&worker-number=8" --config=changefeed.toml
cdc cli changefeed resume -c test-cf --pd=http://10.0.10.25:2379
```

現在、次の構成項目を変更できます。

-   `changefeed`の`sink-uri` 。
-   `changefeed`の構成ファイルと、ファイル内のすべての構成アイテム。
-   ファイルの並べ替え機能と並べ替えディレクトリを使用するかどうか。
-   `changefeed`の`target-ts` 。

### レプリケーション サブタスクの処理単位を管理する ( <code>processor</code> ) {#manage-processing-units-of-replication-sub-tasks-code-processor-code}

-   `processor`のリストをクエリします。


    ```shell
    cdc cli processor list --pd=http://10.0.10.25:2379
    ```

    ```
    [
            {
                    "id": "9f84ff74-abf9-407f-a6e2-56aa35b33888",
                    "capture-id": "b293999a-4168-4988-a4f4-35d9589b226b",
                    "changefeed-id": "simple-replication-task"
            }
    ]
    ```

-   特定のレプリケーション タスクのステータスに対応する特定の`changefeed`を照会します。


    ```shell
    cdc cli processor query --pd=http://10.0.10.25:2379 --changefeed-id=simple-replication-task --capture-id=b293999a-4168-4988-a4f4-35d9589b226b
    ```

    ```
    {
      "status": {
        "tables": {
          "56": {    # ID of the replication table, corresponding to tidb_table_id of a table in TiDB
            "start-ts": 417474117955485702
          }
        },
        "operation": null,
        "admin-job-type": 0
      },
      "position": {
        "checkpoint-ts": 417474143881789441,
        "resolved-ts": 417474143881789441,
        "count": 0
      }
    }
    ```

    上記のコマンドでは:

    -   `status.tables` : 各キー番号はレプリケーション テーブルの ID を表し、TiDB のテーブルの`tidb_table_id`に対応します。
    -   `resolved-ts` : 現在のプロセッサでソートされたデータの中で最大の TSO。
    -   `checkpoint-ts` : 現在のプロセッサでダウンストリームに正常に書き込まれた最大の TSO。

## タスク構成ファイル {#task-configuration-file}

このセクションでは、レプリケーション タスクの構成について説明します。

```toml
# Specifies whether the database names and tables in the configuration file are case-sensitive.
# The default value is true.
# This configuration item affects configurations related to filter and sink.
case-sensitive = true

# Specifies whether to output the old value. New in v4.0.5. Since v5.0, the default value is `true`.
enable-old-value = true

[filter]
# Ignores the transaction of specified start_ts.
ignore-txn-start-ts = [1, 2]

# Filter rules.
# Filter syntax: https://docs.pingcap.com/tidb/stable/table-filter#syntax.
rules = ['*.*', '!test.*']

# Event filter rules.
# The detailed syntax is described in the event filter rules section.
# The first event filter rule.
[[filter.event-filters]]
matcher = ["test.worker"] # matcher is an allow list, which means this rule only applies to the worker table in the test database.
ignore-event = ["insert"] # Ignore insert events.
ignore-sql = ["^drop", "add column"] # Ignore DDLs that start with "drop" or contain "add column".
ignore-delete-value-expr = "name = 'john'" # Ignore delete DMLs that contain the condition "name = 'john'".
ignore-insert-value-expr = "id >= 100" # Ignore insert DMLs that contain the condition "id >= 100".
ignore-update-old-value-expr = "age < 18" # Ignore update DMLs whose old value contains "age < 18".
ignore-update-new-value-expr = "gender = 'male'" # Ignore update DMLs whose new value contains "gender = 'male'".

# The second event filter rule.
matcher = ["test.fruit"] # matcher is an allow list, which means this rule only applies to the fruit table in the test database.
ignore-event = ["drop table"] # Ignore drop table events.
ignore-sql = ["delete"] # Ignore delete DMLs.
ignore-insert-value-expr = "price > 1000 and origin = 'no where'" # Ignore insert DMLs that contain the conditions "price > 1000" and "origin = 'no where'".

[sink]
# For the sink of MQ type, you can use dispatchers to configure the event dispatcher.
# Since v6.1, TiDB supports two types of event dispatchers: partition and topic. For more information, see the following section.
# The matching syntax of matcher is the same as the filter rule syntax. For details about the matcher rules, see the following section.

dispatchers = [
    {matcher = ['test1.*', 'test2.*'], topic = "Topic expression 1", partition = "ts" },
    {matcher = ['test3.*', 'test4.*'], topic = "Topic expression 2", partition = "index-value" },
    {matcher = ['test1.*', 'test5.*'], topic = "Topic expression 3", partition = "table"},
    {matcher = ['test6.*'], partition = "ts"}
]
# For the sink of MQ type, you can specify the protocol format of the message.
# Currently the following protocols are supported: canal-json, open-protocol, canal, avro, and maxwell.
protocol = "canal-json"
```

### イベント フィルタ ルール<span class="version-mark">v6.2.0 の新機能</span> {#event-filter-rules-span-class-version-mark-new-in-v6-2-0-span}

v6.2.0 以降、TiCDC はイベント フィルターをサポートします。指定した条件を満たす DML および DDL イベントを除外するイベント フィルター ルールを構成できます。

以下は、イベント フィルター ルールの例です。

```toml
[filter]
# The event filter rules must be under the `[filter]` configuration. You can configure multiple event filters at the same time.

[[filter.event-filters]]
matcher = ["test.worker"] # matcher is an allow list, which means this rule only applies to the worker table in the test database.
ignore-event = ["insert"] # Ignore insert events.
ignore-sql = ["^drop", "add column"] # Ignore DDLs that start with "drop" or contain "add column".
ignore-delete-value-expr = "name = 'john'" # Ignore delete DMLs that contain the condition "name = 'john'".
ignore-insert-value-expr = "id >= 100" # Ignore insert DMLs that contain the condition "id >= 100".
ignore-update-old-value-expr = "age < 18 or name = 'lili'" # Ignore update DMLs whose old value contains "age < 18" or "name = 'lili'".
ignore-update-new-value-expr = "gender = 'male' and age > 18" # Ignore update DMLs whose new value contains "gender = 'male'" and "age > 18".
```

イベント フィルター ルールは、 `[filter]`構成の下にある必要があります。詳細な設定については、 [タスク構成ファイル](#task-configuration-file)を参照してください。

構成パラメータの説明:

-   `matcher` : このイベント フィルター規則が適用されるデータベースとテーブル。構文は[テーブル フィルター](/table-filter.md)と同じです。
-   `ignore-event` : 無視するイベント タイプ。このパラメーターは、文字列の配列を受け入れます。複数のイベント タイプを設定できます。現在、次のイベント タイプがサポートされています。

| イベント              | タイプ | エイリアス       | 説明                                                                               |
| ----------------- | --- | ----------- | -------------------------------------------------------------------------------- |
| すべてのdml           |     |             | すべての DML イベントに一致                                                                 |
| すべての ddl          |     |             | すべての DDL イベントに一致                                                                 |
| 入れる               | DML |             | `insert`の DML イベントに一致                                                            |
| アップデート            | DML |             | `update`の DML イベントに一致                                                            |
| 消去                | DML |             | `delete`の DML イベントに一致                                                            |
| スキーマを作成する         | DDL | データベースを作成する | `create database`のイベントに一致                                                        |
| スキーマを削除           | DDL | データベースをドロップ | `drop database`のイベントに一致                                                          |
| テーブルを作成           | DDL |             | `create table`のイベントに一致                                                           |
| ドロップテーブル          | DDL |             | `drop table`のイベントに一致                                                             |
| テーブルの名前を変更        | DDL |             | `rename table`のイベントに一致                                                           |
| テーブルを切り捨てる        | DDL |             | `truncate table`のイベントに一致                                                         |
| 他の机               | DDL |             | `alter table` 、 `create index` 、および`drop index`のすべての節を含む`alter table`のイベントに一致します |
| テーブルパーティションを追加    | DDL |             | `add table partition`のイベントに一致                                                    |
| テーブル パーティションの削除   | DDL |             | `drop table partition`のイベントに一致                                                   |
| テーブル パーティションの切り捨て | DDL |             | `truncate table partition`のイベントに一致                                               |
| ビューを作成            | DDL |             | `create view`のイベントに一致                                                            |
| ビューをドロップ          | DDL |             | `drop view`のイベントに一致                                                              |

-   `ignore-sql` : 無視される DDL ステートメント。このパラメーターは、複数の正規表現を構成できる文字列の配列を受け入れます。このルールは、DDL イベントにのみ適用されます。
-   `ignore-delete-value-expr` : このパラメーターは SQL 式を受け入れます。このルールは、指定された値を持つ DML イベントの削除にのみ適用されます。
-   `ignore-insert-value-expr` : このパラメーターは SQL 式を受け入れます。このルールは、指定された値を持つ挿入 DML イベントにのみ適用されます。
-   `ignore-update-old-value-expr` : このパラメーターは SQL 式を受け入れます。このルールは、古い値に指定された値が含まれる更新 DML イベントにのみ適用されます。
-   `ignore-update-new-value-expr` : このパラメーターは SQL 式を受け入れます。このルールは、新しい値に指定された値が含まれる更新 DML イベントにのみ適用されます。

> **ノート：**
>
> -   TiDB がクラスター化インデックスの列の値を更新すると、TiDB は`UPDATE`イベントを`DELETE`イベントと`INSERT`イベントに分割します。 TiCDC はそのようなイベントを`UPDATE`イベントとして識別しないため、そのようなイベントを正しく除外できません。
> -   SQL 式を構成するときは、 `matcher`に一致するすべてのテーブルに、SQL 式で指定されたすべての列が含まれていることを確認してください。そうしないと、レプリケーション タスクを作成できません。さらに、レプリケーション中にテーブル スキーマが変更され、テーブルに必要な列が含まれなくなった場合、レプリケーション タスクは失敗し、自動的に再開できません。このような状況では、構成を手動で変更し、タスクを再開する必要があります。

### 互換性に関する注意事項 {#notes-for-compatibility}

-   TiCDC v4.0.0 では、 `ignore-txn-commit-ts`が削除され、 `ignore-txn-start-ts`が追加され、start_ts を使用してトランザクションをフィルタリングします。
-   TiCDC v4.0.2 では、 `db-dbs` / `db-tables` / `ignore-dbs` / `ignore-tables`が削除され、データベースとテーブルに新しいフィルター ルールを使用する`rules`が追加されました。詳細なフィルター構文については、 [テーブル フィルター](/table-filter.md)を参照してください。
-   TiCDC v6.1.0 では、 `mounter`が削除されました。 `mounter`を構成すると、TiCDC はエラーを報告しませんが、構成は有効になりません。

## Kafka Sink のトピックおよびパーティション ディスパッチャーのルールをカスタマイズする {#customize-the-rules-for-topic-and-partition-dispatchers-of-kafka-sink}

### マッチャーのルール {#matcher-rules}

前のセクションの例では:

-   マッチャー ルールに一致するテーブルについては、対応するトピック式で指定されたポリシーに従ってディスパッチされます。たとえば、 `test3.aa`テーブルは「トピック式 2」に従ってディスパッチされます。 `test5.aa`テーブルは「トピック式 3」に従ってディスパッチされます。
-   複数のマッチャー ルールに一致するテーブルの場合、最初に一致したトピック式に従ってディスパッチされます。たとえば、「トピック表現 1」に従って、 `test1.aa`のテーブルが分散されます。
-   どのマッチャー ルールにも一致しないテーブルの場合、対応するデータ変更イベントが`--sink-uri`で指定されたデフォルト トピックに送信されます。たとえば、 `test10.aa`テーブルはデフォルト トピックに送信されます。
-   マッチャー ルールに一致するが、トピック ディスパッチャーが指定されていないテーブルの場合、対応するデータ変更は`--sink-uri`で指定されたデフォルト トピックに送信されます。たとえば、 `test6.aa`テーブルはデフォルト トピックに送信されます。

### トピック ディスパッチャ {#topic-dispatchers}

topic = &quot;xxx&quot; を使用してトピック ディスパッチャを指定し、トピック式を使用して柔軟なトピック ディスパッチ ポリシーを実装できます。トピックの総数は 1000 未満にすることをお勧めします。

Topic 式の形式は`[prefix]{schema}[middle][{table}][suffix]`です。

-   `prefix` : オプション。トピック名のプレフィックスを示します。
-   `{schema}` : 必須。スキーマ名と一致させるために使用されます。
-   `middle` : オプション。スキーマ名とテーブル名の間の区切り文字を示します。
-   `{table}` : オプション。テーブル名と一致させるために使用されます。
-   `suffix` : オプション。トピック名のサフィックスを示します。

`prefix` 、 `middle` 、および`suffix`には、次の文字のみを含めることができます: `a-z` 、 `A-Z` 、 `0-9` 、 `.` 、 `_` 、および`-` 。 `{schema}`と`{table}`は両方とも小文字です。 `{Schema}`や`{TABLE}`などのプレースホルダーは無効です。

いくつかの例：

-   `matcher = ['test1.table1', 'test2.table2'], topic = "hello_{schema}_{table}"`
    -   `test1.table1`に対応するデータ変更イベントは、 `hello_test1_table1`という名前のトピックに送信されます。
    -   `test2.table2`に対応するデータ変更イベントは、 `hello_test2_table2`という名前のトピックに送信されます。
-   `matcher = ['test3.*', 'test4.*'], topic = "hello_{schema}_world"`
    -   `test3`のすべてのテーブルに対応するデータ変更イベントは、 `hello_test3_world`という名前のトピックに送信されます。
    -   `test4`のすべてのテーブルに対応するデータ変更イベントは、 `hello_test4_world`という名前のトピックに送信されます。
-   `matcher = ['*.*'], topic = "{schema}_{table}"`
    -   TiCDC がリッスンするすべてのテーブルは、「schema_table」ルールに従って個別のトピックにディスパッチされます。たとえば、 `test.account`テーブルの場合、TiCDC はそのデータ変更ログを`test_account`という名前のトピックにディスパッチします。

### DDL イベントのディスパッチ {#dispatch-ddl-events}

#### スキーマレベルの DDL {#schema-level-ddls}

`create database`や`drop database`など、特定のテーブルに関連付けられていない DDL は、スキーマ レベルの DDL と呼ばれます。スキーマレベルの DDL に対応するイベントは、 `--sink-uri`で指定されたデフォルトのトピックに送信されます。

#### テーブルレベルの DDL {#table-level-ddls}

`alter table`や`create table`など、特定のテーブルに関連する DDL はテーブルレベル DDL と呼ばれます。テーブルレベルの DDL に対応するイベントは、ディスパッチャの構成に従って、対応するトピックに送信されます。

たとえば、 `matcher = ['test.*'], topic = {schema}_{table}`のようなディスパッチャーの場合、DDL イベントは次のようにディスパッチされます。

-   DDL イベントに含まれるテーブルが 1 つの場合、DDL イベントは対応するトピックにそのまま送信されます。たとえば、DDL イベント`drop table test.table1`の場合、イベントは`test_table1`という名前のトピックに送信されます。
-   DDL イベントに複数のテーブルが含まれる場合 ( `rename table` / `drop table` / `drop view`は複数のテーブルが含まれる場合があります)、DDL イベントは複数のイベントに分割され、対応するトピックに送信されます。たとえば、DDL イベント`rename table test.table1 to test.table10, test.table2 to test.table20`の場合、イベント`rename table test.table1 to test.table10`は`test_table1`という名前のトピックに送信され、イベント`rename table test.table2 to test.table20`は`test.table2`という名前のトピックに送信されます。

### 区画ディスパッチャー {#partition-dispatchers}

`partition = "xxx"`を使用して、パーティション ディスパッチャーを指定できます。デフォルト、ts、インデックス値、およびテーブルの 4 つのディスパッチャがサポートされています。ディスパッチャのルールは次のとおりです。

-   デフォルト: 複数の一意のインデックス (主キーを含む) が存在する場合、または古い値機能が有効になっている場合、イベントはテーブル モードでディスパッチされます。一意のインデックス (または主キー) が 1 つだけ存在する場合、イベントはインデックス値モードで送出されます。
-   ts: 行変更の commitTs を使用して、イベントをハッシュおよびディスパッチします。
-   index-value: 主キーの値またはテーブルの一意のインデックスを使用して、イベントをハッシュしてディスパッチします。
-   table: テーブルのスキーマ名とテーブル名を使用して、イベントをハッシュしてディスパッチします。

> **ノート：**
>
> v6.1 以降、構成の意味を明確にするために、パーティション ディスパッチャーを指定するために使用される構成が`dispatcher`から`partition`に変更されました`partition`は`dispatcher`のエイリアスです。たとえば、次の 2 つのルールはまったく同じです。
>
> ```
> [sink]
> dispatchers = [
>    {matcher = ['*.*'], dispatcher = "ts"},
>    {matcher = ['*.*'], partition = "ts"},
> ]
> ```
>
> ただし、 `dispatcher`と`partition`を同じルールに含めることはできません。たとえば、次のルールは無効です。
>
> ```
> {matcher = ['*.*'], dispatcher = "ts", partition = "table"},
> ```

## 行変更イベントの履歴値を出力<span class="version-mark">v4.0.5 の新機能</span> {#output-the-historical-value-of-a-row-changed-event-span-class-version-mark-new-in-v4-0-5-span}

デフォルトの構成では、レプリケーション タスクの TiCDC Open Protocol 出力の Row Changed Event には、変更前の値ではなく、変更された値のみが含まれます。したがって、出力値は、TiCDC Open Protocol のコンシューマー側で行変更イベントの履歴値として使用することはできません。

v4.0.5 以降、TiCDC は行変更イベントの履歴値の出力をサポートしています。この機能を有効にするには、ルート レベルの`changefeed`の構成ファイルで次の構成を指定します。


```toml
enable-old-value = true
```

この機能は、v5.0 以降、デフォルトで有効になっています。この機能を有効にした後の TiCDC Open Protocol の出力形式については、 [TiCDC オープン プロトコル - 行変更イベント](/ticdc/ticdc-open-protocol.md#row-changed-event)を参照してください。

## 照合の新しいフレームワークを有効にしてテーブルを複製する {#replicate-tables-with-the-new-framework-for-collations-enabled}

v4.0.15、v5.0.4、v5.1.1、および v5.2.0 以降、TiCDC は[照合のための新しいフレームワーク](/character-set-and-collation.md#new-framework-for-collations)を有効にしたテーブルをサポートします。

## 有効なインデックスのないテーブルをレプリケートする {#replicate-tables-without-a-valid-index}

v4.0.8 以降、TiCDC は、タスク構成を変更することにより、有効なインデックスを持たないテーブルの複製をサポートします。この機能を有効にするには、 `changefeed`構成ファイルで次のように構成します。


```toml
enable-old-value = true
force-replicate = true
```

> **警告：**
>
> 有効なインデックスのないテーブルの場合、 `INSERT`や`REPLACE`などの操作は再入可能ではないため、データの冗長性が生じるリスクがあります。 TiCDC は、レプリケーション プロセス中に少なくとも 1 回だけデータが分散されることを保証します。したがって、この機能を有効にして、有効なインデックスなしでテーブルをレプリケートすると、確実にデータの冗長性が生じます。データの冗長性を受け入れない場合は、 `AUTO RANDOM`属性を持つ主キー列を追加するなど、効果的なインデックスを追加することをお勧めします。

## ユニファイドソーター {#unified-sorter}

ユニファイド ソーターは、TiCDC のソーティング エンジンです。次のシナリオによって発生する OOM の問題を軽減できます。

-   TiCDC のデータ レプリケーション タスクは長時間一時停止されます。その間、大量の増分データが蓄積され、レプリケートする必要があります。
-   データ複製タスクは早いタイムスタンプから開始されるため、大量の増分データを複製する必要があります。

v4.0.13 以降の`cdc cli`を使用して作成された変更フィードの場合、Unified Sorter はデフォルトで有効になっています。 v4.0.13 より前に存在していた変更フィードについては、以前の構成が使用されます。

ユニファイド ソーター機能が変更フィードで有効になっているかどうかを確認するには、次のコマンド例を実行します (PD インスタンスの IP アドレスが`http://10.0.10.25:2379`であると仮定します)。


```shell
cdc cli --pd="http://10.0.10.25:2379" changefeed query --changefeed-id=simple-replication-task | grep 'sort-engine'
```

上記のコマンドの出力で、値`sort-engine`が「unified」の場合、変更フィードでユニファイド ソーターが有効になっていることを意味します。

> **ノート：**
>
> -   サーバーが機械式ハード ドライブまたはその他のストレージ デバイスを使用しており、レイテンシーが大きいか帯域幅が限られている場合は、統合ソーターを慎重に使用してください。
> -   デフォルトでは、Unified Sorter は`data_dir`を使用して一時ファイルを保存します。空きディスク容量が 500 GiB 以上であることを確認することをお勧めします。実稼働環境では、各ノードの空きディスク容量が (ビジネスで許容される最大`checkpoint-ts`遅延) * (ビジネス ピーク時のアップストリーム書き込みトラフィック) より大きいことを確認することをお勧めします。また、 `changefeed`の作成後に大量の履歴データをレプリケートする予定がある場合は、各ノードの空き容量がレプリケートされたデータの量よりも多いことを確認してください。
> -   統合ソーターはデフォルトで有効になっています。サーバーが上記の要件に一致せず、統合ソーターを無効にする場合は、changefeed の`sort-engine`から`memory`を手動で設定する必要があります。
> -   `memory`を使用してソートする既存の変更フィードでユニファイド ソーターを有効にするには、 [タスクの中断後に TiCDC が再起動された後に発生する OOM を処理するにはどうすればよいですか?](/ticdc/troubleshoot-ticdc.md#what-should-i-do-to-handle-the-oom-that-occurs-after-ticdc-is-restarted-after-a-task-interruption)で提供されているメソッドを参照してください。

## 災害シナリオにおける結果整合性レプリケーション {#eventually-consistent-replication-in-disaster-scenarios}

v5.3.0 以降、TiCDC はアップストリームの TiDB クラスターから S3 ストレージまたはダウンストリーム クラスターの NFS ファイル システムへの増分データのバックアップをサポートします。アップストリーム クラスターが災害に遭遇して利用できなくなった場合、TiCDC はダウンストリーム データを最新の結果整合性のある状態に復元できます。これは、TiCDC が提供する結果整合性のあるレプリケーション機能です。この機能を使用すると、アプリケーションをダウンストリーム クラスターにすばやく切り替えて、長時間のダウンタイムを回避し、サービスの継続性を向上させることができます。

現在、TiCDC は、TiDB クラスターから別の TiDB クラスターまたは MySQL 互換データベース システム ( Aurora、MySQL、および MariaDB を含む) に増分データを複製できます。アップストリーム クラスターがクラッシュした場合、災害前の TiCDC のレプリケーション ステータスが正常であり、レプリケーション ラグが小さいという条件を考えると、TiCDC は 5 分以内にダウンストリーム クラスターのデータを復元できます。最大で 10 秒のデータ損失が許容されます。つまり、RTO &lt;= 5 分、および P95 RPO &lt;= 10 秒です。

次のシナリオでは、TiCDC のレプリケーション ラグが増加します。

-   短時間でTPSが大幅に上昇
-   アップストリームで大規模または長時間のトランザクションが発生する
-   アップストリームの TiKV または TiCDC クラスターがリロードまたはアップグレードされている
-   `add index`などの時間のかかる DDL ステートメントはアップストリームで実行されます。
-   PD はアグレッシブなスケジューリング戦略で構成されているため、リージョンリーダーが頻繁に異動したり、リージョンの合併やリージョンの分割が頻繁に発生したりします。

### 前提条件 {#prerequisites}

-   TiCDC のリアルタイム増分データ バックアップ ファイルを格納するために、高可用性 Amazon S3 ストレージまたは NFS システムを準備します。これらのファイルには、プライマリ クラスタの障害が発生した場合にアクセスできます。
-   災害シナリオで結果整合性を確保する必要がある変更フィードに対して、この機能を有効にします。これを有効にするには、changefeed 構成ファイルに次の構成を追加します。

```toml
[consistent]
# Consistency level. Options include:
# - none: the default value. In a non-disaster scenario, eventual consistency is only guaranteed if and only if finished-ts is specified.
# - eventual: Uses redo log to guarantee eventual consistency in case of the primary cluster disasters.
level = "eventual"

# Individual redo log file size, in MiB. By default, it's 64. It is recommended to be no more than 128.
max-log-size = 64

# The interval for flushing or uploading redo logs to S3, in milliseconds. By default, it's 1000. The recommended range is 500-2000.
flush-interval = 1000

# Form of storing redo log, including nfs (NFS directory) and S3 (uploading to S3).
storage = "s3://logbucket/test-changefeed?endpoint=http://$S3_ENDPOINT/"
```

### 災害からの回復 {#disaster-recovery}

主クラスタで障害が発生した場合、 `cdc redo`コマンドを実行して副クラスタで手動で復旧する必要があります。回復プロセスは次のとおりです。

1.  すべての TiCDC プロセスが終了していることを確認します。これは、データ リカバリ中にプライマリ クラスタがサービスを再開するのを防ぎ、TiCDC がデータ同期を再開するのを防ぐためです。
2.  データの回復には cdc バイナリを使用します。次のコマンドを実行します。

```shell
cdc redo apply --tmp-dir="/tmp/cdc/redo/apply" \
    --storage="s3://logbucket/test-changefeed?endpoint=http://10.0.10.25:24927/" \
    --sink-uri="mysql://normal:123456@10.0.10.55:3306/"
```

このコマンドでは:

-   `tmp-dir` : TiCDC 増分データ バックアップ ファイルをダウンロードするための一時ディレクトリを指定します。
-   `storage` : Amazon S3 ストレージまたは NFS ディレクトリのいずれかで、TiCDC 増分データ バックアップ ファイルを保存するためのアドレスを指定します。
-   `sink-uri` : データを復元するセカンダリ クラスタ アドレスを指定します。スキームは`mysql`のみです。
