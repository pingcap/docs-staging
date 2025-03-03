---
title: Use WebUI to Manage DM migration tasks
summary: WebUI を使用して DM 移行タスクを管理する方法を学習します。
---

# WebUIを使用してDM移行タスクを管理する {#use-webui-to-manage-dm-migration-tasks}

DM WebUI は、 TiDB データ移行 (DM) タスクを管理するための Web ベースの GUI プラットフォームです。このプラットフォームは、多数の移行タスクをシンプルかつ直感的に管理する方法を提供し、dmctl コマンドライン ツールを使用する必要がなくなります。

このドキュメントでは、 DM WebUIへのアクセス方法、前提条件、インターフェース上の各ページの使用例、注意点などを紹介します。

> **警告：**
>
> -   DM WebUI は現在実験的機能です。実本番環境での使用はお勧めしません。
> -   DM WebUIの`task`のライフサイクルが変更されたため、 DM WebUIと dmctl を同時に使用することは推奨されません。

DM WebUI には次のページがあります。

-   **移住**
    -   **タスク**: タスク作成へのエントリを提供し、各移行タスクの詳細情報を表示します。このページは、移行タスクの監視、作成、削除、および構成に役立ちます。
    -   **ソース**: 移行タスクのアップストリーム データ ソースの情報を設定します。このページでは、アップストリーム設定の作成と削除、アップストリーム設定に対応するタスク ステータスの監視、アップストリーム設定の変更など、データ移行環境のアップストリーム設定を管理できます。
    -   **レプリケーションの詳細**: 移行タスクの詳細なステータス情報を表示します。このページでは、上流と下流の構成情報とデータベース名、ソース テーブルとターゲット テーブルの関係など、指定されたフィルターに基づいて詳細な構成とステータス情報を表示できます。
-   **クラスタ**
    -   **メンバー**: DM クラスター内のすべてのマスター ノードとワーカー ノードのリスト、およびワーカー ノードとソース間のバインディング関係を表示します。このページでは、現在の DM クラスターの構成情報と各ワーカーのステータス情報を表示できます。また、基本的な管理もこのページで提供されます。

インターフェースは次のとおりです。

![webui](https://docs-download.pingcap.com/media/images/docs/dm/dm-webui-preview-en.png)

## アクセス方法 {#access-method}

[オープンAPI](/dm/dm-open-api.md#maintain-dm-clusters-using-openapi)有効にすると、DM クラスターの任意のマスター ノードからDM WebUIにアクセスできます。アクセス ポートはデフォルトで`8261`であり、DM OpenAPI のものと同じです。アクセス アドレスの例を次に示します: `http://{master_ip}:{master_port}/dashboard/` 。

## 移住 {#migration}

**移行には、****ソース**、**タスク**、および**レプリケーションの詳細**ページが含まれます。

### ソース {#source}

移行タスクを作成する前に、レプリケーション タスクのアップストリームのデータ ソース情報を作成する必要があります。アップストリーム構成は、 **[ソース]**ページで作成できます。ソースを作成するときは、次の項目に注意してください。

-   プライマリインスタンスとセカンダリインスタンス間で自動フェイルオーバーがある場合は、アップストリーム MySQL で GTID を有効にし、アップストリーム構成を作成するときに GTID を`True`に設定します。そうしないと、フェイルオーバー中に移行タスクが中断されます (AWS Auroraを除く)。
-   MySQL インスタンスを一時的にオフラインにする必要がある場合は、インスタンスを無効にすることができます。ただし、MySQL インスタンスを無効にするときは、移行タスクを実行している他の MySQL インスタンスは DDL 操作を実行しないでください。そうしないと、無効になったインスタンスは、有効にした後でデータを適切に移行できません。
-   複数の移行タスクが同じアップストリームを使用すると、追加の負荷が発生する可能性があります。リレー ログを有効にすると、アップストリームへの影響を軽減できるため、リレー ログを有効にすることをお勧めします。

### タスク {#task}

**タスク**ページで移行タスクの詳細を表示し、移行タスクを作成できます。

#### 移行タスクの詳細をビュー {#view-migration-task-details}

タスク リストでタスク名をクリックすると、右側から詳細ページが表示されます。詳細ページには、より詳細なタスク ステータス情報が表示されます。このページでは、各サブタスクのステータスと移行タスクの現在の構成情報を表示できます。

DM では、移行タスクの各サブタスクは、フル ダンプ -&gt; フル インポート (ロード) -&gt; 増分レプリケーション (同期) という異なる段階にある場合があります。そのため、タスクの現在の段階はサブタスク ステータスの統計とともに表示され、タスクの実行ステータスをよりよく理解するのに役立ちます。

#### 移行タスクを作成する {#create-migration-tasks}

このページで移行タスクを作成するには、右上隅にある**[追加]**ボタンをクリックします。移行タスクを作成するには、次のいずれかの方法を使用できます。

-   WebUI の指示に従って、WebUI で必要な情報を段階的に入力します。この方法は初心者や日常的な使用に適しています。
-   構成ファイルを使用する。JSON 形式の構成ファイルを貼り付けるか書き込んで、移行タスクを作成します。この方法は、より多くのパラメータの調整をサポートしており、上級ユーザーに適しています。

### レプリケーションの詳細 {#replication-detail}

移行タスクに設定された移行ルールのステータスは、**レプリケーションの詳細**ページで確認できます。このページでは、タスク、ソース、データベース名によるクエリがサポートされています。

クエリ結果には、上流テーブルと下流テーブルの対応する情報が含まれるため、クエリ結果が多すぎるとページの応答が遅くなる可能性があるため、 `.*`使用するときは注意してください。

## クラスタ {#cluster}

### メンバー {#members}

**[メンバー]**ページには、DM クラスター内のすべてのマスター ノードとワーカー ノード、およびワーカー ノードとソース間のバインド関係が表示されます。
