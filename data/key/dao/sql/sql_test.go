//go:build storage || sql

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

package sql

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common/proto/encryption"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/data/key"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(NewKeyDAO)
)

func TestCrudKeys(t *testing.T) {

	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		sql.TestPrintQueries = true

		mockDAO, er := manager.Resolve[key.DAO](ctx)
		if er != nil {
			panic(er)
		}

		Convey("Test Put key", t, func() {
			err := mockDAO.SaveNode(ctx, &encryption.Node{
				NodeId: "node_id",
				Legacy: false,
			})
			So(err, ShouldBeNil)

			err = mockDAO.SaveNodeKey(ctx, &encryption.NodeKey{
				NodeId:  "node_id",
				UserId:  "pydio",
				OwnerId: "pydio",
				KeyData: []byte("key"),
			})
			So(err, ShouldBeNil)

			err = mockDAO.SaveNodeKey(ctx, &encryption.NodeKey{
				NodeId:  "node_id",
				UserId:  "pydio",
				OwnerId: "user-1",
				KeyData: []byte("key"),
			})
			So(err, ShouldBeNil)

			err = mockDAO.SaveNodeKey(ctx, &encryption.NodeKey{
				NodeId:  "node_id",
				UserId:  "pydio",
				OwnerId: "user-2",
				KeyData: []byte("key"),
			})
			So(err, ShouldBeNil)

		})

		Convey("Test Get Key", t, func() {
			k, err := mockDAO.GetNodeKey(ctx, "node_id", "pydio")
			So(err, ShouldBeNil)
			So(k, ShouldNotBeNil)

		})

		Convey("Test Delete Key", t, func() {

			err := mockDAO.DeleteNodeKey(ctx, &encryption.NodeKey{
				NodeId:  "node_id",
				OwnerId: "pydio",
				UserId:  "user-1",
			})
			So(err, ShouldBeNil)

			err = mockDAO.DeleteNodeKey(ctx, &encryption.NodeKey{
				NodeId:  "node_id",
				OwnerId: "pydio",
			})
			So(err, ShouldBeNil)

			err = mockDAO.DeleteNode(ctx, "pydio")
			So(err, ShouldBeNil)
		})
	})
}
