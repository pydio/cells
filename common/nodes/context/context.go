package nodescontext

import (
	"context"
	"github.com/pydio/cells/v4/common/nodes"
)

type contextType int

const (
	poolKey contextType = iota
)

// WithNodesPool pushes a nodes.ClientsPool client to the context
func WithNodesPool(ctx context.Context, pool *nodes.ClientsPool) context.Context {
	return context.WithValue(ctx, poolKey, pool)
}

// GetNodesPool gets a nodes.ClientsPool from context
func GetNodesPool(ctx context.Context) *nodes.ClientsPool {
	if p, o := ctx.Value(poolKey).(*nodes.ClientsPool); o {
		return p
	}
	return nil
}
