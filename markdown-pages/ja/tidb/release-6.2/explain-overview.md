---
title: TiDB Query Execution Plan Overview
summary: Learn about the execution plan information returned by the `EXPLAIN` statement in TiDB.
---

# TiDB クエリ実行計画の概要 {#tidb-query-execution-plan-overview}

> **ノート：**
>
> MySQL クライアントを使用して TiDB に接続する場合、出力結果を改行なしでより明確に読み取るには、 `pager less -S`コマンドを使用できます。次に、 `EXPLAIN`の結果が出力されたら、キーボードの右矢印<kbd>→</kbd>ボタンを押して、出力を水平方向にスクロールできます。

SQL は宣言型言語です。実際にそれらの結果を取得する**方法論ではなく、**クエリの結果がどのように表示されるかを説明します。 TiDB は、テーブルを結合する順序や潜在的なインデックスを使用できるかどうかなど、クエリを実行できる可能性のあるすべての方法を考慮します。*クエリ実行計画を検討する*プロセスは、SQL 最適化と呼ばれます。

`EXPLAIN`ステートメントは、特定のステートメントに対して選択された実行計画を示します。つまり、クエリを実行するための数百または数千の方法を検討した結果、TiDB は、この*プラン*が最小限のリソースを消費し、最短時間で実行されると考えています。


```sql
CREATE TABLE t (id INT NOT NULL PRIMARY KEY auto_increment, a INT NOT NULL, pad1 VARCHAR(255), INDEX(a));
INSERT INTO t VALUES (1, 1, 'aaa'),(2,2, 'bbb');
EXPLAIN SELECT * FROM t WHERE a = 1;
```

```sql
Query OK, 0 rows affected (0.96 sec)

Query OK, 2 rows affected (0.02 sec)
Records: 2  Duplicates: 0  Warnings: 0

+-------------------------------+---------+-----------+---------------------+---------------------------------------------+
| id                            | estRows | task      | access object       | operator info                               |
+-------------------------------+---------+-----------+---------------------+---------------------------------------------+
| IndexLookUp_10                | 10.00   | root      |                     |                                             |
| ├─IndexRangeScan_8(Build)     | 10.00   | cop[tikv] | table:t, index:a(a) | range:[1,1], keep order:false, stats:pseudo |
| └─TableRowIDScan_9(Probe)     | 10.00   | cop[tikv] | table:t             | keep order:false, stats:pseudo              |
+-------------------------------+---------+-----------+---------------------+---------------------------------------------+
3 rows in set (0.00 sec)
```

`EXPLAIN`は実際のクエリを実行しません。 [`EXPLAIN ANALYZE`](/sql-statements/sql-statement-explain-analyze.md)を使用してクエリを実行し、 `EXPLAIN`の情報を表示できます。これは、選択した実行計画が最適ではない場合の診断に役立ちます。 `EXPLAIN`のその他の使用例については、次のドキュメントを参照してください。

-   [インデックス](/explain-indexes.md)
-   [テーブル結合](/explain-joins.md)
-   [サブクエリ](/explain-subqueries.md)
-   [集計](/explain-aggregation.md)
-   [ビュー](/explain-views.md)
-   [パーティション](/explain-partitions.md)

## EXPLAIN の出力を理解する {#understand-explain-output}

上記の`EXPLAIN`ステートメントの出力を次に示します。

