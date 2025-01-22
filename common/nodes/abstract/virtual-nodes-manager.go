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
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/client/commons"
	"github.com/pydio/cells/v5/common/client/commons/docstorec"
	"github.com/pydio/cells/v5/common/client/commons/idmc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/docstore"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

var (
	cacheConfig = cache.Config{
		Prefix:          "virtual-nodes",
		Eviction:        "60s",
		CleanWindow:     "120s",
		DiscardFallback: true,
	}

	AdminClientProvider func() nodes.Client
)

type VirtualProvider interface {
	Load(ctx context.Context, forceReload ...bool) (vNodes []*tree.Node, loginLower bool, e error)
	ByUuid(ctx context.Context, uuid string) (*tree.Node, bool)
	ByPath(ctx context.Context, path string) (*tree.Node, bool)
	ListNodes(ctx context.Context) []*tree.Node
	ResolveInContext(ctx context.Context, vNode *tree.Node, create bool, retry ...bool) (*tree.Node, error)
	GetResolver(createIfNotExists bool) func(context.Context, *tree.Node) (*tree.Node, bool)
}

// virtualNodesManager keeps an internal list of virtual nodes.
// They are cached for one minute to avoid too many requests on docstore service.
type virtualNodesManager struct{}

// GetVirtualProvider creates a VirtualProvider.
func GetVirtualProvider() VirtualProvider {
	return &virtualNodesManager{}
}

// Load requests the virtual nodes from the DocStore service.
func (m *virtualNodesManager) Load(ctx context.Context, forceReload ...bool) (vNodes []*tree.Node, loginLower bool, e error) {
	ca := cache_helper.MustResolveCache(ctx, common.CacheTypeLocal, cacheConfig)

	if len(forceReload) == 0 || !forceReload[0] {
		if ca.Get("###virtual-nodes###", &vNodes) && ca.Get("###login-lower###", &loginLower) {
			return
		}
	}
	log.Logger(ctx).Debug("Reloading virtual nodes to cache")
	stream, er := docstorec.DocStoreClient(ctx).ListDocuments(ctx, &docstore.ListDocumentsRequest{
		StoreID: common.DocStoreIdVirtualNodes,
		Query:   &docstore.DocumentQuery{},
	})
	if e = commons.ForEach(stream, er, func(response *docstore.ListDocumentsResponse) error {
		data := response.Document.Data
		node := tree.Node{}
		if er := protojson.Unmarshal([]byte(data), &node); er != nil {
			return er
		} else {
			log.Logger(ctx).Debug("Loading virtual node: ", zap.Any("node", &node))
			vNodes = append(vNodes, &node)
		}
		return nil
	}); er != nil {
		return
	}
	_ = ca.Set("###virtual-nodes###", vNodes)
	loginLower = config.Get(ctx, "services", "pydio.grpc.user", "loginCI").Default(false).Bool()
	_ = ca.Set("###login-lower###", loginLower)

	return
}

// ByUuid finds a VirtualNode by its Uuid.
func (m *virtualNodesManager) ByUuid(ctx context.Context, uuid string) (*tree.Node, bool) {
	nn, _, er := m.Load(ctx)
	if er != nil {
		log.Logger(ctx).Error("Error while loading virtual nodes", zap.Error(er))
	}
	for _, n := range nn {
		if n.Uuid == uuid {
			return n, true
		}
	}
	return nil, false

}

// ByPath finds a VirtualNode by its Path.
func (m *virtualNodesManager) ByPath(ctx context.Context, path string) (*tree.Node, bool) {

	nn, _, er := m.Load(ctx)
	if er != nil {
		log.Logger(ctx).Error("Error while loading virtual nodes", zap.Error(er))
	}
	for _, n := range nn {
		if strings.Trim(n.Path, "/") == strings.Trim(path, "/") {
			return n, true
		}
	}
	return nil, false

}

// ListNodes returns a copy of the internally cached list.
func (m *virtualNodesManager) ListNodes(ctx context.Context) []*tree.Node {
	nn, _, er := m.Load(ctx)
	if er != nil {
		log.Logger(ctx).Error("Error while loading virtual nodes", zap.Error(er))
	}
	return append([]*tree.Node{}, nn...)
}

// ResolveInContext computes the actual node Path based on the resolution metadata of the virtual node
// and the current metadata contained in context.
func (m *virtualNodesManager) ResolveInContext(ctx context.Context, vNode *tree.Node, create bool, retry ...bool) (*tree.Node, error) {

	ca := cache_helper.MustResolveCache(ctx, common.CacheTypeLocal, cacheConfig)
	pool := nodes.GetSourcesPool(ctx)
	userName, claims := permissions.FindUserNameInContext(ctx) // We may use Claims returned to grab role or user groupPath
	if userName == "" {
		log.Logger(ctx).Error("No UserName found in context, cannot resolve virtual node", zap.Any("ctx", ctx))
		return nil, errors.WithStack(errors.AccessListNotFound)
	}
	resolved, e := m.resolvePathWithClaims(ctx, vNode, claims, pool)
	if e != nil {
		return nil, e
	}

	var cn *tree.Node
	if ca.Get(resolved.Path, &cn) {
		log.Logger(ctx).Debug("VirtualNodes: returning cached resolved node", cn.Zap())
		return cn, nil
	}

	if readResp, e := pool.GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: resolved}); e == nil {
		_ = ca.Set(resolved.Path, readResp.Node)
		return readResp.Node, nil
	} else if errors.Is(e, errors.StatusNotFound) {
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
				log.Logger(ctx).Error("Oops, virtualNodesManager AdminClient is empty ! ")
				return nil, fmt.Errorf("cancel create")
			}
			resolved = createResp.GetNode()
			isFlat := false
			client := AdminClientProvider()
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
			_ = ca.Set(resolved.GetPath(), resolved)
			return createResp.Node, nil
		}
	}
	return resolved, nil

}

// GetResolver injects some dependencies to generate a simple resolver function
func (m *virtualNodesManager) GetResolver(createIfNotExists bool) func(context.Context, *tree.Node) (*tree.Node, bool) {
	return func(ctx context.Context, node *tree.Node) (*tree.Node, bool) {
		if virtualNode, exists := m.ByUuid(ctx, node.Uuid); exists {
			if resolved, e := m.ResolveInContext(ctx, virtualNode, createIfNotExists); e == nil {
				return resolved, true
			}
		}
		return nil, false
	}
}

// toJsUser transforms claims to JsUser
func (m *virtualNodesManager) toJsUser(ctx context.Context, c claim.Claims) *permissions.JsUser {
	_, loginLower, er := m.Load(ctx)
	if er != nil {
		log.Logger(ctx).Error("Error while loading virtual nodes", zap.Error(er))
	}
	uName := c.Name
	if loginLower {
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
func (m *virtualNodesManager) resolvePathWithClaims(ctx context.Context, vNode *tree.Node, c claim.Claims, clientsPool nodes.SourcesPool) (*tree.Node, error) {

	resolved := &tree.Node{}
	jsUser := m.toJsUser(ctx, c)
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
func (m *virtualNodesManager) copyRecycleRootAcl(ctx context.Context, vNode *tree.Node, resolved *tree.Node) error {
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
