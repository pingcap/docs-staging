---
title: TiDB 2.1.2 Release Notes
summary: TiDB 2.1.2 and TiDB Ansible 2.1.2 were released on December 22, 2018. The release includes improvements in system compatibility and stability. Key updates include compatibility with TiDB Binlog of the Kafka version, improved exit mechanism during rolling updates, and fixes for various issues. PD and TiKV also received updates, such as fixing Region merge issues and support for configuration format in the unit of 'DAY'. Additionally, TiDB Lightning and TiDB Binlog were updated to support new features and eliminate bottlenecks.
---

# TiDB 2.1.2 Release Notes

On December 22, 2018, TiDB 2.1.2 is released. The corresponding TiDB Ansible 2.1.2 is also released. Compared with TiDB 2.1.1, this release has great improvement in system compatibility and stability.

## TiDB

- Make TiDB compatible with TiDB Binlog of the Kafka version [#8747](https://github.com/pingcap/tidb/pull/8747)
- Improve the exit mechanism of TiDB in a rolling update [#8707](https://github.com/pingcap/tidb/pull/8707)
- Fix the panic issue caused by adding the index for the generated column in some cases [#8676](https://github.com/pingcap/tidb/pull/8676)
- Fix the issue that the optimizer cannot find the optimal query plan when `TIDB_SMJ Hint` exists in the SQL statement in some cases [#8729](https://github.com/pingcap/tidb/pull/8729)
- Fix the issue that `AntiSemiJoin` returns an incorrect result in some cases [#8730](https://github.com/pingcap/tidb/pull/8730)
- Improve the valid character check of the `utf8` character set [#8754](https://github.com/pingcap/tidb/pull/8754)
- Fix the issue that the field of the time type might return an incorrect result when the write operation is performed before the read operation in a transaction [#8746](https://github.com/pingcap/tidb/pull/8746)

## PD

- Fix the Region information update issue about Region merge [#1377](https://github.com/pingcap/pd/pull/1377)

## TiKV

- Support the configuration format in the unit of `DAY` (`d`) and fix the configuration compatibility issue [#3931](https://github.com/tikv/tikv/pull/3931)
- Fix the possible panic issue caused by `Approximate Size Split` [#3942](https://github.com/tikv/tikv/pull/3942)
- Fix two issues about Region merge [#3822](https://github.com/tikv/tikv/pull/3822), [#3873](https://github.com/tikv/tikv/pull/3873)

## Tools

+ TiDB Lightning
    - Make TiDB 2.1.0 the minimum cluster version supported by Lightning
    - Fix the content error of the file involving parsed `JSON` data in Lightning [#144](https://github.com/pingcap/tidb-tools/issues/144)
    - Fix the issue that `Too many open engines` occurs after the checkpoint is used to restart Lightning
+ TiDB Binlog
    - Eliminate some bottlenecks of Drainer writing data to Kafka
    - Support the Kafka version of TiDB Binlog
