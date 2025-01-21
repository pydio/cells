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
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	osruntime "runtime"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/spf13/viper"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"google.golang.org/protobuf/proto"
	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/common/utils/cache/gocache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	"github.com/pydio/cells/v5/common/utils/slug"
	"github.com/pydio/cells/v5/common/utils/uuid"

	_ "github.com/pydio/cells/v5/common/utils/cache/bigcache"
	_ "github.com/pydio/cells/v5/common/utils/cache/gocache"
	_ "github.com/pydio/cells/v5/common/utils/cache/redis"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(NewDAO[*tree.TreeNode])
	caser     = cases.Title(language.English)
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

func testAll(t *testing.T, f func(dao testdao) func(*testing.T), cache ...bool) {
	var cnt = 0
	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		dao, err := manager.Resolve[DAO](ctx)
		if err != nil {
			panic(err)
		}

		// First make sure that we delete everything
		_ = dao.DelNode(ctx, &tree.TreeNode{MPath: &tree.MPath{MPath1: "1"}})
		_ = dao.DelNode(ctx, &tree.TreeNode{MPath: &tree.MPath{MPath1: "2"}})

		// Run the test
		scheme := strings.SplitN(testcases[cnt].DSN[0], "://", 2)[0]
		label := caser.String(scheme)
		t.Run(label, f(dao))
		cnt++
	})
	if len(cache) > 0 && cache[0] {
		cnt = 0
		test.RunStorageTests(testcases, t, func(ctx context.Context) {
			dao, err := manager.Resolve[DAO](ctx)
			if err != nil {
				panic(err)
			}

			// First make sure that we delete everything
			_ = dao.DelNode(ctx, &tree.TreeNode{MPath: &tree.MPath{MPath1: "1"}})
			_ = dao.DelNode(ctx, &tree.TreeNode{MPath: &tree.MPath{MPath1: "2"}})

			// wrap in cache
			session := uuid.New()
			dao = NewSessionDAO(session, 10, dao)
			// Run the test
			scheme := strings.SplitN(testcases[cnt].DSN[0], "://", 2)[0]
			label := caser.String(scheme)
			t.Run("Session/"+label, f(dao))
			cnt++
		})

	}
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
				fmt.Println(node.(tree.ITreeNode).GetMPath())
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
	ctx := context.Background()
	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {

			Convey("Test ByPath basic cases", t, func() {

				var tn tree.ITreeNode = &tree.TreeNode{
					Node: &tree.Node{
						Uuid: "ROOT",
						Type: tree.NodeType_COLLECTION,
						Path: "/",
					},
					Name: "ROOT",
				}
				node0, err0 := dao.GetNodeByPath(ctx, "/")
				So(err0, ShouldNotBeNil)
				So(errors.Is(err0, errors.NodeNotFound), ShouldBeTrue)
				So(node0, ShouldBeNil)

				n, nodes, err := dao.GetOrCreateNodeByPath(ctx, tn.GetNode().GetPath(), tn.GetNode())

				So(err, ShouldBeNil)
				So(n.GetMPath().ToString(), ShouldEqual, "1")
				So(len(nodes), ShouldEqual, 1)

				var tn2 tree.ITreeNode = &tree.TreeNode{
					Node: &tree.Node{
						Uuid: "ROOT",
						Type: tree.NodeType_COLLECTION,
						Path: "/",
					},
					Name: "ROOT",
				}
				n2, nodes2, err2 := dao.GetOrCreateNodeByPath(ctx, tn2.GetNode().GetPath(), tn2.GetNode())
				So(err2, ShouldBeNil)
				So(n2.GetMPath().ToString(), ShouldEqual, "1")
				So(len(nodes2), ShouldEqual, 0)

				n, err = dao.GetNodeByMPath(ctx, n2.GetMPath())
				So(err, ShouldBeNil)
				So(n, ShouldNotBeNil)

				So(dao.Flush(ctx, true), ShouldBeNil)
				_, err = dao.GetNodeByMPath(ctx, n2.GetMPath())
				So(err, ShouldBeNil)

			})

		}
	}, true)
}

