---
title: Migration and Import Overview
summary: Learn an overview of data migration and import scenarios for TiDB Cloud.
aliases: ['/tidbcloud/export-data-from-tidb-cloud']
---

# Migration and Import Overview

You can migrate data from a wide variety of data sources to TiDB Cloud. This document gives an overview of the data migration scenarios.

## Migrate data from MySQL-Compatible databases

When you migrate data from a MySQL-compatible database, you can perform full data migration and incremental data migration. The migration scenarios and methods are as follows:

- Migrate MySQL-compatible databases using Data Migration

    TiDB is highly compatible with MySQL. You can use Data Migration in the TiDB Cloud console to migrate data from any MySQL-compatible databases to TiDB Cloud smoothly. For more information, see [Migrate MySQL-Compatible Databases to TiDB Cloud Using Data Migration](/tidb-cloud/migrate-from-mysql-using-data-migration.md).

- Migrate using AWS DMS

    If you want to migrate heterogeneous databases, such as PostgreSQL, Oracle, and SQL Server to TiDB Cloud, it is recommended to use AWS Database Migration Service (AWS DMS).

    - [Migrate from MySQL-Compatible Databases to TiDB Cloud Using AWS DMS](/tidb-cloud/migrate-from-mysql-using-aws-dms.md)
    - [Migrate from Amazon RDS for Oracle Using AWS DMS](/tidb-cloud/migrate-from-oracle-using-aws-dms.md)

- Migrate and merge MySQL shards

    If your application uses MySQL shards for data storage, you can migrate these shards into TiDB Cloud as one table. For more information, see [Migrate and Merge MySQL Shards of Large Datasets to TiDB Cloud](/tidb-cloud/migrate-sql-shards.md).

- Migrate from TiDB Self-Managed

    You can migrate data from your TiDB Self-Managed clusters to TiDB Cloud (AWS) through Dumpling and TiCDC. For more information, see [Migrate from TiDB Self-Managed to TiDB Cloud](/tidb-cloud/migrate-from-op-tidb.md).

## Import data from files to TiDB Cloud

If you have data files in SQL, CSV, Parquet, or Aurora Snapshot formats, you can import these files to TiDB Cloud in one go. The import scenarios and methods are as follows:

- Import a local CSV file to TiDB Cloud

    You can import a local CSV file to TiDB Cloud. For more information, see [Import Local Files to TiDB Cloud](/tidb-cloud/tidb-cloud-import-local-files.md).

- Import sample data (SQL file) to TiDB Cloud

    You can import sample data (SQL file) to TiDB Cloud to quickly get familiar with the TiDB Cloud interface and the import process. For more information, see [Import Sample Data to TiDB Cloud Serverless](/tidb-cloud/import-sample-data-serverless.md) and [Import Sample Data to TiDB Cloud Dedicated](/tidb-cloud/import-sample-data.md).

- Import CSV files from Amazon S3, Google Cloud Storage (GCS), or Azure Blob Storage into TiDB Cloud

    You can import CSV files from Amazon S3, Google Cloud Storage (GCS), or Azure Blob Storage into TiDB Cloud. For more information, see [Import CSV Files from Cloud Storage into TiDB Cloud Serverless](/tidb-cloud/import-csv-files-serverless.md) and [Import CSV Files from Cloud Storage into TiDB Cloud Dedicated](/tidb-cloud/import-csv-files.md).

- Import Apache Parquet files from Amazon S3, Google Cloud Storage (GCS), or Azure Blob Storage into TiDB Cloud

    You can import Parquet files from Amazon S3, Google Cloud Storage (GCS), or Azure Blob Storage into TiDB Cloud. For more information, see [Import Apache Parquet Files from Cloud Storage into TiDB Cloud Serverless](/tidb-cloud/import-parquet-files-serverless.md) and [Import Apache Parquet Files from Cloud Storage into TiDB Cloud Dedicated](/tidb-cloud/import-parquet-files.md).

## Reference

### Configure cloud storage access

If your source data is stored in Amazon S3, Google Cloud Storage (GCS) buckets, or Azure Blob Storage containers, before importing or migrating the data to TiDB Cloud, you need to configure access to the storage. For more information, see [Configure External Storage Access for TiDB Cloud Serverless](/tidb-cloud/serverless-external-storage.md) and [Configure External Storage Access for TiDB Cloud Dedicated](/tidb-cloud/dedicated-external-storage.md).

### Naming conventions for data import

To make sure that your data can be imported successfully, you need to prepare schema files and data files that conform to the naming conventions. For more information, see [Naming Conventions for Data Import](/tidb-cloud/naming-conventions-for-data-import.md).

### Troubleshoot access denied errors during data import from Amazon S3

You can troubleshoot access denied errors that might occur when you import data from Amazon S3 into TiDB Cloud. For more information, see [Troubleshoot Access Denied Errors during Data Import from Amazon S3](/tidb-cloud/troubleshoot-import-access-denied-error.md).
