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

package bleve

import (
	"context"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/tree"
)

func getTmpIndex(createNodes bool) (s *BleveServer, dir string) {
	tmpDir, _ := ioutil.TempDir("", "bleve")
	BleveIndexPath = filepath.Join(tmpDir, "pydio")
	server, _ := NewBleveEngine(false, nil)

	if createNodes {

		ctx := context.Background()

		node := &tree.Node{
			Uuid:  "docID1",
			Path:  "/path/to/node.txt",
			MTime: time.Now().Unix(),
			Type:  1,
			Size:  24,
		}
		node.SetMeta("name", "node.txt")
		node.SetMeta("FreeMeta", "FreeMetaValue")
		node.SetMeta("GeoLocation", map[string]float64{
			"lat": 47.10358888888889,
			"lon": 8.372777777777777,
		})

		e := server.IndexNode(ctx, node, false, nil)
		if e != nil {
			log.Println("Error while indexing node", e)
		}

		node2 := &tree.Node{
			Uuid:  "docID2",
			Path:  "/a/folder",
			MTime: time.Now().Unix(),
			Type:  2,
			Size:  36,
		}
		node2.SetMeta("name", "folder")

		e = server.IndexNode(ctx, node2, false, nil)
		if e != nil {
			log.Println("Error while indexing node", e)
		}

		<-time.After(5 * time.Second)
	}

	return server, tmpDir
}

func search(ctx context.Context, index *BleveServer, queryObject *tree.Query) ([]*tree.Node, error) {

	resultsChan := make(chan *tree.Node)
	facetsChan := make(chan *tree.SearchFacet)
	doneChan := make(chan bool)
	var results []*tree.Node
	var facets []*tree.SearchFacet
	wg := &sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case node := <-resultsChan:
				if node != nil {
					results = append(results, node)
				}
			case facet := <-facetsChan:
				facets = append(facets, facet)
			case <-doneChan:
				close(resultsChan)
				close(facetsChan)
				return
			}
		}
	}()

	e := index.SearchNodes(ctx, queryObject, 0, 10, resultsChan, facetsChan, doneChan)
	wg.Wait()
	return results, e

}

func TestNewBleveEngine(t *testing.T) {

	tmpDir, _ := ioutil.TempDir("", "bleve")
	BleveIndexPath = filepath.Join(tmpDir, "pydio")
	defer os.RemoveAll(tmpDir)

	Convey("Test create bleve engine then reopen it", t, func() {
		server, err := NewBleveEngine(false, nil)
		So(err, ShouldBeNil)
		So(server, ShouldNotBeNil)

		e := server.Close()
		So(e, ShouldBeNil)

		server, err = NewBleveEngine(false, nil)
		So(err, ShouldBeNil)
		So(server, ShouldNotBeNil)

		e = server.Close()
		So(e, ShouldBeNil)
	})

}

func TestMakeIndexableNode(t *testing.T) {

	Convey("Create Indexable Node", t, func() {

		mtime := time.Now().Unix()
		mtimeNoNano := time.Unix(mtime, 0)
		node := &tree.Node{
			Path:      "/path/to/node.txt",
			MTime:     mtime,
			Type:      1,
			MetaStore: make(map[string]string),
		}
		node.SetMeta("name", "node.txt")

		b := NewBatch(BatchOptions{})
		indexNode := &tree.IndexableNode{Node: *node}
		e := b.LoadIndexableNode(indexNode, nil)
		So(e, ShouldBeNil)
		So(indexNode.NodeType, ShouldEqual, "file")
		So(indexNode.ModifTime, ShouldResemble, mtimeNoNano)
		So(indexNode.Basename, ShouldEqual, "node.txt")
		So(indexNode.Extension, ShouldEqual, "txt")
		So(indexNode.Meta, ShouldResemble, map[string]interface{}{"name": "node.txt"})
		So(indexNode.MetaStore, ShouldBeNil)
	})

}

func TestIndexNode(t *testing.T) {

	Convey("Index Node", t, func() {

		server, tmpDir := getTmpIndex(false)
		defer func() {
			server.Close()
			e := os.RemoveAll(tmpDir)
			if e != nil {
				log.Println(e)
			}
		}()

		mtime := time.Now().Unix()
		node := &tree.Node{
			Uuid:      "docID1",
			Path:      "/path/to/node.txt",
			MTime:     mtime,
			Type:      1,
			MetaStore: make(map[string]string),
		}
		ctx := context.Background()
		e := server.IndexNode(ctx, node, false, nil)

		So(e, ShouldBeNil)
	})

	Convey("Index Node Without Uuid", t, func() {

		server, tmpDir := getTmpIndex(false)
		defer func() {
			server.Close()
			e := os.RemoveAll(tmpDir)
			if e != nil {
				log.Println(e)
			}
		}()

		mtime := time.Now().Unix()
		node := &tree.Node{
			Path:      "/path/to/node.txt",
			MTime:     mtime,
			Type:      1,
			MetaStore: make(map[string]string),
		}
		ctx := context.Background()
		e := server.IndexNode(ctx, node, false, nil)

		So(e, ShouldNotBeNil)
	})

}

