---
title: Literal Values
summary: この記事では、TiDB SQLステートメントのリテラル値を紹介します。
---

# リテラル値 {#literal-values}

TiDBのリテラル値には、文字リテラル、数値リテラル、時刻と日付のリテラル、16進数、バイナリリテラル、NULLリテラルが含まれます。このドキュメントでは、これらのリテラル値をそれぞれ紹介します。

このドキュメントでは、文字列リテラル、数値リテラル、NULL 値、16 進リテラル、日付と時刻リテラル、ブール値リテラル、およびビット値リテラルについて説明します。

## 文字列リテラル {#string-literals}

文字列とは、一重引用符`'`または二重引用符`"`個で囲まれたバイトまたは文字のシーケンスです。例:

    'example string'
    "example string"

引用符で囲まれた文字列を隣り合わせに配置すると、1つの文字列に連結されます。以下の行は同等です。

    'a string'
    'a' ' ' 'string'
    "a" ' ' "string"

`ANSI_QUOTES` SQL モードが有効になっている場合、二重引用符で囲まれた文字列は識別子として解釈されるため、文字列リテラルは一重引用符で囲んでのみ囲むことができます。

文字列は次の 2 つのタイプに分かれます。

-   バイナリ文字列: 文字セットと照合順序順序が両方とも`binary`であるバイトのシーケンスで構成され、比較の単位として**バイト**を使用します。
-   非バイナリ文字列: 文字のシーケンスで構成され、 `binary`以外の様々な文字セットと照合順序を持ちます。非バイナリ文字列は、**文字を**単位として互いに比較されます。文字セットによっては、1文字に複数のバイトが含まれる場合があります。

文字列リテラルにはオプションの`character set introducer`と`COLLATE clause`があり、特定の文字セットと照合順序を使用する文字列であることを示します。

    [_charset_name]'string' [COLLATE collation_name]

例えば：

    SELECT _latin1'string';
    SELECT _binary'string';
    SELECT _utf8'string' COLLATE utf8_bin;

N&#39;literal&#39;（またはn&#39;literal&#39;）を使用して、各国語文字セットの文字列を作成できます。以下の文はどちらも同じ意味です。

    SELECT N'some text';
    SELECT n'some text';
    SELECT _utf8'some text';

文字列内の特殊文字を表すには、エスケープ文字を使用してエスケープします。

