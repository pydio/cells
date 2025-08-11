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
	"context"
	"strings"
	"testing"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/storage/test"
	"github.com/pydio/cells/v5/common/utils/std"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	vaultdata []byte
)

func TestVault(t *testing.T) {
	test.RunGenericTests(testCases, t, func(ctx context.Context, t *testing.T, testcase testCase) {
		store, err := config.OpenStore(ctx, testcase.store)
		if err != nil {
			t.Fatal(err)
		}
		vaultStore, err := config.OpenStore(ctx, testcase.vault)
		if err != nil {
			t.Fatal(err)
		}
		Convey("Testing Vault", t, func() {
			testVault(t, store, vaultStore)
		})
	})
}

func testVault(t *testing.T, store config.Store, vault config.Store) {
	protected := config.NewVault(vault, store)
	config.RegisterVaultKey("protectedValue")
	config.RegisterVaultKey("my-protected-map/my-protected-value")
	config.RegisterVaultKey("myjson/myprotectedmap/myprotectedvalue")

	Convey("Test Set", func() {
		protected.Val("protectedValue").Set("my-secret-data")
		So(store.Val("protectedValue").Default("").String(), ShouldNotEqual, "my-secret-data")
		protectedID := protected.Val("protectedValue").String()
		So(protectedID, ShouldNotEqual, "my-secret-data")
		So(vault.Val(protectedID).String(), ShouldEqual, "my-secret-data")

		protected.Val("unprotectedValue").Set("my-test-config-value")

		So(store.Val("unprotectedValue").String(), ShouldEqual, "my-test-config-value")
	})

	Convey("Test Setting a map", func() {
		protected.Val("my-protected-map").Set(map[string]string{
			"my-protected-value":   "test",
			"my-unprotected-value": "test",
		})

		So(store.Val("my-protected-map/my-protected-value").Default("").String(), ShouldNotEqual, "test")
		So(store.Val("my-protected-map").Val("my-protected-value").Default("").String(), ShouldNotEqual, "test")
		So(store.Val("my-protected-map/my-protected-value").Default("").String(), ShouldNotEqual, "")
		So(store.Val("my-protected-map").Val("my-protected-value").Default("").String(), ShouldNotEqual, "")

		So(protected.Val("my-protected-map/my-protected-value").Set("testing the test"), ShouldBeNil)
	})

	Convey("Test Setting a json byte value", func() {
		protected.Val("myjson/myprotectedmap").Set(map[string]interface{}{
			"myprotectedvalue":   "test",
			"myunprotectedvalue": "whatever",
		})

		So(store.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String(), ShouldNotEqual, "test")

		// Trying to reset
		uuid := store.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String()

		protected.Val("myjson/myprotectedmap").Set(map[string]interface{}{
			"mynewunprotectedvalue": "test",
			"myprotectedvalue":      uuid,
		})

		// uuid should't have changed
		So(uuid, ShouldEqual, store.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String())
		So(store.Val("myjson/myprotectedmap/myunprotectedvalue").String(), ShouldBeEmpty)

		protected.Val("myjson/myprotectedmap").Set(map[string]interface{}{
			"myprotectedvalue": "test",
		})

		// uuid should't have changed
		So(uuid, ShouldEqual, store.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String())

		protected.Val("myjson/myprotectedmap").Set(map[string]interface{}{
			"myprotectedvalue": "test2",
		})

		// uuid should have changed
		So(uuid, ShouldNotEqual, store.Val("myjson/myprotectedmap/myprotectedvalue").Default("").String())
	})

	Convey("Test Setting a reference", func() {
		config.RegisterVaultKey("reference/key")
		protected.Val("reference").Set(map[string]any{"$ref": "rp#/reference"})
		protected.Val("reference/key").Set("val")

		refKey := store.Val("reference/key").String()
		So(vault.Val(refKey).String(), ShouldEqual, "val")
	})

	Convey("Test Setting config as whole", func() {
		config.RegisterVaultKey("something/key")
		protected.Val("something").Set(map[string]any{"key": "val"})

		refKey := store.Val("reference/key").String()
		So(vault.Val(refKey).String(), ShouldEqual, "val")
	})

	Convey("Test SMTP Stuff", func() {
		pwd := "This is a p@$$w0rd"

		protected.Val(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).Set(pwd)
		So(protected.Val(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).String(), ShouldEqual, pwd)

		protected.Val(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).Del()
		So(protected.Val(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).String(), ShouldEqual, "")

		config.RegisterVaultKey(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password"))

		protected.Val(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).Set(pwd)
		resPwd := store.Val(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).String()
		t.Log("Stored password value", resPwd)
		So(resPwd, ShouldNotEqual, pwd)
		So(resPwd, ShouldNotEqual, "")
		realPwd := vault.Val(resPwd).String()
		So(realPwd, ShouldEqual, pwd)

		pwdNew := "Another p@sswOOOrd"
		protected.Val(std.FormatPath("services", "pydio.grpc.mailer")).Set(map[string]any{"sender": map[string]any{"password": pwdNew}})
		resPwd = store.Val(std.FormatPath("services", "pydio.grpc.mailer", "sender", "password")).String()
		t.Log("Stored password value", resPwd)
		So(resPwd, ShouldNotEqual, pwd)
		So(resPwd, ShouldNotEqual, "")
		realPwd = vault.Val(resPwd).String()
		So(realPwd, ShouldEqual, pwdNew)

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
