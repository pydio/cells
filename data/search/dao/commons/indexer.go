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
	"sync"

	"github.com/pydio/cells/v4/common/nodes/meta"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/indexer"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

var (
	BatchSize = 2000
)

type QueryCodecProvider func(values configx.Values, metaProvider *meta.NsProvider) indexer.IndexCodex

var (
	batchPool     *openurl.Pool[indexer.Batch]
	batchPoolInit sync.Once
)

type Server struct {
	indexer.Indexer
	srvContext         context.Context
	queryCodecProvider QueryCodecProvider
	batchOptions       []indexer.BatchOption
}

func NewServer(ctx context.Context, idx indexer.Indexer, provider QueryCodecProvider, batchOptions ...indexer.BatchOption) *Server {

	server := &Server{
		queryCodecProvider: provider,
		Indexer:            idx,
		srvContext:         ctx,
		batchOptions:       batchOptions,
	}

	return server
}

func (s *Server) getBatch(ctx context.Context) (indexer.Batch, error) {
	batchPoolInit.Do(func() {
		bo := s.batchOptions
		batchPool = openurl.MustMemPool[indexer.Batch](ctx, func(ct context.Context, url string) indexer.Batch {
			openContext := context.WithoutCancel(ct)
			return NewBatch(openContext, meta.NewNsProvider(openContext), BatchOptions{}, bo...)
		})
	})
	return batchPool.Get(ctx)
}

func (s *Server) Close(ctx context.Context) error {
	return s.Indexer.Close(ctx)
}

func (s *Server) IndexNode(c context.Context, n *tree.Node, reloadCore bool) error {
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
	b, er := s.getBatch(c)
	if er != nil {
		return er
	}

	return b.Insert(indexNode)
}

func (s *Server) DeleteNode(c context.Context, n *tree.Node) error {
	b, er := s.getBatch(c)
	if er != nil {
		return er
	}
	return b.Delete(n.GetUuid())
}

func (s *Server) ClearIndex(ctx context.Context) error {
	return s.Indexer.Truncate(ctx, 0, func(s string) {
		log.Logger(ctx).Info(s)
	})
}

func (s *Server) Flush(ctx context.Context) error {
	b, er := s.getBatch(ctx)
	if er != nil {
		return er
	}
	return b.Flush()
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
