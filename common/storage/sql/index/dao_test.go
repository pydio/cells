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
	"bufio"
	"context"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"os"
	osruntime "runtime"
	"strconv"
	"testing"
	"time"

	"github.com/spf13/viper"
	"gorm.io/gorm"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/test"
	"github.com/pydio/cells/v4/common/utils/cache/gocache"
	cache_helper "github.com/pydio/cells/v4/common/utils/cache/helper"
	"github.com/pydio/cells/v4/common/utils/mtree"

	_ "github.com/pydio/cells/v4/common/utils/cache/bigcache"
	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"
	_ "github.com/pydio/cells/v4/common/utils/cache/redis"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(NewDAO[*tree.TreeNode])
)

type testdao DAO

func TestMain(m *testing.M) {
	v := viper.New()
	runtime.SetRuntime(v)
	cache_helper.SetStaticResolver("pm://", &gocache.URLOpener{})

	now := time.Now()
	m.Run()
	fmt.Println(time.Since(now))
}

func testAll(t *testing.T, f func(dao testdao) func(*testing.T)) {
	var cnt = 0
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[DAO](ctx)
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

func testAllCache(t *testing.T, f func(dao testdao) func(*testing.T)) {
	var cnt = 0
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[DAO](ctx)
		if err != nil {
			panic(err)
		}

		// First make sure that we delete everything
		dao.DelNode(ctx, &tree.TreeNode{MPath: &tree.MPath{MPath1: "1"}})
		dao.DelNode(ctx, &tree.TreeNode{MPath: &tree.MPath{MPath1: "2"}})

		// wrap in cache
		dao = sessionDAO(dao)
		// Run the test
		t.Run(testcases[cnt].DSN[0], f(dao))
	})
}

// PrintMemUsage outputs the current, total and OS memory being used. As well as the number
// of garage collection cycles completed.
func PrintMemUsage(title string) {
	var m osruntime.MemStats
	osruntime.ReadMemStats(&m)
	// For info on each, see: https://golang.org/pkg/runtime/#MemStats
	fmt.Printf("\n---------------------------------\n")
	fmt.Println(title)
	fmt.Printf("Alloc = %v KiB", bToMb(m.Alloc))
	fmt.Printf("\tTotalAlloc = %v KiB", bToMb(m.TotalAlloc))
	fmt.Printf("\tSys = %v KiB", bToMb(m.Sys))
	fmt.Printf("\tNumGC = %v\n", m.NumGC)
	fmt.Println("---------------------------------")
}

func bToMb(b uint64) uint64 {
	return b / 1024 / 1024
}

func TestGetNodeTree(t *testing.T) {
	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			for node := range dao.GetNodeTree(context.Background(), tree.NewMPath(1)) {
				fmt.Println(node.(*mtree.TreeNode).MPath)
			}
		}
	})
}

func TestGetNodeChildren(t *testing.T) {
	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			for node := range dao.GetNodeChildren(context.Background(), tree.NewMPath(1, 3289, 8, 18, 4, 1, 1)) {
				fmt.Println(node.(*tree.TreeNode).MPath)
			}
		}
	})
}

func TestPath(t *testing.T) {
	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			var tn tree.ITreeNode = &tree.TreeNode{
				Node: &tree.Node{
					Uuid: "ROOT",
					Type: tree.NodeType_COLLECTION,
					Path: "/",
				},
				Name: "ROOT",
			}
			mpath, nodes, err := dao.ResolveMPath(context.Background(), true, &tn)

			fmt.Println(mpath, nodes, err)

			var tn2 tree.ITreeNode = &tree.TreeNode{
				Node: &tree.Node{
					Uuid: "ROOT",
					Type: tree.NodeType_COLLECTION,
					Path: "/",
				},
				Name: "ROOT",
			}
			mpath2, nodes2, err2 := dao.ResolveMPath(context.Background(), true, &tn2)
			fmt.Println(mpath2, nodes2, err2)

			var tn3 tree.ITreeNode = &tree.TreeNode{
				Node: &tree.Node{
					Uuid: "ROOT",
					Type: tree.NodeType_COLLECTION,
					Path: "/",
				},
				Name: "ROOT",
			}
			mpath3, nodes3, err3 := dao.ResolveMPath(context.Background(), true, &tn3)

			fmt.Println(mpath3, nodes3, err3)
		}
	})
}

