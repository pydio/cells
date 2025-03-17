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

package acl

import (
	"context"
	"fmt"
	"io"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/tree"
)

func WithFilter() nodes.Option {
	return func(options *nodes.RouterOptions) {
		if !options.AdminView {
			options.Wrappers = append(options.Wrappers, &FilterHandler{})
		}
	}
}

// FilterHandler checks for read/write permissions depending on the call using the context AccessList.
type FilterHandler struct {
	abstract.Handler
}

func (a *FilterHandler) Adapt(h nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	a.AdaptOptions(h, options)
	return a
}

func (a *FilterHandler) skipContext(ctx context.Context, identifier ...string) bool {
	if nodes.HasSkipAclCheck(ctx) {
		return true
	}
	id := "in"
	if len(identifier) > 0 {
		id = identifier[0]
	}
	bI, er := nodes.GetBranchInfo(ctx, id)
	return er == nil && (bI.Binary || bI.TransparentBinary)
}

// ReadNode checks if node is readable and forward to next middleware.
func (a *FilterHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	if a.skipContext(ctx) {
		return a.Next.ReadNode(ctx, in, opts...)
	}
	accessList := ctx.Value(ctxUserAccessListKey{}).(*permissions.AccessList)

	// First load ancestors or grab them from BranchInfo
	ctx, parents, err := nodes.AncestorsListFromContext(ctx, in.Node, "in", false)
	if err != nil {
		// Recheck is used to send proper error to user (NotFound vs Forbidden)
		// If ExistsOnly, we don't care about the error code
		if tree.StatFlags(in.StatFlags).ExistsOnly() {
			return nil, err
		}
		return nil, a.recheckParents(ctx, err, in.Node, true, false)
	}
	if !accessList.CanRead(ctx, parents...) && !accessList.CanWrite(ctx, parents...) {
		return nil, errors.WithStack(errors.PathNotReadable)
	}
	checkDl := in.Node.HasMetaKey(nodes.MetaAclCheckDownload)
	checkSync := in.Node.HasMetaKey(nodes.MetaAclCheckSyncable)
	response, err := a.Next.ReadNode(ctx, in, opts...)
	if err != nil {
		return nil, err
	}
	if accessList.CanRead(ctx, parents...) && !accessList.CanWrite(ctx, parents...) {
		n := response.Node.Clone()
		n.MustSetMeta(common.MetaFlagReadonly, "true")
		response.Node = n
	} else if !accessList.CanRead(ctx, parents...) && accessList.CanWrite(ctx, parents...) {
		n := response.Node.Clone()
		// Set special flag and remove children info
		n.MustSetMeta(common.MetaFlagWriteOnly, "true")
		delete(n.MetaStore, common.MetaFlagChildrenCount)
		delete(n.MetaStore, common.MetaFlagChildrenFolders)
		delete(n.MetaStore, common.MetaFlagChildrenFiles)
		delete(n.MetaStore, common.MetaFlagRecursiveCount)
		response.Node = n
	}
	updatedParents := append([]*tree.Node{response.GetNode()}, parents[1:]...)
	if checkDl && accessList.HasExplicitDeny(ctx, permissions.FlagDownload, updatedParents...) {
		return nil, errors.WithStack(errors.PathDownloadForbidden)
	}
	if checkSync && accessList.HasExplicitDeny(ctx, permissions.FlagSync, updatedParents...) {
		n := response.Node.Clone()
		n.MustSetMeta(common.MetaFlagWorkspaceSyncable, false)
		response.Node = n
	}
	return response, err
}

// ListNodes filters list results with ACLs permissions
func (a *FilterHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (streamer tree.NodeProvider_ListNodesClient, e error) {
	if a.skipContext(ctx) {
		return a.Next.ListNodes(ctx, in, opts...)
	}
	accessList := ctx.Value(ctxUserAccessListKey{}).(*permissions.AccessList)
	// First load ancestors or grab them from BranchInfo
	ctx, parents, err := nodes.AncestorsListFromContext(ctx, in.Node, "in", false)
	if err != nil {
		return nil, a.recheckParents(ctx, err, in.Node, true, false)
	}

	if !accessList.CanRead(ctx, parents...) {
		return nil, errors.WithStack(errors.PathNotReadable)
	}

	stream, err := a.Next.ListNodes(ctx, in, opts...)
	if err != nil {
		return nil, err
	}
	s := nodes.NewWrappingStreamer(stream.Context())
	go func() {
		defer s.CloseSend()
		for {
			resp, er := stream.Recv()
			if er != nil {
				if !errors.IsStreamFinished(er) {
					_ = s.SendError(er)
				}
				break
			}
			if resp == nil {
				continue
			}
			// FILTER OUT NON READABLE NODES
			var newBranch []*tree.Node
			if len(parents) > 0 && parents[0].Path != resp.Node.Path {
				newBranch = append(newBranch, resp.Node)
			}
			newBranch = append(newBranch, parents...)
			if !accessList.CanRead(ctx, newBranch...) {
				continue
			}
			if accessList.CanRead(ctx, newBranch...) && !accessList.CanWrite(ctx, newBranch...) {
				n := resp.Node.Clone()
				n.MustSetMeta(common.MetaFlagReadonly, "true")
				resp.Node = n
			}
			_ = s.Send(resp)
		}
	}()

	return s, nil
}

func (a *FilterHandler) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	if a.skipContext(ctx) {
		return a.Next.CreateNode(ctx, in, opts...)
	}
	accessList := ctx.Value(ctxUserAccessListKey{}).(*permissions.AccessList)
	ctx, toParents, err := nodes.AncestorsListFromContext(ctx, in.Node, "in", true)
	if err != nil {
		return nil, err
	}
	if !accessList.CanWrite(ctx, toParents...) {
		return nil, errors.WithStack(errors.PathNotWriteable)
	}
	return a.Next.CreateNode(ctx, in, opts...)
}

