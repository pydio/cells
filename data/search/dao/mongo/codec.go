package mongo

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/blevesearch/bleve/v2/geo"
	query2 "github.com/blevesearch/bleve/v2/search/query"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common/nodes/meta"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/storage/indexer"
	"github.com/pydio/cells/v5/common/storage/mongodb"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/data/search"
	"github.com/pydio/cells/v5/data/search/dao/commons"
)

const (
	Collection = "index"
)

var staticBuckets = map[string][]map[interface{}]*tree.SearchFacet{
	"size": {
		{int32(0): &tree.SearchFacet{
			FieldName: "Size",
			Label:     "size.lt.1MB",
			Min:       0,
			Max:       1024 * 1024,
		}},
		{int64(1024 * 1024): &tree.SearchFacet{
			FieldName: "Size",
			Label:     "size.1MB.to.10MB",
			Min:       1024 * 1024,
			Max:       1024 * 1024 * 10,
		}},
		{int64(1024 * 1024 * 10): &tree.SearchFacet{
			FieldName: "Size",
			Label:     "size.10MB.to.100MB",
			Min:       1024 * 1024 * 10,
			Max:       1024 * 1024 * 100,
		}},
		{int64(1024 * 1024 * 100): &tree.SearchFacet{
			FieldName: "Size",
			Label:     "size.gt.100MB",
			Min:       1024 * 1024 * 100,
		}},
	},
}

var (
	validSortFields = map[string]string{
		tree.MetaSortName: "basename",
		tree.MetaSortTime: "modif_time",
		tree.MetaSortSize: "size",
		tree.MetaSortType: "node_type",
	}
)

func init() {
	search.Drivers.Register(NewMongoDAO)
}

func NewMongoDAO(ctx context.Context, v *mongodb.Indexer) search.Engine {
	v.SetCollection(Collection)
	v.SetCodex(&Codex{})
	return commons.NewServer(ctx, v, createQueryCodec)
}

func FastMongoDAO(ctx context.Context, v *mongodb.Indexer) search.Engine {
	v.SetCollection(Collection)
	v.SetCodex(&Codex{})
	return commons.NewServer(ctx, v, createQueryCodec, indexer.WithExpire(10*time.Millisecond))
}

func createQueryCodec(values configx.Values, metaProvider *meta.NsProvider) indexer.IndexCodex {
	return &Codex{
		QueryConfigs:    values,
		QueryNsProvider: metaProvider,
	}
}

type mongoBucket struct {
	BucketID interface{} `bson:"_id"`
	Count    int32       `bson:"count"`
}

type Codex struct {
	bucketFacets    map[string][]map[interface{}]*tree.SearchFacet
	QueryNsProvider *meta.NsProvider
	QueryConfigs    configx.Values
}

func (m *Codex) RequirePreCount() bool {
	return true
}

// Marshal does nothing here, input is already marshalled for indexing
func (m *Codex) Marshal(input interface{}) (interface{}, error) {
	return input, nil
}

// Unmarshal gets a mongo.Cursor for Decoding
func (m *Codex) Unmarshal(indexed interface{}) (interface{}, error) {
	cursor, ok := indexed.(*mongo.Cursor)
	if !ok {
		return nil, fmt.Errorf("Codex.Unmarshal: not a mongo cursor")
	}
	result := &tree.IndexableNode{}
	if e := cursor.Decode(result); e == nil {
		return result.Node, nil
	} else {
		return nil, e
	}
}

func (m *Codex) UnmarshalFacet(data interface{}, facets chan interface{}) {
	cursor, ok := data.(*mongo.Cursor)
	if !ok {
		return
	}
	ff := make(map[string][]*mongoBucket)
	if er := cursor.Decode(ff); er != nil {
		fmt.Println("Decode facet error", er)
		return
	}
	for key, bb := range ff {
		if bounds, ok := m.bucketFacets[key]; ok {
			for _, b := range bb {
				for _, defined := range bounds {
					if f, o := defined[b.BucketID]; o {
						facet := proto.Clone(f).(*tree.SearchFacet)
						facet.Count = b.Count
						facets <- facet
						break
					}
				}
			}
		} else {
			var fieldName string
			switch key {
			case "extension":
				fieldName = "Extension"
			case "node_type":
				fieldName = "NodeType"
			default:
				if strings.HasPrefix(key, "meta-") {
					fieldName = strings.Replace(key, "meta-", "Meta.", 1)
				}
			}
			if fieldName == "" {
				continue
			}
			for _, b := range bb {
				if term, ok := b.BucketID.(string); ok && term != "" {
					facets <- &tree.SearchFacet{
						FieldName: fieldName,
						Label:     term,
						Count:     b.Count,
					}
				}
			}
		}
	}
}

