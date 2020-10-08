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
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	errorUtils "github.com/pydio/cells/common/utils/error"

	"github.com/micro/go-micro"
	"github.com/micro/go-micro/server"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/registry"
	servicecontext "github.com/pydio/cells/common/service/context"
	proto "github.com/pydio/cells/common/service/proto"
)

// WithGeneric adds a generic micro service handler to the current service
func WithGeneric(f func(context.Context, context.CancelFunc) (Runner, Checker, Stopper, error), opts ...func(Service) (micro.Option, error)) ServiceOption {
	return func(o *ServiceOptions) {
		o.Micro = micro.NewService()

		o.MicroInit = func(s Service) error {

			svc := micro.NewService()

			name := s.Name()
			ctx := servicecontext.WithServiceName(s.Options().Context, name)
			o.Version = common.Version().String()

			svc.Init(
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

				svc.Init(
					o,
				)
			}

			svc.Init(
				micro.Context(ctx),
				micro.Name(name),
				micro.Metadata(registry.BuildServiceMeta()),
				micro.BeforeStart(func() error {
					n := s.Options().Name
					var runner Runner
					var checker Checker
					var stopper Stopper
					var err error
					loop := 0
					for {
						loop++
						runner, checker, stopper, err = f(s.Options().Context, s.Options().Cancel)
						if err == nil || !errorUtils.IsServiceStartNeedsRetry(err) {
							break
						}
						if loop == 1 {
							log.Logger(s.Options().Context).Info("Runner generator returned ServiceStartNeedsRetry error, waiting for 10s")
						}
						<-time.After(10 * time.Second)
					}
					if err != nil {
						return err
					}

					// Adding context watcher
					go func() {
						defer func() {
							if e := recover(); e != nil {
								fmt.Println("Panic recovered while stopping service", e)
							}
						}()
						<-ctx.Done()
						stopper.Stop()
					}()
					if runner == nil {
						fmt.Printf("Nil runner before start for %s, call runner generator again\n", n)
						runner, checker, stopper, err = f(s.Options().Context, s.Options().Cancel)
						if err != nil {
							return err
						}
					}
					go runner.Run()

					if err := Retry(checker.Check); err != nil {
						stopper.Stop()
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
			newConfigProvider(svc)
			newLogProvider(svc)

			// We should actually offer that possibility
			proto.RegisterServiceHandler(svc.Server(), &StatusHandler{s.Address()})

			s.Init(Micro(svc))

			return nil
		}
	}
}

// WithGeneric adds a generic micro service handler to the current service
func WithHTTP(handlerFunc func() http.Handler) ServiceOption {
	return func(o *ServiceOptions) {
		o.MicroInit = func(s Service) error {
			svc := micro.NewService()

			name := s.Name()
			ctx := servicecontext.WithServiceName(s.Options().Context, name)
			o.Version = common.Version().String()

			srv := defaults.NewHTTPServer(
				server.Name(name),
				server.Id(uuid.New().String()),
			)

			hd := srv.NewHandler(handlerFunc())

			err := srv.Handle(hd)
			if err != nil {
				return err
			}

			svc.Init(
				micro.Registry(defaults.Registry()),
				micro.Context(ctx),
				micro.Name(name),
				micro.Metadata(registry.BuildServiceMeta()),
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
				micro.Server(srv),
			)

			// newTracer(name, &options)
			newConfigProvider(svc)
			newLogProvider(svc)

			// We should actually offer that possibility
			proto.RegisterServiceHandler(svc.Server(), &StatusHandler{s.Address()})

			s.Init(Micro(svc))

			return nil
		}
	}
}
