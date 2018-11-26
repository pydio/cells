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

// Package grpc wraps a Minio server for exposing the content of the datasource with the S3 protocol.
package grpc

import (
	"encoding/json"

	"github.com/micro/go-micro"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/utils"
)

func init() {

	var sources []string
	str := config.Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_OBJECTS, "sources").Bytes()

	if err := json.Unmarshal(str, &sources); err != nil {
		log.Fatal("Error reading config", zap.Error(err))
	}

	for _, datasource := range sources {

		service.NewService(
			service.Name(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_OBJECTS_+datasource),
			service.Tag(common.SERVICE_TAG_DATASOURCE),
			service.Description("S3 Object service for a given datasource"),
			service.Source(datasource),
			service.Fork(true),
			service.WithMicro(func(m micro.Service) error {
				s := m.Options().Server
				serviceName := s.Options().Metadata["source"]

				engine := &ObjectHandler{}

				m.Init(micro.AfterStart(func() error {
					ctx := m.Options().Context
					log.Logger(ctx).Debug("AfterStart for Object service " + serviceName)
					var conf *object.MinioConfig
					if err := servicecontext.ScanConfig(ctx, &conf); err != nil {
						return err
					}
					if ip, e := utils.GetExternalIP(); e != nil {
						conf.RunningHost = "127.0.0.1"
					} else {
						conf.RunningHost = ip.String()
					}
					// Not sure using real ip is working right now
					conf.RunningHost = "127.0.0.1"
					conf.RunningSecure = false

					engine.Config = conf
					log.Logger(ctx).Debug("Now starting minio server (" + serviceName + ")")
					go engine.StartMinioServer(ctx, serviceName)
					object.RegisterObjectsEndpointHandler(s, engine)

					return nil
				}))

				return nil
			}),
		)
	}
}
