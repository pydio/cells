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

package filesystem

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"strings"
	"sync"
	"testing"

	"github.com/rjeczalik/notify"
	"github.com/spf13/afero"

	servicescommon "github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/serviceerrors"
	"github.com/pydio/cells/v4/common/sync/model"
	"github.com/pydio/cells/v4/common/utils/hasher"
	"github.com/pydio/cells/v4/common/utils/hasher/simd"

	. "github.com/smartystreets/goconvey/convey"
)

func EmptyMockedClient() *FSClient {

	return &FSClient{
		RootPath: "",
		FS:       afero.NewMemMapFs(),
	}
}

func FilledMockedClient() *FSClient {

	fs := afero.NewMemMapFs()
	fs.MkdirAll("/folder/subfolder1", 0777)
	fs.MkdirAll("/folder/subfolder2", 0777)
	afero.WriteFile(fs, "/file", []byte("my-content"), 0777)
	afero.WriteFile(fs, "/folder/subfile1", []byte("my-content"), 0777)
	afero.WriteFile(fs, "/folder/subfile2", []byte("my-content"), 0777)
	afero.WriteFile(fs, "/folder/subfolder1/file1.1.txt", []byte("my-content"), 0777)
	afero.WriteFile(fs, "/folder/subfolder1/file1.2.txt", []byte("my-content"), 0777)
	afero.WriteFile(fs, "/folder/subfolder2/file2.1.txt", []byte("my-content"), 0777)
	afero.WriteFile(fs, "/folder/subfolder2/file2.2.txt", []byte("my-content"), 0777)

	baseFs := afero.NewBasePathFs(fs, "/")

	return &FSClient{
		RootPath: "",
		FS:       baseFs,
	}

}

var (
	fsTestCtx = context.Background()
)

type MockEventInfo struct {
	event notify.Event // event value for the filesystem action
	path  string       // real path of the file or directory
	sys   interface{}  // underlying data source (can return nil)
}

func (e *MockEventInfo) Event() notify.Event {
	return e.event
}

func (e *MockEventInfo) Path() string {
	return e.path
}

func (e *MockEventInfo) Sys() interface{} {
	return e.sys
}

func TestLoadNode(t *testing.T) {

	Convey("Test LoadNode on non existing node", t, func() {

		c := EmptyMockedClient()
		s, e := c.LoadNode(fsTestCtx, "/test")
		So(s, ShouldBeNil)
		So(e, ShouldNotBeNil)
		So(serviceerrors.FromError(e).Code, ShouldEqual, 404)

	})

	Convey("Test LoadNode file", t, func() {

		c := FilledMockedClient()
		s, e := c.LoadNode(fsTestCtx, "/file")
		So(s, ShouldNotBeNil)
		So(e, ShouldBeNil)
		f := strings.NewReader("my-content")
		h := hasher.NewBlockHash(simd.MD5(), hasher.DefaultBlockSize)
		if _, err := io.Copy(h, f); err != nil {
			t.Fail()
		}
		testMd5 := fmt.Sprintf("%x", h.Sum(nil))

		So(s.GetEtag(), ShouldEqual, testMd5)
		So(s.GetUuid(), ShouldBeEmpty)

	})

}

func TestCreateFolderId(t *testing.T) {

	Convey("Test create a uuid for a folder", t, func() {

		c := EmptyMockedClient()
		err := c.CreateNode(fsTestCtx, &tree.Node{
			Path: "/folder",
			Type: tree.NodeType_COLLECTION,
		}, true)
		So(err, ShouldBeNil)
		var exist bool
		exist, _ = afero.Exists(c.FS, "/folder/"+servicescommon.PydioSyncHiddenFile)
		So(exist, ShouldBeFalse)
		s, _ := c.readOrCreateFolderId("/folder")
		So(s, ShouldNotBeNil)
		exist, _ = afero.Exists(c.FS, "/folder/"+servicescommon.PydioSyncHiddenFile)
		So(exist, ShouldBeTrue)
		byteContent, _ := afero.ReadFile(c.FS, "/folder/"+servicescommon.PydioSyncHiddenFile)
		So(string(byteContent), ShouldEqual, s)

	})

	Convey("Test read uuid for a folder", t, func() {

		c := EmptyMockedClient()
		c.FS.Mkdir("/folder", 0777)
		afero.WriteFile(c.FS, "/folder/"+servicescommon.PydioSyncHiddenFile, []byte("unique-id"), 0777)
		s, _ := c.readOrCreateFolderId("/folder")
		So(s, ShouldEqual, "unique-id")

	})

}

