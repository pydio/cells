# Docker and Docker Compose configuration

![Docker Pulls](https://img.shields.io/docker/pulls/pydio/cells.svg)
![Docker Stars](https://img.shields.io/docker/stars/pydio/cells.svg)
![](https://images.microbadger.com/badges/image/pydio/cells.svg)

As a convenience, we also provide a pre-built Docker image of Pydio Cells that is hosted on the [Docker hub](https://hub.docker.com/r/pydio/cells).
As you can see in the `dockerfile`, the config is quite straight forward. Important points:

- by default Cells working dir is set to `/var/cells`
- the image is run as root
- the internal proxy configuration that is the only requirement to start Cells in install mode and finetune the configuration via your preferred web browser can be configure via environment variables or json / yaml config file.

By default the server starts in self-signed mode on port 443. It is also possible to modify the configuration to also use :

- no certificate
- a certificate _auto magically_ created using the tools provided by [Let's Encrypt](https://letsencrypt.org/)
- a custom certificate that you provide.

You can find below samples of relevant docker-compose directive to achieve these use cases.

We also provide 3 sample docker compose configuration as example that are working out-of-the-box, if you only provide your public IP / valid domain name, see `compose` sub directory.  


## Sample config for the Pydio Cells internal main gateway

## Without certificate (via HTTP)

```conf
  cells:
        image: pydio/cells:latest
        restart: always
        volumes: ["data:/var/cells/data"]
        ports: ["80:80"]
        environment:
            - CELLS_BIND=localhost:8080
            - CELLS_EXTERNAL=localhost:8080
            - CELLS_NO_TLS=1
```

## With Let's Encrypt

```conf
  cells:
        image: pydio/cells:latest
        restart: always
        volumes: ["data:/var/cells/data"]
        ports: ["80:80", "443:443"]
        environment:
            - CELLS_BIND=0.0.0.0:443
            - CELLS_EXTERNAL=https://your.fqdn.com
            - CELLS_TLS_MAIL=admin@example.com
            - CELLS_ACCEPT_LETSENCRYPT_EULA=true
            - CELLS_USE_LETSENCRYPT_STAGING=1
```

## Using a custom certificate

```conf
  cells:
        image: pydio/cells:latest
        restart: always
        volumes: ["data:/var/cells/data", "/path/to/your/ssl.cert:/etc/ssl/ssl.cert", "/path/to/your/ssl.key:/etc/ssl/ssl.key"]
        ports: ["8080:8080"]
        environment:
            - CELLS_BIND=localhost:443
            - CELLS_EXTERNAL=https://your.fqdn.com
            - CELLS_TLS_CERT_FILE=/etc/ssl/ssl.cert
            - CELLS_TLS_KEY_FILE=/etc/ssl/ssl.key
```
