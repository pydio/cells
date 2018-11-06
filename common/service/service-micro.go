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
	"time"

	"github.com/micro/go-micro"
	"github.com/micro/go-micro/broker"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/defaults"
	proto "github.com/pydio/cells/common/service/proto"
)

// WithMicro adds a micro service handler to the current service
func WithMicro(f func(micro.Service) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.Version = common.Version().String()
		o.Micro = micro.NewService()

		o.MicroInit = func(s Service) error {

			name := s.Name()
			ctx := servicecontext.WithServiceName(s.Options().Context, name)

			s.Options().Micro.Init(
				micro.Client(defaults.NewClient()),
				micro.Server(defaults.NewServer()),
				micro.Registry(defaults.Registry()),
				micro.RegisterTTL(time.Second*30),
				micro.RegisterInterval(time.Second*10),
				micro.Transport(defaults.Transport()),
				micro.Broker(defaults.Broker()),
			)

			// context is always added last - so that there is no override
			s.Options().Micro.Init(
				micro.Context(ctx),
				micro.Name(name),
				micro.WrapClient(servicecontext.SpanClientWrapper),
				micro.WrapHandler(servicecontext.SpanHandlerWrapper),
				micro.Metadata(map[string]string{
					"source": s.Options().Source,
				}),
				micro.BeforeStart(func() error {
					return f(s.Options().Micro)
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
					return broker.Publish(common.TOPIC_SERVICE_START, &broker.Message{})
				}),
				micro.AfterStart(func() error {
					return UpdateServiceVersion(s)
				}),
			)

			// newTracer(name, &options)
			newBackoffer(s.Options().Micro)
			newConfigProvider(s.Options().Micro)
			newDBProvider(s.Options().Micro)
			newLogProvider(s.Options().Micro)
			// newTraceProvider(s.Options().Micro) // DISABLED FOR NOW DUE TO CONFLICT WITH THE MICRO GO OS
			newClaimsProvider(s.Options().Micro)

			proto.RegisterServiceHandler(s.Options().Micro.Server(), &Handler{s.Options().Micro})

			return nil
		}

	}
}
