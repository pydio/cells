/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

package cells

import (
	"context"
	"strings"
	"sync"

	"github.com/pborman/uuid"
	"github.com/pkg/errors"

	"github.com/pydio/cells/common"
	natsbroker "github.com/pydio/cells/common/micro/broker/nats"
	microregistry "github.com/pydio/cells/common/micro/registry"
	grpctransport "github.com/pydio/cells/common/micro/transport/grpc"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/registry"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/sync/model"
	"github.com/pydio/cells/common/views"
)

var (
	localRouterOnce *sync.Once
)

func init() {
	localRouterOnce = &sync.Once{}
}

// Local directly connects to a Cells server running in the same network,
// by connecting to the local NATS registry
type Local struct {
	abstract
}

// NewLocal creates a new instance of a Local endpoint
func NewLocal(root string, options Options) *Local {
	if options.LocalInitRegistry {
		localRouterOnce.Do(func() {
			microregistry.EnableNats()
			natsbroker.Enable()
			grpctransport.Enable()
			registry.Init()
		})
	}
	l := &Local{
		abstract: abstract{
			root:       strings.TrimLeft(root, "/"),
			options:    options,
			clientUUID: uuid.New(),
		},
	}
	l.factory = &localRouterFactory{
		router: views.NewStandardRouter(views.RouterOptions{
			WatchRegistry:    true,
			AdminView:        true,
			SynchronousTasks: true,
		}),
	}
	l.source = l
	logCtx := context.Background()
	logCtx = servicecontext.WithServiceName(logCtx, "endpoint.cells.remote")
	logCtx = servicecontext.WithServiceColor(logCtx, servicecontext.ServiceColorGrpc)
	l.globalCtx = logCtx
	return l
}

// GetEndpointInfo returns info about this endpoint
func (l *Local) GetEndpointInfo() model.EndpointInfo {
	return model.EndpointInfo{
		URI:                   "router:///" + l.root,
		RequiresNormalization: false,
		RequiresFoldersRescan: false,
		IsAsynchronous:        true,
		Ignores:               []string{common.PydioSyncHiddenFile},
	}
}

// localRouterFactory implements the clientProviderFactory interface
type localRouterFactory struct {
	router views.Handler
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
func (f *localRouterFactory) GetObjectsClient(ctx context.Context) (context.Context, objectsClient, error) {
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
