---
title: tiup dm start
summary: tiup dm start 命令用于启动指定集群的所有或部分服务。命令语法为 tiup dm start <cluster-name>。选项包括 -N, --node（指定要启动的节点），-R, --role（指定要启动的角色），-h, --help（输出帮助信息）。输出为启动日志。
---

# tiup dm start

命令 `tiup dm start` 用于启动指定集群的所有或部分服务。

## 语法

```shell
tiup dm start <cluster-name> [flags]
```

`<cluster-name>` 为要操作的集群名字，如果忘记集群名字可查看[集群列表](/tiup/tiup-component-dm-list.md)。

## 选项

### -N, --node（strings，默认为 []，表示所有节点）

指定要启动的节点，不指定则表示所有节点。该选项的值为以逗号分割的节点 ID 列表，节点 ID 为[集群状态](/tiup/tiup-component-dm-display.md)表格的第一列。

> **注意：**
> 
> 若同时指定了 `-R, --role`，那么将启动它们的交集中的服务。

### -R, --role（strings，默认为 []，表示所有角色）

指定要启动的角色，不指定则表示所有角色。该选项的值为以逗号分割的节点角色列表，角色为[集群状态](/tiup/tiup-component-dm-display.md)表格的第二列。

> **注意：**
> 
> 若同时指定了 `-N, --node`，那么将启动它们的交集中的服务。

### -h, --help

- 输出帮助信息。
- 数据类型：`BOOLEAN`
- 该选项默认关闭，默认值为 `false`。在命令中添加该选项，并传入 `true` 值或不传值，均可开启此功能。

## 输出

启动日志。
