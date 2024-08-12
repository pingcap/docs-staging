---
title: TiDB Cloud Serverless Driver Drizzle Tutorial
summary: Drizzle でTiDB Cloudサーバーレス ドライバーを使用する方法を学びます。
---

# TiDB CloudレスDriverDrizzle チュートリアル {#tidb-cloud-serverless-driver-drizzle-tutorial}

[霧雨ORM](https://orm.drizzle.team/)は、開発者のエクスペリエンスを考慮した軽量でパフォーマンスの高い TypeScript ORM です。 `drizzle-orm@0.31.2`から始まり、 [drizzle-orm/tidb-serverless](https://orm.drizzle.team/docs/get-started-mysql#tidb-serverless)をサポートし、 [TiDB Cloudサーバーレス ドライバー](/tidb-cloud/serverless-driver.md)で Drizzle を HTTPS 経由で使用できるようになります。

このチュートリアルでは、Node.js 環境とエッジ環境で Drizzle とTiDB Cloudサーバーレス ドライバーを使用する方法について説明します。

## Node.js 環境で Drizzle とTiDB Cloudサーバーレス ドライバーを使用する {#use-drizzle-and-tidb-cloud-serverless-driver-in-node-js-environments}

このセクションでは、Node.js 環境で Drizzle とTiDB Cloudサーバーレス ドライバーを使用する方法について説明します。

### あなたが始める前に {#before-you-begin}

このチュートリアルを完了するには、次のものが必要です。

-   [Node.js](https://nodejs.org/en) &gt;= 18.0.0。
-   [ネプ](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)またはお好みのパッケージ マネージャーを使用します。
-   TiDB サーバーレス クラスター。ない場合は、 [TiDBサーバーレスクラスターを作成する](/develop/dev-guide-build-cluster-in-cloud.md)使用できます。

### ステップ1. プロジェクトを作成する {#step-1-create-a-project}

1.  `drizzle-node-example`という名前のプロジェクトを作成します。

    ```shell
    mkdir drizzle-node-example
    cd drizzle-node-example
    ```

2.  `drizzle-orm`と`@tidbcloud/serverless`パッケージをインストールします。

    ```shell
    npm install drizzle-orm @tidbcloud/serverless
    ```

3.  プロジェクトのルート ディレクトリで、 `package.json`ファイルを見つけ、ファイルに`"type": "module"`追加して ES モジュールを指定します。

    ```json
    {
      "type": "module",
      "dependencies": {
        "@tidbcloud/serverless": "^0.1.1",
        "drizzle-orm": "^0.31.2"
      }
    }
    ```

4.  プロジェクトのルート ディレクトリに、TypeScript コンパイラ オプションを定義する`tsconfig.json`ファイルを追加します。次にサンプル ファイルを示します。

    ```json
    {
      "compilerOptions": {
        "module": "ES2022",
        "target": "ES2022",
        "moduleResolution": "node",
        "strict": false,
        "declaration": true,
        "outDir": "dist",
        "removeComments": true,
        "allowJs": true,
        "esModuleInterop": true,
        "resolveJsonModule": true
      }
    }
    ```

### ステップ2. 環境を設定する {#step-2-set-the-environment}

1.  [TiDB Cloudコンソール](https://tidbcloud.com/)で、プロジェクトの[**クラスター**](https://tidbcloud.com/console/clusters)ページに移動し、ターゲットの TiDB Serverless クラスターの名前をクリックして概要ページに移動します。

2.  概要ページで、右上隅の**[接続]**をクリックし、 **[接続先]**ドロップダウン ボックスで`Serverless Driver`を選択して、 **[パスワードの生成] を**クリックし、ランダムなパスワードを作成します。

    > **ヒント：**
    >
    > 以前にパスワードを作成したことがある場合は、元のパスワードを使用するか、 **「パスワードのリセット」**をクリックして新しいパスワードを生成することができます。

    接続文字列は次のようになります。

        mysql://[username]:[password]@[host]/[database]

3.  ローカル環境で環境変数`DATABASE_URL`を設定します。たとえば、Linux または macOS では、次のコマンドを実行できます。

    ```shell
    export DATABASE_URL='mysql://[username]:[password]@[host]/[database]'
    ```

### ステップ3. Drizzleを使用してデータをクエリする {#step-3-use-drizzle-to-query-data}

1.  TiDB Serverless クラスターにテーブルを作成します。

    [TiDB Cloudコンソールの SQL エディター](/tidb-cloud/explore-data-with-chat2query.md)使用して SQL ステートメントを実行できます。次に例を示します。

    ```sql
    CREATE TABLE `test`.`users` (
     `id` BIGINT PRIMARY KEY auto_increment,
     `full_name` TEXT,
     `phone` VARCHAR(256)
    );
    ```

2.  プロジェクトのルート ディレクトリに`hello-world.ts`という名前のファイルを作成し、次のコードを追加します。

    ```ts
    import { connect } from '@tidbcloud/serverless';
    import { drizzle } from 'drizzle-orm/tidb-serverless';
    import { mysqlTable, serial, text, varchar } from 'drizzle-orm/mysql-core';

    // Initialize
    const client = connect({ url: process.env.DATABASE_URL });
    const db = drizzle(client);

    // Define schema
    export const users = mysqlTable('users', {
      id: serial("id").primaryKey(),
      fullName: text('full_name'),
      phone: varchar('phone', { length: 256 }),
    });
    export type User = typeof users.$inferSelect; // return type when queried
    export type NewUser = typeof users.$inferInsert; // insert type

    // Insert and select data
    const user: NewUser = { fullName: 'John Doe', phone: '123-456-7890' };
    await db.insert(users).values(user)
    const result: User[] = await db.select().from(users);
    console.log(result);
    ```

### ステップ4. Typescriptコードを実行する {#step-4-run-the-typescript-code}

1.  `ts-node`インストールして TypeScript を JavaScript に変換し、次に`@types/node`インストールして Node.js に TypeScript 型定義を提供します。

    ```shell
    npm install -g ts-node
    npm i --save-dev @types/node
    ```

2.  次のコマンドで Typescript コードを実行します。

    ```shell
    ts-node --esm hello-world.ts
    ```

## エッジ環境で Drizzle とTiDB Cloudサーバーレス ドライバーを使用する {#use-drizzle-and-tidb-cloud-serverless-driver-in-edge-environments}

このセクションでは、Vercel Edge Function を例に説明します。

### あなたが始める前に {#before-you-begin}

このチュートリアルを完了するには、次のものが必要です。

-   エッジ環境を提供する[ヴェルセル](https://vercel.com/docs)アカウント。
-   [ネプ](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)またはお好みのパッケージ マネージャーを使用します。
-   TiDB サーバーレス クラスター。ない場合は、 [TiDBサーバーレスクラスターを作成する](/develop/dev-guide-build-cluster-in-cloud.md)使用できます。

### ステップ1. プロジェクトを作成する {#step-1-create-a-project}

1.  Vercel CLI をインストールします。

    ```shell
    npm i -g vercel@latest
    ```

2.  次のターミナル コマンドを使用して、 `drizzle-example`という[次](https://nextjs.org/)プロジェクトを作成します。

    ```shell
    npx create-next-app@latest drizzle-example --ts --no-eslint --tailwind --no-src-dir --app --import-alias "@/*"
    ```

3.  `drizzle-example`ディレクトリに移動します:

    ```shell
    cd drizzle-example
    ```

4.  `drizzle-orm`と`@tidbcloud/serverless`パッケージをインストールします。

    ```shell
    npm install drizzle-orm @tidbcloud/serverless --force
    ```

### ステップ2. 環境を設定する {#step-2-set-the-environment}

1.  [TiDB Cloudコンソール](https://tidbcloud.com/)で、プロジェクトの[**クラスター**](https://tidbcloud.com/console/clusters)ページに移動し、ターゲットの TiDB Serverless クラスターの名前をクリックして概要ページに移動します。

2.  概要ページで、右上隅の**[接続]**をクリックし、 **[接続先]**ドロップダウン ボックスで`Serverless Driver`を選択して、 **[パスワードの生成] を**クリックし、ランダムなパスワードを作成します。

    > **ヒント：**
    >
    > 以前にパスワードを作成したことがある場合は、元のパスワードを使用するか、 **「パスワードのリセット」**をクリックして新しいパスワードを生成することができます。

    接続文字列は次のようになります。

        mysql://[username]:[password]@[host]/[database]

### ステップ3. エッジ関数を作成する {#step-3-create-an-edge-function}

1.  TiDB Serverless クラスターにテーブルを作成します。

    [TiDB Cloudコンソールの SQL エディター](/tidb-cloud/explore-data-with-chat2query.md)使用して SQL ステートメントを実行できます。次に例を示します。

    ```sql
    CREATE TABLE `test`.`users` (
     `id` BIGINT PRIMARY KEY auto_increment,
     `full_name` TEXT,
     `phone` VARCHAR(256)
    );
    ```

2.  プロジェクトの`app`ディレクトリにファイル`/api/edge-function-example/route.ts`を作成し、次のコードを追加します。

    ```ts
    import { NextResponse } from 'next/server';
    import type { NextRequest } from 'next/server';
    import { connect } from '@tidbcloud/serverless';
    import { drizzle } from 'drizzle-orm/tidb-serverless';
    import { mysqlTable, serial, text, varchar } from 'drizzle-orm/mysql-core';
    export const runtime = 'edge';

    // Initialize
    const client = connect({ url: process.env.DATABASE_URL });
    const db = drizzle(client);

    // Define schema
    export const users = mysqlTable('users', {
      id: serial("id").primaryKey(),
      fullName: text('full_name'),
      phone: varchar('phone', { length: 256 }),
    });
    export type User = typeof users.$inferSelect; // return type when queried
    export type NewUser = typeof users.$inferInsert; // insert type

    export async function GET(request: NextRequest) {
      // Insert and select data
      const user: NewUser = { fullName: 'John Doe', phone: '123-456-7890' };
      await db.insert(users).values(user)
      const result: User[] = await db.select().from(users);
      return NextResponse.json(result);
    }
    ```

3.  コードをローカルでテストします。

    ```shell
    export DATABASE_URL='mysql://[username]:[password]@[host]/[database]'
    next dev
    ```

4.  ルートからの応答を取得するには、 `http://localhost:3000/api/edge-function-example`に移動します。

### ステップ4. コードをVercelにデプロイ {#step-4-deploy-your-code-to-vercel}

1.  `DATABASE_URL`環境変数を使用してコードを Vercel にデプロイ。

    ```shell
    vercel -e DATABASE_URL='mysql://[username]:[password]@[host]/[database]' --prod
    ```

    デプロイが完了すると、プロジェクトの URL が取得されます。

2.  ルートからの応答を取得するには、 `${Your-URL}/api/edge-function-example`ページに移動します。

## 次は何ですか {#what-s-next}

-   [霧雨](https://orm.drizzle.team/docs/overview)と[drizzle-orm/tidb-serverless](https://orm.drizzle.team/docs/get-started-mysql#tidb-serverless)について詳しく学びます。
-   [TiDB CloudとVercelを統合する](/tidb-cloud/integrate-tidbcloud-with-vercel.md)の方法を学びます。
