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

package memory

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common/proto/tree"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	memTestCtx = context.Background()
)

func TestStub(t *testing.T) {
	stubDb := NewMemDB()

	stubDb.CreateNode(memTestCtx, &tree.Node{
		Path: "/test",
		Type: tree.NodeType_COLLECTION,
		Uuid: "testuuid",
	}, true)
	stubDb.CreateNode(memTestCtx, &tree.Node{
		Path: "/anotherfile",
		Type: tree.NodeType_LEAF,
		Etag: "filehashoo",
	}, true)
	stubDb.CreateNode(memTestCtx, &tree.Node{
		Path: "/test2",
		Type: tree.NodeType_COLLECTION,
		Uuid: "testuuid2",
	}, true)
	stubDb.CreateNode(memTestCtx, &tree.Node{
		Path: "/test/file",
		Type: tree.NodeType_LEAF,
		Etag: "filehash",
	}, true)

	stubDb.MoveNode(memTestCtx, "/test", "/testrenamed")
	stubDb.MoveNode(memTestCtx, "/testrenamed", "/test")
	stubDb.DeleteNode(memTestCtx, "/test")

	Convey("Test Db Nodes length is 3", t, func() {
		So(stubDb.pathIndex, ShouldHaveLength, 3)
	})
	Convey("Check that /test node should be removed", t, func() {
		n, e := stubDb.LoadNode(memTestCtx, "/test")
		So(n, ShouldBeNil)
		So(e, ShouldNotBeNil)
	})
	Convey("Check that /test2 node is found", t, func() {
		n, e := stubDb.LoadNode(memTestCtx, "/test2")
		So(n, ShouldNotBeNil)
		So(e, ShouldBeNil)
	})
	/*
		Convey("Check that node is found by Uuid", t, func() {
			n := stubDb.FindByUuid("testuuid2")
			So(n, ShouldNotBeNil)
		})
		Convey("Check that node is found by Hash", t, func() {
			n := stubDb.FindByHash("filehashoo")
			So(n, ShouldNotBeNil)
		})
		Convey("Check that node random hash is not found", t, func() {
			n := stubDb.FindByHash("zorglubtoto")
			So(n, ShouldBeNil)
		})
		Convey("Check that node random uuid is not found", t, func() {
			n := stubDb.FindByUuid("zorglubtoto")
			So(n, ShouldBeNil)
		})
	*/

}

/*
func TestDiffEmpty(t *testing.T) {

	stubDb1 := NewMemDB()
	stubDb2 := NewMemDB()
	stubDb1.CreateNode(&tree.N{
		Path:"/test",
		Type:tree.NodeType_COLLECTION,
		Uuid:"testuuid",
	})
	stubDb2.CreateNode(&tree.N{
		Path:"/test",
		Type:tree.NodeType_COLLECTION,
		Uuid:"testuuid",
	})

	Convey("Diffing two similar stubs", t, func(){
		diff := proc.ComputeSourcesDiff(stubDb1, stubDb2)
		So(diff.missingLeft, ShouldHaveLength, 0)
		So(diff.missingRight, ShouldHaveLength, 0)
	})

}

func TestDiff(t *testing.T){

	stubDb1 := NewMemDB()
	stubDb2 := NewMemDB()
	stubDb1.CreateNode(&tree.N{
		Path:"/test1",
		Type:tree.NodeType_COLLECTION,
		Uuid:"testuuid",
	})
	stubDb2.CreateNode(&tree.N{
		Path:"/test2",
		Type:tree.NodeType_COLLECTION,
		Uuid:"testuuid",
	})


	Convey("Diffing two different stubs", t, func(){
		diff := proc.ComputeSourcesDiff(stubDb1, stubDb2)
		So(diff.missingLeft, ShouldHaveLength, 1)
		So(diff.missingRight, ShouldHaveLength, 1)
	})

}
*/
