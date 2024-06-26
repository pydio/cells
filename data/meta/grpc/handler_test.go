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
	"io"
	"testing"
	"time"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/errors"
	tree "github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/test"
	"github.com/pydio/cells/v4/data/meta/dao/sql"

	_ "github.com/pydio/cells/v4/common/broker/debounce"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	testcases = test.TemplateSQL(sql.NewMetaDAO)
)

func TestMeta(t *testing.T) {

	test.RunStorageTests(testcases, func(ctx context.Context) {

		ctx = context.WithValue(ctx, claim.ContextKey, claim.Claims{Name: "author-name"})
		s := NewMetaServer(context.Background(), "metaServiceTest")

		Convey("Simple GET from stubbed implementation", t, func() {

			_, e := s.ReadNode(ctx, &tree.ReadNodeRequest{
				Node: &tree.Node{
					Uuid: "test",
				},
			})

			// Should Be Not Found
			So(errors.Is(e, errors.StatusNotFound), ShouldBeTrue)
		})

		Convey("Simple SET to stub implementation", t, func() {

			// Create Node
			{
				respObject, e := s.CreateNode(ctx, &tree.CreateNodeRequest{
					Node: &tree.Node{
						Uuid: "test",
						MetaStore: map[string]string{
							common.MetaNamespaceDatasourceName: "pydiods1",
							"name":                             "\"not-indexed\"",
							"Namespace":                        "\"Serialized Metadata Value\"",
						},
					},
				})

				So(e, ShouldBeNil)
				So(respObject.Success, ShouldBeTrue)
			}

			// Update with additional meta
			{
				respObject, e := s.UpdateNode(ctx, &tree.UpdateNodeRequest{
					To: &tree.Node{
						Uuid: "test",
						MetaStore: map[string]string{
							"Namespace2": "12",
						},
					},
				})

				So(e, ShouldBeNil)
				So(respObject.Success, ShouldBeTrue)
			}

			{
				resp, e1 := s.ReadNode(ctx, &tree.ReadNodeRequest{
					Node: &tree.Node{
						Uuid: "test",
					},
				})
				So(e1, ShouldBeNil)
				So(resp.Node.Uuid, ShouldEqual, "test")
				So(resp.Node.MetaStore, ShouldNotBeNil)
				var name string
				So(resp.Node.GetMeta("Namespace", &name), ShouldBeNil)
				So(name, ShouldEqual, "Serialized Metadata Value")
				var val int
				So(resp.Node.GetMeta("Namespace2", &val), ShouldBeNil)
				So(val, ShouldEqual, 12)
			}
			// Second read to trigger cache
			{
				resp, e1 := s.ReadNode(ctx, &tree.ReadNodeRequest{
					Node: &tree.Node{
						Uuid: "test",
					},
				})
				So(e1, ShouldBeNil)
				So(resp.Node.Uuid, ShouldEqual, "test")
				So(resp.Node.MetaStore, ShouldNotBeNil)
				var name string
				So(resp.Node.GetMeta("Namespace", &name), ShouldBeNil)
				So(name, ShouldEqual, "Serialized Metadata Value")
				var val int
				So(resp.Node.GetMeta("Namespace2", &val), ShouldBeNil)
				So(val, ShouldEqual, 12)
				So(resp.Node.MetaStore, ShouldNotContainKey, "name")
				So(resp.Node.MetaStore, ShouldNotContainKey, common.MetaNamespaceDatasourceName)
			}

		})

		Convey("Delete metadata by setting to empty namespace, then empty map", t, func() {

			respObject, e := s.UpdateNode(ctx, &tree.UpdateNodeRequest{
				From: &tree.Node{
					Uuid: "test",
				},
				To: &tree.Node{
					Uuid: "test",
					MetaStore: map[string]string{
						"Namespace": "\"Serialized Metadata Value\"",
					},
				},
			})

			So(e, ShouldBeNil)
			So(respObject.Success, ShouldBeTrue)

			_, er := s.UpdateNode(ctx, &tree.UpdateNodeRequest{
				To: &tree.Node{
					Uuid: "test",
					MetaStore: map[string]string{
						"Namespace": "",
					},
				},
			})
			So(er, ShouldBeNil)

			_, er = s.UpdateNode(ctx, &tree.UpdateNodeRequest{
				To: &tree.Node{
					Uuid:      "test",
					MetaStore: map[string]string{},
				},
			})
			So(er, ShouldBeNil)

			_, e1 := s.ReadNode(ctx, &tree.ReadNodeRequest{
				Node: &tree.Node{
					Uuid: "test",
				},
			})
			So(e1, ShouldNotBeNil)
			So(errors.Is(e1, errors.StatusNotFound), ShouldBeTrue)

		})

		Convey("Stop Handler", t, func() {

			s.Stop()
			So(s.stopped, ShouldBeTrue)

		})

	})
}

