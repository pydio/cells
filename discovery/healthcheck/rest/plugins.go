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

// Package wopi serves files using the WOPI protocol.
package rest

import (
	"context"
	"fmt"

	micro "github.com/micro/go-micro"
	"github.com/micro/go-micro/server"
	"github.com/spf13/viper"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/views"
)

var (
	viewsRouter *views.Router
)

func init() {
	plugins.Register(func() {

		port := viper.Get("healthcheck")
		if port == "" {
			return
		}

		service.NewService(
			service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_HEALTHCHECK),
			service.Tag(common.SERVICE_TAG_DISCOVERY),
			service.RouterDependencies(),
			service.Port(fmt.Sprintf("%d", port)),
			service.Description("Healthcheck for services"),
			service.WithGeneric(func(ctx context.Context, cancel context.CancelFunc) (service.Runner, service.Checker, service.Stopper, error) {
				return service.RunnerFunc(func() error {
						return nil
					}), service.CheckerFunc(func() error {
						return nil
					}), service.StopperFunc(func() error {
						return nil
					}), nil
			}, func(s service.Service) (micro.Option, error) {
				srv := defaults.NewHTTPServer(server.Address(":" + s.Options().Port))

				router := NewRouter()
				hd := srv.NewHandler(router)

				err := srv.Handle(hd)
				if err != nil {
					return nil, err
				}

				return micro.Server(srv), nil
			}),
		)
	})
}
