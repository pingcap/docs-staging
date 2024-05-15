---
title: Import Snapshot Files into TiDB Cloud
summary: Learn how to import Amazon Aurora or RDS for MySQL snapshot files into TiDB Cloud.
---

# スナップショットファイルをTiDB Cloudにインポートする {#import-snapshot-files-into-tidb-cloud}

Amazon Auroraまたは RDS for MySQL スナップショット ファイルをTiDB Cloudにインポートできます。3 フォルダ`{db_name}.{table_name}/`の`.parquet`サフィックスを持つすべてのソース データ ファイルは[命名規則](/tidb-cloud/naming-conventions-for-data-import.md)に準拠している必要があることに注意してください。

スナップショット ファイルをインポートするプロセスは、Parquet ファイルをインポートするプロセスと似ています。詳細については、 [Amazon S3 または GCS から Apache Parquet ファイルをTiDB Cloudにインポートする](/tidb-cloud/import-parquet-files.md)を参照してください。
