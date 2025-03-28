---
title: Architecture and Principles of TiCDC
summary: TiCDC のアーキテクチャと動作原理を学びます。
---

# TiCDC のアーキテクチャと原則 {#architecture-and-principles-of-ticdc}

## TiCDCアーキテクチャ {#ticdc-architecture}

複数の TiCDC ノードで構成される TiCDC クラスターは、分散型でステートレスなアーキテクチャを使用します。TiCDC とそのコンポーネントの設計は次のとおりです。

![TiCDC architecture](https://docs-download.pingcap.com/media/images/docs/ticdc/ticdc-architecture-1.jpg)

## TiCDC コンポーネント {#ticdc-components}

上の図では、TiCDC クラスターは、TiCDC インスタンスを実行する複数のノードで構成されています。各 TiCDC インスタンスには、キャプチャ プロセスがあります。キャプチャ プロセスの 1 つが所有者キャプチャとして選択され、ワークロードのスケジュール設定、DDL ステートメントの複製、管理タスクの実行を担当します。

各キャプチャ プロセスには、上流の TiDB のテーブルからデータを複製するための 1 つまたは複数のプロセッサ スレッドが含まれています。テーブルは TiCDC でのデータ複製の最小単位であるため、プロセッサは複数のテーブル パイプラインで構成されます。

各パイプラインには、プラー、ソーター、マウンター、シンクのコンポーネントが含まれています。

![TiCDC architecture](https://docs-download.pingcap.com/media/images/docs/ticdc/ticdc-architecture-2.jpg)

これらのコンポーネントは、データのプル、データのソート、データのロード、上流から下流へのデータの複製などのレプリケーション プロセスを完了するために、相互にシリアルに動作します。コンポーネントの説明は次のとおりです。

-   プルラー: TiKV ノードから DDL と行の変更をプルします。
-   ソーター: TiKV ノードから受信した変更をタイムスタンプの昇順で並べ替えます。
-   マウンター: スキーマ情報に基づいて、変更を TiCDC シンクが処理できる形式に変換します。
-   シンク: 変更を下流のシステムに複製します。

高可用性を実現するために、各 TiCDC クラスターは複数の TiCDC ノードを実行します。これらのノードは、PD 内の etcd クラスターに定期的にステータスを報告し、ノードの 1 つを TiCDC クラスターの所有者として選出します。所有者ノードは、etcd に保存されているステータスに基づいてデータをスケジュールし、スケジュール結果を etcd に書き込みます。プロセッサは、etcd のステータスに従ってタスクを完了します。プロセッサを実行しているノードに障害が発生した場合、クラスターは他のノードにテーブルをスケジュールします。所有者ノードに障害が発生した場合、他のノードのキャプチャ プロセスが新しい所有者を選出します。次の図を参照してください。

![TiCDC architecture](https://docs-download.pingcap.com/media/images/docs/ticdc/ticdc-architecture-3.PNG)

## 変更フィードとタスク {#changefeeds-and-tasks}

TiCDC の Changefeed と Task は 2 つの論理概念です。具体的な説明は次のとおりです。

-   Changefeed: レプリケーション タスクを表します。レプリケートされるテーブルとダウンストリームに関する情報を伝達します。
-   タスク: TiCDC はレプリケーション タスクを受信すると、このタスクを複数のサブタスクに分割します。このようなサブタスクはタスクと呼ばれます。これらのタスクは、処理のために TiCDC ノードのキャプチャ プロセスに割り当てられます。

例えば：

    cdc cli changefeed create --server="http://127.0.0.1:8300" --sink-uri="kafka://127.0.0.1:9092/cdc-test?kafka-version=2.4.0&partition-num=6&max-message-bytes=67108864&replication-factor=1"
    cat changefeed.toml
    ......
    [sink]
    dispatchers = [
        {matcher = ['test1.tab1', 'test2.tab2'], topic = "{schema}_{table}"},
        {matcher = ['test3.tab3', 'test4.tab4'], topic = "{schema}_{table}"},
    ]

前述の`cdc cli changefeed create`コマンドのパラメータの詳細については、 [TiCDC Changefeedコンフィグレーションパラメータ](/ticdc/ticdc-changefeed-config.md)参照してください。

上記の`cdc cli changefeed create`コマンドは、 `test1.tab1` 、 `test1.tab2` 、 `test3.tab3` 、および`test4.tab4`を Kafka クラスターに複製する changefeed タスクを作成します。TiCDC がこのコマンドを受信した後の処理フローは次のとおりです。

1.  TiCDC はこのタスクを所有者のキャプチャ プロセスに送信します。
2.  所有者の Capture プロセスは、この changefeed タスクに関する情報を PD の etcd に保存します。
3.  所有者のキャプチャ プロセスは、変更フィード タスクを複数のタスクに分割し、完了するタスクを他のキャプチャ プロセスに通知します。
4.  キャプチャ プロセスは TiKV ノードからデータの取得を開始し、データを処理してレプリケーションを完了します。

以下は、Changefeed と Task が含まれた TiCDCアーキテクチャ図です。

![TiCDC architecture](https://docs-download.pingcap.com/media/images/docs/ticdc/ticdc-architecture-6.jpg)

上の図では、4 つのテーブルをダウンストリームに複製するための変更フィードが作成されています。この変更フィードは 3 つのタスクに分割され、それぞれ TiCDC クラスター内の 3 つのキャプチャ プロセスに送信されます。TiCDC がデータを処理した後、データはダウンストリーム システムに複製されます。

TiCDC は、MySQL、TiDB、および Kafka データベースへのデータのレプリケーションをサポートしています。 上の図は、changefeed レベルでのデータ転送プロセスのみを示しています。 次のセクションでは、テーブル`table1`をレプリケートする Task1 を例にして、TiCDC がデータを処理する方法について詳しく説明します。

![TiCDC architecture](https://docs-download.pingcap.com/media/images/docs/ticdc/ticdc-architecture-5.jpg)

1.  データのプッシュ: データの変更が発生すると、TiKV はデータを Puller モジュールにプッシュします。
2.  増分データをスキャン: 受信したデータの変更が連続していないことが検出された場合、Puller モジュールは TiKV からデータをプルします。
3.  データのソート: Sorter モジュールは、TiKV から受信したデータをタイムスタンプに基づいてソートし、ソートされたデータを Mounter モジュールに送信します。
4.  データのマウント: データの変更を受信した後、マウント モジュールは TiCDC シンクが理解できる形式でデータをロードします。
5.  データの複製: シンク モジュールは、データの変更をダウンストリームに複製します。

TiCDC の上流は、トランザクションをサポートする分散リレーショナル データベース TiDB です。TiCDC がデータを複製する場合、複数のテーブルを複製するときにデータの一貫性とトランザクションの一貫性を確保する必要がありますが、これは大きな課題です。次のセクションでは、この課題に対処するために TiCDC が使用する主要なテクノロジと概念を紹介します。

## TiCDC の主要概念 {#key-concepts-of-ticdc}

ダウンストリーム リレーショナル データベースの場合、TiCDC は単一テーブル内のトランザクションの一貫性と、複数のテーブル内の最終的なトランザクションの一貫性を保証します。さらに、TiCDC は、アップストリーム TiDB クラスターで発生したデータ変更が少なくとも 1 回はダウンストリームに複製されることを保証します。

### 建築関連の概念 {#architecture-related-concepts}

-   キャプチャ: TiCDC ノードを実行するプロセス。複数のキャプチャ プロセスが TiCDC クラスターを構成します。各キャプチャ プロセスは、データ変更の受信とアクティブなプル、およびダウンストリームへのデータの複製など、TiKV でのデータ変更の複製を担当します。
-   キャプチャ所有者: 複数のキャプチャ プロセス間のキャプチャの所有者。TiCDC クラスターには一度に 1 つの所有者ロールのみが存在します。キャプチャ所有者は、クラスター内のデータのスケジュールを担当します。
-   プロセッサ: キャプチャ内の論理スレッド。各プロセッサは、同じレプリケーション ストリーム内の 1 つ以上のテーブルのデータを処理します。キャプチャ ノードは複数のプロセッサを実行できます。
-   Changefeed: 上流の TiDB クラスターから下流のシステムにデータを複製するタスク。Changefeed には複数のタスクが含まれ、各タスクは Capture ノードによって処理されます。

### タイムスタンプ関連の概念 {#timestamp-related-concepts}

TiCDC は、データ複製のステータスを示す一連のタイムスタンプ (TS) を導入します。これらのタイムスタンプは、データが少なくとも 1 回はダウンストリームに複製され、データの一貫性が保証されることを保証するために使用されます。

#### 解決済みTS {#resolvedts}

このタイムスタンプは TiKV と TiCDC の両方に存在します。

-   TiKV の ResolvedTS:リージョンリーダーの最も早いトランザクションの開始時刻を表します。つまり、 `ResolvedTS` = max( `ResolvedTS` 、 min( `StartTS` ))。TiDB クラスターには複数の TiKV ノードが含まれているため、すべての TiKV ノード上のリージョンリーダーの最小 ResolvedTS は、グローバル ResolvedTS と呼ばれます。TiDB クラスターは、グローバル ResolvedTS より前のすべてのトランザクションがコミットされることを保証します。または、このタイムスタンプより前にコミットされていないトランザクションがないと想定することもできます。

-   TiCDC の解決済み TS:

    -   テーブル ResolvedTS: 各テーブルにはテーブル レベルの ResolvedTS があり、これは、Resolved TS より小さいテーブル内のすべてのデータ変更が受信されたことを示します。簡単に言うと、このタイムスタンプは、TiKV ノード上のこのテーブルに対応するすべてのリージョンの ResolvedTS の最小値と同じです。
    -   グローバル ResolvedTS: すべての TiCDC ノード上のすべてのプロセッサの最小 ResolvedTS。各 TiCDC ノードには 1 つ以上のプロセッサがあるため、各プロセッサは複数のテーブル パイプラインに対応します。

    TiCDC の場合、TiKV によって送信される ResolvedTS は`<resolvedTS: timestamp>`の形式の特別なイベントです。一般に、ResolvedTS は次の制約を満たします。

        table ResolvedTS >= global ResolvedTS

#### チェックポイントTS {#checkpointts}

このタイムスタンプは TiCDC にのみ存在します。つまり、このタイムスタンプより前に発生したデータの変更は、ダウンストリーム システムに複製されていることを意味します。

-   テーブル CheckpointTS: TiCDC はテーブル内のデータを複製するため、テーブル checkpointTS は、CheckpointTS がテーブル レベルで複製される前に発生したすべてのデータ変更を示します。
-   プロセッサ CheckpointTS: プロセッサ上の最小テーブル CheckpointTS を示します。
-   グローバル CheckpointTS: すべてのプロセッサ間の最小 CheckpointTS を示します。

一般に、チェックポイントTS は次の制約を満たします。

    table CheckpointTS >= global CheckpointTS

TiCDC はグローバル ResolvedTS よりも小さいデータのみをダウンストリームに複製するため、完全な制約は次のようになります。

    table ResolvedTS >= global ResolvedTS >= table CheckpointTS >= global CheckpointTS

データの変更とトランザクションがコミットされた後、TiKV ノードの ResolvedTS は引き続き進み、TiCDC ノードの Puller モジュールは TiKV によってプッシュされたデータを受信し続けます。Puller モジュールは、受信したデータの変更に基づいて増分データをスキャンするかどうかも決定し、すべてのデータの変更が TiCDC ノードに送信されるようにします。

Sorter モジュールは、Puller モジュールが受信したデータをタイムスタンプの昇順でソートします。このプロセスにより、テーブル レベルでのデータの一貫性が確保されます。次に、Mounter モジュールは、上流からのデータ変更を Sink モジュールが使用できる形式に組み立て、Sink モジュールに送信します。Sink モジュールは、CheckpointTS と ResolvedTS 間のデータ変更をタイムスタンプの順に下流に複製し、下流がデータ変更を受け取った後に checkpointTS を進めます。

前のセクションでは、DML ステートメントのデータ変更のみを取り上げており、DDL ステートメントは取り上げていません。次のセクションでは、DDL ステートメントに関連するタイムスタンプについて説明します。

#### バリアTS {#barrier-ts}

バリア TS は、DDL 変更イベントが発生したとき、または同期ポイントが使用されたときに生成されます。

-   DDL 変更イベント: バリア TS は、DDL ステートメントの前のすべての変更がダウンストリームにレプリケートされることを保証します。この DDL ステートメントが実行され、レプリケートされた後、TiCDC は他のデータ変更のレプリケートを開始します。DDL ステートメントはキャプチャ所有者によって処理されるため、DDL ステートメントに対応するバリア TS は所有者ノードによってのみ生成されます。
-   同期ポイント: TiCDC の同期ポイント機能を有効にすると、指定した`sync-point-interval`に従って TiCDC によってバリア TS が生成されます。このバリア TS より前のすべてのテーブル変更がレプリケートされると、TiCDC は、ダウンストリームの tsMap を記録するテーブルに、現在のグローバル チェックポイント TS をプライマリ TS として挿入します。その後、TiCDC はデータ レプリケーションを続行します。

バリア TS が生成されると、TiCDC は、このバリア TS の前に発生したデータ変更のみが下流にレプリケートされるようにします。これらのデータ変更が下流にレプリケートされるまで、レプリケーション タスクは続行されません。所有者 TiCDC は、グローバル チェックポイント TS とバリア TS を継続的に比較して、すべてのターゲット データがレプリケートされたかどうかを確認します。グローバル チェックポイント TS がバリア TS と等しい場合、TiCDC は指定された操作 (DDL ステートメントの実行やグローバル チェックポイント TS の下流への記録など) を実行した後、レプリケーションを続行します。それ以外の場合、TiCDC はバリア TS の前に発生したすべてのデータ変更が下流にレプリケートされるまで待機します。

## 主なプロセス {#major-processes}

このセクションでは、TiCDC の動作原理をよりよく理解できるように、TiCDC の主なプロセスについて説明します。

以下のプロセスは TiCDC 内でのみ実行され、ユーザーに対して透過的であることに注意してください。したがって、どの TiCDC ノードを起動するかを気にする必要はありません。

### TiCDC を開始する {#start-ticdc}

-   所有者ではない TiCDC ノードの場合は、次のように動作します。

    1.  キャプチャ プロセスを開始します。
    2.  プロセッサを起動します。
    3.  所有者によって実行されたタスク スケジュール コマンドを受け取ります。
    4.  スケジュール コマンドに従って tablePipeline を開始または停止します。

-   所有者 TiCDC ノードの場合、次のように動作します。

    1.  キャプチャ プロセスを開始します。
    2.  ノードが所有者として選出され、対応するスレッドが開始されます。
    3.  変更フィード情報を読み取ります。
    4.  変更フィード管理プロセスを開始します。
    5.  変更フィード構成と最新の CheckpointTS に従って TiKV 内のスキーマ情報を読み取り、複製するテーブルを決定します。
    6.  各プロセッサによって現在複製されているテーブルのリストを読み取り、追加するテーブルを配布します。
    7.  レプリケーションの進行状況を更新します。

### TiCDCを停止する {#stop-ticdc}

通常、TiCDC ノードを停止するのは、アップグレードが必要な場合や、計画されたメンテナンス操作を実行する必要がある場合です。TiCDC ノードを停止するプロセスは次のとおりです。

1.  ノードは自身を停止するコマンドを受信します。
2.  ノードはサービス ステータスを利用不可に設定します。
3.  ノードは新しいレプリケーション タスクの受信を停止します。
4.  ノードは、オーナー ノードにデータ複製タスクを他のノードに転送するように通知します。
5.  レプリケーション タスクが他のノードに転送されると、ノードは停止します。
