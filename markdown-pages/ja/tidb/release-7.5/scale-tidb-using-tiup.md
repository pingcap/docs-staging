---
title: Scale a TiDB Cluster Using TiUP
summary: Learn how to scale the TiDB cluster using TiUP.
---

# TiUPを使用して TiDBクラスタをスケールする {#scale-a-tidb-cluster-using-tiup}

TiDB クラスターの容量は、オンライン サービスを中断することなく増減できます。

このドキュメントでは、 TiUPを使用して TiDB、TiKV、PD、TiCDC、またはTiFlashクラスターをスケーリングする方法について説明します。 TiUPをインストールしていない場合は、 [ステップ2. 制御マシンにTiUPをデプロイ](/production-deployment-using-tiup.md#step-2-deploy-tiup-on-the-control-machine)の手順を参照してください。

現在のクラスター名リストを表示するには、 `tiup cluster list`実行します。

たとえば、クラスターの元のトポロジが次のようになっている場合:

| ホストIP    | サービス           |
| :------- | :------------- |
| 10.0.1.3 | TiDB + TiFlash |
| 10.0.1.4 | TiDB + PD      |
| 10.0.1.5 | TiKV + モニター    |
| 10.0.1.1 | ティクヴ           |
| 10.0.1.2 | ティクヴ           |

## TiDB/PD/TiKV クラスターをスケールアウトする {#scale-out-a-tidb-pd-tikv-cluster}

このセクションでは、 `10.0.1.5`ホストに TiDB ノードを追加する方法を例示します。

> **注記：**
>
> PD ノードを追加する場合も同様の手順を実行できます。TiKV ノードを追加する前に、クラスターの負荷に応じて PD スケジューリング パラメータを事前に調整することをお勧めします。

1.  スケールアウト トポロジを構成します。

    > **注記：**
    >
    > -   デフォルトでは、ポートとディレクトリの情報は必要ありません。
    > -   複数のインスタンスを 1 台のマシンにデプロイする場合は、それぞれに異なるポートとディレクトリを割り当てる必要があります。ポートまたはディレクトリに競合がある場合は、デプロイまたはスケーリング中に通知が表示されます。
    > -   TiUP v1.0.0 以降、スケールアウト構成は元のクラスターのグローバル構成を継承します。

    `scale-out.yml`ファイルにスケールアウト トポロジ構成を追加します。

    ```shell
    vi scale-out.yml
    ```

    ```ini
    tidb_servers:
    - host: 10.0.1.5
      ssh_port: 22
      port: 4000
      status_port: 10080
      deploy_dir: /tidb-deploy/tidb-4000
      log_dir: /tidb-deploy/tidb-4000/log
    ```

    TiKV 構成ファイル テンプレートは次のとおりです。

    ```ini
    tikv_servers:
    - host: 10.0.1.5
      ssh_port: 22
      port: 20160
      status_port: 20180
      deploy_dir: /tidb-deploy/tikv-20160
      data_dir: /tidb-data/tikv-20160
      log_dir: /tidb-deploy/tikv-20160/log
    ```

    PD 構成ファイル テンプレートは次のとおりです。

    ```ini
    pd_servers:
    - host: 10.0.1.5
      ssh_port: 22
      name: pd-1
      client_port: 2379
      peer_port: 2380
      deploy_dir: /tidb-deploy/pd-2379
      data_dir: /tidb-data/pd-2379
      log_dir: /tidb-deploy/pd-2379/log
    ```

    現在のクラスターの構成を表示するには、 `tiup cluster edit-config <cluster-name>`実行します。 `global`と`server_configs`のパラメータ構成は`scale-out.yml`に継承されるため、 `scale-out.yml`でも有効になります。

2.  スケールアウト コマンドを実行します。

    `scale-out`コマンドを実行する前に、 `check`コマンドと`check --apply`コマンドを使用して、クラスター内の潜在的なリスクを検出し、自動的に修復します。

    1.  潜在的なリスクを確認してください:

        ```shell
        tiup cluster check <cluster-name> scale-out.yml --cluster --user root [-p] [-i /home/root/.ssh/gcp_rsa]
        ```

    2.  自動修復を有効にする:

        ```shell
        tiup cluster check <cluster-name> scale-out.yml --cluster --apply --user root [-p] [-i /home/root/.ssh/gcp_rsa]
        ```

    3.  `scale-out`コマンドを実行します。

        ```shell
        tiup cluster scale-out <cluster-name> scale-out.yml [-p] [-i /home/root/.ssh/gcp_rsa]
        ```

    上記のコマンドでは:

    -   `scale-out.yml`はスケールアウト構成ファイルです。
    -   `--user root` 、クラスターのスケール アウトを完了するために、ターゲット マシンに`root`ユーザーとしてログインすることを示します。4 `root`ユーザーには、ターゲット マシンに対する`ssh`および`sudo`権限があることが想定されます。または、 `ssh`および`sudo`権限を持つ他のユーザーを使用して、展開を完了することもできます。
    -   `[-i]`と`[-p]`オプションです。パスワードなしでターゲット マシンにログインするように設定した場合、これらのパラメータは必要ありません。そうでない場合は、2 つのパラメータのいずれかを選択します。4 `[-i]` 、ターゲット マシンにアクセスできるルート ユーザー (または`--user`で指定された他のユーザー) の秘密鍵です。8 `[-p]` 、ユーザー パスワードを対話的に入力するために使用されます。

    `Scaled cluster <cluster-name> out successfully`表示された場合、スケールアウト操作は成功しています。

3.  クラスター構成を更新します。

    > **注記：**
    >
    > この操作は、PD ノードを追加した後にのみ必要です。TiDB または TiKV ノードのみを追加する場合、この操作は不要です。

    1.  クラスター構成を更新します。

        ```shell
        tiup cluster reload <cluster-name> --skip-restart
        ```

    2.  Prometheus の設定を更新し、Prometheus を再起動します。

        > **注記：**
        >
        > TiUP v1.15.0 以降のバージョンを使用している場合は、この手順をスキップしてください。v1.15.0 より前のバージョンのTiUPを使用している場合は、次のコマンドを実行して Prometheus 構成を更新し、Prometheus を再起動します。

        ```shell
        tiup cluster reload <cluster-name> -R prometheus
        ```

4.  クラスターのステータスを確認します。

    ```shell
    tiup cluster display <cluster-name>
    ```

    ブラウザを使用して[http://10.0.1.5:3000](http://10.0.1.5:3000)監視プラットフォームにアクセスし、クラスターと新しいノードのステータスを監視します。

スケールアウト後のクラスター トポロジは次のようになります。

| ホストIP    | サービス                   |
| :------- | :--------------------- |
| 10.0.1.3 | TiDB + TiFlash         |
| 10.0.1.4 | TiDB + PD              |
| 10.0.1.5 | **TiDB** + TiKV + モニター |
| 10.0.1.1 | ティクヴ                   |
| 10.0.1.2 | ティクヴ                   |

## TiFlashクラスターをスケールアウトする {#scale-out-a-tiflash-cluster}

このセクションでは、 TiFlashノードを`10.0.1.4`ホストに追加する方法を示します。

> **注記：**
>
> 既存の TiDB クラスターにTiFlashノードを追加する場合は、次の点に注意してください。
>
> -   現在の TiDB バージョンがTiFlashの使用をサポートしていることを確認します。サポートしていない場合は、TiDB クラスターを v5.0 以降のバージョンにアップグレードします。
> -   配置ルール機能を有効にするには、 `tiup ctl:v<CLUSTER_VERSION> pd -u http://<pd_ip>:<pd_port> config set enable-placement-rules true`コマンドを実行します。または、 [pd-ctl](/pd-control.md)の対応するコマンドを実行します。

1.  `scale-out.yml`ファイルにノード情報を追加します。

    TiFlashノード情報を追加する`scale-out.yml`ファイルを作成します。

    ```ini
    tiflash_servers:
    - host: 10.0.1.4
    ```

    現在、IP アドレスのみ追加でき、ドメイン名は追加できません。

2.  スケールアウト コマンドを実行します。

    ```shell
    tiup cluster scale-out <cluster-name> scale-out.yml
    ```

    > **注記：**
    >
    > 上記のコマンドは、コマンドを実行するユーザーと新しいマシンとの間で相互信頼が構成されていることを前提としています。相互信頼を構成できない場合は、 `-p`オプションを使用して新しいマシンのパスワードを入力するか、 `-i`オプションを使用して秘密キー ファイルを指定します。

3.  クラスターのステータスをビュー。

    ```shell
    tiup cluster display <cluster-name>
    ```

    ブラウザを使用して[http://10.0.1.5:3000](http://10.0.1.5:3000)監視プラットフォームにアクセスし、クラスターと新しいノードのステータスを表示します。

スケールアウト後のクラスター トポロジは次のようになります。

| ホストIP    | サービス                    |
| :------- | :---------------------- |
| 10.0.1.3 | TiDB + TiFlash          |
| 10.0.1.4 | TiDB + PD + **TiFlash** |
| 10.0.1.5 | TiDB+ TiKV + モニター       |
| 10.0.1.1 | ティクヴ                    |
| 10.0.1.2 | ティクヴ                    |

## TiCDC クラスターをスケールアウトする {#scale-out-a-ticdc-cluster}

このセクションでは、ホスト`10.0.1.3`と`10.0.1.4`に 2 つの TiCDC ノードを追加する方法を例示します。

1.  `scale-out.yml`ファイルにノード情報を追加します。

    TiCDC ノード情報を追加する`scale-out.yml`ファイルを作成します。

    ```ini
    cdc_servers:
      - host: 10.0.1.3
        gc-ttl: 86400
        data_dir: /tidb-data/cdc-8300
      - host: 10.0.1.4
        gc-ttl: 86400
        data_dir: /tidb-data/cdc-8300
    ```

2.  スケールアウト コマンドを実行します。

    ```shell
    tiup cluster scale-out <cluster-name> scale-out.yml
    ```

    > **注記：**
    >
    > 上記のコマンドは、コマンドを実行するユーザーと新しいマシンとの間で相互信頼が構成されていることを前提としています。相互信頼を構成できない場合は、 `-p`オプションを使用して新しいマシンのパスワードを入力するか、 `-i`オプションを使用して秘密キー ファイルを指定します。

3.  クラスターのステータスをビュー。

    ```shell
    tiup cluster display <cluster-name>
    ```

    ブラウザを使用して[http://10.0.1.5:3000](http://10.0.1.5:3000)監視プラットフォームにアクセスし、クラスターと新しいノードのステータスを表示します。

スケールアウト後のクラスター トポロジは次のようになります。

| ホストIP    | サービス                           |
| :------- | :----------------------------- |
| 10.0.1.3 | TiDB + TiFlash + **TiCDC**     |
| 10.0.1.4 | TiDB + PD + TiFlash+ **TiCDC** |
| 10.0.1.5 | TiDB+ TiKV + モニター              |
| 10.0.1.1 | ティクヴ                           |
| 10.0.1.2 | ティクヴ                           |

## TiDB/PD/TiKV クラスターのスケールイン {#scale-in-a-tidb-pd-tikv-cluster}

このセクションでは、 `10.0.1.5`ホストから TiKV ノードを削除する方法を例示します。

> **注記：**
>
> -   同様の手順で TiDB ノードまたは PD ノードを削除できます。
> -   TiKV、 TiFlash、および TiDB Binlogコンポーネントは非同期にオフラインになり、停止プロセスに時間がかかるため、 TiUP は別の方法でそれらをオフラインにします。詳細については、 [コンポーネントのオフラインプロセスの特別な処理](/tiup/tiup-component-cluster-scale-in.md#particular-handling-of-components-offline-process)参照してください。
> -   TiKV の PD クライアントは、PD ノードのリストをキャッシュします。現在のバージョンの TiKV には、PD ノードを自動的かつ定期的に更新するメカニズムがあり、TiKV によってキャッシュされた PD ノードのリストが期限切れになる問題を軽減するのに役立ちます。ただし、PD をスケールアウトした後は、スケーリング前に存在していたすべての PD ノードを一度に直接削除することは避けてください。必要に応じて、以前から存在していたすべての PD ノードをオフラインにする前に、PD リーダーを新しく追加された PD ノードに切り替えてください。

1.  ノード ID 情報をビュー。

    ```shell
    tiup cluster display <cluster-name>
    ```

        Starting /root/.tiup/components/cluster/v1.12.3/cluster display <cluster-name>
        TiDB Cluster: <cluster-name>
        TiDB Version: v7.5.1
        ID              Role         Host        Ports                            Status  Data Dir                Deploy Dir
        --              ----         ----        -----                            ------  --------                ----------
        10.0.1.3:8300   cdc          10.0.1.3    8300                             Up      data/cdc-8300           deploy/cdc-8300
        10.0.1.4:8300   cdc          10.0.1.4    8300                             Up      data/cdc-8300           deploy/cdc-8300
        10.0.1.4:2379   pd           10.0.1.4    2379/2380                        Healthy data/pd-2379            deploy/pd-2379
        10.0.1.1:20160  tikv         10.0.1.1    20160/20180                      Up      data/tikv-20160         deploy/tikv-20160
        10.0.1.2:20160  tikv         10.0.1.2    20160/20180                      Up      data/tikv-20160         deploy/tikv-20160
        10.0.1.5:20160  tikv         10.0.1.5    20160/20180                      Up      data/tikv-20160         deploy/tikv-20160
        10.0.1.3:4000   tidb         10.0.1.3    4000/10080                       Up      -                       deploy/tidb-4000
        10.0.1.4:4000   tidb         10.0.1.4    4000/10080                       Up      -                       deploy/tidb-4000
        10.0.1.5:4000   tidb         10.0.1.5    4000/10080                       Up      -                       deploy/tidb-4000
        10.0.1.3:9000   tiflash      10.0.1.3    9000/8123/3930/20170/20292/8234  Up      data/tiflash-9000       deploy/tiflash-9000
        10.0.1.4:9000   tiflash      10.0.1.4    9000/8123/3930/20170/20292/8234  Up      data/tiflash-9000       deploy/tiflash-9000
        10.0.1.5:9090   prometheus   10.0.1.5    9090                             Up      data/prometheus-9090    deploy/prometheus-9090
        10.0.1.5:3000   grafana      10.0.1.5    3000                             Up      -                       deploy/grafana-3000
        10.0.1.5:9093   alertmanager 10.0.1.5    9093/9294                        Up      data/alertmanager-9093  deploy/alertmanager-9093

2.  スケールイン コマンドを実行します。

    ```shell
    tiup cluster scale-in <cluster-name> --node 10.0.1.5:20160
    ```

    `--node`パラメータは、オフラインにするノードの ID です。

    `Scaled cluster <cluster-name> in successfully`表示された場合、スケールイン操作は成功しています。

3.  クラスター構成を更新します。

    > **注記：**
    >
    > この操作は、PD ノードを削除した後にのみ必要です。TiDB ノードまたは TiKV ノードのみを削除する場合、この操作は不要です。

    1.  クラスター構成を更新します。

        ```shell
        tiup cluster reload <cluster-name> --skip-restart
        ```

    2.  Prometheus の設定を更新し、Prometheus を再起動します。

        > **注記：**
        >
        > TiUP v1.15.0 以降のバージョンを使用している場合は、この手順をスキップしてください。v1.15.0 より前のバージョンのTiUPを使用している場合は、次のコマンドを実行して Prometheus 構成を更新し、Prometheus を再起動します。

        ```shell
        tiup cluster reload <cluster-name> -R prometheus
        ```

4.  クラスターのステータスを確認します。

    スケールイン プロセスには時間がかかります。スケールインのステータスを確認するには、次のコマンドを実行します。

    ```shell
    tiup cluster display <cluster-name>
    ```

    スケールインするノードが`Tombstone`なると、スケールイン操作は成功します。

    ブラウザを使用して[http://10.0.1.5:3000](http://10.0.1.5:3000)監視プラットフォームにアクセスし、クラスターのステータスを表示します。

現在のトポロジは次のとおりです。

| ホストIP    | サービス                       |
| :------- | :------------------------- |
| 10.0.1.3 | TiDB + TiFlash + TiCDC     |
| 10.0.1.4 | TiDB + PD + TiFlash+ TiCDC |
| 10.0.1.5 | TiDB + モニター**(TiKV は削除)**  |
| 10.0.1.1 | ティクヴ                       |
| 10.0.1.2 | ティクヴ                       |

## TiFlashクラスターのスケールイン {#scale-in-a-tiflash-cluster}

このセクションでは、 `10.0.1.4`ホストからTiFlashノードを削除する方法を例示します。

### 1. 残りのTiFlashノードの数に応じてテーブルのレプリカの数を調整する {#1-adjust-the-number-of-replicas-of-the-tables-according-to-the-number-of-remaining-tiflash-nodes}

1.  スケールイン後のTiFlashノードの数よりも多くのTiFlashレプリカを持つテーブルがあるかどうかを照会します。1 `tobe_left_nodes`スケールイン後のTiFlashノードの数を意味します。クエリ結果が空の場合は、 TiFlashでスケーリングを開始できます。クエリ結果が空でない場合は、関連するテーブルのTiFlashレプリカの数を変更する必要があります。

    ```sql
    SELECT * FROM information_schema.tiflash_replica WHERE REPLICA_COUNT >  'tobe_left_nodes';
    ```

2.  スケールイン後のTiFlashノードの数より多いTiFlashレプリカを持つすべてのテーブルに対して次のステートメントを実行します。1 `new_replica_num` `tobe_left_nodes`以下である必要があります。

    ```sql
    ALTER TABLE <db-name>.<table-name> SET tiflash replica 'new_replica_num';
    ```

3.  手順 1 を再度実行し、スケールイン後のTiFlashノードの数を超えるTiFlashレプリカを持つテーブルがないことを確認します。

### 2.スケールイン操作を実行する {#2-perform-the-scale-in-operation}

次のいずれかのソリューションを使用してスケールイン操作を実行します。

#### 解決策1. TiUPを使用してTiFlashノードを削除する {#solution-1-use-tiup-to-remove-a-tiflash-node}

1.  削除するノードの名前を確認します。

    ```shell
    tiup cluster display <cluster-name>
    ```

2.  TiFlashノードを削除します (手順 1 のノード名が`10.0.1.4:9000`であると想定します)。

    ```shell
    tiup cluster scale-in <cluster-name> --node 10.0.1.4:9000
    ```

#### 解決策2. TiFlashノードを手動で削除する {#solution-2-manually-remove-a-tiflash-node}

特別な場合 (ノードを強制的に停止する必要がある場合など)、またはTiUPスケールイン操作が失敗した場合は、次の手順に従ってTiFlashノードを手動で削除できます。

1.  このTiFlashノードに対応するストア ID を表示するには、pd-ctl の store コマンドを使用します。

    -   [pd-ctl](/pd-control.md)に store コマンドを入力します (バイナリ ファイルは tidb-ansible ディレクトリの`resources/bin`の下にあります)。

    -   TiUPデプロイメントを使用する場合は、 `pd-ctl` `tiup ctl:v<CLUSTER_VERSION> pd`に置き換えます。

    ```shell
    tiup ctl:v<CLUSTER_VERSION> pd -u http://<pd_ip>:<pd_port> store
    ```

    > **注記：**
    >
    > クラスター内に複数の PD インスタンスが存在する場合は、上記のコマンドでアクティブな PD インスタンスの IP アドレス:ポートのみを指定する必要があります。

2.  pd-ctl でTiFlashノードを削除します。

    -   pd-ctl に`store delete <store_id>`入力します ( `<store_id>`前の手順で見つかったTiFlashノードのストア ID です)。

    -   TiUPデプロイメントを使用する場合は、 `pd-ctl` `tiup ctl:v<CLUSTER_VERSION> pd`に置き換えます。

        ```shell
        tiup ctl:v<CLUSTER_VERSION> pd -u http://<pd_ip>:<pd_port> store delete <store_id>
        ```

    > **注記：**
    >
    > クラスター内に複数の PD インスタンスが存在する場合は、上記のコマンドでアクティブな PD インスタンスの IP アドレス:ポートのみを指定する必要があります。

3.  TiFlashプロセスを停止する前に、 TiFlashノードのストアが消えるか、 `state_name` `Tombstone`になるまで待ちます。

4.  TiFlashデータ ファイルを手動で削除します (場所は、クラスター トポロジ ファイルのTiFlash構成の下の`data_dir`ディレクトリにあります)。

5.  次のコマンドを使用して、クラスター トポロジからダウンするTiFlashノードに関する情報を削除します。

    ```shell
    tiup cluster scale-in <cluster-name> --node <pd_ip>:<pd_port> --force
    ```

> **注記：**
>
> クラスター内のすべてのTiFlashノードの実行が停止する前に、 TiFlashにレプリケートされたすべてのテーブルがキャンセルされていない場合は、PD 内のレプリケーション ルールを手動でクリーンアップする必要があります。そうしないと、 TiFlashノードを正常に停止できません。

PD でレプリケーション ルールを手動でクリーンアップする手順は次のとおりです。

1.  現在の PD インスタンス内のTiFlashに関連するすべてのデータ複製ルールをビュー。

    ```shell
    curl http://<pd_ip>:<pd_port>/pd/api/v1/config/rules/group/tiflash
    ```

        [
          {
            "group_id": "tiflash",
            "id": "table-45-r",
            "override": true,
            "start_key": "7480000000000000FF2D5F720000000000FA",
            "end_key": "7480000000000000FF2E00000000000000F8",
            "role": "learner",
            "count": 1,
            "label_constraints": [
              {
                "key": "engine",
                "op": "in",
                "values": [
                  "tiflash"
                ]
              }
            ]
          }
        ]

2.  TiFlashに関連するすべてのデータ複製ルールを削除します。1 `id` `table-45-r`であるルールを例にとります。次のコマンドで削除します。

    ```shell
    curl -v -X DELETE http://<pd_ip>:<pd_port>/pd/api/v1/config/rule/tiflash/table-45-r
    ```

3.  クラスターのステータスをビュー。

    ```shell
    tiup cluster display <cluster-name>
    ```

    ブラウザを使用して[http://10.0.1.5:3000](http://10.0.1.5:3000)監視プラットフォームにアクセスし、クラスターと新しいノードのステータスを表示します。

スケールアウト後のクラスター トポロジは次のようになります。

| ホストIP    | サービス                               |
| :------- | :--------------------------------- |
| 10.0.1.3 | TiDB + TiFlash + TiCDC             |
| 10.0.1.4 | TiDB + PD + TiCDC **(TiFlashは削除)** |
| 10.0.1.5 | TiDB+ モニター                         |
| 10.0.1.1 | ティクヴ                               |
| 10.0.1.2 | ティクヴ                               |

## TiCDC クラスターのスケールイン {#scale-in-a-ticdc-cluster}

このセクションでは、 `10.0.1.4`ホストから TiCDC ノードを削除する方法を例示します。

1.  ノードをオフラインにします。

    ```shell
    tiup cluster scale-in <cluster-name> --node 10.0.1.4:8300
    ```

2.  クラスターのステータスをビュー。

    ```shell
    tiup cluster display <cluster-name>
    ```

    ブラウザを使用して[http://10.0.1.5:3000](http://10.0.1.5:3000)監視プラットフォームにアクセスし、クラスターのステータスを表示します。

現在のトポロジは次のとおりです。

| ホストIP    | サービス                       |
| :------- | :------------------------- |
| 10.0.1.3 | TiDB + TiFlash + TiCDC     |
| 10.0.1.4 | TiDB + PD + **(TiCDCは削除）** |
| 10.0.1.5 | TiDB + モニター                |
| 10.0.1.1 | ティクヴ                       |
| 10.0.1.2 | ティクヴ                       |
