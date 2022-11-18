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

package jobs

import (
	"context"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common/proto/jobs/bleveimpl"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
)

func init() {
	RegisterNodesFreeStringEvaluator(bleveimpl.EvalFreeString)
}

func TestNodesSelector_Filter(t *testing.T) {

	bg := context.Background()

	node := &tree.Node{
		Path:  "/root/node/filename.jpg",
		Size:  3500,
		MTime: 1505470065,
		Type:  tree.NodeType_LEAF,
	}

	Convey("Basic Filters", t, func() {

		n := &NodesSelector{} // Empty Filter
		output, _, _ := n.Filter(bg, &ActionMessage{Nodes: []*tree.Node{node}})
		So(output.Nodes, ShouldHaveLength, 0)

		n = &NodesSelector{All: true} // All : True
		output, _, _ = n.Filter(bg, &ActionMessage{Nodes: []*tree.Node{node}})
		So(output.Nodes[0], ShouldResemble, node)

		n = &NodesSelector{Pathes: []string{
			"/root/node/filename.jpg",
		}}
		output, _, _ = n.Filter(bg, &ActionMessage{Nodes: []*tree.Node{node}})
		So(output.Nodes[0], ShouldResemble, node)

		n = &NodesSelector{Pathes: []string{
			"/root/other/filename.jpg",
		}}
		output, _, _ = n.Filter(bg, &ActionMessage{Nodes: []*tree.Node{node}})
		So(output.Nodes, ShouldBeEmpty)

	})

	Convey("Correct Query", t, func() {

		q := &tree.Query{
			FileName:   "file*",
			Extension:  "jpg,gif",
			Type:       tree.NodeType_LEAF,
			PathPrefix: []string{"/root"},
			MinSize:    500,
			MaxSize:    10000,
		}
		marshalled, _ := anypb.New(q)
		n := &NodesSelector{
			Query: &service.Query{
				SubQueries: []*anypb.Any{marshalled},
			},
		}
		output, _, _ := n.Filter(bg, &ActionMessage{Nodes: []*tree.Node{node}})
		So(output.Nodes[0], ShouldResemble, node)

	})

	Convey("Wrong Query", t, func() {

		q := &tree.Query{
			FileName:   "wrong*",
			Extension:  "jpg,gif",
			Type:       tree.NodeType_LEAF,
			PathPrefix: []string{"/root"},
			MinSize:    500,
			MaxSize:    10000,
		}
		marshalled, _ := anypb.New(q)
		n := &NodesSelector{
			Query: &service.Query{
				SubQueries: []*anypb.Any{marshalled},
			},
		}

		input := ActionMessage{
			Nodes: []*tree.Node{node},
		}
		output, _, _ := n.Filter(bg, &ActionMessage{
			Nodes: []*tree.Node{node},
		})

		So(output.Nodes, ShouldBeEmpty)
		// Output is copy, original message was not modified
		So(input.Nodes, ShouldNotBeNil)

	})

	Convey("Operations Query", t, func() {

		q := &tree.Query{
			FileName:  "file*",
			Extension: "jpg,gif",
		}
		marshalled, _ := anypb.New(q)
		q2 := &tree.Query{
			Type:       tree.NodeType_LEAF,
			PathPrefix: []string{"/root"},
			MinSize:    500,
			MaxSize:    10000,
		}
		marshalled2, _ := anypb.New(q2)

		n := &NodesSelector{
			Query: &service.Query{
				SubQueries: []*anypb.Any{marshalled, marshalled2},
				Operation:  service.OperationType_AND,
			},
		}
		output, _, _ := n.Filter(bg, &ActionMessage{Nodes: []*tree.Node{node}})
		So(output.Nodes[0], ShouldResemble, node)

		// One condition is false
		q3 := &tree.Query{
			Type:       tree.NodeType_COLLECTION, // WRONG TYPE
			PathPrefix: []string{"/root"},
			MinSize:    500,
			MaxSize:    10000,
		}
		marshalled3, _ := anypb.New(q3)

		n.Query.SubQueries = []*anypb.Any{marshalled, marshalled3}
		output, _, _ = n.Filter(bg, &ActionMessage{Nodes: []*tree.Node{node}})
		So(output.Nodes, ShouldBeEmpty)

		// Switch to OR
		n.Query.Operation = service.OperationType_OR
		output, _, _ = n.Filter(bg, &ActionMessage{Nodes: []*tree.Node{node}})
		So(output.Nodes, ShouldNotBeNil)

	})

}

