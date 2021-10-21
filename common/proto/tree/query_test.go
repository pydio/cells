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

package tree

import (
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"
)

func TestQuery_ParseDurationDate(t *testing.T) {

	Convey("Test tree.Query ParseDurationDate empty", t, func() {
		q := &Query{
			DurationDate: "",
		}
		e := q.ParseDurationDate()
		So(e, ShouldBeNil)
	})

	Convey("Test tree.Query ParseDurationDate invalid", t, func() {
		q := &Query{
			DurationDate: "10d",
		}
		e := q.ParseDurationDate()
		So(e, ShouldNotBeNil)
	})

	Convey("Test tree.Query ParseDurationDate >10d", t, func() {
		q := &Query{
			DurationDate: ">10d",
		}
		e := q.ParseDurationDate()
		So(e, ShouldBeNil)
		So(q.MaxDate, ShouldNotEqual, 0)
		So(q.MinDate, ShouldEqual, 0)
	})

	Convey("Test tree.Query ParseDurationDate <10d", t, func() {
		q := &Query{
			DurationDate: "<10d",
		}
		e := q.ParseDurationDate()
		So(e, ShouldBeNil)
		So(q.MinDate, ShouldNotEqual, 0)
		So(q.MaxDate, ShouldEqual, 0)
	})

	Convey("Test tree.Query ParseDurationDate >10d with Ref", t, func() {
		q := &Query{
			DurationDate: "<10d",
		}
		t := time.Now()
		t2 := t.Add(-10 * time.Hour * 24)
		e := q.ParseDurationDate(t)
		So(e, ShouldBeNil)
		So(q.MinDate, ShouldEqual, t2.Unix())
	})

}