func TestMysql(t *testing.T) {
	ctx := context.Background()

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			// Adding a file
			Convey("Test adding a file - Success", t, func() {
				err := dao.AddNode(ctx, mockNode)
				So(err, ShouldBeNil)

				dao.Flush(ctx, true)

				// printTree()
				// printNodes()
				PrintMemUsage("Test adding a file")
			})

			// Setting a file
			Convey("Test setting a file - Success", t, func() {

				newNode := &tree.TreeNode{
					Node: &tree.Node{
						Uuid: "ROOT",
						Type: tree.NodeType_LEAF,
					},
					MPath: &tree.MPath{MPath1: "2"},
					Name:  "",
				}

				err := dao.SetNode(ctx, newNode)
				So(err, ShouldBeNil)

				// printTree()
				// printNodes()

				err = dao.SetNode(ctx, mockNode)
				So(err, ShouldBeNil)

				dao.Flush(ctx, true)
			})

			// Updating a file meta
			Convey("Test updating a file meta", t, func() {
				err := dao.AddNode(ctx, updateNode)
				So(err, ShouldBeNil)

				dao.Flush(ctx, false)

				node := updateNode.GetNode()

				node.SetEtag("etag2")
				node.SetSize(24)

				err = dao.SetNodeMeta(ctx, updateNode)
				So(err, ShouldBeNil)

				dao.Flush(ctx, false)

				updated, err := dao.GetNode(ctx, updateNode.MPath)
				So(err, ShouldBeNil)
				So(updated.GetNode().GetEtag(), ShouldEqual, "etag2")
				So(updated.GetNode().GetSize(), ShouldEqual, 24)

				err = dao.DelNode(ctx, updateNode)
				So(err, ShouldBeNil)

				dao.Flush(ctx, true)

			})

			// Delete a file
			// TODO - needs to be deleted by UUID
			Convey("Test deleting a file - Success", t, func() {
				err := dao.DelNode(ctx, mockNode)
				So(err, ShouldBeNil)

				dao.Flush(ctx, true)

				// printTree()
				// printNodes()
			})

			Convey("Re-adding a file - Success", t, func() {
				err := dao.AddNode(ctx, mockNode)
				So(err, ShouldBeNil)

				dao.Flush(ctx, true)

				//printTree()
				//printNodes()
			})

			Convey("Re-adding the same file - Failure", t, func() {
				err := dao.AddNode(ctx, mockNode)
				if err != nil {
					So(err, ShouldEqual, gorm.ErrDuplicatedKey)
				} else {
					// We're in cache mode, the flush should error
					err = dao.Flush(ctx, true)
					So(err, ShouldEqual, gorm.ErrDuplicatedKey)
				}

				// printTree()
				// printNodes()
			})

			//Convey("Create combined error", t, func() {
			//
			//	cDao, ok := dao.(*daocache)
			//	if ok {
			//		//for i := 0; i < 20; i++ {
			//		//	cDao.errors = append(cDao.errors, fmt.Errorf("error %d", i))
			//		//}
			//		err := cDao.Flush(true)
			//		So(err, ShouldNotBeNil)
			//		So(err.Error(), ShouldEqual, "Combined errors (first 10) : error 0 error 1 error 2 error 3 error 4 error 5 error 6 error 7 error 8 error 9")
			//	}
			//})

			Convey("Test Getting a file - Success", t, func() {
				node, err := dao.GetNode(ctx, tree.NewMPath(1))
				So(err, ShouldBeNil)

				// Setting MTime to 0 so we can compare
				// node.GetNode().SetMTime(0)

				So(node.GetNode(), ShouldResemble, mockNode.Node)

				dao.Flush(ctx, true)
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
				// node.MTime = 0
				// node.Path = mockLongNodeChild2.Path

				dao.Flush(ctx, true)

				So(node.GetNode(), ShouldResemble, mockLongNodeChild2.Node)
			})

			Convey("Test Getting a node by uuid - Success", t, func() {
				node, err := dao.GetNodeByUUID(ctx, "mockLongNode")
				So(err, ShouldBeNil)

				// Setting MTime to 0 so we can compare
				node.GetNode().SetMTime(0)
				node.GetNode().SetSize(0)
				// node.Path = "mockLongNode"

				dao.Flush(ctx, true)

				So(node.GetNode(), ShouldResemble, mockLongNode.Node)
			})

			// Getting a file
			Convey("Test Getting a child node", t, func() {

				node, err := dao.GetNodeChild(ctx, mockLongNodeMPath, "mockLongNodeChild1")

				So(err, ShouldBeNil)

				// TODO - find a way
				//node.MTime = 0
				//node.Path = mockLongNodeChild1.Path

				dao.Flush(ctx, true)

				// So(node.Node, ShouldNotResemble, mockLongNodeChild2.Node)
				So(node.GetNode(), ShouldResemble, mockLongNodeChild1.Node)
			})

			// Setting a file
			Convey("Test Getting the last child of a node", t, func() {

				node, err := dao.GetNodeLastChild(ctx, mockLongNodeMPath)

				So(err, ShouldBeNil)

				// TODO - find a way
				//node.MTime = 0
				//node.Path = mockLongNodeChild2.Path

				dao.Flush(ctx, true)

				So(node.GetNode(), ShouldNotResemble, mockLongNodeChild1.Node)
				// So(node.Node, ShouldResemble, mockLongNodeChild2.Node)
			})

			// Getting children count
			Convey("Test Getting the Children Count of a node", t, func() {
				folderCount, leafCount := dao.GetNodeChildrenCounts(ctx, mockLongNodeMPath, false)

				dao.Flush(ctx, true)

				So(folderCount, ShouldEqual, 0)
				So(leafCount, ShouldEqual, 2)
			})

			// Getting children count
			Convey("Test Getting the Children Cumulated Size", t, func() {
				currentDAO := NewFolderSizeCacheDAO(dao)
				root, _ := currentDAO.GetNodeByUUID(ctx, "ROOT")
				parent, _ := currentDAO.GetNode(ctx, mockLongNodeMPath)

				So(parent.GetNode().GetSize(), ShouldEqual, mockLongNodeChild1.GetNode().GetSize()+mockLongNodeChild2.GetNode().GetSize())
				So(root.GetNode().GetSize(), ShouldEqual, parent.GetNode().GetSize())

				// Add new node and check size
				newNode := &tree.TreeNode{}
				newNode.SetNode(&tree.Node{
					Uuid: "newNodeFolderSize",
					Type: tree.NodeType_LEAF,
					Size: 37,
				})
				newNode.SetMPath(mockLongNode.GetMPath().Append(37))
				newNode.SetName("newNodeFolderSize")

				err := currentDAO.AddNode(ctx, newNode)
				So(err, ShouldBeNil)

				currentDAO.Flush(ctx, true)

				root, _ = currentDAO.GetNodeByUUID(ctx, "ROOT")
				parent, _ = currentDAO.GetNode(ctx, mockLongNodeMPath)

				So(parent.GetNode().GetSize(), ShouldEqual, mockLongNodeChild1.GetNode().GetSize()+mockLongNodeChild2.GetNode().GetSize()+newNode.GetNode().GetSize())
				So(root.GetNode().GetSize(), ShouldEqual, parent.GetNode().GetSize())

				// Move the node and check size
				movedNewNode := &tree.TreeNode{}
				movedNewNode.SetNode(&tree.Node{
					Uuid: "newNodeFolderSize",
					Type: tree.NodeType_LEAF,
					Size: 37,
				})
				movedNewNode.SetMPath(root.GetMPath().Append(37))
				movedNewNode.SetName("newNodeFolderSize")

				err = currentDAO.MoveNodeTree(ctx, newNode, movedNewNode)
				So(err, ShouldBeNil)

				root, _ = currentDAO.GetNodeByUUID(ctx, "ROOT")
				parent, _ = currentDAO.GetNode(ctx, mockLongNodeMPath)

				So(parent.GetNode().GetSize(), ShouldEqual, mockLongNodeChild1.GetNode().GetSize()+mockLongNodeChild2.GetNode().GetSize())
				So(root.GetNode().GetSize(), ShouldEqual, parent.GetNode().GetSize()+newNode.GetNode().GetSize())

				err = currentDAO.DelNode(ctx, movedNewNode)
				So(err, ShouldBeNil)

				root, _ = currentDAO.GetNodeByUUID(ctx, "ROOT")
				parent, _ = currentDAO.GetNode(ctx, mockLongNodeMPath)

				So(parent.GetNode().GetSize(), ShouldEqual, mockLongNodeChild1.GetNode().GetSize()+mockLongNodeChild2.GetNode().GetSize())
				So(root.GetNode().GetSize(), ShouldEqual, parent.GetNode().GetSize())

			})

			// Setting a file
			Convey("Test Getting the Children Count of a node", t, func() {
				folderCount, leafCount := dao.GetNodeChildrenCounts(ctx, mockLongNodeMPath, true)

				dao.Flush(ctx, true)

				So(folderCount, ShouldEqual, 0)
				So(leafCount, ShouldEqual, 2)
			})

			// Setting a file
			Convey("Test Getting the Children of a node", t, func() {
				var i int
				for _ = range dao.GetNodeChildren(context.Background(), mockLongNodeMPath) {
					i++
				}

				dao.Flush(ctx, true)

				So(i, ShouldEqual, 2)
			})

			// Setting a file
			Convey("Test Getting the Children of a node", t, func() {

				var i int
				PrintMemUsage("Test Getting the Children of a node")
				for _ = range dao.GetNodeTree(context.Background(), tree.NewMPath(1)) {
					i++
				}

				PrintMemUsage("Test Getting the Children of a node END")

				So(i, ShouldEqual, 3)

				dao.Flush(ctx, true)
			})

			return

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

				//mpath := mockLongNodeMPath

				//for len(mpath) > 0 {
				//	node := mtree.NewTreeNode()
				//	node.SetMPath(mpath...)
				//	b.Send(node)
				//	mpath = mpath.Parent()
				//}

				err := b.Close()

				So(err, ShouldBeNil)

				dao.Flush(ctx, true)
			})

			// Setting a mpath multiple times
			Convey("Setting a same mpath multiple times", t, func() {
				node1 := &tree.TreeNode{}
				node1.Node = &tree.Node{Uuid: "test-same-mpath", Type: tree.NodeType_LEAF}
				node1.SetMPath(tree.NewMPath(1, 21, 12, 7))
				err := dao.AddNode(ctx, node1)
				So(err, ShouldBeNil)

				node2 := &tree.TreeNode{}
				node2.Node = &tree.Node{Uuid: "test-same-mpath2", Type: tree.NodeType_LEAF}
				node2.SetMPath(tree.NewMPath(1, 21, 12, 7))
				err = dao.AddNode(ctx, node2)
				if err != nil {
					So(err, ShouldEqual, gorm.ErrDuplicatedKey)
				} else {
					err = dao.Flush(ctx, true)
					So(err, ShouldEqual, gorm.ErrDuplicatedKey)
				}
			})

			Convey("Test wrong children due to same MPath start", t, func() {
				node1 := &tree.TreeNode{}
				node1.Node = &tree.Node{Uuid: "parent1", Type: tree.NodeType_COLLECTION}
				node1.SetName("parent1")
				node1.SetMPath(tree.NewMPath(1, 1))

				node2 := &tree.TreeNode{}
				node2.Node = &tree.Node{Uuid: "parent2", Type: tree.NodeType_COLLECTION}
				node2.SetName("parent2")
				node2.SetMPath(tree.NewMPath(1, 15))

				node11 := &tree.TreeNode{}
				node11.Node = &tree.Node{Uuid: "child1.1", Type: tree.NodeType_COLLECTION}
				node11.SetName("child1.1")
				node11.SetMPath(tree.NewMPath(1, 1, 1))

				node21 := &tree.TreeNode{}
				node21.Node = &tree.Node{Uuid: "child2.1", Type: tree.NodeType_COLLECTION}
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

				e = dao.Flush(ctx, true)
				if e != nil {
					So(e, ShouldEqual, errNotImplemented)
				}

				// List Root
				nodes := dao.GetNodeChildren(context.Background(), tree.NewMPath(1))
				count := 0
				for range nodes {
					count++
				}
				So(count, ShouldEqual, 2)

				// printTree(ctxWithCache)
				// List Parent1 Children
				nodes = dao.GetNodeTree(context.Background(), tree.NewMPath(1))
				count = 0
				for _ = range nodes {
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

				node := &tree.TreeNode{}
				node.Node = &tree.Node{Uuid: "etag-parent-folder", Type: tree.NodeType_COLLECTION, Etag: "-1"}
				node.SetMPath(tree.NewMPath(1, 16))
				node.SetName("parent-folder")

				node11 := &tree.TreeNode{}
				node11.Node = &tree.Node{Uuid: "etag-child-1", Type: tree.NodeType_LEAF, Etag: etag1}
				node11.SetMPath(tree.NewMPath(1, 16, 1))
				node11.SetName("bbb")

				node12 := &tree.TreeNode{}
				node12.Node = &tree.Node{Uuid: "etag-child-2", Type: tree.NodeType_LEAF, Etag: etag2}
				node12.SetMPath(tree.NewMPath(1, 16, 2))
				node12.SetName("aaa")

				node13 := &tree.TreeNode{}
				node13.Node = &tree.Node{Uuid: "etag-child-3", Type: tree.NodeType_COLLECTION, Etag: "-1"}
				node13.SetMPath(tree.NewMPath(1, 16, 3))
				node13.SetName("ccc")

				node14 := &tree.TreeNode{}
				node14.Node = &tree.Node{Uuid: "etag-child-child-1", Type: tree.NodeType_LEAF, Etag: etag3}
				node14.SetMPath(tree.NewMPath(1, 16, 3, 1))
				node14.SetName("a-aaa")

				node15 := &tree.TreeNode{}
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

				e = dao.Flush(ctx, true)
				if e != nil {
					So(e, ShouldEqual, errNotImplemented)
				}

				e = dao.ResyncDirtyEtags(nil, node)
				So(e, ShouldBeNil)
				intermediaryNode, e := dao.GetNode(ctx, node13.MPath)
				So(e, ShouldBeNil)
				hash := md5.New()
				hash.Write([]byte(etag3 + "." + etag4))
				newEtag := hex.EncodeToString(hash.Sum(nil))
				So(intermediaryNode.GetNode().GetEtag(), ShouldEqual, newEtag)

				parentNode, e := dao.GetNode(ctx, node.MPath)
				So(e, ShouldBeNil)
				hash2 := md5.New()
				hash2.Write([]byte(etag2 + "." + etag1 + "." + intermediaryNode.GetNode().GetEtag()))
				newEtag2 := hex.EncodeToString(hash2.Sum(nil))
				So(parentNode.GetNode().GetEtag(), ShouldEqual, newEtag2)

			})
		}
	})
}

