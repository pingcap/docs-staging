---
title: Connect to TiDB with Sequelize
summary: Learn how to connect to TiDB using Sequelize. This tutorial gives Node.js sample code snippets that work with TiDB using Sequelize.
---

# Sequelize で TiDB に接続する {#connect-to-tidb-with-sequelize}

TiDB は MySQL 互換のデータベースであり、 [続編](https://sequelize.org/) Node.js 用の人気のある ORM フレームワークです。

このチュートリアルでは、TiDB と Sequelize を使用して次のタスクを実行する方法を学習します。

-   環境を設定します。
-   Sequelize を使用して TiDB クラスターに接続します。
-   アプリケーションをビルドして実行します。オプションで、基本的な CRUD 操作用の[サンプルコードスニペット](#sample-code-snippets)を見つけることができます。

> **注記**
>
> このチュートリアルは、TiDB Serverless、TiDB Dedicated、および TiDB Self-Hosted で機能します。

## 前提条件 {#prerequisites}

このチュートリアルを完了するには、次のものが必要です。

-   [Node.js **18**](https://nodejs.org/en/download/)以降。
-   [ギット](https://git-scm.com/downloads) 。
-   TiDB クラスター。

<CustomContent platform="tidb">

**TiDB クラスターがない場合は、次のように作成できます。**

-   (推奨) [TiDB サーバーレス クラスターの作成](/develop/dev-guide-build-cluster-in-cloud.md)に従って、独自のTiDB Cloudクラスターを作成します。
-   [ローカルテストTiDBクラスタをデプロイ](/quick-start-with-tidb.md#deploy-a-local-test-cluster)または[本番のTiDBクラスタをデプロイ](/production-deployment-using-tiup.md)に従ってローカル クラスターを作成します。

</CustomContent>
<CustomContent platform="tidb-cloud">

**TiDB クラスターがない場合は、次のように作成できます。**

-   (推奨) [TiDB サーバーレス クラスターの作成](/develop/dev-guide-build-cluster-in-cloud.md)に従って、独自のTiDB Cloudクラスターを作成します。
-   [ローカルテストTiDBクラスタをデプロイ](https://docs.pingcap.com/tidb/stable/quick-start-with-tidb#deploy-a-local-test-cluster)または[本番のTiDBクラスタをデプロイ](https://docs.pingcap.com/tidb/stable/production-deployment-using-tiup)に従ってローカル クラスターを作成します。

</CustomContent>

## サンプルアプリを実行してTiDBに接続する {#run-the-sample-app-to-connect-to-tidb}

このセクションでは、サンプル アプリケーション コードを実行して TiDB に接続する方法を示します。

> **注記**
>
> 完全なコード スニペットと実行手順については、 [tidb-samples/tidb-nodejs-sequelize-クイックスタート](https://github.com/tidb-samples/tidb-nodejs-sequelize-quickstart) GitHub リポジトリを参照してください。

### ステップ1: サンプルアプリのリポジトリをクローンする {#step-1-clone-the-sample-app-repository}

サンプル コード リポジトリを複製するには、ターミナル ウィンドウで次のコマンドを実行します。

```bash
git clone git@github.com:tidb-samples/tidb-nodejs-sequelize-quickstart.git
cd tidb-nodejs-sequelize-quickstart
```

### ステップ2: 依存関係をインストールする {#step-2-install-dependencies}

次のコマンドを実行して、サンプル アプリに必要なパッケージ ( `sequelize`を含む) をインストールします。

```bash
npm install
```

### ステップ3: 接続情報を構成する {#step-3-configure-connection-information}

選択した TiDB デプロイメント オプションに応じて、TiDB クラスターに接続します。

<SimpleTab>

<div label="TiDB Serverless">

1.  [**クラスター**](https://tidbcloud.com/console/clusters)ページに移動し、ターゲット クラスターの名前をクリックして概要ページに移動します。

2.  右上隅の**「接続」**をクリックします。接続ダイアログが表示されます。

3.  接続ダイアログの構成が動作環境と一致していることを確認します。

    -   **エンドポイントタイプは**`Public`に設定されています

    -   **ブランチ**は`main`に設定されています

    -   **接続先は**`General`に設定されています

    -   **オペレーティング システムは**環境に適合します。

    > **注記**
    >
    > Node.js アプリケーションでは、TLS (SSL) 接続を確立するときに Node.js がデフォルトで組み込みの[Mozilla CA 証明書](https://wiki.mozilla.org/CA/Included_Certificates)使用するため、SSL CA 証明書を提供する必要はありません。

4.  ランダムなパスワードを作成するには、 **「パスワードの生成」を**クリックします。

    > **ヒント**
    >
    > 以前にパスワードを生成したことがある場合は、元のパスワードを使用するか、 **「パスワードのリセット」**をクリックして新しいパスワードを生成することができます。

5.  次のコマンドを実行して`.env.example`コピーし、名前を`.env`に変更します。

    ```shell
    cp .env.example .env
    ```

6.  `.env`ファイルを編集し、環境変数を次のように設定し、接続ダイアログで対応するプレースホルダー`{}`を接続パラメータに置き換えます。

    ```dotenv
    TIDB_HOST='{host}'
    TIDB_PORT='4000'
    TIDB_USER='{user}'
    TIDB_PASSWORD='{password}'
    TIDB_DB_NAME='test'
    TIDB_ENABLE_SSL='true'
    ```

7.  `.env`ファイルを保存します。

</div>

<div label="TiDB Dedicated">

1.  [**クラスター**](https://tidbcloud.com/console/clusters)ページに移動し、ターゲット クラスターの名前をクリックして概要ページに移動します。

2.  右上隅の**「接続」**をクリックします。接続ダイアログが表示されます。

3.  **「どこからでもアクセスを許可」**をクリックし、 **「CA 証明書のダウンロード」**をクリックして CA 証明書をダウンロードします。

    接続文字列を取得する方法の詳細については、 [TiDB専用標準接続](https://docs.pingcap.com/tidbcloud/connect-via-standard-connection)を参照してください。

4.  次のコマンドを実行して`.env.example`コピーし、名前を`.env`に変更します。

    ```shell
    cp .env.example .env
    ```

5.  `.env`ファイルを編集し、環境変数を次のように設定し、接続ダイアログで対応するプレースホルダー`{}`を接続パラメータに置き換えます。

    ```shell
    TIDB_HOST='{host}'
    TIDB_PORT='4000'
    TIDB_USER='{user}'
    TIDB_PASSWORD='{password}'
    TIDB_DB_NAME='test'
    TIDB_ENABLE_SSL='true'
    TIDB_CA_PATH='{path/to/ca}'
    ```

6.  `.env`ファイルを保存します。

</div>

<div label="TiDB Self-Hosted">

1.  次のコマンドを実行して`.env.example`コピーし、名前を`.env`に変更します。

    ```shell
    cp .env.example .env
    ```

2.  `.env`ファイルを編集し、環境変数を次のように設定し、接続ダイアログで対応するプレースホルダー`{}`を接続パラメータに置き換えます。

    ```shell
    TIDB_HOST='{host}'
    TIDB_PORT='4000'
    TIDB_USER='root'
    TIDB_PASSWORD='{password}'
    TIDB_DB_NAME='test'
    ```

    TiDB をローカルで実行している場合、デフォルトのホスト アドレスは`127.0.0.1`で、パスワードは空です。

3.  `.env`ファイルを保存します。

</div>

</SimpleTab>

### ステップ4: サンプルアプリを実行する {#step-4-run-the-sample-app}

サンプルコードを実行するには、次のコマンドを実行します。

```shell
npm start
```

<details><summary>**予想される出力(一部):**</summary>

```shell
INFO (app/10117): Getting sequelize instance...
Executing (default): SELECT 1+1 AS result
Executing (default): DROP TABLE IF EXISTS `players`;
Executing (default): CREATE TABLE IF NOT EXISTS `players` (`id` INTEGER NOT NULL auto_increment  COMMENT 'The unique ID of the player.', `coins` INTEGER NOT NULL COMMENT 'The number of coins that the player had.', `goods` INTEGER NOT NULL COMMENT 'The number of goods that the player had.', `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;
Executing (default): SHOW INDEX FROM `players`
Executing (default): INSERT INTO `players` (`id`,`coins`,`goods`,`createdAt`,`updatedAt`) VALUES (1,100,100,'2023-08-31 09:10:11','2023-08-31 09:10:11'),(2,200,200,'2023-08-31 09:10:11','2023-08-31 09:10:11'),(3,300,300,'2023-08-31 09:10:11','2023-08-31 09:10:11'),(4,400,400,'2023-08-31 09:10:11','2023-08-31 09:10:11'),(5,500,500,'2023-08-31 09:10:11','2023-08-31 09:10:11');
Executing (default): SELECT `id`, `coins`, `goods`, `createdAt`, `updatedAt` FROM `players` AS `players` WHERE `players`.`coins` > 300;
Executing (default): UPDATE `players` SET `coins`=?,`goods`=?,`updatedAt`=? WHERE `id` = ?
Executing (default): DELETE FROM `players` WHERE `id` = 6
```

</details>

## サンプルコードスニペット {#sample-code-snippets}

次のサンプル コード スニペットを参照して、独自のアプリケーション開発を完了することができます。

完全なサンプル コードとその実行方法については、 [tidb-samples/tidb-nodejs-sequelize-クイックスタート](https://github.com/tidb-samples/tidb-nodejs-sequelize-quickstart)リポジトリを参照してください。

### TiDBに接続する {#connect-to-tidb}

次のコードは、環境変数で定義されたオプションを使用して TiDB への接続を確立します。

```typescript
// src/lib/tidb.ts
import { Sequelize } from 'sequelize';

export function initSequelize() {
  return new Sequelize({
    dialect: 'mysql',
    host: process.env.TIDB_HOST || 'localhost',     // TiDB host, for example: {gateway-region}.aws.tidbcloud.com
    port: Number(process.env.TIDB_PORT) || 4000,    // TiDB port, default: 4000
    username: process.env.TIDB_USER || 'root',      // TiDB user, for example: {prefix}.root
    password: process.env.TIDB_PASSWORD || 'root',  // TiDB password
    database: process.env.TIDB_DB_NAME || 'test',   // TiDB database name, default: test
    dialectOptions: {
      ssl:
        process.env?.TIDB_ENABLE_SSL === 'true'     // (Optional) Enable SSL
          ? {
              minVersion: 'TLSv1.2',
              rejectUnauthorized: true,
              ca: process.env.TIDB_CA_PATH          // (Optional) Path to the custom CA certificate
                ? readFileSync(process.env.TIDB_CA_PATH)
                : undefined,
            }
          : null,
    },
}

export async function getSequelize() {
  if (!sequelize) {
    sequelize = initSequelize();
    try {
      await sequelize.authenticate();
      logger.info('Connection has been established successfully.');
    } catch (error) {
      logger.error('Unable to connect to the database:');
      logger.error(error);
      throw error;
    }
  }
  return sequelize;
}
```

### データを挿入 {#insert-data}

次のクエリは、単一の`Players`レコードを作成し、 `Players`オブジェクトを返します。

```typescript
logger.info('Creating a new player...');
const newPlayer = await playersModel.create({
  id: 6,
  coins: 600,
  goods: 600,
});
logger.info('Created a new player.');
logger.info(newPlayer.toJSON());
```

詳細については[データを挿入](/develop/dev-guide-insert-data.md)を参照してください。

### クエリデータ {#query-data}

次のクエリは、コインが`300`より大きい単一の`Players`レコードを返します。

```typescript
logger.info('Reading all players with coins > 300...');
const allPlayersWithCoinsGreaterThan300 = await playersModel.findAll({
  where: {
    coins: {
      [Op.gt]: 300,
    },
  },
});
logger.info('Read all players with coins > 300.');
logger.info(allPlayersWithCoinsGreaterThan300.map((p) => p.toJSON()));
```

詳細については[クエリデータ](/develop/dev-guide-get-data-from-single-table.md)を参照してください。

### データの更新 {#update-data}

次のクエリは、セクション[データを挿入](#insert-data)で作成された ID `6`の`Players`にコイン`700`と商品`700`を設定します。

```typescript
logger.info('Updating the new player...');
await newPlayer.update({ coins: 700, goods: 700 });
logger.info('Updated the new player.');
logger.info(newPlayer.toJSON());
```

詳細については[データの更新](/develop/dev-guide-update-data.md)を参照してください。

### データを削除する {#delete-data}

次のクエリは、セクション[データを挿入](#insert-data)で作成された ID `6`の`Player`レコードを削除します。

```typescript
logger.info('Deleting the new player...');
await newPlayer.destroy();
const deletedNewPlayer = await playersModel.findByPk(6);
logger.info('Deleted the new player.');
logger.info(deletedNewPlayer?.toJSON());
```

詳細については[データを削除する](/develop/dev-guide-delete-data.md)を参照してください。

## 次のステップ {#next-steps}

-   ORM フレームワーク Sequelize ドライバーの使用方法を[Sequelizeのドキュメント](https://sequelize.org/)から詳しく学びます。
-   [開発者ガイド](/develop/dev-guide-overview.md)の[データを挿入](/develop/dev-guide-insert-data.md) 、 [データの更新](/develop/dev-guide-update-data.md) 、 [データを削除する](/develop/dev-guide-delete-data.md) 、 [単一テーブル読み取り](/develop/dev-guide-get-data-from-single-table.md) 、 [取引](/develop/dev-guide-transaction-overview.md) 、 [SQLパフォーマンスの最適化](/develop/dev-guide-optimize-sql-overview.md)などの章で、 TiDB アプリケーション開発のベスト プラクティスを学習します。
-   プロフェッショナル[TiDB 開発者コース](https://www.pingcap.com/education/)を通じて学び、試験に合格すると[TiDB 認定](https://www.pingcap.com/education/certification/)獲得します。

## 助けが必要？ {#need-help}

<CustomContent platform="tidb">

[不和](https://discord.gg/DQZ2dy3cuc?utm_source=doc) 、または[サポートチケットを作成する](/support.md)について質問します。

</CustomContent>

<CustomContent platform="tidb-cloud">

[不和](https://discord.gg/DQZ2dy3cuc?utm_source=doc) 、または[サポートチケットを作成する](https://support.pingcap.com/)について質問します。

</CustomContent>
