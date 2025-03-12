# HA setup

Simple Docker Compose deployment to experiment with Cells v4 Clustering model.
It uses `pydio/cells:4` docker image (that is the latest image of the v4 release train).
Adapt in the docker-compose.yml file if you want to rather use another image.

> Note: adapt `unattended_install.yml` file with your ENVs in .env file

## Starting cluster

```sh
# Once install is finished, start other nodes 
docker compose up -d
```

## Caddy LoadBalancer Access

Caddy load balancer is configured in self-signed mode. 

You have `CELLS_URL=https://cells.domain.com ` in .env file

This requires adding localhost => caddy domain name to your local /etc/hosts file.


```
127.0.0.1 cells.domain.com
```

Once started, it will monitor cells instances on /pprofs endpoint to automatically enable/disable upstreams.

Access https://cells.domain.com to access Cells. Enjoy!

## Stopping cluster

```sh
# To clean everything
docker compose down -v --remove-orphans
```
