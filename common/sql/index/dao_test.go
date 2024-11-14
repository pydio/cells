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
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/spf13/viper"
	"log"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/proto/tree"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/utils/mtree"
)

var (
	ctxNoCache context.Context
)

func init() {
	v := viper.New()
	v.SetDefault(runtime.KeyCache, "discard://")
	v.SetDefault(runtime.KeyShortCache, "discard://")
	runtime.SetRuntime(v)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	SetDefaultFailureMode(FailureContinues)
	wrapper := func(ctx context.Context, d dao.DAO) (dao.DAO, error) {
		return NewDAO(d, "ROOT"), nil
	}

	d, er := dao.InitDAO(ctx, sqlite.Driver, "file::memnocache:?mode=memory&cache=shared", "test1", wrapper, options)
	if er != nil {
		panic(er)
	} else {
		ctxNoCache = servicecontext.WithDAO(ctx, d)
	}
}

func makeDAO() dao.DAO {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	wrapper := func(ctx context.Context, d dao.DAO) (dao.DAO, error) {
		return NewDAO(d, "ROOT"), nil
	}
	v := viper.New()
	v.SetDefault(runtime.KeyCache, "discard://")
	v.SetDefault(runtime.KeyShortCache, "discard://")
	runtime.SetRuntime(v)
	d, er := dao.InitDAO(ctx, sqlite.Driver, "file::memnocache:?mode=memory&cache=shared", "test2", wrapper, options)
	if er != nil {
		panic(er)
	}
	return d
}

