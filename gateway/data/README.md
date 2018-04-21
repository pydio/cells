# S3 Gateway

The S3 Gateway is the main access to files and folders stored in Pydio. It is based on Minio server with a custom gateway.

## Communication

The custom gateway is implemented to query the Tree service and the various Pydio Datasources : for all "stat" and "list"
related queries, it will use the NodeProvider interface of Tree service. For all "content" related queries (=GET/PUT), it will
proxy directly to the underlying S3 server of each datasource.

TODO Schema