/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package merger

import (
	"context"
	"strconv"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/sync/model"
)

// FilterToTarget tries to detect unnecessary operations based on the target status.
// If the target implements the CachedBranchProvider interface, instead of stating the nodes
// one by one, the target will be fully loaded in memory at once to be used as a comparison.
func (t *TreePatch) FilterToTarget(ctx context.Context) {

	sources := make(map[model.Endpoint]model.PathSyncSource, 2)
	if cache, ok := t.CachedBranchFromEndpoint(ctx, t.Source()); ok {
		sources[t.Source()] = cache
	} else {
		sources[t.Source()] = t.Source()
	}
	if cache, ok := t.CachedBranchFromEndpoint(ctx, t.Target()); ok {
		sources[t.Target()] = cache
	} else if tgt, ok := model.AsPathSyncSource(t.Target()); ok {
		sources[t.Target()] = tgt
	}

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
		return node.GetEtag() == check.GetEtag()
	}

	stats := t.Stats()
	var total, idx, crtPercent int
	if p, ok := stats["Pending"]; ok {
		total = p.(map[string]int)["Total"]
	}

	// Walk the tree to prune operations - only check non-processed operations!
	t.Walk(func(n *TreeNode) bool {
		hasDataOp := n.DataOperation != nil && !n.DataOperation.IsProcessed()
		hasPathOp := n.PathOperation != nil && !n.PathOperation.IsProcessed()
		if !(hasDataOp || hasPathOp) {
			return false
		}
		percent := int(float32(idx) * 100 / float32(total))
		if total > 1000 && idx > 0 && percent-crtPercent >= 5 {
			log.Logger(ctx).Info("[FilterToTarget] Progress: " + strconv.Itoa(percent) + "%")
			crtPercent = percent
		}
		idx++
		if hasDataOp && exists(n.DataOperation.Target(), n.ProcessedPath(false), n) {
			log.Logger(ctx).Info("[FilterToTarget] Ignoring DataOperation (target node exists with same ETag)", zap.String("path", n.ProcessedPath(false)))
			n.DataOperation = nil
		} else if hasPathOp {
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
