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
	"github.com/pydio/cells/v4/common/service"
	"strings"
	"sync"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/cache"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/queue"
	"github.com/pydio/cells/v4/data/meta"
)

// MetaServer definition
type MetaServer struct {
	tree.UnimplementedNodeProviderServer
	tree.UnimplementedNodeProviderStreamerServer
	tree.UnimplementedNodeReceiverServer
	tree.UnimplementedSearcherServer

	eventsChannel chan *queue.TypeWithContext[*tree.NodeChangeEvent]
	cache         cache.Cache

	service.Service
	dao meta.DAO

	stopped     bool
	stoppedLock *sync.Mutex
}

func NewMetaServer(ctx context.Context, svc service.Service, dao meta.DAO) *MetaServer {
	c, _ := cache.OpenCache(context.TODO(), runtime.CacheURL(ServiceName, "evictionTime", "1m"))
	m := &MetaServer{Service: svc, dao: dao}
	m.cache = c
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

	if s.cache != nil {
		s.cache.Close()
	}
	if s.eventsChannel != nil {
		close(s.eventsChannel)
	}

	s.stopped = true
}

// Subscriber that will treat events for the meta server
func (s *MetaServer) Subscriber(parentContext context.Context) *EventsSubscriber {

	if s.eventsChannel == nil {
		s.initEventsChannel()
	}
	subscriber := &EventsSubscriber{
		outputChannel: s.eventsChannel,
	}
	return subscriber
}

func (s *MetaServer) initEventsChannel() {

	s.eventsChannel = make(chan *queue.TypeWithContext[*tree.NodeChangeEvent])
	go func() {
		for eventWCtx := range s.eventsChannel {
			newCtx := servicecontext.WithServiceName(eventWCtx.Ctx, common.ServiceGrpcNamespace_+common.ServiceMeta)
			s.processEvent(newCtx, eventWCtx.Original)
		}
	}()
}

