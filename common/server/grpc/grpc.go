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
	"reflect"
	"strings"
	"sync"

	protovalidate "github.com/bufbuild/protovalidate-go"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	channelz "google.golang.org/grpc/channelz/service"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/grpc/reflection"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/middleware"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/common/utils/uuid"

	_ "google.golang.org/grpc/health"
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
		regI:   &serverRegistrar{Server: s, Mutex: &sync.Mutex{}},
	})
}

func (s *Server) lazyGrpc(rootContext context.Context) *grpc.Server {
	s.Lock()
	defer s.Unlock()

	if s.Server != nil {
		return s.Server
	}

	var (
		unaryInterceptors  []grpc.UnaryServerInterceptor
		streamInterceptors []grpc.StreamServerInterceptor
	)

	var reg registry.Registry
	propagator.Get(rootContext, registry.ContextKey, &reg)

	unaryInterceptors = append(unaryInterceptors,

		func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
			ctx = propagator.ForkContext(ctx, rootContext)

			serviceName := runtime.GetServiceName(ctx)
			if serviceName != "" {
				endpoints := reg.ListAdjacentItems(
					registry.WithAdjacentSourceItems([]registry.Item{s}),
					registry.WithAdjacentTargetOptions(registry.WithName(info.FullMethod), registry.WithType(pb.ItemType_ENDPOINT)),
				)

				for _, endpoint := range endpoints {
					ep := endpoint.(registry.Endpoint)

					services := reg.ListAdjacentItems(
						registry.WithAdjacentSourceItems([]registry.Item{endpoint}),
						registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_SERVICE)),
					)

					var svc service.Service
					for _, service := range services {
						if service.Name() == serviceName {
							service.As(&svc)
							break
						}
					}

					if svc == nil {
						continue
					}

					ctx = propagator.With(ctx, service.ContextKey, svc)

					method := info.FullMethod[strings.LastIndex(info.FullMethod, "/")+1:]
					outputs := reflect.ValueOf(ep.Handler()).MethodByName(method).Call([]reflect.Value{reflect.ValueOf(ctx), reflect.ValueOf(req)})

					resp := outputs[0].Interface()
					err := outputs[1].Interface()
					if err != nil {
						return nil, err.(error)
					}

					return resp, nil
				}

				return nil, grpc.ErrServerStopped
			}

			return handler(ctx, req)
		},

		func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
			v, err := protovalidate.New()
			if err != nil {
				return nil, err
			}

			if err = v.Validate(req.(proto.Message)); err != nil {
				return nil, err
			}

			return handler(ctx, req)
		},
	)

	streamInterceptors = append(streamInterceptors,
		//func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
		//	v, err := protovalidate.New()
		//	if err != nil {
		//		fmt.Println("failed to initialize validator:", err)
		//	}
		//
		//	if err = v.Validate(req.(proto.Message)); err != nil {
		//		fmt.Println("validation failed:", err)
		//	} else {
		//		fmt.Println("validation succeeded")
		//	}
		//
		//	return handler(srv, ss)
		//},
		func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
			ctx := propagator.ForkContext(ss.Context(), rootContext)

			serviceName := runtime.GetServiceName(ctx)
			if serviceName != "" {
				endpoints := reg.ListAdjacentItems(
					registry.WithAdjacentSourceItems([]registry.Item{s}),
					registry.WithAdjacentEdgeOptions(registry.WithName("server"), registry.WithMeta("serverType", "grpc")),
					registry.WithAdjacentTargetOptions(registry.WithName(info.FullMethod), registry.WithType(pb.ItemType_ENDPOINT)),
				)

				for _, endpoint := range endpoints {
					services := reg.ListAdjacentItems(
						registry.WithAdjacentSourceItems([]registry.Item{endpoint}),
						registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_SERVICE)),
					)

					var svc service.Service
					for _, service := range services {
						if service.Name() == serviceName {
							service.As(&svc)
							break
						}
					}

					if svc == nil {
						continue
					}

					ep := endpoint.(registry.Endpoint)

					ctx = propagator.With(ctx, service.ContextKey, svc)

					wrapped := grpc_middleware.WrapServerStream(ss)
					wrapped.WrappedContext = ctx

					return handler(ep.Handler(), wrapped)
				}

				//return grpc.ErrServerStopped
			}

			return handler(srv, ss)
		})

	// Recovery
	// Define customfunc to handle panic
	customFunc := func(p interface{}) (err error) {
		return status.Errorf(codes.Unknown, "panic triggered: %v", p)
	}
	// Shared options for the logger, with a custom gRPC code to log level function.
	recoveryOpts := []grpc_recovery.Option{
		grpc_recovery.WithRecoveryHandler(customFunc),
	}

	serverOptions := []grpc.ServerOption{
		grpc.ChainUnaryInterceptor(
			grpc_recovery.UnaryServerInterceptor(recoveryOpts...),
			middleware.MetricsUnaryServerInterceptor(),
			propagator.ContextUnaryServerInterceptor(middleware.CellsMetadataIncomingContext),
			propagator.ContextUnaryServerInterceptor(middleware.TargetNameToServiceNameContext(rootContext)),
			propagator.ContextUnaryServerInterceptor(middleware.ClientConnIncomingContext(rootContext)),
			propagator.ContextUnaryServerInterceptor(middleware.RegistryIncomingContext(rootContext)),
			propagator.ContextUnaryServerInterceptor(middleware.TenantIncomingContext(rootContext)),
			propagator.ContextUnaryServerInterceptor(middleware.ServiceIncomingContext(rootContext)),
			middleware.ErrorFormatUnaryInterceptor,
			HandlerUnaryInterceptor(&unaryInterceptors),
		),
		grpc.ChainStreamInterceptor(
			middleware.ErrorFormatStreamInterceptor,
			grpc_recovery.StreamServerInterceptor(recoveryOpts...),
			middleware.MetricsStreamServerInterceptor(),
			propagator.ContextStreamServerInterceptor(middleware.CellsMetadataIncomingContext),
			propagator.ContextStreamServerInterceptor(middleware.TargetNameToServiceNameContext(rootContext)),
			propagator.ContextStreamServerInterceptor(middleware.ClientConnIncomingContext(rootContext)),
			propagator.ContextStreamServerInterceptor(middleware.RegistryIncomingContext(rootContext)),
			propagator.ContextStreamServerInterceptor(middleware.TenantIncomingContext(rootContext)),
			propagator.ContextStreamServerInterceptor(middleware.ServiceIncomingContext(rootContext)),
			HandlerStreamInterceptor(&streamInterceptors),
		),
	}
	// Append stats handlers if there are registered ones
	serverOptions = append(serverOptions, middleware.GrpcServerStatsHandler(rootContext)...)

	gs := grpc.NewServer(serverOptions...)

	wrappedGS := &serverRegistrar{
		Server:             gs,
		id:                 s.ID(),
		name:               s.Name(),
		reg:                reg,
		unaryInterceptors:  &unaryInterceptors,
		streamInterceptors: &streamInterceptors,
		Mutex:              &sync.Mutex{},
	}

	channelz.RegisterChannelzServiceToServer(wrappedGS)
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

