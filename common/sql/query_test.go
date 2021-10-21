/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package sql

import (
	"testing"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/service/proto"
)

type fakeConverter struct{}

func (*fakeConverter) Convert(any *any.Any) (string, bool) {
	return "CONVERTED", true
}

func TestQuery_String(t *testing.T) {

	marshalled1 := &any.Any{}
	marshalled2 := &any.Any{}
	marshalled3 := &any.Any{}

	Convey("Simplest Case", t, func() {

		enquirer := &service.Query{
			SubQueries: []*any.Any{marshalled1},
			Operation:  service.OperationType_AND,
		}

		query := NewDAOQuery(enquirer, new(fakeConverter))

		s := query.String()
		So(s, ShouldEqual, "CONVERTED")

	})

	Convey("Multiple Case AND", t, func() {

		enquirer := &service.Query{
			SubQueries: []*any.Any{marshalled1, marshalled2},
			Operation:  service.OperationType_AND,
		}

		query := NewDAOQuery(enquirer, new(fakeConverter))

		s := query.String()
		So(s, ShouldEqual, "(CONVERTED) AND (CONVERTED)")

	})

	Convey("Multiple Case OR", t, func() {

		enquirer := &service.Query{
			SubQueries: []*any.Any{marshalled1, marshalled2},
			Operation:  service.OperationType_OR,
		}

		query := NewDAOQuery(enquirer, new(fakeConverter))

		s := query.String()
		So(s, ShouldEqual, "(CONVERTED) OR (CONVERTED)")

	})

	Convey("Nested Cases OR", t, func() {

		enquirerNested := &service.Query{
			SubQueries: []*any.Any{marshalled1, marshalled2},
			Operation:  service.OperationType_AND,
		}
		subQ, _ := ptypes.MarshalAny(enquirerNested)

		enquirer := &service.Query{
			SubQueries: []*any.Any{subQ, marshalled3},
			Operation:  service.OperationType_OR,
		}

		query := NewDAOQuery(enquirer, new(fakeConverter))

		s := query.String()
		So(s, ShouldEqual, "((CONVERTED) AND (CONVERTED)) OR (CONVERTED)")

	})

	Convey("Nested Cases AND", t, func() {

		enquirerNested := &service.Query{
			SubQueries: []*any.Any{marshalled1, marshalled2},
			Operation:  service.OperationType_OR,
		}
		subQ, _ := ptypes.MarshalAny(enquirerNested)

		enquirer := &service.Query{
			SubQueries: []*any.Any{subQ, marshalled3},
			Operation:  service.OperationType_AND,
		}

		query := NewDAOQuery(enquirer, new(fakeConverter))

		s := query.String()
		So(s, ShouldEqual, "((CONVERTED) OR (CONVERTED)) AND (CONVERTED)")

	})

}

func TestGetQueryValueFor(t *testing.T) {

	Convey("Empty value", t, func() {

		s := GetQueryValueFor("field")
		So(s, ShouldEqual, "")

	})

	Convey("Simple value", t, func() {

		s := GetQueryValueFor("field", "value1")
		So(s, ShouldEqual, "field='value1'")

	})

	Convey("Dedup values", t, func() {

		s := GetQueryValueFor("field", "value1", "value1")
		So(s, ShouldEqual, "field='value1'")

	})

	Convey("Multiple values", t, func() {

		s := GetQueryValueFor("field", "value1", "value2")
		So(s, ShouldEqual, "field in ('value1','value2')")

	})

	Convey("Multiple values deduped", t, func() {

		s := GetQueryValueFor("field", "value1", "value2", "value1")
		So(s, ShouldEqual, "field in ('value1','value2')")

	})

	Convey("Wildcard value", t, func() {

		s := GetQueryValueFor("field", "value*")
		So(s, ShouldEqual, "field LIKE 'value%'")

		s = GetQueryValueFor("field", "*value*")
		So(s, ShouldEqual, "field LIKE '%value%'")

		s = GetQueryValueFor("field", "*value")
		So(s, ShouldEqual, "field LIKE '%value'")

	})

}
