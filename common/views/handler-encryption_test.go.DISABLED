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

// +build ignore

package views

import (
	"context"
	"strings"
	"testing"

	"github.com/micro/go-micro/client"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/encryption"
	"github.com/pydio/cells/common/proto/tree"
)

type EncryptionClientMock struct{}

func (e *EncryptionClientMock) GetEncryptionKey(ctx context.Context, in *encryption.GetEncryptionKeyRequest, opts ...client.CallOption) (*encryption.GetEncryptionKeyResponse, error) {
	return &encryption.GetEncryptionKeyResponse{
		Key: []byte{},
	}, nil
}
func (e *EncryptionClientMock) ShareEncryptionKey(ctx context.Context, in *encryption.ShareEncryptionKeyRequest, opts ...client.CallOption) (*encryption.ShareEncryptionKeyResponse, error) {
	return &encryption.ShareEncryptionKeyResponse{}, nil
}

func (e *EncryptionClientMock) UnshareEncryptionKey(ctx context.Context, in *encryption.UnshareEncryptionKeyRequest, opts ...client.CallOption) (*encryption.UnshareEncryptionKeyResponse, error) {
	return &encryption.UnshareEncryptionKeyResponse{}, nil
}

func TestEncryptionHandler_GetObject(t *testing.T) {

	handler := &EncryptionHandler{
		UserTools: &EncryptionClientMock{},
	}
	mock := NewHandlerMock()
	mock.Nodes["test"] = &tree.Node{Path: "test"}
	handler.SetNextHandler(mock)

	ctx := context.Background()
	branchInfo := BranchInfo{}
	branchInfo.Encrypted = true
	ctx = WithBranchInfo(ctx, "in", branchInfo)

	Convey("Test Get Object w. Enc", t, func() {

		reqData := &GetRequestData{}
		reader, e := handler.GetObject(ctx, &tree.Node{Path: "test"}, reqData)
		So(reader, ShouldNotBeNil)
		So(e, ShouldBeNil)
		So(reqData.EncryptionMaterial, ShouldNotBeNil)

	})

	Convey("Test Put Object w. Enc", t, func() {

		reqData := &PutRequestData{}
		_, e := handler.PutObject(ctx, &tree.Node{Path: "test2"}, strings.NewReader(""), reqData)
		So(e, ShouldBeNil)
		So(mock.Nodes["in"], ShouldNotBeNil)
		So(mock.Nodes["in"].Path, ShouldEqual, "test2")
		So(reqData.EncryptionMaterial, ShouldNotBeNil)

	})

	emptyCtx := context.Background()

	Convey("Test Get Object wo. Enc", t, func() {

		reqData := &GetRequestData{}
		reader, e := handler.GetObject(emptyCtx, &tree.Node{Path: "test"}, reqData)
		So(reader, ShouldNotBeNil)
		So(e, ShouldBeNil)
		So(reqData.EncryptionMaterial, ShouldBeNil)

	})

	Convey("Test Put Object wp. Enc", t, func() {

		reqData := &PutRequestData{}
		_, e := handler.PutObject(emptyCtx, &tree.Node{Path: "test2"}, strings.NewReader(""), reqData)
		So(e, ShouldBeNil)
		So(mock.Nodes["in"], ShouldNotBeNil)
		So(mock.Nodes["in"].Path, ShouldEqual, "test2")
		So(reqData.EncryptionMaterial, ShouldBeNil)

	})

	Convey("Test Copy Object w. Enc", t, func() {

		ctx = WithBranchInfo(ctx, "from", branchInfo)
		ctx = WithBranchInfo(ctx, "to", branchInfo)
		reqData := &CopyRequestData{}
		_, e := handler.CopyObject(ctx, &tree.Node{Path: "test2"}, &tree.Node{Path: "test2"}, reqData)
		So(e, ShouldBeNil)
		So(mock.Nodes["from"], ShouldNotBeNil)
		So(mock.Nodes["to"], ShouldNotBeNil)
		So(reqData.srcEncryptionMaterial, ShouldNotBeNil)
		So(reqData.destEncryptionMaterial, ShouldNotBeNil)

	})

	Convey("Test Copy Object wo Enc", t, func() {

		reqData := &CopyRequestData{}
		_, e := handler.CopyObject(emptyCtx, &tree.Node{Path: "test2"}, &tree.Node{Path: "test2"}, reqData)
		So(e, ShouldBeNil)
		So(mock.Nodes["from"], ShouldNotBeNil)
		So(mock.Nodes["to"], ShouldNotBeNil)
		So(reqData.srcEncryptionMaterial, ShouldBeNil)
		So(reqData.destEncryptionMaterial, ShouldBeNil)

	})

}
