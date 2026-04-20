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

package local

import (
	"context"
	"net/url"
	"path"
	"strings"
	"sync"

	"github.com/gobwas/glob"
	"github.com/pkg/errors"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/sync/endpoints"
	"github.com/pydio/cells/v5/common/sync/endpoints/cells"
	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/idm/meta"
)

var (
	localRouterOnce *sync.Once

	_ model.PathSyncSource   = (*Local)(nil)
	_ model.PathSyncTarget   = (*Local)(nil)
	_ model.MetadataProvider = (*Local)(nil)
	_ model.MetadataReceiver = (*Local)(nil)
)

const (
	scheme = "router"
)

func init() {
	localRouterOnce = &sync.Once{}
	endpoints.Register(scheme, endpoints.OpenURLFunc(func(ctx context.Context, u *url.URL, _ ...*url.URL) (model.Endpoint, error) {
		rootPath := u.Path
		var opts = cells.Options{
			LocalRuntimeContext: ctx,
		}
		values := u.Query()
		if values.Get("browseOnly") == "true" {
			opts.BrowseOnly = true
		}
		if values.Get("initRegistry") == "true" {
			opts.LocalInitRegistry = true
		}
		if values.Get("renewFolderUuids") == "true" {
			opts.RenewFolderUuids = true
		}
		if metas := values.Get("metadataGlobs"); metas != "" {
			for _, m := range strings.Split(metas, ",") {
				gl, er := glob.Compile(m)
				if er != nil {
					return nil, er
				}
				opts.MetadataGlobs = append(opts.MetadataGlobs, gl)
			}
		}

		return NewLocal(rootPath, opts), nil
	}))

}

// Local directly connects to a Cells server running in the same network,
// by connecting to the local registry
type Local struct {
	cells.Abstract
}

// NewLocal creates a new instance of a Local endpoint
func NewLocal(root string, options cells.Options) *Local {
	var ctx context.Context
	if options.LocalRuntimeContext != nil {
		ctx = options.LocalRuntimeContext
	} else {
		ctx = context.Background()
	}
	if options.LocalInitRegistry {
		localRouterOnce.Do(func() {
			// TODO - If we re-enable this endpoint, we may have to do something here
			reg, err := registry.OpenRegistry(ctx, runtime.RegistryURL())
			if err != nil {
				panic(err)
			}
			ctx = propagator.With(ctx, registry.ContextKey, reg)
		})
	}
	l := &Local{
		Abstract: cells.Abstract{
			Root:       strings.TrimLeft(root, "/"),
			Options:    options,
			ClientUUID: uuid.New(),
			GlobalCtx:  ctx,
		},
	}
	l.Factory = &localRouterFactory{
		router: compose.PathClient(nodes.AsAdmin(), nodes.WithSynchronousTasks(), nodes.WithHashesAsETags()),
	}
	l.Source = l
	l.GlobalCtx = runtime.WithServiceName(l.GlobalCtx, "endpoint.cells.local")
	return l
}

// GetEndpointInfo returns info about this endpoint
func (l *Local) GetEndpointInfo() model.EndpointInfo {
	return model.EndpointInfo{
		URI:                   scheme + ":///" + l.Root,
		RequiresNormalization: false,
		RequiresFoldersRescan: false,
		IsAsynchronous:        true,
		Ignores:               []string{common.PydioSyncHiddenFile},
	}
}

// localRouterFactory implements the clientProviderFactory interface
type localRouterFactory struct {
	router nodes.Handler
}

// GetNodeProviderClient returns a usable context and the internal Router
func (f *localRouterFactory) GetNodeProviderClient(ctx context.Context) (context.Context, tree.NodeProviderClient, error) {
	return f.userToContext(ctx), f.router, nil
}

// GetNodeReceiverClient returns the internal Router
func (f *localRouterFactory) GetNodeReceiverClient(ctx context.Context) (context.Context, tree.NodeReceiverClient, error) {
	return f.userToContext(ctx), f.router, nil
}

// GetNodeChangesStreamClient returns the internal Router
func (f *localRouterFactory) GetNodeChangesStreamClient(ctx context.Context) (context.Context, tree.NodeChangesStreamerClient, error) {
	return f.userToContext(ctx), f.router, nil
}

