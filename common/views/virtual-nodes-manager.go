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

	context2 "github.com/pydio/cells/common/utils/context"

	"github.com/golang/protobuf/jsonpb"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/errors"
	"github.com/patrickmn/go-cache"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/docstore"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/permissions"
)

var (
	vManager      *VirtualNodesManager
	vManagerCache *cache.Cache
)

// VirtualNodesManager keeps an internal list of virtual nodes.
// They are cached for one minute to avoid too many requests on docstore service.
type VirtualNodesManager struct {
	VirtualNodes []*tree.Node
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
		if vNodes, found := vManagerCache.Get("virtual-nodes"); found {
			m.VirtualNodes = vNodes.([]*tree.Node)
			return
		}
	}
	log.Logger(context.Background()).Debug("Reloading virtual nodes to cache")
	m.VirtualNodes = []*tree.Node{}
	cli := docstore.NewDocStoreClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, defaults.NewClient())
	stream, e := cli.ListDocuments(context.Background(), &docstore.ListDocumentsRequest{
		StoreID: common.DOCSTORE_ID_VIRTUALNODES,
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
			m.VirtualNodes = append(m.VirtualNodes, &node)
		}
	}
	vManagerCache.Set("virtual-nodes", m.VirtualNodes, cache.DefaultExpiration)
}

// ByUuid finds a VirtualNode by its Uuid.
func (m *VirtualNodesManager) ByUuid(uuid string) (*tree.Node, bool) {

	for _, n := range m.VirtualNodes {
		if n.Uuid == uuid {
			return n, true
		}
	}
	return nil, false

}

// ByPath finds a VirtualNode by its Path.
func (m *VirtualNodesManager) ByPath(path string) (*tree.Node, bool) {

	for _, n := range m.VirtualNodes {
		if strings.Trim(n.Path, "/") == strings.Trim(path, "/") {
			return n, true
		}
	}
	return nil, false

}

// ListNodes simply returns the internally cached list.
func (m *VirtualNodesManager) ListNodes() []*tree.Node {
	return m.VirtualNodes
}

// ResolvePathWithVars performs the actual Path resolution and returns a node. There is no guarantee that the node exists.
func (m *VirtualNodesManager) ResolvePathWithVars(ctx context.Context, vNode *tree.Node, vars map[string]string, clientsPool *ClientsPool) (*tree.Node, error) {

	resolved := &tree.Node{}
	resolutionString := vNode.MetaStore["resolution"]
	if cType, exists := vNode.MetaStore["contentType"]; exists && cType == "text/javascript" {

		datasourceKeys := map[string]string{}
		if len(clientsPool.Sources) == 0 {
			log.Logger(ctx).Debug("Clientspool.clients is empty! reload datasources now!")
			clientsPool.listDatasources()
		}
		for key, _ := range clientsPool.Sources {
			datasourceKeys[key] = key
		}
		in := map[string]interface{}{
			"User":        &permissions.JsUser{Name: vars["User.Name"]},
			"DataSources": datasourceKeys,
		}
		out := map[string]interface{}{
			"Path": "",
		}
		if e := permissions.RunJavaScript(ctx, resolutionString, in, out); e == nil {
			resolved.Path = out["Path"].(string)
			//log.Logger(ctx).Debug("Javascript Resolved Objects", zap.Any("in", in), zap.Any("out", out))
		} else {
			log.Logger(ctx).Error("Cannot Run Javascript "+resolutionString, zap.Error(e), zap.Any("in", in), zap.Any("out", out))
			return nil, e
		}

	} else {
		resolved.Path = strings.Replace(resolutionString, "{USERNAME}", vars["User.Name"], -1)
	}

	resolved.Type = vNode.Type

	parts := strings.Split(resolved.Path, "/")
	resolved.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, parts[0])
	resolved.SetMeta(common.META_NAMESPACE_DATASOURCE_PATH, strings.Join(parts[1:], "/"))

	return resolved, nil

}

// ResolveInContext computes the actual node Path based on the resolution metadata of the virtual node
// and the current metadata contained in context.
func (m *VirtualNodesManager) ResolveInContext(ctx context.Context, vNode *tree.Node, clientsPool *ClientsPool, create bool, retry ...bool) (*tree.Node, error) {

	//	log.Logger(ctx).Error("RESOLVE IN CONTEXT - CONTEXT IS", zap.Any("ctx", ctx))

	resolved := &tree.Node{}
	userName, _ := permissions.FindUserNameInContext(ctx) // We may use Claims returned to grab role or user groupPath
	if userName == "" {
		log.Logger(ctx).Error("No UserName found in context, cannot resolve virtual node", zap.Any("ctx", ctx))
		return nil, errors.New(VIEWS_LIBRARY_NAME, "No Claims found in context", 500)
	}
	vars := map[string]string{"User.Name": userName}
	resolved, e := m.ResolvePathWithVars(ctx, vNode, vars, clientsPool)
	if e != nil {
		return nil, e
	}

	if readResp, e := clientsPool.GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: resolved}); e == nil {
		return readResp.Node, nil
	} else if errors.Parse(e.Error()).Code == 404 {
		if len(retry) == 0 {
			// Retry once
			clientsPool.listDatasources()
			log.Logger(ctx).Debug("Cannot read resolved node - Retrying once after listing datasources", zap.Any("# sources", len(clientsPool.Sources)))
			return m.ResolveInContext(ctx, vNode, clientsPool, create, true)
		} else {
			log.Logger(ctx).Debug("Cannot read resolved node - still", resolved.ZapPath(), zap.Error(e), zap.Any("Sources", clientsPool.Sources))
		}
	}
	if create {
		if createResp, err := clientsPool.GetTreeClientWrite().CreateNode(ctx, &tree.CreateNodeRequest{Node: resolved}); err != nil {
			return nil, err
		} else {
			// Manually create the .pydio file
			router := NewStandardRouter(RouterOptions{AdminView: true})
			newNode := createResp.Node.Clone()
			newNode.Path = path.Join(newNode.Path, common.PYDIO_SYNC_HIDDEN_FILE_META)
			nodeUuid := newNode.Uuid
			createCtx := context2.WithAdditionalMetadata(ctx, map[string]string{common.PYDIO_CONTEXT_USER_KEY: common.PYDIO_SYSTEM_USERNAME})
			_, pE := router.PutObject(createCtx, newNode, strings.NewReader(nodeUuid), &PutRequestData{Size: int64(len(nodeUuid))})
			if pE != nil {
				log.Logger(ctx).Error("Could not create hidden file for resolved node", newNode.Zap("resolved"), zap.Error(pE))
			}
			if e := m.copyRecycleRootAcl(ctx, vNode, createResp.Node); e != nil {
				return nil, e
			}
			return createResp.Node, nil
		}
	}
	return resolved, nil

}

func (m *VirtualNodesManager) copyRecycleRootAcl(ctx context.Context, vNode *tree.Node, resolved *tree.Node) error {
	cl := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, defaults.NewClient())
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
