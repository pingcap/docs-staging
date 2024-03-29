---
title: TiDB 2.0.2 Release Notes
summary: TiDB 2.0.2 was released on May 21, 2018, with improvements in system stability. The release includes fixes for Decimal division expression, support for `USE INDEX` syntax in `Delete` statement, and timeout mechanism for writing Binlog in TiDB. PD now filters disconnected nodes in balance leader scheduler, modifies transfer leader operator timeout, and fixes scheduling issues. TiKV fixes Raft log printing, supports configuring gRPC parameters, leader election timeout range, and resolves snapshot intermediate file deletion issue.
---

# TiDB 2.0.2 Release Notes

On May 21, 2018, TiDB 2.0.2 is released. Compared with TiDB 2.0.1, this release has great improvement in system stability.

## TiDB

- Fix the issue of pushing down the Decimal division expression
- Support using the `USE INDEX` syntax in the `Delete` statement
- Forbid using the `shard_row_id_bits` feature in columns with `Auto-Increment`
- Add the timeout mechanism for writing Binlog

## PD

- Make the balance leader scheduler filter the disconnected nodes
- Modify the timeout of the transfer leader operator to 10s
- Fix the issue that the label scheduler does not schedule when the cluster Regions are in an unhealthy state
- Fix the improper scheduling issue of `evict leader scheduler`

## TiKV

- Fix the issue that the Raft log is not printed
- Support configuring more gRPC related parameters
- Support configuring the timeout range of leader election
- Fix the issue that the obsolete learner is not deleted
- Fix the issue that the snapshot intermediate file is mistakenly deleted