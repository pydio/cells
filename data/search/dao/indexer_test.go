//go:build storage

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

package dao

import (
	"context"
	"log"
	"os"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config/mock"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/test"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/data/search"
	"github.com/pydio/cells/v4/data/search/dao/bleve"
	"github.com/pydio/cells/v4/data/search/dao/commons"
	"github.com/pydio/cells/v4/data/search/dao/mongo"

	_ "github.com/pydio/cells/v4/common/registry/config"
	_ "github.com/pydio/cells/v4/common/storage/config"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = []test.StorageTestCase{
		{[]string{"bleve://" + filepath.Join(os.TempDir(), "data_search_tests"+uuid.New()+".bleve") + "?mapping=node"}, true, bleve.FastBleveDAO},
		test.TemplateMongoEnvWithPrefix(mongo.NewMongoDAO, "search_tests_"),
	}
)

func init() {
	_ = mock.RegisterMockConfig()
}

func createNodes(s search.Engine) error {

	ctx := context.Background()

	node := &tree.Node{
		Uuid:  "docID1",
		Path:  "/path/to/node.txt",
		MTime: time.Now().Unix(),
		Type:  1,
		Size:  24,
	}
	node.MustSetMeta("name", "node.txt")
	node.MustSetMeta("FreeMeta", "FreeMetaValue")
	node.MustSetMeta("StarsMeta", 5)
	node.MustSetMeta(common.MetaNamespaceGeoLocation, map[string]float64{
		"lat": 47.10358888888889,
		"lon": 8.372777777777777,
	})

	if e := s.IndexNode(ctx, node, false, nil); e != nil {
		return e
	}

	node2 := &tree.Node{
		Uuid:  "docID2",
		Path:  "/a/folder",
		MTime: time.Now().Unix(),
		Type:  2,
		Size:  36,
	}
	node2.MustSetMeta("name", "folder")

	if e := s.IndexNode(ctx, node2, false, nil); e != nil {
		log.Println("Error while indexing node", e)
	}

	return s.(*commons.Server).Flush()

}

func performSearch(ctx context.Context, index search.Engine, queryObject *tree.Query) ([]*tree.Node, error) {

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

	e := index.SearchNodes(ctx, queryObject, 0, 10, "", false, resultsChan, facetsChan, doneChan)
	wg.Wait()
	return results, e

}

//func TestNewBleveEngine(t *testing.T) {
//	test.RunStorageTests(testcases, func(ctx context.Context, server Engine) {
//	Convey("Test create bleve engine then reopen it", t, func() {
//
//		st, err := storage.OpenStorage(mgr.Context(), "bleve://"+filepath.Join(os.TempDir(), "data_search_tests"+uuid.New()+".bleve")+"?mapping=node")
//		So(err, ShouldBeNil)
//
//		var idx *bleve.Indexer
//		st.Get(context.TODO(), &idx)
//
//		server := NewBleveDAO(context.Background(), idx)
//		So(server, ShouldNotBeNil)
//
//		e := server.Close(context.TODO())
//		So(e, ShouldBeNil)
//
//		server = NewBleveDAO(context.Background(), idx)
//		So(server, ShouldNotBeNil)
//
//		e = server.Close(context.TODO())
//		So(e, ShouldBeNil)
//	})
//
//}

//func TestMakeIndexableNode(t *testing.T) {
//
//	Convey("Create Indexable Node", t, func() {
//
//		mtime := time.Now().Unix()
//		mtimeNoNano := time.Unix(mtime, 0)
//		node := &tree.Node{
//			Path:      "/path/to/node.txt",
//			MTime:     mtime,
//			Type:      1,
//			MetaStore: make(map[string]string),
//		}
//		node.MustSetMeta(common.MetaNamespaceNodeName, "node.txt")
//
//		b := NewBatch(context.Background(), nil, meta.NewNsProvider(context.Background()), BatchOptions{config: configx.New()})
//		indexNode := &tree.IndexableNode{Node: *node}
//		e := b.loadIndexableNode(indexNode, nil)
//		So(e, ShouldBeNil)
//		So(indexNode.NodeType, ShouldEqual, "file")
//		So(indexNode.ModifTime, ShouldResemble, mtimeNoNano)
//		So(indexNode.Basename, ShouldEqual, "node.txt")
//		So(indexNode.Extension, ShouldEqual, "txt")
//		So(indexNode.Meta, ShouldResemble, map[string]interface{}{"name": "node.txt"})
//		So(indexNode.MetaStore, ShouldBeNil)
//	})
//
//}

func TestIndexNode(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Index Node", t, func() {
			mtime := time.Now().Unix()
			node := &tree.Node{
				Uuid:      "docID1",
				Path:      "/path/to/node.txt",
				MTime:     mtime,
				Type:      1,
				MetaStore: make(map[string]string),
			}

			e := server.IndexNode(ctx, node, false, nil)

			So(e, ShouldBeNil)
		})

		Convey("Index Node Without Uuid", t, func() {
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
	})
}

