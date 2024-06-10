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

package abstract

import (
	"context"
	"fmt"
	"path"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/client/commons/docstorec"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	nodescontext "github.com/pydio/cells/v4/common/nodes/context"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/docstore"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service/serviceerrors"
	"github.com/pydio/cells/v4/common/utils/cache"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/permissions"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

var (
	vManagerPool *openurl.Pool[*VirtualNodesManager]
	vMPoolOnce   sync.Once

	AdminClientProvider func(runtime context.Context) nodes.Client
)

// VirtualNodesManager keeps an internal list of virtual nodes.
// They are cached for one minute to avoid too many requests on docstore service.
type VirtualNodesManager struct {
	cache.Cache

	//ctx        context.Context
	nodes      []*tree.Node
	loginLower bool
	mu         *sync.RWMutex
}

// GetVirtualNodesManager creates a new VirtualNodesManager.
func GetVirtualNodesManager(ctx context.Context) *VirtualNodesManager {

	vMPoolOnce.Do(func() {
		vManagerPool, _ = openurl.OpenPool[*VirtualNodesManager](ctx, []string{runtime.ShortCacheURL("evictionTime", "60s", "cleanWindow", "120s")}, func(ct context.Context, url string) (*VirtualNodesManager, error) {
			vcache, er := cache.OpenCache(ct, url)
			if er != nil {
				vcache = cache.MustDiscard()
			}
			manager := &VirtualNodesManager{
				Cache: vcache,
				mu:    &sync.RWMutex{},
			}
			manager.Load(ct)
			return manager, nil
		})
	})

	vManager, _ := vManagerPool.Get(ctx)
	return vManager
}

// Load requests the virtual nodes from the DocStore service.
func (m *VirtualNodesManager) Load(ctx context.Context, forceReload ...bool) {
	if len(forceReload) == 0 || !forceReload[0] {
		var vNodes []*tree.Node
		if m.Cache.Get("###virtual-nodes###", &vNodes) {
			m.mu.Lock()
			m.nodes = vNodes
			m.mu.Unlock()
			return
		}
	}
	log.Logger(ctx).Debug("Reloading virtual nodes to cache")
	m.mu.Lock()
	defer m.mu.Unlock()
	m.nodes = []*tree.Node{}
	stream, e := docstorec.DocStoreClient(ctx).ListDocuments(ctx, &docstore.ListDocumentsRequest{
		StoreID: common.DocStoreIdVirtualNodes,
		Query:   &docstore.DocumentQuery{},
	})
	if e != nil {
		return
	}
	for {
		resp, err := stream.Recv()
		if err != nil {
			break
		}
		if resp == nil {
			continue
		}
		data := resp.Document.Data
		node := tree.Node{}
		er := protojson.Unmarshal([]byte(data), &node)
		if er != nil {
			log.Logger(context.Background()).Error("Cannot unmarshal data: "+data, zap.Error(er))
		} else {
			log.Logger(context.Background()).Debug("Loading virtual node: ", zap.Any("node", &node))
			m.nodes = append(m.nodes, &node)
		}
	}
	if e := m.Cache.Set("###virtual-nodes###", m.nodes); e != nil {
		log.Logger(context.Background()).Error("cannot set virtual-nodes to cache", zap.Error(e))
	}
	if config.Get("services", "pydio.grpc.user", "loginCI").Default(false).Bool() {
		m.loginLower = true
	}
}

// ByUuid finds a VirtualNode by its Uuid.
func (m *VirtualNodesManager) ByUuid(uuid string) (*tree.Node, bool) {

	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, n := range m.nodes {
		if n.Uuid == uuid {
			return n, true
		}
	}
	return nil, false

}

// ByPath finds a VirtualNode by its Path.
func (m *VirtualNodesManager) ByPath(path string) (*tree.Node, bool) {

	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, n := range m.nodes {
		if strings.Trim(n.Path, "/") == strings.Trim(path, "/") {
			return n, true
		}
	}
	return nil, false

}

// ListNodes returns a copy of the internally cached list.
func (m *VirtualNodesManager) ListNodes() []*tree.Node {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return append([]*tree.Node{}, m.nodes...)
}

// ResolveInContext computes the actual node Path based on the resolution metadata of the virtual node
// and the current metadata contained in context.
func (m *VirtualNodesManager) ResolveInContext(ctx context.Context, vNode *tree.Node, create bool, retry ...bool) (*tree.Node, error) {

	pool := nodescontext.GetSourcesPool(ctx)
	userName, claims := permissions.FindUserNameInContext(ctx) // We may use Claims returned to grab role or user groupPath
	if userName == "" {
		log.Logger(ctx).Error("No UserName found in context, cannot resolve virtual node", zap.Any("ctx", ctx))
		return nil, serviceerrors.New("claims.not.found", "No Claims found in context", 500)
	}
	resolved, e := m.resolvePathWithClaims(ctx, vNode, claims, pool)
	if e != nil {
		return nil, e
	}

	var cn *tree.Node
	if m.Cache.Get(resolved.Path, &cn) {
		log.Logger(ctx).Debug("VirtualNodes: returning cached resolved node", cn.Zap())
		return cn, nil
	}

	if readResp, e := pool.GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: resolved}); e == nil {
		_ = m.Cache.Set(resolved.Path, readResp.Node)
		return readResp.Node, nil
	} else if serviceerrors.FromError(e).Code == 404 {
		if len(retry) == 0 {
			// Retry once
			pool.LoadDataSources()
			log.Logger(ctx).Debug("Cannot read resolved node - Retrying once after listing datasources", zap.Any("# sources", len(pool.GetDataSources())))
			return m.ResolveInContext(ctx, vNode, create, true)
		} else {
			log.Logger(ctx).Debug("Cannot read resolved node - still", resolved.ZapPath(), zap.Error(e), zap.Any("Sources", pool.GetDataSources()))
			if !create {
				return nil, e
			}
		}
	}
	if create {
		resolved.MTime = time.Now().Unix()
		resolved.Type = tree.NodeType_COLLECTION
		if createResp, err := pool.GetTreeClientWrite().CreateNode(ctx, &tree.CreateNodeRequest{Node: resolved}); err != nil {
			return nil, err
		} else {
			if AdminClientProvider == nil {
				log.Logger(ctx).Error("Oops, VirtualNodesManager AdminClient is empty ! ")
				return nil, fmt.Errorf("cancel create")
			}
			resolved = createResp.GetNode()
			isFlat := false
			client := AdminClientProvider(ctx)
			if bI, e := client.BranchInfoForNode(ctx, resolved); e == nil {
				isFlat = bI.FlatStorage
			}
			if !isFlat {
				// Silently create the .pydio if necessary
				newNode := resolved.Clone()
				newNode.Path = path.Join(newNode.Path, common.PydioSyncHiddenFile)
				nodeUuid := newNode.Uuid
				newNode.MetaStore = make(map[string]string) // Reset metastore !
				newNode.Uuid = ""
				createCtx := propagator.WithAdditionalMetadata(ctx, map[string]string{common.PydioContextUserKey: common.PydioSystemUsername})
				if _, pE := client.PutObject(createCtx, newNode, strings.NewReader(nodeUuid), &models.PutRequestData{Size: int64(len(nodeUuid))}); pE != nil {
					log.Logger(ctx).Warn("Creating hidden file for resolved node (may not be required)", newNode.Zap("resolved"), zap.Error(pE))
				}
			}
			if e := m.copyRecycleRootAcl(ctx, vNode, resolved); e != nil {
				log.Logger(ctx).Warn("Silently ignoring copyRecycleRoot", resolved.Zap("resolved"), zap.Error(e))
			}
			_ = m.Cache.Set(resolved.GetPath(), resolved)
			return createResp.Node, nil
		}
	}
	return resolved, nil

}

