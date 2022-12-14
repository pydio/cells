/*
 * Copyright (c) 2018-2022. Abstrium SAS <team (at) pydio.com>
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

package metrics

import (
	"context"
	"crypto/subtle"
	"fmt"
	"net/http"
	"net/http/pprof"
	"sync"

	"github.com/gorilla/mux"
	"github.com/uber-go/tally/v4"
	prom "github.com/uber-go/tally/v4/prometheus"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/generic"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/service/metrics"
	"github.com/pydio/cells/v4/gateway/metrics/prometheus"
)

const (
	serviceName      = common.ServiceGatewayNamespace_ + common.ServiceMetrics
	pprofServiceName = common.ServiceWebNamespace_ + common.ServicePprof
	promServiceName  = common.ServiceWebNamespace_ + common.ServiceMetrics
)

type bau struct {
	login, pwd []byte
	inner      http.Handler
}

func (b *bau) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if l, p, o := r.BasicAuth(); o && subtle.ConstantTimeCompare([]byte(l), b.login) == 1 && subtle.ConstantTimeCompare([]byte(p), b.pwd) == 1 {
		b.inner.ServeHTTP(w, r)
		return
	}
	w.Header().Set("WWW-Authenticate", `Basic realm="cells metrics"`)
	w.WriteHeader(401)
	w.Write([]byte("Unauthorized.\n"))
}

func newPromHttpService(ctx context.Context, pure bool, with, stop func(ctx context.Context, mux server.HttpMux) error) {

	var opts []service.ServiceOption
	opts = append(opts,
		service.Name(promServiceName),
		service.Context(ctx),
		service.Tag(common.ServiceTagGateway),
		service.Description("Expose metrics for external tools (prometheus and pprof formats)"),
		service.ForceRegister(true), // Always register in all processes
		service.WithHTTPStop(stop),
	)
	if pure {
		opts = append(opts, service.WithPureHTTP(with))
	} else {
		opts = append(opts, service.WithHTTP(with))
	}
	service.NewService(opts...)

}

var (
	reporter prom.Reporter
	repOnce  sync.Once
)

func init() {

	runtime.Register("main", func(ctx context.Context) {

		if runtime.MetricsEnabled() {

			repOnce.Do(func() {
				reporter = prom.NewReporter(prom.Options{})
				options := tally.ScopeOptions{
					Prefix:         "cells",
					Tags:           map[string]string{},
					CachedReporter: reporter,
					Separator:      prom.DefaultSeparator,
				}
				metrics.RegisterRootScope(options)
			})

			pattern := fmt.Sprintf("/metrics/%s", runtime.ProcessRootID())

			if use, login, pwd := runtime.MetricsRemoteEnabled(); use {

				newPromHttpService(
					ctx,
					false,
					func(ctx context.Context, mux server.HttpMux) error {
						h := prometheus.NewHandler(reporter)
						mux.Handle(pattern, &bau{inner: h.HTTPHandler(), login: []byte(login), pwd: []byte(pwd)})
						/// For main process, also add the central index
						if !runtime.IsFork() {
							index := prometheus.NewIndex(ctx)
							mux.Handle("/metrics/sd", &bau{inner: index, login: []byte(login), pwd: []byte(pwd)})
						}
						return nil
					},
					func(ctx context.Context, mux server.HttpMux) error {
						if p, ok := mux.(server.PatternsProvider); ok {
							p.DeregisterPattern(pattern)
							if !runtime.IsFork() {
								p.DeregisterPattern("/metrics/sd")
							}
						}
						return nil
					})

			} else {
				if !runtime.IsFork() {
					service.NewService(
						service.Name(serviceName),
						service.Context(ctx),
						service.Tag(common.ServiceTagGateway),
						service.Description("Gather metrics endpoints for prometheus inside a prom.json file"),
						service.WithGeneric(func(c context.Context, server *generic.Server) error {
							srv := &metricsServer{ctx: c, name: serviceName}
							return srv.Start()
						}),
					)
				}
				with := func(ctx context.Context, mux server.HttpMux) error {
					h := prometheus.NewHandler(reporter)
					mux.Handle(pattern, h.HTTPHandler())
					return nil
				}
				stop := func(ctx context.Context, mux server.HttpMux) error {
					if p, ok := mux.(server.PatternsProvider); ok {
						p.DeregisterPattern(pattern)
					}
					return nil
				}
				newPromHttpService(ctx, !runtime.IsFork(), with, stop)
			}
		}

		if runtime.PprofEnabled() {
			prefix := "/" + runtime.ProcessRootID()
			service.NewService(
				service.Name(pprofServiceName),
				service.Context(ctx),
				service.ForceRegister(true),
				service.Tag(common.ServiceTagGateway),
				service.Description("Expose pprof data as an HTTP endpoint"),
				service.WithHTTP(func(ctx context.Context, mu server.HttpMux) error {
					subRouter := mux.NewRouter()
					subRouter.HandleFunc("/debug/pprof/", pprof.Index)
					subRouter.HandleFunc("/debug/pprof/allocs", pprof.Index)
					subRouter.HandleFunc("/debug/pprof/blocks", pprof.Index)
					subRouter.HandleFunc("/debug/pprof/heap", pprof.Index)
					subRouter.HandleFunc("/debug/pprof/mutex", pprof.Index)
					subRouter.HandleFunc("/debug/pprof/threadcreate", pprof.Index)
					subRouter.HandleFunc("/debug/pprof/goroutine", pprof.Index)
					subRouter.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
					subRouter.HandleFunc("/debug/pprof/profile", pprof.Profile)
					subRouter.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
					subRouter.HandleFunc("/debug/pprof/trace", pprof.Trace)
					mu.Handle(prefix+"/", http.StripPrefix(prefix, subRouter))
					if runtime.HttpServerType() == runtime.HttpServerCaddy {
						mu.Handle("/pprofs/", &pprofHandler{ctx: ctx})
					}
					return nil
				}),
				service.WithHTTPStop(func(ctx context.Context, mux server.HttpMux) error {
					if p, o := mux.(server.PatternsProvider); o {
						p.DeregisterPattern(prefix + "/")
						if runtime.HttpServerType() == runtime.HttpServerCaddy {
							p.DeregisterPattern("/pprofs/")
						}
					}
					return nil
				}),
			)
		}

	})
}

type metricsServer struct {
	ctx  context.Context
	name string
}

func (g *metricsServer) Start() error {
	return prometheus.WatchTargets(g.ctx, g.name)
}

func (g *metricsServer) Stop() error {
	prometheus.StopWatchingTargets()

	return nil
}

// NoAddress implements NonAddressable interface
func (g *metricsServer) NoAddress() string {
	return prometheus.GetFileName(serviceName)
}
