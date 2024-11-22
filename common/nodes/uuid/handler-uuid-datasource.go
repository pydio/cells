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

package uuid

import (
	"context"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/proto/tree"
)

func WithDatasource() nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.Wrappers = append(options.Wrappers, NewUuidDataSourceHandler())
	}
}

func NewUuidDataSourceHandler() *DataSourceHandler {
	bt := &DataSourceHandler{}
	bt.InputMethod = bt.updateInputBranch
	bt.OutputMethod = bt.updateOutputNode
	return bt
}

// DataSourceHandler is an BranchFilter extracting datasource info based on node UUID.
type DataSourceHandler struct {
	abstract.BranchFilter
}

func (v *DataSourceHandler) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	v.AdaptOptions(c, options)
	return v
}

func (v *DataSourceHandler) updateInputBranch(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	branchInfo, er := nodes.GetBranchInfo(ctx, identifier)
	if er != nil {
		return ctx, node, er
	}
	if branchInfo.Client != nil {
		// DS is already set by a previous middleware, ignore.
		return ctx, node, nil
	}

	dsName := node.GetStringMeta(common.MetaNamespaceDatasourceName)
	dsPath := node.GetStringMeta(common.MetaNamespaceDatasourcePath)
	if len(dsPath) == 0 || len(dsName) == 0 {
		// Ignore this step
		return ctx, node, nil
	}
	source, e := nodes.GetSourcesPool(ctx).GetDataSourceInfo(dsName)
	if e != nil {
		return ctx, node, e
	}
	branchInfo.LoadedSource = source
	ctx = nodes.WithBranchInfo(ctx, identifier, branchInfo)

	return ctx, node, nil

}

func (v *DataSourceHandler) updateOutputNode(ctx context.Context, node *tree.Node, identifier string) (context.Context, *tree.Node, error) {

	return ctx, node, nil

}
