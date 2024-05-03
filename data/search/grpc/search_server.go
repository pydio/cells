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

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/client/commons/treec"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/meta"
	protosync "github.com/pydio/cells/v4/common/proto/sync"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/data/search/dao"
)

// SearchServer implements GRPC server for index/search
type SearchServer struct {
	tree.UnimplementedSearcherServer
	protosync.UnimplementedSyncEndpointServer
	RuntimeCtx context.Context

	eventsChannel    chan *broker.TypeWithContext[*tree.NodeChangeEvent]
	TreeClient       tree.NodeProviderClient
	TreeClientStream tree.NodeProviderStreamerClient
	NsProvider       *meta.NsProvider
	ReIndexThrottler chan struct{}
}

func (s *SearchServer) Name() string {
	return Name
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
			ctx := runtimecontext.WithServiceName(eventWCtx.Ctx, common.ServiceGrpcNamespace_+common.ServiceSearch)
			s.processEvent(ctx, eventWCtx.Original)
		}
	}()
}

func (s *SearchServer) processEvent(ctx context.Context, e *tree.NodeChangeEvent) {

	log.Logger(ctx).Debug("processEvent", zap.Any("event", e))
	excludes := s.NsProvider.ExcludeIndexes()

	engine, err := manager.Resolve[dao.SearchEngine](ctx)
	if err != nil {
		return
	}

	switch e.GetType() {
	case tree.NodeChangeEvent_CREATE:
		// Let's extract the basic information from the tree and store it
		if e.Target.Etag == common.NodeFlagEtagTemporary || tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		engine.IndexNode(ctx, e.Target, false, excludes)
	case tree.NodeChangeEvent_UPDATE_PATH:
		// Let's extract the basic information from the tree and store it
		if tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		engine.IndexNode(ctx, e.Target, false, excludes)
		if !e.Target.IsLeaf() {
			go s.ReindexFolder(ctx, e.Target, excludes)
		}
	case tree.NodeChangeEvent_UPDATE_META:
		// Let's extract the basic information from the tree and store it
		if e.Target.Path != "" && tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		engine.IndexNode(ctx, e.Target, false, excludes)
	case tree.NodeChangeEvent_UPDATE_USER_META:
		// Let's extract the basic information from the tree and store it
		if e.Target.Path != "" && tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		engine.IndexNode(ctx, e.Target, true, excludes)
	case tree.NodeChangeEvent_UPDATE_CONTENT:
		// We may have to store the metadata again
		if tree.IgnoreNodeForOutput(ctx, e.Target) {
			break
		}
		engine.IndexNode(ctx, e.Target, false, excludes)
	case tree.NodeChangeEvent_DELETE:
		// Lets delete all metadata
		if tree.IgnoreNodeForOutput(ctx, e.Source) {
			break
		}
		engine.DeleteNode(ctx, e.Source)
	default:
		log.Logger(ctx).Error("Could not recognize event type", zap.Any("type", e.GetType()))
	}
}

func (s *SearchServer) Search(req *tree.SearchRequest, streamer tree.Searcher_SearchServer) error {

	ctx := streamer.Context()

	resultsChan := make(chan *tree.Node)
	facetsChan := make(chan *tree.SearchFacet)
	doneChan := make(chan bool)
	defer close(resultsChan)
	defer close(facetsChan)
	defer close(doneChan)

	engine, err := manager.Resolve[dao.SearchEngine](ctx)
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
			case facet := <-facetsChan:
				streamer.Send(&tree.SearchResponse{Facet: facet})
			case node := <-resultsChan:
				if node != nil {

					log.Logger(ctx).Debug("Search", zap.String("uuid", node.Uuid))

					if req.Details {
						var response *tree.ReadNodeResponse
						var readError error
						readReq := &tree.ReadNodeRequest{Node: &tree.Node{Uuid: node.Uuid}, StatFlags: req.GetStatFlags()}

						if treeStreamer == nil {
							readCtx := metadata.WithAdditionalMetadata(ctx, tree.StatFlags(req.StatFlags).AsMeta())
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
							_ = streamer.Send(&tree.SearchResponse{Node: response.Node})
						} else if readError != nil && errors.FromError(readError).Code == 404 {

							log.Logger(ctx).Error("Found node that does not exists, send event to make sure all is sync'ed.", zap.String("uuid", node.Uuid))
							broker.MustPublish(ctx, common.TopicTreeChanges, &tree.NodeChangeEvent{
								Type:   tree.NodeChangeEvent_DELETE,
								Source: node,
							})
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

	if err := engine.SearchNodes(ctx, req.GetQuery(), req.GetFrom(), req.GetSize(), req.GetSortField(), req.GetSortDirDesc(), resultsChan, facetsChan, doneChan); err != nil {
		return err
	}

	wg.Wait()
	return nil
}

func (s *SearchServer) TriggerResync(ctx context.Context, req *protosync.ResyncRequest) (*protosync.ResyncResponse, error) {

	engine, err := manager.Resolve[dao.SearchEngine](ctx)
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
		dss := config.SourceNamesForDataServices(common.ServiceDataSync)
		for _, dn := range dss {
			if ds, e := config.GetSourceInfoByName(dn); e == nil {
				if ds.Disabled || ds.IsInternal() {
					continue
				}
				roots = append(roots, &tree.Node{Path: ds.Name})
			}
		}
	}

	excludes := s.NsProvider.ExcludeIndexes()
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
					engine.IndexNode(bg, response.Node, false, excludes)
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

func (s *SearchServer) ReindexFolder(ctx context.Context, node *tree.Node, excludes map[string]struct{}) {

	engine, err := manager.Resolve[dao.SearchEngine](ctx)
	if err != nil {
		return
	}

	s.ReIndexThrottler <- struct{}{}
	defer func() {
		<-s.ReIndexThrottler
	}()
	bg := context.Background()
	dsStream, err := s.getTreeClient(ctx).ListNodes(bg, &tree.ListNodesRequest{
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
			_ = engine.IndexNode(bg, response.Node, false, excludes)
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
