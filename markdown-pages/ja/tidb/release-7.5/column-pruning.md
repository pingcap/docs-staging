---
title: Column Pruning
summary: 列プルーニングは、演算子で使用されない列を削除し、I/Oリソースの使用量を減らし、最適化を容易にします。例えば、テーブルtに4つの列(a、b、c、d)があり、クエリで列aと列bのみ使用される場合、列cと列dは冗長であり、プルーニングできます。TiDBはロジック最適化フェーズ中にトップダウンスキャンを実行し、冗長な列を削除します。このプロセスは「カラムの剪定」と呼ばれ、columnPrunerルールに対応します。
---

# カラムの剪定 {#column-pruning}

列プルーニングの基本的な考え方は、演算子で使用されない列については、オプティマイザーが最適化中にそれらを保持する必要がないということです。これらの列を削除すると、I/O リソースの使用量が減り、その後の最適化が容易になります。以下は列の繰り返しの例です。

テーブル t に 4 つの列 (a、b、c、および d) があるとします。次のステートメントを実行できます。

```sql
select a from t where b> 5
```

このクエリでは、列 a と列 b のみが使用され、列 c と列 d は冗長です。このステートメントのクエリ プランに関して、 `Selection`演算子は列 b を使用します。次に、 `DataSource`演算子は列 a と列 b を使用します。列 c と列 d は、 `DataSource`演算子が読み取らないため、プルーニングできます。

したがって、TiDB がロジック最適化フェーズ中にトップダウン スキャンを実行すると、リソースの無駄を削減するために冗長な列が削除されます。このスキャン プロセスは「カラムの剪定」と呼ばれ、 `columnPruner`ルールに対応します。このルールを無効にする場合は、 [最適化ルールと式プッシュダウンのブロックリスト](/blocklist-control-plan.md)を参照してください。