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

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common"
)

func TestNodeMeta(t *testing.T) {

	Convey("Test Get Empty Meta String", t, func() {

		node := &Node{}
		meta := node.getMetaString("anynamespace")
		So(meta, ShouldNotBeNil)
		So(meta, ShouldBeEmpty)

	})

	Convey("Test Get Empty Meta JSON", t, func() {

		node := &Node{}
		meta := &struct{}{}
		err := node.GetMeta("anynamespace", meta)
		So(err, ShouldBeNil)
		So(meta, ShouldResemble, &struct{}{})

	})

	Convey("Test Set Meta String", t, func() {

		node := &Node{}
		node.setMetaString("namespace", "stringdata")
		node.setMetaString("namespace2", "stringdata2")
		meta := node.getMetaString("namespace")
		So(meta, ShouldEqual, "stringdata")

		meta2 := node.getMetaString("namespace2")
		So(meta2, ShouldEqual, "stringdata2")

	})

	Convey("Test Reset Meta by passing empty string", t, func() {

		node := &Node{}
		node.setMetaString("namespace", "stringdata")
		node.setMetaString("namespace2", "stringdata2")

		node.setMetaString("namespace", "")

		meta := node.getMetaString("namespace")
		So(meta, ShouldBeEmpty)

		meta2 := node.getMetaString("namespace2")
		So(meta2, ShouldEqual, "stringdata2")

	})

	Convey("Test Json Marshalling/Unmarshaling", t, func() {

		node := &Node{}
		inputStruct := &struct {
			TestString string  `json:"testString"`
			TestInt    float64 `json:"testInt"`
		}{
			TestString: "mystring",
			TestInt:    256,
		}
		node.MustSetMeta("jsondata", inputStruct)

		outputStuct := &struct {
			TestString string  `json:"testString"`
			TestInt    float64 `json:"testInt"`
		}{}

		e2 := node.GetMeta("jsondata", outputStuct)

		So(e2, ShouldBeNil)
		So(outputStuct, ShouldResemble, inputStruct)

		jsonString := node.getMetaString("jsondata")
		So(jsonString, ShouldEqual, `{"testString":"mystring","testInt":256}`)
	})

	Convey("Test node HasSource function", t, func() {

		node := &Node{}
		node.setMetaString(common.MetaNamespaceDatasourceName, "ds1")
		So(node.HasSource(), ShouldBeTrue)

	})

}
