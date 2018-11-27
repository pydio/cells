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
	"strings"

	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

func NewPathDataSourceHandler() *PathDataSourceHandler {
	bt := &PathDataSourceHandler{}
	bt.inputMethod = bt.updateInputBranch
	bt.outputMethod = bt.updateOutputNode
	return bt
}

type PathDataSourceHandler struct {
	AbstractBranchFilter
}

func (v *PathDataSourceHandler) updateInputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	branchInfo, ok := GetBranchInfo(ctx, identifier)
	if !ok {
		return ctx, node, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Cannot find branch info for node")
	}
	if branchInfo.Client != nil {
		// DS Is already set by a previous middleware, ignore.
		return ctx, node, nil
	}
	out := node.Clone()
	if branchInfo.Workspace.UUID == "ROOT" {

		if len(strings.Trim(node.Path, "/")) > 0 {
			// Get Data Source from first segment, leave tree path unchanged
			parts := strings.Split(strings.Trim(node.Path, "/"), "/")
			dsName := parts[0]
			source, e := v.clientsPool.GetDataSourceInfo(dsName)
			if e != nil {
				return ctx, node, e
			}
			log.Logger(ctx).Debug("updateInput", zap.Any("source", source))
			if len(parts) > 1 {
				dsPath := strings.Join(parts[1:], "/")
				out.SetMeta(common.META_NAMESPACE_DATASOURCE_PATH, dsPath)
			}
			branchInfo.LoadedSource = source
			ctx = WithBranchInfo(ctx, identifier, branchInfo)
		}

	} else if branchInfo.Root != nil {

		wsRoot := branchInfo.Root
		dsName := wsRoot.GetStringMeta(common.META_NAMESPACE_DATASOURCE_NAME)
		source, err := v.clientsPool.GetDataSourceInfo(dsName)
		if err != nil {
			log.Logger(ctx).Error("Cannot find DataSourceInfo for "+dsName, zap.Error(err))
			return nil, out, err
		}
		branchInfo.LoadedSource = source
		ctx = WithBranchInfo(ctx, identifier, branchInfo)

	} else {

		return ctx, node, errors.InternalServerError(VIEWS_LIBRARY_NAME, "Missing Root in context")

	}

	return ctx, out, nil

}

func (v *PathDataSourceHandler) updateOutputNode(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	return ctx, node, nil

}
