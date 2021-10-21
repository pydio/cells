// +build ignore

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

package grpc

import (
	"context"
	"fmt"
	"testing"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/micro/go-micro/errors"
	. "github.com/smartystreets/goconvey/convey"

	common "github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/common/utils/cache"
	"github.com/pydio/cells/data/meta"
	"github.com/pydio/cells/x/configx"
)

var (
	mockDAO meta.DAO
)

func TestMain(m *testing.M) {
	options := configx.New()

	sqlDAO := sql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "test")
	if sqlDAO == nil {
		fmt.Print("Could not start test")
		return
	}

	mockDAO = meta.NewDAO(sqlDAO).(meta.DAO)
	if err := mockDAO.Init(options); err != nil {
		fmt.Print("Could not start test ", err)
		return
	}

	m.Run()
}

func TestEmptyDao(t *testing.T) {

	Convey("Test wrongly initialized server", t, func() {

		s := &MetaServer{}
		e := s.ReadNode(context.Background(), &common.ReadNodeRequest{}, &common.ReadNodeResponse{})
		So(e, ShouldNotBeNil)

		e2 := s.UpdateNode(context.Background(), &common.UpdateNodeRequest{}, &common.UpdateNodeResponse{})
		So(e2, ShouldNotBeNil)
	})
}

func TestMeta(t *testing.T) {

	s := &MetaServer{}
	var e error
	var ctx = servicecontext.WithDAO(context.Background(), mockDAO)

	Convey("Simple GET from stubbed implementation", t, func() {

		respObject := &common.ReadNodeResponse{}

		e = s.ReadNode(ctx, &common.ReadNodeRequest{
			Node: &common.Node{
				Uuid: "test",
			},
		}, respObject)

		// Should Be Not Found
		So(errors.Parse(e.Error()).Code, ShouldEqual, 404)
	})

	Convey("Simple SET to stub implementation", t, func() {

		respObject := &common.UpdateNodeResponse{}
		e = s.UpdateNode(ctx, &common.UpdateNodeRequest{
			From: &common.Node{
				Uuid: "test",
			},
			To: &common.Node{
				Uuid: "test",
				MetaStore: map[string]string{
					"Namespace": "\"Serialized Metadata Value\"",
				},
			},
		}, respObject)

		So(e, ShouldBeNil)
		So(respObject.Success, ShouldBeTrue)

		resp := &common.ReadNodeResponse{}
		e1 := s.ReadNode(ctx, &common.ReadNodeRequest{
			Node: &common.Node{
				Uuid: "test",
			},
		}, resp)
		So(e1, ShouldBeNil)
		So(resp.Node.Uuid, ShouldEqual, "test")
		So(resp.Node.MetaStore, ShouldNotBeNil)
		var name string
		resp.Node.GetMeta("Namespace", &name)
		So(name, ShouldEqual, "Serialized Metadata Value")

	})

	Convey("Delete metadata by setting to empty map", t, func() {

		respObject := &common.UpdateNodeResponse{}
		e = s.UpdateNode(ctx, &common.UpdateNodeRequest{
			From: &common.Node{
				Uuid: "test",
			},
			To: &common.Node{
				Uuid: "test",
				MetaStore: map[string]string{
					"Namespace": "\"Serialized Metadata Value\"",
				},
			},
		}, respObject)

		So(e, ShouldBeNil)
		So(respObject.Success, ShouldBeTrue)

		s.UpdateNode(ctx, &common.UpdateNodeRequest{
			To: &common.Node{
				Uuid:      "test",
				MetaStore: map[string]string{},
			},
		}, &common.UpdateNodeResponse{})

		resp := &common.ReadNodeResponse{}
		e1 := s.ReadNode(ctx, &common.ReadNodeRequest{
			Node: &common.Node{
				Uuid: "test",
			},
		}, resp)
		So(e1, ShouldNotBeNil)
		e2 := errors.Parse(e1.Error())
		So(e2.Code, ShouldEqual, 404)

	})

}