// GetResolver injects some dependencies to generate a simple resolver function
func (m *VirtualNodesManager) GetResolver(createIfNotExists bool) func(context.Context, *tree.Node) (*tree.Node, bool) {
	return func(ctx context.Context, node *tree.Node) (*tree.Node, bool) {
		if virtualNode, exists := m.ByUuid(node.Uuid); exists {
			if resolved, e := m.ResolveInContext(ctx, virtualNode, createIfNotExists); e == nil {
				return resolved, true
			}
		}
		return nil, false
	}
}

// toJsUser transforms claims to JsUser
func (m *VirtualNodesManager) toJsUser(c claim.Claims) *permissions.JsUser {
	uName := c.Name
	if m.loginLower {
		uName = strings.ToLower(uName)
	}
	gFlat := strings.Join(strings.Split(strings.Trim(c.GroupPath, "/"), "/"), "_")
	if gFlat == "" {
		gFlat = "root_group_flat"
	}
	return &permissions.JsUser{
		Uuid:        c.Subject,
		Name:        uName,
		GroupPath:   strings.Trim(c.GroupPath, "/"),
		GroupFlat:   gFlat,
		Profile:     c.Profile,
		DisplayName: c.DisplayName,
		Email:       c.Email,
		AuthSource:  c.AuthSource,
		Roles:       strings.Split(c.Roles, ","),
	}
}

