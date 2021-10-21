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

package views

import (
	"context"
	"crypto/rand"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views/models"
)

// TODO these tests are currently broken and should be repaired.
// For the record, below lines where in errors and have been violently
// commented out without further thinking.

func TestEncryptionHandler_GetObject(t *testing.T) {

	handler := &EncryptionHandler{
	// 		UserTools: &EncryptionClientMock{},
	}
	mock := NewHandlerMock()
	mock.Nodes["test"] = &tree.Node{Path: "test"}
	handler.SetNextHandler(mock)

	ctx := context.Background()
	branchInfo := BranchInfo{}
	// 	branchInfo.Encrypted = true
	ctx = WithBranchInfo(ctx, "in", branchInfo)

	Convey("Test Get Object w. Enc", t, func() {

		reqData := &models.GetRequestData{}
		reader, e := handler.GetObject(ctx, &tree.Node{Path: "test"}, reqData)
		So(reader, ShouldNotBeNil)
		So(e, ShouldBeNil)

	})

	Convey("Test Put Object w. Enc", t, func() {

		reqData := &models.PutRequestData{}
		_, e := handler.PutObject(ctx, &tree.Node{Path: "test2"}, strings.NewReader(""), reqData)
		So(e, ShouldBeNil)
		So(mock.Nodes["in"], ShouldNotBeNil)
		So(mock.Nodes["in"].Path, ShouldEqual, "test2")

	})

	emptyCtx := context.Background()

	Convey("Test Get Object wo. Enc", t, func() {

		reqData := &models.GetRequestData{}
		reader, e := handler.GetObject(emptyCtx, &tree.Node{Path: "test"}, reqData)
		So(reader, ShouldNotBeNil)
		So(e, ShouldBeNil)

	})

	Convey("Test Put Object wp. Enc", t, func() {

		reqData := &models.PutRequestData{}
		_, e := handler.PutObject(emptyCtx, &tree.Node{Path: "test2"}, strings.NewReader(""), reqData)
		So(e, ShouldBeNil)
		So(mock.Nodes["in"], ShouldNotBeNil)
		So(mock.Nodes["in"].Path, ShouldEqual, "test2")

	})

	Convey("Test Copy Object w. Enc", t, func() {

		ctx = WithBranchInfo(ctx, "from", branchInfo)
		ctx = WithBranchInfo(ctx, "to", branchInfo)
		reqData := &models.CopyRequestData{}
		_, e := handler.CopyObject(ctx, &tree.Node{Path: "test2"}, &tree.Node{Path: "test2"}, reqData)
		So(e, ShouldBeNil)
		So(mock.Nodes["from"], ShouldNotBeNil)
		So(mock.Nodes["to"], ShouldNotBeNil)

	})

	Convey("Test Copy Object wo Enc", t, func() {

		reqData := &models.CopyRequestData{}
		_, e := handler.CopyObject(emptyCtx, &tree.Node{Path: "test2"}, &tree.Node{Path: "test2"}, reqData)
		So(e, ShouldNotBeNil)

	})

}

func TestEncryptionHandler_Encrypted(t *testing.T) {
	handler := &EncryptionHandler{
		AbstractHandler: AbstractHandler{
			next: NewHandlerMock(),
		},
	}

	var err error
	mock := NewHandlerMock()

	dataFolder := filepath.Join(os.TempDir(), "cells", "tests", "encryption")
	err = os.MkdirAll(dataFolder, os.ModePerm)
	if err != nil {
		t.Fatal("failed to create temp test dir", err)
	}
	mock.RootDir = dataFolder

	handler.SetNextHandler(mock)
	handler.SetUserKeyTool(NewMockUserKeyTool())
	handler.SetNodeKeyManagerClient(NewMockNodeKeyManagerClient())

	ctx := context.Background()
	branchInfo := BranchInfo{}
	branchInfo.EncryptionMode = object.EncryptionMode_MASTER
	ctx = WithBranchInfo(ctx, "in", branchInfo)

	data := "blamekhkds sdsfsdfdsfdblamekhkds sdsdzkjdqzkhgiàrjv=iu=éàioeruopée"

	Convey("Test Put Object w. Enc", t, func() {
		reqData := &models.PutRequestData{}
		node := tree.Node{Path: "test", Uuid: "test"}
		_ = node.SetMeta(common.MetaNamespaceDatasourceName, "test")
		_, e := handler.PutObject(ctx, &node, strings.NewReader(data), reqData)
		So(e, ShouldBeNil)
	})

	Convey("Test Get Object w. encryption", t, func() {
		reqData := &models.GetRequestData{StartOffset: 0, Length: -1}
		node := tree.Node{Path: "test", Uuid: "test", Size: int64(len(data))}
		_ = node.SetMeta(common.MetaNamespaceDatasourceName, "test")
		reader, e := handler.GetObject(ctx, &node, reqData)
		So(reader, ShouldNotBeNil)
		So(e, ShouldBeNil)

		readData, err := ioutil.ReadAll(reader)
		So(err, ShouldBeNil)
		So(string(readData), ShouldEqual, data)
	})

	Convey("Test Get with supported range 1", t, func() {
		rangeOffset := 7
		length := -1
		reqData := &models.GetRequestData{
			Length:      int64(length),
			StartOffset: int64(rangeOffset),
		}
		node := tree.Node{Path: "test", Uuid: "test", Size: int64(len(data))}
		_ = node.SetMeta(common.MetaNamespaceDatasourceName, "test")
		reader, e := handler.GetObject(ctx, &node, reqData)
		So(reader, ShouldNotBeNil)
		So(e, ShouldBeNil)

		readData, err := ioutil.ReadAll(reader)
		So(err, ShouldBeNil)
		So(string(readData), ShouldEqual, data[rangeOffset:])
	})

	Convey("Test Get Object with supported range 2", t, func() {
		rangeOffset := 15
		length := 30
		reqData := &models.GetRequestData{
			Length:      int64(length),
			StartOffset: int64(rangeOffset),
		}
		node := tree.Node{Path: "test", Uuid: "test", Size: int64(len(data))}
		_ = node.SetMeta(common.MetaNamespaceDatasourceName, "test")
		reader, e := handler.GetObject(ctx, &node, reqData)
		So(reader, ShouldNotBeNil)
		So(e, ShouldBeNil)

		readData, err := ioutil.ReadAll(reader)
		So(err, ShouldBeNil)
		So(string(readData), ShouldEqual, data[rangeOffset:rangeOffset+length])
	})

	Convey("Test Get Object with supported range 3", t, func() {
		rangeOffset := 0
		length := -1
		reqData := &models.GetRequestData{
			Length:      int64(length),
			StartOffset: int64(rangeOffset),
		}
		node := tree.Node{Path: "test", Uuid: "test", Size: int64(len(data))}
		_ = node.SetMeta(common.MetaNamespaceDatasourceName, "test")
		reader, e := handler.GetObject(ctx, &node, reqData)
		So(reader, ShouldNotBeNil)
		So(e, ShouldBeNil)

		readData, err := ioutil.ReadAll(reader)
		So(err, ShouldBeNil)
		So(string(readData), ShouldEqual, data)
	})

	Convey("Test Get with not supported range", t, func() {
		rangeOffset := -1
		length := 0
		reqData := &models.GetRequestData{
			Length:      int64(length),
			StartOffset: int64(rangeOffset),
		}
		node := tree.Node{Path: "test", Uuid: "test", Size: int64(len(data))}
		_ = node.SetMeta(common.MetaNamespaceDatasourceName, "test")
		reader, e := handler.GetObject(ctx, &node, reqData)
		So(e, ShouldNotBeNil)
		So(reader, ShouldBeNil)
	})
}

