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

// Package service creates a service running synchronization between objects and index.
package service

import (
	"context"
	"os"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/object"
	protosync "github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/data/source/sync"
	grpc_sync "github.com/pydio/cells/v4/data/source/sync/grpc"
)

func init() {

	runtime.Register("datasource-index", func(ctx context.Context) {
		newService(ctx, os.Getenv("DATASOURCE"))
	})
}

func newService(ctx context.Context, datasource string) {
	var sOptions []service.ServiceOption
	srvName := common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + datasource
	sOptions = append(sOptions,
		service.Name(srvName),
		service.Context(ctx),
		service.Tag(common.ServiceTagDatasource),
		service.Description("Synchronization service between objects and index for a given datasource"),
		service.Source(datasource),
		service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {

			syncHandler := grpc_sync.NewHandler(ctx, datasource)
			var startErr error
			go func() {
				startErr = syncHandler.InitAndStart()
			}()
			if startErr != nil {
				return startErr
			}

			endpoint := &grpc_sync.Endpoint{PresetSync: syncHandler}
			tree.RegisterNodeProviderServer(srv, endpoint)
			tree.RegisterNodeReceiverServer(srv, endpoint)
			tree.RegisterNodeChangesReceiverStreamerServer(srv, endpoint)
			protosync.RegisterSyncEndpointServer(srv, endpoint)
			object.RegisterDataSourceEndpointServer(srv, endpoint)
			object.RegisterResourceCleanerEndpointServer(srv, endpoint)

			return nil
		}),
	)

	// Todo Ctx should be tenant-ized
	if storage := WithStorage(ctx, datasource); storage != nil {
		sOptions = append(sOptions, storage)
	}
	service.NewService(sOptions...)

}

func WithStorage(ctx context.Context, source string) service.ServiceOption {
	mapperType := config.Get(ctx, "services", common.ServiceGrpcNamespace_+common.ServiceDataSync_+source, "StorageConfiguration", "checksumMapper").String()
	switch mapperType {
	case "dao":
		// todo define prefix data_sync_{SOURCE}
		return service.WithStorageDrivers(sync.Drivers...)
	}
	return nil
}
