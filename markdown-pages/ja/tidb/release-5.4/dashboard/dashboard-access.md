---
title: Access TiDB Dashboard
summary: Learn how to access TiDB Dashboard.
---

# TiDBダッシュボードにアクセスする {#access-tidb-dashboard}

TiDBダッシュボードにアクセスするには、ブラウザから[http://127.0.0.1:2379/dashboard](http://127.0.0.1:2379/dashboard)にアクセスしてください。 `127.0.0.1:2379`を実際のPDインスタンスのアドレスとポートに置き換えます。

複数のPDインスタンスがクラスタにデプロイされていて、**すべての**PDインスタンスとポートに直接アクセスできる場合は、 [http://127.0.0.1:2379/dashboard/](http://127.0.0.1:2379/dashboard/)のアドレスの`127.0.0.1:2379`を<strong>任意の</strong>PDインスタンスのアドレスとポートに置き換えるだけです。

> **ノート：**
>
> ファイアウォールまたはリバースプロキシが構成されていて、すべてのPDインスタンスに直接アクセスできない場合は、TiDBダッシュボードにアクセスできない可能性があります。通常、これはファイアウォールまたはリバースプロキシが正しく構成されていないことが原因です。複数のPDインスタンスが展開されている場合にファイアウォールまたはリバースプロキシを正しく構成する方法については、 [リバースプロキシの背後でTiDBダッシュボードを使用する](/dashboard/dashboard-ops-reverse-proxy.md)と[セキュリティTiDBダッシュボード](/dashboard/dashboard-ops-security.md)を参照してください。

## ブラウザの互換性 {#browser-compatibility}

TiDBダッシュボードは、比較的新しいバージョンの次の一般的なデスクトップブラウザで使用できます。

-   Chrome&gt; = 77
-   Firefox&gt; = 68
-   エッジ&gt;=17

> **ノート：**
>
> 上記のブラウザや他のブラウザを使用してTiDBダッシュボードにアクセスすると、一部の機能が正常に動作しない場合があります。

## ログイン {#sign-in}

TiDBダッシュボードにアクセスすると、次の画像に示すように、ユーザーログインインターフェイスに移動します。

-   `root`アカウントを使用してTiDBダッシュボードにサインインできます。
-   [ユーザー定義のSQLユーザー](/dashboard/dashboard-user.md)を作成した場合は、このアカウントと対応するパスワードを使用してサインインできます。

![Login interface](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-access-login.png)

次のいずれかの状況が存在する場合、ログインが失敗する可能性があります。

-   `root`ユーザーは存在しません。
-   PDが起動していないか、アクセスできません。
-   TiDBが起動していないか、アクセスできません。
-   間違った`root`のパスワード。

サインインすると、セッションは24時間以内に有効なままになります。サインアウトする方法については、 [ログアウト](#logout)セクションを参照してください。

## 言語を切り替える {#switch-language}

TiDBダッシュボードでは次の言語がサポートされています。

-   英語
-   中国語（簡体字）

**[SQLユーザーサインイン**]ページで、[<strong>言語</strong>の切り替え]ドロップダウンリストをクリックして、インターフェイスの言語を切り替えることができます。

![Switch language](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-access-switch-language.png)

## ログアウト {#logout}

ログインしたら、左側のナビゲーションバーにあるログインユーザー名をクリックして、ユーザーページに切り替えます。ユーザーページの[**ログアウト**]ボタンをクリックして、現在のユーザーをログアウトします。ログアウトした後、ユーザー名とパスワードを再入力する必要があります。

![Logout](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-access-logout.png)
