---
title: ticloud config use
summary: The reference of `ticloud config use`.
---

# ticloud config use

Set a specified profile as the active [user profile](/tidb-cloud/cli-reference.md#user-profile):

```shell
ticloud config use <profile-name> [flags]
```

## Examples

Set the `test` profile as the active user profile:

```shell
ticloud config use test
```

## Flags

| Flag       | Description              |
|------------|--------------------------|
| -h, --help | Shows help information for this command. |

## Inherited flags

| Flag                 | Description                                   | Required | Note                                                                                                                    |
|----------------------|-----------------------------------------------|----------|--------------------------------------------------------------------------------------------------------------------------|
| --no-color           | Disables color in output.                      | No       | Only works in non-interactive mode. In interactive mode, disabling color might not work with some UI components. |
| -P, --profile string | Specifies the active [user profile](/tidb-cloud/cli-reference.md#user-profile) used in this command. | No       | Works in both non-interactive and interactive modes.                                                                      |
| -D, --debug          | Enables debug mode.                                                                                   | No       | Works in both non-interactive and interactive modes.                                                             |

## Feedback

If you have any questions or suggestions on the TiDB Cloud CLI, feel free to create an [issue](https://github.com/tidbcloud/tidbcloud-cli/issues/new/choose). Also, we welcome any contributions.
