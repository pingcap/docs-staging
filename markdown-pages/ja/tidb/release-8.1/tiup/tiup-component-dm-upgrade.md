---
title: tiup dm upgrade
summary: tiup dm upgrade コマンドは、指定されたクラスターを特定のバージョンにアップグレードします。パラメーターとしてクラスター名とターゲット バージョンが必要です。`--offline` オプションはオフライン アップグレードを許可し、`-h, --help` オプションはヘルプ情報を出力。出力は、サービス アップグレード プロセスのログです。
---

# tiup dm upgrade {#tiup-dm-upgrade}

`tiup dm upgrade`コマンドは、指定されたクラスターを特定のバージョンにアップグレードするために使用されます。

## 構文 {#syntax}

```shell
tiup dm upgrade <cluster-name> <version> [flags]
```

-   `<cluster-name>`は操作対象となるクラスターの名前です。クラスター名を忘れた場合は、 [`tiup dm list`](/tiup/tiup-component-dm-list.md)コマンドで確認できます。
-   `<version>`は、 `v8.1.0`などのアップグレード先のバージョンです。現在、新しいバージョンへのアップグレードのみが許可されており、以前のバージョンへのアップグレードは許可されていないため、ダウングレードは許可されていません。ナイトリーバージョンへのアップグレードも許可されていません。

## オプション {#options}

### &#x20;--offline {#offline}

-   現在のクラスターがオフラインであることを宣言します。このオプションを指定すると、 TiUP DM はサービスを再起動せずに、クラスター コンポーネントのバイナリ ファイルのみを置き換えます。

### -h, --help {#h-help}

-   ヘルプ情報を出力します。
-   データ型: `BOOLEAN`
-   このオプションは、値`false`でデフォルトで無効になっています。このオプションを有効にするには、このオプションをコマンドに追加し、値`true`を渡すか、値を渡さないようにする必要があります。

## 出力 {#output}

サービス アップグレード プロセスのログ。

[&lt;&lt; 前のページに戻る - TiUP DMコマンドリスト](/tiup/tiup-component-dm.md#command-list)