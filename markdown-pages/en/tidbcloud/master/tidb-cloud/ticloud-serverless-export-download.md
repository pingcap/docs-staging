---
title: ticloud serverless export download
summary: The reference of `ticloud serverless export download`.
---

# ticloud serverless export download

Download the exported data from a TiDB Cloud Serverless cluster to your local storage:

```shell
ticloud serverless export download [flags]
```

## Examples

Download the exported data in interactive mode:

```shell
ticloud serverless export download
```

Download the exported data in non-interactive mode:

```shell
ticloud serverless export download -c <cluster-id> -e <export-id>
```

## Flags

In non-interactive mode, you need to manually enter the required flags. In interactive mode, you can just follow CLI prompts to fill them in.

| Flag                    | Description                                                                                                                       | Required | Note                                                 |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------|
| -c, --cluster-id string | Specifies the ID of the cluster.                                                                                                  | Yes      | Only works in non-interactive mode.                  |
| -e, --export-id string  | Specifies the ID of the export task.                                                                                              | Yes      | Only works in non-interactive mode.                  |
| --output-path string    | Specifies the destination path for saving the downloaded data. If not specified, the data is downloaded to the current directory. | No       | Only works in non-interactive mode.                  |
| --concurrency int       | Specifies the download concurrency. The default value is `3`.                                                                                                 | No       | Works in both non-interactive and interactive modes. |
| --force                 | Downloads the exported data without confirmation.                                                                                 | No       | Works in both non-interactive and interactive modes. |
| -h, --help              | Shows help information for this command.                                                                                          | No       | Works in both non-interactive and interactive modes. |

## Inherited flags

| Flag                 | Description                                                                                          | Required | Note                                                                                                             |
|----------------------|------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------|
| --no-color           | Disables color in output.                                                                            | No       | Only works in non-interactive mode. In interactive mode, disabling color might not work with some UI components. |
| -P, --profile string | Specifies the active [user profile](/tidb-cloud/cli-reference.md#user-profile) used in this command. | No       | Works in both non-interactive and interactive modes.                                                             |
| -D, --debug          | Enables debug mode.                                                                                   | No       | Works in both non-interactive and interactive modes.                                                             |

## Feedback

If you have any questions or suggestions on the TiDB Cloud CLI, feel free to create an [issue](https://github.com/tidbcloud/tidbcloud-cli/issues/new/choose). Also, we welcome any contributions.
