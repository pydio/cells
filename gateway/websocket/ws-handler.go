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
	"fmt"
	"path"
	"strings"
	"sync"
	"time"

	"github.com/ory/ladon"
	"github.com/ory/ladon/manager/memory"
	"github.com/pydio/melody"
	"go.uber.org/zap"
	"golang.org/x/time/rate"
	"google.golang.org/protobuf/encoding/protojson"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

type WebsocketHandler struct {
	runtimeCtx  context.Context
	Websocket   *melody.Melody
	EventRouter *compose.Reverse

	batcherLock   *sync.Mutex
	batchers      map[string]*NodeEventsBatcher
	dispatcher    chan *NodeChangeEventWithInfo
	done          chan string
	silentDropper *rate.Limiter
}

func NewWebSocketHandler(serviceCtx context.Context) *WebsocketHandler {
	w := &WebsocketHandler{
		runtimeCtx:    serviceCtx,
		batchers:      make(map[string]*NodeEventsBatcher),
		dispatcher:    make(chan *NodeChangeEventWithInfo),
		done:          make(chan string),
		batcherLock:   &sync.Mutex{},
		silentDropper: rate.NewLimiter(20, 10),
	}
	w.InitHandlers(serviceCtx)
	go func() {
		for {
			select {
			case e := <-w.dispatcher:
				w.BroadcastNodeChangeEvent(context.Background(), e)
			case finished := <-w.done:
				w.batcherLock.Lock()
				delete(w.batchers, finished)
				w.batcherLock.Unlock()
			}
		}
	}()
	return w
}

func (w *WebsocketHandler) InitHandlers(ctx context.Context) {

	w.Websocket = melody.New()
	w.Websocket.Config.MaxMessageSize = 2048

	w.Websocket.HandleError(func(session *melody.Session, i error) {
		if !strings.Contains(i.Error(), "close 1000 (normal)") {
			log.Logger(ctx).Debug("HandleError", zap.Error(i))
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
				log.Logger(ctx).Debug("empty jwt")
				return
			}
			verifier := auth.DefaultJWTVerifier()
			_, claims, er := verifier.Verify(ctx, msg.JWT)
			if er != nil {
				log.Logger(ctx).Error("invalid jwt received from websocket connection", zap.Any("original", msg))
				session.CloseWithMsg(NewErrorMessage(e))
				return
			}
			updateSessionFromClaims(ctx, session, claims, w.EventRouter.GetClientsPool())

		case MsgUnsubscribe:

			ClearSession(session)

		default:
			return
		}

	})

}

func (w *WebsocketHandler) getBatcherForUuid(uuid string) *NodeEventsBatcher {
	var batcher *NodeEventsBatcher
	w.batcherLock.Lock()
	if b, ok := w.batchers[uuid]; ok && !b.closed {
		batcher = b
	} else {
		batcher = NewEventsBatcher(1*time.Second, uuid, w.dispatcher, w.done)
		w.batchers[uuid] = batcher
	}
	w.batcherLock.Unlock()
	return batcher
}

// HandleNodeChangeEvent listens to NodeChangeEvents and either broadcast them directly, or use NodeEventsBatcher
// to buffer them and flatten them into one.
func (w *WebsocketHandler) HandleNodeChangeEvent(ctx context.Context, event *tree.NodeChangeEvent) error {

	defer func() {
		if e := recover(); e != nil {
			log.Logger(ctx).Info("recovered a panic in WebSocket handler", zap.Any("e", e))
		}
	}()

	switch event.Type {
	case tree.NodeChangeEvent_UPDATE_META, tree.NodeChangeEvent_CREATE, tree.NodeChangeEvent_UPDATE_CONTENT:
		if event.Target != nil {
			batcher := w.getBatcherForUuid(event.Target.Uuid)
			batcher.in <- event
			return nil
		} else {
			e := &NodeChangeEventWithInfo{NodeChangeEvent: *event}
			return w.BroadcastNodeChangeEvent(ctx, e)
		}
	case tree.NodeChangeEvent_UPDATE_USER_META:
		e := &NodeChangeEventWithInfo{NodeChangeEvent: *event, refreshTarget: true}
		return w.BroadcastNodeChangeEvent(ctx, e)
	case tree.NodeChangeEvent_DELETE, tree.NodeChangeEvent_UPDATE_PATH:
		e := &NodeChangeEventWithInfo{NodeChangeEvent: *event, refreshTarget: true}
		return w.BroadcastNodeChangeEvent(ctx, e)
	case tree.NodeChangeEvent_READ:
		// Ignore READ events
		return nil
	default:
		return nil
	}

}

