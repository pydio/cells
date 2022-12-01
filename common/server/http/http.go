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
	"net"
	"net/http"
	"net/url"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/http/mux"
	"github.com/pydio/cells/v4/common/server/middleware"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func init() {
	server.DefaultURLMux().Register("http", &Opener{})
}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (server.Server, error) {
	return New(ctx), nil
}

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
	lMux := server.NewListableMux()
	/*
		lMux.HandleFunc("/debug/pprof/", pprof.Index)
		lMux.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
		lMux.HandleFunc("/debug/pprof/profile", pprof.Profile)
		lMux.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
		lMux.HandleFunc("/debug/pprof/trace", pprof.Trace)
	*/

	srv := &http.Server{}
	srv.Handler = mux.NewMiddleware(ctx, lMux)
	srv.Handler = ContextMiddlewareHandler(middleware.ClientConnIncomingContext(ctx))(srv.Handler)
	srv.Handler = ContextMiddlewareHandler(middleware.RegistryIncomingContext(ctx))(srv.Handler)

	ctx, cancel := context.WithCancel(ctx)

	return server.NewServer(ctx, &Server{
		id:   "http-" + uuid.New(),
		name: "http",
		meta: make(map[string]string),

		cancel:      cancel,
		ListableMux: lMux,
		Server:      srv,
	})
}

func (s *Server) RawServe(opts *server.ServeOptions) (ii []registry.Item, e error) {
	addr := opts.HttpBindAddress
	if addr == "" {
		addr = runtime.HttpBindAddress()
	}
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		return nil, err
	}

	s.Listener = lis

	go func() {
		defer s.cancel()

		if err := s.Server.Serve(lis); err != nil {
			if err.Error() == "http: Server closed" || err.Error() == "context canceled" {
				return
			}
			log.Logger(context.Background()).Error("Could not start http server because "+err.Error(), zap.Error(err))
		}
	}()

	ii = append(ii, util.CreateAddress(s.Listener.Addr().String(), nil))
	for _, endpoint := range s.ListableMux.Patterns() {
		ii = append(ii, util.CreateEndpoint(endpoint, nil))
	}
	return
}

func (s *Server) Stop() error {
	// Return initial context ?
	return s.Server.Shutdown(context.TODO())
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
