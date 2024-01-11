package log

import (
	"fmt"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/utils/configx"
)

const mongoCollection = "syslog"

type MongoCodec struct {
	baseCodec
}

func (m *MongoCodec) Unmarshal(indexed interface{}) (interface{}, error) {
	cursor, ok := indexed.(*mongo.Cursor)
	if !ok {
		return nil, fmt.Errorf("not a cursor")
	}
	ilog := &IndexableLog{}
	if er := cursor.Decode(ilog); er != nil {
		return nil, er
	}
	return ilog.LogMessage, nil
}

func (m *MongoCodec) BuildQuery(query interface{}, offset, limit int32, sortFields string, sortDesc bool) (interface{}, interface{}, error) {
	qString, ok := query.(string)
	if !ok {
		return nil, nil, fmt.Errorf("BuildQuery expects a string")
	}
	ff, e := mongodb.BleveQueryToMongoFilters(qString, true, func(s string) string {
		return strings.ToLower(s)
	})
	if e != nil {
		return nil, nil, e
	}
	return ff, nil, nil
}

func (m *MongoCodec) BuildQueryOptions(query interface{}, offset, limit int32, sortFields string, sortDesc bool) (interface{}, error) {
	opts := &options.FindOptions{Sort: bson.D{{"ts", -1}, {"nano", -1}}}
	if limit > 0 {
		l64 := int64(limit)
		opts.Limit = &l64
	}
	if offset > 0 {
		o64 := int64(offset)
		opts.Skip = &o64
	}
	return opts, nil
}

func (m *MongoCodec) GetModel(sc configx.Values) (interface{}, bool) {
	model := mongodb.Model{
		Collections: []mongodb.Collection{
			{
				Name: mongoCollection,
				DefaultCollation: mongodb.Collation{
					Strength: 2,
					Locale:   "en_US",
				},
				Indexes: []map[string]int{
					{"ts": -1, "nano": -1},
					{"msg": 1},
					{"service": 1},
					{"level": 1},
					{"logger": 1},
					{"username": 1},
					{"operationuuid": 1},
				},
				TruncateSorterDesc: "ts",
			},
		}}
	return model, true
}
