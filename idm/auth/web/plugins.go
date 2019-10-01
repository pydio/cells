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
	"regexp"
	"time"

	"github.com/coreos/dex/storage/sql"
	"github.com/go-sql-driver/mysql"
	"github.com/micro/go-micro"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/dex"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/service"
	servicecontext "github.com/pydio/cells/common/service/context"
	commonsql "github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/idm/auth"
)

func init() {

	plugins.Register(func() {
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

				setup := func(conf config.Map) error {

					log.Logger(ctx).Debug("Config ", zap.Any("config", conf))
					configDex := conf.Get("dex")

					var c auth.Config
					remarshall, _ := json.Marshal(configDex)
					if err := json.Unmarshal(remarshall, &c); err != nil {
						return fmt.Errorf("error parsing config file %s: %v", configDex, err)
					}

					driver, dsn := conf.Database("dsn")
					switch driver {
					case "mysql":
						dsnConfig, err := mysql.ParseDSN(dsn)
						if err != nil {
							return err
						}

						dao := servicecontext.GetDAO(s.Options().Context)
						version, err := dao.(commonsql.DAO).Version()
						if err != nil {
							return err
						}

						if dsnConfig.Params == nil {
							dsnConfig.Params = make(map[string]string)
						}
						mariaMatched, err := regexp.MatchString("MariaDB", version)
						if err != nil {
							return err
						}
						mysqlMatched, err := regexp.MatchString("^[0-4]\\.[0-9]+\\.[0-9]+$|^5\\.[0-6]\\.[0-9]+$|^5\\.7\\.[0-1][0-9]$|^5\\.7\\.[0-9]$", version)
						if err != nil {
							return err
						}

						if mariaMatched || mysqlMatched {
							dsnConfig.Params["tx_isolation"] = "SERIALIZABLE"
						} else {
							dsnConfig.Params["transaction_isolation"] = "SERIALIZABLE"
						}

						sqlConfig := new(sql.MySQL)
						sqlConfig.DSN = dsnConfig.FormatDSN()

						c.Storage.Config = sqlConfig
					case "sqlite3":
						sqlConfig := new(sql.SQLite3)
						sqlConfig.File = dsn
					}

					router, err := serve(c, ctx, log.Logger(ctx))
					if err != nil {
						return err
					}

					hd := srv.NewHandler(router)

					if err := srv.Handle(hd); err != nil {
						return err
					}

					return nil
				}

				for {
					err := setup(conf)
					if err != nil {
						fmt.Println(err)
						<-time.After(1 * time.Second)
						continue
					}
					break
				}

				// Watching plugins
				if w, err := config.Watch("services", "pydio.grpc.auth"); err != nil {
					return nil, err
				} else {
					go func() {
						defer w.Stop()
						for {
							new, err := w.Next()
							if err != nil {
								break
							}

							log.Logger(ctx).Info("Restarting dex after config change")

							srv.Stop()

							conf := make(config.Map)
							new.Scan(&conf)

							if err := setup(conf); err != nil {
								log.Logger(ctx).Error("Error restarting dex", zap.Error(err))
								continue
							}
							srv.Start()
						}
					}()
				}

				return micro.Server(srv), nil
			}),
		)
	})
}
