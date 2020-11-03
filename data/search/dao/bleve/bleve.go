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
	"strings"
	"time"

	"github.com/blevesearch/bleve"
	"github.com/blevesearch/bleve/analysis/analyzer/keyword"
	"github.com/blevesearch/bleve/analysis/analyzer/standard"
	"github.com/blevesearch/bleve/analysis/lang/en"
	"github.com/blevesearch/bleve/index/scorch"
	"github.com/blevesearch/bleve/index/store/boltdb"
	"github.com/blevesearch/bleve/registry"
	"github.com/blevesearch/bleve/search/query"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"

	_ "github.com/blevesearch/bleve/analysis/lang/ar"
	_ "github.com/blevesearch/bleve/analysis/lang/bg"
	_ "github.com/blevesearch/bleve/analysis/lang/ca"
	_ "github.com/blevesearch/bleve/analysis/lang/cjk"
	_ "github.com/blevesearch/bleve/analysis/lang/ckb"
	_ "github.com/blevesearch/bleve/analysis/lang/cs"
	_ "github.com/blevesearch/bleve/analysis/lang/da"
	_ "github.com/blevesearch/bleve/analysis/lang/de"
	_ "github.com/blevesearch/bleve/analysis/lang/el"
	_ "github.com/blevesearch/bleve/analysis/lang/es"
	_ "github.com/blevesearch/bleve/analysis/lang/eu"
	_ "github.com/blevesearch/bleve/analysis/lang/fa"
	_ "github.com/blevesearch/bleve/analysis/lang/fi"
	_ "github.com/blevesearch/bleve/analysis/lang/fr"
	_ "github.com/blevesearch/bleve/analysis/lang/ga"
	_ "github.com/blevesearch/bleve/analysis/lang/gl"
	_ "github.com/blevesearch/bleve/analysis/lang/hi"
	_ "github.com/blevesearch/bleve/analysis/lang/hu"
	_ "github.com/blevesearch/bleve/analysis/lang/hy"
	_ "github.com/blevesearch/bleve/analysis/lang/id"
	_ "github.com/blevesearch/bleve/analysis/lang/in"
	_ "github.com/blevesearch/bleve/analysis/lang/it"
	_ "github.com/blevesearch/bleve/analysis/lang/nl"
	_ "github.com/blevesearch/bleve/analysis/lang/no"
	_ "github.com/blevesearch/bleve/analysis/lang/pt"
	_ "github.com/blevesearch/bleve/analysis/lang/ro"
	_ "github.com/blevesearch/bleve/analysis/lang/ru"
	_ "github.com/blevesearch/bleve/analysis/lang/sv"
	_ "github.com/blevesearch/bleve/analysis/lang/tr"
)

const (
	defaultBasenameAnalyzer = standard.Name
	defaultContentAnalyzer  = en.AnalyzerName
)

var (
	BleveIndexPath = ""
	BatchSize      = 2000
)

type BleveServer struct {
	Router       views.Handler
	Engine       bleve.Index
	IndexContent bool

	basenameAnalyzer string
	contentAnalyzer  string

	batch   *bleve.Batch
	inserts chan *tree.IndexableNode
	deletes chan string
	done    chan bool
	closed  chan bool
}

func NewBleveEngine(indexContent bool, configs map[string]interface{}) (*BleveServer, error) {

	if BleveIndexPath == "" {
		return nil, fmt.Errorf("please setup BleveIndexPath before opening engine")
	}
	bnA, cA, er := extractConfigs(configs)
	if er != nil {
		return nil, er
	}
	_, e := os.Stat(BleveIndexPath)
	var index bleve.Index
	var err error
	if e == nil {
		index, err = bleve.Open(BleveIndexPath)
	} else {
		index, err = createIndex(BleveIndexPath, bnA, cA)
	}
	if err != nil {
		return nil, err
	}
	server := &BleveServer{
		Engine:           index,
		IndexContent:     indexContent,
		basenameAnalyzer: bnA,
		contentAnalyzer:  cA,
		inserts:          make(chan *tree.IndexableNode),
		deletes:          make(chan string),
		done:             make(chan bool, 1),
	}
	go server.watchOperations()
	return server, nil
}

func (s *BleveServer) watchOperations() {
	batch := NewBatch(BatchOptions{IndexContent: s.IndexContent})
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
		case <-s.done:
			batch.Flush(s.Engine)
			s.Engine.Close()
			return
		}
	}
}

func createIndex(indexPath string, bnAna, cAna string) (bleve.Index, error) {

	mapping := bleve.NewIndexMapping()
	nodeMapping := bleve.NewDocumentMapping()
	mapping.AddDocumentMapping("node", nodeMapping)

	// Path to keyword
	pathFieldMapping := bleve.NewTextFieldMapping()
	pathFieldMapping.Analyzer = keyword.Name
	nodeMapping.AddFieldMappingsAt("Path", pathFieldMapping)

	bnameFieldMapping := bleve.NewTextFieldMapping()
	bnameFieldMapping.Analyzer = bnAna //standard.Name
	nodeMapping.AddFieldMappingsAt("Basename", bnameFieldMapping)

	// Node type to keyword
	nodeType := bleve.NewTextFieldMapping()
	nodeType.Analyzer = keyword.Name
	nodeMapping.AddFieldMappingsAt("NodeType", nodeType)

	// Extension to keyword
	extType := bleve.NewTextFieldMapping()
	extType.Analyzer = keyword.Name
	nodeMapping.AddFieldMappingsAt("Extension", extType)

	// Modification Time as Date
	modifTime := bleve.NewDateTimeFieldMapping()
	nodeMapping.AddFieldMappingsAt("ModifTime", modifTime)

	// GeoPoint
	geoPosition := bleve.NewGeoPointFieldMapping()
	nodeMapping.AddFieldMappingsAt("GeoPoint", geoPosition)

	// Text Content
	textContent := bleve.NewTextFieldMapping()
	textContent.Analyzer = cAna // en.AnalyzerName
	textContent.Store = false
	textContent.IncludeInAll = false
	nodeMapping.AddFieldMappingsAt("TextContent", textContent)

	return bleve.NewUsing(indexPath, mapping, scorch.Name, boltdb.Name, nil)

}

