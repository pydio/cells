//go:build storage || kv

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
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config/mock"
	"github.com/pydio/cells/v5/common/nodes/meta"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/data/search"
	"github.com/pydio/cells/v5/data/search/dao/bleve"
	"github.com/pydio/cells/v5/data/search/dao/commons"
	"github.com/pydio/cells/v5/data/search/dao/mongo"

	_ "github.com/pydio/cells/v5/common/registry/config"
	_ "github.com/pydio/cells/v5/common/storage/config"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = func() []test.StorageTestCase {
		return []test.StorageTestCase{
			{DSN: []string{"bleve://" + filepath.Join(os.TempDir(), "data_search_tests"+uuid.New()[:6]+".bleve") + "?mapping=node"}, Condition: true, DAO: bleve.FastBleveDAO},
			test.TemplateMongoEnvWithPrefix(mongo.FastMongoDAO, "search_tests_"+uuid.New()[:6]+"_"),
		}
	}
	global context.Context
)

func init() {
	global, _ = mock.RegisterMockConfig(context.Background())
}

func createNodes(ctx context.Context, s search.Engine, nodes ...*tree.Node) error {

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

	if e := s.IndexNode(ctx, node, false); e != nil {
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

	if e := s.IndexNode(ctx, node2, false); e != nil {
		log.Println("Error while indexing node", e)
	}

	for _, n := range nodes {
		if e := s.IndexNode(ctx, n, false); e != nil {
			log.Println("Error while indexing node", e)
		}
	}

	if er := s.(*commons.Server).Flush(ctx); er != nil {
		return er
	}

	<-time.After(1 * time.Second)
	return nil
}

func performSearch(ctx context.Context, index search.Engine, queryObject *tree.Query, sorting ...string) (results []*tree.Node, total uint64, err error) {

	resultsChan := make(chan *tree.Node)
	facetsChan := make(chan *tree.SearchFacet)
	totalChan := make(chan uint64)
	doneChan := make(chan bool)
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
			case to := <-totalChan:
				total = to
			case <-doneChan:
				close(resultsChan)
				close(facetsChan)
				return
			}
		}
	}()
	var sortField string
	var sortDirDesc bool
	if len(sorting) > 0 {
		parts := strings.Split(sorting[0], ":")
		sortField = parts[0]
		sortDirDesc = strings.ToLower(parts[1]) == "desc"
	}

	e := index.SearchNodes(ctx, queryObject, 0, 10, sortField, sortDirDesc, resultsChan, facetsChan, totalChan, doneChan)
	wg.Wait()
	return results, total, e

}

func TestIndexNode(t *testing.T) {
	test.RunStorageTests(testcases(), t, func(ctx context.Context) {
		defer func() {
			commons.BatchPoolInit = sync.Once{}
		}()
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

			e := server.IndexNode(ctx, node, false)

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
			e := server.IndexNode(global, node, false)

			So(e, ShouldNotBeNil)
		})
	})
}