func TestGetNodeFirstAvailableChildIndex(t *testing.T) {
	ctx := context.Background()

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {

			Convey("Test mPath with free slots", t, func() {
				fs := []string{
					"/parent-slots-1",
					"/parent-slots-1/child-slots-1.1",
					"/parent-slots-1/child-slots-1.2",
					"/parent-slots-1/child-slots-1.3",
					"/parent-slots-1/child-slots-1.4",
				}

				// Creating the fs
				var nodes []tree.ITreeNode
				for _, path := range fs {
					tn := tree.NewTreeNode(path)
					_, createdNodes, err := dao.ResolveMPath(ctx, true, &tn)
					So(err, ShouldBeNil)

					nodes = append(nodes, createdNodes...)
				}

				So(len(nodes), ShouldEqual, 6)

				// No Children yet, should return 1
				slot, e := dao.GetNodeFirstAvailableChildIndex(ctx, nodes[0].GetMPath())
				So(e, ShouldBeNil)
				So(slot, ShouldEqual, 5)

				e = dao.Flush(ctx, true)
				if e != nil {
					So(e, ShouldEqual, errNotImplemented)
				}
			})
		}
	})
}

func TestStreams(t *testing.T) {
	ctx := context.Background()

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			Convey("Re-adding a file - Success", t, func() {

				c, e := dao.AddNodeStream(ctx, 20)

				count := 10000

				for i := 1; i <= 10000; i++ {
					node := &tree.TreeNode{}
					node.Node = &tree.Node{Uuid: "testing-stream" + strconv.Itoa(i), Type: tree.NodeType_LEAF}
					node.SetName("testing-stream" + strconv.Itoa(i))
					node.SetMPath(tree.NewMPath(1, 17, uint64(i)))

					c <- node
				}

				close(c)

				So(<-e, ShouldBeNil)

				idx, err := dao.GetNodeFirstAvailableChildIndex(ctx, tree.NewMPath(1, 17))
				So(err, ShouldBeNil)
				So(idx, ShouldEqual, count+1)
			})
		}
	})
}

