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

package mtree

// import (
// 	. "github.com/smartystreets/goconvey/convey"
// )

var (
	mockMPath    MPath
	mockTreeNode *TreeNode
)

func init() {
	mockMPath = MPath{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 1}
	// 48 / 17 corresponds to the node 2.4.2 in materialized path
	mockTreeNode = NewTreeNode()
	mockTreeNode.SetMPath(mockMPath...)
}

// func TestTreeNode(t *testing.T) {

// 	Convey("Test SetRat", t, func() {
// 		f := NewFloat()
// 		f.SetRat(mockRat.Rat)

// 		So(f, ShouldResemble, mockFloat)
// 	})

// 	Convey("Test SetRat", t, func() {
// 		r := NewRat()
// 		r.SetMPath(mockMPath...)

// 		PrintMemUsage("Before first node")

// 		n := NewTreeNode()
// 		n.SetRat(r)

// 		PrintMemUsage("After first node")

// 		So(n.MPath, ShouldResemble, mockMPath)

// 		n1 := NewTreeNode()
// 		n1.SetMPath([]uint64(mockMPath)...)

// 		PrintMemUsage("After Second node")
// 	})
// }
