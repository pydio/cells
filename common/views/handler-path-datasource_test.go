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

package views

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/micro/go-micro/errors"
	"github.com/patrickmn/go-cache"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views/models"
)

func newTestHandlerBranchTranslator(pool *ClientsPool) (*PathDataSourceHandler, *HandlerMock) {

	testRootNode := &tree.Node{
		Uuid:      "root-node-uuid",
		Path:      "datasource/root",
		MetaStore: make(map[string]string),
	}
	testRootNode.SetMeta(common.MetaNamespaceDatasourceName, "datasource")
	testRootNode.SetMeta(common.MetaNamespaceDatasourcePath, "root")
	b := NewPathDataSourceHandler()
	b.RootNodesCache = cache.New(1*time.Second, 10*time.Second)
	b.RootNodesCache.Set("root-node-uuid", testRootNode, cache.DefaultExpiration)
	mock := NewHandlerMock()
	mock.Nodes["datasource/root/inner/path"] = &tree.Node{
		Path: "datasource/root/inner/path",
		Uuid: "found-uuid",
	}
	mock.Nodes["datasource/root/inner/path/file"] = &tree.Node{
		Path: "datasource/root/inner/path/file",
		Uuid: "other-uuid",
	}
	b.SetNextHandler(mock)
	b.SetClientsPool(pool)

	return b, mock

}

func makeFakeClientsPool() *ClientsPool {
	IsUnitTestEnv = true
	c := NewClientsPool(false)

	mockDatasource := &object.DataSource{
		Name:          "datasource",
		ObjectsHost:   "localhost",
		ObjectsPort:   9078,
		ApiKey:        "access",
		ApiSecret:     "secret",
		ObjectsSecure: false,
		ObjectsBucket: "bucket",
	}

	// mockClient, err := mockDatasource.CreateClient()
	// if err != nil {
	// 	return nil, err
	// }

	c.createClientsForDataSource("datasource", mockDatasource)
	c.aliases["datasource"] = sourceAlias{
		dataSource: "localhost:9078",
		bucket:     "bucket",
	}

	// coreClient, _ := minio.NewCore("localhost:9078", "access", "secret", false)
	// c.Clients = map[string]*minio.Core{
	// 	"datasource": coreClient,
	// }
	// c.dsBuckets = map[string]string{
	// 	"datasource": "bucket",
	// }
	// c.dsEncrypted = map[string]bool{
	// 	"datasource": true,
	// }
	return c
}

func makeFakeTestContext(identifier string, root ...*tree.Node) context.Context {

	fakeRoot := &tree.Node{Path: "datasource/root"}
	fakeRoot.SetMeta(common.MetaNamespaceDatasourceName, "datasource")
	c := context.Background()
	b := BranchInfo{
		Workspace: idm.Workspace{
			UUID:  "test-workspace",
			Slug:  "test-workspace",
			Label: "Test Workspace",
		},
		Root: fakeRoot,
	}
	if len(root) > 0 {
		b.Root = root[0]
	}
	c = WithBranchInfo(c, identifier, b)
	return c

}