func TestSearchNode(t *testing.T) {
	test.RunStorageTests(testcases(), t, func(ctx context.Context) {
		defer func() {
			commons.BatchPoolInit = sync.Once{}
		}()
		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Index nodes", t, func() {
			So(createNodes(ctx, server), ShouldBeNil)
		})

		Convey("Search Node by name", t, func() {

			queryObject := &tree.Query{
				FileName: "node",
			}

			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

			queryObject = &tree.Query{
				FileName: "folder",
			}

			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

		})

		Convey("Search Node by extension", t, func() {

			queryObject := &tree.Query{
				Extension: "txt",
			}

			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

			// Check extension is case-insensitive
			e = server.IndexNode(ctx, &tree.Node{
				Uuid:      "node-with-uppercase-extension",
				Type:      tree.NodeType_LEAF,
				Path:      "/toto.PNG",
				MetaStore: map[string]string{"name": `"toto.PNG"`},
			}, false)
			So(e, ShouldBeNil)
			<-time.After(7 * time.Second)

			queryObject = &tree.Query{
				Extension: "png",
			}
			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

			queryObject = &tree.Query{
				Extension: "txt,png",
			}
			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 2)

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

			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

			// Min Only
			queryObject = &tree.Query{
				MinSize: 20,
			}

			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 2)

			// Out of range
			queryObject = &tree.Query{
				MinSize: 40,
			}

			results, _, e = performSearch(ctx, server, queryObject)
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

			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 2)

			// Min Only
			queryObject = &tree.Query{
				MinDate: mtime - 100,
			}

			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 2)

		})

		Convey("Search Node with FreeString", t, func() {

			queryObject := &tree.Query{
				FreeString: "+Meta.FreeMeta:FreeMetaValue",
			}

			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)
		})

		Convey("Search Node with FreeString (integer)", t, func() {

			queryObject := &tree.Query{
				FreeString: "+Meta.StarsMeta:5",
			}

			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)
		})

		Convey("Search Node with Basename and FreeString (integer)", t, func() {

			queryObject := &tree.Query{
				FreeString: "+Basename:node.txt +Meta.StarsMeta:5",
			}

			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)
		})

		Convey("Search Node by Type", t, func() {

			queryObject := &tree.Query{
				Type: 1,
			}

			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)
			So(results[0].GetUuid(), ShouldEqual, "docID1")

			queryObject = &tree.Query{
				Type: 2,
			}

			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)
			So(results[0].GetUuid(), ShouldEqual, "docID2")

		})

		Convey("Search Node by name with Exact Path", t, func() {

			queryObject := &tree.Query{
				Paths: []string{"/path/to"},
			}
			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 0)

			queryObject = &tree.Query{
				Paths: []string{"/path/to/node.txt2"},
			}
			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 0)

			queryObject = &tree.Query{
				Paths: []string{"/path/to/node.txt"},
			}

			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

		})

		Convey("Search Node by name with Path Prefix", t, func() {

			queryObject := &tree.Query{
				FileName:   "node",
				PathPrefix: []string{"/path/to"},
			}

			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

			queryObject = &tree.Query{
				FileName:   "node",
				PathPrefix: []string{"/wrong/path"},
			}

			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 0)

		})
	})
}

func TestSearchOnPathPrefixes(t *testing.T) {

	test.RunStorageTests(testcases(), t, func(ctx context.Context) {
		defer func() {
			commons.BatchPoolInit = sync.Once{}
		}()

		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}
		testNodes := []*tree.Node{
			{
				Uuid:      "docID100",
				Path:      "/path/recycle_bin/deleted-node.txt",
				MTime:     time.Now().Unix(),
				Type:      tree.NodeType_LEAF,
				Size:      24,
				MetaStore: map[string]string{"name": "\"deleted-node.txt\""},
			},
		}
		if err = createNodes(ctx, server, testNodes...); err != nil {
			panic(err)
		}

		Convey("Search Node by name with Path Prefix", t, func() {

			queryObject := &tree.Query{
				FileName:   "node",
				PathPrefix: []string{"/path"},
			}

			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 2)

			queryObject = &tree.Query{
				FileName:   "node",
				PathPrefix: []string{"/wrong/path"},
			}

			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 0)

			// Now exclude recycle contents
			queryObject = &tree.Query{
				FileName:           "node",
				PathPrefix:         []string{"/path"},
				ExcludedPathPrefix: []string{"/path/recycle_bin/"},
			}

			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

		})

	})
}

func TestSearchOnWithPathDepth(t *testing.T) {

	test.RunStorageTests(testcases(), t, func(ctx context.Context) {
		defer func() {
			commons.BatchPoolInit = sync.Once{}
		}()

		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}
		testNodes := []*tree.Node{
			{
				Uuid:      "docID100",
				Path:      "/path/something/test1.txt",
				MTime:     time.Now().Unix(),
				Type:      tree.NodeType_LEAF,
				Size:      24,
				MetaStore: map[string]string{"name": "\"test4.txt\""},
			},
			{
				Uuid:      "docID101",
				Path:      "/path/something/test2.txt",
				MTime:     time.Now().Unix(),
				Type:      tree.NodeType_LEAF,
				Size:      12,
				MetaStore: map[string]string{"name": "\"test2.txt\""},
			},
			{
				Uuid:      "docID102",
				Path:      "/path/something/test3.txt",
				MTime:     time.Now().Unix(),
				Type:      tree.NodeType_LEAF,
				Size:      24,
				MetaStore: map[string]string{"name": "\"test3.txt\""},
			},
			{
				Uuid:      "docID103",
				Path:      "/path/something/subfolder",
				MTime:     time.Now().Unix(),
				Type:      tree.NodeType_COLLECTION,
				MetaStore: map[string]string{"name": "\"subfolder\""},
			},
			{
				Uuid:      "docID104",
				Path:      "/path/something/subfolder/subtest.txt",
				MTime:     time.Now().Unix(),
				Type:      tree.NodeType_LEAF,
				Size:      24,
				MetaStore: map[string]string{"name": "\"subtest.txt\""},
			},
		}
		if err = createNodes(ctx, server, testNodes...); err != nil {
			panic(err)
		}

		Convey("Search Node by name with Path Prefix", t, func() {
			queryObject := &tree.Query{
				PathPrefix: []string{"/path/something/"},
			}

			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 5)

			queryObject = &tree.Query{
				PathPrefix: []string{"/path/something/"},
				PathDepth:  3,
			}

			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 4)

		})
	})
}

