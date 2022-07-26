---
title: Encryption at Rest
summary: Learn how to enable encryption at rest to protect sensitive data.
---

# 保存時の暗号化 {#encryption-at-rest}

> **ノート：**
>
> クラスターが AWS にデプロイされ、EBS ストレージを使用している場合は、EBS 暗号化を使用することをお勧めします。 [AWS ドキュメント - EBS 暗号化](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html)を参照してください。ローカル NVMe ストレージなど、AWS で非 EBS ストレージを使用している場合は、このドキュメントで紹介されている保存時の暗号化を使用することをお勧めします。

保存時の暗号化とは、データが保存時に暗号化されることを意味します。データベースの場合、この機能は TDE (透過的データ暗号化) とも呼ばれます。これは、飛行中の暗号化 (TLS) または使用中の暗号化 (めったに使用されない) とは対照的です。さまざまなものが保管時に暗号化を行う可能性があります (SSD ドライブ、ファイル システム、クラウド ベンダーなど) が、ストレージの前に TiKV に暗号化を行わせることで、攻撃者がデータにアクセスするためにデータベースで認証する必要があることを保証できます。たとえば、攻撃者が物理マシンにアクセスした場合、ディスク上のファイルをコピーしてデータにアクセスすることはできません。

## さまざまな TiDB コンポーネントでの暗号化サポート {#encryption-support-in-different-tidb-components}

TiDB クラスターでは、さまざまなコンポーネントがさまざまな暗号化方式を使用します。このセクションでは、TiKV、TiFlash、PD、Backup &amp; Restore (BR) などのさまざまな TiDB コンポーネントでの暗号化サポートを紹介します。

TiDB クラスターがデプロイされると、ユーザー データの大部分が TiKV および TiFlash ノードに保存されます。一部のメタデータは PD ノードに保存されます (たとえば、TiKVリージョンの境界として使用されるセカンダリ インデックス キー)。保存時の暗号化の利点を最大限に活用するには、すべてのコンポーネントの暗号化を有効にする必要があります。暗号化を実装する場合は、ネットワーク経由で送信されるバックアップ、ログ ファイル、およびデータも考慮する必要があります。

### TiKV {#tikv}

TiKV は保存時の暗号化をサポートしています。この機能により、TiKV は[AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) in [CTR](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation)モードを使用してデータ ファイルを透過的に暗号化できます。保存時の暗号化を有効にするには、ユーザーが暗号化キーを提供する必要があり、このキーはマスター キーと呼ばれます。 TiKV は、実際のデータ ファイルの暗号化に使用したデータ キーを自動的にローテーションします。マスターキーを手動で回転させることは、時折行うことができます。保存時の暗号化は保存中 (つまり、ディスク上) のデータのみを暗号化し、データがネットワーク経由で転送されている間は暗号化しないことに注意してください。 TLS を保存時の暗号化と一緒に使用することをお勧めします。

オプションで、クラウドとオンプレミスの両方のデプロイに AWS KMS を使用できます。プレーンテキストのマスター キーをファイルで指定することもできます。

現在、TiKV はコア ダンプから暗号化キーとユーザー データを除外していません。保存時の暗号化を使用する場合は、TiKV プロセスのコア ダンプを無効にすることをお勧めします。これは現在、TiKV 自体では処理されていません。

TiKV は、ファイルの絶対パスを使用して暗号化されたデータ ファイルを追跡します。その結果、TiKV ノードの暗号化がオンになったら、ユーザーは`storage.data-dir` 、 `raftstore.raftdb-path` 、 `rocksdb.wal-dir` 、 `raftdb.wal-dir`などのデータ ファイル パスの構成を変更しないでください。

### ティフラッシュ {#tiflash}

TiFlash は保存時の暗号化をサポートしています。データキーは TiFlash によって生成されます。 TiFlash (TiFlash Proxy を含む) に書き込まれるすべてのファイル (データ ファイル、スキーマ ファイル、および一時ファイルを含む) は、現在のデータ キーを使用して暗号化されます。 TiFlash でサポートされている暗号化アルゴリズム、暗号化構成 ( `tiflash-learner.toml`ファイル内)、および監視メトリックの意味は、TiKV のものと一致しています。

Grafana を使用して TiFlash をデプロイした場合は、 **TiFlash-Proxy-Details** -&gt; <strong>Encryption</strong>パネルを確認できます。

### PD {#pd}

PD の保存時の暗号化は実験的機能であり、TiKV と同じ方法で構成されます。

### BR によるバックアップ {#backups-with-br}