func TestStreamer(t *testing.T) {
	test.RunStorageTests(testcases, func(ctx context.Context) {
		ctx = context.WithValue(ctx, claim.ContextKey, claim.Claims{Name: "author-name"})
		server := NewMetaServer(context.Background(), "metaServiceTest")
		Convey("Test streamer", t, func() {

			respObject, e := server.CreateNode(ctx, &tree.CreateNodeRequest{
				Node: &tree.Node{
					Uuid: "test",
					MetaStore: map[string]string{
						"Namespace": "\"Serialized Metadata Value\"",
					},
				},
			})

			So(e, ShouldBeNil)
			So(respObject.Success, ShouldBeTrue)
			{
				// Existing node
				mock := &mockStreamer{
					ctx:     ctx,
					request: &tree.ReadNodeRequest{Node: &tree.Node{Uuid: "test"}},
				}
				er := server.ReadNodeStream(mock)
				So(er, ShouldBeNil)
				So(mock.responses, ShouldHaveLength, 1)
				So(mock.responses[0].Node.MetaStore, ShouldContainKey, "Namespace")
			}
			{
				// Unknown node : should still answer but with unchanged node
				mock := &mockStreamer{
					ctx:     ctx,
					request: &tree.ReadNodeRequest{Node: &tree.Node{Uuid: "unknownUUID", MetaStore: map[string]string{"some": "stuff"}}},
				}
				er := server.ReadNodeStream(mock)
				So(er, ShouldBeNil)
				So(mock.responses, ShouldHaveLength, 1)
				So(mock.responses[0].Node.MetaStore, ShouldNotContainKey, "Namespace")
				So(mock.responses[0].Node.MetaStore, ShouldContainKey, "some")
			}
		})
	})
}

