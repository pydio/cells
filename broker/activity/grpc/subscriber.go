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
	"fmt"
	"path"
	"strings"
	"sync"

	"go.uber.org/zap"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/broker/activity"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/client/commons/treec"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/permissions"
	activity2 "github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/cache"
	cache_helper "github.com/pydio/cells/v4/common/utils/cache/helper"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

type MicroEventsSubscriber struct {
	sync.Mutex
	RuntimeCtx context.Context

	handlerName string
	cacheConfig cache.Config
}

func NewEventsSubscriber(ctx context.Context, handlerName string) *MicroEventsSubscriber {

	return &MicroEventsSubscriber{
		RuntimeCtx:  ctx,
		handlerName: handlerName,
		cacheConfig: cache.Config{
			Prefix:      "activities-subscriber",
			Eviction:    "3m",
			CleanWindow: "10m",
		},
	}

}

func (e *MicroEventsSubscriber) getQueue(ctx context.Context) (broker.AsyncQueue, error) {
	var mgr manager.Manager
	if !propagator.Get(ctx, manager.ContextKey, &mgr) {
		return nil, fmt.Errorf("no manager in context")
	}
	data := map[string]interface{}{
		"debounce": "2s",
		"idle":     "20s",
		"max":      "2000",
	}
	return mgr.GetQueue(ctx, "debouncer", data, "activity", func(q broker.AsyncQueue) (broker.AsyncQueue, error) {
		er := q.Consume(e.ProcessIdmBatch)
		return q, er
	})
}

func (e *MicroEventsSubscriber) ignoreForInternal(node *tree.Node) bool {
	return node.HasMetaKey(common.MetaNamespaceDatasourceInternal)
}

// HandleNodeChange processes the received events and sends them to the subscriber
func (e *MicroEventsSubscriber) HandleNodeChange(ctx context.Context, msg *tree.NodeChangeEvent) error {

	dao, er := manager.Resolve[activity.DAO](ctx)
	if er != nil {
		return er
	}

	author := common.PydioSystemUsername
	if u, o := propagator.CanonicalMeta(ctx, common.PydioContextUserKey); o {
		author = u
	}
	if author == common.PydioSystemUsername {
		// Ignore events triggered by initial sync
		return nil
	}
	log.Logger(ctx).Debug("Fan out event to activities", zap.String(common.KeyUser, author), msg.Zap())

	// Create Activities and post them to associated inboxes
	ac, node := activity.DocumentActivity(author, msg)
	if node == nil || node.Uuid == "" || (node.Path != "" && tree.IgnoreNodeForOutput(ctx, node)) || e.ignoreForInternal(node) {
		return nil
	}

	loadedNode, parentUuids, err := e.parentsFromCache(ctx, node, msg.Type == tree.NodeChangeEvent_DELETE)
	if err != nil {
		log.Logger(ctx).Error("Error while loading parentsFromCache for node", zap.Error(err), node.ZapPath(), zap.String("eventType", msg.Type.String()))
		return err
	}
	// Use reloaded node
	if msg.Type == tree.NodeChangeEvent_UPDATE_USER_META {
		if node.MetaStore != nil {
			if loadedNode.MetaStore == nil {
				loadedNode.MetaStore = make(map[string]string, len(node.MetaStore))
			}
			for k, v := range node.MetaStore {
				loadedNode.MetaStore[k] = v
			}
		}
		msg.Target = loadedNode
		// Rebuild activity
		ac, node = activity.DocumentActivity(author, msg)
	}

	//
	// Post to the initial node Outbox
	//
	log.Logger(ctx).Debug("Posting Activity to node outbox")
	if msg.Type == tree.NodeChangeEvent_DELETE {
		dao.Delete(nil, activity2.OwnerType_NODE, node.Uuid)
	} else {
		dao.PostActivity(ctx, activity2.OwnerType_NODE, node.Uuid, activity.BoxOutbox, ac, false)
	}

	//
	// Post to the author Outbox
	//
	log.Logger(ctx).Debug("Posting Activity to author outbox")
	dao.PostActivity(ctx, activity2.OwnerType_USER, author, activity.BoxOutbox, ac, true)

	//
	// Post to parents Outbox'es as well
	//
	for _, uuid := range parentUuids {
		dao.PostActivity(ctx, activity2.OwnerType_NODE, uuid, activity.BoxOutbox, ac, false)
	}

	//
	// Find followers and post activity to their Inbox
	//
	subUuids := parentUuids
	if msg.Type != tree.NodeChangeEvent_CREATE {
		subUuids = append(subUuids, node.Uuid)
	}
	subscriptions, err := dao.ListSubscriptions(ctx, activity2.OwnerType_NODE, subUuids)
	log.Logger(ctx).Debug("Listing followers on node and its parents", zap.Int("subs length", len(subscriptions)))
	if err != nil {
		return err
	}
	for _, subscription := range subscriptions {

		if len(subscription.Events) == 0 {
			continue
		}
		// Ignore if author is user
		if subscription.UserId == author {
			continue
		}
		evread := false
		evchange := false
		for _, ev := range subscription.Events {
			if strings.Compare(ev, "read") == 0 {
				evread = true
			} else if strings.Compare(ev, "change") == 0 {
				evchange = true
			}
		}
		if !((evread && ac.Type == activity2.ObjectType_Read) || (evchange && ac.Type != activity2.ObjectType_Read)) {
			continue
		}
		accessList, user, er := permissions.AccessListFromUser(ctx, subscription.UserId, false)
		if er != nil {
			log.Logger(ctx).Error("Could not load access list", zap.Error(er))
			continue
		}
		userCtx := auth.WithImpersonate(ctx, user)
		ancestors, ez := nodes.BuildAncestorsListOrParent(userCtx, treec.NodeProviderClient(userCtx), loadedNode)
		if ez != nil {
			log.Logger(ctx).Error("Could not load ancestors list", zap.Error(er))
			continue
		}
		if accessList.CanReadWithResolver(userCtx, e.vNodeResolver, ancestors...) {
			if er := dao.PostActivity(ctx, activity2.OwnerType_USER, subscription.UserId, activity.BoxInbox, ac, true); er != nil {
				log.Logger(ctx).Error("Could not post activity", zap.Error(er))
			}
		}
	}

	return nil
}