BR は、データを S3 にバックアップするときに、S3 サーバー側暗号化 (SSE) をサポートします。顧客所有の AWS KMS キーは、S3 サーバー側の暗号化と一緒に使用することもできます。詳細は[BR S3 サーバー側の暗号化](/encryption-at-rest.md#br-s3-server-side-encryption)を参照してください。

### ロギング {#logging}

TiKV、TiDB、および PD 情報ログには、デバッグ目的でユーザー データが含まれる場合があります。情報ログとその中のこのデータは暗号化されていません。 [ログ編集](/log-redaction.md)を有効にすることをお勧めします。

## 保存時の TiKV 暗号化 {#tikv-encryption-at-rest}

### 概要 {#overview}

TiKV は現在、 CTRモードで AES128、AES192、または AES256 を使用したデータの暗号化をサポートしています。 TiKV はエンベロープ暗号化を使用します。その結果、暗号化が有効になっている場合、TiKV では 2 種類のキーが使用されます。

-   マスターキー。マスター キーはユーザーによって提供され、TiKV が生成するデータ キーを暗号化するために使用されます。マスター キーの管理は TiKV の外部にあります。
-   データキー。データキーは TiKV によって生成され、データの暗号化に実際に使用されるキーです。

同じマスター キーを TiKV の複数のインスタンスで共有できます。本番環境でマスター キーを提供する推奨される方法は、AWS KMS を使用することです。 AWS KMS を使用してカスタマー マスター キー (CMK) を作成し、設定ファイルで CMK キー ID を TiKV に提供します。 TiKV プロセスは、実行中に KMS CMK にアクセスする必要があります。これは、 [IAMロール](https://aws.amazon.com/iam/)を使用して行うことができます。 TiKV が KMS CMK へのアクセスに失敗すると、開始または再起動に失敗します。 [KMS](https://docs.aws.amazon.com/kms/index.html)と[IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)の使用方法については、AWS のドキュメントを参照してください。

または、カスタム キーを使用する必要がある場合は、ファイル経由でマスター キーを提供することもできます。ファイルには、16 進文字列としてエンコードされた 256 ビット (または 32 バイト) のキーが含まれ、改行 (つまり`\n` ) で終わり、他に何も含まれていない必要があります。ただし、キーをディスクに永続化するとキーがリークするため、キー ファイルは RAM 内の`tempfs`に保存する場合にのみ適しています。

データ キーは、基盤となるストレージ エンジン (つまり、RocksDB) に渡されます。 SST ファイル、WAL ファイル、MANIFEST ファイルなど、RocksDB によって書き込まれたすべてのファイルは、現在のデータ キーによって暗号化されます。ユーザーデータを含む可能性のある TiKV によって使用されるその他の一時ファイルも、同じデータキーを使用して暗号化されます。デフォルトでは、データ キーは TiKV によって毎週自動的にローテーションされますが、期間は構成可能です。キーのローテーションでは、TiKV はすべての既存のファイルを書き換えてキーを置き換えるわけではありませんが、クラスターが一定の書き込みワークロードを取得する場合、RocksDB 圧縮は古いデータを最新のデータ キーを使用して新しいデータ ファイルに書き換えることが期待されます。 TiKV は、各ファイルの暗号化に使用されるキーと暗号化方法を追跡し、その情報を使用して読み取り時にコンテンツを復号化します。

データ暗号化方式に関係なく、データ キーは追加の認証のために GCM モードで AES256 を使用して暗号化されます。これには、KMS ではなくファイルから渡すときに、マスター キーが 256 ビット (32 バイト) である必要がありました。

### 鍵の作成 {#key-creation}

AWS でキーを作成するには、次の手順に従います。

1.  AWS コンソールの[AWS KMS](https://console.aws.amazon.com/kms)に移動します。
2.  コンソールの右上隅で正しい地域を選択していることを確認してください。
3.  [**キーの作成**] をクリックし、キーの種類として [<strong>対称]</strong>を選択します。
4.  キーのエイリアスを設定します。

AWS CLI を使用して操作を実行することもできます。

```shell
aws --region us-west-2 kms create-key
aws --region us-west-2 kms create-alias --alias-name "alias/tidb-tde" --target-key-id 0987dcba-09fe-87dc-65ba-ab0987654321
```

2 番目のコマンドで入力する`--target-key-id`は、最初のコマンドの出力にあります。

### 暗号化を構成する {#configure-encryption}

暗号化を有効にするには、TiKV と PD の構成ファイルに暗号化セクションを追加します。

```
[security.encryption]
data-encryption-method = "aes128-ctr"
data-key-rotation-period = "168h" # 7 days
```

`data-encryption-method`の可能な値は、「aes128-ctr」、「aes192-ctr」、「aes256-ctr」、「plaintext」です。デフォルト値は「plaintext」です。これは、暗号化がオンになっていないことを意味します。 `data-key-rotation-period`は、TiKV がデータ キーをローテーションする頻度を定義します。暗号化は、新しい TiKV クラスターまたは既存の TiKV クラスターに対して有効にすることができますが、暗号化が有効になった後に書き込まれたデータのみが暗号化されることが保証されます。暗号化を無効にするには、構成ファイルで`data-encryption-method`を削除するか、「プレーンテキスト」にリセットして、TiKV を再起動します。暗号化方式を変更するには、構成ファイルで`data-encryption-method`を更新し、TiKV を再起動します。

暗号化が有効な場合 (つまり、 `data-encryption-method`が「プレーンテキスト」でない場合) は、マスター キーを指定する必要があります。 AWS KMS CMK をマスター キーとして指定するには、 `encryption`セクションの後に`encryption.master-key`セクションを追加します。

```
[security.encryption.master-key]
type = "kms"
key-id = "0987dcba-09fe-87dc-65ba-ab0987654321"
region = "us-west-2"
endpoint = "https://kms.us-west-2.amazonaws.com"
```

`key-id`は、KMS CMK のキー ID を指定します。 `region`は、KMS CMK の AWS リージョン名です。 `endpoint`はオプションであり、AWS 以外のベンダーの AWS KMS 互換サービスを使用している場合や[KMS の VPC エンドポイント](https://docs.aws.amazon.com/kms/latest/developerguide/kms-vpc-endpoint.html)を使用する必要がない限り、通常は指定する必要はありません。

AWS で[マルチリージョン キー](https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-overview.html)を使用することもできます。このためには、特定のリージョンにプライマリ キーを設定し、必要なリージョンにレプリカ キーを追加する必要があります。

ファイルに保存されているマスター キーを指定する場合、マスター キーの構成は次のようになります。

```
[security.encryption.master-key]
type = "file"
path = "/path/to/key/file"
```

ここで、 `path`はキー ファイルへのパスです。ファイルには、16 進文字列としてエンコードされた 256 ビット (または 16 バイト) のキーが含まれ、改行 ( `\n` ) で終わり、他に何も含まれていない必要があります。ファイル内容の例:

```
3b5896b5be691006e0f71c3040a29495ddcad20b14aff61806940ebd780d3c62
```

### マスターキーをローテーションする {#rotate-the-master-key}

マスター キーをローテーションするには、設定で新しいマスター キーと古いマスター キーの両方を指定し、TiKV を再起動する必要があります。 `security.encryption.master-key`を使用して新しいマスター キーを指定し、 `security.encryption.previous-master-key`を使用して古いマスター キーを指定します。 `security.encryption.previous-master-key`の構成形式は`encryption.master-key`と同じです。再起動時に、TiKV は古いマスター キーと新しいマスター キーの両方にアクセスする必要がありますが、TiKV が起動して実行されると、TiKV は新しいキーへのアクセスのみが必要になります。それ以降は、設定ファイルに`encryption.previous-master-key`の設定を残しておいてもかまいません。再起動しても、TiKV は、新しいマスター キーを使用して既存のデータを復号化できない場合にのみ、古いキーを使用しようとします。

現在、オンライン マスター キー ローテーションはサポートされていないため、TiKV を再起動する必要があります。オンライン クエリを提供する実行中の TiKV クラスターをローリング再起動することをお勧めします。

KMS CMK をローテーションするための設定例を次に示します。

```
[security.encryption.master-key]
type = "kms"
key-id = "50a0c603-1c6f-11e6-bb9e-3fadde80ce75"
region = "us-west-2"

[security.encryption.previous-master-key]
type = "kms"
key-id = "0987dcba-09fe-87dc-65ba-ab0987654321"
region = "us-west-2"
```

### 監視とデバッグ {#monitoring-and-debugging}

Grafana を使用して TiKV をデプロイする場合は、保存時の暗号化を監視するために、 **TiKV-Details**ダッシュボードの [<strong>暗号化</strong>] パネルを確認できます。探す指標がいくつかあります。

-   暗号化の初期化: TiKV の起動時に暗号化が初期化される場合は 1、それ以外の場合は 0。マスター キー ローテーションの場合、暗号化が初期化された後、TiKV は以前のマスター キーにアクセスする必要はありません。
-   暗号化データ キー: 既存のデータ キーの数。データ キーのローテーションが発生するたびに、数値が 1 ずつ増えます。このメトリクスを使用して、データ キーのローテーションが期待どおりに機能するかどうかを監視します。
-   暗号化されたファイル: 現在存在する暗号化されたデータ ファイルの数。以前に暗号化されていないクラスターの暗号化をオンにする場合は、この数をデータ ディレクトリ内の既存のデータ ファイルと比較して、暗号化されているデータの部分を推定します。
-   暗号化メタ ファイル サイズ: 暗号化メタ データ ファイルのサイズ。
-   読み取り/書き込み暗号化メタ期間: 暗号化のためにメタデータを操作するための余分なオーバーヘッド。

デバッグの場合、 `tikv-ctl`コマンドを使用して、ファイルの暗号化に使用された暗号化方式やデータ キー ID などの暗号化メタデータ、およびデータ キーのリストをダンプできます。この操作は機密データを公開する可能性があるため、本番環境での使用はお勧めしません。 [TiKV Control](/tikv-control.md#dump-encryption-metadata)文書を参照してください。

### TiKV バージョン間の互換性 {#compatibility-between-tikv-versions}

TiKV が暗号化メタデータを管理するときに I/O とミューテックスの競合によって発生するオーバーヘッドを削減するために、TiKV v4.0.9 で最適化が導入され、TiKV 構成ファイルで`security.encryption.enable-file-dictionary-log`によって制御されます。この構成パラメーターは、TiKV v4.0.9 以降のバージョンでのみ有効です。

有効になっている場合 (デフォルト)、暗号化メタデータのデータ形式は、TiKV v4.0.8 以前のバージョンでは認識できません。たとえば、保存時の暗号化とデフォルトの`enable-file-dictionary-log`構成で TiKV v4.0.9 以降を使用するとします。クラスターを TiKV v4.0.8 以前にダウングレードすると、TiKV は起動に失敗し、情報ログに次のようなエラーが記録されます。

```
[2020/12/07 07:26:31.106 +08:00] [ERROR] [mod.rs:110] ["encryption: failed to load file dictionary."]
[2020/12/07 07:26:33.598 +08:00] [FATAL] [lib.rs:483] ["called `Result::unwrap()` on an `Err` value: Other(\"[components/encryption/src/encrypted_file/header.rs:18]: unknown version 2\")"]
```

上記のエラーを回避するには、最初に`security.encryption.enable-file-dictionary-log` ～ `false`を設定し、v4.0.9 以降で TiKV を起動します。 TiKV が正常に起動すると、暗号化メタデータのデータ形式は、以前の TiKV バージョンが認識できるバージョンにダウングレードされます。この時点で、TiKV クラスターを以前のバージョンにダウングレードできます。

## BR S3 サーバー側の暗号化 {#br-s3-server-side-encryption}

BR を使用して S3 にバックアップするときに S3 サーバー側の暗号化を有効にするには、 `--s3.sse`の引数を渡し、値を「aws:kms」に設定します。 S3 は、暗号化に独自の KMS キーを使用します。例：

```
./br backup full --pd <pd-address> --storage "s3://<bucket>/<prefix>" --s3.sse aws:kms
```

作成して所有したカスタム AWS KMS CMK を使用するには、さらに`--s3.sse-kms-key-id`を渡します。この場合、クラスター内の BR プロセスとすべての TiKV ノードの両方が KMS CMK に (たとえば AWS IAM経由で) アクセスする必要があり、KMS CMK は S3 バケットが使用されていたのと同じ AWS リージョンにある必要があります。バックアップを保存します。 AWS IAMを介して KMS CMK to BR プロセスおよび TiKV ノードへのアクセスを許可することをお勧めします。 [IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)の使用方法については、AWS のドキュメントを参照してください。例えば：

```
./br backup full --pd <pd-address> --storage "s3://<bucket>/<prefix>" --s3.sse aws:kms --s3.sse-kms-key-id 0987dcba-09fe-87dc-65ba-ab0987654321
```

バックアップを復元する場合、 `--s3.sse`と`--s3.sse-kms-key-id`の両方を使用しないでください。 S3 は、暗号化設定を独自に判断します。バックアップを復元するクラスター内の BR プロセスと TiKV ノードも、KMS CMK にアクセスする必要があります。そうしないと、復元が失敗します。例：

```
./br restore full --pd <pd-address> --storage "s3://<bucket>/<prefix>"
```
