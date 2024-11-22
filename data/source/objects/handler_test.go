//go:build source

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

package objects

import (
	"context"
	"crypto/rand"
	"os"
	"testing"

	"github.com/spf13/afero"

	"github.com/pydio/cells/v5/common/proto/tree"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	fs      = afero.NewMemMapFs()
	buffer  = make([]byte, 1024)
	handler FsBrowser
	ctx     = context.Background()
)

func createFile(name string) (afero.File, error) {
	f, err := fs.Create(name)
	if err == nil {
		_, _ = rand.Read(buffer)
		_, err = f.Write(buffer)
	}
	return f, err
}

func initTree() {
	_ = fs.Mkdir("folder", os.ModePerm)
	_ = fs.Mkdir("folder/subfolder", os.ModePerm)
	_ = fs.Mkdir("folder/subfolder/subsubfolder", os.ModePerm)
	_, _ = createFile("folder/file1")
	_, _ = createFile("folder/file2")
	_, _ = createFile("folder/file3")
	_, _ = createFile("folder/subfolder/file1")
	_, _ = createFile("folder/subfolder/file2")
	_, _ = createFile("folder/subfolder/file3")

	_ = fs.Mkdir("folder1", os.ModePerm)
	_ = fs.Mkdir("folder1/subfolder", os.ModePerm)
	_ = fs.Mkdir("folder1/subfolder/subsubfolder", os.ModePerm)
	_ = fs.Mkdir("folder1/subfolder1", os.ModePerm)
	_ = fs.Mkdir("folder1/subfolder1/subsubfolder", os.ModePerm)
	_, _ = createFile("folder1/subfolder/file")
	_, _ = createFile("folder1/subfolder/file1")
	_, _ = createFile("folder1/subfolder1/file")
	_, _ = createFile("folder1/subfolder/file")
	_, _ = createFile("folder1/file1")
	_, _ = createFile("folder1/file1")
	_, _ = createFile("folder1/file2")
	_, _ = createFile("folder1/file3")
	_, _ = createFile("folder1/file2")
	_, _ = createFile("folder1/file3")
}

func TestHandler(t *testing.T) {

	handler = FsBrowser{FS: fs}
	initTree()

	Convey("Create Node", t, func() {
		_, err := handler.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{
			Type: tree.NodeType_COLLECTION,
			Path: "folder1/subfolder",
			Uuid: "hfuuid1",
		}})
		So(err, ShouldBeNil)
	})

	Convey("Read Node", t, func() {
		resp, err := handler.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: &tree.Node{
				Path: "folder/subfolder/file1",
			},
		})
		So(err, ShouldBeNil)
		So(resp.Node.Size, ShouldEqual, 1024)
	})

	Convey("Update Node", t, func() {
		_, err := handler.UpdateNode(ctx, &tree.UpdateNodeRequest{
			From: &tree.Node{
				Path: "folder/subfolder/file1",
			},
			To: &tree.Node{
				Path: "folder/file4",
			},
		})
		So(err, ShouldNotBeNil)
	})

	Convey("Delete Node", t, func() {
		_, err := handler.DeleteNode(ctx, &tree.DeleteNodeRequest{
			Node: &tree.Node{
				Path: "folder",
			},
		})
		So(err, ShouldBeNil)

		_, err = handler.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: &tree.Node{
				Path: "folder",
			},
		})
		So(err, ShouldNotBeNil)
	})

	Convey("List Nodes", t, func() {})
}

func TestHandlerWithPrefix(t *testing.T) {
	initTree()
	rootedFs := afero.NewBasePathFs(fs, "folder1")
	handler = FsBrowser{FS: rootedFs}

	Convey("Create Node", t, func() {
		_, err := handler.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{
			Type: tree.NodeType_COLLECTION,
			Path: "subfolder/subsubfolder1",
			Uuid: "shfuuid1",
		}})
		So(err, ShouldBeNil)
	})

	Convey("Read Node", t, func() {
		resp, err := handler.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: &tree.Node{
				Path: "subfolder/file",
			},
		})
		So(err, ShouldBeNil)
		So(resp.Node.Size, ShouldEqual, 1024)
	})

	Convey("Update Node", t, func() {
		_, err := handler.UpdateNode(ctx, &tree.UpdateNodeRequest{
			From: &tree.Node{
				Path: "subfolder/file",
			},
			To: &tree.Node{
				Path: "subfolder/file2",
			},
		})
		So(err, ShouldNotBeNil)
	})

	Convey("Delete Node", t, func() {
		resp, err := handler.DeleteNode(ctx, &tree.DeleteNodeRequest{
			Node: &tree.Node{
				Path: "subfolder",
			},
		})
		So(err, ShouldBeNil)
		So(resp.Success, ShouldBeTrue)

		_, err = handler.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: &tree.Node{
				Path: "subfolder",
			},
		})
		So(err, ShouldNotBeNil)
	})

	Convey("List Nodes", t, func() {})
}