func TestBranchTranslator_ReadNode(t *testing.T) {

	pool := makeFakeClientsPool()

	Convey("Test Readnode without context", t, func() {

		b, _ := newTestHandlerBranchTranslator(pool)
		_, e := b.ReadNode(context.Background(), &tree.ReadNodeRequest{})
		So(e, ShouldNotBeNil)
		parsed := errors.Parse(e.Error())
		So(parsed.Detail, ShouldContainSubstring, "Cannot find branch")

	})

	Convey("Test Readnode with wrong context", t, func() {

		b, _ := newTestHandlerBranchTranslator(pool)
		c := WithBranchInfo(context.Background(), "in", BranchInfo{
			Workspace: idm.Workspace{
				UUID:  "another-workspace",
				Label: "Another Workspace",
			},
		})
		_, e := b.ReadNode(c, &tree.ReadNodeRequest{})
		So(e, ShouldNotBeNil)
		parsed := errors.Parse(e.Error())
		So(parsed.Code, ShouldEqual, 500)

	})

	Convey("Test Readnode with admin context", t, func() {

		b, mock := newTestHandlerBranchTranslator(pool)
		adminCtx := WithBranchInfo(context.Background(), "in", BranchInfo{
			Workspace: idm.Workspace{UUID: "ROOT"},
		})
		_, e := b.ReadNode(adminCtx, &tree.ReadNodeRequest{Node: &tree.Node{
			Path:      "datasource/root/path",
			MetaStore: make(map[string]string),
		}})
		So(e, ShouldNotBeNil)
		belowNode := mock.Nodes["in"]
		So(belowNode.Path, ShouldEqual, "datasource/root/path")
		So(belowNode.GetStringMeta(common.MetaNamespaceDatasourcePath), ShouldEqual, "root/path")
		outputBranch, ok := GetBranchInfo(mock.Context, "in")
		So(ok, ShouldBeTrue)
		So(outputBranch.LoadedSource.ObjectsBucket, ShouldEqual, "bucket")

	})

	Convey("Test Readnode with user context", t, func() {

		b, mock := newTestHandlerBranchTranslator(pool)

		ctx := makeFakeTestContext("in")
		resp, er := b.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{
			Path:      "datasource/root/inner/path",
			MetaStore: make(map[string]string),
		}})
		So(er, ShouldBeNil) // Not found
		So(resp.Node.Path, ShouldEqual, "datasource/root/inner/path")
		So(resp.Node.Uuid, ShouldEqual, "found-uuid")

		belowNode := mock.Nodes["in"]
		So(belowNode, ShouldNotBeNil)
		So(belowNode.Path, ShouldEqual, "datasource/root/inner/path")
		//So(belowNode.GetStringMeta(common.MetaNamespaceDatasourcePath), ShouldEqual, "inner/path")
		outputBranch, ok := GetBranchInfo(mock.Context, "in")
		So(ok, ShouldBeTrue)
		So(outputBranch.Workspace.UUID, ShouldEqual, "test-workspace")
		So(outputBranch.ObjectsBucket, ShouldEqual, "bucket")
	})

	Convey("Test update Output Node", t, func() {

		b, _ := newTestHandlerBranchTranslator(pool)
		ctx := makeFakeTestContext("in", &tree.Node{Path: "datasource/root"})
		node := &tree.Node{Path: "datasource/root/sub/path"}
		b.updateOutputNode(ctx, node, "in")
		So(node.Path, ShouldEqual, "datasource/root/sub/path")

	})

	Convey("Test update Output Node - Admin", t, func() {

		b, _ := newTestHandlerBranchTranslator(pool)
		adminCtx := WithBranchInfo(context.Background(), "in", BranchInfo{
			Workspace: idm.Workspace{UUID: "ROOT"},
		})
		node := &tree.Node{Path: "datasource/root/sub/path"}
		b.updateOutputNode(adminCtx, node, "in")
		So(node.Path, ShouldEqual, "datasource/root/sub/path")

	})

}

func TestBranchTranslator_ListNodes(t *testing.T) {

	pool := makeFakeClientsPool()

	Convey("Test ListNodes with user context", t, func() {

		b, _ := newTestHandlerBranchTranslator(pool)

		ctx := makeFakeTestContext("in")
		client, er := b.ListNodes(ctx, &tree.ListNodesRequest{Node: &tree.Node{
			Path:      "test-workspace/inner/path",
			MetaStore: make(map[string]string),
		}})
		So(er, ShouldBeNil) // found
		defer client.Close()
		for {
			resp, e := client.Recv()
			if e != nil {
				break
			}
			if resp == nil {
				continue
			}
			So(resp.Node.Path, ShouldEqual, "test-workspace/inner/path/file")
			So(resp.Node.Uuid, ShouldEqual, "other-uuid")
			break // Test One Node Only
		}

	})
}

