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

	"github.com/micro/go-micro"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/defaults"
)

// WithGeneric adds a generic micro service handler to the current service
func WithGeneric(f func(context.Context, context.CancelFunc) (Runner, Checker, Stopper, error), opts ...func(Service) (micro.Option, error)) ServiceOption {
	return func(o *ServiceOptions) {
		o.Micro = micro.NewService()

		o.MicroInit = func(s Service) error {

			name := s.Name()
			ctx := servicecontext.WithServiceName(s.Options().Context, name)
			o.Version = common.Version().String()

			s.Options().Micro.Init(
				micro.Client(defaults.NewClient()),
				micro.Server(defaults.NewServer()),
				micro.Registry(defaults.Registry()),
			)

			// context is always added last - so that there is no override
			for _, opt := range opts {
				o, err := opt(s)
				if err != nil {
					log.Fatal("failed to init micro service ", zap.Error(err))
				}

				s.Options().Micro.Init(
					o,
				)
			}

			s.Options().Micro.Init(
				micro.Context(ctx),
				micro.Name(name),
				micro.BeforeStart(func() error {
					r, c, s, err := f(s.Options().Context, s.Options().Cancel)
					if err != nil {
						return err
					}

					// Adding context watcher
					go func() {
						<-ctx.Done()
						s.Stop()
					}()

					go r.Run()

					if err := Retry(c.Check); err != nil {
						s.Stop()
					}

					return nil
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
			newConfigProvider(s.Options().Micro)
			newLogProvider(s.Options().Micro)

			// We should actually offer that possibility
			// proto.RegisterServiceHandler(s.Options().Micro.Server(), &Handler{s.Options().Micro})

			return nil
		}
	}
}