func TestGenericFeatures(t *testing.T) {
	ctx := context.Background()

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			// Adding a file
			Convey("Test adding a file - Success", t, func() {
				err := dao.insertNode(ctx, mockNode)
				So(err, ShouldBeNil)

				So(dao.Flush(ctx, true), ShouldBeNil)

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

				err := dao.UpdateNode(ctx, newNode)
				So(err, ShouldBeNil)

				// printTree()
				// printNodes()

				err = dao.UpdateNode(ctx, mockNode)
				So(err, ShouldBeNil)

				So(dao.Flush(ctx, true), ShouldBeNil)
			})

			// Updating a file meta
			Convey("Test updating a file meta", t, func() {
				err := dao.insertNode(ctx, updateNode)
				So(err, ShouldBeNil)

				So(dao.Flush(ctx, false), ShouldBeNil)

				node := updateNode.GetNode()

				node.SetEtag("etag2")
				node.SetSize(24)

				err = dao.UpdateNode(ctx, updateNode)
				So(err, ShouldBeNil)

				So(dao.Flush(ctx, false), ShouldBeNil)

				updated, err := dao.GetNodeByMPath(ctx, updateNode.MPath)
				So(err, ShouldBeNil)
				So(updated.GetNode().GetEtag(), ShouldEqual, "etag2")
				So(updated.GetNode().GetSize(), ShouldEqual, 24)

				err = dao.DelNode(ctx, updateNode)
				So(err, ShouldBeNil)

				So(dao.Flush(ctx, true), ShouldBeNil)

			})

			// Delete a file
			// TODO - needs to be deleted by UUID
			Convey("Test deleting a file - Success", t, func() {
				err := dao.DelNode(ctx, mockNode)
				So(err, ShouldBeNil)

				So(dao.Flush(ctx, true), ShouldBeNil)
			})

			Convey("Re-adding a file - Success", t, func() {
				err := dao.insertNode(ctx, mockNode)
				So(err, ShouldBeNil)

				So(dao.Flush(ctx, true), ShouldBeNil)
			})

			Convey("Re-adding the same file - Failure", t, func() {
				err := dao.insertNode(ctx, mockNode)
				if err != nil {
					So(err, ShouldEqual, gorm.ErrDuplicatedKey)
				} else {
					// We're in cache mode, the flush should error
					err = dao.Flush(ctx, true)
					So(err, ShouldEqual, gorm.ErrDuplicatedKey)
				}
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
				node, err := dao.GetNodeByMPath(ctx, tree.NewMPath(1))
				So(err, ShouldBeNil)

				// Setting MTime to 0 so we can compare
				// node.GetNode().SetMTime(0)

				So(node.GetNode(), ShouldResemble, mockNode.Node)

				So(dao.Flush(ctx, true), ShouldBeNil)
			})

			// Setting a file
			Convey("Test setting a file with a massive path - Success", t, func() {
				err := dao.insertNode(ctx, proto.Clone(mockLongNode).(*tree.TreeNode))
				So(err, ShouldBeNil)

				err = dao.insertNode(ctx, proto.Clone(mockLongNodeChild1).(*tree.TreeNode))
				So(err, ShouldBeNil)

				err = dao.insertNode(ctx, proto.Clone(mockLongNodeChild2).(*tree.TreeNode))
				So(err, ShouldBeNil)

				//printTree()
				//printNodes()

				node, err := dao.GetNodeByMPath(ctx, mockLongNodeChild2MPath)
				So(err, ShouldBeNil)

				So(dao.Flush(ctx, true), ShouldBeNil)

				// Reset for comparison
				node.GetNode().SetMTime(0)
				So(node.GetNode(), ShouldResemble, mockLongNodeChild2.Node)
			})

			Convey("Test Getting a node by uuid - Success", t, func() {
				node, err := dao.GetNodeByUUID(ctx, "mockLongNode")
				So(err, ShouldBeNil)

				node.GetNode().SetMTime(0)
				So(node.GetNode(), ShouldResemble, mockLongNode.Node)
			})

			// Getting a file
			Convey("Test Getting a child node", t, func() {

				node, err := dao.getNodeChild(ctx, mockLongNodeMPath, "mockLongNodeChild1")

				So(err, ShouldBeNil)

				node.GetNode().SetMTime(0)
				So(node.GetNode(), ShouldResemble, mockLongNodeChild1.Node)
			})

			// Setting a file
			Convey("Test Getting the last child of a node", t, func() {

				node, err := dao.getNodeLastChild(ctx, mockLongNodeMPath)

				So(err, ShouldBeNil)

				node.GetNode().SetMTime(0)
				So(node.GetNode(), ShouldNotResemble, mockLongNodeChild1.Node)
				So(node.GetNode(), ShouldResemble, mockLongNodeChild2.Node)
			})

			// Getting children count
			Convey("Test Getting the Children Count of a node", t, func() {
				folderCount, leafCount := dao.GetNodeChildrenCounts(ctx, mockLongNodeMPath, false)

				So(dao.Flush(ctx, true), ShouldBeNil)

				So(folderCount, ShouldEqual, 0)
				So(leafCount, ShouldEqual, 2)
			})

			// Getting children count
			Convey("Test Getting the Children Cumulated Size", t, func() {
				currentDAO := NewFolderSizeCacheDAO(dao)
				root, _ := currentDAO.GetNodeByUUID(ctx, "ROOT")
				parent, _ := currentDAO.GetNodeByMPath(ctx, mockLongNodeMPath)

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

				err := currentDAO.insertNode(ctx, newNode)
				So(err, ShouldBeNil)

				So(currentDAO.Flush(ctx, true), ShouldBeNil)

				root, _ = currentDAO.GetNodeByUUID(ctx, "ROOT")
				parent, _ = currentDAO.GetNodeByMPath(ctx, mockLongNodeMPath)

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
				parent, _ = currentDAO.GetNodeByMPath(ctx, mockLongNodeMPath)

				So(parent.GetNode().GetSize(), ShouldEqual, mockLongNodeChild1.GetNode().GetSize()+mockLongNodeChild2.GetNode().GetSize())
				So(root.GetNode().GetSize(), ShouldEqual, parent.GetNode().GetSize()+newNode.GetNode().GetSize())

				err = currentDAO.DelNode(ctx, movedNewNode)
				So(err, ShouldBeNil)

				root, _ = currentDAO.GetNodeByUUID(ctx, "ROOT")
				parent, _ = currentDAO.GetNodeByMPath(ctx, mockLongNodeMPath)

				So(parent.GetNode().GetSize(), ShouldEqual, mockLongNodeChild1.GetNode().GetSize()+mockLongNodeChild2.GetNode().GetSize())
				So(root.GetNode().GetSize(), ShouldEqual, parent.GetNode().GetSize())

			})

			// Setting a file
			Convey("Test Getting the Children Count of a node", t, func() {
				folderCount, leafCount := dao.GetNodeChildrenCounts(ctx, mockLongNodeMPath, true)

				So(dao.Flush(ctx, true), ShouldBeNil)

				So(folderCount, ShouldEqual, 0)
				So(leafCount, ShouldEqual, 2)
			})

			// Setting a file
			Convey("Test Getting the Children of a node", t, func() {
				var i int
				for _ = range dao.GetNodeChildren(context.Background(), mockLongNodeMPath) {
					i++
				}

				So(dao.Flush(ctx, true), ShouldBeNil)

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

				So(dao.Flush(ctx, true), ShouldBeNil)
			})

			// Setting a file
			Convey("Test Getting Nodes by MPath", t, func() {
				var i int
				for _ = range dao.GetNodesByMPaths(ctx, mockLongNodeChild1MPath, mockLongNodeChild2MPath) {
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

				So(dao.Flush(ctx, true), ShouldBeNil)
			})

			// Setting a mpath multiple times
			Convey("Setting a same mpath multiple times", t, func() {
				node1 := &tree.TreeNode{}
				node1.Node = &tree.Node{Uuid: "test-same-mpath", Type: tree.NodeType_LEAF}
				node1.SetMPath(tree.NewMPath(1, 21, 12, 7))
				err := dao.insertNode(ctx, node1)
				So(err, ShouldBeNil)

				node2 := &tree.TreeNode{}
				node2.Node = &tree.Node{Uuid: "test-same-mpath2", Type: tree.NodeType_LEAF}
				node2.SetMPath(tree.NewMPath(1, 21, 12, 7))
				err = dao.insertNode(ctx, node2)
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

				e := dao.insertNode(ctx, node1)
				So(e, ShouldBeNil)
				e = dao.insertNode(ctx, node2)
				So(e, ShouldBeNil)
				e = dao.insertNode(ctx, node11)
				So(e, ShouldBeNil)
				e = dao.insertNode(ctx, node21)
				So(e, ShouldBeNil)

				So(dao.Flush(ctx, true), ShouldBeNil)

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

				e := dao.insertNode(ctx, node)
				So(e, ShouldBeNil)
				e = dao.insertNode(ctx, node11)
				So(e, ShouldBeNil)
				e = dao.insertNode(ctx, node12)
				So(e, ShouldBeNil)
				e = dao.insertNode(ctx, node13)
				So(e, ShouldBeNil)
				e = dao.insertNode(ctx, node14)
				So(e, ShouldBeNil)
				e = dao.insertNode(ctx, node15)
				So(e, ShouldBeNil)

				So(dao.Flush(ctx, true), ShouldBeNil)

				e = dao.ResyncDirtyEtags(nil, node)
				So(e, ShouldBeNil)
				intermediaryNode, e := dao.GetNodeByMPath(ctx, node13.MPath)
				So(e, ShouldBeNil)
				hash := md5.New()
				hash.Write([]byte(etag3 + "." + etag4))
				newEtag := hex.EncodeToString(hash.Sum(nil))
				So(intermediaryNode.GetNode().GetEtag(), ShouldEqual, newEtag)

				parentNode, e := dao.GetNodeByMPath(ctx, node.MPath)
				So(e, ShouldBeNil)
				hash2 := md5.New()
				hash2.Write([]byte(etag2 + "." + etag1 + "." + intermediaryNode.GetNode().GetEtag()))
				newEtag2 := hex.EncodeToString(hash2.Sum(nil))
				So(parentNode.GetNode().GetEtag(), ShouldEqual, newEtag2)

			})
		}
	}, true)
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
					_, createdNodes, err := dao.GetOrCreateNodeByPath(ctx, path, &tree.Node{Uuid: uuid.New()})
					So(err, ShouldBeNil)

					nodes = append(nodes, createdNodes...)
				}

				So(len(nodes), ShouldEqual, 6)

				// No Children yet, should return 1
				slot, e := dao.getNodeFirstAvailableChildIndex(ctx, nodes[0].GetMPath())
				So(e, ShouldBeNil)
				So(slot, ShouldEqual, 5)

				So(dao.Flush(ctx, true), ShouldBeNil)
			})
		}
	}, true)
}

