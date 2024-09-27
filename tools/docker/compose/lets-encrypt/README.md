# Cells Home with a Let's Encrypt certificate

## Overview

This sample configuration has the following characteristics:

- Cells running on https://${PUBLIC_FQDN}
- The internal web server is directly connected to the internet (no reverse proxy)
- Certificates are automagically generated with Let's Encrypt: **ports 80 and 443 must be unused**.
- DB is running in a separate MySQL docker container

**WARNING**: by using this docker-compose setup, you accept [Let's Encrypt EULA](https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf).

## How to use

- Update `.env` file with your specific values
- Launch docker compose: `docker compose up -d; docker compose logs -f`
