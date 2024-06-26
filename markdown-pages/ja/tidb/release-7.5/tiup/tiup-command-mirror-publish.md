---
title: tiup mirror publish
summary: tiup mirror publishコマンドは、新しいコンポーネントまたは既存のコンポーネントの新しいバージョンを公開するために使用されます。ターゲットコンポーネントへのアクセス権を持つコンポーネント所有者のみがそれを公開できます。新しいコンポーネント所有者を追加するには、grantコマンドの使用法を参照してください。コマンドの構文は、tiup mirror publish <comp-name> <version> <tarball> <entry> [flags]です。各パラメータの意味は次のとおりです。
---

# tiup mirror publish {#tiup-mirror-publish}

コマンド`tiup mirror publish`は、新しいコンポーネントまたは既存のコンポーネントの新しいバージョンを公開するために使用されます。ターゲットコンポーネントへのアクセス権を持つコンポーネント所有者のみがそれを公開できます。新しいコンポーネント所有者を追加するには、 [`grant`コマンド](/tiup/tiup-command-mirror-grant.md)の使用法を参照してください。

## 構文 {#syntax}

```shell
tiup mirror publish <comp-name> <version> <tarball> <entry> [flags]
```

各パラメータの意味は次のとおりです。

-   `<comp-name>` : コンポーネントの名前 ( `tidb`など)。正規表現`^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$`に一致する文字列を使用することをお勧めします。
-   `<version>` : 公開されるコンポーネントのバージョン。バージョン番号は[セマンティック バージョニング](https://semver.org/)の要件に従う必要があります。
-   `<tarball>` : `.tar.gz`パッケージのローカル ディレクトリ。このパッケージには、コンポーネントの依存関係と実行可能ファイルを含める必要があります。 TiUP はこのパッケージをミラーにアップロードします。
-   `<entry>` : `<tarball>`のコンポーネントの実行可能ファイルの場所。

## オプション {#options}

### -k、--キー {#k-key}

-   コンポーネント所有者の秘密キーを指定します。クライアントは秘密キーを使用して`{component}.json`に署名します。
-   データ型: `STRING`
-   デフォルト: 「${TIUP_HOME}/keys/private.json」

### - アーチ {#arch}

-   `<tarball>`のバイナリ ファイルを実行できるプラットフォームを指定します。単一の`<tarball>`パッケージの場合、プラットフォームは次のオプションからのみ選択できます。

    -   `amd64` : ファイルが AMD64 マシンで実行されることを示します。
    -   `arm64` : ファイルが ARM64 マシンで実行されることを示します。
    -   `any` : スクリプトなどのファイルが AMD64 マシンと ARM64 マシンの両方で実行されることを示します。

-   データ型: `STRING`

-   デフォルト: 「${GOARCH}」

> **注記：**
>
> `--arch`が`any`に設定されている場合は、 `--os` `any`に設定する必要があります。

### --os {#os}

-   `<tarball>`のバイナリ ファイルを実行できるオペレーティング システムを指定します。単一の`<tarball>`パッケージの場合、オペレーティング システムは次のオプションからのみ選択できます。

    -   `linux` : ファイルが Linux オペレーティング システム上で実行されることを示します。
    -   `darwin` : ファイルが Darwin オペレーティング システム上で実行されることを示します。
    -   `any` : スクリプトなどのファイルが Linux オペレーティング システムと Darwin オペレーティング システムの両方で実行されることを示します。

-   データ型: `STRING`

-   デフォルト: 「${GOOS}」

> **注記：**
>
> `--os`が`any`に設定されている場合は、 `--arch` `any`に設定する必要があります。

### --desc {#desc}

-   コンポーネントの説明を指定します。
-   データ型: `String`
-   デフォルト: NULL

### - 隠れる {#hide}

-   コンポーネントを非表示にするかどうかを指定します。非表示のコンポーネントの場合、 `tiup list -all`結果リストには表示されますが、 `tiup list`の結果リストには表示されません。
-   データ型: `STRING`
-   デフォルト: NULL

### --スタンドアロン {#standalone}

-   コンポーネントをスタンドアロンで実行できるかどうかを制御します。このオプションは現在**使用できません**。
-   データ型: `BOOLEAN`
-   このオプションはデフォルトでは無効になっており、デフォルト値は`false`です。このオプションを有効にするには、このオプションをコマンドに追加して、値`true`渡すか、値を渡さないことができます。

## 出力 {#outputs}

-   コマンドが正常に実行された場合、出力はありません。
-   コンポーネント所有者にターゲットコンポーネントを変更する権限がない場合:
    -   ミラーがリモート ミラーの場合、 TiUP はエラー`Error: The server refused, make sure you have access to this component`を報告します。
    -   ミラーがローカル ミラーの場合、 TiUP はエラー`Error: the signature is not correct`を報告します。

[&lt;&lt; 前のページに戻る - TiUP Mirror コマンド一覧](/tiup/tiup-command-mirror.md#command-list)
