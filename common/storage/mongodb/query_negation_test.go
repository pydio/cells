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
	"testing"

	"github.com/blevesearch/bleve/v2/search/query"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	. "github.com/smartystreets/goconvey/convey"
)

// assertFreeStringFilters checks the BSON wire representation, including regex types.
func assertFreeStringFilters(t *testing.T, input string, insensitive bool, want bson.D) {
	t.Helper()
	identity := func(s string, _ query.Query, _ bool) (string, []bson.E, bool) { return s, nil, false }
	filters, err := BleveQueryToMongoFilters(input, insensitive, identity)
	So(err, ShouldBeNil)
	data, err := bson.Marshal(bson.D(filters))
	So(err, ShouldBeNil)
	var got bson.D
	So(bson.Unmarshal(data, &got), ShouldBeNil)
	So(got, ShouldResemble, want)
}

func TestFreeStringWildcardNegation(t *testing.T) {
	Convey("Prefix wildcard - case sensitive", t, func() {
		value := primitive.Regex{Pattern: "^/INFECTED/", Options: ""}
		assertFreeStringFilters(t, `+path:/INFECTED/*`, false, bson.D{{Key: "path", Value: value}})
		assertFreeStringFilters(t, `-path:/INFECTED/*`, false, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: value}}}},
		}}})
	})

	Convey("Prefix wildcard - case insensitive", t, func() {
		value := primitive.Regex{Pattern: "^/INFECTED/", Options: "i"}
		assertFreeStringFilters(t, `+path:/INFECTED/*`, true, bson.D{{Key: "path", Value: value}})
		assertFreeStringFilters(t, `-path:/INFECTED/*`, true, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: value}}}},
		}}})
	})

	Convey("Contains wildcard - case sensitive", t, func() {
		value := primitive.Regex{Pattern: "/recycle_bin/", Options: ""}
		assertFreeStringFilters(t, `+path:*/recycle_bin/*`, false, bson.D{{Key: "path", Value: value}})
		assertFreeStringFilters(t, `-path:*/recycle_bin/*`, false, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: value}}}},
		}}})
	})

	Convey("Contains wildcard - case insensitive", t, func() {
		value := primitive.Regex{Pattern: "/recycle_bin/", Options: "i"}
		assertFreeStringFilters(t, `+path:*/recycle_bin/*`, true, bson.D{{Key: "path", Value: value}})
		assertFreeStringFilters(t, `-path:*/recycle_bin/*`, true, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: value}}}},
		}}})
	})

	Convey("Suffix wildcard - case sensitive", t, func() {
		value := primitive.Regex{Pattern: "/INFECTED/$", Options: ""}
		assertFreeStringFilters(t, `+path:*/INFECTED/`, false, bson.D{{Key: "path", Value: value}})
		assertFreeStringFilters(t, `-path:*/INFECTED/`, false, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: value}}}},
		}}})
	})

	Convey("Suffix wildcard - case insensitive", t, func() {
		value := primitive.Regex{Pattern: "/INFECTED/$", Options: "i"}
		assertFreeStringFilters(t, `+path:*/INFECTED/`, true, bson.D{{Key: "path", Value: value}})
		assertFreeStringFilters(t, `-path:*/INFECTED/`, true, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: value}}}},
		}}})
	})

}

