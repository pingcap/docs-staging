---
title: tiup cluster upgrade
summary: The tiup cluster upgrade command is used to upgrade a specified cluster to a specific version. It requires the cluster name and target version as input. Options include --force to ignore errors and start the cluster, --transfer-timeout to set maximum wait time for node migration, --ignore-config-check to skip configuration check, and --offline to replace binary files without restarting the cluster. The output is the log of the upgrading progress.
---

# tiup cluster upgrade {#tiup-cluster-upgrade}

`tiup cluster upgrade`コマンドは、指定されたクラスターを特定のバージョンにアップグレードするために使用されます。

## 構文 {#syntax}

```shell
tiup cluster upgrade <cluster-name> <version> [flags]
```

-   `<cluster-name>` : 操作対象のクラスター名。クラスター名を忘れた場合は、 [クラスタリスト](/tiup/tiup-component-cluster-list.md)コマンドで確認できます。
-   `<version>` : アップグレード先のターゲット バージョン ( `v7.5.1`など)。現在、現在のクラスターよりも高いバージョンへのアップグレードのみが許可されています。つまり、ダウングレードは許可されていません。また、夜間バージョンにアップグレードすることもできません。

## オプション {#options}

### &#x20;--force {#force}

-   クラスターをアップグレードするには、クラスターが現在起動していることを確認する必要があります。場合によっては、クラスターが起動していないときにアップグレードすることが必要になる場合があります。この時点で、 `--force`を使用すると、アップグレード中のエラーを無視し、バイナリ ファイルを強制的に置き換えてクラスターを起動できます。
-   データ型: `BOOLEAN`
-   デフォルト: false

> **注記：**
>
> サービスを提供しているクラスターを強制的にアップグレードすると、サービスが利用できなくなる可能性があります。未起動のクラスターは、アップグレードが成功すると自動的に起動されます。

### --transfer-timeout {#transfer-timeout}

-   PD または TiKV をアップグレードする場合、アップグレードされたノードのリーダーが最初に他のノードに移行されます。移行プロセスには時間がかかりますが、 `-transfer-timeout`オプションで最大待機時間 (秒単位) を設定できます。タイムアウト後、待機はスキップされ、サービスは直接アップグレードされます。
-   データ型: `uint`
-   デフォルト: 600

> **注記：**
>
> 待機をスキップしてサービスを直接アップグレードすると、サービスのパフォーマンスが不安定になる可能性があります。

### --ignore-config-check {#ignore-config-check}

-   バイナリが更新された後、 `<binary> --config-check <config-file>`を使用して TiDB、TiKV、および PD コンポーネントに対して構成チェックが実行されます。 `<binary>`は新しくデプロイされたバイナリへのパス、 `<config-file>`はユーザー構成に基づいて生成された構成ファイルです。このチェックをスキップするには、 `--ignore-config-check`オプションを使用できます。
-   データ型: `BOOLEAN`
-   デフォルト: false

### &#x20;--offline {#offline}

-   現在のクラスターが実行されていないことを宣言します。このオプションを指定すると、 TiUP はサービス リーダーを別のノードに削除したり、サービスを再起動したりせず、クラスター コンポーネントのバイナリ ファイルを置き換えるだけです。
-   データ型: `BOOLEAN`
-   このオプションは、値`false`を指定するとデフォルトで無効になります。このオプションを有効にするには、このオプションをコマンドに追加し、値`true`渡すか、値を渡しません。

### -h, --help {#h-help}

-   ヘルプ情報を出力します。
-   データ型: `BOOLEAN`
-   デフォルト: false

## 出力 {#output}

アップグレードの進行状況のログ。

[&lt;&lt; 前のページに戻る - TiUPクラスタコマンド リスト](/tiup/tiup-component-cluster.md#command-list)
