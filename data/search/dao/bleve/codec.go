package bleve

import (
	"fmt"
	"strings"
	"time"

	bleve "github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/analysis/analyzer/keyword"
	"github.com/blevesearch/bleve/v2/analysis/analyzer/standard"
	"github.com/blevesearch/bleve/v2/analysis/lang/en"
	"github.com/blevesearch/bleve/v2/mapping"
	"github.com/blevesearch/bleve/v2/registry"
	"github.com/blevesearch/bleve/v2/search"
	"github.com/blevesearch/bleve/v2/search/query"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/nodes/meta"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/configx"

	_ "github.com/blevesearch/bleve/v2/analysis/lang/ar"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/bg"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/ca"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/cjk"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/ckb"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/cs"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/da"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/de"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/el"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/es"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/eu"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/fa"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/fi"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/fr"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/ga"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/gl"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/hi"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/hu"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/hy"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/id"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/in"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/it"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/nl"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/no"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/pt"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/ro"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/ru"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/sv"
	_ "github.com/blevesearch/bleve/v2/analysis/lang/tr"
)

const (
	defaultBasenameAnalyzer = standard.Name
	defaultContentAnalyzer  = en.AnalyzerName
)

var (
	validSortFields = map[string]string{
		tree.MetaSortName: "Basename",
		tree.MetaSortTime: "ModifTime",
		tree.MetaSortSize: "Size",
		tree.MetaSortType: "Type",
	}
)

type Codec struct {
	ResultBasenameFacetCount int32
	ResultContentFacetCount  int32

	queryConfig     configx.Values
	queryNSProvider *meta.NsProvider
}

func NewQueryCodec(values configx.Values, provider *meta.NsProvider) *Codec {
	return &Codec{
		queryConfig:     values,
		queryNSProvider: provider,
	}
}

func (b *Codec) Marshal(input interface{}) (interface{}, error) {
	// Input is already prepared, do nothing
	return input, nil
}

func (b *Codec) Unmarshal(indexed interface{}) (interface{}, error) {

	hit := indexed.(*search.DocumentMatch)
	node := &tree.Node{}
	if u, ok := hit.Fields["Uuid"]; ok {
		node.Uuid = u.(string)
	}
	if p, ok := hit.Fields["Path"]; ok {
		node.Path = p.(string)
	}
	if b, ok := hit.Fields["Basename"]; ok {
		node.MustSetMeta(common.MetaNamespaceNodeName, b.(string))
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
			node.MustSetMeta(common.MetaFlagDocumentContentHit, true)
			b.ResultContentFacetCount++
		} else if k == "Basename" {
			b.ResultBasenameFacetCount++
		}
	}
	return node, nil
}

