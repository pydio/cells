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

// Package proxy loads a Caddy service to provide a unique access to all services and serve the PHP frontend
package proxy

import (
	"context"
	"fmt"

	"github.com/mholt/caddy"
	"github.com/mholt/caddy/caddyhttp/httpserver"
	"github.com/mholt/caddy/caddytls"

	_ "github.com/micro/go-plugins/client/grpc"
	_ "github.com/micro/go-plugins/server/grpc"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/service"
)

func init() {

	service.NewService(
		service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_GATEWAY_PROXY),
		service.Tag(common.SERVICE_TAG_GATEWAY),
		service.Description("Main HTTP proxy for exposing a unique address to the world"),
		service.WithGeneric(func(ctx context.Context, cancel context.CancelFunc) (service.Runner, service.Checker, service.Stopper, error) {

			caddy.AppName = common.PackageLabel
			caddy.AppVersion = common.Version().String()
			httpserver.HTTP2 = false

			conf, e := config.LoadCaddyConf()
			if e != nil {
				return nil, nil, nil, e
			}

			e = config.InitCaddyFile(config.CaddyTemplate, conf)
			if e != nil {
				return nil, nil, nil, e
			}

			certEmail := config.Get("cert", "proxy", "email").String("")
			if certEmail != "" {
				caddytls.Agreed = true
				caURL := config.Get("cert", "proxy", "caUrl").String("")
				fmt.Println("### Configuring LE SSL, CA URL:", caURL)
				caddytls.DefaultCAUrl = caURL
			}

			// now load inside caddy
			caddyfile, err := caddy.LoadCaddyfile("http")
			if err != nil {
				return nil, nil, nil, err
			}

			// start caddy server
			instance, err := caddy.Start(caddyfile)
			if err != nil {
				return nil, nil, nil, err
			}

			return service.RunnerFunc(func() error {
					instance.Wait()
					return nil
				}), service.CheckerFunc(func() error {
					if len(instance.Servers()) == 0 {
						return fmt.Errorf("No servers have been started")
					}
					return nil
				}), service.StopperFunc(func() error {
					instance.Stop()
					return nil
				}), nil
		}),
	)
}