func (a *FilterHandler) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...grpc.CallOption) (*tree.UpdateNodeResponse, error) {
	if a.skipContext(ctx) {
		return a.Next.UpdateNode(ctx, in, opts...)
	}
	accessList := ctx.Value(ctxUserAccessListKey{}).(*permissions.AccessList)
	ctx, fromParents, err := nodes.AncestorsListFromContext(ctx, in.From, "from", false)
	if err != nil {
		return nil, a.recheckParents(ctx, err, in.From, true, false)
	}
	if !accessList.CanRead(ctx, fromParents...) {
		return nil, errors.PathNotReadable
	}
	ctx, toParents, err := nodes.AncestorsListFromContext(ctx, in.To, "to", true)
	if err != nil {
		return nil, err
	}
	if !accessList.CanWrite(ctx, toParents...) {
		return nil, errors.WithStack(errors.PathNotWriteable)
	}
	return a.Next.UpdateNode(ctx, in, opts...)
}

func (a *FilterHandler) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...grpc.CallOption) (*tree.DeleteNodeResponse, error) {
	if a.skipContext(ctx) {
		return a.Next.DeleteNode(ctx, in, opts...)
	}
	accessList := ctx.Value(ctxUserAccessListKey{}).(*permissions.AccessList)
	ctx, delParents, err := nodes.AncestorsListFromContext(ctx, in.Node, "in", false)
	if err != nil {
		return nil, a.recheckParents(ctx, err, in.Node, true, false)
	}
	if !accessList.CanWrite(ctx, delParents...) {
		return nil, errors.WithStack(errors.PathNotWriteable)
	}
	if accessList.HasExplicitDeny(ctx, permissions.FlagDelete, delParents...) {
		return nil, errors.WithStack(errors.PathDeleteForbidden)
	}
	return a.Next.DeleteNode(ctx, in, opts...)
}

func (a *FilterHandler) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	if a.skipContext(ctx) {
		return a.Next.GetObject(ctx, node, requestData)
	}
	accessList := ctx.Value(ctxUserAccessListKey{}).(*permissions.AccessList)
	// First load ancestors or grab them from BranchInfo
	ctx, parents, err := nodes.AncestorsListFromContext(ctx, node, "in", false)
	if err != nil {
		return nil, a.recheckParents(ctx, err, node, true, false)
	}
	if !accessList.CanRead(ctx, parents...) {
		return nil, errors.WithStack(errors.PathNotReadable)
	}
	if accessList.HasExplicitDeny(ctx, permissions.FlagDownload, parents...) {
		return nil, errors.WithStack(errors.PathDownloadForbidden)
	}
	return a.Next.GetObject(ctx, node, requestData)
}

func (a *FilterHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	if a.skipContext(ctx) {
		return a.Next.PutObject(ctx, node, reader, requestData)
	}
	accessList := ctx.Value(ctxUserAccessListKey{}).(*permissions.AccessList)
	// First load ancestors or grab them from BranchInfo
	checkNode := node.Clone()
	checkNode.Type = tree.NodeType_LEAF
	checkNode.Size = requestData.Size
	ctx, parents, err := nodes.AncestorsListFromContext(ctx, checkNode, "in", true)
	if err != nil {
		return models.ObjectInfo{}, err
	}
	if !accessList.CanWrite(ctx, parents...) {
		return models.ObjectInfo{}, errors.WithStack(errors.PathNotWriteable)
	}
	if accessList.HasExplicitDeny(ctx, permissions.FlagUpload, parents...) {
		return models.ObjectInfo{}, errors.WithStack(errors.PathUploadForbidden)
	}
	return a.Next.PutObject(ctx, node, reader, requestData)
}

