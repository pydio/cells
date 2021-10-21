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

	json "github.com/pydio/cells/x/jsonx"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/utils/cache"
	"github.com/pydio/cells/data/meta"
)

// MetaServer definition
type MetaServer struct {
	//	Dao           DAO
	eventsChannel chan *cache.EventWithContext
	cache         *cache.InstrumentedCache
	cacheMutex    *cache.KeyMutex
}

func NewMetaServer() *MetaServer {
	m := &MetaServer{}
	m.cache = cache.NewInstrumentedCache(common.ServiceGrpcNamespace_ + common.ServiceMeta)
	m.cacheMutex = cache.NewKeyMutex()
	return m
}

func (s *MetaServer) Stop() {
	if s.cache != nil {
		s.cache.Close()
	}
}

// CreateNodeChangeSubscriber that will treat events for the meta server
func (s *MetaServer) CreateNodeChangeSubscriber(parentContext context.Context) *EventsSubscriber {

	if s.eventsChannel == nil {
		s.initEventsChannel()
	}
	subscriber := &EventsSubscriber{
		outputChannel: s.eventsChannel,
	}
	return subscriber
}

func (s *MetaServer) initEventsChannel() {

	// Todo: find a way to close channel on topic UnSubscription ?
	s.eventsChannel = make(chan *cache.EventWithContext)
	go func() {
		for eventWCtx := range s.eventsChannel {
			newCtx := servicecontext.WithServiceName(eventWCtx.Ctx, common.ServiceGrpcNamespace_+common.ServiceMeta)
			s.processEvent(newCtx, eventWCtx.NodeChangeEvent)
		}
	}()
}

func (s *MetaServer) processEvent(ctx context.Context, e *tree.NodeChangeEvent) {

	log.Logger(ctx).Debug("processEvent", zap.Any("type", e.GetType()))

	switch e.GetType() {
	case tree.NodeChangeEvent_CREATE:
		log.Logger(ctx).Debug("Received Create event", zap.Any("event", e))

		// Let's extract the basic information from the tree and store it
		s.UpdateNode(ctx, &tree.UpdateNodeRequest{
			To:     e.Target,
			Silent: e.Silent,
		}, &tree.UpdateNodeResponse{})
	case tree.NodeChangeEvent_UPDATE_PATH:
		log.Logger(ctx).Debug("Received Update event", zap.Any("event", e))

		// Let's extract the basic information from the tree and store it
		if er := s.UpdateNode(ctx, &tree.UpdateNodeRequest{
			To:     e.Target,
			Silent: e.Silent,
		}, &tree.UpdateNodeResponse{}); er == nil {
			// UpdateNode will trigger an UPDATE_META, forward UPDATE_PATH event as well
			client.Publish(ctx, client.NewPublication(common.TopicMetaChanges, e))
		}
	case tree.NodeChangeEvent_UPDATE_META:
		log.Logger(ctx).Debug("Received Update meta", zap.Any("event", e))

		// Let's extract the basic information from the tree and store it
		s.UpdateNode(ctx, &tree.UpdateNodeRequest{
			To:     e.Target,
			Silent: e.Silent,
		}, &tree.UpdateNodeResponse{})
	case tree.NodeChangeEvent_UPDATE_CONTENT:
		// Simply forward to TopicMetaChange
		log.Logger(ctx).Debug("Received Update content, forwarding to TopicMetaChange", zap.Any("event", e))
		client.Publish(ctx, client.NewPublication(common.TopicMetaChanges, e))
	case tree.NodeChangeEvent_DELETE:
		// Lets delete all metadata
		log.Logger(ctx).Debug("Received Delete content", zap.Any("event", e))

		s.DeleteNode(ctx, &tree.DeleteNodeRequest{
			Node:   e.Source,
			Silent: e.Silent,
		}, &tree.DeleteNodeResponse{})
	default:
		log.Logger(ctx).Debug("Ignoring event type", zap.Any("event", e.GetType()))
	}
}

// ReadNode information off the meta server
func (s *MetaServer) ReadNode(ctx context.Context, req *tree.ReadNodeRequest, resp *tree.ReadNodeResponse) (err error) {
	if req.Node == nil || req.Node.Uuid == "" {
		return errors.BadRequest(common.ServiceMeta, "Please provide a Node with a Uuid")
	}

	if s.cache != nil {
		//s.cacheMutex.Lock(req.Node.Uuid)
		//defer s.cacheMutex.Unlock(req.Node.Uuid)
		data, e := s.cache.Get(req.Node.Uuid)
		if e == nil {
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
					respNode.SetMeta(k, metaValue)
				}
				resp.Node = respNode
				return nil
			}
		}
	}

	if servicecontext.GetDAO(ctx) == nil {
		return errors.InternalServerError(common.ServiceMeta, "No DAO found Wrong initialization")
	}
	dao := servicecontext.GetDAO(ctx).(meta.DAO)

	metadata, err := dao.GetMetadata(req.Node.Uuid)
	if metadata == nil || err != nil {
		return errors.NotFound(common.ServiceMeta, "Node with Uuid "+req.Node.Uuid+" not found")
	}

	if s.cache != nil {
		value, e := json.Marshal(metadata)
		if e == nil {
			//log.Logger(ctx).Info("META / Setting cache for " + req.Node.Uuid)
			s.cache.Set(req.Node.Uuid, value)
		}
	}

	resp.Success = true
	respNode := req.Node
	for k, v := range metadata {
		var metaValue interface{}
		json.Unmarshal([]byte(v), &metaValue)
		respNode.SetMeta(k, metaValue)
	}
	resp.Node = respNode

	return nil
}

