---
title: Special Handling of DM DDLs
summary: Learn how DM parses and handles DDL statements according to the statement types.
---

# DM DDL の特別な処理 {#special-handling-of-dm-ddls}

TiDB データ移行 (DM) がデータを移行するとき、DDL ステートメントを解析し、ステートメントの種類と現在の移行段階に従ってそれらを処理します。

## DDL ステートメントをスキップする {#skip-ddl-statements}

次のステートメントは DM でサポートされていないため、DM は解析直後にそれらをスキップします。

<table><tr><th>説明</th><th>SQL</th></tr><tr><td>取引</td><td><code>^SAVEPOINT</code></td></tr><tr><td>すべてのフラッシュ SQL をスキップする</td><td><code>^FLUSH</code></td></tr><tr><td rowspan="3">テーブルのメンテナンス</td><td><code>^OPTIMIZE\\s+TABLE</code></td></tr><tr><td> <code>^ANALYZE\\s+TABLE</code></td></tr><tr><td> <code>^REPAIR\\s+TABLE</code></td></tr><tr><td>一時テーブル</td><td><code>^DROP\\s+(\\/\\*\\!40005\\s+)?TEMPORARY\\s+(\\*\\/\\s+)?TABLE</code></td></tr><tr><td rowspan="2">引き金</td><td><code>^CREATE\\s+(DEFINER\\s?=.+?)?TRIGGER</code></td></tr><tr><td> <code>^DROP\\s+TRIGGER</code></td></tr><tr><td rowspan="3">手順</td><td><code>^DROP\\s+PROCEDURE</code></td></tr><tr><td> <code>^CREATE\\s+(DEFINER\\s?=.+?)?PROCEDURE</code></td></tr><tr><td> <code>^ALTER\\s+PROCEDURE</code></td></tr><tr><td rowspan="3">意見</td><td><code>^CREATE\\s*(OR REPLACE)?\\s+(ALGORITHM\\s?=.+?)?(DEFINER\\s?=.+?)?\\s+(SQL SECURITY DEFINER)?VIEW</code></td></tr><tr><td> <code>^DROP\\s+VIEW</code></td></tr><tr><td> <code>^ALTER\\s+(ALGORITHM\\s?=.+?)?(DEFINER\\s?=.+?)?(SQL SECURITY DEFINER)?VIEW</code></td></tr><tr><td rowspan="4">関数</td><td><code>^CREATE\\s+(AGGREGATE)?\\s*?FUNCTION</code></td></tr><tr><td> <code>^CREATE\\s+(DEFINER\\s?=.+?)?FUNCTION</code></td></tr><tr><td> <code>^ALTER\\s+FUNCTION</code></td></tr><tr><td> <code>^DROP\\s+FUNCTION</code></td></tr><tr><td rowspan="3">テーブルスペース</td><td><code>^CREATE\\s+TABLESPACE</code></td></tr><tr><td> <code>^ALTER\\s+TABLESPACE</code></td></tr><tr><td> <code>^DROP\\s+TABLESPACE</code></td></tr><tr><td rowspan="3">イベント</td><td><code>^CREATE\\s+(DEFINER\\s?=.+?)?EVENT</code></td></tr><tr><td> <code>^ALTER\\s+(DEFINER\\s?=.+?)?EVENT</code></td></tr><tr><td> <code>^DROP\\s+EVENT</code></td></tr><tr><td rowspan="7">アカウント管理</td><td><code>^GRANT</code></td></tr><tr><td> <code>^REVOKE</code></td></tr><tr><td> <code>^CREATE\\s+USER</code></td></tr><tr><td> <code>^ALTER\\s+USER</code></td></tr><tr><td> <code>^RENAME\\s+USER</code></td></tr><tr><td> <code>^DROP\\s+USER</code></td></tr><tr><td> <code>^DROP\\s+USER</code></td></tr></table>

## DDL ステートメントを書き換える {#rewrite-ddl-statements}

次のステートメントは、ダウンストリームにレプリケートされる前に書き換えられます。

| 元の声明                  | 書き直された声明                           |
| --------------------- | ---------------------------------- |
| `^CREATE DATABASE...` | `^CREATE DATABASE...IF NOT EXISTS` |
| `^CREATE TABLE...`    | `^CREATE TABLE..IF NOT EXISTS`     |
| `^DROP DATABASE...`   | `^DROP DATABASE...IF EXISTS`       |
| `^DROP TABLE...`      | `^DROP TABLE...IF EXISTS`          |
| `^DROP INDEX...`      | `^DROP INDEX...IF EXISTS`          |

## シャード マージの移行タスク {#shard-merge-migration-tasks}

DM が悲観的モードまたは楽観的モードでテーブルをマージおよび移行する場合、DDL レプリケーションの動作は他のシナリオとは異なります。詳細については、 [悲観モード](/dm/feature-shard-merge-pessimistic.md)および[楽観モード](/dm/feature-shard-merge-optimistic.md)を参照してください。

## オンライン DDL {#online-ddl}

オンライン DDL 機能は、特別な方法で DDL イベントも処理します。詳細については、 [GH-ost/PT-osc を使用するデータベースからの移行](/dm/feature-online-ddl.md)を参照してください。
