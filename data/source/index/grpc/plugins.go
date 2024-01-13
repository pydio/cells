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

// Package grpc provides a pydio GRPC service for CRUD-ing the datasource index.
//
// It uses an SQL-based persistence layer for storing all nodes in the nested-set format in DB.
package grpc

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/data/source/index"
	"google.golang.org/grpc"
)

func init() {

	runtime.Register("main", func(ctx context.Context) {
		var srv grpc.ServiceRegistrar
		if !server.Get(&srv) {
			panic("no grpc server available")
		}

		// Retrieve server from the runtime - TODO
		//sources := config.SourceNamesForDataServices(common.ServiceDataIndex)
		//for _, source := range sources {
		// name := common.ServiceGrpcNamespace_ + common.ServiceDataIndex_ + source

		dao, err := index.NewDAO(ctx, storage.Main)
		if err != nil {
			panic(err)
		}

		opts := configx.New()
		//opts.Val("prefix").Set("data_index_" + source + "_idx")
		dao.Init(ctx, opts)

		dsObject, _ := config.GetSourceInfoByName("personal")

		engine := NewTreeServer(dsObject, "test", dao.(index.DAO))

		fmt.Println(engine)

		//var s service.Service

		//s = service.NewService(
		//	service.Name(name),
		//	service.Context(ctx),
		//	//service.WithLogger(log.Logger(ctx)),
		//	service.Tag(common.ServiceTagDatasource),
		//	service.Description("Datasource indexation service"),
		//	service.Source(source),
		//	// service.Fork(true),
		//	//service.AutoStart(false),
		//	//service.Unique(true),
		//	//service.WithTODOStorage(index.NewDAO, commonsql.NewDAO,
		//	//	service.WithStoragePrefix(func(o *service.ServiceOptions) string {
		//	//		// Returning a prefix for the dao
		//	//		return strings.Replace(strings.TrimPrefix(o.Name, common.ServiceGrpcNamespace_), ".", "_", -1)
		//	//	}),
		//	//	service.WithStorageSupport(mysql.Driver, sqlite.Driver),
		//	//),
		//	//service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
		//	//
		//	//	dsObject, e := config.GetSourceInfoByName(sourceOpt)
		//	//	if e != nil {
		//	//		return fmt.Errorf("cannot find datasource configuration for " + sourceOpt)
		//	//	}
		//	//	engine := NewTreeServer(dsObject, name, service.DAOProvider[index.DAO](s))
		//	//	tree.RegisterNodeReceiverServer(srv, engine)
		//	//	tree.RegisterNodeProviderServer(srv, engine)
		//	//	tree.RegisterNodeReceiverStreamServer(srv, engine)
		//	//	tree.RegisterNodeProviderStreamerServer(srv, engine)
		//	//	tree.RegisterSessionIndexerServer(srv, engine)
		//	//
		//	//	object.RegisterResourceCleanerEndpointServer(srv, engine)
		//	//	sync.RegisterSyncEndpointServer(srv, engine)
		//	//
		//	//	return nil
		//	//}),
		//)

		tree.RegisterNodeReceiverServer(srv, engine)
		tree.RegisterNodeProviderServer(srv, engine)
		tree.RegisterNodeReceiverStreamServer(srv, engine)
		tree.RegisterNodeProviderStreamerServer(srv, engine)
		tree.RegisterSessionIndexerServer(srv, engine)

		object.RegisterResourceCleanerEndpointServer(srv, engine)
		sync.RegisterSyncEndpointServer(srv, engine)
		//}
	})
}
