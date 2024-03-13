package mongo

import (
	"fmt"
	"strings"
	"time"

	"github.com/blevesearch/bleve/v2/geo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/nodes/meta"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/configx"
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

type mongoBucket struct {
	BucketID interface{} `bson:"_id"`
	Count    int32       `bson:"count"`
}

type Codex struct {
	bucketFacets    map[string][]map[interface{}]*tree.SearchFacet
	QueryNsProvider *meta.NsProvider
	QueryConfigs    configx.Values
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
		return &result.Node, nil
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

// BuildQuery builds a mongo filter plus an Aggregation Pipeline to be performed for computing facets
func (m *Codex) BuildQuery(query interface{}, offset, limit int32) (interface{}, interface{}, error) {
	var filters []bson.E

	queryObject := query.(*tree.Query)
	if term := queryObject.GetFileNameOrContent(); term != "" && term != "*" {
		// add weight on basename ?
		filters = append(filters, bson.E{"$or", bson.A{
			bson.M{"basename": bson.M{"$regex": primitive.Regex{Pattern: term, Options: "i"}}},
			bson.M{"text_content": bson.M{"$regex": primitive.Regex{Pattern: term, Options: "i"}}},
		}})
	} else {
		if bn := queryObject.GetFileName(); bn != "" {
			filters = append(filters, bson.E{"basename", bson.M{"$regex": primitive.Regex{Pattern: bn, Options: "i"}}})
		}
		if cn := queryObject.GetContent(); cn != "" {
			filters = append(filters, bson.E{"text_content", bson.M{"$regex": primitive.Regex{Pattern: cn, Options: "i"}}})
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
			ors = append(ors, bson.M{"path": bson.M{"$regex": primitive.Regex{Pattern: "^" + pa + "$", Options: "i"}}})
		}
		filters = append(filters, bson.E{Key: "$or", Value: ors})

	} else if len(queryObject.PathPrefix) > 0 {
		ors := bson.A{}
		for _, prefix := range queryObject.PathPrefix {
			ors = append(ors, bson.M{"path": bson.M{"$regex": primitive.Regex{Pattern: "^" + prefix, Options: "i"}}})
		}
		filters = append(filters, bson.E{Key: "$or", Value: ors})
	}

	if queryObject.Type > 0 {
		nodeType := "file"
		if queryObject.Type == 2 {
			nodeType = "folder"
		}
		filters = append(filters, bson.E{"node_type", nodeType})
	}
	if queryObject.Extension != "" {
		filters = append(filters, bson.E{"extension", strings.ToLower(queryObject.Extension)})
	}

	if queryObject.FreeString != "" {
		if freeFilters, er := mongodb.BleveQueryToMongoFilters(queryObject.FreeString, true, func(s string) string {
			if s == "Basename" {
				return "basename"
			}
			return strings.Replace(s, "Meta.", "meta.", 1)
		}); er == nil {
			filters = append(filters, freeFilters...)
		}

	}

	if queryObject.GeoQuery != nil {
		if queryObject.GeoQuery.Center != nil && len(queryObject.GeoQuery.Distance) > 0 {
			point := &tree.GeoJson{}
			point.Type = "Point"
			point.Coordinates = []float64{queryObject.GeoQuery.Center.Lon, queryObject.GeoQuery.Center.Lat}
			distance, er := geo.ParseDistance(queryObject.GeoQuery.Distance)
			if er != nil {
				return nil, nil, er
			}
			filters = append(filters, bson.E{"geo_json", bson.M{"$near": bson.M{"$geometry": point, "$maxDistance": distance}}})
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

	fDef = append(fDef, bson.E{"node_type", bson.A{bson.D{bson.E{"$sortByCount", "$node_type"}}}})
	fDef = append(fDef, bson.E{"extension", bson.A{bson.D{bson.E{"$sortByCount", "$extension"}}}})

	nss := m.QueryNsProvider.Namespaces()
	for metaName := range m.QueryNsProvider.IncludedIndexes() {
		def, _ := nss[metaName].UnmarshallDefinition()
		if def != nil && (def.GetType() == "integer" || def.GetType() == "boolean" || def.GetType() == "date") {
			continue
		}
		fieldName := "meta." + metaName
		fDef = append(fDef, bson.E{"meta-" + metaName, bson.A{bson.D{bson.E{"$sortByCount", "$" + fieldName}}}})
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
