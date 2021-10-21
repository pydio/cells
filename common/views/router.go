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

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views/models"
)

// RouterOptions holds configuration flags to pass to a routeur constructor easily.
type RouterOptions struct {
	AdminView          bool
	WatchRegistry      bool
	LogReadEvents      bool
	BrowseVirtualNodes bool
	// AuditEvent flag turns audit logger ON for the corresponding router.
	AuditEvent       bool
	SynchronousCache bool
	SynchronousTasks bool
}

// NewStandardRouter returns a new configured instance of the default standard router.
func NewStandardRouter(options RouterOptions) *Router {

	handlers := []Handler{
		NewAccessListHandler(options.AdminView),
		&BinaryStoreHandler{
			StoreName:      common.PydioThumbstoreNamespace, // Direct access to dedicated Bucket for thumbnails
			TransparentGet: true,
		},
		&BinaryStoreHandler{
			StoreName:     common.PydioDocstoreBinariesNamespace, // Direct access to dedicated Bucket for pydio binaries
			AllowPut:      true,
			AllowAnonRead: true,
		},
	}
	handlers = append(handlers, NewArchiveHandler())
	handlers = append(handlers, NewPathWorkspaceHandler())
	handlers = append(handlers, NewPathMultipleRootsHandler())
	if !options.BrowseVirtualNodes && !options.AdminView {
		handlers = append(handlers, NewVirtualNodesHandler())
	}
	if options.BrowseVirtualNodes {
		handlers = append(handlers, NewVirtualNodesBrowser())
	}
	handlers = append(handlers, NewWorkspaceRootResolver())
	handlers = append(handlers, NewPathDataSourceHandler())

	if options.SynchronousCache {
		handlers = append(handlers, NewSynchronousCacheHandler())
	}
	if options.AuditEvent {
		handlers = append(handlers, &HandlerAuditEvent{})
	}
	if !options.AdminView {
		handlers = append(handlers, &AclFilterHandler{})
	}
	if options.LogReadEvents {
		handlers = append(handlers, &HandlerEventRead{})
	}

	handlers = append(handlers, &PutHandler{})
	handlers = append(handlers, &AclLockFilter{})
	if !options.AdminView {
		handlers = append(handlers, &UploadLimitFilter{})
		handlers = append(handlers, &AclContentLockFilter{})
		handlers = append(handlers, &AclQuotaFilter{})
	}

	if options.SynchronousTasks {
		handlers = append(handlers, &SyncFolderTasksHandler{})
	}
	handlers = append(handlers, &VersionHandler{})
	handlers = append(handlers, &EncryptionHandler{})
	handlers = append(handlers, &FlatStorageHandler{})
	handlers = append(handlers, &Executor{})

	pool := NewClientsPool(options.WatchRegistry)

	return NewRouter(pool, handlers)
}

// NewUuidRouter returns a new configured instance of a router
// that relies on nodes UUID rather than the usual Node path.
func NewUuidRouter(options RouterOptions) *Router {
	handlers := []Handler{
		NewAccessListHandler(options.AdminView),
		NewUuidNodeHandler(),
		NewUuidDataSourceHandler(),
	}

	if options.AuditEvent {
		handlers = append(handlers, &HandlerAuditEvent{})
	}

	if !options.AdminView {
		handlers = append(handlers, &AclFilterHandler{})
	}
	handlers = append(handlers, &PutHandler{}) // adds a node precreation on PUT file request
	if !options.AdminView {
		handlers = append(handlers, &UploadLimitFilter{})
		handlers = append(handlers, &AclLockFilter{})
		handlers = append(handlers, &AclContentLockFilter{})
		handlers = append(handlers, &AclQuotaFilter{})
	}
	handlers = append(handlers, &VersionHandler{})
	handlers = append(handlers, &EncryptionHandler{}) // retrieves encryption materials from encryption service
	handlers = append(handlers, &FlatStorageHandler{})
	handlers = append(handlers, &Executor{})

	pool := NewClientsPool(options.WatchRegistry)
	return NewRouter(pool, handlers)
}

// NewRouter creates and configures a new router with given ClientsPool and Handlers.
func NewRouter(pool SourcesPool, handlers []Handler) *Router {
	r := &Router{
		handlers: handlers,
		pool:     pool,
	}
	r.initHandlers()
	return r
}

type Router struct {
	handlers []Handler
	pool     SourcesPool
}

func (v *Router) initHandlers() {
	for i, h := range v.handlers {
		if i < len(v.handlers)-1 {
			next := v.handlers[i+1]
			h.SetNextHandler(next)
		}
		h.SetClientsPool(v.pool)
	}
}

