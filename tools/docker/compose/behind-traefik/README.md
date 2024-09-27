# Deploy your Pydio Cells server behind a Traefik reverse proxy

## Overview

This sample configuration has the following characteristics:

- Cells running on https://${PUBLIC_FQDN}
- Proxy is done by Traefik web server
- Traefik v2 handles certificate management using Let's Encrypt
- Traefik's dashboard is enabled and accessible with admin / admin under https://${PUBLIC_FQDN}/dashboard/
- DB is running in a separate MySQL docker container

**WARNING**: by using this docker-compose setup, you accept [Let's Encrypt EULA](https://letsencrypt.org/documents/LE-SA-v1.2-November-15-2017.pdf).

## How to use

- update `.env` file with your specific values
- create an empty `acme.json` file in the same folder: `touch acme.json; chmod 600 acme.json`
- launch docker compose: `docker-compose up -d; docker-compose logs -f`

By default, the attached docker-compose file is configured to use the staging CA URL of Let's Encrypt, to avoid having your FQDN being blacklisted by Let's Encrypt if something is not correctly configured at first launch.

When you are happy with your configuration, comment out the corresponding line (~L73):

`- "traefik.http.middlewares.admin.basicauth.users=admin:$$apr1$$KnKvATsN$$L8K.P.maCu4zR/rVzD8h0/"`

Reinitialise your acme.json file:

`rm acme.json; touch acme.json; chmod 600 acme.json`

And relaunch your app.
