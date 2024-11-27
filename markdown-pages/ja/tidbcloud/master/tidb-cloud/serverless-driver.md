---
title: TiDB Cloud Serverless Driver (Beta)
summary: サーバーレス環境およびエッジ環境から TiDB Serverless に接続する方法を学習します。
---

# TiDB CloudサーバーレスDriver(ベータ版) {#tidb-cloud-serverless-driver-beta}

## TiDB Cloud Serverless Driver (ベータ版) を使用する理由 {#why-use-tidb-cloud-serverless-driver-beta}

従来の TCP ベースの MySQL ドライバーは、長寿命で永続的な TCP 接続を期待しており、サーバーレス関数の短寿命の性質と矛盾するため、サーバーレス関数には適していません。さらに、包括的な TCP サポートと完全な Node.js 互換性が欠如している可能性のある[Vercel エッジ機能](https://vercel.com/docs/functions/edge-functions)や[Cloudflare ワーカー](https://workers.cloudflare.com/)などのエッジ環境では、これらのドライバーがまったく機能しない可能性があります。

JavaScript 用の[TiDB Cloudサーバーレス ドライバー (ベータ版)](https://github.com/tidbcloud/serverless-js)を使用すると、サーバーレス環境で一般的にサポートされている HTTP 経由で TiDB Serverless クラスターに接続できます。これにより、従来の TCP ベースの MySQL ドライバーと同様の開発エクスペリエンスを維持しながら、エッジ環境から TiDB Serverless クラスターに接続し、TCP による接続オーバーヘッドを削減できるようになりました。

> **注記：**
>
> SQL や ORM ではなく RESTful API でプログラミングしたい場合は、 [データ サービス (ベータ版)](/tidb-cloud/data-service-overview.md)使用できます。

## サーバーレスドライバーをインストールする {#install-the-serverless-driver}

npm を使用してドライバーをインストールできます。

```bash
npm install @tidbcloud/serverless
```

## サーバーレスドライバーを使用する {#use-the-serverless-driver}

サーバーレス ドライバーを使用して、TiDB サーバーレス クラスターのデータを照会したり、対話型トランザクションを実行したりできます。

### クエリ {#query}

TiDB Serverless クラスターからデータをクエリするには、まず接続を作成する必要があります。次に、接続を使用して生の SQL クエリを実行できます。例:

```ts
import { connect } from '@tidbcloud/serverless'

const conn = connect({url: 'mysql://[username]:[password]@[host]/[database]'})
const results = await conn.execute('select * from test where id = ?',[1])
```

### トランザクション（実験的） {#transaction-experimental}

サーバーレス ドライバーを使用して対話型トランザクションを実行することもできます。例:

```ts
import { connect } from '@tidbcloud/serverless'

const conn = connect({url: 'mysql://[username]:[password]@[host]/[database]'})
const tx = await conn.begin()

try {
  await tx.execute('insert into test values (1)')
  await tx.execute('select * from test')
  await tx.commit()
} catch (err) {
  await tx.rollback()
  throw err
}
```

## エッジの例 {#edge-examples}

エッジ環境でサーバーレス ドライバーを使用する例をいくつか示します。完全な例については、こちら[ライブデモ](https://github.com/tidbcloud/car-sales-insight)も試してください。

<SimpleTab>

<div label="Vercel Edge Function">

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { connect } from '@tidbcloud/serverless'
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const conn = connect({url: process.env.DATABASE_URL})
  const result = await conn.execute('show tables')
  return NextResponse.json({result});
}
```

[Vercel でTiDB Cloudサーバーレス ドライバーを使用する](/tidb-cloud/integrate-tidbcloud-with-vercel.md)について詳しく学びます。

</div>

<div label="Cloudflare Workers">

```ts
import { connect } from '@tidbcloud/serverless'
export interface Env {
  DATABASE_URL: string;
}
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const conn = connect({url: env.DATABASE_URL})
    const result = await conn.execute('show tables')
    return new Response(JSON.stringify(result));
  },
};
```

[Cloudflare Workers でTiDB Cloudサーバーレス ドライバーを使用する](/tidb-cloud/integrate-tidbcloud-with-cloudflare.md)について詳しく学びます。

</div>

<div label="Netlify Edge Function">

```ts
import { connect } from 'https://esm.sh/@tidbcloud/serverless'

