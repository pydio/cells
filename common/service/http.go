package service

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/server"
)

// WithHTTP adds a http micro service handler to the current service
func WithHTTP(f func(context.Context, server.HttpMux) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverType = server.ServerType_HTTP
		o.serverStart = func() error {
			var mux server.HttpMux
			if !o.Server.As(&mux) {
				return fmt.Errorf("server %s is not a mux ", o.Name)
			}

			return f(o.Context, mux)
		}
	}
}

func WithHTTPStop(f func(context.Context, server.HttpMux) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverStop = func() error {
			var mux server.HttpMux
			o.Server.As(&mux)
			return f(o.Context, mux)
		}
	}
}
