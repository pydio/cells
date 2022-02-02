package grpc

import (
	"context"
	"net"

	"github.com/spf13/viper"
	"google.golang.org/grpc"
	"google.golang.org/grpc/channelz/service"

	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/middleware"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type Server struct {
	id   string
	name string
	meta map[string]string

	cancel context.CancelFunc
	opts   *Options
	addr   string
	*grpc.Server
}

// New creates the generic grpc.Server
func New(ctx context.Context, opt ...Option) server.Server {
	opts := new(Options)
	for _, o := range opt {
		o(opts)
	}
	s := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			servicecontext.MetricsUnaryServerInterceptor(),
			servicecontext.ContextUnaryServerInterceptor(servicecontext.MetaIncomingContext),
			servicecontext.ContextUnaryServerInterceptor(servicecontext.SpanIncomingContext),
			servicecontext.ContextUnaryServerInterceptor(middleware.TargetNameToServiceNameContext(ctx)),
			servicecontext.ContextUnaryServerInterceptor(middleware.ClientConnIncomingContext(ctx)),
			servicecontext.ContextUnaryServerInterceptor(middleware.RegistryIncomingContext(ctx)),
		),
		grpc.ChainStreamInterceptor(
			servicecontext.MetricsStreamServerInterceptor(),
			servicecontext.ContextStreamServerInterceptor(servicecontext.MetaIncomingContext),
			servicecontext.ContextStreamServerInterceptor(servicecontext.SpanIncomingContext),
			servicecontext.ContextStreamServerInterceptor(middleware.TargetNameToServiceNameContext(ctx)),
			servicecontext.ContextStreamServerInterceptor(middleware.ClientConnIncomingContext(ctx)),
			servicecontext.ContextStreamServerInterceptor(middleware.RegistryIncomingContext(ctx)),
		),
	)

	service.RegisterChannelzServiceToServer(s)

	ctx, cancel := context.WithCancel(ctx)

	return server.NewServer(ctx, &Server{
		id:   "grpc-" + uuid.New(),
		name: "grpc",
		meta: server.InitPeerMeta(),

		cancel: cancel,
		addr:   viper.GetString("grpc.address"),
		opts:   opts,
		Server: s,
	})
}

// NewWithServer can pass preset grpc.Server with custom listen address
func NewWithServer(ctx context.Context, s *grpc.Server, listen string) server.Server {
	ctx, cancel := context.WithCancel(ctx)
	return server.NewServer(ctx, &Server{
		name:   "grpc-" + uuid.New(),
		cancel: cancel,
		addr:   listen,
		Server: s,
		opts:   new(Options),
	})

}

func (s *Server) Type() server.ServerType {
	return server.ServerType_GRPC
}

func (s *Server) Serve() error {
	if s.opts.Listener == nil {
		lis, err := net.Listen("tcp", s.addr)
		if err != nil {
			return err
		}

		s.opts.Listener = lis
		// fmt.Println("Serving Grpc (net.Listener.Addr()) " + lis.Addr().String())
	}

	go func() {
		defer s.cancel()

		if err := s.Server.Serve(s.opts.Listener); err != nil {
			// TODO v4 - log or summat
		}
	}()

	return nil
}

func (s *Server) Stop() error {
	s.Server.GracefulStop()

	return nil
}

func (s *Server) ID() string {
	return s.id
}

func (s *Server) Name() string {
	return s.name
}

func (s *Server) Metadata() map[string]string {
	return s.meta // map[string]string{}
}

func (s *Server) Address() []string {
	if s.opts.Listener == nil {
		return []string{}
	}
	return []string{s.opts.Listener.Addr().String()}
}

func (s *Server) Endpoints() []string {
	var endpoints []string

	info := s.Server.GetServiceInfo()
	for _, i := range info {
		for _, m := range i.Methods {
			endpoints = append(endpoints, m.Name)
		}
	}

	return endpoints
}

func (s *Server) As(i interface{}) bool {
	p, ok := i.(**grpc.Server)
	if !ok {
		return false
	}

	*p = s.Server
	return true
}
