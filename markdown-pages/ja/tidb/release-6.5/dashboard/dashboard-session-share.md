---
title: Share TiDB Dashboard Sessions
summary: Learn how to share the current TiDB Dashboard session to other users.
---

# TiDB ダッシュボード セッションを共有する {#share-tidb-dashboard-sessions}

TiDB ダッシュボードの現在のセッションを他のユーザーと共有して、ユーザー パスワードを入力せずに TiDB ダッシュボードにアクセスして操作できるようにすることができます。

## 招待者の手順 {#steps-for-the-inviter}

1.  TiDB ダッシュボードにサインインします。

2.  左側のサイドバーでユーザー名をクリックして、構成ページにアクセスします。

3.  **[現在のセッションを共有]**をクリックします。

    ![Sample Step](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-session-share-settings-1-v650.png)

    > **ノート：**
    >
    > セキュリティ上の理由から、共有セッションを再度共有することはできません。

4.  ポップアップ ダイアログで共有設定を調整します。

    -   有効期限: 共有セッションが有効になる期間。現在のセッションからサインアウトしても、共有セッションの有効時間には影響しません。

    -   読み取り専用権限として共有: 共有セッションでは読み取り操作のみが許可され、書き込み操作 (構成の変更など) は許可されません。

5.  **[認証コードの生成]**をクリックします。

    ![Sample Step](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-session-share-settings-2-v650.png)

6.  生成された**認証コードを、**セッションを共有するユーザーに提供します。

    ![Sample Step](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-session-share-settings-3-v650.png)

    > **警告：**
    >
    > 認証コードは安全に保管し、信頼できない人には送信しないでください。そうしないと、彼らはあなたの許可なしに TiDB ダッシュボードにアクセスして操作できるようになります。

## 招待者の手順 {#steps-for-the-invitee}

1.  TiDB ダッシュボードのサインイン ページで、 **[Use Alternative Authentication]**をクリックします。

    ![Sample Step](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-session-share-signin-1-v650.png)

2.  **[Authorization Code]**をクリックして、サインインに使用します。

    ![Sample Step](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-session-share-signin-2-v650.png)

3.  招待者から受け取った認証コードを入力します。

4.  **[サインイン]**をクリックします。

    ![Sample Step](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-session-share-signin-3-v650.png)
