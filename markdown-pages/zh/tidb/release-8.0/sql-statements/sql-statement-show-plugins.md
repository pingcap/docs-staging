---
title: SHOW PLUGINS
summary: TiDB 数据库中 SHOW PLUGINS 的使用概况。
---

# SHOW PLUGINS

`SHOW PLUGINS` 用于查看 TiDB 安装的插件，各个插件运行的状态以及插件版本信息。

## 语法图

```ebnf+diagram
ShowPluginsStmt ::=
    "SHOW" "PLUGINS" ShowLikeOrWhere?
```

## 示例

```sql
SHOW PLUGINS;
```

```
+-------+--------------+-------+-----------------------------+---------+---------+
| Name  | Status       | Type  | Library                     | License | Version |
+-------+--------------+-------+-----------------------------+---------+---------+
| audit | Ready-enable | Audit | /tmp/tidb/plugin/audit-1.so |         | 1       |
+-------+--------------+-------+-----------------------------+---------+---------+
1 row in set (0.000 sec)
```

`SHOW PLUGINS` 也支持模糊匹配：

```sql
SHOW PLUGINS LIKE 'a%';
```

```
+-------+--------------+-------+-----------------------------+---------+---------+
| Name  | Status       | Type  | Library                     | License | Version |
+-------+--------------+-------+-----------------------------+---------+---------+
| audit | Ready-enable | Audit | /tmp/tidb/plugin/audit-1.so |         | 1       |
+-------+--------------+-------+-----------------------------+---------+---------+
1 row in set (0.000 sec)
```

## MySQL 兼容性

`SHOW PLUGINS` 语句与 MySQL 完全兼容。如发现任何兼容性差异，请尝试 [TiDB 支持资源](/support.md)。

## 扩展阅读

- [`ADMIN PLUGINS`](/sql-statements/sql-statement-admin.md#admin-plugin-语句)