func TestSearchNode(t *testing.T) {

	Convey("Search Node by name", t, func() {

		server, tmpDir := getTmpIndex(true)
		defer func() {
			server.Close()
			e := os.RemoveAll(tmpDir)
			if e != nil {
				log.Println(e)
			}
		}()

		ctx := context.Background()

		queryObject := &tree.Query{
			FileName: "node",
		}

		results, e := search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 1)

		queryObject = &tree.Query{
			FileName: "folder",
		}

		results, e = search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 1)

	})

	Convey("Search Node by extension", t, func() {

		server, tmpDir := getTmpIndex(true)
		defer func() {
			server.Close()
			e := os.RemoveAll(tmpDir)
			if e != nil {
				log.Println(e)
			}
		}()

		ctx := context.Background()

		queryObject := &tree.Query{
			Extension: "txt",
		}

		results, e := search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 1)

		// Check extension is case-insensitive
		e = server.IndexNode(ctx, &tree.Node{
			Uuid:      "node-with-uppercase-extension",
			Type:      tree.NodeType_LEAF,
			Path:      "/toto.PNG",
			MetaStore: map[string]string{"name": `"toto.PNG"`},
		}, false, nil)
		So(e, ShouldBeNil)
		<-time.After(5 * time.Second)

		queryObject = &tree.Query{
			Extension: "png",
		}
		results, e = search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 1)
	})

	Convey("Search Node by size", t, func() {

		server, tmpDir := getTmpIndex(true)
		defer func() {
			server.Close()
			e := os.RemoveAll(tmpDir)
			if e != nil {
				log.Println(e)
			}
		}()

		ctx := context.Background()
		// Min & Max
		queryObject := &tree.Query{
			MinSize: 20,
			MaxSize: 30,
		}

		results, e := search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 1)

		// Min Only
		queryObject = &tree.Query{
			MinSize: 20,
		}

		results, e = search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 2)

		// Out of range
		queryObject = &tree.Query{
			MinSize: 40,
		}

		results, e = search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 0)

	})

	Convey("Search Node by MTime", t, func() {

		server, tmpDir := getTmpIndex(true)
		defer func() {
			server.Close()
			e := os.RemoveAll(tmpDir)
			if e != nil {
				log.Println(e)
			}
		}()

		ctx := context.Background()
		mtime := time.Now().Unix()
		// Min & Max
		queryObject := &tree.Query{
			MinDate: mtime - 100,
			MaxDate: mtime + 100,
		}

		results, e := search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 2)

		// Min Only
		queryObject = &tree.Query{
			MinDate: mtime - 100,
		}

		results, e = search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 2)

	})

	Convey("Search Node with FreeString", t, func() {

		server, tmpDir := getTmpIndex(true)
		defer func() {
			server.Close()
			e := os.RemoveAll(tmpDir)
			if e != nil {
				log.Println(e)
			}
		}()

		ctx := context.Background()
		queryObject := &tree.Query{
			FreeString: "Meta.FreeMeta:FreeMetaValue",
		}

		results, e := search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 1)
	})

	Convey("Search Node by Type", t, func() {

		server, tmpDir := getTmpIndex(true)
		defer func() {
			server.Close()
			e := os.RemoveAll(tmpDir)
			if e != nil {
				log.Println(e)
			}
		}()

		ctx := context.Background()

		queryObject := &tree.Query{
			Type: 1,
		}

		results, e := search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 1)
		So(results[0].GetUuid(), ShouldEqual, "docID1")

		queryObject = &tree.Query{
			Type: 2,
		}

		results, e = search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 1)
		So(results[0].GetUuid(), ShouldEqual, "docID2")

	})

	Convey("Search Node by name with Path Prefix", t, func() {

		server, tmpDir := getTmpIndex(true)
		defer func() {
			server.Close()
			e := os.RemoveAll(tmpDir)
			if e != nil {
				log.Println(e)
			}
		}()

		ctx := context.Background()

		queryObject := &tree.Query{
			FileName:   "node",
			PathPrefix: []string{"/path/to"},
		}

		results, e := search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 1)

		queryObject = &tree.Query{
			FileName:   "node",
			PathPrefix: []string{"/wrong/path"},
		}

		results, e = search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 0)

	})

	Convey("Search Node by GeoLocation", t, func() {

		server, tmpDir := getTmpIndex(true)
		defer func() {
			server.Close()
			e := os.RemoveAll(tmpDir)
			if e != nil {
				log.Println(e)
			}
		}()

		ctx := context.Background()

		queryObject := &tree.Query{
			GeoQuery: &tree.GeoQuery{
				Center: &tree.GeoPoint{
					Lon: 8.372777777777777,
					Lat: 47.10358888888889,
				},
				Distance: "1meters",
			},
		}

		results, e := search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 1)

		queryObject = &tree.Query{
			GeoQuery: &tree.GeoQuery{
				TopLeft: &tree.GeoPoint{
					Lon: 8.372777777777776,
					Lat: 47.10358888888888,
				},
				BottomRight: &tree.GeoPoint{
					Lon: 8.372777777777778,
					Lat: 47.10358888888890,
				},
			},
		}

		results, e = search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 1)

	})

}

func TestDeleteNode(t *testing.T) {

	Convey("Delete Node", t, func() {

		server, tmpDir := getTmpIndex(true)
		defer func() {
			server.Close()
			e := os.RemoveAll(tmpDir)
			if e != nil {
				log.Println(e)
			}
		}()
		ctx := context.Background()

		server.DeleteNode(ctx, &tree.Node{Uuid: "docID1"})
		<-time.After(4 * time.Second)

		queryObject := &tree.Query{
			FileName: "node",
		}

		results, e := search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 0)
	})

}

func TestClearIndex(t *testing.T) {

	Convey("Clear Index", t, func() {

		server, tmpDir := getTmpIndex(true)
		defer func() {
			server.Close()
			e := os.RemoveAll(tmpDir)
			if e != nil {
				log.Println(e)
			}
		}()
		ctx := context.Background()

		e := server.ClearIndex(ctx)
		So(e, ShouldBeNil)

		queryObject := &tree.Query{
			FileName: "node",
		}

		results, e := search(ctx, server, queryObject)
		So(e, ShouldBeNil)
		So(results, ShouldHaveLength, 0)
	})

}
