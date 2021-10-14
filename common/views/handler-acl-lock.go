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

	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/common/views/models"
)

// AclLockFilter filters call by checking internal locks.
type AclLockFilter struct {
	AbstractHandler
}

// UpdateNode synchronously and recursively performs a Move operation of a node
// func (h *AclLockFilter) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...client.CallOption) (*tree.CreateNodeResponse, error) {
// 	log.Logger(ctx).Info("Going through the create lock during operation")
// 	return h.next.CreateNode(ctx, in, opts...)
// }

// // DeleteNode synchronously and recursively delete a node
// func (h *AclLockFilter) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...client.CallOption) (*tree.DeleteNodeResponse, error) {
// 	log.Logger(ctx).Info("Going through the delete lock during operation")
// 	return h.next.DeleteNode(ctx, in, opts...)
// }

// // UpdateNode synchronously and recursively performs a Move operation of a node
// func (h *AclLockFilter) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...client.CallOption) (*tree.UpdateNodeResponse, error) {
// 	log.Logger(ctx).Info("Going through the update lock during operation")
// 	return h.next.UpdateNode(ctx, in, opts...)
// }

// PutObject check locks before allowing Put operation.
func (a *AclLockFilter) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (int64, error) {
	branchInfo, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return a.next.PutObject(ctx, node, reader, requestData)
	}

	accessList, err := permissions.AccessListForLockedNodes(ctx, a.virtualResolver)
	if err != nil {
		return 0, err
	}

	nodes := []*tree.Node{node}
	for _, ancestorNodes := range branchInfo.AncestorsList {
		nodes = append(nodes, ancestorNodes...)
	}

	if accessList.IsLocked(ctx, nodes...) {
		return 0, errors.New("parent.locked", "Node is currently locked", 423)
	}

	return a.next.PutObject(ctx, node, reader, requestData)
}

func (a *AclLockFilter) MultipartCreate(ctx context.Context, node *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	branchInfo, ok := GetBranchInfo(ctx, "in")
	if !ok {
		return a.next.MultipartCreate(ctx, node, requestData)
	}

	accessList, err := permissions.AccessListForLockedNodes(ctx, a.virtualResolver)
	if err != nil {
		return "", err
	}

	nodes := []*tree.Node{node}
	for _, ancestorNodes := range branchInfo.AncestorsList {
		nodes = append(nodes, ancestorNodes...)
	}

	if accessList.IsLocked(ctx, nodes...) {
		return "", errors.New("parent.locked", "Node is currently locked", 423)
	}

	return a.next.MultipartCreate(ctx, node, requestData)

}

// WrappedCanApply will perform checks on quota to make sure an operation is authorized
func (a *AclLockFilter) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {

	var node *tree.Node
	var ctx context.Context

	switch operation.GetType() {
	case tree.NodeChangeEvent_READ, tree.NodeChangeEvent_UPDATE_CONTENT:
		return a.next.WrappedCanApply(srcCtx, targetCtx, operation)
	case tree.NodeChangeEvent_CREATE:
		node = operation.GetTarget()
		ctx = targetCtx
	case tree.NodeChangeEvent_DELETE, tree.NodeChangeEvent_UPDATE_PATH:
		node = operation.GetSource()
		ctx = srcCtx
	}

	// Load all nodes
	accessList, err := permissions.AccessListForLockedNodes(ctx, a.virtualResolver)
	if err != nil {
		return err
	}

	// First load ancestors or grab them from BranchInfo
	_, parents, err := AncestorsListFromContext(ctx, node, "in", a.clientsPool, false)
	if err != nil {
		return err
	}

	nodes := append([]*tree.Node{node}, parents...)
	if accessList.IsLocked(ctx, nodes...) {
		return errors.New("parent.locked", "Node is currently locked", 423)
	}

	return a.next.WrappedCanApply(srcCtx, targetCtx, operation)
}

func (a *AclLockFilter) virtualResolver(ctx context.Context, node *tree.Node) (*tree.Node, bool) {
	return GetVirtualNodesManager().GetResolver(a.clientsPool, false)(ctx, node)
}