func (e *MicroEventsSubscriber) vNodeResolver(ctx context.Context, n *tree.Node) (*tree.Node, bool) {
	return abstract.GetVirtualNodesManager(e.RuntimeCtx).GetResolver(false)(ctx, n)
}

func (e *MicroEventsSubscriber) HandleIdmChange(ctx context.Context, msg *idm.ChangeEvent) error {

	dao, err := manager.Resolve[activity.DAO](ctx)
	if err != nil {
		return err
	}

	if msg.Acl != nil {
		author, _ := permissions.FindUserNameInContext(ctx)
		if msg.Attributes == nil {
			msg.Attributes = make(map[string]string)
		}
		msg.Attributes["user"] = author
		q, er := e.getQueue(ctx) //e.muxPool.Get(ctx)
		if er != nil {
			return er
		}
		return q.Push(ctx, msg)
	} else if msg.User != nil && msg.Type == idm.ChangeEventType_DELETE && msg.User.Login != "" {
		// Clear activity for deleted user
		ctx = runtime.WithServiceName(ctx, e.handlerName)
		log.Logger(ctx).Debug("Clearing activities for user", msg.User.ZapLogin())
		go func() {
			if er := dao.Delete(e.RuntimeCtx, activity2.OwnerType_USER, msg.User.Login); er != nil {
				log.Logger(ctx).Error("Could not clear activities for user"+msg.User.Login, zap.Error(er))
			}
		}()
	}

	return nil
}

