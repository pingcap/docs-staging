---
title: ticloud serverless branch shell
summary: ticloud serverless branch shell` のリファレンス。
---

# ticloud サーバーレス ブランチ シェル {#ticloud-serverless-branch-shell}

TiDB Cloud Serverless クラスターのブランチに接続します。

```shell
ticloud serverless branch shell [flags]
```

## 例 {#examples}

インタラクティブ モードでTiDB Cloud Serverless ブランチに接続します。

```shell
ticloud serverless branch shell
```

非対話モードでデフォルトのユーザーを使用してTiDB Cloud Serverless ブランチに接続します。

```shell
ticloud serverless branch shell -c <cluster-id> -b <branch-id>
```

非対話モードでデフォルトのユーザー名とパスワードを使用してTiDB Cloud Serverless ブランチに接続します。

```shell
ticloud serverless branch shell -c <cluster-id> -b <branch-id> --password <password>
```

非対話モードで特定のユーザーとパスワードを使用してTiDB Cloud Serverless ブランチに接続します。

```shell
ticloud serverless branch shell -c <cluster-id> -b <branch-id> -u <user-name> --password <password>
```

## 旗 {#flags}

非対話型モードでは、必要なフラグを手動で入力する必要があります。対話型モードでは、CLI プロンプトに従ってフラグを入力するだけです。

| フラグ                  | 説明                  | 必須  | 注記                       |
| -------------------- | ------------------- | --- | ------------------------ |
| -b, --branch-id 文字列  | ブランチの ID を指定します。    | はい  | 非対話型モードでのみ動作します。         |
| -c, --cluster-id 文字列 | クラスターの ID を指定します。   | はい  | 非対話型モードでのみ動作します。         |
| -h, --help           | このコマンドのヘルプ情報を表示します。 | いいえ | 非対話型モードと対話型モードの両方で動作します。 |
| - パスワード              | ユーザーのパスワードを指定します。   | いいえ | 非対話型モードでのみ動作します。         |
| -u, --user 文字列       | ログインするユーザーを指定します。   | いいえ | 非対話型モードでのみ動作します。         |

## 継承されたフラグ {#inherited-flags}

| フラグ               | 説明                                                                             | 必須  | 注記                                                             |
| ----------------- | ------------------------------------------------------------------------------ | --- | -------------------------------------------------------------- |
| --色なし             | 出力のカラーを無効にします。                                                                 | いいえ | 非対話型モードでのみ機能します。対話型モードでは、一部の UI コンポーネントで色を無効にしても機能しない可能性があります。 |
| -P, --profile 文字列 | このコマンドで使用するアクティブ[ユーザープロフィール](/tidb-cloud/cli-reference.md#user-profile)を指定します。 | いいえ | 非対話型モードと対話型モードの両方で動作します。                                       |
| -D、--デバッグ         | デバッグ モードを有効にします。                                                               | いいえ | 非対話型モードと対話型モードの両方で動作します。                                       |

## フィードバック {#feedback}

TiDB Cloud CLI に関してご質問やご提案がございましたら、お気軽に[問題](https://github.com/tidbcloud/tidbcloud-cli/issues/new/choose)作成してください。また、あらゆる貢献を歓迎します。
