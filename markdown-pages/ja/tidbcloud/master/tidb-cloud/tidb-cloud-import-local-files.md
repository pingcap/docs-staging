---
title: Import Local Files to TiDB Cloud Serverless
summary: ローカル ファイルをTiDB Cloud Serverless にインポートする方法を学びます。
---

# ローカルファイルをTiDB Cloud Serverless にインポートする {#import-local-files-to-tidb-cloud-serverless}

ローカル ファイルをTiDB Cloud Serverless に直接インポートできます。タスク構成を完了するには数回クリックするだけで、ローカル CSV データが TiDB クラスターにすばやくインポートされます。この方法を使用すると、クラウドstorageと資格情報を提供する必要がありません。インポート プロセス全体が迅速かつスムーズです。

現在、この方法では、1 つのタスクに対して 1 つの CSV ファイルを既存の空のテーブルまたは新しいテーブルにインポートすることがサポートされています。

## 制限事項 {#limitations}

-   現在、 TiDB Cloud は1 つのタスクにつき 250 MiB 以内の CSV 形式のローカル ファイルのインポートのみをサポートしています。
-   ローカル ファイルのインポートは、 TiDB Cloud Serverless クラスターでのみサポートされ、 TiDB Cloud Dedicated クラスターではサポートされません。
-   複数のインポート タスクを同時に実行することはできません。

## ローカルファイルをインポートする {#import-local-files}

