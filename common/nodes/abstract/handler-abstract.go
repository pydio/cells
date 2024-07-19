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

package abstract

import (
	"context"
	"fmt"
	"io"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/nodes"
	nodescontext "github.com/pydio/cells/v4/common/nodes/context"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

type ContextWrapper func(ctx context.Context) (context.Context, error)

// Handler provides the simplest implementation of Handler and forwards
// all calls to the Next handler
type Handler struct {
	Next        nodes.Handler
	ClientsPool *openurl.Pool[nodes.SourcesPool]
	RuntimeCtx  context.Context
	CtxWrapper  ContextWrapper
}

func (a *Handler) AdaptOptions(h nodes.Handler, options nodes.RouterOptions) {
	a.Next = h
	a.RuntimeCtx = options.Context
	a.ClientsPool = options.Pool
}

func (a *Handler) WrapContext(ctx context.Context) (context.Context, error) {
	ctx = nodescontext.WithSourcesPool(ctx, a.ClientsPool)
	if a.CtxWrapper != nil {
		return a.CtxWrapper(ctx)
	} else {
		return ctx, nil
	}
}

func (a *Handler) SetNextHandler(h nodes.Handler) {
	a.Next = h
}

func (a *Handler) SetClientsPool(p *openurl.Pool[nodes.SourcesPool]) {
	a.ClientsPool = p
}

func (a *Handler) ContextPool(ctx context.Context) nodes.SourcesPool {
	p, _ := a.ClientsPool.Get(ctx)
	return p
}

func (a *Handler) ExecuteWrapped(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc, provider nodes.CallbackFunc) error {
	wrappedIn := func(ctx context.Context, inputNode *tree.Node, identifier string) (context.Context, *tree.Node, error) {
		ctx, outputNode, err := inputFilter(ctx, inputNode, identifier)
		if err != nil {
			return ctx, inputNode, err
		}
		ctx, err = a.WrapContext(ctx)
		if err != nil {
			return ctx, inputNode, err
		}
		return ctx, outputNode, nil
	}
	return a.Next.ExecuteWrapped(wrappedIn, outputFilter, provider)
}

func (a *Handler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return nil, err
	}
	log.Logger(ctx).Debug("ReadNode", zap.Any("handler", fmt.Sprintf("%T", a.Next)))
	return a.Next.ReadNode(ctx, in, opts...)
}

func (a *Handler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return nil, err
	}
	return a.Next.ListNodes(ctx, in, opts...)
}

func (a *Handler) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return nil, err
	}
	return a.Next.CreateNode(ctx, in, opts...)
}

func (a *Handler) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...grpc.CallOption) (*tree.UpdateNodeResponse, error) {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return nil, err
	}
	return a.Next.UpdateNode(ctx, in, opts...)
}

func (a *Handler) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...grpc.CallOption) (*tree.DeleteNodeResponse, error) {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return nil, err
	}
	return a.Next.DeleteNode(ctx, in, opts...)
}

func (a *Handler) StreamChanges(ctx context.Context, in *tree.StreamChangesRequest, opts ...grpc.CallOption) (tree.NodeChangesStreamer_StreamChangesClient, error) {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return nil, err
	}
	return a.Next.StreamChanges(ctx, in, opts...)
}

func (a *Handler) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return nil, err
	}
	return a.Next.GetObject(ctx, node, requestData)
}

func (a *Handler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return models.ObjectInfo{}, err
	}
	return a.Next.PutObject(ctx, node, reader, requestData)
}

func (a *Handler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return models.ObjectInfo{}, err
	}
	return a.Next.CopyObject(ctx, from, to, requestData)
}

func (a *Handler) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {
	return a.Next.WrappedCanApply(srcCtx, targetCtx, operation)
}

// Multi part upload management

func (a *Handler) MultipartCreate(ctx context.Context, target *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return "", err
	}
	return a.Next.MultipartCreate(ctx, target, requestData)
}

func (a *Handler) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (models.MultipartObjectPart, error) {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return models.MultipartObjectPart{PartNumber: partNumberMarker}, err
	}
	return a.Next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
}

func (a *Handler) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []models.MultipartObjectPart) (models.ObjectInfo, error) {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return models.ObjectInfo{}, err
	}
	return a.Next.MultipartComplete(ctx, target, uploadID, uploadedParts)
}

func (a *Handler) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return err
	}
	return a.Next.MultipartAbort(ctx, target, uploadID, requestData)
}

func (a *Handler) MultipartList(ctx context.Context, prefix string, requestData *models.MultipartRequestData) (models.ListMultipartUploadsResult, error) {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return models.ListMultipartUploadsResult{}, err
	}
	return a.Next.MultipartList(ctx, prefix, requestData)
}

func (a *Handler) MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (models.ListObjectPartsResult, error) {
	ctx, err := a.WrapContext(ctx)
	if err != nil {
		return models.ListObjectPartsResult{}, err
	}
	return a.Next.MultipartListObjectParts(ctx, target, uploadID, partNumberMarker, maxParts)
}

func (a *Handler) ListNodesWithCallback(ctx context.Context, request *tree.ListNodesRequest, callback nodes.WalkFunc, ignoreCbError bool, filters ...nodes.WalkFilterFunc) error {
	return nodes.HandlerListNodesWithCallback(a, ctx, request, callback, ignoreCbError, filters...)
}
