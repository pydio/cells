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

package views

import (
	"context"
	"path"
	"strings"

	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/tree"
)

func NewWorkspaceRootResolver() *WorkspaceRootResolver {
	bt := &WorkspaceRootResolver{}
	bt.inputMethod = bt.updateInputBranch
	bt.outputMethod = bt.updateOutputNode
	return bt
}

// WorkspaceRootResolver is an AbstractBranchFilter finding workspace root(s) based on the path.
type WorkspaceRootResolver struct {
	AbstractBranchFilter
}

func (v *WorkspaceRootResolver) updateInputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	branchInfo, ok := GetBranchInfo(ctx, identifier)
	if !ok {
		return ctx, node, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find branch info for node")
	}

	if branchInfo.Root == nil {
		return ctx, node, nil
	}

	out := node.Clone()
	wsRoot := branchInfo.Root
	originalPath := node.Path
	dsPath := wsRoot.GetStringMeta(common.MetaNamespaceDatasourcePath)
	out.Path = path.Join(wsRoot.Path, originalPath)
	out.SetMeta(common.MetaNamespaceDatasourcePath, path.Join(dsPath, originalPath))
	return ctx, out, nil

}

func (v *WorkspaceRootResolver) updateOutputNode(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	branchInfo, _ := GetBranchInfo(ctx, identifier)
	if branchInfo.Workspace.UUID == "ROOT" {
		// Nothing to do
		return ctx, node, nil
	}
	if branchInfo.Root == nil {
		return ctx, node, errors.InternalServerError(VIEWS_LIBRARY_NAME, "No Root defined, this is not normal")
	}
	// Trim root path
	out := node.Clone()
	out.Path = strings.Trim(strings.TrimPrefix(node.Path, branchInfo.Root.Path), "/")
	return ctx, out, nil

}
