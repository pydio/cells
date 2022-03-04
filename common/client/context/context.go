package clientcontext

import (
	"context"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/runtime"
)

type contextType int

const (
	clientConnKey contextType = iota
)

func init() {
	runtime.RegisterContextInjector(func(ctx, parent context.Context) context.Context {
		return WithClientConn(ctx, GetClientConn(parent))
	})
}

// WithClientConn links a client connection to the context
func WithClientConn(ctx context.Context, reg grpc.ClientConnInterface) context.Context {
	return context.WithValue(ctx, clientConnKey, reg)
}

// GetClientConn returns the client connection from the context in argument
func GetClientConn(ctx context.Context) grpc.ClientConnInterface {
	if cli, ok := ctx.Value(clientConnKey).(grpc.ClientConnInterface); ok {
		return cli
	}

	return nil
}
