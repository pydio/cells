# Docker and Docker Compose configuration

In this folder you can find an example of a working docker compose file that will install and start a Pydio Cells instance with a self signed certificate on port 443.

Thanks to the non-interractive installer, it is also possible to modify the configuration to also use:

- no certificate
- a certificate _auto magically_ created using the tools provided by [Let's Encrypt](https://letsencrypt.org/)
- a custom certificate that you provide.

Here are samples of relevant docker-compose directive to achieve these use cases.

## Without certificate (via HTTP)

```conf
  cells:
        image: pydio/cells:latest
        restart: always
        volumes: ["data:/root/.config/pydio/cells/data"]
        ports: ["8080:8080"]
        environment:
            - CELLS_BIND=localhost:8080
            - CELLS_EXTERNAL=localhost:8080
            - CELLS_NO_SSL=1
```

## With Let's Encrypt

```conf
  cells:
        image: pydio/cells:latest
        restart: always
        volumes: ["data:/root/.config/pydio/cells/data"]
        ports: ["80:80", "443:443"]
        environment:
            - CELLS_BIND=0.0.0.0:443
            - CELLS_EXTERNAL=https://your.fqdn.com
            - CELLS_ACCEPT_LETSENCRYPT_EULA=true
            - CELLS_TLS_MAIL=admin@example.com
```

## Using a custom certificate

```conf
  cells:
        image: pydio/cells:latest
        restart: always
        volumes: ["data:/root/.config/pydio/cells/data", "/path/to/your/ssl.cert:/root/ssl/ssl.cert", "/path/to/your/ssl.key:/root/ssl/ssl.key"]
        ports: ["8080:8080"]
        environment:
            - CELLS_BIND=localhost:443
            - CELLS_EXTERNAL=https://your.fqdn.com
            - CELLS_SSL_CERT_FILE=/root/ssl/ssl.cert
            - CELLS_SSL_KEY_FILE=/root/ssl/ssl.key
```