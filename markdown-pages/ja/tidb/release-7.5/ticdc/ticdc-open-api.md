---
title: TiCDC OpenAPI v1
summary: Learn how to use the OpenAPI interface to manage the cluster status and data replication.
---

# TiCDC オープン API v1 {#ticdc-openapi-v1}

<!-- markdownlint-disable MD024 -->

> **注記**
>
> TiCDC OpenAPI v1 は非推奨であり、将来的に削除される予定です。 [TiCDC オープン API v2](/ticdc/ticdc-open-api-v2.md)使用することをお勧めします。

TiCDC は、 [`cdc cli`ツール](/ticdc/ticdc-manage-changefeed.md)の機能に類似した、TiCDC クラスターのクエリと操作のための OpenAPI 機能を提供します。

API を使用して、TiCDC クラスターで次のメンテナンス操作を実行できます。

-   [TiCDCノードのステータス情報を取得する](#get-the-status-information-of-a-ticdc-node)
-   [TiCDC クラスターのヘルス ステータスを確認する](#check-the-health-status-of-a-ticdc-cluster)
-   [レプリケーションタスクを作成する](#create-a-replication-task)
-   [レプリケーションタスクを削除する](#remove-a-replication-task)
-   [レプリケーション構成を更新する](#update-the-replication-configuration)
-   [レプリケーションタスクリストをクエリする](#query-the-replication-task-list)
-   [特定のレプリケーションタスクをクエリする](#query-a-specific-replication-task)
-   [レプリケーションタスクを一時停止する](#pause-a-replication-task)
-   [レプリケーションタスクを再開する](#resume-a-replication-task)
-   [レプリケーションサブタスクリストをクエリする](#query-the-replication-subtask-list)
-   [特定のレプリケーションサブタスクをクエリする](#query-a-specific-replication-subtask)
-   [TiCDC サービス プロセス リストを照会する](#query-the-ticdc-service-process-list)
-   [所有者ノードの削除](#evict-an-owner-node)
-   [レプリケーションタスク内のすべてのテーブルの負荷分散を手動でトリガーする](#manually-trigger-the-load-balancing-of-all-tables-in-a-replication-task)
-   [テーブルを別のノードに手動でスケジュールする](#manually-schedule-a-table-to-another-node)
-   [TiCDCサーバーのログレベルを動的に調整する](#dynamically-adjust-the-log-level-of-the-ticdc-server)

すべての API のリクエスト本文と戻り値は JSON 形式です。次のセクションでは、API の具体的な使用方法について説明します。

次の例では、TiCDCサーバーのリスニング IP アドレスは`127.0.0.1` 、ポートは`8300`です。TiCDCサーバーを起動するときに、指定された IP とポートを`--addr=ip:port`経由でバインドできます。

## API エラー メッセージ テンプレート {#api-error-message-template}

API リクエストを送信した後、エラーが発生した場合、返されるエラー メッセージは次の形式になります。

```json
{
    "error_msg": "",
    "error_code": ""
}
```

上記の JSON 出力では、 `error_msg`エラー メッセージを示し、 `error_code`対応するエラー コードを示します。

## TiCDCノードのステータス情報を取得する {#get-the-status-information-of-a-ticdc-node}

この API は同期インターフェースです。リクエストが成功すると、対応するノードのステータス情報が返されます。

### リクエストURI {#request-uri}

`GET /api/v1/status`

### 例 {#example}

次のリクエストは、IP アドレスが`127.0.0.1`でポート番号が`8300`である TiCDC ノードのステータス情報を取得します。

```shell
curl -X GET http://127.0.0.1:8300/api/v1/status
```

```json
{
    "version": "v5.2.0-master-dirty",
    "git_hash": "f191cd00c53fdf7a2b1c9308a355092f9bf8824e",
    "id": "c6a43c16-0717-45af-afd6-8b3e01e44f5d",
    "pid": 25432,
    "is_owner": true
}
```

上記の出力のフィールドは次のように説明されます。

-   version: 現在の TiCDC バージョン番号。
-   git_hash: Git ハッシュ値。
-   id: ノードのキャプチャ ID。
-   pid: ノードのキャプチャプロセス PID。
-   is_owner: ノードが所有者であるかどうかを示します。

## TiCDC クラスターのヘルス ステータスを確認する {#check-the-health-status-of-a-ticdc-cluster}

この API は同期インターフェースです。クラスターが正常な場合は`200 OK`返されます。

### リクエストURI {#request-uri}

`GET /api/v1/health`

### 例 {#example}

```shell
curl -X GET http://127.0.0.1:8300/api/v1/health
```

## レプリケーションタスクを作成する {#create-a-replication-task}

この API は非同期インターフェイスです。リクエストが成功すると、 `202 Accepted`が返されます。返された結果は、サーバーがコマンドの実行に同意したことを意味するだけで、コマンドが正常に実行されることを保証するものではありません。

### リクエストURI {#request-uri}

`POST /api/v1/changefeeds`

### パラメータの説明 {#parameter-description}

`cli`コマンドを使用してレプリケーション タスクを作成するためのオプション パラメータと比較すると、API を使用してこのようなタスクを作成するためのオプション パラメータは完全ではありません。この API は、次のパラメータをサポートしています。

#### リクエスト本文のパラメータ {#parameters-for-the-request-body}

| パラメータ名 | 説明 | | :------------------------ | :---------------------- ------------------------------- | | `changefeed_id` | `STRING` type。レプリケーション タスクの ID。(オプション) | | `start_ts` | `UINT64` type。changefeed の開始 TSO を指定します。(オプション) | | `target_ts` | `UINT64` type。changefeed のターゲット TSO を指定します。(オプション) | | **`sink_uri`** | `STRING` type。レプリケーション タスクのダウンストリーム アドレス。(**必須**) | | `force_replicate` | `BOOLEAN` type。一意のインデックスのないテーブルを強制的にレプリケートするかどうかを決定します。(オプション) | | `ignore_ineligible_table` | `BOOLEAN` type。レプリケートできないテーブルを無視するかどうかを決定します。(オプション) | | `filter_rules` | `STRING` type 配列。テーブル スキーマ フィルタリングのルール。(オプション) | | `ignore_txn_start_ts` | `UINT64` type 配列。指定された start_ts のトランザクションを無視します。(オプション) | | `mounter_worker_num` | `INT` type。マウント元スレッド番号。 (オプション) | | `sink_config` | シンクの構成パラメータ。(オプション) |

`changefeed_id`の意味と形式`sink_uri` `start_ts` [`cdc cli`を使用してレプリケーションタスクを作成する](/ticdc/ticdc-manage-changefeed.md#create-a-replication-task)ドキュメントで説明されているもの`sink_uri`同じです。これらのパラメータの詳細な説明`target_ts`は、このドキュメントを参照してください。11 で証明書パスを指定する場合は、対応する証明書を対応する TiCDCサーバーにアップロードしたことを確認してください。

上記の表のその他のパラメータについては、次のように詳しく説明します。

`force_replicate` : このパラメータのデフォルトは`false`です。 `true`に指定すると、TiCDC は一意のインデックスを持たないテーブルを強制的に複製しようとします。

`ignore_ineligible_table` : このパラメータのデフォルトは`false`です。 `true`に指定すると、TiCDC は複製できないテーブルを無視します。

`filter_rules` : テーブル スキーマ フィルタリングのルール (例: `filter_rules = ['foo*.*','bar*.*']` 。詳細については、 [テーブルフィルター](/table-filter.md)ドキュメントを参照してください。

`ignore_txn_start_ts` : このパラメータを指定すると、指定された start_ts は無視されます。たとえば、 `ignore-txn-start-ts = [1, 2]` 。

`mounter_worker_num` : マウンタのスレッド番号。マウンタは TiKV から出力されたデータをデコードするために使用されます。デフォルト値は`16`です。

シンクの構成パラメータは次のとおりです。

```json
{
  "dispatchers":[
    {"matcher":["test1.*", "test2.*"], "dispatcher":"ts"},
    {"matcher":["test3.*", "test4.*"], "dispatcher":"index-value"}
  ],
  "protocol":"canal-json"
}
```

`dispatchers` : MQ タイプのシンクの場合、ディスパッチャーを使用してイベント ディスパッチャーを構成できます。 `default` 、 `ts` 、 `index-value` 、および`table` 4 つのディスパッチャーがサポートされています。ディスパッチャーのルールは次のとおりです。

-   `default` : `table`モードでイベントを送信します。
-   `ts` : 行変更の commitTs を使用してハッシュ値を作成し、イベントをディスパッチします。
-   `index-value` : 選択した HandleKey 列の名前と値を使用してハッシュ値を作成し、イベントをディスパッチします。
-   `table` : テーブルのスキーマ名とテーブル名を使用してハッシュ値を作成し、イベントをディスパッチします。

`matcher` : マッチャーのマッチング構文は、フィルター ルール構文と同じです。

`protocol` : MQ タイプのシンクの場合、メッセージのプロトコル形式を指定できます。現在、次のプロトコルがサポートされています: `canal-json` 、 `open-protocol` 、 `avro` 、および`maxwell` 。

### 例 {#example}

次のリクエストは、ID が`test5`で`sink_uri`が`blackhole://`のレプリケーション タスクを作成します。

```shell
curl -X POST -H "'Content-type':'application/json'" http://127.0.0.1:8300/api/v1/changefeeds -d '{"changefeed_id":"test5","sink_uri":"blackhole://"}'
```

要求が成功した場合は`202 Accepted`が返されます。要求が失敗した場合は、エラー メッセージとエラー コードが返されます。

## レプリケーションタスクを削除する {#remove-a-replication-task}

この API は非同期インターフェイスです。リクエストが成功すると、 `202 Accepted`が返されます。返された結果は、サーバーがコマンドの実行に同意したことを意味するだけで、コマンドが正常に実行されることを保証するものではありません。

### リクエストURI {#request-uri}

`DELETE /api/v1/changefeeds/{changefeed_id}`

### パラメータの説明 {#parameter-description}

#### パスパラメータ {#path-parameters}

| パラメータ名          | 説明                                  |
| :-------------- | :---------------------------------- |
| `changefeed_id` | 削除するレプリケーション タスク (changefeed) の ID。 |

### 例 {#example}

次のリクエストは、ID `test1`のレプリケーション タスクを削除します。

```shell
curl -X DELETE http://127.0.0.1:8300/api/v1/changefeeds/test1
```

要求が成功した場合は`202 Accepted`が返されます。要求が失敗した場合は、エラー メッセージとエラー コードが返されます。

## レプリケーション構成を更新する {#update-the-replication-configuration}

この API は非同期インターフェイスです。リクエストが成功すると、 `202 Accepted`が返されます。返された結果は、サーバーがコマンドの実行に同意したことを意味するだけで、コマンドが正常に実行されることを保証するものではありません。

changefeed 設定を変更するには、 `pause the replication task -> modify the configuration -> resume the replication task`の手順に従います。

### リクエストURI {#request-uri}

`PUT /api/v1/changefeeds/{changefeed_id}`

### パラメータの説明 {#parameter-description}

#### パスパラメータ {#path-parameters}

| パラメータ名          | 説明                                  |
| :-------------- | :---------------------------------- |
| `changefeed_id` | 更新するレプリケーション タスク (changefeed) の ID。 |

#### リクエスト本文のパラメータ {#parameters-for-the-request-body}

現在、API 経由で変更できるのは次の構成のみです。

| パラメータ名 | 説明 | | :-------------------- | :-------------------------- --------------------------- | | `target_ts` | `UINT64` type。changefeed のターゲット TSO を指定します。(オプション) | | `sink_uri` | `STRING` type。レプリケーション タスクのダウンストリーム アドレス。(オプション) | | `filter_rules` | `STRING` type 配列。テーブル スキーマ フィルタリングのルール。(オプション) | | `ignore_txn_start_ts` | `UINT64` type 配列。指定された start_ts のトランザクションを無視します。(オプション) | | `mounter_worker_num` | `INT` type。マウント スレッド番号。(オプション) | | `sink_config` | シンクの構成パラメータ。(オプション) |

上記のパラメータの意味はセクション[レプリケーションタスクを作成する](#create-a-replication-task)と同じです。詳細については、そのセクションを参照してください。

### 例 {#example}

次のリクエストは、ID `test1`のレプリケーション タスクの`mounter_worker_num` `32`に更新します。

```shell
 curl -X PUT -H "'Content-type':'application/json'" http://127.0.0.1:8300/api/v1/changefeeds/test1 -d '{"mounter_worker_num":32}'
```

要求が成功した場合は`202 Accepted`が返されます。要求が失敗した場合は、エラー メッセージとエラー コードが返されます。

## レプリケーションタスクリストをクエリする {#query-the-replication-task-list}

この API は同期インターフェースです。リクエストが成功すると、TiCDC クラスター内のすべてのノードの基本情報が返されます。

### リクエストURI {#request-uri}

`GET /api/v1/changefeeds`

### パラメータの説明 {#parameter-description}

#### クエリパラメータ {#query-parameters}

| パラメータ名 | 説明 | | :------ | :---------------------------------------- ----- | | `state` | このパラメータを指定すると、この状態のレプリケーション ステータス情報のみが返されます。(オプション) |

`state`の値のオプションは`all` 、 `normal` 、 `stopped` 、 `error` 、 `failed` 、および`finished`です。

このパラメータを指定しない場合は、状態が正常、停止、または失敗であるレプリケーション タスクの基本情報がデフォルトで返されます。

### 例 {#example}

次のリクエストは、状態が`normal`であるすべてのレプリケーション タスクの基本情報を照会します。

```shell
curl -X GET http://127.0.0.1:8300/api/v1/changefeeds?state=normal
```

```json
[
    {
        "id": "test1",
        "state": "normal",
        "checkpoint_tso": 426921294362574849,
        "checkpoint_time": "2021-08-10 14:04:54.242",
        "error": null
    },
    {
        "id": "test2",
        "state": "normal",
        "checkpoint_tso": 426921294362574849,
        "checkpoint_time": "2021-08-10 14:04:54.242",
        "error": null
    }
]
```

上記の返された結果のフィールドは次のように説明されます。

-   id: レプリケーション タスクの ID。
-   状態: レプリケーション タスクの現在の状態[州](/ticdc/ticdc-changefeed-overview.md#changefeed-state-transfer) 。
-   checkpoint_tso: レプリケーション タスクの現在のチェックポイントの TSO 表現。
-   checkpoint_time: レプリケーション タスクの現在のチェックポイントのフォーマットされた時間表現。
-   error: レプリケーション タスクのエラー情報。

## 特定のレプリケーションタスクをクエリする {#query-a-specific-replication-task}

この API は同期インターフェースです。リクエストが成功すると、指定されたレプリケーション タスクの詳細情報を返します。

### リクエストURI {#request-uri}

`GET /api/v1/changefeeds/{changefeed_id}`

### パラメータの説明 {#parameter-description}

#### パスパラメータ {#path-parameters}

| パラメータ名          | 説明                                   |
| :-------------- | :----------------------------------- |
| `changefeed_id` | クエリするレプリケーション タスク (changefeed) の ID。 |

### 例 {#example}

次のリクエストは、ID `test1`のレプリケーション タスクの詳細情報を照会します。

```shell
curl -X GET http://127.0.0.1:8300/api/v1/changefeeds/test1
```

```json
{
    "id": "test1",
    "sink_uri": "blackhole://",
    "create_time": "2021-08-10 11:41:30.642",
    "start_ts": 426919038970232833,
    "target_ts": 0,
    "checkpoint_tso": 426921014615867393,
    "checkpoint_time": "2021-08-10 13:47:07.093",
    "sort_engine": "unified",
    "state": "normal",
    "error": null,
    "error_history": null,
    "creator_version": "",
    "task_status": [
        {
            "capture_id": "d8924259-f52f-4dfb-97a9-c48d26395945",
            "table_ids": [
                63,
                65
            ],
            "table_operations": {}
        }
    ]
}
```

## レプリケーションタスクを一時停止する {#pause-a-replication-task}

この API は非同期インターフェイスです。リクエストが成功すると、 `202 Accepted`が返されます。返された結果は、サーバーがコマンドの実行に同意したことを意味するだけで、コマンドが正常に実行されることを保証するものではありません。

### リクエストURI {#request-uri}

`POST /api/v1/changefeeds/{changefeed_id}/pause`

### パラメータの説明 {#parameter-description}

#### パスパラメータ {#path-parameters}

| パラメータ名          | 説明                                    |
| :-------------- | :------------------------------------ |
| `changefeed_id` | 一時停止するレプリケーション タスク (changefeed) の ID。 |

### 例 {#example}

次のリクエストは、ID `test1`レプリケーション タスクを一時停止します。

```shell
curl -X POST http://127.0.0.1:8300/api/v1/changefeeds/test1/pause
```

要求が成功した場合は`202 Accepted`が返されます。要求が失敗した場合は、エラー メッセージとエラー コードが返されます。

## レプリケーションタスクを再開する {#resume-a-replication-task}

この API は非同期インターフェイスです。リクエストが成功すると、 `202 Accepted`が返されます。返された結果は、サーバーがコマンドの実行に同意したことを意味するだけで、コマンドが正常に実行されることを保証するものではありません。

### リクエストURI {#request-uri}

`POST /api/v1/changefeeds/{changefeed_id}/resume`

### パラメータの説明 {#parameter-description}

#### パスパラメータ {#path-parameters}

| パラメータ名          | 説明                                  |
| :-------------- | :---------------------------------- |
| `changefeed_id` | 再開するレプリケーション タスク (changefeed) の ID。 |

### 例 {#example}

次のリクエストは、ID `test1`のレプリケーション タスクを再開します。

```shell
curl -X POST http://127.0.0.1:8300/api/v1/changefeeds/test1/resume
```

要求が成功した場合は`202 Accepted`が返されます。要求が失敗した場合は、エラー メッセージとエラー コードが返されます。

## レプリケーションサブタスクリストをクエリする {#query-the-replication-subtask-list}

このAPIは同期インターフェースです。リクエストが成功すると、すべてのレプリケーションサブタスク( `processor` )の基本情報が返されます。

### リクエストURI {#request-uri}

`GET /api/v1/processors`

### 例 {#example}

```shell
curl -X GET http://127.0.0.1:8300/api/v1/processors
```

```json
[
    {
        "changefeed_id": "test1",
        "capture_id": "561c3784-77f0-4863-ad52-65a3436db6af"
    }
]
```

## 特定のレプリケーションサブタスクをクエリする {#query-a-specific-replication-subtask}

このAPIは同期インターフェースです。リクエストが成功すると、指定されたレプリケーションサブタスク( `processor` )の詳細情報を返します。

### リクエストURI {#request-uri}

`GET /api/v1/processors/{changefeed_id}/{capture_id}`

### パラメータの説明 {#parameter-description}

#### パスパラメータ {#path-parameters}

| パラメータ名          | 説明                             |
| :-------------- | :----------------------------- |
| `changefeed_id` | クエリするレプリケーション サブタスクの変更フィード ID。 |
| `capture_id`    | クエリするレプリケーション サブタスクのキャプチャ ID。  |

### 例 {#example}

次のリクエストは、 `changefeed_id`が`test`で`capture_id`が`561c3784-77f0-4863-ad52-65a3436db6af`であるサブタスクの詳細情報を照会します。サブタスクは`changefeed_id`と`capture_id`で識別できます。

```shell
curl -X GET http://127.0.0.1:8300/api/v1/processors/test1/561c3784-77f0-4863-ad52-65a3436db6af
```

```json
{
    "checkpoint_ts": 426919123303006208,
    "resolved_ts": 426919123369066496,
    "table_ids": [
        63,
        65
    ],
    "error": null
}
```

## TiCDC サービス プロセス リストを照会する {#query-the-ticdc-service-process-list}

このAPIは同期インターフェースです。リクエストが成功すると、すべてのレプリケーションプロセスの基本情報（ `capture` ）が返されます。

### リクエストURI {#request-uri}

`GET /api/v1/captures`

### 例 {#example}

```shell
curl -X GET http://127.0.0.1:8300/api/v1/captures
```

```json
[
    {
        "id": "561c3784-77f0-4863-ad52-65a3436db6af",
        "is_owner": true,
        "address": "127.0.0.1:8300"
    }
]
```

## 所有者ノードの削除 {#evict-an-owner-node}

この API は非同期インターフェイスです。リクエストが成功すると、 `202 Accepted`が返されます。返された結果は、サーバーがコマンドの実行に同意したことを意味するだけで、コマンドが正常に実行されることを保証するものではありません。

### リクエストURI {#request-uri}

`POST /api/v1/owner/resign`

### 例 {#example}

次のリクエストは、TiCDC の現在の所有者ノードを削除し、新しい所有者ノードを生成するための新しいラウンドの選出をトリガーします。

```shell
curl -X POST http://127.0.0.1:8300/api/v1/owner/resign
```

要求が成功した場合は`202 Accepted`が返されます。要求が失敗した場合は、エラー メッセージとエラー コードが返されます。

## レプリケーションタスク内のすべてのテーブルの負荷分散を手動でトリガーする {#manually-trigger-the-load-balancing-of-all-tables-in-a-replication-task}

この API は非同期インターフェイスです。リクエストが成功すると、 `202 Accepted`が返されます。返された結果は、サーバーがコマンドの実行に同意したことを意味するだけで、コマンドが正常に実行されることを保証するものではありません。

### リクエストURI {#request-uri}

`POST /api/v1/changefeeds/{changefeed_id}/tables/rebalance_table`

### パラメータの説明 {#parameter-description}

#### パスパラメータ {#path-parameters}

| パラメータ名          | 説明                                      |
| :-------------- | :-------------------------------------- |
| `changefeed_id` | スケジュールするレプリケーション タスク (changefeed) の ID。 |

### 例 {#example}

次のリクエストは、ID `test1`の変更フィード内のすべてのテーブルの負荷分散をトリガーします。

```shell
 curl -X POST http://127.0.0.1:8300/api/v1/changefeeds/test1/tables/rebalance_table
```

要求が成功した場合は`202 Accepted`が返されます。要求が失敗した場合は、エラー メッセージとエラー コードが返されます。

## テーブルを別のノードに手動でスケジュールする {#manually-schedule-a-table-to-another-node}

この API は非同期インターフェイスです。リクエストが成功すると、 `202 Accepted`が返されます。返された結果は、サーバーがコマンドの実行に同意したことを意味するだけで、コマンドが正常に実行されることを保証するものではありません。

### リクエストURI {#request-uri}

`POST /api/v1/changefeeds/{changefeed_id}/tables/move_table`

### パラメータの説明 {#parameter-description}

#### パスパラメータ {#path-parameters}

| パラメータ名          | 説明                                      |
| :-------------- | :-------------------------------------- |
| `changefeed_id` | スケジュールするレプリケーション タスク (changefeed) の ID。 |

#### リクエスト本文のパラメータ {#parameters-for-the-request-body}

| パラメータ名              | 説明                |
| :------------------ | :---------------- |
| `target_capture_id` | ターゲットキャプチャの ID。   |
| `table_id`          | スケジュールするテーブルの ID。 |

### 例 {#example}

次のリクエストは、ID `test1`の変更フィード内の ID `49`のテーブルを ID `6f19a6d9-0f8c-4dc9-b299-3ba7c0f216f5`のキャプチャにスケジュールします。

```shell
curl -X POST -H "'Content-type':'application/json'" http://127.0.0.1:8300/api/v1/changefeeds/changefeed-test1/tables/move_table -d '{"capture_id":"6f19a6d9-0f8c-4dc9-b299-3ba7c0f216f5","table_id":49}'

```

要求が成功した場合は`202 Accepted`が返されます。要求が失敗した場合は、エラー メッセージとエラー コードが返されます。

## TiCDCサーバーのログレベルを動的に調整する {#dynamically-adjust-the-log-level-of-the-ticdc-server}

この API は同期インターフェースです。リクエストが成功すると`202 OK`返されます。

### リクエストURI {#request-uri}

`POST /api/v1/log`

### リクエストパラメータ {#request-parameters}

#### リクエスト本文のパラメータ {#parameters-for-the-request-body}

| パラメータ名      | 説明          |
| :---------- | :---------- |
| `log_level` | 設定するログ レベル。 |

`log_level` 、「debug」、「info」、「warn」、「error」、「dpanic」、「panic」、および「fatal」の[zap が提供するログレベル](https://godoc.org/go.uber.org/zap#UnmarshalText)をサポートします。

### 例 {#example}

```shell
curl -X POST -H "'Content-type':'application/json'" http://127.0.0.1:8300/api/v1/log -d '{"log_level":"debug"}'

```

要求が成功した場合は`202 OK`が返されます。要求が失敗した場合は、エラー メッセージとエラー コードが返されます。
