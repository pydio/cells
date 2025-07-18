/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package websocket

import (
	"context"
	"strings"
	"time"

	"github.com/microcosm-cc/bluemonday"
	"github.com/olahol/melody"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
	"google.golang.org/protobuf/encoding/protojson"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/proto/chat"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/telemetry/tracing"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

const (
	SessionRoomKey = "room"
)

type ChatHandler struct {
	//ctx       context.Context
	Websocket *melody.Melody
}

type sessionRoom struct {
	uuid       string
	typeString string
	typeObject string
	readonly   bool
}

// NewChatHandler creates a new ChatHandler
func NewChatHandler(ctx context.Context) *ChatHandler {
	w := &ChatHandler{}
	w.initHandlers()
	return w
}

// BroadcastChatMessage sends chat message to connected sessions
func (c *ChatHandler) BroadcastChatMessage(ctx context.Context, msg *chat.ChatEvent) error {

	//marshaller := &jsonpb.Marshaler{}
	var buff []byte
	var compareRoomId string

	if msg.Message != nil {

		if msg.Details == "DELETE" {
			wsMessage := &chat.WebSocketMessage{
				Type:    chat.WsMessageType_DELETE_MSG,
				Message: msg.Message,
			}
			buff, _ = protojson.Marshal(wsMessage)
		} else {
			buff, _ = protojson.Marshal(msg.Message)
		}

		compareRoomId = msg.Message.RoomUuid

	} else if msg.Room != nil {

		compareRoomId = msg.Room.Uuid
		wsMessage := &chat.WebSocketMessage{
			Type: chat.WsMessageType_ROOM_UPDATE,
			Room: msg.Room,
		}
		buff, _ = protojson.Marshal(wsMessage)

	} else {
		return errors.New("Event should provide at least a Msg or a Room")
	}

	return c.Websocket.BroadcastFilter(buff, func(session *melody.Session) bool {
		if !runtime.MultiMatches(session.Request.Context(), ctx) {
			return false
		}
		if session.IsClosed() {
			log.Logger(ctx).Error("Session is closed")
			return false
		}
		_, found := c.roomInSession(ctx, session, compareRoomId)
		return found
	})

}

func (c *ChatHandler) initHandlers() {

	c.Websocket = melody.New()
	c.Websocket.Config.MaxMessageSize = 2048

	c.Websocket.HandleError(func(session *melody.Session, i error) {
		ctx := session.Request.Context()
		if !strings.Contains(i.Error(), "close 1000 (normal)") {
			log.Logger(ctx).Debug("HandleError", zap.Error(i))
		}
		session.Set(SessionRoomKey, nil)
		ClearSession(session)
	})

	c.Websocket.HandleClose(func(session *melody.Session, i int, i2 string) error {
		session.Set(SessionRoomKey, nil)
		ClearSession(session)
		return nil
	})

	c.Websocket.HandleMessage(func(session *melody.Session, payload []byte) {

		ct := propagator.ForkedBackgroundWithMeta(session.Request.Context())

		var span trace.Span
		msg := &Message{}
		e := json.Unmarshal(payload, msg)
		if e == nil {
			ct, span = tracing.StartLocalSpan(ct, "/ws/chat/"+string(msg.Type))
			defer span.End()
			switch msg.Type {
			case MsgSubscribe:
				if msg.JWT == "" {
					_ = session.CloseWithMsg(NewErrorMessageString("Empty JWT"))
					log.Logger(ct).Debug("empty jwt")
					return
				}
				verifier := auth.DefaultJWTVerifier()
				_, claims, e := verifier.Verify(ct, msg.JWT)
				if e != nil {
					log.Logger(ct).Error("invalid jwt received from websocket connection")
					_ = session.CloseWithMsg(NewErrorMessage(e))
					return
				}
				updateSessionFromClaims(ct, session, claims)
				return

			case MsgUnsubscribe:
				ClearSession(session)
				return
			}
		}

		chatMsg := &chat.WebSocketMessage{}
		e = protojson.Unmarshal(payload, chatMsg)
		if e != nil {
			log.Logger(ct).Debug("Could not unmarshal message", zap.Error(e))
			return
		}
		ct, span = tracing.StartLocalSpan(ct, "/ws/chat/"+chatMsg.Type.String())
		defer span.End()

		log.Logger(ct).Debug("Got Message", zap.Any("msg", chatMsg))
		var userName string
		if userData, ok := session.Get(SessionUsernameKey); !ok && userData != nil {
			log.Logger(ct).Debug("Chat Message requires ws subscription first")
			return
		} else {
			userName, ok = userData.(string)
			if !ok {
				log.Logger(ct).Debug("Chat Message requires ws subscription first")
				return
			}
		}

		chatClient := chat.NewChatServiceClient(grpc.ResolveConn(ct, common.ServiceChatGRPC))

		switch chatMsg.Type {

		case chat.WsMessageType_JOIN:

			sessRoom := &sessionRoom{}
			if readonly, e := c.auth(session, chatMsg.Room); e != nil {
				log.Logger(ct).Error("Not authorized to join this room", zap.Error(e))
				break
			} else {
				sessRoom.readonly = readonly
			}
			var isPing bool
			if chatMsg.Message != nil && chatMsg.Message.Message == "PING" {
				isPing = true
			}
			foundRoom, e1 := c.findOrCreateRoom(ct, chatMsg.Room, !isPing)
			if e1 != nil || foundRoom == nil {
				log.Logger(ct).Debug("CANNOT JOIN", zap.Any("msg", chatMsg), zap.Any("r", foundRoom), zap.Error(e1))
				break
			}
			sessRoom.uuid = foundRoom.Uuid
			sessRoom.typeString = foundRoom.Type.String()
			sessRoom.typeObject = foundRoom.RoomTypeObject
			c.heartbeat(ct, userName, foundRoom)
			c.storeSessionRoom(ct, session, sessRoom)
			// Update Room Users
			if save := c.appendUserToRoom(ct, foundRoom, userName); save {

				_, e := chatClient.PutRoom(ct, &chat.PutRoomRequest{Room: foundRoom})
				if e != nil {
					log.Logger(ct).Error("Error while putting room", zap.Error(e))
				}
			}

		case chat.WsMessageType_LEAVE:

			foundRoom, e1 := c.findOrCreateRoom(ct, chatMsg.Room, false)
			if e1 == nil && foundRoom != nil {
				if save := c.removeUserFromRoom(ct, foundRoom, userName); save {
					chatClient.PutRoom(ct, &chat.PutRoomRequest{Room: foundRoom})
					log.Logger(ct).Debug("LEAVE", zap.Any("msg", chatMsg), zap.Any("r", foundRoom))
				}
				c.removeSessionRoom(ct, session, foundRoom.Uuid)
			}

		case chat.WsMessageType_HISTORY:
			// Must arrive AFTER a JOIN message
			foundRoom, e1 := c.findOrCreateRoom(ct, chatMsg.Room, false)
			if e1 != nil || foundRoom == nil {
				break
			}
			request := &chat.ListMessagesRequest{RoomUuid: foundRoom.Uuid}
			if chatMsg.Message != nil {
				var offData map[string]int
				offsetMsg := chatMsg.Message.Message
				if e := json.Unmarshal([]byte(offsetMsg), &offData); e == nil {
					if offset, ok := offData["Offset"]; ok {
						request.Offset = int64(offset)
					}
					if limit, ok := offData["Limit"]; ok {
						request.Limit = int64(limit)
					}
				}
			}
			// First make sure to send a RoomUpdate
			wsMessage := &chat.WebSocketMessage{
				Type: chat.WsMessageType_ROOM_UPDATE,
				Room: foundRoom,
			}
			buff, _ := protojson.Marshal(wsMessage)
			session.Write(buff)

			// List existing Messages
			ct, ca := context.WithCancel(ct)
			defer ca()
			stream, e2 := chatClient.ListMessages(ct, request)
			if e2 == nil {
				count := 0
				var first *chat.ChatMessage
				for {
					resp, e3 := stream.Recv()
					if e3 != nil {
						break
					}
					if count == 0 {
						first = resp.GetMessage()
					}
					b, _ := protojson.Marshal(resp.GetMessage())
					_ = session.Write(b)
					count++
				}
				if request.Limit > 0 && count == int(request.Limit) && first != nil {
					// indicate that there may be more pending messages
					type HasMoreData struct {
						Type      string `json:"@type"`
						RoomUuid  string `json:"RoomUuid"`
						Timestamp int64  `json:"Timestamp"`
						Offset    int    `json:"Offset"`
						Limit     int    `json:"Limit"`
					}
					b, _ := json.Marshal(HasMoreData{
						Type:      "MAY_HAVE_MORE",
						RoomUuid:  foundRoom.Uuid,
						Timestamp: first.GetTimestamp(),
						Offset:    int(request.Offset + request.Limit),
						Limit:     int(request.Limit),
					})
					_ = session.Write(b)
				}
			}

		case chat.WsMessageType_POST:

			log.Logger(ct).Debug("POST", zap.Any("msg", chatMsg))
			var knownRoom *chat.ChatRoom
			if room, found := c.roomInSession(ct, session, chatMsg.Message.RoomUuid); !found || room.readonly {
				log.Logger(ct).Error("Not authorized to post in this room")
				break
			} else {
				knownRoom = &chat.ChatRoom{
					Uuid:           room.uuid,
					Type:           chat.RoomType(chat.RoomType_value[room.typeString]),
					RoomTypeObject: room.typeObject,
				}
			}
			message := chatMsg.Message
			message.Author = userName
			message.Message = bluemonday.UGCPolicy().Sanitize(message.Message)
			message.Timestamp = time.Now().Unix()
			_, e := chatClient.PostMessage(ct, &chat.PostMessageRequest{
				Messages:   []*chat.ChatMessage{message},
				KnownRooms: map[string]*chat.ChatRoom{message.RoomUuid: knownRoom},
			})
			if e != nil {
				log.Logger(ct).Error("Error while posting message", zap.Any("msg", message), zap.Error(e))
			}

		case chat.WsMessageType_DELETE_MSG:

			log.Logger(ct).Debug("Delete", zap.Any("msg", chatMsg))
			var knownRoom *chat.ChatRoom
			if room, found := c.roomInSession(ct, session, chatMsg.Message.RoomUuid); !found || room.readonly {
				log.Logger(ct).Error("Not authorized to post in this room")
				break
			} else {
				knownRoom = &chat.ChatRoom{
					Uuid:           room.uuid,
					Type:           chat.RoomType(chat.RoomType_value[room.typeString]),
					RoomTypeObject: room.typeObject,
				}
			}
			message := chatMsg.Message
			if message.Author == userName {
				_, e := chatClient.DeleteMessage(ct, &chat.DeleteMessageRequest{
					Messages:   []*chat.ChatMessage{message},
					KnownRooms: map[string]*chat.ChatRoom{message.RoomUuid: knownRoom},
				})
				if e != nil {
					log.Logger(ct).Error("Error while deleting message", zap.Any("msg", message), zap.Error(e))
				}
			}

		}

	})

}

func (c *ChatHandler) roomInSession(ctx context.Context, session *melody.Session, roomUuid string) (*sessionRoom, bool) {
	if key, ok := session.Get(SessionRoomKey); ok && key != nil {
		rooms := key.([]*sessionRoom)
		for _, v := range rooms {
			if v.uuid == roomUuid {
				return v, true
			}
		}
		log.Logger(ctx).Debug("looking for rooms in session", zap.String("search", roomUuid))
	}
	return nil, false
}

func (c *ChatHandler) storeSessionRoom(ctx context.Context, session *melody.Session, room *sessionRoom) *melody.Session {
	var rooms []*sessionRoom
	if key, ok := session.Get(SessionRoomKey); ok && key != nil {
		rooms = key.([]*sessionRoom)
	}
	found := false
	for _, v := range rooms {
		if v.uuid == room.uuid {
			found = true
		}
	}
	if !found {
		rooms = append(rooms, room)
		log.Logger(ctx).Debug("storing rooms to session", zap.Any("room", room.uuid), zap.Int("rooms length", len(rooms)))
		session.Set(SessionRoomKey, rooms)
	} else {
		log.Logger(ctx).Debug("rooms to session already found", zap.Any("room", room.uuid), zap.Int("rooms length", len(rooms)))
	}
	return session
}

func (c *ChatHandler) removeSessionRoom(ctx context.Context, session *melody.Session, roomUuid string) *melody.Session {
	var rooms []*sessionRoom
	if key, ok := session.Get(SessionRoomKey); ok && key != nil {
		rooms = key.([]*sessionRoom)
	}
	var newRooms []*sessionRoom
	for _, k := range rooms {
		if k.uuid != roomUuid {
			newRooms = append(newRooms, k)
		}
	}
	log.Logger(ctx).Debug("removing room from session", zap.Any("room", roomUuid), zap.Int("rooms length", len(newRooms)))
	session.Set(SessionRoomKey, newRooms)
	return session
}

func (c *ChatHandler) findOrCreateRoom(ctx context.Context, room *chat.ChatRoom, createIfNotExists bool) (*chat.ChatRoom, error) {

	chatClient := chat.NewChatServiceClient(grpc.ResolveConn(ctx, common.ServiceChatGRPC))
	ct, ca := context.WithCancel(ctx)
	defer ca()
	s, e := chatClient.ListRooms(ct, &chat.ListRoomsRequest{
		ByType:     room.Type,
		TypeObject: room.RoomTypeObject,
	})
	if e != nil {
		return nil, e
	}
	for {
		resp, rE := s.Recv()
		if rE != nil {
			break
		}
		if resp == nil {
			continue
		}
		return resp.Room, nil
	}

	if !createIfNotExists {
		return nil, nil
	}

	// if not returned yet, create
	resp, e1 := chatClient.PutRoom(ctx, &chat.PutRoomRequest{Room: room})
	if e1 != nil {
		return nil, e1
	}
	if resp.Room == nil {
		return nil, errors.New("nil room in response, this is not normal")
	}
	return resp.Room, nil

}

func (c *ChatHandler) appendUserToRoom(ctx context.Context, room *chat.ChatRoom, userName string) bool {
	uniq := map[string]string{}
	for _, u := range room.Users {
		uniq[u] = u
	}
	if _, already := uniq[userName]; already {
		return false
	}
	uniq[userName] = userName
	room.Users = []string{}
	for _, name := range uniq {
		room.Users = append(room.Users, name)
	}
	return true
}

func (c *ChatHandler) removeUserFromRoom(ctx context.Context, room *chat.ChatRoom, userName string) bool {
	users := []string{}
	var found bool
	for _, u := range room.Users {
		if u == userName {
			found = true
		} else {
			users = append(users, u)
		}
	}
	room.Users = users
	return found
}

var uuidRouter nodes.Client

// auth check authorization for the room. perm can be "join" or "post"
func (c *ChatHandler) auth(session *melody.Session, room *chat.ChatRoom) (bool, error) {

	var readonly bool
	ctx, err := prepareRemoteContext(session.Request.Context(), session)
	if err != nil {
		return false, err
	}

	switch room.Type {
	case chat.RoomType_NODE:

		// Check node is readable and writeable
		if uuidRouter == nil {
			uuidRouter = compose.UuidClient()
		}
		resp, e := uuidRouter.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: room.RoomTypeObject}})
		if e != nil {
			return false, e
		}
		if _, er := uuidRouter.CanApply(ctx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_UPDATE_CONTENT, Target: resp.Node}); er != nil {
			readonly = true
		}

	case chat.RoomType_USER:
		// Check that this user is visible to current user
	case chat.RoomType_WORKSPACE:
		// Check that workspace is accessible
	case chat.RoomType_GLOBAL:
		// TODO
	}
	return readonly, nil
}
