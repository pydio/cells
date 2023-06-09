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
	"github.com/pydio/cells/v4/common/service/context/ckeys"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/reflection"
	"net"
	"net/url"
	"reflect"
	"strings"
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
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
)

func init() {
	server.DefaultURLMux().Register("grpc", &Opener{})
}

type Opener struct{}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (server.Server, error) {
	// TODO : transform url parameters to options?
	name := u.Query().Get("name")
	return New(ctx, WithName(name)), nil
}

type Server struct {
	id   string
	name string
	// meta map[string]string

	ctx    context.Context
	cancel context.CancelFunc
	opts   *Options

	*grpc.Server
	regI grpc.ServiceRegistrar

	handlerUnaryInterceptors  []grpc.UnaryServerInterceptor
	handlerStreamInterceptors []grpc.StreamServerInterceptor

	sync.Mutex
}

// New creates the generic grpc.Server
func New(ctx context.Context, opt ...Option) server.Server {
	opts := new(Options)
	for _, o := range opt {
		o(opts)
	}

	// Defaults
	if opts.Name == "" {
		opts.Name = "grpc"
	}

	ctx, cancel := context.WithCancel(ctx)
	return server.NewServer(ctx, &Server{
		id:   "grpc-" + uuid.New(),
		name: opts.Name,
		// meta: make(map[string]string),

		ctx:    ctx,
		cancel: cancel,
		opts:   opts,
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
		regI:   &registrar{Server: s, Mutex: &sync.Mutex{}},
	})

}

func (s *Server) lazyGrpc(ctx context.Context) *grpc.Server {
	s.Lock()
	defer s.Unlock()

	if s.Server != nil {
		return s.Server
	}

	var (
		unaryInterceptors  []grpc.UnaryServerInterceptor
		streamInterceptors []grpc.StreamServerInterceptor
	)

	gs := grpc.NewServer(
		grpc.ChainUnaryInterceptor(
			ErrorFormatUnaryInterceptor,
			servicecontext.MetricsUnaryServerInterceptor(),
			servicecontext.ContextUnaryServerInterceptor(servicecontext.MetaIncomingContext),
			servicecontext.ContextUnaryServerInterceptor(servicecontext.SpanIncomingContext),
			servicecontext.ContextUnaryServerInterceptor(middleware.TargetNameToServiceNameContext(ctx)),
			servicecontext.ContextUnaryServerInterceptor(middleware.ClientConnIncomingContext(ctx)),
			servicecontext.ContextUnaryServerInterceptor(middleware.RegistryIncomingContext(ctx)),
			servicecontext.ContextUnaryServerInterceptor(middleware.TenantIncomingContext(ctx)),
			HandlerUnaryInterceptor(&unaryInterceptors),
			otelgrpc.UnaryServerInterceptor(),
		),
		grpc.ChainStreamInterceptor(
			ErrorFormatStreamInterceptor,
			servicecontext.MetricsStreamServerInterceptor(),
			servicecontext.ContextStreamServerInterceptor(servicecontext.MetaIncomingContext),
			servicecontext.ContextStreamServerInterceptor(servicecontext.SpanIncomingContext),
			servicecontext.ContextStreamServerInterceptor(middleware.TargetNameToServiceNameContext(ctx)),
			servicecontext.ContextStreamServerInterceptor(middleware.ClientConnIncomingContext(ctx)),
			servicecontext.ContextStreamServerInterceptor(middleware.RegistryIncomingContext(ctx)),
			servicecontext.ContextStreamServerInterceptor(middleware.TenantIncomingContext(ctx)),
			HandlerStreamInterceptor(&streamInterceptors),
			otelgrpc.StreamServerInterceptor(),
		),
	)

	wrappedGS := &registrar{
		Server:             gs,
		id:                 s.ID(),
		name:               s.Name(),
		reg:                servicecontext.GetRegistry(s.ctx),
		unaryInterceptors:  &unaryInterceptors,
		streamInterceptors: &streamInterceptors,
		Mutex:              &sync.Mutex{},
	}

	service.RegisterChannelzServiceToServer(wrappedGS)
	grpc_health_v1.RegisterHealthServer(wrappedGS, health.NewServer())
	reflection.Register(wrappedGS)

	s.Server = gs
	s.regI = wrappedGS
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

	return
}

