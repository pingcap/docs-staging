---
title: Telemetry
summary: Learn the telemetry feature, how to disable the feature and view its status.
---

# テレメトリー {#telemetry}

デフォルトでは、TiDB、TiUP、および TiDB ダッシュボードは、使用状況に関する情報を収集し、その情報を PingCAP と共有して、製品を改善する方法を理解するのに役立ちます。たとえば、この使用状況情報は、新機能の優先順位付けに役立ちます。

## 何が共有されますか？ {#what-is-shared}

以下のセクションでは、各コンポーネントの共有使用情報について詳しく説明します。共有される使用状況の詳細は、時間の経過とともに変化する可能性があります。これらの変更 (ある場合) は[リリースノート](/releases/release-notes.md)で発表されます。

> **ノート：**
>
> **すべて**の場合において、TiDB クラスターに保存されているユーザー データは共有され<strong>ません</strong>。 [PingCAP プライバシー ポリシー](https://pingcap.com/privacy-policy)も参照できます。

### TiDB {#tidb}

TiDB でテレメトリ収集機能が有効になっている場合、TiDB クラスターは使用状況の詳細を 6 時間ごとに収集します。これらの使用の詳細には、次のものが含まれますが、これらに限定されません。

-   ランダムに生成されたテレメトリ ID。
-   ハードウェア (CPU、メモリ、ディスク) のサイズ、TiDB コンポーネントのバージョン、OS 名などの展開の特性。
-   クエリ リクエストの数や期間など、システム内のクエリ リクエストのステータス。
-   コンポーネントの使用状況。たとえば、非同期コミット機能が使用されているかどうか。
-   TiDB テレメトリ データ送信者の仮名化された IP アドレス。

PingCAP に共有されている使用情報の全内容を表示するには、次の SQL ステートメントを実行します。


```sql
ADMIN SHOW TELEMETRY;
```

### TiDB ダッシュボード {#tidb-dashboard}

TiDB ダッシュボードでテレメトリ収集機能が有効になっている場合、TiDB ダッシュボード Web UI の使用情報が共有されます。

-   ランダムに生成されたテレメトリ ID。
-   ユーザーがアクセスした TiDB ダッシュボード Web ページの名前などのユーザー操作情報。
-   ブラウザ名、OS 名、画面解像度などのブラウザと OS の情報。

PingCAP に共有される使用情報の全内容を表示するには、 [Chrome DevTools の Network Activity Inspector](https://developers.google.com/web/tools/chrome-devtools/network)または[Firefox 開発者ツールのネットワーク モニター](https://developer.mozilla.org/en-US/docs/Tools/Network_Monitor)を使用します。

### TiUP {#tiup}

TiUP でテレメトリ収集機能が有効になっている場合、TiUP でのユーザー操作が共有されます。

-   ランダムに生成されたテレメトリ ID。
-   実行が成功したかどうか、実行期間など、TiUP コマンドの実行ステータス。
-   ハードウェアのサイズ、TiDB コンポーネントのバージョン、変更された展開構成名などの展開の特性。

PingCAP に共有されている使用情報のすべての内容を表示するには、TiUP コマンドを実行するときに`TIUP_CLUSTER_DEBUG=enable`環境変数を設定します。例えば：


```shell
TIUP_CLUSTER_DEBUG=enable tiup cluster list
```

## テレメトリを無効にする {#disable-telemetry}

### デプロイ時に TiDB テレメトリを無効にする {#disable-tidb-telemetry-at-deployment}

TiDB クラスターをデプロイするときは、 [`enable-telemetry = false`](/tidb-configuration-file.md#enable-telemetry-new-in-v402)を構成して、すべての TiDB インスタンスで TiDB テレメトリ コレクションを無効にします。この設定を使用して、既存の TiDB クラスターでテレメトリを無効にすることもできます。これは、クラスターを再起動するまで有効になりません。

さまざまな展開ツールでテレメトリを無効にする詳細な手順を以下に示します。

<details><summary>バイナリ展開</summary>

次の内容で構成ファイル`tidb_config.toml`を作成します。


```toml
enable-telemetry = false
```

上記の設定ファイルを有効にするには、TiDB の起動時に`--config=tidb_config.toml`コマンドライン パラメータを指定します。

詳細については、 [TiDBConfiguration / コンフィグレーションオプション](/command-line-flags-for-tidb-configuration.md#--config)と[TiDBConfiguration / コンフィグレーションファイル](/tidb-configuration-file.md#enable-telemetry-new-in-v402)を参照してください。

</details>

<details><summary>TiUP Playground を使用した展開</summary>

次の内容で構成ファイル`tidb_config.toml`を作成します。


```toml
enable-telemetry = false
```

TiUP Playground を起動するときに、上記の構成ファイルに`--db.config tidb_config.toml`コマンドライン パラメータを指定して有効にします。例えば：


```shell
tiup playground --db.config tidb_config.toml
```

詳細は[ローカル TiDBクラスタをすばやくデプロイする](/tiup/tiup-playground.md)を参照してください。

</details>

<details><summary>TiUPクラスタを使用したデプロイ</summary>

展開トポロジ ファイル`topology.yaml`を変更して、次の内容を追加します。


```yaml
server_configs:
  tidb:
    enable-telemetry: false
```

</details>

<details><summary>TiDB Operatorによる Kubernetes へのデプロイ</summary>

`spec.tidb.config.enable-telemetry: false` in `tidb-cluster.yaml`または TidbCluster カスタム リソースを構成します。

詳細は[TiDB Operatorを Kubernetes にデプロイ](https://docs.pingcap.com/tidb-in-kubernetes/stable/deploy-tidb-operator)を参照してください。

> **ノート：**
>
> この構成項目を有効にするには、 TiDB Operator v1.1.3 以降が必要です。

</details>

### デプロイされた TiDB クラスターの TiDB テレメトリを無効にする {#disable-tidb-telemetry-for-deployed-tidb-clusters}

既存の TiDB クラスターでは、システム変数[`tidb_enable_telemetry`](/system-variables.md#tidb_enable_telemetry-new-in-v402)を変更して、TiDB テレメトリ コレクションを動的に無効にすることもできます。


```sql
SET GLOBAL tidb_enable_telemetry = 0;
```

> **ノート：**
>
> テレメトリを無効にすると、構成ファイルがシステム変数よりも優先されます。つまり、構成ファイルによってテレメトリ収集が無効にされると、システム変数の値は無視されます。

### TiDB ダッシュボードのテレメトリを無効にする {#disable-tidb-dashboard-telemetry}

[`dashboard.enable-telemetry = false`](/pd-configuration-file.md#enable-telemetry)を構成して、すべての PD インスタンスで TiDB ダッシュボード テレメトリ コレクションを無効にします。構成を有効にするには、実行中のクラスターを再起動する必要があります。

さまざまな展開ツールのテレメトリを無効にする詳細な手順を以下に示します。

<details><summary>バイナリ展開</summary>

次の内容で構成ファイル`pd_config.toml`を作成します。


```toml
[dashboard]
enable-telemetry = false
```

PD を有効にするには、起動時に`--config=pd_config.toml`コマンドライン パラメータを指定します。

詳細については、 [PDConfiguration / コンフィグレーションフラグ](/command-line-flags-for-pd-configuration.md#--config)と[PDConfiguration / コンフィグレーションファイル](/pd-configuration-file.md#enable-telemetry)を参照してください。

</details>

<details><summary>TiUP Playground を使用した展開</summary>

次の内容で構成ファイル`pd_config.toml`を作成します。


```toml
[dashboard]
enable-telemetry = false
```

TiUP Playground を起動するときに、 `--pd.config pd_config.toml`コマンドライン パラメータを指定して有効にします。次に例を示します。


```shell
tiup playground --pd.config pd_config.toml
```

詳細は[ローカル TiDBクラスタをすばやくデプロイする](/tiup/tiup-playground.md)を参照してください。

</details>

<details><summary>TiUPクラスタを使用したデプロイ</summary>

展開トポロジ ファイル`topology.yaml`を変更して、次の内容を追加します。


```yaml
server_configs:
  pd:
    dashboard.enable-telemetry: false
```

</details>

<details><summary>TiDB Operatorによる Kubernetes へのデプロイ</summary>

`spec.pd.config.dashboard.enable-telemetry: false` in `tidb-cluster.yaml`または TidbCluster カスタム リソースを構成します。

詳細は[TiDB Operatorを Kubernetes にデプロイ](https://docs.pingcap.com/tidb-in-kubernetes/stable/deploy-tidb-operator)を参照してください。

> **ノート：**
>
> この構成項目を有効にするには、 TiDB Operator v1.1.3 以降が必要です。

</details>

### TiUP テレメトリを無効にする {#disable-tiup-telemetry}

TiUP テレメトリ コレクションを無効にするには、次のコマンドを実行します。


```shell
tiup telemetry disable
```

## テレメトリのステータスを確認する {#check-telemetry-status}

TiDB テレメトリの場合、次の SQL ステートメントを実行して、テレメトリのステータスを確認します。


```sql
ADMIN SHOW TELEMETRY;
```

実行結果の`DATA_PREVIEW`列が空の場合、TiDB テレメトリは無効になっています。そうでない場合は、TiDB テレメトリが有効になっています。また、 `LAST_STATUS`列目から利用情報がいつ共有されたか、共有が成功したかどうかも確認できます。

TiUP テレメトリの場合、次のコマンドを実行してテレメトリのステータスを確認します。


```shell
tiup telemetry status
```

## コンプライアンス {#compliance}

さまざまな国または地域のコンプライアンス要件を満たすために、使用情報は、送信側マシンの IP アドレスに従って、さまざまな国にあるサーバーに送信されます。

-   中国本土からのIPアドレスの場合、使用情報は中国本土のクラウドサーバーに送信および保存されます。
-   中国本土以外からの IP アドレスの場合、使用情報は米国内のクラウド サーバーに送信および保存されます。

詳細は[PingCAP プライバシー ポリシー](https://en.pingcap.com/privacy-policy/)を参照してください。