func TestCreateNode(t *testing.T) {

	Convey("Test Create folder and check it's on FS", t, func() {

		c := EmptyMockedClient()
		ce := c.CreateNode(fsTestCtx, &tree.Node{
			Path: "/test",
			Type: tree.NodeType_COLLECTION,
			Uuid: "uid",
		}, true)

		So(ce, ShouldBeNil)

		dir, e := c.FS.Stat("/test")
		So(e, ShouldBeNil)
		So(dir.IsDir(), ShouldBeTrue)

	})

	Convey("Test Create folder and LoadNode on existing node", t, func() {

		c := EmptyMockedClient()
		ce := c.CreateNode(fsTestCtx, &tree.Node{
			Path: "/test",
			Type: tree.NodeType_COLLECTION,
			Uuid: "uid",
		}, true)

		So(ce, ShouldBeNil)

		s, e := c.LoadNode(fsTestCtx, "/test")
		So(s.GetUuid(), ShouldEqual, "uid")

		So(s, ShouldNotBeNil)
		So(e, ShouldBeNil)

	})

}

func TestDeleteNode(t *testing.T) {

	Convey("Test delete existing file on FS", t, func() {
		c := FilledMockedClient()
		var exist bool
		exist, _ = afero.Exists(c.FS, "/file")
		So(exist, ShouldBeTrue)

		// Delete single file
		e := c.DeleteNode(fsTestCtx, "/file")
		So(e, ShouldBeNil)

		exist, _ = afero.Exists(c.FS, "/file")
		So(exist, ShouldBeFalse)
	})

	Convey("Test delete whole folder recursively on FS", t, func() {
		c := FilledMockedClient()
		var exist bool
		exist, _ = afero.Exists(c.FS, "/folder")
		So(exist, ShouldBeTrue)
		exist, _ = afero.Exists(c.FS, "/folder/subfolder1/file1.1.txt")
		So(exist, ShouldBeTrue)

		// Delete single file
		e := c.DeleteNode(fsTestCtx, "/folder")
		So(e, ShouldBeNil)

		exist, _ = afero.Exists(c.FS, "/folder")
		So(exist, ShouldBeFalse)
		exist, _ = afero.Exists(c.FS, "/folder/subfolder1/file1.1.txt")
		So(exist, ShouldBeFalse)
	})

}

func TestMoveNode(t *testing.T) {

	Convey("Test moving existing file on FS", t, func() {
		c := FilledMockedClient()
		var exist bool

		e := c.MoveNode(fsTestCtx, "/file", "/renamed")
		So(e, ShouldBeNil)

		// Check original has gone
		exist, _ = afero.Exists(c.FS, "/file")
		So(exist, ShouldBeFalse)

		// Check target is created
		exist, _ = afero.Exists(c.FS, "/renamed")
		So(exist, ShouldBeTrue)
	})

	Convey("Test moving whole folder on FS: Recursively not tested as not working with MemFS", t, func() {
		c := FilledMockedClient()
		var exist bool

		// Delete single file
		e := c.MoveNode(fsTestCtx, "/folder", "/renamed")
		So(e, ShouldBeNil)

		exist, _ = afero.Exists(c.FS, "/folder")
		So(exist, ShouldBeFalse)
		exist, _ = afero.Exists(c.FS, "/folder/subfolder1/file1.1.txt")
		So(exist, ShouldBeFalse)

		exist, _ = afero.Exists(c.FS, "/renamed")
		So(exist, ShouldBeTrue)
		exist, _ = afero.Exists(c.FS, "/renamed/subfolder1/file1.1.txt")
		So(exist, ShouldBeTrue)
	})

}

