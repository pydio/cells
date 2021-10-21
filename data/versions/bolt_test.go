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

package versions

import (
	"os"
	"path/filepath"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/tree"
)

func TestNewBoltStore(t *testing.T) {

	Convey("Test NewBoltStore", t, func() {

		p := filepath.Join(os.TempDir(), "bolt-test1.db")
		bs, e := NewBoltStore(p, true)
		So(e, ShouldBeNil)
		So(bs, ShouldNotBeNil)

		e = bs.Close()
		So(e, ShouldBeNil)
		stat, _ := os.Stat(p)
		So(stat, ShouldBeNil)

		bs, e = NewBoltStore(os.DevNull, true)
		So(e, ShouldNotBeNil)
		So(bs, ShouldBeNil)

	})

}

func TestBoltStore_CRUD(t *testing.T) {

	Convey("Test CRUD", t, func() {

		p := filepath.Join(os.TempDir(), "bolt-test1.db")
		bs, e := NewBoltStore(p, true)
		So(e, ShouldBeNil)
		defer bs.Close()
		defer os.Remove(p)

		e = bs.StoreVersion("uuid", &tree.ChangeLog{Uuid: "version1", Data: []byte("etag1")})
		So(e, ShouldBeNil)
		e = bs.StoreVersion("uuid", &tree.ChangeLog{Uuid: "version2", Data: []byte("etag2")})
		So(e, ShouldBeNil)
		e = bs.StoreVersion("uuid", &tree.ChangeLog{Uuid: "version3", Data: []byte("etag3")})
		So(e, ShouldBeNil)

		var results []*tree.ChangeLog
		logs, done := bs.GetVersions("uuid")
	loop:
		for {
			select {
			case l := <-logs:
				results = append(results, l)
			case <-done:
				break loop
			}
		}

		So(results, ShouldHaveLength, 3)

		var versionIds []string
		versions, finish, errChan := bs.ListAllVersionedNodesUuids()
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

		last, e := bs.GetLastVersion("uuid")
		So(last, ShouldResemble, &tree.ChangeLog{Uuid: "version3", Data: []byte("etag3")})

		specific, e := bs.GetVersion("uuid", "version2")
		So(specific, ShouldResemble, &tree.ChangeLog{Uuid: "version2", Data: []byte("etag2")})

		nonExisting, e := bs.GetLastVersion("noid")
		So(e, ShouldBeNil)
		So(nonExisting, ShouldBeNil)

		nonExisting, e = bs.GetVersion("uuid", "wrongVersion")
		So(e, ShouldBeNil)
		So(nonExisting, ShouldResemble, &tree.ChangeLog{})

		ee := bs.DeleteVersionsForNode("uuid")
		So(ee, ShouldBeNil)

		results = []*tree.ChangeLog{}
		logs, done = bs.GetVersions("uuid")
	loop3:
		for {
			select {
			case l := <-logs:
				results = append(results, l)
			case <-done:
				break loop3
			}
		}
		So(results, ShouldHaveLength, 0)

	})

	Convey("Test DeleteVersionsForNode", t, func() {

		p := filepath.Join(os.TempDir(), "bolt-test2.db")
		bs, e := NewBoltStore(p, true)
		So(e, ShouldBeNil)
		defer bs.Close()
		defer os.Remove(p)

		e = bs.StoreVersion("uuid", &tree.ChangeLog{Uuid: "version1", Data: []byte("etag1")})
		So(e, ShouldBeNil)
		e = bs.StoreVersion("uuid", &tree.ChangeLog{Uuid: "version2", Data: []byte("etag2")})
		So(e, ShouldBeNil)
		e = bs.StoreVersion("uuid", &tree.ChangeLog{Uuid: "version3", Data: []byte("etag3")})
		So(e, ShouldBeNil)

		bs.DeleteVersionsForNode("uuid", &tree.ChangeLog{Uuid: "version2"})

		var results []*tree.ChangeLog
		logs, done := bs.GetVersions("uuid")
	loop3:
		for {
			select {
			case l := <-logs:
				results = append(results, l)
			case <-done:
				break loop3
			}
		}
		So(results, ShouldHaveLength, 2)

	})

}
