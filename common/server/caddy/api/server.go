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

package api

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"net/url"

	"github.com/pydio/cells/v4/common/client"
	clienthttp "github.com/pydio/cells/v4/common/client/http"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/caddy"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func init() {
	server.ProxyURLMux().Register("caddy-api", &Opener{})
	server.ProxyURLMux().Register("caddy-api+tls", &Opener{tls: true})
}

type Opener struct {
	tls bool
}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (server.Server, error) {
	if u.Host == "" {
		return nil, fmt.Errorf("empty host for proxy caddy-api")
	}
	if o.tls {
		return New(ctx, "https://"+u.Host)
	} else {
		return New(ctx, "http://"+u.Host)
	}
}

type Server struct {
	*caddy.RawServer
	routing.RouteRegistrar

	caddyApi string
	balancer clienthttp.Balancer
}

func New(ctx context.Context, caddyApi string) (server.Server, error) {

	srvID := "proxy" + "-" + uuid.New()
	srvMUX := routing.NewRouteRegistrar()

	srv := &Server{
		RawServer: caddy.New(ctx, srvID, "proxy", map[string]string{}),

		caddyApi:       caddyApi,
		RouteRegistrar: srvMUX,
	}

	return server.NewServer(ctx, srv), nil
}

func (s *Server) RawServe(*server.ServeOptions) (ii []registry.Item, er error) {

	var reg registry.Registry
	runtimecontext.Get(s.RootContext(), runtimecontext.RegistryKey, &reg)

	rc, _ := client.NewResolverCallback(reg)
	s.balancer = clienthttp.NewBalancer(s.ID())
	rc.Add(s.ReloadProxy)
	return nil, s.ReloadProxy(reg)

}

func (s *Server) ReloadProxy(reg registry.Registry) error {
	er := s.balancer.Build(reg)
	if er != nil {
		return er
	}
	caddyConfig, _, er := caddy.ResolveSites(s.RootContext(), func(endpoint string) ([]*url.URL, error) {
		return s.balancer.ListEndpointTargets(endpoint, true)
	}, true)
	if er != nil {
		return er
	}

	reader := bytes.NewReader(caddyConfig)
	resp, er := http.Post(s.caddyApi+"/load", "application/json", reader)
	if er != nil {
		return er
	}
	if resp.StatusCode != 200 {
		return fmt.Errorf("cannot post to caddy server, code was %d", resp.StatusCode)
	}
	return nil

}

func (s *Server) Stop() error {
	// Todo - shall we post an empty config to the remote
	return nil
}

func (s *Server) Clone() interface{} {
	clone := &Server{
		RawServer: s.RawServer.Clone().(*caddy.RawServer),
	}
	return clone
}

func (s *Server) As(i interface{}) bool {
	if v, ok := i.(*routing.RouteRegistrar); ok {
		*v = s.RouteRegistrar
		return true
	}
	return false
}