func TestSearchSorting(t *testing.T) {

	test.RunStorageTests(testcases(), t, func(ctx context.Context) {
		defer func() {
			commons.BatchPoolInit = sync.Once{}
		}()

		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}
		testNodes := []*tree.Node{
			{
				Uuid:      "docID100",
				Path:      "/sorted/aaa.txt",
				MTime:     time.Now().Add(-10 * time.Second).Unix(),
				Type:      tree.NodeType_LEAF,
				Size:      36,
				MetaStore: map[string]string{"name": "\"aaa.txt\""},
			},
			{
				Uuid:      "docID101",
				Path:      "/sorted/bbb.txt",
				MTime:     time.Now().Add(-5 * time.Second).Unix(),
				Type:      tree.NodeType_LEAF,
				Size:      12,
				MetaStore: map[string]string{"name": "\"bbb.txt\""},
			},
			{
				Uuid:      "docID102",
				Path:      "/sorted/ccc.txt",
				MTime:     time.Now().Unix(),
				Type:      tree.NodeType_LEAF,
				Size:      24,
				MetaStore: map[string]string{"name": "\"ccc.txt\""},
			},
		}
		if err = createNodes(ctx, server, testNodes...); err != nil {
			panic(err)
		}

		Convey("Search Nodes with Sorting options", t, func() {

			queryObject := &tree.Query{
				PathPrefix: []string{"/sorted/"},
			}

			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 3)

			// MTIME ASC
			results, _, e = performSearch(ctx, server, queryObject, "mtime:asc")
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 3)
			So(results[0].GetUuid(), ShouldEqual, "docID100")
			So(results[1].GetUuid(), ShouldEqual, "docID101")
			So(results[2].GetUuid(), ShouldEqual, "docID102")

			// MTIME DESC
			results, _, e = performSearch(ctx, server, queryObject, "mtime:desc")
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 3)
			So(results[0].GetUuid(), ShouldEqual, "docID102")
			So(results[1].GetUuid(), ShouldEqual, "docID101")
			So(results[2].GetUuid(), ShouldEqual, "docID100")

			// SIZE ASC
			results, _, e = performSearch(ctx, server, queryObject, "size:asc")
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 3)
			So(results[0].GetUuid(), ShouldEqual, "docID101")
			So(results[1].GetUuid(), ShouldEqual, "docID102")
			So(results[2].GetUuid(), ShouldEqual, "docID100")

			// SIZE DESC
			results, _, e = performSearch(ctx, server, queryObject, "size:desc")
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 3)
			So(results[0].GetUuid(), ShouldEqual, "docID100")
			So(results[1].GetUuid(), ShouldEqual, "docID102")
			So(results[2].GetUuid(), ShouldEqual, "docID101")
		})

	})
}

func TestSearchByGeolocation(t *testing.T) {

	test.RunStorageTests(testcases(), t, func(ctx context.Context) {
		defer func() {
			commons.BatchPoolInit = sync.Once{}
		}()

		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}

		if err = createNodes(ctx, server); err != nil {
			panic(err)
		}

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

			results, _, e := performSearch(ctx, server, queryObject)
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

			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

		})
	})

}

func TestDeleteNode(t *testing.T) {

	test.RunStorageTests(testcases(), t, func(ctx context.Context) {
		defer func() {
			commons.BatchPoolInit = sync.Once{}
		}()
		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}
		if er := createNodes(ctx, server); er != nil {
			panic(err)
		}

		Convey("Delete Node", t, func() {

			So(server.DeleteNode(ctx, &tree.Node{Uuid: "docID1"}), ShouldBeNil)
			<-time.After(4 * time.Second)

			queryObject := &tree.Query{
				FileName: "node",
			}

			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 0)
		})
	})
}

