---
title: Split Region
summary: TiDB データベースの分割リージョンの使用法の概要。
---

# 分割リージョン {#split-region}

TiDB に作成された新しいテーブルごとに、このテーブルのデータを格納するために、デフォルトで[リージョン](/tidb-storage.md#region)つのセグメントが分割されます。このデフォルトの動作は、TiDB 構成ファイルの`split-table`によって制御されます。このリージョンのデータがデフォルトのリージョンサイズ制限を超えると、リージョンは2 つに分割され始めます。

上記の場合、最初はリージョンが 1 つしかないため、すべての書き込み要求はリージョンが配置されている TiKV で発生します。新しく作成されたテーブルに対して大量の書き込みが発生すると、ホットスポットが発生します。

上記のシナリオのホットスポット問題を解決するために、TiDB は事前分割機能を導入しました。この機能は、指定されたパラメータに従って特定のテーブルの複数のリージョンを事前に分割し、各 TiKV ノードに分散させることができます。

> **注記：**
>
> この機能は[TiDB Cloudサーバーレス](https://docs.pingcap.com/tidbcloud/select-cluster-tier#tidb-cloud-serverless)クラスターでは使用できません。

## 概要 {#synopsis}

```ebnf+diagram
SplitRegionStmt ::=
    "SPLIT" SplitSyntaxOption "TABLE" TableName PartitionNameList? ("INDEX" IndexName)? SplitOption

SplitSyntaxOption ::=
    ("REGION" "FOR")? "PARTITION"?

TableName ::=
    (SchemaName ".")? Identifier

PartitionNameList ::=
    "PARTITION" "(" PartitionName ("," PartitionName)* ")"

SplitOption ::=
    ("BETWEEN" RowValue "AND" RowValue "REGIONS" NUM
|   "BY" RowValue ("," RowValue)* )

RowValue ::=
    "(" ValuesOpt ")"
```

## 分割リージョンの使用 {#usage-of-split-region}

分割リージョン構文には 2 つのタイプがあります。

-   均等分割の構文:

    ```sql
    SPLIT TABLE table_name [INDEX index_name] BETWEEN (lower_value) AND (upper_value) REGIONS region_num
    ```

    `BETWEEN lower_value AND upper_value REGIONS region_num`上限、下限、およびリージョンの量を定義します。現在の領域は、上限と下限の間の領域の数 ( `region_num`で指定) に均等に分割されます。

-   不均等分割の構文:

    ```sql
    SPLIT TABLE table_name [INDEX index_name] BY (value_list) [, (value_list)] ...
    ```

    `BY value_list…` 、現在のリージョンを分割する基準となる一連のポイントを手動で指定します。データが不均一に分散されているシナリオに適しています。

次の例は、 `SPLIT`のステートメントの結果を示しています。

```sql
+--------------------+----------------------+
| TOTAL_SPLIT_REGION | SCATTER_FINISH_RATIO |
+--------------------+----------------------+
| 4                  | 1.0                  |
+--------------------+----------------------+
```

-   `TOTAL_SPLIT_REGION` : 新しく分割されたリージョンの数。
-   `SCATTER_FINISH_RATIO` : 新しく分割された領域の分散の完了率。2 `1.0`すべての領域が分散されていることを意味します。4 `0.5`領域の半分だけが分散されており、残りは分散中であることを意味します。

> **注記：**
>
> 次の 2 つのセッション変数は、 `SPLIT`ステートメントの動作に影響を与える可能性があります。
>
> -   `tidb_wait_split_region_finish` : リージョンを分散するのに時間がかかる場合があります。この期間は、PD のスケジュールと TiKV の負荷によって異なります。この変数は、 `SPLIT REGION`のステートメントを実行するときに、すべてのリージョンが分散されるまで結果をクライアントに返すかどうかを制御するために使用されます。値が`1` (デフォルト) に設定されている場合、TiDB は分散が完了した後にのみ結果を返します。値が`0`に設定されている場合、TiDB は分散ステータスに関係なく結果を返します。
> -   `tidb_wait_split_region_timeout` : この変数は、 `SPLIT REGION`のステートメントの実行タイムアウトを秒単位で設定します。デフォルト値は 300 秒です。4 `split`操作が期間内に完了しない場合、TiDB はタイムアウト エラーを返します。

### テーブルリージョンを分割 {#split-table-region}

各テーブルの行データのキーは`table_id`と`row_id`でエンコードされます。形式は次のとおりです。

```go
t[table_id]_r[row_id]
```

たとえば、 `table_id`が 22 で`row_id`が 11 の場合:

```go
t22_r11
```

同じテーブル内の行データには同じ`table_id`含まれますが、各行にはリージョン分割に使用できる固有の`row_id`含まれます。

#### 均等分割 {#even-split}

`row_id`整数なので、分割するキーの値は、指定された`lower_value` 、 `upper_value` 、および`region_num`に従って計算できます。TiDB は最初にステップ値 ( `step = (upper_value - lower_value)/region_num` ) を計算します。次に、 `lower_value`から`upper_value`までの各「ステップ」ごとに均等に分割され、 `region_num`で指定された数の領域が生成されます。

たとえば、テーブル t のキー範囲`minInt64` ～ `maxInt64`から 16 個の均等に分割されたリージョンが必要な場合は、次のステートメントを使用できます。

```sql
SPLIT TABLE t BETWEEN (-9223372036854775808) AND (9223372036854775807) REGIONS 16;
```

このステートメントは、テーブル t を minInt64 から maxInt64 までの 16 の領域に分割します。指定された主キーの範囲が指定された範囲よりも小さい場合 (たとえば、0~1000000000)、minInt64 と maxInt64 の代わりにそれぞれ 0 と 1000000000 を使用して領域を分割できます。

```sql
SPLIT TABLE t BETWEEN (0) AND (1000000000) REGIONS 16;
```

#### 不平等な分割 {#uneven-split}

既知のデータが不均等に分散されており、リージョンをキー範囲 -inf ~ 10000、10000 ~ 90000、90000 ~ +inf にそれぞれ分割したい場合は、以下に示すように固定ポイントを設定することでこれを実現できます。

```sql
SPLIT TABLE t BY (10000), (90000);
```

### 分割インデックスリージョン {#split-index-region}

テーブル内のインデックス データのキーは、 `table_id` 、 `index_id` 、およびインデックス列の値でエンコードされます。形式は次のとおりです。

```go
t[table_id]_i[index_id][index_value]
```

たとえば、 `table_id`が 22、3 が`index_id` `index_value` abc の場合:

```go
t22_i5abc
```

1 つのテーブル内の同じインデックス データの`table_id`と`index_id`同じです。インデックス領域を分割するには、 `index_value`に基づいて領域を分割する必要があります。

#### こぼしても {#even-spilt}

インデックスを均等に分割する方法は、データを均等に分割する方法と同じです。ただし、 `index_value`整数ではない可能性があるため、ステップの値の計算はより複雑になります。

まず、 `upper`と`lower`の値がバイト配列にエンコードされます。5 と`lower`バイト配列の最長共通プレフィックスを削除した後、 `lower`と`upper`の最初の 8 バイトが uint64 形式に変換されます。次に、 `step = (upper - lower)/num`計算されます。その後、計算されたステップがバイト配列にエンコードされ、インデックス分割の`upper`に`lower`と`upper`バイト配列の最長共通プレフィックスに追加されます。次に例を示します。

`idx`インデックスの列が整数型の場合、次の SQL ステートメントを使用してインデックス データを分割できます。

```sql
SPLIT TABLE t INDEX idx BETWEEN (-9223372036854775808) AND (9223372036854775807) REGIONS 16;
```

このステートメントは、テーブル t のインデックス idx のリージョンを`minInt64`から`maxInt64`までの 16 個のリージョンに分割します。

インデックス idx1 の列が varchar 型であり、インデックス データをプレフィックス文字で分割する場合。

```sql
SPLIT TABLE t INDEX idx1 BETWEEN ("a") AND ("z") REGIONS 25;
```

このステートメントは、インデックス idx1 を a ～ z の 25 の領域に分割します。リージョン1 の範囲は`[minIndexValue, b)` 、リージョン2 の範囲は`[b, c)` 、…リージョン25 の範囲は`[y, minIndexValue]`です。インデックス`idx`の場合、プレフィックスが`a`のデータはリージョン1 に書き込まれ、プレフィックスが`b`のデータはリージョン2 に書き込まれます。

上記の分割方法では、上限が`z`ではなく`{` (ASCII で`z`の次の文字) であるため、プレフィックスが`y`と`z`両方のデータがリージョン25 に書き込まれます。したがって、より正確な分割方法は次のとおりです。

```sql
SPLIT TABLE t INDEX idx1 BETWEEN ("a") AND ("{") REGIONS 26;
```

このステートメントは、テーブル`t`のインデックス idx1 を a~ `{`の 26 の領域に分割します。リージョン1 の範囲は`[minIndexValue, b)` 、リージョン2 の範囲は`[b, c)` 、…リージョン25 の範囲は`[y, z)` 、リージョン26 の範囲は`[z, maxIndexValue)`です。

インデックス`idx2`の列が timestamp/datetime のような時間型で、インデックスリージョン を年ごとに分割する場合:

```sql
SPLIT TABLE t INDEX idx2 BETWEEN ("2010-01-01 00:00:00") AND ("2020-01-01 00:00:00") REGIONS 10;
```

このステートメントは、表`t`のインデックス`idx2`のリージョン を`2010-01-01 00:00:00`から`2020-01-01 00:00:00`までの 10 の Region に分割します。Region 1 のリージョンは`[minIndexValue, 2011-01-01 00:00:00)`で、 リージョン 2 の範囲は`[2011-01-01 00:00:00, 2012-01-01 00:00:00)`です。

インデックスリージョンを日ごとに分割する場合は、次の例を参照してください。

```sql
SPLIT TABLE t INDEX idx2 BETWEEN ("2020-06-01 00:00:00") AND ("2020-07-01 00:00:00") REGIONS 30;
```

このステートメントは、表`t`のインデックス`idex2`の 2020 年 6 月のデータを 30 のリージョンに分割し、各リージョンは1 日を表します。

他のタイプのインデックス列のリージョン分割方法も同様です。

結合インデックスのデータリージョン分割の場合、唯一の違いは、複数の列の値を指定できることです。

たとえば、インデックス`idx3 (a, b)`には 2 つの列が含まれており、列`a`はタイムスタンプ型、列`b`は int です。列`a`に従って時間範囲を分割するだけの場合は、単一列の時間インデックスを分割するための SQL ステートメントを使用できます。この場合、列`b`の値を`lower_value`と`upper_velue`に指定しないでください。

```sql
SPLIT TABLE t INDEX idx3 BETWEEN ("2010-01-01 00:00:00") AND ("2020-01-01 00:00:00") REGIONS 10;
```

同じ時間範囲内で、列 b に従ってさらに 1 つの分割を実行する場合、分割時に列 b の値を指定するだけです。

```sql
SPLIT TABLE t INDEX idx3 BETWEEN ("2010-01-01 00:00:00", "a") AND ("2010-01-01 00:00:00", "z") REGIONS 10;
```

このステートメントは、列 a と同じ時間プレフィックスを持つ列 b の値に従って、a ～ z の範囲の 10 個のリージョンを分割します。列 a に指定された値が異なる場合、この場合は列 b の値が使用されない可能性があります。

テーブルの主キーが[非クラスター化インデックス](/clustered-indexes.md)の場合、リージョンを分割するときに`PRIMARY`キーワードをエスケープするためにバッククォート`` ` ``使用する必要があります。例:

```sql
SPLIT TABLE t INDEX `PRIMARY` BETWEEN (-9223372036854775808) AND (9223372036854775807) REGIONS 16;
```

#### 不平等な分割 {#uneven-split}

インデックス データは、指定されたインデックス値によって分割することもできます。

たとえば、列`a`が varchar 型で、列`b`が timestamp 型の`idx4 (a,b)`あります。

```sql
SPLIT TABLE t1 INDEX idx4 BY ("a", "2000-01-01 00:00:01"), ("b", "2019-04-17 14:26:19"), ("c", "");
```

このステートメントは、4 つの領域を分割するための 3 つの値を指定します。各リージョンの範囲は次のとおりです。

    region1  [ minIndexValue               , ("a", "2000-01-01 00:00:01"))
    region2  [("a", "2000-01-01 00:00:01") , ("b", "2019-04-17 14:26:19"))
    region3  [("b", "2019-04-17 14:26:19") , ("c", "")                   )
    region4  [("c", "")                    , maxIndexValue               )

### パーティションテーブルの分割領域 {#split-regions-for-partitioned-tables}

パーティション化されたテーブルのリージョンの分割は、通常のテーブルのリージョンの分割と同じです。唯一の違いは、すべてのパーティションに対して同じ分割操作が実行されることです。

-   均等分割の構文:

    ```sql
    SPLIT [PARTITION] TABLE t [PARTITION] [(partition_name_list...)] [INDEX index_name] BETWEEN (lower_value) AND (upper_value) REGIONS region_num
    ```

-   不均等分割の構文:

    ```sql
    SPLIT [PARTITION] TABLE table_name [PARTITION (partition_name_list...)] [INDEX index_name] BY (value_list) [, (value_list)] ...
    ```

#### パーティションテーブルの分割領域の例 {#examples-of-split-regions-for-partitioned-tables}

1.  パーティションテーブル`t`を作成します。2 つのパーティションに分割されたハッシュ テーブルを作成するとします。例のステートメントは次のようになります。

    ```sql
    CREATE TABLE t (a INT, b INT, INDEX idx(a)) PARTITION BY HASH(a) PARTITIONS 2;
    ```

    テーブル`t`を作成した後、リージョンは各パーティションに分割されます。このテーブルのリージョンを表示するには、 [`SHOW TABLE REGIONS`](/sql-statements/sql-statement-show-table-regions.md)構文を使用します。

    ```sql
    SHOW TABLE t REGIONS;
    ```

    ```sql
    +-----------+-----------+---------+-----------+-----------------+------------------+------------+---------------+------------+----------------------+------------------+
    | REGION_ID | START_KEY | END_KEY | LEADER_ID | LEADER_STORE_ID | PEERS            | SCATTERING | WRITTEN_BYTES | READ_BYTES | APPROXIMATE_SIZE(MB) | APPROXIMATE_KEYS |
    +-----------+-----------+---------+-----------+-----------------+------------------+------------+---------------+------------+----------------------+------------------+
    | 1978      | t_1400_   | t_1401_ | 1979      | 4               | 1979, 1980, 1981 | 0          | 0             | 0          | 1                    | 0                |
    | 6         | t_1401_   |         | 17        | 4               | 17, 18, 21       | 0          | 223           | 0          | 1                    | 0                |
    +-----------+-----------+---------+-----------+-----------------+------------------+------------+---------------+------------+----------------------+------------------+
    ```

2.  `SPLIT`構文を使用して、各パーティションのリージョンを分割します。各パーティションの`[0,10000]`範囲のデータを 4 つの領域に分割するとします。例のステートメントは次のとおりです。

    ```sql
    split partition table t between (0) and (10000) regions 4;
    ```

    上記のステートメントでは、 `0`と`10000` 、散布するホットスポット データに対応する上限と下限の`row_id`表します。

    > **注記：**
    >
    > この例は、ホットスポット データが均等に分散されているシナリオにのみ適用されます。ホットスポット データが指定されたデータ範囲内で不均等に分散されている場合は、 [パーティションテーブルの分割領域](#split-regions-for-partitioned-tables)の不均等分割の構文を参照してください。

3.  `SHOW TABLE REGIONS`構文を使用して、このテーブルのリージョンを再度表示します。このテーブルには現在 10 個のリージョンがあり、各パーティションには 5 個のリージョンがあり、そのうち 4 個は行データで、1 個はインデックス データであることがわかります。

    ```sql
    SHOW TABLE t REGIONS;
    ```

    ```sql
    +-----------+---------------+---------------+-----------+-----------------+------------------+------------+---------------+------------+----------------------+------------------+
    | REGION_ID | START_KEY     | END_KEY       | LEADER_ID | LEADER_STORE_ID | PEERS            | SCATTERING | WRITTEN_BYTES | READ_BYTES | APPROXIMATE_SIZE(MB) | APPROXIMATE_KEYS |
    +-----------+---------------+---------------+-----------+-----------------+------------------+------------+---------------+------------+----------------------+------------------+
    | 1998      | t_1400_r      | t_1400_r_2500 | 2001      | 5               | 2000, 2001, 2015 | 0          | 132           | 0          | 1                    | 0                |
    | 2006      | t_1400_r_2500 | t_1400_r_5000 | 2016      | 1               | 2007, 2016, 2017 | 0          | 35            | 0          | 1                    | 0                |
    | 2010      | t_1400_r_5000 | t_1400_r_7500 | 2012      | 2               | 2011, 2012, 2013 | 0          | 35            | 0          | 1                    | 0                |
    | 1978      | t_1400_r_7500 | t_1401_       | 1979      | 4               | 1979, 1980, 1981 | 0          | 621           | 0          | 1                    | 0                |
    | 1982      | t_1400_       | t_1400_r      | 2014      | 3               | 1983, 1984, 2014 | 0          | 35            | 0          | 1                    | 0                |
    | 1990      | t_1401_r      | t_1401_r_2500 | 1992      | 2               | 1991, 1992, 2020 | 0          | 120           | 0          | 1                    | 0                |
    | 1994      | t_1401_r_2500 | t_1401_r_5000 | 1997      | 5               | 1996, 1997, 2021 | 0          | 129           | 0          | 1                    | 0                |
    | 2002      | t_1401_r_5000 | t_1401_r_7500 | 2003      | 4               | 2003, 2023, 2022 | 0          | 141           | 0          | 1                    | 0                |
    | 6         | t_1401_r_7500 |               | 17        | 4               | 17, 18, 21       | 0          | 601           | 0          | 1                    | 0                |
    | 1986      | t_1401_       | t_1401_r      | 1989      | 5               | 1989, 2018, 2019 | 0          | 123           | 0          | 1                    | 0                |
    +-----------+---------------+---------------+-----------+-----------------+------------------+------------+---------------+------------+----------------------+------------------+
    ```

4.  各パーティションのインデックスのリージョンを分割することもできます。たとえば、 `idx`インデックスの`[1000,10000]`範囲を 2 つのリージョンに分割できます。例のステートメントは次のとおりです。

    ```sql
    SPLIT PARTITION TABLE t INDEX idx BETWEEN (1000) AND (10000) REGIONS 2;
    ```

#### 単一パーティションの分割リージョンの例 {#examples-of-split-region-for-a-single-partition}

分割するパーティションを指定できます。

1.  パーティションテーブルを作成します。3 つのパーティションに分割された範囲パーティションテーブルを作成するとします。例のステートメントは次のようになります。

    ```sql
    CREATE TABLE t ( a INT, b INT, INDEX idx(b)) PARTITION BY RANGE( a ) (
        PARTITION p1 VALUES LESS THAN (10000),
        PARTITION p2 VALUES LESS THAN (20000),
        PARTITION p3 VALUES LESS THAN (MAXVALUE) );
    ```

2.  `p1`パーティションの`[0,10000]`の範囲のデータを 2 つのリージョンに分割するとします。例のステートメントは次のようになります。

    ```sql
    SPLIT PARTITION TABLE t PARTITION (p1) BETWEEN (0) AND (10000) REGIONS 2;
    ```

3.  `p2`パーティションの`[10000,20000]`の範囲のデータを 2 つのリージョンに分割するとします。例のステートメントは次のようになります。

    ```sql
    SPLIT PARTITION TABLE t PARTITION (p2) BETWEEN (10000) AND (20000) REGIONS 2;
    ```

4.  `SHOW TABLE REGIONS`構文を使用して、このテーブルのリージョンを表示できます。

    ```sql
    SHOW TABLE t REGIONS;
    ```

    ```sql
    +-----------+----------------+----------------+-----------+-----------------+------------------+------------+---------------+------------+----------------------+------------------+
    | REGION_ID | START_KEY      | END_KEY        | LEADER_ID | LEADER_STORE_ID | PEERS            | SCATTERING | WRITTEN_BYTES | READ_BYTES | APPROXIMATE_SIZE(MB) | APPROXIMATE_KEYS |
    +-----------+----------------+----------------+-----------+-----------------+------------------+------------+---------------+------------+----------------------+------------------+
    | 2040      | t_1406_        | t_1406_r_5000  | 2045      | 3               | 2043, 2045, 2044 | 0          | 0             | 0          | 1                    | 0                |
    | 2032      | t_1406_r_5000  | t_1407_        | 2033      | 4               | 2033, 2034, 2035 | 0          | 0             | 0          | 1                    | 0                |
    | 2046      | t_1407_        | t_1407_r_15000 | 2048      | 2               | 2047, 2048, 2050 | 0          | 35            | 0          | 1                    | 0                |
    | 2036      | t_1407_r_15000 | t_1408_        | 2037      | 4               | 2037, 2038, 2039 | 0          | 0             | 0          | 1                    | 0                |
    | 6         | t_1408_        |                | 17        | 4               | 17, 18, 21       | 0          | 214           | 0          | 1                    | 0                |
    +-----------+----------------+----------------+-----------+-----------------+------------------+------------+---------------+------------+----------------------+------------------+
    ```

5.  `p1`と`p2`パーティションの`idx`のインデックスの`[0,20000]`の範囲を 2 つのリージョンに分割するとします。例のステートメントは次のようになります。

    ```sql
    SPLIT PARTITION TABLE t PARTITION (p1,p2) INDEX idx BETWEEN (0) AND (20000) REGIONS 2;
    ```

## 事前分割領域 {#pre-split-regions}

`AUTO_RANDOM`または`SHARD_ROW_ID_BITS`属性でテーブルを作成する場合、テーブルの作成直後にテーブルを均等にリージョンに事前分割したい場合は、 `PRE_SPLIT_REGIONS`オプションを指定することもできます。テーブルの事前分割リージョンの数は`2^(PRE_SPLIT_REGIONS)`です。

> **注記：**
>
> `PRE_SPLIT_REGIONS`の値は`SHARD_ROW_ID_BITS`または`AUTO_RANDOM`の値以下でなければなりません。

`tidb_scatter_region`グローバル変数は`PRE_SPLIT_REGIONS`の動作に影響します。この変数は、テーブル作成後に結果を返す前に、リージョンが事前に分割され、分散されるまで待機するかどうかを制御します。テーブル作成後に書き込みが集中する場合は、この変数の値を`1`に設定する必要があります。そうすると、すべてのリージョンが分割され、分散されるまで、TiDB はクライアントに結果を返しません。そうしないと、分散が完了する前に TiDB がデータを書き込むため、書き込みパフォーマンスに大きな影響を与えます。

### pre_split_regions の例 {#examples-of-pre-split-regions}

```sql
CREATE TABLE t (a INT, b INT, INDEX idx1(a)) SHARD_ROW_ID_BITS = 4 PRE_SPLIT_REGIONS=2;
```

テーブルを構築した後、このステートメントはテーブル t の`4 + 1`領域を分割します。3 `4 (2^2)`領域はテーブル行データを保存するために使用され、1 つのリージョンは`idx1`のインデックス データを保存するために使用されます。

4 つのテーブル領域の範囲は次のとおりです。

    region1:   [ -inf      ,  1<<61 )
    region2:   [ 1<<61     ,  2<<61 )
    region3:   [ 2<<61     ,  3<<61 )
    region4:   [ 3<<61     ,  +inf  )

<CustomContent platform="tidb">

> **注記：**
>
> Split リージョンステートメントによって分割されたリージョンは、PD の[リージョンの統合](/best-practices/pd-scheduling-best-practices.md#region-merge)のスケジューラによって制御されます。PD がすぐに新しく分割されたリージョンを再マージしないようにするには、リージョンマージ機能に関連する[テーブル属性](/table-attributes.md)または[動的に変更する](/pd-control.md)構成項目を使用する必要があります。

</CustomContent>

## MySQL 互換性 {#mysql-compatibility}

このステートメントは、MySQL 構文に対する TiDB 拡張です。

## 参照 {#see-also}

-   [テーブル領域を表示](/sql-statements/sql-statement-show-table-regions.md)
-   [`tidb_wait_split_region_finish`](/system-variables.md#tidb_wait_split_region_finish) [`tidb_wait_split_region_timeout`](/system-variables.md#tidb_wait_split_region_timeout) [`tidb_scatter_region`](/system-variables.md#tidb_scatter_region)
