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

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/service"
)

var (
	Name        = common.ServiceGrpcNamespace_ + common.ServiceDataSync
	ChildPrefix = common.ServiceGrpcNamespace_ + common.ServiceDataSync_
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagDatasource),
			service.Description("Starter for data sources synchronizations"),
			service.WithMicroChildrenRunner(Name, ChildPrefix, true, onDataSourceDelete),
		)
	})
}

// Manage datasources deletion operations : clean index tables
func onDataSourceDelete(ctx context.Context, deletedSource string) {

	// TODO - find a way to delete datasources - surely a config watch

	log.Logger(ctx).Info("Sync = Send Event Server-wide for " + deletedSource)
	cl := defaults.NewClient()
	cl.Publish(ctx, cl.NewPublication(common.TopicDatasourceEvent, &object.DataSourceEvent{
		Type: object.DataSourceEvent_DELETE,
		Name: deletedSource,
	}))

}
