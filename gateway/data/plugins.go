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

// Package gateway spins an S3 gateway for serving files using the Amazon S3 protocol.
package gateway

import (
	"context"
	"fmt"
	"net/http/httputil"
	"net/url"

	micro "github.com/micro/go-micro"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/data/source/objects"
	minio "github.com/pydio/minio-srv/cmd"
)

func init() {

	service.NewService(
		service.Name(common.SERVICE_GATEWAY_DATA),
		service.Tag(common.SERVICE_TAG_GATEWAY),
		service.RouterDependencies(),
		service.Description("S3 Gateway to tree service"),
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

			var certFile, keyFile string
			if config.Get("cert", "http", "ssl").Bool(false) {
				certFile = config.Get("cert", "http", "certFile").String("")
				keyFile = config.Get("cert", "http", "keyFile").String("")
			}

			scheme := "http"
			host := "127.0.0.1"
			port := utils.GetAvailablePort()
			url, _ := url.Parse(fmt.Sprintf("%s://%s:%d", scheme, host, port))

			gatewayDir, err := objects.CreateMinioConfigFile("gateway", "gateway", "gatewaysecret")
			if err != nil {
				return nil, err
			}

			go minio.NewPydioGateway(ctx, fmt.Sprintf(":%d", port), gatewayDir, certFile, keyFile)

			proxy := httputil.NewSingleHostReverseProxy(url)

			hd := srv.NewHandler(proxy)

			if err := srv.Handle(hd); err != nil {
				return nil, err
			}

			return micro.Server(srv), nil
		}),
	)
}
