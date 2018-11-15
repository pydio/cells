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

	"github.com/pydio/cells/common"
	config2 "github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	minio "github.com/pydio/minio-srv/cmd"
	"github.com/pydio/minio-srv/cmd/gateway/pydio"
	"go.uber.org/zap"
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
	service.NewService(
		service.Name(common.SERVICE_GATEWAY_DATA),
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

			ctx, cancel = context.WithCancel(ctx)

			return service.RunnerFunc(func() error {
					os.Setenv("MINIO_BROWSER", "off")
					gw := &pydio.Pydio{}
					console := &logger{ctx: ctx}
					minio.StartPydioGateway(ctx, gw, fmt.Sprintf(":%d", port), "gateway", "gatewaysecret", console, certFile, keyFile)
					return nil
				}), service.CheckerFunc(func() error {
					return nil
				}), service.StopperFunc(func() error {
					cancel()
					return nil
				}), nil
		}),
	)
}
