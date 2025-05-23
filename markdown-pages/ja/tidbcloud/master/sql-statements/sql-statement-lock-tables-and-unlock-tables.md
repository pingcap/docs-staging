---
title: LOCK TABLES and UNLOCK TABLES
summary: TiDB データベースの LOCK TABLES と UNLOCK TABLES の使用法の概要。
---

# テーブルのロックとテーブルのロック解除 {#lock-tables-and-unlock-tables}

> **警告：**
>
> `LOCK TABLES`と`UNLOCK TABLES`現在のバージョンの実験的機能です。実本番環境での使用は推奨されません。

TiDB では、クライアント セッションがテーブル ロックを取得して、他のセッションと連携してテーブルにアクセスしたり、他のセッションがテーブルを変更できないようにしたりできます。セッションは、自分自身に対してのみロックを取得または解放できます。1 つのセッションが別のセッションのロックを取得したり、別のセッションが保持しているロックを解放したりすることはできません。

`LOCK TABLES` 、現在のクライアント セッションのテーブル ロックを取得します。ロックする各オブジェクトに対して`LOCK TABLES`および`SELECT`権限を持っている場合は、共通テーブルのテーブル ロックを取得できます。

`UNLOCK TABLES` 、現在のセッションによって保持されているすべてのテーブル ロックを明示的に解放します。2 `LOCK TABLES` 、新しいロックを取得する前に、現在のセッションによって保持されているすべてのテーブル ロックを暗黙的に解放します。

テーブル ロックは、他のセッションによる読み取りや書き込みから保護します。 `WRITE`ロックを保持するセッションは、 `DROP TABLE`や`TRUNCATE TABLE`などのテーブル レベルの操作を実行できます。

