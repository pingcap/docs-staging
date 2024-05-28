---
title: tiup list
summary: tiup list コマンドは、ミラーの利用可能なコンポーネントのリストを取得するために使用されます。`--all`、`--installed`、`--verbose` などのオプションがあり、それぞれすべてのコンポーネント、インストールされているコンポーネント、コンポーネントのバージョンを表示します。出力には、指定されたコンポーネントに基づくコンポーネント情報とバージョン情報が含まれます。
---

# tiup list {#tiup-list}

コマンド`tiup list`は、ミラーの使用可能なコンポーネントのリストを取得するために使用されます。

## 構文 {#syntax}

```shell
tiup list [component] [flags]
```

`[component]` 、特定のコンポーネントを指定するために使用されるオプションのパラメータです。2 `[component]`設定されている場合、 TiUP は指定されたコンポーネントのすべてのバージョンを一覧表示します。そうでない場合、 TiUP はすべてのコンポーネントを一覧表示します。

## オプション {#options}

### &#x20;--all {#all}

-   すべてのコンポーネントを表示します。デフォルトでは、 TiUP は非表示のコンポーネントを表示しません。
-   データ型: `BOOLEAN`
-   このオプションはデフォルトでは無効になっており、デフォルト値は`false`です。このオプションを有効にするには、このオプションをコマンドに追加し、値`true`を渡すか、値を渡さないようにします。

### --インストール済み {#installed}

-   インストールされているコンポーネントとバージョンのみを表示します。
-   データ型: `BOOLEAN`
-   このオプションはデフォルトでは無効になっており、デフォルト値は`false`です。このオプションを有効にするには、このオプションをコマンドに追加し、値`true`を渡すか、値を渡さないようにします。

### --詳細 {#verbose}

-   コンポーネント リストにインストールされているコンポーネントのバージョンを表示します。
-   データ型: `BOOLEAN`
-   このオプションはデフォルトでは無効になっており、デフォルト値は`false`です。このオプションを有効にするには、このオプションをコマンドに追加し、値`true`を渡すか、値を渡さないようにします。

## 出力 {#outputs}

-   `[component]`設定されていない場合:
    -   `--verbose`を指定した場合: TiUP は、 `Name` (コンポーネント名)、 `Installed` (インストールされているバージョン)、 `Owner` (コンポーネント所有者)、および`Description` (コンポーネントの説明) で構成されるコンポーネント情報リストを出力します。
    -   `--verbose`指定されていない場合: TiUP は、 `Name` (コンポーネント名)、 `Owner` (コンポーネント所有者)、および`Description` (コンポーネントの説明) で構成されるコンポーネント情報リストを出力します。
-   `[component]`設定されている場合:
    -   指定されたコンポーネントが存在する場合: TiUP は、指定されたコンポーネントのバージョン情報リストを出力します。このリストは、 `Version` (バージョン番号)、 `Installed` (インストール状態)、 `Release` (リリース日)、および`Platforms` (サポートされているプラ​​ットフォーム) で構成されます。
    -   指定されたコンポーネントが存在しない場合: TiUP はエラー`failed to fetch component: unknown component`を報告します。

[&lt;&lt; 前のページに戻る - TiUPリファレンスコマンドリスト](/tiup/tiup-reference.md#command-list)