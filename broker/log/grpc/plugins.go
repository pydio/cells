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

// Package grpc provides a Pydio GRPC service for querying the logs
package grpc

import (
	"context"
	"path/filepath"
	
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/broker/log"
	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/plugins"
	proto "github.com/pydio/cells/v4/common/proto/log"
	"github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

const (
	ServiceName = common.ServiceGrpcNamespace_ + common.ServiceLog
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(ServiceName),
			service.Context(ctx),
			service.Tag(common.ServiceTagBroker),
			service.Description("Syslog index store"),
			service.WithIndexer(log.NewDAO,
				service.WithStoragePrefix("syslog"),
				service.WithStorageDefaultDriver(func() (string, string) {
					return dao.BleveDriver, filepath.Join(config.MustServiceDataDir(ServiceName), "syslog.bleve")
				}),
			),
			service.Unique(true),
			service.WithGRPC(func(c context.Context, server *grpc.Server) error {
				dao := servicecontext.GetIndexer(c).(dao.IndexDAO)
				repo, err := log.NewIndexService(dao)
				if err != nil {
					return err
				}

				handler := &Handler{
					Repo:        repo,
					HandlerName: common.ServiceGrpcNamespace_ + common.ServiceLog,
				}
				proto.RegisterLogRecorderEnhancedServer(server, handler)
				sync.RegisterSyncEndpointEnhancedServer(server, handler)

				go func() {
					<-c.Done()
					repo.Close()
				}()

				return nil
			}),
		)
	})
}