func (e *MicroEventsSubscriber) parentsFromCache(ctx context.Context, node *tree.Node, isDel bool) (*tree.Node, []string, error) {

	e.Lock()
	defer e.Unlock()

	kach, err := cache_helper.ResolveCache(ctx, "short", e.cacheConfig)
	if err != nil {
		return nil, nil, err
	}

	var parentUuids []string
	loadedNode := node

	// Current N
	// parentUuids = append(parentUuids, node.Uuid)
	if node.Path == "" && !isDel {
		// Reload by Uuid
		if resp, err := treec.NodeProviderClient(ctx).ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: node.Uuid}}); err == nil && resp.Node != nil {
			loadedNode = resp.Node
		} else if err != nil {
			return nil, []string{}, err
		}
	}
	/*
		// For long paths, this may be more optimal
		n := time.Now()
		if pp, e := nodes.BuildAncestorsListOrParent(ctx, e.getTreeClient(), node); e != nil {
			return nil, parentUuids, e
		} else {
			for _, p := range pp {
				parentUuids = append(parentUuids, p.Uuid)
			}
			log.Logger(ctx).Info("--- Build AncestorsListOrParent Took" + time.Since(n).String())
			return loadedNode, parentUuids, nil
		}
	*/

	// Manually load parents from Path
	parentPath := loadedNode.Path
	for {
		parentPath = path.Dir(parentPath)
		if parentPath == "" || parentPath == "/" || parentPath == "." {
			break
		}
		var pU string
		if kach.Get(parentPath, &pU) {
			if pU != "**DELETED**" {
				parentUuids = append(parentUuids, pU)
			}
		} else {
			resp, err := treec.NodeProviderClient(ctx).ReadNode(ctx, &tree.ReadNodeRequest{
				Node:      &tree.Node{Path: parentPath},
				StatFlags: []uint32{tree.StatFlagNone}},
			)
			if err == nil {
				uuid := resp.Node.Uuid
				kach.Set(parentPath, uuid)
				parentUuids = append(parentUuids, uuid)
			} else if errors.Is(err, errors.StatusNotFound) {
				kach.Set(parentPath, "**DELETED**")
			} else {
				return nil, []string{}, err
			}
		}
	}

	return loadedNode, parentUuids, nil
}

func (e *MicroEventsSubscriber) ProcessIdmBatch(ctx context.Context, cE ...broker.Message) {

	if len(cE) == 0 {
		return
	}
	remaining := make(map[string]*idm.ChangeEvent)
	roles := make(map[string]*idm.Role)
	users := make(map[string]*idm.User)
	workspaces := make(map[string]*idm.Workspace)
	// Remove updates/deletes
	for _, msg := range cE {
		event := &idm.ChangeEvent{}
		if _, er := msg.Unmarshal(ctx, event); er != nil {
			continue
		}
		if event.Type == idm.ChangeEventType_UPDATE && (event.Acl.Action.Name == permissions.AclRead.Name || event.Acl.Action.Name == permissions.AclWrite.Name) {
			var del bool
			for _, m2 := range cE {
				e2 := &idm.ChangeEvent{}
				if _, er := m2.Unmarshal(ctx, e2); er != nil {
					continue
				}
				if e2.Type == idm.ChangeEventType_DELETE && e2.Acl.RoleID == event.Acl.RoleID && e2.Acl.WorkspaceID == event.Acl.WorkspaceID &&
					e2.Acl.Action.Name == event.Acl.Action.Name && e2.Acl.Action.Value == event.Acl.Action.Value {
					del = true
				}
			}
			if !del {
				key := event.Acl.RoleID + "-" + event.Acl.WorkspaceID
				if already, ok := remaining[key]; ok {
					already.Acl.Action.Name = already.Acl.Action.Name + "," + event.Acl.Action.Name
				} else {
					remaining[key] = event
				}
				roles[event.Acl.RoleID] = &idm.Role{}
				users[event.Attributes["user"]] = &idm.User{}
				workspaces[event.Acl.WorkspaceID] = &idm.Workspace{}
			}
		}
	}
	if len(remaining) == 0 || len(roles) == 0 || len(users) == 0 || len(workspaces) == 0 {
		return
	}

	// Load resources
	ctx = propagator.WithUserNameMetadata(ctx, common.PydioContextUserKey, common.PydioSystemUsername)
	if er := e.LoadResources(ctx, roles, users, workspaces); er != nil {
		return
	}
	dao, err := manager.Resolve[activity.DAO](ctx)
	if err != nil {
		log.Logger(ctx).Error("cannot load DAO in activity subscriber", zap.Error(err))
		return
	}

	// For the moment, only handle real users (no roles or groups), and skip source == target
	for _, r := range remaining {
		sourceUser := users[r.Attributes["user"]]
		targetRole := roles[r.Acl.RoleID]
		if targetRole.Uuid == "" || !targetRole.UserRole || targetRole.Uuid == sourceUser.Uuid {
			continue
		}
		if targetUser, ok := users[targetRole.Uuid]; ok {
			ac := activity.AclActivity(sourceUser.Login, workspaces[r.Acl.WorkspaceID], r.Acl.Action.Name)
			log.Logger(e.RuntimeCtx).Debug("Publishing Activity", zap.String("targetUser", targetUser.Login), zap.Any("a", ac))
			// Post to target User Inbox
			if er := dao.PostActivity(ctx, activity2.OwnerType_USER, targetUser.Login, activity.BoxInbox, ac, true); er != nil {
				log.Logger(e.RuntimeCtx).Error("Failed publishing activity to user "+targetUser.Login+"'s inbox", zap.Error(er))
			}
			if workspaces[r.Acl.WorkspaceID].Scope == idm.WorkspaceScope_ROOM {
				// Post to node Outbox
				if er := dao.PostActivity(ctx, activity2.OwnerType_NODE, r.Acl.NodeID, activity.BoxOutbox, ac, false); er != nil {
					log.Logger(e.RuntimeCtx).Error("Failed publishing activity to node outbox", zap.Error(er))
				}
			}
		}
	}

}

