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

// Package nats provides access to a service registry based on Nats.io.
package nats

import (
	"context"
	"flag"
	"fmt"
	"time"

	"github.com/nats-io/gnatsd/server"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"go.uber.org/zap"
)

func init() {
	service.NewService(
		service.Name(common.SERVICE_NATS),
		service.Tag(common.SERVICE_TAG_DISCOVERY),
		service.Description("Service registry based on Nats.io"),
		service.BeforeInit(prerun),
		service.WithGeneric(func(ctx context.Context, cancel context.CancelFunc) (service.Runner, service.Checker, service.Stopper, error) {
			fs := flag.NewFlagSet("nats-server", flag.ExitOnError)

			conf := servicecontext.GetConfig(ctx)
			if m, ok := conf.(config.Map); ok {
				fmt.Println(m)
				for k, v := range m {
					fs.Set(k, fmt.Sprintf("%v", v))
				}
			}

			// Configure the options from the flags/config file
			opts, err := server.ConfigureOptions(fs, []string{},
				server.PrintServerAndExit,
				fs.Usage,
				server.PrintTLSHelpAndDie,
			)

			if err != nil {
				return nil, nil, nil, err
			}

			// opts.Port = 4223
			//
			// routeURL := "nats://localhost:5223"
			// url, _ := url.Parse(routeURL)
			//
			// opts.Routes = append(opts.Routes, url)
			//
			// opts.Cluster.Host = "localhost"
			// opts.Cluster.Port = 5222

			opts.NoSigs = true

			// Create the server with appropriate options.
			srv := server.New(opts)

			// Configure the logger based on the flags
			srv.SetLogger(logger{log.Logger(ctx)}, false, false)

			// Start things up. Block here until done.
			return service.RunnerFunc(func() error {
					server.Run(srv)
					return nil
				}), service.CheckerFunc(func() error {
					if srv.ReadyForConnections(10 * time.Second) {
						return nil
					}

					return fmt.Errorf("No connections available")
				}), service.StopperFunc(func() error {
					srv.Shutdown()
					return nil
				}), nil

		}),
	)
}

type logger struct {
	*zap.Logger
}

func (l logger) Debugf(str string, args ...interface{}) {
	l.Debug(fmt.Sprintf(str, args...))
}

func (l logger) Errorf(str string, args ...interface{}) {
	l.Error(fmt.Sprintf(str, args...))
}

func (l logger) Fatalf(str string, args ...interface{}) {
	l.Error(fmt.Sprintf(str, args...))
}

func (l logger) Noticef(str string, args ...interface{}) {
	l.Debug(fmt.Sprintf(str, args...))
}

func (l logger) Tracef(str string, args ...interface{}) {
	l.Debug(fmt.Sprintf(str, args...))
}
