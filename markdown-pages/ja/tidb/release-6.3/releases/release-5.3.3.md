---
title: TiDB 5.3.3 Release Note
---

# TiDB 5.3.3 リリースノート {#tidb-5-3-3-release-note}

発売日：2022年9月14日

TiDB バージョン: 5.3.3

## バグ修正 {#bug-fix}

-   TiKV

    -   PD リーダーの切り替え後または PD の再起動後にクラスターで SQL 実行エラーが継続して発生する問題を修正します。

        -   原因: この問題は、TiKV が PD クライアントに再接続するまで、ハートビート要求が失敗した後、TiKV が PD クライアントにハートビート情報を送信することを再試行しないという TiKV のバグによって引き起こされます。その結果、障害が発生した TiKV ノードのリージョン情報が古くなり、TiDB が最新のリージョン情報を取得できなくなり、SQL 実行エラーが発生します。
        -   影響を受けるバージョン: v5.3.2 および v5.4.2。この問題は v5.3.3 で修正されています。 v5.3.2 を使用している場合は、クラスターを v5.3.3 にアップグレードできます。
        -   回避策: アップグレードに加えて、送信するリージョンハートビートがなくなるまで、リージョンハートビートを PD に送信できない TiKV ノードを再起動することもできます。

        バグの詳細については、 [#12934](https://github.com/tikv/tikv/issues/12934)を参照してください。
