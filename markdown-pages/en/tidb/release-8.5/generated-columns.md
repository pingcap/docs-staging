---
title: Generated Columns
summary: Learn how to use generated columns.
---

# Generated Columns

This document introduces the concept and usage of generated columns.

## Basic concepts

Unlike general columns, the value of the generated column is calculated by the expression in the column definition. When inserting or updating a generated column, you cannot assign a value, but only use `DEFAULT`.

There are two kinds of generated columns: virtual and stored. A virtual generated column occupies no storage and is computed when it is read. A stored generated column is computed when it is written (inserted or updated) and occupies storage. Compared with the virtual generated columns, the stored generated columns have better read performance, but take up more disk space.

You can create an index on a generated column whether it is virtual or stored.

## Usage

One of the main usage of generated columns is to extract data from the JSON data type and indexing the data.

In both MySQL 8.0 and TiDB, columns of type JSON cannot be indexed directly. That is, the following table schema is **not supported**:


```sql
CREATE TABLE person (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address_info JSON,
    KEY (address_info)
);
```

To index a JSON column, you must extract it as a generated column first.

Using the `city` field in `address_info` as an example, you can create a virtual generated column and add an index for it:


```sql
CREATE TABLE person (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address_info JSON,
    city VARCHAR(64) AS (JSON_UNQUOTE(JSON_EXTRACT(address_info, '$.city'))), -- virtual generated column
    -- city VARCHAR(64) AS (JSON_UNQUOTE(JSON_EXTRACT(address_info, '$.city'))) VIRTUAL, -- virtual generated column
    -- city VARCHAR(64) AS (JSON_UNQUOTE(JSON_EXTRACT(address_info, '$.city'))) STORED, -- stored generated column
    KEY (city)
);
```

In this table, the `city` column is a **virtual generated column** and has an index. The following query can use the index to speed up the execution:


```sql
SELECT name, id FROM person WHERE city = 'Beijing';
```


```sql
EXPLAIN SELECT name, id FROM person WHERE city = 'Beijing';
```

```sql
+---------------------------------+---------+-----------+--------------------------------+-------------------------------------------------------------+
| id                              | estRows | task      | access object                  | operator info                                               |
+---------------------------------+---------+-----------+--------------------------------+-------------------------------------------------------------+
| Projection_4                    | 10.00   | root      |                                | test.person.name, test.person.id                            |
| └─IndexLookUp_10                | 10.00   | root      |                                |                                                             |
|   ├─IndexRangeScan_8(Build)     | 10.00   | cop[tikv] | table:person, index:city(city) | range:["Beijing","Beijing"], keep order:false, stats:pseudo |
|   └─TableRowIDScan_9(Probe)     | 10.00   | cop[tikv] | table:person                   | keep order:false, stats:pseudo                              |
+---------------------------------+---------+-----------+--------------------------------+-------------------------------------------------------------+
```

From the query execution plan, it can be seen that the `city` index is used to read the `HANDLE` of the row that meets the condition `city ='Beijing'`, and then it uses this `HANDLE` to read the data of the row.

If no data exists at path `$.city`, `JSON_EXTRACT` returns `NULL`. If you want to enforce a constraint that `city` must be `NOT NULL`, you can define the virtual generated column as follows:


```sql
CREATE TABLE person (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address_info JSON,
    city VARCHAR(64) AS (JSON_UNQUOTE(JSON_EXTRACT(address_info, '$.city'))) NOT NULL,
    KEY (city)
);
```

## Validation of generated columns

Both `INSERT` and `UPDATE` statements check virtual column definitions. Rows that do not pass validation return errors:


```sql
mysql> INSERT INTO person (name, address_info) VALUES ('Morgan', JSON_OBJECT('Country', 'Canada'));
ERROR 1048 (23000): Column 'city' cannot be null
```

## Generated columns index replacement rule

When an expression in a query is strictly equivalent to a generated column with an index, TiDB replaces the expression with the corresponding generated column, so that the optimizer can take that index into account during execution plan construction.

The following example creates a generated column for the expression `a+1` and adds an index. The column type of `a` is int and the column type of `a+1` is bigint. If the type of the generated column is set to int, the replacement will not occur. For type conversion rules, see [Type Conversion of Expression Evaluation](/functions-and-operators/type-conversion-in-expression-evaluation.md).

```sql
create table t(a int);
desc select a+1 from t where a+1=3;
```

```sql
+---------------------------+----------+-----------+---------------+--------------------------------+
| id                        | estRows  | task      | access object | operator info                  |
+---------------------------+----------+-----------+---------------+--------------------------------+
| Projection_4              | 8000.00  | root      |               | plus(test.t.a, 1)->Column#3    |
| └─TableReader_7           | 8000.00  | root      |               | data:Selection_6               |
|   └─Selection_6           | 8000.00  | cop[tikv] |               | eq(plus(test.t.a, 1), 3)       |
|     └─TableFullScan_5     | 10000.00 | cop[tikv] | table:t       | keep order:false, stats:pseudo |
+---------------------------+----------+-----------+---------------+--------------------------------+
4 rows in set (0.00 sec)
```

```sql
alter table t add column b bigint as (a+1) virtual;
alter table t add index idx_b(b);
desc select a+1 from t where a+1=3;
```

```sql
+------------------------+---------+-----------+-------------------------+---------------------------------------------+
| id                     | estRows | task      | access object           | operator info                               |
+------------------------+---------+-----------+-------------------------+---------------------------------------------+
| IndexReader_6          | 10.00   | root      |                         | index:IndexRangeScan_5                      |
| └─IndexRangeScan_5     | 10.00   | cop[tikv] | table:t, index:idx_b(b) | range:[3,3], keep order:false, stats:pseudo |
+------------------------+---------+-----------+-------------------------+---------------------------------------------+
2 rows in set (0.01 sec)
```

> **Note:**
>
> If the expression to be replaced and the generated column are both the string type but with different lengths, you can still replace the expression by setting the system variable [`tidb_enable_unsafe_substitute`](/system-variables.md#tidb_enable_unsafe_substitute-new-in-v630) to `ON`. When configuring this system variable, ensure that the value calculated by the generated column strictly satisfies the definition of the generated column. Otherwise, the data might be truncated due to the difference in length, resulting in an incorrect result. See GitHub issue [#35490](https://github.com/pingcap/tidb/issues/35490#issuecomment-1211658886).

## Limitations

The current limitations of JSON and generated columns are as follows:

- You cannot add a stored generated column through `ALTER TABLE`.
- You can neither convert a stored generated column to a normal column through the `ALTER TABLE` statement nor convert a normal column to a stored generated column.
- You cannot modify the expression of a stored generated column through the `ALTER TABLE` statement.
- Not all [JSON functions](/functions-and-operators/json-functions.md) are supported.
- The [`NULLIF()` function](/functions-and-operators/control-flow-functions.md#nullif) is not supported. You can use the [`CASE` function](/functions-and-operators/control-flow-functions.md#case) instead.
- Currently, the generated column index replacement rule is valid only when the generated column is a virtual generated column. It is not valid on the stored generated column, but the index can still be used by directly using the generated column itself.
- The following functions and expressions are not allowed in generated column definitions, and TiDB returns errors if they are used:

    - Non-deterministic functions and expressions, such as `RAND`, `UUID`, and `CURRENT_TIMESTAMP`.
    - Functions that depend on session-specific or global state, such as `CONNECTION_ID` and `CURRENT_USER`.
    - Functions that affect the system state or perform system interactions, such as `GET_LOCK`, `RELEASE_LOCK`, and `SLEEP`.