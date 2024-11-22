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

package abstract

import (
	"context"
	"strings"
	"testing"

	"github.com/pkg/errors"

	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/openurl"

	. "github.com/smartystreets/goconvey/convey"
)

type FakeWrapperHandler struct {
	Handler
}

var (
	wrapperKey   = "WRAPPER_KEY"
	wrapperValue = "WRAPPER_VALUE"
	wrapperError = "WRAPPER_ERROR"
)

func emptyFakeWrapper() (nodes.Handler, *nodes.HandlerMock) {

	fakeWrapperHandler := &FakeWrapperHandler{}
	fakeWrapperHandler.CtxWrapper = func(ctx context.Context) (context.Context, error) {
		ctx = context.WithValue(ctx, wrapperKey, wrapperValue)
		return ctx, nil
	}
	mock := nodes.NewHandlerMock()
	fakeWrapperHandler.SetNextHandler(mock)

	return fakeWrapperHandler, mock
}

func errorFakeWrapper() (nodes.Handler, *nodes.HandlerMock) {

	fakeWrapperHandler := &FakeWrapperHandler{}
	fakeWrapperHandler.CtxWrapper = func(ctx context.Context) (context.Context, error) {
		return ctx, errors.New(wrapperError)
	}
	mock := nodes.NewHandlerMock()
	fakeWrapperHandler.SetNextHandler(mock)

	return fakeWrapperHandler, mock
}

type methodTester func(nodes.Handler) error

func testMethod(tester methodTester) (nodes.Handler, *nodes.HandlerMock, error) {

	fakeWrapperHandler, mock := emptyFakeWrapper()
	errorWrapperHandler, _ := errorFakeWrapper()
	tester(fakeWrapperHandler)
	e := tester(errorWrapperHandler)
	return fakeWrapperHandler, mock, e

}

