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

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/client/commons/treec"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	protosync "github.com/pydio/cells/v5/common/proto/sync"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/data/search"
)

// SearchServer implements GRPC server for index/search
type SearchServer struct {
	tree.UnimplementedSearcherServer
	protosync.UnimplementedSyncEndpointServer

	eventsChannel    chan *broker.TypeWithContext[*tree.NodeChangeEvent]
	TreeClient       tree.NodeProviderClient
	TreeClientStream tree.NodeProviderStreamerClient
	ReIndexThrottler chan struct{}
}

// Subscriber create a handler that will treat events for the meta server
func (s *SearchServer) Subscriber() *EventsSubscriber {

	if s.eventsChannel == nil {
		s.initEventsChannel()
	}
	subscriber := &EventsSubscriber{
		outputChannel: s.eventsChannel,
	}

	return subscriber
}

func (s *SearchServer) initEventsChannel() {

	s.eventsChannel = make(chan *broker.TypeWithContext[*tree.NodeChangeEvent])
	go func() {
		for eventWCtx := range s.eventsChannel {
			ctx := runtime.WithServiceName(eventWCtx.Ctx, common.ServiceGrpcNamespace_+common.ServiceSearch)
			s.processEvent(ctx, eventWCtx.Original)
		}
	}()
}

func (s *SearchServer) processEvent(ctx context.Context, e *tree.NodeChangeEvent) {

	log.Logger(ctx).Debug("processEvent", zap.Any("event", e))

	engine, err := manager.Resolve[search.Engine](ctx)
	if err != nil {
		return
	}

	switch e.GetType() {
	case tree.NodeChangeEvent_CREATE:
		// Let's extract the basic information from the tree and store it
		if e.Target.Etag == common.NodeFlagEtagTemporary || tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		err = engine.IndexNode(ctx, e.Target, false)
	case tree.NodeChangeEvent_UPDATE_PATH:
		// Let's extract the basic information from the tree and store it
		if tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		err = engine.IndexNode(ctx, e.Target, false)
		if !e.Target.IsLeaf() {
			go s.ReindexFolder(propagator.ForkedBackgroundWithMeta(ctx), e.Target)
		}
	case tree.NodeChangeEvent_UPDATE_META:
		// Let's extract the basic information from the tree and store it
		if e.Target.Path != "" && tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		err = engine.IndexNode(ctx, e.Target, false)
	case tree.NodeChangeEvent_UPDATE_USER_META:
		// Let's extract the basic information from the tree and store it
		if e.Target.Path != "" && tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		err = engine.IndexNode(ctx, e.Target, true)
	case tree.NodeChangeEvent_UPDATE_CONTENT:
		// We may have to store the metadata again
		if tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		err = engine.IndexNode(ctx, e.Target, false)
	case tree.NodeChangeEvent_DELETE:
		// Lets delete all metadata
		if tree.IgnoreNodeForOutput(ctx, e.Source) {
			break
		}
		err = engine.DeleteNode(ctx, e.Source)
	default:
		log.Logger(ctx).Error("Could not recognize event type", zap.Any("type", e.GetType()))
	}
	if err != nil {
		log.Logger(ctx).Error("[search_server] Error while processing event", zap.Error(err))
	}
}

func (s *SearchServer) Search(req *tree.SearchRequest, streamer tree.Searcher_SearchServer) error {

	ctx := streamer.Context()

	resultsChan := make(chan *tree.Node)
	facetsChan := make(chan *tree.SearchFacet)
	doneChan := make(chan bool)
	totalChan := make(chan uint64)
	defer close(resultsChan)
	defer close(facetsChan)
	defer close(totalChan)
	defer close(doneChan)

	engine, err := manager.Resolve[search.Engine](ctx)
	if err != nil {
		return err
	}

	var treeStreamer tree.NodeProviderStreamer_ReadNodeStreamClient
	defer func() {
		if treeStreamer != nil {
			_ = treeStreamer.CloseSend()
		}
	}()

	wg := &sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case to := <-totalChan:
				_ = streamer.Send(&tree.SearchResponse{Data: &tree.SearchResponse_Pagination{Pagination: &tree.SearchPagination{TotalHits: int64(to)}}})
			case facet := <-facetsChan:
				_ = streamer.Send(&tree.SearchResponse{Data: &tree.SearchResponse_Facet{Facet: facet}})
			case node := <-resultsChan:
				if node != nil {

					log.Logger(ctx).Debug("Search", zap.String("uuid", node.Uuid))

					if req.Details {
						var response *tree.ReadNodeResponse
						var readError error
						readReq := &tree.ReadNodeRequest{Node: &tree.Node{Uuid: node.Uuid}, StatFlags: req.GetStatFlags()}

						if treeStreamer == nil {
							readCtx := propagator.WithAdditionalMetadata(ctx, tree.StatFlags(req.StatFlags).AsMeta())
							if ts, er := s.newTreeStreamer(readCtx); er != nil {
								log.Logger(ctx).Error("Cannot create streamer, fallback to simple reader", zap.Error(er))
							} else {
								treeStreamer = ts
							}
						}
						if treeStreamer == nil {
							response, readError = s.getTreeClient(ctx).ReadNode(ctx, readReq)
						} else {
							if sendEr := treeStreamer.Send(readReq); sendEr == nil {
								response, readError = treeStreamer.Recv()
							} else {
								readError = sendEr
							}
						}

						if readError == nil && response.GetNode() != nil {
							_ = streamer.Send(&tree.SearchResponse{Data: &tree.SearchResponse_Node{Node: response.GetNode()}})
						} else if errors.Is(readError, errors.StatusNotFound) {

							log.Logger(ctx).Error("Found node that does not exists, send event to make sure all is sync'ed.", zap.String("uuid", node.Uuid))
							broker.MustPublish(ctx, common.TopicTreeChanges, &tree.NodeChangeEvent{
								Type:   tree.NodeChangeEvent_DELETE,
								Source: node,
							})
						}
					} else {
						log.Logger(ctx).Debug("No Details needed, sending back node", zap.String("uuid", node.Uuid))
						_ = streamer.Send(&tree.SearchResponse{Data: &tree.SearchResponse_Node{Node: node}})
					}

				}
			case <-doneChan:
				return
			}
		}
	}()

	if err := engine.SearchNodes(ctx, req.GetQuery(), req.GetFrom(), req.GetSize(), req.GetSortField(), req.GetSortDirDesc(), resultsChan, facetsChan, totalChan, doneChan); err != nil {
		return err
	}

	wg.Wait()
	return nil
}