func TestStreams(t *testing.T) {
	ctx := context.Background()

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			Convey("Adding nodes in stream", t, func() {

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

				idx, err := dao.getNodeFirstAvailableChildIndex(ctx, tree.NewMPath(1, 17))
				So(err, ShouldBeNil)
				So(idx, ShouldEqual, count+1)
			})
		}
	})
}

func TestArborescence(t *testing.T) {
	ctx := context.Background()

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {

			arborescence := []string{
				"/ROOT",
			}

			Convey("Load tree from file", t, func() {

				readFile, err := os.Open("./testdata/tree1.txt")

				if err != nil {
					fmt.Println(err)
				}
				fileScanner := bufio.NewScanner(readFile)
				fileScanner.Split(bufio.ScanLines)

				for fileScanner.Scan() {
					line := fileScanner.Text()
					arborescence = append(arborescence, "/ROOT/"+line)
				}

				So(len(arborescence), ShouldBeGreaterThan, 2)
			})

			Convey("Create Nodes", t, func() {

				for _, path := range arborescence {
					t.Logf("Adding node %s", path)
					_, _, err := dao.GetOrCreateNodeByPath(ctx, path, &tree.Node{Uuid: uuid.New()})
					So(err, ShouldBeNil)
				}

				So(dao.Flush(ctx, true), ShouldBeNil)

			})

			Convey("List Arbo w/ conditions", t, func() {
				c := dao.GetNodeTree(context.Background(), tree.NewMPath(1))
				var a []string
				for n := range c {
					if node, ok := n.(tree.ITreeNode); ok {
						a = append(a, node.GetName())
					}
				}

				So(len(a), ShouldEqual, len(arborescence))
				So(a[0], ShouldEqual, "ROOT") // Default sorting is MPATH
			})

			Convey("List Arbo w/ ordering", t, func() {
				mf := tree.NewMetaFilter(&tree.Node{})
				mf.AddSort(tree.MetaSortMPath, tree.MetaSortName, true)
				c := dao.GetNodeTree(context.Background(), tree.NewMPath(1), mf)
				var a []string
				for n := range c {
					if node, ok := n.(tree.ITreeNode); ok {
						a = append(a, node.GetName())
						t.Logf("Got node %s:%s", node.GetMPath().ToString(), node.GetName())
					}
				}
				So(len(a), ShouldEqual, len(arborescence))
				So(a[0], ShouldEqual, "zzz.txt")
			})
		}
	}, true)
}

