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

// updateOutputNode adds "InsideRecycle" flag by scanning ancestors, if they are present in branch info
func (r *RecyclePathHandler) updateOutputNode(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {
	// Just lookup in cache - do not trigger another load of ancestores
	if branchInfo, be := nodes.GetBranchInfo(ctx, identifier); be == nil && branchInfo.AncestorsList != nil {
		if ancestors, ok := branchInfo.AncestorsList[node.Path]; ok {
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
	}
	return ctx, node, nil
}
