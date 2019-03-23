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

// Package bleve implements the search engine using a Bleve indexer.
package bleve

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/blevesearch/bleve"
	_ "github.com/blevesearch/bleve/analysis/analyzer/keyword"
	"github.com/blevesearch/bleve/index/scorch"
	"github.com/blevesearch/bleve/index/store/boltdb"
	"github.com/blevesearch/bleve/search/query"
	"github.com/golang/protobuf/proto"
	"github.com/sajari/docconv"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
)

var (
	BleveIndexPath = ""
)

type BleveServer struct {
	Router       views.Handler
	Engine       bleve.Index
	IndexContent bool

	batch   *bleve.Batch
	inserts chan *IndexableNode
	deletes chan string
	done    chan bool
}

func NewBleveEngine(indexContent bool) (*BleveServer, error) {

	if BleveIndexPath == "" {
		return nil, fmt.Errorf("please setup BleveIndexPath before opening engine")
	}

	_, e := os.Stat(BleveIndexPath)
	var index bleve.Index
	var err error
	if e == nil {

		index, err = bleve.Open(BleveIndexPath)

	} else {

		mapping := bleve.NewIndexMapping()
		nodeMapping := bleve.NewDocumentMapping()
		mapping.AddDocumentMapping("node", nodeMapping)

		// Path to keyword
		pathFieldMapping := bleve.NewTextFieldMapping()
		pathFieldMapping.Analyzer = "keyword"
		nodeMapping.AddFieldMappingsAt("Path", pathFieldMapping)

		// Node type to keyword
		nodeType := bleve.NewTextFieldMapping()
		nodeType.Analyzer = "keyword"
		nodeMapping.AddFieldMappingsAt("NodeType", nodeType)

		// Extension to keyword
		extType := bleve.NewTextFieldMapping()
		extType.Analyzer = "keyword"
		nodeMapping.AddFieldMappingsAt("Extension", extType)

		// Modification Time as Date
		modifTime := bleve.NewDateTimeFieldMapping()
		nodeMapping.AddFieldMappingsAt("ModifTime", modifTime)

		// GeoPoint
		geoPosition := bleve.NewGeoPointFieldMapping()
		nodeMapping.AddFieldMappingsAt("GeoPoint", geoPosition)

		// Text Content
		textContent := bleve.NewTextFieldMapping()
		textContent.Analyzer = "en" // See detect_lang in the blevesearch/blevex package?
		textContent.Store = false
		textContent.IncludeInAll = false
		nodeMapping.AddFieldMappingsAt("TextContent", textContent)

		index, err = bleve.NewUsing(BleveIndexPath, mapping, scorch.Name, boltdb.Name, nil)
	}
	if err != nil {
		return nil, err
	}
	server := &BleveServer{
		Engine:       index,
		IndexContent: indexContent,
		inserts:      make(chan *IndexableNode),
		deletes:      make(chan string),
		done:         make(chan bool, 1),
	}
	go server.watchOperations()
	return server, nil
}

type IndexableNode struct {
	tree.Node
	ModifTime   time.Time
	Basename    string
	NodeType    string
	Extension   string
	TextContent string
	GeoPoint    map[string]interface{}
	Meta        map[string]interface{}
}

func (i *IndexableNode) BleveType() string {
	return "node"
}

func (s *BleveServer) getRouter() views.Handler {
	if s.Router == nil {
		s.Router = views.NewStandardRouter(views.RouterOptions{AdminView: true, WatchRegistry: true})
	}
	return s.Router
}

