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

package http

import (
	"context"
	"errors"
	"net"
	"net/http"
	"net/url"
	"time"

	"go.uber.org/zap"
	"golang.org/x/exp/maps"

	"github.com/pydio/cells/v5/common/config/routing"
	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/server"
	"github.com/pydio/cells/v5/common/server/http/mux"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

func init() {
	server.DefaultURLMux().Register("http", &Opener{})
}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (server.Server, error) {
	srvID := "http-" + uuid.New()
	lMux := NewRegistrar(ctx, srvID)

	srv := &http.Server{}
	srv.Handler = mux.NewMiddleware(ctx, srvID, lMux)
	srv.Handler = propagator.HttpContextMiddleware(middleware.ClientConnIncomingContext(ctx))(srv.Handler)
	srv.Handler = propagator.HttpContextMiddleware(middleware.RegistryIncomingContext(ctx))(srv.Handler)

	ctx, cancel := context.WithCancel(ctx)

	return server.NewServer(ctx, &Server{
		id:   srvID,
		name: "http",
		meta: make(map[string]string),

		cancel:         cancel,
		RouteRegistrar: lMux,
		Server:         srv,
	}), nil
}

type Server struct {
	id   string
	name string
	meta map[string]string

	cancel context.CancelFunc
	net.Listener
	routing.RouteRegistrar
	*http.Server
}

func (s *Server) RawServe(opts *server.ServeOptions) (ii []registry.Item, e error) {
	if opts.Listener == nil {
		return nil, errors.New("must have a listener")
	}

	s.Listener = opts.Listener

	go func() {
		defer s.cancel()

		if err := s.Server.Serve(s.Listener); err != nil {
			if err.Error() == "http: Server closed" || err.Error() == "context canceled" {
				return
			}
			log.Logger(opts.Context).Error("Could not start http server because "+err.Error(), zap.Error(err))
		}
	}()

	return
}

func (s *Server) Stop() error {
	// Shutdown may wait indefinitely for open connections to close - Force close after a timeout
	ctx, can := context.WithTimeout(context.Background(), 5*time.Second)
	defer can()
	return s.Server.Shutdown(ctx)
}

func (s *Server) Endpoints() []string {
	return s.RouteRegistrar.Patterns()
}

func (s *Server) ID() string {
	return s.id
}

func (s *Server) Name() string {
	return s.name
}

func (s *Server) Type() server.Type {
	return server.TypeHttp
}

func (s *Server) Metadata() map[string]string {
	return s.meta // map[string]string{}
}

func (s *Server) SetMetadata(meta map[string]string) {
	s.meta = meta
}

func (s *Server) As(i interface{}) bool {
	if v, ok := i.(*routing.RouteRegistrar); ok {
		*v = s.RouteRegistrar
		return true
	}
	return false
}

func (s *Server) Clone() interface{} {
	clone := &Server{}
	clone.id = s.id
	clone.name = s.name
	clone.meta = maps.Clone(s.meta)

	return clone
}
