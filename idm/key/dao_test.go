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

package key

import (
	"context"
	"encoding/base64"
	"testing"
	"time"

	"github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/dao/sqlite"
	"github.com/pydio/cells/v4/common/proto/encryption"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/utils/test"
)

var (
	testcases = []test.StorageTestCase{
		{[]string{sqlite.Driver + "://" + sqlite.SharedMemDSN}, true, NewDAO},
	}
)

func TestDAOPut(t *testing.T) {

	test.RunStorageTests(testcases, func(ctx context.Context) {

		dao, err := manager.Resolve[DAO](ctx)
		if err != nil {
			panic(err)
		}

		convey.Convey("Test PUT key", t, func() {
			err := dao.SaveKey(ctx, &encryption.Key{
				Owner:        "pydio",
				ID:           "test",
				Label:        "Test",
				Content:      base64.StdEncoding.EncodeToString([]byte("return to senderreturn to sender")),
				CreationDate: 0,
			})
			convey.So(err, convey.ShouldBeNil)
		})
		convey.Convey("Test UPDATE key", t, func() {

			err := dao.SaveKey(ctx, &encryption.Key{
				Owner:        "pydio",
				ID:           "test",
				Label:        "Test",
				Content:      base64.StdEncoding.EncodeToString([]byte("return to senderreturn to sender")),
				CreationDate: int32(time.Now().Unix()),
				Info: &encryption.KeyInfo{
					Imports: []*encryption.Import{
						&encryption.Import{
							By:   "test",
							Date: int32(time.Now().Unix()),
						},
					},
				},
			})
			convey.So(err, convey.ShouldBeNil)
		})
		convey.Convey("Test GET key", t, func() {
			k, v, err := dao.GetKey(ctx, "pydio", "test")
			convey.So(err, convey.ShouldBeNil)
			convey.So(k, convey.ShouldNotBeNil)
			convey.So(v, convey.ShouldEqual, 4)
		})
		convey.Convey("Test LIST key", t, func() {
			k, err := dao.ListKeys(ctx, "pydio")
			convey.So(err, convey.ShouldBeNil)
			convey.So(k, convey.ShouldNotBeNil)
			convey.So(len(k), convey.ShouldEqual, 1)
		})
		convey.Convey("Test DELETE key", t, func() {
			err := dao.DeleteKey(ctx, "pydio", "test")
			convey.So(err, convey.ShouldBeNil)

			k, err := dao.ListKeys(ctx, "jabar")
			convey.So(err, convey.ShouldBeNil)
			convey.So(k, convey.ShouldBeEmpty)
		})
	})
}
