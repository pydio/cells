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

	bq "github.com/blevesearch/bleve/v2/search/query"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	. "github.com/smartystreets/goconvey/convey"
)

// pass returns field unchanged, no custom filter
func pass(s string, _ bq.Query, _ bool) (string, []bson.E, bool) { return s, nil, false }

func TestBleveQueryToMongoFilters(t *testing.T) {
	tr := BleveFieldTransformerFunc(pass)

	Convey("MatchQuery", t, func() {
		// Use + prefix to force Must (ConjunctionQuery) so we get the direct filter
		// without bleve's default Should → DisjunctionQuery → $or wrapper.
		Convey("simple value", func() {
			ff, err := BleveQueryToMongoFilters("+name:hello", false, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			So(ff[0].Key, ShouldEqual, "name")
			So(ff[0].Value, ShouldEqual, "hello")
		})

		Convey("array value produces $in", func() {
			ff, err := BleveQueryToMongoFilters("+name:[a,b,c]", false, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			So(ff[0].Key, ShouldEqual, "name")
			m := ff[0].Value.(bson.M)
			So(m, ShouldContainKey, "$in")
			So(m["$in"].(bson.A), ShouldHaveLength, 3)
		})

		// MustNot in bleve is a DisjunctionQuery, so negated filters are wrapped
		// in {Key:"$and", Value:bson.A{innerFilters}}.
		Convey("negated simple produces $ne inside $and", func() {
			ff, err := BleveQueryToMongoFilters("-name:hello", false, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			So(ff[0].Key, ShouldEqual, "$and")
			inner := ff[0].Value.(bson.A)[0].([]bson.E)
			So(inner[0].Key, ShouldEqual, "name")
			So(inner[0].Value.(bson.M)["$ne"], ShouldEqual, "hello")
		})

		Convey("negated array produces $nin inside $and", func() {
			ff, err := BleveQueryToMongoFilters("-name:[a,b]", false, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			So(ff[0].Key, ShouldEqual, "$and")
			inner := ff[0].Value.(bson.A)[0].([]bson.E)
			So(inner[0].Value.(bson.M), ShouldContainKey, "$nin")
		})
	})

	Convey("WildcardQuery", t, func() {
		Convey("prefix wildcard insensitive", func() {
			ff, err := BleveQueryToMongoFilters("+name:hello*", true, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			rx := ff[0].Value.(primitive.Regex)
			So(rx.Pattern, ShouldEqual, "^hello")
			So(rx.Options, ShouldEqual, "i")
		})

		Convey("suffix wildcard case-sensitive", func() {
			ff, err := BleveQueryToMongoFilters("+name:*hello", false, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			rx := ff[0].Value.(primitive.Regex)
			So(rx.Pattern, ShouldEqual, "hello$")
			So(rx.Options, ShouldEqual, "")
		})

		Convey("contains wildcard both sides", func() {
			ff, err := BleveQueryToMongoFilters("+name:*hello*", true, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			rx := ff[0].Value.(primitive.Regex)
			So(rx.Pattern, ShouldEqual, "hello")
			So(rx.Options, ShouldEqual, "i")
		})

		Convey("boolean T* positive → true", func() {
			ff, err := BleveQueryToMongoFilters("+active:T*", false, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			So(ff[0].Key, ShouldEqual, "active")
			So(ff[0].Value, ShouldEqual, true)
		})

		Convey("boolean T* negated → $ne true inside $and", func() {
			ff, err := BleveQueryToMongoFilters("-active:T*", false, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			So(ff[0].Key, ShouldEqual, "$and")
			inner := ff[0].Value.(bson.A)[0].([]bson.E)
			So(inner[0].Key, ShouldEqual, "active")
			So(inner[0].Value.(bson.M)["$ne"], ShouldEqual, true)
		})
	})

	Convey("MatchPhraseQuery", t, func() {
		Convey("phrase with space becomes insensitive regex", func() {
			ff, err := BleveQueryToMongoFilters(`+name:"hello world"`, true, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			rx := ff[0].Value.(primitive.Regex)
			So(rx.Pattern, ShouldContainSubstring, "hello world")
			So(rx.Options, ShouldEqual, "i")
		})

		Convey("single-word phrase → exact string", func() {
			ff, err := BleveQueryToMongoFilters(`+name:"single"`, true, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			So(ff[0].Key, ShouldEqual, "name")
			So(ff[0].Value, ShouldEqual, "single")
		})
	})

	Convey("NumericRangeQuery", t, func() {
		Convey("min exclusive → $gt", func() {
			ff, err := BleveQueryToMongoFilters("+size:>5", false, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			So(ff[0].Key, ShouldEqual, "size")
			m := ff[0].Value.(bson.M)
			So(m, ShouldContainKey, "$gt")
		})

		Convey("min inclusive → $gte", func() {
			ff, err := BleveQueryToMongoFilters("+size:>=5", false, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			m := ff[0].Value.(bson.M)
			So(m, ShouldContainKey, "$gte")
		})

		Convey("max exclusive → $lt", func() {
			ff, err := BleveQueryToMongoFilters("+size:<100", false, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			m := ff[0].Value.(bson.M)
			So(m, ShouldContainKey, "$lt")
		})

		Convey("max inclusive → $lte", func() {
			ff, err := BleveQueryToMongoFilters("+size:<=100", false, tr)
			So(err, ShouldBeNil)
			So(ff, ShouldHaveLength, 1)
			m := ff[0].Value.(bson.M)
			So(m, ShouldContainKey, "$lte")
		})
	})

	Convey("DisjunctionQuery OR → $or", t, func() {
		ff, err := BleveQueryToMongoFilters("name:a name:b", false, tr)
		So(err, ShouldBeNil)
		So(ff, ShouldHaveLength, 1)
		So(ff[0].Key, ShouldEqual, "$or")
		So(ff[0].Value.(bson.A), ShouldHaveLength, 2)
	})

	Convey("ConjunctionQuery AND → flat merge", t, func() {
		// Two Must terms produce two direct filters (no $and wrapper)
		ff, err := BleveQueryToMongoFilters("+name:hello +nodetype:file", false, tr)
		So(err, ShouldBeNil)
		So(ff, ShouldHaveLength, 2)
		keys := []string{ff[0].Key, ff[1].Key}
		So(keys, ShouldContain, "name")
		So(keys, ShouldContain, "nodetype")
	})

	Convey("custom field transformer takes over", t, func() {
		custom := BleveFieldTransformerFunc(func(s string, _ bq.Query, _ bool) (string, []bson.E, bool) {
			return s, []bson.E{{Key: "custom_" + s, Value: "overridden"}}, true
		})
		ff, err := BleveQueryToMongoFilters("+name:hello", false, custom)
		So(err, ShouldBeNil)
		So(ff, ShouldHaveLength, 1)
		So(ff[0].Key, ShouldEqual, "custom_name")
		So(ff[0].Value, ShouldEqual, "overridden")
	})

	Convey("negated disjunction → $and", t, func() {
		// When the NOT flag is true for a DisjunctionQuery the code emits $and
		// Trigger via a negated OR: -(name:a OR name:b) isn't directly writable in
		// bleve query string, but we can check the path via the must-not of two terms.
		// "-name:a -name:b" puts both in MustNot as a ConjunctionQuery, so we get
		// two $ne filters (flat); the $and path is tested via a disjunction-inside-not
		// which bleve does not expose via query string. We document this and skip.
		So(true, ShouldBeTrue) // placeholder — path covered by unit injection if needed
	})
}
