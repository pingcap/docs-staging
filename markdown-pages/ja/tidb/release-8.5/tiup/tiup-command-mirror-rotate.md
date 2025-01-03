---
title: tiup mirror rotate
summary: TiUPミラー ローテートは、 TiUPミラーの root.json ファイルを更新するために使用されます。このファイルには公開キー、有効期限が含まれており、管理者によって署名されています。このコマンドは更新プロセスを自動化し、すべての管理者がファイルに署名することを要求します。このコマンドを使用する前に、すべてのTiUPクライアントが v1.5.0 以降にアップグレードされていることを確認してください。
---

# tiup mirror rotate {#tiup-mirror-rotate}

`root.json`はTiUPミラーの重要なファイルです。システム全体に必要な公開鍵を保存し、 TiUPの信頼チェーンの基礎となります。主に以下の部分が含まれます。

-   ミラー管理者の署名。公式ミラーの場合、署名は 5 つあります。初期化されたミラーの場合、デフォルトで署名は 3 つあります。
-   次のファイルを検証するために使用される公開鍵:
    -   ルート.json
    -   インデックス
    -   スナップショット.json
    -   タイムスタンプ.json
-   有効期限は`root.json`です。公式ミラーの場合、有効期限は作成日`root.json`の 1 年後になります。

TiUPミラーの詳細については[TiUPミラーリファレンス](/tiup/tiup-mirror-reference.md)参照してください。

以下の場合には`root.json`更新する必要があります。

-   ミラーのキーを交換してください。
-   証明書ファイルの有効期限を更新します。

`root.json`の内容が更新された後、ファイルはすべての管理者によって再署名される必要があります。そうでない場合、クライアントはファイルを拒否します。更新プロセスは次のとおりです。

1.  ユーザー（クライアント）は`root.json`のコンテンツを更新します。
2.  すべての管理者が新しい`root.json`ファイルに署名します。
3.  tiup-server は`snapshot.json`更新して、新しい`root.json`ファイルのバージョンを記録します。
4.  tiup-server は新しい`snapshot.json`ファイルに署名します。
5.  tiup-server は`timestamp.json`更新して、新しい`snapshot.json`ファイルのハッシュ値を記録します。
6.  tiup-server は新しい`timestamp.json`ファイルに署名します。

TiUP はコマンド`tiup mirror rotate`使用して上記のプロセスを自動化します。

> **注記：**
>
> -   TiUPバージョン v1.5.0 より前のバージョンでは、このコマンドを実行しても正しい新しい`root.json`ファイルが返されません[＃983](https://github.com/pingcap/tiup/issues/983)参照してください。
> -   このコマンドを使用する前に、すべてのTiUPクライアントが v1.5.0 以降のバージョンにアップグレードされていることを確認してください。

## 構文 {#syntax}

```shell
tiup mirror rotate [flags]
```

このコマンドを実行すると、 TiUP は、ユーザーがファイル内容をターゲット値に変更するためのエディターを起動します。たとえば、 `expires`フィールドの値を後の日付に変更します。次に、 TiUP は`version`フィールドを`N`から`N+1`に変更してファイルを保存します。ファイルが保存されると、 TiUP は一時的な HTTPサーバーを起動し、すべてのミラー管理者がファイルに署名するのを待ちます。

ミラー管理者がファイルに署名する方法については、 [`sign`コマンド](/tiup/tiup-command-mirror-sign.md)を参照してください。

## オプション {#options}

### --アドレス {#addr}

-   一時サーバーのリスニング アドレスを指定します。他のミラー管理者が[`sign`コマンド](/tiup/tiup-command-mirror-sign.md)使用してファイルに署名できるように、アドレスにアクセスできることを確認する必要があります。
-   データ型: `STRING`
-   コマンドでこのオプションが指定されていない場合、 TiUP はデフォルトで`0.0.0.0:8080`でリッスンします。

## 出力 {#outputs}

各ミラー管理者の現在の署名ステータス。

[&lt;&lt; 前のページに戻る - TiUPミラーコマンドリスト](/tiup/tiup-command-mirror.md#command-list)