func (s *Server) Metadata() map[string]string {
	return map[string]string{}
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
	return &grpc_health_v1.HealthCheckResponse{
		Status: grpc_health_v1.HealthCheckResponse_SERVING,
	}, nil
}

func (h *Handler) Watch(req *grpc_health_v1.HealthCheckRequest, w grpc_health_v1.Health_WatchServer) error {
	return nil
}

type serverRegistrar struct {
	*grpc.Server
	id   string
	name string
	reg  registry.Registry

	unaryInterceptors  *[]grpc.UnaryServerInterceptor
	streamInterceptors *[]grpc.StreamServerInterceptor

	*sync.Mutex
}

func (r *serverRegistrar) GetServiceInfo() map[string]grpc.ServiceInfo {

	endpoints := r.reg.ListAdjacentItems(
		registry.WithAdjacentSourceOptions(registry.WithName("grpc"), registry.WithType(pb.ItemType_SERVER)),
		registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_ENDPOINT)),
	)

	//endpoints, err := r.reg.List(registry.WithType(pb.ItemType_ENDPOINT))
	//if err != nil {
	//	return r.Server.GetServiceInfo()
	//}

	info := map[string]grpc.ServiceInfo{}
	for _, endpoint := range endpoints {
		name := endpoint.Name()
		service := name[1:strings.LastIndex(name, "/")]
		method := name[strings.LastIndex(name, "/")+1:]

		svcInfo, ok := info[service]
		if !ok {
			svcInfo = grpc.ServiceInfo{}
		}

		svcInfo.Methods = append(svcInfo.Methods, grpc.MethodInfo{
			Name: method,
		})

		info[service] = svcInfo
	}

	return info
}

func (r *serverRegistrar) RegisterService(desc *grpc.ServiceDesc, impl interface{}) {
	r.Lock()
	defer r.Unlock()

	// Making sure we don't panic if the same service info has already been registered in the main grpc
	info := r.Server.GetServiceInfo()
	if _, exists := info[desc.ServiceName]; !exists {
		r.Server.RegisterService(desc, impl)
	}

	for _, method := range desc.Methods {
		endpoint := util.CreateEndpoint("/"+desc.ServiceName+"/"+method.MethodName, impl, map[string]string{})

		//fmt.Println("Registering ", "/"+desc.ServiceName+"/"+method.MethodName, endpoint.ID(), r.id)
		r.reg.Register(endpoint,
			registry.WithEdgeTo(r.id, "server", map[string]string{
				"serverType": "grpc",
			}),
		)
	}

	for _, method := range desc.Streams {
		endpoint := util.CreateEndpoint("/"+desc.ServiceName+"/"+method.StreamName, impl, map[string]string{})

		r.reg.Register(endpoint,
			registry.WithEdgeTo(r.id, "server", map[string]string{
				"serverType": "grpc",
			}))
	}
}

func (r *serverRegistrar) ID() string {
	return r.id
}

func (r *serverRegistrar) Name() string {
	return r.name
}

func (r *serverRegistrar) Metadata() map[string]string {
	return map[string]string{}
}

func (r *serverRegistrar) As(i interface{}) bool {
	if p, ok := i.(**grpc.Server); ok {
		*p = r.Server
		return true
	}
	if p, ok := i.(*grpc.ServiceRegistrar); ok {
		*p = r
		return true
	}
	return false
}
