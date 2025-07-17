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

// Package service exposes the document store api in GRPC
package service

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	proto "github.com/pydio/cells/v5/common/proto/docstore"
	"github.com/pydio/cells/v5/common/proto/sync"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/data/docstore"
	grpc2 "github.com/pydio/cells/v5/data/docstore/grpc"
)

var (
	Name = common.ServiceGrpcNamespace_ + common.ServiceDocStore
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		handler := &grpc2.Handler{}

		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagData),
			service.Description("Generic document store"),
			service.WithStorageDrivers(docstore.Drivers),
			service.WithStorageMigrator(docstore.Migrate),
			service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
				proto.RegisterDocStoreServer(srv, handler)
				sync.RegisterSyncEndpointServer(srv, handler)

				return nil
			}),
		)

	})
}
