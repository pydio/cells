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

package sync

import (
	"context"
	"path/filepath"

	"github.com/golang/protobuf/proto"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
)

var (
	transferClient TransferClient
)

type TransferClient interface {
	TransferObject(ctx context.Context, src *tree.Node, srcEndpoint EndpointClient, target *tree.Node, targetEndpoint EndpointClient) error
}

func getTransferClient() TransferClient {
	if transferClient == nil {
		transferClient = &TransferManager{}
	}
	return transferClient
}

type TransferManager struct{}

func (t *TransferManager) TransferObject(ctx context.Context, src *tree.Node, srcEndpoint EndpointClient, target *tree.Node, targetEndpoint EndpointClient) error {

	// Replace node Paths with absolute values on storage
	realSrcNode := proto.Clone(src).(*tree.Node)
	realSrcNode.Path = filepath.Clean(filepath.Join(srcEndpoint.GetRootPath(), src.Path))
	realTargetNode := proto.Clone(target).(*tree.Node)
	realTargetNode.Path = filepath.Clean(filepath.Join(targetEndpoint.GetRootPath(), target.Path))

	_, err := GetClient().CopyObject(ctx, src, target, &views.CopyRequestData{})

	return err
}
