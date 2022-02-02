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
	"fmt"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/server/stubs"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/data/meta"
	srv "github.com/pydio/cells/v4/data/meta/grpc"
)

func NewMetaService(nodes ...*tree.Node) (grpc.ClientConnInterface, error) {
	sqlDao := sql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "data_meta_")
	if sqlDao == nil {
		return nil, fmt.Errorf("unable to open sqlite3 DB file, could not start test")
	}

	mockDAO := meta.NewDAO(sqlDao)
	var options = configx.New()
	if err := mockDAO.Init(options); err != nil {
		return nil, fmt.Errorf("could not start test: unable to initialise index DAO, error: %v", err)
	}

	ts := srv.NewMetaServer(context.Background(), mockDAO.(meta.DAO))

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

	ctx := servicecontext.WithDAO(context.Background(), mockDAO)
	for _, u := range nodes {
		_, er := ts.CreateNode(ctx, &tree.CreateNodeRequest{Node: u})
		if er != nil {
			return nil, er
		}
	}
	return mux, nil
}
