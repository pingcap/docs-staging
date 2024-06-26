---
title: tiup dm stop
summary: tiup dm stopコマンドは、指定したクラスターのサービスを停止するために使用されます。コアサービスが停止すると、クラスターはサービスを提供できなくなります。構文は、tiup dm stop <cluster-name> [flags]であり、オプションには-N、--node、-R、--role、-h、--helpがあります。停止したときのログが出力されます。
---

# ティアップDM停止 {#tiup-dm-stop}

`tiup dm stop`コマンドは、指定したクラスターのサービスのすべてまたは一部を停止するために使用されます。

> **注記：**
>
> コア サービスが停止すると、クラスターはサービスを提供できなくなります。

## 構文 {#syntax}

```shell
tiup dm stop <cluster-name> [flags]
```

`<cluster-name>` : 操作するクラスターの名前。クラスター名を忘れた場合は、 [クラスタリスト](/tiup/tiup-component-dm-list.md)コマンドで確認できます。

## オプション {#options}

### -N、--node {#n-node}

-   停止するノードを指定します。指定しない場合、すべてのノードが停止します。このオプションの値は、ノード ID のカンマ区切りリストです。ノード ID は、 [`tiup dm display`](/tiup/tiup-component-dm-display.md)コマンドによって返されるクラスター ステータス テーブルの最初の列から取得できます。
-   データ型: `STRINGS`
-   このオプションがコマンドで指定されていない場合、デフォルトですべてのノードが選択されます。

> **注記：**
>
> `-R, --role`オプションを同時に指定した場合、 `-N, --node`と`-R, --role`の両方の指定に一致するサービスノードだけが停止されます。

### -R、--役割 {#r-role}

-   停止するロールを指定します。指定しない場合、すべてのロールが停止されます。このオプションの値は、ノードの役割のカンマ区切りのリストです。ノードの役割は、 [`tiup dm display`](/tiup/tiup-component-dm-display.md)コマンドによって返されるクラスター状態テーブルの 2 番目の列から取得できます。
-   データ型: `STRINGS`
-   このオプションがコマンドで指定されていない場合、デフォルトですべてのロールが選択されます。

> **注記：**
>
> `-N, --node`オプションを同時に指定した場合、 `-N, --node`と`-R, --role`の両方の指定に一致するサービスノードだけが停止されます。

### -h, --help {#h-help}

-   ヘルプ情報を出力します。
-   データ型: `BOOLEAN`
-   デフォルト: false

## 出力 {#output}

サービスを停止したときのログです。

[&lt;&lt; 前のページに戻る - TiUP DMコマンド一覧](/tiup/tiup-component-dm.md#command-list)
