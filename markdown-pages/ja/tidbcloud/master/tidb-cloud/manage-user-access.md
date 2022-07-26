---
title: Manage Console User Access
summary: Learn how to manage the user access of the TiDB Cloud console.
---

# コンソール ユーザー アクセスの管理 {#manage-console-user-access}

このドキュメントでは、 [TiDB Cloudコンソール](https://tidbcloud.com/console)のユーザ アクセスを管理する方法について説明します。

## ログイン {#sign-in}

1.  TiDB Cloudのログイン ページに移動します。 [https://tidbcloud.com](https://tidbcloud.com) .

2.  TiDB Cloudのログイン ページで、Google、GitHub、またはメールでサインインします。

## サインアウト {#sign-out}

TiDB Cloudコンソールの右上隅にあるアカウント名をクリックし、[**ログアウト**] を選択します。

## ユーザーのパスワードを管理する {#manage-user-passwords}

> **ノート：**
>
> このセクションの内容は、電子メールとパスワードによるTiDB Cloud登録にのみ適用されます。 Google または GitHub でTiDB Cloudにサインアップした場合、パスワードは Google または GitHub によって管理され、 TiDB Cloudコンソールを使用して変更することはできません。

TiDB Cloudアカウントのパスワードは、次の要件を満たす必要があります。

-   パスワードの長さは 8 文字以上にする必要があります。
-   パスワードには、少なくとも 1 つの大文字、1 つの小文字、および 1 つの数字を含める必要があります。

システムのセキュリティを向上させるために、電子メールとパスワードでTiDB Cloudにサインアップする場合は、90 日ごとにパスワードをリセットすることをお勧めします。

パスワードを変更するには、次の手順を実行します。

1.  TiDB Cloudコンソールの右上隅にあるアカウント名をクリックします。

2.  [**アカウント]**をクリックします。

3.  [**パスワードの変更**] タブをクリックします。

4.  [**パスワードの変更]**をクリックし、メール ボックスでパスワードをリセットするためのリンクを確認します。

> **ノート：**
>
> 新しいパスワードは、以前の 4 つのパスワードのいずれとも同じであってはなりません。

パスワードが 90 日以内に変更されない場合、 TiDB Cloudにログインするときにパスワードをリセットするように求めるプロンプトが表示されます。プロンプトに従ってパスワードをリセットすることをお勧めします。

## ユーザー プロファイルの管理 {#manage-user-profiles}

TiDB Cloudでは、名、姓、電話番号などのプロファイルを簡単に管理できます。

1.  TiDB Cloudコンソールの右上隅にあるアカウント名をクリックします。

2.  [**アカウント]**をクリックします。デフォルトでは、[<strong>プロファイル</strong>] タブが選択されています。

3.  プロファイル情報を更新し、[**保存**] をクリックします。

## 組織とプロジェクトをビュー {#view-the-organization-and-project}

TiDB Cloudは、TiDB クラスターの管理を容易にするために、組織とプロジェクトに基づく階層構造を提供します。組織とプロジェクトの階層では、組織には複数のプロジェクトと組織メンバーを含めることができ、プロジェクトには複数のクラスターとプロジェクト メンバーを含めることができます。

この構造の下で：

-   課金は組織レベルで行われますが、各プロジェクトとクラスターでの使用状況の可視性は維持されます。

-   組織内のすべてのメンバーを表示できます。

-   プロジェクトのすべてのメンバーを表示することもできます。

組織の下にあるプロジェクトのクラスターにアクセスするには、ユーザーは組織のメンバーであり、プロジェクトのメンバーでもある必要があります。組織の所有者は、プロジェクトに参加するようユーザーを招待して、プロジェクト内のクラスターを作成および管理できます。

自分が所属している組織を表示するには、次の手順を実行します。

1.  TiDB Cloudコンソールの右上隅にあるアカウント名をクリックします。
2.  ドロップダウン メニューで [**組織の切り替え**] を選択すると、所属するすべての組織がサブメニューに表示されます。

自分が所属しているプロジェクトを確認するには、次の手順を実行します。

1.  TiDB Cloudコンソールの右上隅にあるアカウント名をクリックします。
2.  [**組織の設定]**をクリックします。デフォルトでは、[<strong>プロジェクト</strong>] タブが表示されます。

## 組織を切り替える {#switch-between-organizations}

複数の組織のメンバーである場合は、組織間でアカウントを切り替えることができます。

組織を切り替えるには、次の手順を実行します。

1.  TiDB Cloudコンソールの右上隅にあるアカウント名をクリックします。
2.  ドロップダウン メニューで [組織の**切り替え**] を選択し、切り替え先の組織をクリックします。

## 組織のメンバーを招待する {#invite-an-organization-member}

組織の所有者は、組織のメンバーを招待できます。それ以外の場合は、このセクションをスキップしてください。

メンバーを組織に招待するには、次の手順を実行します。

1.  TiDB Cloudコンソールの右上隅にあるアカウント名をクリックします。

2.  [**組織の設定]**をクリックします。組織設定ページが表示されます。

3.  [**ユーザー管理]**をクリックし、[<strong>すべてのユーザー</strong>] タブを選択します。

4.  [**招待] を**クリックします。

5.  招待するユーザーの電子メール アドレスを入力し、ユーザーのロールを選択してから、ユーザーのプロジェクトを選択します。

    > **ヒント：**
    >
    > 一度に複数のメンバーを招待する場合は、複数のメール アドレスを入力できます。

6.  [**確認]**をクリックします。その後、新しいユーザーがユーザー リストに正常に追加されます。同時に、招待された電子メール アドレスに確認リンクを含む電子メールが送信されます。

7.  この電子メールを受信した後、ユーザーは電子メール内のリンクをクリックして身元を確認する必要があり、新しいページが表示されます。

8.  招待された電子メール アドレスがTiDB Cloudアカウントにサインアップしていない場合、ユーザーはアカウントを作成するためのサインアップ ページに誘導されます。電子メール アドレスがTiDB Cloudアカウントにサインアップされている場合、ユーザーはサインイン ページに誘導され、サインイン後、アカウントは自動的に組織に参加します。

> **ノート：**
>
> メール内の確認リンクは 24 時間で期限切れになります。ユーザーがメールを受信しない場合は、[**再送信**] をクリックします。

## プロジェクトメンバーを招待する {#invite-a-project-member}

組織の所有者は、プロジェクト メンバーを招待できます。それ以外の場合は、このセクションをスキップしてください。

メンバーをプロジェクトに招待するには、次の手順を実行します。

1.  TiDB Cloudコンソールの右上隅にあるアカウント名をクリックします。

2.  [**組織の設定]**をクリックします。組織設定ページが表示されます。

3.  [**ユーザー管理]**をクリックし、[<strong>プロジェクト</strong>別] タブを選択します。

4.  [**招待] を**クリックします。

5.  招待するユーザーの電子メール アドレスを入力し、ユーザーのロールを選択してから、ユーザーのプロジェクトを選択します。

    > **ヒント：**
    >
    > 一度に複数のメンバーを招待する場合は、複数のメール アドレスを入力できます。

6.  [**確認]**をクリックします。その後、新しいユーザーがユーザー リストに正常に追加されます。同時に、招待された電子メール アドレスに確認リンクを含む電子メールが送信されます。

7.  この電子メールを受信した後、ユーザーは電子メール内のリンクをクリックして身元を確認する必要があり、新しいページが表示されます。

8.  新しいページで、ユーザーはライセンスを表示して同意し、[**送信**] をクリックしてTiDB Cloudにアカウントを作成する必要があります。その後、ユーザーはログイン ページにリダイレクトされます。

> **ノート：**
>
> メール内の確認リンクは 24 時間で期限切れになります。ユーザーがメールを受信しない場合は、[**再送信**] をクリックします。

## メンバーの役割を構成する {#configure-member-roles}

組織の所有者である場合は、次の手順を実行して、組織メンバーの役割を構成できます。

1.  TiDB Cloudコンソールの右上隅にあるアカウント名をクリックします。
2.  [**組織の設定]**をクリックします。組織設定ページが表示されます。
3.  [**ユーザー管理]**をクリックし、[<strong>すべてのユーザー</strong>] タブを選択します。
4.  対象メンバーの役割をクリックし、役割を変更します。

組織には 4 つの役割があります。各ロールの権限は次のとおりです。

| 許可                                | オーナー | メンバー | 請求管理者 | 監査管理者 |
| --------------------------------- | ---- | ---- | ----- | ----- |
| メンバーを組織に招待し、組織からメンバーを削除します        | ✅    | ❌    | ❌     | ❌     |
| 組織メンバーの役割を設定する                    | ✅    | ❌    | ❌     | ❌     |
| プロジェクトの作成と名前変更                    | ✅    | ❌    | ❌     | ❌     |
| メンバーをプロジェクトに招待し、プロジェクトからメンバーを削除する | ✅    | ❌    | ❌     | ❌     |
| タイムゾーンを編集                         | ✅    | ❌    | ❌     | ❌     |
| 請求書のビューと支払い情報の編集                  | ✅    | ❌    | ✅     | ❌     |
| 監査ログのビューと構成                       | ❌    | ❌    | ❌     | ✅     |
| プロジェクト インスタンスの管理権限を取得する           | ✅    | ✅    | ✅     | ✅     |
| API キーを管理する                       | ✅    | ❌    | ❌     | ❌     |

## 組織のメンバーを削除する {#remove-an-organization-member}

組織の所有者は、組織のメンバーを削除できます。それ以外の場合は、このセクションをスキップしてください。

組織からメンバーを削除するには、次の手順を実行します。

> **ノート：**
>
> メンバーが組織から削除されると、そのメンバーは所属プロジェクトからも削除されます。

1.  TiDB Cloudコンソールの右上隅にあるアカウント名をクリックします。

2.  [**組織の設定]**をクリックします。組織設定ページが表示されます。

3.  [**すべてのユーザー]**をクリックします。

4.  削除するユーザーの行で [**削除]**をクリックします。

## プロジェクト メンバーを削除する {#remove-a-project-member}

組織の所有者は、プロジェクト メンバーを削除できます。それ以外の場合は、このセクションをスキップしてください。

プロジェクトからメンバーを削除するには、次の手順を実行します。

1.  TiDB Cloudコンソールの右上隅にあるアカウント名をクリックします。

2.  [**組織の設定]**をクリックします。組織設定ページが表示されます。

3.  [**プロジェクト**別] をクリックします。

4.  削除するユーザーの行で [**削除]**をクリックします。

## ローカル タイム ゾーンを設定する {#set-the-local-time-zone}

組織の所有者である場合は、タイム ゾーンに応じてシステムの表示時間を変更できます。

ローカル タイムゾーンの設定を変更するには、次の手順を実行します。

1.  TiDB Cloudコンソールの右上隅にあるアカウント名をクリックします。

2.  [**組織の設定]**をクリックします。組織設定ページが表示されます。

3.  [**タイム ゾーン]**をクリックします。

4.  ドロップダウン リストをクリックして、タイム ゾーンを選択します。

5.  [**確認]**をクリックします。
