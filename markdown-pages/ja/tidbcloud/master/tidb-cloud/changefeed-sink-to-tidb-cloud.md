---
title: Sink to TiDB Cloud
summary: このドキュメントでは、 TiDB Cloud Dedicated クラスターからTiDB Cloud Serverless クラスターにデータをストリーミングする方法について説明します。この機能で使用できる変更フィードとリージョンの数には制限があります。前提条件には、tidb_gc_life_time の拡張、データのバックアップ、およびTiDB Cloudシンクの開始位置の取得が含まれます。TiDB TiDB Cloudシンクを作成するには、クラスターの概要ページに移動し、接続を確立し、テーブルとイベント フィルターをカスタマイズし、開始レプリケーション位置を入力し、変更フィード仕様を指定し、構成を確認して、シンクを作成します。最後に、tidb_gc_life_time を元の値に戻します。
---

# TiDB Cloudにシンク {#sink-to-tidb-cloud}

このドキュメントでは、 TiDB Cloud Dedicated クラスターからTiDB Cloud Serverless クラスターにデータをストリーミングする方法について説明します。

> **注記：**
>
> Changefeed 機能を使用するには、 TiDB Cloud Dedicated クラスターのバージョンが v6.1.3 以降であることを確認してください。

## 制限 {#restrictions}

-   TiDB Cloudクラスターごとに、最大 100 個の変更フィードを作成できます。