func (s *MetaServer) processEvent(ctx context.Context, e *tree.NodeChangeEvent) {

	log.Logger(ctx).Debug("processEvent", zap.Any("type", e.GetType()))

	switch e.GetType() {
	case tree.NodeChangeEvent_CREATE:
		log.Logger(ctx).Debug("Received Create event", zap.Any("event", e))

		// Let's extract the basic information from the tree and store it
		_, er := s.UpdateNode(ctx, &tree.UpdateNodeRequest{
			To:     e.Target,
			Silent: e.Silent,
		})
		if er != nil {
			log.Logger(ctx).Warn("Error while processing meta event (CREATE)", zap.Error(er))
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
			log.Logger(ctx).Warn("Error while processing meta event (UPDATE_PATH)", zap.Error(er))
		}
	case tree.NodeChangeEvent_UPDATE_META:
		log.Logger(ctx).Debug("Received Update meta", zap.Any("event", e))

		// Let's extract the basic information from the tree and store it
		_, er := s.UpdateNode(ctx, &tree.UpdateNodeRequest{
			To:     e.Target,
			Silent: e.Silent,
		})
		if er != nil {
			log.Logger(ctx).Warn("Error while processing meta event (UPDATE_META)", zap.Error(er))
		}

	case tree.NodeChangeEvent_UPDATE_CONTENT:
		// Simply forward to TopicMetaChange
		if e.Target != nil && e.Target.GetStringMeta(common.MetaNamespaceHash) != "" {
			if _, er := s.UpdateNode(ctx, &tree.UpdateNodeRequest{To: e.Target, Silent: e.Silent}); er != nil {
				log.Logger(ctx).Warn("Error while processing meta event (UPDATE_CONTENT)", zap.Error(er))
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
			log.Logger(ctx).Warn("Error while processing meta event (DELETE)", zap.Error(er))
		}

	default:
		log.Logger(ctx).Debug("Ignoring event type", zap.Any("event", e.GetType()))
	}
}

// ReadNode information off the meta server
func (s *MetaServer) ReadNode(ctx context.Context, req *tree.ReadNodeRequest) (resp *tree.ReadNodeResponse, err error) {
	if req.Node == nil || req.Node.Uuid == "" {
		return resp, errors.BadRequest(common.ServiceMeta, "Please provide a N with a Uuid")
	}
	resp = &tree.ReadNodeResponse{}

	if s.cache != nil {
		//s.cacheMutex.Lock(req.N.Uuid)
		//defer s.cacheMutex.Unlock(req.N.Uuid)
		data, ok := s.cache.GetBytes(req.Node.Uuid)
		if ok {
			var metaD map[string]string
			if er := json.Unmarshal(data, &metaD); er == nil {
				//log.Logger(ctx).Info("META / Reading from cache for " + req.N.Uuid)
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

	metadata, err := s.dao.GetMetadata(req.Node.Uuid)
	if metadata == nil || err != nil {
		return resp, errors.NotFound(common.ServiceMeta, "N with Uuid "+req.Node.Uuid+" not found")
	}

	if s.cache != nil {
		value, e := json.Marshal(metadata)
		if e == nil {
			//log.Logger(ctx).Info("META / Setting cache for " + req.N.Uuid)
			s.cache.Set(req.Node.Uuid, value)
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
			if errors.FromError(e).Code == 404 {
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
	return errors.BadRequest("ListNodes", "Method not implemented")
}

// CreateNode metadata
func (s *MetaServer) CreateNode(ctx context.Context, req *tree.CreateNodeRequest) (resp *tree.CreateNodeResponse, err error) {

	resp = &tree.CreateNodeResponse{}
	var author = ""
	if value := ctx.Value(claim.ContextKey); value != nil {
		claims := value.(claim.Claims)
		author = claims.Name
	}

	if s.cache != nil {
		//s.cacheMutex.Lock(req.N.Uuid)
		//defer s.cacheMutex.Unlock(req.N.Uuid)
		//log.Logger(ctx).Info("META / Clearing cache for "+req.N.Uuid, req.N.Zap())
		s.cache.Delete(req.Node.Uuid)
	}

	if err := s.dao.SetMetadata(req.Node.Uuid, author, s.filterMetaToStore(ctx, req.Node.MetaStore)); err != nil {
		resp.Success = false
		return resp, err
	}

	resp.Success = true

	broker.MustPublish(ctx, common.TopicMetaChanges, &tree.NodeChangeEvent{
		Type:   tree.NodeChangeEvent_UPDATE_META,
		Target: req.Node,
		Silent: req.Silent,
	})

	return resp, nil
}

// UpdateNode metadata
func (s *MetaServer) UpdateNode(ctx context.Context, req *tree.UpdateNodeRequest) (resp *tree.UpdateNodeResponse, err error) {

	resp = &tree.UpdateNodeResponse{}

	var author = ""
	if value := ctx.Value(claim.ContextKey); value != nil {
		claims := value.(claim.Claims)
		author = claims.Name
	}

	if s.cache != nil {
		//s.cacheMutex.Lock(req.To.Uuid)
		//defer s.cacheMutex.Unlock(req.To.Uuid)
		//log.Logger(ctx).Info("META / Clearing cache for "+req.To.Uuid, req.To.Zap())
		s.cache.Delete(req.To.Uuid)
	}

	if err := s.dao.SetMetadata(req.To.Uuid, author, s.filterMetaToStore(ctx, req.To.MetaStore)); err != nil {
		log.Logger(ctx).Error("failed to update meta node", zap.Any("error", err))
		resp.Success = false
		return resp, err
	}

	resp.Success = true

	// Reload all merged meta now
	if metadata, err := s.dao.GetMetadata(req.To.Uuid); err == nil && metadata != nil && len(metadata) > 0 {
		for k, v := range metadata {
			req.To.MetaStore[k] = v
		}
	}
	broker.MustPublish(ctx, common.TopicMetaChanges, &tree.NodeChangeEvent{
		Type:   tree.NodeChangeEvent_UPDATE_META,
		Target: req.To,
		Silent: req.Silent,
	})

	return resp, nil
}

// DeleteNode metadata (Not implemented)
func (s *MetaServer) DeleteNode(ctx context.Context, request *tree.DeleteNodeRequest) (result *tree.DeleteNodeResponse, err error) {

	if s.cache != nil {
		//log.Logger(ctx).Info("META / Clearing cache for " + request.N.Uuid)
		//s.cacheMutex.Lock(request.N.Uuid)
		//defer s.cacheMutex.Unlock(request.N.Uuid)
		s.cache.Delete(request.Node.Uuid)
	}

	if err = s.dao.SetMetadata(request.Node.Uuid, "", map[string]string{}); err != nil {
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

// Search a stream of nodes based on its metadata
func (s *MetaServer) Search(request *tree.SearchRequest, result tree.Searcher_SearchServer) error {

	// ctx := result.Context()

	metaByUUID, err := s.dao.ListMetadata(request.Query.FileName)
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
