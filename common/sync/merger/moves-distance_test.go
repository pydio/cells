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

package merger

import (
	"testing"

	"github.com/pydio/cells/common/sync/model"
	"github.com/smartystreets/goconvey/convey"
)

func TestSortClosestMove(t *testing.T) {

	convey.Convey("Test SortClosestMoves flat", t, func() {

		moves := sortClosestMoves([]*Move{
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/similar-file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
				},
			},
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/similar-file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/similar-file"},
				},
			},
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
				},
			},
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/similar-file"},
				},
			},
		})

		convey.So(moves, convey.ShouldHaveLength, 2)
	})

	convey.Convey("Test SortClosestMoves deep", t, func() {

		moves := sortClosestMoves([]*Move{
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/a/similar-file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
				},
			},
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/a/similar-file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/a/similar-file"},
				},
			},
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
				},
			},
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/a/similar-file"},
				},
			},
		})

		convey.So(moves, convey.ShouldHaveLength, 2)
		var keys int
		for _, m := range moves {
			if m.deleteOp.GetRefPath() == "/a/similar-file" {
				convey.So(m.createOp.GetRefPath(), convey.ShouldEqual, "/a/similar-file-moved")
				keys++
			} else if m.deleteOp.GetRefPath() == "/file-to-move" {
				convey.So(m.createOp.GetRefPath(), convey.ShouldEqual, "/file-moved")
				keys++
			}
		}
		convey.So(keys, convey.ShouldEqual, 2)
	})

	convey.Convey("Test SortClosestMoves deeper", t, func() {

		moves := sortClosestMoves([]*Move{
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
				},
			},
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/a/b/c/similar-file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
				},
			},
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/a/similar-file"},
				},
			},
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/a/b/c/similar-file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/a/similar-file"},
				},
			},
		})

		convey.So(moves, convey.ShouldHaveLength, 2)
		var keys int
		for _, m := range moves {
			if m.deleteOp.GetRefPath() == "/a/similar-file" {
				convey.So(m.createOp.GetRefPath(), convey.ShouldEqual, "/a/b/c/similar-file-moved")
				keys++
			} else if m.deleteOp.GetRefPath() == "/file-to-move" {
				convey.So(m.createOp.GetRefPath(), convey.ShouldEqual, "/file-moved")
				keys++
			}
		}
		convey.So(keys, convey.ShouldEqual, 2)

	})

	convey.Convey("Test SortClosestMoves crossing", t, func() {

		moves := sortClosestMoves([]*Move{
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/a/similar-file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
				},
			},
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/a/file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/file-to-move"},
				},
			},
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/a/similar-file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/similar-file"},
				},
			},
			{
				createOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/a/file-moved"},
				},
				deleteOp: &patchOperation{
					EventInfo: model.EventInfo{Path: "/similar-file"},
				},
			},
		})

		convey.So(moves, convey.ShouldHaveLength, 2)
		var keys int
		for _, m := range moves {
			if m.deleteOp.GetRefPath() == "/similar-file" {
				keys++
			} else if m.deleteOp.GetRefPath() == "/file-to-move" {
				keys++
			}
		}
		convey.So(keys, convey.ShouldEqual, 2)
	})

	convey.Convey("Test SortClosestMoves same paths", t, func() {
		moves := sortClosestMoves([]*Move{
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move1"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move1"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move2"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move1"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move3"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move1"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move4"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move1"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move1"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move2"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move2"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move2"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move3"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move2"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move4"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move2"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move1"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move3"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move2"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move3"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move3"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move3"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move4"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move3"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move1"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move4"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move2"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move4"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move3"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move4"}},
			},
			{
				createOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move4"}},
				deleteOp: &patchOperation{EventInfo: model.EventInfo{Path: "/move4"}},
			},
		})
		convey.So(moves, convey.ShouldHaveLength, 4)
		var keys int
		for _, m := range moves {
			if m.deleteOp.GetRefPath() == "/move1" {
				convey.So(m.createOp.GetRefPath(), convey.ShouldEqual, "/move1")
				keys++
			} else if m.deleteOp.GetRefPath() == "/move2" {
				convey.So(m.createOp.GetRefPath(), convey.ShouldEqual, "/move2")
				keys++
			} else if m.deleteOp.GetRefPath() == "/move3" {
				convey.So(m.createOp.GetRefPath(), convey.ShouldEqual, "/move3")
				keys++
			} else if m.deleteOp.GetRefPath() == "/move4" {
				convey.So(m.createOp.GetRefPath(), convey.ShouldEqual, "/move4")
				keys++
			}
		}
		convey.So(keys, convey.ShouldEqual, 4)
	})

}
