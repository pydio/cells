A Practical Guide for Testing and Evaluation using the new helm chart `1.0.0-beta` with OpenShift local

## Introduction

This article walks you through deploying Pydio Cells v5 on a OpenShift local instance for testing or evaluation purposes.
Version 5 is accompanied by the new Helm chart `1.0.0-beta`, which significantly improves modularity and flexibility.

## Why a New Helm Chart?

### Old Chart: `0.1.3`

* Dependencies (MariaDB, MinIO, Redis, MongoDB...) were **tightly coupled** inside the chart.
* It relied heavily on **Bitnami sub-charts**.
* Hard to replace components, upgrade versions, or adapt to production environments.

### New Chart: `1.0.0-beta`

In the new helm chart, the integrated dependencies are still supported. However, in this tutorial, we focus to the deployment using external helm charts for dependencies.

|Service|Purpose|Deployment|
|-|-|-|
|**MariaDB**|Main SQL database      |Bitnami chart|
|**Redis**|          Cache / KV             |Bitnami chart|
|**MinIO**|          S3-compatible object storage   |MinIO official chart|
|**MongoDB**|        Metadata NoSQL store   |MongoDB Community Operator|
|**etcd**|           Service discovery      |Official value file|
|**NATS**|           Message broker         |NATS official chart|
|**Vault**|          Secret store           |HashiCorp chart|
|**cert-manager**|   Issue TLS certs for all components|    Jetstack chart|

## Prerequisites

* x86_64 virtual machine
* Helm – https://helm.sh/docs/intro/install/
* oc – https://www.redhat.com/en/blog/install-openshift-local

## Repository Structure

Source: https://github.com/pydio/cells/tree/v5-dev/tools/kubernetes/examples/openshift

```    
    openshift/
      cells/             # Cells Helm values (modular: one file per backend system)

      # Dependencies
      mariadb/           # MariaDB Helm chart values
      redis/             # Redis Helm chart values
      s3minio/           # MinIO Helm chart values
      mongodb/           # MongoDB operator + MongoDBCommunity CR
      etcd/              # etcd manifest
      nats/              # NATS values
      cert-manager/      # CA issuer, self-signed root CA, service certificates
```

In the `openshift/cells` repository, the main `values.yaml` file of the Cells Helm chart is split into several smaller files. This approach simplifies maintenance, makes configuration easier to understand, and avoids dealing with one excessively large values.yaml file.

> NOTICE: Following commands will be run from **openshift** directory

## Installation Steps

### Start a openshift local instance

``` bash
crc config set disk-size 120
crc config set cpus 8
crc config set memory 20000 # 20G
crc delete -f
crc setup
crc start
eval $(crc oc-env)
```

> CAUTION: The deployment may fail due to insufficient system resources, particularly when memory is limited.

### Add Helm repositories

``` bash
helm repo add cells https://download.pydio.com/pub/charts/helm
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add nats https://nats-io.github.io/k8s/helm/charts
helm repo add mongodb https://mongodb.github.io/helm-charts
helm repo add minio https://charts.min.io/
helm repo add hashicorp https://helm.releases.hashicorp.com
helm repo add jetstack https://charts.jetstack.io
helm repo add hashicorp https://helm.releases.hashicorp.com
helm repo update
```

### Create namespace

```bash
oc create namespace cells
```

### Install cert-manager (optional)

``` bash
helm upgrade --install cert-manager jetstack/cert-manager   -n cert-manager --set installCRDs=true  --create-namespace --wait

```

### Shared secrets between cells and dependencies

```
# certificates (optional)
# oc apply -n cells -f cert-manager/selfsigned-issuer.yaml
# oc apply -n cells -f cert-manager/ca.yaml
# oc apply -n cells -f cert-manager/mariadb-cert.yaml

# minio secrets
oc apply -f s3minio/minio-root-secret.yaml -n cells
oc apply -f s3minio/minio-user-secret.yaml -n cells

# mariadb secrets
oc apply -f mariadb/mariadb-secret.yaml -n cells

# mongodb secrets
oc apply -f mongodb/mongodb-cells-secret.yaml -n cells
oc apply -f mongodb/mongodb-admin-secret.yaml -n cells

# vault config map
oc apply -f vault/cells-configmap.yaml -n cells
```

### Deploy dependencies

```bash
# mariadb
helm upgrade --install my-mariadb bitnami/mariadb -n cells -f mariadb/values.yaml --wait

# redis
helm upgrade --install my-redis bitnami/redis -n cells -f redis/values.yaml --wait

# minio
helm upgrade --install cells-minio minio/minio -n cells -f s3minio/values.yaml --wait

# mongodb
# Use modern operator: mongodb/mongodb-kubernetes
helm upgrade --install mongodb-operator mongodb/mongodb-kubernetes \
   -f https://raw.githubusercontent.com/mongodb/helm-charts/main/charts/mongodb-kubernetes/values-openshift.yaml \
   -n cells --wait
oc apply -n cells -f mongodb/values.yaml

# etcd
oc apply -n cells -f etcd/values.yaml

# nats
helm upgrade --install nats nats/nats -f nats/values.yaml -n cells  --wait

# vault 
helm install vault hashicorp/vault -f vault/values.yaml -f vault/openshift.yaml -n cells --wait
```

### Deploy Pydio Cells v5

``` bash
helm upgrade --install cells cells/cells   -n cells   --devel   -f cells/cells.yaml   -f cells/sql.yaml   -f cells/redis.yaml   -f cells/s3.yaml   -f cells/discovery.yaml   -f cells/nosql.yaml   -f cells/broker.yaml   -f cells/vault.yaml   --wait
```

## Access Cells

```bash
oc -n cells port-forward svc/cells 8080:8080
```

Then open: `http://localhost:8080`

## Reset cells deployment

Some resources won't be deleted after `helm uninstall cells -n cells`. You should remove them manually before starting a new deployment

```bash
oc delete  mutatingwebhookconfiguration cells-vault-agent-injector-cfg 

oc delete pvc data-cells-vault-0 -n cells
```

Removing old config persisted in etcd

```bash
oc exec statefulsets/etcd -n cells -it -- etcdctl del config
oc exec statefulsets/etcd -n cells -it -- etcdctl del vault
```

We should purge the databases in sql, no-sql before starting a new cells deployment

## Caveats

- Vault data is not peristed. The master key is lost after a k8s restart. In production, the deployment requires KMS service for vault unsealing process.
- 10 minutes session timeout/upload failure issue. You may have this issue when browsing the web page through a URL different from `ReverseProxyURL` which is set in `cells/cells.yaml`.
- All dependencies run in "standalone" mode
- Cells operates with a single pod
- Connections between cells and dependencies are not using TLS
- Mariadb, Redis are deployed using bitnami helm chart with rolling-tag images.
- **minio helm** chart doesn't create standard users correctly. Currently, cells uses **root** account to connect to minio.
- minio storage size: 15GB
