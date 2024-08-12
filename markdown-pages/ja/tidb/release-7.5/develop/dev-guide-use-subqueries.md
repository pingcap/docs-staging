---
title: Subquery
summary: TiDB でサブクエリを使用する方法を学習します。
---

# サブクエリ {#subquery}

このドキュメントでは、TiDB のサブクエリ ステートメントとカテゴリについて説明します。

## 概要 {#overview}

サブクエリは、別の SQL クエリ内のクエリです。サブクエリを使用すると、クエリ結果を別のクエリで使用できます。

以下では、サブクエリを紹介するために、アプリケーション[書店](/develop/dev-guide-bookshop-schema-design.md)を例に説明します。

## サブクエリステートメント {#subquery-statement}

ほとんどの場合、サブクエリには次の 5 つの種類があります。

-   スカラー サブクエリ (例: `SELECT (SELECT s1 FROM t2) FROM t1` 。
-   派生テーブル (例: `SELECT t1.s1 FROM (SELECT s1 FROM t2) t1` 。
-   存在テスト、例`WHERE t1.a IN (SELECT ... FROM t2)` `WHERE NOT EXISTS(SELECT ... FROM t2)` 。
-   `WHERE t1.a = ANY(SELECT ... FROM t2)` `WHERE t1.a = ANY(SELECT ... FROM t2)`の定量化された比較。
-   比較演算子のオペランドとしてのサブクエリ (例: `WHERE t1.a > (SELECT ... FROM t2)` 。

## サブクエリのカテゴリ {#category-of-subquery}

サブクエリは、 [相関サブクエリ](https://en.wikipedia.org/wiki/Correlated_subquery)と自己完結型サブクエリに分類できます。TiDB では、これら 2 つのタイプを別々に扱います。

サブクエリが相関しているかどうかは、サブクエリが外部クエリで使用される列を参照しているかどうかによって決まります。

### 自己完結型サブクエリ {#self-contained-subquery}

サブクエリを比較演算子 ( `>` 、 `>=` 、 `<` 、 `<=` 、 `=` 、または`! =` ) のオペランドとして使用する自己完結型サブクエリの場合、内部サブクエリは 1 回だけクエリを実行し、TiDB は実行プラン フェーズ中にそれを定数として書き換えます。

たとえば、年齢が平均年齢より大きい`authors`テーブル内の著者を照会するには、サブクエリを比較演算子のオペランドとして使用できます。

```sql
SELECT * FROM authors a1 WHERE (IFNULL(a1.death_year, YEAR(NOW())) - a1.birth_year) > (
    SELECT
        AVG(IFNULL(a2.death_year, YEAR(NOW())) - a2.birth_year) AS average_age
    FROM
        authors a2
)
```

TiDB が上記のクエリを実行する前に、内部サブクエリが実行されます。

```sql
SELECT AVG(IFNULL(a2.death_year, YEAR(NOW())) - a2.birth_year) AS average_age FROM authors a2;
```

クエリの結果が 34 であるとします。つまり、平均年齢は 34 であり、34 は元のサブクエリを置き換える定数として使用されます。

```sql
SELECT * FROM authors a1
WHERE (IFNULL(a1.death_year, YEAR(NOW())) - a1.birth_year) > 34;
```

結果は以下のようになります。

    +--------+-------------------+--------+------------+------------+
    | id     | name              | gender | birth_year | death_year |
    +--------+-------------------+--------+------------+------------+
    | 13514  | Kennith Kautzer   | 1      | 1956       | 2018       |
    | 13748  | Dillon Langosh    | 1      | 1985       | NULL       |
    | 99184  | Giovanny Emmerich | 1      | 1954       | 2012       |
    | 180191 | Myrtie Robel      | 1      | 1958       | 2009       |
    | 200969 | Iva Renner        | 0      | 1977       | NULL       |
    | 209671 | Abraham Ortiz     | 0      | 1943       | 2016       |
    | 229908 | Wellington Wiza   | 1      | 1932       | 1969       |
    | 306642 | Markus Crona      | 0      | 1969       | NULL       |
    | 317018 | Ellis McCullough  | 0      | 1969       | 2014       |
    | 322369 | Mozelle Hand      | 0      | 1942       | 1977       |
    | 325946 | Elta Flatley      | 0      | 1933       | 1986       |
    | 361692 | Otho Langosh      | 1      | 1931       | 1997       |
    | 421294 | Karelle VonRueden | 0      | 1977       | NULL       |
    ...

存在テストや定量比較などの自己完結型サブクエリの場合、TiDB はパフォーマンスを向上させるためにそれらを書き換えて同等のクエリに置き換えます。詳細については、 [サブクエリ関連の最適化](/subquery-optimization.md)参照してください。

### 相関サブクエリ {#correlated-subquery}

相関サブクエリの場合、内部サブクエリは外部クエリの列を参照するため、各サブクエリは外部クエリの各行に対して 1 回実行されます。つまり、外部クエリが 1,000 万件の結果を取得すると仮定すると、サブクエリも 1,000 万回実行され、より多くの時間とリソースが消費されます。

したがって、処理の過程で、TiDB は実行プラン レベルでクエリ効率を向上させるよう[相関サブクエリの非相関](/correlated-subquery-optimization.md)努めます。

次の文は、同じ性別の他の著者の平均年齢よりも年上の著者を照会するためのものです。

```sql
SELECT * FROM authors a1 WHERE (IFNULL(a1.death_year, YEAR(NOW())) - a1.birth_year) > (
    SELECT
        AVG(
            IFNULL(a2.death_year, YEAR(NOW())) - IFNULL(a2.birth_year, YEAR(NOW()))
        ) AS average_age
    FROM
        authors a2
    WHERE a1.gender = a2.gender
);
```

TiDB はこれを同等の`join`クエリに書き換えます。

```sql
SELECT *
FROM
    authors a1,
    (
        SELECT
            gender, AVG(
                IFNULL(a2.death_year, YEAR(NOW())) - IFNULL(a2.birth_year, YEAR(NOW()))
            ) AS average_age
        FROM
            authors a2
        GROUP BY gender
    ) a2
WHERE
    a1.gender = a2.gender
    AND (IFNULL(a1.death_year, YEAR(NOW())) - a1.birth_year) > a2.average_age;
```

ベスト プラクティスとして、実際の開発では、パフォーマンスが向上した別の同等のクエリを記述できる場合は、相関サブクエリを介したクエリを避けることをお勧めします。

## 続きを読む {#read-more}

-   [サブクエリ関連の最適化](/subquery-optimization.md)
-   [相関サブクエリの非相関](/correlated-subquery-optimization.md)
-   [TiDB におけるサブクエリの最適化](https://www.pingcap.com/blog/subquery-optimization-in-tidb/)

## 助けが必要？ {#need-help}

<CustomContent platform="tidb">

[TiDB コミュニティ](https://ask.pingcap.com/) 、または[サポートチケットを作成する](/support.md)について質問します。

</CustomContent>

<CustomContent platform="tidb-cloud">

[TiDB コミュニティ](https://ask.pingcap.com/) 、または[サポートチケットを作成する](https://support.pingcap.com/)について質問します。

</CustomContent>
