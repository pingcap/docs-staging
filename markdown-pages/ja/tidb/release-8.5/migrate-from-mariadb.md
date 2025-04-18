---
title: Migrate Data from MariaDB to TiDB
summary: MariaDB から TiDB にデータを移行する方法を学びます。
---

# MariaDB から TiDB へのデータの移行 {#migrate-data-from-mariadb-to-tidb}

このドキュメントでは、MariaDBサーバーインストールから TiDB クラスターにデータを移行する方法について説明します。

## 前提条件 {#prerequisites}

適切な移行戦略を選択してください。

-   最初の戦略は[Dumplingでデータをダンプし、 TiDB Lightningでデータを復元する](#dump-data-with-dumpling-and-restore-data-with-tidb-lightning)です。これは MariaDB のすべてのバージョンで機能します。この戦略の欠点は、ダウンタイムが長くなることです。
-   2 番目の戦略は、DM を使用して[DMでデータを複製する](#replicate-data-with-dm)から TiDB に移行することです。DM は MariaDB のすべてのバージョンをサポートしているわけではありません。サポートされているバージョンは[DM 互換性カタログ](/dm/dm-compatibility-catalog.md#compatibility-catalog-of-tidb-data-migration)にリストされています。

これら 2 つの戦略の他に、状況に応じて利用できる他の戦略があるかもしれません。たとえば、次のようになります。

-   オブジェクト リレーショナル マッピング (ORM) の機能を使用して、データを再デプロイおよび移行します。
-   移行の進行中に MariaDB と TiDB の両方から書き込むようにアプリケーションを変更します。

このドキュメントでは、最初の 2 つの戦略についてのみ説明します。

選択した戦略に基づいて、次のものを準備します。

-   **ダンプと復元の**戦略の場合:
    -   [Dumpling](/dumpling-overview.md)と[TiDB Lightning](/tidb-lightning/tidb-lightning-overview.md)インストールします。
    -   Dumpling がデータをエクスポートするには、MariaDBサーバーに[必要な権限](/dumpling-overview.md#required-privileges)あることを確認してください。
-   **データ複製**戦略については、 [データ移行 (DM)](/dm/dm-overview.md)設定します。

## 互換性を確認する {#check-compatibility}

TiDB は[MySQLと互換性あり](/mysql-compatibility.md)であり、MySQL と MariaDB には多くの共通機能があります。ただし、移行前に知っておくべき、TiDB と互換性がない MariaDB 固有の機能がある可能性があります。

このセクションの項目を確認するだけでなく、MariaDB ドキュメントの[互換性と相違点](https://mariadb.com/kb/en/compatibility-differences/)も確認することをお勧めします。

### 認証 {#authentication}

[MySQL とのSecurity互換性](/security-compatibility-with-mysql.md)ドキュメントには、TiDB がサポートする認証方法がリストされています。TiDB は MariaDB のいくつかの認証方法をサポートしていません。つまり、アカウントに新しいパスワード ハッシュを作成するか、その他の特定の対策を講じる必要がある場合があります。

使用されている認証方法を確認するには、次のステートメントを実行します。

```sql
SELECT
  plugin,
  COUNT(*)
FROM
  mysql.user
GROUP BY
  plugin;
```

```sql
+-----------------------+----------+
| plugin                | COUNT(*) |
+-----------------------+----------+
| mysql_native_password |       11 |
+-----------------------+----------+
1 row in set (0.002 sec)
```

### システムバージョン管理されたテーブル {#system-versioned-tables}

TiDB は[システムバージョン管理されたテーブル](https://mariadb.com/kb/en/system-versioned-tables/)サポートしていません。ただし、TiDB は[`AS OF TIMESTAMP`](/as-of-timestamp.md)サポートしており、システム バージョン管理されたテーブルの使用例の一部を置き換える可能性があります。

次のステートメントを使用して、影響を受けるテーブルを確認できます。

```sql
SELECT
  TABLE_SCHEMA,
  TABLE_NAME
FROM
  information_schema.tables
WHERE
  TABLE_TYPE='SYSTEM VERSIONED';
```

```sql
+--------------+------------+
| TABLE_SCHEMA | TABLE_NAME |
+--------------+------------+
| test         | t          |
+--------------+------------+
1 row in set (0.005 sec)
```

システムのバージョン管理を削除するには、次の`ALTER TABLE`ステートメントを実行します。

```sql
MariaDB [test]> ALTER TABLE t DROP SYSTEM VERSIONING;
Query OK, 0 rows affected (0.071 sec)
Records: 0  Duplicates: 0  Warnings: 0
```

### シーケンス {#sequences}

MariaDB と TiDB はどちらも[`CREATE SEQUENCE`](/sql-statements/sql-statement-create-sequence.md)サポートしています。ただし、現在 DM ではサポートされていません。移行中にシーケンスを作成、変更、または削除せず、移行後にこれを特にテストすることをお勧めします。

シーケンスを使用しているかどうかを確認するには、次のステートメントを実行します。

```sql
SELECT
  TABLE_SCHEMA,
  TABLE_NAME
FROM
  information_schema.tables
WHERE
  TABLE_TYPE='SEQUENCE';
```

```sql
+--------------+------------+
| TABLE_SCHEMA | TABLE_NAME |
+--------------+------------+
| test         | s1         |
+--------------+------------+
1 row in set (0.016 sec)
```

### ストレージエンジン {#storage-engines}

MariaDB は、 `InnoDB` 、 `MyISAM` 、 `Aria`などのローカル データ用のstorageエンジンを提供しています。データ形式は TiDB では直接サポートされていませんが、これらの移行は問題なく機能します。ただし、 `CONNECT`storageエンジンや`Spider`など、一部のエンジンはサーバーの外部にデータを配置します。このようなテーブルを TiDB に移行することはできますが、TiDB は TiDB クラスターの外部にデータを保存する機能を提供していません。

使用しているstorageエンジンを確認するには、次のステートメントを実行します。

```sql
SELECT
  ENGINE,
  COUNT(*)
FROM
  information_schema.tables
GROUP BY
  ENGINE;
```

```sql
+--------------------+----------+
| ENGINE             | COUNT(*) |
+--------------------+----------+
| NULL               |      101 |
| Aria               |       38 |
| CSV                |        2 |
| InnoDB             |        6 |
| MEMORY             |       67 |
| MyISAM             |        1 |
| PERFORMANCE_SCHEMA |       81 |
+--------------------+----------+
7 rows in set (0.009 sec)
```

### 構文 {#syntax}

MariaDB は、 `DELETE` 、 `INSERT` 、および`REPLACE`ステートメントに対して`RETURNING`キーワードをサポートしています。TiDB はそれらをサポートしていません。アプリケーションとクエリのログを調べて、移行に影響があるかどうかを確認することをお勧めします。

### データ型 {#data-types}

MariaDB は、 `UUID` 、 `INET4` 、 `INET6`など、TiDB がサポートしていないいくつかのデータ型をサポートしています。

これらのデータ型を確認するには、次のステートメントを実行します。

```sql
SELECT
  TABLE_SCHEMA,
  TABLE_NAME,
  COLUMN_NAME,
  DATA_TYPE
FROM
  information_schema.columns
WHERE
  DATA_TYPE IN('INET4','INET6','UUID');
```

```sql
+--------------+------------+-------------+-----------+
| TABLE_SCHEMA | TABLE_NAME | COLUMN_NAME | DATA_TYPE |
+--------------+------------+-------------+-----------+
| test         | u1         | u           | uuid      |
| test         | u1         | i4          | inet4     |
| test         | u1         | i6          | inet6     |
+--------------+------------+-------------+-----------+
3 rows in set (0.026 sec)

```

### 文字セットと照合順序 {#character-set-and-collation}

TiDB は、MariaDB でよく使用される`latin1_swedish_ci`照合順序をサポートしていません。

TiDB がサポートする照合順序を確認するには、TiDB で次のステートメントを実行します。

```sql
SHOW COLLATION;
```

```sql
+--------------------+---------+-----+---------+----------+---------+
| Collation          | Charset | Id  | Default | Compiled | Sortlen |
+--------------------+---------+-----+---------+----------+---------+
| ascii_bin          | ascii   |  65 | Yes     | Yes      |       1 |
| binary             | binary  |  63 | Yes     | Yes      |       1 |
| gbk_bin            | gbk     |  87 |         | Yes      |       1 |
| gbk_chinese_ci     | gbk     |  28 | Yes     | Yes      |       1 |
| latin1_bin         | latin1  |  47 | Yes     | Yes      |       1 |
| utf8_bin           | utf8    |  83 | Yes     | Yes      |       1 |
| utf8_general_ci    | utf8    |  33 |         | Yes      |       1 |
| utf8_unicode_ci    | utf8    | 192 |         | Yes      |       1 |
| utf8mb4_0900_ai_ci | utf8mb4 | 255 |         | Yes      |       1 |
| utf8mb4_0900_bin   | utf8mb4 | 309 |         | Yes      |       1 |
| utf8mb4_bin        | utf8mb4 |  46 | Yes     | Yes      |       1 |
| utf8mb4_general_ci | utf8mb4 |  45 |         | Yes      |       1 |
| utf8mb4_unicode_ci | utf8mb4 | 224 |         | Yes      |       1 |
+--------------------+---------+-----+---------+----------+---------+
13 rows in set (0.0012 sec)
```

現在のテーブルの列が使用している照合順序を確認するには、次のステートメントを使用できます。

```sql
SELECT
  TABLE_SCHEMA,
  COLLATION_NAME,
  COUNT(*)
FROM
  information_schema.columns
GROUP BY
  TABLE_SCHEMA, COLLATION_NAME
ORDER BY
  COLLATION_NAME;
```

```sql
+--------------------+--------------------+----------+
| TABLE_SCHEMA       | COLLATION_NAME     | COUNT(*) |
+--------------------+--------------------+----------+
| sys                | NULL               |      562 |
| test               | NULL               |       14 |
| mysql              | NULL               |       84 |
| performance_schema | NULL               |      892 |
| information_schema | NULL               |      421 |
| mysql              | latin1_swedish_ci  |       34 |
| performance_schema | utf8mb3_bin        |       38 |
| mysql              | utf8mb3_bin        |       61 |
| sys                | utf8mb3_bin        |       40 |
| information_schema | utf8mb3_general_ci |      375 |
| performance_schema | utf8mb3_general_ci |      244 |
| sys                | utf8mb3_general_ci |      386 |
| mysql              | utf8mb3_general_ci |       67 |
| mysql              | utf8mb4_bin        |        8 |
+--------------------+--------------------+----------+
14 rows in set (0.045 sec)
```

[文字セットと照合順序](/character-set-and-collation.md)も参照してください。

## Dumplingでデータをダンプし、 TiDB Lightningでデータを復元する {#dump-data-with-dumpling-and-restore-data-with-tidb-lightning}

この方法では、アプリケーションをオフラインにしてデータを移行し、移行したデータを使用するようにアプリケーションを再構成することを前提としています。

> **注記：**
>
> これを本番で行う前に、まずアプリケーションのテストまたは開発インスタンスで実行することを強くお勧めします。これは、互換性の問題が発生する可能性をチェックするとともに、移行にかかる時間を把握するためです。

MariaDB から TiDB にデータを移行するには、次の手順を実行します。

1.  アプリケーションを停止します。アプリケーションをオフラインにします。これにより、移行中または移行後に MariaDB のデータが変更されないことが保証されます。

2.  [`tiup dumpling`](/dumpling-overview.md#use-dumpling-to-export-data)コマンドで MariaDB にデータをダンプします。

    ```shell
    tiup dumpling --port 3306 --host 127.0.0.1 --user root --password secret -F 256MB  -o /data/backup
    ```

3.  `tiup tidb-lightning`コマンドを使用してデータを復元します。TiDB TiDB Lightning の設定方法と実行方法の詳細については、 [TiDB Lightningを使い始める](/get-started-with-tidb-lightning.md)参照してください。

4.  ユーザー アカウントと権限を移行します。ユーザーと権限を移行する方法の詳細については、 [ユーザーと権限をエクスポートする](#export-users-and-grants)参照してください。

5.  アプリケーションを再構成します。TiDBサーバーに接続できるように、アプリケーション構成を変更する必要があります。

6.  クリーンアップします。移行が成功したことを確認したら、MariaDB のデータの最終バックアップを作成し、サーバーを停止します。これは、 TiUP、 Dumpling、 TiDB Lightningなどのツールを削除できることも意味します。

## DMでデータを複製する {#replicate-data-with-dm}

この方法では、レプリケーションを設定し、アプリケーションを停止してレプリケーションが追いつくのを待ってから、TiDB を使用するようにアプリケーションを再構成することを前提としています。

DM を使用するには、 [TiUPクラスター](/dm/deploy-a-dm-cluster-using-tiup.md)または[TiDB Operator](/tidb-operator-overview.md)を使用して DM サービスのセットを展開する必要があります。その後、 `dmctl`使用して DM サービスを構成します。

> **注記：**
>
> これを本番で行う前に、まずアプリケーションのテストまたは開発インスタンスで実行することを強くお勧めします。これは、互換性の問題が発生する可能性をチェックするとともに、移行にかかる時間を把握するためです。

### ステップ1.準備 {#step-1-prepare}

MariaDB で binlogs が有効になっており、 `binlog_format` `ROW`に設定されていることを確認してください。 `binlog_annotate_row_events=OFF`と`log_bin_compress=OFF`設定することも推奨されます。

また、 `SUPER`権限または`BINLOG MONITOR`および`REPLICATION MASTER ADMIN`権限を持つアカウントも必要です。このアカウントには、移行するスキーマの読み取り権限も必要です。

`SUPER`権限を持つアカウントを使用していない場合、TiDB はまだ MariaDB 固有の権限を確認する方法を知らないため、DM 構成に以下を追加する必要がある可能性があります。

```yaml
ignore-checking-items: ["replication_privilege"]
```

DMを使用して上流から下流にデータを移行する前に、事前チェックを行うことで上流のデータベース構成のエラーを検出し、移行がスムーズに進むようにします。詳細については、 [移行タスクの事前チェック](/dm/dm-precheck.md)参照してください。

### ステップ2. データを複製する {#step-2-replicate-data}

[TiDB データ移行のクイック スタート ガイド](/dm/quick-start-with-dm.md)に従って、MariaDB から TiDB にデータを複製します。

MariaDB から MariaDB へのレプリケーションの場合のように、最初に初期データをコピーする必要はなく、DM がこれを実行します。

### ステップ3. ユーザーアカウントと権限を移行する {#step-3-migrate-user-accounts-and-permissions}

ユーザーと権限を移行する方法については、 [ユーザーと権限をエクスポートする](#export-users-and-grants)参照してください。

### ステップ4. データをテストする {#step-4-test-your-data}

データが複製されたら、読み取り専用クエリを実行して検証することができます。詳細については、 [アプリケーションをテストする](#test-your-application)参照してください。

### ステップ5. 切り替える {#step-5-switch-over}

TiDB に切り替えるには、次の手順を実行する必要があります。

1.  アプリケーションを停止します。
2.  レプリケーションの遅延を監視します。遅延は 0 秒になるはずです。
3.  アプリケーションが TiDB に接続するように構成を変更し、再度起動します。

レプリケーションの遅延を確認するには、 [`query-status &#x3C;taskname>`](/dm/dm-query-status.md#detailed-query-result)から`dmctl`を実行し、 `subTaskStatus`で`"synced: true"`を確認します。

### ステップ6. クリーンアップ {#step-6-clean-up}

移行が成功したことを確認したら、MariaDB のデータの最終バックアップを作成し、サーバーを停止できます。また、DM クラスターを停止して削除することもできます。

## ユーザーと権限をエクスポートする {#export-users-and-grants}

[`pt-show-grants`](https://docs.percona.com/percona-toolkit/pt-show-grants.html)使用できます。これは、MariaDB からユーザーと権限をエクスポートし、TiDB にロードするための Percona Toolkit の一部です。

## アプリケーションをテストする {#test-your-application}

テストには`sysbench`などの汎用ツールを使用することもできますが、アプリケーションの特定の機能をテストすることを強くお勧めします。たとえば、データの一時コピーを使用して、アプリケーションのコピーを TiDB クラスターに対して実行します。

このようなテストにより、アプリケーションの互換性と TiDB とのパフォーマンスが検証されます。対処が必要な警告があるかどうかを確認するには、アプリケーションと TiDB のログ ファイルを監視する必要があります。アプリケーションが使用しているデータベース ドライバー ( Javaベースのアプリケーションの場合は MySQL Connector/J など) がテストされていることを確認してください。必要に応じて、JMeter などのアプリケーションを使用してアプリケーションに負荷をかけることもできます。

## データを検証する {#validate-data}

[同期差分インスペクター](/sync-diff-inspector/sync-diff-inspector-overview.md)使用して、MariaDB と TiDB のデータが同一であるかどうかを検証できます。