func TestSearchNode(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Index nodes", t, func() {
			So(createNodes(server), ShouldBeNil)
			<-time.After(100 * time.Millisecond)
		})

		Convey("Search Node by name", t, func() {

			queryObject := &tree.Query{
				FileName: "node",
			}

			results, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

			queryObject = &tree.Query{
				FileName: "folder",
			}

			results, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

		})

		Convey("Search Node by extension", t, func() {

			queryObject := &tree.Query{
				Extension: "txt",
			}

			results, e := performSearch(ctx, server, queryObject)
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
			<-time.After(7 * time.Second)

			queryObject = &tree.Query{
				Extension: "png",
			}
			results, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

			// Remove now
			So(server.DeleteNode(ctx, &tree.Node{Uuid: "node-with-uppercase-extension"}), ShouldBeNil)
			<-time.After(7 * time.Second)
		})

		Convey("Search Node by size", t, func() {

			// Min & Max
			queryObject := &tree.Query{
				MinSize: 20,
				MaxSize: 30,
			}

			results, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

			// Min Only
			queryObject = &tree.Query{
				MinSize: 20,
			}

			results, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 2)

			// Out of range
			queryObject = &tree.Query{
				MinSize: 40,
			}

			results, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 0)

		})

		Convey("Search Node by MTime", t, func() {

			mtime := time.Now().Unix()
			// Min & Max
			queryObject := &tree.Query{
				MinDate: mtime - 100,
				MaxDate: mtime + 100,
			}

			results, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 2)

			// Min Only
			queryObject = &tree.Query{
				MinDate: mtime - 100,
			}

			results, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 2)

		})

		Convey("Search Node with FreeString", t, func() {

			queryObject := &tree.Query{
				FreeString: "+Meta.FreeMeta:FreeMetaValue",
			}

			results, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)
		})

		Convey("Search Node with FreeString (integer)", t, func() {

			queryObject := &tree.Query{
				FreeString: "+Meta.StarsMeta:5",
			}

			results, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)
		})

		Convey("Search Node with Basename and FreeString (integer)", t, func() {

			queryObject := &tree.Query{
				FreeString: "+Basename:node.txt +Meta.StarsMeta:5",
			}

			results, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)
		})

		Convey("Search Node by Type", t, func() {

			queryObject := &tree.Query{
				Type: 1,
			}

			results, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)
			So(results[0].GetUuid(), ShouldEqual, "docID1")

			queryObject = &tree.Query{
				Type: 2,
			}

			results, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)
			So(results[0].GetUuid(), ShouldEqual, "docID2")

		})

		Convey("Search Node by name with Exact Path", t, func() {

			queryObject := &tree.Query{
				Paths: []string{"/path/to"},
			}
			results, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 0)

			queryObject = &tree.Query{
				Paths: []string{"/path/to/node.txt2"},
			}
			results, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 0)

			queryObject = &tree.Query{
				Paths: []string{"/path/to/node.txt"},
			}

			results, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

		})

		Convey("Search Node by name with Path Prefix", t, func() {

			queryObject := &tree.Query{
				FileName:   "node",
				PathPrefix: []string{"/path/to"},
			}

			results, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

			queryObject = &tree.Query{
				FileName:   "node",
				PathPrefix: []string{"/wrong/path"},
			}

			results, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 0)

		})
	})
}

func TestSearchByGeolocation(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {

		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}

		createNodes(server)

		Convey("Search Node by GeoLocation", t, func() {

			queryObject := &tree.Query{
				GeoQuery: &tree.GeoQuery{
					Center: &tree.GeoPoint{
						Lon: 8.372777777777777,
						Lat: 47.10358888888889,
					},
					Distance: "1meters",
				},
			}

			results, e := performSearch(ctx, server, queryObject)
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

			results, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

		})
	})

}

func TestDeleteNode(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}
		createNodes(server)

		Convey("Delete Node", t, func() {

			So(server.DeleteNode(ctx, &tree.Node{Uuid: "docID1"}), ShouldBeNil)
			<-time.After(4 * time.Second)

			queryObject := &tree.Query{
				FileName: "node",
			}

			results, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 0)
		})
	})
}

func TestClearIndex(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Clear Index", t, func() {

			createNodes(server)

			e := server.ClearIndex(ctx)
			So(e, ShouldBeNil)

			queryObject := &tree.Query{
				FileName: "node",
			}

			results, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 0)
		})
	})
}

func TestSearchByUuidsMatch(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Search Node by UUID(s)", t, func() {

			createNodes(server)

			node3 := &tree.Node{
				Uuid:  "uuidpart1-uuidpart2",
				Path:  "/a/folder",
				MTime: time.Now().Unix(),
				Type:  2,
				Size:  36,
			}
			node3.MustSetMeta("name", "folder")

			e := server.IndexNode(ctx, node3, false, nil)
			So(e, ShouldBeNil)

			node4 := &tree.Node{
				Uuid:  "uuidpart1-uuidpart3",
				Path:  "/a/folder2",
				MTime: time.Now().Unix(),
				Type:  2,
				Size:  36,
			}
			node4.MustSetMeta("name", "folder2")

			e = server.IndexNode(ctx, node4, false, nil)
			So(e, ShouldBeNil)
			<-time.After(7 * time.Second)

			queryObject := &tree.Query{
				UUIDs: []string{"randomUUID"},
			}
			results, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 0)

			queryObject = &tree.Query{
				UUIDs: []string{"docID1"},
			}
			results, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

			queryObject = &tree.Query{
				UUIDs: []string{"uuidpart1-uuidpart3"},
			}
			results, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

			queryObject = &tree.Query{
				UUIDs: []string{"docID1", "docID2"},
			}
			results, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 2)

			queryObject = &tree.Query{
				FreeString: "+Uuid:\"docID1\"",
			}
			results, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

		})
	})

}
