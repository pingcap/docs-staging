---
title: TiDB 3.0.7 Release Notes
summary: TiDB 3.0.7 は 2019 年 12 月 4 日にリリースされました。ロック TTL、タイムゾーン解析、結果の精度、データの精度、統計の精度に関連する問題の修正が含まれています。また、TiKV には、デッドロック検出を改善し、メモリリークの問題を修正するための更新も含まれています。
---

# TiDB 3.0.7 リリースノート {#tidb-3-0-7-release-notes}

発売日: 2019年12月4日

TiDB バージョン: 3.0.7

TiDB Ansible バージョン: 3.0.7

## ティビ {#tidb}

-   TiDB サーバーのローカル時間が PD のタイムスタンプ[＃13868](https://github.com/pingcap/tidb/pull/13868)より遅れているためにロック TTL の値が大きすぎる問題を修正しました
-   `gotime.Local` [＃13793](https://github.com/pingcap/tidb/pull/13793)使用して文字列から日付を解析した後にタイムゾーンが正しくない問題を修正しました
-   `builtinIntervalRealSig` [＃13767](https://github.com/pingcap/tidb/pull/13767)の実装で`binSearch`関数がエラーを返さないため、結果が不正確になる可能性がある問題を修正しました。
-   整数を符号なし浮動小数点型または小数点型に変換すると精度が失われ、データが正しくなくなる問題を修正[＃13755](https://github.com/pingcap/tidb/pull/13755)
-   Natural Outer Join および Outer Join [＃13739](https://github.com/pingcap/tidb/pull/13739)で`USING`節が使用されている場合に`not null`フラグが適切にリセットされないため、結果が正しくない問題を修正しました。
-   統計情報の更新時にデータ競合が発生し、統計情報が正確でない問題を修正[＃13687](https://github.com/pingcap/tidb/pull/13687)

## ティクヴ {#tikv}

-   デッドロック検出器が有効な領域のみを監視するようにして、デッドロックマネージャが有効なリージョン[＃6110](https://github.com/tikv/tikv/pull/6110)にあることを確認します。
-   潜在的なメモリリークの問題を修正[＃6128](https://github.com/tikv/tikv/pull/6128)