func TestSearchByUuidsMatch(t *testing.T) {

	test.RunStorageTests(testcases(), t, func(ctx context.Context) {
		defer func() {
			commons.BatchPoolInit = sync.Once{}
		}()
		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Search Node by UUID(s)", t, func() {

			So(createNodes(ctx, server), ShouldBeNil)

			node3 := &tree.Node{
				Uuid:  "uuidpart1-uuidpart2",
				Path:  "/a/folder",
				MTime: time.Now().Unix(),
				Type:  2,
				Size:  36,
			}
			node3.MustSetMeta("name", "folder")

			e := server.IndexNode(ctx, node3, false)
			So(e, ShouldBeNil)

			node4 := &tree.Node{
				Uuid:  "uuidpart1-uuidpart3",
				Path:  "/a/folder2",
				MTime: time.Now().Unix(),
				Type:  2,
				Size:  36,
			}
			node4.MustSetMeta("name", "folder2")

			e = server.IndexNode(ctx, node4, false)
			So(e, ShouldBeNil)

			<-time.After(3 * time.Second)

			queryObject := &tree.Query{
				UUIDs: []string{"randomUUID"},
			}
			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 0)

			queryObject = &tree.Query{
				UUIDs: []string{"docID1"},
			}
			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

			queryObject = &tree.Query{
				UUIDs: []string{"uuidpart1-uuidpart3"},
			}
			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

			queryObject = &tree.Query{
				UUIDs: []string{"docID1", "docID2"},
			}
			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 2)

			queryObject = &tree.Query{
				FreeString: "+Uuid:\"docID1\"",
			}
			results, _, e = performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 1)

		})
	})

}

func TestClearIndex(t *testing.T) {

	test.RunStorageTests(testcases(), t, func(ctx context.Context) {
		defer func() {
			commons.BatchPoolInit = sync.Once{}
		}()
		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}

		Convey("Clear Index", t, func() {

			So(createNodes(ctx, server), ShouldBeNil)

			e := server.ClearIndex(ctx)
			So(e, ShouldBeNil)

			<-time.After(1 * time.Second)

			queryObject := &tree.Query{
				FileName: "node",
			}

			results, _, e := performSearch(ctx, server, queryObject)
			So(e, ShouldBeNil)
			So(results, ShouldHaveLength, 0)
		})
	})
}

func TestExcludedNamespace(t *testing.T) {

	test.RunStorageTests(testcases(), t, func(ctx context.Context) {
		defer func() {
			commons.BatchPoolInit = sync.Once{}
		}()
		server, err := manager.Resolve[search.Engine](ctx)
		if err != nil {
			panic(err)
		}
		Convey("Preset Namespaces", t, func() {
			meta.TestPresetNamespaces = []*idm.UserMetaNamespace{
				{
					Namespace:      "indexable",
					Label:          "Indexable NS",
					Order:          0,
					Indexable:      true,
					JsonDefinition: "",
				},
				{
					Namespace:      "excluded",
					Label:          "Excluded NS",
					Order:          1,
					Indexable:      false,
					JsonDefinition: "",
				},
			}

			node := &tree.Node{
				Uuid:  "docID1",
				Path:  "/path/to/node.txt",
				MTime: time.Now().Unix(),
				Type:  1,
				Size:  24,
				MetaStore: map[string]string{
					"indexable": "\"value1\"",
					"excluded":  "\"value2\"",
				},
			}
			So(server.IndexNode(ctx, node, false), ShouldBeNil)
			So(server.(*commons.Server).Flush(ctx), ShouldBeNil)
			<-time.After(2 * time.Second)

			queryObject := &tree.Query{
				FreeString: "+Meta.indexable:\"value1\"",
			}
			nn, _, er := performSearch(ctx, server, queryObject)
			So(er, ShouldBeNil)
			So(nn, ShouldHaveLength, 1)

			queryObject = &tree.Query{
				FreeString: "+Meta.excluded:\"value2\"",
			}
			nn, _, er = performSearch(ctx, server, queryObject)
			So(er, ShouldBeNil)
			So(nn, ShouldHaveLength, 0)

		})
	})
}