func (s *Server) Stop() error {
	//s.Server.GracefulStop()
	if s.Server != nil {
		s.Server.Stop()
		s.Server = nil
		s.regI = nil
	}
	return nil
}

func (s *Server) ID() string {
	return s.id
}

func (s *Server) Name() string {
	return s.name
}

func (s *Server) As(i interface{}) bool {
	if p, ok := i.(**grpc.Server); ok {
		*p = s.lazyGrpc(s.ctx)
		return true
	}
	if sr, ok2 := i.(*grpc.ServiceRegistrar); ok2 {
		s.lazyGrpc(s.ctx)
		*sr = s.regI
		return true
	}
	return false
}

func (s *Server) Clone() interface{} {
	clone := &Server{}
	clone.id = s.id
	clone.name = s.name
	clone.opts = &Options{
		Name: s.opts.Name,
		Addr: s.opts.Addr,
	}

	return clone
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

type registrar struct {
	*grpc.Server
	id   string
	name string
	reg  registry.Registry

	unaryInterceptors  *[]grpc.UnaryServerInterceptor
	streamInterceptors *[]grpc.StreamServerInterceptor

	*sync.Mutex
}

type enhancedHandler interface {
	AddFilter(func(context.Context, interface{}) bool)
}

type namedHandler interface {
	Name() string
}

func (r *registrar) RegisterService(desc *grpc.ServiceDesc, impl interface{}) {
	r.Lock()
	defer r.Unlock()

	info := r.Server.GetServiceInfo()
	if _, exists := info[desc.ServiceName]; !exists {
		if enhanced, ok := impl.(enhancedHandler); ok {
			enhanced.AddFilter(func(ctx context.Context, i interface{}) bool {
				if named, ok := i.(namedHandler); ok {
					if md, ok := metadata.FromIncomingContext(ctx); ok {
						if named.Name() == strings.Join(md.Get(ckeys.TargetServiceName), "") {
							return true
						}
					}
				}

				return false
			})
		}
		r.Server.RegisterService(desc, impl)
	}

	*r.unaryInterceptors = append(*r.unaryInterceptors, func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
		if named, ok := impl.(namedHandler); ok {
			if md, ok := metadata.FromIncomingContext(ctx); ok {
				if named.Name() == strings.Join(md.Get(ckeys.TargetServiceName), "") {
					// TODO - can't we use method.Handler ?
					method := info.FullMethod[strings.LastIndex(info.FullMethod, "/")+1:]
					outputs := reflect.ValueOf(impl).MethodByName(method).Call([]reflect.Value{reflect.ValueOf(ctx), reflect.ValueOf(req)})

					resp := outputs[0].Interface()
					err := outputs[1].Interface()
					if err != nil {
						return nil, err.(error)
					}

					return resp, nil
				}
			}
		}

		return handler(ctx, req)
	})

	for _, method := range desc.Methods {
		item := util.CreateEndpoint(desc.ServiceName+"/"+method.MethodName, nil)
		r.reg.Register(item, registry.WithEdgeTo(r.id, "instance", nil))
	}

	*r.streamInterceptors = append(*r.streamInterceptors, func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
		for _, method := range desc.Streams {
			targetMethod := info.FullMethod[strings.LastIndex(info.FullMethod, "/")+1:]
			if method.StreamName == targetMethod {
				ctx := ss.Context()

				if named, ok := impl.(namedHandler); ok {
					if md, ok := metadata.FromIncomingContext(ctx); ok {
						if named.Name() == strings.Join(md.Get(ckeys.TargetServiceName), "") {
							return method.Handler(srv, ss)
						}
					}
				}
			}

		}
		return handler(srv, ss)

	})

	for _, method := range desc.Streams {
		item := util.CreateEndpoint(desc.ServiceName+"/"+method.StreamName, nil)
		r.reg.Register(item, registry.WithEdgeTo(r.id, "instance", nil))
	}
}

func (r *registrar) ID() string {
	return r.id
}

func (r *registrar) Name() string {
	return r.name
}

func (r *registrar) Metadata() map[string]string {
	return map[string]string{}
}

func (r *registrar) As(i interface{}) bool {
	if p, ok := i.(**grpc.Server); ok {
		*p = r.Server
		return true
	}
	return false
}
