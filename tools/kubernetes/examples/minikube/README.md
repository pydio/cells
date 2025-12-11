A Practical Guide for Testing and Evaluation using the new helm chart `1.0.0-beta`

## Introduction

This article walks you through deploying Pydio Cells v5 on a local Minikube cluster for testing or evaluation purposes.
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

* Helm – https://helm.sh/docs/intro/install/
* kubectl – https://kubernetes.io/docs/tasks/tools/
* Minikube – https://minikube.sigs.k8s.io/docs/start/

## Repository Structure

Source: https://github.com/pydio/cells/tree/v5-dev/tools/kubernetes/examples/minikube

```    
    cellsv5-on-minikube/
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

In the `cellsv5-on-minikube/cells` repository, the main `values.yaml` file of the Cells Helm chart is split into several smaller files. This approach simplifies maintenance, makes configuration easier to understand, and avoids dealing with one excessively large values.yaml file.

## Installation Steps

### Start minikube

``` bash
minikube start --cpus=4 --memory=8g
```

### Add Helm repositories

``` bash
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
kubectl create namespace cells
```

### Install cert-manager (optional)

``` bash
helm upgrade --install cert-manager jetstack/cert-manager   -n cert-manager --set installCRDs=true  --create-namespace --wait

```

### Shared secrets between cells and dependencies

```
# certificates (optional)
# kubectl apply -n cells -f cert-manager/selfsigned-issuer.yaml
# kubectl apply -n cells -f cert-manager/ca.yaml
# kubectl apply -n cells -f cert-manager/mariadb-cert.yaml

# minio secrets
kubectl apply -f s3minio/minio-root-secret.yaml -n cells
kubectl apply -f s3minio/minio-user-secret.yaml -n cells

# mariadb secrets
kubectl apply -f mariadb/mariadb-secret.yaml -n cells

# mongodb secrets
kubectl apply -f mongodb/mongodb-cells-secret.yaml -n cells
kubectl apply -f mongodb/mongodb-admin-secret.yaml -n cells

# vault config map
kubectl apply -f vault/cells-configmap.yaml -n cells
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
helm upgrade --install mongodb-operator mongodb/community-operator -n cells --wait
kubectl apply -n cells -f mongodb/values.yaml

# etcd
kubectl apply -n cells -f etcd/values.yaml

# nats
helm upgrade --install nats nats/nats -f nats/values.yaml -n cells  --wait

# vault 
helm install vault hashicorp/vault -f vault/values.yaml -n cells --wait
```

### Deploy Pydio Cells v5

``` bash
helm upgrade --install cells cells/cells   -n cells   --devel   -f cells/cells.yaml   -f cells/sql.yaml   -f cells/redis.yaml   -f cells/s3.yaml   -f cells/discovery.yaml   -f cells/nosql.yaml   -f cells/broker.yaml   -f cells/vault.yaml   --wait
```

## Access Cells

```bash
kubectl -n cells port-forward svc/cells 8080:8080
```

Then open: `http://localhost:8080`

## Reset cells deployment

Some resources won't be deleted after `helm uninstall cells -n cells`. You should remove them manually before starting a new deployment

```bash
kubectl delete  mutatingwebhookconfiguration cells-vault-agent-injector-cfg 

kubectl delete pvc data-cells-vault-0 -n cells
```

Removing old config persisted in etcd

```bash
kubectl exec statefulsets/etcd -n cells -it -- etcdctl del config
kubectl exec statefulsets/etcd -n cells -it -- etcdctl del vault
```

We should purge the databases in sql, no-sql before starting a new cells deployment


## Caveat

- Vault data is not peristed. The master key is lost after a k8s restart. In production, the deployment requires KMS service for vault unsealing process.
- 10 minutes session timeout/upload failure issue. You may have this issue when browsing the web page through a URL different from `ReverseProxyURL` which is set in `cells/cells.yaml`.
- All dependencies run in "standalone" mode
- Cells operates with a single pod
- Connections between cells and dependencies are not using TLS
- Mariadb, Redis are deployed using bitnami helm chart with rolling-tag images.
- **minio helm** chart doesn't create standard users correctly. Currently, cells uses **root** account to connect to minio.
- minio storage size: 15GB