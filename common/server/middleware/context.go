package middleware

import (
	"context"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"google.golang.org/grpc/metadata"
	"strings"

	servercontext "github.com/pydio/cells/v4/common/server/context"

	clientcontext "github.com/pydio/cells/v4/common/client/context"
)

// ClientConnIncomingContext adds the ClientConn to context
func ClientConnIncomingContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	clientConn := clientcontext.GetClientConn(serverRuntimeContext)
	return func(ctx context.Context) (context.Context, bool, error) {
		return clientcontext.WithClientConn(ctx, clientConn), true, nil
	}
}

// RegistryIncomingContext injects the registry in context
func RegistryIncomingContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	registry := servercontext.GetRegistry(serverRuntimeContext)
	return func(ctx context.Context) (context.Context, bool, error) {
		return servercontext.WithRegistry(ctx, registry), true, nil
	}
}

// TargetNameToServiceNameContext extracts service name from grpc meta "targetname" and inject it in the context
func TargetNameToServiceNameContext(serverRuntimeContext context.Context) func(ctx context.Context) (context.Context, bool, error) {
	return func(ctx context.Context) (context.Context, bool, error) {
		if md, ok := metadata.FromIncomingContext(ctx); ok {
			if tName := md.Get("targetname"); strings.Join(tName, "") != "" {
				return servicecontext.WithServiceName(ctx, strings.Join(tName, "")), true, nil
			}
		}
		return ctx, false, nil
	}
}
