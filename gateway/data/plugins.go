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

// Package gateway spins an S3 gateway for serving files using the Amazon S3 protocol
package gateway

import (
	"context"
	"fmt"

	"github.com/pydio/cells/common"
	config2 "github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/data/source/objects"
	minio "github.com/pydio/minio-srv/cmd"
)

func init() {
	service.NewService(
		service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_GATEWAY_DATA),
		service.Tag(common.SERVICE_TAG_GATEWAY),
		service.RouterDependencies(),
		service.Description("S3 Gateway to tree service"),
		service.WithGeneric(func(ctx context.Context, cancel context.CancelFunc) (service.Runner, service.Checker, service.Stopper, error) {
			config := servicecontext.GetConfig(ctx)

			port := config.Int("port", 9020)
			var certFile, keyFile string
			if config2.Get("cert", "http", "ssl").Bool(false) {
				certFile = config2.Get("cert", "http", "certFile").String("")
				keyFile = config2.Get("cert", "http", "keyFile").String("")
			}

			gatewayDir, err := objects.CreateMinioConfigFile("gateway", "gateway", "gatewaysecret")
			if err != nil {
				return nil, nil, nil, err
			}

			return service.RunnerFunc(func() error {
					minio.NewPydioGateway(ctx, fmt.Sprintf(":%d", port), gatewayDir, certFile, keyFile)
					return nil
				}), service.CheckerFunc(func() error {
					return nil
				}), service.StopperFunc(func() error {
					return nil
				}), nil
		}),
	)
}
