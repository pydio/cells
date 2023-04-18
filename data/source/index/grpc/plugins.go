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
	"strings"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/data/source/index"
)

func init() {

	runtime.Register("main", func(ctx context.Context) {

		sources := config.SourceNamesForDataServices(common.ServiceDataIndex)

		for _, source := range sources {

			name := common.ServiceGrpcNamespace_ + common.ServiceDataIndex_ + source
			sourceOpt := source

			service.NewService(
				service.Name(name),
				service.Context(ctx),
				//service.WithLogger(log.Logger(ctx)),
				service.Tag(common.ServiceTagDatasource),
				service.Description("Datasource indexation service"),
				service.Source(source),
				// service.Fork(true),
				//service.AutoStart(false),
				//service.Unique(true),
				service.WithStorage(index.NewDAO, service.WithStoragePrefix(func(o *service.ServiceOptions) string {
					// Returning a prefix for the dao
					return strings.Replace(strings.TrimPrefix(o.Name, common.ServiceGrpcNamespace_), ".", "_", -1)
				})),
				service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {

					dsObject, e := config.GetSourceInfoByName(sourceOpt)
					if e != nil {
						return fmt.Errorf("cannot find datasource configuration for " + sourceOpt)
					}
					engine := NewTreeServer(dsObject, name, servicecontext.GetDAO(ctx).(index.DAO))
					tree.RegisterNodeReceiverEnhancedServer(srv, engine)
					tree.RegisterNodeProviderEnhancedServer(srv, engine)
					tree.RegisterNodeReceiverStreamEnhancedServer(srv, engine)
					tree.RegisterNodeProviderStreamerEnhancedServer(srv, engine)
					tree.RegisterSessionIndexerEnhancedServer(srv, engine)

					object.RegisterResourceCleanerEndpointEnhancedServer(srv, engine)
					sync.RegisterSyncEndpointEnhancedServer(srv, engine)

					return nil
				}),
			)
		}
	})
}
