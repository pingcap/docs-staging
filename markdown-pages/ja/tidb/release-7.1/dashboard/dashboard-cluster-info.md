---
title: TiDB Dashboard Cluster Information Page
summary: View the running status of TiDB, TiKV, PD, TiFlash components in the entire cluster and the running status of the host on which these components are located.
---

# TiDB ダッシュボードのクラスタ情報ページ {#tidb-dashboard-cluster-information-page}

クラスター情報ページでは、クラスター全体の TiDB、TiKV、PD、 TiFlashコンポーネントの実行ステータスと、これらのコンポーネントが配置されているホストの実行ステータスを表示できます。

## ページにアクセスする {#access-the-page}

次の 2 つの方法のいずれかを使用して、クラスター情報ページにアクセスできます。

-   TiDB ダッシュボードにログインした後、左側のナビゲーション メニューで**[クラスタ情報]**をクリックします。

-   ブラウザで[http://127.0.0.1:2379/dashboard/#/cluster_info/instance](http://127.0.0.1:2379/dashboard/#/cluster_info/instance)にアクセスしてください。 `127.0.0.1:2379`を実際の PD インスタンスのアドレスとポートに置き換えます。

## インスタンスリスト {#instance-list}

**「インスタンス」**をクリックしてインスタンスのリストを表示します。

![Instance list](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-cluster-info-instances-v650.png)

このインスタンス リストには、クラスター内の TiDB、TiKV、PD、およびTiFlashコンポーネントのすべてのインスタンスの概要情報が表示されます。

リストには次の情報が含まれます。

-   アドレス: インスタンスのアドレス。
-   ステータス: インスタンスの実行ステータス。
-   稼働時間: インスタンスの開始時間。
-   バージョン: インスタンスのバージョン番号。
-   Git ハッシュ: インスタンス バイナリ ファイルに対応する Git ハッシュ値。
-   デプロイメント ディレクトリ: インスタンス バイナリ ファイルが配置されているディレクトリ。

### インスタンスのステータス {#instance-status}

インスタンスは次のいずれかのステータスで実行できます。

-   Up: インスタンスは正常に実行されています。
-   ダウンまたは到達不能: インスタンスが実行されていないか、対応するホストにネットワークの問題が存在します。
-   廃棄: インスタンス上のデータは完全に移行され、スケールインが完了しました。このステータスは、TiKV またはTiFlashインスタンスにのみ存在します。
-   終了: インスタンス上のデータは移行中であり、スケールインが進行中です。このステータスは、TiKV またはTiFlashインスタンスにのみ存在します。
-   不明: インスタンスの実行状態は不明です。

> **注記：**
>
> -   TiDB ダッシュボードの`Leaving` 、PD API によって返される`Offline` 、 TiUPの`Pending Offline`は同じステータスを示します。
> -   テーブル内の一部の列は、インスタンスが起動している場合にのみ表示できます。

インスタンスのステータスは、PD スケジュール情報から取得されます。詳細については、 [情報収集](/tidb-scheduling.md#information-collection)を参照してください。

## ホストリスト {#host-list}

**「ホスト」**をクリックしてホストのリストを表示します。

![Host list](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-cluster-info-hosts-v650.png)

このホスト リストには、クラスター内の TiDB、TiKV、PD、およびTiFlashコンポーネントのすべてのインスタンスに対応するホストの実行ステータスが表示されます。

リストには次の情報が含まれます。

-   ホスト アドレス: ホストの IP アドレス。
-   CPU: ホスト CPU の論理コアの数。
-   CPU 使用率: 現在 1 秒間のユーザー モードおよびカーネル モードの CPU 使用率。
-   メモリ: ホストの物理メモリの合計サイズ。
-   メモリ使用量: ホストの現在のメモリ使用量。

> **注記：**
>
> ホスト一覧情報はインスタンスプロセスごとに提供されるため、ホスト上のすべてのインスタンスが停止している場合、ホスト情報は表示されません。

## ディスクリスト {#disk-list}

**「ディスク」**をクリックしてディスクのリストを表示します。

![Disk list](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-cluster-info-disks-v650.png)

このディスク リストには、TiDB、TiKV、PD、およびTiFlashインスタンスが実行されているディスクのステータスが表示されます。

リストには次の情報が含まれます。

-   ホスト アドレス: ホストの IP アドレス。
-   マウント ディレクトリ: インスタンスが実行されているホスト上のこのディスクのマウント パス。
-   ファイル システム: インスタンスが実行されているホスト上のこのディスクのファイル システム タイプ。
-   ディスク容量: インスタンスが実行されているホスト上のディスクの合計容量。
-   ディスク使用量: インスタンスが実行されているホスト上のディスクのスペース使用量。
-   インスタンス: このホスト上で実行されているインスタンス。
