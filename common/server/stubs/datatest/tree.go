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

	"github.com/pydio/cells/v4/common"
	grpc2 "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/server/stubs"
	"github.com/pydio/cells/v4/common/server/stubs/inject"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/propagator"
	srv "github.com/pydio/cells/v4/data/tree/grpc"
)

func NewTreeService(ctx context.Context, svc service.Service, dss []string, nodes ...*tree.Node) (grpc.ClientConnInterface, error) {

	ct := context.Background()
	server := srv.NewTreeServer("")

	for _, ds := range dss {
		conn := grpc2.ResolveConn(ct, common.ServiceDataIndexGRPC_+ds)
		server.AppendDatasource(ct, ds, srv.NewDataSource(ds, tree.NewNodeProviderClient(conn), tree.NewNodeReceiverClient(conn)))
	}

	serv1 := &tree.NodeProviderStub{}
	serv1.NodeProviderServer = server
	serv2 := &tree.NodeReceiverStub{}
	serv2.NodeReceiverServer = server

	serv := &stubs.MuxService{}
	serv.Register("tree.NodeProvider", serv1)
	serv.Register("tree.NodeReceiver", serv2)

	mock := &inject.SvcInjectorMock{ClientConnInterface: serv, Svc: svc}
	ctx = propagator.With(ctx, service.ContextKey, svc)

	for _, u := range nodes {
		_, er := server.CreateNode(context.Background(), &tree.CreateNodeRequest{Node: u})
		if er != nil {
			return nil, er
		}
	}
	return mock, nil
}
