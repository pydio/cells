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

package caddy

import (
	"context"
	"net"
	"strings"

	caddy "github.com/caddyserver/caddy/v2"
	"golang.org/x/exp/maps"

	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"

	_ "github.com/caddyserver/caddy/v2/modules/standard"
)

type RawServer struct {
	routing.RouteRegistrar

	id      string
	name    string
	meta    map[string]string
	rootCtx context.Context
}

func New(ctx context.Context, id, name string, meta map[string]string) *RawServer {

	srvMUX := routing.NewRouteRegistrar()
	srv := &RawServer{
		id:             id,
		name:           name,
		meta:           meta,
		rootCtx:        ctx,
		RouteRegistrar: srvMUX,
	}

	return srv
}

func (s *RawServer) RootContext() context.Context {
	return s.rootCtx
}

func (s *RawServer) CaddyConfFromRoutes(resolver UpstreamResolver, external bool) ([]byte, []string, error) {
	// Creating temporary caddy file
	sites, err := routing.LoadSites()
	if err != nil {
		return nil, nil, err
	}

	caddySites, err := SitesToCaddyConfigs(sites, resolver)
	if err != nil {
		return nil, nil, err
	}

	caddyFile, err := FromTemplate(s.RootContext(), caddySites, external)
	if err != nil {
		return nil, nil, err
	}

	var addresses []string
	for _, site := range caddySites {
		for _, bind := range site.GetBinds() {
			//s.addresses = append(s.addresses, bind)

			bind = strings.TrimPrefix(bind, "http://")
			bind = strings.TrimPrefix(bind, "https://")

			host, port, err := net.SplitHostPort(bind)
			if err != nil {
				continue
			}
			ip := net.ParseIP(host)
			if ip == nil || ip.IsUnspecified() {
				addresses = append(addresses, net.JoinHostPort(runtime.DefaultAdvertiseAddress(), port))
			} else {
				addresses = append(addresses, bind)
			}
		}
	}
	return caddyFile, addresses, nil
}

func (s *RawServer) Type() server.Type {
	return server.TypeHttp
}

func (s *RawServer) Stop() error {
	return caddy.Stop()
}

func (s *RawServer) Endpoints() []string {
	return s.RouteRegistrar.Patterns()
}

func (s *RawServer) ID() string {
	return s.id
}

func (s *RawServer) Name() string {
	return s.name
}

func (s *RawServer) Metadata() map[string]string {
	return s.meta // map[string]string{}
}

func (s *RawServer) SetMetadata(meta map[string]string) {
	s.meta = meta
}

func (s *RawServer) Clone() interface{} {
	clone := &RawServer{}
	clone.id = s.id
	clone.name = s.name
	clone.meta = maps.Clone(s.meta)

	return clone
}
