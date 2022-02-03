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
	"errors"
	"fmt"
	"io"
	"sync"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"google.golang.org/grpc/metadata"
	// SQLite Driver
	_ "github.com/mattn/go-sqlite3"

	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/proto/tree"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/data/source/index"
)

var (
	ctx context.Context
	wg  sync.WaitGroup
	dao index.DAO
)

type List struct {
	w *io.PipeWriter
	r *io.PipeReader
}

func (l *List) SetHeader(md metadata.MD) error {
	panic("implement me")
}

func (l *List) SendHeader(md metadata.MD) error {
	panic("implement me")
}

func (l *List) SetTrailer(md metadata.MD) {
	panic("implement me")
}

func (l *List) Context() context.Context {
	return ctx
}

func NewList() *List {
	r, w := io.Pipe()

	return &List{
		w: w,
		r: r,
	}
}

func (l *List) Send(resp *tree.ListNodesResponse) error {

	enc := json.NewEncoder(l.w)

	enc.Encode(resp)

	return nil
}

func (l *List) SendMsg(interface{}) error {
	return nil
}

func (l *List) Recv() (*tree.ListNodesResponse, error) {
	resp := &tree.ListNodesResponse{}
	dec := json.NewDecoder(l.r)

	err := dec.Decode(resp)
	return resp, err
}

func (l *List) RecvMsg(interface{}) error {
	return nil
}

func (l *List) Close() error {
	l.w.Close()
	return nil
}

func TestMain(m *testing.M) {

	// Registry mock
	//defaults.InitServer(
	//func() server.Option { return server.Registry(memory.NewRegistry()) },
	//func() server.Option { return server.Broker(nats.NewBroker()) },
	//)

	options := configx.New()

	sqlDAO := sql.NewDAO("sqlite3", "file::memory:?mode=memory&cache=shared", "test")
	if sqlDAO == nil {
		fmt.Print("Could not start test")
		return
	}

	//sqlDAO := sql.NewDAO("mysql", "root@tcp(localhost:3306)/cells3?parseTime=true", "test")
	//if sqlDAO == nil {
	//	fmt.Print("Could not start test")
	//	return
	//}

	d := index.NewDAO(sqlDAO)
	if err := d.Init(options); err != nil {
		fmt.Print("Could not start test ", err)
		return
	}
	dao = d.(index.DAO)
	ctx = servicecontext.WithDAO(context.Background(), d)

	m.Run()
	wg.Wait()
}

func send(s *TreeServer, req string, args interface{}) (interface{}, error) {
	switch req {
	case "CreateNode":
		return s.CreateNode(ctx, args.(*tree.CreateNodeRequest))
	case "GetNode":
		resp, err := s.ReadNode(ctx, args.(*tree.ReadNodeRequest))

		So(err, ShouldBeNil)
		So(resp, ShouldNotBeNil)

		return resp, err
	case "UpdateNode":
		return s.UpdateNode(ctx, args.(*tree.UpdateNodeRequest))

	case "ListNodes":

		resp := NewList()
		go func() {
			_ = s.ListNodes(args.(*tree.ListNodesRequest), resp)
		}()

		return resp, nil
	case "DeleteNode":

		_, err := s.DeleteNode(ctx, args.(*tree.DeleteNodeRequest))
		So(err, ShouldBeNil)
		return nil, err
	}

	return nil, errors.New("Doesn't exist")
}

