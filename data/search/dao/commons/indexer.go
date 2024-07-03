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

// Package commons implements the search engine
package commons

import (
	"context"
	"fmt"

	"github.com/pydio/cells/v4/common/nodes/meta"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage"
	"github.com/pydio/cells/v4/common/storage/indexer"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	BatchSize = 2000
)

type QueryCodecProvider func(values configx.Values, metaProvider *meta.NsProvider) storage.IndexCodex

type Server struct {
	indexer.Indexer
	batch              indexer.Batch
	queryCodecProvider QueryCodecProvider
}

func NewServer(ctx context.Context, idx indexer.Indexer, provider QueryCodecProvider, batchOptions ...indexer.BatchOption) *Server {

	server := &Server{
		queryCodecProvider: provider,
		Indexer:            idx,
		batch:              NewBatch(ctx, idx, meta.NewNsProvider(ctx), BatchOptions{}, batchOptions...),
	}

	//go server.watchConfigs(ctx)

	return server
}

//func (s *Server) watchConfigs(ctx context.Context) {
//	serviceName := common.ServiceGrpcNamespace_ + common.ServiceSearch
//
//	watcher, e := config.Watch(configx.WithPath("services", serviceName))
//	if e != nil {
//		return
//	}
//	for {
//		_, err := watcher.Next()
//		if err != nil {
//			break
//		}
//
//		s.confChan <- config.Get("services", serviceName)
//	}
//
//	watcher.Stop()
//}

func (s *Server) Close(ctx context.Context) error {
	if err := s.batch.Close(); err != nil {
		return err
	}
	return s.Indexer.Close(ctx)
}

func (s *Server) IndexNode(c context.Context, n *tree.Node, reloadCore bool, excludes map[string]struct{}) error {
	if n.GetUuid() == "" {
		return fmt.Errorf("missing uuid")
	}

	forceCore := false
	if n.GetPath() == "" || n.GetType() == tree.NodeType_UNKNOWN {
		forceCore = true
	}

	indexNode := &tree.IndexableNode{
		Node:       *n,
		ReloadCore: reloadCore || forceCore,
		ReloadNs:   !reloadCore,
	}

	return s.batch.Insert(indexNode)
}

func (s *Server) DeleteNode(c context.Context, n *tree.Node) error {
	return s.batch.Delete(n.GetUuid())
}

func (s *Server) ClearIndex(ctx context.Context) error {
	return s.Indexer.Truncate(ctx, 0, func(s string) {
		log.Logger(ctx).Info(s)
	})
}

func (s *Server) Flush() error {
	return s.batch.Flush()
}

func (s *Server) SearchNodes(ctx context.Context, queryObject *tree.Query, from int32, size int32, sortField string, sortDesc bool, resultChan chan *tree.Node, facets chan *tree.SearchFacet, doneChan chan bool) error {

	nsProvider := meta.NewNsProvider(ctx)

	accu := s.queryCodecProvider(manager.MustGetConfig(ctx).Val(), nsProvider)

	searchResult, err := s.Indexer.FindMany(ctx, queryObject, from, size, sortField, sortDesc, accu)
	if err != nil {
		doneChan <- true
		return err
	}

	for res := range searchResult {
		switch item := res.(type) {
		case *tree.Node:
			resultChan <- item
		case *tree.SearchFacet:
			facets <- item
		default:
			fmt.Println("unrecognized object")
		}
	}

	if facetParser, ok := accu.(indexer.FacetParser); ok {
		for _, f := range facetParser.FlushCustomFacets() {
			facets <- f.(*tree.SearchFacet)
		}
	}

	doneChan <- true
	return nil
}
