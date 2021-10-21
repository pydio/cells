// +build ignore

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

package crypto

// These tests are currently disabled for the build:
// 1. they do not pass on the automated build and CI environment,
// 2. they are known to fail on MacOS (darwin architecture) due
// to special characters in password.
//
// TODO write a darwin test for that.

import (
	"testing"

	"github.com/zalando/go-keyring"

	. "github.com/smartystreets/goconvey/convey"
)

func TestKeyring(t *testing.T) {

	var (
		password    = "pass\r\\0nword"
		user        = "tester"
		serviceName = "pydio.tests"
	)

	Convey("Save password in keyring", t, func() {
		err := SetKeyringPassword(serviceName, user, []byte(password))
		So(err, ShouldBeNil)
	})

	Convey("Get password as Bytes", t, func() {
		bytes, err := GetKeyringPassword(serviceName, user, false)
		So(err, ShouldBeNil)
		So(string(bytes), ShouldEqual, password)
	})

	Convey("Delete password from keyring", t, func() {
		err := keyring.Delete(serviceName, user)
		So(err, ShouldBeNil)
	})
}