func TestArborescence(t *testing.T) {
	ctx := context.Background()

	testAllCache(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			Convey("Re-adding a file - Success", t, func() {
				readFile, err := os.Open("/tmp/usr.txt")

				if err != nil {
					fmt.Println(err)
				}
				fileScanner := bufio.NewScanner(readFile)
				fileScanner.Split(bufio.ScanLines)

				for fileScanner.Scan() {
					tn := tree.NewTreeNode(fileScanner.Text())
					dao.ResolveMPath(ctx, true, &tn)
				}

				fmt.Println("Finished scanning")

				dao.Flush(ctx, true)

				readFile.Close()

			})
		}
	})
}

func TestSmallArborescence(t *testing.T) {
	ctx := context.Background()

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {

			Convey("Re-adding a file - Success", t, func() {
				arborescence := []string{
					"/test",
					"/test/.pydio",
					"/test copie",
					"/test copie/.pydio",
					"/test copie/1/2/3/4/whatever",
					"/document sans titre",
					"/document sans titre/.pydio",
					"/document sans titre/target",
					"/document sans titre/mobile_header.jpg",
					"/document sans titre/mobile-header.jpg",
				}

				// Creating the arborescence
				nodes := make(map[string]*tree.MPath)
				for _, path := range arborescence {
					mpath, _, err := dao.ResolveMPath(ctx, true, tree.NewTreeNodePtr(path))
					So(err, ShouldBeNil)
					nodes[path] = mpath
				}

				dao.Flush(ctx, false)

				// Then we move a node
				pathFrom, _, err := dao.ResolveMPath(ctx, false, tree.NewTreeNodePtr("/test copie/1/2/3/4"))
				So(err, ShouldBeNil)
				pathTo, _, err := dao.ResolveMPath(ctx, false, tree.NewTreeNodePtr("/document sans titre/target"))
				So(err, ShouldBeNil)

				dao.Flush(ctx, false)

				// Then we move a node
				nodeFrom, _ := dao.GetNode(ctx, pathFrom)
				nodeTo, _ := dao.GetNode(ctx, pathTo)

				// First of all, we delete the existing node
				if nodeTo != nil {
					err = dao.DelNode(ctx, nodeTo)
					So(err, ShouldBeNil)
				}

				dao.Flush(ctx, false)

				err = dao.MoveNodeTree(ctx, nodeFrom, nodeTo)
				So(err, ShouldBeNil)

				_, _, err = dao.ResolveMPath(ctx, false, tree.NewTreeNodePtr("/document sans titre/target/whatever"))
				So(err, ShouldBeNil)

				_, _, err = dao.ResolveMPath(ctx, true, tree.NewTreeNodePtr("/document sans titre/target/whatever2"))
				So(err, ShouldBeNil)

				// printTree(ctxWithCache)
				// printNodes(ctxWithCache)

				dao.Flush(ctx, true)
			})
		}
	})
}

