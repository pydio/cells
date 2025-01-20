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
	"encoding/gob"
	"fmt"
	"net"
	"net/url"
	"reflect"
	"strings"
	"sync"

	protovalidate "github.com/bufbuild/protovalidate-go"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	channelz "google.golang.org/grpc/channelz/service"
	"google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"
	"google.golang.org/grpc/reflection"
	"google.golang.org/grpc/xds"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common/middleware"
	pb "github.com/pydio/cells/v5/common/proto/registry"
	server2 "github.com/pydio/cells/v5/common/proto/server"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/registry/util"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/server"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/telemetry/tracing"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/uuid"

	_ "google.golang.org/grpc/health"
)

func init() {
	gob.Register(&grpc.Server{})
	server.DefaultURLMux().Register("grpc", &Opener{})
	server.DefaultURLMux().Register("xds", &Opener{})
}

type Opener struct {
}

func (o *Opener) OpenURL(ctx context.Context, u *url.URL) (server.Server, error) {
	// TODO : transform url parameters to options?
	name := u.Query().Get("name")
	return New(ctx, WithScheme(u.Scheme), WithName(name)), nil
}

type IServer interface {
	RegisterService(sd *grpc.ServiceDesc, ss any)
	GetServiceInfo() map[string]grpc.ServiceInfo
	Serve(lis net.Listener) error
	Stop()
	GracefulStop()
}

type Server struct {
	id   string
	name string
	// meta map[string]string

	ctx    context.Context
	cancel context.CancelFunc
	opts   *Options

	Server IServer
	regI   grpc.ServiceRegistrar

	handlerUnaryInterceptors  []grpc.UnaryServerInterceptor
	handlerStreamInterceptors []grpc.StreamServerInterceptor

	lock sync.Mutex
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
	s := &Server{
		id:   "grpc-" + uuid.New(),
		name: opts.Name,
		// meta: make(map[string]string),

		ctx:    ctx,
		cancel: cancel,
		opts:   opts,
	}

	s.lazyGrpc(ctx)

	return server.NewServer(ctx, s)
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
		regI:   &serverRegistrar{Server: s, RWMutex: &sync.RWMutex{}},
	})
}

