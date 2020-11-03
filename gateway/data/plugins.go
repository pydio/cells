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
	"os"

	"github.com/micro/go-micro/server"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/utils/net"
	minio "github.com/pydio/minio-srv/cmd"
	"github.com/pydio/minio-srv/cmd/gateway/pydio"
)

type logger struct {
	ctx context.Context
}

func (l *logger) Info(entry interface{}) {
	log.Logger(l.ctx).Info("Minio Gateway", zap.Any("data", entry))
}

func (l *logger) Error(entry interface{}) {
	log.Logger(l.ctx).Error("Minio Gateway", zap.Any("data", entry))
}

func (l *logger) Audit(entry interface{}) {
	log.Auditer(l.ctx).Info("Minio Gateway", zap.Any("data", entry))
}

func init() {

	plugins.Register(func(ctx context.Context) {
		port := net.GetAvailablePort()
		service.NewService(
			service.Name(common.SERVICE_GATEWAY_DATA),
			service.Context(ctx),
			service.Tag(common.SERVICE_TAG_GATEWAY),
			// service.RouterDependencies(),
			service.Description("S3 Gateway to tree service"),
			service.Port(fmt.Sprintf("%d", port)),
			service.WithGeneric(func(opts ...server.Option) server.Server {
				var certFile, keyFile string
				if config.Get("cert", "http", "ssl").Bool() {
					certFile = config.Get("cert", "http", "certFile").String()
					keyFile = config.Get("cert", "http", "keyFile").String()
				}

				srv := &gatewayDataServer{
					ctx:      ctx,
					port:     port,
					certFile: certFile,
					keyFile:  keyFile,
				}

				return service.NewGenericServer(srv, opts...)
			}),
		)
	})
}

type gatewayDataServer struct {
	ctx      context.Context
	cancel   context.CancelFunc
	port     int
	certFile string
	keyFile  string
}

func (g *gatewayDataServer) Start() error {
	os.Setenv("MINIO_BROWSER", "off")
	gw := &pydio.Pydio{}
	console := &logger{ctx: g.ctx}
	ctx, cancel := context.WithCancel(g.ctx)
	g.cancel = cancel

	go minio.StartPydioGateway(ctx, gw, fmt.Sprintf(":%d", g.port), "gateway", "gatewaysecret", console, g.certFile, g.keyFile)

	return nil
}

func (g *gatewayDataServer) Stop() error {
	if g.cancel != nil {
		g.cancel()
	}

	return nil
}
