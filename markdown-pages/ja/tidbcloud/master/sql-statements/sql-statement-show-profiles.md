---
title: SHOW PROFILES
summary: SHOW PROFILESステートメントは現在、空の結果のみを返します。表示手順は、SHOW PROFILESを実行するだけです。このステートメントはMySQLとの互換性のために含まれており、常に空の結果が返されます。
---

# プロフィールを表示 {#show-profiles}

`SHOW PROFILES`ステートメントは現在、空の結果のみを返します。

## あらすじ {#synopsis}

**表示手順:**

![ShowStmt](https://download.pingcap.com/images/docs/sqlgram/ShowStmt.png)

## 例 {#examples}

```sql
SHOW PROFILES;
```

    Empty set (0.00 sec)

## MySQLの互換性 {#mysql-compatibility}

このステートメントは、MySQL との互換性のためだけに含まれています。 `SHOW PROFILES`を実行すると、常に空の結果が返されます。
