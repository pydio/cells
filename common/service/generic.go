package service

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/generic"
)

// WithGeneric adds a http micro service handler to the current service
func WithGeneric(f func(context.Context, *generic.Server) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverType = server.ServerType_GENERIC
		o.serverStart = func() error {
			var srvg *generic.Server

			if !o.Server.As(&srvg) {
				return fmt.Errorf("server is not a generic server ", o.Name)
			}

			return f(o.Context, srvg)
		}

		// TODO v4 import wrappers for the server
	}
}

// WithGenericStop adds a http micro service handler to the current service
func WithGenericStop(f func(context.Context, *generic.Server) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverStop = func() error {
			var srvg *generic.Server

			o.Server.As(&srvg)

			return f(o.Context, srvg)
		}
	}
}
