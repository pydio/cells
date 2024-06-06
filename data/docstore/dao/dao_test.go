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
	"os"
	"path/filepath"
	"testing"

	proto "github.com/pydio/cells/v4/common/proto/docstore"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/utils/test"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/data/docstore"
	"github.com/pydio/cells/v4/data/docstore/dao/bleve"
	"github.com/pydio/cells/v4/data/docstore/dao/mongo"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = []test.StorageTestCase{
		{[]string{
			"boltdb://" + filepath.Join(os.TempDir(), "docstore_bolt_"+uuid.New()+".db"),
			"bleve://" + filepath.Join(os.TempDir(), "docstore_bleve_"+uuid.New()+".db"),
		}, true, bleve.NewBleveEngine},
		test.TemplateMongoEnvWithPrefix(mongo.NewMongoDAO, "test_docstore_"),
	}
)

func TestDocStore(t *testing.T) {

	Convey("Test PUT / LIST DocStore - more tests in grpc/handler_test.go", t, func() {
		test.RunStorageTests(testcases, func(ctx context.Context) {
			dao, err := manager.Resolve[docstore.DAO](ctx)
			So(err, ShouldBeNil)

			er := dao.PutDocument(ctx, "mystore", &proto.Document{ID: "1", Data: "Data"})
			So(er, ShouldBeNil)
			stores, e := dao.ListStores(ctx)
			So(e, ShouldBeNil)
			So(stores, ShouldHaveLength, 1)
			So(stores[0], ShouldEqual, "mystore")

			byId, er := dao.QueryDocuments(ctx, "mystore", &proto.DocumentQuery{
				ID: "1",
			})
			So(er, ShouldBeNil)
			for doc := range byId {
				So(doc.Data, ShouldEqual, "Data")
			}

		})
	})

}
