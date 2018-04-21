# Sync Service

Sync service is a sample sync service that should implement a merge between two indexed datasources.
It is currently configurable to point to a given datasource path, and the client is a standard router using the tree service,
so it's the implementer mission to handle the absolute path of the nodes (e.g. miniods1/path/to/root).

## Setting Configs

**Before starting service**, use command line to insert the following lines in the configuration :


`pydio config set pydio.grpc.sync  left  '{"type": "datasource", "name": "pydiods1", "path": "/left"}'`

`pydio config set pydio.grpc.sync right '{"type": "datasource", "name": "pydiods1", "path": "/right"}'`

Note:  all paths are relative

## Trigger a sync

Basic GRPC Handler implements a SyncEndpointHandler, which exposes a TriggerResync method. You can use pydio CLI client
to trigger it :

`go build -o pydio-client client/main.go`

`pydio-client data sync --service=pydio.grpc.sync`

## Events

The handler is also subscribed to the central hub for events, and simply uses the event node path to determine whether it comes
from the "right" or from the "left". It then calls the OnRightEvent and OnLeftEvent callbacks of the merger object.