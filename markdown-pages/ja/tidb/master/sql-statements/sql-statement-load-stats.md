---
title: LOAD STATS
summary: TiDB データベースの LOAD STATS の使用法の概要。
---

# ロード統計 {#load-stats}

`LOAD STATS`ステートメントは、統計を TiDB にロードするために使用されます。

> **注記：**
>
> この機能は[TiDB サーバーレス](https://docs.pingcap.com/tidbcloud/select-cluster-tier#tidb-serverless)クラスターでは使用できません。

## 概要 {#synopsis}

```ebnf+diagram
LoadStatsStmt ::=
    'LOAD' 'STATS' stringLit
```

## 例 {#examples}

アドレス`http://${tidb-server-ip}:${tidb-server-status-port}/stats/dump/${db_name}/${table_name}`にアクセスすると、TiDB インスタンスの統計情報をダウンロードできます。

`LOAD STATS ${stats_path}`を使用して特定の統計ファイルを読み込むこともできます。

`${stats_path}`絶対パスまたは相対パスになります。相対パスを使用する場合、対応するファイルは`tidb-server`が開始するパスから検索されます。次に例を示します。

```sql
LOAD STATS '/tmp/stats.json';
```

    Query OK, 0 rows affected (0.00 sec)

## MySQL 互換性 {#mysql-compatibility}

このステートメントは、MySQL 構文に対する TiDB 拡張です。

## 参照 {#see-also}

-   [統計](/statistics.md)
