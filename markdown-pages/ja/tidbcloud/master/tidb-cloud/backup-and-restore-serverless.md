---
title: Back Up and Restore TiDB Cloud Serverless Data
summary: TiDB Cloud Serverless クラスターをバックアップおよび復元する方法を学びます。
aliases: ['/tidbcloud/restore-deleted-tidb-cluster']
---

# TiDB Cloudサーバーレス データのバックアップと復元 {#back-up-and-restore-tidb-cloud-serverless-data}

このドキュメントでは、 TiDB Cloud上のTiDB Cloud Serverless クラスター データをバックアップおよび復元する方法について説明します。

> **ヒント：**
>
> TiDB Cloud Dedicated クラスター データをバックアップおよび復元する方法については、 [TiDB Cloud専用データのバックアップと復元](/tidb-cloud/backup-and-restore.md)参照してください。

## 自動バックアップ {#automatic-backups}

TiDB Cloud Serverless はクラスター データを自動的にバックアップし、バックアップ スナップショットからデータを復元して、災害発生時のデータ損失を最小限に抑えることができます。

### バックアップ設定について学ぶ {#learn-about-the-backup-setting}

自動バックアップ設定は、次の表に示すように、無料クラスターとスケーラブル クラスター間で異なります。

| バックアップ設定   | フリークラスター | スケーラブルなクラスター |
| ---------- | -------- | ------------ |
| バックアップサイクル | 毎日       | 毎日           |
| バックアップの保持  | 1日       | 14日間         |
| バックアップ時間   | 固定時間     | 設定可能         |

-   **バックアップ サイクルは、**バックアップが実行される頻度です。

-   **バックアップ保持**期間は、バックアップが保持される期間です。期限切れのバックアップは復元できません。

-   **バックアップ時間は**、バックアップのスケジュールが開始される時間です。最終的なバックアップ時間は、構成されたバックアップ時間より遅れる可能性があることに注意してください。

    -   フリークラスター: バックアップ時間はランダムに固定された時間です。
    -   スケーラブル クラスター: バックアップ時間を 30 分ごとに設定できます。デフォルト値はランダムに固定された時間です。

### バックアップ設定を構成する {#configure-the-backup-setting}

スケーラブル クラスターのバックアップ時間を設定するには、次の手順を実行します。

1.  TiDB Cloud Serverless クラスターの**バックアップ**ページに移動します。

2.  **「バックアップ設定」**をクリックします。これにより、 **「バックアップ設定」**ウィンドウが開き、要件に応じて自動バックアップ設定を構成できます。

3.  **[バックアップ時間]**で、毎日のクラスター バックアップの開始時刻をスケジュールします。

4.  **[確認]**をクリックします。

## 復元する {#restore}

TiDB Cloud Serverless クラスターは、偶発的な損失や破損が発生した場合にデータを回復するのに役立つ復元機能を提供します。

### 復元モード {#restore-mode}

TiDB Cloud Serverless は、クラスターのスナップショット復元とポイントインタイム復元をサポートします。

-   **スナップショットの復元**: 特定のバックアップ スナップショットからクラスターを復元します。

-   **ポイントインタイム リストア (ベータ)** : クラスターを特定の時点に復元します。

    -   フリークラスター: サポートされていません。
    -   スケーラブル クラスター: 過去 14 日以内の任意の時間に復元しますが、クラスターの作成時刻より前、または現在の時刻から 1 分後の時刻には復元しません。

### 復元先 {#restore-destination}

TiDB Cloud Serverless は、インプレース復元と新しいクラスターへの復元をサポートしています。

**インプレース復元**

現在のクラスターに復元すると、既存のデータが上書きされます。次の点に注意してください。

-   復元が開始されると、既存の接続は終了します。
-   復元プロセス中はクラスターは使用できなくなり、新しい接続はブロックされます。
-   復元は`mysql`スキーマ内のテーブルに影響します。ユーザー資格情報、権限、またはシステム変数への変更は、バックアップ時の状態に戻ります。

**新しいクラスターに復元する**

新しいクラスターを作成して復元します。次の点に注意してください。

-   ソース クラスターのユーザー資格情報と権限は新しいクラスターに復元されません。

### 復元を実行する {#perform-the-restore}

TiDB Cloud Serverless クラスターを復元するには、次の手順に従います。

1.  クラスターの**バックアップ**ページに移動します。

2.  **「復元」**をクリックします。設定ウィンドウが表示されます。

3.  **復元モード**では、特定のバックアップまたは任意の時点から復元することを選択できます。

    <SimpleTab>
     <div label="Snapshot Restore">

    選択したバックアップ スナップショットから復元するには、次の手順を実行します。

    1.  **スナップショットの復元を**クリックします。
    2.  復元するバックアップ スナップショットを選択します。

    </div>
     <div label="Point-in-Time Restore">

    スケーラブル クラスターを特定の時点に復元するには、次の手順を実行します。

    1.  **ポイントインタイム復元を**クリックします。
    2.  復元したい日付と時刻を選択します。

    </div>
     </SimpleTab>

4.  **[宛先]**では、新しいクラスターに復元するか、インプレースで復元するかを選択できます。

    <SimpleTab>
     <div label="Restore to a new cluster">

    新しいクラスターに復元するには、次の手順を実行します。

    1.  **「新しいクラスタに復元」**をクリックします。
    2.  新しいクラスターの名前を入力します。
    3.  新しいクラスターのクラスター プランを選択します。
    4.  スケーラブルなクラスターを選択した場合は、月間使用限度額を設定し、必要に応じて詳細設定を構成します。それ以外の場合は、この手順をスキップします。

    </div>
     <div label="Restore in-place">

    インプレース復元するには、 **[インプレース復元]**をクリックします。

    </div>
     </SimpleTab>

5.  復元プロセスを開始するには、 **「復元」を**クリックします。

復元プロセスが開始されると、クラスターのステータスが**「復元中」**に変わります。復元が完了してステータスが**「使用可能」**に変わるまで、クラスターは使用不可のままになります。

## 制限事項 {#limitations}

-   TiFlashレプリカが有効になっている場合、データをTiFlashで再構築する必要があるため、復元後一定期間使用できなくなります。
-   TiDB Cloud Serverless クラスターでは手動バックアップはサポートされていません。
