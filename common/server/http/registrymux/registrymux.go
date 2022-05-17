/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package registrymux

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	grpc2 "github.com/pydio/cells/v4/common/client/grpc"
	clienthttp "github.com/pydio/cells/v4/common/client/http"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/caddy/maintenance"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/service"
)

type Middleware struct {
	c         grpc.ClientConnInterface
	r         registry.Registry
	s         server.HttpMux
	b         clienthttp.Balancer
	monitor   grpc2.HealthMonitor
	userReady bool
}

func NewMiddleware(ctx context.Context, s server.HttpMux) Middleware {
	conn := clientcontext.GetClientConn(ctx)
	reg := servercontext.GetRegistry(ctx)
	rc, _ := client.NewResolverCallback(reg)
	monitor := grpc2.NewHealthChecker(ctx)
	balancer := clienthttp.NewBalancer()
	rc.Add(balancer.Build)

	go monitor.Monitor(common.ServiceOAuth)

	return Middleware{
		c:       conn,
		r:       reg,
		s:       s,
		b:       balancer,
		monitor: monitor,
	}
}

func (m Middleware) userServiceReady() bool {
	if m.userReady {
		return true
	}
	if service.RegistryHasServiceWithStatus(m.r, common.ServiceGrpcNamespace_+common.ServiceUser, service.StatusReady) {
		m.userReady = true
		return true
	}
	return false
}

func (m Middleware) watch() error {
	w, err := m.r.Watch(registry.WithType(pb.ItemType_SERVER))
	if err != nil {
		return err
	}

	defer w.Stop()

	for {
		r, err := w.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue
		}

		if r.Action() == pb.ActionType_CREATE {

		}
	}

	return nil
}

// ServeHTTP.
func (m Middleware) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Special case for application/grpc
	if strings.Contains(r.Header.Get("Content-Type"), "application/grpc") {
		proxy, e := m.b.PickService(common.ServiceGatewayGrpc)
		if e != nil {
			http.NotFound(w, r)
			return
		}

		proxy.ErrorHandler = func(writer http.ResponseWriter, request *http.Request, err error) {
			fmt.Println("Got Error in Grpc Reverse Proxy:", err.Error())
			writer.WriteHeader(http.StatusBadGateway)
		}

		ctx := clientcontext.WithClientConn(r.Context(), m.c)
		ctx = servercontext.WithRegistry(ctx, m.r)

		proxy.ServeHTTP(w, r.WithContext(ctx))
		return
	}

	if !m.monitor.Up() || !m.userServiceReady() {
		bb, _ := maintenance.Assets.ReadFile("starting.html")
		w.Header().Set("Content-Type", "text/html")
		w.Header().Set("Content-Length", fmt.Sprintf("%d", len(bb)))
		w.WriteHeader(303)
		w.Write(bb)
		return
	}

	if r.RequestURI == "/maintenance.html" && r.Header.Get("X-Maintenance-Redirect") != "" {
		bb, _ := maintenance.Assets.ReadFile("maintenance.html")
		w.Header().Set("Content-Type", "text/html")
		w.Header().Set("Content-Length", fmt.Sprintf("%d", len(bb)))
		w.WriteHeader(303)
		w.Write(bb)
		return
	}

	// try to find it in the current mux
	_, pattern := m.s.Handler(r)
	if len(pattern) > 0 && (pattern != "/" || r.URL.Path == "/") {
		ctx := clientcontext.WithClientConn(r.Context(), m.c)
		ctx = servercontext.WithRegistry(ctx, m.r)

		m.s.ServeHTTP(w, r.WithContext(ctx))
		return
	}

	proxy, e := m.b.PickEndpoint(r.URL.Path)
	if e == nil {
		proxy.ServeHTTP(w, r)
		return
	}
}
