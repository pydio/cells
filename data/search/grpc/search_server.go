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
	"fmt"
	"strings"
	"sync"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	protosync "github.com/pydio/cells/common/proto/sync"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/utils/cache"
	"github.com/pydio/cells/common/utils/meta"
	"github.com/pydio/cells/data/search/dao"
)

// SearchServer implements GRPC server for index/search
type SearchServer struct {
	Engine           dao.SearchEngine
	eventsChannel    chan *cache.EventWithContext
	TreeClient       tree.NodeProviderClient
	NsProvider       *meta.NamespacesProvider
	ReIndexThrottler chan struct{}
}

// CreateNodeChangeSubscriber that will treat events for the meta server
func (s *SearchServer) CreateNodeChangeSubscriber() *EventsSubscriber {

	if s.eventsChannel == nil {
		s.initEventsChannel()
	}
	subscriber := &EventsSubscriber{
		outputChannel: s.eventsChannel,
	}
	return subscriber
}

func (s *SearchServer) initEventsChannel() {

	s.eventsChannel = make(chan *cache.EventWithContext)
	go func() {
		for eventWCtx := range s.eventsChannel {
			ctx := servicecontext.WithServiceName(eventWCtx.Ctx, common.ServiceGrpcNamespace_+common.ServiceSearch)
			s.processEvent(ctx, eventWCtx.NodeChangeEvent)
		}
	}()
}

func (s *SearchServer) NamespacesProvider() *meta.NamespacesProvider {
	if s.NsProvider == nil {
		s.NsProvider = meta.NewNamespacesProvider()
	}
	return s.NsProvider
}

func (s *SearchServer) processEvent(ctx context.Context, e *tree.NodeChangeEvent) {

	log.Logger(ctx).Debug("processEvent", zap.Any("event", e))
	excludes := s.NamespacesProvider().ExcludeIndexes()

	switch e.GetType() {
	case tree.NodeChangeEvent_CREATE:
		// Let's extract the basic information from the tree and store it
		if e.Target.Etag == common.NodeFlagEtagTemporary || tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		s.Engine.IndexNode(ctx, e.Target, false, excludes)
	case tree.NodeChangeEvent_UPDATE_PATH:
		// Let's extract the basic information from the tree and store it
		if tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		s.Engine.IndexNode(ctx, e.Target, false, excludes)
		if !e.Target.IsLeaf() {
			go s.ReindexFolder(ctx, e.Target, excludes)
		}
	case tree.NodeChangeEvent_UPDATE_META:
		// Let's extract the basic information from the tree and store it
		if e.Target.Path != "" && tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		s.Engine.IndexNode(ctx, e.Target, false, excludes)
	case tree.NodeChangeEvent_UPDATE_USER_META:
		// Let's extract the basic information from the tree and store it
		if e.Target.Path != "" && tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		s.Engine.IndexNode(ctx, e.Target, true, excludes)
	case tree.NodeChangeEvent_UPDATE_CONTENT:
		// We may have to store the metadata again
		if tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		s.Engine.IndexNode(ctx, e.Target, false, excludes)
	case tree.NodeChangeEvent_DELETE:
		// Lets delete all metadata
		if tree.IgnoreNodeForOutput(ctx, e.Source) {
			break
		}
		s.Engine.DeleteNode(ctx, e.Source)
	default:
		log.Logger(ctx).Error("Could not recognize event type", zap.Any("type", e.GetType()))
	}
}

func (s *SearchServer) Search(ctx context.Context, req *tree.SearchRequest, streamer tree.Searcher_SearchStream) error {

	resultsChan := make(chan *tree.Node)
	facetsChan := make(chan *tree.SearchFacet)
	doneChan := make(chan bool)
	defer close(resultsChan)
	defer close(facetsChan)
	defer close(doneChan)

	wg := &sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case facet := <-facetsChan:
				streamer.Send(&tree.SearchResponse{Facet: facet})
			case node := <-resultsChan:
				if node != nil {

					log.Logger(ctx).Debug("Search", zap.String("uuid", node.Uuid))

					if req.Details {
						response, e := s.TreeClient.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{
							Uuid: node.Uuid,
						}})
						if e == nil && response.GetNode() != nil {
							streamer.Send(&tree.SearchResponse{Node: response.Node})
						} else if e != nil && errors.Parse(e.Error()).Code == 404 {

							log.Logger(ctx).Error("Found node that does not exists, send event to make sure all is sync'ed.", zap.String("uuid", node.Uuid))

							client.Publish(ctx, client.NewPublication(common.TopicTreeChanges, &tree.NodeChangeEvent{
								Type:   tree.NodeChangeEvent_DELETE,
								Source: node,
							}))

						}
					} else {
						log.Logger(ctx).Debug("No Details needed, sending back node", zap.String("uuid", node.Uuid))
						streamer.Send(&tree.SearchResponse{Node: node})
					}

				}
			case <-doneChan:
				return
			}
		}
	}()

	err := s.Engine.SearchNodes(ctx, req.GetQuery(), req.GetFrom(), req.GetSize(), resultsChan, facetsChan, doneChan)
	if err != nil {
		return err
	}
	wg.Wait()
	return nil
}

func (s *SearchServer) TriggerResync(c context.Context, req *protosync.ResyncRequest, resp *protosync.ResyncResponse) error {

	go func() {
		bg := context.Background()
		s.Engine.ClearIndex(bg)
		excludes := s.NamespacesProvider().ExcludeIndexes()

		dsStream, err := s.TreeClient.ListNodes(bg, &tree.ListNodesRequest{
			Node:      &tree.Node{Path: ""},
			Recursive: true,
		})
		if err != nil {
			log.Logger(c).Error("Resync", zap.Error(err))
			return
		}
		defer dsStream.Close()
		var count int
		for {
			response, e := dsStream.Recv()
			if e != nil || response == nil {
				break
			}
			if !strings.HasPrefix(response.Node.GetUuid(), "DATASOURCE:") && !tree.IgnoreNodeForOutput(c, response.Node) {
				s.Engine.IndexNode(bg, response.Node, false, excludes)
				count++
			}
		}
		log.Logger(c).Info(fmt.Sprintf("Search Server indexed %d nodes", count))

	}()

	resp.Success = true

	return nil
}

func (s *SearchServer) ReindexFolder(c context.Context, node *tree.Node, excludes map[string]struct{}) {

	s.ReIndexThrottler <- struct{}{}
	defer func() {
		<-s.ReIndexThrottler
	}()
	bg := context.Background()
	dsStream, err := s.TreeClient.ListNodes(bg, &tree.ListNodesRequest{
		Node:      node,
		Recursive: true,
	})
	if err != nil {
		log.Logger(c).Error("ReindexFolder", zap.Error(err))
		return
	}
	defer dsStream.Close()
	var count int
	for {
		response, e := dsStream.Recv()
		if e != nil || response == nil {
			break
		}
		if !strings.HasPrefix(response.Node.GetUuid(), "DATASOURCE:") && !tree.IgnoreNodeForOutput(c, response.Node) {
			s.Engine.IndexNode(bg, response.Node, false, excludes)
			count++
		}
	}
	log.Logger(c).Info(fmt.Sprintf("Search Server re-indexed %d folders", count))

}