func (e *MicroEventsSubscriber) LoadResources(ctx context.Context, roles map[string]*idm.Role, users map[string]*idm.User, workspaces map[string]*idm.Workspace) error {

	// Load Roles
	var rUuids []string
	for k := range roles {
		rUuids = append(rUuids, k)
	}
	q, _ := anypb.New(&idm.RoleSingleQuery{Uuid: rUuids})
	streamer, er := idmc.RoleServiceClient(ctx).SearchRole(ctx, &idm.SearchRoleRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}})
	if er != nil {
		return er
	}
	for {
		resp, err := streamer.Recv()
		if err != nil {
			break
		}
		roles[resp.Role.Uuid] = resp.Role
	}

	// Load Users (from logins and from roleIds)
	var queries []*anypb.Any
	for k := range users {
		q1, _ := anypb.New(&idm.UserSingleQuery{Login: k})
		queries = append(queries, q1)
	}
	for _, role := range roles {
		if role.UserRole {
			q2, _ := anypb.New(&idm.UserSingleQuery{Uuid: role.Uuid})
			queries = append(queries, q2)
		}
	}
	stream2, er := idmc.UserServiceClient(ctx).SearchUser(ctx, &idm.SearchUserRequest{Query: &service.Query{
		SubQueries: queries,
		Operation:  service.OperationType_OR,
	}})
	if er != nil {
		return er
	}
	for {
		resp, err := stream2.Recv()
		if err != nil {
			break
		}
		if _, o := users[resp.User.Login]; o {
			users[resp.User.Login] = resp.User
		} else {
			users[resp.User.Uuid] = resp.User
		}
	}

	// Load Workspaces
	var queriesW []*anypb.Any
	for k := range workspaces {
		q3, _ := anypb.New(&idm.WorkspaceSingleQuery{Uuid: k})
		queriesW = append(queriesW, q3)
	}
	stream3, er := idmc.WorkspaceServiceClient(ctx).SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: &service.Query{SubQueries: queriesW}})
	if er != nil {
		return er
	}
	for {
		resp, err := stream3.Recv()
		if err != nil {
			break
		}
		workspaces[resp.Workspace.UUID] = resp.Workspace
	}

	log.Logger(context.Background()).Debug("Loaded Resources", zap.Any("roles", roles), zap.Any("users", users), zap.Any("workspaces", workspaces))

	return nil
}