func (s *BleveServer) MakeIndexableNode(ctx context.Context, node *tree.Node) *IndexableNode {
	indexNode := &IndexableNode{Node: *node}
	indexNode.Meta = indexNode.AllMetaDeserialized()
	indexNode.ModifTime = time.Unix(indexNode.MTime, 0)
	var basename string
	indexNode.GetMeta("name", &basename)
	indexNode.Basename = basename
	if indexNode.Type == 1 {
		indexNode.NodeType = "file"
		indexNode.Extension = strings.TrimLeft(filepath.Ext(basename), ".")
	} else {
		indexNode.NodeType = "folder"
	}
	indexNode.GetMeta("GeoLocation", &indexNode.GeoPoint)

	if s.IndexContent && indexNode.IsLeaf() {
		logger := log.Logger(ctx)
		reader, err := s.getRouter().GetObject(ctx, proto.Clone(node).(*tree.Node), &views.GetRequestData{Length: -1})
		if err == nil {
			convertResp, er := docconv.Convert(reader, docconv.MimeTypeByExtension(basename), true)
			if er == nil {
				// Todo : do something with convertResp.Meta?
				logger.Debug("[BLEVE] Indexing content body for file")
				indexNode.TextContent = convertResp.Body
			}
		} else {
			logger.Debug("[BLEVE] Index content: error while trying to read file for content indexation")
		}
	}
	indexNode.MetaStore = nil
	return indexNode
}

func (s *BleveServer) watchOperations() {
	for {
		select {
		case n := <-s.inserts:
			if s.batch == nil {
				s.batch = s.Engine.NewBatch()
			}
			s.batch.Index(n.GetUuid(), n)
			if s.batch.Size() > 1000 {
				s.flush()
			}
		case d := <-s.deletes:
			if s.batch == nil {
				s.batch = s.Engine.NewBatch()
			}
			s.batch.Delete(d)
			if s.batch.Size() > 1000 {
				s.flush()
			}
		case <-time.After(3 * time.Second):
			s.flush()
		case <-s.done:
			s.flush()
			s.Engine.Close()
			return
		}
	}
}

func (s *BleveServer) flush() {
	if s.batch != nil {
		s.Engine.Batch(s.batch)
		s.batch = nil
	}
}

func (s *BleveServer) Close() error {
	close(s.done)
	return nil
}

func (s *BleveServer) IndexNode(c context.Context, n *tree.Node) error {

	indexNode := s.MakeIndexableNode(c, n)
	if n.GetUuid() == "" {
		return fmt.Errorf("missing uuid")
	}
	log.Logger(c).Debug("IndexNode", indexNode.Zap())
	s.inserts <- indexNode

	return nil
}

func (s *BleveServer) DeleteNode(c context.Context, n *tree.Node) error {

	//return s.Engine.Delete(n.GetUuid())
	s.deletes <- n.GetUuid()
	return nil

}

func (s *BleveServer) ClearIndex(ctx context.Context) error {
	// List all nodes and remove them
	request := bleve.NewSearchRequest(bleve.NewMatchAllQuery())
	MaxUint := ^uint(0)
	MaxInt := int(MaxUint >> 1)
	request.Size = MaxInt
	searchResult, err := s.Engine.SearchInContext(ctx, request)
	if err != nil {
		return err
	}
	b := s.Engine.NewBatch()
	for _, hit := range searchResult.Hits {
		log.Logger(ctx).Info("ClearIndex", zap.String("hit", hit.ID))
		b.Delete(hit.ID)
	}
	s.Engine.Batch(b)
	return nil
}

