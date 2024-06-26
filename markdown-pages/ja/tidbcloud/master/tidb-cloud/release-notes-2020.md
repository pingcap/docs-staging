---
title: TiDB Cloud Release Notes in 2020
summary: TiDB Cloudの2020年のリリースノートには、12月30日にデフォルトのTiDBバージョンをv4.0.9にアップグレードし、クライアント障害ゼロを実現するなどの変更が含まれています。12月16日には、TiDBノードの最小数を調整し、システムコマンドの実行を禁止しました。11月24日には、パブリックアクセスを無効にする変更があります。11月4日には、組織名の変更機能を実装し、デフォルトのTiDBクラスターバージョンを4.0.8にアップグレードしました。10月12日には、SQL WebShellクライアントを変更し、バックアップの保存期間を延長しました。9月14日には、監視メトリクスを修正し、非HTAPクラスターの問題を修正しました。9月11日には、お客様がトラフィックフィルターを備えたパブリックエンドポイントを使用できるようになりました。9月4日には、招待メール内の間違ったURLを修正しました。8月6日には、電子メールサポートをTiDB Cloudカスタマーサポートへの訪問に変更し、VPCピアリングを設定する機能を追加しました。7月17日には、自動日次バックアップの保持期間を調整し、異常なステータスのクラスターに理由を追加しました。
---

# 2020 年のTiDB Cloudリリース ノート {#tidb-cloud-release-notes-in-2020}

このページには2020年[TiDB Cloud](https://www.pingcap.com/tidb-cloud/)のリリースノートを記載しています。

## 2020年12月30日 {#december-30-2020}

-   デフォルトの TiDB バージョンを v4.0.9 にアップグレードします。
-   TiDB のアップグレードとスケーリングを適切にサポートし、クライアント障害ゼロを実現します
-   バックアップから新しいクラスターを復元した後にクラスター構成を復元する

## 2020年12月16日 {#december-16-2020}

-   すべてのクラスター層で TiDB ノードの最小数を 1 に調整します。
-   SQL Web シェルでのシステム コマンドの実行を禁止する
-   TiDB クラスターの redact-log をデフォルトで有効にする

## 2020年11月24日 {#november-24-2020}

-   パブリック アクセスを無効にするために、TiDB クラスターのパブリック エンドポイントのトラフィック フィルター IP リストを空にすることを許可します。
-   Outlook または Hotmail を使用して顧客に送信される招待メールの配信率を向上させる
-   サインアップのエラー通知メッセージを改善する
-   新しいクラスターは Ubuntu ではなく CentOS VM 上で実行されます
-   対応するバックアップがまだ存在する場合にクラスターがごみ箱に表示されない問題を修正

## 2020年11月4日 {#november-4-2020}

-   組織名の変更機能を実装
-   データの復元中にユーザーが TiDB にアクセスできないようにする
-   サインアップページで利用規約とプライバシーの場所を更新します
-   フィードバックフォーム入口ウィジェットを追加する
-   メンバーが「設定」タブで所有者を削除できないようにする
-   TiFlashおよび TiKVstorageチャートのメトリクスを変更する
-   デフォルトの TiDB クラスターのバージョンを 4.0.8 にアップグレードします。

## 2020年10月12日 {#october-12-2020}

-   SQL WebShell クライアントを Oracle MySQL クライアントから`usql`のクライアントに変更します。
-   デフォルトの TiDB バージョンを 4.0.7 にアップグレードします。
-   手動バックアップの保存期間を 7 日から 30 日に延長します

## 2020年10月2日 {#october-2-2020}

-   TiFlashディスクstorage構成を修正

## 2020年9月14日 {#september-14-2020}

-   `region`ラベルを追加して監視メトリクスを修正する
-   非 HTAP クラスターをスケーリングできない問題を修正

## 2020年9月11日 {#september-11-2020}

-   お客様は、トラフィック フィルターを備えたパブリック エンドポイントを使用して TiDB にアクセスできるようになりました
-   自動バックアップ設定ダイアログにタイムゾーンインジケーターを追加します
-   登録が完了していない場合に壊れた招待リンクを修正

## 2020年9月4日 {#september-4-2020}

-   招待メール内の間違った URL を修正する

## 2020年8月6日 {#august-6-2020}

-   電子メール サポートをTiDB Cloudカスタマー サポートへの訪問に変更する
-   カスタムメールログイン用のシンプルな 2FA 機能を追加します
-   VPCピアリングを設定する機能を追加
-   サインアップ/ログイン用のカスタム電子メール サポートを追加する

## 2020年7月17日 {#july-17-2020}

-   自動日次バックアップのデフォルトの保持期間を 7 日間に調整します
-   異常なステータスのクラスターのツールチップに理由を追加する
-   初期クレジットが 0 の場合でもユーザーがクラスターを作成できる問題を修正
-   ダッシュボードの統合を最適化する
-   顧客にクレジットを追加するときにメールを送信する
-   テナント設定ページでテナント ID を追加します
-   ユーザーのクォータ制限に合わせて適切な通知メッセージを最適化します。
-   バックアップ/復元メトリクスを修正する
