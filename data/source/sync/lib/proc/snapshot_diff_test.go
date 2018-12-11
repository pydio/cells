/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package proc

import (
	"testing"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/data/source/sync/lib/endpoints"
	. "github.com/smartystreets/goconvey/convey"
)

func TestComputeSourcesDiff(t *testing.T) {

	Convey("Test various Diffs", t, func() {

		var left, right *endpoints.MemDB
		var diff *SourceDiff

		Convey("Test empty source and target", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			diff, _ = ComputeSourcesDiff(mergerTestCtx, left, right, false, nil)
			So(diff, ShouldNotBeNil)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 0)
		})

		Convey("Test file in left", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			left.CreateNode(mergerTestCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			diff, _ = ComputeSourcesDiff(mergerTestCtx, left, right, false, nil)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 1)
		})

		Convey("Test file in right", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			right.CreateNode(mergerTestCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			diff, _ = ComputeSourcesDiff(mergerTestCtx, left, right, false, nil)
			So(diff.MissingLeft, ShouldHaveLength, 1)
			So(diff.MissingRight, ShouldHaveLength, 0)
		})

		Convey("Test files in both", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			right.CreateNode(mergerTestCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(mergerTestCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			diff, _ = ComputeSourcesDiff(mergerTestCtx, left, right, false, nil)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 0)
		})

		Convey("Test ignored files", func() {
			left = endpoints.NewMemDB()
			right = endpoints.NewMemDB()
			right.CreateNode(mergerTestCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(mergerTestCtx, &tree.Node{
				Path: "/aaa",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(mergerTestCtx, &tree.Node{
				Path: "/aaa/.DS_Store",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(mergerTestCtx, &tree.Node{
				Path: "/.minio.sys",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(mergerTestCtx, &tree.Node{
				Path: "/$buckets.json",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			left.CreateNode(mergerTestCtx, &tree.Node{
				Path: "/$multiparts-session.json",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			}, true)
			diff, _ = ComputeSourcesDiff(mergerTestCtx, left, right, false, nil)
			So(diff.MissingLeft, ShouldHaveLength, 0)
			So(diff.MissingRight, ShouldHaveLength, 0)
		})

	})

}
