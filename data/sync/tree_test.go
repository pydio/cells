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

package sync

import (
	"context"
	"errors"
	"testing"

	radix "github.com/armon/go-radix"
	"github.com/pydio/cells/common/proto/tree"
)

func TestNodeSet(t *testing.T) {
	u := mockNodeView("Arthur!  Cuillèrrrrre!!!!")
	s := newVolatileSet()

	t.Run("Add", func(t *testing.T) {
		s.Add(u)
		if s.s.Size() != 1 {
			t.Error("item was not added")
		}
	})

	t.Run("Contains", func(t *testing.T) {
		if !s.Contains(u) {
			t.Error("could not retrieve item")
		}
	})
}

type mockEndpointClient struct {
	*radix.Tree
}

func (m *mockEndpointClient) GetRoot(context.Context) (*tree.Node, error) {
	v, ok := m.Get("/")
	if !ok {
		panic(errors.New("missing root"))
	}

	return v.(*tree.Node), nil
}

func (m *mockEndpointClient) GetNode(ctx context.Context, path string) (n *tree.Node, ok bool, err error) {
	var v interface{}
	if v, ok = m.Get(path); ok {
		n = v.(*tree.Node)
	}
	return
}

func (m *mockEndpointClient) GetChildren(ctx context.Context, path string) (chan *tree.Node, error) {
	ch := make(chan *tree.Node, 1)
	go func() {
		m.WalkPrefix(path, func(p string, v interface{}) (halt bool) {
			if p != path {
				ch <- v.(*tree.Node)
			}
			return
		})
		close(ch)
	}()
	return ch, nil
}

func (m *mockEndpointClient) GetRootPath() string                          { return "" }
func (m *mockEndpointClient) CreateNode(context.Context, *tree.Node) error { return nil }
func (m *mockEndpointClient) DeleteNode(context.Context, *tree.Node) error { return nil }

func genTestPaths() []*tree.Node {
	return []*tree.Node{
		{Path: "/", Type: tree.NodeType_COLLECTION},
		{Path: "/a", Type: tree.NodeType_COLLECTION},
		{Path: "/a/a", Type: tree.NodeType_COLLECTION},
		{Path: "/a/a/a", Type: tree.NodeType_LEAF},
		{Path: "/a/b", Type: tree.NodeType_COLLECTION},
		{Path: "/a/b/a", Type: tree.NodeType_LEAF},
		{Path: "/a/b/b", Type: tree.NodeType_LEAF},
		{Path: "/b", Type: tree.NodeType_COLLECTION},
		{Path: "/b/a", Type: tree.NodeType_COLLECTION},
		{Path: "/b/a/a", Type: tree.NodeType_LEAF},
		{Path: "/b/b/a", Type: tree.NodeType_LEAF},
	}
}

func TestMapTraversal(t *testing.T) {
	paths := genTestPaths()

	rt := radix.New()
	for _, n := range paths {
		_, _ = rt.Insert(n.GetPath(), n)
	}

	result := make([]string, 0)
	err := mapTraversal(context.Background(), &mockEndpointClient{Tree: rt}, func(n *tree.Node) {
		result = append(result, n.GetPath())
	})

	if err != nil {
		t.Errorf("error traversing tree: %s", err)
	}

	for i, res := range result {
		if res != paths[i].GetPath() {
			t.Errorf("unexpected result %s in position %d (expected %s)", res, i, paths[i].GetPath())
		}
	}
}