func (a *FilterHandler) MultipartCreate(ctx context.Context, node *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	if a.skipContext(ctx) {
		return a.Next.MultipartCreate(ctx, node, requestData)
	}
	accessList := ctx.Value(ctxUserAccessListKey{}).(*permissions.AccessList)
	// First load ancestors or grab them from BranchInfo
	ctx, parents, err := nodes.AncestorsListFromContext(ctx, node, "in", true)
	if err != nil {
		return "", err
	}
	if !accessList.CanWrite(ctx, parents...) {
		return "", errors.WithStack(errors.PathNotWriteable)
	}
	if accessList.HasExplicitDeny(ctx, permissions.FlagUpload, parents...) {
		return "", errors.WithStack(errors.PathUploadForbidden)
	}
	return a.Next.MultipartCreate(ctx, node, requestData)
}

func (a *FilterHandler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {
	if a.skipContext(ctx) {
		return a.Next.CopyObject(ctx, from, to, requestData)
	}
	accessList := ctx.Value(ctxUserAccessListKey{}).(*permissions.AccessList)
	ctx, fromParents, err := nodes.AncestorsListFromContext(ctx, from, "from", false)
	if err != nil {
		return models.ObjectInfo{}, a.recheckParents(ctx, err, from, true, false)
	}
	if !accessList.CanRead(ctx, fromParents...) {
		return models.ObjectInfo{}, errors.WithStack(errors.PathNotReadable)
	}
	ctx, toParents, err := nodes.AncestorsListFromContext(ctx, to, "to", true)
	if err != nil {
		return models.ObjectInfo{}, err
	}
	if !accessList.CanWrite(ctx, toParents...) {
		return models.ObjectInfo{}, errors.WithStack(errors.PathNotWriteable)
	}
	if accessList.HasExplicitDeny(ctx, permissions.FlagUpload, toParents...) {
		return models.ObjectInfo{}, errors.WithStack(errors.PathUploadForbidden)
	}
	fullTargets := append(toParents, to)
	if accessList.HasExplicitDeny(ctx, permissions.FlagDownload, fromParents...) && !accessList.HasExplicitDeny(ctx, permissions.FlagDownload, fullTargets...) {
		return models.ObjectInfo{}, errors.WithStack(errors.PathDownloadForbidden)
	}
	return a.Next.CopyObject(ctx, from, to, requestData)
}

func (a *FilterHandler) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {

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

		if operation.GetSource().HasMetaKey(nodes.MetaAclCheckDownload) {
			rwErr = a.checkPerm(srcCtx, operation.GetSource(), "in", false, true, false, permissions.FlagDownload)
		} else {
			rwErr = a.checkPerm(srcCtx, operation.GetSource(), "in", false, true, false)
		}

	}
	if rwErr != nil {
		return rwErr
	}
	return a.Next.WrappedCanApply(srcCtx, targetCtx, operation)
}

func (a *FilterHandler) checkPerm(c context.Context, node *tree.Node, identifier string, orParents bool, read bool, write bool, explicitFlags ...permissions.BitmaskFlag) error {

	val := c.Value(ctxUserAccessListKey{})
	if val == nil {
		return errors.WithStack(errors.AccessListNotFound)
	}
	accessList := val.(*permissions.AccessList)
	ctx, parents, err := nodes.AncestorsListFromContext(c, node, identifier, orParents)
	if err != nil {
		return a.recheckParents(c, err, node, read, write)
	}
	if read && !accessList.CanRead(ctx, parents...) {
		return errors.WithStack(errors.PathNotReadable)
	}
	if write && !accessList.CanWrite(ctx, parents...) {
		return errors.WithStack(errors.PathNotWriteable)
	}
	if len(explicitFlags) > 0 && accessList.HasExplicitDeny(ctx, explicitFlags[0], parents...) {
		return errors.WithMessagef(errors.PathExplicitDeny, "path has explicit denies for flag %s", permissions.FlagsToNames[explicitFlags[0]])
	}
	return nil

}

func (a *FilterHandler) recheckParents(c context.Context, originalError error, node *tree.Node, read, write bool) error {

	if !errors.Is(originalError, errors.StatusNotFound) {
		return originalError
	}

	val := c.Value(ctxUserAccessListKey{})
	if val == nil {
		return fmt.Errorf("cannot find accessList in context for checking permissions")
	}
	accessList := val.(*permissions.AccessList)

	parents, e := nodes.BuildAncestorsListOrParent(c, nodes.GetSourcesPool(c).GetTreeClient(), node)
	if e != nil {
		return e
	}

	if read && !accessList.CanRead(c, parents...) {
		return errors.WithStack(errors.PathNotReadable)
	}
	if write && !accessList.CanWrite(c, parents...) {
		return errors.WithStack(errors.PathNotWriteable)
	}

	return originalError
}
