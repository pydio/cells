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
	"math/rand"
	osruntime "runtime"
	"strconv"
	"strings"
	"sync"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"github.com/spf13/viper"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	_ "github.com/pydio/cells/v4/common/utils/cache/gocache"
	"github.com/pydio/cells/v4/common/utils/mtree"
)

var (
	ctxWithCache context.Context
	baseCacheDAO dao.DAO
)

func TestMain(m *testing.M) {
	v := viper.New()
	v.SetDefault(runtime.KeyCache, "pm://")
	v.SetDefault(runtime.KeyShortCache, "pm://")
	runtime.SetRuntime(v)

	wrapper := func(ctx context.Context, d dao.DAO) (dao.DAO, error) {
		return NewDAO(d, "ROOT"), nil
	}
	var e error
	if baseCacheDAO, e = dao.InitDAO(context.Background(), sqlite.Driver, sqlite.SharedMemDSN, "test_cache", wrapper, options); e != nil {
		panic(e)
	}
	m.Run()
}

func newSession() {
	ctxWithCache = servicecontext.WithDAO(context.Background(), NewDAOCache(fmt.Sprintf("%s-%d", "test", rand.Intn(1000)), baseCacheDAO.(DAO)).(dao.DAO))
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

func TestMysqlWithCache(t *testing.T) {

	// Adding a file
	Convey("Test adding a file - Success", t, func() {

		newSession()

		err := getDAO(ctxWithCache).AddNode(mockNode)
		So(err, ShouldBeNil)

		getDAO(ctxWithCache).Flush(true)

		// printTree()
		// printNodes()
		PrintMemUsage("Test adding a file")
	})

	// Setting a file
	Convey("Test setting a file - Success", t, func() {
		newSession()

		newNode := NewNode(&tree.Node{
			Uuid: "ROOT",
			Type: tree.NodeType_LEAF,
		}, []uint64{2}, []string{""})

		err := getDAO(ctxWithCache).SetNode(newNode)
		So(err, ShouldBeNil)

		// printTree()
		// printNodes()

		err = getDAO(ctxWithCache).SetNode(mockNode)
		So(err, ShouldBeNil)

		getDAO(ctxWithCache).Flush(true)
	})

	// Updating a file meta
	Convey("Test updating a file meta", t, func() {
		newSession()

		err := getDAO(ctxWithCache).AddNode(updateNode)
		So(err, ShouldBeNil)

		getDAO(ctxWithCache).Flush(false)

		updateNode.UpdateEtag("etag2")
		updateNode.UpdateSize(24)

		err = getDAO(ctxWithCache).SetNodeMeta(updateNode)
		So(err, ShouldBeNil)

		getDAO(ctxWithCache).Flush(false)

		updated, err := getDAO(ctxWithCache).GetNode(updateNode.MPath)
		So(err, ShouldBeNil)
		So(updated.GetEtag(), ShouldEqual, "etag2")
		So(updated.GetSize(), ShouldEqual, 24)

		getDAO(ctxWithCache).Flush(true)

	})

	// Delete a file
	// TODO - needs to be deleted by UUID
	Convey("Test deleting a file - Success", t, func() {

		newSession()

		err := getDAO(ctxWithCache).DelNode(mockNode)
		So(err, ShouldBeNil)

		getDAO(ctxWithCache).Flush(true)

		// printTree()
		// printNodes()
	})

	Convey("Re-adding a file - Success", t, func() {
		newSession()

		err := getDAO(ctxWithCache).AddNode(mockNode)
		So(err, ShouldBeNil)

		getDAO(ctxWithCache).Flush(true)

		//printTree()
		//printNodes()
	})

	Convey("Re-adding the same file - Failure", t, func() {
		newSession()

		err := getDAO(ctxWithCache).AddNode(mockNode)
		So(err, ShouldBeNil)

		err = getDAO(ctxWithCache).Flush(true)
		So(err, ShouldNotBeNil)

		// printTree()
		// printNodes()
	})

	Convey("Create combined error", t, func() {
		newSession()

		cDao := getDAO(ctxWithCache).(*daocache)
		for i := 0; i < 20; i++ {
			cDao.errors = append(cDao.errors, fmt.Errorf("error %d", i))
		}
		err := cDao.Flush(true)
		So(err, ShouldNotBeNil)
		So(err.Error(), ShouldEqual, "Combined errors (first 10) : error 0 error 1 error 2 error 3 error 4 error 5 error 6 error 7 error 8 error 9")

	})

	Convey("Test Getting a file - Success", t, func() {
		newSession()

		node, err := getDAO(ctxWithCache).GetNode([]uint64{1})
		So(err, ShouldBeNil)

		// Setting MTime to 0 so we can compare
		node.UpdateMTime(0)

		So(node.AsProto(), ShouldResemble, mockNode.AsProto())

		getDAO(ctxWithCache).Flush(true)
	})

	// Setting a file
	Convey("Test setting a file with a massive path - Success", t, func() {
		newSession()

		err := getDAO(ctxWithCache).AddNode(mockLongNode)
		So(err, ShouldBeNil)

		err = getDAO(ctxWithCache).AddNode(mockLongNodeChild1)
		So(err, ShouldBeNil)

		err = getDAO(ctxWithCache).AddNode(mockLongNodeChild2)
		So(err, ShouldBeNil)

		//printTree()
		//printNodes()

		node, err := getDAO(ctxWithCache).GetNode(mockLongNodeChild2MPath)
		So(err, ShouldBeNil)

		// TODO - find a way
		node.UpdateMTime(0)
		node.UpdatePath(mockLongNodeChild2.GetPath())

		getDAO(ctxWithCache).Flush(true)

		So(node.Node, ShouldResemble, mockLongNodeChild2.Node)
	})

	Convey("Test Getting a node by uuid - Success", t, func() {
		newSession()

		node, err := getDAO(ctxWithCache).GetNodeByUUID("mockLongNode")
		So(err, ShouldBeNil)

		// Setting MTime to 0 so we can compare
		node.UpdateMTime(0)
		node.UpdateSize(0)
		node.UpdatePath("mockLongNode")

		getDAO(ctxWithCache).Flush(true)

		So(node.AsProto(), ShouldResemble, mockLongNode.AsProto())
	})

	// Getting a file
	Convey("Test Getting a child node", t, func() {

		newSession()

		node, err := getDAO(ctxWithCache).GetNodeChild(mockLongNodeMPath, "mockLongNodeChild1")

		So(err, ShouldBeNil)

		// TODO - find a way
		node.UpdateMTime(0)
		node.UpdatePath(mockLongNodeChild1.GetPath())

		getDAO(ctxWithCache).Flush(true)

		So(node.AsProto(), ShouldNotResemble, mockLongNodeChild2.AsProto())
		So(node.AsProto(), ShouldResemble, mockLongNodeChild1.AsProto())
	})

	// Setting a file
	Convey("Test Getting the last child of a node", t, func() {

		newSession()

		node, err := getDAO(ctxWithCache).GetNodeLastChild(mockLongNodeMPath)

		So(err, ShouldBeNil)

		// TODO - find a way
		node.UpdateMTime(0)
		node.UpdatePath(mockLongNodeChild2.GetPath())

		getDAO(ctxWithCache).Flush(true)

		So(node.AsProto(), ShouldNotResemble, mockLongNodeChild1.AsProto())
		So(node.AsProto(), ShouldResemble, mockLongNodeChild2.AsProto())
	})

	// Setting a file
	Convey("Test Getting the Children Count of a node", t, func() {
		newSession()

		count, _ := getDAO(ctxWithCache).GetNodeChildrenCounts(mockLongNodeMPath, false)

		getDAO(ctxWithCache).Flush(true)

		So(count, ShouldEqual, 2)
	})

	// Setting a file
	Convey("Test Getting the Children of a node", t, func() {
		newSession()

		var i int
		for _ = range getDAO(ctxWithCache).GetNodeChildren(context.Background(), mockLongNodeMPath) {
			i++
		}

		getDAO(ctxWithCache).Flush(true)

		So(i, ShouldEqual, 2)
	})

	// Setting a file
	Convey("Test Getting the Children of a node", t, func() {

		newSession()

		var i int
		PrintMemUsage("Test Getting the Children of a node")
		for _ = range getDAO(ctxWithCache).GetNodeTree(context.Background(), []uint64{1}) {
			i++
		}

		PrintMemUsage("Test Getting the Children of a node END")

		So(i, ShouldEqual, 3)

		getDAO(ctxWithCache).Flush(true)
	})

	// Setting a file
	Convey("Test Getting Nodes by MPath", t, func() {
		var i int
		for _ = range getDAO(ctxWithCache).GetNodes(mockLongNodeChild1MPath, mockLongNodeChild2MPath) {
			i++
		}

		So(i, ShouldEqual, 2)
	})

	// Setting a file
	Convey("Setting multiple nodes at once", t, func() {
		newSession()

		b := getDAO(ctxWithCache).SetNodes("test", 10)

		mpath := mockLongNodeMPath

		for len(mpath) > 0 {
			node := mtree.NewTreeNode()
			node.SetMPath(mpath...)
			b.Send(node)
			mpath = mpath.Parent()
		}

		err := b.Close()

		So(err, ShouldBeNil)

		getDAO(ctxWithCache).Flush(true)
	})

	// Setting a mpath multiple times
	Convey("Setting a same mpath multiple times", t, func() {

		newSession()

		node1 := mtree.NewTreeNode()
		node1.Node = &tree.Node{Uuid: "test-same-mpath", Type: tree.NodeType_LEAF}
		node1.SetMPath(1, 21, 12, 7)
		err := getDAO(ctxWithCache).AddNode(node1)
		So(err, ShouldBeNil)

		node2 := mtree.NewTreeNode()
		node2.Node = &tree.Node{Uuid: "test-same-mpath2", Type: tree.NodeType_LEAF}
		node2.SetMPath(1, 21, 12, 7)
		err = getDAO(ctxWithCache).AddNode(node2)
		So(err, ShouldBeNil)

		err = getDAO(ctxWithCache).Flush(true)
		So(err, ShouldNotBeNil)
	})

	Convey("Test wrong children due to same MPath start", t, func() {

		newSession()

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

		e := getDAO(ctxWithCache).AddNode(node1)
		So(e, ShouldBeNil)
		e = getDAO(ctxWithCache).AddNode(node2)
		So(e, ShouldBeNil)
		e = getDAO(ctxWithCache).AddNode(node11)
		So(e, ShouldBeNil)
		e = getDAO(ctxWithCache).AddNode(node21)
		So(e, ShouldBeNil)

		e = getDAO(ctxWithCache).Flush(true)
		So(e, ShouldBeNil)

		// List Root
		nodes := getDAO(ctxWithCache).GetNodeChildren(context.Background(), mtree.MPath{1})
		count := 0
		for range nodes {
			count++
		}
		So(count, ShouldEqual, 2)

		// List Parent1 Children
		nodes = getDAO(ctxWithCache).GetNodeTree(context.Background(), mtree.MPath{1})
		count = 0
		for c := range nodes {
			log.Println(c)
			count++
		}

		So(count, ShouldEqual, 7) // Because of previous tests there are other nodes

		// List Parent1 Children
		nodes = getDAO(ctxWithCache).GetNodeChildren(context.Background(), mtree.MPath{1, 1})
		count = 0
		for range nodes {
			count++
		}
		So(count, ShouldEqual, 1)

	})

	Convey("Test Etag Compute", t, func() {

		newSession()

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
		node.UpdateEtag("-1")

		node11 := mtree.NewTreeNode()
		node11.Node = &tree.Node{Uuid: "etag-child-1", Type: tree.NodeType_LEAF}
		node11.SetMPath(1, 16, 1)
		node11.UpdateEtag(etag1)
		node11.SetName("bbb")

		node12 := mtree.NewTreeNode()
		node12.Node = &tree.Node{Uuid: "etag-child-2", Type: tree.NodeType_LEAF}
		node12.SetMPath(1, 16, 2)
		node12.UpdateEtag(etag2)
		node12.SetName("aaa")

		node13 := mtree.NewTreeNode()
		node13.Node = &tree.Node{Uuid: "etag-child-3", Type: tree.NodeType_COLLECTION}
		node13.SetMPath(1, 16, 3)
		node13.UpdateEtag("-1")
		node13.SetName("ccc")

		node14 := mtree.NewTreeNode()
		node14.Node = &tree.Node{Uuid: "etag-child-child-1", Type: tree.NodeType_LEAF}
		node14.SetMPath(1, 16, 3, 1)
		node14.UpdateEtag(etag3)
		node14.SetName("a-aaa")

		node15 := mtree.NewTreeNode()
		node15.Node = &tree.Node{Uuid: "etag-child-child-2", Type: tree.NodeType_LEAF}
		node15.SetMPath(1, 16, 3, 2)
		node15.UpdateEtag(etag4)
		node15.SetName("a-bbb")

		e := getDAO(ctxWithCache).AddNode(node)
		So(e, ShouldBeNil)
		e = getDAO(ctxWithCache).AddNode(node11)
		So(e, ShouldBeNil)
		e = getDAO(ctxWithCache).AddNode(node12)
		So(e, ShouldBeNil)
		e = getDAO(ctxWithCache).AddNode(node13)
		So(e, ShouldBeNil)
		e = getDAO(ctxWithCache).AddNode(node14)
		So(e, ShouldBeNil)
		e = getDAO(ctxWithCache).AddNode(node15)
		So(e, ShouldBeNil)

		e = getDAO(ctxWithCache).Flush(true)
		So(e, ShouldBeNil)
		e = getDAO(ctxWithCache).ResyncDirtyEtags(node)
		So(e, ShouldBeNil)
		intermediaryNode, e := getDAO(ctxWithCache).GetNode(node13.MPath)
		So(e, ShouldBeNil)
		hash := md5.New()
		hash.Write([]byte(etag3 + "." + etag4))
		newEtag := hex.EncodeToString(hash.Sum(nil))
		So(intermediaryNode.GetEtag(), ShouldEqual, newEtag)

		parentNode, e := getDAO(ctxWithCache).GetNode(node.MPath)
		So(e, ShouldBeNil)
		hash2 := md5.New()
		hash2.Write([]byte(etag2 + "." + etag1 + "." + intermediaryNode.GetEtag()))
		newEtag2 := hex.EncodeToString(hash2.Sum(nil))
		So(parentNode.GetEtag(), ShouldEqual, newEtag2)

	})

}

func TestDaocache_GetNodeFirstAvailableChildIndex(t *testing.T) {

	Convey("Test mPath with free slots", t, func() {

		newSession()

		node1 := mtree.NewTreeNode()
		node1.Node = &tree.Node{Uuid: "parent-slots-1", Type: tree.NodeType_COLLECTION}
		node1.SetMPath(1, 40)

		node11 := mtree.NewTreeNode()
		node11.Node = &tree.Node{Uuid: "child-slots-1.1", Type: tree.NodeType_COLLECTION}
		node11.SetMPath(1, 40, 1)

		node13 := mtree.NewTreeNode()
		node13.Node = &tree.Node{Uuid: "child-slots-1.3", Type: tree.NodeType_COLLECTION}
		node13.SetMPath(1, 40, 3)

		node14 := mtree.NewTreeNode()
		node14.Node = &tree.Node{Uuid: "child-slots-1.4", Type: tree.NodeType_COLLECTION}
		node14.SetMPath(1, 40, 4)

		e := getDAO(ctxWithCache).AddNode(node1)
		So(e, ShouldBeNil)

		// No Children yet, should return 1
		slot, e := getDAO(ctxWithCache).GetNodeFirstAvailableChildIndex(mtree.NewMPath(1, 40))
		So(e, ShouldBeNil)
		So(slot, ShouldEqual, 1)

		e = getDAO(ctxWithCache).AddNode(node11)
		So(e, ShouldBeNil)

		// One or more children, should return length(children) + 1
		slot, e = getDAO(ctxWithCache).GetNodeFirstAvailableChildIndex(mtree.NewMPath(1, 40))
		So(e, ShouldBeNil)
		So(slot, ShouldEqual, 2)

		e = getDAO(ctxWithCache).AddNode(node13)
		So(e, ShouldBeNil)
		e = getDAO(ctxWithCache).AddNode(node14)
		So(e, ShouldBeNil)

		// One or more children but there are free slots, should return first free slot
		slot, e = getDAO(ctxWithCache).GetNodeFirstAvailableChildIndex(mtree.NewMPath(1, 40))
		So(e, ShouldBeNil)
		So(slot, ShouldEqual, 2)

		node12 := mtree.NewTreeNode()
		node12.Node = &tree.Node{Uuid: "child-slots-1.2", Type: tree.NodeType_COLLECTION}
		node12.SetMPath(1, 40, 2)
		e = getDAO(ctxWithCache).AddNode(node12)
		So(e, ShouldBeNil)

		// One or more children, should return length(children) + 1
		slot, e = getDAO(ctxWithCache).GetNodeFirstAvailableChildIndex(mtree.NewMPath(1, 40))
		So(e, ShouldBeNil)
		So(slot, ShouldEqual, 5)

		e = getDAO(ctxWithCache).Flush(true)
		So(e, ShouldBeNil)

	})

}

func TestStreamsWithCache(t *testing.T) {
	Convey("Re-adding a file - Success", t, func() {
		newSession()

		c, e := getDAO(ctxWithCache).AddNodeStream(5)

		errorCount := 0
		wg := &sync.WaitGroup{}
		go func() {
			wg.Add(1)
			defer wg.Done()
			for _ = range e {
				errorCount = errorCount + 1
			}
		}()

		for i := 1; i <= 1152; i++ {
			node := mtree.NewTreeNode()
			node.Node = &tree.Node{Uuid: "testing-stream" + strconv.Itoa(i), Type: tree.NodeType_LEAF}
			node.SetMPath(1, 17, uint64(i))

			c <- node
		}

		close(c)

		getDAO(ctxWithCache).Flush(true)

		wg.Wait()

		So(errorCount, ShouldEqual, 1152)

		idx, err := getDAO(ctxWithCache).GetNodeFirstAvailableChildIndex(mtree.NewMPath(1, 17))
		So(err, ShouldBeNil)
		So(idx, ShouldEqual, 1)
	})
}

func TestArborescenceWithCache(t *testing.T) {
	Convey("Re-adding a file - Success", t, func() {
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

		newSession()

		for _, path := range arborescence {
			getDAO(ctxWithCache).Path(path, true)
		}

		getDAO(ctxWithCache).Flush(true)
	})
}

func TestSmallArborescenceWithCache(t *testing.T) {
	Convey("Re-adding a file - Success", t, func() {
		arborescence := []string{
			"test",
			"test/.pydio",
			"test copie",
			"test copie/.pydio",
			"test copie/whatever",
			"document sans titre",
			"document sans titre/.pydio",
			"document sans titre/target",
			"document sans titre/mobile_header.jpg",
			"document sans titre/mobile-header.jpg",
		}

		newSession()
		// Creating the arborescence
		nodes := make(map[string]mtree.MPath)
		for _, path := range arborescence {
			mpath, _, _ := getDAO(ctxWithCache).Path(path, true)
			nodes[path] = mpath
		}

		getDAO(ctxWithCache).Flush(false)

		// Then we move a node
		pathFrom, _, err := getDAO(ctxWithCache).Path("/test copie", false)
		So(err, ShouldBeNil)
		pathTo, _, err := getDAO(ctxWithCache).Path("/document sans titre/target", false)
		So(err, ShouldBeNil)

		getDAO(ctxWithCache).Flush(false)

		// Then we move a node
		nodeFrom, _ := getDAO(ctxWithCache).GetNode(pathFrom)
		nodeTo, _ := getDAO(ctxWithCache).GetNode(pathTo)

		// First of all, we delete the existing node
		if nodeTo != nil {
			err = getDAO(ctxWithCache).DelNode(nodeTo)
			So(err, ShouldBeNil)
		}

		getDAO(ctxWithCache).Flush(false)

		err = getDAO(ctxWithCache).MoveNodeTree(nodeFrom, nodeTo)
		So(err, ShouldBeNil)

		_, _, err = getDAO(ctxWithCache).Path("document sans titre/target/whatever", false)
		So(err, ShouldBeNil)

		_, _, err = getDAO(ctxWithCache).Path("document sans titre/target/whatever2", true)
		So(err, ShouldBeNil)

		// printTree(ctxWithCache)
		// printNodes(ctxWithCache)

		getDAO(ctxWithCache).Flush(true)
	})
}

func TestOtherArborescenceWithCache(t *testing.T) {
	Convey("Re-adding a file - Success", t, func() {
		arborescence := []string{
			"pydiods1/Dossier Chateau de Vaux - Dossier diag -",
			"pydiods1/Dossier Chateau de Vaux - Dossier diag -/Fonts",
			"pydiods1/Dossier Chateau de Vaux - Dossier diag -/Links",
		}

		newSession()

		for _, path := range arborescence {
			getDAO(ctxWithCache).Path(path, true)
		}

		getDAO(ctxWithCache).Flush(true)
	})
}

func TestGettingNodeByPathBeforeCreationWithCache(t *testing.T) {
	Convey("Re-adding a file - Success", t, func() {
		arborescence := []string{
			"admin",
			"admin/Playlist",
			"admin/Playlist/vendor-folders",
			"admin/Playlist/vendor-folders/github.com",
			"admin/Playlist/vendor-folders/github.com/golang",
			"admin/Playlist/vendor-folders/github.com/golang/protobuf",
			"admin/Playlist/vendor-folders/github.com/golang/protobuf/proto",
			"admin/Playlist/vendor-folders/github.com/micro",
			"admin/Playlist/vendor-folders/github.com/micro/micro",
			"admin/Playlist/vendor-folders/github.com/micro/micro/api",
			"admin/Playlist/vendor-folders/github.com/micro/protobuf",
			"admin/Playlist/vendor-folders/github.com/micro/protobuf/proto",
			"admin/Playlist/vendor-folders/github.com/coreos",
			"admin/Playlist/vendor-folders/github.com/coreos/dex",
			"admin/Playlist/vendor-folders/github.com/coreos/dex/api",
			"admin/Playlist/vendor-folders/google.golang.org",
			"admin/Playlist/vendor-folders/google.golang.org/api",
			"admin/Playlist/vendor-folders/google.golang.org/genproto",
			"admin/Playlist/vendor-folders/google.golang.org/genproto/googleapis",
			"admin/Playlist/vendor-folders/google.golang.org/genproto/googleapis/api",
			"admin/Playlist/vendor-folders/github.com/nicolai86",
			"admin/Playlist/vendor-folders/github.com/nicolai86/scaleway-sdk",
			"admin/Playlist/vendor-folders/github.com/nicolai86/scaleway-sdk/api",
			"admin/Playlist/vendor-folders/github.com/pydio",
			"admin/Playlist/vendor-folders/github.com/pydio/minio-srv",
			"admin/Playlist/vendor-folders/github.com/pydio/minio-srv/vendor",
			"admin/Playlist/vendor-folders/github.com/pydio/minio-srv/vendor/go.etcd.io",
			"admin/Playlist/vendor-folders/github.com/pydio/minio-srv/vendor/go.etcd.io/etcd",
			"admin/Playlist/vendor-folders/github.com/pydio/minio-srv/vendor/go.etcd.io/etcd/etcdserver",
			"admin/Playlist/vendor-folders/github.com/pydio/minio-srv/vendor/go.etcd.io/etcd/etcdserver/api",
		}

		newSession()
		d := getDAO(ctxWithCache).(*daocache)

		for _, path := range arborescence {
			// Node should NEVER be found here!
			test, e := d.GetNodeByPath(strings.Split(path, "/"))
			So(test, ShouldBeNil)
			So(e, ShouldNotBeNil)
			_, _, e = d.Path(path, true)
			So(e, ShouldBeNil)
		}

		// Nodes should be correctly found here!
		n1, e := d.GetNodeByPath([]string{"admin", "Playlist", "vendor-folders", "github.com", "coreos", "dex", "api"})
		So(e, ShouldBeNil)
		So(n1, ShouldNotBeNil)
		if n1 != nil {
			So(strings.Replace(n1.GetPath(), "\\", "/", -1), ShouldEqual, "admin/Playlist/vendor-folders/github.com/coreos/dex/api")
		}

		n1, e = d.GetNodeByPath([]string{"admin", "Playlist", "vendor-folders", "github.com", "nicolai86", "scaleway-sdk", "api"})
		So(e, ShouldBeNil)
		So(n1, ShouldNotBeNil)
		if n1 != nil {
			So(strings.Replace(n1.GetPath(), "\\", "/", -1), ShouldEqual, "admin/Playlist/vendor-folders/github.com/nicolai86/scaleway-sdk/api")
		}

		getDAO(ctxWithCache).Flush(true)
	})

}
