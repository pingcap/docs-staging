---
title: Statement Execution Details of TiDB Dashboard
summary: View the execution details of a single SQL statement in TiDB Dashboard.
---

# Statement Execution Details of TiDB Dashboard

Click any item in the list to enter the detail page of the SQL statement to view more detailed information. This information includes the following parts:

- The overview of SQL statements, which includes the SQL template, the SQL template ID, the current time range of displayed SQL executions, the number of execution plans and the database in which the SQL statement is executed (area 1 in the following figure).
- The execution plan list: If a SQL statement has multiple execution plans, this list is displayed. Besides text information of execution plans, TiDB v6.2.0 introduces visual execution plans, through which you can learn each operator of a statement and detailed information more intuitively. You can select different execution plans, and the details of the selected plans are displayed below the list (area 2 in the following figure).
- Execution detail of plans, which displays the detailed information of the selected execution plans. See [Execution plan in details](#execution-details-of-plans) (area 3 in the following figure).

![Details](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-statement-detail-v620.png)

## Execution details of plans

The execution detail of plans includes the following information:

- SQL sample: The text of a certain SQL statement that is actually executed corresponding to the plan. Any SQL statement that has been executed within the time range might be used as a SQL sample.
- Execution plan: Complete information about execution plans, displayed in graph and text. For details of the execution plan, see [Understand the Query Execution Plan](/explain-overview.md). If multiple execution plans are selected, only (any) one of them is displayed.
- For basic information, execution time, Coprocessor read, transaction, and slow query of the SQL statement, you can click the corresponding tab titles to switch among different information.

![Execution details of plans](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-statement-plans-detail.png)

### Basic Tab

The basic information of a SQL execution includes the table names, index name, execution count, and total latency. The **Description** column provides detailed description of each field.

![Basic information](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-statement-plans-basic.png)

### Time Tab

Click the **Time** tab, and you can see how long each stage of the execution plan lasts.

> **Note:**
>
> Because some operations might be performed in parallel within a single SQL statement, the cumulative duration of each stage might exceed the actual execution time of the SQL statement.

![Execution time](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-statement-plans-time.png)

### Coprocessor Read Tab

Click the **Coprocessor Read** tab, and you can see information related to Coprocessor read.

![Coprocessor read](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-statement-plans-cop-read.png)

### Transaction Tab

Click the **Transaction** tab, and you can see information related to execution plans and transactions, such as the average number of written keys or the maximum number of written keys.

![Transaction](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-statement-plans-transaction.png)

### Slow Query Tab

If an execution plan is executed too slowly, you can see its associated slow query records under the **Slow Query** tab.

![Slow Query](https://docs-download.pingcap.com/media/images/docs/dashboard/dashboard-statement-plans-slow-queries.png)

The information displayed in this area has the same structure with the slow query page. See [TiDB Dashboard Slow Query Page](/dashboard/dashboard-slow-query.md) for details.