1.  ターゲット クラスターの**インポート**ページを開きます。

    1.  [TiDB Cloudコンソール](https://tidbcloud.com/)にログインし、プロジェクトの[**クラスター**](https://tidbcloud.com/console/clusters)ページに移動します。

        > **ヒント：**
        >
        > 複数のプロジェクトがある場合は、<mdsvgicon name="icon-left-projects">左下隅にある をクリックして、別のプロジェクトに切り替えます。</mdsvgicon>

    2.  ターゲット クラスターの名前をクリックして概要ページに移動し、左側のナビゲーション ペインで**[インポート]**をクリックします。

2.  **[インポート]**ページで、ローカル ファイルをアップロード領域に直接ドラッグ アンド ドロップするか、 **[ローカル ファイルのアップロード]**をクリックして対象のローカル ファイルを選択してアップロードすることができます。1 つのタスクにつき 250 MiB 未満の CSV ファイルを 1 つだけアップロードできることに注意してください。ローカル ファイルが 250 MiB より大きい場合は、 [250 MiB を超えるローカル ファイルをインポートするにはどうすればよいでしょうか?](#how-to-import-a-local-file-larger-than-250-mib)参照してください。

3.  **[宛先]**セクションで、ターゲット データベースとターゲット テーブルを選択するか、名前を直接入力して新しいデータベースまたは新しいテーブルを作成します。名前には、ヌル文字`\u0000`と空白文字を除く Unicode BMP (Basic Multilingual Plane) の文字のみを含めることができ、長さは最大 64 文字です。 **[テーブルの定義] を**クリックすると、 **[テーブル定義]**セクションが表示されます。

4.  表を確認してください。

    設定可能なテーブル列のリストが表示されます。各行には、 TiDB Cloudによって推測されたテーブル列名、推測されたテーブル列タイプ、および CSV ファイルからプレビューされたデータが表示されます。

    -   TiDB Cloudの既存のテーブルにデータをインポートすると、テーブル定義から列リストが抽出され、プレビューされたデータが列名によって対応する列にマッピングされます。

    -   新しいテーブルを作成する場合、CSV ファイルから列リストを抽出し、列の型をTiDB Cloudによって推測します。たとえば、プレビューされたデータがすべて整数の場合、推測される列の型は整数になります。

5.  列名とデータ型を構成します。

    CSV ファイルの最初の行に列名が記録されている場合は、デフォルトで選択されている**「最初の行を列名として使用する**」が選択されていることを確認します。

    CSV ファイルに列名用の行がない場合は、 **「最初の行を列名として使用」**を選択しないでください。この場合、次のようになります。

    -   ターゲット テーブルがすでに存在する場合、CSV ファイル内の列が順番にターゲット テーブルにインポートされます。余分な列は切り捨てられ、不足している列にはデフォルト値が設定されます。

    -   TiDB Cloud を使用してターゲット テーブルを作成する必要がある場合は、各列の名前を入力します。列名は次の要件を満たす必要があります。

        -   名前は、ヌル文字`\u0000`と空白文字を除く Unicode BMP の文字で構成されている必要があります。
        -   名前の長さは 65 文字未満にする必要があります。

        必要に応じてデータ型を変更することもできます。

    > **注記：**
    >
    > CSV ファイルをTiDB Cloudの既存のテーブルにインポートし、ターゲット テーブルにソース ファイルよりも多くの列がある場合、状況に応じて余分な列が異なって処理されます。
    >
    > -   追加の列が主キーまたは一意のキーでない場合は、エラーは報告されません。代わりに、これらの追加の列には[デフォルト値](/data-type-default-values.md)入力されます。
    > -   追加の列が主キーまたは一意のキーであり、属性`auto_increment`または`auto_random`持たない場合は、エラーが報告されます。その場合は、次のいずれかの戦略を選択することをお勧めします。
    >     -   これらの主キーまたは一意キー列を含むソース ファイルを提供します。
    >     -   ターゲット テーブルの主キーと一意キーの列を、ソース ファイル内の既存の列と一致するように変更します。
    >     -   主キーまたは一意キー列の属性を`auto_increment`または`auto_random`に設定します。

6.  新しいターゲット テーブルでは、主キーを設定できます。主キーとして列を選択するか、複数の列を選択して複合主キーを作成できます。複合主キーは、列名を選択した順序で形成されます。

    > **注記：**
    >
    > テーブルの主キーはクラスター化インデックスであり、作成後に削除することはできません。

7.  必要に応じて CSV 構成を編集します。

    また、 **「CSV 構成の編集」を**クリックして、バックスラッシュ エスケープ、区切り文字、および区切り文字を構成し、よりきめ細かな制御を行うこともできます。CSV 構成の詳細については、 [データをインポートするための CSV 構成](/tidb-cloud/csv-config-for-import-data.md)参照してください。

8.  **[インポートの開始]を**クリックします。

    **インポート タスクの詳細**ページでインポートの進行状況を確認できます。警告や失敗したタスクがある場合は、詳細を確認して解決できます。

9.  インポート タスクが完了したら、 **[SQL エディターでデータを**探索] をクリックして、インポートしたデータを照会できます。SQL エディターの使用方法の詳細については、 [AI支援SQLエディターでデータを探索](/tidb-cloud/explore-data-with-chat2query.md)参照してください。

10. **[インポート]**ページで、 **[アクション**] 列の**[...** ] &gt; **[ビュー]**をクリックして、インポート タスクの詳細を確認できます。

## FAQ {#faq}

### TiDB Cloudのインポート機能を使用して、指定した列のみをインポートできますか? {#can-i-only-import-some-specified-columns-by-the-import-feature-in-tidb-cloud}

いいえ。現在、インポート機能を使用する場合、CSV ファイルのすべての列を既存のテーブルにインポートすることしかできません。

指定した列のみをインポートするには、MySQL クライアントを使用して TiDB クラスターに接続し、 [`LOAD DATA`](https://docs.pingcap.com/tidb/stable/sql-statement-load-data)使用してインポートする列を指定します。例:

```sql
CREATE TABLE `import_test` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `address` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
LOAD DATA LOCAL INFILE 'load.txt' INTO TABLE import_test FIELDS TERMINATED BY ',' (name, address);
```

`mysql`使用していて`ERROR 2068 (HY000): LOAD DATA LOCAL INFILE file request rejected due to restrictions on access.`遭遇した場合は、接続文字列に`--local-infile=true`追加できます。

### TiDB Cloudにデータをインポートした後、予約キーワードを含む列をクエリできないのはなぜですか? {#why-can-t-i-query-a-column-with-a-reserved-keyword-after-importing-data-into-tidb-cloud}

列名が TiDB で予約済みの[キーワード](/keywords.md)である場合、列をクエリするときに、列名を囲むためにバッククォート`` ` ``追加する必要があります。たとえば、列名が`order`場合、 `` `order` ``を使用して列をクエリする必要があります。

### 250 MiB を超えるローカル ファイルをインポートするにはどうすればよいでしょうか? {#how-to-import-a-local-file-larger-than-250-mib}

ファイルが 250 MiB より大きい場合は、 [TiDB CloudCLI](/tidb-cloud/get-started-with-cli.md)使用してファイルをインポートできます。詳細については、 [`ticloud serverless import start`](/tidb-cloud/ticloud-import-start.md)参照してください。

あるいは、 `split [-l ${line_count}]`ユーティリティを使用して、複数の小さなファイルに分割することもできます (Linux または macOS のみ)。たとえば、 `split -l 100000 tidb-01.csv small_files`実行すると、 `tidb-01.csv`という名前のファイルが行の長さ`100000`で分割され、分割されたファイルの名前は`small_files${suffix}`なります。その後、これらの小さなファイルを 1 つずつTiDB Cloudにインポートできます。

次のスクリプトを参照してください。

```bash
#!/bin/bash
n=$1
file_path=$2
file_extension="${file_path##*.}"
file_name="${file_path%.*}"
total_lines=$(wc -l < $file_path)
lines_per_file=$(( (total_lines + n - 1) / n ))
split -d -a 1 -l $lines_per_file $file_path $file_name.
for (( i=0; i<$n; i++ ))
do
    mv $file_name.$i $file_name.$i.$file_extension
done
```

`n`とファイル名を入力してスクリプトを実行します。スクリプトは元のファイル拡張子を維持しながらファイルを`n`均等な部分に分割します。例:

```bash
> sh ./split.sh 3 mytest.customer.csv
> ls -h | grep mytest
mytest.customer.0.csv
mytest.customer.1.csv
mytest.customer.2.csv
mytest.customer.csv
```
