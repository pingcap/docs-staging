---
title: CSV Configurations for Importing Data
summary: TiDB Cloud上のデータのインポートサービスのCSV構成を紹介します。CSVコンフィグレーションウィンドウでは、セパレータ、デリミタ、ヘッダー付き、バックスラッシュのエスケープの設定が可能です。セパレータはフィールド区切り文字を定義し、デリミタは引用符で使用する区切り文字を定義します。ヘッダー付きはCSVファイルにヘッダー行が含まれているかどうかを指定し、バックスラッシュのエスケープはフィールド内のバックスラッシュをエスケープ文字として解析するかどうかを定義します。
---

# データをインポートするための CSV 構成 {#csv-configurations-for-importing-data}

このドキュメントでは、 TiDB Cloud上のデータのインポート サービスの CSV 構成を紹介します。

以下は、 TiDB Cloud上のデータインポートサービスを使用して CSV ファイルをインポートするときの CSVコンフィグレーションウィンドウです。詳細については、 [Amazon S3 または GCS からTiDB Cloudに CSV ファイルをインポート](/tidb-cloud/import-csv-files.md)を参照してください。

![CSV Configurations](https://download.pingcap.com/images/docs/tidb-cloud/import-data-csv-config.png)

## セパレータ {#separator}

-   定義: フィールド区切り文字を定義します。 1 つまたは複数の文字を指定できますが、空であってはなりません。

-   一般的な値:

    -   CSV (カンマ区切り値) の場合は`,` 。上のスクリーンショットに示されているように、「1」、「Michael」、および「male」は 3 つのフィールドを表します。
    -   TSV の場合は`"\t"` (タブ区切り値)。

-   デフォルト: `,`

## デリミタ {#delimiter}

-   定義: 引用符で使用する区切り文字を定義します。 **Delimiter**が空の場合、すべてのフィールドは引用符で囲まれません。

-   一般的な値:

    -   `'"'`フィールドを二重引用符で囲みます。上のスクリーンショットに示されているように、 `"Michael","male"` 2 つのフィールドを表します。 2 つのフィールドの間には`,`が必要であることに注意してください。データが`"Michael""male"` ( `,`を除く) の場合、インポート タスクは解析に失敗します。データが`"Michael,male"` (二重引用符が 1 つだけある) の場合、1 つのフィールドとして解析されます。
    -   `''`引用を無効にします。

-   デフォルト: `"`

## ヘッダー付き {#with-header}

-   定義:*すべての*CSV ファイルにヘッダー行が含まれているかどうか。 **With header**が`True`の場合、最初の行が列名として使用されます。 **With header**が`False`の場合、最初の行は通常のデータ行として扱われます。

-   デフォルト: `True`

## バックスラッシュのエスケープ {#backslash-escape}

-   定義: フィールド内のバックスラッシュをエスケープ文字として解析するかどうか。**バックスラッシュ エスケープ**が`True`の場合、次のシーケンスが認識されて変換されます。

    | シーケンス | に変換                      |
    | ----- | ------------------------ |
    | `\0`  | ヌル文字 ( `U+0000` )        |
    | `\b`  | バックスペース ( `U+0008` )     |
    | `\n`  | 改行 ( `U+000A` )          |
    | `\r`  | キャリッジリターン ( `U+000D` )   |
    | `\t`  | タブ ( `U+0009` )          |
    | `\Z`  | Windows EOF ( `U+001A` ) |

    他のすべての場合 (たとえば、 `\"` )、バックスラッシュは取り除かれ、次の文字 ( `"` ) がフィールドに残ります。左側の文字には特別な役割 (デリミタなど) はなく、単なる通常の文字です。引用符は、バックスラッシュがエスケープ文字として解析されるかどうかには影響しません。

    次のフィールドを例として取り上げます。

    -   値が`True`の場合、 `"nick name is \"Mike\""` `nick name is "Mike"`として解析され、ターゲット テーブルに書き込まれます。
    -   値が`False`の場合、値は`"nick name is \"` 、 `Mike\` 、および`""`の 3 つのフィールドとして解析されます。ただし、フィールドが互いに分離されていないため、正しく解析できません。

    標準の CSV ファイルの場合、記録するフィールドに二重引用符で囲まれた文字がある場合は、二重引用符を 2 つ使用してエスケープする必要があります。この場合、 `Backslash escape = True`を使用すると解析エラーが発生しますが、 `Backslash escape = False`使用すると正しく解析されます。一般的なシナリオは、インポートされたフィールドに JSON コンテンツが含まれている場合です。標準の CSV JSON フィールドは通常、次のように保存されます。

    `"{""key1"":""val1"", ""key2"": ""val2""}"`

    この場合、 `Backslash escape = False`設定すると、次のようにフィールドがデータベースに正しくエスケープされます。

    `{"key1": "val1", "key2": "val2"}`

    以下のようにCSVソースファイルの内容をJSONとして保存する場合は、以下のように設定`Backslash escape = True`を検討してください。ただし、これは CSV の標準形式ではありません。

    `"{\"key1\": \"val1\", \"key2\":\"val2\" }"`

-   デフォルト: `True`