export default async () => {
  const conn = connect({url: Netlify.env.get('DATABASE_URL')})
  const result = await conn.execute('show tables')
  return new Response(JSON.stringify(result));
}
```

[Netlify でTiDB Cloudサーバーレス ドライバーを使用する](/tidb-cloud/integrate-tidbcloud-with-netlify.md#use-the-edge-function)について詳しく学びます。

</div>

<div label="Deno">

```ts
import { connect } from "npm:@tidbcloud/serverless-js"

const conn = connect({url: Deno.env.get('DATABASE_URL')})
const result = await conn.execute('show tables')
```

</div>

<div label="Bun">

```ts
import { connect } from "@tidbcloud/serverless-js"

const conn = connect({url: Bun.env.DATABASE_URL})
const result = await conn.execute('show tables')
```

</div>

</SimpleTab>

## サーバーレスドライバーを構成する {#configure-the-serverless-driver}

TiDB Cloudサーバーレス ドライバーは、接続レベルと SQL レベルの両方で構成できます。

### 接続レベルの構成 {#connection-level-configurations}

接続レベルでは、次の構成を行うことができます。

| 名前           | タイプ | デフォルト値    | 説明                                                                                                         |
| ------------ | --- | --------- | ---------------------------------------------------------------------------------------------------------- |
| `username`   | 弦   | 該当なし      | TiDB Serverlessのユーザー名                                                                                      |
| `password`   | 弦   | 該当なし      | TiDB Serverlessのパスワード                                                                                      |
| `host`       | 弦   | 該当なし      | TiDB Serverlessのホスト名                                                                                       |
| `database`   | 弦   | `test`    | TiDB Serverlessのデータベース                                                                                     |
| `url`        | 弦   | 該当なし      | データベースの URL は`mysql://[username]:[password]@[host]/[database]`形式で、デフォルトのデータベースに接続する場合は`database`をスキップできます。 |
| `fetch`      | 関数  | グローバルフェッチ | カスタム フェッチ関数。たとえば、node.js の`undici`フェッチを使用できます。                                                             |
| `arrayMode`  | ブール | `false`   | 結果をオブジェクトではなく配列として返すかどうか。パフォーマンスを向上させるには、 `true`に設定します。                                                    |
| `fullResult` | ブール | `false`   | 行だけではなく完全な結果オブジェクトを返すかどうか。より詳細な結果を取得するには、 `true`に設定します。                                                    |

**データベースURL**

