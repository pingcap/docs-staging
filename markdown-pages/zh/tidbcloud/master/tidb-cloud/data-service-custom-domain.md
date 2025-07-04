---
title: Data Service 中的自定义域名
summary: 了解如何使用自定义域名访问 TiDB Cloud Data Service 中的 Data App。
---

# Data Service 中的自定义域名

TiDB Cloud Data Service 提供默认域名 `<region>.data.tidbcloud.com` 来访问每个 Data App 的端点。为了增强个性化和灵活性，你可以为你的 Data App 配置自定义域名，而不是使用默认域名。

本文档描述如何在你的 Data App 中管理自定义域名。

## 开始之前

在为你的 Data App 配置自定义域名之前，请注意以下事项：

- 自定义域名请求出于安全考虑仅支持 HTTPS。一旦你成功配置自定义域名，系统会自动应用 "Let's Encrypt" 证书。
- 你的自定义域名在 TiDB Cloud Data Service 中必须是唯一的。
- 每个默认域名（由集群所在区域决定）只能配置一个自定义域名。

## 管理自定义域名

以下部分描述如何为 Data App 创建、编辑和删除自定义域名。

### 创建自定义域名

要为 Data App 创建自定义域名，请执行以下步骤：

1. 导航到项目的 [**Data Service**](https://tidbcloud.com/project/data-service) 页面。
2. 在左侧窗格中，点击目标 Data App 的名称以查看其详细信息。
3. 在**管理自定义域名**区域，点击**添加自定义域名**。
4. 在**添加自定义域名**对话框中，执行以下操作：
    1. 选择要替换的默认域名。
    2. 输入你想要的自定义域名。
    3. 可选：配置自定义路径作为端点的前缀。如果**自定义路径**留空，则使用默认路径。
5. 预览你的**基础 URL** 以确保它符合你的预期。如果看起来正确，点击**保存**。
6. 按照 **DNS 设置**对话框中的说明，在你的 DNS 提供商中为默认域名添加 `CNAME` 记录。

自定义域名最初处于**待验证**状态，系统会验证你的 DNS 设置。一旦 DNS 验证成功，你的自定义域名状态将更新为**成功**。

> **注意：**
>
> 根据你的 DNS 提供商，DNS 记录验证可能需要长达 24 小时。如果自定义域名超过 24 小时仍未验证，它将处于**已过期**状态。在这种情况下，你只能删除自定义域名并重试。

在你的自定义域名状态设置为**成功**后，你就可以使用它来访问你的端点。TiDB Cloud Data Service 提供的代码示例会自动更新为你的自定义域名和路径。更多信息，请参见[调用端点](/tidb-cloud/data-service-manage-endpoint.md#调用端点)。

### 编辑自定义域名

> **注意：**
>
> 完成以下更改后，之前的自定义域名和自定义路径将立即失效。如果你修改自定义域名，则需要等待新的 DNS 记录验证。

要编辑 Data App 的自定义域名，请执行以下步骤：

1. 导航到项目的 [**Data Service**](https://tidbcloud.com/project/data-service) 页面。
2. 在左侧窗格中，点击目标 Data App 的名称以查看其详细信息。
3. 在**管理自定义域名**区域，找到**操作**列，然后在要编辑的自定义域名行中点击 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke-width="1.5" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M11 4H6.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C2 6.28 2 7.12 2 8.8v8.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C4.28 22 5.12 22 6.8 22h8.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C20 19.72 20 18.88 20 17.2V13M8 16h1.675c.489 0 .733 0 .963-.055.204-.05.4-.13.579-.24.201-.123.374-.296.72-.642L21.5 5.5a2.121 2.121 0 0 0-3-3l-9.563 9.563c-.346.346-.519.519-.642.72a2 2 0 0 0-.24.579c-.055.23-.055.474-.055.963V16Z" stroke-width="inherit"></path></svg> **编辑**。
4. 在显示的对话框中，更新自定义域名或自定义路径。
5. 预览你的**基础 URL** 以确保它符合你的预期。如果看起来正确，点击**保存**。
6. 如果你更改了自定义域名，请按照 **DNS 设置**对话框中的说明，在你的 DNS 提供商中为默认域名添加 `CNAME` 记录。

### 删除自定义域名

> **注意：**
>
> 在删除自定义域名之前，请确保该自定义域名不再使用。

要删除 Data App 的自定义域名，请执行以下步骤：

1. 导航到项目的 [**Data Service**](https://tidbcloud.com/project/data-service) 页面。
2. 在左侧窗格中，点击目标 Data App 的名称以查看其详细信息。
3. 在**管理自定义域名**区域，找到**操作**列，然后在要删除的自定义域名行中点击 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke-width="1.5" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M16 6v-.8c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C14.48 2 13.92 2 12.8 2h-1.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C8 3.52 8 4.08 8 5.2V6m2 5.5v5m4-5v5M3 6h18m-2 0v11.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C16.72 22 15.88 22 14.2 22H9.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C5 19.72 5 18.88 5 17.2V6" stroke-width="inherit"></path></svg> **删除**。
4. 在显示的对话框中，确认删除。