func (s *Server) lazyGrpc(rootContext context.Context) IServer {
	s.lock.Lock()
	defer s.lock.Unlock()

	if s.Server != nil {
		return s.Server
	}

	var reg registry.Registry
	propagator.Get(rootContext, registry.ContextKey, &reg)

	unaryFinalInterceptors := []grpc.UnaryServerInterceptor{

		// this is the final handler - endpoint has been found earlier in the chain
		func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
			var span trace.Span
			ctx, span = tracing.StartLocalSpan(ctx, "UnaryInterceptor.Final")
			defer span.End()

			serviceName := runtime.GetServiceName(ctx)
			if serviceName != "" && serviceName != "default" {
				var ep registry.Endpoint

				if propagator.Get(ctx, EndpointKey, &ep) {
					method := info.FullMethod[strings.LastIndex(info.FullMethod, "/")+1:]
					outputs := reflect.ValueOf(ep.Handler()).MethodByName(method).Call([]reflect.Value{reflect.ValueOf(ctx), reflect.ValueOf(req)})
					resp := outputs[0].Interface()
					err := outputs[1].Interface()
					if err != nil {
						return nil, err.(error)
					}

					return resp, nil
				}
			}

			return handler(ctx, req)
		},

		func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
			var span trace.Span
			ctx, span = tracing.StartLocalSpan(ctx, "UnaryInterceptor.Validate")
			defer span.End()

			v, err := protovalidate.New()
			if err != nil {
				return nil, err
			}

			if err = v.Validate(req.(proto.Message)); err != nil {
				return nil, err
			}

			return handler(ctx, req)
		},
	}

	streamFinalInterceptors := []grpc.StreamServerInterceptor{
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

		// This is the final handler - endpoint has been found earlier in the chain
		func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
			ctx := ss.Context()
			serviceName := runtime.GetServiceName(ctx)
			if serviceName != "" && serviceName != "default" {
				var ep registry.Endpoint
				if propagator.Get(ctx, EndpointKey, &ep) {
					return handler(ep.Handler(), ss)
				}
			}

			return handler(srv, ss)
		},
	}

	unaryMiddlewares := append(
		middleware.GrpcUnaryServerInterceptors(rootContext),
		unaryEndpointInterceptor(rootContext, s),
		HandlerUnaryInterceptor(&unaryFinalInterceptors),
	)

	streamMiddlewares := append(
		middleware.GrpcStreamServerInterceptors(rootContext),
		streamEndpointInterceptor(rootContext, s),
		HandlerStreamInterceptor(&streamFinalInterceptors),
	)

	serverOptions := []grpc.ServerOption{
		grpc.ChainUnaryInterceptor(unaryMiddlewares...),
		grpc.ChainStreamInterceptor(streamMiddlewares...),
	}

	// Append stats handlers if there are registered ones
	serverOptions = append(serverOptions, middleware.GrpcServerStatsHandler(rootContext)...)

	serverOptions = append(serverOptions, xds.ServingModeCallback(func(addr net.Addr, args xds.ServingModeChangeArgs) {
		fmt.Println("Changed mode ", addr, args)
	}))

	var gs IServer
	if s.opts.Scheme == "xds" {
		if srv, err := xds.NewGRPCServer(serverOptions...); err != nil {
			return nil
		} else {
			gs = srv
		}

	} else {
		gs = grpc.NewServer(serverOptions...)
	}

	wrappedGS := &serverRegistrar{
		Server:             gs,
		id:                 s.ID(),
		name:               s.Name(),
		reg:                reg,
		unaryInterceptors:  &unaryFinalInterceptors,
		streamInterceptors: &streamFinalInterceptors,
		RWMutex:            &sync.RWMutex{},
	}

	channelz.RegisterChannelzServiceToServer(wrappedGS)
	hs := health.NewServer()
	grpc_health_v1.RegisterHealthServer(wrappedGS, hs)
	server2.RegisterReadyzServer(wrappedGS, server2.NewReadyzServer(hs))
	reflection.Register(wrappedGS)

	s.Server = gs
	s.regI = wrappedGS
	return gs
}

func (s *Server) Type() server.Type {
	return server.TypeGrpc
}

func (s *Server) RawServe(opts *server.ServeOptions) (ii []registry.Item, e error) {

	srv := s.lazyGrpc(opts.Context)

	listener := opts.Listener
	if listener == nil {
		return nil, fmt.Errorf("should have a listener")
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
			log.Logger(opts.Context).Error("Could not start grpc server because of "+err.Error(), zap.Error(err))
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
		*p = s.lazyGrpc(s.ctx).(*grpc.Server)
		return true
	}
	if sr, ok2 := i.(*grpc.ServiceRegistrar); ok2 {
		s.lazyGrpc(s.ctx)
		*sr = s.regI
		return true
	}
	if l, ok := i.(*sync.Locker); ok {
		*l = s.regI.(*serverRegistrar)
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
	Server IServer
	id     string
	name   string
	reg    registry.Registry

	unaryInterceptors  *[]grpc.UnaryServerInterceptor
	streamInterceptors *[]grpc.StreamServerInterceptor

	*sync.RWMutex
}

func (r *serverRegistrar) GetServiceInfo() map[string]grpc.ServiceInfo {
	r.RLock()
	defer r.RUnlock()

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

		if r.reg != nil {
			r.reg.Register(endpoint,
				registry.WithEdgeTo(r.id, "server", map[string]string{"serverType": "grpc"}),
			)
		}
	}

	for _, method := range desc.Streams {
		endpoint := util.CreateEndpoint("/"+desc.ServiceName+"/"+method.StreamName, impl, map[string]string{})

		if r.reg != nil {
			r.reg.Register(endpoint,
				registry.WithEdgeTo(r.id, "server", map[string]string{
					"serverType": "grpc",
				}))
		}
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
		*p = r.Server.(*grpc.Server)
		return true
	}
	if p, ok := i.(*grpc.ServiceRegistrar); ok {
		*p = r
		return true
	}
	return false
}
