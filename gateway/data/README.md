# S3 Gateway

The gateway package that can be found at `github.com/pydio/cells/gateway/data/` provides a S3 API compatible gateway that provides the main access point to files and folders stored in Pydio.

It is based on a [Minio server](https://minio.io/) with a custom gateway and is registered as a Pydio Cells' microservice with id `pydio.grpc.gateway.data`.

## Overview

The custom gateway provides access to the tree service and the various Pydio Datasources:

- for all "stat" and "list" related queries, it uses the `NodeProvider` interface of Tree service,
- for all "content" related queries (various `GET` and `PUT` request), it directly proxies to the underlying S3 server of each datasource.

[TODO: add a schema and more info]