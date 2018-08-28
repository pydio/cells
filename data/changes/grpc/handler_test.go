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

package grpc

import (
	"context"
	"fmt"
	"testing"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	service "github.com/pydio/cells/common/service/proto"
	commonsql "github.com/pydio/cells/common/sql"
	changessql "github.com/pydio/cells/data/changes"

	// SQLite Driver
	_ "github.com/mattn/go-sqlite3"
)

var (
	ctx         context.Context
	mockDAO     changessql.DAO
	mockHandler *Handler
)

func init() {
	// Instantiate and initialise the mock DAO
	sqlDao := commonsql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "")
	mockDAO = changessql.NewDAO(sqlDao).(changessql.DAO)
	options := config.NewMap()
	options.Set("database", mockDAO)
	options.Set("exclusive", true)
	options.Set("prepare", true)
	err := mockDAO.Init(*options)
	if err != nil {
		fmt.Print("could not start test ", err)
		return
	}

	// Init context and handler
	ctx = servicecontext.WithDAO(context.Background(), mockDAO)
	mockHandler = &Handler{}
}

func TestBasicEvents(t *testing.T) {

	Convey("Given an empty mutualized DB", t, func() {

		Convey("Put a change", func() {
			ev := newSyncChange("testId-simplePut", "", "/putchange/test", tree.SyncChange_create)

			arr := []*tree.SyncChange{ev}
			streamMock := newPutStreamMock(arr)

			err := mockHandler.Put(ctx, streamMock)
			So(err, ShouldBeNil)

			// Directly check the DAO to insure the put has been correctly done
			res, err := mockDAO.Get(0, "/putchange")
			So(err, ShouldBeNil)

			count := 0
			for range res {
				count++
			}
			So(count, ShouldEqual, 1)
		})

		Convey("Search should return stored change", func() {

			streamMock := newSearchStreamMock()
			req := newSearchRequest(0, "/putchange", false, false)

			err := mockHandler.Search(ctx, req, streamMock)
			So(err, ShouldBeNil)
			So(streamMock.counter, ShouldEqual, 1)
		})

		Convey("Archive changes with an empty query should fail", func() {

			req := &service.Query{}
			resp := &service.StatusResponse{}

			err := mockHandler.Archive(ctx, req, resp)
			So(err, ShouldNotBeNil)
		})

		Convey("Archive changes with corrected query should success", func() {

			query, err := ptypes.MarshalAny(&service.ChangesArchiveQuery{RemainingRows: 0})
			So(err, ShouldBeNil)

			req := &service.Query{
				SubQueries: []*any.Any{query},
			}
			resp := &service.StatusResponse{}

			err = mockHandler.Archive(ctx, req, resp)
			So(err, ShouldBeNil)
		})

		Convey("After archive, search should return no result", func() {

			streamMock := newSearchStreamMock()
			req := newSearchRequest(0, "/putchange", false, false)

			err := mockHandler.Search(ctx, req, streamMock)
			So(err, ShouldBeNil)
			So(streamMock.counter, ShouldEqual, 0)
		})

		// // Creates 3 events that should be flattened in a single one
		// Convey("Test flattened changes", t, func() {
		// 	ev := NewSyncChange("testId-flattened-events", "/flattentest/flatten-test", "", tree.SyncChange_create)
		// 	ev2 := NewSyncChange("testId-flattened-events", "/flattentest/flatten-test", "/flattentest/flatten-test2", tree.SyncChange_path)
		// 	ev3 := NewSyncChange("testId-flattened-events", "/flattentest/flatten-test2", "/flattentest/flatten-test", tree.SyncChange_path)

		// 	arr := []*tree.SyncChange{ev, ev2, ev3}
		// 	putMock := newPutStreamMock(arr)

		// 	err := mockHandler.Put(ctx, putMock)
		// 	So(err, ShouldBeNil)

		// 	// Retrieve change events *without* flatten
		// 	searchMock := newSearchStreamMock()
		// 	req := NewSearchRequest(0, "/flattentest", false, false)
		// 	err = mockHandler.Search(ctx, req, searchMock)
		// 	So(err, ShouldBeNil)
		// 	So(searchMock.counter, ShouldEqual, 3)

		// 	// Retrieve change events *with* flatten
		// 	searchMock2 := newSearchStreamMock()
		// 	req2 := NewSearchRequest(0, "/flattentest", true, false)
		// 	err = mockHandler.Search(ctx, req2, searchMock2)
		// 	So(err, ShouldBeNil)
		// 	So(searchMock2.counter, ShouldEqual, 1)
		// })

		// // Validate event type after flatten
		// Convey("Test flattened changes", t, func() {
		// 	ev := NewSyncChange("testId-flatten-checkType", "/flattentest2/flatten-test", "", tree.SyncChange_content)
		// 	ev2 := NewSyncChange("testId-flatten-checkType", "/flattentest2/flatten-test", "/flattentest2/flatten-test2", tree.SyncChange_path)
		// 	ev3 := NewSyncChange("testId-flatten-checkType", "/flattentest2/flatten-test2", "/flattentest2/flatten-test", tree.SyncChange_path)

		// 	arr := []*tree.SyncChange{ev, ev2, ev3}
		// 	putMock := newPutStreamMock(arr)

		// 	err := mockHandler.Put(ctx, putMock)
		// 	So(err, ShouldBeNil)

		// 	searchMock := newSearchStreamMock()
		// 	req := NewSearchRequest(0, "/flattentest2", true, false)
		// 	err = mockHandler.Search(ctx, req, searchMock)
		// 	So(err, ShouldBeNil)
		// 	So(searchMock.counter, ShouldEqual, 1)
		// 	So(searchMock.mockEvents[0].GetType(), ShouldEqual, tree.SyncChange_content)

		// 	// Same thing with the content change even in between
		// 	ev = NewSyncChange("testId-flatten-checkType2", "/flattentest3/flatten-test", "/flattentest3/flatten-test2", tree.SyncChange_path)
		// 	ev2 = NewSyncChange("testId-flatten-checkType2", "/flattentest3/flatten-test2", "", tree.SyncChange_content)
		// 	ev3 = NewSyncChange("testId-flatten-checkType2", "/flattentest3/flatten-test2", "/flattentest3/flatten-test", tree.SyncChange_path)

		// 	arr = []*tree.SyncChange{ev, ev2, ev3}
		// 	putMock = newPutStreamMock(arr)

		// 	err = mockHandler.Put(ctx, putMock)
		// 	So(err, ShouldBeNil)

		// 	searchMock = newSearchStreamMock()
		// 	req = NewSearchRequest(0, "/flattentest3", true, false)
		// 	err = mockHandler.Search(ctx, req, searchMock)
		// 	So(err, ShouldBeNil)
		// 	So(searchMock.counter, ShouldEqual, 1)
		// 	So(searchMock.mockEvents[0].GetType(), ShouldEqual, tree.SyncChange_content)

		// 	// A litle more complex
		// 	ev4 := NewSyncChange("testId-flatten-checkType3", "/flattentest4/flatten-test", "", tree.SyncChange_create)
		// 	ev5 := NewSyncChange("testId-flatten-checkType3", "/flattentest4/flatten-test", "/flattentest4/flatten-test2", tree.SyncChange_path)
		// 	ev6 := NewSyncChange("testId-flatten-checkType3", "/flattentest4/flatten-test2", "", tree.SyncChange_content)
		// 	ev7 := NewSyncChange("testId-flatten-checkType3", "/flattentest4/flatten-test2", "/flattentest4/flatten-test", tree.SyncChange_path)

		// 	arr = []*tree.SyncChange{ev4, ev5, ev6, ev7}
		// 	putMock = newPutStreamMock(arr)

		// 	err = mockHandler.Put(ctx, putMock)
		// 	So(err, ShouldBeNil)

		// 	searchMock = newSearchStreamMock()
		// 	req = NewSearchRequest(0, "/flattentest4", true, false)
		// 	err = mockHandler.Search(ctx, req, searchMock)
		// 	So(err, ShouldBeNil)
		// 	So(searchMock.counter, ShouldEqual, 1)
		// 	So(searchMock.mockEvents[0].GetType(), ShouldEqual, tree.SyncChange_content)
		// })
	})
}

// Helpers to ease implementation
func newSyncChange(nid, src, target string, t tree.SyncChange_Type) *tree.SyncChange {
	return &tree.SyncChange{
		NodeId: nid,
		Type:   t,
		Source: src,
		Target: target,
	}
}

func newSearchRequest(seq int, prefix string, flatten, lastSeqOnly bool) *tree.SearchSyncChangeRequest {
	return &tree.SearchSyncChangeRequest{
		Seq:         uint64(seq),
		Flatten:     flatten,
		Prefix:      prefix,
		LastSeqOnly: lastSeqOnly,
	}
}
