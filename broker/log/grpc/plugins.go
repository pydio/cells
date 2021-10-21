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

	"github.com/micro/go-micro"

	"github.com/pydio/cells/broker/log"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/plugins"
	proto "github.com/pydio/cells/common/proto/log"
	"github.com/pydio/cells/common/proto/sync"
	"github.com/pydio/cells/common/service"
	servicecontext "github.com/pydio/cells/common/service/context"
)

func init() {
	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceLog),
			service.Context(ctx),
			service.Tag(common.ServiceTagBroker),
			service.Description("Syslog index store"),
			service.Unique(true),
			service.WithMicro(func(m micro.Service) error {
				serviceDir, e := config.ServiceDataDir(common.ServiceGrpcNamespace_ + common.ServiceLog)
				if e != nil {
					return e
				}
				rotationSize := log.DefaultRotationSize
				if r := servicecontext.GetConfig(m.Options().Context).Val("bleveRotationSize").Int(); r > 0 {
					rotationSize = int64(r)
				}
				repo, err := log.NewSyslogServer(path.Join(serviceDir, "syslog.bleve"), "sysLog", rotationSize)
				if err != nil {
					return err
				}

				handler := &Handler{
					Repo: repo,
				}

				proto.RegisterLogRecorderHandler(m.Options().Server, handler)
				sync.RegisterSyncEndpointHandler(m.Options().Server, handler)

				m.Init(micro.BeforeStop(func() error {
					repo.Close()
					return nil
				}))

				return nil
			}),
		)
	})
}