func TestSecondArborescence(t *testing.T) {
	ctx := context.Background()

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {

			arborescence := []string{
				"/ROOT",
			}

			Convey("Load tree from file", t, func() {

				readFile, err := os.Open("./testdata/tree2.txt")

				if err != nil {
					fmt.Println(err)
				}
				fileScanner := bufio.NewScanner(readFile)
				fileScanner.Split(bufio.ScanLines)

				for fileScanner.Scan() {
					line := fileScanner.Text()
					arborescence = append(arborescence, "/ROOT/"+line)
				}

				So(len(arborescence), ShouldBeGreaterThan, 2)
			})

			Convey("Create Nodes", t, func() {

				for _, path := range arborescence {
					t.Logf("Adding node %s", path)
					_, _, err := dao.GetOrCreateNodeByPath(ctx, path, &tree.Node{Uuid: uuid.New()})
					So(err, ShouldBeNil)
				}

				e := dao.Flush(ctx, true)
				So(e, ShouldBeNil)

			})

			Convey("List Arbo w/o conditions", t, func() {
				c := dao.GetNodeTree(context.Background(), tree.NewMPath(1))
				var a []string
				for n := range c {
					if node, ok := n.(tree.ITreeNode); ok {
						a = append(a, node.GetName())
					}
				}

				So(len(a), ShouldEqual, len(arborescence))
				So(a[0], ShouldEqual, "ROOT") // Default sorting is MPATH
			})

		}
	}, true)
}

