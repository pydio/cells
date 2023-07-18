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
	"sync"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/mocks"
	"github.com/pydio/cells/v4/common/proto/tree"
)

var (
	dataSources = make(map[string]DataSource, 3)
	mainCtx     = context.Background()
)

func init() {

	nodes.IsUnitTestEnv = true
	UnitTests = true

	dataSources["ds1"] = DataSource{
		Name:   "ds1",
		reader: &tree.NodeProviderMock{Nodes: map[string]tree.Node{"node1": {Uuid: "node1-uuid", Path: "node1"}, "node12": {Uuid: "node12-uuid", Path: "node12"}}},
		writer: &tree.NodeReceiverMock{},
	}
	dataSources["ds2"] = DataSource{
		Name:   "ds2",
		reader: &tree.NodeProviderMock{Nodes: map[string]tree.Node{"node2": {Uuid: "node2-uuid", Path: "node2"}}},
		writer: &tree.NodeReceiverMock{},
	}
	dataSources["ds3"] = DataSource{
		Name:   "ds3",
		reader: &tree.NodeProviderMock{Nodes: map[string]tree.Node{"node2": {Uuid: "node2-uuid", Path: "node2"}}},
		writer: &tree.NodeReceiverMock{},
	}

}

func TestReadNode(t *testing.T) {

	// Create tree server with fake datasources
	ts := &TreeServer{
		sources:     dataSources,
		mainCtx:     mainCtx,
		sourcesLock: &sync.RWMutex{},
	}
	ctx := context.Background()

	Convey("Search By Path", t, func() {

		resp, err := ts.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: "ds1/node1"}})
		So(err, ShouldBeNil)

		So(resp.Node.Path, ShouldEqual, "ds1/node1")

		_, err1 := ts.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: "ds1/node2"}})
		So(err1, ShouldNotBeNil)

	})

	Convey("Search By Uuid", t, func() {

		resp, err := ts.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: "node1-uuid"}})

		So(err, ShouldBeNil)
		So(resp.Node.Path, ShouldEqual, "ds1/node1")

	})

}

func TestListNodes(t *testing.T) {

	// Create tree server with fake datasources
	ts := &TreeServer{
		sources:     dataSources,
		mainCtx:     context.Background(),
		sourcesLock: &sync.RWMutex{},
	}

	Convey("List datasources", t, func() {

		stream := mocks.NewListNodeStreamer()
		wg := sync.WaitGroup{}
		wg.Add(1)
		go func() {
			defer wg.Done()
			ts.ListNodes(&tree.ListNodesRequest{Node: &tree.Node{Path: ""}}, stream)
			stream.Close()
		}()
		nodes := stream.ReceiveAllNodes()
		wg.Wait()
		So(nodes, ShouldHaveLength, 3)

	})

	Convey("List Ancestors : error on root", t, func() {

		stream := mocks.NewListNodeStreamer()

		err := ts.ListNodes(&tree.ListNodesRequest{Node: &tree.Node{Path: ""}, Ancestors: true}, stream)
		So(err, ShouldNotBeNil)

	})

	Convey("List Ancestors : datasource returns root AND original node", t, func() {

		stream := mocks.NewListNodeStreamer()
		wg := sync.WaitGroup{}
		wg.Add(1)
		go func() {
			defer wg.Done()
			ts.ListNodes(&tree.ListNodesRequest{Node: &tree.Node{Path: "ds1"}, Ancestors: true}, stream)
			stream.Close()
		}()
		nodes := stream.ReceiveAllNodes()
		wg.Wait()
		So(nodes, ShouldHaveLength, 2)

	})

}

func TestRootNodeOperations(t *testing.T) {

	// Create tree server with fake datasources
	ts := &TreeServer{
		sources:     dataSources,
		mainCtx:     mainCtx,
		sourcesLock: &sync.RWMutex{},
	}

	ctx := context.Background()

	Convey("Create N on Root", t, func() {

		_, err := ts.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{Path: "/rootfolder"}})
		So(err, ShouldNotBeNil)

	})

	Convey("Update N on Root", t, func() {

		_, err := ts.UpdateNode(ctx, &tree.UpdateNodeRequest{
			From: &tree.Node{Path: "/ds1/toto"},
			To:   &tree.Node{Path: "/ds1"},
		})
		So(err, ShouldNotBeNil)

	})

	Convey("Delete N on Root", t, func() {

		_, err := ts.DeleteNode(ctx, &tree.DeleteNodeRequest{
			Node: &tree.Node{Path: "/ds1"},
		})
		So(err, ShouldNotBeNil)

	})

	Convey("Move N Across DataSource (Not Impl)", t, func() {

		_, err := ts.UpdateNode(ctx, &tree.UpdateNodeRequest{
			From: &tree.Node{Path: "/ds1/toto"},
			To:   &tree.Node{Path: "/ds2/toto"},
		})
		So(err, ShouldNotBeNil)

	})
}