// resolvePathWithClaims performs the actual Path resolution and returns a node. There is no guarantee that the node exists.
func (m *VirtualNodesManager) resolvePathWithClaims(ctx context.Context, vNode *tree.Node, c claim.Claims, clientsPool nodes.SourcesPool) (*tree.Node, error) {

	resolved := &tree.Node{}
	jsUser := m.toJsUser(c)
	resolutionString := vNode.MetaStore["resolution"]
	if cType, exists := vNode.MetaStore["contentType"]; exists && cType == "text/javascript" {

		datasourceKeys := map[string]string{}
		if len(clientsPool.GetDataSources()) == 0 {
			log.Logger(ctx).Debug("Clientspool.clients is empty! reload datasources now!")
			clientsPool.LoadDataSources()
		}
		for key := range clientsPool.GetDataSources() {
			datasourceKeys[key] = key
		}
		in := map[string]interface{}{
			"User":        jsUser,
			"DataSources": datasourceKeys,
		}
		out := map[string]interface{}{
			"Path": "",
		}
		if e := permissions.RunJavaScript(ctx, resolutionString, in, out); e == nil {
			resolved.Path = out["Path"].(string)
		} else {
			log.Logger(ctx).Error("Cannot Run Javascript "+resolutionString, zap.Error(e), zap.Any("in", in), zap.Any("out", out))
			return nil, e
		}

	} else {
		resolved.Path = strings.Replace(resolutionString, "{USERNAME}", jsUser.Name, -1)
	}

	resolved.Type = vNode.Type

	parts := strings.Split(resolved.Path, "/")
	resolved.MustSetMeta(common.MetaNamespaceDatasourceName, parts[0])
	resolved.MustSetMeta(common.MetaNamespaceDatasourcePath, strings.Join(parts[1:], "/"))

	return resolved, nil

}

// copyRecycleRootAcl creates recycle_root ACL on newly created node
func (m *VirtualNodesManager) copyRecycleRootAcl(ctx context.Context, vNode *tree.Node, resolved *tree.Node) error {
	cl := idmc.ACLServiceClient(ctx)

	// Check if vNode has this flag set
	q, _ := anypb.New(&idm.ACLSingleQuery{
		NodeIDs: []string{vNode.Uuid},
		Actions: []*idm.ACLAction{permissions.AclRecycleRoot},
	})
	ct, ca := context.WithCancel(ctx)
	defer ca()
	st, e := cl.SearchACL(ct, &idm.SearchACLRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}})
	if e != nil {
		return e
	}
	var has bool
	for {
		r, e := st.Recv()
		if e != nil {
			break
		}
		if r != nil {
			has = true
			break
		}
	}
	if !has {
		return nil
	}
	_, er := cl.CreateACL(ctx, &idm.CreateACLRequest{
		ACL: &idm.ACL{
			NodeID: resolved.Uuid,
			Action: permissions.AclRecycleRoot,
		},
	})
	return er
}
