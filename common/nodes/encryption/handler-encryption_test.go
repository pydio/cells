//go:build storage || sql

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

package encryption

import (
	"context"
	"crypto/rand"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/encryption"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/storage/test"
	srv_dao "github.com/pydio/cells/v5/data/key/dao/sql"
	srv "github.com/pydio/cells/v5/data/key/grpc"

	. "github.com/smartystreets/goconvey/convey"
)

var testcases = test.TemplateSQL(srv_dao.NewKeyDAO)

func TestHandler_GetObject(t *testing.T) {

	handler := &Handler{
		// 		UserTools: &EncryptionClientMock{},
	}
	mock := nodes.NewHandlerMock()
	mock.Nodes["test"] = &tree.Node{Path: "test"}
	handler.SetNextHandler(mock)

	ctx := context.Background()
	branchInfo := nodes.BranchInfo{}
	branchInfo.DataSource = &object.DataSource{}
	// 	branchInfo.Encrypted = true
	ctx = nodes.WithBranchInfo(ctx, "in", branchInfo)

	Convey("Test Get Object without enc", t, func() {

		reqData := &models.GetRequestData{}
		reader, e := handler.GetObject(ctx, &tree.Node{Path: "test"}, reqData)
		So(reader, ShouldNotBeNil)
		So(e, ShouldBeNil)

	})

	Convey("Test Put Object without enc", t, func() {

		reqData := &models.PutRequestData{}
		_, e := handler.PutObject(ctx, &tree.Node{Path: "test2"}, strings.NewReader(""), reqData)
		So(e, ShouldBeNil)
		So(mock.Nodes["in"], ShouldNotBeNil)
		So(mock.Nodes["in"].Path, ShouldEqual, "test2")

	})

	Convey("Test Copy Object without Enc", t, func() {

		ctx = nodes.WithBranchInfo(ctx, "from", branchInfo)
		ctx = nodes.WithBranchInfo(ctx, "to", branchInfo)
		reqData := &models.CopyRequestData{}
		_, e := handler.CopyObject(ctx, &tree.Node{Path: "test2"}, &tree.Node{Path: "test2"}, reqData)
		So(e, ShouldBeNil)
		So(mock.Nodes["from"], ShouldNotBeNil)
		So(mock.Nodes["to"], ShouldNotBeNil)

	})

}

