/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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
	"io"

	"go.opentelemetry.io/otel/trace"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/tracing"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

// WithTracer appends a TracerAdapter to the list of wrappers
func WithTracer(name string, skip int) Option {
	return func(options *RouterOptions) {
		options.Wrappers = append(options.Wrappers, &TracerAdapter{name: name, skip: skip})
	}
}

// NewTracer creates a new TracerAdapter
func NewTracer(name string, skip ...int) Adapter {
	s := 1
	if len(skip) > 0 {
		s = skip[0]
	}
	return &TracerAdapter{name: name, skip: s}
}

type TracerAdapter struct {
	next Handler
	name string
	skip int
}

func (t *TracerAdapter) span(ctx context.Context, name string) (context.Context, trace.Span) {
	return tracing.StartLocalSpan(ctx, t.name+"."+name, t.skip+1)
}

func (t *TracerAdapter) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	ct, span := t.span(ctx, "ReadNode")
	defer span.End()
	return t.next.ReadNode(ct, in)
}

func (t *TracerAdapter) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	ct, span := t.span(ctx, "ListNodes")
	defer span.End()
	return t.next.ListNodes(ct, in, opts...)
}

func (t *TracerAdapter) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	ct, span := t.span(ctx, "CreateNode")
	defer span.End()
	return t.next.CreateNode(ct, in, opts...)
}

func (t *TracerAdapter) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...grpc.CallOption) (*tree.UpdateNodeResponse, error) {
	ct, span := t.span(ctx, "ListNodes")
	defer span.End()
	return t.next.UpdateNode(ct, in, opts...)
}

func (t *TracerAdapter) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...grpc.CallOption) (*tree.DeleteNodeResponse, error) {
	ct, span := t.span(ctx, "DeleteNode")
	defer span.End()
	return t.next.DeleteNode(ct, in, opts...)
}

func (t *TracerAdapter) StreamChanges(ctx context.Context, in *tree.StreamChangesRequest, opts ...grpc.CallOption) (tree.NodeChangesStreamer_StreamChangesClient, error) {
	ct, span := t.span(ctx, "StreamChanges")
	defer span.End()
	return t.next.StreamChanges(ct, in, opts...)
}

func (t *TracerAdapter) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	ct, span := t.span(ctx, "GetObject")
	defer span.End()
	return t.next.GetObject(ct, node, requestData)
}

func (t *TracerAdapter) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	ct, span := t.span(ctx, "PutObject")
	defer span.End()
	return t.next.PutObject(ct, node, reader, requestData)
}

func (t *TracerAdapter) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {
	ct, span := t.span(ctx, "CopyObject")
	defer span.End()
	return t.next.CopyObject(ct, from, to, requestData)
}

func (t *TracerAdapter) MultipartCreate(ctx context.Context, target *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	ct, span := t.span(ctx, "MultipartCreate")
	defer span.End()
	return t.next.MultipartCreate(ct, target, requestData)
}

func (t *TracerAdapter) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (models.MultipartObjectPart, error) {
	ct, span := t.span(ctx, "MultipartPutObjectPart")
	defer span.End()
	return t.next.MultipartPutObjectPart(ct, target, uploadID, partNumberMarker, reader, requestData)
}

func (t *TracerAdapter) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
	ct, span := t.span(ctx, "MultipartAbort")
	defer span.End()
	return t.next.MultipartAbort(ct, target, uploadID, requestData)
}

func (t *TracerAdapter) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []models.MultipartObjectPart) (models.ObjectInfo, error) {
	ct, span := t.span(ctx, "MultipartComplete")
	defer span.End()
	return t.next.MultipartComplete(ct, target, uploadID, uploadedParts)
}

func (t *TracerAdapter) MultipartList(ctx context.Context, prefix string, requestData *models.MultipartRequestData) (models.ListMultipartUploadsResult, error) {
	ct, span := t.span(ctx, "MultipartList")
	defer span.End()
	return t.next.MultipartList(ct, prefix, requestData)
}

func (t *TracerAdapter) MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (models.ListObjectPartsResult, error) {
	ct, span := t.span(ctx, "MultipartListObjectParts")
	defer span.End()
	return t.next.MultipartListObjectParts(ct, target, uploadID, partNumberMarker, maxParts)
}

func (t *TracerAdapter) ExecuteWrapped(inputFilter FilterFunc, outputFilter FilterFunc, provider CallbackFunc) error {
	return t.next.ExecuteWrapped(inputFilter, outputFilter, provider)
}

func (t *TracerAdapter) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {
	return t.next.WrappedCanApply(srcCtx, targetCtx, operation)
}

func (t *TracerAdapter) ListNodesWithCallback(ctx context.Context, request *tree.ListNodesRequest, callback WalkFunc, ignoreCbError bool, filters ...WalkFilterFunc) error {
	ct, span := t.span(ctx, "ListNodesWithCallback")
	defer span.End()
	return t.next.ListNodesWithCallback(ct, request, callback, ignoreCbError, filters...)
}

func (t *TracerAdapter) SetClientsPool(p *openurl.Pool[SourcesPool]) {
	return
}

func (t *TracerAdapter) Adapt(h Handler, options RouterOptions) Handler {
	t.next = h
	return t
}
