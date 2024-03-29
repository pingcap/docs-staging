---
title: tiup status
---

# tiup status {#tiup-status}

`tiup status`コマンドは、 `tiup [flags] <component> [args...]`コマンドを使用してコンポーネントを実行した後に、コンポーネントの操作情報を表示するために使用されます。

> **ノート：**
>
> 次のコンポーネントの情報のみを確認できます。
>
> -   稼働中のコンポーネント
> -   `tiup -T/--tag`で指定されたタグを通過するコンポーネント

## 構文 {#syntax}

```shell
tiup status [flags]
```

## オプション {#option}

なし

## 出力 {#output}

次のフィールドで構成されるテーブル:

-   `Name` : `-T/--tag`で指定されたタグ名。指定しない場合は、ランダムな文字列です。
-   `Component` : 操作コンポーネント。
-   `PID` : 対応する運用コンポーネントのプロセス ID。
-   `Status` : 稼働中のコンポーネントのステータス。
-   `Created Time` : コンポーネントの開始時間。
-   `Directory` : コンポーネントのデータ ディレクトリ。
-   `Binary` : コンポーネントのバイナリ ファイル パス。
-   `Args` : 操作部品の開始引数。

### コンポーネントのステータス {#component-status}

コンポーネントは、次のいずれかのステータスで実行できます。

-   Up:コンポーネントは正常に動作しています。
-   ダウンまたは到達不能:コンポーネントが実行されていないか、対応するホストにネットワークの問題が存在します。
-   Tombstone:コンポーネントのデータは完全に移行され、スケールインが完了しました。このステータスは TiKV またはTiFlashにのみ存在します。
-   オフライン保留中:コンポーネントのデータが移行中で、スケールインが進行中です。このステータスは TiKV またはTiFlashにのみ存在します。
-   不明:コンポーネントの実行ステータスは不明です。

> **ノート：**
>
> TiUPの`Pending Offline` 、PD API によって返される`Offline` 、および TiDB ダッシュボードの`Leaving` 、同じステータスを示します。

コンポーネントのステータスは、PD スケジューリング情報から取得されます。詳細については、 [情報収集](/tidb-scheduling.md#information-collection)を参照してください。

[&lt;&lt; 前のページに戻る - TiUPリファレンス コマンド一覧](/tiup/tiup-reference.md#command-list)
