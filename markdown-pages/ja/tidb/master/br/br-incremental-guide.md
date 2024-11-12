---
title: TiDB Incremental Backup and Restore Guide
summary: 増分データは、開始スナップショットと終了スナップショット間の差別化されたデータ、および DDL です。これによりバックアップ ボリュームが削減され、増分バックアップに `tidb_gc_life_time` を設定する必要があります。増分バックアップには `--lastbackupts` を指定した `tiup br backup` を使用し、増分データを復元する前に以前のデータがすべて復元されていることを確認してください。
---

# TiDB 増分バックアップおよび復元ガイド {#tidb-incremental-backup-and-restore-guide}

TiDB クラスターの増分データは、期間の開始スナップショットと終了スナップショット間のデータ、およびこの期間中に生成された DDL を区別したものです。完全 (スナップショット) バックアップ データと比較すると、増分データは小さいため、スナップショット バックアップの補足となり、バックアップ データのボリュームが削減されます。増分バックアップを実行するには、指定された期間内に生成された MVCC データが[TiDB GC メカニズム](/garbage-collection-overview.md)によってガベージ コレクションされないようにします。たとえば、1 時間ごとに増分バックアップを実行するには、 [`tidb_gc_life_time`](/system-variables.md#tidb_gc_life_time-new-in-v50) 1 時間より大きい値に設定する必要があります。

> **警告：**
>
> この機能の開発は停止しています。代わりに[ログバックアップとPITR](/br/br-pitr-guide.md)使用することをお勧めします。

## 増分データをバックアップする {#back-up-incremental-data}

増分データをバックアップするには、**最後のバックアップ タイムスタンプ**`--lastbackupts`を指定して`tiup br backup`コマンドを実行します。このようにして、br コマンドライン ツールは`lastbackupts`から現在の時刻の間に生成された増分データを自動的にバックアップします。9 `--lastbackupts`取得するには、 `validate`コマンドを実行します。次に例を示します。

```shell
LAST_BACKUP_TS=`tiup br validate decode --field="end-version" --storage "s3://backup-101/snapshot-202209081330?access-key=${access-key}&secret-access-key=${secret-access-key}"| tail -n1`
```

次のコマンドは、 `(LAST_BACKUP_TS, current PD timestamp]`からこの期間中に生成された DDL までの増分データをバックアップします。

```shell
tiup br backup full --pd "${PD_IP}:2379" \
--storage "s3://backup-101/snapshot-202209081330/incr?access-key=${access-key}&secret-access-key=${secret-access-key}" \
--lastbackupts ${LAST_BACKUP_TS} \
--ratelimit 128
```

-   `--lastbackupts` : 最後のバックアップのタイムスタンプ。
-   `--ratelimit` : バックアップ タスクを実行する**TiKV あたりの**最大速度 (MiB/秒)。
-   `storage` : バックアップデータのstorageパス。増分バックアップデータは、前回のスナップショットバックアップとは別のパスに保存する必要があります。上記の例では、増分バックアップデータはフルバックアップデータの下の`incr`ディレクトリに保存されます。詳細については、 [外部ストレージサービスの URI 形式](/external-storage-uri.md)を参照してください。

## 増分データを復元する {#restore-incremental-data}

増分データを復元する場合、 `LAST_BACKUP_TS`より前にバックアップされたすべてのデータがターゲット クラスターに復元されていることを確認してください。また、増分復元ではデータが更新されるため、復元中に他の書き込みが行われないようにする必要があります。そうしないと、競合が発生する可能性があります。

次のコマンドは、 `backup-101/snapshot-202209081330`ディレクトリに保存されている完全バックアップ データを復元します。

```shell
tiup br restore full --pd "${PD_IP}:2379" \
--storage "s3://backup-101/snapshot-202209081330?access-key=${access-key}&secret-access-key=${secret-access-key}"
```

次のコマンドは、 `backup-101/snapshot-202209081330/incr`ディレクトリに保存されている増分バックアップ データを復元します。

```shell
tiup br restore full --pd "${PD_IP}:2379" \
--storage "s3://backup-101/snapshot-202209081330/incr?access-key=${access-key}&secret-access-key=${secret-access-key}"
```
