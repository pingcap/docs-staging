---
title: Enable Encryption for Disk Spill
summary: Learn how to enable encryption for disk spill in TiDB.
---

# ディスク流出時の暗号化機能を有効にする {#enable-encryption-for-disk-spill}

システム変数[`tidb_enable_tmp_storage_on_oom`](/system-variables.md#tidb_enable_tmp_storage_on_oom) `ON`に設定されている場合、単一の SQL ステートメントのメモリ使用量がシステム変数[`tidb_mem_quota_query`](/system-variables.md#tidb_mem_quota_query)の制限を超えた場合、一部のオペレーターは実行中の中間結果を一時ファイルとしてディスクに保存し、実行後にファイルを削除できます。クエリが完了しました。

ディスク スピルの暗号化を有効にして、攻撃者がこれらの一時ファイルを読み取ってデータにアクセスするのを防ぐことができます。

## 構成、設定 {#configure}

ディスク スピル ファイルの暗号化を有効にするには、TiDB 構成ファイルの`[security]`セクションで項目[`spilled-file-encryption-method`](/tidb-configuration-file.md#spilled-file-encryption-method)を構成します。

```toml
[security]
spilled-file-encryption-method = "aes128-ctr"
```

`spilled-file-encryption-method`の値のオプションは`aes128-ctr`と`plaintext`です。デフォルト値は`plaintext`で、これは暗号化が無効であることを意味します。
