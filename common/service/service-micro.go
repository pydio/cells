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

package service

import (
	"context"
	"time"

	"github.com/micro/go-micro"
	"github.com/micro/go-micro/server"
	"github.com/micro/go-plugins/server/grpc"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/registry"
	servicecontext "github.com/pydio/cells/common/service/context"
	proto "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/x/configx"
)

func Micro(m micro.Service) ServiceOption {
	return func(o *ServiceOptions) {
		o.Micro = m
	}
}

// WithMicro adds a micro service handler to the current service
func WithMicro(f func(micro.Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.Version = common.Version().String()
		// o.Micro = micro.NewService()

		o.MicroInit = func(s Service) error {
			svc := micro.NewService()

			name := s.Name()
			ctx := servicecontext.WithServiceName(s.Options().Context, name)
			var srvOpts []server.Option
			if o.Port != "" {
				srvOpts = append(srvOpts, server.Address(":"+o.Port))
			}
			if o.TLSConfig != nil {
				srvOpts = append(srvOpts, grpc.AuthTLS(o.TLSConfig))
			}
			srv := defaults.NewServer(srvOpts...)
			svc.Init(
				micro.Client(defaults.NewClient()),
				micro.Server(srv),
				micro.Registry(defaults.Registry()),
				micro.RegisterTTL(time.Second*30),
				micro.RegisterInterval(time.Second*10),
				micro.Transport(defaults.Transport()),
				micro.Broker(defaults.Broker()),
			)

			meta := registry.BuildServiceMeta()
			if s.Options().Source != "" {
				meta["source"] = s.Options().Source
			}

			// context is always added last - so that there is no override
			svc.Init(
				micro.Context(ctx),
				micro.Name(name),
				micro.WrapClient(servicecontext.SpanClientWrapper),
				micro.WrapHandler(servicecontext.SpanHandlerWrapper),
				micro.WrapSubscriber(servicecontext.SpanSubscriberWrapper),
				micro.Metadata(meta),
				micro.BeforeStart(func() error {
					return f(svc)
				}),
				micro.AfterStart(func() error {
					log.Logger(ctx).Info("started")

					return nil
				}),
				micro.BeforeStop(func() error {
					log.Logger(ctx).Info("stopping")

					return nil
				}),
				micro.AfterStart(func() error {
					return UpdateServiceVersion(s)
				}),
			)

			// newTracer(name, &options)
			servicecontext.NewMetricsWrapper(svc)
			newBackoffer(svc)
			newConfigProvider(svc)
			newDBProvider(svc)
			newLogProvider(svc)
			// newTraceProvider(s.Options().Micro) // DISABLED FOR NOW DUE TO CONFLICT WITH THE MICRO GO OS
			newClaimsProvider(svc)

			proto.RegisterServiceHandler(srv, &StatusHandler{s.Address()})

			micro.RegisterSubscriber(common.TOPIC_SERVICE_STOP, srv, &StopHandler{s})

			s.Init(
				Micro(svc),
				Watch(func(v configx.Values) {
					// Setting context
					ctx, cancel := context.WithCancel(context.Background())
					ctx = servicecontext.WithServiceName(ctx, name)

					if s.IsGRPC() {
						ctx = servicecontext.WithServiceColor(ctx, servicecontext.ServiceColorGrpc)
					} else if s.IsREST() {
						ctx = servicecontext.WithServiceColor(ctx, servicecontext.ServiceColorRest)

						// TODO : adding web services automatic dependencies to auth, this should be done in each service instead
						if s.Options().Name != common.SERVICE_REST_NAMESPACE_+common.SERVICE_INSTALL {
							s.Init(WithWebAuth())
						}
					} else {
						ctx = servicecontext.WithServiceColor(ctx, servicecontext.ServiceColorOther)
					}
					ctx = servicecontext.WithConfig(ctx, v)

					s.Stop()
					s.Init(
						Context(ctx),
						Cancel(cancel),
					)
					s.Start()
				}),
			)

			return nil
		}

	}
}
