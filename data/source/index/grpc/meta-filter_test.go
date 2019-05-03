/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

package grpc

import (
	"testing"

	"github.com/pydio/cells/common/proto/tree"

	. "github.com/smartystreets/goconvey/convey"
)

func TestMetaFilter(t *testing.T) {
	Convey("Test int filters", t, func() {
		f := &MetaFilter{
			reqNode: &tree.Node{MetaStore: map[string]string{
				"time": `["<=100",">10"]`,
				"size": `["<=2000"]`,
			}},
		}
		So(f.parse(), ShouldBeTrue)
		n1 := &tree.Node{MTime: 100}
		n2 := &tree.Node{MTime: 10}
		n3 := &tree.Node{MTime: 11}
		n4 := &tree.Node{MTime: 101}
		So(f.Match("", n1), ShouldBeTrue)
		So(f.Match("", n2), ShouldBeFalse)
		So(f.Match("", n3), ShouldBeTrue)
		So(f.Match("", n4), ShouldBeFalse)

		n5 := &tree.Node{MTime: 50, Size: 2001}
		So(f.Match("", n5), ShouldBeFalse)

		f = &MetaFilter{
			reqNode: &tree.Node{MetaStore: map[string]string{
				"time": `["<=100",">10"]`,
				"size": `["<=2000"]`,
				"grep": `".ext$"`,
			}},
		}
		So(f.parse(), ShouldBeTrue)
		n6 := &tree.Node{MTime: 50, Size: 1500}
		So(f.Match("otherExt.jpg", n6), ShouldBeFalse)
		So(f.Match("otherExt.ext", n6), ShouldBeTrue)

		f = &MetaFilter{
			reqNode: &tree.Node{MetaStore: map[string]string{
				"time": `["<=100",">10"]`,
				"size": `["<=2000"]`,
				"grep": `".ext$|.jpg$"`,
			}},
		}
		So(f.parse(), ShouldBeTrue)
		So(f.Match("otherExt.jpg", n6), ShouldBeTrue)
		So(f.Match("otherExt.ext", n6), ShouldBeTrue)
	})
}
