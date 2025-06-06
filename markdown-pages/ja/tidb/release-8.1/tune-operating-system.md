---
title: Tune Operating System Performance
summary: オペレーティング システムのパラメータを調整する方法を学びます。
---

# オペレーティングシステムのパフォーマンスを調整する {#tune-operating-system-performance}

このドキュメントでは、CentOS 7 の各サブシステムをチューニングする方法を紹介します。

> **注記：**
>
> -   CentOS 7オペレーティングシステムのデフォルト構成は、中程度のワークロードで実行されるほとんどのサービスに適しています。特定のサブシステムのパフォーマンスを調整すると、他のサブシステムに悪影響を与える可能性があります。そのため、システムをチューニングする前に、すべてのユーザーデータと設定情報をバックアップしてください。
> -   すべての変更を本番環境に適用する前に、テスト環境で完全にテストします。

## パフォーマンス分析方法 {#performance-analysis-methods}

システムチューニングは、システムパフォーマンス分析の結果に基づいて行う必要があります。このセクションでは、パフォーマンス分析の一般的な手法を紹介します。

### 60秒で {#in-60-seconds}

[*60,000ミリ秒でLinuxのパフォーマンス分析*](http://www.brendangregg.com/Articles/Netflix_Linux_Perf_Analysis_60s.pdf) 、著者のBrendan Gregg氏とNetflixパフォーマンスエンジニアリングチームによって公開されています。使用されているツールはすべてLinuxの公式リリースから入手できます。以下のリスト項目の出力を分析することで、最も一般的なパフォーマンス問題のトラブルシューティングを行うことができます。

-   `uptime`
-   `dmesg | tail`
-   `vmstat 1`
-   `mpstat -P ALL 1`
-   `pidstat 1`
-   `iostat -xz 1`
-   `free -m`
-   `sar -n DEV 1`
-   `sar -n TCP,ETCP 1`
-   `top`

詳しい使用方法については、対応する`man`説明を参照してください。

### パフォーマンス {#perf}

perf は、Linux カーネルが提供する重要なパフォーマンス解析ツールです。ハードウェアレベル（CPU/PMU、パフォーマンス監視ユニット）の機能とソフトウェアレベル（ソフトウェアカウンタ、トレースポイント）の機能の両方をカバーしています。詳細な使用方法については、 [perf の例](http://www.brendangregg.com/perf.html#Background)参照してください。

### BCC/bpftrace {#bcc-bpftrace}

CentOS 7.6以降、LinuxカーネルはBerkeley Packet Filter（BPF）をサポートしています。そのため、 [60秒で](#in-60-seconds)の結果に基づいて適切なツールを選択し、詳細な分析を行うことができます。perf/ftraceと比較すると、BPFはプログラマビリティが高く、パフォーマンスオーバーヘッドが少ないという利点があります。kprobeと比較すると、BPFはセキュリティが高く、本番環境に適しています。BCCツールキットの詳細な使用方法については、 [BPF コンパイラ コレクション (BCC)](https://github.com/iovisor/bcc/blob/master/README.md)参照してください。

## パフォーマンスチューニング {#performance-tuning}

このセクションでは、分類されたカーネル サブシステムに基づいたパフォーマンス チューニングについて説明します。

### CPU—周波数スケーリング {#cpu-frequency-scaling}

cpufreq は、CPU周波数を動的に調整するモジュールです。5つのモードをサポートしています。サービスのパフォーマンスを確保するには、パフォーマンスモードを選択し、動的な調整を行わずにCPU周波数をサポートされている最高動作周波数に固定します。この操作を行うコマンドは`cpupower frequency-set --governor performance`です。

### CPU—割り込み親和性 {#cpu-interrupt-affinity}

-   `irqbalance`サービスを通じて自動バランスを実現できます。
-   手動バランス:
    -   割り込みのバランスをとる必要があるデバイスを特定します。CentOS 7.5以降では、 `be2iscsi`ドライバとNVMe設定を使用するデバイスなど、特定のデバイスとそのドライバに対して、システムが最適な割り込みアフィニティを自動的に設定します。これらのデバイスに対しては、手動で割り込みアフィニティを設定することはできなくなりました。
    -   その他のデバイスについては、チップのマニュアルを参照して、これらのデバイスが割り込み分散をサポートしているかどうかを確認してください。
        -   そうでない場合、これらのデバイスのすべての割り込みは同じ CPU にルーティングされ、変更できなくなります。
        -   該当する場合は、 `smp_affinity`マスクを計算し、対応する設定ファイルを設定します。詳細については、 [カーネルドキュメント](https://www.kernel.org/doc/Documentation/IRQ-affinity.txt)参照してください。

### NUMA CPU バインディング {#numa-cpu-binding}

NUMA（Non-Uniform Memory Access）ノードをまたがるメモリを可能な限り回避するには、スレッド／プロセスを特定のCPUコアにバインドし、そのCPUアフィニティを設定することができます。通常のプログラムの場合、CPUバインドには`numactl`コマンドを使用できます。詳細な使用方法については、Linuxのマニュアルページを参照してください。ネットワークインターフェースカード（NIC）の割り込みについては、 [ネットワークを調整する](#network-tuning)参照してください。

### メモリ - 透過的巨大ページ (THP) {#memory-transparent-huge-page-thp}

データベースアプリケーションではTHPの使用は推奨**されません**。データベースは連続的なメモリアクセスパターンではなく、スパースなメモリアクセスパターンを持つことが多いためです。高レベルのメモリ断片化が深刻な場合、THPページ割り当て時にレイテンシーが増大します。THPでダイレクトコンパクションを有効にすると、CPU使用率が急上昇します。したがって、THPを無効にすることをお勧めします。

```shell
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag
```

### メモリ - 仮想メモリパラメータ {#memory-virtual-memory-parameters}

-   `dirty_ratio`パーセント比。ダーティページキャッシュの総量がシステムメモリ全体のこのパーセント比に達すると、システムは`pdflush`オペレーションを使用してダーティページキャッシュをディスクに書き込みます。デフォルト値の`dirty_ratio`は 20% であり、通常は調整する必要はありません。NVMe デバイスなどの高性能 SSD の場合、この値を下げるとメモリ回収の効率が向上します。
-   `dirty_background_ratio`パーセント比。ダーティページキャッシュの総量がシステムメモリ全体のこのパーセント比に達すると、システムはバックグラウンドでダーティページキャッシュをディスクに書き込み始めます。デフォルト値は`dirty_background_ratio`で、10% であり、通常は調整する必要はありません。NVMe デバイスなどの高性能 SSD の場合、値を低く設定するとメモリ回収の効率が向上します。

### ストレージとファイルシステム {#storage-and-file-system}

コア I/O スタック リンクは、ファイル システムレイヤー、ブロック デバイスレイヤー、およびドライバーレイヤーを含めて長くなります。

#### I/Oスケジューラ {#i-o-scheduler}

I/Oスケジューラは、storageデバイス上でI/O操作を実行するタイミングと時間を決定します。I/Oエレベータとも呼ばれます。SSDデバイスの場合、I/Oスケジューリングポリシーを`noop`に設定することをお勧めします。

```shell
echo noop > /sys/block/${SSD_DEV_NAME}/queue/scheduler
```

#### フォーマットパラメータ - ブロックサイズ {#formatting-parameters-block-size}

ブロックはファイルシステムの作業単位です。ブロックサイズは、1つのブロックに保存できるデータの量を決定し、それによって1回あたりに書き込んだり読み込んだりするデータの最小量を決定します。

デフォルトのブロックサイズは、ほとんどのシナリオに適しています。ただし、ブロックサイズ（または複数のブロックのサイズ）が、通常毎回読み書きされるデータ量と同じか、わずかに大きい場合、ファイルシステムのパフォーマンスが向上し、データstorageの効率も向上します。小さなファイルは依然としてブロック全体を使用します。ファイルを複数のブロックに分散させることも可能ですが、実行時のオーバーヘッドが増加します。

`mkfs`コマンドを使用してデバイスをフォーマットする場合、ファイルシステムオプションの一部としてブロックサイズを指定します。ブロックサイズを指定するパラメータはファイルシステムによって異なります。詳細については、対応する`mkfs`マニュアルページ（例： `man mkfs.ext4`を参照してください。

#### <code>mount</code>パラメータ {#code-mount-code-parameters}

`mount`コマンドで`noatime`オプションが有効になっている場合、ファイルの読み取り時にメタデータの更新が無効になります。5 `nodiratime`動作が有効になっている場合、ディレクトリの読み取り時にメタデータの更新が無効になります。

### ネットワークチューニング {#network-tuning}

ネットワークサブシステムは、繊細な接続を持つ多くの異なる部分で構成されています。CentOS 7のネットワークサブシステムは、ほとんどのワークロードで最高のパフォーマンスを提供するように設計されており、これらのワークロードのパフォーマンスを自動的に最適化します。そのため、通常、ネットワークパフォーマンスを手動で調整する必要はありません。

ネットワークの問題は通常、ハードウェアまたは関連デバイスの問題によって引き起こされます。そのため、プロトコルスタックを調整する前に、ハードウェアの問題を除外してください。

ネットワーク スタックは大部分が自己最適化されていますが、ネットワーク パケット処理における次の側面がボトルネックとなり、パフォーマンスに影響を及ぼす可能性があります。

-   NICハードウェアキャッシュ：ハードウェアレベルでパケットロスを正しく監視するには、コマンド`ethtool -S ${NIC_DEV_NAME}`使用してフィールド`drops`監視します。パケットロスが発生した場合、ハード/ソフト割り込みの処理速度がNICの受信速度に追いつかない可能性があります。受信バッファサイズが上限を下回っている場合は、パケットロスを回避するためにRXバッファを増やすことも検討できます。クエリコマンドは`ethtool -g ${NIC_DEV_NAME}` 、変更コマンドは`ethtool -G ${NIC_DEV_NAME}`です。

-   ハードウェア割り込み：NICが受信側スケーリング（RSS、マルチNIC受信とも呼ばれる）機能をサポートしている場合は、 `/proc/interrupts` NIC割り込みを確認してください。割り込みが不均等な場合は、 [CPU—周波数スケーリング](#cpufrequency-scaling) 、 [CPU—割り込み親和性](#cpuinterrupt-affinity) 、および[NUMA CPU バインディング](#numa-cpu-binding)参照してください。NICがRSSをサポートしていない場合、またはRSSの数が物理CPUコア数よりも大幅に少ない場合は、受信パケットステアリング（RPS、RSSのソフトウェア実装とみなすことができます）と、RPSの拡張である受信フローステアリング（RFS）を設定してください。詳細な設定については、 [カーネルドキュメント](https://www.kernel.org/doc/Documentation/networking/scaling.txt)参照してください。

-   ソフトウェア割り込み： `/proc/net/softnet_stat`の監視を監視します。3列目以外の列の値が増加している場合は、 `softirq`の`net.core.netdev_budget`または`net.core.dev_weight`の値を適切に調整して、CPU 時間を増やします。さらに、CPU 使用率も確認し、どのタスクが頻繁に CPU を使用しているか、そしてそれらを最適化できるかどうかを特定する必要があります。

-   アプリケーションソケットの受信キュー： `ss -nmp`目のうち`Resv-q`列目を監視します。キューがいっぱいの場合は、アプリケーションソケットのキャッシュサイズを増やすか、自動キャッシュ調整機能の使用を検討してください。さらに、アプリケーションレイヤーのアーキテクチャを最適化し、ソケットの読み取り間隔を短縮できるかどうかも検討してください。

-   イーサネット フロー制御: NIC とスイッチがフロー制御機能をサポートしている場合は、この機能を使用して、カーネルが NIC キュー内のデータを処理するための時間を確保し、NIC バッファ オーバーフローの問題を回避できます。

-   割り込みの統合：ハードウェア割り込みが多すぎるとシステムパフォーマンスが低下し、ハードウェア割り込みが遅すぎるとパケット損失が発生します。新しいNICは割り込み統合機能をサポートしており、ドライバがハードウェア割り込みの数を自動的に調整できます。この機能を有効にするには`ethtool -c ${NIC_DEV_NAME}` 、有効にするには`ethtool -C ${NIC_DEV_NAME}`実行します。アダプティブモードでは、NICが割り込み統合を自動的に調整します。このモードでは、ドライバはトラフィックモードとカーネル受信モードをチェックし、パケット損失を防ぐためにリアルタイムで統合設定を評価します。NICのブランドによって機能やデフォルト設定が異なります。詳細については、NICのマニュアルを参照してください。

-   アダプタキュー：カーネルはプロトコルスタックを処理する前に、このキューを使用してNICが受信したデータをバッファリングします。各CPUには独自のバックログキューがあります。このキューにキャッシュできるパケットの最大数は`netdev_max_backlog`です。2列目の`/proc/net/softnet_stat`注目してください。行の2列目が増加し続ける場合、CPU [行-1]キューがいっぱいになり、データパケットが失われていることを意味します。この問題を解決するには、 `net.core.netdev_max_backlog`値を2倍に増やし続けます。

-   送信キュー：送信キューの長さは、送信前にキューイングできるパケット数を決定します。デフォルト値は`1000`で、10 Gbps には十分です。ただし、 `ip -s link`の出力から TX errors の値を確認した場合は、これを倍の`ip link set dev ${NIC_DEV_NAME} txqueuelen 2000`に設定してみてください。

-   Driver：NICドライバは通常、チューニングパラメータを提供します。デバイスのハードウェアマニュアルとドライバのドキュメントを参照してください。
