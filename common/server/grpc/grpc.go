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
	"errors"
	"fmt"
	"net"
	"net/url"
	"reflect"
	"strings"
	"sync"

	protovalidate "github.com/bufbuild/protovalidate-go"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	channelz "google.golang.org/grpc/channelz/service"
	"google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/grpc/reflection"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/server"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/server/middleware"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/storage"
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

	var manager manager.Manager
	runtime.Get(ctx, "manager", &manager)

	reg := servicecontext.GetRegistry(s.ctx)

	unaryInterceptors = append(unaryInterceptors,

		func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
			serviceName := servicecontext.GetServiceName(ctx)
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

					// Inject dao in handler
					for _, store := range svc.Options().Storages {
						handlerV := reflect.ValueOf(store.Handler)
						handlerT := reflect.TypeOf(store.Handler)
						if handlerV.Kind() != reflect.Func {
							return nil, errors.New("storage handler is not a function")
						}
						if handlerT.NumIn() != 1 {
							return nil, errors.New("storage handler should have only 1 argument")
						}

						cfg := servercontext.GetConfig(ctx)
						cfg.Val("services", svc.Name(), "db", "driver")

						db := reflect.New(handlerT.In(0))

						manager.GetStorage(ctx, "sql", db.Interface())

						// Checking all migrations
						err := service.UpdateServiceVersion(ctx, config.Main(), svc.Options())
						if err != nil {
							return nil, err
						}

						dao := handlerV.Call([]reflect.Value{db.Elem()})

						ctx = servicecontext.WithDAO(ctx, dao[0].Interface())
					}

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
			// tenant := servercontext.GetTenant(ss.Context())
			serviceName := servicecontext.GetServiceName(ss.Context())
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

					// Inject dao in handler
					for _, store := range svc.Options().Storages {
						handlerV := reflect.ValueOf(store.Handler)
						handlerT := reflect.TypeOf(store.Handler)
						if handlerV.Kind() != reflect.Func {
							return errors.New("storage handler is not a function")
						}
						if handlerT.NumIn() != 1 && handlerT.NumIn() != 2 {
							return errors.New("storage handler should have only 1 argument")
						}

						db := reflect.New(handlerT.In(handlerT.NumIn() - 1))
						if !storage.Get(ctx, db.Interface()) {
							return fmt.Errorf("Could not retrieve storage for some reason")
						}

						args := []reflect.Value{db.Elem()}
						if handlerT.NumIn() != 1 {
							args = append([]reflect.Value{reflect.ValueOf(ctx)}, args...)
						}

						fmt.Println(args)

						dao := handlerV.Call(args)

						field := reflect.ValueOf(ep.Handler()).Elem().FieldByName(store.Key)
						if field.CanSet() {
							if dao[0].IsValid() {
								field.Set(dao[0])
							}
						}

						ctx = servicecontext.WithDAO(ss.Context(), dao[0].Interface())
					}

					wrapped := grpc_middleware.WrapServerStream(ss)
					wrapped.WrappedContext = ctx
					return handler(ep.Handler(), wrapped)
				}
			}

			return handler(srv, ss)
		})

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
			servicecontext.ContextUnaryServerInterceptor(middleware.ServiceIncomingContext(ctx)),
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
			servicecontext.ContextStreamServerInterceptor(middleware.ServiceIncomingContext(ctx)),
			HandlerStreamInterceptor(&streamInterceptors),
			otelgrpc.StreamServerInterceptor(),
		),
	)

	wrappedGS := &serverRegistrar{
		Server:             gs,
		id:                 s.ID(),
		name:               s.Name(),
		reg:                servicecontext.GetRegistry(s.ctx),
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
			info[service] = svcInfo
		}

		svcInfo.Methods = append(svcInfo.Methods, grpc.MethodInfo{
			Name: method,
		})
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