func TestIndex(t *testing.T) {

	s := NewTreeServer(&object.DataSource{Name: ""}, "", dao)

	wg.Add(1)
	defer wg.Done()

	Convey("Insert a new child at root level", t, func() {

		node1_1 := &tree.Node{Uuid: "test_1_1", Path: "/test_1_1"}

		send(s, "CreateNode", &tree.CreateNodeRequest{Node: node1_1})

		resp, _ := send(s, "GetNode", &tree.ReadNodeRequest{})

		So(resp.(*tree.ReadNodeResponse).Node.Uuid, ShouldEqual, "ROOT")
	})

	Convey("Inserting concurrent rows", t, func() {
		node1_2 := &tree.Node{Uuid: "test_1_2", Path: "/test_1_2"}
		node1_3 := &tree.Node{Uuid: "test_1_3", Path: "/test_1_3"}
		node1_4 := &tree.Node{Uuid: "test_1_4", Path: "/test_1_4"}

		wg.Add(1)
		defer wg.Done()

		go func() {
			wg.Add(1)
			defer wg.Done()

			send(s, "CreateNode", &tree.CreateNodeRequest{Node: node1_2})
		}()
		go func() {
			wg.Add(1)
			defer wg.Done()

			send(s, "CreateNode", &tree.CreateNodeRequest{Node: node1_3})
		}()
		go func() {
			wg.Add(1)
			defer wg.Done()

			send(s, "CreateNode", &tree.CreateNodeRequest{Node: node1_4})
		}()
	})

	Convey("Insert a new child at 1.4.2 level", t, func() {

		node1_4_1 := &tree.Node{Uuid: "test_1_4_1", Path: "/test_1_4/test_1_4_1"}
		node1_4_2 := &tree.Node{Uuid: "test_1_4_2", Path: "/test_1_4/test_1_4_2"}

		send(s, "CreateNode", &tree.CreateNodeRequest{Node: node1_4_1})
		send(s, "CreateNode", &tree.CreateNodeRequest{Node: node1_4_2})

		resp, _ := send(s, "GetNode", &tree.ReadNodeRequest{Node: node1_4_2})
		So(resp.(*tree.ReadNodeResponse).Success, ShouldBeTrue)
		So(resp.(*tree.ReadNodeResponse).Node.Uuid, ShouldEqual, "test_1_4_2")

	})

	Convey("Moving a child from 1.4.2 to 1.6.5", t, func() {
		node1_4_2 := &tree.Node{Uuid: "test_1_4_2", Path: "/test_1_4/test_1_4_2"}
		nodeA := &tree.Node{Uuid: "A", Path: "/test_1_4/test_1_4_2/A"}
		nodeB := &tree.Node{Uuid: "B", Path: "/test_1_4/test_1_4_2/B"}

		node1_5 := &tree.Node{Uuid: "test_1_5", Path: "/test_1_5"}
		node1_6 := &tree.Node{Uuid: "test_1_6", Path: "/test_1_6"}

		node1_6_1 := &tree.Node{Uuid: "test_1_6_1", Path: "/test_1_6/test_1_6_1"}
		node1_6_2 := &tree.Node{Uuid: "test_1_6_2", Path: "/test_1_6/test_1_6_2"}
		node1_6_3 := &tree.Node{Uuid: "test_1_6_3", Path: "/test_1_6/test_1_6_3"}
		node1_6_4 := &tree.Node{Uuid: "test_1_6_4", Path: "/test_1_6/test_1_6_4"}

		send(s, "CreateNode", &tree.CreateNodeRequest{Node: nodeA})
		send(s, "CreateNode", &tree.CreateNodeRequest{Node: nodeB})

		send(s, "CreateNode", &tree.CreateNodeRequest{Node: node1_5})
		send(s, "CreateNode", &tree.CreateNodeRequest{Node: node1_6})

		send(s, "CreateNode", &tree.CreateNodeRequest{Node: node1_6_1})
		send(s, "CreateNode", &tree.CreateNodeRequest{Node: node1_6_2})
		send(s, "CreateNode", &tree.CreateNodeRequest{Node: node1_6_3})
		send(s, "CreateNode", &tree.CreateNodeRequest{Node: node1_6_4})

		resp, _ := send(s, "UpdateNode", &tree.UpdateNodeRequest{From: node1_4_2, To: &tree.Node{Uuid: "test_1_4_2", Path: "/test_1_6/test_1_4_2"}})
		So(resp.(*tree.UpdateNodeResponse).Success, ShouldBeTrue)
	})

	Convey("Moving a child from 1.4.2 to 1.6.5", t, func() {
		node1_4_2 := &tree.Node{Uuid: "test_1_4_2", Path: "/test_1_4/test_1_4_2"}
		_, err := send(s, "UpdateNode", &tree.UpdateNodeRequest{From: node1_4_2, To: &tree.Node{Uuid: "test_1_4_2", Path: "/test_1_6/test_1_4_2"}})
		So(err, ShouldNotBeNil)
		// FIXME Why was this expected ?
		// resp, err := send(s, "UpdateNode", &tree.UpdateNodeRequest{From: node1_4_2, To: &tree.Node{Uuid: "test_1_4_2", Path: "/test_1_6/test_1_4_2"}})
		// So(err, ShouldBeNil)
		// So(resp.(*tree.UpdateNodeResponse).Success, ShouldBeFalse)
	})

	Convey("Listing nodes at 1.6.5", t, func() {

		node1_6_5 := &tree.Node{Path: "/test_1_6/test_1_4_2"}

		resp, _ := send(s, "ListNodes", &tree.ListNodesRequest{Node: node1_6_5})
		So(resp.(*List), ShouldNotBeNil)

		count := 0
		for {
			_, err := resp.(*List).Recv()

			if err != nil {
				break
			}

			count++
		}

		So(count, ShouldEqual, 2)
	})

	Convey("Creating a node at lower depth", t, func() {

		node := &tree.Node{Uuid: "lowerdepthnode", Path: "/1/2/3/4/5/6/7/8/9/10/11/12/13/14/15/16/17/18/19"}

		resp, err := send(s, "CreateNode", &tree.CreateNodeRequest{Node: node})
		So(err, ShouldBeNil)
		So(resp, ShouldNotBeNil)

		resp2, err2 := send(s, "GetNode", &tree.ReadNodeRequest{
			Node: &tree.Node{Path: "/1/2/3/4/5/6/7/8/9/10/11/12/13/14/15/16/17/18/19"},
		})
		So(err2, ShouldBeNil)
		So(resp2.(*tree.ReadNodeResponse).Node.Uuid, ShouldEqual, "lowerdepthnode")

	})

	Convey("Test accented file", t, func() {

		nodeAccent := &tree.Node{Path: "/testé.ext", Uuid: "my-accented-node"}
		resp, err := send(s, "CreateNode", &tree.CreateNodeRequest{Node: nodeAccent})
		So(err, ShouldBeNil)
		So(resp, ShouldNotBeNil)

		resp2, err2 := send(s, "GetNode", &tree.ReadNodeRequest{
			Node: &tree.Node{Path: "testé.ext"},
		})
		So(err2, ShouldBeNil)
		So(resp2.(*tree.ReadNodeResponse).Node.Uuid, ShouldEqual, "my-accented-node")

		_, err3 := s.ReadNode(ctx, &tree.ReadNodeRequest{
			Node: &tree.Node{Path: "teste.ext"},
		})
		So(err3, ShouldNotBeNil)

	})

	Convey("Test grep file name", t, func() {

		nodeAccent := &tree.Node{Path: "/test.jpg", Uuid: "my-jpg-node"}
		resp, err := send(s, "CreateNode", &tree.CreateNodeRequest{Node: nodeAccent})
		So(err, ShouldBeNil)
		So(resp, ShouldNotBeNil)
		resp, err = send(s, "CreateNode", &tree.CreateNodeRequest{Node: &tree.Node{Path: "/other/sub/picture.jpg", Uuid: "my-other-jpg-node"}})
		So(err, ShouldBeNil)
		So(resp, ShouldNotBeNil)

		resp, _ = send(s, "ListNodes", &tree.ListNodesRequest{
			Node:      &tree.Node{Path: "/", MetaStore: map[string]string{"grep": "\".jpg$\""}},
			Recursive: true,
		})
		So(resp.(*List), ShouldNotBeNil)

		var nodes []*tree.Node
		for {
			response, err := resp.(*List).Recv()
			if err != nil {
				break
			}
			nodes = append(nodes, response.Node)
		}
		So(len(nodes), ShouldEqual, 2)

	})

	Convey("Test file with a space at the end", t, func() {

		nodeAccent := &tree.Node{Path: "/test.ext ", Uuid: "my-node"}
		resp, err := send(s, "CreateNode", &tree.CreateNodeRequest{Node: nodeAccent})
		So(err, ShouldBeNil)
		So(resp, ShouldNotBeNil)

		resp2, _ := send(s, "GetNode", &tree.ReadNodeRequest{
			Node: &tree.Node{Path: "test.ext "},
		})
		So(resp2.(*tree.ReadNodeResponse).Node.Uuid, ShouldEqual, "my-node")

	})

	Convey("Test folder with a space at the end", t, func() {

		nodeSpace := &tree.Node{Path: "/folder /test.toto", Uuid: "my-node2"}
		resp, err := send(s, "CreateNode", &tree.CreateNodeRequest{Node: nodeSpace})
		So(err, ShouldBeNil)
		So(resp, ShouldNotBeNil)

		resp2, _ := send(s, "GetNode", &tree.ReadNodeRequest{
			Node: &tree.Node{Path: "/folder /test.toto"},
		})
		So(resp2.(*tree.ReadNodeResponse).Node.Uuid, ShouldEqual, "my-node2")

	})

	Convey("Test GetNode By Uuid", t, func() {

		nodeSearch := &tree.Node{Uuid: "search-uuid", Path: "/fake/search/node"}
		send(s, "CreateNode", &tree.CreateNodeRequest{Node: nodeSearch})
		resp, _ := send(s, "GetNode", &tree.ReadNodeRequest{
			Node: &tree.Node{Uuid: "search-uuid"},
		})
		So(resp.(*tree.ReadNodeResponse).Node.Uuid, ShouldEqual, "search-uuid")
	})

	Convey("Test GetNode Ancestors by Uuid", t, func() {

		nodeSearch := &tree.Node{Uuid: "search-uuid-ancestors", Path: "/fake/search/node-ancestor"}
		send(s, "CreateNode", &tree.CreateNodeRequest{Node: nodeSearch})

		// By UUID
		resp, _ := send(s, "ListNodes", &tree.ListNodesRequest{
			Node: &tree.Node{
				Uuid: "search-uuid-ancestors",
			},
			Ancestors: true,
		})
		So(resp.(*List), ShouldNotBeNil)

		nodes := []*tree.Node{}
		for {
			response, err := resp.(*List).Recv()

			if err != nil {
				break
			}
			nodes = append(nodes, response.Node)
		}

		So(len(nodes), ShouldEqual, 3)

		// By Path
		resp, _ = send(s, "ListNodes", &tree.ListNodesRequest{
			Node: &tree.Node{
				Path: "/fake/search/node-ancestor",
			},
			Ancestors: true,
		})
		So(resp.(*List), ShouldNotBeNil)

		nodes = []*tree.Node{}
		for {
			response, err := resp.(*List).Recv()

			if err != nil {
				break
			}
			nodes = append(nodes, response.Node)
		}

		So(len(nodes), ShouldEqual, 3)

	})

	Convey("Test reuse nodes", t, func() {
		root := &tree.Node{Path: "/root", Uuid: "root"}
		f1 := &tree.Node{Path: "/root/f1", Uuid: "f1"}
		f2 := &tree.Node{Path: "/root/f2", Uuid: "f2"}

		f3 := &tree.Node{Path: "/root/f3", Uuid: "f3"}
		f4 := &tree.Node{Path: "/root/f4", Uuid: "f4"}

		f5 := &tree.Node{Path: "/root/f3/f5", Uuid: "f5"}

		send(s, "CreateNode", &tree.CreateNodeRequest{Node: root})

		send(s, "CreateNode", &tree.CreateNodeRequest{Node: f1})
		send(s, "CreateNode", &tree.CreateNodeRequest{Node: f2})

		send(s, "DeleteNode", &tree.DeleteNodeRequest{Node: f1})
		send(s, "DeleteNode", &tree.DeleteNodeRequest{Node: f2})

		send(s, "CreateNode", &tree.CreateNodeRequest{Node: f3})
		send(s, "CreateNode", &tree.CreateNodeRequest{Node: f4})

		r, err := send(s, "CreateNode", &tree.CreateNodeRequest{Node: f5})

		So(err, ShouldBeNil)
		So(r, ShouldNotBeNil)

	})

	/*
		Convey("Test insert two nodes with same Uuid", t, func() {

			f1 := &tree.Node{Path: "/root/f1", Uuid: "uuid"}
			f2 := &tree.Node{Path: "/root/f2", Uuid: "uuid"}
			e1 := s.CreateNode(ctx, &tree.CreateNodeRequest{Node: f1}, &tree.CreateNodeResponse{})
			e2 := s.CreateNode(ctx, &tree.CreateNodeRequest{Node: f2}, &tree.CreateNodeResponse{})
			So(e1, ShouldBeNil)
			So(e2, ShouldNotBeNil)

			f3 := &tree.Node{Path: "/root/f2", Uuid: "uuid-renewed"}
			e3 := s.CreateNode(ctx, &tree.CreateNodeRequest{Node: f3}, &tree.CreateNodeResponse{})
			So(e3, ShouldBeNil)
		})
	*/

	Convey("Test Delete Create Delete", t, func() {

		nodeCreateDeleteCreate := &tree.Node{Uuid: "test_create_delete_create", Path: "/test_create_delete_create"}

		send(s, "CreateNode", &tree.CreateNodeRequest{Node: nodeCreateDeleteCreate})
		send(s, "DeleteNode", &tree.DeleteNodeRequest{Node: nodeCreateDeleteCreate})
		resp, err := send(s, "CreateNode", &tree.CreateNodeRequest{Node: nodeCreateDeleteCreate})

		So(err, ShouldBeNil)
		So(resp, ShouldNotBeNil)
		So(resp.(*tree.CreateNodeResponse).Success, ShouldBeTrue)

		resp, _ = send(s, "GetNode", &tree.ReadNodeRequest{Node: nodeCreateDeleteCreate})
		So(resp.(*tree.ReadNodeResponse).Success, ShouldBeTrue)
		So(resp.(*tree.ReadNodeResponse).Node.Uuid, ShouldEqual, "test_create_delete_create")
	})

	Convey("Test List Nodes Output Pathes", t, func() {

		f := &tree.Node{Path: "/proot", Uuid: "output-uuid"}
		f1 := &tree.Node{Path: "/proot/f1", Uuid: "output-f1"}
		f2 := &tree.Node{Path: "/proot/f1/f2", Uuid: "output-f2"}
		f3 := &tree.Node{Path: "/proot/f1/f2/f3", Uuid: "output-f3"}
		s.CreateNode(ctx, &tree.CreateNodeRequest{Node: f})
		s.CreateNode(ctx, &tree.CreateNodeRequest{Node: f1})
		s.CreateNode(ctx, &tree.CreateNodeRequest{Node: f2})
		s.CreateNode(ctx, &tree.CreateNodeRequest{Node: f3})

		resp, _ := send(s, "ListNodes", &tree.ListNodesRequest{Node: f1})
		So(resp, ShouldNotBeNil)
		list := resp.(*List)
		So(list, ShouldNotBeNil)
		nodes := make(map[int]*tree.Node)
		count := 0
		for {
			response, err := list.Recv()
			if err != nil {
				break
			}
			nodes[count] = response.Node
			count++
		}

		So(nodes, ShouldHaveLength, 1)
		So(nodes[0].Path, ShouldEqual, "/proot/f1/f2")

		resp1, _ := send(s, "ListNodes", &tree.ListNodesRequest{Node: f1, Recursive: true})
		So(resp1, ShouldNotBeNil)
		list1 := resp1.(*List)
		So(list1, ShouldNotBeNil)
		nodes1 := make(map[int]*tree.Node)
		count1 := 0
		for {
			response, err := list1.Recv()
			if err != nil {
				break
			}
			nodes1[count1] = response.Node
			count1++
		}

		So(nodes1, ShouldHaveLength, 2)
		So(nodes1[0].Path, ShouldEqual, "/proot/f1/f2")
		So(nodes1[1].Path, ShouldEqual, "/proot/f1/f2/f3")
	})

	Convey("Create twice the same path", t, func() {
		n1 := &tree.Node{Path: "/test-twice-the-same-path", Uuid: "test-twice-the-same-path-1"}
		n2 := &tree.Node{Path: "/test-twice-the-same-path", Uuid: "test-twice-the-same-path-2"}

		send(s, "CreateNode", &tree.CreateNodeRequest{Node: n1})
		send(s, "CreateNode", &tree.CreateNodeRequest{Node: n2})
	})

	Convey("Update a Node if uuid already exists and flag given", t, func() {
		n1 := &tree.Node{Path: "/test-update-uuid-already-exists", Uuid: "test-update-if-exists", Etag: "test1"}
		n2 := &tree.Node{Path: "/test-update-uuid-already-exists", Uuid: "test-update-if-exists", Etag: "test2"}
		n3 := &tree.Node{Path: "/test-update-uuid-already-exists", Uuid: "test-update-if-exists", Etag: "test3"}

		send(s, "CreateNode", &tree.CreateNodeRequest{Node: n1})

		r1, err := send(s, "CreateNode", &tree.CreateNodeRequest{Node: n2, UpdateIfExists: true})
		So(err, ShouldBeNil)
		So(r1.(*tree.CreateNodeResponse).Node.Etag, ShouldEqual, "test2")

		send(s, "CreateNode", &tree.CreateNodeRequest{Node: n3})
	})

	Convey("Update a Node if path already exists and flag given", t, func() {
		n1 := &tree.Node{Path: "/test-update-path-already-exists", Uuid: "test-path-if-exists1", Etag: "test1"}
		n2 := &tree.Node{Path: "/test-update-path-already-exists", Uuid: "test-path-if-exists2", Etag: "test2"}
		n3 := &tree.Node{Path: "/test-update-path-already-exists", Uuid: "test-path-if-exists3", Etag: "test3"}

		send(s, "CreateNode", &tree.CreateNodeRequest{Node: n1})

		r1, err := send(s, "CreateNode", &tree.CreateNodeRequest{Node: n2, UpdateIfExists: true})
		So(err, ShouldBeNil)

		So(r1.(*tree.CreateNodeResponse).Node.Etag, ShouldEqual, "test2")

		send(s, "CreateNode", &tree.CreateNodeRequest{Node: n3})
	})
}

