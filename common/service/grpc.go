package service

import (
	"context"

	"github.com/pydio/cells/v4/common/server"

	"google.golang.org/grpc"
)

// WithGRPC adds a service handler to the current service
func WithGRPC(f func(context.Context, *grpc.Server) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverType = server.ServerType_GRPC
		o.serverStart = func() error {
			if o.Server == nil {
				return errNoServerAttached
			}

			var srvg *grpc.Server
			o.Server.As(&srvg)

			return f(o.Context, srvg)
		}

		// TODO v4 import wrappers for the server
	}
}

func WithGRPCStop(f func(context.Context, *grpc.Server) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverStop = func() error {
			var srvg *grpc.Server
			o.Server.As(&srvg)
			return f(o.Context, srvg)
		}
	}
}
