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
	"testing"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/storage/test"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/data/versions"
	"github.com/pydio/cells/v4/data/versions/dao/bolt"
	"github.com/pydio/cells/v4/data/versions/dao/mongo"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = []test.StorageTestCase{
		test.TemplateBoltWithPrefix(bolt.NewBoltStore, "versions_bolt_"),
		test.TemplateMongoEnvWithPrefix(mongo.NewMongoDAO, "data_"+uuid.New()[:6]+"_"),
	}
)

func TestDAO_CRUD(t *testing.T) {

	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("Test CRUD", t, func() {

			bs, err := manager.Resolve[versions.DAO](ctx)
			So(err, ShouldBeNil)

			e := bs.StoreVersion(ctx, "uuid", &tree.ChangeLog{Uuid: "version1", Data: []byte("etag1")})
			So(e, ShouldBeNil)
			e = bs.StoreVersion(ctx, "uuid", &tree.ChangeLog{Uuid: "version2", Data: []byte("etag2")})
			So(e, ShouldBeNil)
			e = bs.StoreVersion(ctx, "uuid", &tree.ChangeLog{Uuid: "version3", Data: []byte("etag3")})
			So(e, ShouldBeNil)

			var results []*tree.ChangeLog
			logs, _ := bs.GetVersions(ctx, "uuid")
			for log := range logs {
				results = append(results, log)
			}

			So(results, ShouldHaveLength, 3)

			var versionIds []string
			versions, finish, errChan := bs.ListAllVersionedNodesUuids(ctx)
		loop2:
			for {
				select {
				case v := <-versions:
					versionIds = append(versionIds, v)
				case <-finish:
					break loop2
				case <-errChan:
					break loop2
				}
			}

			So(versionIds, ShouldHaveLength, 1)

			last, e := bs.GetLastVersion(ctx, "uuid")
			So(last.Uuid, ShouldEqual, "version3")
			So(string(last.Data), ShouldEqual, "etag3")

			specific, e := bs.GetVersion(ctx, "uuid", "version2")
			So(specific.Uuid, ShouldEqual, "version2")
			So(string(specific.Data), ShouldEqual, "etag2")

			nonExisting, e := bs.GetLastVersion(ctx, "noid")
			So(e, ShouldBeNil)
			So(nonExisting, ShouldBeNil)

			nonExisting, e = bs.GetVersion(ctx, "uuid", "wrongVersion")
			So(e, ShouldBeNil)
			So(nonExisting.Uuid, ShouldEqual, "")

			ee := bs.DeleteVersionsForNode(ctx, "uuid")
			So(ee, ShouldBeNil)

			results = []*tree.ChangeLog{}
			logs, _ = bs.GetVersions(ctx, "uuid")
			for log := range logs {
				results = append(results, log)
			}
			So(results, ShouldHaveLength, 0)
		})

	})

	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("Test DeleteVersionsForNode", t, func() {

			bs, err := manager.Resolve[versions.DAO](ctx)
			So(err, ShouldBeNil)

			e := bs.StoreVersion(ctx, "uuid", &tree.ChangeLog{Uuid: "version1", Data: []byte("etag1")})
			So(e, ShouldBeNil)
			e = bs.StoreVersion(ctx, "uuid", &tree.ChangeLog{Uuid: "version2", Data: []byte("etag2")})
			So(e, ShouldBeNil)
			e = bs.StoreVersion(ctx, "uuid", &tree.ChangeLog{Uuid: "version3", Data: []byte("etag3")})
			So(e, ShouldBeNil)

			err = bs.DeleteVersionsForNode(ctx, "uuid", &tree.ChangeLog{Uuid: "version2"})
			So(err, ShouldBeNil)

			var results []*tree.ChangeLog
			logs, _ := bs.GetVersions(ctx, "uuid")
			for log := range logs {
				results = append(results, log)
			}
			So(results, ShouldHaveLength, 2)

		})
	})

}
