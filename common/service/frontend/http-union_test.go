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

package frontend

import (
	"embed"
	"io"
	"testing"

	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/utils/statics"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	//go:embed tests/assets1
	testAssets1 embed.FS
	//go:embed tests/assets2
	testAssets2 embed.FS
)

func TestUnionHttpFs(t *testing.T) {

	Convey("Test EmbedFS", t, func() {

		fs := NewUnionHttpFs(service.PluginBox{
			Exposes: []string{"a", "b"},
			Box:     statics.AsFS(testAssets1, "tests/assets1"),
		}, service.PluginBox{
			Exposes: []string{"c"},
			Box:     statics.AsFS(testAssets2, "tests/assets2"),
		})
		So(fs, ShouldNotBeNil)

		file, e := fs.Open("plugin1/file1")
		So(e, ShouldBeNil)
		stat, e := file.Stat()
		So(e, ShouldBeNil)
		So(stat.IsDir(), ShouldBeFalse)

		folder, e := fs.Open("plugin2")
		So(e, ShouldBeNil)
		folderStat, e := folder.Stat()
		So(e, ShouldBeNil)
		So(folderStat.IsDir(), ShouldBeTrue)

		index, e := fs.Open("index.json")
		So(e, ShouldBeNil)
		info, e := index.Stat()
		So(e, ShouldBeNil)
		indexData := make([]byte, info.Size())
		size, e := index.Read(indexData)
		So(size, ShouldEqual, info.Size())
		index.Close()
		readAll, e := io.ReadAll(index)
		So(e, ShouldBeNil)
		So(string(readAll), ShouldEqual, `["a","b","c"]`)
		So(string(indexData), ShouldEqual, `["a","b","c"]`)

	})

}