> **注記：**
>
> テーブル ロック機能はデフォルトで無効になっています。
>
> -   TiDB Self-Managed の場合、テーブル ロック機能を有効にするには、すべての TiDB インスタンスの構成ファイルで[`enable-table-lock`](https://docs.pingcap.com/tidb/stable/tidb-configuration-file#enable-table-lock-new-in-v400) ～ `true`設定する必要があります。
> -   TiDB Cloud Dedicated の場合、テーブル ロック機能を有効にするには、 [TiDB Cloudサポート](https://docs.pingcap.com/tidbcloud/tidb-cloud-support)連絡して[`enable-table-lock`](https://docs.pingcap.com/tidb/stable/tidb-configuration-file#enable-table-lock-new-in-v400)を`true`に設定する必要があります。
> -   TiDB Cloud Serverless の場合、 [`enable-table-lock`](https://docs.pingcap.com/tidb/stable/tidb-configuration-file#enable-table-lock-new-in-v400) ～ `true`設定はサポートされていません。

## 概要 {#synopsis}

```ebnf+diagram
LockTablesDef
         ::= 'LOCK' ( 'TABLES' | 'TABLE' ) TableName LockType ( ',' TableName LockType)*


UnlockTablesDef
         ::= 'UNLOCK' 'TABLES'

LockType
         ::= 'READ' ('LOCAL')?
           | 'WRITE' ('LOCAL')?
```

## テーブルロックを取得する {#acquire-table-locks}

`LOCK TABLES`ステートメントを使用すると、現在のセッション内でテーブル ロックを取得できます。使用可能なロック タイプは次のとおりです。

`READ`ロック:

-   このロックを保持しているセッションはテーブルを読み取ることはできますが、書き込むことはできません。
-   複数のセッションが同時に同じテーブルから`READ`ロックを取得できます。
-   他のセッションは、 `READ`ロックを明示的に取得せずにテーブルを読み取ることができます。

`READ LOCAL`ロックは MySQL との構文互換性のためだけのものであり、サポートされていません。

`WRITE`ロック:

-   このロックを保持しているセッションは、テーブルを読み書きできます。
-   このロックを保持しているセッションのみがテーブルにアクセスできます。ロックが解除されるまで、他のセッションはテーブルにアクセスできません。

`WRITE LOCAL`ロック:

-   このロックを保持しているセッションは、テーブルを読み書きできます。
-   このロックを保持しているセッションのみがテーブルにアクセスできます。他のセッションはテーブルを読み取ることはできますが、書き込むことはできません。

`LOCK TABLES`のステートメントに必要なロックが別のセッションによって保持されている場合、 `LOCK TABLES`ステートメントは待機する必要があり、このステートメントの実行時にエラーが返されます。次に例を示します。

```sql
> LOCK TABLES t1 READ;
ERROR 8020 (HY000): Table 't1' was locked in WRITE by server: f4799bcb-cad7-4285-8a6d-23d3555173f1_session: 2199023255959
```

上記のエラー メッセージは、TiDB `f4799bcb-cad7-4285-8a6d-23d3555173f1`の ID `2199023255959`のセッションがすでにテーブル`t1`の`WRITE`ロックを保持していることを示しています。したがって、現在のセッションはテーブル`t1`の`READ`ロックを取得できません。

`LOCK TABLES`のステートメントで同じテーブル ロックを複数回取得することはできません。

```sql
> LOCK TABLES t WRITE, t READ;
ERROR 1066 (42000): Not unique table/alias: 't'
```

## テーブルロックを解除する {#release-table-locks}

セッションによって保持されているテーブル ロックが解放されると、それらはすべて同時に解放されます。セッションは、明示的または暗黙的にロックを解放できます。

-   セッションは`UNLOCK TABLES`使用して明示的にロックを解除できます。
-   セッションがすでにロックを保持しているときにロックを取得するために`LOCK TABLES`ステートメントを発行すると、新しいロックが取得される前に既存のロックが暗黙的に解放されます。

クライアント セッションの接続が正常終了か異常終了かに関係なく終了すると、TiDB はセッションで保持されているすべてのテーブル ロックを暗黙的に解放します。クライアントが再接続すると、ロックは無効になります。このため、クライアントで自動再接続を有効にすることはお勧めしません。自動再接続を有効にすると、再接続が発生したときにクライアントに通知されず、すべてのテーブル ロックまたは現在のトランザクションが失われます。対照的に、自動再接続が無効になっている場合、接続が切断されると、次のステートメントが発行されるときにエラーが発生します。クライアントはエラーを検出し、ロックの再取得やトランザクションのやり直しなどの適切なアクションを実行できます。

## テーブルロックの制限と条件 {#table-locking-restrictions-and-conditions}

テーブル ロックを保持しているセッションを終了するには、 `KILL`安全に使用できます。

次のデータベース内のテーブルに対してテーブル ロックを取得することはできません。

-   `INFORMATION_SCHEMA`
-   `PERFORMANCE_SCHEMA`
-   `METRICS_SCHEMA`
-   `mysql`

## MySQL 互換性 {#mysql-compatibility}

### テーブルロックの取得 {#table-lock-acquisition}

-   TiDB では、セッション A がすでにテーブル ロックを保持している場合、セッション B がテーブルに書き込もうとするとエラーが返されます。MySQL では、セッション B の書き込み要求はセッション A がテーブル ロックを解放するまでブロックされ、他のセッションからのテーブル ロック要求は現在のセッションが`WRITE`ロックを解放するまでブロックされます。
-   TiDB では、 `LOCK TABLES`のステートメントに必要なロックが別のセッションによって保持されている場合、 `LOCK TABLES`ステートメントは待機する必要があり、このステートメントの実行時にエラーが返されます。MySQL では、ロックが取得されるまでこのステートメントはブロックされます。
-   TiDB では、 `LOCK TABLES`文はクラスタ全体で有効です。MySQL では、この文は現在の MySQLサーバーでのみ有効であり、NDB クラスタとは互換性がありません。

### テーブルロック解除 {#table-lock-release}

TiDB セッションでトランザクションが明示的に開始されると (たとえば、 `BEGIN`ステートメントを使用)、TiDB はセッションによって保持されているテーブル ロックを暗黙的に解放しませんが、MySQL は解放します。
