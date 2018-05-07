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
package index

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"log"
	"math/rand"
	"strconv"
	"sync"
	"testing"
	"time"

	_ "github.com/mattn/go-sqlite3"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/common/utils"
)

var (
	ctxWithCache context.Context
	baseCacheDAO dao.DAO
)

func TestMain(m *testing.M) {
	// Then run with a cache
	sqlDAO := sql.NewDAO("sqlite3", "file::memwithcache:?mode=memory&cache=shared", "test")
	if sqlDAO == nil {
		fmt.Print("Could not start test")
		return
	}

	baseCacheDAO = NewDAO(sqlDAO, "ROOT")
	if err := baseCacheDAO.Init(options); err != nil {
		fmt.Print("Could not start test ", err)
		return
	}

	m.Run()
}

func newSession() {
	ctxWithCache = servicecontext.WithDAO(context.Background(), NewDAOCache(fmt.Sprintf("%s-%d", "test", rand.Intn(1000)), baseCacheDAO.(DAO)).(dao.DAO))
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

	Convey("Test Getting a file - Success", t, func() {
		newSession()

		node, err := getDAO(ctxWithCache).GetNode([]uint64{1})
		So(err, ShouldBeNil)

		// Setting MTime to 0 so we can compare
		node.MTime = 0

		So(node.Node, ShouldResemble, mockNode.Node)

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
		node.MTime = 0
		node.Path = mockLongNodeChild2.Path

		getDAO(ctxWithCache).Flush(true)

		So(node.Node, ShouldResemble, mockLongNodeChild2.Node)
	})

	Convey("Test Getting a node by uuid - Success", t, func() {
		newSession()

		node, err := getDAO(ctxWithCache).GetNodeByUUID("mockLongNode")
		So(err, ShouldBeNil)

		// Setting MTime to 0 so we can compare
		node.MTime = 0
		node.Path = "mockLongNode"

		getDAO(ctxWithCache).Flush(true)

		So(node.Node, ShouldResemble, mockLongNode.Node)
	})

	// Getting a file
	Convey("Test Getting a child node", t, func() {

		newSession()

		node, err := getDAO(ctxWithCache).GetNodeChild(mockLongNodeMPath, "mockLongNodeChild1")

		So(err, ShouldBeNil)

		// TODO - find a way
		node.MTime = 0
		node.Path = mockLongNodeChild1.Path

		getDAO(ctxWithCache).Flush(true)

		So(node.Node, ShouldNotResemble, mockLongNodeChild2.Node)
		So(node.Node, ShouldResemble, mockLongNodeChild1.Node)
	})

	// Setting a file
	Convey("Test Getting the last child of a node", t, func() {

		newSession()

		node, err := getDAO(ctxWithCache).GetNodeLastChild(mockLongNodeMPath)

		So(err, ShouldBeNil)

		// TODO - find a way
		node.MTime = 0
		node.Path = mockLongNodeChild2.Path

		getDAO(ctxWithCache).Flush(true)

		So(node.Node, ShouldNotResemble, mockLongNodeChild1.Node)
		So(node.Node, ShouldResemble, mockLongNodeChild2.Node)
	})

	// Setting a file
	Convey("Test Getting the Children of a node", t, func() {
		newSession()

		var i int
		for _ = range getDAO(ctxWithCache).GetNodeChildren(mockLongNodeMPath) {
			i++
		}

		getDAO(ctxWithCache).Flush(true)

		So(i, ShouldEqual, 2)
	})

	// Setting a file
	Convey("Test Getting the Children of a node", t, func() {

		newSession()

		var i int
		for _ = range getDAO(ctxWithCache).GetNodeTree([]uint64{1}) {
			i++
		}

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
			node := utils.NewTreeNode()
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

		node1 := utils.NewTreeNode()
		node1.Node = &tree.Node{Uuid: "test-same-mpath", Type: tree.NodeType_LEAF}
		node1.SetMPath(1, 21, 12, 7)
		err := getDAO(ctxWithCache).AddNode(node1)
		So(err, ShouldBeNil)

		node2 := utils.NewTreeNode()
		node2.Node = &tree.Node{Uuid: "test-same-mpath2", Type: tree.NodeType_LEAF}
		node2.SetMPath(1, 21, 12, 7)
		err = getDAO(ctxWithCache).AddNode(node2)
		So(err, ShouldBeNil)

		err = getDAO(ctxWithCache).Flush(true)
		So(err, ShouldNotBeNil)
	})

	Convey("Test wrong children due to same MPath start", t, func() {

		newSession()

		node1 := utils.NewTreeNode()
		node1.Node = &tree.Node{Uuid: "parent1", Type: tree.NodeType_COLLECTION}
		node1.SetMPath(1, 1)

		node2 := utils.NewTreeNode()
		node2.Node = &tree.Node{Uuid: "parent2", Type: tree.NodeType_COLLECTION}
		node2.SetMPath(1, 15)

		node11 := utils.NewTreeNode()
		node11.Node = &tree.Node{Uuid: "child1.1", Type: tree.NodeType_COLLECTION}
		node11.SetMPath(1, 1, 1)

		node21 := utils.NewTreeNode()
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
		nodes := getDAO(ctxWithCache).GetNodeChildren(utils.MPath{1})
		count := 0
		for range nodes {
			count++
		}
		So(count, ShouldEqual, 2)

		// List Parent1 Children
		nodes = getDAO(ctxWithCache).GetNodeTree(utils.MPath{1})
		count = 0
		for c := range nodes {
			log.Println(c)
			count++
		}

		So(count, ShouldEqual, 7) // Because of previous tests there are other nodes

		// List Parent1 Children
		nodes = getDAO(ctxWithCache).GetNodeChildren(utils.MPath{1, 1})
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

		node := utils.NewTreeNode()
		node.Node = &tree.Node{Uuid: "etag-parent-folder", Type: tree.NodeType_COLLECTION}
		node.SetMPath(1, 16)
		node.Etag = "-1"

		node11 := utils.NewTreeNode()
		node11.Node = &tree.Node{Uuid: "etag-child-1", Type: tree.NodeType_LEAF}
		node11.SetMPath(1, 16, 1)
		node11.Etag = etag1
		node11.SetMeta("name", "\"bbb\"")

		node12 := utils.NewTreeNode()
		node12.Node = &tree.Node{Uuid: "etag-child-2", Type: tree.NodeType_LEAF}
		node12.SetMPath(1, 16, 2)
		node12.Etag = etag2
		node12.SetMeta("name", "\"aaa\"")

		node13 := utils.NewTreeNode()
		node13.Node = &tree.Node{Uuid: "etag-child-3", Type: tree.NodeType_COLLECTION}
		node13.SetMPath(1, 16, 3)
		node13.Etag = "-1"
		node13.SetMeta("name", "\"ccc\"")

		node14 := utils.NewTreeNode()
		node14.Node = &tree.Node{Uuid: "etag-child-child-1", Type: tree.NodeType_LEAF}
		node14.SetMPath(1, 16, 3, 1)
		node14.Etag = etag3
		node14.SetMeta("name", "\"a-aaa\"")

		node15 := utils.NewTreeNode()
		node15.Node = &tree.Node{Uuid: "etag-child-child-2", Type: tree.NodeType_LEAF}
		node15.SetMPath(1, 16, 3, 2)
		node15.Etag = etag4
		node15.SetMeta("name", "\"a-bbb\"")

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
		So(intermediaryNode.Etag, ShouldEqual, newEtag)

		parentNode, e := getDAO(ctxWithCache).GetNode(node.MPath)
		So(e, ShouldBeNil)
		hash2 := md5.New()
		hash2.Write([]byte(etag2 + "." + etag1 + "." + intermediaryNode.Etag))
		newEtag2 := hex.EncodeToString(hash2.Sum(nil))
		So(parentNode.Etag, ShouldEqual, newEtag2)

	})

}

