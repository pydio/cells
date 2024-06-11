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

package grpc

import (
	"context"
	"strings"
	"sync"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/cache"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/data/meta"
)

// MetaServer definition
type MetaServer struct {
	tree.UnimplementedNodeProviderServer
	tree.UnimplementedNodeProviderStreamerServer
	tree.UnimplementedNodeReceiverServer
	//tree.UnimplementedSearcherServer

	cachePool *openurl.Pool[cache.Cache]

	stopped     bool
	stoppedLock *sync.Mutex
}

func NewMetaServer(ctx context.Context, srvName string) *MetaServer {
	m := &MetaServer{}
	m.cachePool, _ = cache.OpenPool(runtime.CacheURL(srvName, "evictionTime", "1m"))
	m.stoppedLock = &sync.Mutex{}
	go func() {
		<-ctx.Done()
		m.Stop()
	}()
	return m
}

func (s *MetaServer) Stop() {
	s.stoppedLock.Lock()
	defer s.stoppedLock.Unlock()

	if s.stopped {
		return
	}

	if s.cachePool != nil {
		_ = s.cachePool.Close(context.Background())
	}

	s.stopped = true
}

func (s *MetaServer) ProcessEvent(ctx context.Context, e *tree.NodeChangeEvent) error {

	log.Logger(ctx).Debug("ProcessEvent", zap.Any("type", e.GetType()))

	switch e.GetType() {
	case tree.NodeChangeEvent_CREATE:
		log.Logger(ctx).Debug("Received Create event", zap.Any("event", e))

		// Let's extract the basic information from the tree and store it
		_, er := s.UpdateNode(ctx, &tree.UpdateNodeRequest{
			To:     e.Target,
			Silent: e.Silent,
		})
		if er != nil {
			return errors.WithMessage(er, "processing meta event (CREATE)")
		}
	case tree.NodeChangeEvent_UPDATE_PATH:
		log.Logger(ctx).Debug("Received Update event", zap.Any("event", e))

		// Let's extract the basic information from the tree and store it
		if _, er := s.UpdateNode(ctx, &tree.UpdateNodeRequest{
			To:     e.Target,
			Silent: e.Silent,
		}); er == nil {
			// UpdateNode will trigger an UPDATE_META, forward UPDATE_PATH event as well
			broker.MustPublish(ctx, common.TopicMetaChanges, e)
		} else {
			return errors.WithMessage(er, "processing meta event (UPDATE_PATH)")
		}
	case tree.NodeChangeEvent_UPDATE_META:
		log.Logger(ctx).Debug("Received Update meta", zap.Any("event", e))

		// Let's extract the basic information from the tree and store it
		_, er := s.UpdateNode(ctx, &tree.UpdateNodeRequest{
			To:     e.Target,
			Silent: e.Silent,
		})
		if er != nil {
			return errors.WithMessage(er, "processing meta event (UPDATE_META)")
		}

	case tree.NodeChangeEvent_UPDATE_CONTENT:
		// Simply forward to TopicMetaChange
		if e.Target != nil && e.Target.GetStringMeta(common.MetaNamespaceHash) != "" {
			if _, er := s.UpdateNode(ctx, &tree.UpdateNodeRequest{To: e.Target, Silent: e.Silent}); er != nil {
				return errors.WithMessage(er, "processing meta event (UPDATE_CONTENT)")
			}
		}
		log.Logger(ctx).Debug("Received Update content, forwarding to TopicMetaChange", zap.Any("event", e))
		broker.MustPublish(ctx, common.TopicMetaChanges, e)

	case tree.NodeChangeEvent_DELETE:
		// Lets delete all metadata
		log.Logger(ctx).Debug("Received Delete content", zap.Any("event", e))

		_, er := s.DeleteNode(ctx, &tree.DeleteNodeRequest{
			Node:   e.Source,
			Silent: e.Silent,
		})
		if er != nil {
			return errors.WithMessage(er, "processing meta event (DELETE)")
		}

	default:
		log.Logger(ctx).Debug("Ignoring event type", zap.Any("event", e.GetType()))
	}
	return nil
}

