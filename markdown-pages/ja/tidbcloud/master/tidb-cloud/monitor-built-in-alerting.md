---
title: TiDB Cloud Built-in Alerting
summary: TiDB Cloudからアラート通知を取得して TiDB クラスターを監視する方法を学習します。
---

# TiDB Cloud組み込みアラート {#tidb-cloud-built-in-alerting}

TiDB Cloud を使用すると、アラートの表示、アラート ルールの編集、アラート通知の購読を簡単に行うことができます。

このドキュメントでは、これらの操作を実行する方法について説明し、参考としてTiDB Cloudに組み込まれているアラート条件を示します。

> **注記：**
>
> 現在、アラート機能は[TiDB Cloud専用](/tidb-cloud/select-cluster-tier.md#tidb-cloud-dedicated)クラスターでのみ使用できます。

## アラートをビュー {#view-alerts}

TiDB Cloudでは、アラート ページでアクティブなアラートとクローズされたアラートの両方を表示できます。

1.  [TiDB Cloudコンソール](https://tidbcloud.com/)で、プロジェクトの[**クラスター**](https://tidbcloud.com/console/clusters)ページに移動します。

    > **ヒント：**
    >
    > 複数のプロジェクトがある場合は、<mdsvgicon name="icon-left-projects">左下隅にある をクリックして、別のプロジェクトに切り替えます。</mdsvgicon>

2.  対象クラスターの名前をクリックします。クラスターの概要ページが表示されます。

3.  左側のナビゲーション ペインで**[アラート]**をクリックします。

4.  **アラート**ページには、デフォルトでアクティブなアラートが表示されます。アラート名、トリガー時間、期間など、アクティブなアラートごとの情報を表示できます。

5.  クローズされたアラートも表示したい場合は、 **[ステータス]**ドロップダウン リストをクリックし、 **[クローズ済み]**または**[すべて]**を選択します。

## アラートルールを編集する {#edit-alert-rules}

TiDB Cloudでは、アラートを無効または有効にしたり、アラートしきい値を更新したりすることで、アラート ルールを編集できます。

1.  **[アラート]**ページで、 **[ルールの編集] を**クリックします。
2.  必要に応じてアラート ルールを無効または有効にします。
3.  アラート ルールのしきい値を更新するには、 **[編集]**をクリックします。

    > **ヒント：**
    >
    > 現在、 TiDB Cloudアラート ルールの編集機能が制限されています。一部のアラート ルールは編集をサポートしていません。異なるトリガー条件や頻度を構成したり、アラートによって[ページャーデューティ](https://www.pagerduty.com/docs/guides/datadog-integration-guide/)などのダウンストリーム サービスで自動的にアクションがトリガーされるようにしたい場合は、 [サードパーティの監視とアラートの統合](/tidb-cloud/third-party-monitoring-integrations.md)使用を検討してください。

## アラート通知を購読する {#subscribe-to-alert-notifications}

TiDB Cloudでは、次のいずれかの方法でアラート通知をサブスクライブできます。

-   [メール](/tidb-cloud/monitor-alert-email.md)
-   [スラック](/tidb-cloud/monitor-alert-slack.md)
-   [ズーム](/tidb-cloud/monitor-alert-zoom.md)

## TiDB Cloud組み込みアラート条件 {#tidb-cloud-built-in-alert-conditions}

次の表は、TiDB Cloudに組み込まれているアラート条件とそれに対応する推奨アクションを示しています。

> **注記：**
>
> -   これらの警告状態は必ずしも問題があることを意味するわけではありませんが、多くの場合、新たな問題の発生を早期に警告する指標です。したがって、推奨されるアクションを実行することをお勧めします。
> -   TiDB Cloudコンソールでアラートのしきい値を編集できます。
> -   一部のアラート ルールはデフォルトで無効になっています。必要に応じて有効にすることができます。

### リソース使用状況アラート {#resource-usage-alerts}

| 状態                                          | 推奨されるアクション                                                                                                                                               |
| :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| クラスター全体の TiDB ノードメモリ使用率が 10 分間で 70% を超えました  | 現在のワークロードのメモリ使用量の割合を減らすには、TiDB のノード数またはノード サイズを増やすことを検討してください。                                                                                           |
| クラスター全体の TiKV ノードメモリ使用率が 10 分間で 70% を超えました  | 現在のワークロードのメモリ使用量の割合を減らすには、TiKV のノード数またはノード サイズを増やすことを検討してください。                                                                                           |
| クラスター全体のTiFlashノードメモリ使用率が 10 分間で 70% を超えました | 現在のワークロードのメモリ使用率を下げるには、 TiFlashのノード数またはノード サイズを増やすことを検討してください。                                                                                           |
| TiDBノードのCPU使用率が10分間80%を超えました                | 現在のワークロードの CPU 使用率を下げるには、TiDB のノード数またはノード サイズを増やすことを検討してください。                                                                                            |
| TiKVノードのCPU使用率が10分間80%を超えました                | 現在のワークロードの CPU 使用率を下げるには、TiKV のノード数またはノード サイズを増やすことを検討してください。                                                                                            |
| TiFlashノードの合計 CPU 使用率が 10 分間 80% を超えました     | 現在のワークロードの CPU 使用率を下げるには、 TiFlashのノード数またはノード サイズを増やすことを検討してください。                                                                                         |
| TiKVstorageの使用率が80%を超える                     | storage容量を増やすには、TiKV のノード数またはノードstorageサイズを増やすことを検討してください。                                                                                               |
| TiFlashstorageの使用率が80%を超える                  | storage容量を増やすには、 TiFlashのノード数またはノードstorageサイズを増やすことを検討してください。                                                                                            |
| TiDB ノード全体の最大メモリ使用率が 10 分間 70% を超えました       | 現在のワークロードのメモリ使用率を減らすには、クラスター内に[ホットスポット](/tidb-cloud/tidb-cloud-sql-tuning-overview.md#hotspot-issues)あるかどうかを確認するか、TiDB のノード数またはノード サイズを増やすことを検討してください。   |
| TiKV ノード全体の最大メモリ使用率が 10 分間 70% を超えました       | 現在のワークロードのメモリ使用率を減らすには、クラスター内に[ホットスポット](/tidb-cloud/tidb-cloud-sql-tuning-overview.md#hotspot-issues)あるかどうかを確認するか、TiKV のノード数またはノード サイズを増やすことを検討してください。   |
| TiDB ノード全体の最大 CPU 使用率が 10 分間 80% を超えました     | 現在のワークロードの CPU 使用率を減らすには、クラスター内に[ホットスポット](/tidb-cloud/tidb-cloud-sql-tuning-overview.md#hotspot-issues)あるかどうかを確認するか、TiDB のノード数またはノード サイズを増やすことを検討してください。 |
| TiKV ノード全体の最大 CPU 使用率が 10 分間 80% を超えました     | 現在のワークロードの CPU 使用率を減らすには、クラスター内に[ホットスポット](/tidb-cloud/tidb-cloud-sql-tuning-overview.md#hotspot-issues)あるかどうかを確認するか、TiKV のノード数またはノード サイズを増やすことを検討してください。 |

### データ移行アラート {#data-migration-alerts}

| 状態                                       | 推奨されるアクション                                                                                                                                                                                                                                   |
| :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| データ移行ジョブでデータのエクスポート中にエラーが発生しました          | エラーを確認し、ヘルプについては[データ移行のトラブルシューティング](/tidb-cloud/tidb-cloud-dm-precheck-and-troubleshooting.md#migration-errors-and-solutions)参照してください。                                                                                                       |
| データ移行ジョブでデータのインポート中にエラーが発生しました           | エラーを確認し、ヘルプについては[データ移行のトラブルシューティング](/tidb-cloud/tidb-cloud-dm-precheck-and-troubleshooting.md#migration-errors-and-solutions)参照してください。                                                                                                       |
| 増分移行中にデータ移行ジョブでエラーが発生しました                | エラーを確認し、ヘルプについては[データ移行のトラブルシューティング](/tidb-cloud/tidb-cloud-dm-precheck-and-troubleshooting.md#migration-errors-and-solutions)参照してください。                                                                                                       |
| 増分移行中にデータ移行ジョブが 6 時間以上一時停止されました          | データ増分移行中に、データ移行ジョブが 6 時間以上一時停止されました。アップストリーム データベースのbinlogが消去され (データベースbinlog消去戦略によって異なります)、増分移行が失敗する可能性があります。ヘルプについては[データ移行のトラブルシューティング](/tidb-cloud/tidb-cloud-dm-precheck-and-troubleshooting.md#migration-errors-and-solutions)参照してください。 |
| レプリケーションの遅延は 10 分を超えており、20 分以上も増加し続けています | ヘルプについては[データ移行のトラブルシューティング](/tidb-cloud/tidb-cloud-dm-precheck-and-troubleshooting.md#migration-errors-and-solutions)参照してください。                                                                                                               |

### チェンジフィードアラート {#changefeed-alerts}

| 状態                            | 推奨されるアクション                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| :---------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 変更フィードのレイテンシーが 600 秒を超えています。  | TiDB Cloudコンソールの**Changefeed**ページと**Changefeed の詳細**ページで changefeed のステータスを確認します。この問題の診断に役立つエラー メッセージがいくつか表示されます。<br/>このアラートをトリガーする可能性のある理由は次のとおりです:<ul><li>アップストリームの全体的なトラフィックが増加したため、既存の changefeed 仕様では対応できなくなりました。トラフィックの増加が一時的なものであれば、トラフィックが正常に戻った後に changefeed のレイテンシーは自動的に回復します。トラフィックの増加が継続的である場合は、changefeed をスケールアップする必要があります。</li><li>ダウンストリームまたはネットワークに異常があります。この場合、まずこの異常を解決してください。</li><li>ダウンストリームが RDS の場合、テーブルにインデックスがないため、書き込みパフォーマンスが低下し、レイテンシーが長くなる可能性があります。この場合、アップストリームまたはダウンストリームに必要なインデックスを追加する必要があります。</li></ul>お客様側で問題を解決できない場合は、 [TiDB Cloudサポート](/tidb-cloud/tidb-cloud-support.md)連絡してさらにサポートを受けることができます。 |
| changefeed ステータスは`FAILED`です。  | TiDB Cloudコンソールの**Changefeed**ページと**Changefeed の詳細**ページで changefeed のステータスを確認します。この問題の診断に役立つエラー メッセージがいくつか表示されます。<br/>お客様側で問題を解決できない場合は、 [TiDB Cloudサポート](/tidb-cloud/tidb-cloud-support.md)連絡してさらにサポートを受けることができます。                                                                                                                                                                                                                                                                                                                                                                                                                     |
| changefeed ステータスは`WARNING`です。 | TiDB Cloudコンソールの**Changefeed**ページと**Changefeed の詳細**ページで changefeed のステータスを確認します。この問題の診断に役立つエラー メッセージがいくつか表示されます。<br/>お客様側で問題を解決できない場合は、 [TiDB Cloudサポート](/tidb-cloud/tidb-cloud-support.md)連絡してさらにサポートを受けることができます。                                                                                                                                                                                                                                                                                                                                                                                                                     |