func TestSubscriber(t *testing.T) {

	test.RunStorageTests(testcases, func(ctx context.Context) {

		ctx = context.WithValue(ctx, claim.ContextKey, claim.Claims{Name: "author-name"})
		server := NewMetaServer(context.Background(), "metaServiceTest")

		Convey("Test Create Event to Subscriber", t, func() {

			So(server.ProcessEvent(ctx, &tree.NodeChangeEvent{
				Type: tree.NodeChangeEvent_CREATE,
				Target: &tree.Node{
					Uuid: "event-node-uid",
					MetaStore: map[string]string{
						"Meta1": "\"Test\"",
						"Meta2": "\"Test\"",
					},
				},
			}), ShouldBeNil)

			time.Sleep(100 * time.Millisecond)
			respObject, readErr := server.ReadNode(ctx, &tree.ReadNodeRequest{
				Node: &tree.Node{
					Uuid: "event-node-uid",
				},
			})
			So(readErr, ShouldBeNil)
			So(respObject.Node.MetaStore, ShouldResemble, map[string]string{
				"Meta1": "\"Test\"",
				"Meta2": "\"Test\"",
			})
		})

		Convey("Test Update Event to Subscriber", t, func() {

			_, er := server.UpdateNode(ctx, &tree.UpdateNodeRequest{
				To: &tree.Node{
					Uuid: "event-node-uid",
					MetaStore: map[string]string{
						"Meta1": "\"FirstValue\"",
					},
				},
			})
			So(er, ShouldBeNil)

			// UPDATE_META then UPDATE_PATH
			{
				So(server.ProcessEvent(ctx, &tree.NodeChangeEvent{
					Type: tree.NodeChangeEvent_UPDATE_META,
					Target: &tree.Node{
						Uuid: "event-node-uid",
						MetaStore: map[string]string{
							"Meta1": "\"NewValue\"",
							"Meta2": "\"Test\"",
						},
					},
				}), ShouldBeNil)

				time.Sleep(100 * time.Millisecond)

				respObject, readErr := server.ReadNode(ctx, &tree.ReadNodeRequest{
					Node: &tree.Node{
						Uuid: "event-node-uid",
					},
				})
				So(readErr, ShouldBeNil)
				So(respObject.Node.MetaStore, ShouldResemble, map[string]string{
					"Meta1": "\"NewValue\"",
					"Meta2": "\"Test\"",
				})

				node := respObject.Node
				So(server.ProcessEvent(ctx, &tree.NodeChangeEvent{
					Type:   tree.NodeChangeEvent_UPDATE_PATH,
					Target: node,
				}), ShouldBeNil)

				time.Sleep(100 * time.Millisecond)

				respObject2, readErr2 := server.ReadNode(ctx, &tree.ReadNodeRequest{
					Node: &tree.Node{
						Uuid: "event-node-uid",
					},
				})
				So(readErr2, ShouldBeNil)
				So(respObject2.Node.MetaStore, ShouldResemble, map[string]string{
					"Meta1": "\"NewValue\"",
					"Meta2": "\"Test\"",
				})
			}

			// UPDATE_CONTENT
			{
				So(server.ProcessEvent(ctx, &tree.NodeChangeEvent{
					Type: tree.NodeChangeEvent_UPDATE_CONTENT,
					Target: &tree.Node{
						Uuid: "event-node-uid",
						MetaStore: map[string]string{
							common.MetaNamespaceHash: "\"THE-HASH\"",
						},
					},
				}), ShouldBeNil)

				time.Sleep(100 * time.Millisecond)

				respObject, readErr := server.ReadNode(ctx, &tree.ReadNodeRequest{
					Node: &tree.Node{
						Uuid: "event-node-uid",
					},
				})
				So(readErr, ShouldBeNil)
				So(respObject.Node.MetaStore, ShouldResemble, map[string]string{
					"Meta1":                  "\"NewValue\"",
					"Meta2":                  "\"Test\"",
					common.MetaNamespaceHash: "\"THE-HASH\"",
				})
			}
		})

		Convey("Test Delete Event to Subscriber", t, func() {

			_, er := server.UpdateNode(ctx, &tree.UpdateNodeRequest{
				To: &tree.Node{
					Uuid: "event-node-uid",
					MetaStore: map[string]string{
						"Meta1": "\"FirstValue\"",
					},
				},
			})
			So(er, ShouldBeNil)

			er = server.ProcessEvent(ctx, &tree.NodeChangeEvent{
				Type: tree.NodeChangeEvent_DELETE,
				Source: &tree.Node{
					Uuid: "event-node-uid",
				},
			})
			So(er, ShouldBeNil)

			time.Sleep(100 * time.Millisecond)

			_, readErr := server.ReadNode(ctx, &tree.ReadNodeRequest{
				Node: &tree.Node{
					Uuid: "event-node-uid",
				},
			})

			So(readErr, ShouldNotBeNil)
			So(errors.Is(readErr, errors.StatusNotFound), ShouldBeTrue)

		})
	})

}

type mockStreamer struct {
	grpc.ServerStream
	sent      bool
	request   *tree.ReadNodeRequest
	responses []*tree.ReadNodeResponse
	ctx       context.Context
}

func (m *mockStreamer) Context() context.Context {
	return m.ctx
}

func (m *mockStreamer) Send(r *tree.ReadNodeResponse) error {
	m.responses = append(m.responses, r)
	return nil
}

func (m *mockStreamer) Recv() (*tree.ReadNodeRequest, error) {
	if m.sent {
		return nil, io.EOF
	}
	m.sent = true
	return m.request, nil
}
