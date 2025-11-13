---
title: TLS Connections to TiDB Cloud Premium
summary: Introduce TLS connections in TiDB Cloud Premium.
---

# TLS Connections to TiDB Cloud Premium

On TiDB Cloud, establishing TLS connections is one of the basic security practices for connecting to TiDB Cloud Premium instances. You can configure multiple TLS connections from your client, application, and development tools to your TiDB Cloud Premium instance to protect data transmission security. For security reasons, TiDB Cloud Premium only supports TLS 1.2 and TLS 1.3, and does not support TLS 1.0 or TLS 1.1.

To ensure data security, the Certificate Authority (CA) certificate for your TiDB Cloud Premium instance is hosted on [AWS Private Certificate Authority](https://aws.amazon.com/private-ca/). The private key of the CA certificate is stored in AWS-managed hardware security modules (HSMs) that meet [FIPS 140-2 Level 3](https://csrc.nist.gov/projects/cryptographic-module-validation-program/Certificate/3139) security standards.

## Prerequisites

- Log in to TiDB Cloud via [Password Authentication](/tidb-cloud/tidb-cloud-password-authentication.md) or [SSO Authentication](/tidb-cloud/tidb-cloud-sso-authentication.md), and then [Create a TiDB Cloud Premium instance](/tidb-cloud/premium/create-tidb-instance-premium.md).

- Set a password to access your instance in secure settings.

    To do so, you can navigate to the [**TiDB Instances**](https://tidbcloud.com/tidbs) page, click **...** in the row of your TiDB Cloud Premium instance, and then select **Change Root Password**. In password settings, you can click **Auto-generate Password** to automatically generate a root password with a length of 16 characters, including numbers, uppercase and lowercase characters, and special characters.

## Secure connection to a TiDB Cloud Premium instance

In the [TiDB Cloud console](https://tidbcloud.com/), you can get examples of different connection methods and connect to your TiDB Cloud Premium instance as follows:

1. Navigate to the [**TiDB Instances**](https://tidbcloud.com/tidbs) page, and then click the name of your TiDB Cloud Premium instance to go to its overview page.

2. Click **Connect** in the upper-right corner. A dialog is displayed.

3. In the connection dialog, select **Public** from the **Connection Type** drop-down list.

    If you have not configured the IP access list, click **Configure IP Access List** to configure it before your first connection. For more information, see [Configure an IP access list](/tidb-cloud/premium/configure-ip-access-list-premium.md).

4. Click **CA cert** to download CA cert for TLS connection to TiDB instances. The CA cert supports TLS 1.2 by default.

    > **Note:**
    >
    > - You can store the downloaded CA cert in the default storage path of your operating system, or specify another storage path. You need to replace the CA cert path in the code example with your own CA cert path in the subsequent steps.
    > - TiDB Cloud Premium does not force clients to use TLS connections, and user-defined configuration of the [`require_secure_transport`](/system-variables.md#require_secure_transport-new-in-v610) variable is currently not supported on TiDB Cloud Premium.

5. Choose your preferred connection method, and then refer to the connection string and sample code on the tab to connect to your instance.

## Manage root certificates for TiDB Cloud Premium

TiDB Cloud Premium uses certificates from [AWS Private Certificate Authority](https://aws.amazon.com/private-ca/) as a CA for TLS connections between clients and TiDB Cloud Premium instances. Usually, the private key of the CA certificate is stored securely in AWS-managed hardware security modules (HSMs) that meet [FIPS 140-2 Level 3](https://csrc.nist.gov/projects/cryptographic-module-validation-program/Certificate/3139) security standards.

## FAQs

### Which TLS versions are supported to connect to my TiDB Cloud Premium instance?

For security reasons, TiDB Cloud Premium only supports TLS 1.2 and TLS 1.3, and does not support TLS 1.0 or TLS 1.1. See IETF [Deprecating TLS 1.0 and TLS 1.1](https://datatracker.ietf.org/doc/rfc8996/) for details.

### Is two-way TLS authentication between my client and TiDB Cloud Premium supported?

No.

TiDB Cloud Premium only supports one-way TLS authentication, and does not support two-way TLS authentication currently. If you need two-way TLS authentication, contact [TiDB Cloud Support](/tidb-cloud/tidb-cloud-support.md).
