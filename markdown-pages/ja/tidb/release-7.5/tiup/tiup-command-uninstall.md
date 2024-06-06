---
title: tiup uninstall
summary: tiup uninstallコマンドは、インストールされているコンポーネントをアンインストールするために使用されます。コマンドには、コンポーネントの名前とバージョンを指定して使用します。オプションとして、--allを使用すると、指定されたコンポーネントのすべてのバージョンをアンインストールできます。また、自己オプションを使用すると、TiUP自体をアンインストールできます。コマンドがエラーなく終了した場合は、"Uninstalled component "%s" successfully!"が出力されます。
---

# tiup uninstall {#tiup-uninstall}

`tiup uninstall`コマンドは、インストールされているコンポーネントをアンインストールするために使用されます。

## 構文 {#syntax}

```shell
tiup uninstall <component1>:<version> [component2...N] [flags]
```

-   `<component1>` : アンインストールするコンポーネントの名前。
-   `<version>` : アンインストールするバージョン。このフィールドを省略すると、インストールされているコンポーネントのすべてのバージョンがアンインストールされます。セキュリティ上の理由から、 `<version>`を省略する場合は`--all`オプションを追加する必要があります。これは、コンポーネントのすべてのバージョンをアンインストールする必要があることを示します。
-   `[component2...N]` : アンインストールする複数のコンポーネントまたはバージョン。

## オプション {#options}

### &#x20;--all {#all}

-   指定されたコンポーネントのインストールされているすべてのバージョンをアンインストールします。 `<version>`を省略した場合は必ずこのオプションを使用してください。
-   データ型: `BOOLEAN`
-   このオプションはデフォルトでは無効になっており、デフォルト値は`false`です。このオプションを有効にするには、このオプションをコマンドに追加して、値`true`渡すか、値を渡さないことができます。

### - 自己 {#self}

-   TiUP自体をアンインストールします。このオプションを使用すると、ミラーからダウンロードされたデータはすべて削除されますが、 TiUPとそのコンポーネントによって生成されたデータは保持されます。データは`TIUP_HOME`環境変数で指定されたディレクトリに保存されます。 `TIUP_HOME`が設定されていない場合、デフォルト値は`~/.tiup/`です。
-   データ型: `BOOLEAN`
-   このオプションはデフォルトでは無効になっており、デフォルト値は`false`です。このオプションを有効にするには、このオプションをコマンドに追加して、値`true`渡すか、値を渡さないことができます。

## 出力 {#outputs}

-   コマンドがエラーなく終了した場合は、 `Uninstalled component "%s" successfully!`が出力されます。
-   `<version>`も`--all`指定されていない場合は、 `Use "tiup uninstall tidbx --all" if you want to remove all versions.`エラーが報告されます。

[&lt;&lt; 前のページに戻る - TiUPリファレンスコマンドリスト](/tiup/tiup-reference.md#command-list)