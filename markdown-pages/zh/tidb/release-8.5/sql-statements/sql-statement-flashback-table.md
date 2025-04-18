---
title: FLASHBACK TABLE
summary: TiDB 4.0 引入了 `FLASHBACK TABLE` 语法，可在 GC 生命周期内恢复被 `DROP` 或 `TRUNCATE` 删除的表和数据。使用系统变量 `tidb_gc_life_time` 配置历史版本保留时间，默认为 `10m0s`。查询当前`safePoint`：`SELECT * FROM mysql.tidb WHERE variable_name = 'tikv_gc_safe_point'`。注意，过了 GC 生命周期就无法恢复被删除的数据。
---

# FLASHBACK TABLE

在 TiDB 4.0 中，引入了 `FLASHBACK TABLE` 语法，其功能是在 Garbage Collection (GC) life time 时间内，可以用 `FLASHBACK TABLE` 语句来恢复被 `DROP` 或 `TRUNCATE` 删除的表以及数据。

可以使用系统变量 [`tidb_gc_life_time`](/system-variables.md#tidb_gc_life_time-从-v50-版本开始引入) 配置数据的历史版本的保留时间（默认值是 `10m0s`）。可以使用以下 SQL 语句查询当前的 `safePoint`，即 GC 已经清理到的时间点：


  ```sql
  SELECT * FROM mysql.tidb WHERE variable_name = 'tikv_gc_safe_point';
  ```

只要被 `DROP` 或 `TRUNCATE` 删除的表是在 `tikv_gc_safe_point` 时间之后，都能用 `FLASHBACK TABLE` 语法来恢复。

## 语法


```sql
FLASHBACK TABLE table_name [TO other_table_name]
```

### 语法图

```ebnf+diagram
FlashbackTableStmt ::=
    'FLASHBACK' 'TABLE' TableName FlashbackToNewName

TableName ::=
    Identifier ( '.' Identifier )?

FlashbackToNewName ::=
    ( 'TO' Identifier )?
```

## 注意事项

如果删除了一张表并过了 GC lifetime，就不能再用 `FLASHBACK TABLE` 语句来恢复被删除的数据了，否则会返回错误，错误类似于 `Can't find dropped/truncated table 't' in GC safe point 2020-03-16 16:34:52 +0800 CST`。

## 示例

- 恢复被 `DROP` 删除的表数据：

    
    ```sql
    DROP TABLE t;
    ```

    
    ```sql
    FLASHBACK TABLE t;
    ```

- 恢复被 `TRUNCATE` 的表数据，由于被 `TRUNCATE` 的表还存在，所以需要重命名被恢复的表，否则会报错表 t 已存在。

    ```sql
    TRUNCATE TABLE t;
    ```

    
    ```sql
    FLASHBACK TABLE t TO t1;
    ```

## 工作原理

TiDB 在删除表时，实际上只删除了表的元信息，并将需要删除的表数据（行数据和索引数据）写一条数据到 `mysql.gc_delete_range` 表。TiDB 后台的 GC Worker 会定期从 `mysql.gc_delete_range` 表中取出超过 GC lifetime 相关范围的 key 进行删除。

所以，`FLASHBACK TABLE` 只需要在 GC Worker 还没删除表数据前，恢复表的元信息并删除 `mysql.gc_delete_range` 表中相应的行记录即可。恢复表的元信息可以用 TiDB 的快照读实现。具体的快照读内容可以参考[读取历史数据](/read-historical-data.md)文档。下面是 `FLASHBACK TABLE t TO t1` 的工作流程：

1. 从 DDL History job 中查找 `drop table` 或者 `truncate table` 类型的操作，且操作的表名是 `t` 的第一个 DDL job，若没找到，则返回错误。
2. 检查 DDL job 的开始时间，是否在 `tikv_gc_safe_point` 之前。如果是`tikv_gc_safe_point` 之前，说明被 `DROP` 或 `TRUNCATE` 删除的表已经被 GC 清理掉，返回错误。
3. 用 DDL job 的开始时间作为 snapshot 读取历史数据，读取表的元信息。
4. 删除 `mysql.gc_delete_range` 中和表 `t` 相关的 GC 任务。
5. 将表的元信息中的 `name` 修改成 `t1`，并用该元信息新建一个表。注意：这里只是修改了表名，但是 table ID 不变，依旧是之前被删除的表 `t` 的 table ID。

可以发现，从表 `t` 被删除，到表 `t` 被 `FLASHBACK` 恢复到 `t1`，一直都是对表的元信息进行操作，而表的用户数据一直未被修改过。被恢复的表 `t1` 和之前被删除的表 `t` 的 table ID 相同，所以表 `t1` 才能读取表`t` 的用户数据。

> **注意：**
>
> 不能用 `FLASHBACK` 多次恢复同一个被删除的表，因为 `FLASHBACK` 所恢复表的 table ID 还是被删除表的 table ID，而 TiDB 要求所有还存在的表 table ID 必须全局唯一。

 `FLASHBACK TABLE` 是通过快照读获取表的元信息后，再走一次类似于 `CREATE TABLE` 的建表流程，所以 `FLASHBACK TABLE` 实际上也是一种 DDL 操作。

## MySQL 兼容性

该语句是 TiDB 对 MySQL 语法的扩展。
