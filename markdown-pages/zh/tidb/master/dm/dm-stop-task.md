---
title: 停止 TiDB Data Migration 数据迁移任务
summary: 了解 TiDB Data Migration 如何停止数据迁移任务。
aliases: ['/docs-cn/tidb-data-migration/dev/stop-task/']
---

# 停止 TiDB Data Migration 数据迁移任务

`stop-task` 命令用于停止数据迁移任务。有关 `stop-task` 与 `pause-task` 的区别，请参考[暂停数据迁移任务](/dm/dm-pause-task.md)中的相关说明。


```bash
help stop-task
```

```
stop a specified task

Usage:
 dmctl stop-task [-s source ...] <task-name | task-file> [flags]

Flags:
 -h, --help   help for stop-task

Global Flags:
 -s, --source strings   MySQL Source ID
```

## 命令用法示例


```bash
stop-task [-s "mysql-replica-01"]  task-name
```

## 参数解释

- `-s`：
    - 可选
    - 指定在特定的一个 MySQL 源上停止数据迁移任务的子任务
    - 如果设置，则只停止该任务在指定 MySQL 源上的子任务
- `task-name | task-file`：
    - 必选
    - 指定任务名称或任务文件路径

## 返回结果示例


```bash
stop-task test
```

```
{
    "op": "Stop",
    "result": true,
    "msg": "",
    "sources": [
        {
            "result": true,
            "msg": "",
            "source": "mysql-replica-01",
            "worker": "worker1"
        }
    ]
}
```

> **注意：**
>
> 通过 `stop-task` 停止迁移任务后，执行 [`query-status`](/dm/dm-query-status.md) 将无法查询到该任务，但该任务的 checkpoint 等信息仍然保留在元数据库 `dm_meta` 中。
>
> + 要重新创建该迁移任务，你需要在 [`start-task`](/dm/dm-create-task.md) 中添加 `--remove-meta` 参数。
> + 要彻底删除该迁移任务，你需要在元数据库 `dm_meta` 中删除以该任务名为表名前缀的四张表。
