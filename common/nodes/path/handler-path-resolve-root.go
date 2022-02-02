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

package path

import (
	"context"
	"path"
	"strings"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/proto/tree"
)

func WithRootResolver() nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.Wrappers = append(options.Wrappers, NewWorkspaceRootResolver())
	}
}

func NewWorkspaceRootResolver() *WorkspaceRootResolver {
	bt := &WorkspaceRootResolver{}
	bt.InputMethod = bt.updateInputBranch
	bt.OutputMethod = bt.updateOutputNode
	return bt
}

// WorkspaceRootResolver is an BranchFilter finding workspace root(s) based on the path.
type WorkspaceRootResolver struct {
	abstract.BranchFilter
}

func (v *WorkspaceRootResolver) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	v.AdaptOptions(c, options)
	return v
}

func (v *WorkspaceRootResolver) updateInputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	branchInfo, ok := nodes.GetBranchInfo(ctx, identifier)
	if !ok {
		return ctx, node, nodes.ErrBranchInfoMissing(identifier)
	}

	if branchInfo.Root == nil {
		return ctx, node, nil
	}

	out := node.Clone()
	wsRoot := branchInfo.Root
	originalPath := node.Path
	dsPath := wsRoot.GetStringMeta(common.MetaNamespaceDatasourcePath)
	out.Path = path.Join(wsRoot.Path, originalPath)
	out.MustSetMeta(common.MetaNamespaceDatasourcePath, path.Join(dsPath, originalPath))
	return ctx, out, nil

}

func (v *WorkspaceRootResolver) updateOutputNode(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	branchInfo, _ := nodes.GetBranchInfo(ctx, identifier)
	if branchInfo.Workspace != nil && branchInfo.Workspace.UUID == "ROOT" {
		// Nothing to do
		return ctx, node, nil
	}
	if branchInfo.Root == nil {
		return ctx, node, nodes.ErrBranchInfoRootMissing(identifier)
	}
	// Trim root path
	out := node.Clone()
	out.Path = strings.Trim(strings.TrimPrefix(node.Path, branchInfo.Root.Path), "/")
	return ctx, out, nil

}