func (s *BleveServer) SearchNodes(c context.Context, queryObject *tree.Query, from int32, size int32, resultChan chan *tree.Node, doneChan chan bool) error {

	boolean := bleve.NewBooleanQuery()
	// FileName
	if len(queryObject.GetFileName()) > 0 {
		wCard := bleve.NewWildcardQuery("*" + strings.Trim(strings.ToLower(queryObject.GetFileName()), "*") + "*")
		wCard.SetField("Basename")
		boolean.AddMust(wCard)
	}
	// File Size Range
	if queryObject.MinSize > 0 || queryObject.MaxSize > 0 {
		var min = float64(queryObject.MinSize)
		var max = float64(queryObject.MaxSize)
		var numRange *query.NumericRangeQuery
		if max == 0 {
			numRange = bleve.NewNumericRangeQuery(&min, nil)
		} else {
			numRange = bleve.NewNumericRangeQuery(&min, &max)
		}
		numRange.SetField("Size")
		boolean.AddMust(numRange)
	}
	// Date Range
	if queryObject.MinDate > 0 || queryObject.MaxDate > 0 {
		var dateRange *query.DateRangeQuery
		if queryObject.MaxDate > 0 {
			dateRange = bleve.NewDateRangeQuery(time.Unix(queryObject.MinDate, 0), time.Unix(queryObject.MaxDate, 0))
		} else {
			dateRange = bleve.NewDateRangeQuery(time.Unix(queryObject.MinDate, 0), time.Now())
		}
		dateRange.SetField("ModifTime")
		boolean.AddMust(dateRange)
	}
	// Limit to a SubTree
	if len(queryObject.PathPrefix) > 0 {
		subQ := bleve.NewBooleanQuery()
		for _, pref := range queryObject.PathPrefix {
			prefix := bleve.NewPrefixQuery(pref)
			prefix.SetField("Path")
			subQ.AddShould(prefix)
		}
		boolean.AddMust(subQ)
	}
	// Limit to a given node type
	if queryObject.Type > 0 {
		nodeType := "file"
		if queryObject.Type == 2 {
			nodeType = "folder"
		}
		typeQuery := bleve.NewTermQuery(nodeType)
		typeQuery.SetField("NodeType")
		boolean.AddMust(typeQuery)
	}

	if len(queryObject.Extension) > 0 {
		extQuery := bleve.NewTermQuery(queryObject.Extension)
		extQuery.SetField("Extension")
		boolean.AddMust(extQuery)
	}

	if len(queryObject.FreeString) > 0 {
		qStringQuery := bleve.NewQueryStringQuery(queryObject.FreeString)
		boolean.AddMust(qStringQuery)
	}

	if queryObject.GeoQuery != nil {
		if queryObject.GeoQuery.Center != nil && len(queryObject.GeoQuery.Distance) > 0 {
			distanceQuery := bleve.NewGeoDistanceQuery(queryObject.GeoQuery.Center.Lon, queryObject.GeoQuery.Center.Lat, queryObject.GeoQuery.Distance)
			distanceQuery.SetField("GeoPoint")
			boolean.AddMust(distanceQuery)
		} else if queryObject.GeoQuery.TopLeft != nil && queryObject.GeoQuery.BottomRight != nil {
			boundingBoxQuery := bleve.NewGeoBoundingBoxQuery(
				queryObject.GeoQuery.TopLeft.Lon,
				queryObject.GeoQuery.TopLeft.Lat,
				queryObject.GeoQuery.BottomRight.Lon,
				queryObject.GeoQuery.BottomRight.Lat,
			)
			boundingBoxQuery.SetField("GeoPoint")
			boolean.AddMust(boundingBoxQuery)
		}
	}

	log.Logger(c).Info("SearchObjects", zap.Any("query", boolean))
	searchRequest := bleve.NewSearchRequest(boolean)
	if size > 0 {
		searchRequest.Size = int(size)
	}
	searchRequest.From = int(from)
	searchResult, err := s.Engine.SearchInContext(c, searchRequest)
	if err != nil {
		doneChan <- true
		return err
	}
	log.Logger(c).Info("SearchObjects", zap.Any("result", searchResult))
	for _, hit := range searchResult.Hits {
		doc, docErr := s.Engine.Document(hit.ID)
		if docErr != nil || doc == nil {
			continue
		}
		node := &tree.Node{}
		for _, f := range doc.Fields {
			stringValue := string(f.Value())
			switch f.Name() {
			case "Uuid":
				node.Uuid = stringValue
				break
			case "Path":
				node.Path = stringValue
				break
			case "NodeType":
				if stringValue == "file" {
					node.Type = 1
				} else if stringValue == "folder" {
					node.Type = 2
				}
				break
			case "Basename":
				node.SetMeta("name", stringValue)
			default:
				break
			}
		}

		log.Logger(c).Info("SearchObjects", zap.Any("node", node))

		resultChan <- node
	}

	doneChan <- true
	return nil

}
