---
title: Get Started with TiDB + AI via Python
summary: Python と TiDB Vector Search を使用してセマンティック検索を実行する AI アプリケーションを迅速に開発する方法を学びます。
---

# Python で TiDB + AI を使い始める {#get-started-with-tidb-ai-via-python}

このチュートリアルでは、**セマンティック検索**機能を提供するシンプルな AI アプリケーションの開発方法を説明します。従来のキーワード検索とは異なり、セマンティック検索はクエリの背後にある意味をインテリジェントに理解し、最も関連性の高い結果を返します。たとえば、「犬」、「魚」、「木」というタイトルのドキュメントがあり、「泳ぐ動物」を検索すると、アプリケーションは「魚」を最も関連性の高い結果として識別します。

このチュートリアルでは、 [TiDB ベクトル検索](/vector-search-overview.md) 、Python、 [Python 用 TiDB ベクター SDK](https://github.com/pingcap/tidb-vector-python) 、AI モデルを使用してこの AI アプリケーションを開発します。

<CustomContent platform="tidb">

> **警告：**
>
> ベクトル検索機能は実験的です。本番環境での使用は推奨されません。この機能は予告なく変更される可能性があります。バグを見つけた場合は、GitHub で[問題](https://github.com/pingcap/tidb/issues)を報告できます。

</CustomContent>

> **注記：**
>
> ベクトル検索機能は、TiDB セルフマネージド クラスターと[TiDB Cloudサーバーレス](https://docs.pingcap.com/tidbcloud/select-cluster-tier#tidb-cloud-serverless)クラスターでのみ使用できます。

## 前提条件 {#prerequisites}

このチュートリアルを完了するには、次のものが必要です。

-   [Python 3.8以上](https://www.python.org/downloads/)インストールされました。
-   [ギット](https://git-scm.com/downloads)インストールされました。
-   TiDB クラスター。

<CustomContent platform="tidb">

**TiDB クラスターがない場合は、次のように作成できます。**

-   [ローカルテストTiDBクラスタをデプロイ](/quick-start-with-tidb.md#deploy-a-local-test-cluster)または[本番のTiDBクラスタをデプロイ](/production-deployment-using-tiup.md)に従ってローカル クラスターを作成します。
-   [TiDB Cloud Serverless クラスターの作成](/develop/dev-guide-build-cluster-in-cloud.md)に従って、独自のTiDB Cloudクラスターを作成します。

</CustomContent>
<CustomContent platform="tidb-cloud">

**TiDB クラスターがない場合は、次のように作成できます。**

-   (推奨) [TiDB Cloud Serverless クラスターの作成](/develop/dev-guide-build-cluster-in-cloud.md)に従って、独自のTiDB Cloudクラスターを作成します。
-   [ローカルテストTiDBクラスタをデプロイ](https://docs.pingcap.com/tidb/stable/quick-start-with-tidb#deploy-a-local-test-cluster)または[本番のTiDBクラスタをデプロイ](https://docs.pingcap.com/tidb/stable/production-deployment-using-tiup)に従って、v8.4.0 以降のバージョンのローカル クラスターを作成します。

</CustomContent>

## 始める {#get-started}

次の手順では、アプリケーションをゼロから開発する方法を示します。デモを直接実行するには、 [pingcap/tidb-vector-python](https://github.com/pingcap/tidb-vector-python/blob/main/examples/python-client-quickstart)リポジトリのサンプル コードをチェックアウトできます。

### ステップ1. 新しいPythonプロジェクトを作成する {#step-1-create-a-new-python-project}

任意のディレクトリに、新しい Python プロジェクトと`example.py`という名前のファイルを作成します。

```shell
mkdir python-client-quickstart
cd python-client-quickstart
touch example.py
```

### ステップ2. 必要な依存関係をインストールする {#step-2-install-required-dependencies}

プロジェクト ディレクトリで、次のコマンドを実行して必要なパッケージをインストールします。

```shell
pip install sqlalchemy pymysql sentence-transformers tidb-vector python-dotenv
```

-   `tidb-vector` : TiDB ベクトル検索と対話するための Python クライアント。
-   [`sentence-transformers`](https://sbert.net) : テキストから[ベクトル埋め込み](/vector-search-overview.md#vector-embedding)生成するための事前トレーニング済みモデルを提供する Python ライブラリ。

### ステップ3. TiDBクラスターへの接続文字列を構成する {#step-3-configure-the-connection-string-to-the-tidb-cluster}

選択した TiDB デプロイメント オプションに応じて、クラスター接続文字列を構成します。

<SimpleTab>
<div label="TiDB Cloud Serverless">

TiDB Cloud Serverless クラスターの場合、クラスター接続文字列を取得し、環境変数を構成するには、次の手順を実行します。

1.  [**クラスター**](https://tidbcloud.com/console/clusters)ページに移動し、ターゲット クラスターの名前をクリックして概要ページに移動します。

2.  右上隅の**「接続」**をクリックします。接続ダイアログが表示されます。

3.  接続ダイアログの構成が動作環境と一致していることを確認します。

    -   **接続タイプは**`Public`に設定されています。

    -   **ブランチは**`main`に設定されています。

    -   **Connect With は**`SQLAlchemy`に設定されています。

    -   **オペレーティング システムは**環境に適合します。

    > **ヒント：**
    >
    > プログラムが Windows Subsystem for Linux (WSL) で実行されている場合は、対応する Linux ディストリビューションに切り替えます。

4.  **PyMySQL**タブをクリックし、接続文字列をコピーします。

    > **ヒント：**
    >
    > まだパスワードを設定していない場合は、「**パスワードの生成」**をクリックしてランダムなパスワードを生成します。

5.  Python プロジェクトのルート ディレクトリに`.env`ファイルを作成し、その中に接続文字列を貼り付けます。

    以下は macOS の例です。

    ```dotenv
    TIDB_DATABASE_URL="mysql+pymysql://<prefix>.root:<password>@gateway01.<region>.prod.aws.tidbcloud.com:4000/test?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"
    ```

</div>
<div label="TiDB Self-Managed">

TiDB セルフマネージド クラスターの場合は、Python プロジェクトのルート ディレクトリに`.env`ファイルを作成します。次の内容を`.env`ファイルにコピーし、TiDB クラスターの接続パラメータに応じて環境変数の値を変更します。

```dotenv
TIDB_DATABASE_URL="mysql+pymysql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>"
# For example: TIDB_DATABASE_URL="mysql+pymysql://root@127.0.0.1:4000/test"
```

ローカル マシンで TiDB を実行している場合、デフォルトでは`<HOST>`は`127.0.0.1`です。初期の`<PASSWORD>`は空なので、クラスターを初めて起動する場合は、このフィールドを省略できます。

各パラメータの説明は次のとおりです。

-   `<USER>` : TiDB クラスターに接続するためのユーザー名。
-   `<PASSWORD>` : TiDB クラスターに接続するためのパスワード。
-   `<HOST>` : TiDB クラスターのホスト。
-   `<PORT>` : TiDB クラスターのポート。
-   `<DATABASE>` : 接続するデータベースの名前。

</div>

</SimpleTab>

### ステップ4. 埋め込みモデルを初期化する {#step-4-initialize-the-embedding-model}

[埋め込みモデル](/vector-search-overview.md#embedding-model)データを[ベクトル埋め込み](/vector-search-overview.md#vector-embedding)に変換します。この例では、テキスト埋め込みに事前トレーニング済みのモデル[**msmarco-MiniLM-L12-cos-v5**](https://huggingface.co/sentence-transformers/msmarco-MiniLM-L12-cos-v5)を使用します。7 `sentence-transformers`によって提供されるこの軽量モデルは、テキスト データを 384 次元のベクトル埋め込みに変換します。

モデルを設定するには、次のコードを`example.py`ファイルにコピーします。このコードは`SentenceTransformer`インスタンスを初期化し、後で使用するために`text_to_embedding()`関数を定義します。

```python
from sentence_transformers import SentenceTransformer

print("Downloading and loading the embedding model...")
embed_model = SentenceTransformer("sentence-transformers/msmarco-MiniLM-L12-cos-v5", trust_remote_code=True)
embed_model_dims = embed_model.get_sentence_embedding_dimension()

def text_to_embedding(text):
    """Generates vector embeddings for the given text."""
    embedding = embed_model.encode(text)
    return embedding.tolist()
```

### ステップ5. TiDBクラスターに接続する {#step-5-connect-to-the-tidb-cluster}

`TiDBVectorClient`クラスを使用して TiDB クラスターに接続し、ベクター列を持つテーブル`embedded_documents`を作成します。

> **注記**
>
> テーブル内のベクトル列の次元が、埋め込みモデルによって生成されたベクトルの次元と一致していることを確認します。たとえば、 **msmarco-MiniLM-L12-cos-v5**モデルは 384 次元のベクトルを生成するため、 `embedded_documents`のベクトル列の次元も 384 である必要があります。

```python
import os
from tidb_vector.integrations import TiDBVectorClient
from dotenv import load_dotenv

# Load the connection string from the .env file
load_dotenv()

vector_store = TiDBVectorClient(
   # The 'embedded_documents' table will store the vector data.
   table_name='embedded_documents',
   # The connection string to the TiDB cluster.
   connection_string=os.environ.get('TIDB_DATABASE_URL'),
   # The dimension of the vector generated by the embedding model.
   vector_dimension=embed_model_dims,
   # Recreate the table if it already exists.
   drop_existing_table=True,
)
```

### ステップ6. テキストデータを埋め込み、ベクトルを保存する {#step-6-embed-text-data-and-store-the-vectors}

このステップでは、「dog」、「fish」、「tree」などの単語を 1 つ含むサンプル ドキュメントを準備します。次のコードは、 `text_to_embedding()`関数を使用してこれらのテキスト ドキュメントをベクトル埋め込みに変換し、ベクトル ストアに挿入します。

```python
documents = [
    {
        "id": "f8e7dee2-63b6-42f1-8b60-2d46710c1971",
        "text": "dog",
        "embedding": text_to_embedding("dog"),
        "metadata": {"category": "animal"},
    },
    {
        "id": "8dde1fbc-2522-4ca2-aedf-5dcb2966d1c6",
        "text": "fish",
        "embedding": text_to_embedding("fish"),
        "metadata": {"category": "animal"},
    },
    {
        "id": "e4991349-d00b-485c-a481-f61695f2b5ae",
        "text": "tree",
        "embedding": text_to_embedding("tree"),
        "metadata": {"category": "plant"},
    },
]

vector_store.insert(
    ids=[doc["id"] for doc in documents],
    texts=[doc["text"] for doc in documents],
    embeddings=[doc["embedding"] for doc in documents],
    metadatas=[doc["metadata"] for doc in documents],
)
```

### ステップ7. セマンティック検索を実行する {#step-7-perform-semantic-search}

このステップでは、既存のドキュメント内のどの単語とも直接一致しない「泳ぐ動物」を検索します。

次のコードでは、 `text_to_embedding()`関数を再度使用してクエリ テキストをベクトル埋め込みに変換し、その埋め込みを使用してクエリを実行して、最も近い 3 つの一致を検索します。

```python
def print_result(query, result):
   print(f"Search result (\"{query}\"):")
   for r in result:
      print(f"- text: \"{r.document}\", distance: {r.distance}")

query = "a swimming animal"
query_embedding = text_to_embedding(query)
search_result = vector_store.query(query_embedding, k=3)
print_result(query, search_result)
```

`example.py`ファイルを実行すると、出力は次のようになります。

```plain
Search result ("a swimming animal"):
- text: "fish", distance: 0.4562914811223072
- text: "dog", distance: 0.6469335836410557
- text: "tree", distance: 0.798545178640937
```

検索結果の 3 つの用語は、クエリされたベクトルからのそれぞれの距離によって並べ替えられます。距離が小さいほど、対応する`document`の関連性が高くなります。

したがって、出力によると、泳いでいる動物は魚、または泳ぐ才能のある犬である可能性が最も高いです。

## 参照 {#see-also}

-   [ベクトルデータ型](/vector-search-data-types.md)
-   [ベクター検索インデックス](/vector-search-index.md)