// ReadNode information off the meta server
func (s *MetaServer) ReadNode(ctx context.Context, req *tree.ReadNodeRequest) (resp *tree.ReadNodeResponse, err error) {
	if req.Node == nil || req.Node.Uuid == "" {
		return resp, errors.WithMessage(errors.InvalidParameters, "Please provide a Node with a Uuid")
	}
	resp = &tree.ReadNodeResponse{}

	ca, _ := s.cachePool.Get(ctx)
	if ca != nil {
		//s.cacheMutex.Lock(req.Node.Uuid)
		//defer s.cacheMutex.Unlock(req.Node.Uuid)
		data, ok := ca.GetBytes(req.Node.Uuid)
		if ok {
			var metaD map[string]string
			if er := json.Unmarshal(data, &metaD); er == nil {
				//log.Logger(ctx).Info("META / Reading from cache for " + req.Node.Uuid)
				resp.Success = true
				respNode := req.Node
				for k, v := range metaD {
					if k == "name" { // Never read name from cache
						continue
					}
					var metaValue interface{}
					json.Unmarshal([]byte(v), &metaValue)
					respNode.MustSetMeta(k, metaValue)
				}
				resp.Node = respNode
				return resp, nil
			}
		}
	}

	dao, err := manager.Resolve[meta.DAO](ctx)
	if err != nil {
		return nil, err
	}

	metadata, err := dao.GetMetadata(ctx, req.Node.Uuid)
	if metadata == nil || err != nil {
		return resp, errors.WithMessage(errors.NodeNotFound, "Node with Uuid "+req.Node.Uuid+" not found")
	}

	if ca != nil {
		value, e := json.Marshal(metadata)
		if e == nil {
			//log.Logger(ctx).Info("META / Setting cache for " + req.Node.Uuid)
			ca.Set(req.Node.Uuid, value)
		}
	}
	resp = &tree.ReadNodeResponse{}
	resp.Success = true
	respNode := req.Node
	for k, v := range metadata {
		var metaValue interface{}
		json.Unmarshal([]byte(v), &metaValue)
		respNode.MustSetMeta(k, metaValue)
	}
	resp.Node = respNode

	return resp, nil
}

// ReadNodeStream implements ReadNode as a bidirectional stream
func (s *MetaServer) ReadNodeStream(streamer tree.NodeProviderStreamer_ReadNodeStreamServer) error {

	//defer streamer.Close()
	ctx := streamer.Context()

	for {
		request, err := streamer.Recv()
		if request == nil {
			break
		}
		if err != nil {
			return err
		}

		log.Logger(ctx).Debug("ReadNodeStream", zap.String("path", request.Node.Path))
		response, e := s.ReadNode(ctx, &tree.ReadNodeRequest{Node: request.Node})
		if e != nil {
			if errors.Is(e, errors.StatusNotFound) {
				// There is no metadata, simply return the original node
				streamer.Send(&tree.ReadNodeResponse{Node: request.Node})
			} else {
				return e
			}
		} else {
			sendErr := streamer.Send(&tree.ReadNodeResponse{Node: response.Node})
			if sendErr != nil {
				return e
			}
		}
	}

	return nil

}

// ListNodes information from the meta server (Not implemented)
func (s *MetaServer) ListNodes(req *tree.ListNodesRequest, resp tree.NodeProvider_ListNodesServer) (err error) {
	return errors.WithMessage(errors.StatusNotImplemented, "MetaServer.ListNodes")
}

