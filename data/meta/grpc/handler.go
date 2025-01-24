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

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/data/meta"
)

// MetaServer definition
type MetaServer struct {
	tree.UnimplementedNodeProviderServer
	tree.UnimplementedNodeProviderStreamerServer
	tree.UnimplementedNodeReceiverServer
	//tree.UnimplementedSearcherServer

	stopped     bool
	stoppedLock *sync.Mutex
}

func NewMetaServer(ctx context.Context, srvName string) *MetaServer {
	m := &MetaServer{}
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

func (s *MetaServer) readNodeCache(ctx context.Context, req *tree.ReadNodeRequest, ca cache.Cache) (*tree.Node, bool) {
	if ca == nil {
		return nil, false
	}

	data, ok := ca.GetBytes(req.Node.Uuid)
	if !ok {
		return nil, false
	}

	var metaD map[string]string
	if er := json.Unmarshal(data, &metaD); er != nil {
		return nil, false
	}
	respNode := req.Node
	for k, v := range metaD {
		if k == "name" { // Never read name from cache
			continue
		}
		var metaValue interface{}
		_ = json.Unmarshal([]byte(v), &metaValue)
		respNode.MustSetMeta(k, metaValue)
	}
	return respNode, true
}

func (s *MetaServer) readNodeDAO(ctx context.Context, req *tree.ReadNodeRequest, dao meta.DAO, ca cache.Cache) (*tree.Node, error) {
	metadata, err := dao.GetMetadata(ctx, req.Node.Uuid)
	if metadata == nil || err != nil {
		return nil, errors.WithMessage(errors.NodeNotFound, "Node with Uuid "+req.Node.Uuid+" not found")
	}

	if ca != nil {
		value, e := json.Marshal(metadata)
		if e == nil {
			//log.Logger(ctx).Info("META / Setting cache for " + req.Node.Uuid)
			_ = ca.Set(req.Node.Uuid, value)
		}
	}
	respNode := req.Node
	for k, v := range metadata {
		var metaValue interface{}
		_ = json.Unmarshal([]byte(v), &metaValue)
		respNode.MustSetMeta(k, metaValue)
	}
	return respNode, nil

}

// ReadNode information off the meta server
func (s *MetaServer) ReadNode(ctx context.Context, req *tree.ReadNodeRequest) (resp *tree.ReadNodeResponse, err error) {
	if req.Node == nil || req.Node.Uuid == "" {
		return resp, errors.WithMessage(errors.InvalidParameters, "Please provide a Node with a Uuid")
	}
	resp = &tree.ReadNodeResponse{}
	ca, _ := cache_helper.ResolveCache(ctx, common.CacheTypeShared, cache.Config{Eviction: "1m"})
	if n, ok := s.readNodeCache(ctx, req, ca); ok {
		resp.Success = true
		resp.Node = n
		return
	}

	dao, err := manager.Resolve[meta.DAO](ctx)
	if err != nil {
		return nil, err
	}
	n, er := s.readNodeDAO(ctx, req, dao, ca)
	if er != nil {
		err = er
	} else {
		resp.Success = true
		resp.Node = n
	}
	return
}

// ReadNodeStream implements ReadNode as a bidirectional stream
func (s *MetaServer) ReadNodeStream(streamer tree.NodeProviderStreamer_ReadNodeStreamServer) error {

	ctx := streamer.Context()
	ca, _ := cache_helper.ResolveCache(ctx, common.CacheTypeShared, cache.Config{Eviction: "1m"})
	dao, err := manager.Resolve[meta.DAO](ctx)
	if err != nil {
		return err
	}

	for {
		request, err := streamer.Recv()
		if request == nil {
			break
		}
		if err != nil {
			return err
		}

		log.Logger(ctx).Debug("ReadNodeStream", zap.String("path", request.Node.Path))
		var resp *tree.ReadNodeResponse
		if n, ok := s.readNodeCache(ctx, request, ca); ok {
			resp = &tree.ReadNodeResponse{
				Success: true,
				Node:    n,
			}
			if sendErr := streamer.Send(resp); sendErr != nil {
				return sendErr
			}
		} else if node, er := s.readNodeDAO(ctx, request, dao, ca); er != nil {
			if errors.Is(er, errors.StatusNotFound) {
				// There is no metadata, simply return the original node
				if sendErr := streamer.Send(&tree.ReadNodeResponse{Node: request.Node}); sendErr != nil {
					return sendErr
				}
			} else {
				return er
			}
		} else {
			resp = &tree.ReadNodeResponse{
				Success: true,
				Node:    node,
			}
			if sendErr := streamer.Send(resp); sendErr != nil {
				return sendErr
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

	if ca, _ := cache_helper.ResolveCache(ctx, common.CacheTypeShared, cache.Config{Eviction: "1m"}); ca != nil {
		_ = ca.Delete(node.Uuid)
	}

	dao, er := manager.Resolve[meta.DAO](ctx)
	if er != nil {
		return nil, er
	}

	ss := s.filterMetaToStore(ctx, node.MetaStore)
	if len(node.MetaStore) == 0 || len(ss) > 0 {
		if err := dao.SetMetadata(ctx, node.Uuid, author, s.filterMetaToStore(ctx, node.MetaStore)); err != nil {
			log.Logger(ctx).Error("failed to update meta node", zap.Any("error", err))
			return nil, err
		}
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

	ca, _ := cache_helper.ResolveCache(ctx, common.CacheTypeShared, cache.Config{Eviction: "1m"})
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
		if k == common.MetaNamespaceDatasourceName ||
			k == common.MetaNamespaceDatasourcePath ||
			strings.HasPrefix(k, "pydio:meta-loaded") ||
			strings.HasPrefix(k, common.MetaNamespaceUserspacePrefix) ||
			k == common.MetaNamespaceNodeName {
			continue
		}
		filtered[k] = v
	}

	return filtered

}