func (m *Codex) FlushCustomFacets() []interface{} {
	return nil
}

// BuildQueryOptions overrides basic range options with sortFields data
func (m *Codex) BuildQueryOptions(_ interface{}, offset, limit int32, sortFields string, sortDesc bool) (interface{}, error) {
	opts := &options.FindOptions{}
	if limit > 0 {
		l64 := int64(limit)
		opts.Limit = &l64
	}
	if offset > 0 {
		o64 := int64(offset)
		opts.Skip = &o64
	}
	if sortFields != "" {
		// Example: opts{Sort: bson.D{{"ts", -1}, {"nano", -1}}}
		nss := m.QueryNsProvider.Namespaces()
		var sorts []string
		for _, sf := range strings.Split(sortFields, ",") {
			sf = strings.TrimSpace(sf)
			if sortField, ok := validSortFields[sf]; ok {
				sorts = append(sorts, sortField)
			} else if _, ok2 := nss[sf]; ok2 {
				sorts = append(sorts, "meta."+sf)
			}
		}
		if len(sorts) > 0 {
			sorting := bson.D{}
			value := 1
			if sortDesc {
				value = -1
			}
			for _, key := range sorts {
				sorting = append(sorting, bson.E{Key: key, Value: value})
			}
			opts.Sort = sorting
		}
	}
	return opts, nil
}

func (m *Codex) regexTerm(term string) primitive.Regex {
	if term == "*" {
		return primitive.Regex{Pattern: ".*", Options: "i"}
	}
	pattern := strings.ReplaceAll(strings.Trim(term, " \""), " ", "[\\W_-]*")
	return primitive.Regex{Pattern: pattern, Options: "i"}
}

// customMetaQuery adds a specific parsing for Tags values
func (m *Codex) customMetaQueryCodex(s string, q query2.Query, not bool) (string, []bson.E, bool) {
	if s == "Basename" {

		return "basename", nil, false

	} else if s == "Uuid" {

		return "uuid", nil, false

	} else if strings.HasPrefix(s, "Meta.") {
		s = strings.TrimPrefix(s, "Meta.")
		finalMeta := "meta." + s
		nss := m.QueryNsProvider.TypedNamespaces()
		ns, ok := nss[s]
		if !ok || ns.GetType() != "tags" {
			return finalMeta, nil, false
		}
		switch qTyped := q.(type) {
		case *query2.MatchQuery:
			if vals := strings.Split(qTyped.Match, ","); len(vals) >= 1 {
				var filters []bson.E
				// For multiple values, replace by multiple regexes
				for _, part := range vals {
					tok := strings.TrimSpace(part)
					if tok == "" {
						continue
					}
					op := "$regex"
					re := primitive.Regex{Pattern: tok, Options: "i"}
					if not {
						op = "$not"
					}
					filters = append(filters, bson.E{
						Key:   finalMeta,
						Value: bson.M{op: re},
					})
				}
				return finalMeta, filters, true
			}
		default:
			return finalMeta, nil, false
		}
	}
	return s, nil, false
}

