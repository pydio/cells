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
	"io"

	"github.com/micro/go-micro/client"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
)

type AclLockFilter struct {
	AbstractHandler
}

type AclContentLockFilter struct {
	AbstractHandler
}

// UpdateNode synchronously and recursively performs a Move operation of a node
func (h *AclLockFilter) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...client.CallOption) (*tree.CreateNodeResponse, error) {
	log.Logger(ctx).Info("Going through the create lock during operation")
	return h.next.CreateNode(ctx, in, opts...)
}

// DeleteNode synchronously and recursively delete a node
func (h *AclLockFilter) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...client.CallOption) (*tree.DeleteNodeResponse, error) {
	log.Logger(ctx).Info("Going through the delete lock during operation")
	return h.next.DeleteNode(ctx, in, opts...)
}

// UpdateNode synchronously and recursively performs a Move operation of a node
func (h *AclLockFilter) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...client.CallOption) (*tree.UpdateNodeResponse, error) {
	log.Logger(ctx).Info("Going through the update lock during operation")
	return h.next.UpdateNode(ctx, in, opts...)
}

// PutObject check locks before allowing Put operation.
func (a *AclLockFilter) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *PutRequestData) (int64, error) {
	if branchInfo, ok := GetBranchInfo(ctx, "in"); ok && branchInfo.Binary {
		return a.next.PutObject(ctx, node, reader, requestData)
	}
	if err := permissions.CheckContentLock(ctx, node); err != nil {
		return 0, err
	}
	return a.next.PutObject(ctx, node, reader, requestData)
}

func (a *AclContentLockFilter) MultipartCreate(ctx context.Context, target *tree.Node, requestData *MultipartRequestData) (string, error) {
	if branchInfo, ok := GetBranchInfo(ctx, "in"); ok && branchInfo.Binary {
		return a.next.MultipartCreate(ctx, target, requestData)
	}
	if err := permissions.CheckContentLock(ctx, target); err != nil {
		return "", err
	}
	return a.next.MultipartCreate(ctx, target, requestData)
}

// CopyObject should check: quota on CopyObject operation? Can we copy an object on top of an existing node?
func (a *AclContentLockFilter) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *CopyRequestData) (int64, error) {
	return a.next.CopyObject(ctx, from, to, requestData)
}

func (a *AclContentLockFilter) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {
	var lockErr error
	switch operation.GetType() {
	case tree.NodeChangeEvent_CREATE:
		lockErr = permissions.CheckContentLock(targetCtx, operation.GetTarget())
	case tree.NodeChangeEvent_DELETE, tree.NodeChangeEvent_UPDATE_PATH:
		lockErr = permissions.CheckContentLock(srcCtx, operation.GetSource())
	}
	if lockErr != nil {
		return lockErr
	}
	return a.next.WrappedCanApply(srcCtx, targetCtx, operation)
}