-   `id`は、SQL ステートメントの実行に必要なオペレーターまたはサブタスクの名前を示します。詳細については、 [オペレーター概要](#operator-overview)を参照してください。
-   `estRows`は、TiDB が処理する予定の行数の見積もりを示します。この数は、アクセス方法が主キーまたは一意のキーに基づいている場合など、辞書情報に基づいている場合や、CMSketch やヒストグラムなどの統計に基づいている場合があります。
-   `task`は、オペレーターが作業を行っている場所を示します。詳細については、 [タスクの概要](#task-overview)を参照してください。
-   `access object`は、アクセスされているテーブル、パーティション、およびインデックスを示します。上記の場合のように、インデックスの列`a`が使用された場合のように、インデックスの部分も表示されます。これは、複合インデックスがある場合に役立ちます。
-   `operator info`は、アクセスに関する追加の詳細を示します。詳細については、 [オペレーター情報概要](#operator-info-overview)を参照してください。

### オペレーター概要 {#operator-overview}

演算子は、クエリ結果を返す際に実行される特定のステップです。 (ディスクまたは TiKV ブロック キャッシュの) テーブル スキャンを実行するオペレーターは、次のとおりです。

-   **TableFullScan** : テーブル全体のスキャン
-   **TableRangeScan** : 指定された範囲でのテーブル スキャン
-   **TableRowIDScan** : RowID に基づいてテーブル データをスキャンします。通常、インデックス読み取り操作に続いて、一致するデータ行を取得します。
-   **IndexFullScan** : 「フル テーブル スキャン」に似ていますが、テーブル データではなくインデックスがスキャンされる点が異なります。
-   **IndexRangeScan** : 指定された範囲のインデックス スキャン。

TiDB は、TiKV/TiFlash からスキャンされたデータまたは計算結果を集約します。データ集計演算子は、次のカテゴリに分類できます。

-   **TableReader** : TiKV の`TableFullScan`や`TableRangeScan`などの基になる演算子によって取得されたデータを集計します。
-   **IndexReader** : TiKV の`IndexFullScan`や`IndexRangeScan`などの基になる演算子によって取得されたデータを集計します。
-   **IndexLookUp** : まず、 `Build`側でスキャンされた RowID (TiKV 内) を集計します。次に、 `Probe`側で、これらの RowID に基づいて TiKV からデータを正確に読み取ります。 `Build`側には、 `IndexFullScan`や`IndexRangeScan`などの演算子があります。 `Probe`側には`TableRowIDScan`オペレーターがいます。
-   **IndexMerge** : `IndexLookUp`に似ています。 `IndexMerge`は`IndexLookupReader`の拡張と見なすことができます。 `IndexMerge`では、同時に複数のインデックスを読み取ることができます。多くの`Build`と 1 つの`Probe`があります。 `IndexMerge`の実行プロセスは`IndexLookUp`と同じです。

構造はツリーとして表示されますが、クエリを実行するために、親ノードの前に子ノードを完了する必要はありません。 TiDB はクエリ内並列処理をサポートしているため、実行を記述するより正確な方法は、子ノードが親ノード*に流れ込むこと*です。親、子、および兄弟の演算子は、クエリの一部を並行して実行している<em>可能</em>性があります。

前の例では、 `├─IndexRangeScan_8(Build)`演算子は、 `a(a)`インデックスに一致する行の内部`RowID`を見つけます。 `└─TableRowIDScan_9(Probe)`演算子は、テーブルからこれらの行を取得します。

#### 範囲クエリ {#range-query}

`WHERE` / `HAVING` / `ON`の条件では、TiDB オプティマイザーは主キー クエリまたはインデックス キー クエリによって返された結果を分析します。たとえば、これらの条件には、 `>` 、 `<` 、 `=` 、 `>=` 、 `<=`などの数値型および日付型の比較演算子と、 `LIKE`などの文字型の比較演算子が含まれる場合があります。

> **ノート：**
>
> -   インデックスを使用するには、条件が*sargable*である必要があります。たとえば、条件`YEAR(date_column) < 1992`ではインデックスを使用できませんが、 `date_column < '1992-01-01`では使用できます。
> -   同じタイプのデータと[文字セットと照合順序](/character-set-and-collation.md)を比較することをお勧めします。タイプが混在していると、追加の`cast`の操作が必要になるか、インデックスが使用できなくなる場合があります。
> -   `AND` (交差) と`OR` (結合) を使用して、1 つの列の範囲クエリ条件を結合することもできます。多次元複合インデックスの場合、複数の列で条件を使用できます。たとえば、複合インデックス`(a, b, c)`に関しては、次のようになります。
>     -   `a`が同等のクエリである場合、引き続き`b`のクエリ範囲を把握します。 `b`も同等のクエリである場合は、引き続き`c`のクエリ範囲を把握します。
>     -   それ以外の場合、 `a`が同等でないクエリの場合、 `a`の範囲しか把握できません。

### タスクの概要 {#task-overview}

現在、TiDB の計算タスクは、cop タスクと root タスクの 2 つのカテゴリに分けることができます。 `cop[tikv]`タスクは、オペレーターが TiKV コプロセッサー内で実行されることを示します。 `root`タスクは、TiDB 内で完了することを示します。

SQL 最適化の目標の 1 つは、計算を可能な限り TiKV にプッシュすることです。 TiKV のコプロセッサーは、組み込み SQL関数(集約関数とスカラー関数を含む)、SQL `LIMIT`操作、インデックス スキャン、およびテーブル スキャンのほとんどをサポートします。ただし、 `Join`の操作はすべて、TiDB のルート タスクとしてのみ実行できます。

### オペレーター情報概要 {#operator-info-overview}

`operator info`は、どの条件をプッシュダウンできたかなどの有用な情報を表示できます。

-   `range: [1,1]`は、クエリの where 句の述語 ( `a = 1` ) が TiKV に直接プッシュされたことを示します (タスクは`cop[tikv]`です)。
-   `keep order:false`は、このクエリのセマンティクスでは、TiKV が結果を順番に返す必要がなかったことを示します。順序 ( `SELECT * FROM t WHERE a = 1 ORDER BY id`など) を要求するようにクエリを変更する場合、この条件は`keep order:true`になります。
-   `stats:pseudo`は、 `estRows`で示された見積もりが正確でない可能性があることを示します。 TiDB は、バックグラウンド操作の一部として定期的に統計を更新します。 `ANALYZE TABLE t`を実行して、手動で更新することもできます。

`EXPLAIN`ステートメントが実行された後、異なる演算子は異なる情報を出力します。オプティマイザのヒントを使用してオプティマイザの動作を制御し、それによって物理演算子の選択を制御できます。たとえば、 `/*+ HASH_JOIN(t1, t2) */`は、オプティマイザーが`Hash Join`アルゴリズムを使用することを意味します。詳細については、 [オプティマイザーのヒント](/optimizer-hints.md)を参照してください。
