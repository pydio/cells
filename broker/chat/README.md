# Chat Service

聊天服务为实现附加到任何类型对象的聊天室提供了通用的存储。
聊天室有 id，活跃用户和消息。事件发布在 micro event broker上，因此该服务依赖于 WebSocke服务将这些事件转发到用户界面。


## Chat Rooms

聊天室由 Uuid 和 RoomType 定义，以简化搜索。
RoomType “附加”一个给定的房间到一个给定的应用实体：工作区、节点、用户或全局(无实体)。

Currently it is implemented on "nodes" to replace the legacy "meta.comments" plugin, providing one realtime chat per file or folder.

See the `common/proto/chat/chat.proto` file.

## Service

ChatService 提供了一个符合以下签名的 GRPC handler：

```protobuf
service ChatService {
    rpc PutRoom(PutRoomRequest) returns (PutRoomResponse);
    rpc DeleteRoom(DeleteRoomRequest) returns (DeleteRoomResponse);
    rpc ListRooms(ListRoomsRequest) returns (stream ListRoomsResponse);
    rpc ListMessages(ListMessagesRequest) returns (stream ListMessagesResponse);
    rpc PostMessage(PostMessageRequest) returns (PostMessageResponse);
}
```

目前还没有用于此目的的 REST 服务，因为与客户端通信的主要接口直接通过 websocket 通道从 UX 到 grpc 服务。


## Storage

当前实现存储所有聊天和消息在 BoltDB 文件位于  [Application Data Dir]/chats.json。

