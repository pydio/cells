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

package index

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"log"
	"regexp"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/proto/tree"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/mtree"
)

// FIXME: FAILING TEST
// This times out after 10 minutes

var (
	ctx       context.Context
	options   = configx.New()
	mockNode  *mtree.TreeNode
	mockNode2 *mtree.TreeNode

	mockLongNodeMPath       mtree.MPath
	mockLongNodeChild1MPath mtree.MPath
	mockLongNodeChild2MPath mtree.MPath

	mockLongNode       *mtree.TreeNode
	mockLongNodeChild1 *mtree.TreeNode
	mockLongNodeChild2 *mtree.TreeNode
)

func init() {
	mockLongNodeMPath = []uint64{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40}
	mockLongNodeChild1MPath = append(mockLongNodeMPath, 41)
	mockLongNodeChild2MPath = append(mockLongNodeMPath, 42)

	mockNode = NewNode(&tree.Node{
		Uuid: "ROOT",
		Type: tree.NodeType_LEAF,
	}, []uint64{1}, []string{""})

	mockNode2 = NewNode(&tree.Node{
		Uuid: "ROOT2",
		Type: tree.NodeType_LEAF,
	}, []uint64{5}, []string{""})

	mockLongNode = NewNode(&tree.Node{
		Uuid: "mockLongNode",
		Type: tree.NodeType_LEAF,
	}, mockLongNodeMPath, []string{"mockLongNode"})

	mockLongNodeChild1 = NewNode(&tree.Node{
		Uuid: "mockLongNodeChild1",
		Type: tree.NodeType_LEAF,
	}, mockLongNodeChild1MPath, []string{"mockLongNodeChild1"})

	mockLongNodeChild2 = NewNode(&tree.Node{
		Uuid: "mockLongNodeChild2",
		Type: tree.NodeType_LEAF,
	}, mockLongNodeChild2MPath, []string{"mockLongNodeChild2"})
}

func getSQLDAO(ctx context.Context) sql.DAO {
	return servicecontext.GetDAO(ctx).(sql.DAO)
}

func getDAO(ctx context.Context) DAO {
	return servicecontext.GetDAO(ctx).(DAO)
}

