---
title: tiup cluster start
summary: tiup cluster startコマンドは、指定されたクラスターのすべてのサービスまたは一部のサービスを開始するために使用されます。安全な開始のための --init、ノードを指定するための -N、ロールを指定するための -R、ヘルプのための -h などのオプションがあります。出力は、サービスの開始のログです。
---

# tiup cluster start {#tiup-cluster-start}

`tiup cluster start`コマンドは、指定されたクラスターのすべてのサービスまたは一部のサービスを開始するために使用されます。

## 構文 {#syntax}

```shell
tiup cluster start <cluster-name> [flags]
```

`<cluster-name>`操作対象となるクラスターの名前です。クラスター名を忘れた場合は、 [`tiup cluster list`](/tiup/tiup-component-cluster-list.md)コマンドで確認できます。

## オプション {#options}

### --初期化 {#init}

クラスターを安全な方法で起動します。クラスターを初めて起動する場合は、このオプションを使用することをお勧めします。この方法では、起動時に TiDB ルート ユーザーのパスワードが生成され、コマンド ライン インターフェイスでパスワードが返されます。

> **注記：**
>
> -   TiDB クラスターを安全に起動した後は、パスワードなしで root ユーザーを使用してデータベースにログインすることはできません。そのため、今後のログインのために、コマンド ラインによって返されるパスワードを記録する必要があります。
> -   パスワードは一度だけ生成されます。パスワードを記録していない場合や忘れた場合は、 [`root`パスワードを忘れた](/user-account-management.md#forget-the-root-password)を参照してパスワードを変更してください。

### -N、--ノード {#n-node}

-   起動するノードを指定します。このオプションの値は、ノード ID のコンマ区切りリストです。ノード ID は、 `tiup cluster display`コマンドによって返される[クラスターステータステーブル](/tiup/tiup-component-cluster-display.md)の最初の列から取得できます。
-   データ型: `STRINGS`
-   コマンドでこのオプションを指定しない場合は、デフォルトですべてのノードが起動されます。

> **注記：**
>
> `-R, --role`オプションを同時に指定した場合は、 `-N, --node`と`-R, --role`の両方の指定に一致するサービス ノードのみが起動されます。

### -R, --役割 {#r-role}

-   起動するノードの役割を指定します。このオプションの値は、ノードの役割のコンマ区切りリストです。ノードの役割は、 `tiup cluster display`コマンドによって返される[クラスターステータステーブル](/tiup/tiup-component-cluster-display.md)の 2 番目の列から取得できます。
-   データ型: `STRINGS`
-   コマンドでこのオプションを指定しない場合は、すべてのロールがデフォルトで開始されます。

> **注記：**
>
> `-N, --node`オプションを同時に指定した場合は、 `-N, --node`と`-R, --role`の両方の指定に一致するサービス ノードのみが起動されます。

### -h, --help {#h-help}

-   ヘルプ情報を出力します。
-   データ型: `BOOLEAN`
-   このオプションは、値`false`でデフォルトで無効になっています。このオプションを有効にするには、このオプションをコマンドに追加し、値`true`を渡すか、値を渡さないようにします。

## 出力 {#output}

サービスを開始したログ。

[&lt;&lt; 前のページに戻る - TiUPクラスタコマンド リスト](/tiup/tiup-component-cluster.md#command-list)
