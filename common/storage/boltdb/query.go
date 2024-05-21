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
	"regexp"
	"strings"

	"github.com/PaesslerAG/gval"
	"github.com/PaesslerAG/jsonpath"
	bleve "github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/search/query"
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
			return nil, fmt.Errorf("length function expects exactly one argument")
		}
		switch v := arguments[0].(type) {
		case []interface{}:
			return len(v), nil
		case string:
			return len(v), nil
		default:
			return nil, fmt.Errorf("unsupported type for length function")
		}
	})

	regexpMatch := gval.InfixOperator("=~", func(a, b interface{}) (interface{}, error) {
		str, ok := a.(string)
		if !ok {
			return nil, fmt.Errorf("left operand must be a string")
		}
		pattern, ok := b.(string)
		if !ok {
			return nil, fmt.Errorf("right operand must be a string")
		}
		matched, err := regexp.MatchString(pattern, str)
		if err != nil {
			return nil, err
		}
		return matched, nil
	})
	// Create a Gval expression language with custom operators
	language := gval.NewLanguage(
		jsonpath.Language(),
		lengthFunc,
		regexpMatch,
		gval.InfixOperator("&&", func(a, b interface{}) (interface{}, error) {
			return a.(bool) && b.(bool), nil
		}),
		gval.InfixOperator("||", func(a, b interface{}) (interface{}, error) {
			return a.(bool) || b.(bool), nil
		}),
	)
	jp, er := language.NewEvaluable(out)
	return jp, out, er
}

func line(fieldName, comparator string, value any, not ...bool) string {
	var zeline string
	switch value.(type) {
	case int64:
		zeline = fmt.Sprintf("@.%s%s%v", fieldName, comparator, value)
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
		regexp := ""
		if !strings.HasPrefix(wc, "*") {
			regexp += "^"
		}
		regexp += strings.Trim(wc, "*")
		if !strings.HasSuffix(wc, "*") {
			regexp += "$"
		}
		fieldName := fieldTransformer(v.Field())
		if wc == "T*" { // Special case for boolean query
			if not {
				filters = append(filters, line(fieldName, "=", "false"))
			} else {
				filters = append(filters, line(fieldName, "=", "true"))
			}
		} else if insensitive {
			filters = append(filters, line(fieldName, "=~", "/"+regexp+"/i", not))
		} else {
			filters = append(filters, line(fieldName, "=~", regexp, not))
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
			regexp := ""
			if !strings.HasPrefix(phrase, "*") {
				regexp += "^"
			}
			regexp += strings.Trim(phrase, "*")
			if !strings.HasSuffix(phrase, "*") {
				regexp += "$"
			}
			if insensitive {
				filters = append(filters, line(fieldName, "=~", "/"+regexp+"/i", not))
			} else {
				filters = append(filters, line(fieldName, "=~", regexp, not))
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
			ref := ">"
			if v.InclusiveMin != nil && *v.InclusiveMin {
				ref = ">="
			}
			filters = append(filters, line(fieldTransformer(v.Field()), ref, v.Min, not))
		}
		if v.Max != nil {
			ref := "<"
			if v.InclusiveMax != nil && *v.InclusiveMax {
				ref = "<="
			}
			filters = append(filters, line(fieldTransformer(v.Field()), ref, v.Max, not))
		}
	}
	return
}
