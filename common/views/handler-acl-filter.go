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
	"fmt"
	"io"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
)

var pathNotReadable = errors.Forbidden("path.not.readable", "path is not readable")
var pathNotWriteable = errors.Forbidden("path.not.writeable", "path is not writeable")

// AclFilterHandler checks for read/write permissions depending on the call using the context AccessList.
type AclFilterHandler struct {
	AbstractHandler
}

func (a *AclFilterHandler) skipContext(ctx context.Context, identifier ...string) bool {
	id := "in"
	if len(identifier) > 0 {
		id = identifier[0]
	}
	bI, ok := GetBranchInfo(ctx, id)
	return ok && (bI.Binary || bI.TransparentBinary)
}

// ReadNode checks if node is readable and forward to next middleware.
func (a *AclFilterHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {
	if a.skipContext(ctx) {
		return a.next.ReadNode(ctx, in, opts...)
	}
	accessList := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)

	// First load ancestors or grab them from BranchInfo
	ctx, parents, err := AncestorsListFromContext(ctx, in.Node, "in", a.clientsPool, false)
	if err != nil {
		return nil, a.recheckParents(ctx, err, in.Node, true, false)
	}
	if !accessList.CanRead(ctx, parents...) && !accessList.CanWrite(ctx, parents...) {
		return nil, pathNotReadable
	}
	checkDl := in.Node.HasMetaKey("acl-check-download")
	checkSync := in.Node.HasMetaKey("acl-check-syncable")
	response, err := a.next.ReadNode(ctx, in, opts...)
	if err != nil {
		return nil, err
	}
	if accessList.CanRead(ctx, parents...) && !accessList.CanWrite(ctx, parents...) {
		n := response.Node.Clone()
		n.SetMeta(common.MetaFlagReadonly, "true")
		response.Node = n
	}
	updatedParents := append([]*tree.Node{response.GetNode()}, parents[1:]...)
	if checkDl && accessList.HasExplicitDeny(ctx, permissions.FlagDownload, updatedParents...) {
		return nil, errors.Forbidden("download.forbidden", "Node cannot be downloaded")
	}
	if checkSync && accessList.HasExplicitDeny(ctx, permissions.FlagSync, updatedParents...) {
		n := response.Node.Clone()
		n.SetMeta(common.MetaFlagWorkspaceSyncable, false)
		response.Node = n
	}
	return response, err
}

// ListNodes filters list results with ACLs permissions
func (a *AclFilterHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (streamer tree.NodeProvider_ListNodesClient, e error) {
	if a.skipContext(ctx) {
		return a.next.ListNodes(ctx, in, opts...)
	}
	accessList := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)
	// First load ancestors or grab them from BranchInfo
	ctx, parents, err := AncestorsListFromContext(ctx, in.Node, "in", a.clientsPool, false)
	if err != nil {
		return nil, a.recheckParents(ctx, err, in.Node, true, false)
	}

	if !accessList.CanRead(ctx, parents...) {
		return nil, errors.Forbidden(VIEWS_LIBRARY_NAME, "Node is not readable")
	}

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
				if err != io.EOF && err != io.ErrUnexpectedEOF {
					s.SendError(err)
				}
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
				n.SetMeta(common.MetaFlagReadonly, "true")
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
		return nil, pathNotWriteable
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
		return nil, a.recheckParents(ctx, err, in.From, true, false)
	}
	if !accessList.CanRead(ctx, fromParents...) {
		return nil, pathNotReadable
	}
	ctx, toParents, err := AncestorsListFromContext(ctx, in.To, "to", a.clientsPool, true)
	if err != nil {
		return nil, err
	}
	if !accessList.CanWrite(ctx, toParents...) {
		return nil, pathNotWriteable
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
		return nil, a.recheckParents(ctx, err, in.Node, true, false)
	}
	if !accessList.CanWrite(ctx, delParents...) {
		return nil, pathNotWriteable
	}
	if accessList.HasExplicitDeny(ctx, permissions.FlagDelete, delParents...) {
		return nil, errors.Forbidden("delete.forbidden", "Node cannot be deleted")
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
		return nil, a.recheckParents(ctx, err, node, true, false)
	}
	if !accessList.CanRead(ctx, parents...) {
		return nil, pathNotReadable
	}
	if accessList.HasExplicitDeny(ctx, permissions.FlagDownload, parents...) {
		return nil, errors.Forbidden("download.forbidden", "Node is not downloadable")
	}
	return a.next.GetObject(ctx, node, requestData)
}

func (a *AclFilterHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *PutRequestData) (int64, error) {
	if a.skipContext(ctx) {
		return a.next.PutObject(ctx, node, reader, requestData)
	}
	accessList := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)
	// First load ancestors or grab them from BranchInfo
	checkNode := node.Clone()
	checkNode.Type = tree.NodeType_LEAF
	checkNode.Size = requestData.Size
	ctx, parents, err := AncestorsListFromContext(ctx, checkNode, "in", a.clientsPool, true)
	if err != nil {
		return 0, err
	}
	if !accessList.CanWrite(ctx, parents...) {
		return 0, pathNotWriteable
	}
	if accessList.HasExplicitDeny(ctx, permissions.FlagUpload, parents...) {
		return 0, errors.Forbidden("upload.forbidden", "Parents have upload explicitly disabled")
	}
	return a.next.PutObject(ctx, node, reader, requestData)
}

