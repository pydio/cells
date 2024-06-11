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

// Package sync ties the "objects" and "index" together
package sync

import (
	"context"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/telemetry/log"
)

var (
	Name            = common.ServiceGrpcNamespace_ + common.ServiceDataSync
	ChildPrefix     = common.ServiceGrpcNamespace_ + common.ServiceDataSync_
	SecondaryPrefix = common.ServiceGrpcNamespace_ + common.ServiceDataIndex_
)

func init() {
	runtime.RegisterPreRun(func(rt runtime.Runtime) {
		// If sync is excluded but not index, modify ChildrenRunner to start indexes services
		idx := runtime.IsRequired(common.ServiceGrpcNamespace_ + common.ServiceDataIndex)
		sync := runtime.IsRequired(common.ServiceGrpcNamespace_ + common.ServiceDataSync)
		if idx && !sync {
			Name = common.ServiceGrpcNamespace_ + common.ServiceDataIndex
			ChildPrefix = common.ServiceGrpcNamespace_ + common.ServiceDataIndex_
			SecondaryPrefix = ""
		}
	})

	//runtime.Register("main", func(ctx context.Context) {
	//	service.NewService(
	//		append([]service.ServiceOption{
	//			service.Name(Name),
	//			service.Context(ctx),
	//			service.Tag(common.ServiceTagDatasource),
	//			service.Description("Starter for data sources synchronizations"),
	//		}, service.WithChildrenRunner(Name, ChildPrefix, true, onDataSourceDelete, SecondaryPrefix)...)...,
	//	)
	//})
}

// Manage datasources deletion operations : clean index tables
func onDataSourceDelete(ctx context.Context, deletedSource string) {

	log.Logger(ctx).Info("Sync = Send Event Server-wide for " + deletedSource)
	broker.MustPublish(ctx, common.TopicDatasourceEvent, &object.DataSourceEvent{
		Type: object.DataSourceEvent_DELETE,
		Name: deletedSource,
	})

}
