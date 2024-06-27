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
	"context"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"log"
	"regexp"
	"testing"

	"github.com/spf13/viper"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/test"
	"github.com/pydio/cells/v4/data/source/index"

	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"

	. "github.com/smartystreets/goconvey/convey"
)

// FIXME: FAILING TEST
// This times out after 10 minutes

var (
	testcases = test.TemplateSQL(NewDAO)
)

var (
	ctx       context.Context
	options   = configx.New()
	mockNode  *tree.TreeNode
	mockNode2 *tree.TreeNode

	mockLongNodeMPath       *tree.MPath
	mockLongNodeChild1MPath *tree.MPath
	mockLongNodeChild2MPath *tree.MPath

	mockLongNode       *tree.TreeNode
	mockLongNodeChild1 *tree.TreeNode
	mockLongNodeChild2 *tree.TreeNode
)

func init() {
	mockLongNodeMPath = tree.NewMPath(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40)
	mockLongNodeChild1MPath = mockLongNodeMPath.Append(41)
	mockLongNodeChild2MPath = mockLongNodeMPath.Append(42)

	mockNode = &tree.TreeNode{
		Node: &tree.Node{
			Uuid: "ROOT",
			Type: tree.NodeType_COLLECTION,
		},
		MPath: &tree.MPath{MPath1: "1"},
		Name:  "ROOT",
	}

	mockNode2 = &tree.TreeNode{
		Node: &tree.Node{
			Uuid: "ROOT2",
			Type: tree.NodeType_COLLECTION,
		},
		MPath: &tree.MPath{MPath1: "2"},
		Name:  "ROOT2",
	}

	mockLongNode = &tree.TreeNode{
		Node: &tree.Node{
			Uuid: "mockLongNode",
			Type: tree.NodeType_LEAF,
		},
		MPath: mockLongNodeMPath,
		Name:  "mockLongNode",
	}

	mockLongNodeChild1 = &tree.TreeNode{
		Node: &tree.Node{
			Uuid: "mockLongNodeChild1",
			Type: tree.NodeType_LEAF,
		},
		MPath: mockLongNodeChild1MPath,
		Name:  "mockLongNodeChild1",
	}

	mockLongNodeChild2 = &tree.TreeNode{
		Node: &tree.Node{
			Uuid: "mockLongNodeChild2",
			Type: tree.NodeType_LEAF,
		},
		MPath: mockLongNodeChild2MPath,
		Name:  "mockLongNodeChild2",
	}
}

func getSQLDAO(ctx context.Context) sql.DAO {
	dao, err := manager.Resolve[sql.DAO](ctx)
	if err != nil {
		panic(err)
	}

	return dao
}

func getDAO(ctx context.Context) index.DAO {
	dao, err := manager.Resolve[index.DAO](ctx)
	if err != nil {
		panic(err)
	}

	return dao
}

func TestMain(m *testing.M) {
	v := viper.New()
	v.SetDefault(runtime.KeyCache, "pm://")
	v.SetDefault(runtime.KeyShortCache, "pm://")
	runtime.SetRuntime(v)

	m.Run()
}

func testAll(t *testing.T, f func(dao index.DAO) func(*testing.T)) {
	var cnt = 0
	test.RunStorageTests(testcases, func(ctx context.Context) {
		dao, err := manager.Resolve[index.DAO](ctx)
		if err != nil {
			panic(err)
		}

		// First make sure that we delete everything
		dao.DelNode(ctx, &tree.TreeNode{MPath: &tree.MPath{MPath1: "1"}})
		dao.DelNode(ctx, &tree.TreeNode{MPath: &tree.MPath{MPath1: "2"}})

		// Run the test
		t.Run(testcases[cnt].DSN[0], f(dao))
	})
}

func trimSchema(schema []string) []string {
	newSchema := []string{}
	re := regexp.MustCompile("CHARACTER SET .* COLLATE [^;]*")
	for i := 0; i < len(schema); i++ {
		newSchema = append(newSchema, re.ReplaceAllString(schema[i], ""))
	}

	return newSchema
}

func printTree() {
	// query

	st, _ := getSQLDAO(ctx).GetStmt("printTree")
	rows, err := st.Query()
	So(err, ShouldBeNil)

	var uuid, mpath string
	var level int
	var rat []byte

	for rows.Next() {
		err = rows.Scan(&uuid, &level, &mpath, &rat)
		So(err, ShouldBeNil)

		fmt.Println(uuid, level, mpath, rat)
	}
}

