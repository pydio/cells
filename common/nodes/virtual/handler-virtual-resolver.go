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

package virtual

import (
	"context"

	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/acl"
	"github.com/pydio/cells/v4/common/proto/tree"
)

func WithResolver() nodes.Option {
	return func(options *nodes.RouterOptions) {
		if !options.BrowseVirtualNodes && !options.AdminView {
			options.Wrappers = append(options.Wrappers, NewVirtualNodesHandler())
		}
	}
}

// ResolverHandler dynamically resolves virtual nodes to their runtime value.
type ResolverHandler struct {
	abstract.BranchFilter
}

func (v *ResolverHandler) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	v.AdaptOptions(c, options)
	return v
}

func NewVirtualNodesHandler() *ResolverHandler {
	v := &ResolverHandler{}
	v.InputMethod = v.updateInput
	v.OutputMethod = func(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {
		return ctx, node, nil
	}
	return v
}

// updateInput Updates BranchInfo and AccessList in context with resolved values for virtual nodes
func (v *ResolverHandler) updateInput(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	virtualManager := abstract.GetVirtualNodesManager(v.RuntimeCtx)
	if branchInfo, ok := nodes.GetBranchInfo(ctx, identifier); ok && !branchInfo.Binary && branchInfo.Root != nil {
		originalUuid := branchInfo.Root.Uuid
		if virtual, exists := virtualManager.ByUuid(branchInfo.Root.Uuid); exists {
			resolvedRoot, e := virtualManager.ResolveInContext(ctx, virtual, v.ClientsPool, true)
			if e != nil {
				return ctx, node, e
			}

			branchInfo.Root = resolvedRoot
			ctx = nodes.WithBranchInfo(ctx, identifier, branchInfo)
			if accessList, ok := acl.FromContext(ctx); ok {
				if copied := accessList.ReplicateBitmask(originalUuid, resolvedRoot.Uuid); copied {
					ctx = acl.ToContext(ctx, accessList)
				}
			}
		}
	}

	return ctx, node, nil
}
