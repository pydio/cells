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
package index

import (
	"context"
	"io"
	"testing"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common/proto/tree"
)

// listProvider is a NodeProviderClient listing nodes then ending its stream with end.
type listProvider struct {
	tree.NodeProviderClient
	nodes []*tree.Node
	end   error
}

func (l *listProvider) ListNodes(context.Context, *tree.ListNodesRequest, ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	return &listStream{nodes: l.nodes, end: l.end}, nil
}

type listStream struct {
	grpc.ClientStream
	nodes []*tree.Node
	end   error
}

func (s *listStream) Recv() (*tree.ListNodesResponse, error) {
	if len(s.nodes) == 0 {
		return nil, s.end
	}
	n := s.nodes[0]
	s.nodes = s.nodes[1:]
	return &tree.ListNodesResponse{Node: n}, nil
}

func TestWalkTruncatedListing(t *testing.T) {
	for _, tc := range []struct {
		end     error
		wantErr bool
	}{{io.EOF, false}, {io.ErrUnexpectedEOF, true}} {
		p := &listProvider{nodes: []*tree.Node{{Path: "a.txt", Type: tree.NodeType_LEAF, Etag: "e"}}, end: tc.end}
		c := NewClient("ds", p, nil, nil)
		e := c.Walk(context.Background(), func(string, tree.N, error) error { return nil }, "/", true)
		if (e != nil) != tc.wantErr {
			t.Errorf("listing ending with %v: Walk returned %v, want an error: %v", tc.end, e, tc.wantErr)
		}
	}
}
