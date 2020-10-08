/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

	"github.com/micro/go-micro"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	servicecontext "github.com/pydio/cells/common/service/context"
)

var (
	Name        = common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_DATA_OBJECTS
	ChildPrefix = common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_DATA_OBJECTS_
)

func init() {
	plugins.Register(func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.SERVICE_TAG_DATASOURCE),
			service.Description("Starter for different sources objects"),
			service.WithMicro(func(m micro.Service) error {
				runner := service.NewChildrenRunner(m, Name, ChildPrefix)
				m.Init(
					micro.AfterStart(func() error {
						ctx := m.Options().Context
						conf := servicecontext.GetConfig(ctx)
						treeServer := NewTreeHandler(conf)
						runner.StartFromInitialConf(ctx, conf)
						tree.RegisterNodeProviderHandler(m.Server(), treeServer)
						tree.RegisterNodeReceiverHandler(m.Server(), treeServer)
						runner.OnDeleteConfig(onDeleteObjectsConfig)
						return nil
					}))

				//tree.RegisterNodeProviderHandler(m.Server(), treeServer)

				return runner.Watch(m.Options().Context)
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
