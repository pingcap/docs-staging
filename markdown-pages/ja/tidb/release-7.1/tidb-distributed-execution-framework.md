---
title: TiDB Backend Task Distributed Execution Framework
summary: Learn the use cases, limitations, usage, and implementation principles of the TiDB backend task distributed execution framework.
---

# TiDB バックエンド タスク分散実行フレームワーク {#tidb-backend-task-distributed-execution-framework}

> **警告：**
>
> この機能は実験的機能です。本番環境での使用はお勧めできません。

<CustomContent platform="tidb-cloud">

> **注記：**
>
> 現在、この機能は TiDB 専用クラスターにのみ適用されます。 TiDB サーバーレス クラスターでは使用できません。

</CustomContent>

TiDB は、優れた拡張性と弾力性を備えたコンピューティングとストレージの分離アーキテクチャを採用しています。 TiDB v7.1.0 以降、分散アーキテクチャのリソースの利点をさらに活用するために、バックエンド タスクの分散実行フレームワークが導入されています。このフレームワークの目標は、すべてのバックエンド タスクの統合スケジューリングと分散実行を実装し、全体と個別のバックエンド タスクの両方に統合リソース管理機能を提供して、リソース使用量に対するユーザーの期待をより適切に満たすことです。

このドキュメントでは、TiDB バックエンド タスク分散実行フレームワークのユース ケース、制限事項、使用法、実装原則について説明します。

> **注記：**
>
> このフレームワークは、SQL クエリの分散実行をサポートしていません。

## 使用例と制限事項 {#use-cases-and-limitations}

データベース管理システムには、コアのトランザクション処理 (TP) および分析処理 (AP) ワークロードに加えて、DDL 操作、データのロード、TTL、分析、バックアップ/復元などの他の重要なタスクがあります。**バックエンドタスク**。これらのバックエンド タスクはデータベース オブジェクト (テーブル) 内の大量のデータを処理する必要があるため、通常は次のような特性があります。

-   スキーマまたはデータベース オブジェクト (テーブル) 内のすべてのデータを処理する必要があります。
-   定期的に実行する必要がある場合がありますが、頻度は低くなります。
-   リソースが適切に制御されていない場合、TP および AP タスクに影響を及ぼし、データベース サービスの品質が低下する可能性があります。

TiDB バックエンド タスク分散実行フレームワークを有効にすると、上記の問題を解決でき、次の 3 つの利点があります。

-   このフレームワークは、高スケーラビリティ、高可用性、および高パフォーマンスのための統合機能を提供します。
-   このフレームワークはバックエンド タスクの分散実行をサポートしており、TiDB クラスター全体の利用可能なコンピューティング リソースを柔軟にスケジュールできるため、TiDB クラスター内のコンピューティング リソースをより有効に活用できます。
-   このフレームワークは、バックエンド タスク全体と個別の両方に対して、統合されたリソースの使用と管理機能を提供します。

現在、TiDB バックエンド タスク分散実行フレームワークは、 `ADD INDEX`ステートメント、つまりインデックスを作成するための DDL ステートメントの分散実行のみをサポートしています。たとえば、次の SQL ステートメントがサポートされています。

```sql
ALTER TABLE t1 ADD INDEX idx1(c1);
CREATE INDEX idx1 ON table t1(c1);
```

現在、TiDB セルフホストの場合、DXF は`ADD INDEX`ステートメントの分散実行をサポートしています。

-   `ADD INDEX`はインデックスの作成に使用される DDL ステートメントです。例えば：

    ```sql
    ALTER TABLE t1 ADD INDEX idx1(c1);
    CREATE INDEX idx1 ON table t1(c1);
    ```

## 制限 {#limitation}

-   DXF は、一度に`ADD INDEX`のタスクの分散実行のみをスケジュールできます。現在の`ADD INDEX`分散タスクが終了する前に新しい`ADD INDEX`タスクが送信された場合、その新しいタスクはトランザクションを通じて実行されます。
-   DXF を使用して`TIMESTAMP`データ型の列にインデックスを追加することは、インデックスとデータの間で不整合が生じる可能性があるため、サポートされていません。

## 前提条件 {#prerequisites}

