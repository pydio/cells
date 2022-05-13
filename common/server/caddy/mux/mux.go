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

package mux

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/rest"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"go.uber.org/zap"

	caddy "github.com/caddyserver/caddy/v2"
	"github.com/caddyserver/caddy/v2/caddyconfig/caddyfile"
	"github.com/caddyserver/caddy/v2/caddyconfig/httpcaddyfile"
	"github.com/caddyserver/caddy/v2/modules/caddyhttp"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client"
	clientcontext "github.com/pydio/cells/v4/common/client/context"
	grpc2 "github.com/pydio/cells/v4/common/client/grpc"
	clienthttp "github.com/pydio/cells/v4/common/client/http"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/caddy/maintenance"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/service"
)

var (
	module *Middleware
)

func RegisterServerMux(ctx context.Context, s server.HttpMux) {
	if module != nil {
		module.Stop()
		module.Init(ctx, s)
		return
	}
	module = &Middleware{}
	module.Init(ctx, s)
	caddy.RegisterModule(module)
	httpcaddyfile.RegisterHandlerDirective("mux", parseCaddyfile)
}

type Middleware struct {
	c         grpc.ClientConnInterface
	r         registry.Registry
	s         server.HttpMux
	b         *clienthttp.Balancer
	rc        client.ResolverCallback
	monitor   grpc2.HealthMonitor
	userReady bool
}

func (m *Middleware) Init(ctx context.Context, s server.HttpMux) {

	conn := clientcontext.GetClientConn(ctx)
	reg := servercontext.GetRegistry(ctx)
	rc, _ := client.NewResolverCallback(reg)
	balancer := &clienthttp.Balancer{ReadyProxies: make(map[string]*clienthttp.ReverseProxy)}

	rc.Add(func(m map[string]*client.ServerAttributes) error {
		for _, mm := range m {
			for _, addr := range mm.Addresses {
				proxy, ok := balancer.ReadyProxies[addr]
				if !ok {
					scheme := "http://"
					// TODO - do that in a better way
					if mm.Name == "grpcs" {
						scheme = "https://"
					}
					u, err := url.Parse(scheme + strings.Replace(addr, "[::]", "", -1))
					if err != nil {
						return err
					}
					proxy = &clienthttp.ReverseProxy{
						ReverseProxy: httputil.NewSingleHostReverseProxy(u),
					}
					proxy.ErrorHandler = func(writer http.ResponseWriter, request *http.Request, err error) {
						if err.Error() == "context canceled" {
							return
						}
						log.Logger(request.Context()).Error("Proxy Error :"+err.Error(), zap.Error(err))
						writer.WriteHeader(http.StatusBadGateway)
					}
					balancer.ReadyProxies[addr] = proxy
				}

				proxy.Endpoints = mm.Endpoints
				proxy.Services = mm.Services
			}
		}

		return nil
	})

	m.c = conn
	m.rc = rc
	m.r = reg
	m.s = s
	m.b = balancer

	if runtime.LastInitType() != "install" {
		monitor := grpc2.NewHealthChecker(ctx)
		go monitor.Monitor(common.ServiceOAuth)
		m.monitor = monitor
	}

}

func (m *Middleware) Stop() {
	if m.rc != nil {
		m.rc.Stop()
	}
	if m.monitor != nil {
		m.monitor.Stop()
	}
}

// CaddyModule returns the Caddy module information.
func (m *Middleware) CaddyModule() caddy.ModuleInfo {
	return caddy.ModuleInfo{
		ID:  "http.handlers.mux",
		New: func() caddy.Module { return m },
	}
}

// Provision adds routes to the main server
func (m *Middleware) Provision(ctx caddy.Context) error {
	return nil
}

func (m *Middleware) userServiceReady() bool {
	if m.userReady {
		return true
	}
	if service.RegistryHasServiceWithStatus(m.r, common.ServiceGrpcNamespace_+common.ServiceUser, service.StatusReady) {
		m.userReady = true
		return true
	}
	return false
}

var grpcTransport = &http.Transport{
	TLSClientConfig:   &tls.Config{InsecureSkipVerify: true},
	ForceAttemptHTTP2: true,
}

// ServeHTTP implements caddyhttp.MiddlewareHandler.
func (m *Middleware) ServeHTTP(w http.ResponseWriter, r *http.Request, next caddyhttp.Handler) error {

	// Special case for application/grpc
	if strings.Contains(r.Header.Get("Content-Type"), "application/grpc") {
		proxy := m.b.PickService(common.ServiceGatewayGrpc)
		if proxy == nil {
			http.NotFound(w, r)
			return nil
		}
		// We assume that internally, the GRPCs service is serving self-signed
		proxy.Transport = grpcTransport
		// Wrap context and server request
		ctx := clientcontext.WithClientConn(r.Context(), m.c)
		ctx = servercontext.WithRegistry(ctx, m.r)
		proxy.ServeHTTP(w, r.WithContext(ctx))
		return nil
	}

	if m.monitor != nil && (!m.monitor.Up() || !m.userServiceReady()) {
		var bb []byte
		if strings.Contains(r.Header.Get("Accept"), "text/html") {
			bb, _ = maintenance.Assets.ReadFile("starting.html")
			w.Header().Set("Content-Type", "text/html")
		} else {
			er := &rest.Error{
				Code:   "503",
				Title:  "Server is starting",
				Detail: "Server is starting, please retry later",
			}
			bb, _ = json.Marshal(er)
			w.Header().Set("Content-Type", "application/json")
		}
		w.Header().Set("Content-Length", fmt.Sprintf("%d", len(bb)))
		w.Header().Set("Retry-After", "10")
		w.WriteHeader(503)
		_, er := w.Write(bb)
		return er
	}

	if r.RequestURI == "/maintenance.html" && r.Header.Get("X-Maintenance-Redirect") != "" {
		bb, _ := maintenance.Assets.ReadFile("maintenance.html")
		w.Header().Set("Content-Type", "text/html")
		w.Header().Set("Content-Length", fmt.Sprintf("%d", len(bb)))
		w.WriteHeader(503)
		_, er := w.Write(bb)
		return er
	}

	// try to find it in the current mux
	_, pattern := m.s.Handler(r)
	if len(pattern) > 0 && (pattern != "/" || r.URL.Path == "/") {
		ctx := clientcontext.WithClientConn(r.Context(), m.c)
		ctx = servercontext.WithRegistry(ctx, m.r)

		m.s.ServeHTTP(w, r.WithContext(ctx))
		return nil
	}

	proxy := m.b.PickEndpoint(r.URL.Path)
	if proxy != nil {
		proxy.ServeHTTP(w, r)
		return nil
	}

	// no matching filter found
	return next.ServeHTTP(w, r)
}

// UnmarshalCaddyfile implements caddyfile.Unmarshaler.
func (m *Middleware) UnmarshalCaddyfile(d *caddyfile.Dispenser) error {
	return nil
}

func (m *Middleware) WrapListener(ln net.Listener) net.Listener {
	return ln
}

// parseCaddyfile unmarshals tokens from h into a new Middleware.
func parseCaddyfile(h httpcaddyfile.Helper) (caddyhttp.MiddlewareHandler, error) {
	return module, nil
}
