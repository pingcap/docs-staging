---
title: DATA_LOCK_WAITS
summary: DATA_LOCK_WAITS` information_schema テーブルについて学習します。
---

# データロック待機 {#data-lock-waits}

`DATA_LOCK_WAITS`表には、悲観的トランザクションのロック待機情報とブロックされている楽観的トランザクションの情報を含む、クラスター内のすべての TiKV ノードで進行中のロック待機情報が表示されます。

```sql
USE information_schema;
DESC data_lock_waits;
```

```sql
+------------------------+---------------------+------+------+---------+-------+
| Field                  | Type                | Null | Key  | Default | Extra |
+------------------------+---------------------+------+------+---------+-------+
| KEY                    | text                | NO   |      | NULL    |       |
| KEY_INFO               | text                | YES  |      | NULL    |       |
| TRX_ID                 | bigint(21) unsigned | NO   |      | NULL    |       |
| CURRENT_HOLDING_TRX_ID | bigint(21) unsigned | NO   |      | NULL    |       |
| SQL_DIGEST             | varchar(64)         | YES  |      | NULL    |       |
| SQL_DIGEST_TEXT        | text                | YES  |      | NULL    |       |
+------------------------+---------------------+------+------+---------+-------+
```

`DATA_LOCK_WAITS`表の各列フィールドの意味は次のとおりです。

-   `KEY` : ロックを待機しているキー。16 進形式です。
-   `KEY_INFO` : `KEY`の詳細情報[キー情報](#key_info)セクションを参照してください。
-   `TRX_ID` : ロックを待機しているトランザクションの ID。この ID はトランザクションの`start_ts`でもあります。
-   `CURRENT_HOLDING_TRX_ID` : 現在ロックを保持しているトランザクションの ID。この ID はトランザクションの`start_ts`でもあります。
-   `SQL_DIGEST` : ロック待機中のトランザクションで現在ブロックされている SQL ステートメントのダイジェスト。
-   `SQL_DIGEST_TEXT` : ロック待機トランザクションで現在ブロックされている正規化された SQL 文 (引数と形式のない SQL 文)。 `SQL_DIGEST`に相当します。

> **警告：**
>
> -   [プロセス](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_process)権限を持つユーザーのみがこのテーブルを照会できます。
> -   現在、楽観的トランザクションの場合、フィールド`SQL_DIGEST`と`SQL_DIGEST_TEXT`は`null` (使用不可) です。回避策として、ブロックの原因となる SQL ステートメントを見つけるには、このテーブルを[`CLUSTER_TIDB_TRX`](/information-schema/information-schema-tidb-trx.md)と結合して、楽観的トランザクションのすべての SQL ステートメントを取得します。
> -   `DATA_LOCK_WAITS`テーブルの情報は、クエリ中にすべての TiKV ノードからリアルタイムで取得されます。現在、クエリに`WHERE`条件がある場合でも、情報収集はすべての TiKV ノードで実行されます。クラスターが大きく負荷が高い場合、このテーブルをクエリすると、パフォーマンスジッターの潜在的なリスクが発生する可能性があります。したがって、実際の状況に応じて使用してください。
> -   異なる TiKV ノードからの情報が、同じ時刻のスナップショットであるとは限りません。
> -   `SQL_DIGEST`列目の情報（SQLダイジェスト）は、正規化されたSQL文から計算されたハッシュ値です。3 `SQL_DIGEST_TEXT`目の情報は、文サマリーテーブルから内部的に照会されるため、対応する文が内部的に見つからない可能性があります。SQLダイジェストと文サマリーテーブルの詳細については、 [ステートメント要約表](/statement-summary-tables.md)参照してください。

## <code>KEY_INFO</code> {#code-key-info-code}

`KEY_INFO`列目には`KEY`列目の詳細情報が表示されます。情報は JSON 形式で表示されます。各フィールドの説明は次のとおりです。

-   `"db_id"` : キーが属するスキーマの ID。
-   `"db_name"` : キーが属するスキーマの名前。
-   `"table_id"` : キーが属するテーブルの ID。
-   `"table_name"` : キーが属するテーブルの名前。
-   `"partition_id"` : キーが配置されているパーティションの ID。
-   `"partition_name"` : キーが配置されているパーティションの名前。
-   `"handle_type"` : 行キー（つまり、データ行を格納するキー）のハンドルタイプ。可能な値は次のとおりです。
    -   `"int"` : ハンドル タイプは int です。つまり、ハンドルは行 ID です。
    -   `"common"` : ハンドル タイプは int64 ではありません。このタイプは、クラスター化インデックスが有効な場合に非 int 主キーに表示されます。
    -   `"unknown"` : ハンドル タイプは現在サポートされていません。
-   `"handle_value"` : ハンドル値。
-   `"index_id"` : インデックスキー（インデックスを格納するキー）が属するインデックス ID。
-   `"index_name"` : インデックス キーが属するインデックスの名前。
-   `"index_values"` : インデックス キー内のインデックス値。

上記のフィールドのうち、フィールドの情報が該当しないか現在利用できない場合は、そのフィールドはクエリ結果で省略されます。たとえば、行キー情報には`index_id` 、 `index_name` 、 `index_values`含まれません。インデックスキーには`handle_type`と`handle_value`含まれません。非パーティションテーブルには`partition_id`と`partition_name`表示されません。削除されたテーブルのキー情報では`table_name` 、 `db_id` 、 `db_name` 、 `index_name`などのスキーマ情報を取得できず、テーブルがパーティションテーブルであるかどうかを区別できません。

> **注記：**
>
> キーがパーティション化が有効になっているテーブルから取得され、クエリ中に何らかの理由 (たとえば、キーが属するテーブルが削除されている) によりキーが属するスキーマの情報をクエリできない場合、キーが属するパーティションの ID が`table_id`フィールドに表示されることがあります。これは、TiDB が複数の独立したテーブルのキーをエンコードするのと同じ方法で、異なるパーティションのキーをエンコードするためです。したがって、スキーマ情報が欠落している場合、TiDB はキーがパーティション化されていないテーブルに属しているか、テーブルの 1 つのパーティションに属しているかを確認できません。

## 例 {#example}

```sql
select * from information_schema.data_lock_waits\G
```

```sql
*************************** 1. row ***************************
                   KEY: 7480000000000000355F728000000000000001
              KEY_INFO: {"db_id":1,"db_name":"test","table_id":53,"table_name":"t","handle_type":"int","handle_value":"1"}
                TRX_ID: 426790594290122753
CURRENT_HOLDING_TRX_ID: 426790590082449409
            SQL_DIGEST: 38b03afa5debbdf0326a014dbe5012a62c51957f1982b3093e748460f8b00821
       SQL_DIGEST_TEXT: update `t` set `v` = `v` + ? where `id` = ?
1 row in set (0.01 sec)
```

上記のクエリ結果は、ID `426790594290122753`のトランザクションが、ダイジェスト`"38b03afa5debbdf0326a014dbe5012a62c51957f1982b3093e748460f8b00821"`持ち、形式が``update `t` set `v` = `v` + ? where `id` = ?``であるステートメントを実行するときに、キー`"7480000000000000355F728000000000000001"`の悲観的ロックを取得しようとしているが、このキーのロックは ID `426790590082449409`のトランザクションによって保持されていることを示しています。
