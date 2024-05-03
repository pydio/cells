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

package embed

import (
	"context"
	"net/url"
	"os"
	"path/filepath"
	"sync"

	caddyv2 "github.com/caddyserver/caddy/v2"

	"github.com/pydio/cells/v4/common/client"
	clienthttp "github.com/pydio/cells/v4/common/client/http"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/crypto/providers"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/caddy"
	"github.com/pydio/cells/v4/common/utils/uuid"

	_ "github.com/caddyserver/caddy/v2/modules/standard"
)

var (
	providersLoggerInit sync.Once
)

func init() {
	server.DefaultURLMux().Register("caddy", &Opener{})
	server.ProxyURLMux().Register("caddy", &Opener{proxy: true})
}

type Server struct {
	*caddy.RawServer
	reverseProxy bool
	balancer     clienthttp.Balancer
}

type Opener struct {
	proxy bool
}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (server.Server, error) {
	return New(ctx, o.proxy)
}

func New(ctx context.Context, asProxy bool) (server.Server, error) {

	providersLoggerInit.Do(func() {
		ct := log.CaptureCaddyStdErr("pydio.server.caddy")
		providers.Logger = log.Logger(ct)
	})

	srvName := "caddy"
	srvID := "caddy" + "-" + uuid.New()
	if asProxy {
		srvName = "proxy"
		srvID = "proxy" + "-" + uuid.New()
	}
	s := &Server{
		RawServer:    caddy.New(ctx, srvID, srvName, map[string]string{}),
		reverseProxy: asProxy,
	}

	if !asProxy {
		RegisterServerMux(ctx, srvID, s.RouteRegistrar)
	}
	caddyStorePath := filepath.Join(runtime.ApplicationWorkingDir(), "caddy")
	_ = os.MkdirAll(caddyStorePath, 0755)
	if _, e := os.Stat(caddyStorePath); e == nil {
		caddyv2.DefaultStorage.Path = caddyStorePath
		caddyv2.ConfigAutosavePath = filepath.Join(caddyStorePath, "autosave.json")
	}

	return server.NewServer(ctx, s), nil
}

func (s *Server) RawServe(*server.ServeOptions) (ii []registry.Item, er error) {

	if s.reverseProxy {

		var reg registry.Registry
		runtimecontext.Get(s.RootContext(), registry.ContextKey, &reg)
		rc, _ := client.NewResolverCallback(reg)
		s.balancer = clienthttp.NewBalancer(s.ID())
		rc.Add(s.ReloadProxy)
		return nil, s.ReloadProxy(reg)

	} else {

		caddyFile, aa, err := caddy.ResolveSites(s.RootContext(), nil, false)
		if err != nil {
			return nil, err
		}
		if er := caddyv2.Load(caddyFile, true); er != nil {
			return nil, er
		}

		for _, a := range aa {
			ii = append(ii, util.CreateAddress(a, nil))
		}
		return
	}

}

func (s *Server) ReloadProxy(reg registry.Registry) error {
	er := s.balancer.Build(reg)
	if er != nil {
		return er
	}
	caddyConfig, _, er := caddy.ResolveSites(s.RootContext(), func(endpoint string) ([]*url.URL, error) {
		return s.balancer.ListEndpointTargets(endpoint, true)
	}, false)
	if er != nil {
		return er
	}
	return caddyv2.Load(caddyConfig, true)
}

func (s *Server) Stop() error {
	return caddyv2.Stop()
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
