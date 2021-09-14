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

package views

import (
	"context"
	"path"
	"strings"
	"time"

	"github.com/golang/protobuf/jsonpb"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	"github.com/patrickmn/go-cache"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/docstore"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/proto"
	context2 "github.com/pydio/cells/common/utils/context"
	"github.com/pydio/cells/common/utils/permissions"
)

var (
	vManager      *VirtualNodesManager
	vManagerCache *cache.Cache
)

// VirtualNodesManager keeps an internal list of virtual nodes.
// They are cached for one minute to avoid too many requests on docstore service.
type VirtualNodesManager struct {
	nodes      []*tree.Node
	loginLower bool
}

// GetVirtualNodesManager creates a new VirtualNodesManager.
func GetVirtualNodesManager() *VirtualNodesManager {
	if vManagerCache == nil {
		vManagerCache = cache.New(time.Second*60, time.Second*120)
	}
	if vManager != nil {
		vManager.Load()
		return vManager
	}
	vManager = &VirtualNodesManager{}
	vManager.Load()
	return vManager
}

// Load requests the virtual nodes from the DocStore service.
func (m *VirtualNodesManager) Load(forceReload ...bool) {
	if len(forceReload) == 0 || !forceReload[0] {
		if vNodes, found := vManagerCache.Get("###virtual-nodes###"); found {
			m.nodes = vNodes.([]*tree.Node)
			return
		}
	}
	log.Logger(context.Background()).Debug("Reloading virtual nodes to cache")
	m.nodes = []*tree.Node{}
	cli := docstore.NewDocStoreClient(common.ServiceGrpcNamespace_+common.ServiceDocStore, defaults.NewClient())
	stream, e := cli.ListDocuments(context.Background(), &docstore.ListDocumentsRequest{
		StoreID: common.DocStoreIdVirtualNodes,
		Query:   &docstore.DocumentQuery{},
	})
	if e != nil {
		return
	}
	defer stream.Close()
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
		er := jsonpb.UnmarshalString(data, &node)
		if er != nil {
			log.Logger(context.Background()).Error("Cannot unmarshal data: "+data, zap.Error(er))
		} else {
			log.Logger(context.Background()).Debug("Loading virtual node: ", zap.Any("node", node))
			m.nodes = append(m.nodes, &node)
		}
	}
	vManagerCache.Set("###virtual-nodes###", m.nodes, cache.DefaultExpiration)
	if config.Get("services", "pydio.grpc.user", "loginCI").Default(false).Bool() {
		m.loginLower = true
	}
}

// ByUuid finds a VirtualNode by its Uuid.
func (m *VirtualNodesManager) ByUuid(uuid string) (*tree.Node, bool) {

	for _, n := range m.nodes {
		if n.Uuid == uuid {
			return n, true
		}
	}
	return nil, false

}

// ByPath finds a VirtualNode by its Path.
func (m *VirtualNodesManager) ByPath(path string) (*tree.Node, bool) {

	for _, n := range m.nodes {
		if strings.Trim(n.Path, "/") == strings.Trim(path, "/") {
			return n, true
		}
	}
	return nil, false

}

// ListNodes simply returns the internally cached list.
func (m *VirtualNodesManager) ListNodes() []*tree.Node {
	return m.nodes
}

