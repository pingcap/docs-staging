---
title: ticloud serverless branch create
summary: ticloud serverless branch create` のリファレンス。
---

# ticloud サーバーレス ブランチ作成 {#ticloud-serverless-branch-create}

TiDB Cloud Serverless クラスターの[支店](/tidb-cloud/branch-overview.md)作成します。

```shell
ticloud serverless branch create [flags]
```

## 例 {#examples}

インタラクティブ モードでTiDB Cloud Serverless クラスターのブランチを作成します。

```shell
ticloud serverless branch create
```

非対話モードでTiDB Cloud Serverless クラスターのブランチを作成します。

```shell
ticloud serverless branch create --cluster-id <cluster-id> --display-name <branch-name>
```

非対話モードで、指定されたタイムスタンプを持つ別のブランチからブランチを作成します。

```shell
ticloud serverless branch create --cluster-id <cluster-id> --display-name <branch-name> --parent-id <parent-branch-id> --parent-timestamp <parent-timestamp>
```

## 旗 {#flags}

非対話型モードでは、必要なフラグを手動で入力する必要があります。対話型モードでは、CLI プロンプトに従ってフラグを入力するだけです。

| フラグ                    | 説明                                                                          | 必須  | 注記                                |
| ---------------------- | --------------------------------------------------------------------------- | --- | --------------------------------- |
| -c, --cluster-id 文字列   | ブランチが作成されるクラスターの ID を指定します。                                                 | はい  | 非対話型モードでのみ動作します。                  |
| -n, --display-name 文字列 | 作成するブランチの名前を指定します。                                                          | はい  | 非対話型モードでのみ動作します。                  |
| --親ID文字列               | ブランチの親の ID を指定します。デフォルト値はクラスター ID です。                                       | いいえ | 非対話型モードでのみ動作します。                  |
| --親タイムスタンプ文字列          | 親ブランチのタイムスタンプを RFC3339 形式で指定します (例: `2024-01-01T00:00:00Z` 。デフォルト値は現在の時刻です。 | いいえ | 非対話型モードでのみ動作します。                  |
| -h, --help             | このコマンドのヘルプ情報を表示します。                                                         | いいえ | 非インタラクティブモードとインタラクティブモードの両方で動作します |

## 継承されたフラグ {#inherited-flags}

| フラグ               | 説明                                                                             | 必須  | 注記                                                             |
| ----------------- | ------------------------------------------------------------------------------ | --- | -------------------------------------------------------------- |
| --色なし             | 出力のカラーを無効にします。                                                                 | いいえ | 非対話型モードでのみ機能します。対話型モードでは、一部の UI コンポーネントで色を無効にしても機能しない可能性があります。 |
| -P, --profile 文字列 | このコマンドで使用するアクティブ[ユーザープロフィール](/tidb-cloud/cli-reference.md#user-profile)を指定します。 | いいえ | 非対話型モードと対話型モードの両方で動作します。                                       |
| -D、--デバッグ         | デバッグ モードを有効にします。                                                               | いいえ | 非対話型モードと対話型モードの両方で動作します。                                       |

## フィードバック {#feedback}

TiDB Cloud CLI に関してご質問やご提案がございましたら、お気軽に[問題](https://github.com/tidbcloud/tidbcloud-cli/issues/new/choose)作成してください。また、あらゆる貢献を歓迎します。
