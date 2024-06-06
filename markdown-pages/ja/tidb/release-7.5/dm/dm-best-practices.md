---
title: TiDB Data Migration (DM) Best Practices
summary: TiDB データ移行 (DM) は、MySQL 互換データベースから TiDB への完全および増分データ移行をサポートします。DM を使用する際のよくある間違いを回避する方法を紹介します。DM は 1000 の作業ノードの同時管理をサポートし、タスクの最大数は 600 です。データ移行の際には、データの整合性を検証することをお勧めします。
---

# TiDB データ移行 (DM) のベスト プラクティス {#tidb-data-migration-dm-best-practices}

[TiDB データ移行 (DM)](https://github.com/pingcap/tiflow/tree/release-7.5/dm)は、PingCAP によって開発されたデータ移行ツールです。 MySQL、Percona MySQL、MariaDB、Amazon RDS for MySQL、Amazon Auroraなどの MySQL 互換データベースから TiDB への完全および増分データ移行をサポートします。

DM は次のシナリオで使用できます。

-   単一の MySQL 互換データベース インスタンスから TiDB への完全および増分データ移行を実行する
-   小規模なデータセット (1 TiB 未満) の MySQL シャードを TiDB に移行およびマージします。
-   ビジネスデータのミドルプラットフォームやビジネスデータのリアルタイム集約などのデータハブシナリオでは、データ移行のミドルウェアとしてDMを使用します

このドキュメントでは、DM をエレガントかつ効率的に使用する方法と、DM を使用する際のよくある間違いを回避する方法を紹介します。

## パフォーマンスの制限 {#performance-limitations}

| 性能アイテム         |        制限       |
| -------------- | :-------------: |
| 最大作業ノード数       |       1000      |
| 最大タスク数         |       600       |
| 最大QPS          | 30,000 QPS/ワーカー |
| 最大Binlogスループット |   20 MB/秒/ワーカー  |
| タスクごとのテーブル数の制限 |       無制限       |

-   DM は 1000 の作業ノードの同時管理をサポートし、タスクの最大数は 600 です。作業ノードの高可用性を確保するには、いくつかの作業ノードをスタンバイ ノードとして予約する必要があります。推奨されるスタンバイ ノードの数は、移行タスクを実行している作業ノードの数の 20% ～ 50% です。
-   理論的には、単一の作業ノードはワーカーあたり最大 30,000 QPS のレプリケーション QPS をサポートできます。これはスキーマやワークロードによって異なります。アップストリームのバイナリログを処理できる能力は、ワーカーあたり最大 20 MB/秒です。
-   DM をデータ レプリケーション ミドルウェアとして長期間使用する場合は、DM コンポーネントのデプロイメントアーキテクチャを慎重に設計する必要があります。詳細については、 [DM マスターと DM ワーカーをデプロイ](#deploy-dm-master-and-dm-worker)を参照してください。

## データ移行前 {#before-data-migration}

データ移行の前に、ソリューション全体の設計が重要です。次のセクションでは、ビジネスの観点と実装の観点からのベスト プラクティスとシナリオについて説明します。

### ビジネス側のベストプラクティス {#best-practices-for-the-business-side}

ワークロードを複数のノードに均等に分散するために、分散データベースの設計は従来のデータベースとは異なります。このソリューションでは、低い移行コストと移行後のロジックの正確性の両方を保証する必要があります。次のセクションでは、データ移行前のベスト プラクティスについて説明します。

#### スキーマ設計における AUTO_INCREMENT のビジネスへの影響 {#business-impact-of-auto-increment-in-schema-design}

TiDB の`AUTO_INCREMENT` MySQL の`AUTO_INCREMENT`と互換性があります。ただし、分散データベースとして、TiDB には通常、複数のコンピューティング ノード (クライアント エンドのエントリ) があります。アプリケーション データが書き込まれるとき、ワークロードは均等に分散されます。これにより、テーブルに`AUTO_INCREMENT`の列がある場合、その列の自動インクリメント ID が不連続になる可能性があります。詳細については、 [自動増加](/auto-increment.md#implementation-principles)を参照してください。

ビジネスが自動インクリメント ID に強く依存している場合は、 [シーケンス機能](/sql-statements/sql-statement-create-sequence.md#sequence-function)の使用を検討してください。

#### クラスター化インデックスの使用法 {#usage-of-clustered-indexes}

テーブルを作成するときに、主キーがクラスター化インデックスまたは非クラスター化インデックスのいずれかであることを宣言できます。次のセクションでは、それぞれの選択の長所と短所について説明します。

-   クラスター化インデックス

    [クラスター化インデックス](/clustered-indexes.md)データstorageのハンドル ID (行 ID) として主キーを使用します。主キーを使用してクエリを実行すると、テーブルの検索を回避できるため、クエリのパフォーマンスが効果的に向上します。ただし、テーブルが書き込み集中型で主キーが[`AUTO_INCREMENT`](/auto-increment.md)使用している場合は、 [書き込みホットスポットの問題](/best-practices/high-concurrency-best-practices.md#highly-concurrent-write-intensive-scenario)発生する可能性が非常に高く、その結果、クラスターのパフォーマンスが中程度になり、単一のstorageノードのパフォーマンスのボトルネックが発生します。

-   非クラスター化インデックス + `shard row id bit`

    非クラスター化インデックスと`shard row id bit`を使用すると、 `AUTO_INCREMENT`使用する場合の書き込みホットスポットの問題を回避できます。ただし、このシナリオでのテーブル検索は、主キーを使用してクエリを実行する場合のクエリのパフォーマンスに影響を与える可能性があります。

-   クラスター化インデックス + 外部分散 ID ジェネレーター

    クラスター化インデックスを使用し、ID を連続的に保ちたい場合は、Snowflake アルゴリズムや Leaf などの外部分散 ID ジェネレーターの使用を検討してください。アプリケーションプログラムはシーケンス ID を生成します。これにより、ID がある程度連続していることが保証されます。また、クラスター化インデックスを使用する利点も維持されます。ただし、アプリケーションをカスタマイズする必要があります。

-   クラスター化インデックス + `AUTO_RANDOM`

    このソリューションでは、クラスター化インデックスを使用する利点を維持し、書き込みホットスポットの問題を回避できます。カスタマイズに必要な労力が少なくなります。 TiDB を書き込みデータベースとして使用するように切り替えるときに、スキーマ属性を変更できます。後続のクエリで、ID 列を使用してデータを並べ替える必要がある場合は、 [`AUTO_RANDOM`](/auto-random.md) ID 列を使用して 5 ビット左シフトし、クエリ データの順序を確保できます。例えば：

    ```sql
    CREATE TABLE t (a bigint PRIMARY KEY AUTO_RANDOM, b varchar(255));
    Select a, a<<5 ,b from t order by a <<5 desc
    ```

次の表は、各ソリューションの長所と短所をまとめたものです。

| シナリオ                                                                                   | 推奨されるソリューション                                                                                | 長所                                                                                                               | 短所                                                                                                                                                                                 |
| :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <li>TiDB は、書き込み集中型のプライマリ データベースとして機能します。</li><li>ビジネス ロジックは、主キー ID の連続性に大きく依存します。</li> | 非クラスター化インデックスを使用してテーブルを作成し、 `SHARD_ROW_ID_BIT`を設定します。主キー列として`SEQUENCE`を使用します。               | データ書き込みのホットスポットを回避し、ビジネス データの連続性と単調な増加を保証できます。                                                                   | <li>データ書き込みの継続性を確保するために、データ書き込みのスループット容量が低下します。</li><li>主キークエリのパフォーマンスが低下します。</li>                                                                                                 |
| <li>TiDB は、書き込み集中型のプライマリ データベースとして機能します。</li><li>ビジネス ロジックは主キー ID の増加に大きく依存します。</li>   | 非クラスター化インデックスを使用してテーブルを作成し、 `SHARD_ROW_ID_BIT`を設定します。アプリケーション ID ジェネレーターを使用して主キー ID を生成します。 | データ書き込みのホットスポットを回避し、データ書き込みのパフォーマンスを保証し、ビジネス データの増加を保証できますが、継続性は保証できません。                                         | <li>アプリケーションをカスタマイズする必要があります。</li><li>外部 ID ジェネレーターはクロックの精度に大きく依存しているため、障害が発生する可能性があります。</li>                                                                                      |
| <li>TiDB は、書き込み集中型のプライマリ データベースとして機能します。</li><li>ビジネス ロジックは主キー ID の連続性に依存しません。</li>    | クラスター化インデックスを含むテーブルを作成し、主キー列に`AUTO_RANDOM`を設定します。                                           | <li>データ書き込みホットスポットを回避でき、主キーのクエリ パフォーマンスが優れています。</li><li> `AUTO_INCREMENT`から`AUTO_RANDOM`へスムーズに切り替えることができます。</li> | <li>主キー ID はランダムです。</li><li>書き込みスループット能力には制限があります。</li><li>ビジネス データは、挿入時刻列を使用して並べ替えることをお勧めします。</li><li>データの並べ替えに主キー ID を使用する必要がある場合は、5 ビットを左シフトしてクエリを実行でき、これによりデータの増分が保証されます。</li> |
| TiDB は読み取り専用データベースとして機能します。                                                            | 非クラスター化インデックスを使用してテーブルを作成し、 `SHARD_ROW_ID_BIT`を設定します。主キー列とデータ ソースの一貫性を維持します。                | <li>データ書き込みのホットスポットを回避できます。</li><li>カスタマイズコストが少なくて済みます。</li>                                                     | 主キーのクエリのパフォーマンスが影響を受けます。                                                                                                                                                           |

### MySQL シャードの重要なポイント {#key-points-for-mysql-shards}

#### 分割と結合 {#splitting-and-merging}

[小規模なデータセットの MySQL シャードを TiDB に移行およびマージする](/migrate-small-mysql-shards-to-tidb.md)への DM を使用することをお勧めします。

データのマージのほかに、もう 1 つの典型的なシナリオはデータのアーカイブです。データは常に書き込まれ続けます。時間が経つにつれて、大量のデータはホット データからウォーム データ、さらにはコールド データに徐々に変化します。幸いなことに、TiDB ではデータに異なる[配置ルール](/configure-placement-rules.md)を設定できます。ルールの最小粒度は[パーティション](/partitioned-table.md)です。

したがって、書き込み集中型のシナリオでは、データをアーカイブし、ホット データとコールド データを異なるメディアに別々に保存する必要があるかどうかを最初から評価する必要があることをお勧めします。データをアーカイブする必要がある場合は、移行前にパーティション化ルールを設定できます (TiDB はテーブル再構築操作をまだサポートしていません)。これにより、今後テーブルを再作成したりデータをインポートしたりする必要がなくなります。

#### 悲観的モードと楽観的モード {#the-pessimistic-mode-and-the-optimistic-mode}

DM はデフォルトで悲観的モードを使用します。 MySQL シャードの移行およびマージのシナリオでは、アップストリーム シャード スキーマの変更により、ダウンストリーム データベースへの DML 書き込みがブロックされる可能性があります。すべてのスキーマが変更されて同じ構造になるまで待ってから、ブレークポイントから移行を続行する必要があります。

-   上流のスキーマ変更に長い時間がかかると、上流のBinlog がクリーンアップされる可能性があります。この問題を回避するには、リレー ログを有効にすることができます。詳細については、 [リレーログを使用する](#use-the-relay-log)を参照してください。

-   上流のスキーマ変更によりデータ書き込みをブロックしたくない場合は、楽観的モードの使用を検討してください。この場合、DM は上流のシャード スキーマの変更を検出した場合でもデータ移行をブロックせず、データの移行を続行します。ただし、DM がアップストリームとダウンストリームで互換性のない形式を検出した場合、移行タスクは停止します。この問題は手動で解決する必要があります。

次の表は、楽観的モードと悲観的モードの長所と短所をまとめたものです。

| シナリオ           | 長所                                      | 短所                                                                                                                                                                                            |
| :------------- | :-------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 悲観的モード (デフォルト) | ダウンストリームに移行されたデータに問題が発生しないことを保証できます。    | 多数のシャードがある場合、移行タスクは長時間ブロックされるか、上流のバイナリログがクリーンアップされている場合には停止することもあります。この問題を回避するには、リレー ログを有効にすることができます。詳細については、「リレーログを使用する」(#use-therelay-log)を参照してください。                                        |
| 楽観的モード         | 上流のスキーマ変更によってデータ移行のレイテンシーが発生することはありません。 | このモードでは、スキーマの変更に互換性があることを確認します (増分列にデフォルト値があるかどうかを確認します)。矛盾したデータが見落とされる可能性があります。詳細については、 [オプティミスティックモードでのシャードテーブルからのデータのマージと移行](/dm/feature-shard-merge-optimistic.md#restrictions)を参照してください。 |

### その他の制限と影響 {#other-restrictions-and-impact}

#### アップストリームとダウンストリームのデータ型 {#data-types-in-upstream-and-downstream}

TiDB はほとんどの MySQL データ型をサポートします。ただし、一部の特殊な型はまだサポートされていません ( `SPATIAL`など)。データ型の互換性については、 [データ型](/data-type-overview.md)を参照してください。

#### 文字セットと照合順序 {#character-sets-and-collations}

TiDB v6.0.0 以降、照合順序の新しいフレームワークがデフォルトで使用されます。以前のバージョンでは、TiDB で utf8_general_ci、utf8mb4_general_ci、utf8_unicode_ci、utf8mb4_unicode_ci、gbk_chinese_ci、gbk_bin をサポートしたい場合は、クラスターの作成時に`new_collations_enabled_on_first_bootstrap`から`true`の値を設定して明示的に宣言する必要がありました。詳細については、 [照合順序の新しいフレームワーク](/character-set-and-collation.md#new-framework-for-collations)を参照してください。

TiDB のデフォルトの文字セットは utf8mb4 です。アップストリームおよびダウンストリームのデータベースおよびアプリケーションには utf8mb4 を使用することをお勧めします。上流のデータベースが文字セットまたは照合順序を明示的に指定している場合は、TiDB がそれをサポートしているかどうかを確認する必要があります。

TiDB v6.0.0 以降、GBK がサポートされています。詳細については、次のドキュメントを参照してください。

-   [文字セットと照合順序](/character-set-and-collation.md)
-   [GBKの互換性](/character-set-gbk.md#mysql-compatibility)

### 導入のベストプラクティス {#best-practices-for-deployment}

#### DM マスターと DM ワーカーをデプロイ {#deploy-dm-master-and-dm-worker}

DM は、DM マスター ノードと DM ワーカー ノードで構成されます。

-   DM マスターは、移行タスクのメタデータを管理し、DM ワーカー ノードをスケジュールします。これは DM プラットフォーム全体の中核です。したがって、DM マスターをクラスターとして展開して、DM プラットフォームの高可用性を確保できます。

-   DM ワーカーは、上流および下流の移行タスクを実行します。 DM ワーカー ノードはステートレスです。最大 1000 の DM ワーカー ノードをデプロイできます。 DM を使用する場合、高可用性を確保するために、アイドル状態の DM ワーカーをいくつか予約しておくことをお勧めします。

#### 移行タスクを計画する {#plan-the-migration-tasks}

MySQL シャードを移行およびマージする場合、アップストリームのシャードのタイプに応じて移行タスクを分割できます。たとえば、 `usertable_1~50`と`Logtable_1~50`が 2 種類のシャードである場合、2 つの移行タスクを作成できます。これにより、移行タスク テンプレートが簡素化され、データ移行の中断による影響を効果的に制御できます。

大規模なデータセットを移行する場合は、次の提案を参照して移行タスクを分割できます。

-   アップストリームで複数のデータベースを移行する必要がある場合は、データベースの数に応じて移行タスクを分割できます。

-   アップストリームでの書き込みプレッシャーに応じてタスクを分割します。つまり、アップストリームで頻繁に DML 操作が行われるテーブルを別の移行タスクに分割します。別の移行タスクを使用して、頻繁な DML 操作を行わずにテーブルを移行します。この方法を使用すると、特にアップストリームのテーブルに大量のログが書き込まれる場合に、移行の進行をスピードアップできます。ただし、大量のログが含まれるこのテーブルがビジネス全体に影響を与えない場合、この方法は引き続き有効です。

移行タスクを分割することで保証できるのは、データの最終的な整合性だけであることに注意してください。リアルタイムの一貫性は、さまざまな理由により大幅に逸脱する可能性があります。

次の表では、さまざまなシナリオにおける DM マスターと DM ワーカーの推奨される展開計画を説明します。

| シナリオ                                                                       | DMマスターの展開                                                                                | DM ワーカーの展開                                                                                               |
| :------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| <li>小規模なデータセット (1 TiB 未満)</li><li> 1 回限りのデータ移行</li>                        | 1 つの DM マスター ノードをデプロイ                                                                    | 上流データソースの数に応じて、1 ～ N 個の DM ワーカー ノードをデプロイ。通常、1 つの DM ワーカー ノードが推奨されます。                                     |
| <li>大規模なデータセット (1 TiB を超える) と MySQL シャードの移行およびマージ</li><li>1 回限りのデータ移行</li> | 長時間のデータ移行中に DM クラスターの可用性を確保するには、3 つの DM マスター ノードをデプロイすることをお勧めします。                        | データ ソースまたは移行タスクの数に応じて DM ワーカー ノードをデプロイ。動作中の DM ワーカー ノードのほかに、アイドル状態の DM ワーカー ノードを 1 ～ 3 つデプロイすることをお勧めします。 |
| 長期的なデータレプリケーション                                                            | DMマスターノードを3台導入する必要があります。 DM マスター ノードをクラウド上にデプロイする場合は、異なるアベイラビリティ ゾーン (AZ) にデプロイしてみてください。 | データ ソースまたは移行タスクの数に応じて DM ワーカー ノードをデプロイ。実際に必要なDMワーカーノードの1.5～2倍のノードを導入する必要があります。                           |

#### アップストリーム データ ソースの選択と構成 {#choose-and-configure-the-upstream-data-source}

DM は、完全データ移行を実行するときにデータベース全体の完全データをバックアップし、並列論理バックアップ方式を使用します。 MySQL のバックアップ中に、グローバル読み取りロック[`FLUSH TABLES WITH READ LOCK`](https://dev.mysql.com/doc/refman/8.0/en/flush.html#flush-tables-with-read-lock)が追加されます。アップストリーム データベースの DML および DDL 操作は、短期間ブロックされます。したがって、アップストリームでバックアップ データベースを使用して完全なデータ バックアップを実行し、データ ソースの GTID 機能を有効にすることを強くお勧めします ( `enable-gtid: true` )。このようにして、アップストリームからの影響を回避し、アップストリームのマスター ノードに切り替えることで、増分移行中のレイテンシーを短縮できます。上流の MySQL データ ソースを切り替える手順については、 [アップストリーム MySQL インスタンス間の DM ワーカー接続を切り替える](/dm/usage-scenario-master-slave-switch.md#switch-dm-worker-connection-via-virtual-ip)を参照してください。

次の点に注意してください。

-   完全データのバックアップは、アップストリーム データベースのマスター ノードでのみ実行できます。

    このシナリオでは、構成ファイル`mydumpers.global.extra-args: "--consistency none"`で`consistency`パラメーターを`none`に設定して、マスター ノードへのグローバル読み取りロックの追加を回避できます。ただし、これは完全バックアップのデータの一貫性に影響を与える可能性があり、アップストリームとダウンストリームの間でデータの不整合が生じる可能性があります。

-   バックアップ スナップショットを使用して完全なデータ移行を実行します (AWS 上の MySQL RDS およびAurora RDS の移行にのみ適用されます)

    移行するデータベースが AWS MySQL RDS またはAurora RDS の場合、RDS スナップショットを使用して Amazon S3 のバックアップ データを TiDB に直接移行し、データの整合性を確保できます。詳細については、 [Amazon Auroraから TiDB へのデータの移行](/migrate-aurora-to-tidb.md)を参照してください。

### 構成の詳細 {#details-of-configurations}

#### 大文字の使用 {#capitalization}

TiDB スキーマ名は、デフォルトでは大文字と小文字が区別されません`lower_case_table_names:2` 。ただし、アップストリームの MySQL データベースのほとんどは、デフォルトで大文字と小文字を区別する Linux システムを使用しています。この場合、スキーマを上流から正しく移行できるように、DM タスク構成ファイルで`case-sensitive`から`true`設定する必要があります。

特殊なケースとして、たとえば、 `Table`などの大文字のテーブルと`table`などの小文字のテーブルの両方を持つデータベースがアップストリームにある場合、スキーマの作成時にエラーが発生します。

`ERROR 1050 (42S01): Table '{tablename}' already exists`

#### フィルタルール {#filter-rules}

データ ソースの構成を開始するとすぐにフィルター ルールを構成できます。詳細については、 [データ移行タスクコンフィグレーションガイド](/dm/dm-task-configuration-guide.md)を参照してください。フィルター ルールを構成する利点は次のとおりです。

-   ダウンストリームが処理する必要があるBinlogイベントの数を減らすことで、移行効率が向上します。
-   不要なリレー ログstorageを削減し、ディスク領域を節約します。

> **注記：**
>
> MySQL シャードを移行およびマージするときに、データ ソースでフィルター ルールを構成している場合は、データ ソースと移行タスクの間でルールが一致していることを確認する必要があります。一致しない場合、移行タスクが長時間増分データを受信できないという問題が発生する可能性があります。

#### リレーログを使用する {#use-the-relay-log}

MySQL マスター/スタンバイ メカニズムでは、スタンバイ ノードがリレー ログのコピーを保存して、非同期レプリケーションの信頼性と効率を確保します。 DM は、DM ワーカーでのリレー ログのコピーの保存もサポートしています。storage場所や有効期限などの情報を設定できます。この機能は次のシナリオに適用されます。

-   完全データおよび増分データの移行中、完全データの量が多い場合、プロセス全体に上流のバイナリログがアーカイブされる時間よりも時間がかかります。これにより、増分レプリケーション タスクが正常に開始できなくなります。リレー ログを有効にすると、完全な移行の開始時に DM ワーカーはリレー ログの受信を開始します。これにより、増分タスクの失敗が回避されます。

-   DM を使用して長時間のデータ レプリケーションを実行すると、さまざまな理由により移行タスクが長時間ブロックされることがあります。リレー ログを有効にすると、移行タスクのブロックによりアップストリームのバイナリ ログがリサイクルされる問題に効果的に対処できます。

リレーログの使用にはいくつかの制限があります。 DM は高可用性をサポートします。 DM ワーカーに障害が発生すると、アイドル状態の DM ワーカー インスタンスを動作中のインスタンスに昇格させようとします。アップストリームのバイナリログに必要な移行ログが含まれていない場合、中断が発生する可能性があります。手動で介入して、できるだけ早くリレー ログを新しい DM ワーカー ノードにコピーし、対応するリレー メタ ファイルを変更する必要があります。詳細は[トラブルシューティング](/dm/dm-error-handling.md#the-relay-unit-throws-error-event-from--in--diff-from-passed-in-event--or-a-migration-task-is-interrupted-with-failing-to-get-or-parse-binlog-errors-like-get-binlog-error-error-1236-hy000-and-binlog-checksum-mismatch-data-may-be-corrupted-returned)を参照してください。

#### アップストリームで PT-osc/GH-ost を使用する {#use-pt-osc-gh-ost-in-upstream}

MySQL の日常的な運用と保守では、通常、PT-osc/GH-ost などのツールを使用してオンラインでスキーマを変更し、ビジネスへの影響を最小限に抑えます。ただし、プロセス全体は MySQL Binlogに記録されます。このようなデータを TiDB ダウンストリームに移行すると、多くの不必要な書き込み操作が発生し、効率的でも経済的でもありません。

この問題を解決するために、DM は移行タスクを構成するときに PT-osc や GH-ost などのサードパーティ データ ツールをサポートします。このようなツールを使用すると、DM は冗長データを移行せず、データの一貫性を確保します。詳細は[GH-ost/PT-osc を使用するデータベースからの移行](/dm/feature-online-ddl.md)を参照してください。

## 移行時のベスト プラクティス {#best-practices-during-migration}

このセクションでは、移行中に発生する可能性のある問題のトラブルシューティング方法を紹介します。

### 上流と下流で一貫性のないスキーマ {#inconsistent-schemas-in-upstream-and-downstream}

一般的なエラーには次のようなものがあります。

-   `messages: Column count doesn't match value count: 3 (columns) vs 2 (values)`
-   `Schema/Column doesn't match`

通常、このような問題は、ダウンストリーム TiDB でインデックスが変更または追加されたか、ダウンストリームに列が増えたことが原因で発生します。このようなエラーが発生した場合は、上流と下流のスキーマに矛盾がないか確認してください。

このような問題を解決するには、DM にキャッシュされたスキーマ情報を更新して、ダウンストリーム TiDB スキーマと一致するようにします。詳細は[移行するテーブルのテーブルスキーマを管理する](/dm/dm-manage-schema.md)を参照してください。

下流にさらに多くの列がある場合は、 [より多くの列を含むダウンストリーム TiDB テーブルにデータを移行する](/migrate-with-more-columns-downstream.md)を参照してください。

### DDL の失敗により移行タスクが中断されました {#interrupted-migration-task-due-to-failed-ddl}

DM は、移行タスクの中断を引き起こす DDL ステートメントのスキップまたは置換をサポートしています。詳細は[失敗した DDL ステートメントの処理](/dm/handle-failed-ddl-statements.md#usage-examples)を参照してください。

## データ移行後のデータ検証 {#data-validation-after-data-migration}

データ移行後にデータの整合性を検証することをお勧めします。 TiDB は、データ検証を完了するのに役立つ[同期差分インスペクター](/sync-diff-inspector/sync-diff-inspector-overview.md)を提供します。

sync-diff-inspector は、DM タスクを通じてデータの整合性をチェックするテーブル リストを自動的に管理できるようになりました。以前の手動構成と比較して、より効率的です。詳細は[DM レプリケーション シナリオでのデータ チェック](/sync-diff-inspector/dm-diff.md)を参照してください。

DM v6.2.0 以降、DM は増分レプリケーションの継続的なデータ検証をサポートしています。詳細は[DM での継続的なデータ検証](/dm/dm-continuous-data-validation.md)を参照してください。

## 長期的なデータレプリケーション {#long-term-data-replication}

DM を使用して長期的なデータ複製タスクを実行する場合は、メタデータをバックアップする必要があります。一方で、移行クラスターを再構築できるようになります。一方、移行タスクのバージョン管理を実装できます。詳細は[データソースのエクスポートとインポート、およびクラスターのタスクコンフィグレーション](/dm/dm-export-import-config.md)を参照してください。