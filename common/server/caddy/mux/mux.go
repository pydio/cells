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
	"net"
	"net/http"

	caddy "github.com/caddyserver/caddy/v2"
	"github.com/caddyserver/caddy/v2/caddyconfig/caddyfile"
	"github.com/caddyserver/caddy/v2/caddyconfig/httpcaddyfile"
	"github.com/caddyserver/caddy/v2/modules/caddyhttp"
	clienthttp "github.com/pydio/cells/v4/common/client/http"
	"github.com/pydio/cells/v4/common/server"
)

var (
	module *Middleware
)

func RegisterServerMux(ctx context.Context, serverID string, s server.HttpMux) {
	if module != nil {
		module.Stop()
		module.Init(ctx, serverID, s)
		return
	}
	module = &Middleware{Resolver: clienthttp.NewResolver()}
	module.Init(ctx, serverID, s)
	caddy.RegisterModule(module)
	httpcaddyfile.RegisterHandlerDirective("mux", parseCaddyfile)
}

type Middleware struct {
	clienthttp.Resolver
}

func (m *Middleware) Init(ctx context.Context, serverID string, s server.HttpMux) {
	m.Resolver.Init(ctx, serverID, s)
}

func (m *Middleware) Stop() {
	m.Resolver.Stop()
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

// ServeHTTP implements caddyhttp.MiddlewareHandler.
func (m *Middleware) ServeHTTP(w http.ResponseWriter, r *http.Request, next caddyhttp.Handler) error {
	served, er := m.Resolver.ServeHTTP(w, r)
	if served {
		return er
	}
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
