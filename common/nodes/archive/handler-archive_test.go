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

package archive

import (
	"bytes"
	"context"
	"io"
	"sync"
	"testing"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"

	. "github.com/smartystreets/goconvey/convey"
)

type mockSelectionProvider struct {
	sel map[string][]*tree.Node
}

func newMockSelectionProvider() *mockSelectionProvider {
	m := &mockSelectionProvider{}
	m.sel = make(map[string][]*tree.Node)
	return m
}

func (m *mockSelectionProvider) getSelectionByUuid(ctx context.Context, selectionUuid string) (bool, []*tree.Node, error) {
	if selection, ok := m.sel[selectionUuid]; ok {
		return true, selection, nil
	}
	return false, nil, nil
}

func (m *mockSelectionProvider) deleteSelectionByUuid(ctx context.Context, selectionUuid string) {
	// Do NOT actually delete, or mockSelectionProvider cannot be reused for further testing
	//delete(m.sel, selectionUuid)
}

func TestHandler_WrappingStreamer(t *testing.T) {
	s := nodes.NewWrappingStreamer(context.TODO())

	wg := &sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer s.CloseSend()
		defer wg.Done()

		for {
			_, err := s.Recv()
			if err == io.EOF {
				break
			}
		}
	}()

	Convey("Test Read Normal Node", t, func() {
		err := s.Send(&tree.ListNodesResponse{Node: &tree.Node{Path: "path/folder/file", Type: tree.NodeType_LEAF, Size: 10}})
		So(err, ShouldBeNil)
	})

	s.CloseSend()
	wg.Wait()
}

func TestHandler_ReadNode(t *testing.T) {

	mock := nodes.NewHandlerMock()
	mock.Nodes["path/folder"] = &tree.Node{Path: "path/folder", Type: tree.NodeType_COLLECTION}
	mock.Nodes["path/folder/file1"] = &tree.Node{Path: "path/folder/file1", Type: tree.NodeType_LEAF}
	mock.Nodes["path/folder/file2"] = &tree.Node{Path: "path/folder/file2", Type: tree.NodeType_LEAF}

	selMock := newMockSelectionProvider()
	selMock.sel["selection-uuid"] = append(selMock.sel["selection-uuid"], &tree.Node{Path: "path/folder/file1", Type: tree.NodeType_LEAF})
	selMock.sel["selection-uuid"] = append(selMock.sel["selection-uuid"], &tree.Node{Path: "path/folder/file2", Type: tree.NodeType_LEAF})

	zipHandler := &Handler{
		selectionProvider: selMock,
	}
	zipHandler.SetNextHandler(mock)

	Convey("Test Read Normal Node", t, func() {
		resp, e := zipHandler.ReadNode(context.Background(), &tree.ReadNodeRequest{Node: &tree.Node{Path: "path/folder"}})
		So(e, ShouldBeNil)
		So(resp.Node, ShouldResemble, &tree.Node{Path: "path/folder", Type: tree.NodeType_COLLECTION})
	})

	Convey("Test Read Zip Node", t, func() {
		resp, e := zipHandler.ReadNode(context.Background(), &tree.ReadNodeRequest{Node: &tree.Node{Path: "path/folder.zip"}})
		So(e, ShouldBeNil)
		So(resp.Node.Size, ShouldEqual, -1)
	})

	Convey("Test read zipped selection", t, func() {
		resp, e := zipHandler.ReadNode(context.Background(), &tree.ReadNodeRequest{Node: &tree.Node{Path: "selection-uuid-selection.zip"}})
		So(e, ShouldBeNil)
		So(resp.Node.Size, ShouldEqual, -1)
	})

}

