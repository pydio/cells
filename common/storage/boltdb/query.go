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

package boltdb

import (
	"fmt"
	"strings"

	"github.com/PaesslerAG/gval"
	"github.com/PaesslerAG/jsonpath"
	bleve "github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/search/query"

	"github.com/pydio/cells/v5/common/errors"
)

// BleveQueryToJSONPath transforms a Blevesearch query string to a JSONPath query
func BleveQueryToJSONPath(queryString string, rootSelector string, insensitive bool, fieldTransformer func(string) string, computeLength bool) (gval.Evaluable, string, error) {
	q, e := bleve.NewQueryStringQuery(queryString).Parse()
	if e != nil {
		return nil, "", e
	}
	var parts []string
	var out string
	if bQ, o := q.(*query.BooleanQuery); o {
		if cj := bQ.Must; cj != nil {
			ff := uniqueQueryToFilters(cj, fieldTransformer, insensitive, false)
			parts = append(parts, ff...)
		}
		if dj := bQ.Should; dj != nil {
			ff := uniqueQueryToFilters(dj, fieldTransformer, insensitive, false)
			parts = append(parts, ff...)
		}
		if mn := bQ.MustNot; mn != nil {
			ff := uniqueQueryToFilters(mn, fieldTransformer, insensitive, true)
			parts = append(parts, ff...)
		}
	}
	out = fmt.Sprintf("%s[?(%s)]", rootSelector, strings.Join(parts, " && "))
	if computeLength {
		out = "length(" + out + ")"
	}

	// Define a custom function for calculating length
	lengthFunc := gval.Function("length", func(arguments ...interface{}) (interface{}, error) {
		if len(arguments) != 1 {
			return nil, errors.New("length function expects exactly one argument")
		}
		switch v := arguments[0].(type) {
		case []interface{}:
			return len(v), nil
		case string:
			return len(v), nil
		default:
			return nil, errors.New("unsupported type for length function")
		}
	})

	// Create a Gval expression language with custom operators
	language := gval.NewLanguage(
		jsonpath.Language(),
		gval.Full(),
		lengthFunc,
	)
	jp, er := language.NewEvaluable(out)
	return jp, out, er
}

func line(fieldName, comparator string, value any, not ...bool) string {
	var zeline string
	switch v := value.(type) {
	case int64, int, uint64, uint, uint32:
		zeline = fmt.Sprintf("@.%s%s%d", fieldName, comparator, v.(int32))
	case float32, float64:
		zeline = fmt.Sprintf("@.%s%s%.f", fieldName, comparator, v)
	default:
		zeline = fmt.Sprintf("@.%s%s\"%v\"", fieldName, comparator, value)
	}
	if len(not) > 0 && not[0] {
		zeline = "not(" + zeline + ")"
	}
	return zeline
}

// uniqueQueryToFilters recursively parses bleve queries to create mongo filters
func uniqueQueryToFilters(m query.Query, fieldTransformer func(string) string, insensitive bool, not bool) (filters []string) {

	switch v := m.(type) {
	case *query.ConjunctionQuery:
		for _, sm := range v.Conjuncts {
			sfilters := uniqueQueryToFilters(sm, fieldTransformer, insensitive, not)
			filters = append(filters, sfilters...)
		}
	case *query.DisjunctionQuery:
		var ors []string
		for _, sm := range v.Disjuncts {
			sfilters := uniqueQueryToFilters(sm, fieldTransformer, insensitive, not)
			ors = append(ors, sfilters...)
		}
		if len(ors) > 1 {
			if not {
				filters = append(filters, "("+strings.Join(ors, " && ")+")")
			} else {
				filters = append(filters, "("+strings.Join(ors, " || ")+")")
			}
		} else if len(ors) == 1 {
			filters = append(filters, ors...)
		}
	case *query.WildcardQuery:
		wc := v.Wildcard
		rx := ""
		if !strings.HasPrefix(wc, "*") {
			rx += "^"
		}
		rx += strings.Trim(wc, "*")
		if !strings.HasSuffix(wc, "*") {
			rx += "$"
		}
		fieldName := fieldTransformer(v.Field())
		if wc == "T*" { // Special case for boolean query
			if not {
				filters = append(filters, line(fieldName, "=", "false"))
			} else {
				filters = append(filters, line(fieldName, "=", "true"))
			}
		} else if insensitive {
			// not working
			//filters = append(filters, line(fieldName, "=~", "/"+rx+"/i", not))
			filters = append(filters, line(fieldName, "=~", rx, not))
		} else {
			filters = append(filters, line(fieldName, "=~", rx, not))
		}
	case *query.MatchQuery:
		match := v.Match
		fName := fieldTransformer(v.Field())
		if strings.HasPrefix(match, "[") && strings.HasSuffix(match, "]") {
			if not {
				filters = append(filters, line(fName, "nin", match)) // [?(@.size in ['S', 'M'])]
			} else {
				filters = append(filters, line(fName, "in", match))
			}
		} else {
			if not {
				filters = append(filters, line(fName, "!=", match))
			} else {
				filters = append(filters, line(fName, "==", match))
			}
		}
	case *query.MatchPhraseQuery:
		fieldName := fieldTransformer(v.Field())
		phrase := strings.Trim(v.MatchPhrase, "\"")
		if strings.Contains(phrase, "*") {
			rx := ""
			if !strings.HasPrefix(phrase, "*") {
				rx += "^"
			}
			rx += strings.Trim(phrase, "*")
			if !strings.HasSuffix(phrase, "*") {
				rx += "$"
			}
			if insensitive {
				//filters = append(filters, line(fieldName, "=~", "/"+rx+"/i", not))
				filters = append(filters, line(fieldName, "=~", rx, not))
			} else {
				filters = append(filters, line(fieldName, "=~", rx, not))
			}
		} else {
			if not {
				filters = append(filters, line(fieldName, "!=", phrase))
			} else {
				filters = append(filters, line(fieldName, "==", phrase))
			}
		}
	case *query.NumericRangeQuery:
		if v.Min != nil {
			ref := " > "
			if v.InclusiveMin != nil && *v.InclusiveMin {
				ref = " >= "
			}
			filters = append(filters, line(fieldTransformer(v.Field()), ref, *v.Min, not))
		}
		if v.Max != nil {
			ref := " < "
			if v.InclusiveMax != nil && *v.InclusiveMax {
				ref = " <= "
			}
			filters = append(filters, line(fieldTransformer(v.Field()), ref, *v.Max, not))
		}
	}
	return
}