func TestMain(m *testing.M) {

	c := context.Background()
	if d, e := dao.InitDAO(c, sqlite.Driver, sqlite.SharedMemDSN, "test", NewDAO, options); e != nil {
		panic(e)
	} else {
		ctx = servicecontext.WithDAO(c, d)
	}

	m.Run()
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

	// Adding a file
	Convey("Test adding a file - Success", t, func() {
		err := getDAO(ctx).AddNode(mockNode2)
		So(err, ShouldBeNil)

		// printTree()
		// printNodes()
	})

	// Setting a file
	Convey("Test setting a file - Success", t, func() {
		newNode := NewNode(&tree.Node{
			Uuid: "ROOT",
			Type: tree.NodeType_LEAF,
		}, []uint64{2}, []string{""})

		err := getDAO(ctx).SetNode(newNode)
		So(err, ShouldBeNil)

		// printTree()
		// printNodes()

		err = getDAO(ctx).SetNode(mockNode)
		So(err, ShouldBeNil)
	})

	// Delete a file
	// TODO - needs to be deleted by UUID
	Convey("Test deleting a file - Success", t, func() {
		err := getDAO(ctx).DelNode(mockNode)
		So(err, ShouldBeNil)

		// printTree()
		// printNodes()
	})

	Convey("Re-adding a file - Success", t, func() {
		err := getDAO(ctx).AddNode(mockNode)
		So(err, ShouldBeNil)

		//printTree()
		//printNodes()
	})

	Convey("Re-adding the same file - Failure", t, func() {
		err := getDAO(ctx).AddNode(mockNode)
		So(err, ShouldNotBeNil)

		// printTree()
		// printNodes()
	})

	Convey("Test Getting a file - Success", t, func() {

		node, err := getDAO(ctx).GetNode([]uint64{1})
		So(err, ShouldBeNil)

		// Setting MTime to 0 so we can compare
		node.MTime = 0

		So(node.Node, ShouldResemble, mockNode.Node)
	})

	// Setting a file
	Convey("Test setting a file with a massive path - Success", t, func() {

		err := getDAO(ctx).AddNode(mockLongNode)
		So(err, ShouldBeNil)

		err = getDAO(ctx).AddNode(mockLongNodeChild1)
		So(err, ShouldBeNil)

		err = getDAO(ctx).AddNode(mockLongNodeChild2)
		So(err, ShouldBeNil)

		//printTree()
		//printNodes()

		node, err := getDAO(ctx).GetNode(mockLongNodeChild2MPath)
		So(err, ShouldBeNil)

		// TODO - find a way
		node.MTime = 0
		node.Path = mockLongNodeChild2.Path

		So(node.Node, ShouldResemble, mockLongNodeChild2.Node)
	})

	Convey("Test Getting a node by uuid - Success", t, func() {
		node, err := getDAO(ctx).GetNodeByUUID("mockLongNode")
		So(err, ShouldBeNil)

		// Setting MTime to 0 so we can compare
		node.MTime = 0
		node.Path = "mockLongNode"

		So(node.Node, ShouldResemble, mockLongNode.Node)
	})

	// Getting a file
	Convey("Test Getting a child node", t, func() {

		node, err := getDAO(ctx).GetNodeChild(mockLongNodeMPath, "mockLongNodeChild1")

		So(err, ShouldBeNil)

		// TODO - find a way
		node.MTime = 0
		node.Path = mockLongNodeChild1.Path

		So(node.Node, ShouldNotResemble, mockLongNodeChild2.Node)
		So(node.Node, ShouldResemble, mockLongNodeChild1.Node)
	})

	// Setting a file
	Convey("Test Getting the last child of a node", t, func() {

		node, err := getDAO(ctx).GetNodeLastChild(mockLongNodeMPath)

		So(err, ShouldBeNil)

		// TODO - find a way
		node.MTime = 0
		node.Path = mockLongNodeChild2.Path

		So(node.Node, ShouldNotResemble, mockLongNodeChild1.Node)
		So(node.Node, ShouldResemble, mockLongNodeChild2.Node)
	})

	// Setting a file
	Convey("Test Getting the Children of a node", t, func() {

		var i int
		for _ = range getDAO(ctx).GetNodeChildren(mockLongNodeMPath) {
			i++
		}

		So(i, ShouldEqual, 2)
	})

	// Setting a file
	Convey("Test Getting the Children of a node", t, func() {

		var i int
		for _ = range getDAO(ctx).GetNodeTree([]uint64{1}) {
			i++
		}

		So(i, ShouldEqual, 3)
	})

	// Setting a file
	Convey("Test Getting Nodes by MPath", t, func() {

		var i int
		for _ = range getDAO(ctx).GetNodes(mockLongNodeChild1MPath, mockLongNodeChild2MPath) {
			i++
		}

		So(i, ShouldEqual, 2)
	})

	// Setting a file
	Convey("Setting multiple nodes at once", t, func() {
		b := getDAO(ctx).SetNodes("test", 10)

		mpath := mockLongNodeMPath

		for len(mpath) > 0 {
			node := mtree.NewTreeNode()
			node.SetMPath(mpath...)
			b.Send(node)
			mpath = mpath.Parent()
		}

		err := b.Close()

		So(err, ShouldBeNil)
	})

	// Setting a mpath multiple times
	Convey("Setting a same mpath multiple times", t, func() {

		node1 := mtree.NewTreeNode()
		node1.Node = &tree.Node{Uuid: "test-same-mpath", Type: tree.NodeType_LEAF}
		node1.SetMPath(1, 21, 12, 7)
		err := getDAO(ctx).AddNode(node1)
		So(err, ShouldBeNil)

		node2 := mtree.NewTreeNode()
		node2.Node = &tree.Node{Uuid: "test-same-mpath2", Type: tree.NodeType_LEAF}
		node2.SetMPath(1, 21, 12, 7)
		err = getDAO(ctx).AddNode(node2)
		So(err, ShouldNotBeNil)
	})

	Convey("Test wrong children due to same MPath start", t, func() {

		node1 := mtree.NewTreeNode()
		node1.Node = &tree.Node{Uuid: "parent1", Type: tree.NodeType_COLLECTION}
		node1.SetMPath(1, 1)

		node2 := mtree.NewTreeNode()
		node2.Node = &tree.Node{Uuid: "parent2", Type: tree.NodeType_COLLECTION}
		node2.SetMPath(1, 15)

		node11 := mtree.NewTreeNode()
		node11.Node = &tree.Node{Uuid: "child1.1", Type: tree.NodeType_COLLECTION}
		node11.SetMPath(1, 1, 1)

		node21 := mtree.NewTreeNode()
		node21.Node = &tree.Node{Uuid: "child2.1", Type: tree.NodeType_COLLECTION}
		node21.SetMPath(1, 15, 1)

		e := getDAO(ctx).AddNode(node1)
		So(e, ShouldBeNil)
		e = getDAO(ctx).AddNode(node2)
		So(e, ShouldBeNil)
		e = getDAO(ctx).AddNode(node11)
		So(e, ShouldBeNil)
		e = getDAO(ctx).AddNode(node21)
		So(e, ShouldBeNil)

		// List Root
		nodes := getDAO(ctx).GetNodeChildren(mtree.MPath{1})
		count := 0
		for range nodes {
			count++
		}
		So(count, ShouldEqual, 2)

		// List Parent1 Children
		nodes = getDAO(ctx).GetNodeTree(mtree.MPath{1})
		count = 0
		for c := range nodes {
			log.Println(c)
			count++
		}
		So(count, ShouldEqual, 8) // Because of previous tests there are other nodes

		// List Parent1 Children
		nodes = getDAO(ctx).GetNodeChildren(mtree.MPath{1, 1})
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

		node := mtree.NewTreeNode()
		node.Node = &tree.Node{Uuid: "etag-parent-folder", Type: tree.NodeType_COLLECTION}
		node.SetMPath(1, 16)
		node.Etag = "-1"

		node11 := mtree.NewTreeNode()
		node11.Node = &tree.Node{Uuid: "etag-child-1", Type: tree.NodeType_LEAF}
		node11.SetMPath(1, 16, 1)
		node11.Etag = etag1
		node11.SetMeta("name", "\"bbb\"")

		node12 := mtree.NewTreeNode()
		node12.Node = &tree.Node{Uuid: "etag-child-2", Type: tree.NodeType_LEAF}
		node12.SetMPath(1, 16, 2)
		node12.Etag = etag2
		node12.SetMeta("name", "\"aaa\"")

		node13 := mtree.NewTreeNode()
		node13.Node = &tree.Node{Uuid: "etag-child-3", Type: tree.NodeType_COLLECTION}
		node13.SetMPath(1, 16, 3)
		node13.Etag = "-1"
		node13.SetMeta("name", "\"ccc\"")

		node14 := mtree.NewTreeNode()
		node14.Node = &tree.Node{Uuid: "etag-child-child-1", Type: tree.NodeType_LEAF}
		node14.SetMPath(1, 16, 3, 1)
		node14.Etag = etag3
		node14.SetMeta("name", "\"a-aaa\"")

		node15 := mtree.NewTreeNode()
		node15.Node = &tree.Node{Uuid: "etag-child-child-2", Type: tree.NodeType_LEAF}
		node15.SetMPath(1, 16, 3, 2)
		node15.Etag = etag4
		node15.SetMeta("name", "\"a-bbb\"")

		e := getDAO(ctx).AddNode(node)
		So(e, ShouldBeNil)
		e = getDAO(ctx).AddNode(node11)
		So(e, ShouldBeNil)
		e = getDAO(ctx).AddNode(node12)
		So(e, ShouldBeNil)
		e = getDAO(ctx).AddNode(node13)
		So(e, ShouldBeNil)
		e = getDAO(ctx).AddNode(node14)
		So(e, ShouldBeNil)
		e = getDAO(ctx).AddNode(node15)
		So(e, ShouldBeNil)

		e = getDAO(ctx).ResyncDirtyEtags(node)
		So(e, ShouldBeNil)
		intermediaryNode, e := getDAO(ctx).GetNode(node13.MPath)
		So(e, ShouldBeNil)
		hash := md5.New()
		hash.Write([]byte(etag3 + "." + etag4))
		newEtag := hex.EncodeToString(hash.Sum(nil))
		So(intermediaryNode.Etag, ShouldEqual, newEtag)

		parentNode, e := getDAO(ctx).GetNode(node.MPath)
		So(e, ShouldBeNil)
		hash2 := md5.New()
		hash2.Write([]byte(etag2 + "." + etag1 + "." + intermediaryNode.Etag))
		newEtag2 := hex.EncodeToString(hash2.Sum(nil))
		So(parentNode.Etag, ShouldEqual, newEtag2)

	})

}
