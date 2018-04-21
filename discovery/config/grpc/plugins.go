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

package grpc

import (
	"fmt"
	"strings"

	micro "github.com/micro/go-micro"
	microconfig "github.com/pydio/config-srv/config"
	"github.com/pydio/config-srv/db"
	"github.com/pydio/config-srv/db/mysql"
	"github.com/pydio/config-srv/handler"
	proto "github.com/pydio/config-srv/proto/config"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	config "github.com/pydio/cells/discovery/config"
)

func init() {
	service.NewService(
		service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_CONFIG),
		service.Tag(common.SERVICE_TAG_DISCOVERY),
		service.Description("Main service loading configurations for all other services."),
		service.WithStorage(config.NewDAO),
		service.WithMicro(func(m micro.Service) error {
			ctx := m.Options().Context
			conf := servicecontext.GetConfig(ctx)

			driver, dsn := conf.Database("dsn")

			switch driver {
			case "mysql":
				mysql.Url = strings.Split(dsn, "?")[0]
			default:
				return fmt.Errorf("Could not initiate other config driver")
			}

			if err := microconfig.Init(); err != nil {
				return err
			}

			if err := db.Init(); err != nil {
				return err
			}

			// Register handler
			proto.RegisterConfigHandler(m.Server(), new(handler.Config))

			return nil
		}),
		// service.AfterStart(func(s service.Service) error {
		// 	return utils.SaveConfigs()
		// }),
	)
}
