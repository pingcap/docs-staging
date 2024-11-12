---
title: Access TiDB Dashboard
summary: TiDB ダッシュボードにアクセスするには、ブラウザで指定された URL にアクセスします。複数の PD インスタンスの場合は、アドレスを任意の PD インスタンスのアドレスとポートに置き換えます。新しいバージョンの Chrome、Firefox、または Edge ブラウザを使用します。TiDB ルート アカウントまたはユーザー定義の SQL ユーザーでサインインします。セッションは 24 時間有効です。英語と中国語を切り替えます。ログアウトするには、ユーザー名をクリックしてから [ログアウト] ボタンをクリックします。
---

# TiDBダッシュボードにアクセスする {#access-tidb-dashboard}

TiDB ダッシュボードにアクセスするには、ブラウザから[http://127.0.0.1:2379/ダッシュボード](http://127.0.0.1:2379/dashboard)アクセスします。3 `127.0.0.1:2379`実際の PD インスタンスのアドレスとポートに置き換えます。

> **注記：**
>
> TiDB v6.5.0 以降およびTiDB Operator v1.4.0 以降では、Kubernetes 上に TiDB Dashboard を独立した Pod としてデプロイできます。TiDB TiDB Operatorを使用すると、この Pod の IP アドレスにアクセスして TiDB Dashboard を起動できます。詳細については、 [TiDB ダッシュボードをTiDB Operatorに独立してデプロイ](https://docs.pingcap.com/tidb-in-kubernetes/dev/get-started#deploy-tidb-dashboard-independently)を参照してください。

## 複数のPDインスタンスがデプロイされている場合にTiDBダッシュボードにアクセスする {#access-tidb-dashboard-when-multiple-pd-instances-are-deployed}

クラスターに複数の PD インスタンスがデプロイされていて、**すべての**PD インスタンスとポートに直接アクセスできる場合は、アドレス[http://127.0.0.1:2379/ダッシュボード/](http://127.0.0.1:2379/dashboard/)の`127.0.0.1:2379`を**任意の**PD インスタンス アドレスとポートに置き換えるだけです。

> **注記：**
>
> ファイアウォールまたはリバース プロキシが設定されていて、すべての PD インスタンスに直接アクセスできない場合は、TiDB ダッシュボードにアクセスできない可能性があります。通常、これはファイアウォールまたはリバース プロキシが正しく設定されていないことが原因です。複数の PD インスタンスが展開されている場合にファイアウォールまたはリバース プロキシを正しく設定する方法については、 [リバースプロキシの背後でTiDBダッシュボードを使用する](/dashboard/dashboard-ops-reverse-proxy.md)と[セキュリティTiDB ダッシュボード](/dashboard/dashboard-ops-security.md)を参照してください。

## ブラウザの互換性 {#browser-compatibility}

TiDB ダッシュボードは、比較的新しいバージョンの次の一般的なデスクトップ ブラウザーで使用できます。

-   クロム &gt;= 77
-   Firefox &gt;= 68
-   エッジ &gt;= 17

> **注記：**
>
> 上記のブラウザまたは以前のバージョンのブラウザを使用して TiDB ダッシュボードにアクセスすると、一部の関数が正しく動作しない可能性があります。

## サインイン {#sign-in}

TiDB ダッシュボードにアクセスすると、下の画像に示すように、ユーザー ログイン インターフェイスが表示されます。

-   TiDB `root`アカウントを使用して TiDB ダッシュボードにサインインできます。
-   [ユーザー定義SQLユーザー](/dashboard/dashboard-user.md)を作成した場合は、このアカウントと対応するパスワードを使用してサインインできます。

![Login interface](https://download.pingcap.com/images/docs/dashboard/dashboard-access-login.png)

次のいずれかの状況が存在する場合、ログインが失敗する可能性があります。

-   TiDB `root`ユーザーが存在しません。
-   PD が起動していないか、アクセスできません。
-   TiDB が起動されていないか、アクセスできません。
-   パスワードが`root`間違っています。

サインインすると、セッションは 24 時間有効になります。サインアウトする方法については、セクション[ログアウト](#logout)を参照してください。

## 言語を切り替える {#switch-language}

TiDB ダッシュボードでは次の言語がサポートされています。

-   英語
-   中国語（簡体字）

**SQL ユーザー サインイン**ページで、 **[言語の切り替え]**ドロップダウン リストをクリックしてインターフェイス言語を切り替えることができます。

![Switch language](https://download.pingcap.com/images/docs/dashboard/dashboard-access-switch-language.png)

## ログアウト {#logout}

ログインしたら、左側のナビゲーション バーのログイン ユーザー名をクリックして、ユーザー ページに切り替えます。ユーザー ページの**[ログアウト]**ボタンをクリックして、現在のユーザーをログアウトします。ログアウトした後は、ユーザー名とパスワードを再入力する必要があります。

![Logout](https://download.pingcap.com/images/docs/dashboard/dashboard-access-logout.png)
