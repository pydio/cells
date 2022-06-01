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
	"net/http"
	"net/http/pprof"
	"os"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/generic"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/gateway/metrics/prometheus"
)

const (
	serviceName      = common.ServiceGatewayNamespace_ + common.ServiceMetrics
	pprofServiceName = common.ServiceWebNamespace_ + common.ServicePprof
	promServiceName  = common.ServiceWebNamespace_ + common.ServiceMetrics
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		if runtime.MetricsEnabled() {
			service.NewService(
				service.Name(serviceName),
				service.Context(ctx),
				service.Tag(common.ServiceTagGateway),
				service.Description("Gather metrics for external tools (prometheus and pprof formats)"),
				service.WithGeneric(func(c context.Context, server *generic.Server) error {
					srv := &metricsServer{ctx: c, name: serviceName}
					return srv.Start()
				}),
			)
			h := prometheus.NewHandler()
			service.NewService(
				service.Name(promServiceName),
				service.Context(ctx),
				service.Tag(common.ServiceTagGateway),
				service.ForceRegister(true),
				service.WithPureHTTP(func(ctx context.Context, mux server.HttpMux) error {
					mux.Handle("/metrics", h.HTTPHandler())
					return nil
				}),
				service.WithHTTPStop(func(ctx context.Context, mux server.HttpMux) error {
					if p, ok := mux.(server.PatternsProvider); ok {
						p.DeregisterPattern("/metrics")
					}
					return nil
				}),
			)
		}
		if runtime.PprofEnabled() {
			prefix := "/" + strconv.Itoa(os.Getpid())
			service.NewService(
				service.Name(pprofServiceName),
				service.Context(ctx),
				service.ForceRegister(true),
				service.Tag(common.ServiceTagGateway),
				service.Description("Expose pprof data"),
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