func hashNode(mpath *tree.MPath) string {
	ha := sha1.New()
	ha.Write([]byte(mpath.ToString()))
	return hex.EncodeToString(ha.Sum(nil))
}

func hashParent(name string, mpath *tree.MPath) string {
	h := sha1.New()
	parent := mpath.Parent()
	io.WriteString(h, name)
	io.WriteString(h, "__###PARENT_HASH###__")
	io.WriteString(h, parent.GetMPath1())
	io.WriteString(h, parent.GetMPath2())
	io.WriteString(h, parent.GetMPath3())
	io.WriteString(h, parent.GetMPath4())
	return hex.EncodeToString(h.Sum(nil))
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
					"/test copie/1/2/3/4/whatever-else",
					"/test copie/1/2/3/4/whatever-else/child",
					"/test copie/1/2/3/4/whatever-else/child1",
					"/document sans titre",
					"/document sans titre/.pydio",
					"/document sans titre/target",
					"/document sans titre/mobile_header.jpg",
					"/document sans titre/mobile-header.jpg",
				}

				// Creating the arborescence
				nodes := make(map[string]*tree.MPath)
				for _, path := range arborescence {
					mN, cc, err := dao.GetOrCreateNodeByPath(ctx, path, &tree.Node{Uuid: slug.Make(path)})
					So(err, ShouldBeNil)
					So(len(cc), ShouldBeGreaterThanOrEqualTo, 1) // First is 2 as the ROOT is created, then 1
					nodes[path] = mN.GetMPath()
				}

				So(dao.Flush(ctx, false), ShouldBeNil)

				// Then we move a node
				originalNode, err := dao.GetNodeByPath(ctx, "/test copie/1/2/3/4")
				So(err, ShouldBeNil)
				pathFrom := originalNode.GetMPath()
				So(hashNode(pathFrom), ShouldEqual, originalNode.GetHash())
				So(hashParent(originalNode.GetName(), pathFrom), ShouldEqual, originalNode.GetHash2())

				nodeTo, err := dao.GetNodeByPath(ctx, "/document sans titre/target")
				So(err, ShouldBeNil)

				So(dao.Flush(ctx, false), ShouldBeNil)

				// Then we move a node
				nodeFrom, _ := dao.GetNodeByMPath(ctx, pathFrom)

				// First of all, we delete the existing node
				if nodeTo != nil {
					err = dao.DelNode(ctx, nodeTo)
					So(err, ShouldBeNil)
				}

				So(dao.Flush(ctx, false), ShouldBeNil)

				err = dao.MoveNodeTree(ctx, nodeFrom, nodeTo)
				So(err, ShouldBeNil)

				newNode, err := dao.GetNodeByPath(ctx, "/document sans titre/target/whatever")
				So(err, ShouldBeNil)
				newPath := newNode.GetMPath()

				So(originalNode.GetHash(), ShouldNotEqual, newNode.GetHash())
				So(hashNode(newPath), ShouldEqual, newNode.GetHash())
				So(hashParent(newNode.GetName(), newPath), ShouldEqual, newNode.GetHash2())

				_, err = dao.GetNodeByPath(ctx, "/document sans titre/target/whatever2")
				So(err, ShouldNotBeNil)

				_, _, err = dao.GetOrCreateNodeByPath(ctx, "/document sans titre/target/whatever2", &tree.Node{Uuid: uuid.New()})
				So(err, ShouldBeNil)

				// printTree(ctxWithCache)
				// printNodes(ctxWithCache)

				So(dao.Flush(ctx, true), ShouldBeNil)
			})
		}
	}, true)
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
					_, _, err := dao.GetOrCreateNodeByPath(ctx, path, &tree.Node{Uuid: uuid.New()})
					So(err, ShouldBeNil)
				}

				So(dao.Flush(ctx, true), ShouldBeNil)
			})
		}
	})
}

