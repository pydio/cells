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

// Package bleve implements the search engine using a Bleve indexer.
package dao

import (
	"context"
	"errors"
	"fmt"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/meta"
	"github.com/pydio/cells/v4/common/proto/tree"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/storage/indexer"
	bleve2 "github.com/pydio/cells/v4/data/search/dao/bleve"
)

var (
	BatchSize = 2000
)

type Server struct {
	indexer.Indexer

	batch indexer.Batch
}

func NewEngine(ctx context.Context, idx indexer.Indexer) (*Server, error) {
	return newEngine(ctx, idx)
}

func newEngine(ctx context.Context, idx indexer.Indexer) (*Server, error) {

	if idx == nil {
		return nil, errors.New("empty indexer")
	}
	idx.SetCodex(&bleve2.Codec{})

	server := &Server{}
	server.Indexer = idx

	server.batch = NewBatch(ctx, idx, meta.NewNsProvider(ctx), BatchOptions{})

	//go server.watchConfigs(ctx)

	return server, nil
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

func (s *Server) SearchNodes(ctx context.Context, queryObject *tree.Query, from int32, size int32, sortField string, sortDesc bool, resultChan chan *tree.Node, facets chan *tree.SearchFacet, doneChan chan bool) error {

	nsProvider := meta.NewNsProvider(ctx)

	accu := NewQueryCodec(s.Indexer, servercontext.GetConfig(ctx).Val(), nsProvider)

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
