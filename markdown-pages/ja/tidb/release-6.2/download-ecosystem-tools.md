---
title: Download TiDB Tools
summary: Download the most officially maintained versions of TiDB tools.
---

# TiDB ツールをダウンロード {#download-tidb-tools}

このドキュメントでは、 TiDB Toolkitをダウンロードする方法について説明します。

TiDB Toolkitには、データ エクスポート ツールDumpling、データ インポート ツールTiDB Lightning、バックアップおよび復元ツール BR など、頻繁に使用される TiDB ツールが含まれています。

> **ヒント：**
>
> -   展開環境がインターネットにアクセスできる場合は、単一の[TiUP コマンド](/tiup/tiup-component-management.md)を使用して TiDB ツールを展開できるため、 TiDB Toolkitを個別にダウンロードする必要はありません。
> -   TiDB Toolkitをダウンロードする代わりに、Kubernetes に TiDB をデプロイして維持する必要がある場合は、 [TiDB Operatorオフライン インストール](https://docs.pingcap.com/tidb-in-kubernetes/stable/deploy-tidb-operator#offline-installation)の手順に従ってください。

## 環境要件 {#environment-requirements}

-   オペレーティング システム: Linux
-   アーキテクチャ: amd64

## ダウンロードリンク {#download-link}

次のリンクからTiDB Toolkitをダウンロードできます。

```
https://download.pingcap.org/tidb-community-toolkit-{version}-linux-amd64.tar.gz
```

リンクの`{version}`は、TiDB のバージョン番号を示します。たとえば、 `v6.2.0`のダウンロード リンクは`https://download.pingcap.org/tidb-community-toolkit-v6.2.0-linux-amd64.tar.gz`です。

## TiDB Toolkitの説明 {#tidb-toolkit-description}

使用するツールに応じて、対応するオフライン パッケージを次のようにインストールできます。

| 道具                                                                  | オフライン パッケージ名                                                                                                                                                    |
| :------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [TiUP](/tiup/tiup-overview.md)                                      | `tiup-linux-amd64.tar.gz` <br/>`tiup-{tiup-version}-linux-amd64.tar.gz` <br/>`dm-{tiup-version}-linux-amd64.tar.gz` <br/> `server-{version}-linux-amd64.tar.gz` |
| [Dumpling](/dumpling-overview.md)                                   | `dumpling-{version}-linux-amd64.tar.gz`                                                                                                                         |
| [TiDB Lightning](/tidb-lightning/tidb-lightning-overview.md)        | `tidb-lightning-ctl` <br/>`tidb-lightning-{version}-linux-amd64.tar.gz`                                                                                         |
| [TiDB データ移行 (DM)](/dm/dm-overview.md)                               | `dm-worker-{version}-linux-amd64.tar.gz` <br/>`dm-master-{version}-linux-amd64.tar.gz` <br/>`dmctl-{version}-linux-amd64.tar.gz`                                |
| [TiCDC](/ticdc/ticdc-overview.md)                                   | `cdc-{version}-linux-amd64.tar.gz`                                                                                                                              |
| [Binlog](/tidb-binlog/tidb-binlog-overview.md)                      | `pump-{version}-linux-amd64.tar.gz` <br/>`drainer-{version}-linux-amd64.tar.gz` <br/>`binlogctl` <br/>`reparo`                                                  |
| [バックアップと復元 (BR)](/br/backup-and-restore-overview.md)                | `br-{version}-linux-amd64.tar.gz`                                                                                                                               |
| [同期差分インスペクター](/sync-diff-inspector/sync-diff-inspector-overview.md) | `sync_diff_inspector`                                                                                                                                           |
| [ティスパーク](/tispark-overview.md)                                      | `tispark-{tispark-version}-any-any.tar.gz` <br/>`spark-{spark-version}-any-any.tar.gz`                                                                          |
| [PD Control](/pd-control.md)                                        | `pd-recover-{version}-linux-amd64.tar`                                                                                                                          |
| [PD 回復](/pd-recover.md)                                             | `etcdctl`                                                                                                                                                       |
