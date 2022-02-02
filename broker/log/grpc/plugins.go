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
	"path"

	"github.com/pydio/cells/v4/broker/log"
	"github.com/pydio/cells/v4/common/config"
	proto "github.com/pydio/cells/v4/common/proto/log"
	"github.com/pydio/cells/v4/common/proto/sync"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/plugins"
	"github.com/pydio/cells/v4/common/service"
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceLog),
			service.Context(ctx),
			service.Tag(common.ServiceTagBroker),
			service.Description("Syslog index store"),
			service.Unique(true),
			service.WithGRPC(func(c context.Context, server *grpc.Server) error {
				conf := config.Get("services", common.ServiceGrpcNamespace_+common.ServiceLog)

				serviceDir, e := config.ServiceDataDir(common.ServiceGrpcNamespace_ + common.ServiceLog)
				if e != nil {
					return e
				}
				rotationSize := log.DefaultRotationSize
				if r := conf.Val("bleveRotationSize").Int(); r > 0 {
					rotationSize = int64(r)
				}
				repo, err := log.NewSyslogServer(path.Join(serviceDir, "syslog.bleve"), "sysLog", rotationSize)
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