func (s *SearchServer) TriggerResync(ctx context.Context, req *protosync.ResyncRequest) (*protosync.ResyncResponse, error) {

	engine, err := manager.Resolve[search.Engine](ctx)
	if err != nil {
		return nil, err
	}

	reqPath := strings.Trim(req.GetPath(), "/")
	if reqPath == "" {
		log.Logger(ctx).Info("Clearing search engine index before full re-indexation")
		if e := engine.ClearIndex(ctx); e != nil {
			return nil, e
		}
		log.Logger(ctx).Info("Clearing search engine : done")
	}
	var roots []*tree.Node
	if len(reqPath) > 0 {
		// Use reqPath as first level
		roots = append(roots, &tree.Node{Path: reqPath})
		log.Logger(ctx).Info("Will Re-Index DataSource " + reqPath)
	} else {
		// List all Datasources
		dss := config.SourceNamesForDataServices(ctx, common.ServiceDataSync)
		for _, dn := range dss {
			if ds, e := config.GetSourceInfoByName(ctx, dn); e == nil {
				if ds.Disabled || ds.IsInternal() {
					continue
				}
				roots = append(roots, &tree.Node{Path: ds.Name})
			}
		}
	}

	wg := sync.WaitGroup{}
	bg := context.Background()
	throttle := make(chan struct{}, 2)

	for _, root := range roots {
		wg.Add(1)
		throttle <- struct{}{}
		go func(ro *tree.Node) {
			defer func() {
				wg.Done()
				<-throttle
			}()
			log.Logger(ctx).Info("Start Reindexing DataSource " + ro.GetPath())
			dsStream, err := s.getTreeClient(ctx).ListNodes(bg, &tree.ListNodesRequest{
				Node:      ro,
				Recursive: true,
			})
			if err != nil {
				log.Logger(ctx).Error("Could not list nodes"+err.Error(), zap.Error(err))
				return
			}
			var count int
			for {
				response, e := dsStream.Recv()
				if e != nil || response == nil {
					break
				}
				if !strings.HasPrefix(response.Node.GetUuid(), "DATASOURCE:") && !tree.IgnoreNodeForOutput(ctx, response.Node) {
					engine.IndexNode(bg, response.Node, false)
					count++
					if count%5000 == 0 {
						log.Logger(ctx).Info(fmt.Sprintf("[%s] Current Indexation: %d nodes", ro.GetPath(), count))
					}
				}
			}
			log.Logger(ctx).Info(fmt.Sprintf("[%s] Total Indexed : %d nodes", ro.GetPath(), count))
		}(root)
	}

	return &protosync.ResyncResponse{Success: true}, nil
}

func (s *SearchServer) ReindexFolder(ctx context.Context, node *tree.Node) {

	engine, err := manager.Resolve[search.Engine](ctx)
	if err != nil {
		return
	}

	s.ReIndexThrottler <- struct{}{}
	defer func() {
		<-s.ReIndexThrottler
	}()
	dsStream, err := s.getTreeClient(ctx).ListNodes(ctx, &tree.ListNodesRequest{
		Node:      node,
		Recursive: true,
	})
	if err != nil {
		log.Logger(ctx).Error("ReindexFolder", zap.Error(err))
		return
	}
	var count int
	for {
		response, e := dsStream.Recv()
		if e != nil || response == nil {
			break
		}
		if !strings.HasPrefix(response.Node.GetUuid(), "DATASOURCE:") && !tree.IgnoreNodeForOutput(ctx, response.Node) {
			_ = engine.IndexNode(ctx, response.Node, false)
			count++
		}
	}
	if count > 0 {
		log.Logger(ctx).Info(fmt.Sprintf("Search Server re-indexed %d folders", count))
	}

}

func (s *SearchServer) getTreeClient(ctx context.Context) tree.NodeProviderClient {
	return treec.NodeProviderClient(ctx)
}

func (s *SearchServer) newTreeStreamer(ctx context.Context) (tree.NodeProviderStreamer_ReadNodeStreamClient, error) {
	return treec.NodeProviderStreamerClient(ctx).ReadNodeStream(ctx)
}
