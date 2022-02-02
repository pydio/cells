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

package nodes

import (
	"context"
	"strings"
	"time"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/tree"
)

// HandlerListNodesWithCallback is a generic implementation of ListNodesWithCallback for any Handler. Used by Client, Handler and HandlerMock
func HandlerListNodesWithCallback(v Handler, ctx context.Context, request *tree.ListNodesRequest, callback WalkFunc, ignoreCbError bool, filters ...WalkFilterFunc) error {
	r, e := v.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: request.Node.Path}})
	if e != nil {
		return e
	}
	skipFirst := false
	firstFilters := append(filters, func(ctx context.Context, node *tree.Node) bool {
		return request.FilterType == tree.NodeType_UNKNOWN || r.GetNode().Type == request.FilterType
	})
	for _, f := range firstFilters {
		if !f(ctx, r.GetNode()) {
			skipFirst = true
			break
		}
	}
	if !skipFirst {
		if eC := callback(ctx, r.GetNode(), nil); eC != nil && !ignoreCbError {
			return eC
		}
	}

	ctx, cancel := context.WithTimeout(ctx, 6*time.Hour)
	defer cancel()

	nodeClient, err := v.ListNodes(ctx, request)
	if err != nil {
		return err
	}
	defer nodeClient.CloseSend()
loop:
	for {
		clientResponse, err := nodeClient.Recv()
		if clientResponse == nil || err != nil {
			break
		}
		n := clientResponse.GetNode()
		for _, f := range filters {
			if !f(ctx, n) {
				continue loop
			}
		}
		if e := callback(ctx, n, nil); e != nil && !ignoreCbError {
			return e
		}
	}
	return nil
}

// WalkFilterSkipPydioHiddenFile is a preset filter ignoring PydioSyncHiddenFile entries
func WalkFilterSkipPydioHiddenFile(_ context.Context, node *tree.Node) bool {
	return !strings.HasSuffix(node.Path, common.PydioSyncHiddenFile)
}