func (v *Router) WrapCallback(provider NodesCallback) error {
	return v.ExecuteWrapped(nil, nil, provider)
}

func (v *Router) BranchInfoForNode(ctx context.Context, node *tree.Node) (branch BranchInfo, err error) {
	err = v.WrapCallback(func(inputFilter NodeFilter, outputFilter NodeFilter) error {
		updatedCtx, _, er := inputFilter(ctx, node, "in")
		if er != nil {
			return er
		}
		if dsInfo, o := GetBranchInfo(updatedCtx, "in"); o {
			branch = dsInfo
		} else {
			return fmt.Errorf("cannot find branch info for node " + node.GetPath())
		}
		return nil
	})
	return
}

func (v *Router) ExecuteWrapped(inputFilter NodeFilter, outputFilter NodeFilter, provider NodesCallback) error {
	outputFilter = func(ctx context.Context, inputNode *tree.Node, identifier string) (context.Context, *tree.Node, error) {
		return ctx, inputNode, nil
	}
	inputFilter = func(ctx context.Context, inputNode *tree.Node, identifier string) (context.Context, *tree.Node, error) {
		return ctx, inputNode, nil
	}
	return v.handlers[0].ExecuteWrapped(inputFilter, outputFilter, provider)
}

func (v *Router) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {
	h := v.handlers[0]

	return h.ReadNode(ctx, in, opts...)
}

func (v *Router) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	h := v.handlers[0]
	return h.ListNodes(ctx, in, opts...)
}

func (v *Router) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...client.CallOption) (*tree.CreateNodeResponse, error) {
	h := v.handlers[0]
	return h.CreateNode(ctx, in, opts...)
}

func (v *Router) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...client.CallOption) (*tree.UpdateNodeResponse, error) {
	h := v.handlers[0]
	return h.UpdateNode(ctx, in, opts...)
}

func (v *Router) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...client.CallOption) (*tree.DeleteNodeResponse, error) {
	h := v.handlers[0]
	return h.DeleteNode(ctx, in, opts...)
}

func (v *Router) GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error) {
	h := v.handlers[0]
	return h.GetObject(ctx, node, requestData)
}

func (v *Router) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (int64, error) {
	h := v.handlers[0]
	return h.PutObject(ctx, node, reader, requestData)
}

func (v *Router) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (int64, error) {
	h := v.handlers[0]
	return h.CopyObject(ctx, from, to, requestData)
}

func (v *Router) MultipartCreate(ctx context.Context, target *tree.Node, requestData *models.MultipartRequestData) (string, error) {
	return v.handlers[0].MultipartCreate(ctx, target, requestData)
}

func (v *Router) MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *models.PutRequestData) (minio.ObjectPart, error) {
	return v.handlers[0].MultipartPutObjectPart(ctx, target, uploadID, partNumberMarker, reader, requestData)
}

func (v *Router) MultipartList(ctx context.Context, prefix string, requestData *models.MultipartRequestData) (minio.ListMultipartUploadsResult, error) {
	return v.handlers[0].MultipartList(ctx, prefix, requestData)
}

func (v *Router) MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *models.MultipartRequestData) error {
	return v.handlers[0].MultipartAbort(ctx, target, uploadID, requestData)
}

func (v *Router) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []minio.CompletePart) (minio.ObjectInfo, error) {
	return v.handlers[0].MultipartComplete(ctx, target, uploadID, uploadedParts)
}

func (v *Router) MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (minio.ListObjectPartsResult, error) {
	return v.handlers[0].MultipartListObjectParts(ctx, target, uploadID, partNumberMarker, maxParts)
}

func (v *Router) StreamChanges(ctx context.Context, in *tree.StreamChangesRequest, opts ...client.CallOption) (tree.NodeChangesStreamer_StreamChangesClient, error) {
	return v.handlers[0].StreamChanges(ctx, in, opts...)
}

func (v *Router) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {
	return v.handlers[0].WrappedCanApply(srcCtx, targetCtx, operation)
}

func (v *Router) CanApply(ctx context.Context, operation *tree.NodeChangeEvent) (*tree.NodeChangeEvent, error) {
	var innerOperation *tree.NodeChangeEvent
	e := v.WrapCallback(func(inputFilter NodeFilter, outputFilter NodeFilter) error {
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

// To respect Handler interface

func (v *Router) SetNextHandler(Handler)     {}
func (v *Router) SetClientsPool(SourcesPool) {}

// GetExecutor uses the very last handler (Executor) to send a request with a previously filled context.
func (v *Router) GetExecutor() Handler {
	return v.handlers[len(v.handlers)-1]
}

// Specific to Router
func (v *Router) GetClientsPool() SourcesPool {
	return v.pool
}
