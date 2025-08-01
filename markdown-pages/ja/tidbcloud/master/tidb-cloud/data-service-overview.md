---
title: TiDB Cloud Data Service (Beta) Overview
summary: TiDB Cloudのデータ サービスとそのシナリオについて学習します。
---

# TiDB Cloudデータ サービス (ベータ版) の概要 {#tidb-cloud-data-service-beta-overview}

TiDB Cloud [データサービス（ベータ版）](https://tidbcloud.com/project/data-service)は、バックエンド アプリケーション開発を簡素化し、開発者が拡張性が高く安全なデータ駆動型アプリケーションを迅速に構築できるようにする、完全に管理されたローコードの BaaS (Backend-as-a-Service) ソリューションです。

Data Service を使用すると、カスタム API エンドポイントを使用して HTTPS リクエスト経由でTiDB Cloudデータにアクセスできます。この機能は、サーバーレスアーキテクチャを使用してコンピューティングリソースと柔軟なスケーリングを処理するため、インフラストラクチャやメンテナンスコストを気にすることなく、エンドポイントのクエリロジックに集中できます。

> **注記：**
>
> データサービスは[TiDB Cloudサーバーレス](/tidb-cloud/select-cluster-tier.md#tidb-cloud-serverless)クラスターでご利用いただけます。TiDB TiDB Cloud Dedicatedクラスターでデータサービスをご利用になる場合は、 [TiDB Cloudサポート](/tidb-cloud/tidb-cloud-support.md)お問い合わせください。

Data Service のエンドポイントは、SQL 文を実行するためにカスタマイズできる Web API です。SQL 文には、 `WHERE`句で使用する値などのパラメータを指定できます。クライアントがエンドポイントを呼び出し、リクエスト URL でパラメータの値を指定すると、エンドポイントは指定されたパラメータを使用して対応する SQL 文を実行し、結果を HTTP レスポンスの一部として返します。

エンドポイントをより効率的に管理するには、データアプリを使用できます。データサービスにおけるデータアプリは、特定のアプリケーションのデータにアクセスするために使用できるエンドポイントのコレクションです。データアプリを作成することで、エンドポイントをグループ化し、APIキーを使用して承認設定を構成し、エンドポイントへのアクセスを制限できます。これにより、承認されたユーザーのみがデータにアクセスして操作できるようにし、アプリケーションのセキュリティを強化できます。

> **ヒント：**
>
> TiDB Cloudは、TiDBクラスタ用のChat2Query APIを提供します。有効にすると、 TiDB Cloudは自動的に**Chat2Query**と呼ばれるシステムデータアプリと、データサービスにChat2Dataエンドポイントを作成します。このエンドポイントを呼び出すことで、AIが指示を与えるだけでSQL文を生成・実行できるようになります。
>
> 詳細については[Chat2Query APIを使い始める](/tidb-cloud/use-chat2query-api.md)参照してください。

## シナリオ {#scenarios}

データサービスを使用すると、TiDB CloudをHTTPS対応のあらゆるアプリケーションやサービスとシームレスに統合できます。以下に、典型的な使用シナリオをいくつかご紹介します。

-   モバイル アプリケーションまたは Web アプリケーションから TiDB クラスターのデータベースに直接アクセスします。
-   サーバーレス エッジ関数を使用してエンドポイントを呼び出し、データベース接続プールによって発生するスケーラビリティの問題を回避します。
-   TiDB Cloudをデータ可視化プロジェクトに統合するには、データサービスをデータソースとして使用します。これにより、データベース接続のユーザー名とパスワードの漏洩を防ぎ、APIのセキュリティと使いやすさを向上させます。
-   MySQLインターフェースがサポートしていない環境からデータベースに接続します。これにより、データへのアクセスにおける柔軟性と選択肢が広がります。

## 次は何？ {#what-s-next}

-   [データサービスを始める](/tidb-cloud/data-service-get-started.md)
-   [Chat2Query APIを使い始める](/tidb-cloud/use-chat2query-api.md)
-   [データアプリを管理する](/tidb-cloud/data-service-manage-data-app.md)
-   [エンドポイントの管理](/tidb-cloud/data-service-manage-endpoint.md)
