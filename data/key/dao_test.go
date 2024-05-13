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

package key

import (
	"context"
	"testing"

	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/utils/test"
	"github.com/pydio/cells/v4/data/meta"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSharedSQLITE(meta.NewGormDAO)
)

func TestSqlimpl_InsertNode(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		Convey("Test Put key", t, func() {
			mockDAO, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)
			err := mockDAO.SaveNode(ctx, &encryption.Node{
				NodeId: "node_id",
				Legacy: false,
			})
			So(err, ShouldBeNil)
		})
	})
}

func TestSqlimpl_SetNodeKey(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		Convey("Set node key", t, func() {
			mockDAO, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)
			err := mockDAO.SaveNodeKey(ctx, &encryption.NodeKey{
				NodeId:  "node_id",
				UserId:  "pydio",
				OwnerId: "pydio",
				KeyData: []byte("key"),
			})
			So(err, ShouldBeNil)
		})
	})
}

func TestSqlimpl_SetNodeKey2(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		Convey("Set node share key 1", t, func() {

			mockDAO, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)
			err := mockDAO.SaveNodeKey(ctx, &encryption.NodeKey{
				NodeId:  "node_id",
				UserId:  "pydio",
				OwnerId: "user-1",
				KeyData: []byte("key"),
			})
			So(err, ShouldBeNil)
		})
	})
}

func TestSqlimpl_SetNodeKey3(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {

		Convey("Set node share key 2", t, func() {
			mockDAO, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)

			err := mockDAO.SaveNodeKey(ctx, &encryption.NodeKey{
				NodeId:  "node_id",
				UserId:  "pydio",
				OwnerId: "user-2",
				KeyData: []byte("key"),
			})
			So(err, ShouldBeNil)
		})
	})
}

func TestSqlimpl_GetNodeKey(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		Convey("Get node key", t, func() {
			mockDAO, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)

			k, err := mockDAO.GetNodeKey(ctx, "node_id", "pydio")
			So(err, ShouldBeNil)
			So(k, ShouldNotBeNil)
		})
	})
}

func TestSqlimpl_DeleteNodeSharedKey(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		Convey("Get node key", t, func() {
			mockDAO, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)
			err := mockDAO.DeleteNodeKey(ctx, &encryption.NodeKey{
				NodeId:  "node_id",
				OwnerId: "pydio",
				UserId:  "user-1",
			})
			So(err, ShouldBeNil)
		})
	})
}

func TestSqlimpl_DeleteNodeAllSharedKey(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		Convey("Get node key", t, func() {
			mockDAO, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)
			err := mockDAO.DeleteNodeKey(ctx, &encryption.NodeKey{
				NodeId:  "node_id",
				OwnerId: "pydio",
			})
			So(err, ShouldBeNil)
		})
	})
}

func TestSqlimpl_DeleteNode(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		Convey("Get node key", t, func() {
			mockDAO, er := manager.Resolve[DAO](ctx)
			So(er, ShouldBeNil)
			err := mockDAO.DeleteNode(ctx, "pydio")
			So(err, ShouldBeNil)
		})
	})
}
