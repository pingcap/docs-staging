---
title: Upgrade and After Upgrade FAQs
summary: Learn about some FAQs and the solutions during and after upgrading TiDB.
---

# アップグレードおよびアップグレード後の FAQ {#upgrade-and-after-upgrade-faqs}

このドキュメントでは、TiDB のアップグレード時またはアップグレード後に、いくつかの FAQ とその解決方法を紹介します。

## アップグレードに関するよくある質問 {#upgrade-faqs}

このセクションでは、TiDB をアップグレードする際のいくつかの FAQ とその解決方法をリストします。

### ローリング更新の影響は何ですか? {#what-are-the-effects-of-rolling-updates}

ローリング アップデートを TiDB サービスに適用すると、実行中のアプリケーションはさまざまな程度の影響を受けます。したがって、ビジネスのピーク時にローリング更新を実行することはお勧めしません。最小のクラスター トポロジ (TiDB * 2、PD * 3、TiKV * 3) を構成する必要があります。 PumpまたはDrainerサービスがクラスターに含まれている場合は、ローリング更新の前にDrainerを停止することをお勧めします。 TiDB をアップグレードすると、 Pumpもアップグレードされます。

### DDL の実行中に TiDB クラスターをアップグレードできますか? {#can-i-upgrade-the-tidb-cluster-during-the-ddl-execution}

DDL ステートメントがクラスターで実行されているときは、TiDB クラスターをアップグレード**しないでください**(通常、 `ADD INDEX`のような時間のかかる DDL ステートメントや列の型の変更のため)。

アップグレードの前に、 [`ADMIN SHOW DDL`](/sql-statements/sql-statement-admin-show-ddl.md)コマンドを使用して、TiDB クラスターに進行中の DDL ジョブがあるかどうかを確認することをお勧めします。クラスターに DDL ジョブがある場合、クラスターをアップグレードするには、DDL の実行が完了するまで待つか、 [`ADMIN CANCEL DDL`](/sql-statements/sql-statement-admin-cancel-ddl.md)コマンドを使用して DDL ジョブをキャンセルしてからクラスターをアップグレードします。

また、クラスターのアップグレード中は、DDL ステートメントを実行し**ないでください**。そうしないと、未定義の動作の問題が発生する可能性があります。

### バイナリを使用して TiDB をアップグレードするには? {#how-to-upgrade-tidb-using-the-binary}

