---
title: 使用 PyMySQL 连接 TiDB
summary: 了解如何使用 PyMySQL 连接 TiDB。本教程提供使用 PyMySQL 操作 TiDB 的 Python 示例代码片段。
---

# 使用 PyMySQL 连接 TiDB

TiDB 是一个兼容 MySQL 的数据库，而 [PyMySQL](https://github.com/PyMySQL/PyMySQL) 是一个流行的 Python 开源驱动程序。

在本教程中，你可以学习如何使用 TiDB 和 PyMySQL 完成以下任务：

- 设置环境。
- 使用 PyMySQL 连接到 TiDB 集群。
- 构建并运行应用程序。你也可以查看示例代码片段，了解基本的 CRUD 操作。

> **注意：**
>
> 本教程适用于 TiDB Cloud Serverless、TiDB Cloud Dedicated 和 TiDB Self-Managed 集群。

## 前提条件

要完成本教程，你需要：

- [Python 3.8 或更高版本](https://www.python.org/downloads/)。
- [Git](https://git-scm.com/downloads)。
- 一个 TiDB 集群。

<CustomContent platform="tidb">

**如果你还没有 TiDB 集群，可以按照以下方式创建：**

- （推荐）按照[创建 TiDB Cloud Serverless 集群](/develop/dev-guide-build-cluster-in-cloud.md)创建你自己的 TiDB Cloud 集群。
- 按照[部署本地测试 TiDB 集群](/quick-start-with-tidb.md#deploy-a-local-test-cluster)或[部署生产 TiDB 集群](/production-deployment-using-tiup.md)创建本地集群。

</CustomContent>
<CustomContent platform="tidb-cloud">

**如果你还没有 TiDB 集群，可以按照以下方式创建：**

- （推荐）按照[创建 TiDB Cloud Serverless 集群](/develop/dev-guide-build-cluster-in-cloud.md)创建你自己的 TiDB Cloud 集群。
- 按照[部署本地测试 TiDB 集群](https://docs.pingcap.com/tidb/stable/quick-start-with-tidb#deploy-a-local-test-cluster)或[部署生产 TiDB 集群](https://docs.pingcap.com/tidb/stable/production-deployment-using-tiup)创建本地集群。

</CustomContent>

## 运行示例程序连接 TiDB

本节演示如何运行示例应用程序代码并连接到 TiDB。

### 步骤 1：克隆示例程序仓库

在终端窗口中运行以下命令来克隆示例代码仓库：

```shell
git clone https://github.com/tidb-samples/tidb-python-pymysql-quickstart.git
cd tidb-python-pymysql-quickstart
```

### 步骤 2：安装依赖

运行以下命令安装示例应用程序所需的包（包括 PyMySQL）：

```shell
pip install -r requirements.txt
```

### 步骤 3：配置连接信息

根据你选择的 TiDB 部署选项连接到 TiDB 集群。

<SimpleTab>
<div label="TiDB Cloud Serverless">

1. 导航到[**集群**](https://tidbcloud.com/project/clusters)页面，然后点击目标集群的名称进入其概览页面。

2. 点击右上角的**连接**。将显示连接对话框。

3. 确保连接对话框中的配置与你的操作环境匹配。

    - **连接类型**设置为 `Public`
    - **分支**设置为 `main`
    - **连接方式**设置为 `General`
    - **操作系统**与你的环境匹配。

    > **提示：**
    >
    > 如果你的程序在 Windows Subsystem for Linux (WSL) 中运行，请切换到相应的 Linux 发行版。

4. 点击**生成密码**创建随机密码。

    > **提示：**
    >
    > 如果你之前已经创建了密码，可以使用原始密码或点击**重置密码**生成新密码。

5. 运行以下命令复制 `.env.example` 并将其重命名为 `.env`：

    ```shell
    cp .env.example .env
    ```

6. 将相应的连接字符串复制并粘贴到 `.env` 文件中。示例结果如下：

    ```dotenv
    TIDB_HOST='{host}'  # 例如 gateway01.ap-northeast-1.prod.aws.tidbcloud.com
    TIDB_PORT='4000'
    TIDB_USER='{user}'  # 例如 xxxxxx.root
    TIDB_PASSWORD='{password}'
    TIDB_DB_NAME='test'
    CA_PATH='{ssl_ca}'  # 例如 /etc/ssl/certs/ca-certificates.crt (Debian / Ubuntu / Arch)
    ```

    请确保将占位符 `{}` 替换为从连接对话框获得的连接参数。

7. 保存 `.env` 文件。

</div>
<div label="TiDB Cloud Dedicated">

1. 导航到[**集群**](https://tidbcloud.com/project/clusters)页面，然后点击目标集群的名称进入其概览页面。

2. 点击右上角的**连接**。将显示连接对话框。

3. 在连接对话框中，从**连接类型**下拉列表中选择 **Public**，然后点击 **CA 证书**下载 CA 证书。

    如果你尚未配置 IP 访问列表，请点击**配置 IP 访问列表**或按照[配置 IP 访问列表](https://docs.pingcap.com/tidbcloud/configure-ip-access-list)中的步骤在首次连接之前进行配置。

    除了 **Public** 连接类型外，TiDB Cloud Dedicated 还支持**私有端点**和 **VPC 对等连接**连接类型。更多信息，请参见[连接到你的 TiDB Cloud Dedicated 集群](https://docs.pingcap.com/tidbcloud/connect-to-tidb-cluster)。

4. 运行以下命令复制 `.env.example` 并将其重命名为 `.env`：

    ```shell
    cp .env.example .env
    ```

5. 将相应的连接字符串复制并粘贴到 `.env` 文件中。示例结果如下：

    ```dotenv
    TIDB_HOST='{host}'  # 例如 tidb.xxxx.clusters.tidb-cloud.com
    TIDB_PORT='4000'
    TIDB_USER='{user}'  # 例如 root
    TIDB_PASSWORD='{password}'
    TIDB_DB_NAME='test'
    CA_PATH='{your-downloaded-ca-path}'
    ```

    请确保将占位符 `{}` 替换为从连接对话框获得的连接参数，并将 `CA_PATH` 配置为之前下载的证书路径。

6. 保存 `.env` 文件。

</div>
<div label="TiDB Self-Managed">

1. 运行以下命令复制 `.env.example` 并将其重命名为 `.env`：

    ```shell
    cp .env.example .env
    ```

2. 将相应的连接字符串复制并粘贴到 `.env` 文件中。示例结果如下：

    ```dotenv
    TIDB_HOST='{tidb_server_host}'
    TIDB_PORT='4000'
    TIDB_USER='root'
    TIDB_PASSWORD='{password}'
    TIDB_DB_NAME='test'
    ```

    请确保将占位符 `{}` 替换为连接参数，并删除 `CA_PATH` 行。如果你在本地运行 TiDB，默认主机地址为 `127.0.0.1`，密码为空。

3. 保存 `.env` 文件。

</div>
</SimpleTab>

### 步骤 4：运行代码并检查结果

1. 执行以下命令运行示例代码：

    ```shell
    python pymysql_example.py
    ```

2. 查看 [Expected-Output.txt](https://github.com/tidb-samples/tidb-python-pymysql-quickstart/blob/main/Expected-Output.txt) 以检查输出是否匹配。

## 示例代码片段

你可以参考以下示例代码片段来完成自己的应用程序开发。

有关完整的示例代码和运行方法，请查看 [tidb-samples/tidb-python-pymysql-quickstart](https://github.com/tidb-samples/tidb-python-pymysql-quickstart) 仓库。

### 连接到 TiDB

```python
from pymysql import Connection
from pymysql.cursors import DictCursor


def get_connection(autocommit: bool = True) -> Connection:
    config = Config()
    db_conf = {
        "host": ${tidb_host},
        "port": ${tidb_port},
        "user": ${tidb_user},
        "password": ${tidb_password},
        "database": ${tidb_db_name},
        "autocommit": autocommit,
        "cursorclass": DictCursor,
    }

    if ${ca_path}:
        db_conf["ssl_verify_cert"] = True
        db_conf["ssl_verify_identity"] = True
        db_conf["ssl_ca"] = ${ca_path}

    return pymysql.connect(**db_conf)
```

使用此函数时，你需要将 `${tidb_host}`、`${tidb_port}`、`${tidb_user}`、`${tidb_password}`、`${tidb_db_name}` 和 `${ca_path}` 替换为 TiDB 集群的实际值。

### 插入数据

```python
with get_connection(autocommit=True) as conn:
    with conn.cursor() as cur:
        player = ("1", 1, 1)
        cursor.execute("INSERT INTO players (id, coins, goods) VALUES (%s, %s, %s)", player)
```

更多信息，请参考[插入数据](/develop/dev-guide-insert-data.md)。

### 查询数据

```python
with get_connection(autocommit=True) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM players")
        print(cursor.fetchone()["count(*)"])
```

更多信息，请参考[查询数据](/develop/dev-guide-get-data-from-single-table.md)。

### 更新数据

```python
with get_connection(autocommit=True) as conn:
    with conn.cursor() as cur:
        player_id, amount, price="1", 10, 500
        cursor.execute(
            "UPDATE players SET goods = goods + %s, coins = coins + %s WHERE id = %s",
            (-amount, price, player_id),
        )
```

更多信息，请参考[更新数据](/develop/dev-guide-update-data.md)。

### 删除数据

```python
with get_connection(autocommit=True) as conn:
    with conn.cursor() as cur:
        player_id = "1"
        cursor.execute("DELETE FROM players WHERE id = %s", (player_id,))
```

更多信息，请参考[删除数据](/develop/dev-guide-delete-data.md)。

## 实用说明

### 使用驱动程序还是 ORM 框架？

Python 驱动程序提供对数据库的低级访问，但它要求开发人员：

- 手动建立和释放数据库连接。
- 手动管理数据库事务。
- 手动将数据行（在 `pymysql` 中表示为元组或字典）映射到数据对象。

除非你需要编写复杂的 SQL 语句，否则建议使用 [ORM](https://en.wikipedia.org/w/index.php?title=Object-relational_mapping) 框架进行开发，例如 [SQLAlchemy](/develop/dev-guide-sample-application-python-sqlalchemy.md)、[Peewee](/develop/dev-guide-sample-application-python-peewee.md) 和 Django ORM。它可以帮助你：

- 减少管理连接和事务的[样板代码](https://en.wikipedia.org/wiki/Boilerplate_code)。
- 使用数据对象而不是大量 SQL 语句来操作数据。

## 下一步

- 从 [PyMySQL 文档](https://pymysql.readthedocs.io)了解更多 PyMySQL 的用法。
- 通过[开发者指南](/develop/dev-guide-overview.md)中的章节了解 TiDB 应用程序开发的最佳实践，例如[插入数据](/develop/dev-guide-insert-data.md)、[更新数据](/develop/dev-guide-update-data.md)、[删除数据](/develop/dev-guide-delete-data.md)、[单表读取](/develop/dev-guide-get-data-from-single-table.md)、[事务](/develop/dev-guide-transaction-overview.md)和 [SQL 性能优化](/develop/dev-guide-optimize-sql-overview.md)。
- 通过专业的 [TiDB 开发者课程](https://www.pingcap.com/education/)学习，并在通过考试后获得 [TiDB 认证](https://www.pingcap.com/education/certification/)。

## 需要帮助？

<CustomContent platform="tidb">

在 [Discord](https://discord.gg/DQZ2dy3cuc?utm_source=doc) 或 [Slack](https://slack.tidb.io/invite?team=tidb-community&channel=everyone&ref=pingcap-docs) 上询问社区，或[提交支持工单](/support.md)。

</CustomContent>

<CustomContent platform="tidb-cloud">

在 [Discord](https://discord.gg/DQZ2dy3cuc?utm_source=doc) 或 [Slack](https://slack.tidb.io/invite?team=tidb-community&channel=everyone&ref=pingcap-docs) 上询问社区，或[提交支持工单](https://tidb.support.pingcap.com/)。

</CustomContent>
