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

package auth

import (
	"os"
	"testing"

	"github.com/pydio/cells/common/proto/auth"
	"github.com/smartystreets/goconvey/convey"
)

var (
	store  *BoltStore
	err    error
	dbFile = os.TempDir() + "/bolt-test.db"
)

func TestBoltStore(t *testing.T) {

	const bucketName = "tokens"
	defer os.Remove(dbFile)

	entries := map[string]string{
		"t1": "i1",
		"t2": "i2",
		"t3": "i3",
		"t4": "i4",
		"t5": "i5",
	}

	convey.Convey("Test Create and Open bolt db", t, func() {
		//t.Log("Test Create and Open bolt db")
		store, err = NewBoltStore(bucketName, dbFile)
		convey.So(err, convey.ShouldBeNil)
		convey.So(store, convey.ShouldNotBeNil)
	})

	convey.Convey("Test Open wrong file", t, func() {
		//t.Log("Test Open wrong file")
		df := os.TempDir() + "/watever-non-existing-folder/toto.db"
		_, err := NewBoltStore(bucketName, df)
		convey.So(err, convey.ShouldNotBeNil)
	})

	convey.Convey("Test Put tokens", t, func() {
		//t.Log("Test Put tokens")
		foundError := false
		for k, v := range entries {
			foundError = foundError || store.PutToken(&auth.Token{Value: k, AdditionalInfo: v}) != nil
		}
		convey.So(foundError, convey.ShouldBeFalse)
	})

	convey.Convey("Test Count inserted tokens", t, func() {
		//t.Log("Test Count inserted tokens")
		count := 0
		allFound := true
		c, err := store.ListTokens(0, len(entries))
		convey.So(err, convey.ShouldBeNil)
		convey.So(c, convey.ShouldNotBeNil)

		done := false
		for !done {
			select {
			case t := <-c:
				count++
				info, ok := entries[t.Value]
				allFound = ok && allFound && info == t.AdditionalInfo

			default:
				done = true
			}

		}

		convey.So(allFound, convey.ShouldBeTrue)
		convey.So(count, convey.ShouldEqual, len(entries))
	})

	convey.Convey("Test Find token", t, func() {
		//t.Log("Test Find token")
		t, err := store.GetInfo("t1")
		convey.So(t, convey.ShouldEqual, "i1")
		convey.So(err, convey.ShouldBeNil)
	})

	convey.Convey("Test Delete token", t, func() {
		//t.Log("Test Delete token")
		err := store.DeleteToken("t1")
		convey.So(err, convey.ShouldBeNil)
	})

	defer os.Remove(dbFile)
}
