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
	"fmt"
	"github.com/pydio/cells/v4/common/log"
	"time"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/meta"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	IndexPath = ""
	BatchSize = 2000
)

type Server struct {
	Ctx          context.Context
	Router       nodes.Handler
	Engine       dao.IndexDAO
	IndexContent bool

	configs configx.Values

	inserts chan *tree.IndexableNode
	deletes chan string
	done    chan bool

	nsProvider *meta.NsProvider
}

func NewEngine(ctx context.Context, indexer dao.IndexDAO, nsProvider *meta.NsProvider, configs configx.Values) (*Server, error) {

	server := &Server{
		Ctx:          ctx,
		Engine:       indexer,
		IndexContent: configs.Val("indexContent").Bool(),
		configs:      configs,
		//		basenameAnalyzer: bnA,
		//		contentAnalyzer:  cA,
		inserts:    make(chan *tree.IndexableNode),
		deletes:    make(chan string),
		done:       make(chan bool, 1),
		nsProvider: nsProvider,
	}
	go server.watchOperations()
	return server, nil
}

func (s *Server) watchOperations() {
	batch := NewBatch(s.Ctx, s.nsProvider, BatchOptions{IndexContent: s.IndexContent})
	for {
		select {
		case n := <-s.inserts:
			batch.Index(n)
			if batch.Size() >= BatchSize {
				batch.Flush(s.Engine)
			}
		case d := <-s.deletes:
			batch.Delete(d)
			if batch.Size() >= BatchSize {
				batch.Flush(s.Engine)
			}
		case <-time.After(3 * time.Second):
			batch.Flush(s.Engine)
		case <-s.Ctx.Done():
			batch.Flush(s.Engine)
			s.Engine.Close()
			close(s.done)
			return
		case <-s.done:
			batch.Flush(s.Engine)
			s.Engine.Close()
			return
		}
	}
}

func (s *Server) Close() error {
	close(s.done)
	return s.Engine.Close()
}

func (s *Server) IndexNode(c context.Context, n *tree.Node, reloadCore bool, excludes map[string]struct{}) error {

	if n.GetUuid() == "" {
		return fmt.Errorf("missing uuid")
	}
	forceCore := false
	if n.GetPath() == "" || n.GetType() == tree.NodeType_UNKNOWN {
		forceCore = true
	}
	iNode := &tree.IndexableNode{
		Node:       *n,
		ReloadCore: reloadCore || forceCore,
		ReloadNs:   !reloadCore,
	}
	s.inserts <- iNode

	return nil
}

func (s *Server) DeleteNode(c context.Context, n *tree.Node) error {

	s.deletes <- n.GetUuid()
	return nil

}

func (s *Server) ClearIndex(ctx context.Context) error {
	return s.Engine.Truncate(ctx, 0, func(s string) {
		log.Logger(ctx).Info(s)
	})
}

func (s *Server) SearchNodes(c context.Context, queryObject *tree.Query, from int32, size int32, resultChan chan *tree.Node, facets chan *tree.SearchFacet, doneChan chan bool) error {

	accu := NewQueryCodec(s.Engine, s.configs, s.nsProvider)

	searchResult, err := s.Engine.FindMany(c, queryObject, from, size, accu)
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

	if facetParser, ok := accu.(dao.FacetParser); ok {
		for _, f := range facetParser.FlushCustomFacets() {
			facets <- f.(*tree.SearchFacet)
		}
	}

	doneChan <- true
	return nil

}
