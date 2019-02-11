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

// Package grpc provides a Pydio GRPC service for querying the logs
package grpc

import (
	"path"

	micro "github.com/micro/go-micro"
	"github.com/pydio/cells/common/plugins"

	"github.com/pydio/cells/broker/log"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	proto "github.com/pydio/cells/common/proto/log"
	"github.com/pydio/cells/common/service"
)

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_LOG),
			service.Tag(common.SERVICE_TAG_BROKER),
			service.Description("Syslog index store"),
			service.WithMicro(func(m micro.Service) error {
				serviceDir, e := config.ServiceDataDir(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_LOG)
				if e != nil {
					return e
				}
				repo, err := log.NewSyslogServer(path.Join(serviceDir, "syslog.bleve"), "sysLog")
				if err != nil {
					return err
				}

				handler := &Handler{
					Repo: repo,
				}

				proto.RegisterLogRecorderHandler(m.Options().Server, handler)

				return nil
			}),
		)
	})
}
