---
title: Integrate a Data App with Third-Party Tools
summary: TiDB Cloudコンソールで、 TiDB Cloud Data App を GPT や Dify などのサードパーティ ツールと統合する方法を学習します。
---

# データアプリをサードパーティツールと統合する {#integrate-a-data-app-with-third-party-tools}

サードパーティ ツールをデータ アプリに統合すると、サードパーティ ツールが提供する高度な自然言語処理機能と人工知能 (AI) 機能によってアプリケーションが強化されます。この統合により、アプリケーションはより複雑なタスクを実行し、インテリジェントなソリューションを提供できるようになります。

このドキュメントでは、TiDB Cloudコンソールでデータ アプリを GPT や Dify などのサードパーティ ツールと統合する方法について説明します。

## データアプリをGPTと統合する {#integrate-your-data-app-with-gpts}

データ アプリを[GPT](https://openai.com/blog/introducing-gpts)と統合して、インテリジェントな機能でアプリケーションを強化できます。

データ アプリを GPT と統合するには、次の手順を実行します。

1.  プロジェクトの[**データサービス**](https://tidbcloud.com/console/data-service)ページに移動します。

2.  左側のペインで、対象のデータ アプリを見つけて、対象のデータ アプリの名前をクリックし、 **[統合]**タブをクリックします。

3.  **[GPT との統合]**領域で、 **[コンフィグレーションの取得] を**クリックします。

    ![Get Configuration](https://download.pingcap.com/images/docs/tidb-cloud/data-service/GPTs1.png)

4.  表示されたダイアログ ボックスには、次のフィールドが表示されます。

    a. **API 仕様 URL** : データ アプリの OpenAPI 仕様の URL をコピーします。詳細については、 [OpenAPI仕様を使用する](/tidb-cloud/data-service-manage-data-app.md#use-the-openapi-specification)を参照してください。

    b. **API キー**: データ アプリの API キーを入力します。API キーをまだお持ちでない場合は、 **「API キーの作成」**をクリックして作成します。詳細については、 [APIキーを作成する](/tidb-cloud/data-service-api-key.md#create-an-api-key)を参照してください。

    c.**エンコードされた API キー**: 指定した API キーに相当する base64 でエンコードされた文字列をコピーします。

    ![GPTs Dialog Box](https://download.pingcap.com/images/docs/tidb-cloud/data-service/GPTs2.png)

5.  コピーした API 仕様 URL とエンコードされた API キーを GPT 構成で使用します。

## データアプリをDifyと統合する {#integrate-your-data-app-with-dify}

データ アプリを[ディファイ](https://docs.dify.ai/guides/tools)と統合すると、ベクトル距離計算、高度な類似性検索、ベクトル分析などのインテリジェントな機能でアプリケーションを強化できます。

データ アプリを Dify と統合するには、 [GPTの統合](#integrate-your-data-app-with-gpts)と同じ手順に従います。唯一の違いは、 **[統合]**タブで、 **[Dify との統合]**領域の**[コンフィグレーションを取得] を**クリックする必要があることです。
