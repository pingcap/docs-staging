---
title: Precheck Errors, Migration Errors, and Alerts for Data Migration
summary: データ移行を使用するときに、事前チェック エラー、移行エラー、およびアラートを解決する方法を学習します。
---

# データ移行の事前チェックエラー、移行エラー、アラート {#precheck-errors-migration-errors-and-alerts-for-data-migration}

このドキュメントでは、事前チェック エラーを解決し、移行エラーをトラブルシューティングし、 [データ移行を使用してデータを移行する](/tidb-cloud/migrate-from-mysql-using-data-migration.md)の際にアラートをサブスクライブする方法について説明します。

## 事前チェックのエラーと解決策 {#precheck-errors-and-solutions}

このセクションでは、データ移行中の事前チェック エラーと対応する解決策について説明します。これらのエラーは、 [データ移行を使用してデータを移行する](/tidb-cloud/migrate-from-mysql-using-data-migration.md)実行すると**事前チェック**ページに表示されます。

解決策は、アップストリーム データベースによって異なります。

### エラーメッセージ: mysql server_id が 0 より大きいかどうかを確認してください {#error-message-check-whether-mysql-server-id-has-been-greater-than-0}

-   Amazon Aurora MySQL または Amazon RDS: `server_id`がデフォルトで設定されています。設定する必要はありません。完全データ移行と増分データ移行の両方をサポートするために、Amazon Aurora MySQL ライターインスタンスを使用していることを確認してください。
-   MySQL: MySQL 用に`server_id`設定するには、 [レプリケーションソースコンフィグレーションの設定](https://dev.mysql.com/doc/refman/8.0/en/replication-howto-masterbaseconfig.html)参照してください。

### エラーメッセージ: mysql binlogが有効になっているかどうかを確認してください {#error-message-check-whether-mysql-binlog-is-enabled}

-   Amazon Aurora MySQL: [Amazon Aurora MySQL互換クラスターのバイナリログを有効にする方法](https://aws.amazon.com/premiumsupport/knowledge-center/enable-binary-logging-aurora/?nc1=h_ls)を参照してください。完全データ移行と増分データ移行の両方をサポートするために、Amazon Aurora MySQL ライターインスタンスを使用していることを確認します。
-   Amazon RDS: [MySQL バイナリログの設定](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.MySQL.BinaryFormat.html)参照してください。
-   Google Cloud SQL for MySQL: Google は、MySQL マスター データベースのポイントインタイム リカバリによるバイナリ ログ記録を有効にします。1 [ポイントインタイムリカバリを有効にする](https://cloud.google.com/sql/docs/mysql/backup-recovery/pitr#enablingpitr)参照してください。
-   MySQL: [レプリケーションソースコンフィグレーションの設定](https://dev.mysql.com/doc/refman/8.0/en/replication-howto-masterbaseconfig.html)参照してください。

### エラーメッセージ: mysql binlog_format が ROW であるかどうかを確認してください {#error-message-check-whether-mysql-binlog-format-is-row}

-   Amazon Aurora MySQL: [Amazon Aurora MySQL互換クラスターのバイナリログを有効にする方法](https://aws.amazon.com/premiumsupport/knowledge-center/enable-binary-logging-aurora/?nc1=h_ls)を参照してください。完全データ移行と増分データ移行の両方をサポートするために、Amazon Aurora MySQL ライターインスタンスを使用していることを確認します。
-   Amazon RDS: [MySQL バイナリログの設定](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.MySQL.BinaryFormat.html)参照してください。
-   MySQL: `set global binlog_format=ROW;`を実行します。3 [バイナリログ形式の設定](https://dev.mysql.com/doc/refman/8.0/en/binary-log-setting.html)参照してください。

### エラーメッセージ: mysql binlog_row_image が FULL かどうかを確認してください {#error-message-check-whether-mysql-binlog-row-image-is-full}

-   Amazon Aurora MySQL: `binlog_row_image`は設定できません。この事前チェック項目は、これに対しては失敗しません。完全データ移行と増分データ移行の両方をサポートするために、Amazon Aurora MySQL ライターインスタンスを使用していることを確認してください。
-   Amazon RDS: プロセスは`binlog_format`パラメータの設定と似ています。唯一の違いは、変更する必要があるパラメータが`binlog_format`ではなく`binlog_row_image`であることです。7 [MySQL バイナリログの設定](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.MySQL.BinaryFormat.html)参照してください。
-   MySQL: `set global binlog_row_image = FULL;` . [バイナリログのオプションと変数](https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#sysvar_binlog_row_image)を参照してください。

### エラー メッセージ: 移行されたデータベースが binlog_do_db/binlog_ignore_db にあるかどうかを確認してください {#error-message-check-whether-migrated-dbs-are-in-binlog-do-db-binlog-ignore-db}

アップストリーム データベースでbinlog が有効になっていることを確認します。 [mysql binlogが有効になっているかどうかを確認する](#error-message-check-whether-mysql-binlog-is-enabled)を参照してください。その後、表示されるメッセージに従って問題を解決します。

-   メッセージが`These dbs xxx are not in binlog_do_db xxx`に似ている場合は、移行するすべてのデータベースがリストに含まれていることを確認してください。 [--binlog-do-db=データベース名](https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#option_mysqld_binlog-do-db)参照してください。
-   メッセージが`These dbs xxx are in binlog_ignore_db xxx`に似ている場合は、移行するすべてのデータベースが無視リストに含まれていないことを確認してください。 [--binlog-ignore-db=db_name](https://dev.mysql.com/doc/refman/8.0/en/replication-options-binary-log.html#option_mysqld_binlog-ignore-db)を参照してください。

Amazon Aurora MySQL の場合、この事前チェック項目は失敗しません。完全データ移行と増分データ移行の両方をサポートするために、Amazon Aurora MySQL ライターインスタンスを使用していることを確認してください。

Amazon RDS の場合、次のパラメータを変更する必要があります: `replicate-do-db` 、 `replicate-do-table` 、 `replicate-ignore-db` 、および`replicate-ignore-table` 。 [MySQL バイナリログの設定](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.MySQL.BinaryFormat.html)参照してください。

### エラー メッセージ: 接続の同時実行数がデータベースの最大接続制限を超えていないか確認してください {#error-message-check-if-connection-concurrency-exceeds-database-s-maximum-connection-limit}

アップストリーム データベースでエラーが発生した場合は、次のように`max_connections`設定します。

-   Amazon Aurora MySQL: プロセスは`binlog_format`の設定と似ています。唯一の違いは、変更するパラメータが`binlog_format`ではなく`max_connections`であることです。 [Amazon Aurora MySQL互換クラスターのバイナリログを有効にする方法](https://aws.amazon.com/premiumsupport/knowledge-center/enable-binary-logging-aurora/?nc1=h_ls)を参照してください。
-   Amazon RDS: プロセスは`binlog_format`を設定する場合と似ています。唯一の違いは、変更するパラメータが`binlog_format`ではなく`max_connections`であることです。7 [MySQL バイナリログの設定](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.MySQL.BinaryFormat.html)参照してください。
-   MySQL: ドキュメント[最大接続数](https://dev.mysql.com/doc/refman/8.0/en/server-system-variables.html#sysvar_max_connections)に従って`max_connections`設定します。

TiDB Cloudクラスターでエラーが発生した場合は、ドキュメント[最大接続数](https://docs.pingcap.com/tidb/stable/system-variables#max_connections)に従って`max_connections`設定してください。

## 移行エラーと解決策 {#migration-errors-and-solutions}

このセクションでは、移行中に発生する可能性のある問題と解決策について説明します。これらのエラー メッセージは、**移行ジョブの詳細**ページに表示されます。

### エラー メッセージ: 「移行に必要なバイナリ ログがソース データベースに存在しません。移行が成功するまでバイナリ ログ ファイルが十分な時間保持されていることを確認してください。」 {#error-message-the-required-binary-log-for-migration-no-longer-exists-on-the-source-database-please-make-sure-binary-log-files-are-kept-for-long-enough-time-for-migration-to-succeed}

このエラーは、移行するバイナリログがクリーンアップされており、新しいタスクを作成することによってのみ復元できることを意味します。

増分移行に必要なバイナリログが存在することを確認します。バイナリログの期間を延長するには、 `expire_logs_days`を設定することをお勧めします。移行ジョブでバイナリログのクリーンアップが必要な場合は、 `purge binary log`使用しないでください。

### エラー メッセージ: 「指定されたパラメータを使用してソース データベースに接続できませんでした。ソース データベースが起動しており、指定されたパラメータを使用して接続できることを確認してください。」 {#error-message-failed-to-connect-to-the-source-database-using-given-parameters-please-make-sure-the-source-database-is-up-and-can-be-connected-using-the-given-parameters}

このエラーは、ソース データベースへの接続に失敗したことを意味します。ソース データベースが起動しており、指定されたパラメータを使用して接続できるかどうかを確認してください。ソース データベースが使用可能であることを確認したら、 **[再起動] を**クリックしてタスクの回復を試みることができます。

### 移行タスクが中断され、「ドライバー: 不正な接続」または「無効な接続」というエラーが発生します。 {#the-migration-task-is-interrupted-and-contains-the-error-driver-bad-connection-or-invalid-connection}

このエラーは、下流 TiDB クラスターへの接続に失敗したことを意味します。下流 TiDB クラスターが正常な状態 ( `Available`と`Modifying`を含む) にあり、ジョブで指定されたユーザー名とパスワードで接続できるかどうかを確認してください。下流 TiDB クラスターが使用可能であることを確認した後、 **[再起動]**をクリックしてタスクの再開を試みることができます。

### エラー メッセージ: 「指定されたユーザーとパスワードを使用して TiDB クラスターに接続できませんでした。TiDBクラスタが起動しており、指定されたユーザーとパスワードを使用して接続できることを確認してください。」 {#error-message-failed-to-connect-to-the-tidb-cluster-using-the-given-user-and-password-please-make-sure-tidb-cluster-is-up-and-can-be-connected-to-using-the-given-user-and-password}

TiDB クラスターへの接続に失敗しました。TiDB クラスターが正常な状態 ( `Available`および`Modifying`を含む) であるかどうかを確認することをお勧めします。ジョブで指定されたユーザー名とパスワードで接続できます。TiDB クラスターが使用可能であることを確認した後、 **[再起動]**をクリックしてタスクの再開を試みることができます。

### エラー メッセージ:「TiDB クラスターのstorageが不足しています。TiKV のノードstorageを増やしてください。」 {#error-message-tidb-cluster-storage-is-not-enough-please-increase-the-node-storage-of-tikv}

TiDB クラスターのstorageが不足しています。1 [TiKVノードstorageを増やす](/tidb-cloud/scale-tidb-cluster.md#change-storage)実行してから、 **[再起動]**をクリックしてタスクを再開することをお勧めします。

### エラー メッセージ:「ソース データベースへの接続に失敗しました。データベースが使用可能かどうか、または最大接続数に達しているかどうかを確認してください。」 {#error-message-failed-to-connect-to-the-source-database-please-check-whether-the-database-is-available-or-the-maximum-connections-have-been-reached}

ソース データベースへの接続に失敗しました。ソース データベースが起動されているか、データベース接続数が上限に達していないか、ジョブで指定されたパラメータを使用して接続できるかどうかを確認することをお勧めします。ソース データベースが使用可能であることを確認した後、 **[再起動] を**クリックしてジョブの再開を試みることができます。

### エラー メッセージ: 「エラー 1273: 新しい照合順序が有効になっているときにサポートされていない照合順序: &#39;utf8mb4_0900_ai_ci&#39;」 {#error-message-error-1273-unsupported-collation-when-new-collation-is-enabled-utf8mb4-0900-ai-ci}

ダウンストリーム TiDB クラスターでスキーマを作成できませんでした。このエラーは、アップストリーム MySQL で使用される照合順序がTiDB クラスターでサポートされていないことを意味します。

この問題を解決するには、 [サポートされている照合順序](/character-set-and-collation.md#character-sets-and-collations-supported-by-tidb)に基づいて TiDB クラスターにスキーマを作成し、 **「再起動」**をクリックしてタスクを再開します。

## アラート {#alerts}

アラートが発生したときに通知を受け取るために、 TiDB Cloudアラート メールを購読することができます。

以下はデータ移行に関するアラートです。

-   「データ移行ジョブでデータのエクスポート中にエラーが発生しました」

    推奨されるアクション: データ移行ページのエラー メッセージを確認し、ヘルプについては[移行エラーと解決策](#migration-errors-and-solutions)参照してください。

-   「データ移行ジョブでデータのインポート中にエラーが発生しました」

    推奨されるアクション: データ移行ページのエラー メッセージを確認し、ヘルプについては[移行エラーと解決策](#migration-errors-and-solutions)参照してください。

-   「増分データ移行中にデータ移行ジョブでエラーが発生しました」

    推奨されるアクション: データ移行ページのエラー メッセージを確認し、ヘルプについては[移行エラーと解決策](#migration-errors-and-solutions)参照してください。

-   「増分移行中にデータ移行ジョブが 6 時間以上一時停止されました」

    推奨されるアクション: データ移行ジョブを再開するか、このアラートを無視します。

-   「レプリケーション ラグは 10 分を超えており、20 分以上増加し続けています」

    -   推奨されるアクション: [TiDB Cloudサポート](/tidb-cloud/tidb-cloud-support.md)に連絡してサポートを受けてください。

これらのアラートに対処するためにサポートが必要な場合は、 [TiDB Cloudサポート](/tidb-cloud/tidb-cloud-support.md)連絡してご相談ください。

アラートメールの購読方法の詳細については、 [TiDB Cloud組み込みアラート](/tidb-cloud/monitor-built-in-alerting.md)参照してください。

## 参照 {#see-also}

-   [データ移行を使用してMySQL互換データベースをTiDB Cloudに移行する](/tidb-cloud/migrate-from-mysql-using-data-migration.md)
