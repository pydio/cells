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

package core

import (
	"context"
	"io"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	grpc2 "github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	runtimecontext "github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var (
	pncLocks   *sync.Mutex
	pncClients map[string]tree.NodeChangesReceiverStreamer_PostNodeChangesClient
)

func WithStructInterceptor() nodes.Option {
	return func(options *nodes.RouterOptions) {
		options.Wrappers = append(options.Wrappers, &StructStorageHandler{})
	}
}

// StructStorageHandler intercepts request to a flat-storage
type StructStorageHandler struct {
	abstract.Handler
}

func (f *StructStorageHandler) Adapt(h nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	f.Next = h
	return f
}

func (f *StructStorageHandler) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	node := in.Node
	if !node.IsLeaf() {
		if rr, re := f.ReadNode(ctx, &tree.ReadNodeRequest{Node: node.Clone()}); re == nil && rr != nil && rr.GetNode().IsLeaf() {
			return nil, errors.WithMessagef(errors.NodeTypeConflict, "A file already exists with the same name, trying to insert type "+node.GetType().String())
		}
		dsPath := node.GetStringMeta(common.MetaNamespaceDatasourcePath)
		newNode := &tree.Node{
			Path: strings.TrimRight(node.Path, "/") + "/" + common.PydioSyncHiddenFile,
		}
		newNode.MustSetMeta(common.MetaNamespaceDatasourcePath, dsPath+"/"+common.PydioSyncHiddenFile)
		if session := in.IndexationSession; session != "" {
			ctx = runtimecontext.WithAdditionalMetadata(ctx, map[string]string{common.XPydioSessionUuid: session})
		}
		if !in.UpdateIfExists {
			if read, er := f.GetObject(ctx, newNode, &models.GetRequestData{StartOffset: 0, Length: 36}); er == nil {
				bytes, _ := io.ReadAll(read)
				_ = read.Close()
				node.Uuid = string(bytes)
				node.MTime = time.Now().Unix()
				node.Size = 36
				log.Logger(ctx).Debug("[handlerExec.CreateNode] Hidden file already created", node.ZapUuid(), zap.Any("in", in))
				return &tree.CreateNodeResponse{Node: node}, nil
			}
		}
		// Create new N
		nodeUuid := uuid.New()
		log.Logger(ctx).Debug("[Exec] Create Folder has no Uuid")
		if node.Uuid != "" {
			log.Logger(ctx).Debug("Creating Folder with Uuid", node.ZapUuid())
			nodeUuid = node.Uuid
		}
		_, err := f.PutObject(ctx, newNode, strings.NewReader(nodeUuid), &models.PutRequestData{Size: int64(len(nodeUuid))})

		if err != nil {
			return nil, err
		}
		node.Uuid = nodeUuid
		node.MTime = time.Now().Unix()
		node.Size = 36
		log.Logger(ctx).Debug("[handlerExec.CreateNode] Created A Hidden .pydio for folder", node.Zap())
		return &tree.CreateNodeResponse{Node: node}, nil
	}
	return f.Next.CreateNode(ctx, in, opts...)
}

func (f *StructStorageHandler) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...grpc.CallOption) (*tree.DeleteNodeResponse, error) {
	resp, e := f.Next.DeleteNode(ctx, in, opts...)
	if e == nil {
		if session := in.IndexationSession; session != "" {
			ctx = runtimecontext.WithAdditionalMetadata(ctx, map[string]string{common.XPydioSessionUuid: session})
		}
		f.publish(ctx, "in", tree.NodeChangeEvent_DELETE, in.GetNode().Clone())
	}
	return resp, e
}

func (f *StructStorageHandler) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error) {
	i, e := f.Next.CopyObject(ctx, from, to, requestData)
	if e == nil {
		bi, _ := nodes.GetBranchInfo(ctx, "to")
		c := nodes.WithBranchInfo(ctx, "in", bi)
		f.publish(c, "to", tree.NodeChangeEvent_CREATE, to.Clone())
	}
	return i, e
}

