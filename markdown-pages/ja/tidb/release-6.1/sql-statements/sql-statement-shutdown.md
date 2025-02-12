---
title: SHUTDOWN
summary: An overview of the usage of SHUTDOWN for the TiDB database.
---

# シャットダウン {#shutdown}

`SHUTDOWN`ステートメントは、TiDB でシャットダウン操作を実行するために使用されます。 `SHUTDOWN`ステートメントを実行するには、ユーザーが`SHUTDOWN privilege`を持っている必要があります。

## あらすじ {#synopsis}

**声明：**

![Statement](https://docs-download.pingcap.com/media/images/docs/sqlgram/ShutdownStmt.png)

## 例 {#examples}


```sql
SHUTDOWN;
```

```
Query OK, 0 rows affected (0.00 sec)
```

## MySQL の互換性 {#mysql-compatibility}

> **ノート：**
>
> TiDB は分散データベースであるため、TiDB でのシャットダウン操作は、TiDB クラスター全体ではなく、クライアントに接続された TiDB インスタンスを停止します。

`SHUTDOWN`ステートメントは MySQL と部分的に互換性があります。互換性の問題が発生した場合は、問題を報告できます[GitHubで](https://github.com/pingcap/tidb/issues/new/choose) 。
