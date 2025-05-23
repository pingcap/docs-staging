---
title: RUNAWAY_WATCHES
summary: RUNAWAY_WATCHES` INFORMATION_SCHEMA テーブルについて学習します。
---

# ランナウェイウォッチ {#runaway-watches}

`RUNAWAY_WATCHES`表には、予想よりも多くのリソースを消費するランナウェイ クエリの監視リストが表示されます。詳細については、 [ランナウェイクエリ](/tidb-resource-control.md#manage-queries-that-consume-more-resources-than-expected-runaway-queries)参照してください。

> **注記：**
>
> このテーブルは[TiDB Cloudサーバーレス](https://docs.pingcap.com/tidbcloud/select-cluster-tier#tidb-cloud-serverless)クラスターでは使用できません。

```sql
USE INFORMATION_SCHEMA;
DESC RUNAWAY_WATCHES;
```

```sql
+---------------------+--------------+------+------+---------+-------+
| Field               | Type         | Null | Key  | Default | Extra |
+---------------------+--------------+------+------+---------+-------+
| ID                  | bigint(64)   | NO   |      | NULL    |       |
| RESOURCE_GROUP_NAME | varchar(32)  | NO   |      | NULL    |       |
| START_TIME          | varchar(32)  | NO   |      | NULL    |       |
| END_TIME            | varchar(32)  | YES  |      | NULL    |       |
| WATCH               | varchar(12)  | NO   |      | NULL    |       |
| WATCH_TEXT          | text         | NO   |      | NULL    |       |
| SOURCE              | varchar(128) | NO   |      | NULL    |       |
| ACTION              | varchar(12)  | NO   |      | NULL    |       |
| RULE                | varchar(128) | NO   |      | NULL    |       |
+---------------------+--------------+------+------+---------+-------+
9 rows in set (0.00 sec)
```

## 例 {#examples}

ランナウェイクエリのウォッチリストをクエリします。

```sql
SELECT * FROM INFORMATION_SCHEMA.RUNAWAY_WATCHES ORDER BY id\G
```

出力は次のようになります。

```sql
*************************** 1. row ***************************
                 ID: 1
RESOURCE_GROUP_NAME: default
         START_TIME: 2024-09-11 07:20:48
           END_TIME: 2024-09-11 07:30:48
              WATCH: Exact
         WATCH_TEXT: select count(*) from `tpch1`.`supplier`
             SOURCE: 127.0.0.1:4000
             ACTION: Kill
               RULE: ProcessedKeys = 10000(100)
*************************** 2. row ***************************
                 ID: 2
RESOURCE_GROUP_NAME: default
         START_TIME: 2024-09-11 07:20:51
           END_TIME: 2024-09-11 07:30:51
              WATCH: Exact
         WATCH_TEXT: select count(*) from `tpch1`.`partsupp`
             SOURCE: 127.0.0.1:4000
             ACTION: Kill
               RULE: RequestUnit = RRU:143.369959, WRU:0.000000, WaitDuration:0s(10)
*************************** 3. row ***************************
                 ID: 3
RESOURCE_GROUP_NAME: default
         START_TIME: 2024-09-11 07:21:16
           END_TIME: 2024-09-11 07:31:16
              WATCH: Exact
         WATCH_TEXT: select sleep(2) from t
             SOURCE: 127.0.0.1:4000
             ACTION: Kill
               RULE: ElapsedTime = 2024-09-11T15:21:16+08:00(2024-09-11T15:21:16+08:00)
3 rows in set (0.00 sec)
```

リソース グループ`rg1`のリストに監視項目を追加します。

```sql
QUERY WATCH ADD RESOURCE GROUP rg1 SQL TEXT EXACT TO 'select * from sbtest.sbtest1';
```

ランナウェイクエリのウォッチリストを再度クエリします。

```sql
SELECT * FROM INFORMATION_SCHEMA.RUNAWAY_WATCHES\G
```

出力は次のようになります。

```sql
*************************** 1. row ***************************
                 ID: 1
RESOURCE_GROUP_NAME: default
         START_TIME: 2024-09-11 07:20:48
           END_TIME: 2024-09-11 07:30:48
              WATCH: Exact
         WATCH_TEXT: select count(*) from `tpch1`.`supplier`
             SOURCE: 127.0.0.1:4000
             ACTION: Kill
               RULE: ProcessedKeys = 10000(100)
*************************** 2. row ***************************
                 ID: 2
RESOURCE_GROUP_NAME: default
         START_TIME: 2024-09-11 07:20:51
           END_TIME: 2024-09-11 07:30:51
              WATCH: Exact
         WATCH_TEXT: select count(*) from `tpch1`.`partsupp`
             SOURCE: 127.0.0.1:4000
             ACTION: Kill
               RULE: RequestUnit = RRU:143.369959, WRU:0.000000, WaitDuration:0s(10)
*************************** 3. row ***************************
                 ID: 3
RESOURCE_GROUP_NAME: default
         START_TIME: 2024-09-11 07:21:16
           END_TIME: 2024-09-11 07:31:16
              WATCH: Exact
         WATCH_TEXT: select sleep(2) from t
             SOURCE: 127.0.0.1:4000
             ACTION: Kill
               RULE: ElapsedTime = 2024-09-11T15:21:16+08:00(2024-09-11T15:21:16+08:00)
*************************** 4. row ***************************
                 ID: 4
RESOURCE_GROUP_NAME: default
         START_TIME: 2024-09-11 07:23:10
           END_TIME: UNLIMITED
              WATCH: Exact
         WATCH_TEXT: select * from sbtest.sbtest1
             SOURCE: manual
             ACTION: Kill
               RULE: None
3 row in set (0.00 sec)
```

`RUNAWAY_WATCHES`表の各列フィールドの意味は次のとおりです。

-   `ID` : 監視項目の ID。
-   `RESOURCE_GROUP_NAME` : リソース グループの名前。
-   `START_TIME` : 開始時刻。
-   `END_TIME` : 終了時刻`UNLIMITED`監視項目の有効期間が無制限であることを意味します。
-   `WATCH` : クイック識別の一致タイプ。値は次のとおりです。
    -   `Plan` 、プラン ダイジェストが一致していることを示します。この場合、 `WATCH_TEXT`列目にプラン ダイジェストが表示されます。
    -   `Similar` SQL ダイジェストが一致したことを示します。この場合、 `WATCH_TEXT`列目に SQL ダイジェストが表示されます。
    -   `Exact` SQL テキストが一致したことを示します。この場合、 `WATCH_TEXT`列目に SQL テキストが表示されます。
-   `SOURCE` : 監視項目のソース。2 `QUERY_LIMIT`で識別された場合は、識別された TiDB IP アドレスが表示されます。手動で追加された場合は、 `manual`が表示されます。
-   `ACTION` : 識別後の対応する操作。
-   `RULE` : 識別ルール。現在の 3 つのルールは`ElapsedTime` 、 `ProcessedKeys` 、 `RequestUnit`です。形式は`ProcessedKeys = 666(10)`で、 `666`は実際の値、 `10`しきい値です。