func (f *StructStorageHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	i, e := f.Next.PutObject(ctx, node, reader, requestData)
	if e == nil {
		f.publish(ctx, "in", tree.NodeChangeEvent_CREATE, node.Clone())
	}
	return i, e
}

func (f *StructStorageHandler) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []models.MultipartObjectPart) (models.ObjectInfo, error) {
	info, e := f.Next.MultipartComplete(ctx, target, uploadID, uploadedParts)
	if e == nil {
		f.publish(ctx, "in", tree.NodeChangeEvent_CREATE, target.Clone())
	}
	return info, e
}

// getPostNodeChangeClient finds or creates a new streamer to public PostNodeChanges events.
// If refresh is set, it will delete any previous instance and create a new one.
func getPostNodeChangeClient(ctx context.Context, serviceName string, refresh bool) (tree.NodeChangesReceiverStreamer_PostNodeChangesClient, error) {
	if pncClients == nil {
		pncClients = make(map[string]tree.NodeChangesReceiverStreamer_PostNodeChangesClient)
		pncLocks = &sync.Mutex{}
	}
	pncLocks.Lock()
	defer pncLocks.Unlock()
	if refresh {
		delete(pncClients, serviceName)
	}
	if c, o := pncClients[serviceName]; o {
		return c, nil
	}
	cl := tree.NewNodeChangesReceiverStreamerClient(grpc2.ResolveConn(ctx, common.ServiceDataSyncGRPC_+serviceName))
	c, e := cl.PostNodeChanges(runtimecontext.ForkedBackgroundWithMeta(ctx))
	if e != nil {
		return nil, e
	}
	pncClients[serviceName] = c
	return c, nil
}

func (f *StructStorageHandler) publish(ctx context.Context, identifier string, eventType tree.NodeChangeEvent_EventType, node *tree.Node) {
	bi, er := nodes.GetBranchInfo(ctx, identifier)

	// Fork context to de-intricate query and publication cancellation
	ctx = runtimecontext.ForkedBackgroundWithMeta(ctx)

	// Publish only for remote non-minio structured servers
	if er == nil && bi.FlatStorage {
		return
	}
	event := &tree.NodeChangeEvent{Type: eventType}
	if mm, ok := runtimecontext.MinioMetaFromContext(ctx, common.PydioContextUserKey, true); ok {
		event.Metadata = mm
	}
	switch eventType {
	case tree.NodeChangeEvent_DELETE:
		node.Path = strings.TrimPrefix(node.Path, bi.Name+"/")
		event.Source = node
	case tree.NodeChangeEvent_CREATE:
		// Re-put BranchInfo in context
		if r, e := f.ReadNode(nodes.WithBranchInfo(ctx, "in", bi), &tree.ReadNodeRequest{ObjectStats: true, Node: node}); e == nil {
			node = r.GetNode()
			node.Type = tree.NodeType_LEAF
		} else {
			log.Logger(ctx).Warn("DS Struct event publication, cannot re-read created node: "+e.Error(), zap.Error(e))
		}
		node.Path = strings.TrimPrefix(node.Path, bi.Name+"/")
		event.Target = node
	}
	if cl, e := getPostNodeChangeClient(ctx, bi.Name, false); e != nil {
		log.Logger(ctx).Error("[struct] cannot get stream client", zap.Error(e))
	} else if er := cl.Send(event); er != nil && er != io.EOF {
		log.Logger(ctx).Error("[struct] cannot publish event on stream", zap.Error(er))
	} else if er == io.EOF {
		cl, e = getPostNodeChangeClient(ctx, bi.Name, true)
		if e != nil {
			log.Logger(ctx).Error("[struct] cannot get new stream client after retry", zap.Error(e))
		} else if e2 := cl.Send(event); e2 != nil {
			log.Logger(ctx).Error("[struct] cannot still publish event on stream after retry", zap.Error(er))
		} else {
			log.Logger(ctx).Debug("[struct] Published Event on stream after retry "+eventType.String(), node.ZapPath())
		}
	} else {
		log.Logger(ctx).Debug("[struct] Published Event on stream "+eventType.String(), node.ZapPath())
	}
}
