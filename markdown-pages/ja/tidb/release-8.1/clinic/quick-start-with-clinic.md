---
title: Quick Start Guide for PingCAP Clinic
summary: PingCAPクリニック は、クラスター診断データを迅速に収集して表示するサービスです。Diag クライアントと Clinic Server で構成されています。ユーザーは Diag を使用して診断データを収集し、それを Clinic Server にアップロードして、Health Report の結果を表示できます。使用する前に、ユーザーは Diag をインストールし、Clinic Server にログインし、組織を作成し、アクセス トークンを取得し、Diag でトークンとリージョンを設定する必要があります。データを収集してアップロードした後、ユーザーはデータ アクセス リンクを取得して Health Report を表示できます。
---

# PingCAPクリニッククイック スタート ガイド {#quick-start-guide-for-pingcap-clinic}

このドキュメントでは、 PingCAPクリニック診断サービス (PingCAPクリニック) を使用して、クラスター診断データを迅速に収集、アップロード、表示する方法について説明します。

PingCAPクリニック は、 [診断クライアント](https://github.com/pingcap/diag) (Diag と略記) と Clinic Server クラウド サービス (Clinic Server と略記) の 2 つのコンポーネントで構成されています。これら 2 つのコンポーネントの詳細については、 [PingCAPクリニックの概要](/clinic/clinic-introduction.md)を参照してください。

## ユーザーシナリオ {#user-scenarios}

-   PingCAP テクニカル サポートにリモートでサポートを求める際にクラスターの問題を正確に特定し、迅速に解決するには、Diag を使用して診断データを収集し、収集したデータを Clinic Server にアップロードして、テクニカル サポートにデータ アクセス リンクを提供します。
-   クラスターが正常に実行されており、クラスターのステータスを確認する必要がある場合は、Diag を使用して診断データを収集し、そのデータを Clinic Server にアップロードして、Health Report の結果を表示できます。

> **注記：**
>
> -   データの収集とアップロードを行う以下の方法は、 [TiUPを使用して展開されたクラスター](/production-deployment-using-tiup.md)に**のみ**適用されます。Kubernetes 上のTiDB Operator を使用してデプロイされたクラスターの場合は、 [TiDB Operator環境向けPingCAPクリニック](https://docs.pingcap.com/tidb-in-kubernetes/stable/clinic-user-guide)参照してください。
> -   PingCAPクリニックによって収集された診断データは、クラスターの問題のトラブルシューティングに**のみ**使用されます。

## 前提条件 {#prerequisites}

PingCAPクリニック を使用する前に、Diag をインストールし、データをアップロードするための環境を準備する必要があります。

1.  TiUPがインストールされているコントロール マシンで、次のコマンドを実行して Diag をインストールします。

    ```bash
    tiup install diag
    ```

2.  クリニックサーバーにログインします。

    <SimpleTab groupId="clinicServer">
     <div label="Clinic Server for international users" value="clinic-us">

    [海外ユーザー向けクリニックサーバー](https://clinic.pingcap.com)に進み、 **「TiDB アカウントで続行」**を選択して、 TiDB Cloudログイン ページに入ります。TiDB TiDB Cloudアカウントをお持ちでない場合は、そのページでアカウントを作成してください。

    > **注記：**
    >
    > TiDB Cloudアカウントは、SSO モードで Clinic Server にログインする場合にのみ使用され、 TiDB Cloudサービスにアクセスするために必須ではありません。

    </div>

    <div label="Clinic Server for users in the Chinese mainland" value="clinic-cn">

    [中国本土のユーザー向けクリニックサーバー](https://clinic.pingcap.com.cn)に進み、 **「AskTUGで続行」**を選択してAskTUGコミュニティログインページに入ります。AskTUGアカウントをお持ちでない場合は、そのページでアカウントを作成してください。

    </div>
     </SimpleTab>

3.  Clinic Server 上に組織を作成します。組織は TiDB クラスターの集合です。作成した組織に診断データをアップロードできます。

4.  データをアップロードするには、アクセス トークンを取得します。Diag を通じて収集したデータをアップロードする場合、データが安全に分離されていることを確認するために、ユーザー認証用のトークンが必要です。クリニック サーバーからすでにトークンを取得している場合は、そのトークンを再利用できます。

    トークンを取得するには、クラスタページの右下隅にあるアイコンをクリックし、 **[診断ツールのアクセス トークンを取得]**を選択して、ポップアップ ウィンドウで**+**をクリックします。表示されるトークンをコピーして保存したことを確認してください。

    ![An example of a token](https://docs-download.pingcap.com/media/images/docs/clinic-get-token.png)

    > **注記：**
    >
    > -   データ セキュリティのため、TiDB はトークンの作成時にのみトークン情報を表示します。情報を紛失した場合は、古いトークンを削除して新しいトークンを作成できます。
    > -   トークンはデータのアップロードにのみ使用されます。

5.  Diag にトークンと`region`設定します。

    -   `clinic.token`設定するには、次のコマンドを実行します。

        ```bash
        tiup diag config clinic.token ${token-value}
        ```

    -   `clinic.region`設定するには、次のコマンドを実行します。

    `region`データをアップロードするときにデータのパック化に使用される暗号化証明書とターゲット サービスを決定します。例:

    > **注記：**
    >
    > -   Diag v0.9.0 以降のバージョンでは設定`region`がサポートされます。
    > -   Diag v0.9.0 より前のバージョンの場合、データはデフォルトで中国地域の Clinic Server にアップロードされます。これらのバージョンで`region`設定するには、 `tiup update diag`コマンドを実行して Diag を最新バージョンにアップグレードしてから、Diag で`region`設定します。

    <SimpleTab groupId="clinicServer">
     <div label="Clinic Server for international users" value="clinic-us">

    海外ユーザー向けに Clinic Server を使用する場合は、次のコマンドを使用して`region`から`US`設定します。

    ```bash
    tiup diag config clinic.region US
    ```

    </div>
     <div label="Clinic Server for users in the Chinese mainland" value="clinic-cn">

    中国本土のユーザー向けに Clinic Server を使用する場合は、次のコマンドを使用して`region`から`CN`設定します。

    ```bash
    tiup diag config clinic.region CN
    ```

    </div>

    </SimpleTab>

6.  (オプション) ログ編集を有効にします。

    TiDB が詳細なログ情報を提供する場合、ログに機密情報 (ユーザーデータなど) が出力されることがあります。ローカル ログと Clinic Server に機密情報が漏洩するのを防ぐには、TiDB 側でログ編集を有効にします。詳細については、 [ログ編集](/log-redaction.md#log-redaction-in-tidb-side)参照してください。

## 手順 {#steps}

1.  Diag を実行して診断データを収集します。

    たとえば、現在の時刻に基づいて 4 時間前から 2 時間前までの診断データを収集するには、次のコマンドを実行します。

    ```bash
    tiup diag collect ${cluster-name} -f="-4h" -t="-2h"
    ```

    コマンドを実行しても、Diag はすぐにデータの収集を開始しません。代わりに、Diag は、続行するかどうかを確認できるように、推定データ サイズとターゲット データstorageパスを出力に示します。データの収集を開始することを確認するには、 `Y`入力します。

    収集が完了すると、Diag は収集されたデータが保存されているフォルダー パスを提供します。

2.  収集したデータをクリニックサーバーにアップロードします。

    > **注記：**
    >
    > アップロードするデータ（収集されたデータを含む圧縮ファイル）のサイズは 3 GB**以下に**する必要があります。そうでない場合、データのアップロードは失敗します。

    -   クラスターが配置されているネットワークがインターネットにアクセスできる場合は、次のコマンドを使用して、収集されたデータを含むフォルダーを直接アップロードできます。

        ```bash
        tiup diag upload ${filepath}
        ```

        アップロードが完了すると、出力に`Download URL`表示されます。

        > **注記：**
        >
        > この方法でデータをアップロードする場合は、Diag v0.9.0 以降のバージョンを使用する必要があります。Diag のバージョンは実行時に取得できます。Diag のバージョンが 0.9.0 より前の場合は、 `tiup update diag`コマンドを使用して Diag を最新バージョンにアップグレードできます。

    -   クラスターが配置されているネットワークがインターネットにアクセスできない場合は、収集したデータをパックしてパッケージをアップロードする必要があります。詳細については、 [方法2. データをパックしてアップロードする](/clinic/clinic-user-guide-for-tiup.md#method-2-pack-and-upload-data)参照してください。

3.  アップロードが完了したら、コマンド出力の`Download URL`からデータ アクセス リンクを取得します。

    デフォルトでは、診断データには、クラスター名、クラスター トポロジ情報、収集された診断データ内のログ コンテンツ、および収集されたデータ内のメトリックに基づいて再編成された Grafana ダッシュボード情報が含まれます。

    データを使用してクラスターの問題を自分でトラブルシューティングすることも、PingCAP テクニカル サポート スタッフにデータ アクセス リンクを提供してリモート トラブルシューティングを容易にすることもできます。

4.  健康レポートの結果をビュー

    データがアップロードされると、Clinic Server はバックグラウンドで自動的にデータを処理します。ヘルス レポートは約 5 ～ 15 分で生成されます。診断データ リンクを開いて [ヘルス レポート] をクリックすると、レポートを表示できます。

## 次は何か {#what-s-next}

-   [PingCAPクリニックの概要](/clinic/clinic-introduction.md)
-   [PingCAPクリニック を使用してクラスターをトラブルシューティングする](/clinic/clinic-user-guide-for-tiup.md)
-   [PingCAPクリニック診断データ](/clinic/clinic-data-instruction-for-tiup.md)