func TestHandler_GetObject(t *testing.T) {

	mock := nodes.NewHandlerMock()
	mock.Nodes["path/folder"] = &tree.Node{Path: "path/folder", Type: tree.NodeType_COLLECTION, Size: 30}
	mock.Nodes["path/folder/file1"] = &tree.Node{Path: "path/folder/file1", Type: tree.NodeType_LEAF, Size: 10}
	mock.Nodes["path/folder/file2"] = &tree.Node{Path: "path/folder/file2", Type: tree.NodeType_LEAF, Size: 10}
	mock.Nodes["path/folder/"+common.PydioSyncHiddenFile] = &tree.Node{Path: "path/folder/file2", Type: tree.NodeType_LEAF, Size: 10}
	mock.Nodes["path/folder/subfolder_ignored"] = &tree.Node{Path: "path/folder/file2", Type: tree.NodeType_COLLECTION}
	mock.Nodes["path/to/cell1"] = &tree.Node{Path: "path/to/cell1", Type: tree.NodeType_COLLECTION, Size: 30}
	mock.Nodes["path/to/cell1/folder1"] = &tree.Node{Path: "path/to/cell1/folder1", Type: tree.NodeType_COLLECTION, Size: 30}
	mock.Nodes["path/to/cell1/file"] = &tree.Node{Path: "path/to/cell1/file", Type: tree.NodeType_LEAF, Size: 30}
	mock.Nodes["user2/cells/cell2"] = &tree.Node{Path: "user2/cells/cell2", Type: tree.NodeType_COLLECTION, Size: 30}
	mock.Nodes["user2/cells/cell2/folder2"] = &tree.Node{Path: "user2/cells/cell2/folder2", Type: tree.NodeType_COLLECTION, Size: 30}
	mock.Nodes["user2/cells/cell2/file"] = &tree.Node{Path: "user2/cells/cell2/file", Type: tree.NodeType_LEAF, Size: 30}

	selMock := newMockSelectionProvider()
	selMock.sel["selection-uuid"] = append(selMock.sel["selection-uuid"], &tree.Node{Path: "path/folder/file1", Type: tree.NodeType_LEAF})
	selMock.sel["selection-uuid"] = append(selMock.sel["selection-uuid"], &tree.Node{Path: "path/folder/file2", Type: tree.NodeType_LEAF})

	selMock.sel["selection-cells"] = append(selMock.sel["selection-cells"], &tree.Node{Path: "path/to/cell1", Type: tree.NodeType_COLLECTION})
	selMock.sel["selection-cells"] = append(selMock.sel["selection-cells"], &tree.Node{Path: "user2/cells/cell2", Type: tree.NodeType_COLLECTION})

	zipHandler := &Handler{
		selectionProvider: selMock,
	}
	zipHandler.SetNextHandler(mock)

	Convey("Test Get Zip Node", t, func() {
		reader, e := zipHandler.GetObject(context.Background(), &tree.Node{
			Path: "path/folder.zip",
		}, &models.GetRequestData{
			Length: -1,
		})
		So(e, ShouldBeNil)
		So(reader, ShouldNotBeNil)
		data := []byte{}
		n, _ := io.Copy(bytes.NewBuffer(data), reader)
		reader.Close()
		So(n, ShouldBeGreaterThan, 200)
	})

	Convey("Test Get Zip Selection", t, func() {
		internals := map[string]string{}
		ctx := context.WithValue(context.Background(), stackInternalsKey, internals)
		reader, e := zipHandler.GetObject(ctx, &tree.Node{
			Path: "path/selection-uuid-selection.zip",
		}, &models.GetRequestData{
			Length: -1,
		})
		So(e, ShouldBeNil)
		So(reader, ShouldNotBeNil)
		data := []byte{}
		n, _ := io.Copy(bytes.NewBuffer(data), reader)
		reader.Close()
		So(n, ShouldBeGreaterThan, 20)
		So(internals, ShouldHaveLength, 2)
		So(internals, ShouldContainKey, "file1")
		So(internals, ShouldContainKey, "file2")
	})

	Convey("Test Get Zip Selection", t, func() {
		internals := map[string]string{}
		ctx := context.WithValue(context.Background(), stackInternalsKey, internals)
		reader, e := zipHandler.GetObject(ctx, &tree.Node{
			Path: "path/selection-cells-selection.zip",
		}, &models.GetRequestData{
			Length: -1,
		})
		So(e, ShouldBeNil)
		So(reader, ShouldNotBeNil)
		data := []byte{}
		n, _ := io.Copy(bytes.NewBuffer(data), reader)
		reader.Close()
		So(n, ShouldBeGreaterThan, 20)
		So(internals, ShouldHaveLength, 4)
		t.Log(internals)
		So(internals, ShouldContainKey, "cell1/file")
		So(internals, ShouldContainKey, "cell2/file")
	})

	Convey("Test Get Tar Node", t, func() {
		reader, e := zipHandler.GetObject(context.Background(), &tree.Node{
			Path: "path/folder.tar",
		}, &models.GetRequestData{
			Length: -1,
		})
		So(e, ShouldBeNil)
		So(reader, ShouldNotBeNil)
		data := []byte{}
		n, _ := io.Copy(bytes.NewBuffer(data), reader)
		reader.Close()
		So(n, ShouldBeGreaterThan, 0)
	})

	Convey("Test Get Tar Selection", t, func() {
		reader, e := zipHandler.GetObject(context.Background(), &tree.Node{
			Path: "path/selection-uuid-selection.tar",
		}, &models.GetRequestData{
			Length: -1,
		})
		So(e, ShouldBeNil)
		So(reader, ShouldNotBeNil)
		data := []byte{}
		n, _ := io.Copy(bytes.NewBuffer(data), reader)
		reader.Close()
		So(n, ShouldBeGreaterThan, 20)
	})

	Convey("Test Get Tar.gz Node", t, func() {
		reader, e := zipHandler.GetObject(context.Background(), &tree.Node{
			Path: "path/folder.tar.gz",
		}, &models.GetRequestData{
			Length: -1,
		})
		So(e, ShouldBeNil)
		So(reader, ShouldNotBeNil)
		data := []byte{}
		n, _ := io.Copy(bytes.NewBuffer(data), reader)
		reader.Close()
		So(n, ShouldBeGreaterThan, 0)
	})

	Convey("Test Get Tar.gz Selection", t, func() {
		reader, e := zipHandler.GetObject(context.Background(), &tree.Node{
			Path: "path/selection-uuid-selection.tar.gz",
		}, &models.GetRequestData{
			Length: -1,
		})
		So(e, ShouldBeNil)
		So(reader, ShouldNotBeNil)
		data := []byte{}
		n, _ := io.Copy(bytes.NewBuffer(data), reader)
		reader.Close()
		So(n, ShouldBeGreaterThan, 20)
	})

	Convey("Test Get Wrong Selection Uuid", t, func() {
		_, e := zipHandler.GetObject(context.Background(), &tree.Node{
			Path: "path/selection-uuid2-selection.zip",
		}, &models.GetRequestData{
			Length: -1,
		})
		So(e, ShouldNotBeNil)
	})

}

func TestHandler_isArchivePath(t *testing.T) {

	Convey("Test isArchivePath", t, func() {

		a := &Handler{}
		ok, format, archivePath, innerPath := a.isArchivePath("path/to/archive.zip/inner")
		So(ok, ShouldBeTrue)
		So(format, ShouldEqual, "zip")
		So(archivePath, ShouldEqual, "path/to/archive.zip")
		So(innerPath, ShouldEqual, "inner")

	})

}
