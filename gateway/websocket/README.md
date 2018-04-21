# WebSocket Service

This service provides an Http server supporting WebSocket protocol to send realtime events to user's interfaces. It is
hooked to various internal Topics and contains most of the logic to decide whether to broadcast a message to a given connected
user.

Service is listening by default on the [::]:5050/ws and [::]:5050/chat (see below) endpoints.

Currently only the ReactJS interface is using this connection to update in real-time.

## Internal Events to Websocket Sessions

### Sessions

Websocket server is implemented internaly using GIN and Melody libraries. WS connections are identified as "Sessions", and
when a client is connecting, it must send a first "register:" message containing the current JWT token, as it would for any other
public API in the micro-services architecture. When received, the JWT is parsed and the current user workspaces are stored in
the session.

When an internal event arrives on the micro event bus, the websocket logic will map the various active sessions and generally use
their username or list of workspaces to broadcast the event to each of them (or not).

### Wired Events

 - **common.TOPIC\_TREE\_CHANGES** : Sends tree events to dynamically update files and folders in the interface
 - **common.TOPIC\_META\_CHANGES** : Same as TREE_CHANGES
 - **common.TOPIC\_JOB\_TASK\_EVENT** : Send Task events to show tasks progression
 - **common.TOPIC\_IDM\_EVENT** : Identity Management are sent to user to trigger a reload of their roles and ACL's
 - **common.TOPIC\_ACTIVITY\_EVENT** : Activities events will refresh events feeds and alerts

## Chat Handler

A dedicated handler is listening on [::]:5050/chat and is specifically plugged to the internal CHAT topic to dynamically
create rooms, connect users to them, etc. It provides a gateway for all chat operations, using the following protocol :

 - Connection to websocket : as for the common ws, send a "subscribe" message with the JWT token
 - Connection to a chat room: JOIN message, and a ChatRoom json representation (including chat type and chat Uuid. It will create
 the room if not already existing, and send back all the previous messages for this room
 - Post a message : POST message, with ChatMessage and ChatRoom
 - Disconnect from a room: LEAVE message with the ChatRoom representation.