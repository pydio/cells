/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package grpc

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/timestamppb"

	chat2 "github.com/pydio/cells/v4/broker/chat"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/client/commons/treec"
	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/proto/chat"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

func getMetaClient(ctx context.Context) tree.NodeReceiverClient {
	if val := ctx.Value("resolved-meta-client"); val != nil {
		return val.(tree.NodeReceiverClient)
	}
	return treec.ServiceNodeReceiverClient(ctx, common.ServiceMeta)
}

type ChatHandler struct {
	chat.UnimplementedChatServiceServer
	RuntimeCtx context.Context
}

func (c *ChatHandler) PutRoom(ctx context.Context, req *chat.PutRoomRequest) (*chat.PutRoomResponse, error) {
	dao, err := manager.Resolve[chat2.DAO](ctx)
	if err != nil {
		return nil, err
	}

	resp := &chat.PutRoomResponse{}
	newRoom, err := dao.PutRoom(ctx, req.Room)
	if err != nil {
		return resp, err
	}
	resp.Room = newRoom
	log.Logger(ctx).Debug("Put Room", newRoom.Zap())
	broker.MustPublish(ctx, common.TopicChatEvent, &chat.ChatEvent{
		Room:    resp.Room,
		Details: "PUT",
	})
	return resp, err
}

func (c *ChatHandler) DeleteRoom(ctx context.Context, req *chat.DeleteRoomRequest) (*chat.DeleteRoomResponse, error) {

	dao, err := manager.Resolve[chat2.DAO](ctx)
	if err != nil {
		return nil, err
	}

	response := &chat.DeleteRoomResponse{}

	log.Logger(ctx).Debug("Delete Room", req.Room.Zap())

	ok, err := dao.DeleteRoom(ctx, req.Room)
	if err != nil {
		return nil, err
	} else if !ok {
		// should never happen
		return nil, errors.New("cannot delete room, but DeleteRoom method returned no error")
	}

	response.Success = true
	broker.MustPublish(ctx, common.TopicChatEvent, &chat.ChatEvent{
		Room:    req.Room,
		Details: "DELETE",
	})
	return response, nil
}

func (c *ChatHandler) ListRooms(req *chat.ListRoomsRequest, streamer chat.ChatService_ListRoomsServer) error {

	ctx := streamer.Context()

	dao, err := manager.Resolve[chat2.DAO](ctx)
	if err != nil {
		return err
	}

	log.Logger(ctx).Debug("List Rooms", zap.Any(common.KeyChatListRoomReq, req))

	rooms, err := dao.ListRooms(ctx, req)
	if err != nil {
		return err
	}
	//defer streamer.Close()
	for _, r := range rooms {
		streamer.Send(&chat.ListRoomsResponse{Room: r})
	}

	return nil
}

func (c *ChatHandler) ListMessages(req *chat.ListMessagesRequest, streamer chat.ChatService_ListMessagesServer) error {

	ctx := streamer.Context()

	dao, err := manager.Resolve[chat2.DAO](ctx)
	if err != nil {
		return err
	}

	log.Logger(ctx).Debug("List Messages", zap.Any(common.KeyChatListMsgReq, req))

	messages, err := dao.ListMessages(ctx, req)
	if err != nil {
		return err
	}
	for _, m := range messages {
		streamer.Send(&chat.ListMessagesResponse{Message: m})
	}

	return nil
}

