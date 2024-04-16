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
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/meta"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime/manager"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/storage/indexer"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	BatchSize = 2000
)

type Server struct {
	indexer.Indexer

	inserts  chan *tree.IndexableNode
	deletes  chan string
	done     chan bool
	confChan chan configx.Values
}

//func NewBleveEngine(ctx context.Context, idx *bleve.bleveIndexer) (*Server, error) {
//	return newEngine(ctx, idx)
//}
//
//func newEngine(ctx context.Context, idx indexer.Indexer) (*Server, error) {
//
//	// idx.SetCodex(&bleve2.Codec{})
//
//	server := &Server{
//		Engine: idx,
//		DAO:    indexer.NewDAO(idx),
//
//		inserts:  make(chan *tree.IndexableNode),
//		deletes:  make(chan string),
//		done:     make(chan bool, 1),
//		confChan: make(chan configx.Values),
//	}
//
//	idx.Open(ctx)
//
//	go server.watchOperations(ctx)
//	go server.watchConfigs(ctx)
//
//	return server, nil
//}

func (s *Server) watchOperations(ctx context.Context) {
	nsProvider := meta.NewNsProvider(ctx)
	conf := servercontext.GetConfig(ctx)

	batch := NewBatch(ctx, nsProvider, BatchOptions{config: conf.Val()})
	debounce := 1 * time.Second
	timer := time.NewTimer(debounce)
	defer func() {
		timer.Stop()
	}()
	for {
		select {
		case n := <-s.inserts:
			timer.Stop() // Call stop and create new one instead of Reset
			timer = time.NewTimer(debounce)
			batch.Index(n)
			if batch.Size() >= BatchSize {
				batch.Flush(s)
			}
		case d := <-s.deletes:
			timer.Stop()
			timer = time.NewTimer(debounce)
			batch.Delete(d)
			if batch.Size() >= BatchSize {
				batch.Flush(s)
			}
		case <-timer.C:
			batch.Flush(s)
		case cf := <-s.confChan:
			// s.configs = cf
			batch.options.config = cf
			log.Logger(ctx).Info("Changing search engine content indexation status", zap.Bool("i", cf.Val("indexContent").Bool()))
		//case <-ctx.Done():
		//	batch.Flush(s.Engine)
		//	s.Engine.Close(ctx)
		//	close(s.done)
		//	return
		case <-s.done:
			batch.Flush(s)
			s.Close(ctx)
			return
		}
	}
}

func (s *Server) watchConfigs(ctx context.Context) {
	serviceName := common.ServiceGrpcNamespace_ + common.ServiceSearch

	watcher, e := config.Watch(configx.WithPath("services", serviceName))
	if e != nil {
		return
	}
	for {
		_, err := watcher.Next()
		if err != nil {
			break
		}

		s.confChan <- config.Get("services", serviceName)
	}

	watcher.Stop()
}

func (s *Server) Close(ctx context.Context) error {
	close(s.done)
	return s.Indexer.Close(ctx)
}

func (s *Server) IndexNode(c context.Context, n *tree.Node, reloadCore bool, excludes map[string]struct{}) error {
	dao, err := manager.Resolve[indexer.Indexer](c)
	if err != nil {
		return err
	}

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

	return dao.InsertOne(c, iNode)
}

func (s *Server) DeleteNode(c context.Context, n *tree.Node) error {
	s.deletes <- n.GetUuid()
	return nil

}

func (s *Server) ClearIndex(ctx context.Context) error {
	return s.Truncate(ctx, 0, func(s string) {
		log.Logger(ctx).Info(s)
	})
}

func (s *Server) SearchNodes(ctx context.Context, queryObject *tree.Query, from int32, size int32, sortField string, sortDesc bool, resultChan chan *tree.Node, facets chan *tree.SearchFacet, doneChan chan bool) error {
	dao, err := manager.Resolve[indexer.Indexer](ctx)
	if err != nil {
		return err
	}

	nsProvider := meta.NewNsProvider(ctx)
	conf := servercontext.GetConfig(ctx)

	accu := NewQueryCodec(s.Indexer, conf.Val(), nsProvider)

	searchResult, err := dao.FindMany(ctx, queryObject, from, size, sortField, sortDesc, accu)
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