func (s *BleveServer) Close() error {
	close(s.done)
	return nil
}

func extractConfigs(conf map[string]interface{}) (basenameAnalyzer, contentAnalyzer string, e error) {

	basenameAnalyzer = defaultBasenameAnalyzer
	contentAnalyzer = defaultContentAnalyzer

	if conf == nil {
		return
	}
	_, tt := registry.AnalyzerTypesAndInstances()

	if bA, o := conf["basenameAnalyzer"]; o && bA != "" {
		var found bool
		for _, t := range tt {
			if t == bA.(string) {
				basenameAnalyzer = bA.(string)
				found = true
				break
			}
		}
		if !found {
			e = fmt.Errorf("basename analyzer code %s is not registered", bA)
		}
	}

	if cA, o := conf["contentAnalyzer"]; o && cA != "" {
		var found bool
		for _, t := range tt {
			if t == cA.(string) {
				contentAnalyzer = cA.(string)
				found = true
				break
			}
		}
		if !found {
			e = fmt.Errorf("content analyzer code %s is not registered", cA)
		}
	}
	return
}

func (s *BleveServer) IndexNode(c context.Context, n *tree.Node, reloadCore bool, excludes map[string]struct{}) error {

	if n.GetUuid() == "" {
		return fmt.Errorf("missing uuid")
	}
	iNode := &tree.IndexableNode{
		Node:       *n,
		ReloadCore: reloadCore,
		ReloadNs:   !reloadCore,
	}
	s.inserts <- iNode

	return nil
}

func (s *BleveServer) DeleteNode(c context.Context, n *tree.Node) error {

	s.deletes <- n.GetUuid()
	return nil

}

func (s *BleveServer) ClearIndex(ctx context.Context) error {
	s.done <- true
	// Make sure it's properly closed...
	<-time.After(1 * time.Second)
	if e := os.RemoveAll(BleveIndexPath); e != nil {
		return e
	}
	index, e := createIndex(BleveIndexPath, s.basenameAnalyzer, s.contentAnalyzer)
	if e != nil {
		return e
	}
	s.Engine = index
	go s.watchOperations()
	return nil
}

func (s *BleveServer) SearchNodes(c context.Context, queryObject *tree.Query, from int32, size int32, resultChan chan *tree.Node, doneChan chan bool) error {

	boolean := bleve.NewBooleanQuery()
	// FileName
	if len(queryObject.GetFileName()) > 0 {
		if s.basenameAnalyzer == defaultBasenameAnalyzer {
			wCard := bleve.NewWildcardQuery("*" + strings.Trim(strings.ToLower(queryObject.GetFileName()), "*") + "*")
			wCard.SetField("Basename")
			boolean.AddMust(wCard)
		} else {
			wCard := bleve.NewMatchQuery(queryObject.GetFileName())
			wCard.Analyzer = s.basenameAnalyzer
			wCard.SetField("Basename")
			boolean.AddMust(wCard)
		}
	}
	// TextContent
	if len(queryObject.GetContent()) > 0 {
		cQuery := bleve.NewMatchQuery(queryObject.GetContent())
		cQuery.Analyzer = s.contentAnalyzer
		cQuery.SetField("TextContent")
		boolean.AddMust(cQuery)
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
	if e := queryObject.ParseDurationDate(); e != nil {
		return e
	}
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
		extQuery := bleve.NewTermQuery(strings.ToLower(queryObject.Extension))
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
	searchRequest.Fields = []string{"Uuid", "Path", "NodeType", "Basename"}
	searchResult, err := s.Engine.SearchInContext(c, searchRequest)
	if err != nil {
		doneChan <- true
		return err
	}
	log.Logger(c).Info("SearchObjects", zap.Any("total results", searchResult.Total))
	for _, hit := range searchResult.Hits {
		node := &tree.Node{}
		if u, ok := hit.Fields["Uuid"]; ok {
			node.Uuid = u.(string)
		}
		if p, ok := hit.Fields["Path"]; ok {
			node.Path = p.(string)
		}
		if b, ok := hit.Fields["Basename"]; ok {
			node.SetMeta("name", b.(string))
		}
		if t, ok := hit.Fields["NodeType"]; ok {
			if t.(string) == "file" {
				node.Type = tree.NodeType_LEAF
			} else if t.(string) == "folder" {
				node.Type = tree.NodeType_COLLECTION
			}
		}
		/*
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
		*/

		log.Logger(c).Debug("SearchObjects", zap.Any("node", node))

		resultChan <- node
	}

	doneChan <- true
	return nil

}
