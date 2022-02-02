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

package compose

import (
	"context"
	"fmt"
	"io"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
)

func init() {
	abstract.AdminClientProvider = func(runtime context.Context) nodes.Client {
		return NewClient(PathComposer(nodes.WithContext(runtime), nodes.AsAdmin(), nodes.WithRegistryWatch())...)
	}
}

func NewClient(opts ...nodes.Option) nodes.Client {
	return newClient(opts...)
}

func newClient(opts ...nodes.Option) *clientImpl {
	options := nodes.RouterOptions{}
	for _, o := range opts {
		o(&options)
	}

	options.Pool = nodes.NewClientsPool(options.Context, options.WatchRegistry)

	var handler nodes.Handler

	handler = options.CoreClient(options.Pool)

	// wrap in reverse
	for i := len(options.Wrappers); i > 0; i-- {
		handler = options.Wrappers[i-1].Adapt(handler, options)
	}
	return &clientImpl{
		handler:    handler,
		pool:       options.Pool,
		runtimeCtx: options.Context,
	}
}

type clientImpl struct {
	handler    nodes.Handler
	runtimeCtx context.Context
	pool       nodes.SourcesPool
}

func (v *clientImpl) WrapCallback(provider nodes.CallbackFunc) error {
	return v.ExecuteWrapped(nil, nil, provider)
}

func (v *clientImpl) BranchInfoForNode(ctx context.Context, node *tree.Node) (branch nodes.BranchInfo, err error) {
	err = v.WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {
		updatedCtx, _, er := inputFilter(ctx, node, "in")
		if er != nil {
			return er
		}
		if dsInfo, o := nodes.GetBranchInfo(updatedCtx, "in"); o {
			branch = dsInfo
		} else {
			return fmt.Errorf("cannot find branch info for node " + node.GetPath())
		}
		return nil
	})
	return
}

func (v *clientImpl) ExecuteWrapped(_ nodes.FilterFunc, _ nodes.FilterFunc, provider nodes.CallbackFunc) error {
	identity := func(ctx context.Context, inputNode *tree.Node, identifier string) (context.Context, *tree.Node, error) {
		return ctx, inputNode, nil
	}
	return v.handler.ExecuteWrapped(identity, identity, provider)
}

func (v *clientImpl) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	h := v.handler

	return h.ReadNode(ctx, in, opts...)
}

func (v *clientImpl) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	h := v.handler
	return h.ListNodes(ctx, in, opts...)
}

func (v *clientImpl) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	h := v.handler
	return h.CreateNode(ctx, in, opts...)
}

func (v *clientImpl) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...grpc.CallOption) (*tree.UpdateNodeResponse, error) {
	h := v.handler
	return h.UpdateNode(ctx, in, opts...)
}

func (v *clientImpl) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...grpc.CallOption) (*tree.DeleteNodeResponse, error) {
	h := v.handler
	return h.DeleteNode(ctx, in, opts...)
}

func (v *clientImpl) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	h := v.handler
	return h.GetObject(ctx, node, requestData)
}

func (v *clientImpl) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (int64, error) {
	h := v.handler
	return h.PutObject(ctx, node, reader, requestData)
}

func (v *clientImpl) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (int64, error) {
	h := v.handler
	return h.CopyObject(ctx, from, to, requestData)
}

func (v *clientImpl) MultipartCreate(ctx context.Context, target *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	return v.handler.MultipartCreate(ctx, target, requestData)
}

func (v *clientImpl) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (models.MultipartObjectPart, error) {
	return v.handler.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
}

func (v *clientImpl) MultipartList(ctx context.Context, prefix string, requestData *models.MultipartRequestData) (models.ListMultipartUploadsResult, error) {
	return v.handler.MultipartList(ctx, prefix, requestData)
}

func (v *clientImpl) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
	return v.handler.MultipartAbort(ctx, target, uploadID, requestData)
}

func (v *clientImpl) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []models.MultipartObjectPart) (models.ObjectInfo, error) {
	return v.handler.MultipartComplete(ctx, target, uploadID, uploadedParts)
}

func (v *clientImpl) MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (models.ListObjectPartsResult, error) {
	return v.handler.MultipartListObjectParts(ctx, target, uploadID, partNumberMarker, maxParts)
}

func (v *clientImpl) StreamChanges(ctx context.Context, in *tree.StreamChangesRequest, opts ...grpc.CallOption) (tree.NodeChangesStreamer_StreamChangesClient, error) {
	return v.handler.StreamChanges(ctx, in, opts...)
}

func (v *clientImpl) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {
	return v.handler.WrappedCanApply(srcCtx, targetCtx, operation)
}

func (v *clientImpl) CanApply(ctx context.Context, operation *tree.NodeChangeEvent) (*tree.NodeChangeEvent, error) {
	var innerOperation *tree.NodeChangeEvent
	e := v.WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {
		var sourceNode, targetNode *tree.Node
		var sourceCtx, targetCtx context.Context
		switch operation.Type {
		case tree.NodeChangeEvent_CREATE, tree.NodeChangeEvent_UPDATE_CONTENT:
			targetNode = operation.Target
		case tree.NodeChangeEvent_READ, tree.NodeChangeEvent_DELETE:
			sourceNode = operation.Source
		case tree.NodeChangeEvent_UPDATE_PATH:
			targetNode = operation.Target
			sourceNode = operation.Source
		}
		var e error
		if targetNode != nil {
			targetCtx, targetNode, e = inputFilter(ctx, targetNode, "in")
			if e != nil {
				return e
			}
		}
		if sourceNode != nil {
			sourceCtx, sourceNode, e = inputFilter(ctx, targetNode, "in")
			if e != nil {
				return e
			}
		}
		innerOperation = &tree.NodeChangeEvent{Type: operation.Type, Source: sourceNode, Target: targetNode}
		return v.WrappedCanApply(sourceCtx, targetCtx, &tree.NodeChangeEvent{Type: operation.Type, Source: sourceNode, Target: targetNode})
	})
	return innerOperation, e
}

func (v *clientImpl) SetClientsPool(nodes.SourcesPool) {}

// GetClientsPool returns internal pool
func (v *clientImpl) GetClientsPool() nodes.SourcesPool {
	return v.pool
}

// ListNodesWithCallback performs a ListNodes request and applied callback with optional filters. This hides the complexity of streams handling.
func (v *clientImpl) ListNodesWithCallback(ctx context.Context, request *tree.ListNodesRequest, callback nodes.WalkFunc, ignoreCbError bool, filters ...nodes.WalkFilterFunc) error {

	return nodes.HandlerListNodesWithCallback(v, ctx, request, callback, ignoreCbError, filters...)

}
