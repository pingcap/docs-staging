---
title: CANCEL IMPORT
summary: TiDB での CANCEL IMPORT の使用法の概要。
---

# インポートをキャンセル {#cancel-import}

`CANCEL IMPORT`ステートメントは、TiDB で作成されたデータ インポート ジョブをキャンセルするために使用されます。

> **注記：**
>
> この機能は[TiDB サーバーレス](https://docs.pingcap.com/tidbcloud/select-cluster-tier#tidb-serverless)クラスターでは使用できません。

## 必要な権限 {#required-privileges}

データ インポート ジョブをキャンセルするには、インポート ジョブの作成者であるか、 `SUPER`権限を持っている必要があります。

## 概要 {#synopsis}

```ebnf+diagram
CancelImportJobsStmt ::=
    'CANCEL' 'IMPORT' 'JOB' JobID
```

## 例 {#example}

ID が`1`のインポート ジョブをキャンセルするには、次のステートメントを実行します。

```sql
CANCEL IMPORT JOB 1;
```

出力は次のようになります。

    Query OK, 0 rows affected (0.01 sec)

## MySQL 互換性 {#mysql-compatibility}

このステートメントは、MySQL 構文に対する TiDB 拡張です。

## 参照 {#see-also}

-   [`IMPORT INTO`](/sql-statements/sql-statement-import-into.md)
-   [`SHOW IMPORT JOB`](/sql-statements/sql-statement-show-import-job.md)
