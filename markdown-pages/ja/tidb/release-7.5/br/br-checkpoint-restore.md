---
title: Checkpoint Restore
summary: TiDB v7.1.0以降、BRにはチェックポイントリストア機能が導入され、中断されたリストアを続行できるようになります。この機能により、中断された復元のほとんどの回復進行状況を保持できます。大規模なクラスターの場合、これにはかなりの追加コストがかかります。チェックポイントリストアはGCメカニズムに依存しているため、リストアされたすべてのデータを記録することはできません。
---

# チェックポイントの復元 {#checkpoint-restore}

スナップショットの復元またはログの復元は、ディスクの枯渇やノードのクラッシュなどの回復可能なエラーにより中断される場合があります。 TiDB v7.1.0 より前では、エラーが解決された後でも中断前のリカバリの進行状況は無効になるため、リストアを最初から開始する必要がありました。大規模なクラスターの場合、これにはかなりの追加コストがかかります。

TiDB v7.1.0 以降、バックアップ &amp; リストア (BR) にチェックポイント リストア機能が導入され、中断されたリストアを続行できるようになります。この機能により、中断された復元のほとんどの回復進行状況を保持できます。

## アプリケーションシナリオ {#application-scenarios}

TiDB クラスターが大きく、障害後に再度復元する余裕がない場合は、チェックポイント復元機能を使用できます。 br コマンドライン ツール (以下、 `br`と呼びます) は、復元されたシャードを定期的に記録します。このようにして、次回の復元の再試行では、異常終了に近い回復進行ポイントを使用できます。

## 実装の詳細 {#implementation-details}

チェックポイント復元の実装は、スナップショット復元とログ復元の 2 つの部分に分かれています。

### スナップショットの復元 {#snapshot-restore}

スナップショット復元の実装は[スナップショットバックアップ](/br/br-checkpoint-backup.md#implementation-details)と似ています。 `br`キー範囲 (リージョン) 内のすべての SST ファイルをバッチで復元します。復元の完了後、 `br`この範囲と復元されたクラスター テーブルのテーブル ID を記録します。チェックポイント復元機能は、復元されたキー範囲を永続化できるように、新しい復元情報を外部storageに定期的にアップロードします。

`br`復元を再試行するときに、外部storageから復元されたキー範囲を読み取り、対応するテーブル ID と照合します。復元中、 `br` 、チェックポイント復元で記録されたキー範囲と重複し、同じテーブル ID を持つキー範囲をスキップします。

リストアを`br`試行する前にテーブルを削除すると、再試行中に新しく作成されたテーブルのテーブル ID は、チェックポイント リストアで以前に記録されたテーブル ID とは異なります。この場合、 `br`以前のチェックポイント復元情報をバイパスし、テーブルを再度復元します。これは、新しい ID を持つ同じテーブルが古い ID のチェックポイント復元情報を無視し、新しい ID に対応する新しいチェックポイント復元情報を記録することを意味します。

MVCC (Multi-Version Concurrency Control) メカニズムの使用により、指定されたタイムスタンプを持つデータを順序付けせずに繰り返し書き込むことができます。

スナップショット復元を使用してデータベースまたはテーブル DDL を復元する場合、 `ifExists`パラメータが追加されます。すでに作成されているとみなされる既存のデータベースまたはテーブルの場合、 `br`復元を自動的にスキップします。

### ログの復元 {#log-restore}

ログリストアは、TiKV ノード (meta-kv) によってバックアップされたデータのメタデータをタイムスタンプ順にリストアするプロセスです。チェックポイント リストアでは、まず、meta-kv データに基づいて、バックアップ クラスターとリストアされたクラスターの間に 1 対 1 の ID マッピング関係が確立されます。これにより、meta-kv の ID がさまざまな復元再試行にわたって一貫性を保たれ、meta-kv を再度復元できるようになります。

スナップショット バックアップ ファイルとは異なり、ログ バックアップ ファイルの範囲は重複する可能性があります。したがって、キー範囲をリカバリ進行状況メタデータとして直接使用することはできません。さらに、大量のログ バックアップ ファイルが存在する可能性があります。ただし、各ログ バックアップ ファイルには、ログ バックアップ メタデータ内の固定位置があります。これは、ログ バックアップ メタデータ内の固有の位置を、回復進行状況メタデータとして各ログ バックアップ ファイルに割り当てることができることを意味します。

ログ バックアップ メタデータには、ファイル メタデータの配列が含まれています。配列内の各ファイル メタデータは、複数のログ バックアップ ファイルで構成されるファイルを表します。ファイル メタデータは、連結ファイル内のログ バックアップ ファイルのオフセットとサイズを記録します。したがって、 `br`トリプル`(log backup metadata name, file metadata array offset, log backup file array offset)`使用してログ バックアップ ファイルを一意に識別できます。

## 使用制限 {#usage-limitations}

チェックポイント リストアは GC メカニズムに依存しているため、リストアされたすべてのデータを記録することはできません。以下のセクションで詳細を説明します。

### GC は一時停止されます {#gc-will-be-paused}

ログの復元中、復元されるデータの順序は順不同です。つまり、キーの削除レコードが書き込みレコードの前に復元される可能性があります。この時点で GC がトリガーされると、キーのすべてのデータが削除され、その後 GC はキーの後続の書き込みレコードを処理できなくなります。この状況を回避するには、ログの復元中に GC を`br`停止します。 `br`途中で終了すると、GC は一時停止したままになります。

ログの復元が完了すると、GC は手動で起動しなくても自動的に再起動されます。ただし、復元を続行しない場合は、次のように手動で GC を有効にすることができます。

`br` GC 一時停止の原理は、 `SET config tikv gc.ratio-threshold = -1.0`実行して`gc.ratio-threshold`を負の数に設定し、GC を一時停止することです。 [`gc.ratio-threshold`](/tikv-configuration-file.md#ratio-threshold)の値を変更することで、GC を手動で有効にできます。たとえば、デフォルト値にリセットするには、 `SET config tikv gc.ratio-threshold = 1.1`を実行します。

### 一部のデータは再度復元する必要があります {#some-data-needs-to-be-restored-again}

復元を`br`試行する場合、復元中のデータやチェックポイントによって記録されなかったデータなど、復元されたデータの一部を再度復元する必要がある場合があります。

-   中断がエラーによって引き起こされた場合、 `br`終了する前に復元されたデータのメタ情報を永続化します。この場合、次回のリトライでは、リストア中のデータのみを再度リストアする必要があります。

-   `br`プロセスがシステムによって中断されると、 `br`外部storageに復元されたデータのメタ情報を永続化できなくなります。 `br` 30 秒ごとにメタ情報を永続化するため、中断前の最後の 30 秒間に復元されたデータは永続化できず、次回の再試行時に再度復元する必要があります。

### 復元中にクラスターデータを変更しないようにする {#avoid-modifying-cluster-data-during-the-restore}

リストアが失敗した後は、クラスター内のテーブルの書き込み、削除、または作成を避けてください。これは、バックアップ データにテーブルの名前を変更するための DDL 操作が含まれている可能性があるためです。クラスター データを変更すると、チェックポイント リストアでは、削除されたテーブルと既存のテーブルが外部操作の結果であるかどうかを判断できなくなり、次回のリストア再試行の精度に影響します。