func TestMysql(t *testing.T) {

	// Adding a file
	Convey("Test adding a file - Success", t, func() {
		err := getDAO(ctxNoCache).AddNode(mockNode)
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

		err := getDAO(ctxNoCache).SetNode(newNode)
		So(err, ShouldBeNil)

		// printTree()
		// printNodes()

		err = getDAO(ctxNoCache).SetNode(mockNode)
		So(err, ShouldBeNil)
	})

	// Updating a file meta
	Convey("Test updating a file meta", t, func() {

		err := getDAO(ctxNoCache).AddNode(updateNode)
		So(err, ShouldBeNil)

		updateNode.UpdateEtag("etag2")
		updateNode.UpdateSize(24)

		err = getDAO(ctxNoCache).SetNodeMeta(updateNode)
		So(err, ShouldBeNil)

		updated, err := getDAO(ctxNoCache).GetNode(updateNode.MPath)
		So(err, ShouldBeNil)
		So(updated.GetEtag(), ShouldEqual, "etag2")
		So(updated.GetSize(), ShouldEqual, 24)
	})

	// Delete a file
	// TODO - needs to be deleted by UUID
	Convey("Test deleting a file - Success", t, func() {
		err := getDAO(ctxNoCache).DelNode(mockNode)
		So(err, ShouldBeNil)

		// printTree()
		// printNodes()
	})

	Convey("Re-adding a file - Success", t, func() {
		err := getDAO(ctxNoCache).AddNode(mockNode)
		So(err, ShouldBeNil)

		//printTree()
		//printNodes()
	})

	Convey("Re-adding the same file - Failure", t, func() {
		err := getDAO(ctxNoCache).AddNode(mockNode)
		So(err, ShouldNotBeNil)

		// printTree()
		// printNodes()
	})

	Convey("Test Getting a file - Success", t, func() {

		node, err := getDAO(ctxNoCache).GetNode([]uint64{1})
		So(err, ShouldBeNil)

		// Setting MTime to 0 so we can compare
		node.UpdateMTime(0)

		So(node.AsProto(), ShouldResemble, mockNode.AsProto())
	})

	// Setting a file
	Convey("Test setting a file with a massive path - Success", t, func() {

		err := getDAO(ctxNoCache).AddNode(mockLongNode)
		So(err, ShouldBeNil)

		err = getDAO(ctxNoCache).AddNode(mockLongNodeChild1)
		So(err, ShouldBeNil)

		err = getDAO(ctxNoCache).AddNode(mockLongNodeChild2)
		So(err, ShouldBeNil)

		//printTree()
		//printNodes()

		node, err := getDAO(ctxNoCache).GetNode(mockLongNodeChild2MPath)
		So(err, ShouldBeNil)

		// TODO - find a way
		node.UpdateMTime(0)
		node.UpdatePath(mockLongNodeChild2.GetPath())

		So(node.AsProto(), ShouldResemble, mockLongNodeChild2.AsProto())
	})

	Convey("Test Getting a node by uuid - Success", t, func() {
		node, err := getDAO(ctxNoCache).GetNodeByUUID("mockLongNode")
		So(err, ShouldBeNil)

		// Setting MTime to 0 so we can compare
		node.UpdateMTime(0)
		node.UpdateSize(0)
		node.UpdatePath("mockLongNode")

		So(node.AsProto(), ShouldResemble, mockLongNode.AsProto())
	})

	// Getting a file
	Convey("Test Getting a child node", t, func() {

		node, err := getDAO(ctxNoCache).GetNodeChild(mockLongNodeMPath, "mockLongNodeChild1")

		So(err, ShouldBeNil)

		// TODO - find a way
		node.UpdateMTime(0)
		node.UpdatePath(mockLongNodeChild1.GetPath())

		So(node.AsProto(), ShouldNotResemble, mockLongNodeChild2.AsProto())
		So(node.AsProto(), ShouldResemble, mockLongNodeChild1.AsProto())
	})

	// Setting a file
	Convey("Test Getting the last child of a node", t, func() {

		node, err := getDAO(ctxNoCache).GetNodeLastChild(mockLongNodeMPath)

		So(err, ShouldBeNil)

		// TODO - find a way
		node.UpdateMTime(0)
		node.UpdatePath(mockLongNodeChild2.GetPath())

		So(node.AsProto(), ShouldNotResemble, mockLongNodeChild1.AsProto())
		So(node.AsProto(), ShouldResemble, mockLongNodeChild2.AsProto())
	})

	// Getting children count
	Convey("Test Getting the Children Count of a node", t, func() {

		_, count := getDAO(ctxNoCache).GetNodeChildrenCounts(mockLongNodeMPath, false)

		So(count, ShouldEqual, 2)
	})

	// Getting children count
	Convey("Test Getting the Children Cumulated Size", t, func() {
		currentDAO := NewFolderSizeCacheDAO(getDAO(ctxNoCache))
		root, _ := currentDAO.GetNodeByUUID("ROOT")
		parent, _ := currentDAO.GetNode(mockLongNodeMPath)

		So(parent.GetSize(), ShouldEqual, mockLongNodeChild1.GetSize()+mockLongNodeChild2.GetSize())
		So(root.GetSize(), ShouldEqual, parent.GetSize())

		// Add new node and check size
		newNode := NewNode(&tree.Node{
			Uuid: "newNodeFolderSize",
			Type: tree.NodeType_LEAF,
			Size: 37,
		}, append(mockLongNode.MPath, 37), []string{"newNodeFolderSize"})

		err := currentDAO.AddNode(newNode)
		So(err, ShouldBeNil)

		root, _ = currentDAO.GetNodeByUUID("ROOT")
		parent, _ = currentDAO.GetNode(mockLongNodeMPath)

		So(parent.GetSize(), ShouldEqual, mockLongNodeChild1.GetSize()+mockLongNodeChild2.GetSize()+newNode.GetSize())
		So(root.GetSize(), ShouldEqual, parent.GetSize())

		// Move the node and check size
		movedNewNode := NewNode(&tree.Node{
			Uuid: "newNodeFolderSize",
			Type: tree.NodeType_LEAF,
			Size: 37,
		}, append(root.MPath, 37), []string{"newNodeFolderSize"})

		err = currentDAO.MoveNodeTree(newNode, movedNewNode)
		So(err, ShouldBeNil)

		root, _ = currentDAO.GetNodeByUUID("ROOT")
		parent, _ = currentDAO.GetNode(mockLongNodeMPath)

		So(parent.GetSize(), ShouldEqual, mockLongNodeChild1.GetSize()+mockLongNodeChild2.GetSize())
		So(root.GetSize(), ShouldEqual, parent.GetSize()+newNode.GetSize())

		err = currentDAO.DelNode(movedNewNode)
		So(err, ShouldBeNil)

		root, _ = currentDAO.GetNodeByUUID("ROOT")
		parent, _ = currentDAO.GetNode(mockLongNodeMPath)

		So(parent.GetSize(), ShouldEqual, mockLongNodeChild1.GetSize()+mockLongNodeChild2.GetSize())
		So(root.GetSize(), ShouldEqual, parent.GetSize())

	})

	// Setting a file
	Convey("Test Getting the Children of a node", t, func() {

		var i int
		for _ = range getDAO(ctxNoCache).GetNodeChildren(context.Background(), mockLongNodeMPath) {
			i++
		}

		So(i, ShouldEqual, 2)
	})

	// Setting a file
	Convey("Test Getting the Children of a node", t, func() {

		var i int
		PrintMemUsage("GetNodeTree")
		for _ = range getDAO(ctxNoCache).GetNodeTree(context.Background(), []uint64{1}) {
			i++
		}
		PrintMemUsage("GetNodeTree END")

		So(i, ShouldEqual, 3)
	})

	// Setting a file
	Convey("Test Getting Nodes by MPath", t, func() {

		var i int
		for _ = range getDAO(ctxNoCache).GetNodes(mockLongNodeChild1MPath, mockLongNodeChild2MPath) {
			i++
		}

		So(i, ShouldEqual, 2)
	})

	// Setting a file
	Convey("Setting multiple nodes at once", t, func() {
		b := getDAO(ctxNoCache).SetNodes("test", 10)

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
		node1.N = &tree.Node{Uuid: "test-same-mpath", Type: tree.NodeType_LEAF}
		node1.SetMPath(1, 21, 12, 7)
		err := getDAO(ctxNoCache).AddNode(node1)
		So(err, ShouldBeNil)

		node2 := mtree.NewTreeNode()
		node2.N = &tree.Node{Uuid: "test-same-mpath2", Type: tree.NodeType_LEAF}
		node2.SetMPath(1, 21, 12, 7)
		err = getDAO(ctxNoCache).AddNode(node2)
		So(err, ShouldNotBeNil)
	})

	Convey("Test wrong children due to same MPath start", t, func() {

		node1 := mtree.NewTreeNode()
		node1.N = &tree.Node{Uuid: "parent1", Type: tree.NodeType_COLLECTION}
		node1.SetMPath(1, 1)

		node2 := mtree.NewTreeNode()
		node2.N = &tree.Node{Uuid: "parent2", Type: tree.NodeType_COLLECTION}
		node2.SetMPath(1, 15)

		node11 := mtree.NewTreeNode()
		node11.N = &tree.Node{Uuid: "child1.1", Type: tree.NodeType_COLLECTION}
		node11.SetMPath(1, 1, 1)

		node21 := mtree.NewTreeNode()
		node21.N = &tree.Node{Uuid: "child2.1", Type: tree.NodeType_COLLECTION}
		node21.SetMPath(1, 15, 1)

		e := getDAO(ctxNoCache).AddNode(node1)
		So(e, ShouldBeNil)
		e = getDAO(ctxNoCache).AddNode(node2)
		So(e, ShouldBeNil)
		e = getDAO(ctxNoCache).AddNode(node11)
		So(e, ShouldBeNil)
		e = getDAO(ctxNoCache).AddNode(node21)
		So(e, ShouldBeNil)

		// List Root
		nodes := getDAO(ctxNoCache).GetNodeChildren(context.Background(), mtree.MPath{1})
		count := 0
		for range nodes {
			count++
		}
		So(count, ShouldEqual, 2)

		// List Parent1 Children
		nodes = getDAO(ctxNoCache).GetNodeTree(context.Background(), mtree.MPath{1})
		count = 0
		for c := range nodes {
			log.Println(c)
			count++
		}
		So(count, ShouldEqual, 8) // Because of previous tests there are other nodes

		// List Parent1 Children
		nodes = getDAO(ctxNoCache).GetNodeChildren(context.Background(), mtree.MPath{1, 1})
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
		node.N = &tree.Node{Uuid: "etag-parent-folder", Type: tree.NodeType_COLLECTION}
		node.SetMPath(1, 16)
		node.UpdateEtag("-1")

		node11 := mtree.NewTreeNode()
		node11.N = &tree.Node{Uuid: "etag-child-1", Type: tree.NodeType_LEAF}
		node11.SetMPath(1, 16, 1)
		node11.UpdateEtag(etag1)
		node11.SetName("bbb")

		node12 := mtree.NewTreeNode()
		node12.N = &tree.Node{Uuid: "etag-child-2", Type: tree.NodeType_LEAF}
		node12.SetMPath(1, 16, 2)
		node12.UpdateEtag(etag2)
		node12.SetName("aaa")

		node13 := mtree.NewTreeNode()
		node13.N = &tree.Node{Uuid: "etag-child-3", Type: tree.NodeType_COLLECTION}
		node13.SetMPath(1, 16, 3)
		node13.UpdateEtag("-1")
		node13.SetName("ccc")

		node14 := mtree.NewTreeNode()
		node14.N = &tree.Node{Uuid: "etag-child-child-1", Type: tree.NodeType_LEAF}
		node14.SetMPath(1, 16, 3, 1)
		node14.UpdateEtag(etag3)
		node14.SetName("a-aaa")

		node15 := mtree.NewTreeNode()
		node15.N = &tree.Node{Uuid: "etag-child-child-2", Type: tree.NodeType_LEAF}
		node15.SetMPath(1, 16, 3, 2)
		node15.UpdateEtag(etag4)
		node15.SetName("a-bbb")

		e := getDAO(ctxNoCache).AddNode(node)
		So(e, ShouldBeNil)
		e = getDAO(ctxNoCache).AddNode(node11)
		So(e, ShouldBeNil)
		e = getDAO(ctxNoCache).AddNode(node12)
		So(e, ShouldBeNil)
		e = getDAO(ctxNoCache).AddNode(node13)
		So(e, ShouldBeNil)
		e = getDAO(ctxNoCache).AddNode(node14)
		So(e, ShouldBeNil)
		e = getDAO(ctxNoCache).AddNode(node15)
		So(e, ShouldBeNil)

		e = getDAO(ctxNoCache).ResyncDirtyEtags(node)
		So(e, ShouldBeNil)
		intermediaryNode, e := getDAO(ctxNoCache).GetNode(node13.MPath)
		So(e, ShouldBeNil)
		hash := md5.New()
		hash.Write([]byte(etag3 + "." + etag4))
		newEtag := hex.EncodeToString(hash.Sum(nil))
		So(intermediaryNode.GetEtag(), ShouldEqual, newEtag)

		parentNode, e := getDAO(ctxNoCache).GetNode(node.MPath)
		So(e, ShouldBeNil)
		hash2 := md5.New()
		hash2.Write([]byte(etag2 + "." + etag1 + "." + intermediaryNode.GetEtag()))
		newEtag2 := hex.EncodeToString(hash2.Sum(nil))
		So(parentNode.GetEtag(), ShouldEqual, newEtag2)

	})
}