func TestBranchTranslator_OtherMethods(t *testing.T) {

	pool := makeFakeClientsPool()

	Convey("Test CreateNode", t, func() {

		b, _ := newTestHandlerBranchTranslator(pool)
		ctx := makeFakeTestContext("in")
		_, er := b.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{
			Path:      "test-workspace/inner/path",
			MetaStore: make(map[string]string),
		}})
		So(er, ShouldBeNil) // found

	})

	Convey("Test DeleteNode", t, func() {

		b, _ := newTestHandlerBranchTranslator(pool)
		ctx := makeFakeTestContext("in")
		_, er := b.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: &tree.Node{
			Path:      "test-workspace/inner/path",
			MetaStore: make(map[string]string),
		}})
		So(er, ShouldBeNil) // found

	})

	Convey("Test GetObject", t, func() {

		b, _ := newTestHandlerBranchTranslator(pool)
		ctx := makeFakeTestContext("in")
		_, er := b.GetObject(ctx, &tree.Node{
			Path:      "datasource/root/inner/path",
			MetaStore: make(map[string]string),
		}, &models.GetRequestData{})
		So(er, ShouldBeNil) // found

	})

	Convey("Test PutObject", t, func() {

		b, _ := newTestHandlerBranchTranslator(pool)
		ctx := makeFakeTestContext("in")
		_, er := b.PutObject(ctx, &tree.Node{
			Path:      "test-workspace/inner/path",
			MetaStore: make(map[string]string),
		}, strings.NewReader(""), &models.PutRequestData{})
		So(er, ShouldBeNil) // found

	})

	Convey("Test CopyObject", t, func() {

		b, _ := newTestHandlerBranchTranslator(pool)
		ctx := makeFakeTestContext("from")
		bI, _ := GetBranchInfo(ctx, "from")
		ctx = WithBranchInfo(ctx, "to", bI)
		_, er := b.CopyObject(ctx, &tree.Node{
			Path:      "test-workspace/inner/path",
			MetaStore: make(map[string]string),
		}, &tree.Node{
			Path:      "test-workspace/inner/path1",
			MetaStore: make(map[string]string),
		}, &models.CopyRequestData{})
		So(er, ShouldBeNil) // found

	})

	Convey("Test UpdateNode", t, func() {

		b, _ := newTestHandlerBranchTranslator(pool)
		ctx := makeFakeTestContext("from")
		bI, _ := GetBranchInfo(ctx, "from")
		ctx = WithBranchInfo(ctx, "to", bI)
		_, er := b.UpdateNode(ctx, &tree.UpdateNodeRequest{
			From: &tree.Node{
				Path:      "test-workspace/inner/path",
				MetaStore: make(map[string]string),
			}, To: &tree.Node{
				Path:      "test-workspace/inner/path1",
				MetaStore: make(map[string]string),
			},
		})
		So(er, ShouldBeNil) // found

	})

}

func TestBranchTranslator_Multipart(t *testing.T) {

	/*
		Convey("Branch Translator Multipart Function NOT IMPLEMENTED", t, func() {

			b, _ := newTestHandlerBranchTranslator(NewClientsPool(false))
			c := context.Background()
			_, e1 := b.MultipartCreate(c, &tree.Node{}, &MultipartRequestData{})
			So(errors.Parse(e1.Error()).Code, ShouldEqual, 400)

			_, e1 = b.MultipartComplete(c, &tree.Node{}, "uploadId", []minio.CompletePart{})
			So(errors.Parse(e1.Error()).Code, ShouldEqual, 400)

			e1 = b.MultipartAbort(c, &tree.Node{}, "uploadId", &MultipartRequestData{})
			So(errors.Parse(e1.Error()).Code, ShouldEqual, 400)

			_, e1 = b.MultipartList(c, "", &MultipartRequestData{})
			So(errors.Parse(e1.Error()).Code, ShouldEqual, 400)

			_, e1 = b.MultipartListObjectParts(c, &tree.Node{}, "uploadId", 0, 0)
			So(errors.Parse(e1.Error()).Code, ShouldEqual, 400)

		})
	*/

}
