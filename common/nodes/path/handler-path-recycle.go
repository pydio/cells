package path

import (
	"context"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/proto/tree"
)

func WithRecyclePathHandler() nodes.Option {
	return func(options *nodes.RouterOptions) {
		rp := &RecyclePathHandler{}
		rp.BranchFilter.InputMethod = rp.updateInputBranch
		rp.BranchFilter.OutputMethod = rp.updateOutputNode
		options.Wrappers = append(options.Wrappers, rp)
	}
}

type RecyclePathHandler struct {
	abstract.BranchFilter
}

func (r *RecyclePathHandler) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	r.AdaptOptions(c, options)
	return r
}

func (r *RecyclePathHandler) updateInputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {
	return ctx, node, nil
}

func (r *RecyclePathHandler) updateOutputNode(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {
	if _, ancestors, err := nodes.AncestorsListFromContext(ctx, node, identifier, false); err == nil {
		// Add "InsideRecycle" flag by scanning ancestors
		for _, p := range ancestors {
			if p.GetUuid() == node.GetUuid() {
				continue
			}
			if p.GetStringMeta(common.MetaNamespaceNodeName) == common.RecycleBinName {
				out := node.Clone()
				out.MustSetMeta(common.MetaNamespaceInsideRecycle, "true")
				return ctx, out, nil
			}
		}
	}
	return ctx, node, nil
}