func (a *AclFilterHandler) MultipartCreate(ctx context.Context, node *tree.Node, requestData *MultipartRequestData) (string, error) {
	if a.skipContext(ctx) {
		return a.next.MultipartCreate(ctx, node, requestData)
	}
	accessList := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)
	// First load ancestors or grab them from BranchInfo
	ctx, parents, err := AncestorsListFromContext(ctx, node, "in", a.clientsPool, true)
	if err != nil {
		return "", err
	}
	if !accessList.CanWrite(ctx, parents...) {
		return "", pathNotWriteable
	}
	if accessList.HasExplicitDeny(ctx, permissions.FlagUpload, parents...) {
		return "", errors.Forbidden("upload.forbidden", "Parents have upload explicitly disabled")
	}
	return a.next.MultipartCreate(ctx, node, requestData)
}

func (a *AclFilterHandler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *CopyRequestData) (int64, error) {
	if a.skipContext(ctx) {
		return a.next.CopyObject(ctx, from, to, requestData)
	}
	accessList := ctx.Value(CtxUserAccessListKey{}).(*permissions.AccessList)
	ctx, fromParents, err := AncestorsListFromContext(ctx, from, "from", a.clientsPool, false)
	if err != nil {
		return 0, a.recheckParents(ctx, err, from, true, false)
	}
	if !accessList.CanRead(ctx, fromParents...) {
		return 0, pathNotReadable
	}
	ctx, toParents, err := AncestorsListFromContext(ctx, to, "to", a.clientsPool, true)
	if err != nil {
		return 0, err
	}
	if !accessList.CanWrite(ctx, toParents...) {
		return 0, pathNotWriteable
	}
	if accessList.HasExplicitDeny(ctx, permissions.FlagUpload, toParents...) {
		return 0, errors.Forbidden("upload.forbidden", "Parents have upload explicitly disabled")
	}
	return a.next.CopyObject(ctx, from, to, requestData)
}

func (a *AclFilterHandler) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {

	var rwErr error
	switch operation.GetType() {
	case tree.NodeChangeEvent_UPDATE_CONTENT:

		rwErr = a.checkPerm(targetCtx, operation.GetTarget(), "in", true, false, true, permissions.FlagUpload)

	case tree.NodeChangeEvent_CREATE:

		rwErr = a.checkPerm(targetCtx, operation.GetTarget(), "in", true, false, true)

	case tree.NodeChangeEvent_DELETE:

		rwErr = a.checkPerm(srcCtx, operation.GetSource(), "in", false, false, true, permissions.FlagDelete)

	case tree.NodeChangeEvent_UPDATE_PATH:

		if rwErr = a.checkPerm(srcCtx, operation.GetSource(), "from", false, true, true); rwErr != nil {
			return rwErr
		}
		// For delete operations, ignore write permissions as recycle can be outside of authorized paths
		if operation.GetTarget().GetStringMeta(common.RecycleBinName) != "true" {
			rwErr = a.checkPerm(targetCtx, operation.GetTarget(), "to", true, false, true)
		}

	case tree.NodeChangeEvent_READ:

		if operation.GetSource().HasMetaKey("acl-check-download") {
			rwErr = a.checkPerm(srcCtx, operation.GetSource(), "in", false, true, false, permissions.FlagDownload)
		} else {
			rwErr = a.checkPerm(srcCtx, operation.GetSource(), "in", false, true, false)
		}

	}
	if rwErr != nil {
		return rwErr
	}
	return a.next.WrappedCanApply(srcCtx, targetCtx, operation)
}

func (a *AclFilterHandler) checkPerm(c context.Context, node *tree.Node, identifier string, orParents bool, read bool, write bool, explicitFlags ...permissions.BitmaskFlag) error {

	val := c.Value(CtxUserAccessListKey{})
	if val == nil {
		return fmt.Errorf("cannot find accessList in context for checking permissions")
	}
	accessList := val.(*permissions.AccessList)
	ctx, parents, err := AncestorsListFromContext(c, node, identifier, a.clientsPool, orParents)
	if err != nil {
		return a.recheckParents(c, err, node, read, write)
	}
	if read && !accessList.CanRead(ctx, parents...) {
		return pathNotReadable
	}
	if write && !accessList.CanWrite(ctx, parents...) {
		return pathNotWriteable
	}
	if len(explicitFlags) > 0 && accessList.HasExplicitDeny(ctx, explicitFlags[0], parents...) {
		return errors.Forbidden("explicit.deny", "path has explicit denies for flag "+permissions.FlagsToNames[explicitFlags[0]])
	}
	return nil

}

func (a *AclFilterHandler) recheckParents(c context.Context, originalError error, node *tree.Node, read, write bool) error {

	if errors.Parse(originalError.Error()).Code != 404 {
		return originalError
	}

	val := c.Value(CtxUserAccessListKey{})
	if val == nil {
		return fmt.Errorf("cannot find accessList in context for checking permissions")
	}
	accessList := val.(*permissions.AccessList)

	parents, e := BuildAncestorsListOrParent(c, a.clientsPool.GetTreeClient(), node)
	if e != nil {
		return e
	}

	if read && !accessList.CanRead(c, parents...) {
		return pathNotReadable
	}
	if write && !accessList.CanWrite(c, parents...) {
		return pathNotWriteable
	}

	return originalError
}
