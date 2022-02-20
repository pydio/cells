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

package mongodb

import (
	"context"
	"fmt"
	"strings"

	"github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/search/query"
	"go.mongodb.org/mongo-driver/x/bsonx"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Collection struct {
	Name             string
	DefaultCollation Collation
	Indexes          []map[string]int
	IDName           string
}

type Collation struct {
	Locale   string
	Strength int
}

type Model struct {
	Collections []Collection
}

func (m Model) Init(ctx context.Context, db *mongo.Database) error {
	for _, col := range m.Collections {
		opts := &options.CreateCollectionOptions{}
		if col.DefaultCollation.Locale != "" {
			opts.Collation = &options.Collation{
				Locale:   col.DefaultCollation.Locale,
				Strength: col.DefaultCollation.Strength,
			}
		}
		if e := db.CreateCollection(ctx, col.Name, opts); e != nil {
			if _, ok := e.(mongo.CommandError); !ok {
				return e
			}
		} else {
			var models []mongo.IndexModel
			for _, model := range col.Indexes {
				keys := bson.D{}
				for key, sort := range model {
					if sort == 2 {
						keys = append(keys, primitive.E{Key: key, Value: "2dsphere"})
					} else {
						keys = append(keys, primitive.E{Key: key, Value: sort})
					}
				}
				models = append(models, mongo.IndexModel{Keys: keys})
				if _, e := db.Collection(col.Name).Indexes().CreateMany(ctx, models); e != nil {
					fmt.Println("Error while creating indexes", e)
				}
			}
		}
	}
	return nil
}

// uniqueQueryToFilters recursively parses bleve queries to create mongo filters
func uniqueQueryToFilters(m query.Query, fieldTransformer func(string) string, insensitive bool) (filters []bson.E) {
	switch v := m.(type) {
	case *query.ConjunctionQuery:
		for _, sm := range v.Conjuncts {
			sfilters := uniqueQueryToFilters(sm, fieldTransformer, insensitive)
			filters = append(filters, sfilters...)
		}
	case *query.DisjunctionQuery:
		ors := bson.A{}
		for _, sm := range v.Disjuncts {
			sfilters := uniqueQueryToFilters(sm, fieldTransformer, insensitive)
			ors = append(ors, sfilters)
		}
		if len(ors) > 0 {
			filters = append(filters, bson.E{Key: "$or", Value: ors})
		}
	case *query.WildcardQuery:
		wc := v.Wildcard
		regexp := ""
		if !strings.HasPrefix(wc, "*") {
			regexp += "^"
		}
		regexp += strings.Trim(wc, "*")
		if !strings.HasSuffix(wc, "*") {
			regexp += "$"
		}
		if wc == "T*" { // Special case for boolean query
			filters = append(filters, bson.E{Key: fieldTransformer(v.Field()), Value: true})
		} else if insensitive {
			filters = append(filters, bson.E{Key: fieldTransformer(v.Field()), Value: bson.M{"$regex": bsonx.Regex(regexp, "i")}})
		} else {
			filters = append(filters, bson.E{Key: fieldTransformer(v.Field()), Value: bson.M{"$regex": regexp}})
		}
	case *query.MatchQuery:
		filters = append(filters, bson.E{Key: fieldTransformer(v.Field()), Value: v.Match})
	case *query.MatchPhraseQuery:
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
	case *query.NumericRangeQuery:
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
	return
}

// BleveQueryToMongoFilters parses a Blevesearch query string to a slice of bson primitives
func BleveQueryToMongoFilters(queryString string, insensitive bool, fieldTransformer func(string) string) (filters []bson.E, err error) {
	q, e := bleve.NewQueryStringQuery(queryString).Parse()
	if e != nil {
		return nil, e
	}
	if bQ, o := q.(*query.BooleanQuery); o {
		if cj := bQ.Must; cj != nil {
			ff := uniqueQueryToFilters(cj, fieldTransformer, insensitive)
			filters = append(filters, ff...)
		}
		if dj := bQ.Should; dj != nil {
			ff := uniqueQueryToFilters(dj, fieldTransformer, insensitive)
			filters = append(filters, ff...)
		}
		// Todo : => handle MustNot case
	}

	return
}