func (s *MetaServer) saveNode(ctx context.Context, node *tree.Node, silent, reload bool) (*tree.Node, error) {
	var author = ""
	if value := ctx.Value(claim.ContextKey); value != nil {
		claims := value.(claim.Claims)
		author = claims.Name
	}

	if ca, _ := s.cachePool.Get(ctx); ca != nil {
		_ = ca.Delete(node.Uuid)
	}

	dao, er := manager.Resolve[meta.DAO](ctx)
	if er != nil {
		return nil, er
	}

	if err := dao.SetMetadata(ctx, node.Uuid, author, s.filterMetaToStore(ctx, node.MetaStore)); err != nil {
		log.Logger(ctx).Error("failed to update meta node", zap.Any("error", err))
		return nil, err
	}

	out := node.Clone()
	if reload {
		if metadata, err := dao.GetMetadata(ctx, node.Uuid); err == nil && metadata != nil && len(metadata) > 0 {
			for k, v := range metadata {
				out.MetaStore[k] = v
			}
		}
	}
	broker.MustPublish(ctx, common.TopicMetaChanges, &tree.NodeChangeEvent{
		Type:   tree.NodeChangeEvent_UPDATE_META,
		Target: out,
		Silent: silent,
	})

	return out, nil
}

// CreateNode metadata
func (s *MetaServer) CreateNode(ctx context.Context, req *tree.CreateNodeRequest) (resp *tree.CreateNodeResponse, err error) {

	if out, er := s.saveNode(ctx, req.Node, req.Silent, false); er != nil {
		return nil, er
	} else {
		return &tree.CreateNodeResponse{
			Success: true,
			Node:    out,
		}, nil
	}
}

// UpdateNode metadata
func (s *MetaServer) UpdateNode(ctx context.Context, req *tree.UpdateNodeRequest) (resp *tree.UpdateNodeResponse, err error) {

	if out, er := s.saveNode(ctx, req.To, req.Silent, true); er != nil {
		return nil, er
	} else {
		return &tree.UpdateNodeResponse{
			Success: true,
			Node:    out,
		}, nil
	}

}

// DeleteNode metadata (Not implemented)
func (s *MetaServer) DeleteNode(ctx context.Context, request *tree.DeleteNodeRequest) (result *tree.DeleteNodeResponse, err error) {

	ca, _ := s.cachePool.Get(ctx)
	if ca != nil {
		_ = ca.Delete(request.Node.Uuid)
	}

	dao, err := manager.Resolve[meta.DAO](ctx)
	if err != nil {
		return nil, err
	}

	if err = dao.SetMetadata(ctx, request.Node.Uuid, "", map[string]string{}); err != nil {
		return result, err
	}

	result = &tree.DeleteNodeResponse{
		Success: true,
	}

	broker.MustPublish(ctx, common.TopicMetaChanges, &tree.NodeChangeEvent{
		Type:   tree.NodeChangeEvent_DELETE,
		Source: request.Node,
		Silent: request.Silent,
	})

	return result, nil
}

/* THIS IS NEVER USED
// Search a stream of nodes based on its metadata
func (s *MetaServer) Search(request *tree.SearchRequest, result tree.Searcher_SearchServer) error {

	ctx := result.Context()

	dao, err := manager.Resolve[meta.DAO](ctx)
	if err != nil {
		return err
	}

	metaByUUID, err := dao.ListMetadata(ctx, request.Query.FileName)
	if err != nil {
		return err
	}

	for uuid, metadata := range metaByUUID {
		result.Send(&tree.SearchResponse{
			Node: &tree.Node{
				Uuid:      uuid,
				MetaStore: metadata,
			},
		})
	}

	return nil
}
*/

func (s *MetaServer) filterMetaToStore(ctx context.Context, metaStore map[string]string) map[string]string {

	filtered := make(map[string]string)
	for k, v := range metaStore {
		if k == common.MetaNamespaceDatasourceName || k == common.MetaNamespaceDatasourcePath || strings.HasPrefix(k, "pydio:meta-loaded") {
			continue
		}
		filtered[k] = v
	}

	return filtered

}
