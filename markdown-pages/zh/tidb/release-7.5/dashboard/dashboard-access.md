---
title: 访问 TiDB Dashboard
summary: TiDB Dashboard 可通过浏览器访问，支持多 PD 实例访问。浏览器兼容性包括 Chrome、Firefox 和 Edge。登录界面可使用 root 用户或自定义 SQL 用户登录。支持简体中文和英文语言切换。可在用户页面登出当前用户。
---

# 访问 TiDB Dashboard

通过浏览器访问 <http://127.0.0.1:2379/dashboard/>（将 `127.0.0.1:2379` 替换为实际 PD 实例的地址和端口）即可打开 TiDB Dashboard。

> **注意：**
>
> TiDB v6.5.0 且 TiDB Operator v1.4.0 之后，在 Kubernetes 上支持将 TiDB Dashboard 作为独立的 Pod 部署。在 TiDB Operator 环境，可直接访问该 Pod 的 IP 来打开 TiDB Dashboard。具体信息，参考 [TiDB Operator 部署独立的 TiDB Dashboard](https://docs.pingcap.com/zh/tidb-in-kubernetes/dev/get-started#部署独立的-tidb-dashboard)。

## 多 PD 实例访问

当集群中部署有多个 PD 实例、且您可以直接访问到**每个** PD 实例地址和端口时，可以简单地将 <http://127.0.0.1:2379/dashboard/> 地址中的 `127.0.0.1:2379` 替换为集群中**任意一个** PD 实例的地址和端口进行访问。

> **注意：**
>
> 当处于防火墙或反向代理等环境下、无法直接访问每个 PD 实例时，可能会无法访问 TiDB Dashboard。这通常是防火墙或反向代理没有正确配置导致的。可参阅[通过反向代理使用 TiDB Dashboard](/dashboard/dashboard-ops-reverse-proxy.md) 或[提高 TiDB Dashboard 安全性](/dashboard/dashboard-ops-security.md)章节了解如何在多 PD 实例情况下正确配置防火墙或反向代理规则。

## 浏览器兼容性

TiDB Dashboard 可在常见的、更新及时的桌面浏览器中使用，具体版本号为：

- Chrome >= 77
- Firefox >= 68
- Edge >= 17

> **注意：**
>
> 若使用旧版本浏览器或其他浏览器访问 TiDB Dashboard，部分界面可能不能正常工作。

## 登录

访问 TiDB Dashboard 将会显示用户登录界面。 

- 可使用 TiDB 的 root 用户登录。
- 如果创建了[自定义 SQL 用户](/dashboard/dashboard-user.md)，也可以使用自定义的 SQL 用户和密码登录。

![登录界面](https://docs-download.pingcap.com/media/images/docs-cn/dashboard/dashboard-access-login.png)

如果存在以下情况，则可能会登录失败：

- TiDB root 用户不存在
- PD 未启动或无法访问
- TiDB 未启动或无法访问
- root 密码错误

登录后，24 小时内将保持自动登录状态。参见[登出](#登出)章节了解如何登出用户。

## 切换语言

TiDB Dashboard 目前支持以下语言：

- 简体中文
- 英文

在登录界面中，可点击 **Switch Language** 下拉框切换界面显示语言：

![切换语言](https://docs-download.pingcap.com/media/images/docs-cn/dashboard/dashboard-access-switch-language.png)

## 登出

登录后，在左侧导航处点击登录用户名，可切换到用户页面。在用户页面点击**登出** (Logout) 按钮即可登出当前用户。登出后，需重新输入用户名密码。

![登出](https://docs-download.pingcap.com/media/images/docs-cn/dashboard/dashboard-access-logout.png)