func (c *ChatHandler) PostMessage(ctx context.Context, req *chat.PostMessageRequest) (*chat.PostMessageResponse, error) {

	dao, err := manager.Resolve[chat2.DAO](ctx)
	if err != nil {
		return nil, err
	}

	resp := &chat.PostMessageResponse{}
	type outMsg struct {
		update bool
		*chat.ChatMessage
	}
	log.Logger(ctx).Debug("Post Messages", zap.Any(common.KeyChatPostMsgReq, req))
	var results []*outMsg
	for _, m := range req.Messages {
		var newMessage *chat.ChatMessage
		var err error
		out := &outMsg{update: m.Uuid != ""}
		if out.update {
			newMessage, err = dao.UpdateMessage(ctx, m, func(msg *chat.ChatMessage) (matches bool, filtered *chat.ChatMessage, err error) {
				if msg.Uuid != m.Uuid {
					return
				}
				if msg.Author != m.Author {
					err = fmt.Errorf("cannot edit message from a different user")
					return
				}
				matches = true
				filtered = proto.Clone(msg).(*chat.ChatMessage)
				originalMessage := filtered.GetMessage()
				filtered.Message = m.GetMessage()
				// Append an activity
				if filtered.GetActivity() == nil {
					filtered.Activity = &activity.Object{}
				}
				filtered.Activity.Items = append(filtered.Activity.Items, &activity.Object{
					Markdown: originalMessage,
					Updated: &timestamppb.Timestamp{
						Seconds: time.Now().Unix(),
					},
				})
				return
			})
			if err == nil && newMessage == nil {
				err = fmt.Errorf("cannot find message")
			}
		} else {
			newMessage, err = dao.PostMessage(ctx, m)
		}
		if err != nil {
			return nil, err
		}
		out.ChatMessage = newMessage
		results = append(results, out)
		resp.Messages = append(resp.Messages, newMessage)
	}
	resp.Success = true
	krs := req.GetKnownRooms()
	if krs == nil {
		krs = make(map[string]*chat.ChatRoom)
	}
	bgCtx := propagator.ForkedBackgroundWithMeta(ctx)
	go func() {
		for _, m := range results {
			bgCtx = propagator.WithUserNameMetadata(bgCtx, common.PydioContextUserKey, m.Author)
			kr, _ := c.knownRoomFromUuid(ctx, dao, m.RoomUuid, krs)
			broker.MustPublish(bgCtx, common.TopicChatEvent, &chat.ChatEvent{
				Message: m.ChatMessage,
				Room:    kr,
			})
			// For comments on nodes, publish an UPDATE_USER_META event (if not a message update)
			if !m.update {
				if room, err := dao.RoomByUuid(bgCtx, chat.RoomType_NODE, m.RoomUuid); err == nil {
					broker.MustPublish(bgCtx, common.TopicMetaChanges, &tree.NodeChangeEvent{
						Type: tree.NodeChangeEvent_UPDATE_USER_META,
						Target: &tree.Node{Uuid: room.RoomTypeObject, MetaStore: map[string]string{
							"comments": `"` + m.Message + `"`,
						}},
					})
					if count, e := dao.CountMessages(bgCtx, room); e == nil {
						_, e = getMetaClient(ctx).UpdateNode(bgCtx, &tree.UpdateNodeRequest{To: &tree.Node{
							Uuid: room.RoomTypeObject,
							MetaStore: map[string]string{
								"has_comments": fmt.Sprintf("%d", count),
							},
						}})
						if e != nil {
							log.Logger(bgCtx).Warn("Cannot post room size as meta", zap.Error(e))
						}
					}
				}
			}
		}
	}()
	return resp, nil
}

func (c *ChatHandler) DeleteMessage(ctx context.Context, req *chat.DeleteMessageRequest) (*chat.DeleteMessageResponse, error) {

	log.Logger(ctx).Debug("Delete Messages", zap.Any(common.KeyChatPostMsgReq, req))

	dao, err := manager.Resolve[chat2.DAO](ctx)
	if err != nil {
		return nil, err
	}

	krs := req.GetKnownRooms()
	if krs == nil {
		krs = make(map[string]*chat.ChatRoom)
	}
	for _, m := range req.Messages {
		err := dao.DeleteMessage(ctx, m)
		if err != nil {
			return nil, err
		}
		kr, _ := c.knownRoomFromUuid(ctx, dao, m.RoomUuid, krs)
		broker.MustPublish(ctx, common.TopicChatEvent, &chat.ChatEvent{
			Message: m,
			Room:    kr,
			Details: "DELETE",
		})
	}
	bgCtx := propagator.ForkedBackgroundWithMeta(ctx)
	go func() {
		for _, m := range req.Messages {
			bgCtx = propagator.WithUserNameMetadata(bgCtx, common.PydioContextUserKey, m.Author)
			if room, err := dao.RoomByUuid(bgCtx, chat.RoomType_NODE, m.RoomUuid); err == nil {
				if count, e := dao.CountMessages(bgCtx, room); e == nil {
					var meta = ""
					if count > 0 {
						meta = fmt.Sprintf("%d", count)
					}
					_, e = getMetaClient(ctx).UpdateNode(bgCtx, &tree.UpdateNodeRequest{To: &tree.Node{
						Uuid: room.RoomTypeObject,
						MetaStore: map[string]string{
							"has_comments": meta,
						},
					}})
					if e != nil {
						log.Logger(bgCtx).Warn("Cannot post room size as meta", zap.Error(e))
					}
				}
			}
		}
	}()
	return &chat.DeleteMessageResponse{Success: true}, nil
}

// knownRoomFromUuid tries to find room in map, or look up in DAO
func (c *ChatHandler) knownRoomFromUuid(ctx context.Context, dao chat2.DAO, roomUuid string, kr map[string]*chat.ChatRoom) (*chat.ChatRoom, error) {

	if r, ok := kr[roomUuid]; ok {
		return r, nil
	}
	r, e := dao.RoomByUuid(ctx, chat.RoomType_ANY, roomUuid)
	if r != nil {
		kr[roomUuid] = r
	}
	return r, e
}
