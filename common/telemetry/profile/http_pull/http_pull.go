/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

// Package http_pull provides a profiling implementation that exposes PProf profiles on an HTTP endpoint
package http_pull

import (
	"context"
	"net/http/pprof"
	"net/url"
	"os"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/telemetry/otel"
	"github.com/pydio/cells/v4/common/telemetry/profile"
)

func init() {
	profile.DefaultURLMux().Register("pull", &Opener{})
}

const (
	pprofServiceName = common.ServiceWebNamespace_ + common.ServicePprof
)

type provider struct {
}

func (*provider) PushSupported() bool {
	return false
}

func (*provider) InitHTTPPullService(ctx context.Context, route string) {

	pattern := "/" + strconv.Itoa(os.Getpid())

	service.NewService(
		service.Name(pprofServiceName),
		service.Context(ctx),
		service.ForceRegister(true),
		service.Tag(common.ServiceTagGateway),
		service.Description("Expose pprof data as an HTTP endpoint"),
		service.WithHTTP(func(ctx context.Context, mu routing.RouteRegistrar) error {
			router := mux.NewRouter().SkipClean(true).StrictSlash(true)
			router.HandleFunc("/debug/pprof/", pprof.Index)
			router.HandleFunc("/debug/pprof/allocs", pprof.Index)
			router.HandleFunc("/debug/pprof/blocks", pprof.Index)
			router.HandleFunc("/debug/pprof/heap", pprof.Index)
			router.HandleFunc("/debug/pprof/mutex", pprof.Index)
			router.HandleFunc("/debug/pprof/threadcreate", pprof.Index)
			router.HandleFunc("/debug/pprof/goroutine", pprof.Index)
			router.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
			router.HandleFunc("/debug/pprof/profile", pprof.Profile)
			router.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
			router.HandleFunc("/debug/pprof/trace", pprof.Trace)
			sub := mu.Route(route)
			sub.Handle(pattern+"/", router, routing.WithStripPrefix())
			//if runtime.HttpServerType() == runtime.HttpServerCaddy {
			sub.Handle("/", &pprofHandler{ctx: ctx})
			//}
			return nil
		}),
		service.WithHTTPStop(func(ctx context.Context, mux routing.RouteRegistrar) error {
			mux.DeregisterRoute(route)
			return nil
		}),
	)

}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL, service otel.Service) (profile.PProfProvider, error) {
	return &provider{}, nil
}