func TestIntermediaryFoldersCreation(t *testing.T) {
	ctx := context.Background()

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			Convey("Adding a file with intermediary folders", t, func() {

				_, cc, err := dao.GetOrCreateNodeByPath(ctx, "/pydiods1/some/folder/to/file.txt", &tree.Node{Uuid: uuid.New()})
				So(err, ShouldBeNil)
				So(cc, ShouldHaveLength, 6)

				So(dao.Flush(ctx, true), ShouldBeNil)
			})
		}
	})
}

func TestFlatFolderWithMassiveChildren(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping test in short mode.")
	}

	ctx := context.Background()

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			Convey("Testing a flat folder with tons of children", t, func() {
				var i int
				start := time.Now()
				s := time.Now()
				var nodes []tree.ITreeNode
				for i = 0; i < 5001; i++ {
					_, node, er := dao.GetOrCreateNodeByPath(ctx, fmt.Sprintf("/child-%d", i), &tree.Node{Uuid: uuid.New()})
					if i == 0 {
						So(er, ShouldBeNil)
					}
					nodes = append(nodes, node[0])
					if i > 0 && i%500 == 0 {
						t.Logf("\nInserted %d - avg %v", i, time.Now().Sub(s)/1000)
						s = time.Now()
					}
					if i == 5005 {
						// Create a missing number + cache usage
						_ = dao.DelNode(ctx, nodes[2])
					} else if i == 5010 {
						// Create a missing number and wait for cache to be expired
						_ = dao.DelNode(ctx, nodes[1])
					}
				}
				fn := time.Now()
				So(dao.Flush(ctx, false), ShouldBeNil)
				t.Logf("Flushed in %v, total took %v", time.Since(fn), time.Since(start))
			})
		}
	}, true)
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
					_, _, err := dao.GetOrCreateNodeByPath(ctx, path, &tree.Node{Uuid: uuid.New()})
					So(err, ShouldBeNil)
				}
				So(dao.Flush(ctx, true), ShouldBeNil)

				mp, err := dao.GetNodeByPath(ctx, "/Test_Folder")
				So(errors.Is(err, errors.NodeNotFound), ShouldBeTrue)
				So(mp, ShouldBeNil)

				mp, err = dao.GetNodeByPath(ctx, "/Test%Folder")
				So(errors.Is(err, errors.NodeNotFound), ShouldBeTrue)
				So(mp, ShouldBeNil)
			})
		}
	}, true)
}

func TestLostAndFoundDuplicates(t *testing.T) {
	ctx := context.Background()

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			Convey("Test LostAndFound - Duplicates", t, func() {
				// Create Duplicates on purpose
				_, _, _ = dao.GetOrCreateNodeByPath(ctx, "/folder", &tree.Node{Uuid: uuid.New()})
				_, _, _ = dao.GetOrCreateNodeByPath(ctx, "/folder/file1", &tree.Node{Uuid: uuid.New()})
				_, _, _ = dao.GetOrCreateNodeByPath(ctx, "/folder/file2", &tree.Node{Uuid: uuid.New()})
				So(dao.Flush(ctx, true), ShouldBeNil)

				// Rename file2 to file1 manually
				gi := dao.(*gormImpl[*tree.TreeNode])
				db := gi.instance(ctx)
				model := gi.factory.Struct()
				tx := db.Model(model).Where("name=?", "file2").Update("name", "file1")
				So(tx.Error, ShouldBeNil)

				ll, er := dao.LostAndFounds(ctx)
				So(er, ShouldBeNil)
				So(ll, ShouldHaveLength, 1)
				So(ll[0].GetUUIDs(), ShouldHaveLength, 2)
			})
		}
	})

}

func TestVeryDeepPath(t *testing.T) {
	ctx := context.Background()
	var pp1 []string
	for i := 0; i < 127; i++ {
		pp1 = append(pp1, "1")
	}
	fPath1 := "/" + strings.Join(pp1, "/")
	var pp []string
	for i := 0; i < 510; i++ {
		pp = append(pp, "1")
	}
	fPath := "/" + strings.Join(pp, "/")
	sql.TestPrintQueries = true
	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			Convey("VeryDeepPath 127 - TODO Bigger is failing", t, func() {
				_, _, er := dao.GetOrCreateNodeByPath(ctx, fPath1, &tree.Node{Uuid: uuid.New(), Type: tree.NodeType_COLLECTION})
				So(er, ShouldBeNil)
				tn, er := dao.GetNodeByPath(ctx, fPath1)
				So(er, ShouldBeNil)
				So(tn, ShouldNotBeNil)
			})
			// todo @ghecquet
			Convey("Test Very Deep Path 255", t, func() {
				_, _, er := dao.GetOrCreateNodeByPath(ctx, fPath, &tree.Node{Uuid: uuid.New(), Type: tree.NodeType_COLLECTION})
				So(er, ShouldBeNil)
				tn, er := dao.GetNodeByPath(ctx, fPath)
				So(er, ShouldBeNil)
				So(tn, ShouldNotBeNil)
			})
		}
	})
}