func TestSubscriber(t *testing.T) {

	server := &MetaServer{}

	var ctx = servicecontext.WithDAO(context.Background(), mockDAO)

	Convey("Test CreateSubscriber", t, func() {

		sub := server.CreateNodeChangeSubscriber(ctx)
		So(sub, ShouldNotBeNil)
		So(sub.outputChannel, ShouldEqual, server.eventsChannel)

	})

	Convey("Test Create Event to Subscriber", t, func() {

		sub := server.CreateNodeChangeSubscriber(ctx)
		sub.outputChannel <- &cache.EventWithContext{
			Ctx: ctx,
			NodeChangeEvent: &common.NodeChangeEvent{
				Type: common.NodeChangeEvent_CREATE,
				Target: &common.Node{
					Uuid: "event-node-uid",
					MetaStore: map[string]string{
						"Meta1": "\"Test\"",
						"Meta2": "\"Test\"",
					},
				},
			},
		}

		time.Sleep(100 * time.Millisecond)
		respObject := &common.ReadNodeResponse{}
		readErr := server.ReadNode(ctx, &common.ReadNodeRequest{
			Node: &common.Node{
				Uuid: "event-node-uid",
			},
		}, respObject)
		So(readErr, ShouldBeNil)
		So(respObject.Node.MetaStore, ShouldResemble, map[string]string{
			"Meta1": "\"Test\"",
			"Meta2": "\"Test\"",
		})
	})

	Convey("Test Update Event to Subscriber", t, func() {

		ctx := ctx
		sub := server.CreateNodeChangeSubscriber(ctx)
		server.UpdateNode(ctx, &common.UpdateNodeRequest{
			To: &common.Node{
				Uuid: "event-node-uid",
				MetaStore: map[string]string{
					"Meta1": "\"FirstValue\"",
				},
			},
		}, &common.UpdateNodeResponse{})

		sub.outputChannel <- &cache.EventWithContext{
			Ctx: ctx,
			NodeChangeEvent: &common.NodeChangeEvent{
				Type: common.NodeChangeEvent_UPDATE_META,
				Target: &common.Node{
					Uuid: "event-node-uid",
					MetaStore: map[string]string{
						"Meta1": "\"NewValue\"",
						"Meta2": "\"Test\"",
					},
				},
			},
		}

		time.Sleep(100 * time.Millisecond)

		respObject := &common.ReadNodeResponse{}
		readErr := server.ReadNode(ctx, &common.ReadNodeRequest{
			Node: &common.Node{
				Uuid: "event-node-uid",
			},
		}, respObject)
		So(readErr, ShouldBeNil)
		So(respObject.Node.MetaStore, ShouldResemble, map[string]string{
			"Meta1": "\"NewValue\"",
			"Meta2": "\"Test\"",
		})
	})

	Convey("Test Delete Event to Subscriber", t, func() {

		ctx := ctx
		sub := server.CreateNodeChangeSubscriber(ctx)
		server.UpdateNode(ctx, &common.UpdateNodeRequest{
			To: &common.Node{
				Uuid: "event-node-uid",
				MetaStore: map[string]string{
					"Meta1": "\"FirstValue\"",
				},
			},
		}, &common.UpdateNodeResponse{})

		sub.outputChannel <- &cache.EventWithContext{
			Ctx: ctx,
			NodeChangeEvent: &common.NodeChangeEvent{
				Type: common.NodeChangeEvent_DELETE,
				Source: &common.Node{
					Uuid: "event-node-uid",
				},
			},
		}

		time.Sleep(100 * time.Millisecond)

		respObject := &common.ReadNodeResponse{}
		readErr := server.ReadNode(ctx, &common.ReadNodeRequest{
			Node: &common.Node{
				Uuid: "event-node-uid",
			},
		}, respObject)

		So(readErr, ShouldNotBeNil)
		e2 := errors.Parse(readErr.Error())
		So(e2.Code, ShouldEqual, 404)

	})

}