func TestMoveNode(t *testing.T) {

	// Getting children count
	Convey("Test Moving Node with long mpath", t, func() {

		currentDAO := NewFolderSizeCacheDAO(getDAO(ctxNoCache))

		// RegisterIndexLen(22)

		newNode12 := NewNode(&tree.Node{
			Uuid: "nodeParent",
			Type: tree.NodeType_COLLECTION,
		}, mtree.MPath{1, 2, 3}, []string{"nodeParent"})

		if err := currentDAO.AddNode(newNode12); err != nil {
			So(err, ShouldBeNil)
		}

		// 1.2.3

		// Add new node and check size
		newNode := NewNode(&tree.Node{
			Uuid: "newNodeFolder",
			Type: tree.NodeType_COLLECTION,
		}, mtree.MPath{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, []string{"newNodeFolderSize"})

		if err := currentDAO.AddNode(newNode); err != nil {
			So(err, ShouldBeNil)
		}
		// Add new node and check size
		newNode2 := NewNode(&tree.Node{
			Uuid: "newNodeFolder2",
			Type: tree.NodeType_COLLECTION,
		}, mtree.MPath{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1}, []string{"newDeepFolder"})

		if err := currentDAO.AddNode(newNode2); err != nil {
			So(err, ShouldBeNil)
		}

		// 1.2.3
		// 1.2.3.4.5.6.7.8.9.10

		newNodeChild := NewNode(&tree.Node{
			Uuid: "newNodeChild",
			Type: tree.NodeType_COLLECTION,
		}, append(newNode.MPath, 1), []string{"newNodeChild"})

		if err := currentDAO.AddNode(newNodeChild); err != nil {
			So(err, ShouldBeNil)
		}

		// 1.2.3
		// 1.2.3.4.5.6.7.8.9.10
		// 1.2.3.4.5.6.7.8.9.10.1

		// printTree(ctxNoCache)

		movedNewNode13 := NewNode(&tree.Node{
			Uuid: "nodeParent",
			Type: tree.NodeType_COLLECTION,
		}, mtree.MPath{1, 3}, []string{"nodeParent"})

		err := currentDAO.MoveNodeTree(newNode12, movedNewNode13)
		So(err, ShouldBeNil)

		// 1.3
		// 1.3.4.5.6.7.8.9.10
		// 1.3.4.5.6.7.8.9.10.1

		// printTree(ctxNoCache)

		_, e := getDAO(ctxNoCache).GetNode([]uint64{1, 3})
		So(e, ShouldBeNil)

		newNode12 = NewNode(&tree.Node{
			Uuid: "nodeParent",
			Type: tree.NodeType_COLLECTION,
		}, mtree.MPath{1, 2, 3}, []string{"nodeParent"})

		// Moving back
		err = currentDAO.MoveNodeTree(movedNewNode13, newNode12)
		So(err, ShouldBeNil)

		// 1.2.3
		// 1.2.3.4.5.6.7.8.9.10
		// 1.2.3.4.5.6.7.8.9.10.1

		// printTree(ctxNoCache)

		newNode124 := NewNode(&tree.Node{
			Uuid: "nodeParent",
			Type: tree.NodeType_COLLECTION,
		}, mtree.MPath{1, 2, 4}, []string{"nodeParent"})

		// Moving back
		err = currentDAO.MoveNodeTree(newNode12, newNode124)
		So(err, ShouldBeNil)

		// 1.2.4
		// 1.2.4.4.5.6.7.8.9.10
		// 1.2.4.4.5.6.7.8.9.10.1

		// printTree(ctxNoCache)

		newNode125 := NewNode(&tree.Node{
			Uuid: "nodeParent",
			Type: tree.NodeType_COLLECTION,
		}, mtree.MPath{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1}, []string{"nodeParent"})

		// Moving back
		err = currentDAO.MoveNodeTree(newNode124, newNode125)
		So(err, ShouldBeNil)

		printTree(ctxNoCache)

	})

}

func TestStreams(t *testing.T) {
	Convey("Re-adding a file - Success", t, func() {
		c, e := getDAO(ctxNoCache).AddNodeStream(5)

		for i := 1; i <= 1152; i++ {
			node := mtree.NewTreeNode()
			node.N = &tree.Node{Uuid: "testing-stream" + strconv.Itoa(i), Type: tree.NodeType_LEAF}
			node.SetMPath(1, 17, uint64(i))

			c <- node
		}

		close(c)

		So(<-e, ShouldBeNil)

		idx, err := getDAO(ctxNoCache).GetNodeFirstAvailableChildIndex(mtree.NewMPath(1, 17))
		So(err, ShouldBeNil)
		So(idx, ShouldEqual, 1153)
	})
}

func TestArborescence(t *testing.T) {
	Convey("Creating an arborescence in the index", t, func() {
		arborescence := []string{
			"__MACOSX",
			"__MACOSX/personal",
			"__MACOSX/personal/admin",
			"__MACOSX/personal/admin/._.DS_Store",
			"personal",
			"personal/.pydio",
			"personal/admin",
			"personal/admin/.DS_Store",
			"personal/admin/.pydio",
			"personal/admin/Archive",
			"personal/admin/Archive/.pydio",
			"personal/admin/Archive/__MACOSX",
			"personal/admin/Archive/__MACOSX/.pydio",
			"personal/admin/Archive/EventsDarwin.txt",
			"personal/admin/Archive/photographie.jpg",
			"personal/admin/Archive.zip",
			"personal/admin/download.png",
			"personal/admin/EventsDarwin.txt",
			"personal/admin/Labellized",
			"personal/admin/Labellized/.pydio",
			"personal/admin/Labellized/Dossier Chateau de Vaux - Dossier diag -.zip",
			"personal/admin/Labellized/photographie.jpg",
			"personal/admin/PydioCells",
			"personal/admin/PydioCells/.DS_Store",
			"personal/admin/PydioCells/.pydio",
			"personal/admin/PydioCells/4c7f2f-EventsDarwin.txt",
			"personal/admin/PydioCells/download1.png",
			"personal/admin/PydioCells/icomoon (1)",
			"personal/admin/PydioCells/icomoon (1)/.DS_Store",
			"personal/admin/PydioCells/icomoon (1)/.pydio",
			"personal/admin/PydioCells/icomoon (1)/demo-files",
			"personal/admin/PydioCells/icomoon (1)/demo-files/.pydio",
			"personal/admin/PydioCells/icomoon (1)/demo-files/demo.css",
			"personal/admin/PydioCells/icomoon (1)/demo-files/demo.js",
			"personal/admin/PydioCells/icomoon (1)/demo.html",
			"personal/admin/PydioCells/icomoon (1)/Read Me.txt",
			"personal/admin/PydioCells/icomoon (1)/selection.json",
			"personal/admin/PydioCells/icomoon (1)/style.css",
			"personal/admin/PydioCells/icomoon (1).zip",
			"personal/admin/PydioCells/icons-signs.svg",
			"personal/admin/PydioCells/Pydio-cells0.ai",
			"personal/admin/PydioCells/Pydio-cells1-Mod.ai",
			"personal/admin/PydioCells/Pydio-cells1.ai",
			"personal/admin/PydioCells/Pydio-cells2.ai",
			"personal/admin/PydioCells/PydioCells Logos.zip",
			"personal/admin/recycle_bin",
			"personal/admin/recycle_bin/.ajxp_recycle_cache.ser",
			"personal/admin/recycle_bin/.pydio",
			"personal/admin/recycle_bin/Archive.zip",
			"personal/admin/recycle_bin/cells-clear-minus.svg",
			"personal/admin/recycle_bin/cells-clear-plus.svg",
			"personal/admin/recycle_bin/cells-full-minus.svg",
			"personal/admin/recycle_bin/cells-full-plus.svg",
			"personal/admin/recycle_bin/cells.svg",
			"personal/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -",
			"personal/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -/.pydio",
			"personal/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -/Dossier Chateau de Vaux - Dossier diag -",
			"personal/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -/Dossier Chateau de Vaux - Dossier diag -/.pydio",
			"personal/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -.zip",
			"personal/admin/recycle_bin/STACK.txt",
			"personal/admin/recycle_bin/Synthèse des pathologies et urgences sanitaires.doc",
			"personal/admin/STACK.txt",
			"personal/admin/Test Toto",
			"personal/admin/Test Toto/.pydio",
			"personal/admin/Test Toto/download1 very long name test with me please.png",
			"personal/admin/Test Toto/Pydio-color-logo-4.png",
			"personal/admin/Test Toto/PydioCells Logos.zip",
			"personal/admin/Test Toto/STACK.txt",
			"personal/admin/Test Toto/zzz.txt", // Last entry when sorting by name
			"personal/admin/Up",
			"personal/admin/Up/.DS_Store",
			"personal/admin/Up/.pydio",
			"personal/admin/Up/2018 03 08 - Pydio Cells.key",
			"personal/admin/Up/2018 03 08 - Pydio Cells.pdf",
			"personal/admin/Up/Pydio-color-logo-2.png",
			"personal/admin/Up/Pydio-color-logo-4.png",
			"personal/admin/Up/Pydio20180201.mm",
			"personal/admin/Up/Repair Result to pydio-logs-2018-3-13 06348.xml",
			"personal/external",
			"personal/external/.pydio",
			"personal/external/Pydio-color-logo-4.png",
			"personal/external/recycle_bin",
			"personal/external/recycle_bin/.pydio",
			"personal/recycle_bin",
			"personal/recycle_bin/.ajxp_recycle_cache.ser",
			"personal/recycle_bin/.pydio",
			"personal/toto",
			"personal/toto/.pydio",
			"personal/toto/recycle_bin",
			"personal/toto/recycle_bin/.pydio",
			"personal/user",
			"personal/user/.pydio",
			"personal/user/recycle_bin",
			"personal/user/recycle_bin/.pydio",
			"personal/user/User Folder",
			"personal/user/User Folder/.pydio",
		}

		for i, n := range arborescence {
			arborescence[i] = "ROOT/" + n
		}
		arborescence = append([]string{"ROOT"}, arborescence...)

		d := makeDAO().(DAO)

		for _, path := range arborescence {
			_, _, err := d.Path(path, true)

			So(err, ShouldBeNil)
		}

		e := d.Flush(true)
		So(e, ShouldBeNil)

		Convey("List Arbo w/ conditions", func() {
			c := d.GetNodeTree(context.Background(), mtree.MPath{1})
			var a []string
			for n := range c {
				if node, ok := n.(*mtree.TreeNode); ok {
					a = append(a, node.Name())
				}
			}
			So(len(a), ShouldEqual, len(arborescence))
			So(a[0], ShouldEqual, "ROOT") // Default sorting is MPATH
		})

		Convey("List Arbo w/ ordering", func() {
			mf := tree.NewMetaFilter(&tree.Node{})
			mf.AddSort(tree.MetaSortMPath, tree.MetaSortName, true)
			c := d.GetNodeTree(context.Background(), mtree.MPath{1}, mf)
			var a []string
			for n := range c {
				if node, ok := n.(*mtree.TreeNode); ok {
					a = append(a, node.Name())
				}
			}
			So(len(a), ShouldEqual, len(arborescence))
			So(a[0], ShouldEqual, "zzz.txt")
		})

	})
}

func TestFlatFolderWithMassiveChildren(t *testing.T) {
	Convey("Testing a flat folder with tons of children", t, func() {
		var i int
		d := getDAO(ctxNoCache)
		s := time.Now()
		var nodes []*mtree.TreeNode
		for i = 0; i < 50; i++ {
			_, node, _ := d.Path(fmt.Sprintf("/child-%d", i), true)
			nodes = append(nodes, node[0])
			if i > 0 && i%1000 == 0 {
				t.Logf("Inserted %d - avg %v\n", i, time.Now().Sub(s)/1000)
				s = time.Now()
			}
			if i == 5 {
				// Create a missing number + cache usage
				d.DelNode(nodes[2])
			} else if i == 10 {
				// Create a missing number and wait for cache to be expired
				d.DelNode(nodes[1])
				<-time.After(6 * time.Second)
			}
		}
	})
}

func TestFindMissingNumbers(t *testing.T) {
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

func TestUpdateInPlace(t *testing.T) {
	arborescence := []string{
		"test",
		"test/.pydio",
		"test/admin",
		"test/admin/.pydio",
		"test/admin/stuff",
		"test/admin/stuff/.pydio",
		"test/admin/file.xls",
		"test/admin2",
		"test/admin2/.pydio",
		"test/user",
		"test/user/.pydio",
	}
	Convey("Test UpdateInPlace", t, func() {
		d := getDAO(ctxNoCache)
		var nU string
		for _, path := range arborescence {
			_, nn, er := d.Path(path, true)
			if path == "test/admin" {
				nU = nn[0].GetUuid()
			} else if strings.HasSuffix(path, ".pydio") {
				pNode := nn[0]
				pNode.SetType(tree.NodeType_LEAF)
				So(d.SetNodeMeta(pNode), ShouldBeNil)
			}
			So(er, ShouldBeNil)
		}
		So(nU, ShouldNotBeEmpty)
		er := d.Flush(true)
		So(er, ShouldBeNil)

		i, e := d.UpdateNameInPlace("admin", "newAdmin", nU, -1)
		So(e, ShouldBeNil)
		So(i, ShouldEqual, 1)
		tN, _ := d.GetNodeByUUID(nU)
		So(tN.Name(), ShouldEqual, "newAdmin")

		// Test Flatten method by the way
		msg, er := d.Flatten()
		So(er, ShouldBeNil)
		So(msg, ShouldNotBeEmpty)
		So(strings.Contains(msg, "5"), ShouldBeTrue) // 5 .pydio removed
		t.Logf("Flatten received message %s", msg)

	})
}

func TestSmallArborescence(t *testing.T) {
	arborescence := []string{
		"testcreatethenmove",
		"testcreatethenmove/.pydio",
	}

	for _, path := range arborescence {
		getDAO(ctxNoCache).Path(path, true)
	}

	getDAO(ctxNoCache).Flush(true)
}

func TestArborescenceNoFolder(t *testing.T) {
	Convey("Creating an arborescence without folders in the index", t, func(c C) {
		arborescence := []string{
			"__MACOSX/arbo_no_folder/admin",
			"__MACOSX/arbo_no_folder/admin/._.DS_Store",
			"arbo_no_folder/.pydio",
			"arbo_no_folder/admin/.DS_Store",
			"arbo_no_folder/admin/.pydio",
			"arbo_no_folder/admin/Archive/__MACOSX",
			"arbo_no_folder/admin/Archive/__MACOSX/.pydio",
			"arbo_no_folder/admin/Archive/EventsDarwin.txt",
			"arbo_no_folder/admin/Archive/photographie.jpg",
			"arbo_no_folder/admin/Archive.zip",
			"arbo_no_folder/admin/download.png",
			"arbo_no_folder/admin/EventsDarwin.txt",
			"arbo_no_folder/admin/Labellized/.pydio",
			"arbo_no_folder/admin/Labellized/Dossier Chateau de Vaux - Dossier diag -.zip",
			"arbo_no_folder/admin/Labellized/photographie.jpg",
			"arbo_no_folder/admin/PydioCells/.DS_Store",
			"arbo_no_folder/admin/PydioCells/.pydio",
			"arbo_no_folder/admin/PydioCells/4c7f2f-EventsDarwin.txt",
			"arbo_no_folder/admin/PydioCells/download1.png",
			"arbo_no_folder/admin/PydioCells/icomoon (1)",
			"arbo_no_folder/admin/PydioCells/icomoon (1)/.DS_Store",
			"arbo_no_folder/admin/PydioCells/icomoon (1)/.pydio",
			"arbo_no_folder/admin/PydioCells/icomoon (1)/demo-files",
			"arbo_no_folder/admin/PydioCells/icomoon (1)/demo-files/.pydio",
			"arbo_no_folder/admin/PydioCells/icomoon (1)/demo-files/demo.css",
			"arbo_no_folder/admin/PydioCells/icomoon (1)/demo-files/demo.js",
			"arbo_no_folder/admin/PydioCells/icomoon (1)/demo.html",
			"arbo_no_folder/admin/PydioCells/icomoon (1)/Read Me.txt",
			"arbo_no_folder/admin/PydioCells/icomoon (1)/selection.json",
			"arbo_no_folder/admin/PydioCells/icomoon (1)/style.css",
			"arbo_no_folder/admin/PydioCells/icomoon (1).zip",
			"arbo_no_folder/admin/PydioCells/icons-signs.svg",
			"arbo_no_folder/admin/PydioCells/Pydio-cells0.ai",
			"arbo_no_folder/admin/PydioCells/Pydio-cells1-Mod.ai",
			"arbo_no_folder/admin/PydioCells/Pydio-cells1.ai",
			"arbo_no_folder/admin/PydioCells/Pydio-cells2.ai",
			"arbo_no_folder/admin/PydioCells/PydioCells Logos.zip",
			"arbo_no_folder/admin/recycle_bin/.ajxp_recycle_cache.ser",
			"arbo_no_folder/admin/recycle_bin/.pydio",
			"arbo_no_folder/admin/recycle_bin/Archive.zip",
			"arbo_no_folder/admin/recycle_bin/cells-clear-minus.svg",
			"arbo_no_folder/admin/recycle_bin/cells-clear-plus.svg",
			"arbo_no_folder/admin/recycle_bin/cells-full-minus.svg",
			"arbo_no_folder/admin/recycle_bin/cells-full-plus.svg",
			"arbo_no_folder/admin/recycle_bin/cells.svg",
			"arbo_no_folder/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -",
			"arbo_no_folder/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -/.pydio",
			"arbo_no_folder/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -/Dossier Chateau de Vaux - Dossier diag -",
			"arbo_no_folder/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -/Dossier Chateau de Vaux - Dossier diag -/.pydio",
			"arbo_no_folder/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -.zip",
			"arbo_no_folder/admin/recycle_bin/STACK.txt",
			"arbo_no_folder/admin/recycle_bin/Synthèse des pathologies et urgences sanitaires.doc",
			"arbo_no_folder/admin/STACK.txt",
			"arbo_no_folder/admin/Test Toto/.pydio",
			"arbo_no_folder/admin/Test Toto/download1 very long name test with me please.png",
			"arbo_no_folder/admin/Test Toto/Pydio-color-logo-4.png",
			"arbo_no_folder/admin/Test Toto/PydioCells Logos.zip",
			"arbo_no_folder/admin/Test Toto/STACK.txt",
			"arbo_no_folder/admin/Up/.DS_Store",
			"arbo_no_folder/admin/Up/.pydio",
			"arbo_no_folder/admin/Up/2018 03 08 - Pydio Cells.key",
			"arbo_no_folder/admin/Up/2018 03 08 - Pydio Cells.pdf",
			"arbo_no_folder/admin/Up/Pydio-color-logo-2.png",
			"arbo_no_folder/admin/Up/Pydio-color-logo-4.png",
			"arbo_no_folder/admin/Up/Pydio20180201.mm",
			"arbo_no_folder/admin/Up/Repair Result to pydio-logs-2018-3-13 06348.xml",
			"arbo_no_folder/external/.pydio",
			"arbo_no_folder/external/Pydio-color-logo-4.png",
			"arbo_no_folder/external/recycle_bin",
			"arbo_no_folder/external/recycle_bin/.pydio",
			"arbo_no_folder/recycle_bin/.ajxp_recycle_cache.ser",
			"arbo_no_folder/recycle_bin/.pydio",
			"arbo_no_folder/toto/.pydio",
			"arbo_no_folder/toto/recycle_bin/.pydio",
			"arbo_no_folder/user/.pydio",
			"arbo_no_folder/user/recycle_bin/.pydio",
			"arbo_no_folder/user/User Folder/.pydio",
		}

		wg := &sync.WaitGroup{}
		for _, path := range arborescence {
			wg.Add(1)
			go func(p string) {
				_, _, err := getDAO(ctxNoCache).Path(p, true)

				c.So(err, ShouldBeNil)

				wg.Done()
			}(path)
		}

		wg.Wait()

		getDAO(ctxNoCache).Flush(true)

		// printTree(ctxNoCache)
	})
}

func TestMoveNodeTree(t *testing.T) {
	Convey("Test movin a node in the tree", t, func() {
		arborescence := []string{
			"personal",
			"personal/.DS_Store",
			"personal/.pydio",
			"personal/admin",
			"personal/admin/.DS_Store",
			"personal/admin/.pydio",
			"personal/admin/Archive",
			"personal/admin/Archive/.pydio",
			"personal/admin/Archive/__MACOSX",
			"personal/admin/Archive/__MACOSX/.pydio",
			"personal/admin/Archive/EventsDarwin.txt",
			"personal/admin/Archive/photographie.jpg",
			"personal/admin/Archive.zip",
			"personal/admin/download.png",
			"personal/admin/EventsDarwin.txt",
			"personal/admin/Labellized",
			"personal/admin/Labellized/.pydio",
			"personal/admin/Labellized/Dossier Chateau de Vaux - Dossier diag -.zip",
			"personal/admin/Labellized/photographie.jpg",
			"personal/admin/PydioCells",
			"personal/admin/PydioCells/.DS_Store",
			"personal/admin/PydioCells/.pydio",
			"personal/admin/PydioCells/4c7f2f-EventsDarwin.txt",
			"personal/admin/PydioCells/download1.png",
			"personal/admin/PydioCells/icomoon (1)",
			"personal/admin/PydioCells/icomoon (1)/.DS_Store",
			"personal/admin/PydioCells/icomoon (1)/.pydio",
			"personal/admin/PydioCells/icomoon (1)/demo-files",
			"personal/admin/PydioCells/icomoon (1)/demo-files/.pydio",
			"personal/admin/PydioCells/icomoon (1)/demo-files/demo.css",
			"personal/admin/PydioCells/icomoon (1)/demo-files/demo.js",
			"personal/admin/PydioCells/icomoon (1)/demo.html",
			"personal/admin/PydioCells/icomoon (1)/Read Me.txt",
			"personal/admin/PydioCells/icomoon (1)/selection.json",
			"personal/admin/PydioCells/icomoon (1)/style.css",
			"personal/admin/PydioCells/icomoon (1).zip",
			"personal/admin/PydioCells/icons-signs.svg",
			"personal/admin/PydioCells/Pydio-cells0.ai",
			"personal/admin/PydioCells/Pydio-cells1-Mod.ai",
			"personal/admin/PydioCells/Pydio-cells1.ai",
			"personal/admin/PydioCells/Pydio-cells2.ai",
			"personal/admin/PydioCells/PydioCells Logos.zip",
			"personal/admin/recycle_bin",
			"personal/admin/recycle_bin/.ajxp_recycle_cache.ser",
			"personal/admin/recycle_bin/.DS_Store",
			"personal/admin/recycle_bin/.pydio",
			"personal/admin/recycle_bin/Archive.zip",
			"personal/admin/recycle_bin/cells-clear-minus.svg",
			"personal/admin/recycle_bin/cells-clear-plus.svg",
			"personal/admin/recycle_bin/cells-full-minus.svg",
			"personal/admin/recycle_bin/cells-full-plus.svg",
			"personal/admin/recycle_bin/cells.svg",
			"personal/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -",
			"personal/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -/.DS_Store",
			"personal/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -/.pydio",
			"personal/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -/Dossier Chateau de Vaux - Dossier diag -",
			"personal/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -/Dossier Chateau de Vaux - Dossier diag -/.pydio",
			"personal/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag - 2",
			"personal/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag - 2/.DS_Store",
			"personal/admin/recycle_bin/Dossier Chateau de Vaux - Dossier diag -.zip",
			"personal/admin/recycle_bin/STACK.txt",
			"personal/admin/recycle_bin/Synthèse des pathologies et urgences sanitaires.doc",
			"personal/admin/STACK.txt",
			"personal/admin/Test Toto",
			"personal/admin/Test Toto/.pydio",
			"personal/admin/Test Toto/download1 very long name test with me please.png",
			"personal/admin/Test Toto/Pydio-color-logo-4.png",
			"personal/admin/Test Toto/PydioCells Logos.zip",
			"personal/admin/Test Toto/STACK.txt",
			"personal/admin/Up",
			"personal/admin/Up/.DS_Store",
			"personal/admin/Up/.pydio",
			"personal/admin/Up/2018 03 08 - Pydio Cells.key",
			"personal/admin/Up/2018 03 08 - Pydio Cells.pdf",
			"personal/admin/Up/Pydio-color-logo-2.png",
			"personal/admin/Up/Pydio-color-logo-4.png",
			"personal/admin/Up/Pydio20180201.mm",
			"personal/admin/Up/Repair Result to pydio-logs-2018-3-13 06348.xml",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/.pydio",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Chateau de Vaux - Dossier diag -.indd",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Chateau de Vaux - Dossier diag RELU.pdf",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/ep assemble.txt",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Fonts",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Fonts/.pydio",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Fonts/arial.ttf",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Fonts/arialbd.ttf",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Fonts/ariali.ttf",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Fonts/calibri.ttf",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Fonts/calibrib.ttf",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Fonts/calibrii.ttf",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/.pydio",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/2017061674_ET7_SLR_AVOIR5_ET_7_SLR_AVOIR1_CHATEAU_VAUX-p.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/Atlas de Trudaine Foucheres.tif",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/cache_31574817.png",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/Carte de Vaux.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/carte localisation.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/elevation cour avec retombe.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/elevation jardin.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/Etage 2.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/Etage avec retombes.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/Hôtel Dieu.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/maps commune.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/PDG.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/pdg2.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/Plan domaine fin XVIIIe.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/plan masse.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/Projet XIXe plan.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/Projet XIXe siècle.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/RDC Avec modifs.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/Saint ménéhould.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/Seigneurie de Vaux.jpg",
			"personal/Dossier Chateau de Vaux - Dossier diag - 2/Links/SS avec retombefs.jpg",
			"personal/external",
			"personal/external/.DS_Store",
			"personal/external/.pydio",
			"personal/external/Pydio-color-logo-4.png",
			"personal/external/recycle_bin",
			"personal/external/recycle_bin/.pydio",
			"personal/recycle_bin",
			"personal/recycle_bin/.ajxp_recycle_cache.ser",
			"personal/recycle_bin/.pydio",
			"personal/toto",
			"personal/toto/.pydio",
			"personal/toto/recycle_bin",
			"personal/toto/recycle_bin/.pydio",
			"personal/user",
			"personal/user/.DS_Store",
			"personal/user/.pydio",
			"personal/user/recycle_bin",
			"personal/user/recycle_bin/.pydio",
			"personal/user/User Folder",
			"personal/user/User Folder/.pydio",
		}

		for _, path := range arborescence {
			getDAO(ctxNoCache).Path(path, true)
		}

		getDAO(ctxNoCache).Flush(true)

		// Then we move a node
		pathFrom, _, err := getDAO(ctxNoCache).Path("/personal/Dossier Chateau de Vaux - Dossier diag - 2", false)
		So(err, ShouldBeNil)
		pathTo, _, err := getDAO(ctxNoCache).Path("/Dossier Chateau de Vaux - Dossier diag - 2", true)
		So(err, ShouldBeNil)

		nodeFrom, err := getDAO(ctxNoCache).GetNode(pathFrom)
		So(err, ShouldBeNil)
		nodeTo, err := getDAO(ctxNoCache).GetNode(pathTo)
		So(err, ShouldBeNil)

		// First of all, we delete the existing node
		if nodeTo != nil {
			err = getDAO(ctxNoCache).DelNode(nodeTo)
			So(err, ShouldBeNil)
		}

		err = getDAO(ctxNoCache).MoveNodeTree(nodeFrom, nodeTo)
		So(err, ShouldBeNil)

		var i int
		for _ = range getDAO(ctxNoCache).GetNodeTree(context.Background(), pathTo) {
			i++
		}

		So(i, ShouldEqual, 35)

	})
}

func TestUnderscoreIssue(t *testing.T) {
	Convey("", t, func() {
		dao := getDAO(ctxNoCache)
		arborescence := []string{
			"Test Folder",
			"Test Folder/.pydio",
		}

		for _, path := range arborescence {
			dao.Path(path, true)
		}
		dao.Flush(true)

		mp, _, _ := getDAO(ctxNoCache).Path("Test_Folder", false)
		So(mp, ShouldBeNil)

		mp, _, _ = getDAO(ctxNoCache).Path("Test%Folder", false)
		So(mp, ShouldBeNil)
	})
}

func BenchmarkMysql(b *testing.B) {
	b.ReportAllocs()

	currentDAO := NewFolderSizeCacheDAO(getDAO(ctxNoCache))
	// currentDAO := getDAO(ctxNoCache)

	for i := 0; i < b.N; i++ {
		// List Root
		nodes := currentDAO.GetNodeChildren(context.Background(), mtree.MPath{1})
		<-nodes
		/*count := 0
		for range nodes {
			count++
		}*/
	}
}