// BroadcastNodeChangeEvent will browse the currently registered websocket sessions and decide whether to broadcast
// the event or not.
func (w *WebsocketHandler) BroadcastNodeChangeEvent(ctx context.Context, event *NodeChangeEventWithInfo) error {

	if event.Silent && !w.silentDropper.Allow() {
		//log.Logger(ctx).Warn("Dropping Silent Event")
		return nil
	}

	return w.Websocket.BroadcastFilter([]byte(`"dump"`), func(session *melody.Session) bool {

		var workspaces map[string]*idm.Workspace
		var accessList *permissions.AccessList

		if value, ok := session.Get(SessionWorkspacesKey); !ok || value == nil {
			return false
		} else {
			workspaces = value.(map[string]*idm.Workspace)
		}

		if value, ok := session.Get(SessionAccessListKey); !ok || value == nil {
			return false
		} else {
			accessList = value.(*permissions.AccessList)
		}

		// Rate-limit events (let Optimistic events always go through)
		if lim, ok := session.Get(SessionLimiterKey); ok && !event.Optimistic {
			limiter := lim.(*rate.Limiter)
			if err := limiter.Wait(ctx); err != nil {
				log.Logger(ctx).Warn("WebSocket: some events were dropped (session rate limiter)")
				return false
			}
		}

		if event.Type == tree.NodeChangeEvent_UPDATE_USER_META {
			if event.Source == nil || event.Source.MetaStore == nil {
				log.Logger(ctx).Debug("UserMetaEvent: no Source or Source.MetaStore on event")
				return false
			}
			var pols []*service.ResourcePolicy
			e := json.Unmarshal([]byte(event.Source.MetaStore["pydio:meta-policies"]), &pols)
			if e != nil {
				log.Logger(ctx).Debug("UserMetaEvent: cannot unmarshall resource policies")
				return false
			}
			subs, o := session.Get(SessionSubjectsKey)
			if !o {
				log.Logger(ctx).Debug("UserMetaEvent: No subjects in session")
				return false
			}
			subjects := subs.([]string)
			if !w.MatchPolicies(pols, subjects, service.ResourcePolicyAction_READ) {
				return false
			}
		}

		var (
			hasData bool
		)

		metaCtx, err := prepareRemoteContext(w.runtimeCtx, session)
		if err != nil {
			log.Logger(ctx).Warn("WebSocket error", zap.Error(err))
			return false
		}

		eTarget := event.Target
		eSource := event.Source

		if event.refreshTarget && eTarget != nil {
			if respNode, err := w.EventRouter.GetClientsPool().GetTreeClient().ReadNode(metaCtx, &tree.ReadNodeRequest{Node: event.Target}); err == nil {
				eTarget = respNode.Node
			}
		}
		// Nil source for user-meta type
		if event.Type == tree.NodeChangeEvent_UPDATE_USER_META {
			eSource = nil
		}

		for wsId, workspace := range workspaces {
			nTarget, t1 := w.EventRouter.WorkspaceCanSeeNode(metaCtx, accessList, workspace, eTarget)
			nSource, t2 := w.EventRouter.WorkspaceCanSeeNode(metaCtx, nil, workspace, eSource) // Do not deep-check acl on source nodes (deleted!)
			// log.Logger(ctx).Info("Ws can see", zap.String("eType", event.Type.String()), zap.Bool("source", t2), event.Source.ZapPath(), zap.Bool("target", t1), event.Target.ZapPath())
			// Depending on node, broadcast now
			if t1 || t2 {
				eType := event.Type
				if nTarget != nil {
					nTarget.MustSetMeta(common.MetaFlagWorkspaceEventId, workspace.UUID)
					nTarget = nTarget.WithoutReservedMetas()
					log.Logger(ctx).Debug("Broadcasting event to this session for workspace", zap.Any("type", event.Type), zap.String("wsId", wsId), zap.Any("path", event.Target.Path))
				}
				if nSource != nil {
					nSource.MustSetMeta(common.MetaFlagWorkspaceEventId, workspace.UUID)
					nSource = nSource.WithoutReservedMetas()
				}
				// Eventually update event type if one node is out of scope
				if eType == tree.NodeChangeEvent_UPDATE_PATH {
					if nSource == nil {
						eType = tree.NodeChangeEvent_CREATE
					} else if nTarget == nil {
						eType = tree.NodeChangeEvent_DELETE
					}
				}

				data, _ := protojson.Marshal(&tree.NodeChangeEvent{
					Type:   eType,
					Target: nTarget,
					Source: nSource,
				})

				session.Write(data)
				hasData = true
			}
		}

		return hasData
	})

}

