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

	"github.com/micro/cli"
	"github.com/micro/go-micro"
	"github.com/micro/go-micro/cmd"
	"github.com/micro/go-micro/selector"
	"github.com/micro/go-micro/selector/cache"
	"github.com/micro/go-micro/server"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/micro/server/grpc"
	"github.com/pydio/cells/common/registry"
	servicecontext "github.com/pydio/cells/common/service/context"
	proto "github.com/pydio/cells/common/service/proto"
)

var (
	slctr   = cache.NewSelector(selector.Registry(defaults.Registry()))
	command = &Cmd{}
)

// Cmd definition to pass as default for a micro server
type Cmd struct{}

// App for default cmd
func (c *Cmd) App() *cli.App {
	return nil
}

// Init for default cmd
func (c *Cmd) Init(opts ...cmd.Option) error {
	return nil
}

// Options for default cmd
func (c *Cmd) Options() cmd.Options {
	return cmd.Options{}
}

// Micro service option
func Micro(m micro.Service) ServiceOption {
	return func(o *ServiceOptions) {
		o.Micro = m
	}
}

// 添加一个 go-micro service handler 当前服务
func WithMicro(f func(micro.Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.Version = common.Version().String()

		o.MicroInit = func(s Service) error {

			svc := micro.NewService(
				micro.Version(o.Version),
				micro.Cmd(command),
			)

			name := s.Name()
			ctx := servicecontext.WithServiceName(s.Options().Context, name)
			var srvOpts []server.Option
			if o.Port != "" {
				srvOpts = append(srvOpts, server.Address(":"+o.Port))
			}
			if o.TLSConfig != nil {
				srvOpts = append(srvOpts, grpc.AuthTLS(o.TLSConfig))
			}

			srvOpts = append(srvOpts, server.Version(o.Version))

			ctx, cancel := context.WithCancel(ctx)

			srv := defaults.NewServer(srvOpts...)
			svc.Init(
				micro.Client(defaults.NewClient()),
				micro.Server(srv),
				micro.Registry(defaults.Registry()),
				micro.RegisterTTL(time.Second*30),
				micro.RegisterInterval(time.Second*10),
				// micro.RegisterTTL(10*time.Minute),
				// micro.RegisterInterval(5*time.Minute),
				micro.Transport(defaults.Transport()),
				micro.Broker(defaults.Broker()),
			)

			meta := registry.BuildServiceMeta()
			meta["description"] = o.Description
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
			micro.RegisterSubscriber(common.TopicServiceStop, srv, &StopHandler{s})

			s.Init(
				Micro(svc),
				Cancel(cancel),
			)

			return nil
		}

	}
}
