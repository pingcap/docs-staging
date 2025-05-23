---
title: TiDB Data Migration (DM) Best Practices
summary: TiDB データ移行 (DM) を使用してデータを移行する場合のベスト プラクティスについて説明します。
---

# TiDB データ移行 (DM) のベスト プラクティス {#tidb-data-migration-dm-best-practices}

[TiDB データ移行 (DM)](https://github.com/pingcap/tiflow/tree/release-8.5/dm) 、PingCAP が開発したデータ移行ツールです。MySQL、Percona MySQL、MariaDB、Amazon RDS for MySQL、Amazon Auroraなどの MySQL 互換データベースから TiDB への完全および増分データ移行をサポートします。

DM は次のシナリオで使用できます。

-   単一のMySQL互換データベースインスタンスからTiDBへの完全および増分データ移行を実行します。
-   小さなデータセット（1 TiB 未満）の MySQL シャードを TiDB に移行してマージする
-   ビジネスデータの中間プラットフォームやビジネスデータのリアルタイム集約などのデータハブシナリオでは、データ移行のミドルウェアとしてDMを使用します。

このドキュメントでは、DM をエレガントかつ効率的に使用する方法と、DM を使用する際によくある間違いを避ける方法について説明します。

## パフォーマンスの制限 {#performance-limitations}

| パフォーマンス項目      |      制限      |
| -------------- | :----------: |
| 最大作業ノード数       |     1000     |
| 最大タスク数         |      600     |
| 最大QPS          | 30k QPS/ワーカー |
| 最大Binlogスループット | 20 MB/秒/ワーカー |
| タスクごとのテーブル数の制限 |      無制限     |

-   DM は 1000 個の作業ノードを同時に管理することをサポートしており、タスクの最大数は 600 です。作業ノードの高可用性を確保するには、一部の作業ノードをスタンバイ ノードとして予約する必要があります。スタンバイ ノードの推奨数は、移行タスクが実行中の作業ノードの数の 20% ～ 50% です。
-   単一のワークノードは、理論的にはワーカーあたり最大 30K QPS のレプリケーション QPS をサポートできます。これはスキーマやワークロードによって異なります。アップストリーム バイナリログを処理する能力は、ワーカーあたり最大 20 MB/秒です。
-   DMをデータレプリケーションミドルウェアとして長期使用する場合、DMコンポーネントのデプロイメントアーキテクチャを慎重に設計する必要があります。詳細については、 [DMマスターとDMワーカーをデプロイ](#deploy-dm-master-and-dm-worker)参照してください。

## データ移行前 {#before-data-migration}

データ移行の前に、ソリューション全体の設計が重要です。次のセクションでは、ビジネス観点と実装観点のベスト プラクティスとシナリオについて説明します。

### ビジネス側のベストプラクティス {#best-practices-for-the-business-side}

複数のノードにワークロードを均等に分散するために、分散データベースの設計は従来のデータベースとは異なります。ソリューションでは、移行コストの低さと移行後のロジックの正確性の両方を確保する必要があります。次のセクションでは、データ移行前のベスト プラクティスについて説明します。

#### スキーマ設計における AUTO_INCREMENT のビジネスへの影響 {#business-impact-of-auto-increment-in-schema-design}

TiDB の`AUTO_INCREMENT`は、MySQL の`AUTO_INCREMENT`と互換性があります。ただし、分散データベースである TiDB には通常、複数のコンピューティング ノード (クライアント側のエントリ) があります。アプリケーション データが書き込まれると、ワークロードは均等に分散されます。このため、テーブルに`AUTO_INCREMENT`列がある場合、列の自動増分 ID が連続しない可能性があります。詳細については、 [自動インクリメント](/auto-increment.md#implementation-principles)参照してください。

ビジネスで自動増分 ID に大きく依存している場合は、 [MySQL互換の`AUTO_INCREMENT`モード](/auto-increment.md#mysql-compatibility-mode)または[`SEQUENCE`機能](/sql-statements/sql-statement-create-sequence.md#sequence-function)使用を検討してください。

#### クラスター化インデックスの使用 {#usage-of-clustered-indexes}

テーブルを作成するときに、主キーがクラスター化インデックスか非クラスター化インデックスのどちらかであることを宣言できます。次のセクションでは、それぞれの選択の長所と短所について説明します。

-   クラスター化インデックス

    [クラスター化インデックス](/clustered-indexes.md)データstorageのハンドル ID (行 ID) として主キーを使用します。主キーを使用してクエリを実行すると、テーブルの検索を回避できるため、クエリのパフォーマンスが効果的に向上します。ただし、テーブルが書き込み中心で、主キーが[`AUTO_INCREMENT`](/auto-increment.md)使用している場合は、 [ホットスポットの問題を書き込む](/best-practices/high-concurrency-best-practices.md#highly-concurrent-write-intensive-scenario)発生する可能性が高く、クラスターのパフォーマンスが低下し、単一のstorageノードのパフォーマンスのボトルネックが発生します。

-   非クラスター化インデックス + `shard row id bit`

    非クラスター化インデックスと`shard row id bit`使用すると、 `AUTO_INCREMENT`使用するときに書き込みホットスポットの問題を回避できます。ただし、このシナリオでのテーブル検索は、主キーを使用してクエリを実行するときにクエリのパフォーマンスに影響を与える可能性があります。

-   クラスター化インデックス + 外部分散 ID ジェネレータ

    クラスター化インデックスを使用して ID の連続性を維持する場合は、Snowflake アルゴリズムや Leaf などの外部分散 ID ジェネレーターの使用を検討してください。アプリケーション プログラムはシーケンス ID を生成するため、ID がある程度連続していることが保証されます。クラスター化インデックスを使用する利点も維持されます。ただし、アプリケーションをカスタマイズする必要があります。

-   クラスター化インデックス + `AUTO_RANDOM`

    このソリューションでは、クラスター化インデックスを使用する利点を維持しながら、書き込みホットスポットの問題を回避できます。カスタマイズの手間が少なくて済みます。書き込みデータベースとして TiDB を使用するように切り替えたときに、スキーマ属性を変更できます。後続のクエリで、ID 列を使用してデータを並べ替える必要がある場合は、 [`AUTO_RANDOM`](/auto-random.md) ID 列を使用して 5 ビット左シフトし、クエリ データの順序を確保できます。例:

    ```sql
    CREATE TABLE t (a bigint PRIMARY KEY AUTO_RANDOM, b varchar(255));
    Select a, a<<5 ,b from t order by a <<5 desc
    ```

次の表は、各ソリューションの長所と短所をまとめたものです。

| シナリオ                                                                                    | 推奨される解決策                                                                                 | 長所                                                                                                            | 短所                                                                                                                                                                                     |
| :-------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <li>TiDB は、プライマリおよび書き込み集中型データベースとして機能します。</li><li>ビジネス ロジックは、主キー ID の連続性に大きく依存します。</li> | 非クラスター化インデックスを持つテーブルを作成し、 `SHARD_ROW_ID_BIT`設定します。 `SEQUENCE`主キー列として使用します。               | データ書き込みのホットスポットを回避し、ビジネス データの継続性と単調な増加を確保できます。                                                                | <li>データ書き込みの継続性を確保するために、データ書き込みのスループット容量が低下します。</li><li>主キークエリのパフォーマンスが低下します。</li>                                                                                                     |
| <li>TiDB は、プライマリおよび書き込み集中型データベースとして機能します。</li><li>ビジネス ロジックは、主キー ID の増分に大きく依存します。</li>  | 非クラスター化インデックスを持つテーブルを作成し、 `SHARD_ROW_ID_BIT`設定します。アプリケーション ID ジェネレーターを使用して主キー ID を生成します。 | データ書き込みのホットスポットを回避し、データ書き込みのパフォーマンスを保証し、ビジネスデータの増分を保証することはできますが、継続性を保証することはできません。                             | <li>アプリケーションをカスタマイズする必要があります。</li><li>外部 ID ジェネレーターはクロックの精度に大きく依存しており、障害が発生する可能性があります。</li>                                                                                            |
| <li>TiDB は、プライマリおよび書き込み集中型データベースとして機能します。</li><li>ビジネス ロジックは、主キー ID の連続性に依存しません。</li>   | クラスター化インデックスを持つテーブルを作成し、主キー列に`AUTO_RANDOM`設定します。                                         | <li>データ書き込みホットスポットを回避でき、主キーのクエリパフォーマンスが優れています。</li><li> `AUTO_INCREMENT`から`AUTO_RANDOM`への切り替えもスムーズに行えます。</li> | <li>主キー ID はランダムです。</li><li>書き込みスループット能力は制限されています。</li><li>挿入時間列を使用してビジネス データを並べ替えることをお勧めします。</li><li>主キー ID を使用してデータを並べ替える必要がある場合は、クエリに対して 5 ビットを左シフトすることができ、これによりデータの増分が保証されます。</li> |
| TiDB は読み取り専用データベースとして機能します。                                                             | 非クラスター化インデックスを持つテーブルを作成し、 `SHARD_ROW_ID_BIT`設定します。主キー列をデータ ソースと一貫性のある状態に保ちます。            | <li>データ書き込みホットスポットを回避できます。</li><li>カスタマイズコストが少なくて済みます。</li>                                                   | 主キーのクエリ パフォーマンスが影響を受けます。                                                                                                                                                               |

### MySQLシャードの重要なポイント {#key-points-for-mysql-shards}

#### 分割と結合 {#splitting-and-merging}

[小さなデータセットのMySQLシャードをTiDBに移行してマージする](/migrate-small-mysql-shards-to-tidb.md)には DM を使用することをお勧めします。

データのマージの他に、もう 1 つの一般的なシナリオはデータのアーカイブです。データは絶えず書き込まれています。時間が経つにつれて、大量のデータが徐々にホット データからウォーム データ、さらにはコールド データに変化します。幸いなことに、TiDB では、データに異なる[配置ルール](/configure-placement-rules.md)設定できます。ルールの最小粒度は[パーティション](/partitioned-table.md)です。

したがって、書き込み集中型のシナリオでは、データをアーカイブし、ホット データとコールド データを別のメディアに別々に保存する必要があるかどうかを最初から評価することをお勧めします。データをアーカイブする必要がある場合は、移行前にパーティション ルールを設定できます (TiDB はまだテーブルの再構築操作をサポートしていません)。これにより、将来テーブルを再作成してデータをインポートする必要がなくなります。

#### 悲観的モードと楽観的モード {#the-pessimistic-mode-and-the-optimistic-mode}

DM はデフォルトで悲観的モードを使用します。MySQL シャードの移行とマージのシナリオでは、上流のシャード スキーマの変更により、下流のデータベースへの DML 書き込みがブロックされる可能性があります。すべてのスキーマが変更されて同じ構造になるまで待ってから、ブレークポイントから移行を続行する必要があります。

-   アップストリーム スキーマの変更に時間がかかる場合、アップストリームBinlog がクリーンアップされる可能性があります。この問題を回避するには、リレー ログを有効にします。詳細については、 [リレーログを使用する](#use-the-relay-log)参照してください。

-   アップストリーム スキーマの変更によるデータ書き込みをブロックしたくない場合は、楽観的モードの使用を検討してください。この場合、DM はアップストリーム シャード スキーマの変更を検出してもデータ移行をブロックせず、データの移行を続行します。ただし、DM がアップストリームとダウンストリームで互換性のない形式を検出した場合、移行タスクは停止します。この問題は手動で解決する必要があります。

次の表は、楽観的モードと悲観的モードの長所と短所をまとめたものです。

| シナリオ         | 長所                                            | 短所                                                                                                                                                                                        |
| :----------- | :-------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 悲観モード（デフォルト） | 下流に移行されたデータが間違っていないことを保証できます。                 | シャードの数が多い場合、移行タスクは長時間ブロックされるか、アップストリームのバイナリログがクリーンアップされている場合は停止することもあります。この問題を回避するには、リレー ログを有効にします。詳細については、 [リレーログを使用する](#use-the-relay-log)参照してください。                                     |
| 楽観モード        | アップストリームのスキーマ変更によってデータ移行のレイテンシーが発生することはありません。 | このモードでは、スキーマ変更の互換性を確認します（増分列にデフォルト値があるかどうかを確認します）。不整合なデータは見落とされる可能性があります。詳細については、 [オプティミスティック モードでシャード テーブルからデータをマージおよび移行する](/dm/feature-shard-merge-optimistic.md#restrictions)参照してください。 |

### その他の制限と影響 {#other-restrictions-and-impact}

#### 上流と下流のデータ型 {#data-types-in-upstream-and-downstream}

TiDB はほとんどの MySQL データ型をサポートしています。ただし、一部の特殊な型はまだサポートされていません ( `SPATIAL`など)。データ型の互換性については、 [データ型](/data-type-overview.md)参照してください。

#### 文字セットと照合順序 {#character-sets-and-collations}

TiDB v6.0.0 以降では、照合の新しいフレームワークがデフォルトで使用されます。以前のバージョンでは、TiDB で utf8_general_ci、utf8mb4_general_ci、utf8_unicode_ci、utf8mb4_unicode_ci、gbk_chinese_ci、gbk_bin をサポートするには、クラスターの作成時に`new_collations_enabled_on_first_bootstrap`の値を`true`に設定して明示的に宣言する必要があります。詳細については、 [照合のための新しいフレームワーク](/character-set-and-collation.md#new-framework-for-collations)参照してください。

TiDB のデフォルトの文字セットは utf8mb4 です。アップストリームおよびダウンストリームのデータベースとアプリケーションには utf8mb4 を使用することをお勧めします。アップストリーム データベースで文字セットまたは照合順序が明示的に指定されている場合は、TiDB がそれをサポートしているかどうかを確認する必要があります。

TiDB v6.0.0 以降では、GBK がサポートされています。詳細については、次のドキュメントを参照してください。

-   [文字セットと照合順序](/character-set-and-collation.md)
-   [GBK互換性](/character-set-gbk.md#mysql-compatibility)

### 導入のベストプラクティス {#best-practices-for-deployment}

#### DMマスターとDMワーカーをデプロイ {#deploy-dm-master-and-dm-worker}

DM は DM マスター ノードと DM ワーカー ノードで構成されます。

-   DM マスターは、移行タスクのメタデータを管理し、DM ワーカー ノードをスケジュールします。これは、DM プラットフォーム全体の中核です。したがって、DM マスターをクラスターとして展開して、DM プラットフォームの高可用性を確保できます。

-   DM ワーカーは、上流および下流の移行タスクを実行します。DM ワーカー ノードはステートレスです。最大 1000 個の DM ワーカー ノードをデプロイできます。DM を使用する場合は、高可用性を確保するためにアイドル状態の DM ワーカーをいくつか予約することをお勧めします。

#### 移行タスクを計画する {#plan-the-migration-tasks}

MySQL シャードを移行およびマージする場合、上流のシャードの種類に応じて移行タスクを分割できます。たとえば、 `usertable_1~50`と`Logtable_1~50` 2 種類のシャードである場合、2 つの移行タスクを作成できます。これにより、移行タスク テンプレートが簡素化され、データ移行の中断の影響を効果的に制御できます。

大規模なデータセットを移行する場合は、次の提案を参照して移行タスクを分割できます。

-   アップストリームで複数のデータベースを移行する必要がある場合は、データベースの数に応じて移行タスクを分割できます。

-   アップストリームの書き込み負荷に応じてタスクを分割します。つまり、アップストリームで DML 操作が頻繁に行われるテーブルを別の移行タスクに分割します。DML 操作が頻繁に行われないテーブルは、別の移行タスクを使用して移行します。この方法は、特にアップストリームのテーブルに大量のログが書き込まれている場合、移行の進行を高速化できます。ただし、大量のログを含むこのテーブルがビジネス全体に影響を与えない場合、この方法は依然として有効です。

移行タスクを分割しても、データの最終的な一貫性のみが保証されることに注意してください。リアルタイムの一貫性は、さまざまな理由により大幅に逸脱する可能性があります。

次の表は、さまざまなシナリオにおける DM マスターと DM ワーカーの推奨される展開プランを示しています。

| シナリオ                                                                | DMマスターの展開                                                                                        | DMワーカーの展開                                                                                              |
| :------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| <li>小さなデータセット（1 TiB 未満）</li><li>一度限りのデータ移行</li>                     | 1つのDMマスターノードをデプロイ                                                                                | 上流データ ソースの数に応じて、1 ～ N 個の DM ワーカー ノードをデプロイ。通常は、1 個の DM ワーカー ノードが推奨されます。                                 |
| <li>大規模なデータセット（1 TiB 以上）と MySQL シャードの移行とマージ</li><li>一度限りのデータ移行</li> | 長時間のデータ移行中に DM クラスターの可用性を確保するために、3 つの DM マスター ノードを展開することをお勧めします。                                 | データ ソースまたは移行タスクの数に応じて DM ワーカー ノードをデプロイ。稼働中の DM ワーカー ノードのほかに、1 ～ 3 個のアイドル状態の DM ワーカー ノードを展開することをお勧めします。 |
| 長期データ複製                                                             | DM マスター ノードを 3 つデプロイする必要があります。クラウドに DM マスター ノードをデプロイする場合は、異なるアベイラビリティ ゾーン (AZ) にデプロイするようにしてください。 | データソースや移行タスクの数に応じて、DM-worker ノードをデプロイ。実際に必要な DM-worker ノードの数の 1.5 ～ 2 倍を展開する必要があります。                   |

#### アップストリームデータソースを選択して構成する {#choose-and-configure-the-upstream-data-source}

DM は、フルデータ移行を実行する際にデータベース全体のフルデータをバックアップし、並列論理バックアップ方式を使用します。MySQL のバックアップ中は、グローバル読み取りロック[`FLUSH TABLES WITH READ LOCK`](https://dev.mysql.com/doc/refman/8.0/en/flush.html#flush-tables-with-read-lock)が追加されます。アップストリーム データベースの DML および DDL 操作は、短時間ブロックされます。そのため、アップストリームのバックアップ データベースを使用してフルデータ バックアップを実行し、データ ソースの GTID 機能を有効にすることを強くお勧めします ( `enable-gtid: true` )。このようにして、アップストリームからの影響を回避し、アップストリームのマスター ノードに切り替えて、増分移行中のレイテンシーを削減できます。アップストリーム MySQL データ ソースの切り替え手順については、 [アップストリーム MySQL インスタンス間の DM ワーカー接続を切り替える](/dm/usage-scenario-master-slave-switch.md#switch-dm-worker-connection-via-virtual-ip)参照してください。

次の点に注意してください。

-   完全なデータ バックアップは、アップストリーム データベースのマスター ノードでのみ実行できます。

    このシナリオでは、構成ファイルで`consistency`パラメータを`none`に設定して`mydumpers.global.extra-args: "--consistency none"`マスター ノードにグローバル読み取りロックが追加されないようにすることができます。ただし、これにより、完全バックアップのデータ整合性が影響を受け、アップストリームとダウンストリーム間でデータの不整合が発生する可能性があります。

-   バックアップ スナップショットを使用して完全なデータ移行を実行します (AWS 上の MySQL RDS およびAurora RDS の移行にのみ適用されます)

    移行対象のデータベースが AWS MySQL RDS またはAurora RDS の場合、RDS スナップショットを使用して Amazon S3 のバックアップデータを TiDB に直接移行し、データの一貫性を確保できます。詳細については、 [Amazon Auroraから TiDB へのデータ移行](/migrate-aurora-to-tidb.md)参照してください。

### 構成の詳細 {#details-of-configurations}

#### 大文字の使用 {#capitalization}

TiDB スキーマ名は、デフォルトでは大文字と小文字が区別されません (つまり`lower_case_table_names:2` )。ただし、ほとんどのアップストリーム MySQL データベースは、デフォルトで大文字と小文字が区別される Linux システムを使用します。この場合、スキーマがアップストリームから正しく移行されるようにするには、DM タスク構成ファイルで`case-sensitive`から`true`に設定する必要があります。

特殊なケースとして、たとえば、アップストリームに`Table`などの大文字のテーブルと`table`などの小文字のテーブルの両方を持つデータベースがある場合、スキーマの作成時にエラーが発生します。

`ERROR 1050 (42S01): Table '{tablename}' already exists`

#### フィルタールール {#filter-rules}

データ ソースの構成を開始するとすぐに、フィルター ルールを構成できます。詳細については、 [データ移行タスクコンフィグレーションガイド](/dm/dm-task-configuration-guide.md)参照してください。フィルター ルールを構成する利点は次のとおりです。

-   ダウンストリームで処理する必要があるBinlogイベントの数を減らし、移行の効率を向上させます。
-   不要なリレーログのstorageを削減し、ディスク領域を節約します。

> **注記：**
>
> MySQL シャードを移行およびマージするときに、データ ソースでフィルター ルールを構成している場合は、データ ソースと移行タスクの間でルールが一致していることを確認する必要があります。一致していないと、移行タスクが長時間にわたって増分データを受信できないという問題が発生する可能性があります。

#### リレーログを使用する {#use-the-relay-log}

MySQL マスター/スタンバイ メカニズムでは、スタンバイ ノードはリレー ログのコピーを保存して、非同期レプリケーションの信頼性と効率性を確保します。DM は、DM ワーカーへのリレー ログのコピーの保存もサポートしています。storage場所や有効期限などの情報を設定できます。この機能は、次のシナリオに適用されます。

-   完全データおよび増分データ移行中、完全データの量が多い場合、プロセス全体に、上流のバイナリログがアーカイブされる時間よりも長い時間がかかります。これにより、増分レプリケーション タスクが正常に開始されなくなります。リレー ログを有効にすると、完全移行が開始されると、DM-worker はリレー ログの受信を開始します。これにより、増分タスクの失敗を回避できます。

-   DM を使用して長時間のデータレプリケーションを実行する場合、さまざまな理由により移行タスクが長時間ブロックされることがあります。リレー ログを有効にすると、移行タスクのブロックによりアップストリーム バイナリ ログがリサイクルされる問題を効果的に解決できます。

リレー ログの使用にはいくつかの制限があります。DM は高可用性をサポートしています。DM ワーカーに障害が発生すると、アイドル状態の DM ワーカー インスタンスを稼働中のインスタンスに昇格させようとします。アップストリーム バイナリ ログに必要な移行ログが含まれていない場合、中断が発生する可能性があります。できるだけ早く手動で介入してリレー ログを新しい DM ワーカー ノードにコピーし、対応するリレー メタ ファイルを変更する必要があります。詳細については、 [トラブルシューティング](/dm/dm-error-handling.md#the-relay-unit-throws-error-event-from--in--diff-from-passed-in-event--or-a-migration-task-is-interrupted-with-failing-to-get-or-parse-binlog-errors-like-get-binlog-error-error-1236-hy000-and-binlog-checksum-mismatch-data-may-be-corrupted-returned)参照してください。

#### アップストリームでPT-osc/GH-ostを使用する {#use-pt-osc-gh-ost-in-upstream}

日常的な MySQL の運用とメンテナンスでは、通常、PT-osc/GH-ost などのツールを使用してスキーマをオンラインで変更し、ビジネスへの影響を最小限に抑えます。ただし、プロセス全体が MySQL Binlogに記録されます。このようなデータを TiDB ダウンストリームに移行すると、不要な書き込み操作が大量に発生し、効率的でも経済的でもありません。

この問題を解決するために、DM は移行タスクを構成するときに PT-osc や GH-ost などのサードパーティのデータ ツールをサポートします。このようなツールを使用すると、DM は冗長データを移行せず、データの一貫性を確保します。詳細については、 [GH-ost/PT-osc を使用するデータベースからの移行](/dm/feature-online-ddl.md)参照してください。

## 移行中のベストプラクティス {#best-practices-during-migration}

このセクションでは、移行中に発生する可能性のある問題のトラブルシューティング方法について説明します。

### 上流と下流のスキーマが一致しない {#inconsistent-schemas-in-upstream-and-downstream}

よくあるエラーは次のとおりです:

-   `messages: Column count doesn't match value count: 3 (columns) vs 2 (values)`
-   `Schema/Column doesn't match`

通常、このような問題は、ダウンストリーム TiDB でインデックスが変更または追加されたか、ダウンストリームに列が増えたことが原因で発生します。このようなエラーが発生した場合は、アップストリームとダウンストリームのスキーマに不整合がないか確認してください。

このような問題を解決するには、DM にキャッシュされたスキーマ情報を下流の TiDB スキーマと一致するように更新します。詳細については、 [移行するテーブルのテーブルスキーマを管理する](/dm/dm-manage-schema.md)参照してください。

下流にさらに列がある場合は、 [より多くの列を持つ下流の TiDB テーブルにデータを移行する](/migrate-with-more-columns-downstream.md)参照してください。

### DDL の失敗により移行タスクが中断されました {#interrupted-migration-task-due-to-failed-ddl}

DM は、移行タスクの中断を引き起こす DDL ステートメントのスキップまたは置換をサポートしています。詳細については、 [失敗したDDL文の処理](/dm/handle-failed-ddl-statements.md#usage-examples)参照してください。

## データ移行後のデータ検証 {#data-validation-after-data-migration}

データ移行後にデータの一貫性を検証することをお勧めします。TiDB は、データ検証を完了するために役立つ[同期差分インスペクター](/sync-diff-inspector/sync-diff-inspector-overview.md)を提供します。

sync-diff-inspector は、DM タスクを通じてデータの整合性をチェックするテーブルリストを自動で管理できるようになりました。以前の手動設定と比較して、より効率的です。詳細については、 [DM レプリケーション シナリオにおけるデータ チェック](/sync-diff-inspector/dm-diff.md)参照してください。

DM v6.2.0 以降、DM は増分レプリケーションの継続的なデータ検証をサポートしています。詳細については、 [DM における継続的なデータ検証](/dm/dm-continuous-data-validation.md)参照してください。

## 長期データ複製 {#long-term-data-replication}

DM を使用して長期的なデータ複製タスクを実行する場合、メタデータをバックアップする必要があります。一方では、移行クラスターを再構築する機能を確保します。他方では、移行タスクのバージョン管理を実装できます。詳細については、 [データソースのエクスポートとインポート、およびクラスターのタスクコンフィグレーション](/dm/dm-export-import-config.md)参照してください。
