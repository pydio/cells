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

	_ "github.com/doug-martin/goqu/v9/dialect/sqlite3"
	_ "github.com/mattn/go-sqlite3"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	grpc2 "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/server/stubs"
	srv "github.com/pydio/cells/v4/data/tree/grpc"
)

func NewTreeService(dss []string, nodes ...*tree.Node) (grpc.ClientConnInterface, error) {

	server := &srv.TreeServer{
		MainCtx: context.Background(),
	}
	server.DataSources = map[string]srv.DataSource{}
	for _, ds := range dss {
		conn := grpc2.GetClientConnFromCtx(context.Background(), common.ServiceDataIndex_+ds)
		server.DataSources[ds] = srv.NewDataSource(ds, tree.NewNodeProviderClient(conn), tree.NewNodeReceiverClient(conn))
	}

	serv1 := &tree.NodeProviderStub{}
	serv1.NodeProviderServer = server
	serv2 := &tree.NodeReceiverStub{}
	serv2.NodeReceiverServer = server

	serv := &stubs.MuxService{}
	serv.Register("tree.NodeProvider", serv1)
	serv.Register("tree.NodeReceiver", serv2)

	for _, u := range nodes {
		_, er := server.CreateNode(context.Background(), &tree.CreateNodeRequest{Node: u})
		if er != nil {
			return nil, er
		}
	}
	return serv, nil
}
