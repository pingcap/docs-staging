---
title: ALTER RESOURCE GROUP
summary: TiDB での ALTER RESOURCE GROUP の使用方法を学習します。
---

# リソースグループの変更 {#alter-resource-group}

`ALTER RESOURCE GROUP`ステートメントは、データベース内のリソース グループを変更するために使用されます。

> **注記：**
>
> この機能は[TiDB Cloud Serverless](https://docs.pingcap.com/tidbcloud/select-cluster-tier#tidb-cloud-serverless)クラスターでは利用できません。

## 概要 {#synopsis}

```ebnf+diagram
AlterResourceGroupStmt ::=
   "ALTER" "RESOURCE" "GROUP" IfExists ResourceGroupName ResourceGroupOptionList

IfExists ::=
    ('IF' 'EXISTS')?

ResourceGroupName ::=
    Identifier
|   "DEFAULT"

ResourceGroupOptionList ::=
    DirectResourceGroupOption
|   ResourceGroupOptionList DirectResourceGroupOption
|   ResourceGroupOptionList ',' DirectResourceGroupOption

DirectResourceGroupOption ::=
    "RU_PER_SEC" EqOpt stringLit
|   "PRIORITY" EqOpt ResourceGroupPriorityOption
|   "BURSTABLE"
|   "BURSTABLE" EqOpt Boolean
|   "QUERY_LIMIT" EqOpt '(' ResourceGroupRunawayOptionList ')'
|   "QUERY_LIMIT" EqOpt '(' ')'
|   "QUERY_LIMIT" EqOpt "NULL"
|   "BACKGROUND" EqOpt '(' BackgroundOptionList ')'
|   "BACKGROUND" EqOpt '(' ')'
|   "BACKGROUND" EqOpt "NULL"

ResourceGroupPriorityOption ::=
    LOW
|   MEDIUM
|   HIGH

ResourceGroupRunawayOptionList ::=
    DirectResourceGroupRunawayOption
|   ResourceGroupRunawayOptionList DirectResourceGroupRunawayOption
|   ResourceGroupRunawayOptionList ',' DirectResourceGroupRunawayOption

DirectResourceGroupRunawayOption ::=
    "EXEC_ELAPSED" EqOpt stringLit
|   "ACTION" EqOpt ResourceGroupRunawayActionOption
|   "WATCH" EqOpt ResourceGroupRunawayWatchOption "DURATION" EqOpt stringLit

ResourceGroupRunawayWatchOption ::=
    EXACT
|   SIMILAR

ResourceGroupRunawayActionOption ::=
    DRYRUN
|   COOLDOWN
|   KILL

BackgroundOptionList ::=
    DirectBackgroundOption
|   BackgroundOptionList DirectBackgroundOption
|   BackgroundOptionList ',' DirectBackgroundOption

DirectBackgroundOption ::=
    "TASK_TYPES" EqOpt stringLit
```

TiDB は次の`DirectResourceGroupOption`サポートします[リクエストユニット（RU）](/tidb-resource-control.md#what-is-request-unit-ru)は、CPU、IO、およびその他のシステム リソース用の TiDB 内の統一された抽象化単位です。

| オプション         | 説明                                                                                                        | 例                                                                                                                                                                                                                                                                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RU_PER_SEC`  | 1秒あたりのRUバックフィル速度                                                                                          | `RU_PER_SEC = 500` 、このリソース グループが 1 秒あたり 500 RU でバックフィルされることを示します。                                                                                                                                                                                                                                                                                               |
| `PRIORITY`    | TiKVで処理されるタスクの絶対的な優先度                                                                                     | `PRIORITY = HIGH`優先度が高いことを示します。指定されていない場合は、デフォルト値は`MEDIUM`です。                                                                                                                                                                                                                                                                                                   |
| `BURSTABLE`   | `BURSTABLE`属性が設定されている場合、TiDB は、クォータを超えたときに、対応するリソース グループが使用可能なシステム リソースを使用することを許可します。                     |                                                                                                                                                                                                                                                                                                                                                                 |
| `QUERY_LIMIT` | クエリ実行がこの条件を満たす場合、クエリはランナウェイ クエリとして識別され、対応するアクションが実行されます。                                                  | `QUERY_LIMIT=(EXEC_ELAPSED='60s', ACTION=KILL, WATCH=EXACT DURATION='10m')` 、実行時間が60秒を超えた場合にクエリがランナウェイクエリと識別されることを示します。クエリは終了します。同じSQLテキストを持つすべてのSQL文は、今後10分以内に即時終了します。2または`QUERY_LIMIT=NULL` `QUERY_LIMIT=()`ランナウェイ制御が無効であることを意味します。6 [ランナウェイクエリ](/tidb-resource-control.md#manage-queries-that-consume-more-resources-than-expected-runaway-queries)参照してください。 |
| `BACKGROUND`  | バックグラウンドタスクを設定します。詳細については、 [バックグラウンドタスクを管理する](/tidb-resource-control.md#manage-background-tasks)参照してください。 | `BACKGROUND=(TASK_TYPES="br,stats")` 、バックアップと復元および統計収集関連のタスクがバックグラウンド タスクとしてスケジュールされていることを示します。                                                                                                                                                                                                                                                                 |

> **注記：**
>
> -   `ALTER RESOURCE GROUP`ステートメントは、グローバル変数[`tidb_enable_resource_control`](/system-variables.md#tidb_enable_resource_control-new-in-v660) `ON`に設定されている場合にのみ実行できます。
> -   `ALTER RESOURCE GROUP`文は増分変更をサポートし、指定されていないパラメータは変更されません。ただし、 `QUERY_LIMIT`と`BACKGROUND`全体として使用され、部分的に変更することはできません。
> -   現在、 `BACKGROUND`構成の変更をサポートしているのは`default`リソース グループのみです。

## 例 {#examples}

`rg1`という名前のリソース グループを作成し、そのプロパティを変更します。

```sql
DROP RESOURCE GROUP IF EXISTS rg1;
```

    Query OK, 0 rows affected (0.22 sec)

```sql
CREATE RESOURCE GROUP IF NOT EXISTS rg1
  RU_PER_SEC = 100
  BURSTABLE;
```

```sql
Query OK, 0 rows affected (0.08 sec)
```

```sql
SELECT * FROM information_schema.resource_groups WHERE NAME ='rg1';
```

```sql
+------+------------+----------+-----------+-------------+------------+
| NAME | RU_PER_SEC | PRIORITY | BURSTABLE | QUERY_LIMIT | BACKGROUND |
+------+------------+----------+-----------+-------------+------------+
| rg1  | 100        | MEDIUM   | NO        | NULL        | NULL       |
+------+------------+----------+-----------+-------------+------------+
1 rows in set (1.30 sec)
```

```sql
ALTER RESOURCE GROUP rg1
  RU_PER_SEC = 200
  PRIORITY = LOW
  QUERY_LIMIT = (EXEC_ELAPSED='1s' ACTION=COOLDOWN WATCH=EXACT DURATION '30s');
```

```sql
Query OK, 0 rows affected (0.08 sec)
```

```sql
SELECT * FROM information_schema.resource_groups WHERE NAME ='rg1';
```

```sql
+------+------------+----------+-----------+----------------------------------------------------------------+------------+
| NAME | RU_PER_SEC | PRIORITY | BURSTABLE | QUERY_LIMIT                                                    | BACKGROUND |
+------+------------+----------+-----------+----------------------------------------------------------------+------------+
| rg1  | 200        | LOW      | NO        | EXEC_ELAPSED='1s', ACTION=COOLDOWN, WATCH=EXACT DURATION='30s' | NULL       |
+------+------------+----------+-----------+----------------------------------------------------------------+------------+
1 rows in set (1.30 sec)
```

`default`リソース グループの`BACKGROUND`オプションを変更します。

```sql
ALTER RESOURCE GROUP default BACKGROUND = (TASK_TYPES = "br,ddl");
```

```sql
Query OK, 0 rows affected (0.08 sec)
```

```sql
SELECT * FROM information_schema.resource_groups WHERE NAME ='default';
```

```sql
+---------+------------+----------+-----------+-------------+---------------------+
| NAME    | RU_PER_SEC | PRIORITY | BURSTABLE | QUERY_LIMIT | BACKGROUND          |
+---------+------------+----------+-----------+-------------+---------------------+
| default | UNLIMITED  | MEDIUM   | YES       | NULL        | TASK_TYPES='br,ddl' |
+---------+------------+----------+-----------+-------------+---------------------+
1 rows in set (1.30 sec)
```

## MySQLの互換性 {#mysql-compatibility}

MySQLも[リソースグループの変更](https://dev.mysql.com/doc/refman/8.0/en/alter-resource-group.html)サポートしています。ただし、許容されるパラメータがTiDBと異なるため、互換性がありません。

## 参照 {#see-also}

-   [リソースグループの削除](/sql-statements/sql-statement-drop-resource-group.md)
-   [リソースグループの作成](/sql-statements/sql-statement-create-resource-group.md)
-   [リクエストユニット（RU）](/tidb-resource-control.md#what-is-request-unit-ru)
