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

	"github.com/pydio/cells/common/proto/sync"

	"github.com/micro/go-micro"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/data/source/index"
)

func init() {

	plugins.Register("main", func(ctx context.Context) {

		sources := config.SourceNamesForDataServices(common.ServiceDataIndex)

		for _, source := range sources {

			name := common.ServiceDataIndex_ + source

			service.NewService(
				service.Name(common.ServiceGrpcNamespace_+name),
				service.Context(ctx),
				service.Tag(common.ServiceTagDatasource),
				service.Description("Datasource indexation service"),
				service.Source(source),
				service.Fork(true),
				service.AutoStart(false),
				service.Unique(true),
				service.WithStorage(index.NewDAO, func(s service.Service) string {
					// Returning a prefix for the dao
					return strings.Replace(name, ".", "_", -1)
				}),
				service.WithMicro(func(m micro.Service) error {

					server := m.Server()
					sourceOpt := server.Options().Metadata["source"]
					dsObject, e := config.GetSourceInfoByName(sourceOpt)
					if e != nil {
						return fmt.Errorf("cannot find datasource configuration for " + sourceOpt)
					}
					engine := NewTreeServer(dsObject)
					tree.RegisterNodeReceiverHandler(m.Options().Server, engine)
					tree.RegisterNodeProviderHandler(m.Options().Server, engine)
					tree.RegisterNodeReceiverStreamHandler(m.Options().Server, engine)
					tree.RegisterNodeProviderStreamerHandler(m.Options().Server, engine)
					tree.RegisterSessionIndexerHandler(m.Options().Server, engine)
					object.RegisterResourceCleanerEndpointHandler(m.Options().Server, engine)
					sync.RegisterSyncEndpointHandler(m.Options().Server, engine)

					return nil
				}),
			)
		}
	})
}
