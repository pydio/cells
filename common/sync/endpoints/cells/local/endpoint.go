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
	"strings"
	"sync"

	"github.com/pkg/errors"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/utils/uuid"
	//	"github.com/pydio/cells/v4/common/micro/registry"
	//	"github.com/pydio/cells/v4/common/micro/transport/grpc"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/sync/endpoints/cells"
	"github.com/pydio/cells/v4/common/sync/model"
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
	cells.Abstract
}

// NewLocal creates a new instance of a Local endpoint
func NewLocal(root string, options cells.Options) *Local {
	if options.LocalInitRegistry {
		localRouterOnce.Do(func() {
			/*
				// TODO V4
				registry.EnableService("127.0.0.1", "8000")
				broker.EnableService("127.0.0.1", "8003")
				grpc.Enable()
				registry2.Init()
			*/
		})
	}
	l := &Local{
		Abstract: cells.Abstract{
			Root:       strings.TrimLeft(root, "/"),
			Options:    options,
			ClientUUID: uuid.New(),
		},
	}
	l.Factory = &localRouterFactory{
		router: compose.PathClient(context.Background(), nodes.AsAdmin(), nodes.WithSynchronousTasks()),
	}
	l.Source = l
	l.GlobalCtx = servicecontext.WithServiceName(context.Background(), "endpoint.cells.local")
	return l
}

// GetEndpointInfo returns info about this endpoint
func (l *Local) GetEndpointInfo() model.EndpointInfo {
	return model.EndpointInfo{
		URI:                   "router:///" + l.Root,
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