> **注記：**
>
> ユーザー名、パスワード、またはデータベース名に特殊文字が含まれている場合は、URL で渡すときにこれらの文字を[パーセンテージエンコード](https://en.wikipedia.org/wiki/Percent-encoding)エンコードする必要があります。たとえば、パスワード`password1@//?`は、URL では`password1%40%2F%2F%3F`としてエンコードする必要があります。

`url`設定されている場合、 `host` 、 `username` 、 `password` 、および`database`個別に設定する必要はありません。次のコードは同等です。

```ts
const config = {
  host: '<host>',
  username: '<user>',
  password: '<password>',
  database: '<database>',
  arrayMode: true,
}

const conn = connect(config)
```

```ts
const config = {
  url: process.env['DATABASE_URL'] || 'mysql://[username]:[password]@[host]/[database]',
  arrayMode: true
}

const conn = connect(config)
```

### SQL レベル オプション {#sql-level-options}

> **注記：**
>
> SQL レベルのオプションは、接続レベルの構成よりも優先されます。

SQL レベルでは、次のオプションを構成できます。

| オプション        | タイプ | デフォルト値  | 説明                                                      |
| ------------ | --- | ------- | ------------------------------------------------------- |
| `arrayMode`  | ブール | `false` | 結果をオブジェクトではなく配列として返すかどうか。パフォーマンスを向上させるには、 `true`に設定します。 |
| `fullResult` | ブール | `false` | 行だけではなく完全な結果オブジェクトを返すかどうか。より詳細な結果を取得するには、 `true`に設定します。 |

例えば：

```ts
const conn = connect({url: process.env['DATABASE_URL'] || 'mysql://[username]:[password]@[host]/[database]'})
const results = await conn.execute('select * from test',null,{arrayMode:true,fullResult:true})
```

TiDB Cloudサーバーレス ドライバー v0.0.7 以降では、トランザクションを使用するときに次の SQL レベル オプションを構成することもできます。

| オプション       | タイプ | デフォルト値            | 説明                                                          |
| ----------- | --- | ----------------- | ----------------------------------------------------------- |
| `isolation` | 弦   | `REPEATABLE READ` | トランザクション分離レベル。 `READ COMMITTED`または`REPEATABLE READ`に設定できます。 |

`isolation`オプションは`begin`関数でのみ使用できます。次に例を示します。

```ts
const conn = connect({url: 'mysql://[username]:[password]@[host]/[database]'})
const tx = await conn.begin({isolation:"READ COMMITTED"})
```

## 特徴 {#features}

### サポートされているSQL文 {#supported-sql-statements}

DDL が`EXPLAIN`されて`DELETE` `USE`次の SQL `SHOW` `INSERT`サポートされて`BEGIN` `COMMIT` : `SELECT` `SET` `UPDATE` `ROLLBACK` 。

### データ型マッピング {#data-type-mapping}

TiDB Serverless と Javascript 間の型マッピングは次のとおりです。

| TiDB サーバーレスタイプ | Javascriptタイプ |
| -------------- | ------------- |
| 小さな            | 番号            |
| 符号なし TINYINT   | 番号            |
| ブール            | 番号            |
| スモールイント        | 番号            |
| 符号なし小整数        | 番号            |
| ミディアムミント       | 番号            |
| 内部             | 番号            |
| 符号なし整数         | 番号            |
| 年              | 番号            |
| 浮く             | 番号            |
| ダブル            | 番号            |
| ビッグイント         | 弦             |
| 符号なしBIGINT     | 弦             |
| 小数点            | 弦             |
| 文字             | 弦             |
| バルチャー          | 弦             |
| バイナリ           | 弦             |
| バイナリ           | 弦             |
| 小さなテキスト        | 弦             |
| TEXT           | 弦             |
| 中テキスト          | 弦             |
| 長文             | 弦             |
| タイニーブロブ        | 弦             |
| ブロブ            | 弦             |
| ミディアムブロブ       | 弦             |
| ロングロブ          | 弦             |
| 日付             | 弦             |
| 時間             | 弦             |
| 日付時刻           | 弦             |
| タイムスタンプ        | 弦             |
| 列挙             | 弦             |
| セット            | 弦             |
| 少し             | 弦             |
| 翻訳             | 物体            |
| ヌル             | ヌル            |
| その他            | 弦             |

### ORM統合 {#orm-integrations}

TiDB Cloudサーバーレス ドライバーは、次の ORM と統合されています。

-   [TiDB Cloudサーバーレス ドライバー Kysely 方言](https://github.com/tidbcloud/kysely) 。
-   [TiDB Cloudレス ドライバー Prisma アダプター](https://github.com/tidbcloud/prisma-adapter) 。

## 価格 {#pricing}

サーバーレス ドライバー自体は無料ですが、ドライバーを使用してデータにアクセスすると、 [リクエストユニット (RU)](/tidb-cloud/tidb-cloud-glossary.md#request-unit)とstorage使用量が発生します。価格は[TiDB サーバーレスの価格](https://www.pingcap.com/tidb-serverless-pricing-details/)モデルに従います。

## 制限事項 {#limitations}

現在、サーバーレス ドライバーの使用には次の制限があります。

-   1 回のクエリで最大 10,000 行を取得できます。
-   一度に実行できる SQL ステートメントは 1 つだけです。1 つのクエリで複数の SQL ステートメントを実行することはまだサポートされていません。
-   [プライベートエンドポイント](/tidb-cloud/set-up-private-endpoint-connections-serverless.md)との接続はまだサポートされていません。

## 次は何ですか {#what-s-next}

-   [ローカル Node.js プロジェクトでTiDB Cloudサーバーレス ドライバーを使用する](/tidb-cloud/serverless-driver-node-example.md)の方法を学びます。
