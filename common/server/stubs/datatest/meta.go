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

package datatest

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/server/stubs"
	"github.com/pydio/cells/v4/common/server/stubs/inject"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/propagator"
	srv "github.com/pydio/cells/v4/data/meta/grpc"
)

func NewMetaService(ctx context.Context, svc service.Service, nodes ...*tree.Node) (grpc.ClientConnInterface, error) {

	ts := srv.NewMetaServer(ctx, "sample")

	srv1 := &tree.NodeProviderStub{}
	srv1.NodeProviderServer = ts
	srv2 := &tree.NodeReceiverStub{}
	srv2.NodeReceiverServer = ts
	srv3 := &tree.NodeProviderStreamerStub{}
	srv3.NodeProviderStreamerServer = ts

	mux := &stubs.MuxService{}
	mux.Register("tree.NodeProvider", srv1)
	mux.Register("tree.NodeReceiver", srv2)
	mux.Register("tree.NodeProviderStreamer", srv3)

	mock := &inject.SvcInjectorMock{ClientConnInterface: mux, Svc: svc}
	ctx = propagator.With(ctx, service.ContextKey, svc)
	for _, u := range nodes {
		_, er := ts.CreateNode(ctx, &tree.CreateNodeRequest{Node: u})
		if er != nil {
			return nil, er
		}
	}
	return mock, nil
}
