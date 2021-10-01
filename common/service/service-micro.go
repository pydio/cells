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
	"os"
	"strconv"

	"github.com/micro/cli"
	micro "github.com/micro/go-micro"
	"github.com/micro/go-micro/cmd"
	"github.com/micro/go-micro/selector"
	"github.com/micro/go-micro/selector/cache"
	server "github.com/micro/go-micro/server"
	limiter "github.com/micro/go-plugins/wrapper/ratelimiter/uber"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	cserver "github.com/pydio/cells/common/micro/server"
	"github.com/pydio/cells/common/micro/server/grpc"
	"github.com/pydio/cells/common/registry"
	servicecontext "github.com/pydio/cells/common/service/context"
	proto "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/net"
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

// WithMicro adds a micro service handler to the current service
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
				srvOpts = append(srvOpts, server.Address(net.DefaultAdvertiseAddress+":"+o.Port))
			}
			if o.TLSConfig != nil {
				srvOpts = append(srvOpts, grpc.AuthTLS(o.TLSConfig))
			}

			srvOpts = append(srvOpts,
				server.Id(o.ID),
				server.Version(o.Version),
				server.RegisterTTL(DefaultRegisterTTL),
			)

			srv := defaults.NewServer(srvOpts...)
			srv = cserver.NewServerWithStopOnRegisterError(srv)
			svc.Init(
				micro.Client(defaults.NewClient()),
				micro.Server(srv),
				micro.Registry(defaults.Registry()),
				micro.RegisterTTL(DefaultRegisterTTL),
				micro.RegisterInterval(randomTimeout(DefaultRegisterTTL/2)),
				micro.Transport(defaults.Transport()),
				micro.Broker(defaults.Broker()),
			)

			meta := registry.BuildServiceMeta()
			meta["description"] = o.Description
			if s.Options().Source != "" {
				meta["source"] = s.Options().Source
			}

			opts := []micro.Option{
				micro.Context(ctx),
				micro.Name(name),
				micro.Metadata(meta),
				micro.WrapClient(servicecontext.SpanClientWrapper),
				micro.WrapHandler(servicecontext.SpanHandlerWrapper),
				micro.WrapSubscriber(servicecontext.SpanSubscriberWrapper),
				micro.BeforeStart(func() error {
					return f(svc)
				}),
				micro.AfterStart(func() error {
					log.Logger(ctx).Info("Started")

					return nil
				}),
				micro.BeforeStop(func() error {
					log.Logger(ctx).Info("Stopping")

					return nil
				}),
				micro.AfterStart(func() error {
					return UpdateServiceVersion(s)
				}),
			}

			if rateLimit, err := strconv.Atoi(os.Getenv("MICRO_RATE_LIMIT")); err == nil {
				opts = append(opts, micro.WrapHandler(limiter.NewHandlerWrapper(rateLimit)))
			}

			// context is always added last - so that there is no override
			svc.Init(
				opts...,
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
			)

			return nil
		}

	}
}