func TestMoveVeryDeepPath(t *testing.T) {
	ctx := context.Background()
	var pp []string
	for i := 0; i < 510; i++ { // This creates a 1020 = 255*4 mpath = max index length
		pp = append(pp, "1")
	}
	fPath := "/" + strings.Join(pp, "/")
	fPathChild := fPath + "/child"
	uid := uuid.New()
	uidChild := uuid.New()
	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			Convey("Test MoveVeryDeepPath - Max Length", t, func() {
				node, _, er := dao.GetOrCreateNodeByPath(ctx, fPath, &tree.Node{Uuid: uid, Type: tree.NodeType_COLLECTION})
				So(er, ShouldBeNil)

				var childNode tree.ITreeNode
				if len(pp) < 508 {
					childNode, _, er = dao.GetOrCreateNodeByPath(ctx, fPathChild, &tree.Node{Uuid: uidChild, Type: tree.NodeType_LEAF})
					So(er, ShouldBeNil)
				}

				newNode, _, er := dao.GetOrCreateNodeByPath(ctx, "/root", &tree.Node{Uuid: uuid.New(), Type: tree.NodeType_LEAF})
				So(er, ShouldBeNil)

				movedNewNode := &tree.TreeNode{}
				movedNewNode.SetNode(&tree.Node{
					Uuid: uid,
					Type: tree.NodeType_LEAF,
				})
				movedNewNode.SetMPath(newNode.GetMPath().Append(1))
				movedNewNode.SetName("testleaf")
				targetMpath1 := movedNewNode.GetMPath().MPath1
				targetMpath2 := movedNewNode.GetMPath().MPath2
				targetMpath3 := movedNewNode.GetMPath().MPath3
				targetMpath4 := movedNewNode.GetMPath().MPath4

				sql.TestPrintQueries = true
				if er := dao.MoveNodeTree(ctx, node, movedNewNode); er != nil {
					So(er, ShouldBeNil)
				}
				sql.TestPrintQueries = false

				testNode, er := dao.GetNodeByUUID(ctx, uid)
				So(er, ShouldBeNil)
				So(testNode.GetMPath().MPath1, ShouldEqual, targetMpath1)
				So(testNode.GetMPath().MPath2, ShouldEqual, targetMpath2)
				So(testNode.GetMPath().MPath3, ShouldEqual, targetMpath3)
				So(testNode.GetMPath().MPath4, ShouldEqual, targetMpath4)

				if childNode != nil {
					testChildNode, er := dao.GetNodeByUUID(ctx, uidChild)
					So(er, ShouldBeNil)
					So(testChildNode.GetNode().GetType(), ShouldEqual, childNode.GetNode().GetType())
					So(testChildNode.GetMPath().MPath1, ShouldEqual, "1.2.1.1")
					So(testChildNode.GetMPath().MPath2, ShouldEqual, "")
					So(testChildNode.GetMPath().MPath3, ShouldEqual, "")
					So(testChildNode.GetMPath().MPath4, ShouldEqual, "")
				}

			})
		}
	})
}

