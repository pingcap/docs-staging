---
title: tiup dm audit
---

# tiup dm audit {#tiup-dm-audit}

`tiup dm audit`コマンドは、すべてのクラスターで実行されたコマンドの履歴と、各コマンドの実行ログを表示するために使用されます。

## 構文 {#syntax}

```shell
tiup dm audit [audit-id] [flags]
```

-   `[audit-id]`を省略した場合、操作記録表は古い順に出力されます。最初の列は`audit-id`です。
-   `[audit-id]`を入力すると、指定した`audit-id`の実行ログがチェックされます。

## オプション {#option}

### -h, --help {#h-help}

-   ヘルプ情報を出力します。
-   データ型: `BOOLEAN`
-   デフォルト: false

## 出力 {#output}

-   `[audit-id]`を指定すると、対応する実行ログが出力されます。
-   `[audit-id]`が指定されていない場合は、次のフィールドを持つテーブルが出力されます。
    -   ID: このレコードに対応する`audit-id`
    -   時間: レコードに対応するコマンドの実行時間
    -   コマンド: レコードに対応するコマンド

[&lt;&lt; 前のページに戻る - TiUP DMコマンド一覧](/tiup/tiup-component-dm.md#command-list)