// ReadNodeStream implements ReadNode as a bidirectional stream
func (s *MetaServer) ReadNodeStream(ctx context.Context, streamer tree.NodeProviderStreamer_ReadNodeStreamStream) error {

	defer streamer.Close()

	for {
		request, err := streamer.Recv()
		if request == nil {
			break
		}
		if err != nil {
			return err
		}
		response := &tree.ReadNodeResponse{}

		log.Logger(ctx).Debug("ReadNodeStream", zap.String("path", request.Node.Path))
		e := s.ReadNode(ctx, &tree.ReadNodeRequest{Node: request.Node}, response)
		if e != nil {
			if errors.Parse(e.Error()).Code == 404 {
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
func (s *MetaServer) ListNodes(ctx context.Context, req *tree.ListNodesRequest, resp tree.NodeProvider_ListNodesStream) (err error) {
	return errors.BadRequest("ListNodes", "Method not implemented")
}

// CreateNode metadata
func (s *MetaServer) CreateNode(ctx context.Context, req *tree.CreateNodeRequest, resp *tree.CreateNodeResponse) (err error) {
	dao := servicecontext.GetDAO(ctx).(meta.DAO)
	var author = ""
	if value := ctx.Value(claim.ContextKey); value != nil {
		claims := value.(claim.Claims)
		author = claims.Name
	}

	if s.cache != nil {
		//s.cacheMutex.Lock(req.Node.Uuid)
		//defer s.cacheMutex.Unlock(req.Node.Uuid)
		//log.Logger(ctx).Info("META / Clearing cache for "+req.Node.Uuid, req.Node.Zap())
		s.cache.Delete(req.Node.Uuid)
	}

	if err := dao.SetMetadata(req.Node.Uuid, author, s.filterMetaToStore(ctx, req.Node.MetaStore)); err != nil {
		resp.Success = false
	}

	resp.Success = true

	client.Publish(ctx, client.NewPublication(common.TopicMetaChanges, &tree.NodeChangeEvent{
		Type:   tree.NodeChangeEvent_UPDATE_META,
		Target: req.Node,
		Silent: req.Silent,
	}))

	return nil
}

// UpdateNode metadata
func (s *MetaServer) UpdateNode(ctx context.Context, req *tree.UpdateNodeRequest, resp *tree.UpdateNodeResponse) (err error) {

	if servicecontext.GetDAO(ctx) == nil {
		return errors.InternalServerError(common.ServiceMeta, "No DAO found Wrong initialization")
	}

	dao := servicecontext.GetDAO(ctx).(meta.DAO)
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

	if err := dao.SetMetadata(req.To.Uuid, author, s.filterMetaToStore(ctx, req.To.MetaStore)); err != nil {
		log.Logger(ctx).Error("failed to update meta node", zap.Any("error", err))
		resp.Success = false
		return err
	}

	resp.Success = true

	// Reload all merged meta now
	if metadata, err := dao.GetMetadata(req.To.Uuid); err == nil && metadata != nil && len(metadata) > 0 {
		for k, v := range metadata {
			req.To.MetaStore[k] = v
		}
	}
	client.Publish(ctx, client.NewPublication(common.TopicMetaChanges, &tree.NodeChangeEvent{
		Type:   tree.NodeChangeEvent_UPDATE_META,
		Target: req.To,
		Silent: req.Silent,
	}))

	return nil
}

// DeleteNode metadata (Not implemented)
func (s *MetaServer) DeleteNode(ctx context.Context, request *tree.DeleteNodeRequest, result *tree.DeleteNodeResponse) (err error) {

	// Delete all meta for this node
	dao := servicecontext.GetDAO(ctx).(meta.DAO)

	if s.cache != nil {
		//log.Logger(ctx).Info("META / Clearing cache for " + request.Node.Uuid)
		//s.cacheMutex.Lock(request.Node.Uuid)
		//defer s.cacheMutex.Unlock(request.Node.Uuid)
		s.cache.Delete(request.Node.Uuid)
	}

	if err = dao.SetMetadata(request.Node.Uuid, "", map[string]string{}); err != nil {
		return err
	}

	result.Success = true

	client.Publish(ctx, client.NewPublication(common.TopicMetaChanges, &tree.NodeChangeEvent{
		Type:   tree.NodeChangeEvent_DELETE,
		Source: request.Node,
		Silent: request.Silent,
	}))

	return nil
}

// Search a stream of nodes based on its metadata
func (s *MetaServer) Search(ctx context.Context, request *tree.SearchRequest, result tree.Searcher_SearchStream) error {

	defer result.Close()

	dao := servicecontext.GetDAO(ctx).(meta.DAO)

	metaByUUID, err := dao.ListMetadata(request.Query.FileName)
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