func (b *Codec) UnmarshalFacet(data interface{}, facets chan interface{}) {

	f, ok := data.(*search.FacetResult)
	if !ok {
		return
	}

	if f.Terms != nil {
		for _, t := range f.Terms.Terms() {
			if t.Term != "" {
				facets <- &tree.SearchFacet{
					FieldName: f.Field,
					Label:     t.Term,
					Count:     int32(t.Count),
				}
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

func (b *Codec) FlushCustomFacets() (facets []interface{}) {
	if b.ResultContentFacetCount > 0 {
		facets = append(facets, &tree.SearchFacet{FieldName: "TextContent", Label: "found.contents", Count: b.ResultContentFacetCount})
	}
	if b.ResultBasenameFacetCount > 0 {
		facets = append(facets, &tree.SearchFacet{FieldName: "Basename", Label: "found.basename", Count: b.ResultBasenameFacetCount})
	}
	return
}

func (b *Codec) BuildQuery(qu interface{}, offset, limit int32, sortFields string, sortDesc bool) (interface{}, interface{}, error) {

	ba, ca, _ := b.extractConfigs(b.queryConfig)

	queryObject := qu.(*tree.Query)

	boolean := bleve.NewBooleanQuery()
	if term := queryObject.GetFileNameOrContent(); term != "" && term != "*" {
		boolean.AddMust(bleve.NewDisjunctionQuery(b.makeBaseNameField(term, 5, ba), b.makeContentField(term, ca)))
	} else {
		if term := queryObject.GetFileName(); term != "" && term != "*" {
			boolean.AddMust(b.makeBaseNameField(term, 0, ba))
		}
		if term := queryObject.GetContent(); term != "" && term != "*" {
			boolean.AddMust(b.makeContentField(term, ca))
		}
	}

	// File Size Range
	if queryObject.MinSize > 0 || queryObject.MaxSize > 0 {
		var mi = float64(queryObject.MinSize)
		var ma = float64(queryObject.MaxSize)
		var numRange *query.NumericRangeQuery
		if ma == 0 {
			numRange = bleve.NewNumericRangeQuery(&mi, nil)
		} else {
			numRange = bleve.NewNumericRangeQuery(&mi, &ma)
		}
		numRange.SetField("Size")
		boolean.AddMust(numRange)
	}
	// Date Range
	if e := queryObject.ParseDurationDate(); e != nil {
		return nil, nil, e
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

	// Limit to a set of Paths or to a SubTree (PathPrefix)
	if len(queryObject.Paths) > 0 {
		subQ := bleve.NewBooleanQuery()
		for _, pa := range queryObject.Paths {
			exact := bleve.NewMatchQuery(pa)
			exact.SetField("Path")
			subQ.AddShould(exact)
		}
		boolean.AddMust(subQ)
	} else if len(queryObject.PathPrefix) > 0 {
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

	if len(queryObject.UUIDs) > 1 {
		bQ := bleve.NewBooleanQuery()
		for _, u := range queryObject.UUIDs {
			tq := bleve.NewMatchQuery(u)
			// This is important to avoid retrieving uuids with similar parts.
			tq.SetOperator(query.MatchQueryOperatorAnd)
			tq.SetField("Uuid")
			bQ.AddShould(tq)
		}
		boolean.AddMust(bQ)
	} else if len(queryObject.UUIDs) == 1 {
		tq := bleve.NewMatchQuery(queryObject.UUIDs[0])
		// This is important to avoid retrieving uuids with similar parts.
		tq.SetOperator(query.MatchQueryOperatorAnd)
		tq.SetField("Uuid")
		boolean.AddMust(tq)
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

	searchRequest := bleve.NewSearchRequest(boolean)
	if limit > 0 {
		searchRequest.Size = int(limit)
	}
	searchRequest.From = int(offset)
	searchRequest.Fields = []string{"Uuid", "Path", "NodeType", "Basename", "Size", "ModifTime"}
	searchRequest.IncludeLocations = true

	// Handle sorting
	if sortFields != "" {
		var sorts []string
		for _, sf := range strings.Split(sortFields, ",") {
			if sortField, ok := validSortFields[strings.TrimSpace(sf)]; ok {
				if sortDesc {
					sorts = append(sorts, "-"+sortField)
				} else {
					sorts = append(sorts, "+"+sortField)
				}
			}
		}
		if len(sorts) > 0 {
			searchRequest.SortBy(sorts)
		}
	}

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

	dateFacet := b.makeDateTimeFacet("ModifTime")
	searchRequest.AddFacet("Date", dateFacet)

	nss := b.queryNSProvider.Namespaces()
	for metaName := range b.queryNSProvider.IncludedIndexes() {
		def, _ := nss[metaName].UnmarshallDefinition()
		if def != nil && (def.GetType() == "integer" || def.GetType() == "boolean" || def.GetType() == "date") {
			continue
		}
		metaFacet := bleve.NewFacetRequest("Meta."+metaName, 4)
		//if def != nil && def.GetType() == "date" {
		// Replace with a date facet - Working, but client-side the facet is not handled properly yet
		//	fmt.Println("Replacing date facet")
		//	metaFacet = s.makeDateTimeFacetAsNum("Meta." + metaName)
		//}
		searchRequest.AddFacet(metaName, metaFacet)

	}

	return searchRequest, nil, nil

}

func (b *Codec) GetModel(cfg configx.Values) (interface{}, bool) {

	ba, ca, _ := b.extractConfigs(cfg)

	nodeMapping := bleve.NewDocumentMapping()
	// Path to keyword
	pathFieldMapping := bleve.NewTextFieldMapping()
	pathFieldMapping.Analyzer = keyword.Name
	nodeMapping.AddFieldMappingsAt("Path", pathFieldMapping)

	bnameFieldMapping := bleve.NewTextFieldMapping()
	if ba != "" {
		bnameFieldMapping.Analyzer = ba //standard.Name
	}
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
	// Ignore GeoJson
	nodeMapping.AddFieldMappingsAt("GeoJson", &mapping.FieldMapping{
		Type:  "text",
		Name:  "GeoJson",
		Index: false,
		Store: false,
	})

	// Text Content
	textContent := bleve.NewTextFieldMapping()
	if ca != "" {
		textContent.Analyzer = ca // en.AnalyzerName
	}
	textContent.Store = false
	textContent.IncludeInAll = false
	nodeMapping.AddFieldMappingsAt("TextContent", textContent)

	return nodeMapping, true
}

func (b *Codec) extractConfigs(cfg configx.Values) (basenameAnalyzer, contentAnalyzer string, e error) {

	basenameAnalyzer = defaultBasenameAnalyzer
	contentAnalyzer = defaultContentAnalyzer

	_, tt := registry.AnalyzerTypesAndInstances()

	if bA := cfg.Val("BasenameAnalyzer").String(); bA != "" {
		var found bool
		for _, t := range tt {
			if t == bA {
				basenameAnalyzer = bA
				found = true
				break
			}
		}
		if !found {
			e = fmt.Errorf("basename analyzer code %s is not registered", bA)
		}
	}

	if cA := cfg.Val("ContentAnalyzer").String(); cA != "" {
		var found bool
		for _, t := range tt {
			if t == cA {
				contentAnalyzer = cA
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

func (b *Codec) makeBaseNameField(term string, boost float64, ba string) query.Query {
	if ba == defaultBasenameAnalyzer && !strings.Contains(term, " ") {
		term = strings.Trim(strings.ToLower(term), "* ")
		wCard := bleve.NewWildcardQuery("*" + term + "*")
		wCard.SetField("Basename")
		if boost > 0 {
			wCard.SetBoost(boost)
		}
		return wCard
	} else {
		wCard := bleve.NewMatchQuery(term)
		wCard.Analyzer = ba
		wCard.SetField("Basename")
		if boost > 0 {
			wCard.SetBoost(boost)
		}
		return wCard
	}
}

func (b *Codec) makeContentField(term string, ca string) query.Query {
	cQuery := bleve.NewMatchQuery(term)
	cQuery.Analyzer = ca
	cQuery.SetField("TextContent")
	return cQuery
}

func (b *Codec) makeDateTimeFacet(field string) *bleve.FacetRequest {
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

func (b *Codec) makeDateTimeFacetAsNum(field string) *bleve.FacetRequest {
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