func TestMoveVeryDeepPathWithChildren(t *testing.T) {
	ctx := context.Background()
	var pp []string
	for i := 0; i < 500; i++ {
		pp = append(pp, "1")
	}
	fPath := "/" + strings.Join(pp, "/")
	fPathChild := fPath + "/child"
	uid := uuid.New()
	uidChild := uuid.New()
	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			Convey("Test MoveVeryDeepPath - With Children", t, func() {
				node, _, er := dao.GetOrCreateNodeByPath(ctx, fPath, &tree.Node{Uuid: uid, Type: tree.NodeType_COLLECTION})
				So(er, ShouldBeNil)

				var childNode tree.ITreeNode
				childNode, _, er = dao.GetOrCreateNodeByPath(ctx, fPathChild, &tree.Node{Uuid: uidChild, Type: tree.NodeType_LEAF})
				So(er, ShouldBeNil)

				newNode, _, er := dao.GetOrCreateNodeByPath(ctx, "/root", &tree.Node{Uuid: uuid.New(), Type: tree.NodeType_LEAF})
				So(er, ShouldBeNil)

				movedNewNode := &tree.TreeNode{}
				movedNewNode.SetNode(&tree.Node{
					Uuid: uid,
					Type: tree.NodeType_LEAF,
				})
				movedNewNode.SetMPath(newNode.GetMPath().Append(1))
				movedNewNode.SetName("testleaf")
				targetMpath1 := movedNewNode.GetMPath().MPath1
				targetMpath2 := movedNewNode.GetMPath().MPath2
				targetMpath3 := movedNewNode.GetMPath().MPath3
				targetMpath4 := movedNewNode.GetMPath().MPath4

				sql.TestPrintQueries = true
				if er := dao.MoveNodeTree(ctx, node, movedNewNode); er != nil {
					So(er, ShouldBeNil)
				}
				sql.TestPrintQueries = false

				testNode, er := dao.GetNodeByUUID(ctx, uid)
				So(er, ShouldBeNil)
				So(testNode.GetMPath().MPath1, ShouldEqual, targetMpath1)
				So(testNode.GetMPath().MPath2, ShouldEqual, targetMpath2)
				So(testNode.GetMPath().MPath3, ShouldEqual, targetMpath3)
				So(testNode.GetMPath().MPath4, ShouldEqual, targetMpath4)

				testChildNode, er := dao.GetNodeByUUID(ctx, uidChild)
				So(er, ShouldBeNil)
				So(testChildNode.GetNode().GetType(), ShouldEqual, childNode.GetNode().GetType())
				So(testChildNode.GetMPath().MPath1, ShouldEqual, "1.2.1.1")
				So(testChildNode.GetMPath().MPath2, ShouldEqual, "")
				So(testChildNode.GetMPath().MPath3, ShouldEqual, "")
				So(testChildNode.GetMPath().MPath4, ShouldEqual, "")

			})
		}
	})
}

func SkipTestMoveVeryDeepPathScenario(t *testing.T) {
	ctx := context.Background()
	var pp []string
	for i := 0; i < 255; i++ {
		pp = append(pp, "1")
	}
	fPath := "/personal/user/source/" + strings.Join(pp, "/")

	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {
			Convey("Test MoveVeryDeepPath - Scenario", t, func() {
				_, created, er := dao.GetOrCreateNodeByPath(ctx, fPath, &tree.Node{Type: tree.NodeType_COLLECTION})
				So(er, ShouldBeNil)
				So(len(created), ShouldEqual, 259)

				nodeFrom, cc, er := dao.GetOrCreateNodeByPath(ctx, "/personal/user/source", &tree.Node{})
				So(er, ShouldBeNil)
				So(len(cc), ShouldEqual, 0)
				So(nodeFrom, ShouldNotBeNil)

				// Create target to find the MPath
				nodeTo, cc2, er := dao.GetOrCreateNodeByPath(ctx, "/personal/user/inside/target", &tree.Node{})
				So(er, ShouldBeNil)
				So(len(cc2), ShouldEqual, 2)
				So(nodeTo, ShouldNotBeNil)
				// And delete it
				er = dao.DelNode(ctx, nodeTo)
				So(er, ShouldBeNil)

				er = dao.MoveNodeTree(ctx, nodeFrom, nodeTo)
				So(er, ShouldBeNil)
				sql.TestPrintQueries = true
				c := dao.GetNodeTree(ctx, nodeTo.GetMPath())
				count := 0
				for i := range c {
					if er, ok := i.(error); ok {
						So(er, ShouldBeNil)
					}
					count++
				}
				So(count, ShouldEqual, len(pp))

			})
		}
	})
}

func TestLostAndFoundChildren(t *testing.T) {
	ctx := context.Background()
	testAll(t, func(dao testdao) func(t *testing.T) {
		return func(t *testing.T) {

			Convey("Test LostAndFound - Lost Children", t, func() {
				// Create Duplicates on purpose
				_, _, _ = dao.GetOrCreateNodeByPath(ctx, "/folder", &tree.Node{Uuid: uuid.New()})
				_, _, _ = dao.GetOrCreateNodeByPath(ctx, "/folder/file1", &tree.Node{Uuid: uuid.New()})
				_, _, _ = dao.GetOrCreateNodeByPath(ctx, "/folder/file2", &tree.Node{Uuid: uuid.New()})

				ll, er := dao.LostAndFounds(ctx)
				So(er, ShouldBeNil)
				So(ll, ShouldHaveLength, 0)

				// Rename file2 to file1 manually
				gi := dao.(*gormImpl[*tree.TreeNode])
				db := gi.instance(ctx)
				model := gi.factory.Struct()
				tx := db.Where("name = ?", "folder").Delete(model)
				So(tx.Error, ShouldBeNil)
				So(tx.RowsAffected, ShouldEqual, 1)

				ll, er = dao.LostAndFounds(ctx)
				So(er, ShouldBeNil)
				So(ll, ShouldHaveLength, 2)
			})
		}
	})
}

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
//			d := dao.(*sessionDAO)
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
