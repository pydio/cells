/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package middleware

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"

	"github.com/pydio/cells/v5/common"
	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/server"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/telemetry/tracing"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

type HttpContextModifier func(r *http.Request) (*http.Request, error)

var (
	outgoingModifiers     []propagator.OutgoingContextModifier
	incomingModifiers     []propagator.IncomingContextModifier
	httpIncomingModifiers []HttpContextModifier

	recoverOptions = []grpc_recovery.Option{
		grpc_recovery.WithRecoveryHandlerContext(func(ctx context.Context, p interface{}) (err error) {
			// Handle now and log
			errString := fmt.Sprintf("%v", p)
			log.Logger(ctx).Error("Panic in grpc "+errString, zap.Error(err), zap.StackSkip("stack", 4))
			st, _ := status.New(codes.Internal, errString).WithDetails(&service.ErrorSentinel{Name: "handled"})
			return st.Err()
		}),
	}
)

// RegisterModifier registers a middleware
func RegisterModifier(m any) {
	switch v := m.(type) {
	case propagator.OutgoingContextModifier:
		outgoingModifiers = append(outgoingModifiers, v)
	case propagator.IncomingContextModifier:
		incomingModifiers = append(incomingModifiers, v)
	case HttpContextModifier:
		httpIncomingModifiers = append(httpIncomingModifiers, v)
	default:
		panic("unknown propagator type")
	}
}

// GrpcUnaryClientInterceptors returns a list of grpc.UnaryClientInterceptor
func GrpcUnaryClientInterceptors() []grpc.UnaryClientInterceptor {
	uu := []grpc.UnaryClientInterceptor{
		ErrorNoMatchedRouteRetryUnaryClientInterceptor(),
		ErrorFormatUnaryClientInterceptor(),
		propagator.MetaUnaryClientInterceptor(common.CtxCellsMetaPrefix),
	}
	for _, o := range outgoingModifiers {
		uu = append(uu, propagator.ContextUnaryClientInterceptor(o))
	}
	return uu
}

// GrpcStreamClientInterceptors returns a list of grpc.StreamClientInterceptor
func GrpcStreamClientInterceptors() []grpc.StreamClientInterceptor {
	uu := []grpc.StreamClientInterceptor{
		ErrorNoMatchedRouteRetryStreamClientInterceptor(),
		ErrorFormatStreamClientInterceptor(),
		propagator.MetaStreamClientInterceptor(common.CtxCellsMetaPrefix),
	}
	for _, o := range outgoingModifiers {
		uu = append(uu, propagator.ContextStreamClientInterceptor(o))
	}
	return uu
}

// GrpcUnaryServerInterceptors returns a list of grpc.UnaryServerInterceptor
func GrpcUnaryServerInterceptors(rootContext context.Context) []grpc.UnaryServerInterceptor {
	uu := []grpc.UnaryServerInterceptor{
		MetricsUnaryServerInterceptor(),
		propagator.ContextUnaryServerInterceptor(CellsMetadataIncomingContext),
		propagator.ContextUnaryServerInterceptor(TargetNameToServiceNameContext(rootContext)),
		grpc_recovery.UnaryServerInterceptor(recoverOptions...),
		propagator.ContextUnaryServerInterceptor(ClientConnIncomingContext(rootContext)),
		propagator.ContextUnaryServerInterceptor(RegistryIncomingContext(rootContext)),
		propagator.ContextUnaryServerInterceptor(ServiceIncomingContext(rootContext)),
	}
	for _, o := range incomingModifiers {
		uu = append(uu, propagator.ContextUnaryServerInterceptor(o))
	}
	uu = append(uu, ErrorFormatUnaryInterceptor)
	return uu
}

// GrpcStreamServerInterceptors returns a list of grpc.StreamServerInterceptor
func GrpcStreamServerInterceptors(rootContext context.Context) []grpc.StreamServerInterceptor {
	uu := []grpc.StreamServerInterceptor{
		MetricsStreamServerInterceptor(),
		propagator.ContextStreamServerInterceptor(CellsMetadataIncomingContext),
		propagator.ContextStreamServerInterceptor(TargetNameToServiceNameContext(rootContext)),
		grpc_recovery.StreamServerInterceptor(recoverOptions...),
		propagator.ContextStreamServerInterceptor(ClientConnIncomingContext(rootContext)),
		propagator.ContextStreamServerInterceptor(RegistryIncomingContext(rootContext)),
		propagator.ContextStreamServerInterceptor(ServiceIncomingContext(rootContext)),
	}
	for _, o := range incomingModifiers {
		uu = append(uu, propagator.ContextStreamServerInterceptor(o))
	}
	uu = append(uu, ErrorFormatStreamInterceptor)
	return uu
}

// ClientConnIncomingContext adds the ClientConn to context
func ClientConnIncomingContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	clientConn := runtime.GetClientConn(serverRuntimeContext)
	return func(ctx context.Context) (context.Context, bool, error) {
		return runtime.WithClientConn(ctx, clientConn), true, nil
	}
}

