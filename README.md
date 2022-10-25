# PingCAP Docs Website Scaffold

This scaffold helps you to deploy a [PingCAP documentation website](https://docs.pingcap.com) easily.

To create a **production** build, you can run the `./build.sh` script.

To create a **development** build, you can run the `./build.sh` script with `dev` or `develop` argument.

## Workflow

### Overview

![image](https://user-images.githubusercontent.com/56986964/183846841-d8a0027d-21cf-4d73-970d-89df0e456102.png)

### How Docs Staging Update Itself

#### 1. Trigger by event from Docs Source Repo

![image](https://user-images.githubusercontent.com/56986964/183847182-73d83a99-5af3-43aa-9bfa-e0e2d3cbe2f2.png)

#### 2. Trigger by event manually

![image](https://user-images.githubusercontent.com/56986964/183847213-bc18a345-f17b-473f-84a9-ca05215be3b7.png)

## Config Actions Secrets

### 1. Install `Surge.sh` CLI

```bash
npm install --global surge
```

### 2. Login `Surge.sh`

```bash
surge login
```

### 3. Create `Surge.sh` Token

```bash
surge token
```

### 4. Config `Surge.sh` Token

Visit `<Your Repo URL>/settings/secrets/actions` and add `SURGE_TOKEN` with the token you just created.