func TestOtherArborescence(t *testing.T) {
	ctx := context.Background()

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			Convey("Re-adding a file - Success", t, func() {
				arborescence := []string{
					"/pydiods1/Dossier Chateau de Vaux - Dossier diag -",
					"/pydiods1/Dossier Chateau de Vaux - Dossier diag -/Fonts",
					"/pydiods1/Dossier Chateau de Vaux - Dossier diag -/Links",
				}

				for _, path := range arborescence {
					_, _, err := dao.ResolveMPath(ctx, true, tree.NewTreeNodePtr(path))
					So(err, ShouldBeNil)
				}

				dao.Flush(ctx, true)
			})
		}
	})
}

func TestFlatFolderWithMassiveChildren(t *testing.T) {
	ctx := context.Background()

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			Convey("Testing a flat folder with tons of children", t, func() {
				var i int
				s := time.Now()
				var nodes []tree.ITreeNode
				for i = 0; i < 50; i++ {
					_, node, _ := dao.ResolveMPath(ctx, true, tree.NewTreeNodePtr(fmt.Sprintf("/child-%d", i)))
					nodes = append(nodes, node[0])
					if i > 0 && i%1000 == 0 {
						t.Logf("Inserted %d - avg %v\n", i, time.Now().Sub(s)/1000)
						s = time.Now()
					}
					if i == 5 {
						// Create a missing number + cache usage
						dao.DelNode(ctx, nodes[2])
					} else if i == 10 {
						// Create a missing number and wait for cache to be expired
						dao.DelNode(ctx, nodes[1])
						<-time.After(6 * time.Second)
					}
				}
			})
		}
	})
}