func TestHandler_GetPut_Encrypted(t *testing.T) {
	sql.TestPrintQueries = false

	handler := &Handler{
		Handler: abstract.Handler{
			Next: nodes.NewHandlerMock(),
		},
	}

	var err error
	mock := nodes.NewHandlerMock()
	mock.Nodes["blank"] = &tree.Node{Path: "blank", Uuid: "blank", Size: 12}

	dataFolder := filepath.Join(os.TempDir(), "cells", "tests", "encryption")
	err = os.MkdirAll(dataFolder, os.ModePerm)
	if err != nil {
		t.Fatal("failed to create temp test dir", err)
	}
	mock.RootDir = dataFolder

	handler.SetNextHandler(mock)
	handler.SetUserKeyTool(NewMockUserKeyTool())
	grpc.RegisterMock(common.ServiceEncKeyGRPC, &encryption.NodeKeyManagerStub{
		NodeKeyManagerServer: srv.NewNodeKeyManagerHandler(),
	})

	branchInfo := nodes.BranchInfo{}
	branchInfo.DataSource = &object.DataSource{
		Name:           "test",
		EncryptionMode: object.EncryptionMode_MASTER,
	}
	data := "blamekhkds sdsfsdfdsfdblamekhkds sdsdzkjdqzkhgiàrjv=iu=éàioeruopée"

	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		ctx = nodes.WithBranchInfo(ctx, "in", branchInfo)

		// Trigger first a GetNodeInfo() call, to make sure DB is properly initialized
		// before calling streams that are launched in GO func
		Convey("Force DB resolution and migration", t, func() {
			_, e := handler.GetObject(ctx, &tree.Node{Path: "blank"}, &models.GetRequestData{})
			So(e, ShouldNotBeNil)
			So(errors.Is(e, errors.KeyNotFound), ShouldBeTrue)

		})

		Convey("Test Put Object w. Enc", t, func() {

			reqData := &models.PutRequestData{}
			node := tree.Node{Path: "test", Uuid: "test"}
			node.MustSetMeta(common.MetaNamespaceDatasourceName, "test")
			_, e := handler.PutObject(ctx, &node, strings.NewReader(data), reqData)
			So(e, ShouldBeNil)
		})

		Convey("Test Get Object w. encryption", t, func() {
			reqData := &models.GetRequestData{StartOffset: 0, Length: -1}
			node := tree.Node{Path: "test", Uuid: "test", Size: int64(len(data))}
			node.MustSetMeta(common.MetaNamespaceDatasourceName, "test")
			reader, e := handler.GetObject(ctx, &node, reqData)
			So(reader, ShouldNotBeNil)
			So(e, ShouldBeNil)

			readData, err := io.ReadAll(reader)
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
			node.MustSetMeta(common.MetaNamespaceDatasourceName, "test")
			reader, e := handler.GetObject(ctx, &node, reqData)
			So(e, ShouldBeNil)
			So(reader, ShouldNotBeNil)

			readData, err := io.ReadAll(reader)
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
			node.MustSetMeta(common.MetaNamespaceDatasourceName, "test")
			reader, e := handler.GetObject(ctx, &node, reqData)
			So(reader, ShouldNotBeNil)
			So(e, ShouldBeNil)

			readData, err := io.ReadAll(reader)
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
			node.MustSetMeta(common.MetaNamespaceDatasourceName, "test")
			reader, e := handler.GetObject(ctx, &node, reqData)
			So(reader, ShouldNotBeNil)
			So(e, ShouldBeNil)

			readData, err := io.ReadAll(reader)
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
			node.MustSetMeta(common.MetaNamespaceDatasourceName, "test")
			reader, e := handler.GetObject(ctx, &node, reqData)
			So(e, ShouldNotBeNil)
			So(reader, ShouldBeNil)
		})
	})

}

func TestRangeHandler_Encrypted(t *testing.T) {

	mock := nodes.NewHandlerMock()
	mock.Nodes["blank"] = &tree.Node{Path: "blank", Uuid: "blank", Size: 12}

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

	handler := &Handler{
		Handler: abstract.Handler{
			Next: nodes.NewHandlerMock(),
		},
	}

	handler.SetNextHandler(mock)
	handler.SetUserKeyTool(NewMockUserKeyTool())
	grpc.RegisterMock(common.ServiceEncKeyGRPC, &encryption.NodeKeyManagerStub{
		NodeKeyManagerServer: srv.NewNodeKeyManagerHandler(),
	})

	branchInfo := nodes.BranchInfo{}
	branchInfo.DataSource = &object.DataSource{
		Name:           "test",
		EncryptionMode: object.EncryptionMode_MASTER,
	}

	test.RunStorageTests(testcases, t, func(ctx context.Context) {

		ctx = nodes.WithBranchInfo(ctx, "in", branchInfo)

		// Trigger first a GetNodeInfo() call, to make sure DB is properly initialized
		// before calling streams that are launched in GO func
		Convey("Force DB resolution and migration", t, func() {
			_, e := handler.GetObject(ctx, &tree.Node{Path: "blank"}, &models.GetRequestData{})
			So(e, ShouldNotBeNil)
			So(errors.Is(e, errors.KeyNotFound), ShouldBeTrue)

		})

		Convey("Test Put Object w. Enc", t, func() {
			file, err := os.Open(filepath.Join(dataFolder, "plain"))
			So(err, ShouldBeNil)

			reqData := &models.PutRequestData{}
			node := tree.Node{Path: "encTest", Uuid: "encTest"}
			node.MustSetMeta(common.MetaNamespaceDatasourceName, "test")
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
				node.MustSetMeta(common.MetaNamespaceDatasourceName, "test")
				reader, e := handler.GetObject(ctx, &node, reqData)
				So(e, ShouldBeNil)
				So(reader, ShouldNotBeNil)

				readData, err := io.ReadAll(reader)
				So(err == nil || err == io.EOF, ShouldBeTrue)

				readDataStr := string(readData)
				expectedDataStr := string(buff)

				So(readDataStr, ShouldEqual, expectedDataStr)
			}
		})
	})
}