分散フレームワークを使用する前に、 [高速オンライン DDL](/system-variables.md#tidb_ddl_enable_fast_reorg-new-in-v630)モードを有効にする必要があります。

<CustomContent platform="tidb">

1.  Fast Online DDL に関連する次のシステム変数を調整します。

    -   [`tidb_ddl_enable_fast_reorg`](/system-variables.md#tidb_ddl_enable_fast_reorg-new-in-v630) : Fast Online DDL モードを有効にするために使用されます。 TiDB v6.5.0 以降、デフォルトで有効になっています。
    -   [`tidb_ddl_disk_quota`](/system-variables.md#tidb_ddl_disk_quota-new-in-v630) : Fast Online DDL モードで使用できるローカル ディスクの最大クォータを制御するために使用されます。

2.  Fast Online DDL に関連する次の構成項目を調整します。

    -   [`temp-dir`](/tidb-configuration-file.md#temp-dir-new-in-v630) : Fast Online DDL モードで使用できるローカル ディスク パスを指定します。

> **注記：**
>
> TiDB を v6.5.0 以降にアップグレードする前に、TiDB の[`temp-dir`](/tidb-configuration-file.md#temp-dir-new-in-v630)パスが SSD ディスクに正しくマウントされているかどうかを確認することをお勧めします。 TiDB を実行するオペレーティング システム ユーザーが、このディレクトリに対する読み取りおよび書き込み権限を持っていることを確認してください。そうしないと、DDL 操作で予期しない問題が発生する可能性があります。このパスは TiDB 構成アイテムであり、TiDB の再起動後に有効になります。したがって、アップグレード前にこの構成項目を事前に設定しておくと、再度の再起動を回避できます。

</CustomContent>

<CustomContent platform="tidb-cloud">

Fast Online DDL に関連する次のシステム変数を調整します。

-   [`tidb_ddl_enable_fast_reorg`](/system-variables.md#tidb_ddl_enable_fast_reorg-new-in-v630) : Fast Online DDL モードを有効にするために使用されます。 TiDB v6.5.0 以降、デフォルトで有効になっています。
-   [`tidb_ddl_disk_quota`](/system-variables.md#tidb_ddl_disk_quota-new-in-v630) : Fast Online DDL モードで使用できるローカル ディスクの最大クォータを制御するために使用されます。

</CustomContent>

## 使用法 {#usage}

1.  分散フレームワークを有効にするには、値[`tidb_enable_dist_task`](/system-variables.md#tidb_enable_dist_task-new-in-v710)から`ON`を設定します。

    ```sql
    SET GLOBAL tidb_enable_dist_task = ON;
    ```

    バックエンド タスクの実行中、フレームワークによってサポートされる DDL ステートメントは分散方式で実行されます。

2.  必要に応じて、DDL タスクの分散実行に影響を与える可能性がある次のシステム変数を調整します。

    -   [`tidb_ddl_reorg_worker_cnt`](/system-variables.md#tidb_ddl_reorg_worker_cnt) : デフォルト値`4`を使用します。推奨される最大値は`16`です。
    -   [`tidb_ddl_reorg_priority`](/system-variables.md#tidb_ddl_reorg_priority)
    -   [`tidb_ddl_error_count_limit`](/system-variables.md#tidb_ddl_error_count_limit)
    -   [`tidb_ddl_reorg_batch_size`](/system-variables.md#tidb_ddl_reorg_batch_size) : デフォルト値を使用します。推奨される最大値は`1024`です。

> **ヒント：**
>
> `ADD INDEX`ステートメントの分散実行の場合、 `tidb_ddl_reorg_worker_cnt`を設定するだけで済みます。

## 実装原則 {#implementation-principles}

TiDB バックエンド タスク分散実行フレームワークのアーキテクチャは次のとおりです。

![Architecture of the TiDB backend task distributed execution framework](https://docs-download.pingcap.com/media/images/docs/dist-task/dist-task-architect.jpg)

上の図に示すように、分散フレームワークにおけるバックエンド タスクの実行は、主に次のモジュールによって処理されます。

-   ディスパッチャー: 各タスクの分散実行計画を生成し、実行プロセスを管理し、タスクのステータスを変換し、実行時タスク情報を収集してフィードバックします。
-   スケジューラ: TiDB ノード間で分散タスクの実行を複製し、バックエンド タスクの実行効率を向上させます。
-   サブタスク実行者: 分散サブタスクの実際の実行者。また、Subtask Executorはサブタスクの実行状況をSchedulerに返し、Schedulerはサブタスクの実行状況を一元的に更新します。
-   リソース プール: 上記のモジュールのコンピューティング リソースをプールすることで、リソースの使用量と管理を定量化するための基礎を提供します。

## こちらも参照 {#see-also}

<CustomContent platform="tidb">

-   [DDL ステートメントの実行原則とベスト プラクティス](/ddl-introduction.md)

</CustomContent>
<CustomContent platform="tidb-cloud">

-   [DDL ステートメントの実行原則とベスト プラクティス](https://docs.pingcap.com/tidb/stable/ddl-introduction)

</CustomContent>