func TestFindMissingNumbers(t *testing.T) {
	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			Convey("Find missing numbers in sorted slice of ints", t, func() {
				test := []int{2, 4, 5, 7}
				res, has, _ := firstAvailableSlot(test, false)
				So(has, ShouldBeTrue)
				So(res, ShouldEqual, 1)

				test = []int{2, 4, 5, 7}
				res, has, _ = firstAvailableSlot(test, true)
				So(has, ShouldBeTrue)
				So(res, ShouldEqual, 3)

				test = []int{4, 5, 7}
				res, has, _ = firstAvailableSlot(test, true)
				So(has, ShouldBeTrue)
				So(res, ShouldEqual, 6)

				test = []int{2, 4, 5, 7}
				padStart := false
				var missings []int
				for {
					slot, has, rest := firstAvailableSlot(test, padStart)
					if !has {
						break
					}
					missings = append(missings, slot)
					padStart = true
					test = rest
				}
				So(missings, ShouldHaveLength, 3)
				So(missings, ShouldContain, 1)
				So(missings, ShouldContain, 3)
				So(missings, ShouldContain, 6)

			})
		}
	})
}

func TestUnderscoreIssue(t *testing.T) {
	ctx := context.Background()

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			Convey("", t, func() {
				arborescence := []string{
					"/Test Folder",
					"/Test Folder/.pydio",
				}

				for _, path := range arborescence {
					_, _, err := dao.ResolveMPath(ctx, true, tree.NewTreeNodePtr(path))
					So(err, ShouldBeNil)
				}
				dao.Flush(ctx, true)

				mp, _, err := dao.ResolveMPath(ctx, false, tree.NewTreeNodePtr("/Test_Folder"))
				So(err.Error(), ShouldEqual, "not found")
				So(mp, ShouldBeNil)

				mp, _, err = dao.ResolveMPath(ctx, false, tree.NewTreeNodePtr("/Test%Folder"))
				So(err.Error(), ShouldEqual, "not found")
				So(mp, ShouldBeNil)
			})
		}
	})
}

