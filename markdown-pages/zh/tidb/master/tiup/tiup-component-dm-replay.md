---
title: tiup dm replay
summary: tiup dm replay 命令用于重试集群操作中失败的命令，并跳过已成功的步骤。使用命令时需指定要重试的命令对应的 audit-id，可通过 tiup dm audit 查看历史命令及其 audit-id。命令输出为对应命令的输出。
---

# tiup dm replay

对集群进行升级或重启等操作时，操作有可能因为环境的原因而偶然失败。这时如果重新进行操作，需要从头开始执行所有步骤。如果集群规模较大，会耗费较长时间。此时可以使用 `tiup dm replay` 命令，命令重试刚才失败的命令，并且跳过已经成功的步骤。

## 语法

```shell
tiup dm replay <audit-id> [flags]
```

- `<audit-id>` 代表要重试的命令对应的 `audit-id`。使用 [`tiup dm audit`](/tiup/tiup-component-dm-audit.md) 可查看历史命令及其 `audit-id`。

## 选项

### -h, --help

输出帮助信息。

## 输出

`<audit-id>` 对应的命令的输出。