バイナリを使用して TiDB をアップグレードすることはお勧めしません。代わりに、バージョンの一貫性と互換性の両方を保証する[TiUPを使用して TiDB をアップグレードする](/upgrade-tidb-using-tiup.md)または[Kubernetes で TiDB クラスターをアップグレードする](https://docs.pingcap.com/tidb-in-kubernetes/stable/upgrade-a-tidb-cluster)にすることをお勧めします。

## アップグレード後のよくある質問 {#after-upgrade-faqs}

このセクションでは、TiDB をアップグレードした後のいくつかの FAQ とその解決策をリストします。

### DDL 操作の実行時の文字セット (charset) エラー {#the-character-set-charset-errors-when-executing-ddl-operations}

v2.1.0 以前のバージョン (v2.0 のすべてのバージョンを含む) では、TiDB の文字セットはデフォルトで UTF-8 です。ただし、v2.1.1 から、デフォルトの文字セットが UTF8MB4 に変更されました。

v2.1.0 以前のバージョンで新しく作成されたテーブルの文字セットを UTF-8 として明示的に指定すると、TiDB を v2.1.1 にアップグレードした後に DDL 操作の実行に失敗する可能性があります。

この問題を回避するには、次のことに注意する必要があります。

-   v2.1.3 より前では、TiDB は列の文字セットの変更をサポートしていません。したがって、DDL 操作を実行するときは、新しい列の文字セットが元の列の文字セットと一致していることを確認する必要があります。

-   v2.1.3 より前では、列の文字セットがテーブルの文字セットと異なっていても、 `show create table`は列の文字セットを示しません。ただし、次の例に示すように、HTTP API を介してテーブルのメタデータを取得することで表示できます。

#### <code>unsupported modify column charset utf8mb4 not match origin utf8</code> {#code-unsupported-modify-column-charset-utf8mb4-not-match-origin-utf8-code}

-   v2.1.0以前のバージョンでは、バージョンアップ前に以下の操作を実施しています。

    
    ```sql
    create table t(a varchar(10)) charset=utf8;
    ```

    ```
    Query OK, 0 rows affected
    Time: 0.106s
    ```

    
    ```sql
    show create table t;
    ```

    ```
    +-------+-------------------------------------------------------+
    | Table | Create Table                                          |
    +-------+-------------------------------------------------------+
    | t     | CREATE TABLE `t` (                                    |
    |       |   `a` varchar(10) DEFAULT NULL                        |
    |       | ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin |
    +-------+-------------------------------------------------------+
    1 row in set
    Time: 0.006s
    ```

-   アップグレード後、v2.1.1 および v2.1.2 では以下のエラーが報告されていますが、v2.1.3 以降ではそのようなエラーは発生していません。

    
    ```sql
    alter table t change column a a varchar(20);
    ```

    ```
    ERROR 1105 (HY000): unsupported modify column charset utf8mb4 not match origin utf8
    ```

解決：

元の文字セットと同じように、列の文字セットを明示的に指定できます。


```sql
alter table t change column a a varchar(22) character set utf8;
```

-   ポイント 1 によると、列の文字セットを指定しない場合、デフォルトで UTF8MB4 が使用されるため、元の列の文字セットと一致するように列の文字セットを指定する必要があります。

-   ポイント 2 に従って、HTTP API を介してテーブルのメタデータを取得し、列名とキーワード「Charset」を検索することで列の charset を見つけることができます。

    
    ```sh
    curl "http://$IP:10080/schema/test/t" | python -m json.tool
    ```

    ここでは Python ツールを使用して JSON をフォーマットしますが、これは必須ではなく、コメントを追加するためだけに便利です。

    ```json
    {
        "ShardRowIDBits": 0,
        "auto_inc_id": 0,
        "charset": "utf8",   # The charset of the table.
        "collate": "",
        "cols": [            # The relevant information about the columns.
            {
                ...
                "id": 1,
                "name": {
                    "L": "a",
                    "O": "a"   # The column name.
                },
                "offset": 0,
                "origin_default": null,
                "state": 5,
                "type": {
                    "Charset": "utf8",   # The charset of column a.
                    "Collate": "utf8_bin",
                    "Decimal": 0,
                    "Elems": null,
                    "Flag": 0,
                    "Flen": 10,
                    "Tp": 15
                }
            }
        ],
        ...
    }
    ```

#### <code>unsupported modify charset from utf8mb4 to utf8</code> {#code-unsupported-modify-charset-from-utf8mb4-to-utf8-code}

-   アップグレード前に、v2.1.1 と v2.1.2 で以下の操作を実行します。

    
    ```sql
    create table t(a varchar(10)) charset=utf8;
    ```

    ```
    Query OK, 0 rows affected
    Time: 0.109s
    ```

    
    ```sql
    show create table t;
    ```

    ```
    +-------+-------------------------------------------------------+
    | Table | Create Table                                          |
    +-------+-------------------------------------------------------+
    | t     | CREATE TABLE `t` (                                    |
    |       |   `a` varchar(10) DEFAULT NULL                        |
    |       | ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin |
    +-------+-------------------------------------------------------+
    ```

    上記の例では、 `show create table`テーブルの文字セットのみを示していますが、実際には列の文字セットは UTF8MB4 であり、HTTP API を介してスキーマを取得することで確認できます。ただし、新しいテーブルが作成された場合、列の文字セットはテーブルの文字セットと一致している必要があります。このバグは v2.1.3 で修正されています。

-   バージョンアップ後、v2.1.3以降では以下の操作を行います。

    
    ```sql
    show create table t;
    ```

    ```
    +-------+--------------------------------------------------------------------+
    | Table | Create Table                                                       |
    +-------+--------------------------------------------------------------------+
    | t     | CREATE TABLE `t` (                                                 |
    |       |   `a` varchar(10) CHARSET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL |
    |       | ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin              |
    +-------+--------------------------------------------------------------------+
    1 row in set
    Time: 0.007s
    ```

    
    ```sql
    alter table t change column a a varchar(20);
    ```

    ```
    ERROR 1105 (HY000): unsupported modify charset from utf8mb4 to utf8
    ```

解決：

-   v2.1.3 以降、TiDB は列とテーブルの文字セットの変更をサポートしているため、テーブルの文字セットを UTF8MB4 に変更することをお勧めします。

    
    ```sql
    alter table t convert to character set utf8mb4;
    ```

-   問題 1 で行ったように、列の文字セットを指定して、元の列の文字セット (UTF8MB4) との一貫性を保つこともできます。

    
    ```sql
    alter table t change column a a varchar(20) character set utf8mb4;
    ```

#### <code>ERROR 1366 (HY000): incorrect utf8 value f09f8c80(🌀) for column a</code> {#code-error-1366-hy000-incorrect-utf8-value-f09f8c80-for-column-a-code}

TiDB v2.1.1 以前のバージョンでは、文字セットが UTF-8 の場合、挿入された 4 バイト データに対する UTF-8 Unicode エンコーディング チェックは行われません。ただし、v2.1.2 以降のバージョンでは、このチェックが追加されています。

-   v2.1.1以前のバージョンでは、バージョンアップ前に以下の操作を実施しています。

    
    ```sql
    create table t(a varchar(100) charset utf8);
    ```

    ```
    Query OK, 0 rows affected
    ```

    
    ```sql
    insert t values (unhex('f09f8c80'));
    ```

    ```
    Query OK, 1 row affected
    ```

-   アップグレード後、v2.1.2 以降のバージョンで次のエラーが報告されます。

    
    ```sql
    insert t values (unhex('f09f8c80'));
    ```

    ```
    ERROR 1366 (HY000): incorrect utf8 value f09f8c80(🌀) for column a
    ```

解決：

-   v2.1.2: このバージョンは列の文字セットの変更をサポートしていないため、UTF-8 チェックをスキップする必要があります。

    
    ```sql
    set @@session.tidb_skip_utf8_check=1;
    ```

    ```
    Query OK, 0 rows affected
    ```

    
    ```sql
    insert t values (unhex('f09f8c80'));
    ```

    ```
    Query OK, 1 row affected
    ```

-   v2.1.3 以降のバージョンでは、列の文字セットを UTF8MB4 に変更することをお勧めします。または、 `tidb_skip_utf8_check`を設定して UTF-8 チェックをスキップすることもできます。ただし、チェックをスキップすると、MySQL がチェックを実行するため、TiDB から MySQL へのデータの複製に失敗する可能性があります。

    
    ```sql
    alter table t change column a a varchar(100) character set utf8mb4;
    ```

    ```
    Query OK, 0 rows affected
    ```

    
    ```sql
    insert t values (unhex('f09f8c80'));
    ```

    ```
    Query OK, 1 row affected
    ```

    具体的には、変数`tidb_skip_utf8_check`を使用して、データに対する有効な UTF-8 および UTF8MB4 チェックをスキップできます。ただし、チェックをスキップすると、MySQL がチェックを実行するため、TiDB から MySQL へのデータの複製に失敗する可能性があります。

    UTF-8 チェックのみをスキップする場合は、 `tidb_check_mb4_value_in_utf8`を設定できます。この変数は v2.1.3 で`config.toml`ファイルに追加され、構成ファイルで`check-mb4-value-in-utf8`を変更してから、クラスターを再起動して有効にすることができます。

    v2.1.5 以降では、HTTP API とセッション変数を使用して`tidb_check_mb4_value_in_utf8`を設定できます。

    -   HTTP API（HTTP API は 1 つのサーバーでのみ有効にできます）

        -   HTTP API を有効にするには:

            
            ```sh
            curl -X POST -d "check_mb4_value_in_utf8=1" http://{TiDBIP}:10080/settings
            ```

        -   HTTP API を無効にするには:

            
            ```sh
            curl -X POST -d "check_mb4_value_in_utf8=0" http://{TiDBIP}:10080/settings
            ```

    -   セッション変数

        -   セッション変数を有効にするには:

            
            ```sql
            set @@session.tidb_check_mb4_value_in_utf8 = 1;
            ```

        -   セッション変数を無効にするには:

            
            ```sql
            set @@session.tidb_check_mb4_value_in_utf8 = 0;
            ```
