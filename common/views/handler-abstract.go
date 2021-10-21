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

package views

import (
	"context"
	"fmt"
	"io"

	"github.com/micro/go-micro/client"
	"github.com/pydio/minio-go"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views/models"
)

type ContextWrapper func(ctx context.Context) (context.Context, error)

// AbstractHandler provides the simplest implementation of Handler and forwards
// all calls to the next handler
type AbstractHandler struct {
	next        Handler
	clientsPool SourcesPool
	CtxWrapper  ContextWrapper
}

func (a *AbstractHandler) wrapContext(ctx context.Context) (context.Context, error) {
	if a.CtxWrapper != nil {
		return a.CtxWrapper(ctx)
	} else {
		return ctx, nil
	}
}

func (a *AbstractHandler) SetNextHandler(h Handler) {
	a.next = h
}

func (a *AbstractHandler) SetClientsPool(p SourcesPool) {
	a.clientsPool = p
}

func (a *AbstractHandler) ExecuteWrapped(inputFilter NodeFilter, outputFilter NodeFilter, provider NodesCallback) error {
	wrappedIn := func(ctx context.Context, inputNode *tree.Node, identifier string) (context.Context, *tree.Node, error) {
		ctx, outputNode, err := inputFilter(ctx, inputNode, identifier)
		if err != nil {
			return ctx, inputNode, err
		}
		ctx, err = a.wrapContext(ctx)
		if err != nil {
			return ctx, inputNode, err
		}
		return ctx, outputNode, nil
	}
	return a.next.ExecuteWrapped(wrappedIn, outputFilter, provider)
}

func (a *AbstractHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return nil, err
	}
	log.Logger(ctx).Debug("ReadNode", zap.Any("handler", fmt.Sprintf("%T", a.next)))
	return a.next.ReadNode(ctx, in, opts...)
}

func (a *AbstractHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return nil, err
	}
	return a.next.ListNodes(ctx, in, opts...)
}

func (a *AbstractHandler) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...client.CallOption) (*tree.CreateNodeResponse, error) {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return nil, err
	}
	return a.next.CreateNode(ctx, in, opts...)
}

func (a *AbstractHandler) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...client.CallOption) (*tree.UpdateNodeResponse, error) {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return nil, err
	}
	return a.next.UpdateNode(ctx, in, opts...)
}

func (a *AbstractHandler) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...client.CallOption) (*tree.DeleteNodeResponse, error) {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return nil, err
	}
	return a.next.DeleteNode(ctx, in, opts...)
}

func (a *AbstractHandler) StreamChanges(ctx context.Context, in *tree.StreamChangesRequest, opts ...client.CallOption) (tree.NodeChangesStreamer_StreamChangesClient, error) {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return nil, err
	}
	return a.next.StreamChanges(ctx, in, opts...)
}

func (a *AbstractHandler) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return nil, err
	}
	return a.next.GetObject(ctx, node, requestData)
}

func (a *AbstractHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (int64, error) {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return 0, err
	}
	return a.next.PutObject(ctx, node, reader, requestData)
}

func (a *AbstractHandler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (int64, error) {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return 0, err
	}
	return a.next.CopyObject(ctx, from, to, requestData)
}

func (a *AbstractHandler) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {
	return a.next.WrappedCanApply(srcCtx, targetCtx, operation)
}

// Multi part upload management

func (a *AbstractHandler) MultipartCreate(ctx context.Context, target *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return "", err
	}
	return a.next.MultipartCreate(ctx, target, requestData)
}

func (a *AbstractHandler) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (minio.ObjectPart, error) {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return minio.ObjectPart{PartNumber: partNumberMarker}, err
	}
	return a.next.MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
}

func (a *AbstractHandler) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []minio.CompletePart) (minio.ObjectInfo, error) {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return minio.ObjectInfo{}, err
	}
	return a.next.MultipartComplete(ctx, target, uploadID, uploadedParts)
}

func (a *AbstractHandler) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return err
	}
	return a.next.MultipartAbort(ctx, target, uploadID, requestData)
}

func (a *AbstractHandler) MultipartList(ctx context.Context, prefix string, requestData *models.MultipartRequestData) (minio.ListMultipartUploadsResult, error) {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return minio.ListMultipartUploadsResult{}, err
	}
	return a.next.MultipartList(ctx, prefix, requestData)
}

func (a *AbstractHandler) MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (minio.ListObjectPartsResult, error) {
	ctx, err := a.wrapContext(ctx)
	if err != nil {
		return minio.ListObjectPartsResult{}, err
	}
	return a.next.MultipartListObjectParts(ctx, target, uploadID, partNumberMarker, maxParts)
}

func (a *AbstractHandler) ListNodesWithCallback(ctx context.Context, request *tree.ListNodesRequest, callback WalkFunc, ignoreCbError bool, filters ...WalkFilter) error {
	return handlerListNodesWithCallback(a, ctx, request, callback, ignoreCbError, filters...)
}
