/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/event"
	"github.com/pydio/cells/common/log"
	protosync "github.com/pydio/cells/common/proto/sync"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/data/search/dao"
)

type SearchServer struct {
	Engine        dao.SearchEngine
	eventsChannel chan *event.EventWithContext
	TreeClient    tree.NodeProviderClient
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

	s.eventsChannel = make(chan *event.EventWithContext)
	go func() {
		for eventWCtx := range s.eventsChannel {
			ctx := servicecontext.WithServiceName(eventWCtx.Context, common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_SEARCH)
			s.processEvent(ctx, eventWCtx.Event)
		}
	}()
}

func (s *SearchServer) processEvent(ctx context.Context, e *tree.NodeChangeEvent) {

	log.Logger(ctx).Debug("processEvent", zap.Any("event", e))

	switch e.GetType() {
	case tree.NodeChangeEvent_CREATE:
		// Let's extract the basic information from the tree and store it
		if e.Target.Etag == common.NODE_FLAG_ETAG_TEMPORARY || utils.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		s.Engine.IndexNode(ctx, e.Target)
		break
	case tree.NodeChangeEvent_UPDATE_PATH:
		// Let's extract the basic information from the tree and store it
		if utils.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		s.Engine.IndexNode(ctx, e.Target)
		break
	case tree.NodeChangeEvent_UPDATE_META:
		// Let's extract the basic information from the tree and store it
		if utils.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		s.Engine.IndexNode(ctx, e.Target)
		break
	case tree.NodeChangeEvent_UPDATE_CONTENT:
		// We may have to store the metadata again
		if utils.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		s.Engine.IndexNode(ctx, e.Target)
		break
	case tree.NodeChangeEvent_DELETE:
		// Lets delete all metadata
		if utils.IgnoreNodeForOutput(ctx, e.Source) {
			break
		}
		s.Engine.DeleteNode(ctx, e.Source)
	default:
		log.Logger(ctx).Error("Could not recognize event type", zap.Any("type", e.GetType()))
	}
}

func (s *SearchServer) Search(ctx context.Context, req *tree.SearchRequest, streamer tree.Searcher_SearchStream) error {

	resultsChan := make(chan *tree.Node)
	doneChan := make(chan bool)
	defer close(resultsChan)
	defer close(doneChan)

	wg := &sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case node := <-resultsChan:
				if node != nil {

					log.Logger(ctx).Info("Search", zap.String("uuid", node.Uuid))

					if req.Details {
						response, e := s.TreeClient.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{
							Uuid: node.Uuid,
						}})
						if e == nil {
							streamer.Send(&tree.SearchResponse{Node: response.Node})
						} else if errors.Parse(e.Error()).Code == 404 {

							log.Logger(ctx).Error("Found node that does not exists, send event to make sure all is sync'ed.", zap.String("uuid", node.Uuid))

							client.Publish(ctx, client.NewPublication(common.TOPIC_TREE_CHANGES, &tree.NodeChangeEvent{
								Type:   tree.NodeChangeEvent_DELETE,
								Source: node,
							}))

						}
					} else {
						log.Logger(ctx).Info("No Details needed, sending back %v", zap.String("uuid", node.Uuid))
						streamer.Send(&tree.SearchResponse{Node: node})
					}

				}
			case <-doneChan:
				return
			}
		}
	}()

	err := s.Engine.SearchNodes(ctx, req.GetQuery(), req.GetFrom(), req.GetSize(), resultsChan, doneChan)
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

		dsStream, err := s.TreeClient.ListNodes(bg, &tree.ListNodesRequest{
			Node:      &tree.Node{Path: ""},
			Recursive: true,
		})
		if err != nil {
			log.Logger(c).Error("Resync", zap.Error(err))
			return
		}
		defer dsStream.Close()
		for {
			response, e := dsStream.Recv()
			if e != nil || response == nil {
				break
			}
			if !strings.HasPrefix(response.Node.GetUuid(), "DATASOURCE:") && !utils.IgnoreNodeForOutput(c, response.Node) {
				s.Engine.IndexNode(bg, response.Node)
			}
		}

	}()

	resp.Success = true

	return nil
}
