---
title: MySQL Compatibility
summary: TiDB と MySQL の互換性、およびサポートされていない機能と異なる機能について学習します。
---

# MySQL 互換性 {#mysql-compatibility}

<CustomContent platform="tidb">

TiDB は、MySQL プロトコル、およびMySQL 5.7と MySQL 8.0 の共通機能と構文と高い互換性があります。MySQL のエコシステム ツール (PHPMyAdmin、Navicat、MySQL Workbench、DBeaver、 [もっと](/develop/dev-guide-third-party-support.md#gui) ) と MySQL クライアントを TiDB に使用できます。

</CustomContent>

<CustomContent platform="tidb-cloud">

TiDB は、MySQL プロトコル、およびMySQL 5.7と MySQL 8.0 の共通機能と構文と高い互換性があります。MySQL のエコシステム ツール (PHPMyAdmin、Navicat、MySQL Workbench、DBeaver、 [もっと](https://docs.pingcap.com/tidb/v7.2/dev-guide-third-party-support#gui) ) と MySQL クライアントを TiDB に使用できます。

</CustomContent>

ただし、MySQL の一部の機能は TiDB ではサポートされていません。これは、問題を解決するよりよい方法が存在する (XML関数の代わりに JSON を使用するなど) か、必要な労力に対して現在の需要が不足している (ストアド プロシージャや関数など) ことが原因である可能性があります。さらに、一部の機能は分散システムで実装するのが難しい場合があります。

<CustomContent platform="tidb">

TiDB は MySQL レプリケーション プロトコルをサポートしていないことに注意してください。代わりに、MySQL でデータをレプリケートするための特別なツールが提供されています。

-   MySQL からデータを複製: [TiDB データ移行 (DM)](/dm/dm-overview.md) 、MySQL または MariaDB から TiDB への完全なデータ移行と増分データ複製をサポートするツールです。
-   MySQL にデータを複製: [ティCDC](/ticdc/ticdc-overview.md) 、TiKV 変更ログを取得して TiDB の増分データを複製するツールです。TiCDC は[MySQLシンク](/ticdc/ticdc-overview.md#replication-consistency)を使用して TiDB の増分データを MySQL に複製します。

</CustomContent>

<CustomContent platform="tidb">

> **注記：**
>
> このページでは、MySQL と TiDB の一般的な違いについて説明します。セキュリティと悲観的トランザクション モードの領域における MySQL との互換性の詳細については、 [Security](/security-compatibility-with-mysql.md)と[悲観的トランザクションモード](/pessimistic-transaction.md#difference-with-mysql-innodb)の専用ページを参照してください。

</CustomContent>

<CustomContent platform="tidb-cloud">

> **注記：**
>
> MySQL と TiDB のトランザクションの違いについては、 [悲観的トランザクションモード](/pessimistic-transaction.md#difference-with-mysql-innodb)参照してください。

</CustomContent>

[TiDB プレイグラウンド](https://play.tidbcloud.com/?utm_source=docs&#x26;utm_medium=mysql_compatibility)で TiDB の機能を試すことができます。

## サポートされていない機能 {#unsupported-features}

-   ストアドプロシージャと関数
-   トリガー
-   イベント
-   ユーザー定義関数
-   `FULLTEXT`構文とインデックス[＃1793](https://github.com/pingcap/tidb/issues/1793)
-   `SPATIAL` ( `GIS`とも`GEOMETRY`れる)関数、データ型、インデックス[＃6347](https://github.com/pingcap/tidb/issues/6347)
-   `ascii` 、 `latin1` 、 `binary` 、 `utf8` 、 `utf8mb4` 、 `gbk`以外の文字セット。
-   オプティマイザートレース
-   XML 関数
-   Xプロトコル[＃1109](https://github.com/pingcap/tidb/issues/1109)
-   列レベルの権限[＃9766](https://github.com/pingcap/tidb/issues/9766)
-   `XA`構文 (TiDB は内部的に 2 フェーズ コミットを使用しますが、これは SQL インターフェース経由では公開されません)
-   `CREATE TABLE tblName AS SELECT stmt`構文[＃4754](https://github.com/pingcap/tidb/issues/4754)
-   `CHECK TABLE`構文[＃4673](https://github.com/pingcap/tidb/issues/4673)
-   `CHECKSUM TABLE`構文[＃1895](https://github.com/pingcap/tidb/issues/1895)
-   `REPAIR TABLE`構文
-   `OPTIMIZE TABLE`構文
-   `HANDLER`ステートメント
-   `CREATE TABLESPACE`ステートメント
-   「セッション トラッカー: OK パケットに GTID コンテキストを追加する」
-   降順インデックス[＃2519](https://github.com/pingcap/tidb/issues/2519)
-   `SKIP LOCKED`構文[＃18207](https://github.com/pingcap/tidb/issues/18207)
-   横方向導出表[＃40328](https://github.com/pingcap/tidb/issues/40328)

## MySQLとの違い {#differences-from-mysql}

### 自動増分ID {#auto-increment-id}

-   TiDB では、自動増分列の値 (ID) は、単一の TiDBサーバー内でグローバルに一意かつ増分されます。複数の TiDB サーバー間で ID を増分するには、 [`AUTO_INCREMENT` MySQL 互換モード](/auto-increment.md#mysql-compatibility-mode)使用できます。ただし、ID は必ずしも順番に割り当てられるわけではないため、 `Duplicated Error`メッセージが発生しないように、既定値とカスタム値を混在させないようにすることをお勧めします。

-   `tidb_allow_remove_auto_inc`システム変数を使用して、 `AUTO_INCREMENT`列属性の削除を許可または禁止できます。列属性を削除するには、 `ALTER TABLE MODIFY`または`ALTER TABLE CHANGE`構文を使用します。

-   TiDB は`AUTO_INCREMENT`列属性の追加をサポートしておらず、一度削除すると回復できません。

-   TiDB v6.6.0 およびそれ以前のバージョンでは、TiDB の自動増分列は MySQL InnoDB と同じように動作し、主キーまたはインデックス プレフィックスである必要があります。v7.0.0 以降では、TiDB はこの制限をなくし、より柔軟なテーブル主キー定義を可能にしています[＃40580](https://github.com/pingcap/tidb/issues/40580)

詳細については[`AUTO_INCREMENT`](/auto-increment.md)参照してください。

> **注記：**
>
> -   テーブルの作成時に主キーを指定しない場合、TiDB は行を識別するために`_tidb_rowid`使用します。この値の割り当ては、自動インクリメント列 (そのような列が存在する場合) とアロケータを共有します。自動インクリメント列を主キーとして指定すると、TiDB はこの列を使用して行を識別します。この状況では、次の状況が発生する可能性があります。

```sql
mysql> CREATE TABLE t(id INT UNIQUE KEY AUTO_INCREMENT);
Query OK, 0 rows affected (0.05 sec)

mysql> INSERT INTO t VALUES();
Query OK, 1 rows affected (0.00 sec)

mysql> INSERT INTO t VALUES();
Query OK, 1 rows affected (0.00 sec)

mysql> INSERT INTO t VALUES();
Query OK, 1 rows affected (0.00 sec)

mysql> SELECT _tidb_rowid, id FROM t;
+-------------+------+
| _tidb_rowid | id   |
+-------------+------+
|           2 |    1 |
|           4 |    3 |
|           6 |    5 |
+-------------+------+
3 rows in set (0.01 sec)
```

ご覧のとおり、共有アロケータがあるため、 `id`​​毎回 2 ずつ増加します。この動作は[MySQL互換モード](/auto-increment.md#mysql-compatibility-mode)では変わり、共有アロケータがないため、数字のスキップは行われません。

<CustomContent platform="tidb">

> **注記：**
>
> `AUTO_INCREMENT`属性は本番環境でホットスポットを引き起こす可能性があります。詳細については[ホットスポットの問題のトラブルシューティング](/troubleshoot-hot-spot-issues.md)を参照してください。代わりに[`AUTO_RANDOM`](/auto-random.md)使用することをお勧めします。

</CustomContent>

<CustomContent platform="tidb-cloud">

> **注記：**
>
> `AUTO_INCREMENT`属性は本番環境でホットスポットを引き起こす可能性があります。詳細については[ホットスポットの問題のトラブルシューティング](https://docs.pingcap.com/tidb/stable/troubleshoot-hot-spot-issues#handle-auto-increment-primary-key-hotspot-tables-using-auto_random)を参照してください。代わりに[`AUTO_RANDOM`](/auto-random.md)使用することをお勧めします。

</CustomContent>

### パフォーマンス スキーマ {#performance-schema}

<CustomContent platform="tidb">

TiDB は、パフォーマンス監視メトリックの保存とクエリに[プロメテウスとグラファナ](/tidb-monitoring-api.md)の組み合わせを利用します。TiDB では、パフォーマンス スキーマ テーブルは結果を返しません。

</CustomContent>

<CustomContent platform="tidb-cloud">

TiDB Cloudでパフォーマンス メトリックを確認するには、 TiDB Cloudコンソールのクラスター概要ページを確認するか、 [サードパーティの監視統合](/tidb-cloud/third-party-monitoring-integrations.md)使用します。パフォーマンス スキーマ テーブルは TiDB で空の結果を返します。

</CustomContent>

### クエリ実行プラン {#query-execution-plan}

TiDB のクエリ実行プラン ( `EXPLAIN` ) の出力形式、内容、権限設定は`EXPLAIN FOR` MySQL のものと大きく異なります。

TiDB では、MySQL システム変数`optimizer_switch`は読み取り専用であり、クエリ プランには影響しません。オプティマイザ ヒントは MySQL と同様の構文で使用できますが、使用可能なヒントとその実装は異なる場合があります。

詳細については[クエリ実行プランを理解する](/explain-overview.md)を参照してください。

### 組み込み関数 {#built-in-functions}

TiDB は MySQL の組み込み関数のほとんどをサポートしていますが、すべてをサポートしているわけではありません。使用可能な関数のリストを取得するには、ステートメント`SHOW BUILTINS`を使用します。

詳細については、 [TiDB SQL文法](https://pingcap.github.io/sqlgram/#functioncallkeyword)を参照してください。

### DDL操作 {#ddl-operations}

TiDB では、サポートされているすべての DDL 変更をオンラインで実行できます。ただし、MySQL と比較して、TiDB の DDL 操作にはいくつかの大きな制限があります。

-   1 つの`ALTER TABLE`ステートメントを使用してテーブルの複数のスキーマ オブジェクト (列やインデックスなど) を変更する場合、複数の変更で同じオブジェクトを指定することはサポートされていません。たとえば、 `ALTER TABLE t1 MODIFY COLUMN c1 INT, DROP COLUMN c1`コマンドを実行すると、 `Unsupported operate same column/index`エラーが出力されます。
-   `TIFLASH REPLICA` 、 `SHARD_ROW_ID_BITS` 、 `AUTO_ID_CACHE`など、単一の`ALTER TABLE`ステートメントを使用して複数の TiDB 固有のスキーマ オブジェクトを変更することはサポートされていません。
-   TiDB は、 `ALTER TABLE`を使用した一部のデータ型の変更をサポートしていません。たとえば、TiDB は`DECIMAL`型から`DATE`型への変更をサポートしていません。データ型の変更がサポートされていない場合、TiDB は`Unsupported modify column: type %d not match origin %d`エラーを報告します。詳細については、 [`ALTER TABLE`](/sql-statements/sql-statement-modify-column.md)を参照してください。
-   `ALGORITHM={INSTANT,INPLACE,COPY}`構文は TiDB 内のアサーションとしてのみ関数、 `ALTER`アルゴリズムを変更するものではありません。詳細については[`ALTER TABLE`](/sql-statements/sql-statement-alter-table.md)を参照してください。
-   `CLUSTERED`型の主キーの追加/削除はサポートされていません。 `CLUSTERED`型の主キーの詳細については、 [クラスター化インデックス](/clustered-indexes.md)を参照してください。
-   異なるタイプのインデックス ( `HASH|BTREE|RTREE|FULLTEXT` ) はサポートされておらず、指定された場合は解析されて無視されます。
-   TiDB は、 `HASH` 、 `RANGE` 、 `LIST` 、および`KEY`パーティション タイプをサポートします。サポートされていないパーティション タイプの場合、TiDB は`Warning: Unsupported partition type %s, treat as normal table`を返します。ここで、 `%s`はサポートされていない特定のパーティション タイプです。
-   範囲、範囲列、リスト、およびリスト列でパーティション化されたテーブルは、 `ADD` 、 `DROP` 、 `TRUNCATE` 、および`REORGANIZE`操作をサポートします。その他のパーティション操作は無視されます。
-   ハッシュおよびキー パーティション テーブルは、 `ADD` 、 `COALESCE` 、および`TRUNCATE`操作をサポートします。その他のパーティション操作は無視されます。
-   パーティション テーブルでは次の構文はサポートされていません。

    -   `SUBPARTITION`
    -   `{CHECK|OPTIMIZE|REPAIR|IMPORT|DISCARD|REBUILD} PARTITION`

    パーティショニングの詳細については、 [パーティショニング](/partitioned-table.md)参照してください。

### 表の分析 {#analyzing-tables}

TiDB では、テーブルの統計情報を完全に再構築する点で MySQL と[統計収集](/statistics.md#manual-collection)異なり、より多くのリソースを消費する操作となり、完了までに時間がかかります。対照的に、MySQL/InnoDB は比較的軽量で短時間の操作を実行します。

詳細については[`ANALYZE TABLE`](/sql-statements/sql-statement-analyze-table.md)を参照してください。

### <code>SELECT</code>構文の制限 {#limitations-of-code-select-code-syntax}

TiDB は次の`SELECT`構文をサポートしていません。

-   `SELECT ... INTO @variable`
-   MySQL 5.7の場合のように、 `SELECT .. GROUP BY expr` `GROUP BY expr ORDER BY expr`意味するわけではありません。

詳細については、 [`SELECT`](/sql-statements/sql-statement-select.md)ステートメントのリファレンスを参照してください。

### <code>UPDATE</code>ステートメント {#code-update-code-statement}

[`UPDATE`](/sql-statements/sql-statement-update.md)ステートメント参照を参照してください。

### ビュー {#views}

TiDB のビューは更新できず、 `UPDATE` 、 `INSERT` 、 `DELETE`などの書き込み操作はサポートされません。

### 一時テーブル {#temporary-tables}

詳細については[TiDB ローカル一時テーブルと MySQL 一時テーブル間の互換性](/temporary-tables.md#compatibility-with-mysql-temporary-tables)参照してください。

### 文字セットと照合順序 {#character-sets-and-collations}

-   TiDB でサポートされている文字セットと照合順序の詳細については、 [文字セットと照合の概要](/character-set-and-collation.md)参照してください。

-   GBK 文字セットの MySQL 互換性については、 [GBK互換性](/character-set-gbk.md#mysql-compatibility)を参照してください。

-   TiDB は、テーブルで使用される文字セットを国別文字セットとして継承します。

### ストレージエンジン {#storage-engines}

TiDB では、代替storageエンジンを使用してテーブルを作成できます。ただし、互換性を確保するために、TiDB によって記述されるメタデータは InnoDBstorageエンジン用です。

<CustomContent platform="tidb">

[`--store`](/command-line-flags-for-tidb-configuration.md#--store)オプションを使用してstorageエンジンを指定するには、TiDBサーバーを起動する必要があります。このstorageエンジンの抽象化機能は、MySQL に似ています。

</CustomContent>

### SQL モード {#sql-modes}

TiDB は、次のほとんどの[SQL モード](/sql-mode.md)サポートします。

-   `Oracle`や`PostgreSQL`などの互換モードは解析されますが無視されます。互換モードはMySQL 5.7では非推奨となり、MySQL 8.0 では削除されました。
-   `ONLY_FULL_GROUP_BY`モードには、 MySQL 5.7からのマイナー[意味の違い](/functions-and-operators/aggregate-group-by-functions.md#differences-from-mysql)があります。
-   MySQL の SQL モード`NO_DIR_IN_CREATE`および`NO_ENGINE_SUBSTITUTION`互換性のために受け入れられますが、TiDB には適用されません。

### デフォルトの違い {#default-differences}

TiDB は、MySQL 5.7および MySQL 8.0 と比較するとデフォルトで違いがあります。

-   デフォルトの文字セット:
    -   TiDB のデフォルト値は`utf8mb4`です。
    -   MySQL 5.7のデフォルト値は`latin1`です。
    -   MySQL 8.0 のデフォルト値は`utf8mb4`です。
-   デフォルトの照合順序:
    -   TiDB のデフォルトの照合順序は`utf8mb4_bin`です。
    -   MySQL 5.7のデフォルトの照合順序は`utf8mb4_general_ci`です。
    -   MySQL 8.0 のデフォルトの照合順序は`utf8mb4_0900_ai_ci`です。
-   デフォルトの SQL モード:
    -   TiDB のデフォルトの SQL モードには、次のモードが含まれます: `ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION` 。
    -   MySQL のデフォルトの SQL モード:
        -   MySQL 5.7のデフォルトの SQL モードは TiDB と同じです。
        -   MySQL 8.0 のデフォルトの SQL モードには、次のモードが含まれます: `ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION` 。
-   デフォルト値は`lower_case_table_names`です:
    -   TiDB のデフォルト値は`2`で、現在は`2`のみがサポートされています。
    -   MySQL のデフォルトは次の値です。
        -   Linux の場合: `0` 。テーブル名とデータベース名は、 `CREATE TABLE`または`CREATE DATABASE`ステートメントで指定された大文字と小文字に従ってディスクに保存されます。名前の比較では大文字と小文字が区別されます。
        -   Windows の場合: `1` 。これは、テーブル名がディスク上に小文字で保存され、名前の比較で大文字と小文字が区別されないことを意味します。MySQL は、storage時および検索時にすべてのテーブル名を小文字に変換します。この動作は、データベース名とテーブル エイリアスにも適用されます。
        -   macOS の場合: `2` 。テーブル名とデータベース名は、 `CREATE TABLE`または`CREATE DATABASE`ステートメントで指定された大文字と小文字に従ってディスクに保存されますが、MySQL は検索時にそれらを小文字に変換します。名前の比較では大文字と小文字は区別されません。
-   デフォルト値は`explicit_defaults_for_timestamp`です:
    -   TiDB のデフォルト値は`ON`で、現在は`ON`のみがサポートされています。
    -   MySQL のデフォルトは次の値です。
        -   MySQL 5.7の場合: `OFF` .
        -   MySQL 8.0 の場合: `ON` .

### 日時 {#date-and-time}

TiDB は、次の点を考慮して名前付きタイムゾーンをサポートします。

-   TiDB は、計算のために現在システムにインストールされているすべてのタイムゾーン ルール (通常は`tzdata`パッケージ) を使用します。これにより、タイムゾーン テーブル データをインポートしなくても、すべてのタイムゾーン名を使用できます。タイムゾーン テーブル データをインポートしても、計算ルールは変更されません。
-   現在、MySQL はデフォルトでローカル タイムゾーンを使用し、計算にはシステムに組み込まれている現在のタイムゾーン ルール (たとえば、夏時間の開始時) に依存します。 [タイムゾーンテーブルデータのインポート](https://dev.mysql.com/doc/refman/8.0/en/time-zone-support.html#time-zone-installation)ないと、MySQL はタイムゾーンを名前で指定できません。

### 型システムの違い {#type-system-differences}

次の列タイプは MySQL ではサポートされていますが、TiDB ではサポート**されていません**。

-   `SQL_TSI_*` (SQL_TSI_MONTH、SQL_TSI_WEEK、SQL_TSI_DAY、SQL_TSI_HOUR、SQL_TSI_MINUTE、および SQL_TSI_SECOND が含まれますが、SQL_TSI_YEAR は含まれません)

### 正規表現 {#regular-expressions}

`REGEXP_INSTR()` 、 `REGEXP_LIKE()` 、 `REGEXP_REPLACE()` 、 `REGEXP_SUBSTR()`を含む、MySQL との TiDB 正規表現の互換性については、 [MySQL との正規表現の互換性](/functions-and-operators/string-functions.md#regular-expression-compatibility-with-mysql)を参照してください。

### 非推奨の機能による非互換性 {#incompatibility-due-to-deprecated-features}

TiDB は、MySQL で非推奨となった次のような特定の機能を実装していません。

-   浮動小数点型の精度を指定します。MySQL 8.0 [非推奨](https://dev.mysql.com/doc/refman/8.0/en/floating-point-types.html)この機能がサポートされておらず、代わりに`DECIMAL`型を使用することをお勧めします。
-   `ZEROFILL`属性。MySQL 8.0 [非推奨](https://dev.mysql.com/doc/refman/8.0/en/numeric-type-attributes.html)ではこの機能がサポートされておらず、代わりにアプリケーションで数値を埋め込むことが推奨されます。

### <code>CREATE RESOURCE GROUP</code> 、 <code>DROP RESOURCE GROUP</code> 、および<code>ALTER RESOURCE GROUP</code>ステートメント {#code-create-resource-group-code-code-drop-resource-group-code-and-code-alter-resource-group-code-statements}

リソース グループを作成、変更、および削除するための次のステートメントでは、MySQL とは異なるパラメータがサポートされています。詳細については、次のドキュメントを参照してください。

-   [`CREATE RESOURCE GROUP`](/sql-statements/sql-statement-create-resource-group.md)
-   [`DROP RESOURCE GROUP`](/sql-statements/sql-statement-drop-resource-group.md)
-   [`ALTER RESOURCE GROUP`](/sql-statements/sql-statement-alter-resource-group.md)