// ResolveInContext computes the actual node Path based on the resolution metadata of the virtual node
// and the current metadata contained in context.
func (m *VirtualNodesManager) ResolveInContext(ctx context.Context, vNode *tree.Node, clientsPool SourcesPool, create bool, retry ...bool) (*tree.Node, error) {

	//	log.Logger(ctx).Error("RESOLVE IN CONTEXT - CONTEXT IS", zap.Any("ctx", ctx))

	resolved := &tree.Node{}
	userName, claim := permissions.FindUserNameInContext(ctx) // We may use Claims returned to grab role or user groupPath
	if userName == "" {
		log.Logger(ctx).Error("No UserName found in context, cannot resolve virtual node", zap.Any("ctx", ctx))
		return nil, errors.New("claims.not.found", "No Claims found in context", 500)
	}
	resolved, e := m.resolvePathWithClaims(ctx, vNode, claim, clientsPool)
	if e != nil {
		return nil, e
	}

	if cached, ok := vManagerCache.Get(resolved.Path); ok {
		if cn, casted := cached.(*tree.Node); casted {
			log.Logger(ctx).Debug("VirtualNodes: returning cached resolved node", cn.Zap())
			return cn, nil
		}
	}

	if readResp, e := clientsPool.GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: resolved}); e == nil {
		vManagerCache.Set(resolved.Path, readResp.Node, cache.DefaultExpiration)
		return readResp.Node, nil
	} else if errors.Parse(e.Error()).Code == 404 {
		if len(retry) == 0 {
			// Retry once
			clientsPool.LoadDataSources()
			log.Logger(ctx).Debug("Cannot read resolved node - Retrying once after listing datasources", zap.Any("# sources", len(clientsPool.GetDataSources())))
			return m.ResolveInContext(ctx, vNode, clientsPool, create, true)
		} else {
			log.Logger(ctx).Debug("Cannot read resolved node - still", resolved.ZapPath(), zap.Error(e), zap.Any("Sources", clientsPool.GetDataSources()))
		}
	}
	if create {
		resolved.MTime = time.Now().Unix()
		resolved.Type = tree.NodeType_COLLECTION
		if createResp, err := clientsPool.GetTreeClientWrite().CreateNode(ctx, &tree.CreateNodeRequest{Node: resolved}); err != nil {
			return nil, err
		} else {
			resolved = createResp.GetNode()
			router := NewStandardRouter(RouterOptions{AdminView: true})
			isFlat := false
			if bI, e := router.BranchInfoForNode(ctx, resolved); e == nil {
				isFlat = bI.FlatStorage
			}
			if !isFlat {
				// Silently create the .pydio if necessary
				newNode := resolved.Clone()
				newNode.Path = path.Join(newNode.Path, common.PydioSyncHiddenFile)
				nodeUuid := newNode.Uuid
				newNode.MetaStore = make(map[string]string) // Reset metastore !
				newNode.Uuid = ""
				createCtx := context2.WithAdditionalMetadata(ctx, map[string]string{common.PydioContextUserKey: common.PydioSystemUsername})
				if _, pE := router.PutObject(createCtx, newNode, strings.NewReader(nodeUuid), &PutRequestData{Size: int64(len(nodeUuid))}); pE != nil {
					log.Logger(ctx).Warn("Creating hidden file for resolved node (may not be required)", newNode.Zap("resolved"), zap.Error(pE))
				}
			}
			if e := m.copyRecycleRootAcl(ctx, vNode, resolved); e != nil {
				log.Logger(ctx).Warn("Silently ignoring copyRecycleRoot", resolved.Zap("resolved"), zap.Error(e))
			}
			vManagerCache.Set(resolved.GetPath(), resolved, cache.DefaultExpiration)
			return createResp.Node, nil
		}
	}
	return resolved, nil

}

// GetResolver injects some dependencies to generate a simple resolver function
func (m *VirtualNodesManager) GetResolver(pool SourcesPool, createIfNotExists bool) func(context.Context, *tree.Node) (*tree.Node, bool) {
	return func(ctx context.Context, node *tree.Node) (*tree.Node, bool) {
		if virtualNode, exists := vManager.ByUuid(node.Uuid); exists {
			if resolved, e := vManager.ResolveInContext(ctx, virtualNode, pool, createIfNotExists); e == nil {
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
func (m *VirtualNodesManager) resolvePathWithClaims(ctx context.Context, vNode *tree.Node, c claim.Claims, clientsPool SourcesPool) (*tree.Node, error) {

	resolved := &tree.Node{}
	jsUser := m.toJsUser(c)
	resolutionString := vNode.MetaStore["resolution"]
	if cType, exists := vNode.MetaStore["contentType"]; exists && cType == "text/javascript" {

		datasourceKeys := map[string]string{}
		if len(clientsPool.GetDataSources()) == 0 {
			log.Logger(ctx).Debug("Clientspool.clients is empty! reload datasources now!")
			clientsPool.LoadDataSources()
		}
		for key, _ := range clientsPool.GetDataSources() {
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
	resolved.SetMeta(common.MetaNamespaceDatasourceName, parts[0])
	resolved.SetMeta(common.MetaNamespaceDatasourcePath, strings.Join(parts[1:], "/"))

	return resolved, nil

}

// copyRecycleRootAcl creates recycle_root ACL on newly created node
func (m *VirtualNodesManager) copyRecycleRootAcl(ctx context.Context, vNode *tree.Node, resolved *tree.Node) error {
	cl := idm.NewACLServiceClient(common.ServiceGrpcNamespace_+common.ServiceAcl, defaults.NewClient())
	// Check if vNode has this flag set
	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
		NodeIDs: []string{vNode.Uuid},
		Actions: []*idm.ACLAction{permissions.AclRecycleRoot},
	})
	st, e := cl.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{SubQueries: []*any.Any{q}}})
	if e != nil {
		return e
	}
	defer st.Close()
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
	cl.CreateACL(ctx, &idm.CreateACLRequest{
		ACL: &idm.ACL{
			NodeID: resolved.Uuid,
			Action: permissions.AclRecycleRoot,
		},
	})

	return nil
}