// BuildQuery builds a mongo filter plus an Aggregation Pipeline to be performed for computing facets.
// Range and sorting parameters are not handled here, but by BuildQueryOptions method.
func (m *Codex) BuildQuery(query interface{}, _, _ int32, _ string, _ bool) (interface{}, interface{}, error) {
	var filters []bson.E

	queryObject := query.(*tree.Query)
	if term := queryObject.GetFileNameOrContent(); term != "" {
		rx := m.regexTerm(term)
		filters = append(filters, bson.E{"$or", bson.A{
			bson.M{"basename": rx},
			bson.M{"text_content": rx},
		}})
	} else {
		if bn := queryObject.GetFileName(); bn != "" {
			filters = append(filters, bson.E{"basename", m.regexTerm(bn)})
		}
		if cn := queryObject.GetContent(); cn != "" {
			filters = append(filters, bson.E{"text_content", m.regexTerm(cn)})
		}
	}

	if queryObject.MinSize > 0 {
		filters = append(filters, bson.E{"size", bson.M{"$gte": queryObject.MinSize}})
	}
	if queryObject.MaxSize > 0 {
		filters = append(filters, bson.E{"size", bson.M{"$lte": queryObject.MaxSize}})
	}

	// Date Range
	if e := queryObject.ParseDurationDate(); e != nil {
		return nil, nil, e
	}

	if queryObject.MinDate > 0 {
		dt := primitive.NewDateTimeFromTime(time.Unix(queryObject.MinDate, 0))
		filters = append(filters, bson.E{"modif_time", bson.M{"$gte": dt}})
	}

	if queryObject.MaxDate > 0 {
		dt := primitive.NewDateTimeFromTime(time.Unix(queryObject.MaxDate, 0))
		filters = append(filters, bson.E{"modif_time", bson.M{"$lte": dt}})
	}

	// Limit to a set of Paths or to a SubTree (PathPrefix)
	if len(queryObject.Paths) > 0 {
		ors := bson.A{}
		for _, pa := range queryObject.Paths {
			ors = append(ors, bson.M{"path": primitive.Regex{Pattern: "^" + pa + "$", Options: "i"}})
		}
		filters = append(filters, bson.E{Key: "$or", Value: ors})

	} else if len(queryObject.PathPrefix) > 0 {
		ors := bson.A{}
		for _, prefix := range queryObject.PathPrefix {
			ors = append(ors, bson.M{"path": primitive.Regex{Pattern: "^" + prefix, Options: "i"}})
		}
		filters = append(filters, bson.E{Key: "$or", Value: ors})
	}

	if len(queryObject.ExcludedPathPrefix) > 0 {
		nors := bson.A{}
		for _, prefix := range queryObject.ExcludedPathPrefix {
			nors = append(nors, bson.M{"path": primitive.Regex{Pattern: "^" + prefix, Options: "i"}})
		}
		filters = append(filters, bson.E{Key: "$nor", Value: nors})
	}

	if queryObject.PathDepth > 0 {
		filters = append(filters, bson.E{Key: "path_depth", Value: queryObject.PathDepth})
	}

	if queryObject.Type > 0 {
		nodeType := "file"
		if queryObject.Type == 2 {
			nodeType = "folder"
		}
		filters = append(filters, bson.E{"node_type", nodeType})
	}

	if queryObject.Extension != "" {
		pp := strings.Split(strings.ReplaceAll(queryObject.Extension, "|", ","), ",")
		if len(pp) > 1 {
			ors := bson.A{}
			for _, ex := range pp {
				ors = append(ors, bson.D{{"extension", strings.ToLower(ex)}})
			}
			filters = append(filters, bson.E{"$or", ors})
		} else {
			filters = append(filters, bson.E{"extension", strings.ToLower(queryObject.Extension)})
		}
	}

	if len(queryObject.UUIDs) == 1 {
		filters = append(filters, bson.E{Key: "uuid", Value: queryObject.UUIDs[0]})
	} else if len(queryObject.UUIDs) > 1 {
		ors := bson.A{}
		for _, nodeId := range queryObject.UUIDs {
			ors = append(ors, bson.M{"uuid": nodeId})
		}
		filters = append(filters, bson.E{Key: "$or", Value: ors})
	}

	if queryObject.FreeString != "" {
		if freeFilters, er := mongodb.BleveQueryToMongoFilters(queryObject.FreeString, true, m.customMetaQueryCodex); er == nil {
			filters = append(filters, freeFilters...)
		}
	}

	if queryObject.GeoQuery != nil {
		if queryObject.GeoQuery.Center != nil && len(queryObject.GeoQuery.Distance) > 0 {
			distance, er := geo.ParseDistance(queryObject.GeoQuery.Distance)
			if er != nil {
				return nil, nil, er
			}
			filters = append(filters, bson.E{
				Key: "geo_json",
				Value: bson.M{
					"$geoWithin": bson.M{
						"$centerSphere": bson.A{
							[]float64{queryObject.GeoQuery.Center.Lon, queryObject.GeoQuery.Center.Lat},
							distance / 6378137.0, // convert meters to radians
						},
					},
				},
			})

		} else if queryObject.GeoQuery.TopLeft != nil && queryObject.GeoQuery.BottomRight != nil {
			type Polygon struct {
				Type        string        `bson:"type"`
				Coordinates [][][]float64 `bson:"coordinates"`
			}
			var coords [][]float64
			coords = append(coords, []float64{queryObject.GeoQuery.TopLeft.Lon, queryObject.GeoQuery.TopLeft.Lat})
			coords = append(coords, []float64{queryObject.GeoQuery.TopLeft.Lon, queryObject.GeoQuery.BottomRight.Lat})
			coords = append(coords, []float64{queryObject.GeoQuery.BottomRight.Lon, queryObject.GeoQuery.BottomRight.Lat})
			coords = append(coords, []float64{queryObject.GeoQuery.BottomRight.Lon, queryObject.GeoQuery.TopLeft.Lat})
			coords = append(coords, []float64{queryObject.GeoQuery.TopLeft.Lon, queryObject.GeoQuery.TopLeft.Lat})
			polygon := &Polygon{
				Type: "Polygon",
			}
			polygon.Coordinates = append(polygon.Coordinates, coords)
			filters = append(filters, bson.E{"geo_json", bson.M{"$geoWithin": bson.M{"$geometry": polygon}}})
		}
	}

	if queryObject.GeoQuery != nil {
		// We do not support Facets when using GeoQuery yet - May be possible using $geoNear aggregation stage ...
		return filters, nil, nil
	}

	matchAggr := bson.D{{"$match", filters}}
	m.prepareFacets()

	fDef := bson.D{}
	for fieldName, facetDefinition := range m.bucketFacets {
		boundaries := bson.A{}
		for _, bound := range facetDefinition {
			for key := range bound {
				boundaries = append(boundaries, key)
			}
		}
		bucketDef := bson.D{
			{"$bucket", bson.D{
				{"groupBy", "$" + fieldName},
				{"boundaries", boundaries},
				{"default", "unknown"},
				{"output", bson.D{
					{"count", bson.M{"$sum": 1}},
				}},
			}},
		}
		fDef = append(fDef, bson.E{fieldName, bson.A{bucketDef}})
	}

	fDef = append(fDef, bson.E{Key: "node_type", Value: bson.A{bson.D{bson.E{Key: "$sortByCount", Value: "$node_type"}}}})
	fDef = append(fDef, bson.E{Key: "extension", Value: bson.A{bson.D{bson.E{Key: "$sortByCount", Value: "$extension"}}}})

	for metaName, def := range m.QueryNsProvider.TypedNamespaces() {
		if !def.Indexable {
			continue
		}
		if def.GetType() == "integer" || def.GetType() == "boolean" || def.GetType() == "date" {
			continue
		}
		fieldName := "meta." + metaName
		fDef = append(fDef, bson.E{Key: "meta-" + metaName, Value: bson.A{bson.D{bson.E{Key: "$sortByCount", Value: "$" + fieldName}}}})
	}

	facets := bson.D{
		{"$facet", fDef},
	}

	aggregate := mongo.Pipeline{matchAggr, facets}

	return filters, aggregate, nil
}

