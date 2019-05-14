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
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
)

type AclFilterHandler struct {
	AbstractHandler
}

func (a *AclFilterHandler) skipContext(ctx context.Context, identifier ...string) bool {
	id := "in"
	if len(identifier) > 0 {
		id = identifier[0]
	}
	bI, ok := GetBranchInfo(ctx, id)
	return ok && bI.Binary
}

// Check if node is readable and forward to next middleware
func (a *AclFilterHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {
	if a.skipContext(ctx) {
		return a.next.ReadNode(ctx, in, opts...)
	}
	accessList := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)

	// First load ancestors or grab them from BranchInfo
	ctx, parents, err := AncestorsListFromContext(ctx, in.Node, "in", a.clientsPool, false)
	if err != nil {
		return nil, err
	}

	if !accessList.CanRead(ctx, parents...) && !accessList.CanWrite(ctx, parents...) {
		return nil, errors.Forbidden(VIEWS_LIBRARY_NAME, "Node is not readable")
	}
	response, err := a.next.ReadNode(ctx, in, opts...)
	if accessList.CanRead(ctx, parents...) && !accessList.CanWrite(ctx, parents...) {
		n := response.Node.Clone()
		n.SetMeta(common.META_FLAG_READONLY, "true")
		response.Node = n
	}
	return response, err
}

func (a *AclFilterHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (streamer tree.NodeProvider_ListNodesClient, e error) {
	if a.skipContext(ctx) {
		return a.next.ListNodes(ctx, in, opts...)
	}
	accessList := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)
	// First load ancestors or grab them from BranchInfo
	ctx, parents, err := AncestorsListFromContext(ctx, in.Node, "in", a.clientsPool, false)
	if err != nil {
		return nil, err
	}

	if !accessList.CanRead(ctx, parents...) {
		return nil, errors.Forbidden(VIEWS_LIBRARY_NAME, "Node is not readable")
	}
	log.Logger(ctx).Debug("Parent Ancestors", zap.Any("parents", parents), zap.Any("acl", accessList))

	stream, err := a.next.ListNodes(ctx, in, opts...)
	if err != nil {
		return nil, err
	}
	s := NewWrappingStreamer()
	go func() {
		defer stream.Close()
		defer s.Close()
		for {
			resp, err := stream.Recv()
			if err != nil {
				break
			}
			if resp == nil {
				continue
			}
			// FILTER OUT NON READABLE NODES
			newBranch := []*tree.Node{resp.Node}
			newBranch = append(newBranch, parents...)
			if !accessList.CanRead(ctx, newBranch...) {
				continue
			}
			if accessList.CanRead(ctx, newBranch...) && !accessList.CanWrite(ctx, newBranch...) {
				n := resp.Node.Clone()
				n.SetMeta(common.META_FLAG_READONLY, "true")
				resp.Node = n
			}
			s.Send(resp)
		}
	}()
	return s, nil
}

func (a *AclFilterHandler) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...client.CallOption) (*tree.CreateNodeResponse, error) {
	if a.skipContext(ctx) {
		return a.next.CreateNode(ctx, in, opts...)
	}
	accessList := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)
	ctx, toParents, err := AncestorsListFromContext(ctx, in.Node, "in", a.clientsPool, true)
	if err != nil {
		return nil, err
	}
	if !accessList.CanWrite(ctx, toParents...) {
		return nil, errors.Forbidden("parent.not.writeable", "Target Location is not writeable (CreateNode)")
	}
	return a.next.CreateNode(ctx, in, opts...)
}

func (a *AclFilterHandler) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...client.CallOption) (*tree.UpdateNodeResponse, error) {
	if a.skipContext(ctx) {
		return a.next.UpdateNode(ctx, in, opts...)
	}
	accessList := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)
	ctx, fromParents, err := AncestorsListFromContext(ctx, in.From, "from", a.clientsPool, false)
	if err != nil {
		return nil, err
	}
	if !accessList.CanRead(ctx, fromParents...) {
		return nil, errors.Forbidden(VIEWS_LIBRARY_NAME, "Source Node is not readable")
	}
	ctx, toParents, err := AncestorsListFromContext(ctx, in.To, "to", a.clientsPool, true)
	if err != nil {
		return nil, err
	}
	if !accessList.CanWrite(ctx, toParents...) {
		return nil, errors.Forbidden(VIEWS_LIBRARY_NAME, "Target Node is not writeable")
	}
	return a.next.UpdateNode(ctx, in, opts...)
}

func (a *AclFilterHandler) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...client.CallOption) (*tree.DeleteNodeResponse, error) {
	if a.skipContext(ctx) {
		return a.next.DeleteNode(ctx, in, opts...)
	}
	accessList := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)
	ctx, delParents, err := AncestorsListFromContext(ctx, in.Node, "in", a.clientsPool, false)
	if err != nil {
		return nil, err
	}
	if !accessList.CanWrite(ctx, delParents...) {
		return nil, errors.Forbidden(VIEWS_LIBRARY_NAME, "Node is not writeable, cannot delete!")
	}
	return a.next.DeleteNode(ctx, in, opts...)
}

func (a *AclFilterHandler) GetObject(ctx context.Context, node *tree.Node, requestData *GetRequestData) (io.ReadCloser, error) {
	if a.skipContext(ctx) {
		return a.next.GetObject(ctx, node, requestData)
	}
	accessList := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)
	// First load ancestors or grab them from BranchInfo
	ctx, parents, err := AncestorsListFromContext(ctx, node, "in", a.clientsPool, false)
	if err != nil {
		return nil, err
	}
	if !accessList.CanRead(ctx, parents...) {
		return nil, errors.Forbidden(VIEWS_LIBRARY_NAME, "Node is not readable")
	}
	return a.next.GetObject(ctx, node, requestData)
}

func (a *AclFilterHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *PutRequestData) (int64, error) {
	if a.skipContext(ctx) {
		return a.next.PutObject(ctx, node, reader, requestData)
	}
	accessList := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)
	// First load ancestors or grab them from BranchInfo
	ctx, parents, err := AncestorsListFromContext(ctx, node, "in", a.clientsPool, true)
	if err != nil {
		return 0, err
	}
	if !accessList.CanWrite(ctx, parents...) {
		return 0, errors.Forbidden(VIEWS_LIBRARY_NAME, "Node is not writeable")
	}
	return a.next.PutObject(ctx, node, reader, requestData)
}

func (a *AclFilterHandler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *CopyRequestData) (int64, error) {
	if a.skipContext(ctx) {
		return a.next.CopyObject(ctx, from, to, requestData)
	}
	accessList := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)
	ctx, fromParents, err := AncestorsListFromContext(ctx, from, "from", a.clientsPool, false)
	if err != nil {
		return 0, err
	}
	if !accessList.CanRead(ctx, fromParents...) {
		return 0, errors.Forbidden(VIEWS_LIBRARY_NAME, "Source Node is not readable")
	}
	ctx, toParents, err := AncestorsListFromContext(ctx, to, "to", a.clientsPool, true)
	if err != nil {
		return 0, err
	}
	if !accessList.CanWrite(ctx, toParents...) {
		return 0, errors.Forbidden(VIEWS_LIBRARY_NAME, "Target Location is not writeable (CopyObject)")
	}
	return a.next.CopyObject(ctx, from, to, requestData)
}