// GetObjectsClient returns the internal Router
func (f *localRouterFactory) GetObjectsClient(ctx context.Context) (context.Context, cells.ObjectsClient, error) {
	return f.userToContext(ctx), f.router, nil
}

// GetNodeReceiverStreamClient is not yet implemented
func (f *localRouterFactory) GetNodeReceiverStreamClient(context.Context) (context.Context, tree.NodeReceiverStreamClient, error) {
	return nil, nil, errors.New("Not Implemented")
}

// GetNodeProviderStreamClient is not yet implemented
func (f *localRouterFactory) GetNodeProviderStreamClient(context.Context) (context.Context, tree.NodeProviderStreamerClient, error) {
	return nil, nil, errors.New("Not Implemented")
}

func (f *localRouterFactory) userToContext(ctx context.Context) context.Context {
	return context.WithValue(ctx, common.PydioContextUserKey, common.PydioSystemUsername)
}

func (l *Local) ProvidesMetadataNamespaces() ([]glob.Glob, bool) {
	return l.Options.MetadataGlobs, len(l.Options.MetadataGlobs) > 0
}

func (l *Local) namespaceSupported(namespace string) bool {
	for _, g := range l.Options.MetadataGlobs {
		if g.Match(namespace) {
			return true
		}
	}
	return false
}

func (l *Local) metaNodeTarget(ctx context.Context, node tree.N) (*tree.Node, error) {
	ct, cl, er := l.Factory.GetNodeProviderClient(ctx)
	if er != nil {
		return nil, er
	}
	resp, err := cl.ReadNode(ct, &tree.ReadNodeRequest{Node: &tree.Node{Path: path.Join(l.Root, node.GetPath())}})
	if err != nil {
		return nil, err
	}
	return resp.GetNode(), nil
}

func (l *Local) CreateMetadata(ctx context.Context, node tree.N, namespace string, jsonValue string) error {
	if !l.namespaceSupported(namespace) {
		return nil
	}
	metaNode, err := l.metaNodeTarget(ctx, node)
	if err != nil {
		return err
	}
	if strings.HasPrefix(namespace, "usermeta-") {
		_, er := l.userMetaClient(ctx).UpdateMetaResolved(ctx, &idm.UpdateUserMetaRequest{
			Operation: idm.UpdateUserMetaRequest_PUT,
			MetaDatas: []*idm.UserMeta{{
				NodeUuid:     metaNode.GetUuid(),
				Namespace:    namespace,
				JsonValue:    jsonValue,
				ResolvedNode: metaNode,
			}},
		})
		return er
	} else {
		metaNode.SetRawMetadata(map[string]string{namespace: jsonValue})
		_, er := l.metaClient(ctx).CreateNode(ctx, &tree.CreateNodeRequest{Node: metaNode})
		return er
	}
}

func (l *Local) UpdateMetadata(ctx context.Context, node tree.N, namespace string, jsonValue string) error {
	if !l.namespaceSupported(namespace) {
		return nil
	}
	return l.CreateMetadata(ctx, node, namespace, jsonValue)
}

func (l *Local) DeleteMetadata(ctx context.Context, node tree.N, namespace string) error {
	if !l.namespaceSupported(namespace) {
		return nil
	}
	metaNode, err := l.metaNodeTarget(ctx, node)
	if err != nil {
		return err
	}
	if strings.HasPrefix(namespace, "usermeta-") {
		_, er := l.userMetaClient(ctx).UpdateMetaResolved(ctx, &idm.UpdateUserMetaRequest{
			Operation: idm.UpdateUserMetaRequest_DELETE,
			MetaDatas: []*idm.UserMeta{{
				NodeUuid:     metaNode.GetUuid(),
				Namespace:    namespace,
				ResolvedNode: metaNode,
			}},
		})
		return er
	} else {
		return errors.New("Not Implemented for internal metadata")
	}
}

var imc tree.NodeReceiverClient

func (l *Local) metaClient(ctx context.Context) tree.NodeReceiverClient {
	if imc == nil {
		imc = tree.NewNodeReceiverClient(grpc.ResolveConn(ctx, common.ServiceMetaGRPC))
	}
	return imc
}

var umc meta.UserMetaClient

func (l *Local) userMetaClient(ctx context.Context) meta.UserMetaClient {
	if umc == nil {
		umc = meta.NewUserMetaClient()
	}
	return umc
}
