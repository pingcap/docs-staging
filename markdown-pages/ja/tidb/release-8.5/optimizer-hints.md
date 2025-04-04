---
title: Optimizer Hints
summary: オプティマイザヒントを使用してクエリ実行プランに影響を与える
---

# オプティマイザーのヒント {#optimizer-hints}

TiDB は、 MySQL 5.7で導入されたコメントのような構文に基づいたオプティマイザヒントをサポートしています。たとえば、一般的な構文の 1 つは`/*+ HINT_NAME([t1_name [, t2_name] ...]) */`です。TiDB オプティマイザが最適でないクエリプランを選択する場合は、オプティマイザヒントの使用が推奨されます。

ヒントが有効にならない状況に遭遇した場合は、 [ヒントが効かない一般的な問題のトラブルシューティング](#troubleshoot-common-issues-that-hints-do-not-take-effect)参照してください。

## 構文 {#syntax}

オプティマイザ ヒントは大文字と小文字を区別せず、SQL ステートメントの`SELECT` 、 `INSERT` 、 `UPDATE` 、または`DELETE`キーワードに続く`/*+ ... */`コメント内で指定されます。

複数のヒントは、コンマで区切って指定できます。たとえば、次のクエリでは 3 つの異なるヒントが使用されています。

```sql
SELECT /*+ USE_INDEX(t1, idx1), HASH_AGG(), HASH_JOIN(t1) */ count(*) FROM t t1, t t2 WHERE t1.a = t2.b;
```

オプティマイザヒントがクエリ実行プランにどのように影響するかは、 [`EXPLAIN`](/sql-statements/sql-statement-explain.md)と[`EXPLAIN ANALYZE`](/sql-statements/sql-statement-explain-analyze.md)の出力で確認できます。

ヒントが不正確または不完全な場合、ステートメント エラーは発生しません。これは、ヒントがクエリ実行に対する*ヒント*(提案) の意味のみを持つことを意図しているためです。同様に、TiDB はヒントが適用できない場合、せいぜい警告を返します。

> **注記：**
>
> 指定されたキーワードの後にコメントが続かない場合は、一般的な MySQL コメントとして扱われます。コメントは有効にならず、警告も報告されません。

現在、TiDB は、範囲が異なる 2 つのカテゴリのヒントをサポートしています。最初のカテゴリのヒントは、 [`/*+ HASH_AGG() */`](#hash_agg)のようにクエリ ブロックのスコープ内で有効になり、2 番目のカテゴリのヒントは、 [`/*+ MEMORY_QUOTA(1024 MB)*/`](#memory_quotan)のようにクエリ全体で有効になります。

ステートメント内の各クエリまたはサブクエリは異なるクエリ ブロックに対応し、各クエリ ブロックには独自の名前があります。例:

```sql
SELECT * FROM (SELECT * FROM t) t1, (SELECT * FROM t) t2;
```

上記のクエリ ステートメントには 3 つのクエリ ブロックがあります。最も外側の`SELECT`最初のクエリ ブロック (名前は`sel_1`に対応します。2 つの`SELECT`サブクエリは 2 番目と 3 番目のクエリ ブロック (名前はそれぞれ`sel_2`と`sel_3` ) に対応します。数字の順序は、左から右への`SELECT`の出現に基づいています。最初の`SELECT` `DELETE`または`UPDATE`に置き換えると、対応するクエリ ブロック名は`del_1`または`upd_1`なります。

## クエリブロックで有効になるヒント {#hints-that-take-effect-in-query-blocks}

このカテゴリのヒントは、 `SELECT` 、または`DELETE` `UPDATE`**の**後に続くことができます。ヒントの有効範囲を制御するには、ヒントでクエリ ブロックの名前を使用します。クエリ内の各テーブルを正確に識別することで、ヒント パラメータを明確にすることができます (テーブル名またはエイリアスが重複している場合)。ヒントでクエリ ブロックが指定されていない場合、ヒントはデフォルトで現在のブロックで有効になります。

例えば：

```sql
SELECT /*+ HASH_JOIN(@sel_1 t1@sel_1, t3) */ * FROM (SELECT t1.a, t1.b FROM t t1, t t2 WHERE t1.a = t2.a) t1, t t3 WHERE t1.b = t3.b;
```

このヒントは`sel_1`クエリ ブロックで有効になり、そのパラメータは`sel_1`の`t1`および`t3`テーブルです ( `sel_2`は`t1`テーブルも含まれます)。

前述のように、ヒント内のクエリ ブロックの名前は次の方法で指定できます。

-   クエリ ブロック名をヒントの最初のパラメータとして設定し、他のパラメータとスペースで区切ります。 `QB_NAME`に加えて、このセクションにリストされているすべてのヒントには、別のオプションの非表示パラメータ`@QB_NAME`もあります。このパラメータを使用すると、このヒントの有効範囲を指定できます。
-   このテーブルがどのクエリ ブロックに属しているかを明示的に指定するには、パラメータ内のテーブル名に`@QB_NAME`追加します。

> **注記：**
>
> ヒントは、ヒントが有効なクエリ ブロック内またはその前に置く必要があります。ヒントをクエリ ブロックの後に置くと、ヒントは有効になりません。

### QB_NAME {#qb-name}

クエリ ステートメントが複数のネストされたクエリを含む複雑なステートメントである場合、特定のクエリ ブロックの ID と名前が誤って識別される可能性があります。この点については、ヒント`QB_NAME`役立ちます。

`QB_NAME`クエリ ブロック名を意味します。クエリ ブロックに新しい名前を指定できます。指定された`QB_NAME`と以前のデフォルト名はどちらも有効です。例:

```sql
SELECT /*+ QB_NAME(QB1) */ * FROM (SELECT * FROM t) t1, (SELECT * FROM t) t2;
```

このヒントは、外側の`SELECT`クエリ ブロックの名前を`QB1`に指定します。これにより、 `QB1`とデフォルト名`sel_1`両方がクエリ ブロックに対して有効になります。

> **注記：**
>
> 上記の例では、ヒントが`QB_NAME`から`sel_2`指定し、元の 2 番目のクエリ ブロック`SELECT`に新しい`QB_NAME`指定していない場合、 `sel_2` 2 番目のクエリ ブロック`SELECT`に対して無効な名前になります。

### MERGE_JOIN(t1_name [, tl_name ...]) {#merge-join-t1-name-tl-name}

`MERGE_JOIN(t1_name [, tl_name ...])`ヒントは、指定されたテーブルに対してソートマージ結合アルゴリズムを使用するようにオプティマイザに指示します。通常、このアルゴリズムはメモリの消費量が少なくなりますが、処理時間は長くなります。データ量が非常に多い場合やシステムメモリが不足している場合は、このヒントを使用することをお勧めします。例:

```sql
select /*+ MERGE_JOIN(t1, t2) */ * from t1, t2 where t1.id = t2.id;
```

> **注記：**
>
> `TIDB_SMJ` 、TiDB 3.0.x 以前のバージョンでは`MERGE_JOIN`の別名です。これらのバージョンのいずれかを使用している場合は、ヒントに`TIDB_SMJ(t1_name [, tl_name ...])`構文を適用する必要があります。TiDB のそれ以降のバージョンでは、 `TIDB_SMJ`と`MERGE_JOIN`どちらもヒントに有効な名前ですが、 `MERGE_JOIN`が推奨されます。

### NO_MERGE_JOIN(t1_name [, tl_name ...]) {#no-merge-join-t1-name-tl-name}

ヒント`NO_MERGE_JOIN(t1_name [, tl_name ...])`は、指定されたテーブルに対してソートマージ結合アルゴリズムを使用しないようにオプティマイザに指示します。例:

```sql
SELECT /*+ NO_MERGE_JOIN(t1, t2) */ * FROM t1, t2 WHERE t1.id = t2.id;
```

### INL_JOIN(t1_name [, tl_name ...]) {#inl-join-t1-name-tl-name}

> **注記：**
>
> 場合によっては、 `INL_JOIN`ヒントが有効にならないことがあります。詳細については、 [`INL_JOIN`ヒントは有効になりません](#inl_join-hint-does-not-take-effect)参照してください。

`INL_JOIN(t1_name [, tl_name ...])`ヒントは、オプティマイザに、指定されたテーブルに対してインデックス ネスト ループ結合アルゴリズムを使用するように指示します。このアルゴリズムは、一部のシナリオではシステム リソースの消費が少なく、処理時間が短くなる場合がありますが、他のシナリオでは逆の結果が生成される場合があります。外部テーブルが`WHERE`条件でフィルター処理された後、結果セットが 10,000 行未満である場合は、このヒントを使用することをお勧めします。例:

```sql
SELECT /*+ INL_JOIN(t1, t2) */ * FROM t1, t2, t3 WHERE t1.id = t2.id AND t2.id = t3.id;
```

前述の SQL 文では、 `INL_JOIN(t1, t2)`ヒントはオプティマイザに`t1`と`t2`に対してインデックス ネスト ループ結合アルゴリズムを使用するように指示しています。これは、 `t1`と`t2`の間でインデックス ネスト ループ結合アルゴリズムが使用されることを意味しているわけではないことに注意してください。代わりに、ヒントは`t1`と`t2`それぞれ別のテーブル ( `t3` ) でインデックス ネスト ループ結合アルゴリズムを使用することを示しています。

`INL_JOIN()`で指定されたパラメータは、クエリ プランを作成するときに内部テーブルの候補テーブルです。たとえば、 `INL_JOIN(t1)` 、TiDB がクエリ プランを作成するために内部テーブルとして`t1`のみを使用することを検討することを意味します。候補テーブルに別名がある場合は、 `INL_JOIN()`のパラメータとして別名を使用する必要があります。別名がない場合は、テーブルの元の名前をパラメータとして使用します。たとえば、 `select /*+ INL_JOIN(t1) */ * from t t1, t t2 where t1.a = t2.b;`クエリでは、 `INL_JOIN()`のパラメータとして`t`ではなく、 `t`テーブルの別名`t1`または`t2`使用する必要があります。

> **注記：**
>
> `TIDB_INLJ` 、TiDB 3.0.x 以前のバージョンでは`INL_JOIN`の別名です。これらのバージョンのいずれかを使用している場合は、ヒントに`TIDB_INLJ(t1_name [, tl_name ...])`構文を適用する必要があります。TiDB のそれ以降のバージョンでは、 `TIDB_INLJ`と`INL_JOIN`どちらもヒントに有効な名前ですが、 `INL_JOIN`が推奨されます。

### NO_INDEX_JOIN(t1_name [, tl_name ...]) {#no-index-join-t1-name-tl-name}

ヒント`NO_INDEX_JOIN(t1_name [, tl_name ...])`は、指定されたテーブルに対してインデックス ネスト ループ結合アルゴリズムを使用しないようにオプティマイザに指示します。例:

```sql
SELECT /*+ NO_INDEX_JOIN(t1, t2) */ * FROM t1, t2 WHERE t1.id = t2.id;
```

### INL_HASH_JOIN {#inl-hash-join}

`INL_HASH_JOIN(t1_name [, tl_name])`ヒントは、インデックス ネスト ループ ハッシュ結合アルゴリズムを使用するようにオプティマイザに指示します。このアルゴリズムを使用する条件は、インデックス ネスト ループ結合アルゴリズムを使用する条件と同じです。2 つのアルゴリズムの違いは、 `INL_JOIN`結合された内部テーブルにハッシュ テーブルを作成しますが、 `INL_HASH_JOIN`結合された外部テーブルにハッシュ テーブルを作成することです`INL_HASH_JOIN`にはメモリ使用量の制限が固定されていますが、 `INL_JOIN`で使用されるメモリは内部テーブルで一致する行数によって異なります。

### NO_INDEX_HASH_JOIN(t1_name [, tl_name ...]) {#no-index-hash-join-t1-name-tl-name}

ヒント`NO_INDEX_HASH_JOIN(t1_name [, tl_name ...])`は、指定されたテーブルに対してインデックス ネスト ループ ハッシュ結合アルゴリズムを使用しないようにオプティマイザに指示します。

### INL_マージ結合 {#inl-merge-join}

ヒント`INL_MERGE_JOIN(t1_name [, tl_name])`は、インデックス ネスト ループ マージ結合アルゴリズムを使用するようにオプティマイザに指示します。このアルゴリズムを使用する条件は、インデックス ネスト ループ結合アルゴリズムを使用する条件と同じです。

### NO_INDEX_MERGE_JOIN(t1_name [, tl_name ...]) {#no-index-merge-join-t1-name-tl-name}

ヒント`NO_INDEX_MERGE_JOIN(t1_name [, tl_name ...])`は、指定されたテーブルに対してインデックス ネスト ループ マージ結合アルゴリズムを使用しないようにオプティマイザに指示します。

### HASH_JOIN(t1_name [, tl_name ...]) {#hash-join-t1-name-tl-name}

`HASH_JOIN(t1_name [, tl_name ...])`ヒントは、指定されたテーブルに対してハッシュ結合アルゴリズムを使用するようにオプティマイザに指示します。このアルゴリズムにより、クエリを複数のスレッドで同時に実行できるため、処理速度が向上しますが、メモリの消費量も増加します。例:

```sql
select /*+ HASH_JOIN(t1, t2) */ * from t1, t2 where t1.id = t2.id;
```

> **注記：**
>
> `TIDB_HJ` 、TiDB 3.0.x 以前のバージョンでは`HASH_JOIN`の別名です。これらのバージョンのいずれかを使用している場合は、ヒントに`TIDB_HJ(t1_name [, tl_name ...])`構文を適用する必要があります。TiDB のそれ以降のバージョンでは、 `TIDB_HJ`と`HASH_JOIN`どちらもヒントに有効な名前ですが、 `HASH_JOIN`が推奨されます。

### NO_HASH_JOIN(t1_name [, tl_name ...]) {#no-hash-join-t1-name-tl-name}

ヒント`NO_HASH_JOIN(t1_name [, tl_name ...])`は、指定されたテーブルに対してハッシュ結合アルゴリズムを使用しないようにオプティマイザに指示します。例:

```sql
SELECT /*+ NO_HASH_JOIN(t1, t2) */ * FROM t1, t2 WHERE t1.id = t2.id;
```

### HASH_JOIN_BUILD(t1_name [, tl_name ...]) {#hash-join-build-t1-name-tl-name}

`HASH_JOIN_BUILD(t1_name [, tl_name ...])`ヒントは、指定されたテーブルをビルド側としてハッシュ結合アルゴリズムを使用するようにオプティマイザに指示します。このようにして、特定のテーブルを使用してハッシュ テーブルを構築できます。例:

```sql
SELECT /*+ HASH_JOIN_BUILD(t1) */ * FROM t1, t2 WHERE t1.id = t2.id;
```

### HASH_JOIN_PROBE(t1_name [, tl_name ...]) {#hash-join-probe-t1-name-tl-name}

`HASH_JOIN_PROBE(t1_name [, tl_name ...])`ヒントは、指定されたテーブルをプローブ側としてハッシュ結合アルゴリズムを使用するようにオプティマイザに指示します。このようにして、特定のテーブルをプローブ側としてハッシュ結合アルゴリズムを実行できます。例:

```sql
SELECT /*+ HASH_JOIN_PROBE(t2) */ * FROM t1, t2 WHERE t1.id = t2.id;
```

### セミジョインリライト() {#semi-join-rewrite}

`SEMI_JOIN_REWRITE()`ヒントは、セミ結合クエリを通常の結合クエリに書き換えるようにオプティマイザに指示します。現在、このヒントは`EXISTS`サブクエリに対してのみ機能します。

このヒントを使用してクエリを書き換えないと、実行プランでハッシュ結合が選択されたときに、セミ結合クエリはサブクエリを使用してハッシュ テーブルを構築することしかできません。この場合、サブクエリの結果が外部クエリの結果よりも大きいと、実行速度が予想よりも遅くなる可能性があります。

同様に、実行プランでインデックス結合が選択されている場合、セミ結合クエリは駆動テーブルとして外部クエリのみを使用できます。この場合、サブクエリの結果が外部クエリの結果よりも小さいと、実行速度が予想よりも遅くなる可能性があります。

`SEMI_JOIN_REWRITE()`を使用してクエリを書き換えると、オプティマイザーは選択範囲を拡張して、より適切な実行プランを選択できます。

```sql
-- Does not use SEMI_JOIN_REWRITE() to rewrite the query.
EXPLAIN SELECT * FROM t WHERE EXISTS (SELECT 1 FROM t1 WHERE t1.a = t.a);
```

```sql
+-----------------------------+---------+-----------+------------------------+---------------------------------------------------+
| id                          | estRows | task      | access object          | operator info                                     |
+-----------------------------+---------+-----------+------------------------+---------------------------------------------------+
| MergeJoin_9                 | 7992.00 | root      |                        | semi join, left key:test.t.a, right key:test.t1.a |
| ├─IndexReader_25(Build)     | 9990.00 | root      |                        | index:IndexFullScan_24                            |
| │ └─IndexFullScan_24        | 9990.00 | cop[tikv] | table:t1, index:idx(a) | keep order:true, stats:pseudo                     |
| └─IndexReader_23(Probe)     | 9990.00 | root      |                        | index:IndexFullScan_22                            |
|   └─IndexFullScan_22        | 9990.00 | cop[tikv] | table:t, index:idx(a)  | keep order:true, stats:pseudo                     |
+-----------------------------+---------+-----------+------------------------+---------------------------------------------------+
```

```sql
-- Uses SEMI_JOIN_REWRITE() to rewrite the query.
EXPLAIN SELECT * FROM t WHERE EXISTS (SELECT /*+ SEMI_JOIN_REWRITE() */ 1 FROM t1 WHERE t1.a = t.a);
```

```sql
+------------------------------+---------+-----------+------------------------+---------------------------------------------------------------------------------------------------------------+
| id                           | estRows | task      | access object          | operator info                                                                                                 |
+------------------------------+---------+-----------+------------------------+---------------------------------------------------------------------------------------------------------------+
| IndexJoin_16                 | 1.25    | root      |                        | inner join, inner:IndexReader_15, outer key:test.t1.a, inner key:test.t.a, equal cond:eq(test.t1.a, test.t.a) |
| ├─StreamAgg_39(Build)        | 1.00    | root      |                        | group by:test.t1.a, funcs:firstrow(test.t1.a)->test.t1.a                                                      |
| │ └─IndexReader_34           | 1.00    | root      |                        | index:IndexFullScan_33                                                                                        |
| │   └─IndexFullScan_33       | 1.00    | cop[tikv] | table:t1, index:idx(a) | keep order:true                                                                                               |
| └─IndexReader_15(Probe)      | 1.25    | root      |                        | index:Selection_14                                                                                            |
|   └─Selection_14             | 1.25    | cop[tikv] |                        | not(isnull(test.t.a))                                                                                         |
|     └─IndexRangeScan_13      | 1.25    | cop[tikv] | table:t, index:idx(a)  | range: decided by [eq(test.t.a, test.t1.a)], keep order:false, stats:pseudo                                   |
+------------------------------+---------+-----------+------------------------+---------------------------------------------------------------------------------------------------------------+
```

前述の例から、ヒント`SEMI_JOIN_REWRITE()`を使用すると、TiDB は駆動テーブル`t1`に基づいて IndexJoin の実行方法を選択できることがわかります。

### SHUFFLE_JOIN(t1_name [, tl_name ...]) {#shuffle-join-t1-name-tl-name}

ヒント`SHUFFLE_JOIN(t1_name [, tl_name ...])`は、指定されたテーブルで Shuffle Join アルゴリズムを使用するようにオプティマイザに指示します。このヒントは MPP モードでのみ有効です。例:

```sql
SELECT /*+ SHUFFLE_JOIN(t1, t2) */ * FROM t1, t2 WHERE t1.id = t2.id;
```

> **注記：**
>
> -   このヒントを使用する前に、現在の TiDB クラスターがクエリでTiFlash MPP モードの使用をサポートできることを確認してください。詳細については、 [TiFlash MPPモードを使用する](/tiflash/use-tiflash-mpp-mode.md)を参照してください。
> -   このヒントは、 [`HASH_JOIN_BUILD`ヒント](#hash_join_buildt1_name--tl_name-)および[`HASH_JOIN_PROBE`ヒント](#hash_join_probet1_name--tl_name-)と組み合わせて使用して、シャッフル結合アルゴリズムのビルド側とプローブ側を制御できます。

### BROADCAST_JOIN(t1_name [, tl_name ...]) {#broadcast-join-t1-name-tl-name}

`BROADCAST_JOIN(t1_name [, tl_name ...])`ヒントは、指定されたテーブルでブロードキャスト結合アルゴリズムを使用するようにオプティマイザに指示します。このヒントは MPP モードでのみ有効です。例:

```sql
SELECT /*+ BROADCAST_JOIN(t1, t2) */ * FROM t1, t2 WHERE t1.id = t2.id;
```

> **注記：**
>
> -   このヒントを使用する前に、現在の TiDB クラスターがクエリでTiFlash MPP モードの使用をサポートできることを確認してください。詳細については、 [TiFlash MPPモードを使用する](/tiflash/use-tiflash-mpp-mode.md)を参照してください。
> -   このヒントは、 [`HASH_JOIN_BUILD`ヒント](#hash_join_buildt1_name--tl_name-)および[`HASH_JOIN_PROBE`ヒント](#hash_join_probet1_name--tl_name-)と組み合わせて使用して、ブロードキャスト結合アルゴリズムのビルド側とプローブ側を制御できます。

### NO_DECORRELATE() {#no-decorrelate}

`NO_DECORRELATE()`ヒントは、指定されたクエリ ブロック内の相関サブクエリに対して非相関化を実行しないようにオプティマイザに指示します。このヒントは、相関列 (つまり、相関サブクエリ) を含む`EXISTS` 、 `IN` 、 `ANY` 、 `ALL` 、 `SOME`サブクエリおよびスカラー サブクエリに適用されます。

このヒントがクエリ ブロックで使用される場合、オプティマイザーはサブクエリとその外部クエリ ブロック間の相関列の非相関化を実行しようとはせず、常に Apply 演算子を使用してクエリを実行します。

デフォルトでは、 TiDB は相関サブクエリに対して[相関除去を実行する](/correlated-subquery-optimization.md)を試みて、より高い実行効率を実現します。ただし、 [いくつかのシナリオ](/correlated-subquery-optimization.md#restrictions)では、相関解除によって実行効率が実際に低下する可能性があります。この場合、このヒントを使用して、オプティマイザに相関解除を実行しないように手動で指示できます。例:

```sql
create table t1(a int, b int);
create table t2(a int, b int, index idx(b));
```

```sql
-- Not using NO_DECORRELATE().
explain select * from t1 where t1.a < (select sum(t2.a) from t2 where t2.b = t1.b);
```

```sql
+----------------------------------+----------+-----------+---------------+--------------------------------------------------------------------------------------------------------------+
| id                               | estRows  | task      | access object | operator info                                                                                                |
+----------------------------------+----------+-----------+---------------+--------------------------------------------------------------------------------------------------------------+
| HashJoin_11                      | 9990.00  | root      |               | inner join, equal:[eq(test.t1.b, test.t2.b)], other cond:lt(cast(test.t1.a, decimal(10,0) BINARY), Column#7) |
| ├─HashAgg_23(Build)              | 7992.00  | root      |               | group by:test.t2.b, funcs:sum(Column#8)->Column#7, funcs:firstrow(test.t2.b)->test.t2.b                      |
| │ └─TableReader_24               | 7992.00  | root      |               | data:HashAgg_16                                                                                              |
| │   └─HashAgg_16                 | 7992.00  | cop[tikv] |               | group by:test.t2.b, funcs:sum(test.t2.a)->Column#8                                                           |
| │     └─Selection_22             | 9990.00  | cop[tikv] |               | not(isnull(test.t2.b))                                                                                       |
| │       └─TableFullScan_21       | 10000.00 | cop[tikv] | table:t2      | keep order:false, stats:pseudo                                                                               |
| └─TableReader_15(Probe)          | 9990.00  | root      |               | data:Selection_14                                                                                            |
|   └─Selection_14                 | 9990.00  | cop[tikv] |               | not(isnull(test.t1.b))                                                                                       |
|     └─TableFullScan_13           | 10000.00 | cop[tikv] | table:t1      | keep order:false, stats:pseudo                                                                               |
+----------------------------------+----------+-----------+---------------+--------------------------------------------------------------------------------------------------------------+
```

上記の実行プランから、オプティマイザが自動的に非相関化を実行したことがわかります。非相関化実行プランには Apply 演算子がありません。代わりに、プランにはサブクエリと外部クエリ ブロック間の結合操作があります。相関列を含む元のフィルター条件 ( `t2.b = t1.b` ) は、通常の結合条件になります。

```sql
-- Using NO_DECORRELATE().
explain select * from t1 where t1.a < (select /*+ NO_DECORRELATE() */ sum(t2.a) from t2 where t2.b = t1.b);
```

```sql
+------------------------------------------+-----------+-----------+------------------------+--------------------------------------------------------------------------------------+
| id                                       | estRows   | task      | access object          | operator info                                                                        |
+------------------------------------------+-----------+-----------+------------------------+--------------------------------------------------------------------------------------+
| Projection_10                            | 10000.00  | root      |                        | test.t1.a, test.t1.b                                                                 |
| └─Apply_12                               | 10000.00  | root      |                        | CARTESIAN inner join, other cond:lt(cast(test.t1.a, decimal(10,0) BINARY), Column#7) |
|   ├─TableReader_14(Build)                | 10000.00  | root      |                        | data:TableFullScan_13                                                                |
|   │ └─TableFullScan_13                   | 10000.00  | cop[tikv] | table:t1               | keep order:false, stats:pseudo                                                       |
|   └─MaxOneRow_15(Probe)                  | 10000.00  | root      |                        |                                                                                      |
|     └─StreamAgg_20                       | 10000.00  | root      |                        | funcs:sum(Column#14)->Column#7                                                       |
|       └─Projection_45                    | 100000.00 | root      |                        | cast(test.t2.a, decimal(10,0) BINARY)->Column#14                                     |
|         └─IndexLookUp_44                 | 100000.00 | root      |                        |                                                                                      |
|           ├─IndexRangeScan_42(Build)     | 100000.00 | cop[tikv] | table:t2, index:idx(b) | range: decided by [eq(test.t2.b, test.t1.b)], keep order:false, stats:pseudo         |
|           └─TableRowIDScan_43(Probe)     | 100000.00 | cop[tikv] | table:t2               | keep order:false, stats:pseudo                                                       |
+------------------------------------------+-----------+-----------+------------------------+--------------------------------------------------------------------------------------+
```

上記の実行プランから、オプティマイザが非相関化を実行していないことがわかります。実行プランには、まだ Apply 演算子が含まれています。相関列を含むフィルタ条件 ( `t2.b = t1.b` ) は、 `t2`テーブルにアクセスするときのフィルタ条件のままです。

### HASH_AGG() {#hash-agg}

`HASH_AGG()`ヒントは、指定されたクエリ ブロック内のすべての集計関数でハッシュ集計アルゴリズムを使用するようにオプティマイザに指示します。このアルゴリズムにより、クエリを複数のスレッドで同時に実行できるため、処理速度が向上しますが、メモリの消費量も増加します。例:

```sql
select /*+ HASH_AGG() */ count(*) from t1, t2 where t1.a > 10 group by t1.id;
```

### ストリームAGG() {#stream-agg}

`STREAM_AGG()`ヒントは、指定されたクエリ ブロック内のすべての集計関数でストリーム集計アルゴリズムを使用するようにオプティマイザに指示します。通常、このアルゴリズムはメモリの消費量が少なくなりますが、処理時間は長くなります。データ量が非常に多い場合やシステムメモリが不足している場合は、このヒントを使用することをお勧めします。例:

```sql
select /*+ STREAM_AGG() */ count(*) from t1, t2 where t1.a > 10 group by t1.id;
```

### MPP_1PHASE_AGG() {#mpp-1phase-agg}

`MPP_1PHASE_AGG()`指定されたクエリ ブロック内のすべての集計関数に対して 1 フェーズ集計アルゴリズムを使用するようにオプティマイザに指示します。このヒントは MPP モードでのみ有効です。例:

```sql
SELECT /*+ MPP_1PHASE_AGG() */ COUNT(*) FROM t1, t2 WHERE t1.a > 10 GROUP BY t1.id;
```

> **注記：**
>
> このヒントを使用する前に、現在の TiDB クラスターがクエリでTiFlash MPP モードの使用をサポートできることを確認してください。詳細については、 [TiFlash MPPモードを使用する](/tiflash/use-tiflash-mpp-mode.md)を参照してください。

### MPP_2PHASE_AGG() {#mpp-2phase-agg}

`MPP_2PHASE_AGG()`指定されたクエリ ブロック内のすべての集計関数に対して 2 フェーズ集計アルゴリズムを使用するようにオプティマイザに指示します。このヒントは MPP モードでのみ有効です。例:

```sql
SELECT /*+ MPP_2PHASE_AGG() */ COUNT(*) FROM t1, t2 WHERE t1.a > 10 GROUP BY t1.id;
```

> **注記：**
>
> このヒントを使用する前に、現在の TiDB クラスターがクエリでTiFlash MPP モードの使用をサポートできることを確認してください。詳細については、 [TiFlash MPPモードを使用する](/tiflash/use-tiflash-mpp-mode.md)を参照してください。

### USE_INDEX(t1_name, idx1_name [, idx2_name ...]) {#use-index-t1-name-idx1-name-idx2-name}

`USE_INDEX(t1_name, idx1_name [, idx2_name ...])`ヒントは、指定された`t1_name`テーブルに対して指定されたインデックスのみを使用するようにオプティマイザに指示します。たとえば、次のヒントを適用すると、 `select * from t t1 use index(idx1, idx2);`ステートメントを実行するのと同じ効果があります。

```sql
SELECT /*+ USE_INDEX(t1, idx1, idx2) */ * FROM t1;
```

> **注記：**
>
> このヒントでテーブル名のみを指定し、インデックス名を指定しない場合、実行ではインデックスは考慮されず、テーブル全体がスキャンされます。

### FORCE_INDEX(t1_name, idx1_name [, idx2_name ...]) {#force-index-t1-name-idx1-name-idx2-name}

ヒント`FORCE_INDEX(t1_name, idx1_name [, idx2_name ...])`は、指定されたインデックスのみを使用するようにオプティマイザーに指示します。

`FORCE_INDEX(t1_name, idx1_name [, idx2_name ...])`の使い方と効果は`USE_INDEX(t1_name, idx1_name [, idx2_name ...])`の使い方と効果と同じです。

次の 4 つのクエリは同じ効果があります。

```sql
SELECT /*+ USE_INDEX(t, idx1) */ * FROM t;
SELECT /*+ FORCE_INDEX(t, idx1) */ * FROM t;
SELECT * FROM t use index(idx1);
SELECT * FROM t force index(idx1);
```

### IGNORE_INDEX(t1_name, idx1_name [, idx2_name ...]) {#ignore-index-t1-name-idx1-name-idx2-name}

`IGNORE_INDEX(t1_name, idx1_name [, idx2_name ...])`ヒントは、指定された`t1_name`テーブルの指定されたインデックスを無視するようにオプティマイザに指示します。たとえば、次のヒントを適用すると、 `select * from t t1 ignore index(idx1, idx2);`ステートメントを実行するのと同じ効果があります。

```sql
select /*+ IGNORE_INDEX(t1, idx1, idx2) */ * from t t1;
```

### ORDER_INDEX(t1_name, idx1_name [, idx2_name ...]) {#order-index-t1-name-idx1-name-idx2-name}

ヒント`ORDER_INDEX(t1_name, idx1_name [, idx2_name ...])`は、指定されたテーブルに対して指定されたインデックスのみを使用し、指定されたインデックスを順番に読み取るようにオプティマイザに指示します。

> **警告：**
>
> このヒントにより、SQL ステートメントが失敗する可能性があります。最初にテストすることをお勧めします。テスト中にエラーが発生した場合は、ヒントを削除します。テストが正常に実行された場合は、引き続き使用できます。

このヒントは通常、次のシナリオで適用されます。

```sql
CREATE TABLE t(a INT, b INT, key(a), key(b));
EXPLAIN SELECT /*+ ORDER_INDEX(t, a) */ a FROM t ORDER BY a LIMIT 10;
```

```sql
+----------------------------+---------+-----------+---------------------+-------------------------------+
| id                         | estRows | task      | access object       | operator info                 |
+----------------------------+---------+-----------+---------------------+-------------------------------+
| Limit_10                   | 10.00   | root      |                     | offset:0, count:10            |
| └─IndexReader_14           | 10.00   | root      |                     | index:Limit_13                |
|   └─Limit_13               | 10.00   | cop[tikv] |                     | offset:0, count:10            |
|     └─IndexFullScan_12     | 10.00   | cop[tikv] | table:t, index:a(a) | keep order:true, stats:pseudo |
+----------------------------+---------+-----------+---------------------+-------------------------------+
```

オプティマイザは、このクエリに対して`Limit + IndexScan(keep order: true)`と`TopN + IndexScan(keep order: false)` 2 種類のプランを生成します。 `ORDER_INDEX`ヒントを使用すると、オプティマイザはインデックスを順番に読み取る最初のプランを選択します。

> **注記：**
>
> -   クエリ自体がインデックスを順番に読み取る必要がない場合（つまり、ヒントがない場合、オプティマイザはどのような状況でもインデックスを順番に読み取るプランを生成しません）、 `ORDER_INDEX`ヒントを使用するとエラー`Can't find a proper physical plan for this query`が発生します。この場合、対応する`ORDER_INDEX`ヒントを削除する必要があります。
> -   パーティションテーブル上のインデックスは順番に読み取ることができないため、パーティションテーブルとその関連インデックスに対して`ORDER_INDEX`ヒントを使用しないでください。

### NO_ORDER_INDEX(t1_name, idx1_name [, idx2_name ...]) {#no-order-index-t1-name-idx1-name-idx2-name}

ヒント`NO_ORDER_INDEX(t1_name, idx1_name [, idx2_name ...])`は、指定されたテーブルに対して指定されたインデックスのみを使用し、指定されたインデックスを順番に読み取らないようにオプティマイザに指示します。このヒントは通常、次のシナリオに適用されます。

次の例は、クエリ ステートメントの効果が`SELECT * FROM t t1 use index(idx1, idx2);`と同等であることを示しています。

```sql
CREATE TABLE t(a INT, b INT, key(a), key(b));
EXPLAIN SELECT /*+ NO_ORDER_INDEX(t, a) */ a FROM t ORDER BY a LIMIT 10;
```

```sql
+----------------------------+----------+-----------+---------------------+--------------------------------+
| id                         | estRows  | task      | access object       | operator info                  |
+----------------------------+----------+-----------+---------------------+--------------------------------+
| TopN_7                     | 10.00    | root      |                     | test.t.a, offset:0, count:10   |
| └─IndexReader_14           | 10.00    | root      |                     | index:TopN_13                  |
|   └─TopN_13                | 10.00    | cop[tikv] |                     | test.t.a, offset:0, count:10   |
|     └─IndexFullScan_12     | 10000.00 | cop[tikv] | table:t, index:a(a) | keep order:false, stats:pseudo |
+----------------------------+----------+-----------+---------------------+--------------------------------+
```

ヒント`ORDER_INDEX`の例と同じように、オプティマイザはこのクエリに対して`Limit + IndexScan(keep order: true)`と`TopN + IndexScan(keep order: false)` 2 種類のプランを生成します。ヒント`NO_ORDER_INDEX`を使用すると、オプティマイザは後者のプランを選択してインデックスを順不同で読み取ります。

### AGG_TO_COP() {#agg-to-cop}

ヒント`AGG_TO_COP()`は、指定されたクエリ ブロック内の集計操作をコプロセッサにプッシュダウンするようにオプティマイザに指示します。オプティマイザがプッシュダウンに適した集計関数をプッシュダウンしない場合は、このヒントを使用することをお勧めします。例:

```sql
select /*+ AGG_TO_COP() */ sum(t1.a) from t t1;
```

### LIMIT_TO_COP() {#limit-to-cop}

`LIMIT_TO_COP()`ヒントは、指定されたクエリ ブロック内の`Limit`および`TopN`演算子をコプロセッサにプッシュダウンするようにオプティマイザに指示します。オプティマイザがこのような操作を実行しない場合は、このヒントを使用することをお勧めします。例:

```sql
SELECT /*+ LIMIT_TO_COP() */ * FROM t WHERE a = 1 AND b > 10 ORDER BY c LIMIT 1;
```

### READ_FROM_STORAGE(TIFLASH[t1_name [, tl_name ...]], TIKV[t2_name [, tl_name ...]]) {#read-from-storage-tiflash-t1-name-tl-name-tikv-t2-name-tl-name}

`READ_FROM_STORAGE(TIFLASH[t1_name [, tl_name ...]], TIKV[t2_name [, tl_name ...]])`ヒントは、オプティマイザに特定のstorageエンジンから特定のテーブルを読み取るように指示します。現在、このヒントは`TIKV`と`TIFLASH` 2 つのstorageエンジン パラメータをサポートしています。テーブルに別名がある場合は、その別名を`READ_FROM_STORAGE()`のパラメータとして使用します。テーブルに別名がない場合は、テーブルの元の名前をパラメータとして使用します。例:

```sql
select /*+ READ_FROM_STORAGE(TIFLASH[t1], TIKV[t2]) */ t1.a from t t1, t t2 where t1.a = t2.a;
```

### USE_INDEX_MERGE(t1_name, idx1_name [, idx2_name ...]) {#use-index-merge-t1-name-idx1-name-idx2-name}

`USE_INDEX_MERGE(t1_name, idx1_name [, idx2_name ...])`ヒントは、インデックス マージ方式を使用して特定のテーブルにアクセスするようにオプティマイザに指示します。インデックス マージには、交差型と結合型の 2 つのタイプがあります。詳細については、 [インデックスマージを使用したステートメントの説明](/explain-index-merge.md)参照してください。

インデックスのリストを明示的に指定すると、TiDB はリストからインデックスを選択してインデックス マージを構築します。インデックスのリストを指定しないと、TiDB は使用可能なすべてのインデックスからインデックスを選択してインデックス マージを構築します。

交差型インデックス マージの場合、指定されたインデックス リストはヒントの必須パラメータです。 和集合型インデックス マージの場合、指定されたインデックス リストはヒントのオプション パラメータです。 次の例を参照してください。

```sql
SELECT /*+ USE_INDEX_MERGE(t1, idx_a, idx_b, idx_c) */ * FROM t1 WHERE t1.a > 10 OR t1.b > 10;
```

同じテーブルに対して複数の`USE_INDEX_MERGE`ヒントが作成されると、オプティマイザはこれらのヒントによって指定されたインデックス セットの結合からインデックスを選択しようとします。

> **注記：**
>
> `USE_INDEX_MERGE`のパラメータは列名ではなくインデックス名を参照します。主キーのインデックス名は`primary`です。

### LEADING(t1_name [, tl_name ...]) {#leading-t1-name-tl-name}

ヒント`LEADING(t1_name [, tl_name ...])`は、実行プランを生成するときに、ヒントで指定されたテーブル名の順序に従って複数テーブルの結合の順序を決定するようにオプティマイザに通知します。例:

```sql
SELECT /*+ LEADING(t1, t2) */ * FROM t1, t2, t3 WHERE t1.id = t2.id and t2.id = t3.id;
```

複数テーブル結合を含む上記のクエリでは、結合の順序は`LEADING()`ヒントで指定されたテーブル名の順序によって決まります。オプティマイザーは最初に`t1`と`t2`を結合し、次にその結果を`t3`と結合します。このヒントは[`STRAIGHT_JOIN`](#straight_join)よりも一般的です。

`LEADING`ヒントは次の状況では有効になりません。

-   `LEADING`ヒントが複数指定されています。
-   `LEADING`ヒントで指定されたテーブル名が存在しません。
-   `LEADING`ヒントに重複したテーブル名が指定されています。
-   オプティマイザーは、ヒント`LEADING`で指定された順序に従って結合操作を実行できません。
-   `straight_join()`ヒントがすでに存在します。
-   クエリには、外部結合とデカルト積が含まれています。

上記の状況では、警告が生成されます。

```sql
-- Multiple `LEADING` hints are specified.
SELECT /*+ LEADING(t1, t2) LEADING(t3) */ * FROM t1, t2, t3 WHERE t1.id = t2.id and t2.id = t3.id;

-- To learn why the `LEADING` hint fails to take effect, execute `show warnings`.
SHOW WARNINGS;
```

```sql
+---------+------+-------------------------------------------------------------------------------------------------------------------+
| Level   | Code | Message                                                                                                           |
+---------+------+-------------------------------------------------------------------------------------------------------------------+
| Warning | 1815 | We can only use one leading hint at most, when multiple leading hints are used, all leading hints will be invalid |
+---------+------+-------------------------------------------------------------------------------------------------------------------+
```

> **注記：**
>
> クエリ ステートメントに外部結合が含まれている場合、ヒントでは結合順序を入れ替えることができるテーブルのみを指定できます。ヒントに結合順序を入れ替えることができないテーブルが含まれている場合、ヒントは無効になります。たとえば、 `SELECT * FROM t1 LEFT JOIN (t2 JOIN t3 JOIN t4) ON t1.a = t2.a;`で`t2` 、 `t3` 、 `t4`テーブルの結合順序を制御する場合、 `LEADING`ヒントに`t1`指定することはできません。

### マージ（） {#merge}

共通テーブル式 (CTE) を含むクエリで`MERGE()`ヒントを使用すると、サブクエリのマテリアライゼーションを無効にし、サブクエリのインラインを CTE に拡張できます。このヒントは、非再帰 CTE にのみ適用されます。シナリオによっては、 `MERGE()`使用すると、一時領域を割り当てるデフォルトの動作よりも実行効率が高くなります。たとえば、クエリ条件をプッシュダウンする場合や、CTE クエリをネストする場合などです。

```sql
-- Uses the hint to push down the predicate of the outer query.
WITH CTE AS (SELECT /*+ MERGE() */ * FROM tc WHERE tc.a < 60) SELECT * FROM CTE WHERE CTE.a < 18;

-- Uses the hint in a nested CTE query to expand a CTE inline into the outer query.
WITH CTE1 AS (SELECT * FROM t1), CTE2 AS (WITH CTE3 AS (SELECT /*+ MERGE() */ * FROM t2), CTE4 AS (SELECT * FROM t3) SELECT * FROM CTE3, CTE4) SELECT * FROM CTE1, CTE2;
```

> **注記：**
>
> `MERGE()`は単純な CTE クエリにのみ適用されます。次の状況には適用されません。
>
> -   [再帰CTE](https://docs.pingcap.com/tidb/stable/dev-guide-use-common-table-expression#recursive-cte)
> -   集計演算子、ウィンドウ関数、 `DISTINCT`など、展開できないインラインを含むサブクエリ。
>
> CTE 参照の数が多すぎると、クエリのパフォーマンスがデフォルトのマテリアライゼーション動作よりも低くなる可能性があります。

## 世界中で効果を発揮するヒント {#hints-that-take-effect-globally}

グローバルヒントは[ビュー](/views.md)で機能します。グローバルヒントとして指定すると、クエリで定義されたヒントがビュー内で有効になります。グローバルヒントを指定するには、まず`QB_NAME`ヒントを使用してクエリブロック名を定義し、次に`ViewName@QueryBlockName`の形式でターゲットヒントを追加します。

### ステップ1: <code>QB_NAME</code>ヒントを使用してビューのクエリブロック名を定義する {#step-1-define-the-query-block-name-of-the-view-using-the-code-qb-name-code-hint}

[`QB_NAME`ヒント](#qb_name)を使用して、ビューの各クエリ ブロックに新しい名前を定義します。ビューの`QB_NAME`ヒントの定義は[クエリブロック](#qb_name)と同じですが、構文は`QB_NAME(QB)`から`QB_NAME(QB, ViewName@QueryBlockName [.ViewName@QueryBlockName .ViewName@QueryBlockName ...])`に拡張されています。

> **注記：**
>
> `@QueryBlockName`と直後の`.ViewName@QueryBlockName`間には空白があります。そうでない場合、 `.ViewName@QueryBlockName`は`QueryBlockName`の一部として扱われます。たとえば、 `QB_NAME(v2_1, v2@SEL_1 .@SEL_1)`有効ですが、 `QB_NAME(v2_1, v2@SEL_1.@SEL_1)`正しく解析できません。

-   単一のビューとサブクエリのない単純なステートメントの場合、次の例では、ビュー`v`の最初のクエリ ブロック名を指定します。

    ```sql
    SELECT /* Comment: The name of the current query block is the default @SEL_1 */ * FROM v;
    ```

    ビュー`v`の場合、クエリステートメントから始まるリスト ( `ViewName@QueryBlockName [.ViewName@QueryBlockName .ViewName@QueryBlockName ...]` ) の最初のビュー名は`v@SEL_1`です。ビュー`v`の最初のクエリブロックは`QB_NAME(v_1, v@SEL_1 .@SEL_1)`として宣言するか、 `@SEL_1`を省略して単に`QB_NAME(v_1, v)`と記述できます。

    ```sql
    CREATE VIEW v AS SELECT /* Comment: The name of the current query block is the default @SEL_1 */ * FROM t;

    -- Specifies the global hint
    SELECT /*+ QB_NAME(v_1, v) USE_INDEX(t@v_1, idx) */ * FROM v;
    ```

-   ネストされたビューとサブクエリを含む複雑なステートメントの場合、次の例では、ビュー`v1`と`v2`の 2 つのクエリ ブロックのそれぞれの名前を指定します。

    ```sql
    SELECT /* Comment: The name of the current query block is the default @SEL_1 */ * FROM v2 JOIN (
        SELECT /* Comment: The name of the current query block is the default @SEL_2 */ * FROM v2) vv;
    ```

    最初のビュー`v2`の場合、最初のクエリ ステートメントから始まるリストの最初のビュー名は`v2@SEL_1`です。2 番目のビュー`v2`の場合、最初のビュー名は`v2@SEL_2`です。次の例では、最初のビュー`v2`のみを考慮します。

    ビュー`v2`の最初のクエリ ブロックは`QB_NAME(v2_1, v2@SEL_1 .@SEL_1)`として宣言でき、ビュー`v2`の 2 番目のクエリ ブロックは`QB_NAME(v2_2, v2@SEL_1 .@SEL_2)`として宣言できます。

    ```sql
    CREATE VIEW v2 AS
        SELECT * FROM t JOIN /* Comment: For view v2, the name of the current query block is the default @SEL_1. So, the current query block view list is v2@SEL_1 .@SEL_1 */
        (
            SELECT COUNT(*) FROM t1 JOIN v1 /* Comment: For view v2, the name of the current query block is the default @SEL_2. So, the current query block view list is v2@SEL_1 .@SEL_2 */
        ) tt;
    ```

    ビュー`v1`の場合、前のステートメントから始まるリストの最初のビュー名は`v2@SEL_1 .v1@SEL_2`です。ビュー`v1`の最初のクエリ ブロックは`QB_NAME(v1_1, v2@SEL_1 .v1@SEL_2 .@SEL_1)`として宣言でき、ビュー`v1`の 2 番目のクエリ ブロックは`QB_NAME(v1_2, v2@SEL_1 .v1@SEL_2 .@SEL_2)`として宣言できます。

    ```sql
    CREATE VIEW v1 AS SELECT * FROM t JOIN /* Comment: For view `v1`, the name of the current query block is the default @SEL_1. So, the current query block view list is v2@SEL_1 .@SEL_2 .v1@SEL_1 */
        (
            SELECT COUNT(*) FROM t1 JOIN t2 /* Comment: For view `v1`, the name of the current query block is the default @SEL_2. So, the current query block view list is v2@SEL_1 .@SEL_2 .v1@SEL_2 */
        ) tt;
    ```

> **注記：**
>
> -   ビューでグローバル ヒントを使用するには、ビュー内に対応する`QB_NAME`のヒントを定義する必要があります。そうしないと、グローバル ヒントは有効になりません。
>
> -   ヒントを使用してビュー内の複数のテーブル名を指定する場合、同じヒントに表示されるテーブル名が同じビューの同じクエリ ブロック内にあることを確認する必要があります。
>
> -   最も外側のクエリ ブロックのビューで`QB_NAME`ヒントを定義すると、次のようになります。
>
>     -   `QB_NAME`のビュー リストの最初の項目については、 `@SEL_`が明示的に宣言されていない場合、デフォルトは`QB_NAME`定義されているクエリ ブロックの位置と一致します。つまり、クエリ`SELECT /*+ QB_NAME(qb1, v2) */ * FROM v2 JOIN (SELECT /*+ QB_NAME(qb2, v2) */ * FROM v2) vv;` `SELECT /*+ QB_NAME(qb1, v2@SEL_1) */ * FROM v2 JOIN (SELECT /*+ QB_NAME(qb2, v2@SEL_2) */ * FROM v2) vv;`と同等です。
>     -   `QB_NAME`のビュー リストの最初の項目以外の項目については、 `@SEL_1`を省略できます。つまり、現在のビューの最初のクエリ ブロックで`@SEL_1`宣言されている場合は、 `@SEL_1`省略できます。それ以外の場合は、 `@SEL_`省略できません。上記の例の場合:
>
>         -   ビュー`v2`の最初のクエリ ブロックは`QB_NAME(v2_1, v2)`として宣言できます。
>         -   ビュー`v2`の 2 番目のクエリ ブロックは`QB_NAME(v2_2, v2.@SEL_2)`として宣言できます。
>         -   ビュー`v1`の最初のクエリ ブロックは`QB_NAME(v1_1, v2.v1@SEL_2)`として宣言できます。
>         -   ビュー`v1`の 2 番目のクエリ ブロックは`QB_NAME(v1_2, v2.v1@SEL_2 .@SEL_2)`として宣言できます。

### ステップ2: ターゲットヒントを追加する {#step-2-add-the-target-hints}

ビューのクエリ ブロックに`QB_NAME`ヒントを定義した後、ビュー内で有効にするために必要な[クエリブロックで有効になるヒント](#hints-that-take-effect-in-query-blocks) `ViewName@QueryBlockName`の形式で追加できます。例:

-   ビュー`v2`の最初のクエリ ブロックに`MERGE_JOIN()`ヒントを指定します。

    ```sql
    SELECT /*+ QB_NAME(v2_1, v2) merge_join(t@v2_1) */ * FROM v2;
    ```

-   ビュー`v2`の 2 番目のクエリ ブロックにヒント`MERGE_JOIN()`と`STREAM_AGG()`指定します。

    ```sql
    SELECT /*+ QB_NAME(v2_2, v2.@SEL_2) merge_join(t1@v2_2) stream_agg(@v2_2) */ * FROM v2;
    ```

-   ビュー`v1`の最初のクエリ ブロックに`HASH_JOIN()`ヒントを指定します。

    ```sql
    SELECT /*+ QB_NAME(v1_1, v2.v1@SEL_2) hash_join(t@v1_1) */ * FROM v2;
    ```

-   ビュー`v1`の 2 番目のクエリ ブロックにヒント`HASH_JOIN()`と`HASH_AGG()`指定します。

    ```sql
    SELECT /*+ QB_NAME(v1_2, v2.v1@SEL_2 .@SEL_2) hash_join(t1@v1_2) hash_agg(@v1_2) */ * FROM v2;
    ```

## クエリ全体に影響するヒント {#hints-that-take-effect-in-the-whole-query}

このカテゴリのヒントは、**最初の**`SELECT` 、 `UPDATE` 、または`DELETE`キーワードの後にのみ指定できます。これは、このクエリの実行時に指定されたシステム変数の値を変更することと同じです。ヒントの優先順位は、既存のシステム変数の優先順位よりも高くなります。

> **注記：**
>
> このカテゴリのヒントにはオプションの隠し変数`@QB_NAME`ありますが、変数を指定した場合でもヒントはクエリ全体に適用されます。

### インデックスマージなし() {#no-index-merge}

ヒント`NO_INDEX_MERGE()`は、オプティマイザのインデックス マージ機能を無効にします。

たとえば、次のクエリではインデックスのマージは使用されません。

```sql
select /*+ NO_INDEX_MERGE() */ * from t where t.a > 0 or t.b > 0;
```

このヒントに加えて、 `tidb_enable_index_merge`システム変数を設定することで、この機能を有効にするかどうかも制御できます。

> **注記：**
>
> -   `NO_INDEX_MERGE` `USE_INDEX_MERGE`よりも優先度が高くなります。両方のヒントが使用される場合、 `USE_INDEX_MERGE`効果がありません。
> -   サブクエリの場合、 `NO_INDEX_MERGE`サブクエリの最も外側のレベルに配置された場合にのみ有効になります。

### USE_TOJA(ブール値) {#use-toja-boolean-value}

`boolean_value`パラメータは`TRUE`または`FALSE`になります。 `USE_TOJA(TRUE)`ヒントにより、オプティマイザは`in`条件 (サブクエリを含む) を結合および集計操作に変換できます。比較すると、 `USE_TOJA(FALSE)`ヒントはこの機能を無効にします。

たとえば、次のクエリは`in (select t2.a from t2) subq`対応する結合および集計操作に変換します。

```sql
select /*+ USE_TOJA(TRUE) */ t1.a, t1.b from t1 where t1.a in (select t2.a from t2) subq;
```

このヒントに加えて、 `tidb_opt_insubq_to_join_and_agg`システム変数を設定することで、この機能を有効にするかどうかも制御できます。

### 最大実行時間(N) {#max-execution-time-n}

`MAX_EXECUTION_TIME(N)`ヒントは、サーバーがステートメントを終了する前にステートメントの実行が許可される時間に制限`N` (ミリ秒単位のタイムアウト値) を設定します。次のヒントでは、 `MAX_EXECUTION_TIME(1000)`タイムアウトが 1000 ミリ秒 (つまり 1 秒) であることを意味します。

```sql
select /*+ MAX_EXECUTION_TIME(1000) */ * from t1 inner join t2 where t1.id = t2.id;
```

このヒントに加えて、 `global.max_execution_time`システム変数はステートメントの実行時間を制限することもできます。

### メモリクォータ(N) {#memory-quota-n}

`MEMORY_QUOTA(N)`ヒントは、ステートメントが使用できるメモリ量に制限`N` (MB または GB 単位のしきい値) を設定します。ステートメントのメモリ使用量がこの制限を超えると、TiDB はステートメントの制限超過動作に基づいてログ メッセージを生成するか、ステートメントを終了します。

次のヒントでは、 `MEMORY_QUOTA(1024 MB)`メモリ使用量が 1024 MB に制限されていることを意味します。

```sql
select /*+ MEMORY_QUOTA(1024 MB) */ * from t;
```

このヒントに加えて、 [`tidb_mem_quota_query`](/system-variables.md#tidb_mem_quota_query)システム変数を使用してステートメントのメモリ使用量を制限することもできます。

### READ_CONSISTENT_REPLICA() {#read-consistent-replica}

ヒント`READ_CONSISTENT_REPLICA()`は、TiKV フォロワー ノードから一貫性のあるデータを読み取る機能を有効にします。例:

```sql
select /*+ READ_CONSISTENT_REPLICA() */ * from t;
```

このヒントに加えて、環境変数`tidb_replica_read` `'follower'`または`'leader'`に設定することで、この機能を有効にするかどうかも制御できます。

### IGNORE_PLAN_CACHE() {#ignore-plan-cache}

`IGNORE_PLAN_CACHE()`ヒントは、現在の`prepare`ステートメントを処理するときにプラン キャッシュを使用しないようにオプティマイザーに通知します。

このヒントは、 [プランキャッシュの準備](/sql-prepared-plan-cache.md)が有効な場合に、特定の種類のクエリのプラン キャッシュを一時的に無効にするために使用されます。

次の例では、 `prepare`ステートメントを実行するときにプラン キャッシュが強制的に無効になります。

```sql
prepare stmt from 'select  /*+ IGNORE_PLAN_CACHE() */ * from t where t.id = ?';
```

### SET_VAR(変数名=変数値) {#set-var-var-name-var-value}

`SET_VAR(VAR_NAME=VAR_VALUE)`ヒントを使用すると、ステートメントの実行中にシステム変数の値を一時的に変更できます。ステートメントの実行後、現在のセッションのシステム変数の値は自動的に元の値に復元されます。このヒントは、オプティマイザーとエグゼキューターに関連する一部のシステム変数を変更するために使用できます。このヒントを使用して変更できるシステム変数のリストについては、 [システム変数](/system-variables.md)を参照してください。

> **警告：**
>
> -   予期しない動作が発生する可能性があるため、明示的にサポートされていない変数を変更しないことを強くお勧めします。
> -   サブクエリに`SET_VAR`書き込まないでください。そうしないと、効果がない可能性があります。詳細については、 [`SET_VAR`サブクエリに記述すると効果がありません](#set_var-does-not-take-effect-when-written-in-subqueries)参照してください。

次に例を示します。

```sql
SELECT /*+ SET_VAR(MAX_EXECUTION_TIME=1234) */ @@MAX_EXECUTION_TIME;
SELECT @@MAX_EXECUTION_TIME;
```

上記の SQL ステートメントを実行すると、最初のクエリはデフォルト値`MAX_EXECUTION_TIME`ではなく、ヒントに設定された値`1234`を返します。2 番目のクエリは変数のデフォルト値を返します。

```sql
+----------------------+
| @@MAX_EXECUTION_TIME |
+----------------------+
|                 1234 |
+----------------------+
1 row in set (0.00 sec)
+----------------------+
| @@MAX_EXECUTION_TIME |
+----------------------+
|                    0 |
+----------------------+
1 row in set (0.00 sec)
```

### ストレート結合() {#straight-join}

`STRAIGHT_JOIN()`ヒントは、結合プランを生成するときに、 `FROM`句のテーブル名の順序でテーブルを結合するようにオプティマイザーに通知します。

```sql
SELECT /*+ STRAIGHT_JOIN() */ * FROM t t1, t t2 WHERE t1.a = t2.a;
```

> **注記：**
>
> -   `STRAIGHT_JOIN` `LEADING`よりも優先されます。両方のヒントが使用される場合、 `LEADING`効果がありません。
> -   `STRAIGHT_JOIN`ヒントよりも一般的な`LEADING`ヒントを使用することをお勧めします。

### NTH_PLAN(N) {#nth-plan-n}

ヒント`NTH_PLAN(N)`は、物理最適化中に見つかった`N`番目の物理プランを選択するようにオプティマイザに通知します。5 `N`正の整数である必要があります。

指定された`N`物理最適化の検索範囲を超える場合、TiDB は警告を返し、このヒントを無視する戦略に基づいて最適な物理プランを選択します。

このヒントは、カスケード プランナーが有効な場合には効果がありません。

次の例では、オプティマイザは物理的な最適化中に見つかった 3 番目の物理プランを選択するように強制されます。

```sql
SELECT /*+ NTH_PLAN(3) */ count(*) from t where a > 5;
```

> **注記：**
>
> `NTH_PLAN(N)`は主にテストに使用され、それ以降のバージョンとの互換性は保証されません。このヒントは**注意して**使用してください。

### RESOURCE_GROUP(リソースグループ名) {#resource-group-resource-group-name}

`RESOURCE_GROUP(resource_group_name)`は[リソース管理](/tidb-resource-control.md)に使用され、リソースを分離します。このヒントは、指定されたリソース グループを使用して現在のステートメントを一時的に実行します。指定されたリソース グループが存在しない場合、このヒントは無視されます。

例：

```sql
SELECT /*+ RESOURCE_GROUP(rg1) */ * FROM t limit 10;
```

> **注記：**
>
> v8.2.0 以降、TiDB はこのヒントの権限制御を導入しています。システム変数[`tidb_resource_control_strict_mode`](/system-variables.md#tidb_resource_control_strict_mode-new-in-v820)が`ON`に設定されている場合、このヒントを使用するには`SUPER`または`RESOURCE_GROUP_ADMIN`または`RESOURCE_GROUP_USER`権限が必要です。必要な権限がない場合、このヒントは無視され、TiDB は警告を返します。クエリの後に`SHOW WARNINGS;`実行すると詳細を表示できます。

## ヒントが効かない一般的な問題のトラブルシューティング {#troubleshoot-common-issues-that-hints-do-not-take-effect}

### MySQLコマンドラインクライアントがヒントを削除するため、ヒントは有効になりません。 {#hints-do-not-take-effect-because-your-mysql-command-line-client-strips-hints}

5.7.7 より前の MySQL コマンドライン クライアントは、デフォルトでオプティマイザ ヒントを削除します。これらの以前のバージョンでヒント構文を使用する場合は、クライアントの起動時に`--comments`オプションを追加します。例: `mysql -h 127.0.0.1 -P 4000 -uroot --comments` 。

### データベース名が指定されていないため、ヒントは有効になりません {#hints-do-not-take-effect-because-the-database-name-is-not-specified}

接続を作成するときにデータベース名を指定しないと、ヒントが有効にならない場合があります。例:

TiDB に接続するときは、 `-D`オプションなしで`mysql -h127.0.0.1 -P4000 -uroot`コマンドを使用し、次の SQL ステートメントを実行します。

```sql
SELECT /*+ use_index(t, a) */ a FROM test.t;
SHOW WARNINGS;
```

TiDB はテーブル`t`のデータベースを識別できないため、ヒント`use_index(t, a)`は有効になりません。

```sql
+---------+------+----------------------------------------------------------------------+
| Level   | Code | Message                                                              |
+---------+------+----------------------------------------------------------------------+
| Warning | 1815 | use_index(.t, a) is inapplicable, check whether the table(.t) exists |
+---------+------+----------------------------------------------------------------------+
1 row in set (0.00 sec)
```

### クロステーブルクエリでデータベース名が明示的に指定されていないため、ヒントは有効になりません。 {#hints-do-not-take-effect-because-the-database-name-is-not-explicitly-specified-in-cross-table-queries}

クロステーブルクエリを実行するときは、データベース名を明示的に指定する必要があります。そうしないと、ヒントが有効にならない可能性があります。例:

```sql
USE test1;
CREATE TABLE t1(a INT, KEY(a));
USE test2;
CREATE TABLE t2(a INT, KEY(a));
SELECT /*+ use_index(t1, a) */ * FROM test1.t1, t2;
SHOW WARNINGS;
```

上記のステートメントでは、テーブル`t1`が現在の`test2`データベースに存在しないため、 `use_index(t1, a)`ヒントは有効になりません。

```sql
+---------+------+----------------------------------------------------------------------------------+
| Level   | Code | Message                                                                          |
+---------+------+----------------------------------------------------------------------------------+
| Warning | 1815 | use_index(test2.t1, a) is inapplicable, check whether the table(test2.t1) exists |
+---------+------+----------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

この場合、 `use_index(t1, a)`ではなく`use_index(test1.t1, a)`を使用してデータベース名を明示的に指定する必要があります。

### ヒントが間違った場所に配置されているため、効果がありません {#hints-do-not-take-effect-because-they-are-placed-in-wrong-locations}

ヒントは、特定のキーワードの直後に配置されていない場合は有効になりません。例:

```sql
SELECT * /*+ use_index(t, a) */ FROM t;
SHOW WARNINGS;
```

警告は次のとおりです。

```sql
+---------+------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Level   | Code | Message                                                                                                                                                                                                                 |
+---------+------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Warning | 1064 | You have an error in your SQL syntax; check the manual that corresponds to your TiDB version for the right syntax to use [parser:8066]Optimizer hint can only be followed by certain keywords like SELECT, INSERT, etc. |
+---------+------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)
```

この場合、ヒントを`SELECT`キーワードの直後に配置する必要があります。詳細については、 [構文](#syntax)セクションを参照してください。

### <code>INL_JOIN</code>ヒントは有効になりません {#code-inl-join-code-hint-does-not-take-effect}

#### <code>INL_JOIN</code>ヒントは、テーブルを結合するための列に組み込み関数が使用されている場合は有効になりません。 {#code-inl-join-code-hint-does-not-take-effect-when-built-in-functions-are-used-on-columns-for-joining-tables}

場合によっては、テーブルを結合する列で組み込み関数を使用すると、オプティマイザーが`IndexJoin`プランを選択できず、 `INL_JOIN`ヒントも有効にならないことがあります。

たとえば、次のクエリでは、テーブルを結合する列`tname`で組み込み関数`substr`を使用します。

```sql
CREATE TABLE t1 (id varchar(10) primary key, tname varchar(10));
CREATE TABLE t2 (id varchar(10) primary key, tname varchar(10));
EXPLAIN SELECT /*+ INL_JOIN(t1, t2) */ * FROM t1, t2 WHERE t1.id=t2.id and SUBSTR(t1.tname,1,2)=SUBSTR(t2.tname,1,2);
```

実行計画は次のとおりです。

```sql
+------------------------------+----------+-----------+---------------+-----------------------------------------------------------------------+
| id                           | estRows  | task      | access object | operator info                                                         |
+------------------------------+----------+-----------+---------------+-----------------------------------------------------------------------+
| HashJoin_12                  | 12500.00 | root      |               | inner join, equal:[eq(test.t1.id, test.t2.id) eq(Column#5, Column#6)] |
| ├─Projection_17(Build)       | 10000.00 | root      |               | test.t2.id, test.t2.tname, substr(test.t2.tname, 1, 2)->Column#6      |
| │ └─TableReader_19           | 10000.00 | root      |               | data:TableFullScan_18                                                 |
| │   └─TableFullScan_18       | 10000.00 | cop[tikv] | table:t2      | keep order:false, stats:pseudo                                        |
| └─Projection_14(Probe)       | 10000.00 | root      |               | test.t1.id, test.t1.tname, substr(test.t1.tname, 1, 2)->Column#5      |
|   └─TableReader_16           | 10000.00 | root      |               | data:TableFullScan_15                                                 |
|     └─TableFullScan_15       | 10000.00 | cop[tikv] | table:t1      | keep order:false, stats:pseudo                                        |
+------------------------------+----------+-----------+---------------+-----------------------------------------------------------------------+
7 rows in set, 1 warning (0.01 sec)
```

```sql
SHOW WARNINGS;
```

    +---------+------+------------------------------------------------------------------------------------+
    | Level   | Code | Message                                                                            |
    +---------+------+------------------------------------------------------------------------------------+
    | Warning | 1815 | Optimizer Hint /*+ INL_JOIN(t1, t2) */ or /*+ TIDB_INLJ(t1, t2) */ is inapplicable |
    +---------+------+------------------------------------------------------------------------------------+
    1 row in set (0.00 sec)

前の例からわかるように、 `INL_JOIN`ヒントは有効になりません。これは、 `IndexJoin`のプローブ側として`Projection`または`Selection`演算子を使用できないというオプティマイザーの制限によるものです。

TiDB v8.0.0 以降では、 [`tidb_enable_inl_join_inner_multi_pattern`](/system-variables.md#tidb_enable_inl_join_inner_multi_pattern-new-in-v700)を`ON`に設定することでこの問題を回避できます。

```sql
SET @@tidb_enable_inl_join_inner_multi_pattern=ON;
Query OK, 0 rows affected (0.00 sec)

EXPLAIN SELECT /*+ INL_JOIN(t1, t2) */ * FROM t1, t2 WHERE t1.id=t2.id AND SUBSTR(t1.tname,1,2)=SUBSTR(t2.tname,1,2);
+------------------------------+--------------+-----------+---------------+--------------------------------------------------------------------------------------------------------------------------------------------+
| id                           | estRows      | task      | access object | operator info                                                                                                                              |
+------------------------------+--------------+-----------+---------------+--------------------------------------------------------------------------------------------------------------------------------------------+
| IndexJoin_18                 | 12500.00     | root      |               | inner join, inner:Projection_14, outer key:test.t1.id, inner key:test.t2.id, equal cond:eq(Column#5, Column#6), eq(test.t1.id, test.t2.id) |
| ├─Projection_32(Build)       | 10000.00     | root      |               | test.t1.id, test.t1.tname, substr(test.t1.tname, 1, 2)->Column#5                                                                           |
| │ └─TableReader_34           | 10000.00     | root      |               | data:TableFullScan_33                                                                                                                      |
| │   └─TableFullScan_33       | 10000.00     | cop[tikv] | table:t1      | keep order:false, stats:pseudo                                                                                                             |
| └─Projection_14(Probe)       | 100000000.00 | root      |               | test.t2.id, test.t2.tname, substr(test.t2.tname, 1, 2)->Column#6                                                                           |
|   └─TableReader_13           | 10000.00     | root      |               | data:TableRangeScan_12                                                                                                                     |
|     └─TableRangeScan_12      | 10000.00     | cop[tikv] | table:t2      | range: decided by [eq(test.t2.id, test.t1.id)], keep order:false, stats:pseudo                                                             |
+------------------------------+--------------+-----------+---------------+--------------------------------------------------------------------------------------------------------------------------------------------+
7 rows in set (0.00 sec)
```

#### <code>INL_JOIN</code> 、 <code>INL_HASH_JOIN</code> 、 <code>INL_MERGE_JOIN</code>ヒントは照合順序の非互換性のため有効になりません。 {#code-inl-join-code-code-inl-hash-join-code-and-code-inl-merge-join-code-hints-do-not-take-effect-due-to-collation-incompatibility}

2 つのテーブル間で結合キーの照合順序に互換性がない場合、 `IndexJoin`演算子を使用してクエリを実行することはできません。この場合、 [`INL_JOIN`](#inl_joint1_name--tl_name-) 、 [`INL_HASH_JOIN`](#inl_hash_join) 、および[`INL_MERGE_JOIN`](#inl_merge_join)ヒントは有効になりません。例:

```sql
CREATE TABLE t1 (k varchar(8), key(k)) COLLATE=utf8mb4_general_ci;
CREATE TABLE t2 (k varchar(8), key(k)) COLLATE=utf8mb4_bin;
EXPLAIN SELECT /*+ tidb_inlj(t1) */ * FROM t1, t2 WHERE t1.k=t2.k;
```

実行計画は次のとおりです。

```sql
+-----------------------------+----------+-----------+----------------------+----------------------------------------------+
| id                          | estRows  | task      | access object        | operator info                                |
+-----------------------------+----------+-----------+----------------------+----------------------------------------------+
| HashJoin_19                 | 12487.50 | root      |                      | inner join, equal:[eq(test.t1.k, test.t2.k)] |
| ├─IndexReader_24(Build)     | 9990.00  | root      |                      | index:IndexFullScan_23                       |
| │ └─IndexFullScan_23        | 9990.00  | cop[tikv] | table:t2, index:k(k) | keep order:false, stats:pseudo               |
| └─IndexReader_22(Probe)     | 9990.00  | root      |                      | index:IndexFullScan_21                       |
|   └─IndexFullScan_21        | 9990.00  | cop[tikv] | table:t1, index:k(k) | keep order:false, stats:pseudo               |
+-----------------------------+----------+-----------+----------------------+----------------------------------------------+
5 rows in set, 1 warning (0.00 sec)
```

前述のステートメントでは、照合順序`t1.k`と`t2.k`互換性がないため (それぞれ`utf8mb4_general_ci`と`utf8mb4_bin` )、ヒント`INL_JOIN`または`TIDB_INLJ`有効になりません。

```sql
SHOW WARNINGS;
+---------+------+----------------------------------------------------------------------------+
| Level   | Code | Message                                                                    |
+---------+------+----------------------------------------------------------------------------+
| Warning | 1815 | Optimizer Hint /*+ INL_JOIN(t1) */ or /*+ TIDB_INLJ(t1) */ is inapplicable |
+---------+------+----------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

#### <code>INL_JOIN</code>ヒントは結合順序により有効になりません {#code-inl-join-code-hint-does-not-take-effect-due-to-join-order}

[`INL_JOIN(t1, t2)`](#inl_joint1_name--tl_name-)または`TIDB_INLJ(t1, t2)`ヒントは、 `IndexJoin`演算子を使用して直接結合するのではなく、 `t1`と`t2` `IndexJoin`演算子の内部テーブルとして動作させて他のテーブルと結合するように意味的に指示します。例:

```sql
EXPLAIN SELECT /*+ inl_join(t1, t3) */ * FROM t1, t2, t3 WHERE t1.id = t2.id AND t2.id = t3.id AND t1.id = t3.id;
+---------------------------------+----------+-----------+---------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| id                              | estRows  | task      | access object | operator info                                                                                                                                                           |
+---------------------------------+----------+-----------+---------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| IndexJoin_16                    | 15625.00 | root      |               | inner join, inner:TableReader_13, outer key:test.t2.id, test.t1.id, inner key:test.t3.id, test.t3.id, equal cond:eq(test.t1.id, test.t3.id), eq(test.t2.id, test.t3.id) |
| ├─IndexJoin_34(Build)           | 12500.00 | root      |               | inner join, inner:TableReader_31, outer key:test.t2.id, inner key:test.t1.id, equal cond:eq(test.t2.id, test.t1.id)                                                     |
| │ ├─TableReader_40(Build)       | 10000.00 | root      |               | data:TableFullScan_39                                                                                                                                                   |
| │ │ └─TableFullScan_39          | 10000.00 | cop[tikv] | table:t2      | keep order:false, stats:pseudo                                                                                                                                          |
| │ └─TableReader_31(Probe)       | 10000.00 | root      |               | data:TableRangeScan_30                                                                                                                                                  |
| │   └─TableRangeScan_30         | 10000.00 | cop[tikv] | table:t1      | range: decided by [test.t2.id], keep order:false, stats:pseudo                                                                                                          |
| └─TableReader_13(Probe)         | 12500.00 | root      |               | data:TableRangeScan_12                                                                                                                                                  |
|   └─TableRangeScan_12           | 12500.00 | cop[tikv] | table:t3      | range: decided by [test.t2.id test.t1.id], keep order:false, stats:pseudo                                                                                               |
+---------------------------------+----------+-----------+---------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

前の例では、 `t1`と`t3` `IndexJoin`によって直接結合されていません。

`t1`と`t3`間で直接`IndexJoin`実行するには、まず[`LEADING(t1, t3)`ヒント](#leadingt1_name--tl_name-)使用して`t1`と`t3`の結合順序を指定し、次に`INL_JOIN`ヒントを使用して結合アルゴリズムを指定します。例:

```sql
EXPLAIN SELECT /*+ leading(t1, t3), inl_join(t3) */ * FROM t1, t2, t3 WHERE t1.id = t2.id AND t2.id = t3.id AND t1.id = t3.id;
+---------------------------------+----------+-----------+---------------+---------------------------------------------------------------------------------------------------------------------+
| id                              | estRows  | task      | access object | operator info                                                                                                       |
+---------------------------------+----------+-----------+---------------+---------------------------------------------------------------------------------------------------------------------+
| Projection_12                   | 15625.00 | root      |               | test.t1.id, test.t1.name, test.t2.id, test.t2.name, test.t3.id, test.t3.name                                        |
| └─HashJoin_21                   | 15625.00 | root      |               | inner join, equal:[eq(test.t1.id, test.t2.id) eq(test.t3.id, test.t2.id)]                                           |
|   ├─TableReader_36(Build)       | 10000.00 | root      |               | data:TableFullScan_35                                                                                               |
|   │ └─TableFullScan_35          | 10000.00 | cop[tikv] | table:t2      | keep order:false, stats:pseudo                                                                                      |
|   └─IndexJoin_28(Probe)         | 12500.00 | root      |               | inner join, inner:TableReader_25, outer key:test.t1.id, inner key:test.t3.id, equal cond:eq(test.t1.id, test.t3.id) |
|     ├─TableReader_34(Build)     | 10000.00 | root      |               | data:TableFullScan_33                                                                                               |
|     │ └─TableFullScan_33        | 10000.00 | cop[tikv] | table:t1      | keep order:false, stats:pseudo                                                                                      |
|     └─TableReader_25(Probe)     | 10000.00 | root      |               | data:TableRangeScan_24                                                                                              |
|       └─TableRangeScan_24       | 10000.00 | cop[tikv] | table:t3      | range: decided by [test.t1.id], keep order:false, stats:pseudo                                                      |
+---------------------------------+----------+-----------+---------------+---------------------------------------------------------------------------------------------------------------------+
9 rows in set (0.01 sec)
```

### ヒントを使用すると、「 <code>Can&#39;t find a proper physical plan for this query</code> 」というエラーが発生します。 {#using-hints-causes-the-code-can-t-find-a-proper-physical-plan-for-this-query-code-error}

`Can't find a proper physical plan for this query`エラーは次のシナリオで発生する可能性があります。

-   クエリ自体は、インデックスを順番に読み取る必要はありません。つまり、このクエリでは、ヒントを使用せずにインデックスを順番に読み取るプランをオプティマイザーが生成することはありません。この場合、 `ORDER_INDEX`ヒントが指定されていると、このエラーが発生します。この問題を解決するには、対応する`ORDER_INDEX`ヒントを削除します。
-   クエリは、 `NO_JOIN`の関連するヒントを使用して、可能なすべての結合方法を除外します。

```sql
CREATE TABLE t1 (a INT);
CREATE TABLE t2 (a INT);
EXPLAIN SELECT /*+ NO_HASH_JOIN(t1), NO_MERGE_JOIN(t1) */ * FROM t1, t2 WHERE t1.a=t2.a;
ERROR 1815 (HY000): Internal : Can't find a proper physical plan for this query
```

-   システム変数[`tidb_opt_enable_hash_join`](/system-variables.md#tidb_opt_enable_hash_join-new-in-v656-v712-and-v740)は`OFF`に設定され、他のすべての結合タイプも除外されます。

```sql
CREATE TABLE t1 (a INT);
CREATE TABLE t2 (a INT);
set tidb_opt_enable_hash_join=off;
EXPLAIN SELECT /*+ NO_MERGE_JOIN(t1) */ * FROM t1, t2 WHERE t1.a=t2.a;
ERROR 1815 (HY000): Internal : Can't find a proper physical plan for this query
```

### <code>SET_VAR</code>サブクエリに記述すると効果がありません {#code-set-var-code-does-not-take-effect-when-written-in-subqueries}

`SET_VAR` 、現在のステートメントのシステム変数の値を変更するために使用されます。サブクエリには記述しないでください。サブクエリに記述すると、サブクエリの特別な処理により`SET_VAR`有効にならない場合があります。

以下の例ではサブクエリに`SET_VAR`が書き込まれているため、効果がありません。

```sql
mysql> SELECT @@MAX_EXECUTION_TIME, a FROM (SELECT /*+ SET_VAR(MAX_EXECUTION_TIME=123) */ 1 as a) t;
+----------------------+---+
| @@MAX_EXECUTION_TIME | a |
+----------------------+---+
|                    0 | 1 |
+----------------------+---+
1 row in set (0.00 sec)
```

以下の例では、サブクエリに`SET_VAR`が記述されていないため、有効になります。

```sql
mysql> SELECT /*+ SET_VAR(MAX_EXECUTION_TIME=123) */ @@MAX_EXECUTION_TIME, a FROM (SELECT 1 as a) t;
+----------------------+---+
| @@MAX_EXECUTION_TIME | a |
+----------------------+---+
|                  123 | 1 |
+----------------------+---+
1 row in set (0.00 sec)
```
