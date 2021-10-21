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

	"github.com/pydio/cells/common/utils/meta"

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

	inserts chan *tree.IndexableNode
	deletes chan string
	done    chan bool

	nsProvider *meta.NamespacesProvider
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

func (s *BleveServer) makeBaseNameField(term string, boost float64) query.Query {
	if s.basenameAnalyzer == defaultBasenameAnalyzer && !strings.Contains(term, " ") {
		term = strings.Trim(strings.ToLower(term), "* ")
		wCard := bleve.NewWildcardQuery("*" + term + "*")
		wCard.SetField("Basename")
		if boost > 0 {
			wCard.SetBoost(boost)
		}
		return wCard
	} else {
		wCard := bleve.NewMatchQuery(term)
		wCard.Analyzer = s.basenameAnalyzer
		wCard.SetField("Basename")
		if boost > 0 {
			wCard.SetBoost(boost)
		}
		return wCard
	}
}

func (s *BleveServer) makeContentField(term string) query.Query {
	cQuery := bleve.NewMatchQuery(term)
	cQuery.Analyzer = s.contentAnalyzer
	cQuery.SetField("TextContent")
	return cQuery
}

func (s *BleveServer) makeDateTimeFacet(field string) *bleve.FacetRequest {
	dateFacet := bleve.NewFacetRequest(field, 5)
	now := time.Now()
	last5 := now.Add(-5 * time.Minute)
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	dateFacet.AddDateTimeRange("date.moments", last5, now)
	dateFacet.AddDateTimeRange("date.today", today, last5)
	dateFacet.AddDateTimeRange("date.last.7", now.Add(-7*24*time.Hour), today)
	dateFacet.AddDateTimeRange("date.last.30", now.Add(-30*24*time.Hour), now.Add(-7*24*time.Hour))
	dateFacet.AddDateTimeRange("date.older.30", time.Time{}, now.Add(-30*24*time.Hour))
	return dateFacet
}

func (s *BleveServer) makeDateTimeFacetAsNum(field string) *bleve.FacetRequest {
	dateFacet := bleve.NewFacetRequest(field, 5)
	now := time.Now()
	last5 := now.Add(-5 * time.Minute)
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	d1 := float64(now.Unix())
	d2 := float64(last5.Unix())
	dateFacet.AddNumericRange("date.moments", &d2, &d1)
	d3 := float64(today.Unix())
	dateFacet.AddNumericRange("date.today", &d3, &d2)
	d4 := float64(now.Add(-7 * 24 * time.Hour).Unix())
	dateFacet.AddNumericRange("date.last.7", &d4, &d3)
	d5 := float64(now.Add(-30 * 24 * time.Hour).Unix())
	dateFacet.AddNumericRange("date.last.30", &d5, &d4)
	dateFacet.AddNumericRange("date.older.30", nil, &d5)
	return dateFacet
}

