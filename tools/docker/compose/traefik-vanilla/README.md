# Cells Home behind Traefik 2 reverse proxy

## Overview

This sample configuration haas following caracteristics:

- Cells running on https://${PUBLIC_FQDN}
- Proxy is done by Traefik web server
- Traefik handles certificate management using Let's Encrypt
- Traefik's dashboard is enable and accesible with admin / admin under https://${PUBLIC_FQDN}/dashboard/
- DB is running in a separate MySQL docker container

## How to use

- upadate `.env.sample` file with your specific values and rename it to `.env`
- create an empty `acme.json` file in the same folder: `touch acme.json; chmod 600 acme.json`
- launch docker compose: `docker-compose up -d; docker-compose logs -f`

By default attached compose file is configured to use the staging CA URL of Let's Encrypt, to avoid having your FQDN being black listed by Let's Encrypt if something is not correctly configured at first launch.

When you are happy with your conf, just comment out the corresponding line (~L73):

`- "traefik.http.middlewares.admin.basicauth.users=admin:$$apr1$$KnKvATsN$$L8K.P.maCu4zR/rVzD8h0/"`

and reinitialise your acme.json file:

`rm acme.json; touch acme.json; chmod 600 acme.json`

And relaunch your app.
