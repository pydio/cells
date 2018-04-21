# Chat Service

Chat service provides a generic store for implementing chat rooms attached to any type of objects. Chat rooms has IDs, active users and messages. Events are published on the micro event broker, and as such this service depends on the WebSocket service to forward these events to user's interfaces.

## Chat Rooms

Chat Rooms are defined by a Uuid and a RoomType to ease the search. RoomType "attaches" a given room to a given application entity : Workspace, Node, User or Global (no entity).

Currently it is implemented on "nodes" to replace the legacy "meta.comments" plugin, providing one realtime chat per file or folder.

See the `common/proto/chat/chat.proto` file.

## Service

ChatService provides a GRPC handler conforming to the following signature :

```protobuf
service ChatService {
    rpc PutRoom(PutRoomRequest) returns (PutRoomResponse);
    rpc DeleteRoom(DeleteRoomRequest) returns (DeleteRoomResponse);
    rpc ListRooms(ListRoomsRequest) returns (stream ListRoomsResponse);
    rpc ListMessages(ListMessagesRequest) returns (stream ListMessagesResponse);
    rpc PostMessage(PostMessageRequest) returns (PostMessageResponse);
}
```

There is no REST service currently for that, as the main interface for communication with clients goes directly from the UX to the grpc service through the websocket channel.

## Storage

Current implementation stores all chats and messages in a BoltDB file located in [Application Data Dir]/chats.json.
