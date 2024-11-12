---
title: TiDB Binlog Configuration File
summary: TiDB Binlogの設定項目について学習します。
---

# TiDBBinlogコンフィグレーションファイル {#tidb-binlog-configuration-file}

このドキュメントでは、 TiDB Binlogの設定項目を紹介します。

## Pump {#pump}

このセクションでは、 Pumpの設定項目について説明します。完全なPump設定ファイルの例については、 [Pumpコンフィグレーション](https://github.com/pingcap/tidb-binlog/blob/release-8.1/cmd/pump/pump.toml)参照してください。

### 住所 {#addr}

-   HTTP API のリスニング アドレスを`host:port`の形式で指定します。
-   デフォルト値: `127.0.0.1:8250`

### 広告アドレス {#advertise-addr}

-   外部からアクセス可能な HTTP API アドレスを指定します。このアドレスは`host:port`の形式で PD に登録されます。
-   デフォルト値: `127.0.0.1:8250`

### ソケット {#socket}

-   HTTP API がリッスンする Unix ソケット アドレス。
-   デフォルト値: &quot;&quot;

### pd-urls {#pd-urls}

-   PD URL のコンマ区切りリストを指定します。複数のアドレスを指定すると、PD クライアントが 1 つのアドレスへの接続に失敗すると、自動的に別のアドレスへの接続を試みます。
-   デフォルト値: `http://127.0.0.1:2379`

### データディレクトリ {#data-dir}

-   バイナリログとそのインデックスがローカルに保存されるディレクトリを指定します。
-   デフォルト値: `data.pump`

### ハートビート間隔 {#heartbeat-interval}

-   最新のステータスが PD に報告されるハートビート間隔 (秒単位) を指定します。
-   デフォルト値: `2`

### バイナリログ間隔 {#gen-binlog-interval}

-   偽のbinlogにデータが書き込まれる間隔 (秒単位) を指定します。
-   デフォルト値: `3`

### GC {#gc}

-   バイナリログをローカルに保存できる日数 (整数) を指定します。指定された日数を超えて保存されたバイナリログは自動的に削除されます。
-   デフォルト値: `7`

### ログファイル {#log-file}

-   ログ ファイルが保存されるパスを指定します。パラメータが空の値に設定されている場合、ログ ファイルは保存されません。
-   デフォルト値: &quot;&quot;

### ログレベル {#log-level}

-   ログ レベルを指定します。
-   デフォルト値: `info`

### ノードID {#node-id}

-   Pumpノード ID を指定します。この ID を使用すると、このPumpプロセスをクラスター内で識別できます。
-   デフォルト値: `hostname:port number` 。たとえば、 `node-1:8250` 。

### 安全 {#security}

このセクションでは、セキュリティに関連する設定項目について説明します。

#### ssl-ca {#ssl-ca}

-   信頼できる SSL 証明書リストまたは CA リストのファイル パスを指定します。たとえば、 `/path/to/ca.pem` 。
-   デフォルト値: &quot;&quot;

#### SSL証明書 {#ssl-cert}

-   Privacy Enhanced Mail (PEM) 形式でエンコードされた X509 証明書ファイルのパスを指定します。たとえば、 `/path/to/pump.pem` 。
-   デフォルト値: &quot;&quot;

#### SSLキー {#ssl-key}

-   PEM 形式でエンコードされた X509 キー ファイルのパスを指定します。たとえば、 `/path/to/pump-key.pem` 。
-   デフォルト値: &quot;&quot;

### storage {#storage}

このセクションでは、storageに関連する設定項目について説明します。

#### 同期ログ {#sync-log}

-   データの安全性を確保するために、 binlogへの**バッチ**書き込みごとに`fsync`使用するかどうかを指定します。
-   デフォルト値: `true`

#### キャプ {#kv-chan-cap}

-   Pumpが書き込み要求を受信する前にバッファが保存できる書き込み要求の数を指定します。
-   デフォルト値: `1048576` (つまり、2 の 20 乗)

#### 遅い書き込みしきい値 {#slow-write-threshold}

-   しきい値 (秒単位)。単一のbinlogファイルの書き込みに、この指定されたしきい値よりも長い時間がかかる場合、書き込みは低速書き込みとみなされ、ログに`"take a long time to write binlog"`が出力されます。
-   デフォルト値: `1`

#### 空き容量に達したら書き込みを停止 {#stop-write-at-available-space}

-   使用可能なstorage容量がこの指定値を下回ると、Binlog書き込み要求は受け入れられなくなります。storage容量を指定するには、 `900 MB` 、 `5 GB` 、 `12 GiB`などの形式を使用できます。クラスター内に複数のPumpノードがある場合、スペース不足のためにPumpノードが書き込み要求を拒否すると、TiDB は自動的に他のPumpノードにバイナリログを書き込みます。
-   デフォルト値: `10 GiB`

#### クヴ {#kv}

現在、 Pumpのstorageは[ゴーレベルDB](https://github.com/syndtr/goleveldb)に基づいて実装されています。 `storage`の下には、GoLevel 構成を調整するために使用される`kv`サブグループもあります。 サポートされている構成項目を以下に示します。

-   ブロックキャッシュ容量
-   ブロック再開間隔
-   ブロックサイズ
-   圧縮-L0-トリガー
-   圧縮テーブルのサイズ
-   圧縮合計サイズ
-   圧縮合計サイズ乗数
-   書き込みバッファ
-   書き込み-L0-一時停止-トリガー
-   書き込み-L0-スローダウン-トリガー

上記項目の詳しい説明については[GoLevelDB ドキュメント](https://godoc.org/github.com/syndtr/goleveldb/leveldb/opt#Options)を参照。

## Drainer {#drainer}

このセクションでは、 Drainerの設定項目を紹介します。完全なDrainer設定ファイルの例については、 [Drainerコンフィグレーション](https://github.com/pingcap/tidb-binlog/blob/release-8.1/cmd/drainer/drainer.toml)を参照してください。

### 住所 {#addr}

-   HTTP API のリスニング アドレスを`host:port`の形式で指定します。
-   デフォルト値: `127.0.0.1:8249`

### 広告アドレス {#advertise-addr}

-   外部からアクセス可能な HTTP API アドレスを指定します。このアドレスは`host:port`の形式で PD に登録されます。
-   デフォルト値: `127.0.0.1:8249`

### ログファイル {#log-file}

-   ログ ファイルが保存されるパスを指定します。パラメータが空の値に設定されている場合、ログ ファイルは保存されません。
-   デフォルト値: &quot;&quot;

### ログレベル {#log-level}

-   ログ レベルを指定します。
-   デフォルト値: `info`

### ノードID {#node-id}

-   Drainerノード ID を指定します。この ID を使用すると、このDrainerプロセスをクラスター内で識別できます。
-   デフォルト値: `hostname:port number` 。たとえば、 `node-1:8249` 。

### データディレクトリ {#data-dir}

-   Drainer操作中に保存する必要があるファイルを格納するために使用するディレクトリを指定します。
-   デフォルト値: `data.drainer`

### 検出間隔 {#detect-interval}

-   PD がPump情報を更新する間隔 (秒単位) を指定します。
-   デフォルト値: `5`

### pd-urls {#pd-urls}

-   PD URL のコンマ区切りリスト。複数のアドレスが指定されている場合、1 つのアドレスへの接続時にエラーが発生すると、PD クライアントは自動的に別のアドレスへの接続を試みます。
-   デフォルト値: `http://127.0.0.1:2379`

### 初期コミット {#initial-commit-ts}

-   レプリケーション プロセスを開始するトランザクションのコミット タイムスタンプを指定します。この構成は、レプリケーション プロセスが初めて実行されるDrainerノードにのみ適用されます。ダウンストリームにチェックポイントが既に存在する場合、チェックポイントに記録された時間に従ってレプリケーションが実行されます。
-   commit ts (コミット タイムスタンプ) は、TiDB 内の[取引](/transaction-overview.md#transactions)のコミットの特定の時点です。これは、現在のトランザクションの一意の ID として PD からグローバルに一意で増加するタイムスタンプです。次の一般的な方法で`initial-commit-ts`構成を取得できます。
    -   BRを使用する場合は、 BRによってバックアップされたメタデータ (backupmeta) に記録されたバックアップ TS から`initial-commit-ts`取得できます。
    -   Dumplingを使用する場合は、 Dumplingによってバックアップされたメタデータ（メタデータ）に記録されたPosから`initial-commit-ts`を取得できます。
    -   PD Controlが使用されている場合、 `tso`コマンドの出力には`initial-commit-ts`含まれます。
-   デフォルト値: `-1` 。Drainerは開始時刻として PD から新しいタイムスタンプを取得します。つまり、レプリケーション プロセスは現在の時刻から開始されます。

### 同期チェック時間 {#synced-check-time}

-   HTTP API を介して`/status`パスにアクセスし、 Drainerレプリケーションのステータスを照会できます。3 `synced-check-time`最後の正常なレプリケーションから何分経過すると`synced`と見なされるか、つまりレプリケーションが完了したかを指定します。
-   デフォルト値: `5`

### コンプレッサー {#compressor}

-   PumpとDrainer間のデータ転送に使用される圧縮アルゴリズムを指定します。現在サポートされているのは`gzip`アルゴリズムのみです。
-   デフォルト値: &quot;&quot;、圧縮なしを意味します。

### 安全 {#security}

このセクションでは、セキュリティに関連する設定項目について説明します。

#### ssl-ca {#ssl-ca}

-   信頼できる SSL 証明書リストまたは CA リストのファイル パスを指定します。たとえば、 `/path/to/ca.pem` 。
-   デフォルト値: &quot;&quot;

#### SSL証明書 {#ssl-cert}

-   PEM 形式でエンコードされた X509 証明書ファイルのパスを指定します。たとえば、 `/path/to/drainer.pem` 。
-   デフォルト値: &quot;&quot;

#### SSLキー {#ssl-key}

-   PEM 形式でエンコードされた X509 キー ファイルのパスを指定します。たとえば、 `/path/to/pump-key.pem` 。
-   デフォルト値: &quot;&quot;

### シンカー {#syncer}

`syncer`セクションには、ダウンストリームに関連する構成項目が含まれます。

#### dbタイプ {#db-type}

現在、次のダウンストリーム タイプがサポートされています。

-   `mysql`
-   `tidb`
-   `kafka`
-   `file`

デフォルト値: `mysql`

#### SQL モード {#sql-mode}

-   ダウンストリームが`mysql`または`tidb`タイプの場合に SQL モードを指定します。複数のモードがある場合は、カンマで区切ります。
-   デフォルト値: &quot;&quot;

#### トランザクションコミットを無視する {#ignore-txn-commit-ts}

-   binlogが無視されるコミットタイムスタンプを指定します (例: `[416815754209656834, 421349811963822081]` 。
-   デフォルト値: `[]`

#### スキーマを無視 {#ignore-schemas}

-   レプリケーション中に無視するデータベースを指定します。無視するデータベースが複数ある場合は、コンマで区切ります。binlog ファイル内のすべての変更がフィルター処理される場合、 binlogファイル全体が無視されます。
-   デフォルト値: `INFORMATION_SCHEMA,PERFORMANCE_SCHEMA,mysql`

#### 無視テーブル {#ignore-table}

レプリケーション中に指定されたテーブルの変更を無視します。 `toml`ファイルで無視するテーブルを複数指定できます。 例:

```toml
[[syncer.ignore-table]]
db-name = "test"
tbl-name = "log"

[[syncer.ignore-table]]
db-name = "test"
tbl-name = "audit"
```

binlogファイル内のすべての変更がフィルタリングされると、 binlogファイル全体が無視されます。

デフォルト値: `[]`

#### 複製-do-db {#replicate-do-db}

-   複製するデータベースを指定します。たとえば、 `[db1, db2]` 。
-   デフォルト値: `[]`

#### 複製実行テーブル {#replicate-do-table}

複製するテーブルを指定します。例:

```toml
[[syncer.replicate-do-table]]
db-name ="test"
tbl-name = "log"

[[syncer.replicate-do-table]]
db-name ="test"
tbl-name = "~^a.*"
```

デフォルト値: `[]`

#### トランザクションバッチ {#txn-batch}

-   ダウンストリームが`mysql`または`tidb`タイプの場合、DML 操作は異なるバッチで実行されます。このパラメータは、各トランザクションに含めることができる DML 操作の数を指定します。
-   デフォルト値: `20`

#### 労働者数 {#worker-count}

-   ダウンストリームが`mysql`または`tidb`タイプの場合、DML 操作は同時に実行されます。このパラメータは、DML 操作の同時実行数を指定します。
-   デフォルト値: `16`

#### ディスパッチを無効にする {#disable-dispatch}

-   同時実行を無効にし、強制的に`worker-count` 〜 `1`に設定します。
-   デフォルト値: `false`

#### セーフモード {#safe-mode}

セーフ モードが有効になっている場合、 Drainer はレプリケーションの更新を次のように変更します。

-   `Insert`は`Replace Into`に変更されます
-   `Update`は`Delete`プラス`Replace Into`に変更されます

デフォルト値: `false`

### シンカー {#syncer-to}

セクション`syncer.to`では、構成タイプに応じて、さまざまな種類のダウンストリーム構成項目について説明します。

#### mysql/tidb {#mysql-tidb}

次の構成項目は、ダウンストリーム データベースへの接続に関連しています。

-   `host` : この項目が設定されていない場合、TiDB Binlog はデフォルトで`localhost`である`MYSQL_HOST`環境変数をチェックしようとします。
-   `port` : この項目が設定されていない場合、TiDB Binlog は`MYSQL_PORT`環境変数 (デフォルトでは`3306` ) をチェックしようとします。
-   `user` : この項目が設定されていない場合、TiDB Binlog はデフォルトで`root`である`MYSQL_USER`環境変数をチェックしようとします。
-   `password` : この項目が設定されていない場合、TiDB Binlog はデフォルトで`""`である`MYSQL_PSWD`環境変数をチェックしようとします。
-   `read-timeout` : ダウンストリーム データベース接続の I/O 読み取りタイムアウトを指定します。デフォルト値は`1m`です。Drainerが時間のかかる一部の DDL で失敗し続ける場合は、この構成をより大きな値に設定できます。

#### ファイル {#file}

-   `dir` : binlogファイルが保存されるディレクトリを指定します。この項目が設定されていない場合は、 `data-dir`が使用されます。

#### カフカ {#kafka}

ダウンストリームが Kafka の場合、有効な設定項目は次のとおりです。

-   `zookeeper-addrs`
-   `kafka-addrs`
-   `kafka-version`
-   `kafka-max-messages`
-   `kafka-max-message-size`
-   `topic-name`

### syncer.to.checkpoint {#syncer-to-checkpoint}

-   `type` : レプリケーションの進行状況を保存する方法を指定します。現在、使用可能なオプションは`mysql` 、 `tidb` 、および`file`です。

    この設定項目は、デフォルトではダウンストリーム タイプと同じです。たとえば、ダウンストリームが`file`の場合、チェックポイントの進行状況はローカル ファイル`<data-dir>/savepoint`に保存され、ダウンストリームが`mysql`の場合、進行状況はダウンストリーム データベースに保存されます。進行状況を保存するために`mysql`または`tidb`を使用して明示的に指定する必要がある場合は、次の設定を行います。

-   デフォルトでは`schema` : `"tidb_binlog"` 。

    > **注記：**
    >
    > 同じ TiDB クラスターに複数のDrainerノードを展開する場合は、ノードごとに異なるチェックポイント スキーマを指定する必要があります。そうしないと、2 つのインスタンスのレプリケーションの進行状況が互いに上書きされてしまいます。

-   `host`

-   `user`

-   `password`

-   `port`
