---
title: TiDB Dashboard 集群诊断页面
---

# TiDB Dashboard 集群诊断页面

集群诊断是在指定的时间范围内，对集群可能存在的问题进行诊断，并将诊断结果和一些集群相关的负载监控信息汇总成一个诊断报告。诊断报告是网页形式，通过浏览器保存后可离线浏览和传阅。

> **注意：**
>
> 集群诊断功能依赖于集群中部署有 Prometheus 监控组件，参见 [TiUP](/tiup/tiup-overview.md) 部署文档了解如何部署监控组件。若集群中没有部署监控组件，生成的诊断报告中将提示生成失败。

## 访问

可以通过以下两种方法访问集群诊断页面：

* 登录 TiDB Dashboard 后，在左侧导航栏中点击**集群诊断** (Cluster Diagnostics)。

    ![访问](https://docs-download.pingcap.com/media/images/docs-cn/dashboard/dashboard-diagnostics-access-v650.png)

* 在浏览器中访问 [http://127.0.0.1:2379/dashboard/#/diagnose](http://127.0.0.1:2379/dashboard/#/diagnose)（将 `127.0.0.1:2379` 替换为你的实际 PD 地址和端口）。

## 生成诊断报告

如果想对一个时间范围内的集群进行诊断，查看集群的负载等情况，可以使用以下步骤来生成一段时间范围的诊断报告：

1. 设置区间的开始时间，例如 2022-05-21 14:40:00。
2. 设置区间长度。例如 10 min。
3. 点击开始 (Start)。

![生成单个时间段的诊断报告](https://docs-download.pingcap.com/media/images/docs-cn/dashboard/dashboard-diagnostics-gen-report-v650.png)

> **注意：**
>
> 建议生成报告的时间范围在 1 min ~ 60 min 内，目前不建议生成超过 1 小时范围的报告。

以上操作会生成 2022-05-21 14:40:00 至 2022-05-21 14:50:00 时间范围的诊断报告。点击**开始** (start) 后，会看到以下界面，**生成进度** (Progress) 是生成报告的进度条，生成报告完成后，点击**查看报告** (View Full Report) 即可。

![生成报告的进度](https://docs-download.pingcap.com/media/images/docs-cn/dashboard/dashboard-diagnostics-gen-process-v650.png)

## 生成对比诊断报告

如果系统在某个时间点发生异常，如 QPS 抖动或者延迟变高，可以生成一份异常时间范围和正常时间范围的对比报告，例如：

* 系统异常时间段：2022-05-21 14:40:00 ~ 2022-05-21 14:45:00，系统异常时间。
* 系统正常时间段：2022-05-21 14:30:00 ~ 2022-05-21 14:35:00，系统正常时间。

生成以上两个时间范围的对比报告的步骤如下：

1. 设置区间的开始时间，即异常时间段的开始时间，如 2022-05-21 14:40:00。
2. 设置区间长度 (Range Duration)。一般指系统异常的持续时间，例如 5 min。
3. 开启与基线区间对比开关 (Compare by Baseline)。
4. 设置基线开始时间 (Baseline Range Start Time)，即想要对比的系统正常时段的开始时间，如 2022-05-21 14:30:00。
5. 点击开始 (Start)。

![生成对比报告](https://docs-download.pingcap.com/media/images/docs-cn/dashboard/dashboard-diagnostics-gen-compare-report-v650.png)

然后同样等报告生成完成后点击**查看报告** (View Full Report) 即可。

另外，已生成的诊断报告会显式在诊断报告主页的列表里面，可以点击查看之前生成的报告，不用重复生成。
