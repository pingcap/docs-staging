---
title: TiCDC Alert Rules
summary: TiCDC アラート ルールとアラートの処理方法について学習します。
---

# TiCDCアラートルール {#ticdc-alert-rules}

このドキュメントでは、TiCDC アラート ルールと対応するソリューションについて説明します。重大度レベルは、降順で、**重大**、**警告**です。

## 重大なアラート {#critical-alerts}

このセクションでは、重要なアラートと解決策について説明します。

### <code>cdc_checkpoint_high_delay</code> {#code-cdc-checkpoint-high-delay-code}

重大なアラートの場合、異常な監視メトリックに細心の注意を払う必要があります。

-   アラートルール:

    `ticdc_owner_checkpoint_ts_lag > 600`

-   説明：

    レプリケーション タスクが 10 分以上遅延します。

-   解決：

    [TiCDC はレプリケーションの中断を処理します](/ticdc/troubleshoot-ticdc.md#how-do-i-handle-replication-interruptions)参照。

### <code>cdc_resolvedts_high_delay</code> {#code-cdc-resolvedts-high-delay-code}

-   アラートルール:

    `ticdc_owner_resolved_ts_lag > 300`

-   説明：

    レプリケーション タスクの解決された TS が 5 分以上遅延します。

-   解決：

    [TiCDC はレプリケーションの中断を処理します](/ticdc/troubleshoot-ticdc.md#how-do-i-handle-replication-interruptions)参照。

### <code>ticdc_changefeed_failed</code> {#code-ticdc-changefeed-failed-code}

-   アラートルール:

    `(max_over_time(ticdc_owner_status[1m]) == 2) > 0`

-   説明：

    レプリケーション タスクで回復不可能なエラーが発生し、失敗状態になります。

-   解決：

    このアラートはレプリケーションの中断に似ています。 [TiCDC はレプリケーションの中断を処理します](/ticdc/troubleshoot-ticdc.md#how-do-i-handle-replication-interruptions)参照してください。

### <code>ticdc_processor_exit_with_error_count</code> {#code-ticdc-processor-exit-with-error-count-code}

-   アラートルール:

    `changes(ticdc_processor_exit_with_error_count[1m]) > 0`

-   説明：

    レプリケーション タスクはエラーを報告して終了します。

-   解決：

    [TiCDC はレプリケーションの中断を処理します](/ticdc/troubleshoot-ticdc.md#how-do-i-handle-replication-interruptions)参照。

## 警告アラート {#warning-alerts}

警告アラートは、問題またはエラーを通知するものです。

### <code>cdc_multiple_owners</code> {#code-cdc-multiple-owners-code}

-   アラートルール:

    `sum(rate(ticdc_owner_ownership_counter[30s])) >= 2`

-   説明：

    TiCDC クラスターには複数の所有者が存在します。

-   解決：

    根本原因を特定するために TiCDC ログを収集します。

### <code>cdc_sink_flush_duration_time_more_than_10s</code> {#code-cdc-sink-flush-duration-time-more-than-10s-code}

-   アラートルール:

    `histogram_quantile(0.9, rate(ticdc_sink_txn_worker_flush_duration[1m])) > 10`

-   説明：

    レプリケーション タスクでは、ダウンストリーム データベースにデータを書き込むのに 10 秒以上かかります。

-   解決：

    ダウンストリーム データベースに問題がないか確認します。

### <code>cdc_processor_checkpoint_tso_no_change_for_1m</code> {#code-cdc-processor-checkpoint-tso-no-change-for-1m-code}

-   アラートルール:

    `changes(ticdc_processor_checkpoint_ts[1m]) < 1`

-   説明：

    レプリケーション タスクが 1 分以上進行していません。

-   解決：

    [TiCDC はレプリケーションの中断を処理します](/ticdc/troubleshoot-ticdc.md#how-do-i-handle-replication-interruptions)参照。

### <code>ticdc_puller_entry_sorter_sort_bucket</code> {#code-ticdc-puller-entry-sorter-sort-bucket-code}

-   アラートルール:

    `histogram_quantile(0.9, rate(ticdc_puller_entry_sorter_sort_bucket{}[1m])) > 1`

-   説明：

    TiCDC プラー エントリ ソーターの遅延が大きすぎます。

-   解決：

    根本原因を特定するために TiCDC ログを収集します。

### <code>ticdc_puller_entry_sorter_merge_bucket</code> {#code-ticdc-puller-entry-sorter-merge-bucket-code}

-   アラートルール:

    `histogram_quantile(0.9, rate(ticdc_puller_entry_sorter_merge_bucket{}[1m])) > 1`

-   説明：

    TiCDC プラー エントリ ソーター マージの遅延が大きすぎます。

-   解決：

    根本原因を特定するために TiCDC ログを収集します。

### <code>tikv_cdc_min_resolved_ts_no_change_for_1m</code> {#code-tikv-cdc-min-resolved-ts-no-change-for-1m-code}

-   アラートルール:

    `changes(tikv_cdc_min_resolved_ts[1m]) < 1 and ON (instance) tikv_cdc_region_resolve_status{status="resolved"} > 0 and ON (instance) tikv_cdc_captured_region_total > 0`

-   説明：

    TiKV CDC の最小解決 TS 1 は 1 分間進んでいません。

-   解決：

    根本原因を特定するために TiKV ログを収集します。

### <code>tikv_cdc_scan_duration_seconds_more_than_10min</code> {#code-tikv-cdc-scan-duration-seconds-more-than-10min-code}

-   アラートルール:

    `histogram_quantile(0.9, rate(tikv_cdc_scan_duration_seconds_bucket{}[1m])) > 600`

-   説明：

    TiKV CDC モジュールは、増分レプリケーションを 10 分以上スキャンしました。

-   解決：

    根本原因を特定するために、TiCDC 監視メトリックと TiKV ログを収集します。

### <code>ticdc_sink_mysql_execution_error</code> {#code-ticdc-sink-mysql-execution-error-code}

-   アラートルール:

    `changes(ticdc_sink_mysql_execution_error[1m]) > 0`

-   説明：

    レプリケーション タスクがダウンストリーム MySQL にデータを書き込むときにエラーが発生します。

-   解決：

    根本的な原因は多数考えられます。1 [TiCDC のトラブルシューティング](/ticdc/troubleshoot-ticdc.md)参照してください。

### <code>ticdc_memory_abnormal</code> {#code-ticdc-memory-abnormal-code}

-   アラートルール:

    `go_memstats_heap_alloc_bytes{job="ticdc"} > 1e+10`

-   説明：

    TiCDC ヒープメモリ使用量が 10 GiB を超えています。

-   解決：

    根本原因を特定するために TiCDC ログを収集します。
