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
)

func TestMetaFilter(t *testing.T) {
	Convey("Test int filters", t, func() {
		f := &MetaFilter{
			reqNode: &Node{MetaStore: map[string]string{
				"time": `["<=100",">10"]`,
				"size": `["<=2000"]`,
			}},
		}
		So(f.Parse(), ShouldBeTrue)
		n1 := &Node{MTime: 100}
		n2 := &Node{MTime: 10}
		n3 := &Node{MTime: 11}
		n4 := &Node{MTime: 101}
		So(f.Match("", n1), ShouldBeTrue)
		So(f.Match("", n2), ShouldBeFalse)
		So(f.Match("", n3), ShouldBeTrue)
		So(f.Match("", n4), ShouldBeFalse)

		n5 := &Node{MTime: 50, Size: 2001}
		So(f.Match("", n5), ShouldBeFalse)

		f = &MetaFilter{
			reqNode: &Node{MetaStore: map[string]string{
				"time": `["<=100",">10"]`,
				"size": `["<=2000"]`,
				"grep": `".ext$"`,
			}},
		}
		So(f.Parse(), ShouldBeTrue)
		n6 := &Node{MTime: 50, Size: 1500}
		So(f.Match("otherExt.jpg", n6), ShouldBeFalse)
		So(f.Match("otherExt.ext", n6), ShouldBeTrue)

		f = &MetaFilter{
			reqNode: &Node{MetaStore: map[string]string{
				"time": `["<=100",">10"]`,
				"size": `["<=2000"]`,
				"grep": `".ext$|.jpg$"`,
			}},
		}
		So(f.Parse(), ShouldBeTrue)
		So(f.Match("otherExt.jpg", n6), ShouldBeTrue)
		So(f.Match("otherExt.ext", n6), ShouldBeTrue)
	})
}
