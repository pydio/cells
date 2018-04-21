# Meta Service

A central storage for all nodes metadata.

## API

Metadata are stored JSON-serialized and associated to nodes UUID. This service is not indexed (except by node UUID). See the Search service if you need to make metadata queryable.

This service provides two handlers:

- GRPC: for internal communication
- HTTP API: for setting/reading meta from the clients.

TODO: Later should be transformed to a REST service.

## Events

Meta service publishes the following NodeChange events to the topic **common.TOPIC\_META\_CHANGES** :

- NodeChangeEvent\_UPDATE\_META
- NodeChangeEvent\_DELETE

Meta service is subscribing to the following NodeChange events on topic **common.TOPIC\_TREE\_CHANGES**

- NodeChangeEvent\_CREATE : extract meta from node and store it
- NodeChangeEvent\_UPDATE\_PATH : same
- NodeChangeEvent\_UPDATE\_META : same
- NodeChangeEvent\_DELETE : remove all metadata stored for this node

## Storage

Storage is currently implemented in SQL, providing both MySQL and Sqlite implementations.
