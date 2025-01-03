---
title: Non-Transactional DML Statements
summary: TiDB の非トランザクション DML ステートメントについて学習します。アトミック性と独立性を犠牲にして、DML ステートメントは複数のステートメントに分割され、順番に実行されます。これにより、バッチ データ処理シナリオでの安定性と使いやすさが向上します。
---

# 非トランザクションDMLステートメント {#non-transactional-dml-statements}

このドキュメントでは、TiDB における非トランザクション DML ステートメントの使用シナリオ、使用方法、制限について説明します。また、実装の原則やよくある問題についても説明します。

非トランザクション DML ステートメントは、複数の SQL ステートメント (つまり、複数のバッチ) に分割され、順番に実行される DML ステートメントです。トランザクションの原子性と分離性を犠牲にして、バッチ データ処理のパフォーマンスと使いやすさを向上させます。

通常、メモリを消費するトランザクションは、トランザクション サイズの制限を回避するために複数の SQL ステートメントに分割する必要があります。非トランザクション DML ステートメントは、このプロセスを TiDB カーネルに統合して、同じ効果を実現します。SQL ステートメントを分割することで、非トランザクション DML ステートメントの効果を理解するのに役立ちます。1 `DRY RUN`を使用して、分割されたステートメントをプレビューできます。

非トランザクション DML ステートメントには次のものがあります。

-   `INSERT INTO ... SELECT`
-   `REPLACE INTO .. SELECT`
-   `UPDATE`
-   `DELETE`

詳細な構文については[`BATCH`](/sql-statements/sql-statement-batch.md)参照してください。

> **注記：**
>
> -   非トランザクション DML ステートメントは、ステートメントの原子性と分離性を保証せず、元の DML ステートメントと同等ではありません。
> -   DML ステートメントが非トランザクション DML ステートメントに書き換えられた後、その動作が元のステートメントの動作と一致していると想定することはできません。
> -   非トランザクション DML を使用する前に、分割されたステートメントが相互に影響するかどうかを分析する必要があります。

## 使用シナリオ {#usage-scenarios}

大規模データ処理のシナリオでは、大量のデータに対して同じ操作を実行する必要が頻繁に発生します。単一の SQL ステートメントを使用して操作を直接実行すると、トランザクション サイズが制限を超え、実行パフォーマンスに影響する可能性があります。

バッチ データ処理では、オンライン アプリケーション操作と時間やデータが重複しないことがよくあります。同時操作が存在しない場合は、分離 ( ACIDの I) は不要です。バルク データ操作がべき等であるか、簡単に再試行できる場合は、原子性も不要です。アプリケーションでデータの分離も原子性も必要ない場合は、非トランザクション DML ステートメントの使用を検討できます。

非トランザクション DML ステートメントは、特定のシナリオで大規模なトランザクションのサイズ制限を回避するために使用されます。 1 つのステートメントを使用して、通常は手動でトランザクションを分割する必要があるタスクを完了し、実行効率を高め、リソースの消費を抑えます。

たとえば、期限切れのデータを削除する場合、期限切れのデータにアプリケーションがアクセスしないようにすれば、非トランザクション DML ステートメントを使用して`DELETE`を向上させることができます。

## 前提条件 {#prerequisites}

非トランザクション DML ステートメントを使用する前に、次の条件が満たされていることを確認してください。

-   このステートメントはアトミック性を必要とせず、実行結果で一部の行を変更し、一部の行を変更しないままにしておくことができます。

-   ステートメントはべき等であるか、エラー メッセージに従ってデータの一部に対して再試行する準備ができています。システム変数が`tidb_redact_log = 1`と`tidb_nontransactional_ignore_error = 1`に設定されている場合、このステートメントはべき等である必要があります。そうでない場合、ステートメントが部分的に失敗したときに、失敗した部分を正確に特定できません。

-   操作対象のデータには他の同時書き込みがないため、同時に他のステートメントによって更新されることはありません。そうでない場合、書き込みの欠落、誤った書き込み、同じ行の複数回の変更など、予期しない結果が発生する可能性があります。

