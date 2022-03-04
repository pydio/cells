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
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server/middleware"
	"net"
	"net/http"
	"net/http/pprof"

	"github.com/pydio/cells/v4/common/server"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/server/http/registrymux"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type Server struct {
	id   string
	name string
	meta map[string]string

	cancel context.CancelFunc
	net.Listener
	*server.ListableMux
	*http.Server
}

func New(ctx context.Context) server.Server {
	mux := server.NewListableMux()
	mux.HandleFunc("/debug/pprof/", pprof.Index)
	mux.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
	mux.HandleFunc("/debug/pprof/profile", pprof.Profile)
	mux.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
	mux.HandleFunc("/debug/pprof/trace", pprof.Trace)

	srv := &http.Server{}
	srv.Handler = registrymux.NewMiddleware(servercontext.GetRegistry(ctx), mux)
	srv.Handler = ContextMiddlewareHandler(middleware.ClientConnIncomingContext(ctx))(srv.Handler)
	srv.Handler = ContextMiddlewareHandler(middleware.RegistryIncomingContext(ctx))(srv.Handler)

	ctx, cancel := context.WithCancel(ctx)

	return server.NewServer(ctx, &Server{
		id:   "http-" + uuid.New(),
		name: "http",
		meta: server.InitPeerMeta(),

		cancel:      cancel,
		ListableMux: mux,
		Server:      srv,
	})
}

func (s *Server) Serve() error {
	lis, err := net.Listen("tcp", runtime.HttpBindAddress())
	if err != nil {
		return err
	}

	s.Listener = lis

	go func() {
		defer s.cancel()

		if err := s.Server.Serve(lis); err != nil {
			// TODO v4 log or summat
		}
	}()

	return nil
}

func (s *Server) Stop() error {
	// Return initial context ?
	return s.Server.Shutdown(context.TODO())
}

func (s *Server) Address() []string {
	if s.Listener == nil {
		return []string{}
	}
	return []string{s.Listener.Addr().String()}
}

func (s *Server) Endpoints() []string {
	return s.ListableMux.Patterns()
}

func (s *Server) ID() string {
	return s.id
}

func (s *Server) Name() string {
	return s.name
}

func (s *Server) Type() server.ServerType {
	return server.ServerType_HTTP
}

func (s *Server) Metadata() map[string]string {
	return s.meta // map[string]string{}
}

func (s *Server) As(i interface{}) bool {
	if v, ok := i.(*server.HttpMux); ok {
		*v = s.ListableMux
		return true
	}
	if v, ok := i.(*server.PatternsProvider); ok {
		*v = s.ListableMux
		return true
	}
	return false
}