// RegistryIncomingContext injects the registry in context
func RegistryIncomingContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	return func(ct context.Context) (context.Context, bool, error) {
		ctx := propagator.ForkContext(ct, serverRuntimeContext)
		ctxProvider := runtime.MultiContextManager().CurrentContextProvider(ctx)
		if ctxProvider != nil {
			return ctxProvider.Context(ctx), true, nil
		} else {
			fmt.Println("Failed to get current context")
		}
		return ctx, true, nil
	}
}

// TargetNameToServiceNameContext extracts service name from grpc meta "targetname" and inject it in the context
func TargetNameToServiceNameContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	return func(ctx context.Context) (context.Context, bool, error) {
		if md, ok := metadata.FromIncomingContext(ctx); ok {
			if tName := md.Get(common.CtxTargetServiceName); strings.Join(tName, "") != "" {
				return runtime.WithServiceName(ctx, strings.Join(tName, "")), true, nil
			}
		}
		return ctx, false, nil
	}
}

func ApplyGRPCIncomingContextModifiers(ctx context.Context) (ct context.Context, modified bool, er error) {
	ct = ctx
	for _, o := range incomingModifiers {
		var b bool
		ct, b, er = o(ct)
		if b {
			modified = true
		}
	}
	return
}

func ApplyGRPCOutgoingContextModifiers(ctx context.Context) (ct context.Context) {
	ct = ctx
	for _, o := range outgoingModifiers {
		ct = o(ct)
	}
	return
}

func ApplyHTTPIncomingContextModifiers(r *http.Request) (*http.Request, error) {
	var er error
	for _, o := range httpIncomingModifiers {
		r, er = o(r)
		if er != nil {
			return nil, er
		}
	}
	return r, nil
}

func setContextForService(ctx context.Context) context.Context {
	service := "default"
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		if t := md.Get("service"); len(t) > 0 {
			service = strings.Join(t, "")
		}
	}

	//c := servercontext.GetConfig(ctx)

	//ctx = context2.WithConfig(ctx, c.Val("services", service))
	ctx = runtime.WithServiceName(ctx, service)
	return ctx
}

func ServiceIncomingContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	return func(ctx context.Context) (context.Context, bool, error) {
		ctx = setContextForService(ctx)

		return ctx, true, nil
	}
}

func WebIncomingContextMiddleware(ct context.Context, endpoint string, serviceContextKey any, srv server.Server, h http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
		var span trace.Span
		ctx := req.Context()
		ctx, span = tracing.StartLocalSpan(ctx, "WebIncomingContextMiddleware")
		defer span.End()

		ctx = propagator.ForkContext(ctx, ct)
		ctx = runtime.MultiContextManager().CurrentContextProvider(ctx).Context(ctx)

		var svc registry.Service
		if !propagator.Get(ctx, serviceContextKey, &svc) {
			log.Logger(ctx).Debug("Service not set, resolve it with registry")

			var reg registry.Registry
			propagator.Get(ctx, registry.ContextKey, &reg)

			// Reparse RequestURI to remove query string ?xxxx
			origPath := req.RequestURI
			u, _ := url.Parse(origPath)
			path := strings.TrimSuffix(u.Path, req.URL.Path)
			if endpoint != "" {
				path = endpoint
			}

			log.Logger(ctx).Debug("Start List Endpoints")

			endpoints := reg.ListAdjacentItems(
				registry.WithAdjacentSourceItems([]registry.Item{srv}),
				registry.WithAdjacentTargetOptions(registry.WithName(path), registry.WithType(pb.ItemType_ENDPOINT)),
			)

			log.Logger(ctx).Debug("End List endpoints")

			for _, ep := range endpoints {
				services := reg.ListAdjacentItems(
					registry.WithAdjacentSourceItems([]registry.Item{ep}),
					registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_SERVICE)),
				)

				if len(services) != 1 {
					continue
				}

				ctx = propagator.With(ctx, serviceContextKey, services[0])
			}
		}

		log.Logger(ctx).Debug("End List Adjacents, start ApplyHTTPIncoming")
		req = req.WithContext(ctx)
		var er error
		if req, er = ApplyHTTPIncomingContextModifiers(req); er != nil {
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}
		log.Logger(ctx).Debug("End ApplyHTTPIncoming")
		h.ServeHTTP(rw, req)
	})
}

func HttpContextWrapper(svcContext context.Context, h http.Handler) http.Handler {
	return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {

		// First we retrieve the multicontext current provider
		ctx := runtime.MultiContextManager().CurrentContextProvider(req.Context()).Context(req.Context())
		ctx = runtime.MultiContextManager().CurrentContextProvider(ctx).Context(ctx)
		var reg registry.Registry
		propagator.Get(ctx, registry.ContextKey, &reg)
		req, _ = ApplyHTTPIncomingContextModifiers(req.WithContext(ctx))
		h.ServeHTTP(rw, req)
	})
}
