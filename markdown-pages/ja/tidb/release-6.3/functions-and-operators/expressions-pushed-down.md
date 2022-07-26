---
title: List of Expressions for Pushdown
summary: Learn a list of expressions that can be pushed down to TiKV and the related operations.
---

# プッシュダウンの式一覧 {#list-of-expressions-for-pushdown}

TiDB は TiKV からデータを読み取るときに、TiKV に処理されるいくつかの式 (関数または演算子の計算を含む) をプッシュダウンしようとします。これにより、転送されるデータの量が削減され、単一の TiDB ノードからの処理がオフロードされます。このドキュメントでは、TiDB が既にプッシュ ダウンをサポートしている式と、ブロックリストを使用して特定の式のプッシュ ダウンを禁止する方法を紹介します。

## プッシュダウンでサポートされている式 {#supported-expressions-for-pushdown}

| 式タイプ                                                                                 | オペレーション                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| :----------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [論理演算子](/functions-and-operators/operators.md#logical-operators)                     | AND (&amp;&amp;)、OR (||)、NOT (!)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| [比較関数と演算子](/functions-and-operators/operators.md#comparison-functions-and-operators) | &lt;、&lt;=、=、!= ( `<>` )、&gt;、&gt;=、 [`&#x3C;=>`](https://dev.mysql.com/doc/refman/5.7/en/comparison-operators.html#operator_equal-to) 、IS NULL、LIKE、IS TRUE、IS [`COALESCE()`](https://dev.mysql.com/doc/refman/5.7/en/comparison-operators.html#function_coalesce) 、 [`IN()`](https://dev.mysql.com/doc/refman/5.7/en/comparison-operators.html#function_in)                                                                                                                                                                                                                                            |
| [数値関数と演算子](/functions-and-operators/numeric-functions-and-operators.md)              | +, -, *, /, [`ABS()`](https://dev.mysql.com/doc/refman/5.7/en/mathematical-functions.html#function_abs) , [`CEIL()`](https://dev.mysql.com/doc/refman/5.7/en/mathematical-functions.html#function_ceil) , [`CEILING()`](https://dev.mysql.com/doc/refman/5.7/en/mathematical-functions.html#function_ceiling) , [`FLOOR()`](https://dev.mysql.com/doc/refman/5.7/en/mathematical-functions.html#function_floor) , [`MOD()`](https://dev.mysql.com/doc/refman/5.7/en/mathematical-functions.html#function_mod)                                                                                            |
| [制御フロー関数](/functions-and-operators/control-flow-functions.md)                        | [`CASE`](https://dev.mysql.com/doc/refman/5.7/en/flow-control-functions.html#operator_case) 、 [`IF()`](https://dev.mysql.com/doc/refman/5.7/en/flow-control-functions.html#function_if) 、 [`IFNULL()`](https://dev.mysql.com/doc/refman/5.7/en/flow-control-functions.html#function_ifnull)                                                                                                                                                                                                                                                                                                              |
| [JSON関数](/functions-and-operators/json-functions.md)                                 | [JSON\_TYPE(json\_val)][json_type] 、<br/> [JSON\_EXTRACT(json\_doc, path\[, path\] ...)][json_extract] 、<br/> [JSON\_OBJECT(key, val\[, key, val\] ...)][json_object] ,<br/> [JSON\_ARRAY(\[val\[, val\] ...\])][json_array] 、<br/> [JSON\_MERGE(json\_doc, json\_doc\[, json\_doc\] ...)][json_merge] ,<br/> [JSON\_SET(json\_doc, path, val\[, path, val\] ...)][json_set] ,<br/> [JSON\_INSERT(json\_doc, path, val\[, path, val\] ...)][json_insert] ,<br/> [JSON\_REPLACE(json\_doc, path, val\[, path, val\] ...)][json_replace] ,<br/> [JSON\_REMOVE(json\_doc, path\[, path\] ...)][json_remove] |
| [日付と時刻関数](/functions-and-operators/date-and-time-functions.md)                       | [`DATE_FORMAT()`](https://dev.mysql.com/doc/refman/5.7/en/date-and-time-functions.html#function_date-format) 、 [`SYSDATE()`](https://dev.mysql.com/doc/refman/5.7/en/date-and-time-functions.html#function_sysdate)                                                                                                                                                                                                                                                                                                                                                                                      |
| [文字列関数](/functions-and-operators/string-functions.md)                                | [`RIGHT()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_right)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

## ブロックリスト固有の式 {#blocklist-specific-expressions}

[サポートされている式](#supported-expressions-for-pushdown)または特定のデータ型 ( [`ENUM`型](/data-type-string.md#enum-type)と[`BIT`タイプ](/data-type-numeric.md#bit-type)**のみ**) をプッシュダウンしたときに計算プロセスで予期しない動作が発生した場合は、対応する関数、演算子、またはデータ型のプッシュダウンを禁止することで、アプリケーションを迅速に復元できます。具体的には、関数、演算子、またはデータ型をブロックリストに追加することで、プッシュ ダウンを禁止できます`mysql.expr_pushdown_blacklist` 。詳細は[ブロックリストに追加](#add-to-the-blocklist)を参照してください。

`mysql.expr_pushdown_blacklist`のスキーマは次のとおりです。

```sql
tidb> desc mysql.expr_pushdown_blacklist;
+------------+--------------+------+------+-------------------+-------+
| Field      | Type         | Null | Key  | Default           | Extra |
+------------+--------------+------+------+-------------------+-------+
| name       | char(100)    | NO   |      | NULL              |       |
| store_type | char(100)    | NO   |      | tikv,tiflash,tidb |       |
| reason     | varchar(200) | YES  |      | NULL              |       |
+------------+--------------+------+------+-------------------+-------+
3 rows in set (0.00 sec)
```

フィールドの説明:

-   `name` : プッシュ ダウンが禁止されている関数、演算子、またはデータ型の名前。
-   `store_type` : 関数、演算子、またはデータ型のプッシュ ダウンを禁止するストレージ エンジンを指定します。現在、TiDB は`tikv` 、 `tidb` 、および`tiflash`の 3 つのストレージ エンジンをサポートしています。 `store_type`は大文字と小文字を区別しません。関数が複数のストレージ エンジンにプッシュされることが禁止されている場合は、コンマを使用して各エンジンを区切ります。
-   `reason` : 関数がブロックリストに登録された理由。

### ブロックリストに追加 {#add-to-the-blocklist}

1 つ以上の[関数、演算子](#supported-expressions-for-pushdown)またはデータ型 ( [`ENUM`型](/data-type-string.md#enum-type)と[`BIT`タイプ](/data-type-numeric.md#bit-type)**のみ**) をブロックリストに追加するには、次の手順を実行します。

1.  以下を`mysql.expr_pushdown_blacklist`に挿入します。

    -   プッシュダウンを禁止する関数、演算子、またはデータ型の名前
    -   プッシュダウンを禁止するストレージエンジン

2.  `admin reload expr_pushdown_blacklist;`コマンドを実行します。

### ブロックリストから削除 {#remove-from-the-blocklist}

ブロックリストから 1 つ以上の関数、演算子、またはデータ型を削除するには、次の手順を実行します。

1.  `mysql.expr_pushdown_blacklist`の関数、演算子、またはデータ型の名前を削除します。

2.  `admin reload expr_pushdown_blacklist;`コマンドを実行します。

### ブロックリストの使用例 {#blocklist-usage-examples}

次の例は、 `DATE_FORMAT()`関数、 `>`演算子、および`BIT`データ型をブロックリストに追加し、ブロックリストから`>`を削除する方法を示しています。

`EXPLAIN`のステートメントによって返される結果を確認することで、ブロックリストが有効かどうかを確認できます ( [`EXPLAIN`の結果を理解する](/explain-overview.md)を参照)。

```sql
tidb> create table t(a int);
Query OK, 0 rows affected (0.06 sec)

tidb> explain select * from t where a < 2 and a > 2;
+-------------------------+----------+-----------+---------------+------------------------------------+
| id                      | estRows  | task      | access object | operator info                      |
+-------------------------+----------+-----------+---------------+------------------------------------+
| TableReader_7           | 0.00     | root      |               | data:Selection_6                   |
| └─Selection_6           | 0.00     | cop[tikv] |               | gt(ssb_1.t.a, 2), lt(ssb_1.t.a, 2) |
|   └─TableFullScan_5     | 10000.00 | cop[tikv] | table:t       | keep order:false, stats:pseudo     |
+-------------------------+----------+-----------+---------------+------------------------------------+
3 rows in set (0.00 sec)

tidb> insert into mysql.expr_pushdown_blacklist values('date_format()', 'tikv',''), ('>','tikv',''), ('bit','tikv','');
Query OK, 2 rows affected (0.01 sec)
Records: 2  Duplicates: 0  Warnings: 0

tidb> admin reload expr_pushdown_blacklist;
Query OK, 0 rows affected (0.00 sec)

tidb> explain select * from t where a < 2 and a > 2;
+-------------------------+----------+-----------+---------------+------------------------------------+
| id                      | estRows  | task      | access object | operator info                      |
+-------------------------+----------+-----------+---------------+------------------------------------+
| Selection_7             | 10000.00 | root      |               | gt(ssb_1.t.a, 2), lt(ssb_1.t.a, 2) |
| └─TableReader_6         | 10000.00 | root      |               | data:TableFullScan_5               |
|   └─TableFullScan_5     | 10000.00 | cop[tikv] | table:t       | keep order:false, stats:pseudo     |
+-------------------------+----------+-----------+---------------+------------------------------------+
3 rows in set (0.00 sec)

tidb> delete from mysql.expr_pushdown_blacklist where name = '>';
Query OK, 1 row affected (0.01 sec)

tidb> admin reload expr_pushdown_blacklist;
Query OK, 0 rows affected (0.00 sec)

tidb> explain select * from t where a < 2 and a > 2;
+---------------------------+----------+-----------+---------------+--------------------------------+
| id                        | estRows  | task      | access object | operator info                  |
+---------------------------+----------+-----------+---------------+--------------------------------+
| Selection_8               | 0.00     | root      |               | lt(ssb_1.t.a, 2)               |
| └─TableReader_7           | 0.00     | root      |               | data:Selection_6               |
|   └─Selection_6           | 0.00     | cop[tikv] |               | gt(ssb_1.t.a, 2)               |
|     └─TableFullScan_5     | 10000.00 | cop[tikv] | table:t       | keep order:false, stats:pseudo |
+---------------------------+----------+-----------+---------------+--------------------------------+
4 rows in set (0.00 sec)
```

> **ノート：**
>
> -   `admin reload expr_pushdown_blacklist`は、この SQL ステートメントを実行する TiDBサーバーでのみ有効です。すべての TiDB サーバーに適用するには、各 TiDBサーバーで SQL ステートメントを実行します。
> -   特定の式をブロックリストに登録する機能は、TiDB 3.0.0 以降のバージョンでサポートされています。
> -   TiDB 3.0.3 以前のバージョンでは、一部の演算子 (&quot;&gt;&quot;、&quot;+&quot;、&quot;is null&quot; など) を元の名前を使用してブロックリストに追加することはサポートされていません。次の表に示すように、代わりにエイリアス (大文字と小文字を区別) を使用する必要があります。

| オペレーター名    | エイリアス  |
| :--------- | :----- |
| &lt;       | それ     |
|            | gt     |
| &lt;=      | ル      |
| =          | ゲー     |
| =          | 式      |
| !=         | ねえ     |
| `<>`       | ねえ     |
| `<=>`      | nulleq |
| | |        | バイター   |
| &amp;&amp; | ビットと   |
| ||         | また     |
| !          | いいえ    |
| の          | の      |
| <li></li>  | プラス    |
| <li></li>  | マイナス   |
| *          | ムル     |
| /          | 分周     |
| DIV        | intdiv |
| 無効です       | 無効です   |
| 真です        | 正しい    |
| 偽です        | 偽です    |

[json_extract]: https://dev.mysql.com/doc/refman/5.7/en/json-search-functions.html#function_json-extract

[json_short_extract]: https://dev.mysql.com/doc/refman/5.7/en/json-search-functions.html#operator_json-column-path

[json_short_extract_unquote]: https://dev.mysql.com/doc/refman/5.7/en/json-search-functions.html#operator_json-inline-path

[json_unquote]: https://dev.mysql.com/doc/refman/5.7/en/json-modification-functions.html#function_json-unquote

[json_type]: https://dev.mysql.com/doc/refman/5.7/en/json-attribute-functions.html#function_json-type

[json_set]: https://dev.mysql.com/doc/refman/5.7/en/json-modification-functions.html#function_json-set

[json_insert]: https://dev.mysql.com/doc/refman/5.7/en/json-modification-functions.html#function_json-insert

[json_replace]: https://dev.mysql.com/doc/refman/5.7/en/json-modification-functions.html#function_json-replace

[json_remove]: https://dev.mysql.com/doc/refman/5.7/en/json-modification-functions.html#function_json-remove

[json_merge]: https://dev.mysql.com/doc/refman/5.7/en/json-modification-functions.html#function_json-merge

[json_merge_preserve]: https://dev.mysql.com/doc/refman/5.7/en/json-modification-functions.html#function_json-merge-preserve

[json_object]: https://dev.mysql.com/doc/refman/5.7/en/json-creation-functions.html#function_json-object

[json_array]: https://dev.mysql.com/doc/refman/5.7/en/json-creation-functions.html#function_json-array

[json_keys]: https://dev.mysql.com/doc/refman/5.7/en/json-search-functions.html#function_json-keys

[json_length]: https://dev.mysql.com/doc/refman/5.7/en/json-attribute-functions.html#function_json-length

[json_valid]: https://dev.mysql.com/doc/refman/5.7/en/json-attribute-functions.html#function_json-valid

[json_quote]: https://dev.mysql.com/doc/refman/5.7/en/json-creation-functions.html#function_json-quote

[json_contains]: https://dev.mysql.com/doc/refman/5.7/en/json-search-functions.html#function_json-contains

[json_contains_path]: https://dev.mysql.com/doc/refman/5.7/en/json-search-functions.html#function_json-contains-path

[json_arrayagg]: https://dev.mysql.com/doc/refman/5.7/en/group-by-functions.html#function_json-arrayagg

[json_depth]: https://dev.mysql.com/doc/refman/5.7/en/json-attribute-functions.html#function_json-depth
