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

package vault

import (
	"os"
	"path/filepath"
	"testing"

	"io/ioutil"

	json "github.com/pydio/cells/x/jsonx"

	. "github.com/smartystreets/goconvey/convey"
)

func TestNewVaultSource(t *testing.T) {
	Convey("Given a simple vault without keyring", t, func() {

		tmpDir := filepath.Join(os.TempDir(), "cells", "tests", "vault")
		os.MkdirAll(tmpDir, 0777)
		storePath := filepath.Join(tmpDir, "vault.json")
		keyPath := filepath.Join(tmpDir, "key.json")
		defer os.Remove(storePath)
		defer os.Remove(keyPath)
		src := NewVaultSource(storePath, keyPath, true)
		So(src, ShouldNotBeNil)
		So(src.(*VaultSource).masterPass, ShouldNotBeEmpty)
		So(src.(*VaultSource).masterPass, ShouldHaveLength, 50)

		// Set a value
		e := src.(*VaultSource).Set("mysecretuuid", "mysecretvalue", true)
		So(e, ShouldBeNil)

		// Read the value on file
		d, e := ioutil.ReadFile(storePath)
		So(e, ShouldBeNil)
		var content map[string]string
		e = json.Unmarshal(d, &content)
		So(e, ShouldBeNil)
		val, ok := content["mysecretuuid"]
		So(ok, ShouldBeTrue)
		So(val, ShouldNotBeEmpty)
		So(val, ShouldNotEqual, "mysecretvalue")

		// Reload and read the value
		newSrcSet, e := src.Read()
		So(e, ShouldBeNil)
		var newContent map[string]string
		e = json.Unmarshal(newSrcSet.Data, &newContent)
		So(e, ShouldBeNil)
		val, ok = newContent["mysecretuuid"]
		So(ok, ShouldBeTrue)
		So(val, ShouldNotBeEmpty)
		So(val, ShouldEqual, "mysecretvalue")

		// Delete the value
		e = src.(*VaultSource).Delete("mysecretuuid", true)
		So(e, ShouldBeNil)
		// Reread and check it's not there anymore
		newSrcSet, e = src.Read()
		So(e, ShouldBeNil)

		// Reload and check it's removed
		var newContent2 map[string]string
		e = json.Unmarshal(newSrcSet.Data, &newContent2)
		So(e, ShouldBeNil)
		_, ok = newContent2["mysecretuuid"]
		So(ok, ShouldBeFalse)

	})
}
