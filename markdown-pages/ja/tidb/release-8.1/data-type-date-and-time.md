---
title: Date and Time Types
summary: サポートされている日付と時刻の種類について説明します。
---

# 日付と時刻の種類 {#date-and-time-types}

TiDB は、時間値を格納するためにすべての MySQL 日付と時刻のデータ型をサポートしています: [`DATE`](#date-type) 、 [`TIME`](#time-type) 、 [`DATETIME`](#datetime-type) 、 [`TIMESTAMP`](#timestamp-type) 、および[`YEAR`](#year-type) 。詳細については、 [MySQL の日付と時刻のデータ型](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-types.html)を参照してください。

これらの各タイプには有効な値の範囲があり、無効な値であることを示すためにゼロ値が使用されます。さらに、タイプ`TIMESTAMP`と`DATETIME`では、変更時に新しい時間値を自動的に生成できます。

日付と時刻の値の型を扱うときは、次の点に注意してください。

-   TiDB はさまざまな形式を解釈しようとしますが、日付部分は月-日-年や日-月-年ではなく、年-月-日 (たとえば、「1998-09-04」) の形式である必要があります。

-   日付の年の部分が 2 桁で指定されている場合、TiDB はそれを[特定のルール](#two-digit-year-portion-contained-in-the-date)に基づいて変換します。

-   コンテキストで数値が必要な場合、TiDB は日付または時刻の値を自動的に数値型に変換します。例:

    ```sql
    mysql> SELECT NOW(), NOW()+0, NOW(3)+0;
    +---------------------+----------------+--------------------+
    | NOW()               | NOW()+0        | NOW(3)+0           |
    +---------------------+----------------+--------------------+
    | 2012-08-15 09:28:00 | 20120815092800 | 20120815092800.889 |
    +---------------------+----------------+--------------------+
    ```

-   TiDB は、無効な値またはサポートされている範囲を超える値を、その型のゼロ値に自動的に変換する場合があります。この動作は、SQL モードの設定によって異なります。例:

    ```sql
    mysql> show create table t1;
    +-------+---------------------------------------------------------------------------------------------------------+
    | Table | Create Table                                                                                            |
    +-------+---------------------------------------------------------------------------------------------------------+
    | t1    | CREATE TABLE `t1` (
      `a` time DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin |
    +-------+---------------------------------------------------------------------------------------------------------+
    1 row in set (0.00 sec)

    mysql> select @@sql_mode;
    +-------------------------------------------------------------------------------------------------------------------------------------------+
    | @@sql_mode                                                                                                                                |
    +-------------------------------------------------------------------------------------------------------------------------------------------+
    | ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION |
    +-------------------------------------------------------------------------------------------------------------------------------------------+
    1 row in set (0.00 sec)

    mysql> insert into t1 values ('2090-11-32:22:33:44');
    ERROR 1292 (22007): Truncated incorrect time value: '2090-11-32:22:33:44'
    mysql> set @@sql_mode='';                                                                                                                                                                                                                     Query OK, 0 rows affected (0.01 sec)

    mysql> insert into t1 values ('2090-11-32:22:33:44');
    Query OK, 1 row affected, 1 warning (0.01 sec)

    mysql> select * from t1;
    +----------+
    | a        |
    +----------+
    | 00:00:00 |
    +----------+
    1 row in set (0.01 sec)
    ```

-   異なる SQL モードを設定すると、TiDB の動作が変わる場合があります。

-   SQL モード`NO_ZERO_DATE`が有効になっていない場合、TiDB では、列`DATE`と`DATETIME`の月または日にゼロ値 (例: &#39;2009-00-00&#39; または &#39;2009-01-00&#39;) が許可されます。この日付タイプを関数で計算する場合 (例: `DATE_SUB()`または`DATE_ADD()` )、結果が不正確になる可能性があります。

-   デフォルトでは、TiDB は SQL モード`NO_ZERO_DATE`を有効にします。このモードでは、「0000-00-00」などのゼロ値が保存されるのを防ぎます。

ゼロ値のさまざまなタイプを次の表に示します。

| 日付タイプ   | 「ゼロ」値                         |
| :------ | :---------------------------- |
| 日付      | &#39;0000-00-00&#39;          |
| 時間      | &#39;00:00:00&#39;            |
| 日付時刻    | &#39;0000-00-00 00:00:00&#39; |
| タイムスタンプ | &#39;0000-00-00 00:00:00&#39; |
| 年       | 0000                          |

無効な`DATE` 、 `DATETIME` 、 `TIMESTAMP`の値は、SQL モードで許可されている場合、対応するタイプのゼロ値 ( &#39;0000-00-00&#39; または &#39;0000-00-00 00:00:00&#39; ) に自動的に変換されます。

## サポートされているタイプ {#supported-types}

### <code>DATE</code>型 {#code-date-code-type}

`DATE`日付部分のみが含まれ、時刻部分は含まれず、 `YYYY-MM-DD`形式で表示されます。サポートされている範囲は &#39;0000-01-01&#39; から &#39;9999-12-31&#39; です。

```sql
DATE
```

### <code>TIME</code>型 {#code-time-code-type}

`TIME`型の場合、形式は`HH:MM:SS[.fraction]`で、有効な値の範囲は &#39;-838:59:59.000000&#39; から &#39;838:59:59.000000&#39; です。5 `TIME` 、1 日の時間を示すだけでなく、2 つのイベント間の時間間隔を示すためにも使用されます。オプションで 0 から 6 の範囲の`fsp`値を指定して、小数秒の精度を指定することもできます。省略した場合、デフォルトの精度は 0 です。

```sql
TIME[(fsp)]
```

> **注記：**
>
> `TIME`の省略形に注意してください。たとえば、「11:12」は「00:11:12」ではなく「11:12:00」を意味します。ただし、「1112」は「00:11:12」を意味します。これらの違いは、 `:`文字の有無によって生じます。

### <code>DATETIME</code>型 {#code-datetime-code-type}

`DATETIME`には日付部分と時刻部分の両方が含まれます。有効な値の範囲は、「0000-01-01 00:00:00.000000」から「9999-12-31 23:59:59.999999」までです。

TiDB は`DATETIME`値を`YYYY-MM-DD HH:MM:SS[.fraction]`の形式で表示しますが、文字列または数値を使用して`DATETIME`列に値を割り当てることができます。小数秒の精度を指定するには、0 から 6 の範囲のオプションの fsp 値を指定できます。省略した場合、デフォルトの精度は 0 です。

```sql
DATETIME[(fsp)]
```

### <code>TIMESTAMP</code>型 {#code-timestamp-code-type}

`TIMESTAMP`には日付部分と時刻部分の両方が含まれます。有効な値の範囲は、UTC 時間で &#39;1970-01-01 00:00:01.000000&#39; から &#39;2038-01-19 03:14:07.999999&#39; です。小数秒の精度を指定するには、0 から 6 の範囲のオプションの fsp 値を指定できます。省略した場合、デフォルトの精度は 0 です。

`TIMESTAMP`では、月部分または日部分にゼロを使用することはできません。唯一の例外は、ゼロ値自体「0000-00-00 00:00:00」です。

```sql
TIMESTAMP[(fsp)]
```

#### タイムゾーンの処理 {#timezone-handling}

`TIMESTAMP`を保存する場合、TiDB は`TIMESTAMP`値を現在のタイムゾーンから UTC タイムゾーンに変換します。5 `TIMESTAMP`取得する場合、TiDB は保存されている`TIMESTAMP`値を UTC タイムゾーンから現在のタイムゾーンに変換します (注: `DATETIME`このようには処理されません)。各接続のデフォルトのタイムゾーンはサーバーのローカル タイムゾーンであり、環境変数`time_zone`で変更できます。

> **警告：**
>
> MySQL と同様に、 `TIMESTAMP`データ型は[2038年問題](https://en.wikipedia.org/wiki/Year_2038_problem)の影響を受けます。2038 を超える可能性がある値を保存する場合は、代わりに`DATETIME`型の使用を検討してください。

### <code>YEAR</code>型 {#code-year-code-type}

`YEAR`型は &#39;YYYY&#39; の形式で指定されます。サポートされる値の範囲は 1901 から 2155、またはゼロ値 0000 です。

```sql
YEAR[(4)]
```

`YEAR`次のフォーマット規則に従います。

-   4桁の数字の範囲は1901年から2155年まで
-   4桁の文字列の範囲は「1901」から「2155」までです
-   1桁または2桁の数字の範囲は1から99です。したがって、1〜69は2001〜2069に変換され、70〜99は1970〜1999に変換されます。
-   1桁または2桁の文字列の範囲は「0」から「99」までです
-   値0は0000として扱われ、文字列「0」または「00」は2000として扱われます。

無効な値`YEAR`自動的に 0000 に変換されます (ユーザーが`NO_ZERO_DATE` SQL モードを使用していない場合)。

## <code>TIMESTAMP</code>と<code>DATETIME</code>の自動初期化と更新 {#automatic-initialization-and-update-of-code-timestamp-code-and-code-datetime-code}

`TIMESTAMP`または`DATETIME`値タイプを持つ列は、自動的に初期化されるか、現在の時刻に更新されます。

テーブル内の`TIMESTAMP`または`DATETIME`値タイプを持つ列に対して、デフォルト値または自動更新値を現在のタイムスタンプとして設定できます。

これらのプロパティは、列を定義するときに`DEFAULT CURRENT_TIMESTAMP`と`ON UPDATE CURRENT_TIMESTAMP`設定することで設定できます。DEFAULT は、 `DEFAULT 0`や`DEFAULT '2000-01-01 00:00:00'`などの特定の値として設定することもできます。

```sql
CREATE TABLE t1 (
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    dt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

`DATETIME`のデフォルト値は、 `NOT NULL`が指定されていない限り`NULL`です。後者の状況では、デフォルト値が設定されていない場合、デフォルト値は 0 になります。

```sql
CREATE TABLE t1 (
    dt1 DATETIME ON UPDATE CURRENT_TIMESTAMP,         -- default NULL
    dt2 DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP -- default 0
);
```

## 時間値の小数部分 {#decimal-part-of-time-value}

`DATETIME`と`TIMESTAMP`値には、マイクロ秒単位の精度で最大 6 桁の小数部を含めることができます`DATETIME`または`TIMESTAMP`タイプの列では、小数部は破棄されずに保存されます。小数部がある場合、値は &#39;YYYY-MM-DD HH:MM:SS[.fraction]&#39; の形式になり、小数部の範囲は 000000 から 999999 です。小数部と残りの部分を区切るには、小数点を使用する必要があります。

-   小数精度をサポートする列を定義するには`type_name(fsp)`使用します。3 `type_name` `TIME` 、 `DATETIME` 、または`TIMESTAMP`になります。たとえば、

    ```sql
    CREATE TABLE t1 (t TIME(3), dt DATETIME(6));
    ```

    `fsp` 0 から 6 の範囲でなければなりません。

    `0`小数部がないことを意味します。2 `fsp`省略すると、デフォルトは 0 になります。

-   小数部分を含む`TIME` 、 `DATETIME` 、または`TIMESTAMP`挿入する場合、小数の桁数が少なすぎるか多すぎると、状況に応じて四捨五入が必要になることがあります。例:

    ```sql
    mysql> CREATE TABLE fractest( c1 TIME(2), c2 DATETIME(2), c3 TIMESTAMP(2) );
    Query OK, 0 rows affected (0.33 sec)

    mysql> INSERT INTO fractest VALUES
         > ('17:51:04.777', '2014-09-08 17:51:04.777',   '2014-09-08 17:51:04.777');
    Query OK, 1 row affected (0.03 sec)

    mysql> SELECT * FROM fractest;
    +-------------|------------------------|------------------------+
    | c1          | c2                     | c3                     |
    +-------------|------------------------|------------------------+
    | 17:51:04.78 | 2014-09-08 17:51:04.78 | 2014-09-08 17:51:04.78 |
    +-------------|------------------------|------------------------+
    1 row in set (0.00 sec)
    ```

## 日付と時刻の型間の変換 {#conversions-between-date-and-time-types}

場合によっては、日付型と時刻型の間で変換を行う必要があります。しかし、一部の変換では情報が失われることがあります。たとえば、 `DATE` 、 `DATETIME` 、 `TIMESTAMP`の値はすべてそれぞれの範囲を持っています。 `TIMESTAMP` 、UTC 時間で 1970 年より前、または UTC 時間 &#39;2038-01-19 03:14:07&#39; より後であってはなりません。このルールに基づくと、 &#39;1968-01-01&#39; は`DATE`または`DATETIME`の有効な日付値ですが、 `TIMESTAMP`に変換すると 0 になります。

`DATE`の変換:

-   `DATE` `DATETIME`または`TIMESTAMP`に変換すると、DATEには時間情報が含まれていないため、時間部分「00:00:00」が追加されます。
-   `DATE` `TIME`に変換すると、結果は「00:00:00」になります。

`DATETIME`または`TIMESTAMP`の変換:

-   `DATETIME`または`TIMESTAMP` `DATE`に変換すると、時間と小数部分は切り捨てられます。たとえば、「1999-12-31 23:59:59.499」は「1999-12-31」に変換されます。
-   `DATETIME`または`TIMESTAMP` TIMEに変換すると、 `TIME`日付情報が含まれていないため、日付部分は破棄されます。

`TIME`他の時刻と日付の形式に変換すると、日付部分は自動的に`CURRENT_DATE()`として指定されます。最終的な変換結果は、 `TIME`と`CURRENT_DATE()`で構成される日付です。つまり、 TIME の値が &#39;00:00:00&#39; から &#39;23:59:59&#39; の範囲外の場合、変換された日付部分は現在の日を示しません。

`TIME` `DATE`に変換する場合もプロセスは同様であり、時間部分は破棄されます。

`CAST()`関数を使用すると、値を`DATE`型に明示的に変換できます。例:

```sql
date_col = CAST(datetime_col AS DATE)
```

`TIME`と`DATETIME`数値形式に変換します。例:

```sql
mysql> SELECT CURTIME(), CURTIME()+0, CURTIME(3)+0;
+-----------|-------------|--------------+
| CURTIME() | CURTIME()+0 | CURTIME(3)+0 |
+-----------|-------------|--------------+
| 09:28:00  |       92800 |    92800.887 |
+-----------|-------------|--------------+
mysql> SELECT NOW(), NOW()+0, NOW(3)+0;
+---------------------|----------------|--------------------+
| NOW()               | NOW()+0        | NOW(3)+0           |
+---------------------|----------------|--------------------+
| 2012-08-15 09:28:00 | 20120815092800 | 20120815092800.889 |
+---------------------|----------------|--------------------+
```

## 日付に含まれる2桁の年の部分 {#two-digit-year-portion-contained-in-the-date}

日付に含まれる 2 桁の年部分は実際の年を明示的に示しておらず、あいまいです。

`DATETIME` `DATE`タイプの場合、TiDB は曖昧さを排除するために次のルール`TIMESTAMP`従います。

-   01から69までの値は2001から2069までの値に変換されます
-   70から99までの値は1970から1999までの値に変換されます

これらのルールは`YEAR`タイプにも適用されますが、1 つの例外があります。

数字の`00` `YEAR(4)`に代入すると、結果は 2000 ではなく 0000 になります。

結果を 2000 にしたい場合は、値を 2000 に指定します。

2 桁の年部分は、 `MIN()`や`MAX()`などの一部の関数では正しく計算されない場合があります。これらの関数では、 4 桁の形式の方が適しています。