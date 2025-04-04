---
title: Data Check in the Sharding Scenario
summary: Learn the data check in the sharding scenario.
---

# シャーディング シナリオでのデータ チェック {#data-check-in-the-sharding-scenario}

sync-diff-inspector は、シャーディング シナリオでのデータ チェックをサポートします。 [TiDB データ移行](/dm/dm-overview.md)ツールを使用して複数の MySQL インスタンスから TiDB にデータをレプリケートすると仮定すると、sync-diff-inspector を使用して上流および下流のデータをチェックできます。

アップストリームのシャード テーブルの数が少なく、シャード テーブルの命名規則に次のようなパターンがないシナリオでは、 `Datasource config`を使用して`table-0`を構成し、対応する`rules`を設定して、アップストリーム間のマッピング関係を持つテーブルを構成できます。およびダウンストリーム データベース。この構成方法では、すべてのシャード テーブルを設定する必要があります。

![shard-table-replica-1](https://docs-download.pingcap.com/media/images/docs/shard-table-replica-1.png)

以下は、sync-diff-inspector 構成の完全な例です。

```toml
# Diff Configuration.

######################### Global config #########################

# The number of goroutines created to check data. The number of connections between upstream and downstream databases are slightly greater than this value
check-thread-count = 4

# If enabled, SQL statements is exported to fix inconsistent tables
export-fix-sql = true

# Only compares the table structure instead of the data
check-struct-only = false

######################### Datasource config #########################
[data-sources.mysql1]
    host = "127.0.0.1"
    port = 3306
    user = "root"
    password = ""

    route-rules = ["rule1"]

[data-sources.mysql2]
    host = "127.0.0.1"
    port = 3306
    user = "root"
    password = ""

    route-rules = ["rule2"]

[data-sources.tidb0]
    host = "127.0.0.1"
    port = 4000
    user = "root"
    password = ""

########################### Routes ###########################
[routes.rule1]
schema-pattern = "test"        # Matches the schema name of the data source. Supports the wildcards "*" and "?"
table-pattern = "table-[1-2]"  # Matches the table name of the data source. Supports the wildcards "*" and "?"
target-schema = "test"         # The name of the schema in the target database
target-table = "table-0"       # The name of the target table

[routes.rule2]
schema-pattern = "test"      # Matches the schema name of the data source. Supports the wildcards "*" and "?"
table-pattern = "table-3"    # Matches the table name of the data source. Supports the wildcards "*" and "?"
target-schema = "test"       # The name of the schema in the target database
target-table = "table-0"     # The name of the target table

######################### Task config #########################
[task]
    output-dir = "./output"

    source-instances = ["mysql1", "mysql2"]

    target-instance = "tidb0"

    # The tables of downstream databases to be compared. Each table needs to contain the schema name and the table name, separated by '.'
    target-check-tables = ["test.table-0"]
```

アップストリームのシャード テーブルが多数あり、以下に示すように、すべてのシャード テーブルの命名規則にパターンがある場合は、構成に`table-rules`を使用できます。

![shard-table-replica-2](https://docs-download.pingcap.com/media/images/docs/shard-table-replica-2.png)

以下は、sync-diff-inspector 構成の完全な例です。

```toml
# Diff Configuration.
######################### Global config #########################

# The number of goroutines created to check data. The number of connections between upstream and downstream databases are slightly greater than this value.
check-thread-count = 4

# If enabled, SQL statements is exported to fix inconsistent tables.
export-fix-sql = true

# Only compares the table structure instead of the data.
check-struct-only = false

######################### Datasource config #########################
[data-sources.mysql1]
    host = "127.0.0.1"
    port = 3306
    user = "root"
    password = ""

[data-sources.mysql2]
    host = "127.0.0.1"
    port = 3306
    user = "root"
    password = ""

[data-sources.tidb0]
    host = "127.0.0.1"
    port = 4000
    user = "root"
    password = ""

########################### Routes ###########################
[routes.rule1]
schema-pattern = "test"      # Matches the schema name of the data source. Supports the wildcards "*" and "?"
table-pattern = "table-*"    # Matches the table name of the data source. Supports the wildcards "*" and "?"
target-schema = "test"       # The name of the schema in the target database
target-table = "table-0"     # The name of the target table

######################### Task config #########################
[task]
    output-dir = "./output"
    source-instances = ["mysql1", "mysql2"]

    target-instance = "tidb0"

    # The tables of downstream databases to be compared. Each table needs to contain the schema name and the table name, separated by '.'
    target-check-tables = ["test.table-0"]
```

## ノート {#note}

上流データベースに`test.table-0`が存在する場合、下流データベースもこのテーブルを比較します。