func TestCommitsWithCache(t *testing.T) {

	Convey("Test Insert / List / Delete", t, func() {

		node := utils.NewTreeNode()
		node.Node = &tree.Node{Uuid: "etag-child-1", Type: tree.NodeType_LEAF}
		node.SetMPath(1, 16, 1)
		node.Etag = "first-etag"
		node.MTime = time.Now().Unix()
		node.Size = 2444
		node.SetMeta("name", "\"bbb\"")

		err := getDAO(ctxWithCache).PushCommit(node)
		So(err, ShouldBeNil)

		node.Etag = "second-etag"
		err = getDAO(ctxWithCache).PushCommit(node)
		So(err, ShouldBeNil)

		logs, err := getDAO(ctxWithCache).ListCommits(node)
		So(err, ShouldBeNil)
		So(logs, ShouldHaveLength, 2)
		So(logs[0].Uuid, ShouldEqual, "second-etag")
		So(logs[1].Uuid, ShouldEqual, "first-etag")

		err = getDAO(ctxWithCache).DeleteCommits(node)
		So(err, ShouldBeNil)
		logs, err = getDAO(ctxWithCache).ListCommits(node)
		So(err, ShouldBeNil)
		So(logs, ShouldHaveLength, 0)

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
			node := utils.NewTreeNode()
			node.Node = &tree.Node{Uuid: "testing-stream" + strconv.Itoa(i), Type: tree.NodeType_LEAF}
			node.SetMPath(1, 17, uint64(i))

			c <- node
		}

		close(c)

		getDAO(ctxWithCache).Flush(true)

		wg.Wait()

		So(errorCount, ShouldEqual, 1152)

		idx, err := getDAO(ctxWithCache).GetNodeFirstAvailableChildIndex(utils.NewMPath(1, 17))
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
		nodes := make(map[string]utils.MPath)
		for _, path := range arborescence {
			mpath, _, _ := getDAO(ctxWithCache).Path(path, true)
			nodes[path] = mpath
		}

		getDAO(ctxWithCache).Flush(false)

		// Then we move a node
		path1, _, err := getDAO(ctxWithCache).Path("/test copie", false)
		So(err, ShouldBeNil)
		path2, _, err := getDAO(ctxWithCache).Path("/document sans titre/target", true)
		So(err, ShouldBeNil)

		// Then we move a node
		node1, _ := getDAO(ctxWithCache).GetNode(path1)
		node2, _ := getDAO(ctxWithCache).GetNode(path2)
		err = getDAO(ctxWithCache).MoveNodeTree(node1, node2)
		So(err, ShouldBeNil)

		getDAO(ctxWithCache).Flush(false)

		_, _, err = getDAO(ctxWithCache).Path("document sans titre/test copie/whatever", false)
		So(err, ShouldBeNil)
		_, _, err = getDAO(ctxWithCache).Path("document sans titre/test copie/whatever2", true)
		So(err, ShouldBeNil)

		// printTree(ctxWithCache)
		// printNodes(ctxWithCache)

		getDAO(ctxWithCache).Flush(true)
	})
}
