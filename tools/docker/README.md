# Docker and Docker Compose configuration

![Docker Pulls](https://img.shields.io/docker/pulls/pydio/cells.svg)
![Docker Stars](https://img.shields.io/docker/stars/pydio/cells.svg)
![](https://images.microbadger.com/badges/image/pydio/cells.svg)

As a convenience, we also provide a pre-built Docker image of Pydio Cells that is hosted on the [Docker hub](https://hub.docker.com/r/pydio/cells).
As you can see in the `dockerfile`, the config is quite straight forward. Important points:

- by default Cells working dir is set to `/var/cells`
- the image is run as root
- the internal proxy configuration can be configure via environment variables or json / yaml config file.  
  It is the only requirement to start Cells in install mode and fine tune the configuration via your preferred web browser.

By default the server starts in self-signed mode on port 8080. It is also possible to modify the configuration to also use:

- no certificate
- a certificate _auto magically_ created using the tools provided by [Let's Encrypt](https://letsencrypt.org/)
- a custom certificate that you provide.

You can find below samples of relevant docker-compose directive to achieve these use cases.

We also provide a few sample docker compose configurations as examples that are working out-of-the-box, if you only provide your public IP / valid domain name, see `compose` sub-directory.  

## Sample config for the Pydio Cells internal web server

### Default config

This starts Cells and exposes the server with a self-signed certificate on port 8080, you can reach the web interface using the IP address of your server or any FQDN that has been registered in a DNS and points toward this IP, together with explicit port 8080, for instance: `https://1.2.3.4:8080` or `https://example.com:8080`:

```yaml
  cells:
    image: pydio/cells:latest
    restart: unless-stopped
    ports: ["8080:8080"]
```

### Without certificate (via HTTP)

```yaml
  cells:
    image: pydio/cells:latest
    restart: unless-stopped
    ports: ["8080:8080"]
    environment:
      - CELLS_NO_TLS=1
```

### With Let's Encrypt

```yaml
  cells:
    image: pydio/cells:latest
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    environment:
      - CELLS_BIND=your.fqdn.com:443
      - CELLS_EXTERNAL=https://your.fqdn.com
      - CELLS_LE_EMAIL=admin@example.com
      - CELLS_LE_AGREE=1
```

### Using a custom certificate

```yaml
  cells:
    image: pydio/cells:latest
    restart: unless-stopped
    volumes: ["/path/to/your/ssl.cert:/etc/ssl/ssl.cert", "/path/to/your/ssl.key:/etc/ssl/ssl.key"]
    ports: ["443:443"]
    environment:
      - CELLS_BIND=0.0.0.0:443
      - CELLS_EXTERNAL=https://your.fqdn.com
      - CELLS_TLS_CERT_FILE=/etc/ssl/ssl.cert
      - CELLS_TLS_KEY_FILE=/etc/ssl/ssl.key
```
