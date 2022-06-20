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

package grpc

import (
	"context"
	"fmt"
	"net"
	"net/url"
	"sync"

	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/channelz/service"
	"google.golang.org/grpc/health"
	_ "google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/middleware"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func init() {
	server.DefaultURLMux().Register("grpc", &Opener{})
}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (server.Server, error) {
	// TODO : transform url parameters to options?
	return New(ctx), nil
}

type Server struct {
	id   string
	name string
	meta map[string]string

	ctx    context.Context
	cancel context.CancelFunc
	opts   *Options
	*grpc.Server
	sync.Mutex
}

// New creates the generic grpc.Server
func New(ctx context.Context, opt ...Option) server.Server {
	opts := new(Options)
	for _, o := range opt {
		o(opts)
	}
	/*
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

	*/

	ctx, cancel := context.WithCancel(ctx)

	return server.NewServer(ctx, &Server{
		id:   "grpc-" + uuid.New(),
		name: "grpc",
		meta: server.InitPeerMeta(),

		ctx:    ctx,
		cancel: cancel,
		opts:   opts,
		//Server: s,
	})
}

// NewWithServer can pass preset grpc.Server with custom listen address
func NewWithServer(ctx context.Context, name string, s *grpc.Server, listen string) server.Server {
	ctx, cancel := context.WithCancel(ctx)
	id := "grpc-" + uuid.New()
	opts := new(Options)
	opts.Addr = listen
	return server.NewServer(ctx, &Server{
		id:     id,
		name:   name,
		ctx:    ctx,
		cancel: cancel,
		opts:   opts,
		Server: s,
	})

}

func (s *Server) lazyGrpc(ctx context.Context) *grpc.Server {
	s.Lock()
	defer s.Unlock()
	if s.Server != nil {
		return s.Server
	}
	gs := grpc.NewServer(
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
	service.RegisterChannelzServiceToServer(gs)
	grpc_health_v1.RegisterHealthServer(gs, health.NewServer())
	s.Server = gs
	return gs
}

func (s *Server) Type() server.Type {
	return server.TypeGrpc
}

func (s *Server) RawServe(opts *server.ServeOptions) (ii []registry.Item, e error) {
	srv := s.lazyGrpc(s.ctx)
	listener := s.opts.Listener
	if listener == nil {
		addr := s.opts.Addr
		if addr == "" {
			addr = opts.GrpcBindAddress
		}
		if addr == "" {
			return nil, fmt.Errorf("grpc server: missing config address or runtime address")
		}
		lis, err := net.Listen("tcp", addr)
		if err != nil {
			return nil, err
		}

		listener = lis
	}

	var externalAddr string
	addr := listener.Addr().String()
	_, port, err := net.SplitHostPort(addr)
	if err != nil {
		externalAddr = addr
	} else {
		externalAddr = net.JoinHostPort(runtime.DefaultAdvertiseAddress(), port)
	}

	go func() {
		defer s.cancel()

		if err := srv.Serve(listener); err != nil {
			log.Logger(context.Background()).Error("Could not start grpc server because of "+err.Error(), zap.Error(err))
		}
	}()

	// Register address
	ii = append(ii, util.CreateAddress(externalAddr, nil))
	info := srv.GetServiceInfo()
	// Register Endpoints
	for sName, i := range info {
		for _, m := range i.Methods {
			ii = append(ii, util.CreateEndpoint(sName+"."+m.Name, nil))
		}
	}

	return
}

func (s *Server) Stop() error {
	//s.Server.GracefulStop()
	if s.Server != nil {
		s.Server.Stop()
		s.Server = nil
	}
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

func (s *Server) As(i interface{}) bool {
	p, ok := i.(**grpc.Server)
	if !ok {
		return false
	}

	*p = s.lazyGrpc(s.ctx)
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