// BroadcastTaskChangeEvent listens to tasks events and broadcast them to sessions with the adequate user.
func (w *WebsocketHandler) BroadcastTaskChangeEvent(ctx context.Context, event *jobs.TaskChangeEvent) error {

	if w.Websocket == nil {
		return nil
	}

	taskOwner := event.TaskUpdated.TriggerOwner
	message, _ := protojson.Marshal(event)
	return w.Websocket.BroadcastFilter(message, func(session *melody.Session) bool {
		var isAdmin, o bool
		var v interface{}
		if v, o = session.Get(SessionProfileKey); o && v == common.PydioProfileAdmin {
			isAdmin = true
		}
		value, ok := session.Get(SessionUsernameKey)
		if !ok || value == nil {
			return false
		}
		isOwner := value.(string) == taskOwner || (taskOwner == common.PydioSystemUsername && isAdmin)
		if isOwner {
			log.Logger(ctx).Debug("Should Broadcast Task Event : ", zap.Any("task", event.TaskUpdated), zap.Any("job", event.Job))
		} else {
			log.Logger(ctx).Debug("Owner was " + taskOwner + " while session user was " + value.(string))
		}
		return isOwner
	})

}

// BroadcastIDMChangeEvent listens to ACL events and broadcast them to sessions if the Role, User, or Workspace is concerned
// This triggers a registry reload in the UX (and eventually a change of permissions)
func (w *WebsocketHandler) BroadcastIDMChangeEvent(ctx context.Context, event *idm.ChangeEvent) error {

	event.JsonType = "idm"
	message, _ := protojson.Marshal(event)
	return w.Websocket.BroadcastFilter(message, func(session *melody.Session) bool {

		var checkRoleId string
		var checkUserId string
		var checkUserLogin string
		var checkWorkspaceId string
		if event.Acl != nil && event.Acl.RoleID != "" && !strings.HasPrefix(event.Acl.Action.Name, "parameter:") && !strings.HasPrefix(event.Acl.Action.Name, "action:") {
			checkRoleId = event.Acl.RoleID
		} else if event.Role != nil {
			checkRoleId = event.Role.Uuid
		} else if event.User != nil && event.User.Login != "" {
			checkUserLogin = event.User.Login
		} else if event.User != nil {
			checkUserId = event.User.Uuid
		} else if event.Workspace != nil {
			checkWorkspaceId = event.Workspace.UUID
		}

		if checkUserLogin != "" {
			if val, ok := session.Get(SessionUsernameKey); ok && val != nil {
				return checkUserLogin == val.(string)
			}
		}

		if checkUserId != "" {
			if val, ok := session.Get(SessionClaimsKey); ok && val != nil {
				c := val.(claim.Claims)
				return checkUserId == c.Subject
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

// BroadcastActivityEvent listens to activities and broadcast them to sessions with the adequate user.
func (w *WebsocketHandler) BroadcastActivityEvent(ctx context.Context, event *activity.PostActivityEvent) error {

	// Only handle "users inbox" events for now
	if event.BoxName != "inbox" && event.OwnerType != activity.OwnerType_USER {
		return nil
	}
	event.JsonType = "activity"
	if event.Activity.Object != nil {
		event.Activity.Object.Name = path.Base(event.Activity.Object.Name)
	}
	if event.Activity.Origin != nil {
		event.Activity.Origin.Name = path.Base(event.Activity.Origin.Name)
	}
	if event.Activity.Target != nil {
		event.Activity.Target.Name = path.Base(event.Activity.Target.Name)
	}
	message, _ := protojson.Marshal(event)
	return w.Websocket.BroadcastFilter(message, func(session *melody.Session) bool {
		if val, ok := session.Get(SessionUsernameKey); ok && val != nil {
			return event.OwnerId == val.(string) && event.Activity.Actor.Id != val.(string)
		}
		return false
	})

}

// MatchPolicies creates an memory-based policy stack checker to check if action is allowed or denied.
// It uses a DenyByDefault strategy
func (w *WebsocketHandler) MatchPolicies(policies []*service.ResourcePolicy, subjects []string, action service.ResourcePolicyAction) bool {

	warden := &ladon.Ladon{Manager: memory.NewMemoryManager()}
	for i, pol := range policies {
		id := fmt.Sprintf("%v", pol.Id)
		if pol.Id == 0 {
			id = fmt.Sprintf("%d", i)
		}
		// We could add also conditions here
		ladonPol := &ladon.DefaultPolicy{
			ID:        id,
			Resources: []string{"resource"},
			Actions:   []string{pol.Action.String()},
			Effect:    pol.Effect.String(),
			Subjects:  []string{pol.Subject},
		}
		warden.Manager.Create(ladonPol)
	}
	// check that at least one of the subject is allowed
	var allow bool
	for _, subject := range subjects {
		request := &ladon.Request{
			Resource: "resource",
			Subject:  subject,
			Action:   action.String(),
		}
		if err := warden.IsAllowed(request); err != nil && err == ladon.ErrRequestForcefullyDenied {
			return false
		} else if err == nil {
			allow = true
		} // Else "default deny" => continue checking
	}

	return allow
}