-   ステートメントは、ステートメント自体によって読み取られるデータを変更しません。そうしないと、次のバッチが前のバッチによって書き込まれたデータを読み取り、予期しない結果が発生しやすくなります。

    -   非トランザクション`INSERT INTO ... SELECT`ステートメント内で同じテーブルを選択して変更する場合は、シャード列を変更しないでください。そうしないと、複数のバッチが同じ行を読み取り、データを複数回挿入する可能性があります。
        -   `BATCH ON test.t.id LIMIT 10000 INSERT INTO t SELECT id+1, value FROM t;`使用は推奨されません。
        -   `BATCH ON test.t.id LIMIT 10000 INSERT INTO t SELECT id, value FROM t;`使用することをお勧めします。
        -   シャード列`id`に`AUTO_INCREMENT`属性がある場合は、 `BATCH ON test.t.id LIMIT 10000 INSERT INTO t(value) SELECT value FROM t;`使用することをお勧めします。
    -   非トランザクション`UPDATE` 、 `INSERT ... ON DUPLICATE KEY UPDATE` 、または`REPLACE INTO`ステートメントでシャード列を更新しないでください。
        -   たとえば、非トランザクション`UPDATE`ステートメントの場合、分割された SQL ステートメントが順番に実行されます。前のバッチの変更は、前のバッチがコミットされた後に次のバッチによって読み取られ、同じデータ行が複数回変更されることになります。
        -   これらのステートメントは`BATCH ON test.t.id LIMIT 10000 UPDATE t SET test.t.id = test.t.id-1;`サポートしていません。
        -   `BATCH ON test.t.id LIMIT 1 INSERT INTO t SELECT id+1, value FROM t ON DUPLICATE KEY UPDATE id = id + 1;`使用は推奨されません。
    -   シャード列は結合キーとして使用しないでください。たとえば、次の例ではシャード列`test.t.id`を結合キーとして使用しているため、非トランザクション`UPDATE`ステートメントによって同じ行が複数回変更されます。

        ```sql
        CREATE TABLE t(id int, v int, key(id));
        CREATE TABLE t2(id int, v int, key(id));
        INSERT INTO t VALUES (1, 1), (2, 2), (3, 3);
        INSERT INTO t2 VALUES (1, 1), (2, 2), (4, 4);
        BATCH ON test.t.id LIMIT 1 UPDATE t JOIN t2 ON t.id = t2.id SET t2.id = t2.id+1;
        SELECT * FROM t2; -- (4, 1) (4, 2) (4, 4)
        ```

