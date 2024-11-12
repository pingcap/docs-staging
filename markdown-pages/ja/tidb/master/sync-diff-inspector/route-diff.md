---
title: Data Check for Tables with Different Schema or Table Names
summary: さまざまなデータベース名またはテーブル名のデータチェックについて学習します。
---

# 異なるスキーマまたはテーブル名を持つテーブルのデータチェック {#data-check-for-tables-with-different-schema-or-table-names}

[TiDB データ移行](/dm/dm-overview.md)などのレプリケーション ツールを使用する場合、 `route-rules`設定すると、ダウンストリームの指定されたテーブルにデータをレプリケートできます。 sync-diff-inspector では、 `rules`設定することで、異なるスキーマ名またはテーブル名を持つテーブルを検証できます。

以下は簡単な設定例です。完全な設定については[sync-diff-inspector ユーザーガイド](/sync-diff-inspector/sync-diff-inspector-overview.md)を参照してください。

```toml
######################### Datasource config #########################
[data-sources.mysql1]
    host = "127.0.0.1"
    port = 3306
    user = "root"
    password = ""
    route-rules = ["rule1"]

[data-sources.tidb0]
    host = "127.0.0.1"
    port = 4000
    user = "root"
    password = ""
########################### Routes ###########################
[routes.rule1]
schema-pattern = "test_1"      # Matches the schema name of the data source. Supports the wildcards "*" and "?"
table-pattern = "t_1"          # Matches the table name of the data source. Supports the wildcards "*" and "?"
target-schema = "test_2"       # The name of the schema in the target database
target-table = "t_2"           # The name of the target table
```

この構成は、ダウンストリームの`test_2.t_2`と`mysql1`インスタンスの`test_1.t_1`をチェックするために使用できます。

スキーマ名やテーブル名が異なる多数のテーブルをチェックするには、 `rules`を使用してマッピング関係を設定することで構成を簡素化できます。スキーマまたはテーブルのいずれか、あるいは両方のマッピング関係を構成できます。たとえば、アップストリーム`test_1`データベース内のすべてのテーブルはダウンストリーム`test_2`データベースに複製され、次の構成でチェックできます。

```toml
######################### Datasource config #########################
[data-sources.mysql1]
    host = "127.0.0.1"
    port = 3306
    user = "root"
    password = ""
    route-rules = ["rule1"]

[data-sources.tidb0]
    host = "127.0.0.1"
    port = 4000
    user = "root"
    password = ""
########################### Routes ###########################
[routes.rule1]
schema-pattern = "test_1"      # Matches the schema name of the data source. Supports the wildcards "*" and "?"
table-pattern = "*"            # Matches the table name of the data source. Supports the wildcards "*" and "?"
target-schema = "test_2"       # The name of the schema in the target database
target-table = "t_2"           # The name of the target table
```

## テーブルルータの初期化といくつかの例 {#the-initialization-of-table-routers-and-some-examples}

### テーブルルータの初期化 {#the-initialization-of-table-routers}

-   ルール内に`schema.table`という名前の`target-schema/target-table`テーブルが存在する場合、sync-diff-inspector の動作は次のようになります。

    -   `schema.table` ～ `schema.table`に一致するルールがある場合、sync-diff-inspector は何も行いません。
    -   `schema.table`から`schema.table`に一致するルールがない場合、 sync-diff-inspector はテーブル ルーターに新しいルール`schema.table -> _no__exists__db_._no__exists__table_`を追加します。その後、 sync-diff-inspector はテーブル`schema.table`をテーブル`_no__exists__db_._no__exists__table_`として扱います。

-   `target-schema`ルールにのみ存在する場合は次のようになります。

    ```toml
    [routes.rule1]
    schema-pattern = "schema_2"  # the schema to match. Support wildcard characters * and ?
    target-schema = "schema"     # the target schema
    ```

    -   アップストリームにスキーマ`schema`がない場合、sync-diff-inspector は何も実行しません。
    -   アップストリームにスキーマ`schema`があり、ルールがスキーマと一致する場合、sync-diff-inspector は何も行いません。
    -   アップストリームにスキーマ`schema`があるが、スキーマに一致するルールがない場合、sync-diff-inspector はテーブル ルーターに新しいルール`schema -> _no__exists__db_`を追加します。その後、sync-diff-inspector はテーブル`schema`をテーブル`_no__exists__db_`として扱います。

