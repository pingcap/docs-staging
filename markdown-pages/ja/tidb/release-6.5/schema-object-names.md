---
title: Schema Object Names
summary: Learn about schema object names in TiDB SQL statements.
---

# スキーマ オブジェクト名 {#schema-object-names}

<!-- markdownlint-disable MD038 -->

このドキュメントでは、 TiDB SQLステートメントでのスキーマ オブジェクト名を紹介します。

スキーマ オブジェクト名は、データベース、テーブル、インデックス、列、エイリアスなど、TiDB 内のすべてのスキーマ オブジェクトに名前を付けるために使用されます。これらのオブジェクトは、SQL ステートメントで識別子を使用して引用できます。

バッククォートを使用して識別子を囲むことができます。たとえば、 `SELECT * FROM t` `` SELECT * FROM `t` ``と書くこともできます。ただし、識別子に 1 つ以上の特殊文字が含まれているか、予約済みのキーワードである場合は、それが表すスキーマ オブジェクトを引用するためにバックティックで囲む必要があります。


```sql
SELECT * FROM `table` WHERE `table`.id = 20;
```

SQL MODE に`ANSI_QUOTES`を設定すると、TiDB は二重引用符`"`で囲まれた文字列を識別子として認識します。


```sql
CREATE TABLE "test" (a varchar(10));
```

```sql
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your TiDB version for the right syntax to use line 1 column 19 near ""test" (a varchar(10))" 
```


```sql
SET SESSION sql_mode='ANSI_QUOTES';
```

```sql
Query OK, 0 rows affected (0.000 sec)
```


```sql
CREATE TABLE "test" (a varchar(10));
```

```sql
Query OK, 0 rows affected (0.012 sec)
```

引用符で囲まれた識別子でバックティック文字を使用する場合は、バックティックを 2 回繰り返します。たとえば、テーブル a`b を作成するには:


```sql
CREATE TABLE `a``b` (a int);
```

`SELECT`ステートメントでは、識別子または文字列を使用してエイリアスを指定できます。


```sql
SELECT 1 AS `identifier`, 2 AS 'string';
```

```sql
+------------+--------+
| identifier | string |
+------------+--------+
|          1 |      2 |
+------------+--------+
1 row in set (0.00 sec)
```

詳細については、 [MySQL スキーマ オブジェクト名](https://dev.mysql.com/doc/refman/5.7/en/identifiers.html)を参照してください。

## 識別子修飾子 {#identifier-qualifiers}

オブジェクト名は、修飾されていない場合も修飾されている場合もあります。たとえば、次のステートメントは、修飾名なしでテーブルを作成します。


```sql
CREATE TABLE t (i int);
```

`USE`ステートメントまたは接続パラメーターを使用してデータベースを構成していない場合、 `ERROR 1046 (3D000): No database selected`エラーが表示されます。この時点で、データベース修飾名を指定できます。


```sql
CREATE TABLE test.t (i int);
```

`.`の周りに空白が存在する可能性があります。 `table_name.col_name`と`table_name . col_name`は同等です。

この識別子を引用するには、次を使用します。


```sql
`table_name`.`col_name`
```

それ以外の：

```sql
`table_name.col_name`
```

詳細については、 [MySQL 識別子修飾子](https://dev.mysql.com/doc/refman/5.7/en/identifier-qualifiers.html)を参照してください。