func TestWrapper(t *testing.T) {

	Convey("Test clients pool", t, func() {

		nodes.SetSourcesPoolOpener(func(ctx context.Context) *openurl.Pool[nodes.SourcesPool] {
			return nodes.NewTestPool(ctx)
		})

	})

	Convey("Test no wrapper set pool", t, func() {

		fakeWrapperHandler := &FakeWrapperHandler{}
		fakeWrapperHandler.SetNextHandler(nodes.NewHandlerMock())
		_, e := fakeWrapperHandler.ReadNode(context.Background(), &tree.ReadNodeRequest{Node: &tree.Node{Path: "/test"}})
		So(e, ShouldNotBeNil)

	})

	Convey("Test wrapper on ReadNode", t, func() {

		_, mock, errTest := testMethod(func(h nodes.Handler) error {
			_, e := h.ReadNode(context.Background(), &tree.ReadNodeRequest{Node: &tree.Node{Path: "/test"}})
			return e
		})

		So(mock.Context.Value(wrapperKey), ShouldNotBeNil)
		So(mock.Context.Value(wrapperKey).(string), ShouldEqual, wrapperValue)

		So(mock.Nodes["in"].Path, ShouldEqual, "/test")

		So(errTest, ShouldNotBeNil)
		So(errTest.Error(), ShouldEqual, wrapperError)

	})

	Convey("Test wrapper on ListNodes", t, func() {

		_, mock, errTest := testMethod(func(h nodes.Handler) error {
			_, e := h.ListNodes(context.Background(), &tree.ListNodesRequest{Node: &tree.Node{Path: "/test"}})
			return e
		})

		So(mock.Context.Value(wrapperKey), ShouldNotBeNil)
		So(mock.Context.Value(wrapperKey).(string), ShouldEqual, wrapperValue)

		So(mock.Nodes["in"].Path, ShouldEqual, "/test")

		So(errTest, ShouldNotBeNil)
		So(errTest.Error(), ShouldEqual, wrapperError)

	})

	Convey("Test wrapper on CreateNode", t, func() {

		_, mock, errTest := testMethod(func(h nodes.Handler) error {
			_, e := h.CreateNode(context.Background(), &tree.CreateNodeRequest{Node: &tree.Node{Path: "/test"}})
			return e
		})

		So(mock.Context.Value(wrapperKey), ShouldNotBeNil)
		So(mock.Context.Value(wrapperKey).(string), ShouldEqual, wrapperValue)

		So(mock.Nodes["in"].Path, ShouldEqual, "/test")

		So(errTest, ShouldNotBeNil)
		So(errTest.Error(), ShouldEqual, wrapperError)

	})

	Convey("Test wrapper on DeleteNode", t, func() {

		_, mock, errTest := testMethod(func(h nodes.Handler) error {
			_, e := h.DeleteNode(context.Background(), &tree.DeleteNodeRequest{Node: &tree.Node{Path: "/test"}})
			return e
		})

		So(mock.Context.Value(wrapperKey), ShouldNotBeNil)
		So(mock.Context.Value(wrapperKey).(string), ShouldEqual, wrapperValue)

		So(mock.Nodes["in"].Path, ShouldEqual, "/test")

		So(errTest, ShouldNotBeNil)
		So(errTest.Error(), ShouldEqual, wrapperError)

	})

	Convey("Test wrapper on UpdateNode", t, func() {

		_, mock, errTest := testMethod(func(h nodes.Handler) error {
			_, e := h.UpdateNode(context.Background(), &tree.UpdateNodeRequest{
				From: &tree.Node{Path: "/test"},
				To:   &tree.Node{Path: "/test2"},
			})
			return e
		})

		So(mock.Context.Value(wrapperKey), ShouldNotBeNil)
		So(mock.Context.Value(wrapperKey).(string), ShouldEqual, wrapperValue)

		So(mock.Nodes["from"].Path, ShouldEqual, "/test")
		So(mock.Nodes["to"].Path, ShouldEqual, "/test2")

		So(errTest, ShouldNotBeNil)
		So(errTest.Error(), ShouldEqual, wrapperError)

	})

	Convey("Test wrapper on GetObject", t, func() {

		_, mock, errTest := testMethod(func(h nodes.Handler) error {
			_, e := h.GetObject(context.Background(), &tree.Node{Path: "/test"}, &models.GetRequestData{})
			return e
		})

		So(mock.Context.Value(wrapperKey), ShouldNotBeNil)
		So(mock.Context.Value(wrapperKey).(string), ShouldEqual, wrapperValue)

		So(mock.Nodes["in"].Path, ShouldEqual, "/test")

		So(errTest, ShouldNotBeNil)
		So(errTest.Error(), ShouldEqual, wrapperError)

	})

	Convey("Test wrapper on PutObject", t, func() {

		_, mock, errTest := testMethod(func(h nodes.Handler) error {
			_, e := h.PutObject(context.Background(), &tree.Node{Path: "/test"}, strings.NewReader("hello"), &models.PutRequestData{})
			return e
		})

		So(mock.Context.Value(wrapperKey), ShouldNotBeNil)
		So(mock.Context.Value(wrapperKey).(string), ShouldEqual, wrapperValue)

		So(mock.Nodes["in"].Path, ShouldEqual, "/test")

		So(errTest, ShouldNotBeNil)
		So(errTest.Error(), ShouldEqual, wrapperError)

	})

	Convey("Test wrapper on CopyObject", t, func() {

		_, mock, errTest := testMethod(func(h nodes.Handler) error {
			_, e := h.CopyObject(context.Background(), &tree.Node{Path: "/test1"}, &tree.Node{Path: "/test2"}, &models.CopyRequestData{})
			return e
		})

		So(mock.Context.Value(wrapperKey), ShouldNotBeNil)
		So(mock.Context.Value(wrapperKey).(string), ShouldEqual, wrapperValue)

		So(mock.Nodes["from"].Path, ShouldEqual, "/test1")
		So(mock.Nodes["to"].Path, ShouldEqual, "/test2")

		So(errTest, ShouldNotBeNil)
		So(errTest.Error(), ShouldEqual, wrapperError)

	})

	Convey("Test wrapper on MultipartCreate", t, func() {

		_, mock, errTest := testMethod(func(h nodes.Handler) error {
			_, e := h.MultipartCreate(context.Background(), &tree.Node{Path: "/test"}, &models.MultipartRequestData{})
			return e
		})

		So(mock.Context.Value(wrapperKey), ShouldNotBeNil)
		So(mock.Context.Value(wrapperKey).(string), ShouldEqual, wrapperValue)

		So(mock.Nodes["in"].Path, ShouldEqual, "/test")

		So(errTest, ShouldNotBeNil)
		So(errTest.Error(), ShouldEqual, wrapperError)

	})

	Convey("Test wrapper on MultipartAbort", t, func() {

		_, mock, errTest := testMethod(func(h nodes.Handler) error {
			return h.MultipartAbort(context.Background(), &tree.Node{Path: "/test"}, "upload", &models.MultipartRequestData{})
		})

		So(mock.Context.Value(wrapperKey), ShouldNotBeNil)
		So(mock.Context.Value(wrapperKey).(string), ShouldEqual, wrapperValue)

		So(mock.Nodes["in"].Path, ShouldEqual, "/test")

		So(errTest, ShouldNotBeNil)
		So(errTest.Error(), ShouldEqual, wrapperError)

	})

	Convey("Test wrapper on MultipartComplete", t, func() {

		_, mock, errTest := testMethod(func(h nodes.Handler) error {
			_, e := h.MultipartComplete(context.Background(), &tree.Node{Path: "/test"}, "upload", []models.MultipartObjectPart{})
			return e
		})

		So(mock.Context.Value(wrapperKey), ShouldNotBeNil)
		So(mock.Context.Value(wrapperKey).(string), ShouldEqual, wrapperValue)

		So(mock.Nodes["in"].Path, ShouldEqual, "/test")

		So(errTest, ShouldNotBeNil)
		So(errTest.Error(), ShouldEqual, wrapperError)

	})

	Convey("Test wrapper on MultipartList", t, func() {

		_, mock, errTest := testMethod(func(h nodes.Handler) error {
			_, e := h.MultipartList(context.Background(), "/test", &models.MultipartRequestData{})
			return e
		})

		So(mock.Context.Value(wrapperKey), ShouldNotBeNil)
		So(mock.Context.Value(wrapperKey).(string), ShouldEqual, wrapperValue)

		So(errTest, ShouldNotBeNil)
		So(errTest.Error(), ShouldEqual, wrapperError)

	})

	Convey("Test wrapper on MultipartListObjectParts", t, func() {

		_, mock, errTest := testMethod(func(h nodes.Handler) error {
			_, e := h.MultipartListObjectParts(context.Background(), &tree.Node{Path: "/test"}, "upload", 0, 0)
			return e
		})

		So(mock.Context.Value(wrapperKey), ShouldNotBeNil)
		So(mock.Context.Value(wrapperKey).(string), ShouldEqual, wrapperValue)

		So(errTest, ShouldNotBeNil)
		So(errTest.Error(), ShouldEqual, wrapperError)

	})

}
