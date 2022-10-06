# HA setup

Simple docker-compose deployment to experiment with Cells v4 Clustering model.
It uses `pydio/cells:unstable` docker image, use whatever image by editing the docker-compose.yml file.

## Preparing dependencies

HA deployments relies on external dependencies to make Cells image fully stateless. 
This sample creates the following images : MySQL, MongoDB, NATS.io, ETCD, Hashicorp Vault and Redis.

This Vault requires a manual preparation for a specific key/value store (see below)

```sh
cd <this folder>
# start all third-party services
docker-compose up -d mysql mongo nats etcd vault redis minio caddy

# create buckets in minio 
docker-compose up createbuckets

# Create a dedicated kvstore for certificates in Vault (configured in DEV mode with a preset VAULT_TOKEN, this should not be the case in production)
docker-compose exec -e VAULT_ADDR=http://localhost:8200 -e VAULT_TOKEN=secret_vault_token vault vault secrets enable -version=2 -path=caddycerts kv
```

## Starting Cells Nodes

```sh
# Start one node, then open https://localhost:8080 to perform the install, it will read the conf/install-conf.yaml file
docker-compose up -d cells1; docker-compose logs -f cells1
```

Now you can spin more cells nodes:
```sh
# Once install is finished, start other nodes 
docker-compose up -d cells2 cells3; docker-compose logs -f cells2 cells3
```

## Caddy LoadBalancer Access

Caddy load balancer is configured in self-signed mode. 
This requires adding localhost => caddy domain name to your local /etc/hosts file.

Once started, it will monitor cells instances on /pprofs endpoint to automatically enable/disable upstreams.

Access https://caddy:8585/ to access Cells. Enjoy!

## Stopping cluster

```sh
# To clean everything
docker-compose down -v --remove-orphan
```

