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

package mongodb

import (
	"strings"

	bleve "github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/search/query"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type BleveFieldTransformerFunc func(string, query.Query, bool) (string, []bson.E, bool)

// BleveQueryToMongoFilters parses a Blevesearch query string to a slice of bson primitives
func BleveQueryToMongoFilters(queryString string, insensitive bool, fieldTransformer BleveFieldTransformerFunc) (filters []bson.E, err error) {
	q, e := bleve.NewQueryStringQuery(queryString).Parse()
	if e != nil {
		return nil, e
	}
	if bQ, o := q.(*query.BooleanQuery); o {
		if cj := bQ.Must; cj != nil {
			ff := uniqueQueryToFilters(cj, fieldTransformer, insensitive, false)
			filters = append(filters, ff...)
		}
		if dj := bQ.Should; dj != nil {
			ff := uniqueQueryToFilters(dj, fieldTransformer, insensitive, false)
			filters = append(filters, ff...)
		}
		if mn := bQ.MustNot; mn != nil {
			ff := uniqueQueryToFilters(mn, fieldTransformer, insensitive, true)
			filters = append(filters, ff...)
		}
	}

	return
}

// uniqueQueryToFilters recursively parses bleve queries to create mongo filters
func uniqueQueryToFilters(m query.Query, fieldTransformer BleveFieldTransformerFunc, insensitive bool, not bool) (filters []bson.E) {
	switch v := m.(type) {
	case *query.ConjunctionQuery:
		for _, sm := range v.Conjuncts {
			sfilters := uniqueQueryToFilters(sm, fieldTransformer, insensitive, not)
			filters = append(filters, sfilters...)
		}
	case *query.DisjunctionQuery:
		ors := bson.A{}
		for _, sm := range v.Disjuncts {
			sfilters := uniqueQueryToFilters(sm, fieldTransformer, insensitive, not)
			ors = append(ors, sfilters)
		}
		if len(ors) > 0 {
			if not {
				filters = append(filters, bson.E{Key: "$and", Value: ors})
			} else {
				filters = append(filters, bson.E{Key: "$or", Value: ors})
			}
		}
	case *query.WildcardQuery:
		fName, ff, transformed := fieldTransformer(v.Field(), v, not)
		if transformed {
			filters = append(filters, ff...)
			break
		}
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
			filters = append(filters, bson.E{Key: fName, Value: true})
		} else if insensitive {
			filters = append(filters, bson.E{Key: fName, Value: primitive.Regex{Pattern: regexp, Options: "i"}})
		} else {
			filters = append(filters, bson.E{Key: fName, Value: primitive.Regex{Pattern: regexp}})
		}
	case *query.MatchQuery:
		fName, ff, transformed := fieldTransformer(v.Field(), v, not)
		if transformed {
			filters = append(filters, ff...)
			break
		}
		match := v.Match
		if strings.HasPrefix(match, "[") && strings.HasSuffix(match, "]") {
			arr := strings.Split(strings.Trim(match, "[]"), ",")
			vals := bson.A{}
			for _, v := range arr {
				vals = append(vals, v)
			}
			if not {
				filters = append(filters, bson.E{Key: fName, Value: bson.M{"$nin": vals}})
			} else {
				filters = append(filters, bson.E{Key: fName, Value: bson.M{"$in": vals}})
			}
		} else {
			if not {
				filters = append(filters, bson.E{Key: fName, Value: bson.M{"$ne": v.Match}})
			} else {
				filters = append(filters, bson.E{Key: fName, Value: v.Match})
			}
		}
	case *query.MatchPhraseQuery:
		fName, ff, transformed := fieldTransformer(v.Field(), v, not)
		if transformed {
			filters = append(filters, ff...)
			break
		}
		phrase := strings.Trim(v.MatchPhrase, "\"")
		if !strings.Contains(phrase, "*") && strings.Contains(phrase, " ") {
			phrase = "*" + phrase + "*"
		}
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
				filters = append(filters, bson.E{Key: fName, Value: primitive.Regex{Pattern: regexp, Options: "i"}})
			} else {
				filters = append(filters, bson.E{Key: fName, Value: primitive.Regex{Pattern: regexp}})
			}
		} else {
			filters = append(filters, bson.E{Key: fName, Value: phrase})
		}
	case *query.NumericRangeQuery:
		fName, ff, transformed := fieldTransformer(v.Field(), v, not)
		if transformed {
			filters = append(filters, ff...)
			break
		}
		if v.Min != nil {
			ref := "$gt"
			if v.InclusiveMin != nil && *v.InclusiveMin {
				ref = "$gte"
			}
			filters = append(filters, bson.E{Key: fName, Value: bson.M{ref: v.Min}})
		}
		if v.Max != nil {
			ref := "$lt"
			if v.InclusiveMax != nil && *v.InclusiveMax {
				ref = "$lte"
			}
			filters = append(filters, bson.E{Key: fName, Value: bson.M{ref: v.Max}})
		}
	}
	return
}
