---
title: 使用 mysql.js 连接 TiDB
summary: 学习如何使用 mysql.js 连接 TiDB。本教程提供了适用于 TiDB 的 Node.js 示例代码片段，基于 mysql.js。
---

# 使用 mysql.js 连接 TiDB

TiDB 是兼容 MySQL 的数据库，[mysql.js](https://github.com/mysqljs/mysql) 驱动是一个纯 Node.js JavaScript 客户端，实现了 MySQL 协议。

在本教程中，你可以学习如何使用 TiDB 和 mysql.js 驱动完成以下任务：

- 搭建你的开发环境。
- 使用 mysql.js 驱动连接到你的 TiDB 集群。
- 构建并运行你的应用程序。你还可以在 [示例代码片段](#sample-code-snippets) 中找到基本 CRUD 操作的代码示例。

> **Note:**
>
> 本教程适用于 TiDB Cloud Starter, TiDB Cloud Essential, TiDB Cloud Dedicated 以及 TiDB 自建集群。

## 前置条件

完成本教程，你需要：

- 在你的机器上安装 [Node.js](https://nodejs.org/en) >= 16.x。
- 在你的机器上安装 [Git](https://git-scm.com/downloads)。
- 一个正在运行的 TiDB 集群。

**如果你还没有 TiDB 集群，可以按如下方式创建：**

<CustomContent platform="tidb">

- （推荐）参考 [创建 TiDB Cloud Starter 集群](/develop/dev-guide-build-cluster-in-cloud.md) 创建你自己的 TiDB Cloud 集群。
- 参考 [部署本地测试 TiDB 集群](/quick-start-with-tidb.md#deploy-a-local-test-cluster) 或 [部署生产环境 TiDB 集群](/production-deployment-using-tiup.md) 创建本地集群。

</CustomContent>
<CustomContent platform="tidb-cloud">

- （推荐）参考 [创建 TiDB Cloud Starter 集群](/develop/dev-guide-build-cluster-in-cloud.md) 创建你自己的 TiDB Cloud 集群。
- 参考 [部署本地测试 TiDB 集群](https://docs.pingcap.com/tidb/stable/quick-start-with-tidb#deploy-a-local-test-cluster) 或 [部署生产环境 TiDB 集群](https://docs.pingcap.com/tidb/stable/production-deployment-using-tiup) 创建本地集群。

</CustomContent>

## 运行示例应用连接 TiDB

本节演示如何运行示例应用代码并连接到 TiDB。

### 步骤 1：克隆示例应用仓库

在终端窗口中运行以下命令，克隆示例代码仓库：

```shell
git clone https://github.com/tidb-samples/tidb-nodejs-mysqljs-quickstart.git
cd tidb-nodejs-mysqljs-quickstart
```

### 步骤 2：安装依赖

运行以下命令安装示例应用所需的依赖包（包括 `mysql` 和 `dotenv`）：

```shell
npm install
```

<details>
<summary><b>为已有项目安装依赖</b></summary>

如果是你的已有项目，运行以下命令安装依赖包：

```shell
npm install mysql dotenv --save
```

</details>

### 步骤 3：配置连接信息

根据你选择的 TiDB 部署方式，连接到你的 TiDB 集群。

<SimpleTab>
<div label="TiDB Cloud Starter or Essential">

1. 进入 [**Clusters**](https://tidbcloud.com/console/clusters) 页面，点击目标集群名称进入集群概览页。

2. 点击右上角的 **Connect**，弹出连接对话框。

3. 确保连接对话框中的配置与你的操作环境一致。

    - **Connection Type** 设置为 `Public`。
    - **Branch** 设置为 `main`。
    - **Connect With** 设置为 `General`。
    - **Operating System** 与运行应用的操作系统一致。

4. 如果你还未设置密码，点击 **Generate Password** 生成随机密码。

5. 运行以下命令，复制 `.env.example` 并重命名为 `.env`：

    ```shell
    cp .env.example .env
    ```

6. 编辑 `.env` 文件，按如下方式设置环境变量，将对应的占位符 `{}` 替换为连接对话框中的参数：

    ```dotenv
    TIDB_HOST={host}
    TIDB_PORT=4000
    TIDB_USER={user}
    TIDB_PASSWORD={password}
    TIDB_DATABASE=test
    TIDB_ENABLE_SSL=true
    ```

    > **Note**
    >
    > 对于 TiDB Cloud Starter，使用公网连接时 **必须** 通过 `TIDB_ENABLE_SSL` 启用 TLS 连接。

7. 保存 `.env` 文件。

</div>
<div label="TiDB Cloud Dedicated">

1. 进入 [**Clusters**](https://tidbcloud.com/console/clusters) 页面，点击目标集群名称进入集群概览页。

2. 点击右上角的 **Connect**，弹出连接对话框。

3. 在连接对话框中，从 **Connection Type** 下拉列表选择 **Public**，然后点击 **CA cert** 下载 CA 证书。

    如果你还未配置 IP 访问列表，点击 **Configure IP Access List** 或参考 [配置 IP 访问列表](https://docs.pingcap.com/tidbcloud/configure-ip-access-list) 进行配置后再首次连接。

    除了 **Public** 连接类型，TiDB Cloud Dedicated 还支持 **Private Endpoint** 和 **VPC Peering** 连接类型。更多信息参见 [连接到你的 TiDB Cloud Dedicated 集群](https://docs.pingcap.com/tidbcloud/connect-to-tidb-cluster)。

4. 运行以下命令，复制 `.env.example` 并重命名为 `.env`：

    ```shell
    cp .env.example .env
    ```

5. 编辑 `.env` 文件，按如下方式设置环境变量，将对应的占位符 `{}` 替换为连接对话框中的参数：

    ```dotenv
    TIDB_HOST={host}
    TIDB_PORT=4000
    TIDB_USER={user}
    TIDB_PASSWORD={password}
    TIDB_DATABASE=test
    TIDB_ENABLE_SSL=true
    TIDB_CA_PATH={downloaded_ssl_ca_path}
    ```

    > **Note**
    >
    > 推荐在使用公网连接 TiDB Cloud Dedicated 时启用 TLS 连接。
    >
    > 启用 TLS 连接时，将 `TIDB_ENABLE_SSL` 设置为 `true`，并通过 `TIDB_CA_PATH` 指定从连接对话框下载的 CA 证书文件路径。

6. 保存 `.env` 文件。

</div>
<div label="TiDB 自建集群">

1. 运行以下命令，复制 `.env.example` 并重命名为 `.env`：

    ```shell
    cp .env.example .env
    ```

2. 编辑 `.env` 文件，将对应的占位符 `{}` 替换为你的集群连接参数。示例配置如下：

    ```dotenv
    TIDB_HOST={host}
    TIDB_PORT=4000
    TIDB_USER=root
    TIDB_PASSWORD={password}
    TIDB_DATABASE=test
    ```

    如果你在本地运行 TiDB，默认主机地址为 `127.0.0.1`，密码为空。

3. 保存 `.env` 文件。

</div>
</SimpleTab>

### 步骤 4：运行代码并查看结果

运行以下命令执行示例代码：

```shell
npm start
```

如果连接成功，控制台会输出 TiDB 集群的版本信息，如下所示：

```
🔌 Connected to TiDB cluster! (TiDB version: 8.0.11-TiDB-v8.5.8)
⏳ Loading sample game data...
✅ Loaded sample game data.

🆕 Created a new player with ID 12.
ℹ️ Got Player 12: Player { id: 12, coins: 100, goods: 100 }
🔢 Added 50 coins and 50 goods to player 12, updated 1 row.
🚮 Deleted 1 player data.
```

## 示例代码片段

你可以参考以下示例代码片段，完成你自己的应用开发。

完整示例代码及运行方式请参考 [tidb-samples/tidb-nodejs-mysqljs-quickstart](https://github.com/tidb-samples/tidb-nodejs-mysqljs-quickstart) 仓库。

### 使用连接参数连接

以下代码通过环境变量定义的参数连接 TiDB：

```javascript
// Step 1. Import the 'mysql' and 'dotenv' packages.
import { createConnection } from "mysql";
import dotenv from "dotenv";
import * as fs from "fs";

// Step 2. Load environment variables from .env file to process.env.
dotenv.config();

// Step 3. Create a connection to the TiDB cluster.
const options = {
    host: process.env.TIDB_HOST || '127.0.0.1',
    port: process.env.TIDB_PORT || 4000,
    user: process.env.TIDB_USER || 'root',
    password: process.env.TIDB_PASSWORD || '',
    database: process.env.TIDB_DATABASE || 'test',
    ssl: process.env.TIDB_ENABLE_SSL === 'true' ? {
        minVersion: 'TLSv1.2',
        ca: process.env.TIDB_CA_PATH ? fs.readFileSync(process.env.TIDB_CA_PATH) : undefined
    } : null,
}
const conn = createConnection(options);

// Step 4. Perform some SQL operations...

// Step 5. Close the connection.
conn.end();
```

> **Note**
>
> 对于 TiDB Cloud Starter 和 TiDB Cloud Essential, 使用公网连接时 **必须** 通过 `TIDB_ENABLE_SSL` 启用 TLS 连接。但你 **不需要** 通过 `TIDB_CA_PATH` 指定 SSL CA 证书，因为 Node.js 默认使用内置的 [Mozilla CA 证书](https://wiki.mozilla.org/CA/Included_Certificates)，该证书已被 TiDB Cloud Starter 信任。

### 插入数据

以下查询会创建一条 `Player` 记录，并返回新建记录的 ID：

```javascript
conn.query('INSERT INTO players (coins, goods) VALUES (?, ?);', [100, 100], (err, ok) => {
   if (err) {
       console.error(err);
   } else {
       console.log(ok.insertId);
   }
});
```

更多信息请参考 [插入数据](/develop/dev-guide-insert-data.md)。

### 查询数据

以下查询会根据 ID `1` 返回一条 `Player` 记录：

```javascript
conn.query('SELECT id, coins, goods FROM players WHERE id = ?;', [1], (err, rows) => {
   if (err) {
      console.error(err);
   } else {
      console.log(rows[0]);
   }
});
```

更多信息请参考 [查询数据](/develop/dev-guide-get-data-from-single-table.md)。

### 更新数据

以下查询会为 ID 为 `1` 的 `Player` 增加 `50` 个 coins 和 `50` 个 goods：

```javascript
conn.query(
   'UPDATE players SET coins = coins + ?, goods = goods + ? WHERE id = ?;',
   [50, 50, 1],
   (err, ok) => {
      if (err) {
         console.error(err);
      } else {
          console.log(ok.affectedRows);
      }
   }
);
```

更多信息请参考 [更新数据](/develop/dev-guide-update-data.md)。

### 删除数据

以下查询会删除 ID 为 `1` 的 `Player` 记录：

```javascript
conn.query('DELETE FROM players WHERE id = ?;', [1], (err, ok) => {
    if (err) {
        reject(err);
    } else {
        resolve(ok.affectedRows);
    }
});
```

更多信息请参考 [删除数据](/develop/dev-guide-delete-data.md)。

## 实用说明

- 使用 [连接池](https://github.com/mysqljs/mysql#pooling-connections) 管理数据库连接，可以减少频繁建立和销毁连接带来的性能开销。
- 为避免 SQL 注入攻击，建议在执行 SQL 前使用 [转义查询参数](https://github.com/mysqljs/mysql#escaping-query-values)。

    > **Note**
    >
    > `mysqljs/mysql` 包目前尚不支持预处理语句，仅在客户端对参数进行转义（相关 issue: [mysqljs/mysql#274](https://github.com/mysqljs/mysql/issues/274)）。
    >
    > 如果你希望通过该特性避免 SQL 注入或提升批量插入/更新效率，建议使用 [mysql2](https://github.com/sidorares/node-mysql2) 包。

- 在 SQL 语句不复杂的场景下，使用 ORM 框架可以提升开发效率，例如：[Sequelize](https://sequelize.org/)、[TypeORM](https://typeorm.io/)、[Prisma](/develop/dev-guide-sample-application-nodejs-prisma.md)。
- 在处理数据库中的大数（`BIGINT` 和 `DECIMAL` 列）时，建议启用 `supportBigNumbers: true` 选项。

## 后续步骤

- 通过 [mysql.js 文档](https://github.com/mysqljs/mysql#readme) 学习更多 mysql.js 驱动的用法。
- 通过 [开发者指南](/develop/dev-guide-overview.md) 各章节学习 TiDB 应用开发最佳实践，例如：[插入数据](/develop/dev-guide-insert-data.md)、[更新数据](/develop/dev-guide-update-data.md)、[删除数据](/develop/dev-guide-delete-data.md)、[查询数据](/develop/dev-guide-get-data-from-single-table.md)、[事务](/develop/dev-guide-transaction-overview.md)、[SQL 性能优化](/develop/dev-guide-optimize-sql-overview.md)。
- 通过专业的 [TiDB 开发者课程](https://www.pingcap.com/education/) 学习，并在通过考试后获得 [TiDB 认证](https://www.pingcap.com/education/certification/)。

## 需要帮助？

<CustomContent platform="tidb">

欢迎在 [Discord](https://discord.gg/DQZ2dy3cuc?utm_source=doc) 或 [Slack](https://slack.tidb.io/invite?team=tidb-community&channel=everyone&ref=pingcap-docs) 社区提问，或 [提交支持工单](/support.md)。

</CustomContent>

<CustomContent platform="tidb-cloud">

欢迎在 [Discord](https://discord.gg/DQZ2dy3cuc?utm_source=doc) 或 [Slack](https://slack.tidb.io/invite?team=tidb-community&channel=everyone&ref=pingcap-docs) 社区提问，或 [提交支持工单](https://tidb.support.pingcap.com/)。

</CustomContent>