//func TestDBInit(t *testing.T) {
//	st := storage.New("test", cellssqlite.MySQLDriver, cellssqlite.SharedMemDSN)
//	st.Register(cellssqlite.MySQLDriver, "test.db", "firsttenant", "")
//	st.Register(cellssqlite.MySQLDriver, "test2.db", "secondtenant", "")
//
//	ctxWithFirstTenant := context.WithValue(context.TODO(), "tenant", "firsttenant")
//	ctxWithSecondTenant := context.WithValue(context.TODO(), "tenant", "secondtenant")
//
//	var db *gorm.DB
//	st.Get(&db)
//
//	txFirstTenant := db.WithContext(ctxWithFirstTenant).Table("test")
//	txFirstTenant.AutoMigrate(struct{ Test string }{})
//	txFirstTenant.Create(struct{ Test string }{"test"})
//
//	txSecondTenant := db.WithContext(ctxWithSecondTenant).Table("test")
//	txSecondTenant.AutoMigrate(struct{ Whatever string }{})
//	txSecondTenant.Create(struct{ Whatever string }{"whatever"})
//}

//	func TestGettingNodeByPathBeforeCreationWithCache(t *testing.T) {
//		Convey("Re-adding a file - Success", t, func() {
//			arborescence := []string{
//				"admin",
//				"admin/Playlist",
//				"admin/Playlist/vendor-folders",
//				"admin/Playlist/vendor-folders/github.com",
//				"admin/Playlist/vendor-folders/github.com/golang",
//				"admin/Playlist/vendor-folders/github.com/golang/protobuf",
//				"admin/Playlist/vendor-folders/github.com/golang/protobuf/proto",
//				"admin/Playlist/vendor-folders/github.com/micro",
//				"admin/Playlist/vendor-folders/github.com/micro/micro",
//				"admin/Playlist/vendor-folders/github.com/micro/micro/api",
//				"admin/Playlist/vendor-folders/github.com/micro/protobuf",
//				"admin/Playlist/vendor-folders/github.com/micro/protobuf/proto",
//				"admin/Playlist/vendor-folders/github.com/coreos",
//				"admin/Playlist/vendor-folders/github.com/coreos/dex",
//				"admin/Playlist/vendor-folders/github.com/coreos/dex/api",
//				"admin/Playlist/vendor-folders/google.golang.org",
//				"admin/Playlist/vendor-folders/google.golang.org/api",
//				"admin/Playlist/vendor-folders/google.golang.org/genproto",
//				"admin/Playlist/vendor-folders/google.golang.org/genproto/googleapis",
//				"admin/Playlist/vendor-folders/google.golang.org/genproto/googleapis/api",
//				"admin/Playlist/vendor-folders/github.com/nicolai86",
//				"admin/Playlist/vendor-folders/github.com/nicolai86/scaleway-sdk",
//				"admin/Playlist/vendor-folders/github.com/nicolai86/scaleway-sdk/api",
//				"admin/Playlist/vendor-folders/github.com/pydio",
//				"admin/Playlist/vendor-folders/github.com/pydio/minio-srv",
//				"admin/Playlist/vendor-folders/github.com/pydio/minio-srv/vendor",
//				"admin/Playlist/vendor-folders/github.com/pydio/minio-srv/vendor/go.etcd.io",
//				"admin/Playlist/vendor-folders/github.com/pydio/minio-srv/vendor/go.etcd.io/etcd",
//				"admin/Playlist/vendor-folders/github.com/pydio/minio-srv/vendor/go.etcd.io/etcd/etcdserver",
//				"admin/Playlist/vendor-folders/github.com/pydio/minio-srv/vendor/go.etcd.io/etcd/etcdserver/api",
//			}
//
//			d := dao.(*daocache)
//
//			for _, path := range arborescence {
//				// Node should NEVER be found here!
//				test, e := d.GetNodeByPath(strings.Split(path, "/"))
//				So(test, ShouldBeNil)
//				So(e, ShouldNotBeNil)
//				_, _, e = d.Path(path, true)
//				So(e, ShouldBeNil)
//			}
//
//			// Nodes should be correctly found here!
//			n1, e := d.GetNodeByPath([]string{"admin", "Playlist", "vendor-folders", "github.com", "coreos", "dex", "api"})
//			So(e, ShouldBeNil)
//			So(n1, ShouldNotBeNil)
//			if n1 != nil {
//				So(strings.Replace(n1.Path, "\\", "/", -1), ShouldEqual, "admin/Playlist/vendor-folders/github.com/coreos/dex/api")
//			}
//
//			n1, e = d.GetNodeByPath([]string{"admin", "Playlist", "vendor-folders", "github.com", "nicolai86", "scaleway-sdk", "api"})
//			So(e, ShouldBeNil)
//			So(n1, ShouldNotBeNil)
//			if n1 != nil {
//				So(strings.Replace(n1.Path, "\\", "/", -1), ShouldEqual, "admin/Playlist/vendor-folders/github.com/nicolai86/scaleway-sdk/api")
//			}
//
//			dao.Flush(true)
//		})
//
// }

//func BenchmarkMysql(b *testing.B) {
//	b.ReportAllocs()
//
//	currentDAO := NewFolderSizeCacheDAO(func(ctx context.Context) DAO { return getDAO(ctx) })
//	// currentDAO := getDAO(ctxNoCache)
//
//	for i := 0; i < b.N; i++ {
//		// List Root
//		nodes := currentDAO(ctxNoCache).GetNodeChildren(context.Background(), mtree.MPath{1})
//		<-nodes
//		/*count := 0
//		for range nodes {
//			count++
//		}*/
//	}
//}
