package http

import (
	"context"
	"github.com/pydio/cells/v4/common/server/middleware"
	"net"
	"net/http"
	"net/http/pprof"

	"github.com/spf13/viper"

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
	lis, err := net.Listen("tcp", viper.GetString("http.address"))
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
