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
	"encoding/json"
	"strings"

	"context"

	"github.com/micro/protobuf/jsonpb"
	"go.uber.org/zap"
	"gopkg.in/olahol/melody.v1"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/activity"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
)

type WebsocketHandler struct {
	Websocket   *melody.Melody
	EventRouter *views.RouterEventFilter
}

func NewWebSocketHandler(serviceCtx context.Context) *WebsocketHandler {
	w := &WebsocketHandler{}
	w.InitHandlers(serviceCtx)
	return w
}

func (w *WebsocketHandler) InitHandlers(serviceCtx context.Context) {

	w.Websocket = melody.New()
	w.Websocket.Config.MaxMessageSize = 2048

	w.Websocket.HandleError(func(session *melody.Session, i error) {
		if !strings.Contains(i.Error(), "close 1000 (normal)") {
			log.Logger(serviceCtx).Debug("HandleError", zap.Error(i))
		}
		ClearSession(session)
	})

	w.Websocket.HandleClose(func(session *melody.Session, i int, i2 string) error {
		ClearSession(session)
		return nil
	})

	w.Websocket.HandleMessage(func(session *melody.Session, bytes []byte) {

		msg := &Message{}
		e := json.Unmarshal(bytes, msg)
		if e != nil {
			session.CloseWithMsg(NewErrorMessage(e))
			return
		}
		switch msg.Type {
		case MsgSubscribe:

			if msg.JWT == "" {
				session.CloseWithMsg(NewErrorMessageString("empty jwt"))
				log.Logger(serviceCtx).Error("empty jwt")
				return
			}
			ctx := context.Background()
			verifier := auth.DefaultJWTVerifier()
			_, claims, e := verifier.Verify(ctx, msg.JWT)
			if e != nil {
				log.Logger(serviceCtx).Error("invalid jwt")
				session.CloseWithMsg(NewErrorMessage(e))
				return
			}
			UpdateSessionFromClaims(session, claims, w.EventRouter.GetClientsPool())

		case MsgUnsubscribe:

			ClearSession(session)

		default:
			return
		}

	})

}

func (w *WebsocketHandler) BroadcastNodeChangeEvent(ctx context.Context, event *tree.NodeChangeEvent) error {

	// Here events come with real full path

	return w.Websocket.BroadcastFilter([]byte(`"dump"`), func(session *melody.Session) bool {

		value, ok := session.Get(SessionWorkspacesKey)
		if !ok || value == nil {
			return false
		}
		workspaces := value.(map[string]*idm.Workspace)
		var hasData bool

		for _, workspace := range workspaces {
			n1, t1 := w.EventRouter.WorkspaceCanSeeNode(ctx, workspace, event.Target, true)
			n2, t2 := w.EventRouter.WorkspaceCanSeeNode(ctx, workspace, event.Source, false)
			// Depending on node, broadcast now
			if t1 || t2 {
				log.Logger(ctx).Debug("Broadcasting event to this session for workspace", zap.Any("target", n1), zap.Any("source", n2), zap.Any("ws", workspace))

				if n1 != nil {
					n1.SetMeta("EventWorkspaceId", workspace.UUID)
					n1 = n1.WithoutReservedMetas()
				}
				if n2 != nil {
					n2.SetMeta("EventWorkspaceId", workspace.UUID)
					n2 = n2.WithoutReservedMetas()
				}
				// We have to filter the event for this context
				marshaler := &jsonpb.Marshaler{}
				s, _ := marshaler.MarshalToString(&tree.NodeChangeEvent{
					Type:   event.Type,
					Target: n1,
					Source: n2,
				})
				data := []byte(s)

				session.Write(data)
				hasData = true
			}
		}

		return hasData
	})

}

func (w *WebsocketHandler) BroadcastTaskChangeEvent(ctx context.Context, event *jobs.TaskChangeEvent) error {

	taskOwner := event.TaskUpdated.TriggerOwner

	marshaller := jsonpb.Marshaler{}
	message, _ := marshaller.MarshalToString(event)
	return w.Websocket.BroadcastFilter([]byte(message), func(session *melody.Session) bool {
		var isAdmin, o bool
		var v interface{}
		if v, o = session.Get(SessionProfileKey); o && v == common.PYDIO_PROFILE_ADMIN {
			isAdmin = true
		}
		value, ok := session.Get(SessionUsernameKey)
		if !ok || value == nil {
			return false
		}
		isOwner := value.(string) == taskOwner || (taskOwner == common.PYDIO_SYSTEM_USERNAME && isAdmin)
		if isOwner {
			log.Logger(ctx).Debug("Should Broadcast Task Event : ", zap.Any("task", event.TaskUpdated), zap.Any("job", event.Job))
		} else {
			log.Logger(ctx).Debug("Owner was " + taskOwner + " while session user was " + value.(string))
		}
		return isOwner
	})

}

func (w *WebsocketHandler) BroadcastIDMChangeEvent(ctx context.Context, event *idm.ChangeEvent) error {

	marshaller := jsonpb.Marshaler{}
	event.JsonType = "idm"
	message, _ := marshaller.MarshalToString(event)
	return w.Websocket.BroadcastFilter([]byte(message), func(session *melody.Session) bool {

		var checkRoleId string
		var checkUserId string
		var checkWorkspaceId string
		if event.Acl != nil && event.Acl.RoleID != "" {
			checkRoleId = event.Acl.RoleID
		} else if event.Role != nil {
			checkRoleId = event.Role.Uuid
		} else if event.User != nil {
			checkUserId = event.User.Uuid
		} else if event.Workspace != nil {
			checkWorkspaceId = event.Workspace.UUID
		}

		if checkUserId != "" {
			if val, ok := session.Get(SessionUsernameKey); ok && val != nil {
				return checkUserId == val.(string)
			}
		}

		if checkRoleId != "" {
			if value, ok := session.Get(SessionRolesKey); ok && value != nil {
				roles := value.([]*idm.Role)
				for _, r := range roles {
					if r.Uuid == checkRoleId {
						return true
					}
				}
			}
		}

		if checkWorkspaceId != "" {
			if value, ok := session.Get(SessionWorkspacesKey); ok && value != nil {
				if _, has := value.(map[string]*idm.Workspace)[checkWorkspaceId]; has {
					return true
				}
			}
		}

		return false
	})

}

func (w *WebsocketHandler) BroadcastActivityEvent(ctx context.Context, event *activity.PostActivityEvent) error {

	// Only handle "users inbox" events for now
	if event.BoxName != "inbox" && event.OwnerType != activity.OwnerType_USER {
		return nil
	}
	marshaller := jsonpb.Marshaler{}
	event.JsonType = "activity"
	message, _ := marshaller.MarshalToString(event)
	return w.Websocket.BroadcastFilter([]byte(message), func(session *melody.Session) bool {
		if val, ok := session.Get(SessionUsernameKey); ok && val != nil {
			return event.OwnerId == val.(string) && event.Activity.Actor.Id != val.(string)
		}
		return false
	})

}
