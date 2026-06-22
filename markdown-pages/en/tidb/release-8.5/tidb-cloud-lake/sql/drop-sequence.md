---
title: DROP SEQUENCE
summary: Deletes an existing sequence from TiDB Cloud Lake.
---

# DROP SEQUENCE

Deletes an existing sequence from TiDB Cloud Lake.

## Syntax

```sql
DROP SEQUENCE [IF EXISTS] <sequence>
```

| Parameter    | Description                             |
|--------------|-----------------------------------------|
| `<sequence>` | The name of the sequence to be deleted. |

## Examples

```sql
-- Delete a sequence named staff_id_seq
DROP SEQUENCE staff_id_seq;
```
