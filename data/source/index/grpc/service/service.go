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

// Package service provides a pydio GRPC service for CRUD-ing the datasource index.
//
// It uses an SQL-based persistence layer for storing all nodes in the nested-set format in DB.
package service

import (
	"context"
	"fmt"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/data/source/index"
	grpc2 "github.com/pydio/cells/v4/data/source/index/grpc"
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		// Retrieve server from the runtime - TODO
		sources := config.SourceNamesForDataServices(ctx, common.ServiceDataIndex)
		for _, source := range sources {
			name := common.ServiceGrpcNamespace_ + common.ServiceDataIndex_ + source

			service.NewService(
				service.Name(name),
				service.Context(ctx),
				service.Tag(common.ServiceTagDatasource),
				service.Description("Datasource indexation service"),
				service.Source(source),
				service.WithStorageDrivers(index.Drivers...),
				service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
					dsObject, e := config.GetSourceInfoByName(ctx, name)
					if e != nil {
						return fmt.Errorf("cannot find datasource configuration for " + name)
					}
					engine := grpc2.NewTreeServer(dsObject, name)
					tree.RegisterNodeReceiverServer(srv, engine)
					tree.RegisterNodeProviderServer(srv, engine)
					tree.RegisterNodeReceiverStreamServer(srv, engine)
					tree.RegisterNodeProviderStreamerServer(srv, engine)
					tree.RegisterSessionIndexerServer(srv, engine)

					object.RegisterResourceCleanerEndpointServer(srv, engine)
					sync.RegisterSyncEndpointServer(srv, engine)

					return nil
				}),
			)
		}
	})
}
