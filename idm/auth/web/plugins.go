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

// Package grpc spins an OpenID Connect Server using the coreos/dex implementation
package grpc

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/coreos/dex/storage/sql"
	"github.com/micro/go-micro"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/dex"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/idm/auth"
)

func init() {

	dex.RegisterWrapperConnectorMiddleware("Login", dex.WrapWithIdmUser)
	dex.RegisterWrapperConnectorMiddleware("Login", dex.WrapWithUserLocks)
	dex.RegisterWrapperConnectorMiddleware("Login", dex.WrapWithPolicyCheck)
	dex.RegisterWrapperConnectorMiddleware("Login", dex.WrapWithIdentity)

	dex.RegisterWrapperConnectorMiddleware("Refresh", dex.WrapWithIdmUser)
	dex.RegisterWrapperConnectorMiddleware("Refresh", dex.WrapWithUserLocks)
	dex.RegisterWrapperConnectorMiddleware("Refresh", dex.WrapWithPolicyCheck)
	dex.RegisterWrapperConnectorMiddleware("Refresh", dex.WrapWithIdentity)

	service.NewService(
		service.Name(common.SERVICE_WEB_NAMESPACE_+common.SERVICE_AUTH),
		service.Tag(common.SERVICE_TAG_IDM),
		service.WithStorage(auth.NewDAO, "dex_"),
		service.Description("Authentication Service : JWT provider and token revocation"),
		service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, []string{}),
		service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_POLICY, []string{}),
		service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, []string{}),
		service.WithGeneric(func(ctx context.Context, cancel context.CancelFunc) (service.Runner, service.Checker, service.Stopper, error) {
			return service.RunnerFunc(func() error {
					return nil
				}), service.CheckerFunc(func() error {
					return nil
				}), service.StopperFunc(func() error {
					return nil
				}), nil
		}, func(s service.Service) (micro.Option, error) {
			srv := defaults.NewHTTPServer()

			// INIT DEX CONFIG
			ctx := s.Options().Context

			conf := make(config.Map)
			config.Get("services", "pydio.grpc.auth").Scan(&conf)

			log.Logger(ctx).Debug("Config ", zap.Any("config", conf))
			configDex := conf.Get("dex")
			var c auth.Config
			remarshall, _ := json.Marshal(configDex)
			if err := json.Unmarshal(remarshall, &c); err != nil {
				return nil, fmt.Errorf("error parsing config file %s: %v", configDex, err)
			}

			driver, dsn := conf.Database("dsn")

			switch driver {
			case "mysql":
				sqlConfig := new(sql.MySQL)
				sqlConfig.DSN = dsn
				c.Storage.Config = sqlConfig
			case "sqlite3":
				sqlConfig := new(sql.SQLite3)
				sqlConfig.File = dsn
			}

			router, err := serve(c, ctx, log.Logger(ctx))
			if err != nil {
				return nil, err
			}

			hd := srv.NewHandler(router)

			if err := srv.Handle(hd); err != nil {
				return nil, err
			}

			return micro.Server(srv), nil
		}),
	)
}