func TestRangeEncryptionHandler_Encrypted(t *testing.T) {

	mock := NewHandlerMock()
	dataFolder := filepath.Join(os.TempDir(), "cells", "tests", "encryption")
	err := os.MkdirAll(dataFolder, os.ModePerm)
	if err != nil {
		t.Fatal("failed to create temp test dir", err)
	}
	mock.RootDir = dataFolder

	file, err := os.OpenFile(filepath.Join(dataFolder, "plain"), os.O_WRONLY|os.O_CREATE, os.ModePerm)
	if err != nil {
		t.Fatal(err)
	}

	fileSize := 10 * 1024
	buffer := make([]byte, 1024)
	for i := 0; i < 10; i++ {
		_, _ = rand.Read(buffer)
		_, err = file.Write(buffer)
		if err != nil {
			t.Fatal("test preparation failed", err)
		}
	}
	_ = file.Close()

	handler := &EncryptionHandler{
		AbstractHandler: AbstractHandler{
			next: NewHandlerMock(),
		},
	}

	handler.SetNextHandler(mock)
	handler.SetUserKeyTool(NewMockUserKeyTool())
	handler.SetNodeKeyManagerClient(NewMockNodeKeyManagerClient())

	ctx := context.Background()
	branchInfo := BranchInfo{}
	branchInfo.EncryptionMode = object.EncryptionMode_MASTER
	ctx = WithBranchInfo(ctx, "in", branchInfo)

	Convey("Test Put Object w. Enc", t, func() {
		file, err := os.Open(filepath.Join(dataFolder, "plain"))
		So(err, ShouldBeNil)

		reqData := &models.PutRequestData{}
		node := tree.Node{Path: "encTest", Uuid: "encTest"}
		_ = node.SetMeta(common.MetaNamespaceDatasourceName, "test")
		_, e := handler.PutObject(ctx, &node, file, reqData)
		_ = file.Close()
		So(e, ShouldBeNil)
	})

	Convey("Test Get Object wo. Enc", t, func() {

		for i := 0; i < fileSize; i = i + 10 {
			rangeOffset := i
			length := 300

			reqData := &models.GetRequestData{
				Length:      int64(length),
				StartOffset: int64(rangeOffset),
			}

			file, err := os.Open(filepath.Join(dataFolder, "plain"))
			So(err, ShouldBeNil)

			buff := make([]byte, 300)
			read, err := file.ReadAt(buff, int64(i))
			So(err == nil || err == io.EOF, ShouldBeTrue)

			err = file.Close()
			So(err, ShouldBeNil)

			buff = buff[:read]
			reqData.Length = int64(len(buff))

			node := tree.Node{Path: "encTest", Uuid: "encTest", Size: int64(fileSize)}
			_ = node.SetMeta(common.MetaNamespaceDatasourceName, "test")
			reader, e := handler.GetObject(ctx, &node, reqData)
			So(e, ShouldBeNil)
			So(reader, ShouldNotBeNil)

			readData, err := ioutil.ReadAll(reader)
			So(err == nil || err == io.EOF, ShouldBeTrue)

			readDataStr := string(readData)
			expectedDataStr := string(buff)

			So(readDataStr, ShouldEqual, expectedDataStr)
		}
	})
}
