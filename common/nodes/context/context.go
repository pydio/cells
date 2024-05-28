package nodescontext

import (
	"context"

	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

type contextType int

const (
	poolKey contextType = iota
)

func init() {
	propagator.RegisterContextInjector(func(ctx, parent context.Context) context.Context {
		if p := GetSourcesPool(parent); p != nil {
			return WithSourcesPool(ctx, p)
		}
		return ctx
	})
}

// WithSourcesPool pushes a nodes.SourcesPool client to the context
func WithSourcesPool(ctx context.Context, pool nodes.SourcesPool) context.Context {
	return context.WithValue(ctx, poolKey, pool)
}

// GetSourcesPool gets a nodes.SourcesPool from context
func GetSourcesPool(ctx context.Context) nodes.SourcesPool {
	if p, o := ctx.Value(poolKey).(nodes.SourcesPool); o {
		p.Once()
		return p
	}
	return nil
}
