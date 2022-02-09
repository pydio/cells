/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package dao

import (
	"context"
	"fmt"
	"go.mongodb.org/mongo-driver/x/bsonx"
	"strings"

	"github.com/blevesearch/bleve/v2"
	query2 "github.com/blevesearch/bleve/v2/search/query"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type mongodb struct {
	conn *mongo.Client
}

func (m *mongodb) Open(dsn string) (Conn, error) {

	// Create a new client and connect to the server
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(dsn))
	if err != nil {
		return nil, err
	}

	if err := client.Ping(context.Background(), readpref.Primary()); err != nil {
		return nil, err
	}
	fmt.Println("Successfully connected and pinged.")

	m.conn = client

	return client, nil

}

func (m *mongodb) GetConn() Conn {
	return m.conn
}

func (m *mongodb) SetMaxConnectionsForWeight(num int) {
	// Not implemented
}

// BleveQueryToMongoFilters parses a Blevesearch query string to a slice of bson primitives
func BleveQueryToMongoFilters(queryString string, insensitive bool, fieldTransformer func(string) string) (filters []bson.E, err error) {
	q, e := bleve.NewQueryStringQuery(queryString).Parse()
	if e != nil {
		return nil, e
	}
	if bQ, o := q.(*query2.BooleanQuery); o {
		if cj, o2 := bQ.Must.(*query2.ConjunctionQuery); o2 {
			for _, m := range cj.Conjuncts {
				switch v := m.(type) {
				case *query2.WildcardQuery:
					wc := v.Wildcard
					regexp := ""
					if !strings.HasPrefix(wc, "*") {
						regexp += "^"
					}
					regexp += strings.Trim(wc, "*")
					if !strings.HasSuffix(wc, "*") {
						regexp += "$"
					}
					if insensitive {
						filters = append(filters, bson.E{Key: fieldTransformer(v.Field()), Value: bson.M{"$regex": bsonx.Regex(regexp, "i")}})
					} else {
						filters = append(filters, bson.E{Key: fieldTransformer(v.Field()), Value: bson.M{"$regex": regexp}})
					}
				case *query2.MatchQuery:
					filters = append(filters, bson.E{Key: fieldTransformer(v.Field()), Value: v.Match})
				case *query2.MatchPhraseQuery:
					phrase := strings.Trim(v.MatchPhrase, "\"")
					if strings.Contains(phrase, "*") {
						regexp := ""
						if !strings.HasPrefix(phrase, "*") {
							regexp += "^"
						}
						regexp += strings.Trim(phrase, "*")
						if !strings.HasSuffix(phrase, "*") {
							regexp += "$"
						}
						if insensitive {
							filters = append(filters, bson.E{Key: fieldTransformer(v.Field()), Value: bson.M{"$regex": bsonx.Regex(regexp, "i")}})
						} else {
							filters = append(filters, bson.E{Key: fieldTransformer(v.Field()), Value: bson.M{"$regex": regexp}})
						}
					} else {
						filters = append(filters, bson.E{Key: fieldTransformer(v.Field()), Value: phrase})
					}
				case *query2.NumericRangeQuery:
					if v.Min != nil {
						ref := "$gt"
						if v.InclusiveMin != nil && *v.InclusiveMin {
							ref = "$gte"
						}
						filters = append(filters, bson.E{Key: fieldTransformer(v.Field()), Value: bson.M{ref: v.Min}})
					}
					if v.Max != nil {
						ref := "$lt"
						if v.InclusiveMax != nil && *v.InclusiveMax {
							ref = "$lte"
						}
						filters = append(filters, bson.E{Key: fieldTransformer(v.Field()), Value: bson.M{ref: v.Max}})
					}
				}
			}
		}
	}

	return
}
