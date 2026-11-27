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
	"testing"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/pydio/cells/v5/common/storage/mongodb"

	. "github.com/smartystreets/goconvey/convey"
)

func TestFreeStringPathMapping(t *testing.T) {
	Convey("Positive wildcard using Path targets the path document field", t, func() {
		codec := &Codex{}
		filters, err := mongodb.BleveQueryToMongoFilters(`+Path:/INFECTED/*`, true, codec.customMetaQueryCodex)
		So(err, ShouldBeNil)
		data, err := bson.Marshal(bson.D(filters))
		So(err, ShouldBeNil)
		var got bson.D
		So(bson.Unmarshal(data, &got), ShouldBeNil)
		So(got, ShouldResemble, bson.D{{Key: "path", Value: primitive.Regex{Pattern: "^/INFECTED/", Options: "i"}}})
	})

	Convey("Negated wildcard using Path targets the path document field", t, func() {
		codec := &Codex{}
		filters, err := mongodb.BleveQueryToMongoFilters(`-Path:/INFECTED/*`, true, codec.customMetaQueryCodex)
		So(err, ShouldBeNil)
		data, err := bson.Marshal(bson.D(filters))
		So(err, ShouldBeNil)
		var got bson.D
		So(bson.Unmarshal(data, &got), ShouldBeNil)
		So(got, ShouldResemble, bson.D{{Key: "$and", Value: bson.A{bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: primitive.Regex{Pattern: "^/INFECTED/", Options: "i"}}}}}}}})
	})

	Convey("Negated quoted wildcard using Path targets the path document field", t, func() {
		codec := &Codex{}
		filters, err := mongodb.BleveQueryToMongoFilters(`-Path:"/INFECTED/*"`, true, codec.customMetaQueryCodex)
		So(err, ShouldBeNil)
		data, err := bson.Marshal(bson.D(filters))
		So(err, ShouldBeNil)
		var got bson.D
		So(bson.Unmarshal(data, &got), ShouldBeNil)
		So(got, ShouldResemble, bson.D{{Key: "$and", Value: bson.A{bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: primitive.Regex{Pattern: "^/INFECTED/", Options: "i"}}}}}}}})
	})

	Convey("Negated quoted exact value using Path targets the path document field", t, func() {
		codec := &Codex{}
		filters, err := mongodb.BleveQueryToMongoFilters(`-Path:"/INFECTED/"`, true, codec.customMetaQueryCodex)
		So(err, ShouldBeNil)
		data, err := bson.Marshal(bson.D(filters))
		So(err, ShouldBeNil)
		var got bson.D
		So(bson.Unmarshal(data, &got), ShouldBeNil)
		So(got, ShouldResemble, bson.D{{Key: "$and", Value: bson.A{bson.D{{Key: "path", Value: bson.D{{Key: "$ne", Value: "/INFECTED/"}}}}}}})
	})

	Convey("Combined folder exclusions using Path targets the path document field", t, func() {
		codec := &Codex{}
		filters, err := mongodb.BleveQueryToMongoFilters(`-Path:/recycle_bin/* -Path:/INFECTED/*`, true, codec.customMetaQueryCodex)
		So(err, ShouldBeNil)
		data, err := bson.Marshal(bson.D(filters))
		So(err, ShouldBeNil)
		var got bson.D
		So(bson.Unmarshal(data, &got), ShouldBeNil)
		So(got, ShouldResemble, bson.D{{Key: "$and", Value: bson.A{bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: primitive.Regex{Pattern: "^/recycle_bin/", Options: "i"}}}}}, bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: primitive.Regex{Pattern: "^/INFECTED/", Options: "i"}}}}}}}})
	})

	Convey("Positive wildcard using path targets the path document field", t, func() {
		codec := &Codex{}
		filters, err := mongodb.BleveQueryToMongoFilters(`+path:/INFECTED/*`, true, codec.customMetaQueryCodex)
		So(err, ShouldBeNil)
		data, err := bson.Marshal(bson.D(filters))
		So(err, ShouldBeNil)
		var got bson.D
		So(bson.Unmarshal(data, &got), ShouldBeNil)
		So(got, ShouldResemble, bson.D{{Key: "path", Value: primitive.Regex{Pattern: "^/INFECTED/", Options: "i"}}})
	})

	Convey("Negated wildcard using path targets the path document field", t, func() {
		codec := &Codex{}
		filters, err := mongodb.BleveQueryToMongoFilters(`-path:/INFECTED/*`, true, codec.customMetaQueryCodex)
		So(err, ShouldBeNil)
		data, err := bson.Marshal(bson.D(filters))
		So(err, ShouldBeNil)
		var got bson.D
		So(bson.Unmarshal(data, &got), ShouldBeNil)
		So(got, ShouldResemble, bson.D{{Key: "$and", Value: bson.A{bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: primitive.Regex{Pattern: "^/INFECTED/", Options: "i"}}}}}}}})
	})

	Convey("Negated quoted wildcard using path targets the path document field", t, func() {
		codec := &Codex{}
		filters, err := mongodb.BleveQueryToMongoFilters(`-path:"/INFECTED/*"`, true, codec.customMetaQueryCodex)
		So(err, ShouldBeNil)
		data, err := bson.Marshal(bson.D(filters))
		So(err, ShouldBeNil)
		var got bson.D
		So(bson.Unmarshal(data, &got), ShouldBeNil)
		So(got, ShouldResemble, bson.D{{Key: "$and", Value: bson.A{bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: primitive.Regex{Pattern: "^/INFECTED/", Options: "i"}}}}}}}})
	})

	Convey("Negated quoted exact value using path targets the path document field", t, func() {
		codec := &Codex{}
		filters, err := mongodb.BleveQueryToMongoFilters(`-path:"/INFECTED/"`, true, codec.customMetaQueryCodex)
		So(err, ShouldBeNil)
		data, err := bson.Marshal(bson.D(filters))
		So(err, ShouldBeNil)
		var got bson.D
		So(bson.Unmarshal(data, &got), ShouldBeNil)
		So(got, ShouldResemble, bson.D{{Key: "$and", Value: bson.A{bson.D{{Key: "path", Value: bson.D{{Key: "$ne", Value: "/INFECTED/"}}}}}}})
	})

	Convey("Combined folder exclusions using path targets the path document field", t, func() {
		codec := &Codex{}
		filters, err := mongodb.BleveQueryToMongoFilters(`-path:/recycle_bin/* -path:/INFECTED/*`, true, codec.customMetaQueryCodex)
		So(err, ShouldBeNil)
		data, err := bson.Marshal(bson.D(filters))
		So(err, ShouldBeNil)
		var got bson.D
		So(bson.Unmarshal(data, &got), ShouldBeNil)
		So(got, ShouldResemble, bson.D{{Key: "$and", Value: bson.A{bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: primitive.Regex{Pattern: "^/recycle_bin/", Options: "i"}}}}}, bson.D{{Key: "path", Value: bson.D{{Key: "$not", Value: primitive.Regex{Pattern: "^/INFECTED/", Options: "i"}}}}}}}})
	})

}
