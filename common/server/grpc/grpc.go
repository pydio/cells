package grpc

import (
	"context"
	"fmt"
	"net"

	"github.com/pydio/cells/v4/common/config/runtime"

	"google.golang.org/grpc/health"

	_ "google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"

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

	cancel       context.CancelFunc
	opts         *Options
	addr         string
	externalAddr string
	*grpc.Server
}

// New creates the generic grpc.Server
func New(ctx context.Context, opt ...Option) server.Server {
	opts := new(Options)
	for _, o := range opt {
		o(opts)
	}
	s := grpc.NewServer(
		// grpc.MaxConcurrentStreams(1000),
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
			//servicecontext.StreamsCounter(),
		),
	)

	service.RegisterChannelzServiceToServer(s)
	grpc_health_v1.RegisterHealthServer(s, health.NewServer())

	ctx, cancel := context.WithCancel(ctx)

	return server.NewServer(ctx, &Server{
		id:   "grpc-" + uuid.New(),
		name: "grpc",
		meta: server.InitPeerMeta(),

		cancel: cancel,
		addr:   viper.GetString("grpc_port"),
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
	}

	addr := s.opts.Listener.Addr().String()
	_, port, err := net.SplitHostPort(addr)
	if err == nil {
		s.externalAddr = addr
	} else {
		s.externalAddr = net.JoinHostPort(runtime.DefaultAdvertiseAddress(), port)
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
	return []string{s.externalAddr}
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

type Handler struct{}

func (h *Handler) Check(ctx context.Context, req *grpc_health_v1.HealthCheckRequest) (*grpc_health_v1.HealthCheckResponse, error) {
	fmt.Println("health checking")
	return &grpc_health_v1.HealthCheckResponse{
		Status: grpc_health_v1.HealthCheckResponse_SERVING,
	}, nil
}

func (h *Handler) Watch(req *grpc_health_v1.HealthCheckRequest, w grpc_health_v1.Health_WatchServer) error {
	return nil
}