func TestWriteNode(t *testing.T) {

	Convey("Test write node content and check it's written on FS", t, func() {
		c := EmptyMockedClient()
		r := strings.NewReader("my-content")
		w, _, _, e := c.GetWriterOn(context.Background(), "/test", 0)
		So(w, ShouldNotBeNil)
		So(e, ShouldBeNil)
		io.Copy(w, r)
		w.Close()
		s, err := c.FS.Stat("/test")
		So(err, ShouldBeNil)
		So(s.IsDir(), ShouldBeFalse)
		byteContents, _ := afero.ReadFile(c.FS, "/test")
		content := string(byteContents)
		So(content, ShouldEqual, "my-content")
	})

}

func TestReadNode(t *testing.T) {

	Convey("Test read content from existing file on fs", t, func() {

		c := EmptyMockedClient()
		afero.WriteFile(c.FS, "/test", []byte("my-content"), 0777)
		r, e := c.GetReaderOn(context.Background(), "/test")
		So(r, ShouldNotBeNil)
		So(e, ShouldBeNil)

		w := bytes.NewBufferString("")
		io.Copy(w, r)
		So(w.String(), ShouldEqual, "my-content")

	})

}

func TestWatch(t *testing.T) {

	Convey("Init simple watch object", t, func() {
		c := EmptyMockedClient()
		watchObject, err := c.Watch("")
		if err != nil {
			log.Println("Received error, test will FAIL", err)
		}
		So(watchObject, ShouldNotBeNil)
		So(watchObject.EventInfoChan, ShouldNotBeNil)
		So(watchObject.ErrorChan, ShouldNotBeNil)
		So(watchObject.DoneChan, ShouldNotBeNil)
		So(err, ShouldBeNil)
	})

}

func TestWalkFS(t *testing.T) {

	Convey("Test walking the tree", t, func() {

		c := FilledMockedClient()
		objects := make(map[string]tree.N)
		walk := func(path string, node tree.N, err error) error {
			if err != nil {
				return err
			}
			if !model.IsIgnoredFile(path) {
				objects[path] = node
			}
			return nil
		}
		wg := sync.WaitGroup{}
		wg.Add(1)
		go func() {
			defer wg.Done()
			_ = c.Walk(nil, walk, "/", true)
		}()
		wg.Wait()

		// Will include the root and the PydioSyncHiddenFile files
		So(objects, ShouldHaveLength, 13)
		So(objects["folder"].GetUuid(), ShouldNotBeEmpty)
		So(objects["folder"].GetEtag(), ShouldBeEmpty)
		So(objects["folder"].GetType(), ShouldEqual, tree.NodeType_COLLECTION)

		So(objects["file"].GetUuid(), ShouldBeEmpty)
		So(objects["file"].GetEtag(), ShouldNotBeEmpty)
		So(objects["file"].GetType(), ShouldEqual, tree.NodeType_LEAF)
	})
}

func TestWalkWithRoot(t *testing.T) {

	Convey("Test walking the tree", t, func() {

		c := FilledMockedClient()
		objects := make(map[string]tree.N)
		walk := func(path string, node tree.N, err error) error {
			if err != nil {
				return err
			}
			if !model.IsIgnoredFile(path) {
				objects[path] = node
			}
			return nil
		}
		wg := sync.WaitGroup{}
		wg.Add(1)
		var we error
		go func() {
			defer wg.Done()
			we = c.Walk(nil, walk, "folder/subfolder1", true)
		}()
		wg.Wait()

		So(we, ShouldBeNil)
		// Will include the root and the PydioSyncHiddenFile files
		So(objects, ShouldHaveLength, 2)
	})
}
