---
title: Get Started with Vector Search via SQL
summary: SQL ステートメントを使用してTiDB Cloudで Vector Search をすぐに開始し、生成 AI アプリケーションを強化する方法を学びます。
---

# SQL によるベクトル検索を始める {#get-started-with-vector-search-via-sql}

TiDB は MySQL 構文を拡張して[ベクトル検索](/tidb-cloud/vector-search-overview.md)サポートし、新しい[ベクトルデータ型](/tidb-cloud/vector-search-data-types.md)といくつかの[ベクトル関数](/tidb-cloud/vector-search-functions-and-operators.md)を導入します。

このチュートリアルでは、SQL ステートメントのみを使用して TiDB Vector Search を開始する方法を説明します。1 を使用して[MySQL コマンドラインクライアント](https://dev.mysql.com/doc/refman/8.4/en/mysql.html)操作を行う方法を学習します。

-   TiDB クラスターに接続します。
-   ベクターテーブルを作成します。
-   ベクトル埋め込みを保存します。
-   ベクトル検索クエリを実行します。

> **注記**
>
> TiDB Vector Search は現在ベータ版であり、 [TiDB サーバーレス](/tidb-cloud/select-cluster-tier.md#tidb-serverless)クラスターでのみ使用できます。

## 前提条件 {#prerequisites}

このチュートリアルを完了するには、次のものが必要です。

-   [MySQL コマンドラインクライアント](https://dev.mysql.com/doc/refman/8.4/en/mysql.html) (MySQL CLI) がマシンにインストールされています。
-   TiDB サーバーレス クラスター。TiDB Cloud クラスターがない場合は、 [TiDB サーバーレス クラスターの作成](/tidb-cloud/create-tidb-cluster-serverless.md)に従って独自のTiDB Cloudクラスターを作成してください。

## 始める {#get-started}

### ステップ1. TiDBクラスターに接続する {#step-1-connect-to-the-tidb-cluster}

1.  [**クラスター**](https://tidbcloud.com/console/clusters)ページに移動し、ターゲット クラスターの名前をクリックして概要ページに移動します。

2.  右上隅の**「接続」**をクリックします。接続ダイアログが表示されます。

3.  接続ダイアログで、 **「接続先」**ドロップダウンリストから**「MySQL CLI」**を選択し、**エンドポイント タイプ**のデフォルト設定を**「パブリック」**のままにします。

4.  まだパスワードを設定していない場合は、 **「パスワードの生成」**をクリックしてランダムなパスワードを生成します。

5.  接続コマンドをコピーしてターミナルに貼り付けます。以下は macOS の例です。

    ```bash
    mysql -u '<prefix>.root' -h '<host>' -P 4000 -D 'test' --ssl-mode=VERIFY_IDENTITY --ssl-ca=/etc/ssl/cert.pem -p'<password>'
    ```

### ステップ2.ベクターテーブルを作成する {#step-2-create-a-vector-table}

ベクトル検索サポートにより、 `VECTOR`型の列を使用して TiDB に[ベクトル埋め込み](/tidb-cloud/vector-search-overview.md#vector-embedding)保存できます。

3 次元の`VECTOR`列のテーブルを作成するには、MySQL CLI を使用して次の SQL ステートメントを実行します。

```sql
USE test;
CREATE TABLE embedded_documents (
    id        INT       PRIMARY KEY,
    -- Column to store the original content of the document.
    document  TEXT,
    -- Column to store the vector representation of the document.
    embedding VECTOR(3)
);
```

期待される出力は次のとおりです。

```text
Query OK, 0 rows affected (0.27 sec)
```

### ステップ3. ベクトル埋め込みを保存する {#step-3-store-the-vector-embeddings}

[ベクトル埋め込み](/tidb-cloud/vector-search-overview.md#vector-embedding)を含む 3 つのドキュメントを 3 つ`embedded_documents`テーブルに挿入します。

```sql
INSERT INTO embedded_documents
VALUES
    (1, 'dog', '[1,2,1]'),
    (2, 'fish', '[1,2,4]'),
    (3, 'tree', '[1,0,0]');
```

期待される出力は次のとおりです。

    Query OK, 3 rows affected (0.15 sec)
    Records: 3  Duplicates: 0  Warnings: 0

> **注記**
>
> この例では、ベクトル埋め込みの次元を簡略化し、デモンストレーションの目的で 3 次元ベクトルのみを使用します。
>
> 実際のアプリケーションでは、数百または数千の次元を持つベクトル埋め込みが生成されること[埋め込みモデル](/tidb-cloud/vector-search-overview.md#embedding-model)よくあります。

### ステップ4.ベクターテーブルをクエリする {#step-4-query-the-vector-table}

ドキュメントが正しく挿入されたことを確認するには、 `embedded_documents`テーブルをクエリします。

```sql
SELECT * FROM embedded_documents;
```

期待される出力は次のとおりです。

```sql
+----+----------+-----------+
| id | document | embedding |
+----+----------+-----------+
|  1 | dog      | [1,2,1]   |
|  2 | fish     | [1,2,4]   |
|  3 | tree     | [1,0,0]   |
+----+----------+-----------+
3 rows in set (0.15 sec)
```

### ステップ5.ベクター検索クエリを実行する {#step-5-perform-a-vector-search-query}

全文検索と同様に、ベクター検索を使用する場合、ユーザーはアプリケーションに検索用語を提供します。

この例では、検索語は「泳ぐ動物」であり、対応するベクトル埋め込みは`[1,2,3]`です。実際のアプリケーションでは、埋め込みモデルを使用して、ユーザーの検索語をベクトル埋め込みに変換する必要があります。

次のSQL文を実行すると、TiDBはベクトル埋め込み間のコサイン距離（ `vec_cosine_distance` ）を計算してソートすることで、検索語に最も近い上位3つのドキュメントを識別します。

```sql
SELECT id, document, vec_cosine_distance(embedding, '[1,2,3]') AS distance
FROM embedded_documents
ORDER BY distance
LIMIT 3;
```

期待される出力は次のとおりです。

```plain
+----+----------+---------------------+
| id | document | distance            |
+----+----------+---------------------+
|  2 | fish     | 0.00853986601633272 |
|  1 | dog      | 0.12712843905603044 |
|  3 | tree     |  0.7327387580875756 |
+----+----------+---------------------+
3 rows in set (0.15 sec)
```

出力から判断すると、泳いでいる動物は魚、または泳ぐ才能のある犬である可能性が高いです。

## 参照 {#see-also}

-   [ベクトルデータ型](/tidb-cloud/vector-search-data-types.md)
-   [ベクター検索インデックス](/tidb-cloud/vector-search-index.md)
