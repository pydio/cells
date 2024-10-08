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

package configtest

import (
	"strings"
	"testing"

	"github.com/pydio/cells/v4/common/config"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	vaultdata []byte
)

func testVault(t *testing.T, std config.Store, vault config.Store) {
	protected := config.NewVault(vault, std)
	config.RegisterVaultKey("protectedValue")
	config.RegisterVaultKey("my-protected-map/my-protected-value")
	config.RegisterVaultKey("myjson/myprotectedmap/myprotectedvalue")

	Convey("Test Set", t, func() {
		protected.Val("protectedValue").Set("my-secret-data")
		So(std.Val("protectedValue").Default("").String(), ShouldNotEqual, "my-secret-data")
		So(vault.Val(protected.Val("protectedValue").String()).String(), ShouldEqual, "my-secret-data")

		protected.Val("unprotectedValue").Set("my-test-config-value")

		So(std.Val("unprotectedValue").String(), ShouldEqual, "my-test-config-value")
	})

	Convey("Test Setting a map", t, func() {
		protected.Val("my-protected-map").Set(map[string]string{
			"my-protected-value":   "test",
			"my-unprotected-value": "test",
		})

		So(std.Val("my-protected-map/my-protected-value").Default("").String(), ShouldNotEqual, "test")
		So(std.Val("my-protected-map").Val("my-protected-value").Default("").String(), ShouldNotEqual, "test")
		So(std.Val("my-protected-map/my-protected-value").Default("").String(), ShouldNotEqual, "")
		So(std.Val("my-protected-map").Val("my-protected-value").Default("").String(), ShouldNotEqual, "")

		So(protected.Val("my-protected-map/my-protected-value").Set("testing the test"), ShouldBeNil)
	})

	Convey("Test Setting a json byte value", t, func() {
		protected.Val("myjson/myprotectedmap").Set(map[string]interface{}{
			"myprotectedvalue":   "test",
			"myunprotectedvalue": "whatever",
		})

		So(std.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String(), ShouldNotEqual, "test")

		// Trying to reset
		uuid := std.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String()

		protected.Val("myjson/myprotectedmap").Set(map[string]interface{}{
			"mynewunprotectedvalue": "test",
			"myprotectedvalue":      uuid,
		})

		// uuid should't have changed
		So(uuid, ShouldEqual, std.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String())
		So(std.Val("myjson/myprotectedmap/myunprotectedvalue").String(), ShouldBeEmpty)

		protected.Val("myjson/myprotectedmap").Set(map[string]interface{}{
			"myprotectedvalue": "test",
		})

		// uuid should't have changed
		So(uuid, ShouldEqual, std.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String())

		protected.Val("myjson/myprotectedmap").Set(map[string]interface{}{
			"myprotectedvalue": "test2",
		})

		// uuid should have changed
		So(uuid, ShouldNotEqual, std.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String())
	})
}

type encrypter struct {
}

func (encrypter) Encrypt(b []byte) (string, error) {
	return "encrypted : " + string(b), nil
}

func (encrypter) Decrypt(s string) ([]byte, error) {
	return []byte(strings.TrimPrefix(s, "encrypted : ")), nil
}
