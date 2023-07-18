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

package dav

import (
	"os"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

// TestBasics performs basic validation of methods that do not need complex set up nor mocks
func TestBasics(t *testing.T) {

	Convey("Basic FS Tests", t, func() {
		// tests clear
		inPath := "/path/"
		outPath, e := clearName(inPath)
		So(e, ShouldBeNil)
		ShouldEqual(outPath, "/path")

		inPath = "path/"
		outPath, e = clearName(inPath)
		ShouldEqual(e, os.ErrInvalid)
		ShouldEqual(outPath, "")
	})

}

// func TestRename(t *testing.T) {

// 	Convey("Test rename via webdav", t, func() {

// 		originalNode := &tree.N{
// 			Path:      "/path/to/original.txt",
// 			Type:      tree.NodeType_LEAF,
// 			MetaStore: map[string]string{"name": `"original.txt"`},
// 		}

// 		mock := &views.HandlerMock{
// 			Nodes: map[string]*tree.N{"/path/to/original": originalNode},
// 		}

// 		handlers := []views.Handler{mock}
// 		router := views.NewRouter(nil, handlers)

// 		fs := &FileSystem{
// 			Router: router,
// 			Debug:  true,
// 			mu:     sync.Mutex{},
// 		}

// 		_ = fs

// 	})
// }
