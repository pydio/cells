package service

import (
	"context"

	"github.com/pydio/cells/v4/common/log"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
)

// WithLogger adds a logger to the service context
func WithLogger(logger log.ZapLogger) ServiceOption {
	return func(o *ServiceOptions) {
		o.BeforeStart = append(o.BeforeStart, func(ctx context.Context) error {
			ctx = servicecontext.WithLogger(ctx, logger.Named(o.Name))

			o.Context = ctx

			return nil
		})
	}
}