func printNodes() {
	// query
	st, _ := getSQLDAO(ctx).GetStmt("printNodes")
	rows, err := st.Query()
	So(err, ShouldBeNil)

	var uuid, name, etag, mode string
	var mtime, size int
	var leaf *bool

	for rows.Next() {
		err = rows.Scan(&uuid, &name, &leaf, &mtime, &etag, &size, &mode)
		So(err, ShouldBeNil)

		fmt.Println(uuid, name, leaf, mtime, etag, size, mode)
	}
}

func TestMysql(t *testing.T) {
	testAll(t, func(dao index.DAO) func(t *testing.T) {
		return func(t *testing.T) {
			ctx := context.TODO()
			// Adding a file
			Convey("Test adding a file - Success", t, func() {
				err := dao.AddNode(ctx, mockNode2)
				So(err, ShouldBeNil)

				// printTree()
				// printNodes()
			})

			// Setting a file
			Convey("Test setting a file - Success", t, func() {
				newNode := tree.NewTreeNode("")
				newNode.SetNode(&tree.Node{
					Uuid: "ROOT",
					Type: tree.NodeType_LEAF,
				})
				newNode.SetMPath(tree.NewMPath(2))
				newNode.SetName("")

				err := dao.SetNode(ctx, newNode)
				So(err, ShouldBeNil)

				// printTree()
				// printNodes()

				err = dao.SetNode(ctx, mockNode)
				So(err, ShouldBeNil)
			})

			// Delete a file
			// TODO - needs to be deleted by UUID
			Convey("Test deleting a file - Success", t, func() {
				err := dao.DelNode(ctx, mockNode)
				So(err, ShouldBeNil)

				// printTree()
				// printNodes()
			})

			Convey("Re-adding a file - Success", t, func() {
				err := dao.AddNode(ctx, mockNode)
				So(err, ShouldBeNil)

				//printTree()
				//printNodes()
			})

			Convey("Re-adding the same file - Failure", t, func() {
				err := dao.AddNode(ctx, mockNode)
				So(err, ShouldNotBeNil)

				// printTree()
				// printNodes()
			})

			Convey("Test Getting a file - Success", t, func() {

				node, err := dao.GetNode(ctx, tree.NewMPath(1))
				So(err, ShouldBeNil)

				// Setting MTime to 0 so we can compare
				node.GetNode().SetMTime(0)

				So(node.GetNode(), ShouldResemble, mockNode.Node)
			})

			// Setting a file
			Convey("Test setting a file with a massive path - Success", t, func() {

				err := dao.AddNode(ctx, mockLongNode)
				So(err, ShouldBeNil)

				err = dao.AddNode(ctx, mockLongNodeChild1)
				So(err, ShouldBeNil)

				err = dao.AddNode(ctx, mockLongNodeChild2)
				So(err, ShouldBeNil)

				//printTree()
				//printNodes()

				node, err := dao.GetNode(ctx, mockLongNodeChild2MPath)
				So(err, ShouldBeNil)

				// TODO - find a way
				node.GetNode().SetMTime(0)
				node.GetNode().SetPath(mockLongNodeChild2.GetNode().GetPath())

				So(node.GetNode(), ShouldResemble, mockLongNodeChild2.Node)
			})

			Convey("Test Getting a node by uuid - Success", t, func() {
				node, err := dao.GetNodeByUUID(ctx, "mockLongNode")
				So(err, ShouldBeNil)

				// Setting MTime to 0 so we can compare
				// node.GetNode().SetMTime(0)
				// node.GetNode().SetPath("mockLongNode")

				So(node.GetNode(), ShouldResemble, mockLongNode.Node)
			})

			// Getting a file
			Convey("Test Getting a child node", t, func() {

				node, err := dao.GetNodeChild(ctx, mockLongNodeMPath, "mockLongNodeChild1")

				So(err, ShouldBeNil)

				// TODO - find a way
				node.GetNode().SetMTime(0)
				node.GetNode().SetPath(mockLongNodeChild1.GetNode().GetPath())

				So(node.GetNode(), ShouldNotResemble, mockLongNodeChild2.Node)
				So(node.GetNode(), ShouldResemble, mockLongNodeChild1.Node)
			})

			// Setting a file
			Convey("Test Getting the last child of a node", t, func() {

				node, err := dao.GetNodeLastChild(ctx, mockLongNodeMPath)

				So(err, ShouldBeNil)

				// TODO - find a way
				node.GetNode().SetMTime(0)
				node.GetNode().SetPath(mockLongNodeChild2.GetNode().GetPath())

				So(node.GetNode(), ShouldNotResemble, mockLongNodeChild1.Node)
				So(node.GetNode(), ShouldResemble, mockLongNodeChild2.Node)
			})

			// Setting a file
			Convey("Test Getting the Children of a node", t, func() {

				var i int
				for _ = range dao.GetNodeChildren(context.Background(), mockLongNodeMPath) {
					i++
				}

				So(i, ShouldEqual, 2)
			})

			// Setting a file
			Convey("Test Getting the Children of a node", t, func() {

				var i int
				for _ = range dao.GetNodeTree(context.Background(), tree.NewMPath(1)) {
					i++
				}

				So(i, ShouldEqual, 3)
			})

			// Setting a file
			Convey("Test Getting Nodes by MPath", t, func() {

				var i int
				for _ = range dao.GetNodes(ctx, mockLongNodeChild1MPath, mockLongNodeChild2MPath) {
					i++
				}

				So(i, ShouldEqual, 2)
			})

			// Setting a file
			Convey("Setting multiple nodes at once", t, func() {
				b := dao.SetNodes(ctx, "test", 10)

				mpath := mockLongNodeMPath

				for mpath.Length() > 1 {
					node := tree.NewTreeNode("")
					node.SetMPath(mpath)
					b.Send(node)
					mpath = mpath.Parent()
				}

				err := b.Close()

				So(err, ShouldBeNil)
			})

			// Setting a mpath multiple times
			Convey("Setting a same mpath multiple times", t, func() {

				node1 := tree.NewTreeNode("")
				node1.SetNode(&tree.Node{Uuid: "test-same-mpath", Type: tree.NodeType_LEAF})
				node1.SetName("test-same-mpath")
				node1.SetMPath(tree.NewMPath(1, 21, 12, 7))
				err := dao.AddNode(ctx, node1)
				So(err, ShouldBeNil)

				node2 := tree.NewTreeNode("")
				node2.SetNode(&tree.Node{Uuid: "test-same-mpath2", Type: tree.NodeType_LEAF})
				node2.SetName("test-same-mpath2")
				node2.SetMPath(tree.NewMPath(1, 21, 12, 7))
				err = dao.AddNode(ctx, node2)
				So(err, ShouldNotBeNil)
			})

			Convey("Test wrong children due to same MPath start", t, func() {

				node1 := tree.NewTreeNode("")
				node1.SetNode(&tree.Node{Uuid: "parent1", Type: tree.NodeType_COLLECTION})
				node1.SetName("parent1")
				node1.SetMPath(tree.NewMPath(1, 1))

				node2 := tree.NewTreeNode("")
				node2.SetNode(&tree.Node{Uuid: "parent2", Type: tree.NodeType_COLLECTION})
				node2.SetName("parent2")
				node2.SetMPath(tree.NewMPath(1, 15))

				node11 := tree.NewTreeNode("")
				node11.SetNode(&tree.Node{Uuid: "child1.1", Type: tree.NodeType_COLLECTION})
				node11.SetName("child1.1")
				node11.SetMPath(tree.NewMPath(1, 1, 1))

				node21 := tree.NewTreeNode("")
				node21.SetNode(&tree.Node{Uuid: "child2.1", Type: tree.NodeType_COLLECTION})
				node21.SetName("child2.1")
				node21.SetMPath(tree.NewMPath(1, 15, 1))

				e := dao.AddNode(ctx, node1)
				So(e, ShouldBeNil)
				e = dao.AddNode(ctx, node2)
				So(e, ShouldBeNil)
				e = dao.AddNode(ctx, node11)
				So(e, ShouldBeNil)
				e = dao.AddNode(ctx, node21)
				So(e, ShouldBeNil)

				// List Root
				nodes := dao.GetNodeChildren(context.Background(), tree.NewMPath(1))
				count := 0
				for range nodes {
					count++
				}
				So(count, ShouldEqual, 2)

				// List Parent1 Children
				nodes = dao.GetNodeTree(context.Background(), tree.NewMPath(1))
				count = 0
				for c := range nodes {
					log.Println(c)
					count++
				}
				So(count, ShouldEqual, 8) // Because of previous tests there are other nodes

				// List Parent1 Children
				nodes = dao.GetNodeChildren(context.Background(), tree.NewMPath(1, 1))
				count = 0
				for range nodes {
					count++
				}
				So(count, ShouldEqual, 1)

			})

			Convey("Test Etag Compute", t, func() {

				// Test the following tree
				//
				// Parent  					: -1
				//    -> Child bbb  		: xxx
				//    -> Child aaa  		: yyy
				//    -> Child ccc  		: -1
				// 		   -> Child a-aaa	: zzz
				// 		   -> Child a-bbb	: qqq
				//
				// At the end, "Child ccc" and "Parent" should have a correct etag

				const etag1 = "xxxx"
				const etag2 = "yyyy"

				const etag3 = "zzzz"
				const etag4 = "qqqq"

				node := tree.NewTreeNode("")
				node.Node = &tree.Node{Uuid: "etag-parent-folder", Type: tree.NodeType_COLLECTION, Etag: "-1"}
				node.SetMPath(tree.NewMPath(1, 16))
				node.SetName("etag-parent-folder")

				node11 := tree.NewTreeNode("")
				node11.Node = &tree.Node{Uuid: "etag-child-1", Type: tree.NodeType_LEAF, Etag: etag1}
				node11.SetMPath(tree.NewMPath(1, 16, 1))
				node11.SetName("bbb")

				node12 := tree.NewTreeNode("")
				node12.Node = &tree.Node{Uuid: "etag-child-2", Type: tree.NodeType_LEAF, Etag: etag2}
				node12.SetMPath(tree.NewMPath(1, 16, 2))
				node12.SetName("aaa")

				node13 := tree.NewTreeNode("")
				node13.Node = &tree.Node{Uuid: "etag-child-3", Type: tree.NodeType_COLLECTION, Etag: "-1"}
				node13.SetMPath(tree.NewMPath(1, 16, 3))
				node13.SetName("ccc")

				node14 := tree.NewTreeNode("")
				node14.Node = &tree.Node{Uuid: "etag-child-child-1", Type: tree.NodeType_LEAF, Etag: etag3}
				node14.SetMPath(tree.NewMPath(1, 16, 3, 1))
				node14.SetName("a-aaa")

				node15 := tree.NewTreeNode("")
				node15.Node = &tree.Node{Uuid: "etag-child-child-2", Type: tree.NodeType_LEAF, Etag: etag4}
				node15.SetMPath(tree.NewMPath(1, 16, 3, 2))
				node15.SetName("a-bbb")

				e := dao.AddNode(ctx, node)
				So(e, ShouldBeNil)
				e = dao.AddNode(ctx, node11)
				So(e, ShouldBeNil)
				e = dao.AddNode(ctx, node12)
				So(e, ShouldBeNil)
				e = dao.AddNode(ctx, node13)
				So(e, ShouldBeNil)
				e = dao.AddNode(ctx, node14)
				So(e, ShouldBeNil)
				e = dao.AddNode(ctx, node15)
				So(e, ShouldBeNil)

				e = dao.ResyncDirtyEtags(ctx, node)
				So(e, ShouldBeNil)
				intermediaryNode, e := dao.GetNode(ctx, node13.MPath)
				So(e, ShouldBeNil)
				hash := md5.New()
				hash.Write([]byte(etag3 + "." + etag4))
				newEtag := hex.EncodeToString(hash.Sum(nil))
				So(intermediaryNode.GetNode().GetEtag(), ShouldEqual, newEtag)

				parentNode, e := dao.GetNode(ctx, node.GetMPath())
				So(e, ShouldBeNil)
				hash2 := md5.New()
				hash2.Write([]byte(etag2 + "." + etag1 + "." + intermediaryNode.GetNode().GetEtag()))
				newEtag2 := hex.EncodeToString(hash2.Sum(nil))
				So(parentNode.GetNode().GetEtag(), ShouldEqual, newEtag2)

			})
		}
	})
}
