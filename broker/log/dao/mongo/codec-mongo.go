/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package mongo

import (
	"fmt"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v4/broker/log"
	"github.com/pydio/cells/v4/common/storage/mongodb"
	"github.com/pydio/cells/v4/common/utils/configx"
)

func init() {
	log.Drivers.Register(NewMongoDAO)
}

const mongoCollection = "syslog"

func NewMongoDAO(m *mongodb.Indexer) log.MessageRepository {
	m.SetCollection(mongoCollection)
	m.SetCodex(&MongoCodec{})
	return log.NewIndexRepository(m)
}

type MongoCodec struct {
	log.BaseCodec
}

func (m *MongoCodec) Unmarshal(indexed interface{}) (interface{}, error) {
	cursor, ok := indexed.(*mongo.Cursor)
	if !ok {
		return nil, fmt.Errorf("not a cursor")
	}
	ilog := &log.IndexableLog{}
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
