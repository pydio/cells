/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package views

import (
	"context"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

type VirtualNodesResolver struct {
	AbstractBranchFilter
}

func NewVirtualNodesHandler() *VirtualNodesResolver {
	v := &VirtualNodesResolver{}
	v.inputMethod = v.updateInput
	v.outputMethod = func(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {
		return ctx, node, nil
	}
	return v
}

// updateInput Updates BranchInfo and AccessList in context with resolved values for virtual nodes
func (v *VirtualNodesResolver) updateInput(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	virtualManager := GetVirtualNodesManager()
	if branchInfo, ok := GetBranchInfo(ctx, identifier); ok && !branchInfo.Binary && branchInfo.Root != nil {
		originalUuid := branchInfo.Root.Uuid
		if virtual, exists := virtualManager.ByUuid(branchInfo.Root.Uuid); exists {
			resolvedRoot, e := virtualManager.ResolveInContext(ctx, virtual, v.clientsPool, true)
			if e != nil {
				return ctx, node, e
			}

			branchInfo.Root = resolvedRoot
			ctx = WithBranchInfo(ctx, identifier, branchInfo)
			if accessList, err := AccessListFromContext(ctx); err == nil {
				if aclNodeMask, has := accessList.GetNodesBitmasks()[originalUuid]; has {
					log.Logger(ctx).Debug("Updating Access List with resolved node Uuid", zap.Any("virtual", virtual), zap.Any("resolved", resolvedRoot))
					accessList.GetNodesBitmasks()[resolvedRoot.Uuid] = aclNodeMask
					ctx = context.WithValue(ctx, CtxUserAccessListKey{}, accessList)
				}
			}
		}
	}

	return ctx, node, nil
}
