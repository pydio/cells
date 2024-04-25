/*
 * Copyright (c) 2021. Abstrium SAS <team (at) pydio.com>
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
	"os"
	"path/filepath"
	"testing"
	"time"

	chat2 "github.com/pydio/cells/v4/broker/chat"
	"github.com/pydio/cells/v4/common/nodes/mocks"
	"github.com/pydio/cells/v4/common/proto/chat"
	"github.com/pydio/cells/v4/common/server/stubs"
	"github.com/pydio/cells/v4/common/utils/test"
	"github.com/pydio/cells/v4/common/utils/uuid"

	_ "github.com/pydio/cells/v4/common/storage/boltdb"
	_ "github.com/pydio/cells/v4/common/storage/mongo"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = []test.StorageTestCase{
		{"boltdb://" + filepath.Join(os.TempDir(), "chat_bolt_"+uuid.New()+".db"), true, chat2.NewBoltDAO},
		{os.Getenv("CELLS_TEST_MONGODB_DSN") + "?collection=index", os.Getenv("CELLS_TEST_MONGODB_DSN") != "", chat2.NewMongoDAO},
	}
)

type msgSrvStub struct {
	stubs.StreamerStubCore
	mm []*chat.ListMessagesResponse
}

func (s *msgSrvStub) Send(response *chat.ListMessagesResponse) error {
	s.mm = append(s.mm, response)
	return nil
}

type roomsSrvStub struct {
	stubs.StreamerStubCore
	rr []*chat.ListRoomsResponse
}

func (s *roomsSrvStub) Send(response *chat.ListRoomsResponse) error {
	s.rr = append(s.rr, response)
	return nil
}

func TestChatHandler_PutRoom(t *testing.T) {

	handler := &ChatHandler{}

	test.RunStorageTests(testcases, func(ctx context.Context, cd chat2.DAO) {

		roomUuid := uuid.New()
		nodeUuid := uuid.New()

		Convey("Test Chat DAO / CRUD ROOMS", t, func() {
			_, e := handler.PutRoom(ctx, &chat.PutRoomRequest{Room: &chat.ChatRoom{
				Type:           chat.RoomType_NODE,
				Uuid:           roomUuid,
				RoomTypeObject: nodeUuid,
				RoomLabel:      "Comments",
			}})
			So(e, ShouldBeNil)

			stub := &roomsSrvStub{}
			stub.Ctx = ctx
			e = handler.ListRooms(&chat.ListRoomsRequest{
				ByType:     chat.RoomType_NODE,
				TypeObject: nodeUuid,
			}, stub)
			So(e, ShouldBeNil)
			So(stub.rr, ShouldHaveLength, 1)

			stub = &roomsSrvStub{}
			stub.Ctx = ctx
			e = handler.ListRooms(&chat.ListRoomsRequest{
				ByType: chat.RoomType_NODE,
			}, stub)
			So(e, ShouldBeNil)
			So(len(stub.rr), ShouldBeGreaterThanOrEqualTo, 1)

			_, e = handler.DeleteRoom(ctx, &chat.DeleteRoomRequest{Room: &chat.ChatRoom{
				Type:           chat.RoomType_NODE,
				Uuid:           roomUuid,
				RoomTypeObject: nodeUuid,
			}})
			So(e, ShouldBeNil)

			_, e = handler.DeleteRoom(ctx, &chat.DeleteRoomRequest{Room: &chat.ChatRoom{
				Type:           chat.RoomType_NODE,
				Uuid:           "non-existing-uuid",
				RoomTypeObject: "non-existing-uuid",
			}})
			So(e, ShouldBeNil)

			stub = &roomsSrvStub{}
			stub.Ctx = ctx
			e = handler.ListRooms(&chat.ListRoomsRequest{
				ByType:     chat.RoomType_NODE,
				TypeObject: nodeUuid,
			}, stub)
			So(e, ShouldBeNil)
			So(stub.rr, ShouldHaveLength, 0)

		})
	})
}

func TestChatHandler_PutMessage(t *testing.T) {

	handler := &ChatHandler{}

	test.RunStorageTests(testcases, func(ctx context.Context, cd chat2.DAO) {

		ctx = context.WithValue(ctx, "resolved-meta-client", &mocks.NodeReceiverClient{})

		Convey("Test Chat DAO / CRUD MESSAGES", t, func() {
			_, e := handler.PutRoom(ctx, &chat.PutRoomRequest{Room: &chat.ChatRoom{
				Type:           chat.RoomType_NODE,
				Uuid:           "room",
				RoomTypeObject: "node",
				RoomLabel:      "Comments",
			}})
			So(e, ShouldBeNil)

			resp, e := handler.PostMessage(ctx, &chat.PostMessageRequest{Messages: []*chat.ChatMessage{{
				RoomUuid: "room",
				Message:  "Hello World",
				Author:   "tester",
			}}})
			So(e, ShouldBeNil)
			So(resp.Messages, ShouldHaveLength, 1)
			storedUuid := resp.Messages[0].Uuid

			// Update Message content: post with UUID - author must be the same!
			resp, e = handler.PostMessage(ctx, &chat.PostMessageRequest{Messages: []*chat.ChatMessage{{
				Uuid:     storedUuid,
				RoomUuid: "room",
				Message:  "Hello World - Updated",
				Author:   "tester",
			}}})
			So(e, ShouldBeNil)
			So(resp.Messages, ShouldHaveLength, 1)

			resp, e = handler.PostMessage(ctx, &chat.PostMessageRequest{Messages: []*chat.ChatMessage{{
				Uuid:     storedUuid,
				RoomUuid: "room",
				Message:  "Hello World - Updated Fail",
				Author:   "author",
			}}})
			So(e, ShouldNotBeNil)

			resp, e = handler.PostMessage(ctx, &chat.PostMessageRequest{Messages: []*chat.ChatMessage{{
				Uuid:     "unknown-uuid",
				RoomUuid: "room",
				Message:  "Hello World - Updated Fail",
				Author:   "tester",
			}}})
			So(e, ShouldNotBeNil)

			stub := &msgSrvStub{}
			stub.Ctx = ctx
			e = handler.ListMessages(&chat.ListMessagesRequest{RoomUuid: "room"}, stub)
			So(e, ShouldBeNil)
			So(stub.mm, ShouldHaveLength, 1)
			So(stub.mm[0].Message.Message, ShouldEqual, "Hello World - Updated")

			_, ee := handler.DeleteMessage(ctx, &chat.DeleteMessageRequest{Messages: []*chat.ChatMessage{{
				RoomUuid: "room",
			}}})
			So(ee, ShouldNotBeNil)

			dR, e := handler.DeleteMessage(ctx, &chat.DeleteMessageRequest{Messages: []*chat.ChatMessage{{
				Uuid:     storedUuid,
				RoomUuid: "room",
			}}})
			So(e, ShouldBeNil)
			So(dR.Success, ShouldBeTrue)

			stub = &msgSrvStub{}
			stub.Ctx = ctx
			e = handler.ListMessages(&chat.ListMessagesRequest{RoomUuid: "room"}, stub)
			So(e, ShouldBeNil)
			So(stub.mm, ShouldHaveLength, 0)

		})
	})
}

func TestChatHandler_ListMessages(t *testing.T) {

	handler := &ChatHandler{}

	test.RunStorageTests(testcases, func(ctx context.Context, cd chat2.DAO) {
		roomUuid := uuid.New()
		ctx = context.WithValue(ctx, "resolved-meta-client", &mocks.NodeReceiverClient{})

		Convey("Test Chat DAO / CRUD MESSAGES", t, func() {
			_, e := handler.PutRoom(ctx, &chat.PutRoomRequest{Room: &chat.ChatRoom{
				Type:           chat.RoomType_NODE,
				Uuid:           roomUuid,
				RoomTypeObject: "node",
				RoomLabel:      "Comments",
			}})
			So(e, ShouldBeNil)

			var ids []string
			size := 35
			for i := 0; i < size; i++ {
				resp, e := handler.PostMessage(ctx, &chat.PostMessageRequest{Messages: []*chat.ChatMessage{{
					RoomUuid:  roomUuid,
					Message:   fmt.Sprintf("Hello World %d", i),
					Author:    "tester",
					Timestamp: time.Now().UnixNano(),
				}}})
				So(e, ShouldBeNil)
				ids = append(ids, resp.Messages[0].Uuid)
			}
			So(ids, ShouldHaveLength, size)

			// Returns the last N starting from the last, but in ASC order
			stub := &msgSrvStub{}
			stub.Ctx = ctx
			e = handler.ListMessages(&chat.ListMessagesRequest{RoomUuid: roomUuid, Offset: 0, Limit: 10}, stub)
			So(e, ShouldBeNil)
			So(stub.mm, ShouldHaveLength, 10)
			So(stub.mm[0].Message.Uuid, ShouldEqual, ids[size-10])
			So(stub.mm[9].Message.Uuid, ShouldEqual, ids[size-1])

			stub = &msgSrvStub{}
			stub.Ctx = ctx
			e = handler.ListMessages(&chat.ListMessagesRequest{RoomUuid: roomUuid, Offset: 10, Limit: 10}, stub)
			So(e, ShouldBeNil)
			So(stub.mm, ShouldHaveLength, 10)
			So(stub.mm[0].Message.Uuid, ShouldEqual, ids[size-10-10])
			So(stub.mm[9].Message.Uuid, ShouldEqual, ids[size-1-10])

			stub = &msgSrvStub{}
			stub.Ctx = ctx
			e = handler.ListMessages(&chat.ListMessagesRequest{RoomUuid: roomUuid, Offset: 30, Limit: 10}, stub)
			So(e, ShouldBeNil)
			So(stub.mm, ShouldHaveLength, 5)
			So(stub.mm[0].Message.Uuid, ShouldEqual, ids[0])
			So(stub.mm[4].Message.Uuid, ShouldEqual, ids[4])

			dR, e := handler.DeleteMessage(ctx, &chat.DeleteMessageRequest{Messages: []*chat.ChatMessage{{
				Uuid:     ids[0],
				RoomUuid: roomUuid,
			}, {
				Uuid:     ids[1],
				RoomUuid: roomUuid,
			}}})
			So(e, ShouldBeNil)
			So(dR.Success, ShouldBeTrue)

		})
	})
}