-   ルールに`target-schema.target-table`存在しない場合、テーブル ルーターは大文字と小文字を区別しないため、sync-diff-inspector は`target-schema.target-table`と`target-schema.target-table`を一致させて大文字と小文字を区別しないようにするルールを追加します。

### 例 {#examples}

アップストリーム クラスターに 7 つのテーブルがあるとします。

-   `inspector_mysql_0.tb_emp1`
-   `Inspector_mysql_0.tb_emp1`
-   `inspector_mysql_0.Tb_emp1`
-   `inspector_mysql_1.tb_emp1`
-   `Inspector_mysql_1.tb_emp1`
-   `inspector_mysql_1.Tb_emp1`
-   `Inspector_mysql_1.Tb_emp1`

設定例では、アップストリーム クラスターにはルール`Source.rule1`あり、ターゲット テーブルは`inspector_mysql_1.tb_emp1`です。

#### 例1 {#example-1}

構成が次のようになっている場合:

```toml
[Source.rule1]
schema-pattern = "inspector_mysql_0"
table-pattern = "tb_emp1"
target-schema = "inspector_mysql_1"
target-table = "tb_emp1"
```

ルーティング結果は次のようになります。

-   `inspector_mysql_0.tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `Inspector_mysql_0.tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `inspector_mysql_0.Tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `inspector_mysql_1.tb_emp1` `_no__exists__db_._no__exists__table_`にルーティングされます
-   `Inspector_mysql_1.tb_emp1` `_no__exists__db_._no__exists__table_`にルーティングされます
-   `inspector_mysql_1.Tb_emp1` `_no__exists__db_._no__exists__table_`にルーティングされます
-   `Inspector_mysql_1.Tb_emp1` `_no__exists__db_._no__exists__table_`にルーティングされます

#### 例2 {#example-2}

構成が次のようになっている場合:

```toml
[Source.rule1]
schema-pattern = "inspector_mysql_0"
target-schema = "inspector_mysql_1"
```

ルーティング結果は次のようになります。

-   `inspector_mysql_0.tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `Inspector_mysql_0.tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `inspector_mysql_0.Tb_emp1` `inspector_mysql_1.Tb_emp1`にルーティングされます
-   `inspector_mysql_1.tb_emp1` `_no__exists__db_._no__exists__table_`にルーティングされます
-   `Inspector_mysql_1.tb_emp1` `_no__exists__db_._no__exists__table_`にルーティングされます
-   `inspector_mysql_1.Tb_emp1` `_no__exists__db_._no__exists__table_`にルーティングされます
-   `Inspector_mysql_1.Tb_emp1` `_no__exists__db_._no__exists__table_`にルーティングされます

#### 例3 {#example-3}

構成が次のようになっている場合:

```toml
[Source.rule1]
schema-pattern = "other_schema"
target-schema = "other_schema"
```

ルーティング結果は次のようになります。

-   `inspector_mysql_0.tb_emp1` `inspector_mysql_0.tb_emp1`にルーティングされます
-   `Inspector_mysql_0.tb_emp1` `Inspector_mysql_0.tb_emp1`にルーティングされます
-   `inspector_mysql_0.Tb_emp1` `inspector_mysql_0.Tb_emp1`にルーティングされます
-   `inspector_mysql_1.tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `Inspector_mysql_1.tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `inspector_mysql_1.Tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `Inspector_mysql_1.Tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます

#### 例4 {#example-4}

構成が次のようになっている場合:

```toml
[Source.rule1]
schema-pattern = "inspector_mysql_?"
table-pattern = "tb_emp1"
target-schema = "inspector_mysql_1"
target-table = "tb_emp1"
```

ルーティング結果は次のようになります。

-   `inspector_mysql_0.tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `Inspector_mysql_0.tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `inspector_mysql_0.Tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `inspector_mysql_1.tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `Inspector_mysql_1.tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `inspector_mysql_1.Tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `Inspector_mysql_1.Tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます

#### 例5 {#example-5}

ルールを設定しない場合、ルーティング結果は次のようになります。

-   `inspector_mysql_0.tb_emp1` `inspector_mysql_0.tb_emp1`にルーティングされます
-   `Inspector_mysql_0.tb_emp1` `Inspector_mysql_0.tb_emp1`にルーティングされます
-   `inspector_mysql_0.Tb_emp1` `inspector_mysql_0.Tb_emp1`にルーティングされます
-   `inspector_mysql_1.tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `Inspector_mysql_1.tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `inspector_mysql_1.Tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
-   `Inspector_mysql_1.Tb_emp1` `inspector_mysql_1.tb_emp1`にルーティングされます
