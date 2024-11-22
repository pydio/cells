package grpc

import (
	"context"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/grpc"

	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/tracing"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

type endpointKey struct{}

var EndpointKey = endpointKey{}

func contextEndpointRegistry(ctx context.Context, s registry.Item, reg registry.Registry, fullMethod string) context.Context {
	var sp trace.Span
	ctx, sp = tracing.StartLocalSpan(ctx, "ContextEndpointRegistry")
	defer sp.End()

	serviceName := runtime.GetServiceName(ctx)
	if serviceName != "" && serviceName != "default" {
		sp.AddEvent("Before adjacent items")
		endpoints := reg.ListAdjacentItems(
			registry.WithAdjacentSourceItems([]registry.Item{s}),
			registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_ENDPOINT)),
		)

		sp.AddEvent("After adjacent items")

		for _, endpoint := range endpoints {
			if endpoint.Name() != fullMethod {
				continue
			}

			ep := endpoint.(registry.Endpoint)

			sp.AddEvent("Before adjacent service")
			services := reg.ListAdjacentItems(
				registry.WithAdjacentSourceItems([]registry.Item{endpoint}),
				registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_SERVICE)),
			)
			sp.AddEvent("After adjacent service")

			var svc service.Service
			for _, item := range services {
				if item.Name() == serviceName {
					item.As(&svc)
					break
				}
			}

			if svc == nil {
				continue
			}

			sp.AddEvent("Ending")

			ctx = propagator.With(ctx, service.ContextKey, svc)
			ctx = propagator.With(ctx, EndpointKey, ep)
		}
	}

	return ctx
}

func unaryEndpointInterceptor(rootContext context.Context, s registry.Item) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
		ctx = propagator.ForkContext(ctx, rootContext)
		var reg registry.Registry
		propagator.Get(rootContext, registry.ContextKey, &reg)
		ctx = contextEndpointRegistry(ctx, s, reg, info.FullMethod)
		return handler(ctx, req)
	}
}

func streamEndpointInterceptor(rootContext context.Context, s registry.Item) grpc.StreamServerInterceptor {
	return func(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
		ctx := propagator.ForkContext(stream.Context(), rootContext)
		var reg registry.Registry
		propagator.Get(rootContext, registry.ContextKey, &reg)
		ctx = contextEndpointRegistry(ctx, s, reg, info.FullMethod)
		wrapped := grpc_middleware.WrapServerStream(stream)
		wrapped.WrappedContext = ctx
		return handler(srv, wrapped)
	}
}