// GetModel returns a mongodb.Model to be inserted in the db
func (m *Codex) GetModel(sc configx.Values) (interface{}, bool) {
	model := mongodb.Model{
		Collections: []mongodb.Collection{
			{
				Name: Collection,
				DefaultCollation: mongodb.Collation{
					Locale:   "en_US",
					Strength: 2,
				},
				Indexes: []map[string]int{
					{"basename": 1},
					{"uuid": 1},
					{"path": 1},
					{"text_content": 1},
					{"size": 1},
					{"modif_time": 1},
					{"extension": 1},
					{"node_type": 1},
					{"geo_json": 2}, // Special value for 2dsphere
					{"path_depth": 1},
				},
				IDName: "uuid",
			},
		},
	}
	return model, true
}

func (m *Codex) prepareFacets() {
	m.bucketFacets = make(map[string][]map[interface{}]*tree.SearchFacet)
	for name, facet := range staticBuckets {
		m.bucketFacets[name] = facet
	}
	// Compute dates
	now := time.Now()
	zero := primitive.NewDateTimeFromTime(time.Time{})
	last5minutes := primitive.NewDateTimeFromTime(now.Add(-5 * time.Minute))
	last7days := primitive.NewDateTimeFromTime(now.Add(-7 * 24 * time.Hour))
	last30days := primitive.NewDateTimeFromTime(now.Add(-30 * 24 * time.Hour))
	today := primitive.NewDateTimeFromTime(time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location()))
	m.bucketFacets["modif_time"] = []map[interface{}]*tree.SearchFacet{
		{zero: &tree.SearchFacet{
			FieldName: "ModifTime",
			Label:     "date.older.30",
			End:       int32(last30days.Time().Unix()),
		}},
		{last30days: &tree.SearchFacet{
			FieldName: "ModifTime",
			Label:     "date.last.30",
			Start:     int32(last30days.Time().Unix()),
			End:       int32(last7days.Time().Unix()),
		}},
		{last7days: &tree.SearchFacet{
			FieldName: "ModifTime",
			Label:     "date.last.7",
			Start:     int32(last7days.Time().Unix()),
			End:       int32(today.Time().Unix()),
		}},
		{today: &tree.SearchFacet{
			FieldName: "ModifTime",
			Label:     "date.today",
			Start:     int32(today.Time().Unix()),
			End:       int32(last5minutes.Time().Unix()),
		}},
		{last5minutes: &tree.SearchFacet{
			FieldName: "ModifTime",
			Label:     "date.moments",
			Start:     int32(last5minutes.Time().Unix()),
		}},
	}

}
