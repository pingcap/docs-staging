---
title: START TRANSACTION | TiDB SQL Statement Reference
summary: TiDB データベースの START TRANSACTION の使用法の概要。
---

# 取引を開始 {#start-transaction}

このステートメントは、TiDB 内で新しいトランザクションを開始します。これはステートメント`BEGIN`に似ています。

`START TRANSACTION`ステートメントがない場合、すべてのステートメントはデフォルトで独自のトランザクションで自動コミットされます。この動作により、MySQL の互換性が確保されます。

## 概要 {#synopsis}

**トランザクション開始ステートメント:**

```ebnf+diagram
BeginTransactionStmt ::=
    'BEGIN' ( 'PESSIMISTIC' | 'OPTIMISTIC' )?
|   'START' 'TRANSACTION' ( 'READ' ( 'WRITE' | 'ONLY' ( ( 'WITH' 'TIMESTAMP' 'BOUND' TimestampBound )? | AsOfClause ) ) | 'WITH' 'CONSISTENT' 'SNAPSHOT' | 'WITH' 'CAUSAL' 'CONSISTENCY' 'ONLY' )?

AsOfClause ::=
    ( 'AS' 'OF' 'TIMESTAMP' Expression)
```

## 例 {#examples}

```sql
mysql> CREATE TABLE t1 (a int NOT NULL PRIMARY KEY);
Query OK, 0 rows affected (0.12 sec)

mysql> START TRANSACTION;
Query OK, 0 rows affected (0.00 sec)

mysql> INSERT INTO t1 VALUES (1);
Query OK, 1 row affected (0.00 sec)

mysql> COMMIT;
Query OK, 0 rows affected (0.01 sec)
```

## MySQL 互換性 {#mysql-compatibility}

-   `START TRANSACTION` 、TiDB 内ですぐにトランザクションを開始します。これは、 `START TRANSACTION`遅延トランザクションを作成する MySQL とは異なります。ただし、TiDB の`START TRANSACTION` 、MySQL の`START TRANSACTION WITH CONSISTENT SNAPSHOT`に相当します。

-   ステートメント`START TRANSACTION READ ONLY`は MySQL との互換性のために解析されますが、書き込み操作は引き続き許可されます。

## 参照 {#see-also}

-   [専念](/sql-statements/sql-statement-commit.md)
-   [ロールバック](/sql-statements/sql-statement-rollback.md)
-   [始める](/sql-statements/sql-statement-begin.md)
-   [因果関係の一貫性のみで取引を開始する](/transaction-overview.md#causal-consistency)
