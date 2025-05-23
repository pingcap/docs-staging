---
title: Access TiDB Dashboard
summary: TiDBダッシュボードにアクセスするには、ブラウザで指定されたURLにアクセスしてください。複数のPDインスタンスがある場合は、アドレスを任意のPDインスタンスのアドレスとポートに置き換えてください。Chrome、Firefox、またはEdgeブラウザ（最新バージョン）をご利用ください。TiDBルートアカウントまたはユーザー定義のSQLユーザーでサインインしてください。セッションは24時間有効です。言語は英語と中国語で切り替えられます。ログアウトするには、ユーザー名をクリックし、「ログアウト」ボタンをクリックしてください。
---

# TiDBダッシュボードにアクセスする {#access-tidb-dashboard}

TiDBダッシュボードにアクセスするには、ブラウザから[http://127.0.0.1:2379/ダッシュボード](http://127.0.0.1:2379/dashboard)アクセスしてください。3 `127.0.0.1:2379`実際のPDインスタンスのアドレスとポートに置き換えてください。

> **注記：**
>
> TiDB v6.5.0以降およびTiDB Operator v1.4.0以降では、Kubernetes上にTiDB Dashboardを独立したPodとしてデプロイできます。TiDB TiDB Operatorを使用すると、このPodのIPアドレスにアクセスしてTiDB Dashboardを起動できます。詳細は[TiDB ダッシュボードをTiDB Operatorで独立してデプロイ](https://docs.pingcap.com/tidb-in-kubernetes/dev/get-started#deploy-tidb-dashboard-independently)ご覧ください。

## 複数のPDインスタンスがデプロイされている場合にTiDBダッシュボードにアクセスする {#access-tidb-dashboard-when-multiple-pd-instances-are-deployed}

クラスターに複数の PD インスタンスがデプロイされていて、**すべての**PD インスタンスとポートに直接アクセスできる場合は、アドレス[http://127.0.0.1:2379/ダッシュボード/](http://127.0.0.1:2379/dashboard/)の`127.0.0.1:2379`**任意の**PD インスタンスのアドレスとポートに置き換えるだけです。

> **注記：**
>
> ファイアウォールまたはリバースプロキシが設定されており、すべてのPDインスタンスに直接アクセスできない場合、TiDBダッシュボードにアクセスできない可能性があります。これは通常、ファイアウォールまたはリバースプロキシが正しく設定されていないことが原因です。複数のPDインスタンスがデプロイされている場合にファイアウォールまたはリバースプロキシを正しく設定する方法については、 [リバースプロキシの背後でTiDBダッシュボードを使用する](/dashboard/dashboard-ops-reverse-proxy.md)と[セキュリティTiDBダッシュボード](/dashboard/dashboard-ops-security.md)ご覧ください。

## ブラウザの互換性 {#browser-compatibility}

TiDB ダッシュボードは、比較的新しいバージョンの次の一般的なデスクトップ ブラウザーで使用できます。

-   クローム &gt;= 77
-   Firefox &gt;= 68
-   エッジ &gt;= 17

> **注記：**
>
> 上記のブラウザまたは以前のバージョンのブラウザ、あるいはその他のブラウザを使用して TiDB ダッシュボードにアクセスすると、一部の関数が正しく動作しない可能性があります。

## サインイン {#sign-in}

TiDB ダッシュボードにアクセスすると、ユーザー ログイン インターフェイスに移動します。

-   TiDB `root`アカウントを使用して TiDB ダッシュボードにサインインできます。
-   TiDBダッシュボードには、シングルサインオン（SSO）経由でサインインすることもできます。詳細については、 [TiDBダッシュボードのSSOを構成する](/dashboard/dashboard-session-sso.md)ご覧ください。
-   [ユーザー定義SQLユーザー](/dashboard/dashboard-user.md)作成した場合は、このアカウントと対応するパスワードを使用してサインインできます。

次のいずれかの状況が存在する場合、ログインが失敗する可能性があります。

-   TiDB `root`ユーザーが存在しません。
-   PD が起動していないか、アクセスできません。
-   TiDB が起動されていないか、アクセスできません。
-   パスワードが`root`間違っています。

サインイン後、セッションは24時間有効です。サインアウトの方法については、 [ログアウト](#logout)セクションをご覧ください。

## 言語を切り替える {#switch-language}

TiDB ダッシュボードでは次の言語がサポートされています。

-   英語
-   中国語（簡体字）

**SQL ユーザー サインイン**ページで、**言語の**切り替えドロップダウン リストをクリックしてインターフェイス言語を切り替えることができます。

![Switch language](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-access-switch-language.png)

## ログアウト {#logout}

ログインしたら、左側のナビゲーションバーにあるログインユーザー名をクリックしてユーザーページに切り替えます。ユーザーページの**「ログアウト」**ボタンをクリックすると、現在のユーザーがログアウトします。ログアウト後、ユーザー名とパスワードを再度入力する必要があります。

![Logout](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-access-logout.png)