func TestIndexLongNode(t *testing.T) {

	s := NewTreeServer(&object.DataSource{Name: ""}, "", dao)

	wg.Add(1)
	defer wg.Done()

	Convey("Insert a new child at root level", t, func() {
		path := ""
		for i := 0; i < 255; i++ {
			name := fmt.Sprintf("test%d", i)
			path = path + fmt.Sprintf("/%d", i)
			node := &tree.Node{Path: path, Uuid: name, Etag: name, Type: tree.NodeType_COLLECTION}

			_, err := send(s, "CreateNode", &tree.CreateNodeRequest{Node: node, UpdateIfExists: true})
			So(err, ShouldBeNil)
		}

		t.Log("Before")

		respBefore, errBefore := send(s, "GetNode", &tree.ReadNodeRequest{Node: &tree.Node{Path: path}})
		So(errBefore, ShouldBeNil)
		So(respBefore, ShouldNotBeNil)

		t.Log("Move")
		node := &tree.Node{Path: "/test.xml", Uuid: "testxml", Etag: "testxml", Type: tree.NodeType_LEAF}
		_, err := send(s, "CreateNode", &tree.CreateNodeRequest{Node: node, UpdateIfExists: true})
		So(err, ShouldBeNil)

		target := &tree.Node{Path: path + "/test.xml", Uuid: "testxml", Etag: "testxml", Type: tree.NodeType_LEAF}

		resp, err := send(s, "UpdateNode", &tree.UpdateNodeRequest{From: node, To: target})
		So(err, ShouldBeNil)
		So(resp.(*tree.UpdateNodeResponse).Success, ShouldBeTrue)

		t.Log("After")
		respAfter, errAfter := send(s, "GetNode", &tree.ReadNodeRequest{Node: &tree.Node{Path: path}})
		So(errAfter, ShouldBeNil)
		So(respAfter, ShouldNotBeNil)

		node2 := &tree.Node{Path: "/0", Uuid: "test1", Etag: "test0", Type: tree.NodeType_COLLECTION}
		target2 := &tree.Node{Path: "/0b", Uuid: "test1b", Etag: "test1b", Type: tree.NodeType_COLLECTION}
		_, errCreate := send(s, "CreateNode", &tree.CreateNodeRequest{Node: target2, UpdateIfExists: true})
		So(errCreate, ShouldBeNil)

		target3 := &tree.Node{Path: "/0b/0", Type: tree.NodeType_COLLECTION}

		resp2, err2 := send(s, "UpdateNode", &tree.UpdateNodeRequest{From: node2, To: target3})
		So(err2, ShouldBeNil)
		So(resp2.(*tree.UpdateNodeResponse).Success, ShouldBeTrue)

		resp3, err3 := send(s, "UpdateNode", &tree.UpdateNodeRequest{From: target3, To: node2})
		So(err3, ShouldBeNil)
		So(resp3.(*tree.UpdateNodeResponse).Success, ShouldBeTrue)

		target4 := &tree.Node{Path: "/0c", Type: tree.NodeType_COLLECTION}
		resp4, err4 := send(s, "UpdateNode", &tree.UpdateNodeRequest{From: node2, To: target4})
		So(err4, ShouldBeNil)
		So(resp4.(*tree.UpdateNodeResponse).Success, ShouldBeTrue)

		resp4b, err4b := send(s, "UpdateNode", &tree.UpdateNodeRequest{From: target4, To: node2})
		So(err4b, ShouldBeNil)
		So(resp4b.(*tree.UpdateNodeResponse).Success, ShouldBeTrue)

		target5 := &tree.Node{Path: "/0d/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0/0", Type: tree.NodeType_COLLECTION}
		resp5, err5 := send(s, "UpdateNode", &tree.UpdateNodeRequest{From: node2, To: target5})
		So(err5, ShouldBeNil)
		So(resp5.(*tree.UpdateNodeResponse).Success, ShouldBeTrue)

		resp5b, err5b := send(s, "UpdateNode", &tree.UpdateNodeRequest{From: target5, To: node2})
		So(err5b, ShouldBeNil)
		So(resp5b.(*tree.UpdateNodeResponse).Success, ShouldBeTrue)

		t.Log("After move")
		respAfter2, errAfter2 := send(s, "GetNode", &tree.ReadNodeRequest{Node: target2})
		So(errAfter2, ShouldBeNil)
		So(respAfter2, ShouldNotBeNil)
	})
}

/*
// TODO
func TestMassiveOperations(t *testing.T) {

	s := NewTreeServer("", "")

	Convey("Test Massive Indexation", t, func() {

		loadedContent, e := ioutil.ReadFile(filepath.Join(os.Getenv("GOPATH"), "src", "github.com", "pydio", "cells", "data", "source", "index", "utils", "snapshot.json"))
		So(e, ShouldBeNil)
		So(string(loadedContent), ShouldHaveLength, 396068)
		nodesList := []*tree.Node{}
		e = json.Unmarshal(loadedContent, &nodesList)
		So(e, ShouldBeNil)
		So(nodesList, ShouldHaveLength, 945)
		for _, n := range nodesList {
			_, err := send(s, "CreateNode", &tree.CreateNodeRequest{Node: n})
			So(err, ShouldBeNil)
		}


	})
}
*/