func TestNodesSelector_EvaluateQuery(t *testing.T) {

	node := &tree.Node{
		Path:  "/root/node/filename.jpg",
		Size:  3500,
		MTime: 1505470065,
		Type:  tree.NodeType_LEAF,
	}

	Convey("Empty Query", t, func() {

		res := evaluateSingleQuery(&tree.Query{}, node)
		So(res, ShouldBeTrue)

	})

	Convey("PathPrefixes", t, func() {

		res := evaluateSingleQuery(&tree.Query{
			PathPrefix: []string{"/root/node"},
		}, node)
		So(res, ShouldBeTrue)

		res2 := evaluateSingleQuery(&tree.Query{
			PathPrefix: []string{"/root/anothernode"},
		}, node)
		So(res2, ShouldBeFalse)

		res3 := evaluateSingleQuery(&tree.Query{
			PathPrefix: []string{"/root/anothernode", "/root/node"},
		}, node)
		So(res3, ShouldBeTrue)

	})

	Convey("NodeType", t, func() {

		res := evaluateSingleQuery(&tree.Query{
			Type: tree.NodeType_LEAF,
		}, node)
		So(res, ShouldBeTrue)

		res2 := evaluateSingleQuery(&tree.Query{
			Type: tree.NodeType_COLLECTION,
		}, node)
		So(res2, ShouldBeFalse)

	})

	Convey("Extension", t, func() {

		res := evaluateSingleQuery(&tree.Query{
			Extension: "jpg",
		}, node)
		So(res, ShouldBeTrue)

		res3 := evaluateSingleQuery(&tree.Query{
			Extension: "jpg,gif",
		}, node)
		So(res3, ShouldBeTrue)

		res2 := evaluateSingleQuery(&tree.Query{
			Extension: "gif",
		}, node)
		So(res2, ShouldBeFalse)

	})

	Convey("FileName", t, func() {

		res := evaluateSingleQuery(&tree.Query{
			FileName: "filename.jpg",
		}, node)
		So(res, ShouldBeTrue)

		res2 := evaluateSingleQuery(&tree.Query{
			FileName: "filename",
		}, node)
		So(res2, ShouldBeFalse)

		res3 := evaluateSingleQuery(&tree.Query{
			FileName: "filenam*",
		}, node)
		So(res3, ShouldBeTrue)

		res4 := evaluateSingleQuery(&tree.Query{
			FileName: "*nam*",
		}, node)
		So(res4, ShouldBeTrue)

		res4 = evaluateSingleQuery(&tree.Query{
			FileName: "*anything*",
		}, node)
		So(res4, ShouldBeFalse)

		res5 := evaluateSingleQuery(&tree.Query{
			FileName: "*.jpg",
		}, node)
		So(res5, ShouldBeTrue)

		res5 = evaluateSingleQuery(&tree.Query{
			FileName: "*zobi",
		}, node)
		So(res5, ShouldBeFalse)

		res6 := evaluateSingleQuery(&tree.Query{
			FileName: "*.java",
		}, node)
		So(res6, ShouldBeFalse)

	})

	Convey("Size", t, func() {

		res := evaluateSingleQuery(&tree.Query{
			MinSize: 500,
		}, node)
		So(res, ShouldBeTrue)

		res2 := evaluateSingleQuery(&tree.Query{
			MinSize: 5000,
		}, node)
		So(res2, ShouldBeFalse)

		res3 := evaluateSingleQuery(&tree.Query{
			MaxSize: 5000,
		}, node)
		So(res3, ShouldBeTrue)

		res4 := evaluateSingleQuery(&tree.Query{
			MaxSize: 3000,
		}, node)
		So(res4, ShouldBeFalse)

	})

	Convey("Date", t, func() {

		ref := int64(1505470065)
		res := evaluateSingleQuery(&tree.Query{
			MinDate: ref - 10,
		}, node)
		So(res, ShouldBeTrue)

		res2 := evaluateSingleQuery(&tree.Query{
			MinDate: ref + 10,
		}, node)
		So(res2, ShouldBeFalse)

		res3 := evaluateSingleQuery(&tree.Query{
			MaxDate: ref + 10,
		}, node)
		So(res3, ShouldBeTrue)

		res4 := evaluateSingleQuery(&tree.Query{
			MaxDate: ref - 10,
		}, node)
		So(res4, ShouldBeFalse)

	})

	Convey("Multiple", t, func() {

		ref := int64(1505470065)
		res := evaluateSingleQuery(&tree.Query{
			FileName:   "file*",
			Extension:  "jpg,gif",
			Type:       tree.NodeType_LEAF,
			PathPrefix: []string{"/root"},
			MinSize:    500,
			MaxSize:    10000,
			MinDate:    ref - 10,
			MaxDate:    ref + 10,
		}, node)
		So(res, ShouldBeTrue)

		// One is wrong
		res = evaluateSingleQuery(&tree.Query{
			FileName:   "wrongname*",
			Extension:  "jpg,gif",
			Type:       tree.NodeType_LEAF,
			PathPrefix: []string{"/root"},
			MinSize:    500,
			MaxSize:    10000,
			MinDate:    ref - 10,
			MaxDate:    ref + 10,
		}, node)

		So(res, ShouldBeFalse)

	})

}
