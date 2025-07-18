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

	"github.com/pydio/cells/v5/common/client"
	clienthttp "github.com/pydio/cells/v5/common/client/http"
	"github.com/pydio/cells/v5/common/config/routing"
	"github.com/pydio/cells/v5/common/crypto/providers"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/registry/util"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/server"
	"github.com/pydio/cells/v5/common/server/caddy"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/uuid"

	_ "github.com/caddyserver/caddy/v2/modules/standard"
)

var (
	loggerInit sync.Once
)

func init() {
	server.DefaultURLMux().Register("caddy", &Opener{})
}

type Server struct {
	*caddy.RawServer
	reverseProxy bool
	balancer     clienthttp.Balancer
}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (server.Server, error) {
	asProxy := u.Scheme == "caddy+proxy"
	return New(ctx, asProxy)
}

func New(ctx context.Context, asProxy bool) (server.Server, error) {

	loggerInit.Do(func() {
		caddyv2.RegisterModule(newWriterOpenerModule("pydio.caddy"))
		ct := runtime.WithServiceName(context.Background(), "pydio.caddy.mkcert")
		ct = runtime.AsCoreContext(ct)
		providers.Logger = log.Logger(ct)
	})

	srvName := "caddy"
	srvID := "caddy" + "-" + uuid.New()
	if asProxy {
		srvName = "proxy"
		srvID = "proxy" + "-" + uuid.New()
		log.Logger(runtime.WithServiceName(runtime.AsCoreContext(ctx), "pydio.web.proxy")).Info("Starting caddy as reverse-proxy")
	} else {
		log.Logger(runtime.WithServiceName(runtime.AsCoreContext(ctx), "pydio.web.mux")).Info("Starting caddy server")
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

func (s *Server) RawServe(opts *server.ServeOptions) (ii []registry.Item, er error) {

	if s.reverseProxy {

		var reg registry.Registry
		propagator.Get(s.RootContext(), registry.ContextKey, &reg)
		rc, _ := client.NewResolverCallback(reg)
		s.balancer = clienthttp.NewBalancer(opts.Context, s.ID())
		rc.Add(s.ReloadProxy)
		return nil, s.ReloadProxy(reg)

	} else {

		caddyFile, aa, err := caddy.ResolveSites(opts.Context, nil, false)
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
	return caddyv2.Load(caddyConfig, false)
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
