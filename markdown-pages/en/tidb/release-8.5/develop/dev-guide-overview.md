---
title: Developer Guide Overview
summary: Introduce the overview of the developer guide.
---

# Developer Guide Overview

This guide is written for application developers, but if you are interested in the inner workings of TiDB or want to get involved in TiDB development, read the [TiDB Kernel Development Guide](https://pingcap.github.io/tidb-dev-guide/) for more information about TiDB.

<CustomContent platform="tidb">

This tutorial shows how to quickly build an application using TiDB, the possible use cases of TiDB and how to handle common problems.

Before reading this page, it is recommended that you read the [Quick Start with TiDB Self-Managed](/quick-start-with-tidb.md).

</CustomContent>

<CustomContent platform="tidb-cloud">

This tutorial shows how to quickly build an application using TiDB Cloud, the possible use cases of TiDB Cloud and how to handle common problems.

</CustomContent>

## TiDB basics

Before you start working with TiDB, you need to understand some important mechanisms of how TiDB works:

- Read the [TiDB Transaction Overview](/transaction-overview.md) to understand how transactions work in TiDB, or check out the [Transaction Notes for Application Developers](/develop/dev-guide-transaction-overview.md) to learn about transaction knowledge required for application development.
- Understand [the way applications interact with TiDB](#the-way-applications-interact-with-tidb).
- To learn core components and concepts of building up the distributed database TiDB and TiDB Cloud, refer to the free online course [Introduction to TiDB](https://eng.edu.pingcap.com/catalog/info/id:203/?utm_source=docs-dev-guide).

## TiDB transaction mechanisms

TiDB supports distributed transactions and offers both [optimistic transaction](/optimistic-transaction.md) and [pessimistic transaction](/pessimistic-transaction.md) modes. The current version of TiDB uses the **pessimistic transaction** mode by default, which allows you to transact with TiDB as you would with a traditional monolithic database (for example, MySQL).

You can start a transaction using [`BEGIN`](/sql-statements/sql-statement-begin.md), explicitly specify a **pessimistic transaction** using `BEGIN PESSIMISTIC`, or explicitly specify an **optimistic transaction** using `BEGIN OPTIMISTIC`. After that, you can either commit ([`COMMIT`](/sql-statements/sql-statement-commit.md)) or roll back ([`ROLLBACK`](/sql-statements/sql-statement-rollback.md)) the transaction.

TiDB guarantees atomicity for all statements between the start of `BEGIN` and the end of `COMMIT` or `ROLLBACK`, that is, all statements that are executed during this period either succeed or fail as a whole. This is used to ensure data consistency you need for application development.

<CustomContent platform="tidb">

If you are not sure what an **optimistic transaction** is, do **_NOT_** use it yet. Because **optimistic transactions** require that the application can correctly handle [all errors](/error-codes.md) returned by the `COMMIT` statement. If you are not sure how your application handles them, use a **pessimistic transaction** instead.

</CustomContent>

<CustomContent platform="tidb-cloud">

If you are not sure what an **optimistic transaction** is, do **_NOT_** use it yet. Because **optimistic transactions** require that the application can correctly handle [all errors](https://docs.pingcap.com/tidb/stable/error-codes) returned by the `COMMIT` statement. If you are not sure how your application handles them, use a **pessimistic transaction** instead.

</CustomContent>

## The way applications interact with TiDB

TiDB is highly compatible with the MySQL protocol and supports [most MySQL syntax and features](/mysql-compatibility.md), so most MySQL connection libraries are compatible with TiDB. If your application framework or language does not have an official adaptation from PingCAP, it is recommended that you use MySQL's client libraries. More and more third-party libraries are actively supporting TiDB's different features.

Since TiDB is compatible with the MySQL protocol and MySQL syntax, most of the ORMs that support MySQL are also compatible with TiDB.

## Read more

<CustomContent platform="tidb">

- [Quick Start](/develop/dev-guide-build-cluster-in-cloud.md)
- [Choose Driver or ORM](/develop/dev-guide-choose-driver-or-orm.md)
- [Connect to TiDB](/develop/dev-guide-connect-to-tidb.md)
- [Database Schema Design](/develop/dev-guide-schema-design-overview.md)
- [Write Data](/develop/dev-guide-insert-data.md)
- [Read Data](/develop/dev-guide-get-data-from-single-table.md)
- [Transaction](/develop/dev-guide-transaction-overview.md)
- [Optimize](/develop/dev-guide-optimize-sql-overview.md)
- [Example Applications](/develop/dev-guide-sample-application-java-spring-boot.md)

</CustomContent>

<CustomContent platform="tidb-cloud">

Here you can find additional resources to connect, manage and develop with TiDB Cloud.

**To explore your data**

- [Quick Start](/develop/dev-guide-build-cluster-in-cloud.md)
- [Use AI-assisted SQL Editor](/tidb-cloud/explore-data-with-chat2query.md)
- Connect with client tools such as [VSCode](/develop/dev-guide-gui-vscode-sqltools.md), [DBeaver](/develop/dev-guide-gui-dbeaver.md) or [DataGrip](/develop/dev-guide-gui-datagrip.md)

**To build your application**

- [Choose Driver or ORM](/develop/dev-guide-choose-driver-or-orm.md)
- [Use TiDB Cloud Data API <sup>beta</sup>](/tidb-cloud/data-service-overview.md)

**To manage your cluster**

- [TiDB Cloud Command Line Tools](/tidb-cloud/get-started-with-cli.md)
- [TiDB Cloud Administration API](/tidb-cloud/api-overview.md)

**To learn more about TiDB**

- [Database Schema Design](/develop/dev-guide-schema-design-overview.md)
- [Write Data](/develop/dev-guide-insert-data.md)
- [Read Data](/develop/dev-guide-get-data-from-single-table.md)
- [Transaction](/develop/dev-guide-transaction-overview.md)
- [Optimize](/develop/dev-guide-optimize-sql-overview.md)

</CustomContent>

## Need help?

<CustomContent platform="tidb">

Ask the community on [Discord](https://discord.gg/DQZ2dy3cuc?utm_source=doc) or [Slack](https://slack.tidb.io/invite?team=tidb-community&channel=everyone&ref=pingcap-docs), or [submit a support ticket](/support.md).

</CustomContent>

<CustomContent platform="tidb-cloud">

Ask the community on [Discord](https://discord.gg/DQZ2dy3cuc?utm_source=doc) or [Slack](https://slack.tidb.io/invite?team=tidb-community&channel=everyone&ref=pingcap-docs), or [submit a support ticket](https://tidb.support.pingcap.com/).

</CustomContent>