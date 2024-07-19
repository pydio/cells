package nodescontext

import (
	"context"

	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

type contextType int

const (
	poolKey contextType = iota
)

func init() {
	propagator.RegisterKeyInjector[*openurl.Pool[nodes.SourcesPool]](poolKey)
}

// WithSourcesPool pushes a nodes.SourcesPool client to the context
func WithSourcesPool(ctx context.Context, pool *openurl.Pool[nodes.SourcesPool]) context.Context {
	return context.WithValue(ctx, poolKey, pool)
}

// GetSourcesPool gets a nodes.SourcesPool from context
func GetSourcesPool(ctx context.Context) nodes.SourcesPool {
	if p, o := ctx.Value(poolKey).(*openurl.Pool[nodes.SourcesPool]); o {
		sp, er := p.Get(ctx)
		if er != nil {
			panic(er)
		}
		sp.Once()
		return sp
	}
	return nil
}
