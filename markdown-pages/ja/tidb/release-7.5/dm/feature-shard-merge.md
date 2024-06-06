---
title: Merge and Migrate Data from Sharded Tables
summary: このドキュメントでは、Data Migration (DM) によって提供されるシャーディング サポート機能を紹介します。DM は、複数のアップストリーム シャード テーブルのデータを TiDB の 1 つのテーブルにマージおよび移行することをサポートします。移行中に、各シャード テーブルの DDL、および DDL の前後の DML を調整する必要があります。DM は悲観的モードと楽観的モードの 2 つの異なるモードをサポートします。悲観的モードでは、DDL を実行するシャードテーブルは DML 移行を一時停止します。楽観的モードでは、DDL を実行するシャードテーブルは DML 移行を続行します。
---

# シャードテーブルからのデータのマージと移行 {#merge-and-migrate-data-from-sharded-tables}

このドキュメントでは、Data Migration (DM) によって提供されるシャーディング サポート機能を紹介します。この機能を使用すると、アップストリームの MySQL または MariaDB インスタンスにある同じまたは異なるテーブル スキーマを持つテーブルのデータを、ダウンストリーム TiDB の 1 つの同じテーブルにマージおよび移行できます。アップストリーム DML ステートメントの移行だけでなく、複数のアップストリーム シャード テーブルで DDL ステートメントを使用してテーブル スキーマ変更を移行するための調整もサポートします。

## 概要 {#overview}

DM は、複数のアップストリーム シャード テーブルのデータを TiDB の 1 つのテーブルにマージおよび移行することをサポートします。移行中に、各シャード テーブルの DDL、および DDL の前後の DML を調整する必要があります。使用シナリオに関して、DM は悲観的モードと楽観的モードの 2 つの異なるモードをサポートします。

> **注記：**
>
> -   シャードテーブルからデータをマージおよび移行するには、タスク構成ファイルで`shard-mode`を設定する必要があります。
> -   DM は、シャーディング サポート機能のマージにデフォルトで悲観的モードを使用します。 (ドキュメント内に特別な記述がない場合は、デフォルトで悲観的モードを使用します。)
> -   楽観的モードの原理と制限を理解していない場合は、このモードを使用することはお勧めできません。そうしないと、移行の中断やデータの不整合などの重大な結果が生じる可能性があります。

### 悲観的モード {#the-pessimistic-mode}

上流のシャードテーブルが DDL ステートメントを実行すると、このシャードテーブルの移行は一時停止されます。他のすべてのシャードテーブルが同じ DDL を実行した後、DDL はダウンストリームで実行され、データ移行タスクが再開されます。このモードの利点は、ダウンストリームに移行されたデータに問題が発生しないことを保証できることです。詳細は[悲観的モードでのシャードのマージ](/dm/feature-shard-merge-pessimistic.md)を参照してください。

### 楽観的モード {#the-optimistic-mode}

DM は、シャード テーブルで実行される DDL を他のシャード テーブルと互換性のあるステートメントに自動的に変更し、ダウンストリームに移行します。これにより、シャード化されたテーブルの DML 移行がブロックされることはありません。このモードの利点は、DDL の処理時にデータの移行をブロックしないことです。ただし、不適切に使用すると、移行が中断されたり、データの不整合が発生したりすることがあります。詳細は[楽観的モードでのシャードマージ](/dm/feature-shard-merge-optimistic.md)を参照してください。

### 対比 {#contrast}

| 悲観的モード                                      | 楽観的モード                                                                         |
| :------------------------------------------ | :----------------------------------------------------------------------------- |
| DDL を実行するシャードテーブルは DML 移行を一時停止します           | DDL を実行するシャードテーブルは DML 移行を続行します                                                |
| 各シャードテーブルの DDL 実行順序とステートメントは同じである必要があります    | 各シャードテーブルは、テーブルスキーマの相互互換性を維持することのみが必要です。                                       |
| シャード グループ全体の一貫性が保たれた後、DDL がダウンストリームに移行されます。 | 各シャードテーブルの DDL は、ダウンストリームに直ちに影響します。                                            |
| 誤った DDL 操作は検出後に阻止される可能性があります                | 間違った DDL 操作はダウンストリームに移行され、検出される前にアップストリーム データとダウンストリーム データの間で不整合が発生する可能性があります。 |