| エスケープ文字 | 意味                          |
| :------ | :-------------------------- |
| \0      | ASCII NUL (X&#39;00&#39;)文字 |
| \&#39;  | 一重引用符`'`文字                  |
| \&quot; | 二重引用符`"`文字                  |
| \b      | バックスペース文字                   |
| \n      | 改行文字                        |
| \r      | 復帰文字                        |
| \t      | タブ文字                        |
| \z      | ASCII 26 (Ctrl + Z)         |
| \\      | バックスラッシュ`\`文字               |
| \%      | `%`文字                       |
| \_      | `_`文字                       |

`'`に囲まれた文字列で`"`表したり、 `"`に囲まれた文字列で`'`たりする場合は、エスケープ文字を使用する必要はありません。

詳細については[MySQLの文字列リテラル](https://dev.mysql.com/doc/refman/8.0/en/string-literals.html)参照してください。

## 数値リテラル {#numeric-literals}

数値リテラルには、整数リテラル、DECIMAL リテラル、浮動小数点リテラルが含まれます。

整数には小数点として`.`含まれる場合があります。数値の前に`-`または`+`が付く場合、それぞれ負の値または正の値を示します。

正確な値の数値リテラルは`1, .2, 3.4, -5, -6.78, +9.10`として表すことができます。

数値リテラルは、 `1.2E3, 1.2E-3, -1.2E3, -1.2E-3`などの科学的記数法で表すこともできます。

詳細については[MySQLの数値リテラル](https://dev.mysql.com/doc/refman/8.0/en/number-literals.html)参照してください。

## 日付と時刻のリテラル {#date-and-time-literals}

日付と時刻のリテラル値は`'20170824'` `'2017-08-24'` `20170824`かを日付として解釈します。

TiDB は次の日付形式をサポートしています。

-   `'YYYY-MM-DD'`または`'YY-MM-DD'` : ここでの`-`という区切り文字は厳密ではありません。任意の句読点を使用できます。例えば、 `'2017-08-24'` 、 `'2017&08&24'` 、 `'2012@12^31'`はすべて有効な日付形式です。唯一の特別な句読点は「.」で、これは小数点として扱われ、整数部と小数部を区切ります。日付と時刻は`T`または空白で区切ることができます。例えば、 `2017-8-24 10:42:00`と`2017-8-24T10:42:00`同じ日付と時刻を表します。
-   `'YYYYMMDDHHMMSS'`または`'YYMMDDHHMMSS'` : 例えば、 `'20170824104520'`と`'170824104520'` `'2017-08-24 10:45:20'`とみなされます。ただし、 `'170824304520'`など範囲外の値を指定した場合、有効な日付として扱われません。 `YYYYMMDD HHMMSS` 、 `YYYYMMDD HH:MM:DD` 、 `YYYY-MM-DD HHMMSS`などの誤った形式は挿入に失敗することに注意してください。
-   `YYYYMMDDHHMMSS`または`YYMMDDHHMMSS` : これらの形式では、一重引用符や二重引用符は使用されず、数字が使用されることに注意してください。例えば、 `20170824104520` `'2017-08-24 10:45:20'`と解釈されます。

DATETIME または TIMESTAMP 値には、マイクロ秒単位の精度（6桁）を表す小数部が続く場合があります。小数部は、常に小数点`.`で残りの時間と区切る必要があります。

2桁のみの年値は曖昧です。4桁の年形式を使用することをお勧めします。TiDBは、2桁の年値を以下の規則に従って解釈します。

-   年値が`70-99`の範囲内にある場合は`1970-1999`に変換されます。
-   年値が`00-69`の範囲内にある場合は`2000-2069`に変換されます。

月または日が10未満の場合は、 `'2017-8-4'` `'2017-08-04'`と同じです。時刻についても同様です。例えば、 `'2017-08-24 1:2:3'` `'2017-08-24 01:02:03'`と同じです。

日付または時刻の値が必要な場合、TiDB は値の長さに応じて指定された形式を選択します。

-   6桁: `YYMMDD` 。
-   12桁: `YYMMDDHHMMSS` .
-   8桁: `YYYYMMDD` 。
-   14桁: `YYYYMMDDHHMMSS` .

TiDB は、時間値の次の形式をサポートしています。

-   `'D HH:MM:SS'` 、または`'HH:MM:SS'` 、 `'HH:MM'` 、 `'D HH:MM'` 、 `'D HH'` 、 `'SS'` : `D`は日数を意味し、有効な値の範囲は`0-34`です。
-   `HHMMSS`形式の数字: たとえば、 `231010` `'23:10:10'`として解釈されます。
-   `SS` 、 `MMSS` 、 `HHMMSS`形式の数字はいずれも時間としてみなされます。

Time 型の小数点も`.`で、小数点以下の精度は最大 6 桁になります。

詳細は[MySQLの日付と時刻のリテラル](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-literals.html)ご覧ください。

## ブールリテラル {#boolean-literals}

定数`TRUE`と`FALSE`それぞれ 1 と 0 に等しく、大文字と小文字は区別されません。

```sql
SELECT TRUE, true, tRuE, FALSE, FaLsE, false;
```

    +------+------+------+-------+-------+-------+
    | TRUE | true | tRuE | FALSE | FaLsE | false |
    +------+------+------+-------+-------+-------+
    |    1 |    1 |    1 |     0 |     0 |     0 |
    +------+------+------+-------+-------+-------+
    1 row in set (0.00 sec)

## 16進数リテラル {#hexadecimal-literals}

16進数リテラル値は`X'val'`または`0xval`表記法で記述されます。5 `val`は16進数が含まれます。先頭の`0x`大文字と小文字が区別され、 `0X`と表記することはできません。

有効な16進数リテラル:

    X'ac12'
    X'12AC'
    x'ac12'
    x'12AC'
    0xac12
    0x12AC

不正な16進数リテラル:

    X'1z' (z is not a hexadecimal legal digit)
    0X12AC (0X must be written as 0x)

`X'val'`記法で記述された16進数リテラルは、偶数桁でなければなりません。3 `val`長さが奇数（例えば`X'A'`や`X'11A'` ）の場合、構文エラーを回避するには、値の先頭にゼロを追加します。

```sql
mysql> select X'aff';
ERROR 1105 (HY000): line 0 column 13 near ""hex literal: invalid hexadecimal format, must even numbers, but 3 (total length 13)
mysql> select X'0aff';
+---------+
| X'0aff' |
+---------+
| 0x0aff  |
+---------+
1 row in set (0.00 sec)
```

デフォルトでは、16 進リテラルはバイナリ文字列です。

文字列または数値を 16 進形式の文字列に変換するには、 `HEX()`関数を使用します。

```sql
mysql> SELECT HEX('TiDB');
+-------------+
| HEX('TiDB') |
+-------------+
| 54694442    |
+-------------+
1 row in set (0.01 sec)

mysql> SELECT X'54694442';
+-------------+
| X'54694442' |
+-------------+
| TiDB        |
+-------------+
1 row in set (0.00 sec)
```

## ビット値リテラル {#bit-value-literals}

ビット値リテラルは`b'val'`または`0bval`表記法で記述されます。5 `val` 0と1で記述された2進値です。先頭の`0b`大文字と小文字が区別され、 `0B`と記述することはできません。

有効なビット値リテラル:

    b'01'
    B'01'
    0b01

不正なビット値リテラル:

    b'2' (2 is not a binary digit; it must be 0 or 1)
    0B01 (0B must be written as 0b)

デフォルトでは、ビット値リテラルはバイナリ文字列です。

ビット値はバイナリ値として返されるため、MySQLクライアントでは正しく表示されない可能性があります。ビット値を印刷可能な形式に変換するには、 `BIN()`や`HEX()`などの変換関数を使用できます。

```sql
CREATE TABLE t (b BIT(8));
INSERT INTO t SET b = b'00010011';
INSERT INTO t SET b = b'1110';
INSERT INTO t SET b = b'100101';

mysql> SELECT b+0, BIN(b), HEX(b) FROM t;
+------+--------+--------+
| b+0  | BIN(b) | HEX(b) |
+------+--------+--------+
|   19 | 10011  | 13     |
|   14 | 1110   | E      |
|   37 | 100101 | 25     |
+------+--------+--------+
3 rows in set (0.00 sec)
```

## NULL値 {#null-values}

`NULL`データが空であることを意味し、大文字と小文字は区別されず、 `\N` (大文字と小文字を区別する) と同義です。

> **注記：**
>
> `NULL` `0`と同じではなく、空の文字列`''`とも異なります。
