---
title: Changefeed Overview
summary: Learn basic concepts, state definitions, and state transfer of changefeeds.
---

# Changefeed Overview

A changefeed is a replication task in TiCDC, which replicates the data change logs of specified tables in a TiDB cluster to the designated downstream. You can run and manage multiple changefeeds in a TiCDC cluster.

## Changefeed state transfer

The state of a replication task represents the running status of the replication task. During the running of TiCDC, replication tasks might fail with errors, be manually paused, resumed, or reach the specified `TargetTs`. These behaviors can lead to the change of the replication task state. This section describes the states of TiCDC replication tasks and the transfer relationships between states.

![TiCDC state transfer](https://docs-download.pingcap.com/media/images/docs/ticdc/ticdc-changefeed-state-transfer.png)

The states in the preceding state transfer diagram are described as follows:

- `Normal`: The replication task runs normally and the checkpoint-ts proceeds normally.
- `Stopped`: The replication task is stopped, because the user manually pauses the changefeed. The changefeed in this state blocks GC operations.
- `Warning`: The replication task returns an error. The replication cannot continue due to some recoverable errors. The changefeed in this state keeps trying to resume until the state transfers to `Normal`. The maximum retry time is 30 minutes. If it exceeds this time, the changefeed enters a failed state. The changefeed in this state blocks GC operations.
- `Finished`: The replication task is finished and has reached the preset `TargetTs`. The changefeed in this state does not block GC operations.
- `Failed`: The replication task fails. The changefeed in this state does not keep trying to resume. To give you enough time to handle the failure, the changefeed in this state blocks GC operations. The duration of the blockage is specified by the `gc-ttl` parameter, with a default value of 24 hours. For v7.1.1 and later v7.1 patch versions, if the underlying issue is resolved within this duration, you can manually resume the changefeed. Otherwise, if the changefeed remains in this state beyond the `gc-ttl` duration, the replication task cannot resume and cannot be recovered.

> **Note:**
>
> If the changefeed encounters errors with error codes `ErrGCTTLExceeded`, `ErrSnapshotLostByGC`, or `ErrStartTsBeforeGC`, it does not block GC operations.

The numbers in the preceding state transfer diagram are described as follows.

- ① Run the `changefeed pause` command.
- ② Run the `changefeed resume` command to resume the replication task.
- ③ Recoverable errors occur during the `changefeed` operation, and the operation is retried automatically.
- ④ The changefeed automatic retry succeeds, and `checkpoint-ts` continues to advance.
- ⑤ The changefeed automatic retry exceeds 30 minutes and fails. The changefeed enters the failed state. At this time, the changefeed continues to block upstream GC for a duration specified by `gc-ttl`.
- ⑥ The changefeed encounters an unrecoverable error and directly enters the failed state. At this time, the changefeed continues to block upstream GC for a duration specified by `gc-ttl`.
- ⑦ The replication progress of the changefeed reaches the value set by `target-ts`, and the replication is completed.
- ⑧ The changefeed has been suspended for a duration longer than the value specified by `gc-ttl`, thus encountering GC advancement errors, and cannot be resumed.
- ⑨ For v7.1.1 and later v7.1 patch versions, if the cause of the failure has been resolved, and the changefeed was suspended for a duration shorter than the value specified by `gc-ttl`, run the `changefeed resume` command to resume the replication task.

## Operate changefeeds

You can manage a TiCDC cluster and its replication tasks using the command-line tool `cdc cli`. For details, see [Manage TiCDC changefeeds](/ticdc/ticdc-manage-changefeed.md).

You can also use the HTTP interface (the TiCDC OpenAPI feature) to manage a TiCDC cluster and its replication tasks. For details, see [TiCDC OpenAPI](/ticdc/ticdc-open-api.md).

If your TiCDC is deployed using TiUP, you can start `cdc cli` by running the `tiup ctl:v<CLUSTER_VERSION> cdc` command. Replace `v<CLUSTER_VERSION>` with the TiCDC cluster version, such as `v7.1.5`. You can also run `cdc cli` directly.
