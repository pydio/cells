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

package put

import (
	"context"
	"strings"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
)

func testMkFileResources() (*Handler, context.Context, *nodes.HandlerMock) {

	// Create dummy client pool
	nodes.IsUnitTestEnv = true
	tc := &tree.NodeProviderMock{
		Nodes: map[string]tree.Node{"existing/node": tree.Node{
			Uuid: "found-uuid",
			Path: "existing/node",
		}},
	}
	tw := &tree.NodeReceiverMock{}
	pool := nodes.MakeFakeClientsPool(tc, tw)

	// create dummy handler
	h := &Handler{}
	mock := nodes.NewHandlerMock()
	h.Next = mock
	h.SetClientsPool(pool)

	ctx := context.Background()

	return h, ctx, mock
}

func TestHandler_GetOrCreatePutNode(t *testing.T) {

	h, ctx, _ := testMkFileResources()
	Convey("getOrCreatePutNode", t, func() {
		node, errFunc, err := h.getOrCreatePutNode(ctx, "existing/node", &models.PutRequestData{Size: 12})
		So(err, ShouldBeNil)
		So(errFunc, ShouldBeNil)
		So(node, ShouldNotBeNil)
		So(node.Path, ShouldEqual, "existing/node")
	})

	Convey("getOrCreatePutNode", t, func() {

		node, errFunc, err := h.getOrCreatePutNode(ctx, "other/node", &models.PutRequestData{Size: 12})
		So(err, ShouldBeNil)
		So(errFunc, ShouldNotBeNil)
		So(node, ShouldNotBeNil)
		So(node.Path, ShouldEqual, "other/node")

		errFunc()

	})

}

func TestHandler_PutObject(t *testing.T) {

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
