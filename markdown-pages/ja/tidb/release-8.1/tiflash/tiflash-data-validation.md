---
title: TiFlash Data Validation
summary: TiFlashのデータ検証メカニズムとツールについて学習します。
---

# TiFlashデータ検証 {#tiflash-data-validation}

このドキュメントでは、 TiFlashのデータ検証メカニズムとツールについて説明します。

データの破損は通常、重大なハードウェア障害によって発生します。このような場合、手動でデータを回復しようとしても、データの信頼性は低下します。

データの整合性を確保するために、デフォルトでは、 TiFlash は`City128`アルゴリズムを使用してデータ ファイルに対して基本的なデータ検証を実行します。データ検証に失敗した場合、 TiFlash は直ちにエラーを報告して終了し、不整合なデータによる二次災害を回避します。この時点で、 TiFlashノードを復元する前に、手動で介入してデータを再度複製する必要があります。

v5.4.0 以降、 TiFlashではより高度なデータ検証機能が導入されています。TiFlashはデフォルトで`XXH3`アルゴリズムを使用し、検証フレームとアルゴリズムをカスタマイズできます。

## 検証メカニズム {#validation-mechanism}

検証メカニズムは DeltaTree ファイル (DTFile) に基づいて構築されます。DTFile はTiFlashデータを永続化するstorageファイルです。DTFile には 3 つの形式があります。

| バージョン | 州                         | 検証メカニズム                                                   | ノート                           |
| :---- | :------------------------ | :-------------------------------------------------------- | :---------------------------- |
| V1    | 非推奨                       | ハッシュはデータ ファイルに埋め込まれます。                                    |                               |
| V2    | バージョン 6.0.0 未満のデフォルト      | ハッシュはデータ ファイルに埋め込まれます。                                    | V1 と比較して、V2 では列データの統計が追加されます。 |
| V3    | バージョン &gt;= v6.0.0 のデフォルト | V3 にはメタデータとトークン データ チェックサムが含まれており、複数のハッシュ アルゴリズムをサポートします。 | v5.4.0 の新機能。                  |

DTFile は、データ ファイル ディレクトリの`stable`フォルダーに保存されます。現在有効な形式はすべてフォルダー形式です。つまり、データは`dmf_<file id>`のような名前のフォルダーの下の複数のファイルに保存されます。

### データ検証を使用する {#use-data-validation}

TiFlash は自動と手動の両方のデータ検証をサポートしています。

-   自動データ検証:
    -   v6.0.0 以降のバージョンでは、デフォルトで V3 検証メカニズムが使用されます。
    -   v6.0.0 より前のバージョンでは、デフォルトで V2 検証メカニズムが使用されます。
    -   検証メカニズムを手動で切り替えるには、 [TiFlash構成ファイル](/tiflash/tiflash-configuration.md#configure-the-tiflashtoml-file)を参照してください。ただし、デフォルト構成はテストによって検証されているため、推奨されます。
-   手動データ検証。1 [`DTTool inspect`](/tiflash/tiflash-command-line-flags.md#dttool-inspect)参照してください。

> **警告：**
>
> V3 検証メカニズムを有効にすると、新しく生成された DTFile は、v5.4.0 より前のTiFlashでは直接読み取ることができません。v5.4.0 以降、 TiFlash はV2 と V3 の両方をサポートしており、積極的にバージョンをアップグレードまたはダウングレードすることはありません。既存のファイルのバージョンをアップグレードまたはダウングレードする必要がある場合は、手動で[バージョンを切り替える](/tiflash/tiflash-command-line-flags.md#dttool-migrate)実行する必要があります。

### 検証ツール {#validation-tool}

TiFlashがデータを読み取る際に実行される自動データ検証に加えて、v5.4.0ではデータの整合性を手動でチェックするためのツールが導入されました。詳細については、 [DTツール](/tiflash/tiflash-command-line-flags.md#dttool-inspect)を参照してください。