func (s *BleveServer) SearchNodes(c context.Context, queryObject *tree.Query, from int32, size int32, resultChan chan *tree.Node, facets chan *tree.SearchFacet, doneChan chan bool) error {

	boolean := bleve.NewBooleanQuery()
	if term := queryObject.GetFileNameOrContent(); term != "" {
		boolean.AddMust(bleve.NewDisjunctionQuery(s.makeBaseNameField(term, 5), s.makeContentField(term)))
	} else {
		if term := queryObject.GetFileName(); term != "" {
			boolean.AddMust(s.makeBaseNameField(term, 0))
		}
		if term := queryObject.GetContent(); term != "" {
			boolean.AddMust(s.makeContentField(term))
		}
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

	log.Logger(c).Debug("SearchObjects", zap.Any("query", boolean))
	searchRequest := bleve.NewSearchRequest(boolean)
	if size > 0 {
		searchRequest.Size = int(size)
	}
	searchRequest.From = int(from)
	searchRequest.Fields = []string{"Uuid", "Path", "NodeType", "Basename", "Size", "ModifTime"}
	searchRequest.IncludeLocations = true
	// Facet for node type
	searchRequest.AddFacet("Type", &bleve.FacetRequest{
		Field: "NodeType",
		Size:  2,
	})
	// Facet for node extension
	searchRequest.AddFacet("Extension", &bleve.FacetRequest{
		Field: "Extension",
		Size:  5,
	})
	// Facets by Size
	sizeFacet := bleve.NewFacetRequest("Size", 4)
	var s2, s3, s4 float64
	s2 = 1024 * 1024
	s3 = 1024 * 1024 * 10
	s4 = 1024 * 1024 * 100
	sizeFacet.AddNumericRange("size.lt.1MB", nil, &s2)
	sizeFacet.AddNumericRange("size.1MB.to.10MB", &s2, &s3)
	sizeFacet.AddNumericRange("size.10MB.to.100MB", &s3, &s4)
	sizeFacet.AddNumericRange("size.gt.100MB", &s4, nil)
	searchRequest.AddFacet("Size", sizeFacet)

	dateFacet := s.makeDateTimeFacet("ModifTime")
	searchRequest.AddFacet("Date", dateFacet)

	if s.nsProvider == nil {
		s.nsProvider = meta.NewNamespacesProvider()
	}
	nss := s.nsProvider.Namespaces()
	for metaName := range s.nsProvider.IncludedIndexes() {
		def, _ := nss[metaName].UnmarshallDefinition()
		if def != nil && (def.GetType() == "integer" || def.GetType() == "boolean" || def.GetType() == "date") {
			continue
		}
		metaFacet := bleve.NewFacetRequest("Meta."+metaName, 4)
		/*
			if def != nil && def.GetType() == "date" {
				// Replace with a date facet - Working, but client-side the facet is not handled properly yet
				fmt.Println("Replacing date facet")
				metaFacet = s.makeDateTimeFacetAsNum("Meta." + metaName)
			}
		*/
		searchRequest.AddFacet(metaName, metaFacet)

	}

	searchResult, err := s.Engine.SearchInContext(c, searchRequest)
	if err != nil {
		doneChan <- true
		return err
	}
	log.Logger(c).Debug("SearchObjects", zap.Any("total results", searchResult.Total))
	for _, f := range searchResult.Facets {
		for _, t := range f.Terms {
			if t.Term != "" {
				facets <- &tree.SearchFacet{
					FieldName: f.Field,
					Label:     t.Term,
					Count:     int32(t.Count),
				}
			}
		}
		for _, r := range f.NumericRanges {
			if r.Min != nil || r.Max != nil {
				nr := &tree.SearchFacet{
					FieldName: f.Field,
					Label:     r.Name,
					Count:     int32(r.Count),
				}
				if r.Min != nil {
					nr.Min = int64(*r.Min)
				}
				if r.Max != nil {
					nr.Max = int64(*r.Max)
				}
				facets <- nr
			}
		}
		for _, r := range f.DateRanges {
			if r.Start != nil || r.End != nil {
				dr := &tree.SearchFacet{
					FieldName: f.Field,
					Label:     r.Name,
					Count:     int32(r.Count),
				}
				if r.Start != nil {
					if start, e := time.Parse(time.RFC3339Nano, *r.Start); e == nil {
						dr.Start = int32(start.Unix())
					}
				}
				if r.End != nil {
					if end, e := time.Parse(time.RFC3339Nano, *r.End); e == nil {
						dr.End = int32(end.Unix())
					}
				}
				facets <- dr
			}
		}
	}

	// Manual facet gathering for fname / content
	basenameFacet := &tree.SearchFacet{FieldName: "Basename", Label: "found.basename", Count: 0}
	contentFacet := &tree.SearchFacet{FieldName: "TextContent", Label: "found.contents", Count: 0}

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
		if s, ok := hit.Fields["Size"]; ok {
			node.Size = int64(s.(float64))
		}
		if d, ok := hit.Fields["ModifTime"]; ok {
			s := d.(string)
			if mtime, e := time.Parse(time.RFC3339, s); e == nil {
				node.MTime = mtime.Unix()
			}
		}
		for k := range hit.Locations {
			if k == "TextContent" {
				node.SetMeta("document_content_hit", true)
				contentFacet.Count++
			} else if k == "Basename" {
				basenameFacet.Count++
			}
		}

		log.Logger(c).Debug("SearchObjects", zap.Any("node", node))

		resultChan <- node
	}

	if contentFacet.Count > 0 {
		facets <- contentFacet
	}
	if basenameFacet.Count > 0 {
		facets <- basenameFacet
	}

	doneChan <- true
	return nil

}
