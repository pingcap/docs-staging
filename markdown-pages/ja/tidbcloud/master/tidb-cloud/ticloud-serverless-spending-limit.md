---
title: ticloud serverless spending-limit
summary: The reference of `ticloud serverless spending-limit`.
---

# ticloud サーバーレス支出制限 {#ticloud-serverless-spending-limit}

TiDB Serverless クラスターの月間最大[支出限度額](/tidb-cloud/manage-serverless-spend-limit.md)を設定します。

```shell
ticloud serverless spending-limit [flags]
```

## 例 {#examples}

インタラクティブ モードで TiDB Serverless クラスターの使用制限を設定します。

```shell
ticloud serverless spending-limit
```

非対話型モードで TiDB Serverless クラスターの使用制限を設定します。

```shell
ticloud serverless spending-limit -c <cluster-id> --monthly <spending-limit-monthly>
```

## 旗 {#flags}

非対話型モードでは、必要なフラグを手動で入力する必要があります。対話型モードでは、CLI プロンプトに従って入力するだけです。

| フラグ                  | 説明                          | 必須  | 注記                       |
| -------------------- | --------------------------- | --- | ------------------------ |
| -c, --cluster-id 文字列 | クラスターの ID を指定します。           | はい  | 非対話型モードでのみ動作します。         |
| --毎月 int32           | 月間最大支出限度額を USD セント単位で指定します。 | はい  | 非対話型モードでのみ動作します。         |
| -h, --help           | このコマンドのヘルプ情報を表示します。         | いいえ | 非対話型モードと対話型モードの両方で動作します。 |

## 継承されたフラグ {#inherited-flags}

| フラグ               | 説明                                                                             | 必須  | 注記                                                             |
| ----------------- | ------------------------------------------------------------------------------ | --- | -------------------------------------------------------------- |
| --色なし             | 出力のカラーを無効にします。                                                                 | いいえ | 非対話型モードでのみ機能します。対話型モードでは、一部の UI コンポーネントで色を無効にしても機能しない可能性があります。 |
| -P, --profile 文字列 | このコマンドで使用するアクティブ[ユーザープロフィール](/tidb-cloud/cli-reference.md#user-profile)を指定します。 | いいえ | 非対話型モードと対話型モードの両方で動作します。                                       |
| -D、--デバッグ         | デバッグ モードを有効にします。                                                               | いいえ | 非対話型モードと対話型モードの両方で動作します。                                       |

## フィードバック {#feedback}

TiDB Cloud CLI に関してご質問やご提案がございましたら、お気軽に[問題](https://github.com/tidbcloud/tidbcloud-cli/issues/new/choose)作成してください。また、あらゆる貢献を歓迎します。
