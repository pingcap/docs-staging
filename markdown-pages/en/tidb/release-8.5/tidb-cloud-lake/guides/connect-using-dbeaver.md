---
title: DBeaver
summary: DBeaver supports connecting to TiDB Cloud Lake using a built-in driver categorized under Analytical, available starting from version 24.3.1.
---

# DBeaver

[DBeaver](https://dbeaver.com/) supports connecting to TiDB Cloud Lake using a built-in driver categorized under **Analytical**, available starting from **version 24.3.1**.

![Connect from DBeaver](https://docs-download.pingcap.com/media/images/docs/tidb-cloud-lake/dbeaver.png)

## Prerequisites

- DBeaver 24.3.1 or later version installed

## User Authentication

For connections to TiDB Cloud Lake, you can use the default `cloudapp` user or an SQL user created with the [CREATE USER](/tidb-cloud-lake/sql/create-user.md) command. Please note that the user account you use to log in to the [TiDB Cloud Lake console](https://app.lake.tidbcloud.com) cannot be used for connecting to TiDB Cloud Lake.

## Connecting to TiDB Cloud Lake

### Step 1: Obtain TiDB Cloud Lake Connection Information

Log in to TiDB Cloud Lake to obtain connection information. For more information, see [Connecting to a Warehouse](/tidb-cloud-lake/guides/warehouse.md#connecting).

![alt text](https://docs-download.pingcap.com/media/images/docs/tidb-cloud-lake/dbeaver-connect-info.png)

> **Note:**
>
> If your `user` or `password` contains special characters, you need to provide them separately in the corresponding fields (e.g., the `Username` and `Password` fields in DBeaver). In this case, TiDB Cloud Lake will handle the necessary encoding for you. However, if you're providing the credentials together (e.g., as `user:password`), you must ensure that the entire string is properly encoded before use.

### Step 2: Configure TiDB Cloud Lake Connection

1. In DBeaver, go to **Database** > **New Database Connection** to open the connection wizard, then select **Databend** under the **Analytical** category.

    ![alt text](https://docs-download.pingcap.com/media/images/docs/tidb-cloud-lake/dbeaver-analytical.png)

2. In the **Main** tab, enter the **Host**, **Port**, **Username**, and **Password** based on the connection information obtained in the previous step.

    ![alt text](https://docs-download.pingcap.com/media/images/docs/tidb-cloud-lake/dbeaver-main-tab.png)

3. In the **Driver properties** tab, enter the **Warehouse** name based on the connection information obtained in the previous step.

    ![alt text](https://docs-download.pingcap.com/media/images/docs/tidb-cloud-lake/dbeaver-driver-properties.png)

4. In the **SSL** tab, select the **Use SSL** checkbox.

    ![alt text](https://docs-download.pingcap.com/media/images/docs/tidb-cloud-lake/dbeaver-use-ssl.png)

5. Click **Test Connection** to verify the connection. If this is your first time connecting to TiDB Cloud Lake, you will be prompted to download the driver. Click **Download** to proceed. Once the download is complete, the test connection should succeed:

    ![alt text](https://docs-download.pingcap.com/media/images/docs/tidb-cloud-lake/dbeaver-cloud-success.png)
