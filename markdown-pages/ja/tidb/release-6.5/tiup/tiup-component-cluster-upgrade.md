---
title: tiup cluster upgrade
---

# tiup cluster upgrade {#tiup-cluster-upgrade}

`tiup cluster upgrade`コマンドは、指定されたクラスターを特定のバージョンにアップグレードするために使用されます。

## 構文 {#syntax}

```shell
tiup cluster upgrade <cluster-name> <version> [flags]
```

-   `<cluster-name>` : 操作するクラスター名。クラスター名を忘れた場合は、 [クラスタ リスト](/tiup/tiup-component-cluster-list.md)コマンドで確認できます。
-   `<version>` : アップグレード先のターゲット バージョン ( `v6.5.2`など)。現在、現在のクラスターよりも高いバージョンへのアップグレードのみが許可されています。つまり、ダウングレードは許可されていません。また、ナイトリー バージョンへのアップグレードも許可されていません。

## オプション {#options}

### &#x20;--force {#force}

-   クラスターをアップグレードするには、クラスターが現在開始されていることを確認する必要があります。場合によっては、クラスターが開始されていないときにアップグレードする必要があります。この時点で、 `--force`を使用してアップグレード中のエラーを無視し、バイナリ ファイルを強制的に置き換えてクラスターを起動できます。
-   データ型: `BOOLEAN`
-   デフォルト: false

> **ノート：**
>
> サービスを提供しているクラスターのアップグレードを強制すると、サービスが利用できなくなる可能性があります。アップグレードが正常に完了すると、未起動のクラスターが自動的に起動されます。

### --transfer-timeout {#transfer-timeout}

-   PD または TiKV をアップグレードすると、アップグレードされたノードのリーダーが最初に他のノードに移行されます。移行プロセスには時間がかかりますが、オプション`-transfer-timeout`で最大待機時間 (秒単位) を設定できます。タイムアウト後、待機はスキップされ、サービスは直接アップグレードされます。
-   データ型: `uint`
-   デフォルト: 300

> **ノート：**
>
> 待機をスキップしてサービスを直接アップグレードすると、サービスのパフォーマンスが低下する可能性があります。

### --ignore-config-check {#ignore-config-check}

-   バイナリが更新された後、 `<binary> --config-check <config-file>`を使用して TiDB、TiKV、および PD コンポーネントで構成チェックが実行されます。 `<binary>`は新しくデプロイされたバイナリへのパスで、 `<config-file>`はユーザー構成に基づいて生成された構成ファイルです。このチェックをスキップするには、 `--ignore-config-check`オプションを使用できます。
-   データ型: `BOOLEAN`
-   デフォルト: false

### &#x20;--offline {#offline}

-   現在のクラスターが実行されていないことを宣言します。このオプションを指定すると、 TiUP はサービス リーダーを別のノードに移動したり、サービスを再起動したりせず、クラスター コンポーネントのバイナリ ファイルのみを置き換えます。
-   データ型: `BOOLEAN`
-   このオプションはデフォルトで無効になっており、値は`false`です。このオプションを有効にするには、このオプションをコマンドに追加し、値`true`渡すか、値を何も渡さないでください。

### -h, --help {#h-help}

-   ヘルプ情報を出力します。
-   データ型: `BOOLEAN`
-   デフォルト: false

## 出力 {#output}

アップグレードの進行状況のログ。

[&lt;&lt; 前のページに戻る - TiUP クラスタコマンド一覧](/tiup/tiup-component-cluster.md#command-list)