func TestFreeStringPhraseNegation(t *testing.T) {
	Convey("Quoted wildcard - case sensitive", t, func() {
		value := primitive.Regex{Pattern: "^/INFECTED/", Options: ""}
		assertFreeStringFilters(t, `+path:"/INFECTED/*"`, false, bson.D{{Key: "path", Value: value}})
		assertFreeStringFilters(t, `-path:"/INFECTED/*"`, false, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: value}}}},
		}}})
	})

	Convey("Quoted wildcard - case insensitive", t, func() {
		value := primitive.Regex{Pattern: "^/INFECTED/", Options: "i"}
		assertFreeStringFilters(t, `+path:"/INFECTED/*"`, true, bson.D{{Key: "path", Value: value}})
		assertFreeStringFilters(t, `-path:"/INFECTED/*"`, true, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: value}}}},
		}}})
	})

	Convey("Quoted phrase with spaces - case sensitive", t, func() {
		value := primitive.Regex{Pattern: "hello world", Options: ""}
		assertFreeStringFilters(t, `+name:"hello world"`, false, bson.D{{Key: "name", Value: value}})
		assertFreeStringFilters(t, `-name:"hello world"`, false, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "name", Value: bson.D{{Key: "$not", Value: value}}}},
		}}})
	})

	Convey("Quoted phrase with spaces - case insensitive", t, func() {
		value := primitive.Regex{Pattern: "hello world", Options: "i"}
		assertFreeStringFilters(t, `+name:"hello world"`, true, bson.D{{Key: "name", Value: value}})
		assertFreeStringFilters(t, `-name:"hello world"`, true, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "name", Value: bson.D{{Key: "$not", Value: value}}}},
		}}})
	})

	Convey("Quoted exact value - case sensitive", t, func() {
		value := "/INFECTED/"
		assertFreeStringFilters(t, `+path:"/INFECTED/"`, false, bson.D{{Key: "path", Value: value}})
		assertFreeStringFilters(t, `-path:"/INFECTED/"`, false, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "path", Value: bson.D{{Key: "$ne", Value: value}}}},
		}}})
	})

	Convey("Quoted exact value - case insensitive", t, func() {
		value := "/INFECTED/"
		assertFreeStringFilters(t, `+path:"/INFECTED/"`, true, bson.D{{Key: "path", Value: value}})
		assertFreeStringFilters(t, `-path:"/INFECTED/"`, true, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "path", Value: bson.D{{Key: "$ne", Value: value}}}},
		}}})
	})

}

func TestFreeStringExistingNegation(t *testing.T) {
	Convey("Boolean negation matches false or missing values", t, func() {
		assertFreeStringFilters(t, "-active:T*", true, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "active", Value: bson.D{{Key: "$ne", Value: true}}}},
		}}})
	})

	Convey("Unquoted exact negation uses $ne", t, func() {
		assertFreeStringFilters(t, "-Uuid:docID1", true, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "Uuid", Value: bson.D{{Key: "$ne", Value: "docID1"}}}},
		}}})
	})

	Convey("List negation uses $nin", t, func() {
		assertFreeStringFilters(t, "-name:[a,b]", true, bson.D{{Key: "$and", Value: bson.A{
			bson.D{{Key: "name", Value: bson.D{{Key: "$nin", Value: bson.A{"a", "b"}}}}},
		}}})
	})

}

func TestFreeStringNegationPreservesTransformerOverride(t *testing.T) {
	Convey("Wildcard negation delegates to the custom field transformer", t, func() {
		calls := 0
		transform := func(field string, _ query.Query, not bool) (string, []bson.E, bool) {
			calls++
			So(field, ShouldEqual, "name")
			So(not, ShouldBeTrue)
			return "custom", []bson.E{{Key: "custom", Value: "handled"}}, true
		}
		filters, err := BleveQueryToMongoFilters(`-name:hello*`, true, transform)
		So(err, ShouldBeNil)
		So(calls, ShouldEqual, 1)
		So(filters, ShouldResemble, []bson.E{{Key: "$and", Value: bson.A{
			[]bson.E{{Key: "custom", Value: "handled"}},
		}}})
	})

	Convey("Phrase negation delegates to the custom field transformer", t, func() {
		calls := 0
		transform := func(field string, _ query.Query, not bool) (string, []bson.E, bool) {
			calls++
			So(field, ShouldEqual, "name")
			So(not, ShouldBeTrue)
			return "custom", []bson.E{{Key: "custom", Value: "handled"}}, true
		}
		filters, err := BleveQueryToMongoFilters(`-name:"hello world"`, true, transform)
		So(err, ShouldBeNil)
		So(calls, ShouldEqual, 1)
		So(filters, ShouldResemble, []bson.E{{Key: "$and", Value: bson.A{
			[]bson.E{{Key: "custom", Value: "handled"}},
		}}})
	})

	Convey("Exact phrase negation delegates to the custom field transformer", t, func() {
		calls := 0
		transform := func(field string, _ query.Query, not bool) (string, []bson.E, bool) {
			calls++
			So(field, ShouldEqual, "name")
			So(not, ShouldBeTrue)
			return "custom", []bson.E{{Key: "custom", Value: "handled"}}, true
		}
		filters, err := BleveQueryToMongoFilters(`-name:"hello"`, true, transform)
		So(err, ShouldBeNil)
		So(calls, ShouldEqual, 1)
		So(filters, ShouldResemble, []bson.E{{Key: "$and", Value: bson.A{
			[]bson.E{{Key: "custom", Value: "handled"}},
		}}})
	})

}
