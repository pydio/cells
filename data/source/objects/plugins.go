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

// Package objects is in charge of exposing the content of the datasource with the S3 protocol.
package objects

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
)

var (
	Name        = common.ServiceGrpcNamespace_ + common.ServiceDataObjects
	BrowserName = common.ServiceGrpcNamespace_ + common.ServiceDataObjectsPeer
	ChildPrefix = common.ServiceGrpcNamespace_ + common.ServiceDataObjects_
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(BrowserName),
			service.Context(ctx),
			service.Tag(common.ServiceTagDatasource),
			service.Description("Starter for different sources objects"),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
				conf := config.Get("services", BrowserName)
				treeServer := NewTreeHandler(conf)
				tree.RegisterNodeProviderServer(server, treeServer)
				tree.RegisterNodeReceiverServer(server, treeServer)
				return nil
			}),
		)
	})
}

// Manage datasources deletion operations : clean minio server configuration folder
func onDeleteObjectsConfig(ctx context.Context, objectConfigName string) {
	if err := DeleteMinioConfigDir(objectConfigName); err != nil {
		log.Logger(ctx).Error("Could not remove configuration folder for object service " + objectConfigName)
	} else {
		log.Logger(ctx).Info("Removed configuration folder for object service " + objectConfigName)
	}
}
