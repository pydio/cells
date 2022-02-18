package nodescontext

import (
	"context"
	"github.com/pydio/cells/v4/common/nodes"
)

type contextType int

const (
	poolKey contextType = iota
)

// WithSourcesPool pushes a nodes.SourcesPool client to the context
func WithSourcesPool(ctx context.Context, pool nodes.SourcesPool) context.Context {
	return context.WithValue(ctx, poolKey, pool)
}

// GetSourcesPool gets a nodes.SourcesPool from context
func GetSourcesPool(ctx context.Context) nodes.SourcesPool {
	if p, o := ctx.Value(poolKey).(nodes.SourcesPool); o {
		return p
	}
	return nil
}
