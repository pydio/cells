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

package views

import (
	"context"
	"strings"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views/models"
)

func testMkFileResources() (*PutHandler, context.Context, *HandlerMock) {

	// Create dummy client pool
	IsUnitTestEnv = true
	pool := NewClientsPool(false)
	pool.treeClient = &tree.NodeProviderMock{
		Nodes: map[string]tree.Node{"existing/node": tree.Node{
			Uuid: "found-uuid",
			Path: "existing/node",
		}},
	}
	pool.treeClientWrite = &tree.NodeReceiverMock{}

	// pool := &ClientsPool{
	// 	Clients:     make(map[string]*minio.Core),
	// 	dsBuckets:   make(map[string]string),
	// 	dsEncrypted: make(map[string]bool),
	// 	aliases:     make(map[string]sourceAlias),
	// 	treeClient:&tree.NodeProviderMock{
	// 		Nodes: map[string]string{"existing/node": "found-uuid"},
	// 	},
	// 	treeClientWrite:&tree.NodeReceiverMock{},
	// }

	// create dummy handler
	h := &PutHandler{}
	mock := NewHandlerMock()
	h.SetNextHandler(mock)
	h.SetClientsPool(pool)

	ctx := context.Background()

	return h, ctx, mock
}

func TestMkfileHandler_GetOrCreatePutNode(t *testing.T) {

	h, ctx, _ := testMkFileResources()
	Convey("getOrCreatePutNode", t, func() {
		node, err, errFunc := h.getOrCreatePutNode(ctx, "existing/node", &models.PutRequestData{Size: 12})
		So(err, ShouldBeNil)
		So(errFunc, ShouldBeNil)
		So(node, ShouldNotBeNil)
		So(node.Path, ShouldEqual, "existing/node")
	})

	Convey("getOrCreatePutNode", t, func() {

		node, err, errFunc := h.getOrCreatePutNode(ctx, "other/node", &models.PutRequestData{Size: 12})
		So(err, ShouldBeNil)
		So(errFunc, ShouldNotBeNil)
		So(node, ShouldNotBeNil)
		So(node.Path, ShouldEqual, "other/node")

		errFunc()

	})

}

func TestMkfileHandler_PutObject(t *testing.T) {

	h, ctx, _ := testMkFileResources()
	Convey("PutObject 1", t, func() {
		size, err := h.PutObject(ctx, &tree.Node{Path: "/path/" + common.PydioSyncHiddenFile}, strings.NewReader(""), &models.PutRequestData{})
		So(err, ShouldBeNil)
		So(size, ShouldBeZeroValue)

	})

	Convey("PutObject 2", t, func() {
		size, err := h.PutObject(ctx, &tree.Node{Path: "/path/node"}, strings.NewReader(""), &models.PutRequestData{})
		So(err, ShouldBeNil)
		So(size, ShouldBeZeroValue)

	})

}