-   この記述は[制限](#restrictions)満たしています。

-   この DML ステートメントによって読み取りまたは書き込みが行われるテーブルに対して同時 DDL 操作を実行することは推奨されません。

> **警告：**
>
> `tidb_redact_log`と`tidb_nontransactional_ignore_error`同時に有効になっている場合、各バッチの完全なエラー情報を取得できない可能性があり、失敗したバッチのみを再試行することはできません。したがって、両方のシステム変数がオンになっている場合、非トランザクション DML ステートメントはべき等である必要があります。

## 使用例 {#usage-examples}

### 非トランザクションDMLステートメントを使用する {#use-a-non-transactional-dml-statement}

次のセクションでは、非トランザクション DML ステートメントの使用について例を挙げて説明します。

次のスキーマを持つテーブル`t`を作成します。

```sql
CREATE TABLE t (id INT, v INT, KEY(id));
```

```sql
Query OK, 0 rows affected
```

表`t`にデータを挿入します。

```sql
INSERT INTO t VALUES (1, 2), (2, 3), (3, 4), (4, 5), (5, 6);
```

```sql
Query OK, 5 rows affected
```

次の操作では、非トランザクション DML ステートメントを使用して、テーブル`t`の列`v`にある整数 6 未満の値を持つ行を削除します。このステートメントは、バッチ サイズが 2 の 2 つの SQL ステートメントに分割され、列`id`で分割されて実行されます。

```sql
BATCH ON id LIMIT 2 DELETE FROM t WHERE v < 6;
```

```sql
+----------------+---------------+
| number of jobs | job status    |
+----------------+---------------+
| 2              | all succeeded |
+----------------+---------------+
1 row in set
```

上記の非トランザクション DML ステートメントの削除結果を確認します。

```sql
SELECT * FROM t;
```

```sql
+----+---+
| id | v |
+----+---+
| 5  | 6 |
+----+---+
1 row in set
```

次の例では、複数のテーブル結合を使用する方法について説明します。まず、テーブル`t2`を作成し、データを挿入します。

```sql
CREATE TABLE t2(id int, v int, key(id));
INSERT INTO t2 VALUES (1,1), (3,3), (5,5);
```

次に、テーブル`t`と`t2`を結合してテーブル`t2`のデータを更新します。完全なデータベース名、テーブル名、列名 ( `test.t.id` ) とともにシャード列を指定する必要があることに注意してください。

```sql
BATCH ON test.t._tidb_rowid LIMIT 1 UPDATE t JOIN t2 ON t.id = t2.id SET t2.id = t2.id+1;
```

結果を照会します:

```sql
SELECT * FROM t2;
```

```sql
+----+---+
| id | v |
+----+---+
| 1  | 1 |
| 3  | 3 |
| 6  | 5 |
+----+---+
```

### 実行の進行状況を確認する {#check-the-execution-progress}

非トランザクション DML ステートメントの実行中は、 `SHOW PROCESSLIST`使用して進行状況を表示できます。返された結果の`Time`フィールドは、現在のバッチ実行の消費時間を示します。ログとスロー ログには、非トランザクション DML 実行中の各分割ステートメントの進行状況も記録されます。例:

```sql
SHOW PROCESSLIST;
```

```sql
+------+------+--------------------+--------+---------+------+------------+----------------------------------------------------------------------------------------------------+
| Id   | User | Host               | db     | Command | Time | State      | Info                                                                                               |
+------+------+--------------------+--------+---------+------+------------+----------------------------------------------------------------------------------------------------+
| 1203 | root | 100.64.10.62:52711 | test   | Query   | 0    | autocommit | /* job 506/500000 */ DELETE FROM `test`.`t1` WHERE `test`.`t1`.`_tidb_rowid` BETWEEN 2271 AND 2273 |
| 1209 | root | 100.64.10.62:52735 | <null> | Query   | 0    | autocommit | show full processlist                                                                              |
+------+------+--------------------+--------+---------+------+------------+----------------------------------------------------------------------------------------------------+
```

### 非トランザクションDMLステートメントを終了する {#terminate-a-non-transactional-dml-statement}

非トランザクション DML ステートメントを終了するには、 `KILL TIDB <processlist_id>`使用します。すると、TiDB は現在実行中のバッチ以降のすべてのバッチをキャンセルします。実行結果はログから取得できます。

`KILL TIDB`の詳細については、参考文献[`KILL`](/sql-statements/sql-statement-kill.md)参照してください。

### バッチ分割ステートメントをクエリする {#query-the-batch-dividing-statement}

非トランザクション DML ステートメントの実行中、ステートメントは内部的に使用され、DML ステートメントを複数のバッチに分割します。このバッチ分割ステートメントをクエリするには、この非トランザクション DML ステートメントに`DRY RUN QUERY`を追加します。その後、TiDB はこのクエリと後続の DML 操作を実行しません。

次の文は、 `BATCH ON id LIMIT 2 DELETE FROM t WHERE v < 6`の実行中にバッチ分割文を照会します。

```sql
BATCH ON id LIMIT 2 DRY RUN QUERY DELETE FROM t WHERE v < 6;
```

```sql
+--------------------------------------------------------------------------------+
| query statement                                                                |
+--------------------------------------------------------------------------------+
| SELECT `id` FROM `test`.`t` WHERE (`v` < 6) ORDER BY IF(ISNULL(`id`),0,1),`id` |
+--------------------------------------------------------------------------------+
1 row in set
```

### 最初のバッチと最後のバッチに対応するステートメントをクエリします {#query-the-statements-corresponding-to-the-first-and-the-last-batches}

非トランザクション DML ステートメント内の最初のバッチと最後のバッチに対応する実際の DML ステートメントを照会するには、この非トランザクション DML ステートメントに`DRY RUN`を追加します。すると、TiDB はバッチを分割するだけで、これらの SQL ステートメントは実行しません。バッチが多数ある場合があるため、すべてのバッチが表示されるわけではなく、最初のバッチと最後のバッチのみが表示されます。

```sql
BATCH ON id LIMIT 2 DRY RUN DELETE FROM t WHERE v < 6;
```

```sql
+-------------------------------------------------------------------+
| split statement examples                                          |
+-------------------------------------------------------------------+
| DELETE FROM `test`.`t` WHERE (`id` BETWEEN 1 AND 2 AND (`v` < 6)) |
| DELETE FROM `test`.`t` WHERE (`id` BETWEEN 3 AND 4 AND (`v` < 6)) |
+-------------------------------------------------------------------+
2 rows in set
```

### オプティマイザヒントを使用する {#use-the-optimizer-hint}

オプティマイザ ヒントが元々 `DELETE`文でサポートされている場合、オプティマイザ ヒントは非トランザクション`DELETE`文でもサポートされます。ヒントの位置は通常の`DELETE`文の場合と同じです。

```sql
BATCH ON id LIMIT 2 DELETE /*+ USE_INDEX(t)*/ FROM t WHERE v < 6;
```

## ベストプラクティス {#best-practices}

非トランザクション DML ステートメントを使用するには、次の手順をお勧めします。

1.  適切な[破片の列](#parameter-description)選択します。整数型または文字列型が推奨されます。

2.  非トランザクション DML ステートメントに`DRY RUN QUERY`を追加し、クエリを手動で実行して、DML ステートメントの影響を受けるデータ範囲がおおよそ正しいかどうかを確認します。

3.  非トランザクション DML ステートメントに`DRY RUN`を追加し、クエリを手動で実行して、分割ステートメントと実行プランを確認します。次の点に注意する必要があります。

    -   分割ステートメントが前のステートメントによって書き込まれた結果を読み取ることができるかどうか。これにより異常が発生する可能性があります。
    -   インデックスの選択性。
    -   TiDB によって自動的に選択されたシャード列が変更されるかどうか。

4.  非トランザクション DML ステートメントを実行します。

5.  エラーが報告された場合は、エラー メッセージまたはログから特定の失敗したデータ範囲を取得し、再試行するか手動で処理します。

## パラメータの説明 {#parameter-description}

| パラメータ  | 説明                                                                                                                                                                           | デフォルト値                               | 必須かどうか | 推奨値                                             |
| :----- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------- | :----- | :---------------------------------------------- |
| シャード列  | 上記の非トランザクション DML ステートメント`BATCH ON id LIMIT 2 DELETE FROM t WHERE v < 6`の`id`列など、バッチをシャーディングするために使用される列。                                                                      | TiDB はシャード列を自動的に選択しようとします (推奨されません)。 | いいえ    | 最も効率的に`WHERE`の条件を満たす列を選択します。                    |
| バッチサイズ | 各バッチのサイズを制御するために使用されます。バッチ数は、DML 操作が分割される SQL ステートメントの数です (上記の非トランザクション DML ステートメント`BATCH ON id LIMIT 2 DELETE FROM t WHERE v < 6`では`LIMIT 2`です)。バッチの数が多いほど、バッチ サイズは小さくなります。 | 該当なし                                 | はい     | 1000～1000000。バッチが小さすぎたり大きすぎたりすると、パフォーマンスが低下します。 |

### シャード列の選択方法 {#how-to-select-a-shard-column}

非トランザクション DML ステートメントは、データ バッチ処理のベースとして列を使用します。これがシャード列です。実行効率を高めるには、インデックスを使用するシャード列が必要です。異なるインデックスとシャード列によってもたらされる実行効率は、数十倍も異なる場合があります。シャード列を選択するときは、次の提案を考慮してください。

-   アプリケーションデータの分布がわかっている場合は、条件`WHERE`に従って、バッチ処理後にデータをより小さな範囲で分割する列を選択します。
    -   理想的には、 `WHERE`条件では、シャード列のインデックスを利用して、バッチごとにスキャンするデータの量を減らすことができます。たとえば、各トランザクションの開始時間と終了時間を記録するトランザクション テーブルがあり、終了時間が 1 か月前であるすべてのトランザクション レコードを削除するとします。トランザクションの開始時間にインデックスがあり、トランザクションの開始時間と終了時間が比較的近い場合は、開始時間列をシャード列として選択できます。
    -   理想的とは言えないケースでは、シャード列のデータ分布は`WHERE`条件から完全に独立しており、シャード列のインデックスを使用してデータ スキャンの範囲を縮小することはできません。
-   クラスター化インデックスが存在する場合は、実行効率を高めるために、主キー（ `INT`主キーと`_tidb_rowid`を含む）をシャード列として使用することをお勧めします。
-   重複値が少ない列を選択してください。

シャード列を指定しないことも選択できます。その場合、TiDB はデフォルトで最初の列`handle`をシャード列として使用します。ただし、クラスター化インデックスの主キーの最初の列が非トランザクション DML ステートメントでサポートされていないデータ型 ( `ENUM` 、 `BIT` 、 `SET` 、 `JSON` ) である場合、TiDB はエラーを報告します。アプリケーションのニーズに応じて適切なシャード列を選択できます。

### バッチサイズの設定方法 {#how-to-set-batch-size}

非トランザクション DML ステートメントでは、バッチ サイズが大きいほど、分割される SQL ステートメントが少なくなり、各 SQL ステートメントの実行速度が遅くなります。最適なバッチ サイズはワークロードによって異なります。50000 から開始することをお勧めします。バッチ サイズが小さすぎても大きすぎても、実行効率が低下します。

各バッチの情報はメモリに保存されるため、バッチが多すぎるとメモリ消費量が大幅に増加する可能性があります。これが、バッチ サイズが小さすぎることができない理由です。バッチ情報を格納するために非トランザクション ステートメントによって消費されるメモリの上限は[`tidb_mem_quota_query`](/system-variables.md#tidb_mem_quota_query)と同じであり、この制限を超えたときにトリガーされるアクションは、構成項目[`tidb_mem_oom_action`](/system-variables.md#tidb_mem_oom_action-new-in-v610)によって決定されます。

## 制限 {#restrictions}

以下は、非トランザクション DML ステートメントに対する厳格な制限です。これらの制限が満たされない場合、TiDB はエラーを報告します。

-   DML ステートメントには`ORDER BY`または`LIMIT`句を含めることはできません。
-   サブクエリまたはセット操作はサポートされていません。
-   シャード列にはインデックスを付ける必要があります。インデックスは単一列のインデックス、または結合インデックスの最初の列にすることができます。
-   [`autocommit`](/system-variables.md#autocommit)モードで使用する必要があります。
-   batch-dml が有効な場合は使用できません。
-   [`tidb_snapshot`](/read-historical-data.md)が設定されている場合は使用できません。
-   `prepare`ステートメントでは使用できません。
-   `ENUM`型`BIT` `SET`列としてサポートされて`JSON`ません。
-   [一時テーブル](/temporary-tables.md)にはサポートされていません。
-   [共通テーブル式](/develop/dev-guide-use-common-table-expression.md)はサポートされていません。

## 制御バッチ実行の失敗 {#control-batch-execution-failure}

非トランザクション DML ステートメントはアトミック性を満たしません。一部のバッチは成功し、一部は失敗する可能性があります。システム変数[`tidb_nontransactional_ignore_error`](/system-variables.md#tidb_nontransactional_ignore_error-new-in-v610)は、非トランザクション DML ステートメントがエラーを処理する方法を制御します。

例外として、最初のバッチが失敗した場合は、ステートメント自体が間違っている可能性が高くなります。この場合、非トランザクション ステートメント全体が直接エラーを返します。

## 仕組み {#how-it-works}

非トランザクション DML ステートメントの動作原理は、TiDB に SQL ステートメントの自動分割を組み込むことです。非トランザクション DML ステートメントがない場合、SQL ステートメントを手動で分割する必要があります。非トランザクション DML ステートメントの動作を理解するには、次のタスクを実行するユーザー スクリプトとして考えます。

非トランザクション DML `BATCH ON $C$ LIMIT $N$ DELETE FROM ... WHERE $P$`の場合、$C$ は分割に使用される列、$N$ はバッチ サイズ、$P$ はフィルター条件です。

1.  元のステートメントのフィルター条件 $P$ と分割用に指定された列 $C$ に従って、TiDB は $P$ を満たすすべての $C$ を照会します。TiDB はこれらの $C$ を $N$ に従ってグループ $B_1 \dots B_k$ に分類します。すべての $B_i$ ごとに、TiDB は最初と最後の $C$ を $S_i$ と $E_i$ として保持します。このステップで実行されたクエリ ステートメントは、 [`DRY RUN QUERY`](/non-transactional-dml.md#query-the-batch-dividing-statement)を通じて表示できます。
2.  $B_i$ に含まれるデータは、$P_i$: $C$ BETWEEN $S_i$ AND $E_i$ を満たすサブセットです。$P_i$ を使用して、各バッチで処理する必要があるデータの範囲を絞り込むことができます。
3.  $B_i$ の場合、TiDB は上記の条件を元のステートメントの`WHERE`条件に埋め込み、WHERE ($P_i$) AND ($P$) にします。このステップの実行結果は[`DRY RUN`](/non-transactional-dml.md#query-the-statements-corresponding-to-the-first-and-the-last-batches)で確認できます。
4.  すべてのバッチに対して、新しいステートメントを順番に実行します。各グループのエラーは収集および結合され、すべてのグループ化が完了した後に、非トランザクション DML ステートメント全体の結果として返されます。

## batch-dmlとの比較 {#comparison-with-batch-dml}

batch-dml は、DML ステートメントの実行中にトランザクションを複数のトランザクション コミットに分割するメカニズムです。

> **注記：**
>
> 非推奨となった batch-dml の使用は推奨されません。batch-dml 機能が適切に使用されていない場合、データ インデックスの不整合が発生するリスクがあります。

非トランザクション DML ステートメントは、まだすべてのバッチ DML 使用シナリオの代わりとなるものではありません。主な違いは次のとおりです。

-   パフォーマンス: [破片の列](#how-to-select-a-shard-column)が効率的な場合、非トランザクション DML ステートメントのパフォーマンスは batch-dml のパフォーマンスに近くなります。シャード列の効率が低い場合、非トランザクション DML ステートメントのパフォーマンスは batch-dml よりも大幅に低くなります。

-   安定性: batch-dml は、不適切な使用によりデータ インデックスの不整合が発生しやすくなります。非トランザクション DML ステートメントでは、データ インデックスの不整合は発生しません。ただし、不適切に使用すると、非トランザクション DML ステートメントは元のステートメントと同等ではなくなり、アプリケーションで予期しない動作が発生する可能性があります。詳細については、 [一般的な問題セクション](#non-transactional-delete-has-exceptional-behavior-that-is-not-equivalent-to-ordinary-delete)を参照してください。

## よくある問題 {#common-issues}

### 複数のテーブル結合ステートメントを実行すると、 <code>Unknown column xxx in &#39;where clause&#39;</code>エラーが発生します。 {#executing-a-multiple-table-joins-statement-results-in-the-code-unknown-column-xxx-in-where-clause-code-error}

このエラーは、クエリで連結された`WHERE`句が、 [破片の列](#parameter-description)が定義されているテーブル以外のテーブルに関係する場合に発生します。たとえば、次の SQL ステートメントでは、シャード列は`t2.id`であり、テーブル`t2`で定義されていますが、 `WHERE`句にはテーブル`t2`と`t3`関係しています。

```sql
BATCH ON test.t2.id LIMIT 1 
INSERT INTO t 
SELECT t2.id, t2.v, t3.id FROM t2, t3 WHERE t2.id = t3.id
```

```sql
(1054, "Unknown column 't3.id' in 'where clause'")
```

エラーが発生した場合は、 `DRY RUN QUERY`使用して確認用のクエリ ステートメントを印刷できます。例:

```sql
BATCH ON test.t2.id LIMIT 1 
DRY RUN QUERY INSERT INTO t 
SELECT t2.id, t2.v, t3.id FROM t2, t3 WHERE t2.id = t3.id
```

エラーを回避するには、 `WHERE`節内の他のテーブルに関連する条件を`JOIN`節内の`ON`条件に移動します。例:

```sql
BATCH ON test.t2.id LIMIT 1 
INSERT INTO t 
SELECT t2.id, t2.v, t3.id FROM t2 JOIN t3 ON t2.id = t3.id
```

    +----------------+---------------+
    | number of jobs | job status    |
    +----------------+---------------+
    | 0              | all succeeded |
    +----------------+---------------+

### 実際のバッチサイズは指定されたバッチサイズと同じではありません {#the-actual-batch-size-is-not-the-same-as-the-specified-batch-size}

非トランザクション DML ステートメントの実行中に、最後のバッチで処理されるデータのサイズが、指定されたバッチ サイズよりも小さくなる可能性があります。

**シャード列に重複した値が存在する**場合、各バッチには、このバッチ内のシャード列の最後の要素の重複した値がすべて含まれます。したがって、このバッチ内の行数は、指定されたバッチ サイズよりも大きくなる可能性があります。

さらに、他の同時書き込みが発生すると、各バッチで処理される行数が指定されたバッチ サイズと異なる場合があります。

### 実行中に、 <code>Failed to restore the delete statement, probably because of unsupported type of the shard column</code>エラーが発生します。 {#the-code-failed-to-restore-the-delete-statement-probably-because-of-unsupported-type-of-the-shard-column-code-error-occurs-during-execution}

シャード列は`ENUM` 、 `BIT` 、 `SET` 、 `JSON`型をサポートしていません。新しいシャード列を指定してください。整数型または文字列型の列を使用することをお勧めします。

<CustomContent platform="tidb">

選択したシャード列がこれらのサポートされていないタイプのいずれでもないときにエラーが発生する場合は、PingCAP またはコミュニティから[サポートを受ける](/support.md)取得します。

</CustomContent>

<CustomContent platform="tidb-cloud">

選択したシャード列がこれらのサポートされていないタイプのいずれでもない場合にエラーが発生する場合は、 [TiDB Cloudサポートにお問い合わせください](/tidb-cloud/tidb-cloud-support.md) 。

</CustomContent>

### 非トランザクション<code>DELETE</code>は、通常の<code>DELETE</code>と同等ではない「例外的な」動作があります。 {#non-transactional-code-delete-code-has-exceptional-behavior-that-is-not-equivalent-to-ordinary-code-delete-code}

非トランザクション DML ステートメントは、この DML ステートメントの元の形式と同等ではありません。これには次の理由が考えられます。

-   他にも同時書き込みがあります。
-   非トランザクション DML ステートメントは、ステートメント自体が読み取る値を変更します。
-   各バッチで実行されるSQL文は、 `WHERE`条件が変更されるため実行プランや式の計算順序が異なり、実行結果が元の文と異なる可能性があります。
-   DML ステートメントには非決定論的な操作が含まれています。

## MySQL 互換性 {#mysql-compatibility}

非トランザクション ステートメントは TiDB 固有であり、MySQL とは互換性がありません。

## 参照 {#see-also}

-   [`BATCH`](/sql-statements/sql-statement-batch.md)構文
-   [`tidb_nontransactional_ignore_error`](/system-variables.md#tidb_nontransactional_ignore_error-new-in-v610)
