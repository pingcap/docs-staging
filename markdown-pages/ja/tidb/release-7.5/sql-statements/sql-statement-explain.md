---
title: EXPLAIN | TiDB SQL Statement Reference
summary: An overview of the usage of EXPLAIN for the TiDB database.
---

# <code>EXPLAIN</code> {#code-explain-code}

`EXPLAIN`文は、クエリを実行せずにクエリの実行プランを表示します。これは、クエリを実行する`EXPLAIN ANALYZE`文を補完します。5 `EXPLAIN`出力が期待される結果と一致しない場合は、クエリ内の各テーブルで`ANALYZE TABLE`を実行して、テーブル統計が最新であることを確認することを検討してください。

ステートメント`DESC`と`DESCRIBE`このステートメントのエイリアスです。 `EXPLAIN <tableName>`の代替使用法は[`SHOW [FULL] COLUMNS FROM`](/sql-statements/sql-statement-show-columns-from.md)に記載されています。

TiDB は`EXPLAIN [options] FOR CONNECTION connection_id`文をサポートしています。ただし、この文は MySQL の`EXPLAIN FOR`文とは異なります。詳細については[`EXPLAIN FOR CONNECTION`](#explain-for-connection)を参照してください。

## 概要 {#synopsis}

```ebnf+diagram
ExplainSym ::=
    'EXPLAIN'
|   'DESCRIBE'
|   'DESC'

ExplainStmt ::=
    ExplainSym ( TableName ColumnName? | 'ANALYZE'? ExplainableStmt | 'FOR' 'CONNECTION' NUM | 'FORMAT' '=' ( stringLit | ExplainFormatType ) ( 'FOR' 'CONNECTION' NUM | ExplainableStmt ) )

ExplainableStmt ::=
    SelectStmt
|   DeleteFromStmt
|   UpdateStmt
|   InsertIntoStmt
|   ReplaceIntoStmt
|   UnionStmt
```

## <code>EXPLAIN</code>出力フォーマット {#code-explain-code-output-format}

> **注記：**
>
> MySQL クライアントを使用して TiDB に接続する場合、出力結果を行の折り返しなしでより明確に読み取るには、 `pager less -S`コマンドを使用します。次に、 `EXPLAIN`結果が出力された後、キーボードの右矢印<kbd>→</kbd>ボタンを押して、出力を水平にスクロールします。

> **注記：**
>
> 返される実行プランでは、 `IndexJoin`および`Apply`演算子のすべてのプローブ側子ノードについて、 `estRows`の意味は v6.4.0 以降では v6.4.0 より前と異なります。詳細は[TiDB クエリ実行プランの概要](/explain-overview.md#understand-explain-output)を参照してください。

現在、TiDB の`EXPLAIN` `id` 、 `estRows` 、 `task` 、 `access object` 、 `operator info` 5 つの列を出力します。実行プラン内の各演算子はこれらの属性によって記述され、 `EXPLAIN`出力の各行は演算子を記述します。各属性の説明は次のとおりです。

| 属性名        | 説明                                                                                                                                                                                                                                                                                                                 |
| :--------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id         | 演算子 ID は、実行プラン全体における演算子の一意の識別子です。TiDB 2.1 では、ID は演算子のツリー構造を表示するようにフォーマットされます。データは子ノードから親ノードに流れます。演算子ごとに親ノードは 1 つだけです。                                                                                                                                                                                              |
| 行数         | 演算子が出力すると予想される行数。この数は、統計と演算子のロジックに従って推定されます。1 は、TiDB 4.0 の以前のバージョンでは`estRows` `count`呼ばれていました。                                                                                                                                                                                                                     |
| タスク        | オペレーターが属するタスクの種類。現在、実行プランは、tidb-server で実行される**ルート**タスクと、 TiKV またはTiFlashで並列実行される**cop**タスクの 2 つのタスクに分かれています。タスク レベルでの実行プランのトポロジーは、ルート タスクの後に多数の cop タスクが続くというものです。ルート タスクは cop タスクの出力を入力として使用します。 cop タスクとは、TiDB が TiKV またはTiFlashにプッシュダウンするタスクを指します。各 cop タスクは、TiKV クラスターまたはTiFlashクラスターに分散され、複数のプロセスによって実行されます。 |
| アクセスオブジェクト | オペレータがアクセスするデータ項目情報。情報には`table` 、 `partition` 、および`index` (ある場合) が含まれます。データに直接アクセスするオペレータのみがこのような情報を持ちます。                                                                                                                                                                                                          |
| オペレーター情報   | 演算子に関するその他の情報。演算子ごとに`operator info`異なります。次の例を参照してください。                                                                                                                                                                                                                                                             |

## 例 {#examples}

```sql
EXPLAIN SELECT 1;
```

```sql
+-------------------+---------+------+---------------+---------------+
| id                | estRows | task | access object | operator info |
+-------------------+---------+------+---------------+---------------+
| Projection_3      | 1.00    | root |               | 1->Column#1   |
| └─TableDual_4     | 1.00    | root |               | rows:1        |
+-------------------+---------+------+---------------+---------------+
2 rows in set (0.00 sec)
```

```sql
CREATE TABLE t1 (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, c1 INT NOT NULL);
```

```sql
Query OK, 0 rows affected (0.10 sec)
```

```sql
INSERT INTO t1 (c1) VALUES (1), (2), (3);
```

```sql
Query OK, 3 rows affected (0.02 sec)
Records: 3  Duplicates: 0  Warnings: 0
```

```sql
EXPLAIN SELECT * FROM t1 WHERE id = 1;
```

```sql
+-------------+---------+------+---------------+---------------+
| id          | estRows | task | access object | operator info |
+-------------+---------+------+---------------+---------------+
| Point_Get_1 | 1.00    | root | table:t1      | handle:1      |
+-------------+---------+------+---------------+---------------+
1 row in set (0.00 sec)
```

```sql
DESC SELECT * FROM t1 WHERE id = 1;
```

```sql
+-------------+---------+------+---------------+---------------+
| id          | estRows | task | access object | operator info |
+-------------+---------+------+---------------+---------------+
| Point_Get_1 | 1.00    | root | table:t1      | handle:1      |
+-------------+---------+------+---------------+---------------+
1 row in set (0.00 sec)
```

```sql
DESCRIBE SELECT * FROM t1 WHERE id = 1;
```

```sql
+-------------+---------+------+---------------+---------------+
| id          | estRows | task | access object | operator info |
+-------------+---------+------+---------------+---------------+
| Point_Get_1 | 1.00    | root | table:t1      | handle:1      |
+-------------+---------+------+---------------+---------------+
1 row in set (0.00 sec)
```

```sql
EXPLAIN INSERT INTO t1 (c1) VALUES (4);
```

```sql
+----------+---------+------+---------------+---------------+
| id       | estRows | task | access object | operator info |
+----------+---------+------+---------------+---------------+
| Insert_1 | N/A     | root |               | N/A           |
+----------+---------+------+---------------+---------------+
1 row in set (0.00 sec)
```

```sql
EXPLAIN UPDATE t1 SET c1=5 WHERE c1=3;
```

```sql
+---------------------------+---------+-----------+---------------+--------------------------------+
| id                        | estRows | task      | access object | operator info                  |
+---------------------------+---------+-----------+---------------+--------------------------------+
| Update_4                  | N/A     | root      |               | N/A                            |
| └─TableReader_8           | 0.00    | root      |               | data:Selection_7               |
|   └─Selection_7           | 0.00    | cop[tikv] |               | eq(test.t1.c1, 3)              |
|     └─TableFullScan_6     | 3.00    | cop[tikv] | table:t1      | keep order:false, stats:pseudo |
+---------------------------+---------+-----------+---------------+--------------------------------+
4 rows in set (0.00 sec)
```

```sql
EXPLAIN DELETE FROM t1 WHERE c1=3;
```

```sql
+---------------------------+---------+-----------+---------------+--------------------------------+
| id                        | estRows | task      | access object | operator info                  |
+---------------------------+---------+-----------+---------------+--------------------------------+
| Delete_4                  | N/A     | root      |               | N/A                            |
| └─TableReader_8           | 0.00    | root      |               | data:Selection_7               |
|   └─Selection_7           | 0.00    | cop[tikv] |               | eq(test.t1.c1, 3)              |
|     └─TableFullScan_6     | 3.00    | cop[tikv] | table:t1      | keep order:false, stats:pseudo |
+---------------------------+---------+-----------+---------------+--------------------------------+
4 rows in set (0.01 sec)
```

`EXPLAIN`出力の形式を指定するには、 `FORMAT = xxx`構文を使用できます。現在、TiDB は次の形式をサポートしています。

| フォーマット       | 説明                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 指定されていない     | 形式が指定されていない場合は、デフォルトの形式`EXPLAIN` `row`使用されます。                                                                                        |
| `brief`      | `EXPLAIN`ステートメントの出力の演算子 ID は、 `FORMAT`指定されていない場合の演算子 ID と比較して簡略化されます。                                                                |
| `dot`        | `EXPLAIN`ステートメントは DOT 実行プランを出力します。これを使用して、 `dot`プログラム ( `graphviz`パッケージ内) を通じて PNG ファイルを生成することができます。                                 |
| `row`        | `EXPLAIN`ステートメントは結果を表形式で出力します。詳細については[クエリ実行プランを理解する](/explain-overview.md)を参照してください。                                                 |
| `tidb_json`  | `EXPLAIN`ステートメントは実行プランを JSON 形式で出力し、演算子情報を JSON 配列に格納します。                                                                            |
| `verbose`    | `EXPLAIN`ステートメントは、結果を`row`形式で出力し、結果にはクエリの推定コストを示す`estCost`列が追加されます。この形式の使用方法の詳細については、 [SQL プラン管理](/sql-plan-management.md)を参照してください。 |
| `plan_cache` | `EXPLAIN`ステートメントは、 [プランキャッシュ](/sql-non-prepared-plan-cache.md#diagnostics)情報を警告として含めて、 `row`形式で結果を出力します。                             |

<SimpleTab>

<div label="brief">

以下は`FORMAT`が`EXPLAIN`の`"brief"`である場合の例です。

```sql
EXPLAIN FORMAT = "brief" DELETE FROM t1 WHERE c1 = 3;
```

```sql
+-------------------------+---------+-----------+---------------+--------------------------------+
| id                      | estRows | task      | access object | operator info                  |
+-------------------------+---------+-----------+---------------+--------------------------------+
| Delete                  | N/A     | root      |               | N/A                            |
| └─TableReader           | 0.00    | root      |               | data:Selection                 |
|   └─Selection           | 0.00    | cop[tikv] |               | eq(test.t1.c1, 3)              |
|     └─TableFullScan     | 3.00    | cop[tikv] | table:t1      | keep order:false, stats:pseudo |
+-------------------------+---------+-----------+---------------+--------------------------------+
4 rows in set (0.001 sec)
```

</div>

<div label="DotGraph">

MySQL 標準の結果形式に加えて、TiDB は DotGraph もサポートしており、次の例のように`FORMAT = "dot"`指定する必要があります。

```sql
CREATE TABLE t(a bigint, b bigint);
EXPLAIN format = "dot" SELECT A.a, B.b FROM t A JOIN t B ON A.a > B.b WHERE A.a < 10;
```

```sql
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| dot contents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|
digraph Projection_8 {
subgraph cluster8{
node [style=filled, color=lightgrey]
color=black
label = "root"
"Projection_8" -> "HashJoin_9"
"HashJoin_9" -> "TableReader_13"
"HashJoin_9" -> "Selection_14"
"Selection_14" -> "TableReader_17"
}
subgraph cluster12{
node [style=filled, color=lightgrey]
color=black
label = "cop"
"Selection_12" -> "TableFullScan_11"
}
subgraph cluster16{
node [style=filled, color=lightgrey]
color=black
label = "cop"
"Selection_16" -> "TableFullScan_15"
}
"TableReader_13" -> "Selection_12"
"TableReader_17" -> "Selection_16"
}
 |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

コンピュータに`dot`プログラムがある場合は、次の方法で PNG ファイルを生成できます。

```bash
dot xx.dot -T png -O

The xx.dot is the result returned by the above statement.
```

コンピュータに`dot`プログラムがない場合、結果を[このウェブサイト](http://www.webgraphviz.com/)にコピーしてツリー ダイアグラムを取得します。

![Explain Dot](https://docs-download.pingcap.com/media/images/docs/explain_dot.png)

</div>

<div label="JSON">

JSON で出力を取得するには、 `EXPLAIN`ステートメントで`FORMAT = "tidb_json"`指定します。次に例を示します。

```sql
CREATE TABLE t(id int primary key, a int, b int, key(a));
EXPLAIN FORMAT = "tidb_json" SELECT id FROM t WHERE a = 1;
```

    +------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | TiDB_JSON                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
    +------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    | [
        {
            "id": "Projection_4",
            "estRows": "10.00",
            "taskType": "root",
            "operatorInfo": "test.t.id",
            "subOperators": [
                {
                    "id": "IndexReader_6",
                    "estRows": "10.00",
                    "taskType": "root",
                    "operatorInfo": "index:IndexRangeScan_5",
                    "subOperators": [
                        {
                            "id": "IndexRangeScan_5",
                            "estRows": "10.00",
                            "taskType": "cop[tikv]",
                            "accessObject": "table:t, index:a(a)",
                            "operatorInfo": "range:[1,1], keep order:false, stats:pseudo"
                        }
                    ]
                }
            ]
        }
    ]
     |
    +------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
    1 row in set (0.01 sec)

出力では、 `id` 、 `estRows` 、 `taskType` 、 `accessObject` 、 `operatorInfo`は、デフォルト形式の列と同じ意味を持ちます。 `subOperators`サブノードを格納する配列です。サブノードのフィールドと意味は、親ノードと同じです。フィールドが欠落している場合は、フィールドが空であることを意味します。

</div>

</SimpleTab>

## MySQL 互換性 {#mysql-compatibility}

-   `EXPLAIN`の形式と TiDB の潜在的な実行プランは、どちらも MySQL とは大幅に異なります。
-   TiDB は`FORMAT=JSON`または`FORMAT=TREE`オプションをサポートしていません。
-   TiDB の`FORMAT=tidb_json` 、デフォルトの`EXPLAIN`の結果の JSON 形式の出力です。形式とフィールドは、MySQL の`FORMAT=JSON`の出力とは異なります。

### <code>EXPLAIN FOR CONNECTION</code> {#code-explain-for-connection-code}

`EXPLAIN FOR CONNECTION` 、現在実行中の SQL クエリまたは接続で最後に実行された SQL クエリの実行プランを取得するために使用されます。出力形式は`EXPLAIN`と同じです。ただし、TiDB での`EXPLAIN FOR CONNECTION`の実装は MySQL での実装とは異なります。それらの違い (出力形式以外) は次のとおりです。

-   接続がスリープ状態の場合、MySQL は空の結果を返しますが、TiDB は最後に実行されたクエリ プランを返します。
-   現在のセッションの実行プランを取得しようとすると、MySQL はエラーを返しますが、TiDB は通常どおり結果を返します。
-   MySQL では、ログイン ユーザーがクエリ対象の接続と同じであるか、ログイン ユーザーが**`PROCESS`**権限を持っている必要があります。一方、TiDB では、ログイン ユーザーがクエリ対象の接続と同じであるか、ログイン ユーザーが**`SUPER`**権限を持っている必要があります。

## 参照 {#see-also}

-   [クエリ実行プランを理解する](/explain-overview.md)
-   [EXPLAIN分析](/sql-statements/sql-statement-explain-analyze.md)
-   [テーブルを分析](/sql-statements/sql-statement-analyze-table.md)
-   [痕跡](/sql-statements/sql-statement-trace.md)
