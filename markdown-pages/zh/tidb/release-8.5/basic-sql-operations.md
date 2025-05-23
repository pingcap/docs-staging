---
title: SQL 基本操作
summary: TiDB 是一个兼容 MySQL 的数据库，可以执行 DDL、DML、DQL 和 DCL 操作。可以使用 SHOW DATABASES 查看数据库列表，使用 CREATE DATABASE 创建数据库，使用 DROP DATABASE 删除数据库。使用 CREATE TABLE 创建表，使用 SHOW CREATE TABLE 查看建表语句，使用 DROP TABLE 删除表。使用 CREATE INDEX 创建索引，使用 SHOW INDEX 查看表内所有索引，使用 DROP INDEX 删除索引。使用 INSERT 向表内插入记录，使用 UPDATE 修改记录，使用 DELETE 删除记录。使用 SELECT 检索表内数据，使用 WHERE 子句进行筛选。使用 CREATE USER 创建用户，使用 GRANT 授权用户，使用 DROP USER 删除用户。
---

# SQL 基本操作

成功部署 TiDB 集群之后，便可以在 TiDB 中执行 SQL 语句了。因为 TiDB 兼容 MySQL，你可以使用 MySQL 客户端连接 TiDB，并且[大多数情况下](/mysql-compatibility.md)可以直接执行 MySQL 语句。

SQL 是一门声明性语言，它是数据库用户与数据库交互的方式。它更像是一种自然语言，好像在用英语与数据库进行对话。本文档介绍基本的 SQL 操作。完整的 TiDB SQL 语句列表，参见 [SQL 语句概览](/sql-statements/sql-statement-overview.md)。

## 分类

SQL 语言通常按照功能划分成以下的 4 个部分：

- DDL (Data Definition Language)：数据定义语言，用来定义数据库对象，包括库、表、视图和索引等。

- DML (Data Manipulation Language)：数据操作语言，用来操作和业务相关的记录。

- DQL (Data Query Language)：数据查询语言，用来查询经过条件筛选的记录。

- DCL (Data Control Language)：数据控制语言，用来定义访问权限和安全级别。

常用的 DDL 功能是对象（如表、索引等）的创建、属性修改和删除，对应的命令分别是 CREATE、ALTER 和 DROP。

## 查看、创建和删除数据库

TiDB 语境中的 Database 或者说数据库，可以认为是表和索引等对象的集合。

使用 `SHOW DATABASES` 语句查看系统中数据库列表：


```sql
SHOW DATABASES;
```

使用名为 `mysql` 的数据库：


```sql
USE mysql;
```

使用 `SHOW TABLES` 语句查看数据库中的所有表。例如：


```sql
SHOW TABLES FROM mysql;
```

使用 `CREATE DATABASE` 语句创建数据库。语法如下：


```sql
CREATE DATABASE db_name [options];
```

例如，要创建一个名为 `samp_db` 的数据库，可使用以下语句：


```sql
CREATE DATABASE IF NOT EXISTS samp_db;
```

添加 `IF NOT EXISTS` 可防止发生错误。

使用 `DROP DATABASE` 语句删除数据库。例如：


```sql
DROP DATABASE samp_db;
```

## 创建、查看和删除表

使用 `CREATE TABLE` 语句创建表。语法如下：


```sql
CREATE TABLE table_name column_name data_type constraint;
```

例如，要创建一个名为 `person` 的表，包括编号、名字、生日等字段，可使用以下语句：


```sql
CREATE TABLE person (
    id INT,
    name VARCHAR(255),
    birthday DATE
    );
```

使用 `SHOW CREATE` 语句查看建表语句，即 DDL。例如：


```sql
SHOW CREATE TABLE person;
```

使用 `DROP TABLE` 语句删除表。例如：


```sql
DROP TABLE person;
```

## 创建、查看和删除索引

索引通常用于加速索引列上的查询。对于值不唯一的列，可使用 `CREATE INDEX` 或 `ALTER TABLE` 语句创建普通索引。例如：


```sql
CREATE INDEX person_id ON person (id);
```

或者：


```sql
ALTER TABLE person ADD INDEX person_id (id);
```

对于值唯一的列，可以创建唯一索引。例如：


```sql
CREATE UNIQUE INDEX person_unique_id ON person (id);
```

或者：


```sql
ALTER TABLE person ADD UNIQUE person_unique_id (id);
```

使用 `SHOW INDEX` 语句查看表内所有索引：


```sql
SHOW INDEX FROM person;
```

使用 `ALTER TABLE` 或 `DROP INDEX` 语句来删除索引。与 `CREATE INDEX` 语句类似，`DROP INDEX` 也可以嵌入 `ALTER TABLE` 语句。例如：


```sql
DROP INDEX person_id ON person;
```


```sql
ALTER TABLE person DROP INDEX person_unique_id;
```

注意：DDL 操作不是事务，在执行 DDL 时，不需要对应 COMMIT 语句。

常用的 DML 功能是对表记录的新增、修改和删除，对应的命令分别是 INSERT、UPDATE 和 DELETE。

## 记录的增删改

使用 `INSERT` 语句向表内插入表记录。例如：


```sql
INSERT INTO person VALUES(1,'tom','20170912');
```

使用 `INSERT` 语句向表内插入包含部分字段数据的表记录。例如：


```sql
INSERT INTO person(id,name) VALUES('2','bob');
```

使用 `UPDATE` 语句向表内修改表记录的部分字段数据。例如：


```sql
UPDATE person SET birthday='20180808' WHERE id=2;
```

使用 `DELETE` 语句向表内删除部分表记录。例如：


```sql
DELETE FROM person WHERE id=2;
```

注意：UPDATE 和 DELETE 操作如果不带 WHERE 过滤条件是对全表进行操作。

DQL 数据查询语言是从一个表或多个表中检索出想要的数据行，通常是业务开发的核心内容。

## 查询数据

使用 `SELECT` 语句检索表内数据。例如：


```sql
SELECT * FROM person;
```

在 SELECT 后面加上要查询的列名。例如：


```sql
SELECT name FROM person;
```

```sql
+------+
| name |
+------+
| tom  |
+------+
1 rows in set (0.00 sec)
```

使用 WHERE 子句，对所有记录进行是否符合条件的筛选后再返回。例如：


```sql
SELECT * FROM person WHERE id<5;
```

常用的 DCL 功能是创建或删除用户，和对用户权限的管理。

## 创建、授权和删除用户

使用 `CREATE USER` 语句创建一个用户 `tiuser`，密码为 `123456`：


```sql
CREATE USER 'tiuser'@'localhost' IDENTIFIED BY '123456';
```

授权用户 `tiuser` 可检索数据库 `samp_db` 内的表：


```sql
GRANT SELECT ON samp_db.* TO 'tiuser'@'localhost';
```

查询用户 `tiuser` 的权限：


```sql
SHOW GRANTS for tiuser@localhost;
```

删除用户 `tiuser`：


```sql
DROP USER 'tiuser'@'localhost';
```
