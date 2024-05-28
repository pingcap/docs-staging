---
title: tiup env
summary: TiUP は、環境変数を使用して柔軟でカスタマイズされたインターフェイスを提供します。`tiup env` コマンドは、ユーザー定義の環境変数とその値を照会します。`tiup env [name1...N]` を使用して、指定された変数、またはデフォルトですべての変数を表示します。オプションはありません。出力は、指定されていない場合は "{key}"="{value}" のリスト、指定されている場合は "{value}" のリストになります。値が空の場合、 TiUP はデフォルトを使用します。
---

# tiup env {#tiup-env}

TiUP は`tiup env`ユーザーに柔軟でカスタマイズされたインターフェースを提供します。その一部は環境変数を使用して実装されています。1 コマンドは、 TiUPがサポートするユーザー定義の環境変数とその値を照会するために使用されます。

## 構文 {#syntax}

```shell
tiup env [name1...N]
```

`[name1...N]`指定された環境変数を表示するために使用されます。指定されていない場合は、サポートされているすべての環境変数がデフォルトで表示されます。

## オプション {#option}

なし

## 出力 {#output}

-   `[name1...N]`を指定しない場合は、「{key}」=&quot;{value}&quot; のリストが出力されます。
-   `[name1...N]`を指定すると、「{value}」リストが順番に出力されます。

上記の出力で、 `value`空の場合は、環境変数の値が設定されていないことを意味します。この場合、 TiUP はデフォルト値を使用します。

[&lt;&lt; 前のページに戻る - TiUPリファレンスコマンドリスト](/tiup/tiup-reference.md#command-list)