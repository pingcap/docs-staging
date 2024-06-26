---
title: tiup telemetry
summary: TiUP v1.11.3以降、新しいデプロイではテレメトリがデフォルトで無効になり、使用状況情報は収集されず、PingCAPと共有されません。以前のバージョンでは、テレメトリがデフォルトで有効になっており、使用状況情報が収集され、PingCAPと共有されます。テレメトリが有効な場合、TiUPコマンドの実行時に使用状況情報が共有されます。クラスターの正確な名前や構成情報は共有されません。TiUPはtiup telemetryコマンドを使用してテレメトリを制御します。
---

# tiup telemetry {#tiup-telemetry}

v1.11.3 以降、新しくデプロイされたTiUPではテレメトリがデフォルトで無効になり、使用状況情報は収集されず、PingCAP と共有されません。 v1.11.3 より前のバージョンでは、 TiUPでテレメトリがデフォルトで有効になっており、使用状況情報が収集され、製品を改善するために PingCAP と共有されます。

TiUPテレメトリが有効になっている場合、 TiUPコマンドの実行時に、次のような使用状況情報が PingCAP と共有されます (ただしこれらに限定されません)。

-   ランダムに生成されたテレメトリ識別子。
-   TiUPコマンドの実行ステータス (コマンドの実行が成功したかどうか、コマンドの実行時間など)。
-   ターゲット マシンのハードウェア情報、コンポーネントのバージョン番号、変更された展開構成名など、展開にTiUPを使用する状況。

以下の情報は共有されません。

-   クラスターの正確な名前
-   クラスタトポロジ
-   クラスター構成ファイル

TiUP は`tiup telemetry`コマンドを使用してテレメトリを制御します。

## 構文 {#syntax}

```shell
tiup telemetry <command>
```

`<command>`サブコマンドを表します。サポートされているサブコマンドのリストについては、以下のコマンドのセクションを参照してください。

## コマンド {#commands}

### 状態 {#status}

`tiup telemetry status`コマンドは、現在のテレメトリ設定を表示し、次の情報を出力するために使用されます。

-   `status` : テレメトリ`(enable|disable)`の有効または無効を指定します。
-   `uuid` : ランダムに生成されたテレメトリ識別子を指定します。

### リセット {#reset}

`tiup telemetry reset`コマンドは、現在のテレメトリ識別子をリセットし、新しいランダムな識別子に置き換えるのに使用されます。

### 有効にする {#enable}

`tiup telemetry enable`コマンドはテレメトリを有効にするために使用されます。

### 無効にする {#disable}

`tiup telemetry disable`コマンドはテレメトリを無効にするために使用されます。

[&lt;&lt; 前のページに戻る - TiUPリファレンスコマンドリスト](/tiup/tiup-reference.md#command-list)
