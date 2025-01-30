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
	"encoding/binary"
	"testing"
	"time"

	"go.etcd.io/bbolt"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/data/versions"
	"github.com/pydio/cells/v5/data/versions/dao/bolt"
	"github.com/pydio/cells/v5/data/versions/dao/mongo"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = []test.StorageTestCase{
		test.TemplateBoltWithPrefix(bolt.NewBoltStore, "versions_bolt_"),
		test.TemplateMongoEnvWithPrefix(mongo.NewMongoDAO, "data_"+uuid.New()[:6]+"_"),
	}
)

type legacyVersion struct {
	NodeUuid  string `bson:"node_uuid"`
	VersionId string `bson:"version_id"`
	Timestamp int64  `bson:"ts"`
	*tree.ChangeLog
}

func TestDAO_CRUD(t *testing.T) {

	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("Test CRUD", t, func() {

			bs, err := manager.Resolve[versions.DAO](ctx)
			So(err, ShouldBeNil)

			e := bs.StoreVersion(ctx, "uuid", &tree.ContentRevision{VersionId: "version1", ETag: "etag1", OwnerName: "user1", Event: &tree.NodeChangeEvent{}})
			So(e, ShouldBeNil)
			e = bs.StoreVersion(ctx, "uuid", &tree.ContentRevision{VersionId: "version2", ETag: "etag2", OwnerName: "user2", OwnerUuid: "user2id", Draft: true, Event: &tree.NodeChangeEvent{}})
			So(e, ShouldBeNil)
			e = bs.StoreVersion(ctx, "uuid", &tree.ContentRevision{VersionId: "version3", ETag: "etag3", OwnerName: "user2", OwnerUuid: "user2id", Event: &tree.NodeChangeEvent{}})
			So(e, ShouldBeNil)

			{
				var results []*tree.ContentRevision
				logs, _ := bs.GetVersions(ctx, "uuid", 0, 0, "", false, nil)
				for log := range logs {
					results = append(results, log)
				}
				So(results, ShouldHaveLength, 3)
			}
			{
				var results []*tree.ContentRevision
				logs, _ := bs.GetVersions(ctx, "uuid", 0, 0, "", false, map[string]any{"draftStatus": "draft"})
				for log := range logs {
					results = append(results, log)
				}
				So(results, ShouldHaveLength, 1)
			}
			{
				var results []*tree.ContentRevision
				logs, _ := bs.GetVersions(ctx, "uuid", 0, 0, "", false, map[string]any{"draftStatus": "published"})
				for log := range logs {
					results = append(results, log)
				}
				So(results, ShouldHaveLength, 2)
			}
			{
				var results []*tree.ContentRevision
				logs, _ := bs.GetVersions(ctx, "uuid", 0, 0, "", false, map[string]any{"ownerUuid": "user2id"})
				for log := range logs {
					results = append(results, log)
				}
				So(results, ShouldHaveLength, 2)
			}
			{
				var results []*tree.ContentRevision
				logs, _ := bs.GetVersions(ctx, "uuid", 0, 0, "", false, map[string]any{"ownerUuid": "user2id", "draftStatus": "draft"})
				for log := range logs {
					results = append(results, log)
				}
				So(results, ShouldHaveLength, 1)
			}

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
			So(last.VersionId, ShouldEqual, "version3")
			So(last.ETag, ShouldEqual, "etag3")

			specific, e := bs.GetVersion(ctx, "uuid", "version2")
			So(specific.VersionId, ShouldEqual, "version2")
			So(string(specific.ETag), ShouldEqual, "etag2")

			nonExisting, e := bs.GetLastVersion(ctx, "noid")
			So(e, ShouldBeNil)
			So(nonExisting, ShouldBeNil)

			nonExisting, e = bs.GetVersion(ctx, "uuid", "wrongVersion")
			So(e, ShouldNotBeNil)
			So(errors.Is(e, errors.VersionNotFound), ShouldBeTrue)

			ee := bs.DeleteVersionsForNode(ctx, "uuid")
			So(ee, ShouldBeNil)

			results := []*tree.ContentRevision{}
			logs, _ := bs.GetVersions(ctx, "uuid", 0, 0, "", false, nil)
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

			e := bs.StoreVersion(ctx, "uuid", &tree.ContentRevision{VersionId: "version1", ETag: "etag1", OwnerName: "user", Event: &tree.NodeChangeEvent{}})
			So(e, ShouldBeNil)
			e = bs.StoreVersion(ctx, "uuid", &tree.ContentRevision{VersionId: "version2", ETag: "etag2", OwnerName: "user", Event: &tree.NodeChangeEvent{}})
			So(e, ShouldBeNil)
			e = bs.StoreVersion(ctx, "uuid", &tree.ContentRevision{VersionId: "version3", ETag: "etag3", OwnerName: "user", Event: &tree.NodeChangeEvent{}})
			So(e, ShouldBeNil)

			err = bs.DeleteVersionsForNode(ctx, "uuid", "version2")
			So(err, ShouldBeNil)

			var results []*tree.ContentRevision
			logs, _ := bs.GetVersions(ctx, "uuid", 0, 0, "", false, nil)
			for log := range logs {
				results = append(results, log)
			}
			So(results, ShouldHaveLength, 2)

		})
	})

	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		Convey("Test Backward Compat ChangeLog => ContentRevision", t, func() {
			bs, err := manager.Resolve[versions.DAO](ctx)
			So(err, ShouldBeNil)
			if boltStore, ok := bs.(*bolt.BoltStore); ok {
				err = boltStore.Update(func(tx *bbolt.Tx) error {

					bucket := tx.Bucket([]byte("versions"))
					if bucket == nil {
						return errors.WithStack(errors.BucketNotFound)
					}
					nodeBucket, err := bucket.CreateBucketIfNotExists([]byte("legacy_uuid"))
					if err != nil {
						return err
					}
					newValue, e := proto.Marshal(&tree.ChangeLog{Uuid: "version1", OwnerUuid: "user", Data: []byte("etag1")})
					if e != nil {
						return e
					}

					objectKey, _ := nodeBucket.NextSequence()
					k := make([]byte, 8)
					binary.BigEndian.PutUint64(k, objectKey)
					return nodeBucket.Put(k, newValue)
				})
				So(err, ShouldBeNil)

			} else if ms, ok1 := bs.(*mongo.MongoStore); ok1 {

				mv := &legacyVersion{
					NodeUuid:  "legacy_uuid",
					VersionId: "version1",
					Timestamp: time.Now().UnixNano(),
					ChangeLog: &tree.ChangeLog{Uuid: "version1", Data: []byte("etag1"), OwnerUuid: "user"},
				}
				_, e := ms.Collection("versions").InsertOne(ctx, mv)
				So(e, ShouldBeNil)

			}

			var results []*tree.ContentRevision
			logs, _ := bs.GetVersions(ctx, "legacy_uuid", 0, 0, "", false, nil)
			for log := range logs {
				So(log, ShouldNotBeNil)
				results = append(results, log)
			}

			So(results, ShouldHaveLength, 1)
			So(results[0].VersionId, ShouldEqual, "version1")
			So(results[0].ETag, ShouldEqual, "etag1")
			So(results[0].OwnerName, ShouldEqual, "user")

		})
	})

}