-   TiDB Cloud は変更フィードを確立するために TiCDC を使用するため、同じ[TiCDCとしての制限](https://docs.pingcap.com/tidb/stable/ticdc-overview#unsupported-scenarios)持ちます。

-   複製するテーブルに主キーまたは null 以外の一意のインデックスがない場合、複製中に一意の制約がないと、再試行シナリオによっては下流に重複したデータが挿入される可能性があります。

-   **Sink to TiDB Cloud**機能は、次の AWS リージョンにあり、2022 年 11 月 9 日以降に作成されたTiDB Cloud Dedicated クラスターでのみ使用できます。

    -   AWS オレゴン (us-west-2)
    -   AWS フランクフルト (eu-central-1)
    -   AWS シンガポール (ap-southeast-1)
    -   AWS 東京 (ap-northeast-1)

-   ソースTiDB Cloud Dedicated クラスターと宛先TiDB Cloud Serverless クラスターは、同じプロジェクトと同じリージョンに存在する必要があります。

-   **Sink to TiDB Cloud**機能は、プライベート エンドポイント経由のネットワーク接続のみをサポートします。TiDB TiDB Cloud Dedicated クラスターからTiDB Cloud Serverless クラスターにデータをストリーミングするための変更フィードを作成すると、 TiDB Cloudは 2 つのクラスター間のプライベート エンドポイント接続を自動的にセットアップします。

## 前提条件 {#prerequisites}

**Sink to TiDB Cloud**コネクタは、一定の[TSO](https://docs.pingcap.com/tidb/stable/glossary#tso)が経過した後にのみ、 TiDB Cloud Dedicated クラスターからTiDB Cloud Serverless クラスターに増分データをシンクできます。

変更フィードを作成する前に、ソースのTiDB Cloud Dedicated クラスターから既存のデータをエクスポートし、そのデータを宛先のTiDB Cloud Serverless クラスターにロードする必要があります。

1.  その間、履歴データが TiDB によってガベージ コレクションされないように、 [tidb_gc_ライフタイム](https://docs.pingcap.com/tidb/stable/system-variables#tidb_gc_life_time-new-in-v50)次の 2 つの操作の合計時間よりも長く延長します。

    -   既存のデータをエクスポートおよびインポートする時間
    -   **Sink to TiDB Cloud**を作成する時間

    例えば：

    ```sql
    SET GLOBAL tidb_gc_life_time = '720h';
    ```

2.  [Dumpling](https://docs.pingcap.com/tidb/stable/dumpling-overview)使用してTiDB Cloud Dedicated クラスターからデータをエクスポートし、 [TiDB Cloudサーバーレス インポート](/tidb-cloud/import-csv-files-serverless.md)使用して宛先のTiDB Cloud Serverless クラスターにデータをロードします。

3.  [Dumplingのエクスポートファイル](https://docs.pingcap.com/tidb/stable/dumpling-overview#format-of-exported-files)から、メタデータ ファイルからTiDB Cloudシンクの開始位置を取得します。

    以下はメタデータ ファイルの例の一部です。3 `SHOW MASTER STATUS`うち`Pos`既存データの TSO であり、 TiDB Cloudシンクの開始位置でもあります。

        Started dump at: 2023-03-28 10:40:19
        SHOW MASTER STATUS:
                Log: tidb-binlog
                Pos: 420747102018863124
        Finished dump at: 2023-03-28 10:40:20

## TiDB Cloudシンクを作成する {#create-a-tidb-cloud-sink}

前提条件を完了したら、データを宛先のTiDB Cloud Serverless クラスターにシンクできます。

1.  ターゲット TiDB クラスターのクラスター概要ページに移動し、左側のナビゲーション ペインで**[Changefeed] を**クリックします。

2.  **「Changefeed の作成」**をクリックし、宛先として**TiDB Cloud**を選択します。

3.  **TiDB Cloud接続**領域で、宛先のTiDB Cloud Serverless クラスターを選択し、宛先クラスターのユーザー名とパスワードを入力します。

4.  **[次へ]**をクリックして、2 つの TiDB クラスター間の接続を確立し、変更フィードがそれらを正常に接続できるかどうかをテストします。

    -   はいの場合は、構成の次の手順に進みます。
    -   そうでない場合は、接続エラーが表示されるので、エラーを処理する必要があります。エラーが解決したら、もう一度**[次へ]**をクリックします。

5.  **テーブル フィルター**をカスタマイズして、複製するテーブルをフィルターします。ルール構文については、 [テーブルフィルタルール](/table-filter.md)を参照してください。

    -   **フィルター ルール**: この列でフィルター ルールを設定できます。デフォルトでは、すべてのテーブルを複製するルール`*.*`があります。新しいルールを追加すると、 TiDB Cloud はTiDB 内のすべてのテーブルを照会し、右側のボックスにルールに一致するテーブルのみを表示します。最大 100 個のフィルター ルールを追加できます。
    -   **有効なキーを持つテーブル**: この列には、主キーや一意のインデックスなど、有効なキーを持つテーブルが表示されます。
    -   **有効なキーのないテーブル**: この列には、主キーまたは一意のキーがないテーブルが表示されます。これらのテーブルは、一意の識別子がないと、ダウンストリームが重複イベントを処理するときにデータの一貫性がなくなる可能性があるため、レプリケーション中に問題が発生します。データの一貫性を確保するには、レプリケーションを開始する前に、これらのテーブルに一意のキーまたは主キーを追加することをお勧めします。または、フィルター ルールを追加して、これらのテーブルを除外することもできます。たとえば、ルール`"!test.tbl1"`を使用してテーブル`test.tbl1`を除外できます。

6.  **イベント フィルター**をカスタマイズして、複製するイベントをフィルターします。

    -   **一致するテーブル**: この列で、イベント フィルターを適用するテーブルを設定できます。ルールの構文は、前の**テーブル フィルター**領域で使用した構文と同じです。変更フィードごとに最大 10 個のイベント フィルター ルールを追加できます。
    -   **無視されるイベント**: イベント フィルターが変更フィードから除外するイベントの種類を設定できます。

7.  **「レプリケーション開始位置」**領域に、 Dumplingからエクスポートされたメタデータ ファイルから取得した TSO を入力します。

8.  **次へ**をクリックして、変更フィード仕様を構成します。

    -   **「Changefeed 仕様」**領域で、Changefeed で使用されるレプリケーション容量単位 (RCU) の数を指定します。
    -   **「Changefeed 名」**領域で、Changefeed の名前を指定します。

9.  **「次へ」**をクリックして、変更フィード構成を確認します。

    すべての構成が正しいことを確認したら、リージョン間レプリケーションのコンプライアンスを確認し、 **「作成」**をクリックします。

    いくつかの設定を変更する場合は、 **「前へ」**をクリックして前の設定ページに戻ります。

10. シンクはすぐに起動し、シンクのステータスが**「作成中」**から**「実行中」**に変わるのがわかります。

    変更フィード名をクリックすると、チェックポイント、レプリケーションのレイテンシー、その他のメトリックなど、変更フィードに関する詳細が表示されます。

11. シンクが作成された後、 [tidb_gc_ライフタイム](https://docs.pingcap.com/tidb/stable/system-variables#tidb_gc_life_time-new-in-v50)元の値（デフォルト値は`10m` ）に戻します。

    ```sql
    SET GLOBAL tidb_gc_life_time = '10m';
    ```
