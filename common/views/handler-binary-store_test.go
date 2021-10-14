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

	"github.com/micro/go-micro/errors"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views/models"
)

var (
	testBinaryStoreName = "store"
)

func getStoreTestMock() (Handler, *HandlerMock) {
	mock := NewHandlerMock()
	handler := &BinaryStoreHandler{
		StoreName: testBinaryStoreName,
	}
	handler.SetNextHandler(mock)

	IsUnitTestEnv = true
	cPool := NewClientsPool(false)
	cPool.createClientsForDataSource(testBinaryStoreName, &object.DataSource{})
	handler.SetClientsPool(cPool)
	mock.Nodes["/test/file"] = &tree.Node{Path: "/test/file"}
	mock.Nodes[testBinaryStoreName+"/thumb1"] = &tree.Node{Path: testBinaryStoreName + "/thumb1"}
	return handler, mock
}

func TestBinaryStoreHandler_ListNodes(t *testing.T) {

	handler, _ := getStoreTestMock()

	Convey("Test List normal node", t, func() {
		client, e := handler.ListNodes(context.Background(), &tree.ListNodesRequest{Node: &tree.Node{Path: "/test"}})
		So(e, ShouldBeNil)
		count := 0
		defer client.Close()
		for {
			_, e := client.Recv()
			if e != nil {
				break
			}
			count++
		}
		So(count, ShouldEqual, 1)

	})

	Convey("Test List inside store: should display nothing", t, func() {
		client, e := handler.ListNodes(context.Background(), &tree.ListNodesRequest{Node: &tree.Node{Path: testBinaryStoreName}})
		So(e, ShouldBeNil)
		defer client.Close()
		count := 0
		for {
			_, e := client.Recv()
			if e != nil {
				break
			}
			count++
		}
		So(count, ShouldEqual, 0)
	})
}

func TestBinaryStoreHandler_ReadNode(t *testing.T) {

	handler, mock := getStoreTestMock()

	Convey("Test Read Store Node, no Data Source info available", t, func() {

		// Test Store
		_, e := handler.ReadNode(context.Background(), &tree.ReadNodeRequest{Node: &tree.Node{Path: testBinaryStoreName + "/thumb1"}})
		So(e, ShouldNotBeNil) // S3 client StatObject Error

		_, er := handler.ReadNode(context.Background(), &tree.ReadNodeRequest{Node: &tree.Node{Path: "/not/thumb"}})
		So(er, ShouldNotBeNil) // Not found error
		So(mock.Nodes["in"], ShouldNotBeNil)

	})

}

// func TestBinaryStoreHandler_GetObject(t *testing.T) {

// 	handler, mock := getStoreTestMock()

// 	Convey("Test Get Object", t, func() {
// 		_, e := handler.GetObject(context.Background(), &tree.Node{Path: testBinaryStoreName + "/thumb"}, &GetRequestData{})
// 		So(e, ShouldNotBeNil)
// 		So(mock.Nodes["in"], ShouldNotBeNil)
// 		ctx := mock.Context
// 		So(ctx.Value(ctxBranchInfoKey{}), ShouldNotBeNil)
// 	})

// }

func TestBinaryStoreHandler_WriteOperations(t *testing.T) {

	handler, _ := getStoreTestMock()
	ctx := context.Background()

	Convey("Test CreateNode in BinaryStore", t, func() {

		_, e := handler.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{Path: testBinaryStoreName + "/thumb"}})
		parsed := errors.Parse(e.Error())
		So(parsed.Code, ShouldEqual, 403)

	})

	Convey("Test PutObject in BinaryStore", t, func() {

		_, e := handler.PutObject(ctx, &tree.Node{Path: testBinaryStoreName + "/thumb"}, strings.NewReader(""), &models.PutRequestData{})
		parsed := errors.Parse(e.Error())
		So(parsed.Code, ShouldEqual, 403)

	})

	Convey("Test DeleteNode in BinaryStore", t, func() {

		_, e := handler.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: &tree.Node{Path: testBinaryStoreName + "/thumb"}})
		parsed := errors.Parse(e.Error())
		So(parsed.Code, ShouldEqual, 403)

	})

	Convey("Test UpdateNode in BinaryStore", t, func() {

		_, e := handler.UpdateNode(ctx, &tree.UpdateNodeRequest{
			From: &tree.Node{Path: testBinaryStoreName + "/thumb"},
			To:   &tree.Node{Path: testBinaryStoreName + "/thumb1"},
		})
		parsed := errors.Parse(e.Error())
		So(parsed.Code, ShouldEqual, 403)

	})

	Convey("Test CopyObject in BinaryStore", t, func() {

		_, e := handler.CopyObject(ctx, &tree.Node{Path: testBinaryStoreName + "/thumb"}, &tree.Node{Path: testBinaryStoreName + "/thumb1"}, &models.CopyRequestData{})
		parsed := errors.Parse(e.Error())
		So(parsed.Code, ShouldEqual, 403)

	})

}
