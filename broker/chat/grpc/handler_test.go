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
	"github.com/pydio/cells/v4/common/dao/boltdb"
	"os"
	"path/filepath"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	chat2 "github.com/pydio/cells/v4/broker/chat"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/nodes/mocks"
	"github.com/pydio/cells/v4/common/proto/chat"
	"github.com/pydio/cells/v4/common/server/stubs"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/uuid"
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

func initializedHandler() (context.Context, *ChatHandler, func(), error) {

	if mDsn := os.Getenv("CELLS_TEST_MONGODB_DSN"); mDsn != "" {
		fmt.Println("Testing on MONGO DB")
		coreDao, _ := mongodb.NewDAO("mongodb", mDsn, "chat-test")
		dao := chat2.NewDAO(coreDao).(chat2.DAO)
		if e := dao.Init(configx.New()); e != nil {
			return nil, nil, nil, e
		}
		closer := func() {
			dao.CloseConn()
		}
		ctx := servicecontext.WithDAO(context.Background(), dao)
		handler := &ChatHandler{dao: dao}
		return ctx, handler, closer, nil

	} else {

		tmpFile := filepath.Join(os.TempDir(), uuid.New()+".db")
		coreDao, _ := boltdb.NewDAO("boltdb", tmpFile, "")
		dao := chat2.NewDAO(coreDao).(chat2.DAO)
		if e := dao.Init(configx.New()); e != nil {
			return nil, nil, nil, e
		}
		closer := func() {
			dao.CloseConn()
			os.Remove(tmpFile)
		}
		ctx := servicecontext.WithDAO(context.Background(), dao)
		handler := &ChatHandler{dao: dao}
		return ctx, handler, closer, nil
	}
}

func TestChatHandler_PutRoom(t *testing.T) {

	roomUuid := uuid.New()
	nodeUuid := uuid.New()

	Convey("Test Chat DAO / CRUD ROOMS", t, func() {
		ctx, handler, closer, e := initializedHandler()
		So(e, ShouldBeNil)
		defer closer()
		_, e = handler.PutRoom(ctx, &chat.PutRoomRequest{Room: &chat.ChatRoom{
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

}

func TestChatHandler_PutMessage(t *testing.T) {

	Convey("Test Chat DAO / CRUD MESSAGES", t, func() {
		metaClient = &mocks.NodeReceiverClient{}
		ctx, handler, closer, e := initializedHandler()
		So(e, ShouldBeNil)
		defer closer()
		_, e = handler.PutRoom(ctx, &chat.PutRoomRequest{Room: &chat.ChatRoom{
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

		stub := &msgSrvStub{}
		stub.Ctx = ctx
		e = handler.ListMessages(&chat.ListMessagesRequest{RoomUuid: "room"}, stub)
		So(e, ShouldBeNil)
		So(stub.mm, ShouldHaveLength, 1)

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

}

func TestChatHandler_ListMessages(t *testing.T) {

	roomUuid := uuid.New()

	Convey("Test Chat DAO / CRUD MESSAGES", t, func() {
		metaClient = &mocks.NodeReceiverClient{}
		ctx, handler, closer, e := initializedHandler()
		So(e, ShouldBeNil)
		defer closer()
		_, e = handler.PutRoom(ctx, &chat.PutRoomRequest{Room: &chat.ChatRoom{
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

}
