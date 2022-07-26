---
title: String Functions
summary: Learn about the string functions in TiDB.
---

# 文字列関数 {#string-functions}

TiDB は、 MySQL 5.7で利用可能な[文字列関数](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html)のほとんどと、Oracle 21 で利用可能な[関数](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlqr/SQL-Functions.html#GUID-93EC62F8-415D-4A7E-B050-5D5B2C127009)のいくつかをサポートしています。

<CustomContent platform="tidb">

Oracle と TiDB の関数と構文の比較については、 [Oracle と TiDB の関数と構文の比較](/oracle-functions-to-tidb.md)を参照してください。

</CustomContent>

## 対応関数 {#supported-functions}

| 名前                                                                                                                                            | 説明                                                                            |
| :-------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| [`ASCII()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_ascii)                                                     | 一番左の文字の数値を返す                                                                  |
| [`BIN()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_bin)                                                         | 数値のバイナリ表現を含む文字列を返します                                                          |
| [`BIT_LENGTH()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_bit-length)                                           | 引数の長さをビット単位で返す                                                                |
| [`CHAR()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_char)                                                       | 渡された各整数の文字を返します                                                               |
| [`CHAR_LENGTH()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_char-length)                                         | 引数の文字数を返す                                                                     |
| [`CHARACTER_LENGTH()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_character-length)                               | `CHAR_LENGTH()`の同義語                                                           |
| [`CONCAT()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_concat)                                                   | 連結された文字列を返す                                                                   |
| [`CONCAT_WS()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_concat-ws)                                             | セパレーター付きの連結を返す                                                                |
| [`ELT()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_elt)                                                         | インデックス番号の文字列を返す                                                               |
| [`EXPORT_SET()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_export-set)                                           | 値ビットに設定されたすべてのビットに対して on 文字列を取得し、設定されていないすべてのビットに対して off 文字列を取得するような文字列を返します。 |
| [`FIELD()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_field)                                                     | 後続の引数の最初の引数のインデックス (位置) を返します                                                 |
| [`FIND_IN_SET()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_find-in-set)                                         | 2 番目の引数内の最初の引数のインデックス位置を返します                                                  |
| [`FORMAT()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_format)                                                   | 指定された小数点以下の桁数にフォーマットされた数値を返します                                                |
| [`FROM_BASE64()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_from-base64)                                         | base-64 文字列にデコードして結果を返す                                                       |
| [`HEX()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_hex)                                                         | 10 進数または文字列値の 16 進数表現を返します                                                    |
| [`INSERT()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_insert)                                                   | 指定された位置に指定された文字数まで部分文字列を挿入します                                                 |
| [`INSTR()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_instr)                                                     | 部分文字列が最初に出現するインデックスを返します                                                      |
| [`LCASE()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_lcase)                                                     | `LOWER()`の同義語                                                                 |
| [`LEFT()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_left)                                                       | 指定された左端の文字数を返します                                                              |
| [`LENGTH()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_length)                                                   | 文字列の長さをバイト単位で返します                                                             |
| [`LIKE`](https://dev.mysql.com/doc/refman/5.7/en/string-comparison-functions.html#operator_like)                                              | シンプルなパターンマッチング                                                                |
| [`LOCATE()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_locate)                                                   | 部分文字列の最初の出現位置を返します                                                            |
| [`LOWER()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_lower)                                                     | 引数を小文字で返す                                                                     |
| [`LPAD()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_lpad)                                                       | 指定された文字列で左側がパディングされた文字列引数を返します                                                |
| [`LTRIM()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_ltrim)                                                     | 先頭のスペースを削除                                                                    |
| [`MAKE_SET()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_make-set)                                               | ビット セット内の対応するビットを持つコンマ区切り文字列のセットを返します                                         |
| [`MID()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_mid)                                                         | 指定された位置から始まる部分文字列を返します                                                        |
| [`NOT LIKE`](https://dev.mysql.com/doc/refman/5.7/en/string-comparison-functions.html#operator_not-like)                                      | 単純なパターン マッチングの否定                                                              |
| [`NOT REGEXP`](https://dev.mysql.com/doc/refman/5.7/en/regexp.html#operator_not-regexp)                                                       | `REGEXP`の否定                                                                   |
| [`OCT()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_oct)                                                         | 数値の 8 進数表現を含む文字列を返します                                                         |
| [`OCTET_LENGTH()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_octet-length)                                       | `LENGTH()`の同義語                                                                |
| [`ORD()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_ord)                                                         | 引数の左端の文字コードを返す                                                                |
| [`POSITION()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_position)                                               | `LOCATE()`の同義語                                                                |
| [`QUOTE()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_quote)                                                     | SQL ステートメントで使用する引数をエスケープする                                                    |
| [`REGEXP`](https://dev.mysql.com/doc/refman/5.7/en/regexp.html#operator_regexp)                                                               | 正規表現を使用したパターン マッチング                                                           |
| [`REPEAT()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_repeat)                                                   | 文字列を指定回数繰り返す                                                                  |
| [`REPLACE()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_replace)                                                 | 指定された文字列の出現を置換します                                                             |
| [`REVERSE()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_reverse)                                                 | 文字列内の文字を逆にする                                                                  |
| [`RIGHT()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_right)                                                     | 指定された右端の文字数を返す                                                                |
| [`RLIKE`](https://dev.mysql.com/doc/refman/5.7/en/regexp.html#operator_regexp)                                                                | `REGEXP`の同義語                                                                  |
| [`RPAD()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_rpad)                                                       | 文字列を指定回数追加する                                                                  |
| [`RTRIM()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_rtrim)                                                     | 末尾のスペースを削除                                                                    |
| [`SPACE()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_space)                                                     | 指定された数のスペースの文字列を返します                                                          |
| [`STRCMP()`](https://dev.mysql.com/doc/refman/5.7/en/string-comparison-functions.html#function_strcmp)                                        | 2 つの文字列を比較する                                                                  |
| [`SUBSTR()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_substr)                                                   | 指定された部分文字列を返します                                                               |
| [`SUBSTRING()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_substring)                                             | 指定された部分文字列を返します                                                               |
| [`SUBSTRING_INDEX()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_substring-index)                                 | 区切り文字が指定された回数出現する前の文字列から部分文字列を返します                                            |
| [`TO_BASE64()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_to-base64)                                             | base-64 文字列に変換された引数を返します                                                      |
| [`TRANSLATE()`](https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/TRANSLATE.html#GUID-80F85ACB-092C-4CC7-91F6-B3A585E3A690) | 文字列内のすべての文字を他の文字に置き換えます。 Oracle のように空の文字列を`NULL`として扱いません。                     |
| [`TRIM()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_trim)                                                       | 先頭と末尾のスペースを削除                                                                 |
| [`UCASE()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_ucase)                                                     | `UPPER()`の同義語                                                                 |
| [`UNHEX()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_unhex)                                                     | 数値の 16 進表現を含む文字列を返します                                                         |
| [`UPPER()`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_upper)                                                     | 大文字に変換                                                                        |

## サポートされていない関数 {#unsupported-functions}

-   `LOAD_FILE()`
-   `MATCH`
-   `SOUNDEX()`
-   `SOUNDS LIKE`
-   `WEIGHT_STRING()`
