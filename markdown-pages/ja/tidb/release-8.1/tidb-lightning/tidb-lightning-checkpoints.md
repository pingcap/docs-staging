---
title: TiDB Lightning Checkpoints
summary: チェックポイントを使用して、クラッシュ前に完了したタスクをやり直すことを回避します。
---

# TiDB Lightningチェックポイント {#tidb-lightning-checkpoints}

大規模なデータベースのインポートには通常、数時間または数日かかります。このような長時間実行されるプロセスが不意にクラッシュした場合、以前に完了したタスクをやり直すのに非常に時間がかかります。この問題を解決するために、 TiDB Lightning は*チェックポイント*を使用してインポートの進行状況を保存します。これにより、 `tidb-lightning`再起動後に中断したところからインポートを続行します。

このドキュメントでは、*チェックポイント*を有効化、構成、保存、および制御する方法について説明します。

## チェックポイントを有効にして構成する {#enable-and-configure-checkpoints}

```toml
[checkpoint]
# Whether to enable checkpoints.
# While importing data, TiDB Lightning records which tables have been imported, so
# even if TiDB Lightning or some other component crashes, you can start from a known
# good state instead of restarting from scratch.
enable = true

# Where to store the checkpoints.
#  - file:  store as a local file (requires v2.1.1 or later)
#  - mysql: store into a remote MySQL-compatible database
driver = "file"

# The schema name (database name) to store the checkpoints
# Enabled only when `driver = "mysql"`.
# schema = "tidb_lightning_checkpoint"

# The data source name (DSN) indicating the location of the checkpoint storage.
#
# For the "file" driver, the DSN is a path. If the path is not specified, Lightning would
# default to "/tmp/CHECKPOINT_SCHEMA.pb".
#
# For the "mysql" driver, the DSN is a URL in the form of "USER:PASS@tcp(HOST:PORT)/".
# If the URL is not specified, the TiDB server from the [tidb] section is used to
# store the checkpoints. You should specify a different MySQL-compatible
# database server to reduce the load of the target TiDB cluster.
#dsn = "/tmp/tidb_lightning_checkpoint.pb"

# Whether to keep the checkpoints after all data are imported. If false, the
# checkpoints are deleted. Keeping the checkpoints can aid debugging but
# might leak metadata about the data source.
# keep-after-success = false
```

## チェックポイントのstorage {#checkpoints-storage}

TiDB Lightning は、ローカル ファイルまたはリモート MySQL 互換データベースの 2 種類のチェックポイントstorageをサポートしています。

-   `driver = "file"`の場合、チェックポイントは`dsn`設定で指定されたパスのローカル ファイルに保存されます。チェックポイントは急速に更新されるため、チェックポイント ファイルを RAM ディスクなどの書き込み耐久性が非常に高いドライブに配置することを強くお勧めします。

-   `driver = "mysql"`では、MariaDB や TiDB など、 MySQL 5.7以降と互換性のある任意のデータベースにチェックポイントを保存できます。デフォルトでは、チェックポイントはターゲット データベースに保存されます。

ターゲット データベースをチェックポイントstorageとして使用しながら、Lightning は大量のデータを同時にインポートします。これにより、ターゲット データベースに余分な負荷がかかり、通信タイムアウトが発生する場合があります。そのため、**これらのチェックポイントを保存するために一時的な MySQLサーバーをインストールすることを強くお勧めします**。このサーバーは`tidb-lightning`と同じホストにインストールでき、インポーターの進行が完了したらアンインストールできます。

## チェックポイント制御 {#checkpoints-control}

`tidb-lightning`回復不可能なエラー (データ破損など) により異常終了した場合、エラーが解決されるまでチェックポイントの再利用を拒否します。これは、状況の悪化を防ぐためです。チェックポイント エラーは、 `tidb-lightning-ctl`プログラムを使用して解決できます。

### <code>--checkpoint-error-destroy</code> {#code-checkpoint-error-destroy-code}

```sh
tidb-lightning-ctl --checkpoint-error-destroy='`schema`.`table`'
```

このオプションを使用すると、テーブルのインポートを最初からやり直すことができます。スキーマ名とテーブル名はバッククォートで囲む必要があり、大文字と小文字が区別されます。

-   以前にテーブル`` `schema`.`table` ``のインポートに失敗した場合、このオプションは次の操作を実行します。

    1.  ターゲット データベースからテーブル`` `schema`.`table` ``を削除します。つまり、インポートされたすべてのデータが削除されます。
    2.  このテーブルのチェックポイント レコードを「まだ開始されていない」状態にリセットします。

-   表`` `schema`.`table` ``に関連するエラーがない場合、この操作は何も実行されません。

これは、すべてのテーブルに上記を適用するのと同じです。これは、チェックポイント エラーの問題を修正するための最も便利で安全かつ保守的なソリューションです。

```sh
tidb-lightning-ctl --checkpoint-error-destroy=all
```

### <code>--checkpoint-error-ignore</code> {#code-checkpoint-error-ignore-code}

```sh
tidb-lightning-ctl --checkpoint-error-ignore='`schema`.`table`'
tidb-lightning-ctl --checkpoint-error-ignore=all
```

以前にテーブル`` `schema`.`table` ``のインポートに失敗した場合、何も起こらなかったかのようにエラー ステータスがクリアされます。 `all`バリアントは、この操作をすべてのテーブルに適用します。

> **注記：**
>
> このオプションは、エラーが無視できることが確実な場合にのみ使用してください。そうでない場合、インポートされたデータの一部が失われる可能性があります。唯一の安全策は最終的な「チェックサム」チェックであるため、 `--checkpoint-error-ignore`使用する場合は「チェックサム」オプションを常に有効にしておく必要があります。

### <code>--checkpoint-remove</code> {#code-checkpoint-remove-code}

```sh
tidb-lightning-ctl --checkpoint-remove='`schema`.`table`'
tidb-lightning-ctl --checkpoint-remove=all
```

このオプションは、ステータスに関係なく、1 つのテーブルまたはすべてのテーブルに関するすべてのチェックポイント情報を削除します。

### <code>--checkpoint-dump</code> {#code-checkpoint-dump-code}

```sh
tidb-lightning-ctl --checkpoint-dump=output/directory
```

このオプションは、チェックポイントの内容を指定されたディレクトリにダンプします。これは主に技術スタッフによるデバッグに使用されます。このオプションは`driver = "mysql"`場合にのみ有効になります。
