package merger

import (
	"context"
	"path"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/sync/model"
)

func (t *TreePatch) FilterToTarget(ctx context.Context, snapshots model.SnapshotFactory) {

	sources := make(map[model.Endpoint]model.PathSyncSource, 2)
	t.initSrc(ctx, t.Source(), sources)
	t.initSrc(ctx, t.Target(), sources)

	// Load the source to stat, then check if a node already exists, and optionally check its ETag value
	exists := func(target model.PathSyncTarget, path string, n ...*TreeNode) bool {
		src := sources[target]
		if src == nil {
			return false
		}
		node, err := src.LoadNode(ctx, path)
		ex := node != nil && err == nil
		if len(n) == 0 || node == nil {
			return ex
		}
		// Check nodes have same ETag
		check := n[0]
		return node.Etag == check.Etag
	}

	// Walk the tree to prune operations
	t.Walk(func(n *TreeNode) bool {
		if n.DataOperation != nil && exists(n.DataOperation.Target(), n.ProcessedPath(false), n) {
			log.Logger(ctx).Info("[FilterToTarget] Ignoring DataOperation (target node exists with same ETag)", zap.String("path", n.ProcessedPath(false)))
			n.DataOperation = nil
		} else if n.PathOperation != nil {
			if n.PathOperation.Type() == OpCreateFolder {
				if exists(n.PathOperation.Target(), n.ProcessedPath(false)) {
					log.Logger(ctx).Info("[FilterToTarget] Ignoring CreateFolder Operation (target folder exists)", zap.String("path", n.ProcessedPath(false)))
					n.PathOperation = nil
				}
			} else if n.PathOperation.Type() == OpDelete {
				if !exists(n.PathOperation.Target(), n.ProcessedPath(false)) {
					log.Logger(ctx).Info("[FilterToTarget] Ignoring Delete Operation (target node is not there)", zap.String("path", n.ProcessedPath(false)))
					n.PathOperation = nil
				}
			}
		}
		return false
	})

}

func (t *TreePatch) initSrc(ctx context.Context, endpoint model.Endpoint, sources map[model.Endpoint]model.PathSyncSource) {
	// Find highest modified paths
	var branches []string
	t.WalkToFirstOperations(OpUnknown, func(operation Operation) {
		branches = append(branches, path.Dir(operation.GetRefPath()))
	}, endpoint)
	if len(branches) == 0 {
		return
	}
	if cacheProvider, ok := endpoint.(model.CachedBranchProvider); ok {
		inMemory := cacheProvider.GetCachedBranches(ctx, branches...)
		sources[endpoint] = inMemory
	} else if src, ok := model.AsPathSyncSource(endpoint); ok {
		sources[endpoint] = src
	}
}
